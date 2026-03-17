import { LLMConfig, SessionContext, AgentMessage, Artifact } from '@/types';
import { workflowTemplates, agentSystemPrompts, getAutoModePrompt } from './workflows';

export const STEP_COMPLETE_MARKER = '<!--STEP_COMPLETE-->';

// 从 AI 响应内容中检测并提取产出物
export function detectArtifacts(content: string, stepId: string, stepName: string): Artifact[] {
  const artifacts: Artifact[] = [];
  const cleanContent = content.replace(STEP_COMPLETE_MARKER, '').trim();

  // 提取代码块
  const codeBlockRegex = /```(\w+)?(?:\s+title="([^"]+)")?\n([\s\S]+?)```/g;
  let match;
  let codeIndex = 0;
  while ((match = codeBlockRegex.exec(cleanContent)) !== null) {
    const language = match[1] || 'text';
    const title = match[2];
    const code = match[3].trim();

    // 过滤太短的代码片段（可能是内联示例）
    if (code.length > 100) {
      codeIndex++;
      artifacts.push({
        id: `${stepId}-code-${codeIndex}-${Date.now()}`,
        name: title || `${language.toUpperCase()} 代码 (${stepName})`,
        type: 'code',
        content: code,
        language,
        stepId,
        createdAt: new Date(),
      });
    }
  }

  // 检测完整文档（有 H1 标题且内容较长）
  const hasH1 = /^# .+/m.test(cleanContent);
  const hasStructure = /^## .+/m.test(cleanContent);
  if (hasH1 && hasStructure && cleanContent.length > 800) {
    // 提取标题
    const titleMatch = cleanContent.match(/^# (.+)/m);
    const docTitle = titleMatch ? titleMatch[1] : `${stepName} 文档`;

    artifacts.push({
      id: `${stepId}-doc-${Date.now()}`,
      name: docTitle,
      type: 'document',
      content: cleanContent,
      stepId,
      createdAt: new Date(),
    });
  }

  return artifacts;
}

// 工作流引擎类
export class WorkflowEngine {
  private llmConfig: LLMConfig;
  private context: SessionContext;

  constructor(llmConfig: LLMConfig, context: SessionContext) {
    this.llmConfig = llmConfig;
    this.context = context;
  }

  // 获取当前步骤
  getCurrentStep() {
    const workflow = workflowTemplates.find(w => w.id === this.context.workflowId);
    if (!workflow) return null;
    return workflow.steps[this.context.currentStepIndex];
  }

  // 获取下一步
  getNextStep() {
    const workflow = workflowTemplates.find(w => w.id === this.context.workflowId);
    if (!workflow) return null;
    const nextIndex = this.context.currentStepIndex + 1;
    if (nextIndex >= workflow.steps.length) return null;
    return workflow.steps[nextIndex];
  }

  // 前进到下一步
  advanceToNextStep() {
    const nextStep = this.getNextStep();
    if (!nextStep) return false;
    this.context.currentStepIndex++;
    return true;
  }

  // 是否已完成所有步骤
  isCompleted() {
    const workflow = workflowTemplates.find(w => w.id === this.context.workflowId);
    if (!workflow) return false;
    return this.context.currentStepIndex >= workflow.steps.length;
  }

  // 获取 Agent 对话历史（仅当前步骤的消息，控制上下文长度）
  getConversationHistory(): Array<{ role: string; content: string }> {
    // 最多保留最近 20 条消息
    const recentMessages = this.context.messages.slice(-20);
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  // 获取当前 Agent
  getCurrentAgent() {
    const step = this.getCurrentStep();
    return step?.agent || 'pm';
  }

  // 生成步骤提示（普通模式）
  generateStepPrompt(userInput: string): string {
    const step = this.getCurrentStep();
    if (!step) return userInput;

    const workflow = workflowTemplates.find(w => w.id === this.context.workflowId);

    let prompt = '';

    // 如果是步骤的第一条消息，添加步骤上下文
    const stepMessages = this.context.messages.filter(m => m.stepId === step.id);
    if (stepMessages.length === 0 && step.stepInstruction) {
      prompt += `【当前步骤：${step.name}】\n`;
      prompt += `步骤目标：${step.description}\n\n`;
    }

    prompt += userInput;
    return prompt;
  }

  // 生成自动模式下的步骤提示
  generateAutoModePrompt(): string {
    const step = this.getCurrentStep();
    if (!step) return '';

    return getAutoModePrompt(
      step.stepInstruction || step.description,
      step.name
    );
  }

  // 生成步骤欢迎消息
  generateStepWelcome(): string {
    const step = this.getCurrentStep();
    const workflow = workflowTemplates.find(w => w.id === this.context.workflowId);
    if (!step) return '';

    const stepNum = this.context.currentStepIndex + 1;
    const totalSteps = workflow?.steps.length || 0;

    return `**步骤 ${stepNum}/${totalSteps}：${step.name}**\n\n${step.description}\n\n请开始描述你的需求，或者直接告诉我你的想法。`;
  }

  // 更新上下文
  updateContext(updates: Partial<SessionContext>) {
    this.context = { ...this.context, ...updates };
  }

  // 获取上下文
  getContext(): SessionContext {
    return this.context;
  }
}

// 创建新的会话上下文
export function createSessionContext(projectId: string, workflowId: string): SessionContext {
  return {
    projectId,
    workflowId,
    currentStepIndex: 0,
    messages: [],
    artifacts: {},
    detectedArtifacts: [],
  };
}

// 导出项目文档
export function exportProjectDocument(context: SessionContext, format: 'markdown' | 'json' = 'markdown'): string {
  const workflow = workflowTemplates.find(w => w.id === context.workflowId);
  if (!workflow) return '';

  if (format === 'json') {
    return JSON.stringify({
      workflow: workflow.name,
      messages: context.messages,
      artifacts: context.detectedArtifacts || [],
    }, null, 2);
  }

  // Markdown 格式
  let markdown = `# ${workflow.name}\n\n`;
  markdown += `**生成时间**：${new Date().toLocaleString()}\n\n`;
  markdown += `---\n\n`;

  // 优先输出检测到的产出物文档
  const docArtifacts = context.detectedArtifacts?.filter(a => a.type === 'document') || [];
  if (docArtifacts.length > 0) {
    markdown += `## 产出文档\n\n`;
    docArtifacts.forEach(artifact => {
      markdown += `${artifact.content}\n\n---\n\n`;
    });
  }

  // 添加对话历史
  markdown += `## 完整对话记录\n\n`;
  context.messages.forEach(msg => {
    const role = msg.role === 'user' ? '👤 用户' : msg.role === 'system' ? '⚙️ 系统' : '🤖 助手';
    markdown += `### ${role}\n\n${msg.content}\n\n`;
  });

  return markdown;
}
