'use client';

import { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useStore } from '@/lib/store';
import { workflowTemplates } from '@/lib/workflows';
import {
  createSessionContext,
  exportProjectDocument,
  WorkflowEngine,
  detectArtifacts,
  STEP_COMPLETE_MARKER,
} from '@/lib/workflow-engine';
import { ArtifactPanel } from './ArtifactPanel';
import { Artifact } from '@/types';

// ─── Option detection ─────────────────────────────────────────────────────────

// Strip markdown syntax from a string (bold, italic, inline code)
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\*+$/, '')
    .trim();
}

function detectOptions(content: string): string[] | null {
  // Detect LETTERED options (A. B. C. or A) B) C)) in both formats:
  //   Standalone: "A. 选项一"   (at start of line)
  //   Nested list: "  - A. 选项一" (indented list item with optional dash)
  // Numbered lists are excluded — too ambiguous (prose descriptions use 1. 2. 3.).
  const lettered = [...content.matchAll(/^[ \t]*(?:[-*]\s+)?\*{0,2}([A-Za-z])[.)]\*{0,2}\s+(.+)$/gm)]
    .map(m => `${m[1].toUpperCase()}. ${stripMarkdown(m[2])}`);

  // If there are multiple "A." occurrences, the AI is asking multiple sub-questions
  // with A/B each — don't show chips since there's no single "pick one" choice.
  const aCount = lettered.filter(o => o.startsWith('A.')).length;
  if (aCount > 1) return null;
  if (lettered.length >= 2) return lettered;

  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

// ─── Mermaid diagram renderer ─────────────────────────────────────────────────

function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            background: 'var(--surface)',
            primaryColor: '#388bfd',
            primaryTextColor: '#e6edf3',
            lineColor: '#8b949e',
          },
        });
        const { svg } = await mermaid.render(idRef.current, code);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    render();
    return () => { cancelled = true; };
  }, [code]);

  if (error) {
    return (
      <pre className="text-xs p-3 rounded overflow-x-auto" style={{ background: 'var(--surface-elevated)', color: 'var(--red)' }}>
        {code}
      </pre>
    );
  }
  return <div ref={ref} className="my-3 flex justify-center overflow-x-auto" />;
}

