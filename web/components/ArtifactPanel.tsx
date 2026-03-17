'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Artifact } from '@/types';

const typeLabels: Record<string, string> = {
  document: '文档',
  code: '代码',
  markdown: 'Markdown',
};

const typeDotColor: Record<string, string> = {
  document: 'var(--purple)',
  code: 'var(--green)',
  markdown: 'var(--blue)',
};

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconFolder() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconMaximize() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

// ─── Code block ───────────────────────────────────────────────────────────────

function CodeBlock({ content, language }: { content: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-md overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      <div
        className="flex items-center justify-between px-3 py-1.5 text-xs"
        style={{ background: 'var(--surface-elevated)' }}
      >
        <span className="font-mono" style={{ color: 'var(--text-muted)' }}>{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="transition-colors hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <pre
        className="p-3 overflow-x-auto text-xs leading-relaxed font-mono"
        style={{ background: 'var(--bg)', color: 'var(--text)' }}
      >
        <code>{content}</code>
      </pre>
    </div>
  );
}

// ─── Full-screen modal ────────────────────────────────────────────────────────

function ArtifactModal({ artifact, onClose }: { artifact: Artifact; onClose: () => void }) {
  const [view, setView] = useState<'preview' | 'source'>('preview');

  const handleDownload = () => {
    const ext = artifact.type === 'code' ? (artifact.language || 'txt') : 'md';
    const blob = new Blob([artifact.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${artifact.name.replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: typeDotColor[artifact.type] ?? 'var(--text-secondary)' }}>
              {artifact.type === 'code' ? <IconCode /> : <IconFile />}
            </span>
            <h3 className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {artifact.name}
            </h3>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono"
              style={{
                background: 'var(--surface-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
            >
              {typeLabels[artifact.type] ?? artifact.type}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {artifact.type !== 'code' && (
              <div
                className="flex rounded-md overflow-hidden"
                style={{ border: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => setView('preview')}
                  className="px-3 py-1 text-xs transition-colors"
                  style={{
                    background: view === 'preview' ? 'var(--surface-elevated)' : 'transparent',
                    color: view === 'preview' ? 'var(--text)' : 'var(--text-muted)',
                  }}
                >
                  预览
                </button>
                <button
                  onClick={() => setView('source')}
                  className="px-3 py-1 text-xs transition-colors"
                  style={{
                    background: view === 'source' ? 'var(--surface-elevated)' : 'transparent',
                    color: view === 'source' ? 'var(--text)' : 'var(--text-muted)',
                  }}
                >
                  源码
                </button>
              </div>
            )}
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            >
              <IconDownload />
              下载
            </button>
            <button
              onClick={onClose}
              className="transition-colors p-1 hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
              aria-label="关闭"
            >
              <IconX />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {artifact.type === 'code' || view === 'source' ? (
            <CodeBlock content={artifact.content} language={artifact.language} />
          ) : (
            <div className="prose max-w-none prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {artifact.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function ArtifactPanel({
  artifacts,
  onExportAll,
}: {
  artifacts: Artifact[];
  onExportAll: () => void;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const prevLengthRef = useRef(0);

  // Auto-select newest artifact only when a NEW one is added (don't interrupt user's selection)
  useEffect(() => {
    if (artifacts.length > prevLengthRef.current && artifacts.length > 0) {
      setSelectedIndex(artifacts.length - 1);
    }
    prevLengthRef.current = artifacts.length;
  }, [artifacts.length]);

  const selected = artifacts[selectedIndex] ?? null;

  // ── Empty state ──
  if (artifacts.length === 0) {
    return (
      <div
        className="h-full flex flex-col"
        style={{ background: 'var(--bg)', borderLeft: '1px solid var(--border)' }}
      >
        <div
          className="px-4 py-3 flex items-center"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            产出物
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <IconFolder />
          <p className="text-sm font-medium mt-4" style={{ color: 'var(--text-muted)' }}>暂无产出物</p>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            AI 生成的文档和代码<br />将在这里自动显示
          </p>
          <div className="mt-5 space-y-2 text-left text-xs" style={{ color: 'var(--text-muted)' }}>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--purple)' }} />
              完整 Markdown 文档
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--green)' }} />
              代码片段和文件
            </p>
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--blue)' }} />
              支持全屏预览和下载
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="h-full flex flex-col"
        style={{ background: 'var(--bg)', borderLeft: '1px solid var(--border)' }}
      >
        {/* ── Panel header ── */}
        <div
          className="flex-shrink-0 px-3 py-2 flex items-center justify-between"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--text-muted)' }}>
            产出物
            {artifacts.length > 1 && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full font-mono"
                style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}
              >
                {artifacts.length}
              </span>
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowModal(true)}
              title="全屏查看"
              className="p-1 rounded transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <IconMaximize />
            </button>
            <button
              onClick={onExportAll}
              className="text-xs px-2 py-0.5 rounded transition-colors hover:opacity-80"
              style={{ color: 'var(--blue)' }}
            >
              导出
            </button>
          </div>
        </div>

        {/* ── Artifact tabs (if multiple) ── */}
        {artifacts.length > 1 && (
          <div
            className="flex-shrink-0 flex overflow-x-auto"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            {artifacts.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setSelectedIndex(i)}
                className="flex items-center gap-1.5 px-3 py-2 text-[11px] flex-shrink-0 transition-colors"
                style={{
                  color: i === selectedIndex ? 'var(--text)' : 'var(--text-muted)',
                  borderBottom: i === selectedIndex ? '2px solid var(--blue)' : '2px solid transparent',
                  background: 'transparent',
                }}
              >
                <span style={{ color: typeDotColor[a.type] ?? 'var(--text-secondary)' }}>
                  {a.type === 'code' ? <IconCode /> : <IconFile />}
                </span>
                <span className="max-w-[80px] truncate">{a.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* ── Single artifact name bar (if only one) ── */}
        {artifacts.length === 1 && selected && (
          <div
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <span style={{ color: typeDotColor[selected.type] ?? 'var(--text-secondary)' }}>
              {selected.type === 'code' ? <IconCode /> : <IconFile />}
            </span>
            <span className="text-xs truncate flex-1" style={{ color: 'var(--text-secondary)' }}>
              {selected.name}
            </span>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0"
              style={{
                background: 'var(--surface-elevated)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border)',
              }}
            >
              {typeLabels[selected.type] ?? selected.type}
            </span>
          </div>
        )}

        {/* ── Inline preview ── */}
        {selected && (
          <div className="flex-1 overflow-y-auto p-3" style={{ background: 'var(--bg)' }}>
            {selected.type === 'code' ? (
              <CodeBlock content={selected.content} language={selected.language} />
            ) : (
              <div className="prose max-w-none prose-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selected.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && selected && (
        <ArtifactModal
          artifact={selected}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
