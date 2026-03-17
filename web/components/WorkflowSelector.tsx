'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { workflowTemplates } from '@/lib/workflows';
import { WorkflowTemplate } from '@/types';

const categoryDotColor: Record<string, string> = {
  analysis: 'var(--purple)',
  design: 'var(--blue)',
  development: 'var(--green)',
  testing: 'var(--orange)',
};

const categoryLabels: Record<string, string> = {
  analysis: '分析',
  design: '设计',
  development: '开发',
  testing: '测试',
};

function WorkflowDetailModal({
  workflow,
  onClose,
  onStart,
}: {
  workflow: WorkflowTemplate;
  onClose: () => void;
  onStart: (autoMode: boolean) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-xl max-w-xl w-full mx-4 max-h-[85vh] flex flex-col"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        }}
      >
        {/* Modal header */}
        <div
          className="px-6 py-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl leading-none">{workflow.icon}</span>
              <div>
                <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>
                  {workflow.name}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                  {workflow.description}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-xl leading-none ml-4 flex-shrink-0 transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
              aria-label="关闭"
            >
              ×
            </button>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: categoryDotColor[workflow.category] ?? 'var(--text-secondary)' }}
              />
              {categoryLabels[workflow.category] ?? workflow.category}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {workflow.steps.length} 个步骤
            </span>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              预计 {workflow.estimatedTime}
            </span>
          </div>
        </div>

        {/* Steps list */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p
            className="text-xs uppercase tracking-wider mb-4 font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            工作流步骤
          </p>
          <div className="space-y-0">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="flex gap-3">
                {/* Number + connector line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      background: 'var(--surface-elevated)',
                      border: '1px solid var(--border)',
                      color: 'var(--blue)',
                    }}
                  >
                    {index + 1}
                  </div>
                  {index < workflow.steps.length - 1 && (
                    <div
                      className="w-px flex-1 min-h-[16px] mt-1"
                      style={{ background: 'var(--border)' }}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                      {step.name}
                    </h4>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{
                        background: 'var(--surface-elevated)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {step.agent}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {step.description}
                  </p>
                  {step.completionHint && (
                    <p className="text-[11px] mt-1" style={{ color: 'var(--blue)' }}>
                      {step.completionHint}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer buttons */}
        <div
          className="px-6 py-4 flex gap-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={() => onStart(false)}
            className="flex-1 rounded-lg py-3 transition-colors text-sm hover:opacity-80"
            style={{ border: '1px solid var(--border)', color: 'var(--text)' }}
          >
            手动模式
            <p className="text-[11px] font-normal mt-0.5" style={{ color: 'var(--text-muted)' }}>
              逐步对话，全程参与
            </p>
          </button>
          <button
            onClick={() => onStart(true)}
            className="flex-1 text-white rounded-lg py-3 font-medium transition-colors text-sm hover:opacity-90"
            style={{ background: 'var(--blue)' }}
          >
            自动分析模式
            <p className="text-[11px] font-normal mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              AI 自主决策，一键完成
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}

export function WorkflowSelector() {
  const { llmConfig, selectedWorkflowId, setSelectedWorkflowId } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [modalWorkflow, setModalWorkflow] = useState<WorkflowTemplate | null>(null);

  if (!llmConfig) {
    return (
      <div className="text-center p-6">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          请先配置 LLM Provider
        </p>
      </div>
    );
  }

  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
  };

  const handleShowDetail = (workflow: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalWorkflow(workflow);
    setShowModal(true);
  };

  const handleStart = (autoMode: boolean) => {
    if (selectedWorkflowId || modalWorkflow?.id) {
      const workflowId = modalWorkflow?.id || selectedWorkflowId;
      setShowModal(false);
      window.dispatchEvent(new CustomEvent('start-workflow', {
        detail: { workflowId, autoMode },
      }));
    }
  };

  const handleDirectStart = () => {
    if (selectedWorkflowId) {
      const workflow = workflowTemplates.find(w => w.id === selectedWorkflowId);
      if (workflow) {
        setModalWorkflow(workflow);
        setShowModal(true);
      }
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl font-semibold mb-1.5" style={{ color: 'var(--text)' }}>
            选择工作流
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            选择一个工作流开始，点击卡片查看详情
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {workflowTemplates.map((workflow) => {
            const isSelected = selectedWorkflowId === workflow.id;
            return (
              <div
                key={workflow.id}
                onClick={() => handleSelectWorkflow(workflow.id)}
                className="rounded-lg p-4 cursor-pointer transition-all group"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isSelected ? 'var(--blue)' : 'var(--border)'}`,
                  boxShadow: isSelected ? '0 0 0 1px var(--blue)20' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--blue)';
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)';
                }}
              >
                {/* Icon + category badge */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl leading-none">{workflow.icon}</span>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: categoryDotColor[workflow.category] ?? 'var(--text-muted)' }}
                    />
                    {categoryLabels[workflow.category] ?? workflow.category}
                  </span>
                </div>

                <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>
                  {workflow.name}
                </h3>
                <p className="text-xs mb-4 line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {workflow.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span>{workflow.steps.length} 步</span>
                    <span>{workflow.estimatedTime}</span>
                  </div>
                  <button
                    onClick={(e) => handleShowDetail(workflow, e)}
                    className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                    style={{ color: 'var(--blue)' }}
                  >
                    查看详情
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleDirectStart}
            disabled={!selectedWorkflowId}
            className="px-6 py-2 text-white rounded-md disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium text-sm hover:opacity-90"
            style={{ background: 'var(--blue)' }}
          >
            查看详情并开始
          </button>
          {!selectedWorkflowId && (
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              请先选择一个工作流
            </p>
          )}
        </div>
      </div>

      {showModal && modalWorkflow && (
        <WorkflowDetailModal
          workflow={modalWorkflow}
          onClose={() => setShowModal(false)}
          onStart={handleStart}
        />
      )}
    </>
  );
}
