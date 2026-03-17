'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { LLMConfigForm } from '@/components/LLMConfigForm';
import { WorkflowSelector } from '@/components/WorkflowSelector';
import { WorkflowRunner } from '@/components/WorkflowRunner';
import { ThemeToggle } from '@/components/ThemeToggle';

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

type AppStep = 'select' | 'running';

export default function Home() {
  const { reset } = useStore();
  const [currentStep, setCurrentStep] = useState<AppStep>('select');
  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleStartWorkflow = (event: CustomEvent) => {
      setAutoMode(event.detail.autoMode || false);
      setActiveWorkflowId(event.detail.workflowId);
      setCurrentStep('running');
    };

    window.addEventListener('start-workflow', handleStartWorkflow as EventListener);
    return () => {
      window.removeEventListener('start-workflow', handleStartWorkflow as EventListener);
    };
  }, []);

  const handleNewProject = () => {
    reset();
    setActiveWorkflowId(null);
    setAutoMode(false);
    setCurrentStep('select');
  };

  const handleBack = () => {
    setActiveWorkflowId(null);
    setAutoMode(false);
    setCurrentStep('select');
  };

  const isRunning = currentStep === 'running';

  return (
    <main className="h-screen overflow-hidden flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center justify-between px-4"
        style={{ height: 44, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        {/* Left: logo + title + breadcrumb */}
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ background: 'var(--blue)' }}
          >
            B
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>BMAD Platform</span>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>/</span>
            {currentStep === 'select' && (
              <span style={{ color: 'var(--text-secondary)' }}>选择工作流</span>
            )}
            {currentStep === 'running' && (
              <>
                <button
                  onClick={handleBack}
                  className="transition-colors hover:opacity-80"
                  style={{ color: 'var(--text-muted)' }}
                >
                  选择工作流
                </button>
                <span>/</span>
                <span style={{ color: 'var(--text-secondary)' }}>执行中</span>
              </>
            )}
          </div>
        </div>

        {/* Right: buttons */}
        <div className="flex items-center gap-2">
          {currentStep === 'running' && (
            <button
              onClick={handleBack}
              className="text-xs px-3 py-1.5 rounded-md transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              ← 返回
            </button>
          )}
          {activeWorkflowId && (
            <button
              onClick={handleNewProject}
              className="text-xs px-3 py-1.5 transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              新建项目
            </button>
          )}
          {/* Settings button */}
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 rounded-md transition-colors hover:opacity-80"
            style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            title="LLM 设置"
          >
            <IconSettings />
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      {currentStep === 'select' && (
        <div className="flex-1 overflow-y-auto px-4 py-8">
          <WorkflowSelector />
        </div>
      )}

      {currentStep === 'running' && activeWorkflowId && (
        <div className="flex-1 min-h-0 overflow-hidden">
          <WorkflowRunner
            key={activeWorkflowId}
            workflowId={activeWorkflowId}
            initialAutoMode={autoMode}
          />
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowSettings(false); }}
        >
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowSettings(false)}
              className="absolute -top-3 -right-3 z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
              style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <IconX />
            </button>
            <LLMConfigForm onSaved={() => {
              setShowSettings(false);
              if (currentStep !== 'running') setCurrentStep('select');
            }} />
          </div>
        </div>
      )}
    </main>
  );
}
