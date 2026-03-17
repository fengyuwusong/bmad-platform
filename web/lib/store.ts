import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LLMConfig, Project, SessionContext, AgentMessage } from '@/types';
import { DEFAULT_LLM_CONFIG } from './default-config';

// 迁移旧的 provider 类型
function migrateProvider(config: LLMConfig | null): LLMConfig | null {
  if (!config) return null;

  // 将旧的 'custom' 类型迁移到 'openai-custom'
  if ((config.provider as string) === 'custom') {
    return {
      ...config,
      provider: 'openai-custom',
    };
  }

  return config;
}

interface AppState {
  // LLM 配置
  llmConfig: LLMConfig | null;
  setLLMConfig: (config: LLMConfig | null) => void;

  // 当前项目
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  updateProjectStep: (stepId: string, status: 'pending' | 'in_progress' | 'completed' | 'error', outputs?: Record<string, any>) => void;

  // 会话上下文
  sessionContext: SessionContext | null;
  setSessionContext: (context: SessionContext | null) => void;
  addMessage: (message: Omit<AgentMessage, 'id' | 'timestamp'>) => void;

  // UI 状态
  selectedWorkflowId: string | null;
  setSelectedWorkflowId: (id: string | null) => void;

  // 重置
  reset: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // LLM 配置初始状态（默认使用平台内置配置）
      llmConfig: DEFAULT_LLM_CONFIG,
      setLLMConfig: (config) => set({ llmConfig: config ? migrateProvider(config) : DEFAULT_LLM_CONFIG }),

      // 项目状态
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
      updateProjectStep: (stepId, status, outputs) => {
        const project = get().currentProject;
        if (!project) return;

        const updatedProject = {
          ...project,
          data: {
            ...project.data,
            steps: project.data.steps?.map((step: any) =>
              step.id === stepId ? { ...step, status, outputs } : step
            ),
          },
        };
        set({ currentProject: updatedProject });
      },

      // 会话上下文
      sessionContext: null,
      setSessionContext: (context) => set({ sessionContext: context }),
      addMessage: (message) => {
        const context = get().sessionContext;
        if (!context) return;

        const newMessage: AgentMessage = {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
        };

        set({
          sessionContext: {
            ...context,
            messages: [...context.messages, newMessage],
          },
        });
      },

      // UI 状态
      selectedWorkflowId: null,
      setSelectedWorkflowId: (id) => set({ selectedWorkflowId: id }),

      // 重置
      reset: () => set({
        currentProject: null,
        sessionContext: null,
        selectedWorkflowId: null,
      }),
    }),
    {
      name: 'bmad-platform-storage',
      partialize: (state) => ({
        llmConfig: state.llmConfig,
        currentProject: state.currentProject,
      }),
      // 从 localStorage 恢复时迁移旧数据
      onRehydrateStorage: () => (state) => {
        if (state?.llmConfig) {
          state.llmConfig = migrateProvider(state.llmConfig);
        }
      },
    }
  )
);
