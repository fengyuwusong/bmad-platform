// LLM Provider 类型
export type LLMProvider = 'openai' | 'anthropic' | 'openai-custom' | 'anthropic-custom' | 'glm-coding';

export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  baseURL?: string;
  model?: string;
}

// 产出物类型
export interface Artifact {
  id: string;
  name: string;
  type: 'markdown' | 'code' | 'document';
  content: string;
  language?: string;
  stepId?: string;
  createdAt: Date;
}

// 项目类型
export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  llmConfig: LLMConfig;
  currentStep: string;
  completedSteps: string[];
  data: Record<string, any>;
}

// 流程步骤类型
export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agent: string;
  inputs: Record<string, any>;
  outputs?: Record<string, any>;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  stepInstruction?: string;
  completionHint?: string;
}

// 流程模板类型
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'analysis' | 'design' | 'development' | 'testing';
  steps: WorkflowStep[];
  estimatedTime: string;
  icon?: string;
}

// Agent 消息类型
export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  stepId?: string;
}

// 会话上下文
export interface SessionContext {
  projectId: string;
  workflowId: string;
  currentStepIndex: number;
  messages: AgentMessage[];
  artifacts: Record<string, any>;
  detectedArtifacts?: Artifact[];
}

// Provider 配置信息
export interface ProviderInfo {
  value: LLMProvider;
  label: string;
  defaultModel: string;
  baseURL?: string;
  apiType: 'openai' | 'anthropic';
  description?: string;
}