function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose max-w-none prose-sm prose-p:my-1 prose-headings:mt-3 prose-headings:mb-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const lang = /language-(\w+)/.exec(className ?? '')?.[1];
            const code = String(children).replace(/\n$/, '');
            if (lang === 'mermaid') return <MermaidDiagram code={code} />;
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function OptionChips({
  options,
  onSelect,
}: {
  options: string[];
  onSelect: (opt: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  if (selected) return null;

  return (
    <div className="mt-3 flex flex-col gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => {
            setSelected(opt);
            onSelect(opt);
          }}
          className="text-xs px-3 py-2 rounded-lg border transition-colors text-left leading-relaxed w-full"
          style={{
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
            background: 'var(--surface)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--blue)';
            e.currentTarget.style.color = 'var(--blue)';
            e.currentTarget.style.background = 'var(--surface-elevated)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.background = 'var(--surface)';
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function StepDot({ status }: { status: 'completed' | 'current' | 'pending' }) {
  if (status === 'completed')
    return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--green)' }} />;
  if (status === 'current')
    return <span className="w-2 h-2 rounded-full flex-shrink-0 animate-pulse" style={{ background: 'var(--blue)' }} />;
  return <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--border)' }} />;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WorkflowRunner({
  workflowId,
  initialAutoMode = false,
}: {
  workflowId: string;
  initialAutoMode?: boolean;
}) {
  const { llmConfig, sessionContext, setSessionContext, addMessage } = useStore();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamedContent, setStreamedContent] = useState('');
  const [engine, setEngine] = useState<WorkflowEngine | null>(null);
  const [autoMode, setAutoMode] = useState(initialAutoMode);
  const [autoModeRunning, setAutoModeRunning] = useState(false);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [showArtifacts, setShowArtifacts] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [pendingAutoAdvance, setPendingAutoAdvance] = useState<{
    stepName: string;
    nextStepName: string | null;
  } | null>(null);
  const [artifactPanelWidth, setArtifactPanelWidth] = useState(400);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Stable refs to avoid stale closures
  const autoModeRef = useRef(autoMode);
  const engineRef = useRef<WorkflowEngine | null>(null);
  const isLoadingRef = useRef(false);
  const sessionContextRef = useRef(sessionContext);

  useEffect(() => { autoModeRef.current = autoMode; }, [autoMode]);
  useEffect(() => { sessionContextRef.current = sessionContext; }, [sessionContext]);
  useEffect(() => { engineRef.current = engine; }, [engine]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  // Textarea auto-resize
  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const workflow = workflowTemplates.find(w => w.id === workflowId);
  const currentStepIndex = sessionContext?.currentStepIndex ?? 0;
  const currentStep = workflow?.steps[currentStepIndex];

  // ── Sync artifacts → sessionContext (Fix: separate from setArtifacts to avoid nested setState) ──
  useEffect(() => {
    const ctx = sessionContextRef.current;
    if (!ctx) return;
    const existing = ctx.detectedArtifacts ?? [];
    // Only update if actually changed (length guard avoids infinite loop)
    if (artifacts.length !== existing.length) {
      setSessionContext({ ...ctx, detectedArtifacts: artifacts });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artifacts]);

  // ── Initialise engine ──
  useEffect(() => {
    if (!llmConfig) return;

    if (!sessionContext) {
      const newContext = createSessionContext(`project-${Date.now()}`, workflowId);
      setSessionContext(newContext);
      const newEngine = new WorkflowEngine(llmConfig, newContext);
      setEngine(newEngine);
      engineRef.current = newEngine;

      const step = workflow?.steps[0];
      if (step) {
        addMessage({
          role: 'assistant',
          content: `**步骤 1/${workflow?.steps.length}：${step.name}**\n\n${step.description}\n\n请简单描述你的项目想法或需求，我将基于此开始分析。${
            initialAutoMode ? '（已开启自动模式，输入后将自动完成后续步骤）' : ''
          }`,
          stepId: step.id,
        });
      }
    } else {
      const newEngine = new WorkflowEngine(llmConfig, sessionContext);
      setEngine(newEngine);
      engineRef.current = newEngine;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto mode no longer auto-triggers on fresh sessions.
  // The user must always provide their intent first before AI analysis begins.

  // ── Auto-scroll ──
  // Streaming: instant scrollTop — smooth 在高频触发时会产生动画竞争导致抖动
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    // 用户已向上滚动超过 80px，停止跟随
    if (el.scrollHeight - el.scrollTop - el.clientHeight > 80) return;
    el.scrollTop = el.scrollHeight;
  }, [streamedContent]);

  // 消息提交 / 新卡片出现：低频事件，用 smooth
  useEffect(() => {
    const el = chatContainerRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight > 80) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionContext?.messages, pendingAutoAdvance]);

  // ─── LLM streaming ────────────────────────────────────────────────────────

  const sendLLMRequest = useCallback(async (
    eng: WorkflowEngine,
    prompt: string,
    isAutoStep = false,
  ): Promise<string> => {
    // Sync engine's message history from store (only messages — never override currentStepIndex
    // which is managed by the engine itself via advanceToNextStep)
    const latestCtx = sessionContextRef.current;
    if (latestCtx) eng.updateContext({ messages: latestCtx.messages });

    const history = eng.getConversationHistory();
    const finalPrompt = isAutoStep ? prompt : eng.generateStepPrompt(prompt);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const response = await fetch('/api/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        llmConfig,
        agent: eng.getCurrentAgent(),
        messages: [...history, { role: 'user', content: finalPrompt }],
        stream: true,
      }),
      signal: abortController.signal,
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (reader) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = decoder.decode(value).split('\n').filter(l => l.trim());
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullContent += parsed.content;
                setStreamedContent(fullContent.replace(STEP_COMPLETE_MARKER, ''));
              }
              if (parsed.error) throw new Error(parsed.error);
            } catch { /* skip parse errors */ }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // Re-throw so callers can clean up without saving partial content
          throw err;
        }
        throw err;
      }
    }

    abortControllerRef.current = null;
    return fullContent;
  }, [llmConfig]);

  // ─── Process response (Fix: no nested setState) ───────────────────────────

  const processResponse = useCallback((
    eng: WorkflowEngine,
    fullContent: string,
    stepId: string | undefined,
  ): boolean => {
    const hasStepComplete = fullContent.includes(STEP_COMPLETE_MARKER);
    // Keep everything before the marker as the visible conclusion
    const cleanContent = fullContent.split(STEP_COMPLETE_MARKER)[0].trim();

    // 1. Add assistant message
    addMessage({ role: 'assistant', content: cleanContent, stepId });

    // 2. Detect artifacts — Fix: call setArtifacts OUTSIDE any updater, no nested setState
    const step = eng.getCurrentStep();
    if (step && cleanContent.length > 0) {
      const newArtifacts = detectArtifacts(cleanContent, step.id, step.name);
      if (newArtifacts.length > 0) {
        setArtifacts(prev => [...prev, ...newArtifacts]);
        setShowArtifacts(true);
      }
    }

    // 3. Clear streaming display
    setStreamedContent('');
    setIsLoading(false);
    isLoadingRef.current = false;

    return hasStepComplete;
  }, [addMessage]);

  // ─── Auto mode runner ─────────────────────────────────────────────────────

  const runAutoStep = useCallback(async (eng: WorkflowEngine) => {
    if (!eng || !llmConfig) return;

    const step = eng.getCurrentStep();
    if (!step) {
      setAutoModeRunning(false);
      setIsCompleted(true);
      return;
    }

    setIsLoading(true);
    isLoadingRef.current = true;
    setStreamedContent('');

    try {
      const autoPrompt = eng.generateAutoModePrompt();
      // Hidden user turn for history context
      addMessage({ role: 'user', content: `[自动模式] ${step.name}`, stepId: step.id });

      const fullContent = await sendLLMRequest(eng, autoPrompt, true);
      const stepComplete = processResponse(eng, fullContent, step.id);

      if (stepComplete) {
        const nextStep = eng.getNextStep();
        setPendingAutoAdvance({ stepName: step.name, nextStepName: nextStep?.name ?? null });
        setAutoModeRunning(false);
      } else {
        // AI didn't signal completion; pause and let user respond
        setAutoModeRunning(false);
      }
    } catch (error) {
      const isAbort = (error as Error).name === 'AbortError';
      if (!isAbort) {
        addMessage({
          role: 'assistant',
          content: `自动模式遇到错误：${error instanceof Error ? error.message : '未知错误'}`,
          stepId: step.id,
        });
      }
      setAutoModeRunning(false);
      setIsLoading(false);
      isLoadingRef.current = false;
      setStreamedContent('');
    }
  }, [llmConfig, sendLLMRequest, processResponse, addMessage]);

  // ─── Confirm / pause auto advance ────────────────────────────────────────

  const confirmAdvance = useCallback(() => {
    const eng = engineRef.current;
    if (!eng) return;
    setPendingAutoAdvance(null);

    const advanced = eng.advanceToNextStep();

    if (advanced) {
      // Use getState() to get the truly latest context (avoids stale ref snapshot)
      const latestCtx = useStore.getState().sessionContext;
      if (latestCtx) setSessionContext({ ...latestCtx, currentStepIndex: eng.getContext().currentStepIndex });

      const nextStep = eng.getCurrentStep();
      if (nextStep) {
        const stepNum = eng.getContext().currentStepIndex + 1;
        const total = workflow?.steps.length ?? 0;
        addMessage({
          role: 'assistant',
          content: `**步骤 ${stepNum}/${total}：${nextStep.name}**\n\n${nextStep.description}`,
          stepId: nextStep.id,
        });
        if (autoModeRef.current) {
          setAutoModeRunning(true);
          setTimeout(() => runAutoStep(eng), 800);
        }
      }
    } else {
      setIsCompleted(true);
      addMessage({
        role: 'assistant',
        content: `**所有步骤已完成！**\n\n工作流「${workflow?.name}」已全部完成。请查看右侧面板中的产出物。`,
      });
    }
  }, [addMessage, setSessionContext, workflow, runAutoStep]);

  const pauseAutoMode = useCallback(() => {
    setPendingAutoAdvance(null);
    setAutoMode(false);
    setAutoModeRunning(false);
  }, []);

  // ─── User send message ────────────────────────────────────────────────────

  const handleSendMessage = useCallback(async (overrideText?: string) => {
    const eng = engineRef.current;
    const userMessage = (overrideText ?? input).trim();
    if (!userMessage || !eng || !llmConfig || isLoadingRef.current) return;

    if (!overrideText) setInput('');
    const step = eng.getCurrentStep();
    addMessage({ role: 'user', content: userMessage, stepId: step?.id });

    setIsLoading(true);
    isLoadingRef.current = true;
    setStreamedContent('');

    try {
      const fullContent = await sendLLMRequest(eng, userMessage, false);
      const stepComplete = processResponse(eng, fullContent, step?.id);

      if (stepComplete) {
        const nextStep = eng.getNextStep();
        setPendingAutoAdvance({ stepName: step?.name ?? '', nextStepName: nextStep?.name ?? null });
      } else if (autoModeRef.current && !stepComplete) {
        // Auto mode: if the step is not yet complete after first user message,
        // continue with auto analysis using the user's intent as context
        const userMsgCount = (sessionContextRef.current?.messages ?? []).filter(m => m.role === 'user').length;
        if (userMsgCount === 1) {
          setAutoModeRunning(true);
          setTimeout(() => runAutoStep(engineRef.current!), 600);
        }
      }
    } catch (error) {
      const isAbort = (error as Error).name === 'AbortError';
      if (!isAbort) {
        addMessage({
          role: 'assistant',
          content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}`,
          stepId: step?.id,
        });
      }
      setIsLoading(false);
      isLoadingRef.current = false;
      setStreamedContent('');
    }
  }, [input, llmConfig, sendLLMRequest, processResponse, addMessage, runAutoStep]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ─── Manual next step ─────────────────────────────────────────────────────

  const handleNextStep = () => {
    const eng = engineRef.current;
    if (!eng) return;
    const latestCtx = useStore.getState().sessionContext;
    if (!latestCtx) return;

    const advanced = eng.advanceToNextStep();
    if (advanced) {
      setSessionContext({ ...latestCtx, currentStepIndex: eng.getContext().currentStepIndex });
      const nextStep = eng.getCurrentStep();
      if (nextStep) {
        const stepNum = eng.getContext().currentStepIndex + 1;
        const total = workflow?.steps.length ?? 0;
        setTimeout(() => {
          addMessage({
            role: 'assistant',
            content: `**步骤 ${stepNum}/${total}：${nextStep.name}**\n\n${nextStep.description}\n\n请继续输入你的想法。`,
            stepId: nextStep.id,
          });
        }, 300);
      }
    } else {
      setIsCompleted(true);
    }
  };

  // ─── Export ───────────────────────────────────────────────────────────────

  const handleExport = () => {
    if (!sessionContext) return;
    // Pass local artifacts state to ensure latest artifacts are included
    const doc = exportProjectDocument({ ...sessionContext, detectedArtifacts: artifacts });
    const blob = new Blob([doc], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workflow?.name.replace(/\s+/g, '-')}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStartAutoMode = () => {
    const eng = engineRef.current;
    if (!eng || isLoadingRef.current) return;
    setAutoMode(true);
    setAutoModeRunning(true);
    runAutoStep(eng);
  };

  // ─── Guards ───────────────────────────────────────────────────────────────

  if (!workflow || !sessionContext) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: 'var(--bg)' }}>
        <span className="text-sm" style={{ color: 'var(--text-muted)' }}>加载中...</span>
      </div>
    );
  }

  const totalSteps = workflow.steps.length;
  const canForceAdvance = engine && engine.getNextStep() !== null && !isLoading && !pendingAutoAdvance && !isCompleted;

  const handleStopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full" style={{ background: 'var(--bg)' }}>

      {/* ── Left: Steps sidebar ── */}
      <div
        className="w-48 flex-shrink-0 flex flex-col"
        style={{ background: 'var(--bg)', borderRight: '1px solid var(--border)' }}
      >
        <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>步骤</span>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {workflow.steps.map((step, index) => {
            const status =
              index < currentStepIndex ? 'completed' :
              index === currentStepIndex ? 'current' : 'pending';
            return (
              <div key={step.id} className="px-3 py-2.5 flex items-start gap-2">
                <div className="mt-1 flex-shrink-0"><StepDot status={status} /></div>
                <span
                  className="text-xs leading-snug"
                  style={{
                    color: status === 'current' ? 'var(--text)' :
                           status === 'completed' ? 'var(--text-muted)' : 'var(--text-muted)',
                    fontWeight: status === 'current' ? 500 : 400,
                    textDecoration: status === 'completed' ? 'line-through' : 'none',
                  }}
                >
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Center: Chat ── */}
      <div className="flex flex-col flex-1 min-w-0">

        {/* Toolbar */}
        <div
          className="flex-shrink-0 flex items-center justify-between px-4"
          style={{ height: 40, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
              {workflow.name}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {isCompleted ? '已完成' : `${currentStepIndex + 1} / ${totalSteps} · ${currentStep?.name ?? ''}`}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {!isCompleted && (
              <>
                {isLoading ? (
                  <button
                    onClick={handleStopGeneration}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-colors hover:opacity-80"
                    style={{ color: 'var(--red)', border: '1px solid var(--red)' }}
                  >
                    ■ 停止
                  </button>
                ) : autoModeRunning ? (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--blue)' }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--blue)' }} />
                    自动运行中
                  </span>
                ) : !autoMode ? (
                  <button
                    onClick={handleStartAutoMode}
                    disabled={isLoading}
                    className="flex items-center gap-1 text-xs px-2.5 py-1 text-white rounded transition-colors disabled:opacity-40"
                    style={{ background: 'var(--blue)' }}
                  >
                    ⚡ 开启自动模式
                  </button>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--blue)' }}>
                    ⚡ 自动模式
                    <button
                      onClick={() => { setAutoMode(false); setAutoModeRunning(false); }}
                      style={{ color: 'var(--text-muted)' }}
                      className="ml-0.5 hover:opacity-80"
                    >×</button>
                  </span>
                )}
              </>
            )}

            <button
              onClick={() => setShowArtifacts(!showArtifacts)}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded transition-colors"
              style={{
                background: showArtifacts ? 'var(--surface-elevated)' : 'transparent',
                color: showArtifacts ? 'var(--blue)' : 'var(--text-muted)',
                border: `1px solid ${showArtifacts ? 'var(--blue)' : 'transparent'}`,
              }}
            >
              产出物
              {artifacts.length > 0 && (
                <span
                  className="rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-mono text-white"
                  style={{ background: 'var(--blue)' }}
                >
                  {artifacts.length}
                </span>
              )}
            </button>

            <button
              onClick={handleExport}
              className="text-xs px-2.5 py-1 rounded transition-colors"
              style={{ color: 'var(--text-muted)', border: '1px solid var(--border)' }}
            >
              导出
            </button>
          </div>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto px-6 py-4 space-y-6 min-h-0"
          style={{ background: 'var(--bg)' }}
        >
          {sessionContext.messages
            .filter(m => !m.content.startsWith('[自动模式]'))
            .map((message, index) => {
              const isUser = message.role === 'user';
              const agentName = (
                message.stepId
                  ? workflow.steps.find(s => s.id === message.stepId)?.agent
                  : currentStep?.agent
              )?.toUpperCase() ?? 'ASSISTANT';

              const options = !isUser ? detectOptions(message.content) : null;

              return (
                <div key={message.id || index} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {isUser ? (
                    <div
                      className="max-w-[75%] px-4 py-3 rounded-lg text-sm"
                      style={{
                        background: 'var(--msg-user-bg)',
                        border: '1px solid var(--msg-user-border)',
                        color: 'var(--text)',
                      }}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    </div>
                  ) : (
                    <div className="max-w-[85%]">
                      <div className="text-xs mb-1 font-mono" style={{ color: 'var(--text-muted)' }}>
                        {agentName}
                      </div>
                      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <MessageContent content={message.content} />
                      </div>
                      {options && (
                        <OptionChips
                          options={options}
                          onSelect={(opt) => handleSendMessage(opt)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {/* Pending auto-advance confirmation */}
          {pendingAutoAdvance && (
            <div
              className="rounded-lg p-4"
              style={{ border: '1px solid rgba(63,185,80,0.3)', background: 'rgba(63,185,80,0.05)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: 'var(--green)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>步骤完成</span>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                「{pendingAutoAdvance.stepName}」已完成。
                {pendingAutoAdvance.nextStepName ? '是否继续执行下一步？' : '所有步骤均已完成。'}
              </p>
              <div className="flex gap-2">
                {pendingAutoAdvance.nextStepName ? (
                  <button
                    onClick={confirmAdvance}
                    className="px-3 py-1.5 text-white text-xs rounded transition-colors"
                    style={{ background: 'var(--blue)' }}
                  >
                    继续：{pendingAutoAdvance.nextStepName} →
                  </button>
                ) : (
                  <button
                    onClick={confirmAdvance}
                    className="px-3 py-1.5 text-white text-xs rounded"
                    style={{ background: 'var(--green)' }}
                  >
                    完成工作流
                  </button>
                )}
                <button
                  onClick={pauseAutoMode}
                  className="px-3 py-1.5 text-xs rounded transition-colors"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >
                  暂停
                </button>
              </div>
            </div>
          )}

          {/* Streaming */}
          {streamedContent && (
            <div className="flex justify-start">
              <div className="max-w-[85%]">
                <div className="text-xs mb-1 font-mono flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                  {currentStep?.agent.toUpperCase() ?? 'ASSISTANT'}
                  {autoModeRunning && (
                    <span style={{ color: 'var(--blue)' }}>⚡ 自动</span>
                  )}
                </div>
                <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <MessageContent content={streamedContent} />
                  <span
                    className="inline-block w-0.5 h-4 ml-0.5 align-middle animate-pulse"
                    style={{ background: 'var(--text-muted)' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Loading dots */}
          {isLoading && !streamedContent && (
            <div className="flex items-center gap-1.5 px-2 py-2">
              {[0, 150, 300].map(delay => (
                <span
                  key={delay}
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ background: 'var(--border)', animationDelay: `${delay}ms` }}
                />
              ))}
              {autoModeRunning && (
                <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>AI 自动分析中...</span>
              )}
            </div>
          )}

          {/* Completion */}
          {isCompleted && (
            <div
              className="rounded-lg p-4 text-center"
              style={{ background: 'rgba(63,185,80,0.05)', border: '1px solid rgba(63,185,80,0.2)' }}
            >
              <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>工作流已完成</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>查看右侧产出物，或导出完整文档</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        {!isCompleted && (
          <div
            className="flex-shrink-0 px-4 py-3"
            style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)' }}
          >
            {/* Force-advance link for edge cases where AI never signals completion */}
            {canForceAdvance && !autoMode && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={handleNextStep}
                  className="px-2 py-1 text-[11px] rounded transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
                >
                  跳过到下一步 →
                </button>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={autoModeRunning ? 'AI 正在自动分析，你也可以随时输入...' : '输入回复...（Enter 发送，Shift+Enter 换行）'}
                disabled={isLoading}
                rows={1}
                className="flex-1 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none transition-colors disabled:opacity-50"
                style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  minHeight: '38px',
                  maxHeight: '160px',
                  overflowY: 'auto',
                }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="px-3 py-2 text-white text-xs rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{ background: 'var(--blue)', height: '38px' }}
              >
                发送
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Artifacts ── */}
      {showArtifacts && (
        <>
          {/* Drag handle */}
          <div
            className="flex-shrink-0 cursor-col-resize select-none relative group"
            style={{ width: 4, background: 'var(--border)' }}
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = artifactPanelWidth;
              const onMove = (ev: MouseEvent) => {
                const delta = startX - ev.clientX;
                const next = Math.max(260, Math.min(700, startWidth + delta));
                setArtifactPanelWidth(next);
              };
              const onUp = () => {
                window.removeEventListener('mousemove', onMove);
                window.removeEventListener('mouseup', onUp);
              };
              window.addEventListener('mousemove', onMove);
              window.addEventListener('mouseup', onUp);
            }}
          >
            <div
              className="absolute inset-y-0 -left-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'var(--blue)' }}
            />
          </div>
          <div className="flex-shrink-0 overflow-hidden" style={{ width: artifactPanelWidth }}>
            <ArtifactPanel artifacts={artifacts} onExportAll={handleExport} />
          </div>
        </>
      )}
    </div>
  );
}
