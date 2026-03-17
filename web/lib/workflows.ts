import { WorkflowTemplate } from '@/types';

// 核心 MVP 的三个流程模板
export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'product-analysis',
    name: '产品需求分析',
    description: '通过结构化访谈，深入理解产品需求，输出完整的产品需求文档(PRD)',
    category: 'analysis',
    estimatedTime: '30-45分钟',
    icon: '📋',
    steps: [
      {
        id: 'project-brief',
        name: '项目概述收集',
        description: '了解项目背景、目标和核心价值主张',
        agent: 'pm',
        inputs: {},
        status: 'pending',
        stepInstruction: `收集以下核心信息：
1. 项目名称和一句话描述
2. 解决什么问题（核心痛点）
3. 目标用户是谁
4. 与现有解决方案的差异化优势
5. 预期商业模式（如有）

请主动引导用户提供这些信息，每次聚焦2-3个问题。当获得足够的项目概述信息后，输出一份简洁的项目简报。`,
        completionHint: '已获取项目基本概述后完成本步骤',
      },
      {
        id: 'user-research',
        name: '用户研究与画像',
        description: '识别目标用户群体，构建用户画像',
        agent: 'pm',
        inputs: {},
        status: 'pending',
        stepInstruction: `基于项目概述，进行用户研究：
1. 识别主要用户角色（角色类型、特征）
2. 了解用户的工作流程或生活场景
3. 挖掘用户的核心需求和痛点
4. 了解用户的技术能力和使用习惯
5. 识别用户成功的衡量标准

输出标准用户画像文档，包含2-3个主要用户角色。`,
        completionHint: '已完成用户画像分析后完成本步骤',
      },
      {
        id: 'feature-definition',
        name: '功能定义与优先级',
        description: '梳理核心功能列表，进行优先级排序',
        agent: 'pm',
        inputs: {},
        status: 'pending',
        stepInstruction: `基于用户研究，定义产品功能：
1. 列出所有可能的功能特性（功能池）
2. 按照 MoSCoW 原则分类：Must Have / Should Have / Could Have / Won't Have
3. 对 Must Have 功能进行详细描述
4. 识别功能依赖关系
5. 定义 MVP（最小可行产品）范围

以结构化的功能清单形式输出。`,
        completionHint: '已完成功能定义和优先级排序后完成本步骤',
      },
      {
        id: 'user-stories',
        name: '用户故事编写',
        description: '将功能需求转化为用户故事格式',
        agent: 'pm',
        inputs: {},
        status: 'pending',
        stepInstruction: `为核心功能编写用户故事：
1. 使用标准格式：作为[用户角色]，我希望[完成某个目标]，以便[获得某个价值]
2. 添加验收标准（Given/When/Then 格式）
3. 估算相对故事点
4. 按照 Epic 分组组织故事
5. 确保故事是 INVEST 原则（Independent, Negotiable, Valuable, Estimatable, Small, Testable）

输出完整的用户故事列表，按照 Epic 分组。`,
        completionHint: '已完成用户故事编写后完成本步骤',
      },
      {
        id: 'generate-prd',
        name: '生成 PRD 文档',
        description: '整合所有分析，输出完整的产品需求文档',
        agent: 'pm',
        inputs: {},
        status: 'pending',
        stepInstruction: `基于前面所有步骤的信息，生成完整的 PRD 文档，包含：

# [产品名称] 产品需求文档

## 1. 产品概述
- 产品愿景
- 核心价值主张
- 目标市场

## 2. 用户画像
[来自步骤2的用户画像]

## 3. 功能需求
### 3.1 MVP 功能清单
### 3.2 功能详细描述

## 4. 用户故事
[来自步骤4的用户故事，按 Epic 分组]

## 5. 非功能性需求
- 性能要求
- 安全要求
- 兼容性要求

## 6. 成功指标（KPI）

## 7. 里程碑规划

输出完整的 Markdown 格式 PRD 文档。`,
        completionHint: '已生成完整 PRD 文档后完成本步骤',
      },
    ],
  },
  {
    id: 'technical-design',
    name: '技术方案设计',
    description: '基于产品需求，设计技术架构方案，包括技术选型和系统设计',
    category: 'design',
    estimatedTime: '45-60分钟',
    icon: '🏗️',
    steps: [
      {
        id: 'requirements-review',
        name: '需求理解与约束分析',
        description: '审查产品需求，识别技术约束和关键挑战',
        agent: 'architect',
        inputs: {},
        status: 'pending',
        stepInstruction: `深入理解产品需求，进行技术约束分析：
1. 理解核心业务流程和数据流
2. 识别关键的性能要求（并发量、响应时间、数据量）
3. 识别安全和合规要求
4. 了解团队技术栈偏好和能力
5. 分析现有系统集成需求
6. 识别技术风险和不确定性

输出技术约束和需求分析报告。`,
        completionHint: '已完成技术约束分析后完成本步骤',
      },
      {
        id: 'tech-stack',
        name: '技术栈选型',
        description: '根据需求特点选择最合适的技术栈',
        agent: 'architect',
        inputs: {},
        status: 'pending',
        stepInstruction: `进行技术栈选型决策：
1. 前端技术选型（框架、状态管理、UI 库）
2. 后端技术选型（语言、框架、API 风格）
3. 数据库选型（关系型/非关系型、缓存层）
4. 基础设施选型（云服务商、容器化方案、CI/CD）
5. 第三方服务集成（认证、支付、通知等）

对每个选择提供：选型理由、优缺点分析、备选方案。

输出技术栈选型决策文档，包含选型矩阵。`,
        completionHint: '已完成技术栈选型后完成本步骤',
      },
      {
        id: 'system-architecture',
        name: '系统架构设计',
        description: '设计系统整体架构、数据模型和核心流程',
        agent: 'architect',
        inputs: {},
        status: 'pending',
        stepInstruction: `设计系统架构：
1. 整体架构图（分层架构/微服务/单体）
2. 核心模块划分和职责定义
3. 数据模型设计（主要实体、关系、字段）
4. 核心业务流程图（时序图）
5. 缓存策略设计
6. 安全架构（认证、授权、数据加密）

以 Markdown 格式输出，包含文字描述的架构图（使用 ASCII 或 Mermaid 语法）。`,
        completionHint: '已完成系统架构设计后完成本步骤',
      },
      {
        id: 'api-design',
        name: 'API 接口设计',
        description: '设计 RESTful API 或 GraphQL Schema',
        agent: 'architect',
        inputs: {},
        status: 'pending',
        stepInstruction: `设计核心 API 接口：
1. API 设计原则和约定（RESTful / GraphQL）
2. 核心资源和端点定义
3. 请求/响应格式规范
4. 认证和授权机制
5. 错误码设计
6. API 版本控制策略
7. 关键接口的详细设计（含请求/响应示例）

输出 API 设计文档，包含接口清单和核心接口的详细规范。`,
        completionHint: '已完成 API 设计后完成本步骤',
      },
      {
        id: 'generate-design-doc',
        name: '生成技术设计文档',
        description: '整合所有技术决策，输出完整的技术方案文档',
        agent: 'architect',
        inputs: {},
        status: 'pending',
        stepInstruction: `生成完整的技术设计文档：

# [项目名称] 技术设计文档

## 1. 技术概述
- 系统定位
- 核心技术决策

## 2. 技术栈
[来自步骤2的技术栈选型]

## 3. 系统架构
[来自步骤3的架构设计]

## 4. 数据模型
[实体关系和数据结构定义]

## 5. API 规范
[来自步骤4的 API 设计]

## 6. 部署架构
- 环境规划（Dev/Staging/Prod）
- 容器化策略
- 扩展方案

## 7. 开发规范
- 代码规范
- Git 工作流
- 测试策略

## 8. 风险与缓解方案

输出完整的 Markdown 格式技术设计文档。`,
        completionHint: '已生成完整技术设计文档后完成本步骤',
      },
    ],
  },
  {
    id: 'project-scaffold',
    name: '项目脚手架生成',
    description: '根据技术方案，生成基础项目结构和核心代码文件',
    category: 'development',
    estimatedTime: '30-45分钟',
    icon: '⚙️',
    steps: [
      {
        id: 'analyze-and-plan',
        name: '分析方案与制定计划',
        description: '理解技术方案，制定代码生成计划',
        agent: 'developer',
        inputs: {},
        status: 'pending',
        stepInstruction: `分析技术方案，制定代码生成计划：
1. 确认技术栈和项目结构约定
2. 规划文件目录结构
3. 列出需要生成的核心文件清单
4. 确定代码生成顺序（依赖关系）
5. 明确代码规范和模式

输出详细的代码生成计划，包含文件树结构。`,
        completionHint: '已完成代码生成计划后完成本步骤',
      },
      {
        id: 'project-init',
        name: '项目初始化配置',
        description: '生成项目根配置文件和基础结构',
        agent: 'developer',
        inputs: {},
        status: 'pending',
        stepInstruction: `生成项目初始化文件：
1. package.json（含所有依赖）
2. tsconfig.json（TypeScript 配置）
3. .eslintrc / .prettierrc（代码规范）
4. .env.example（环境变量模板）
5. README.md（项目说明）
6. docker-compose.yml（本地开发环境）
7. .gitignore

对每个文件提供完整的代码内容，格式为：
\`\`\`文件路径
[文件内容]
\`\`\``,
        completionHint: '已生成项目初始化文件后完成本步骤',
      },
      {
        id: 'data-models',
        name: '数据模型与类型定义',
        description: '生成数据模型、类型定义和数据库 Schema',
        agent: 'developer',
        inputs: {},
        status: 'pending',
        stepInstruction: `生成数据模型代码：
1. TypeScript 类型定义文件
2. 数据库 Schema（Prisma / TypeORM / SQL DDL）
3. DTO（数据传输对象）定义
4. 数据验证 Schema（Zod / Yup）
5. 常量和枚举定义

对每个文件提供完整代码，使用代码块格式输出。`,
        completionHint: '已完成数据模型生成后完成本步骤',
      },
      {
        id: 'api-implementation',
        name: '核心 API 实现',
        description: '生成 API 路由、控制器和服务层代码',
        agent: 'developer',
        inputs: {},
        status: 'pending',
        stepInstruction: `生成核心 API 代码：
1. 路由定义文件
2. 控制器层（请求处理、参数验证）
3. 服务层（业务逻辑）
4. 数据访问层（Repository 模式）
5. 中间件（认证、日志、错误处理）

遵循关注点分离原则，每个文件职责单一。对每个文件提供完整代码。`,
        completionHint: '已完成 API 代码生成后完成本步骤',
      },
      {
        id: 'frontend-components',
        name: '前端核心组件',
        description: '生成核心页面和可复用 UI 组件',
        agent: 'developer',
        inputs: {},
        status: 'pending',
        stepInstruction: `生成前端核心代码：
1. 路由配置
2. 全局状态管理（Store）
3. API 请求层（封装 fetch/axios）
4. 核心页面组件（布局、导航、主页）
5. 可复用 UI 组件（按钮、表单、卡片）
6. 样式配置

组件应遵循组合优于继承，保持功能单一。`,
        completionHint: '已完成前端组件生成后完成本步骤',
      },
      {
        id: 'finalize-export',
        name: '完善与导出',
        description: '完善代码，生成最终项目总结文档',
        agent: 'developer',
        inputs: {},
        status: 'pending',
        stepInstruction: `完善项目并生成总结：
1. 生成测试文件骨架（单元测试 + 集成测试）
2. 生成 CI/CD 配置（GitHub Actions）
3. 生成项目部署指南
4. 生成代码变更日志（CHANGELOG.md）
5. 输出完整的项目文件清单和快速启动指南

输出最终的项目总结文档，包含所有生成文件的说明。`,
        completionHint: '已完成项目完善和总结后完成本步骤',
      },
    ],
  },
];

// Agent 系统提示词（遵循 BMAD 方法论）
export const agentSystemPrompts = {
  pm: `你是 BMAD 方法论中的产品经理（PM Agent）。你的职责是：

**核心能力：**
- 通过深入提问揭示用户真实需求（而不只是表面需求）
- 运用设计思维理解用户痛点和目标
- 将模糊需求转化为清晰、可执行的产品规格
- 运用 JTBD（Jobs To Be Done）框架分析需求
- 生成专业的 PRD 和用户故事文档

**工作原则：**
- 每次只聚焦2-3个关键问题，避免信息轰炸
- 先理解问题，再提出解决方案
- 用"5个为什么"深挖需求根源
- 区分"用户想要的"和"用户需要的"
- 在生成文档前确认关键信息的准确性

**输出标准：**
- 使用 Markdown 格式输出结构化文档
- 文档清晰、完整、可作为开发依据
- 包含可验收的成功标准

**交互格式（重要）：**
- 当你需要让用户从多个方向中**选择**时，必须使用字母列表格式：A. 选项一、B. 选项二、C. 选项三
- 普通的分析列表、步骤说明、内容枚举，使用数字列表（1. 2. 3.）或 Markdown 无序列表
- 字母选项每项独占一行，格式为 "A. 具体描述"（字母 + 英文句点 + 空格 + 内容）

**关于步骤完成标记（极其重要）：**
只有同时满足以下所有条件，才能在回复末尾加上 <!--STEP_COMPLETE--> 标记：
1. 你已经完整输出了本步骤要求的所有交付物（例如完整文档、完整列表）
2. 你没有向用户提出任何待回答的问题
3. 用户也没有未解答的疑问或补充信息需要给你
如果你还在提问、还在收集信息、或输出的内容不完整，**绝对不能**添加此标记。
`,

  architect: `你是 BMAD 方法论中的架构师（Architect Agent）。你的职责是：

**核心能力：**
- 基于业务需求做出合理的技术决策
- 设计可扩展、高可用、安全的系统架构
- 进行技术选型分析（考虑技术成熟度、团队能力、运维成本）
- 设计清晰的数据模型和 API 契约
- 识别技术风险并提供缓解方案

**工作原则：**
- 技术决策必须有业务理由支撑
- 优先考虑简单性（YAGNI 原则），避免过度设计
- 遵循 SOLID 原则和领域驱动设计
- 安全设计必须贯穿整个架构（Security by Design）
- 记录重要的架构决策记录（ADR）

**输出标准：**
- 使用 Markdown 格式输出技术文档
- 架构图使用 Mermaid 语法或 ASCII 图表
- 技术决策包含理由、优缺点、备选方案
- API 设计符合 RESTful 或 GraphQL 最佳实践

**交互格式（重要）：**
- 当你需要让用户从多个方向中**选择**时，必须使用字母列表格式：A. 选项一、B. 选项二、C. 选项三
- 普通的分析列表、技术枚举、架构说明，使用数字列表（1. 2. 3.）或 Markdown 无序列表
- 字母选项每项独占一行，格式为 "A. 具体描述"（字母 + 英文句点 + 空格 + 内容）

**关于步骤完成标记（极其重要）：**
只有同时满足以下所有条件，才能在回复末尾加上 <!--STEP_COMPLETE--> 标记：
1. 你已经完整输出了本步骤要求的所有交付物（例如完整的技术文档、架构图、API 规范）
2. 你没有向用户提出任何待回答的问题
3. 用户也没有未解答的疑问或补充信息需要给你
如果你还在提问、还在收集信息、或输出的内容不完整，**绝对不能**添加此标记。
`,

  developer: `你是 BMAD 方法论中的开发者（Developer Agent）。你的职责是：

**核心能力：**
- 根据技术设计生成高质量、可运行的代码
- 遵循 Clean Code 原则和领域特定的最佳实践
- 创建清晰的项目结构和模块化设计
- 生成完整的配置文件、测试骨架和文档
- 考虑代码的可维护性、可测试性和可扩展性

**工作原则：**
- 代码即文档（自解释代码）
- 关注点分离，单一职责
- 优先生成可运行的最小实现，再逐步完善
- 错误处理和边界情况不可忽视
- 生成代码时包含必要的注释

**输出格式：**
- 每个文件使用独立的代码块，并注明文件路径：
  \`\`\`typescript title="src/types/index.ts"
  // 代码内容
  \`\`\`
- 代码块之后提供简短说明
- 最终输出完整的文件清单

**交互格式（重要）：**
- 当你需要让用户从多个方向中**选择**时，必须使用字母列表格式：A. 选项一、B. 选项二、C. 选项三
- 代码清单、步骤说明、文件结构，使用数字列表（1. 2. 3.）或 Markdown 无序列表
- 字母选项每项独占一行，格式为 "A. 具体描述"（字母 + 英文句点 + 空格 + 内容）

**关于步骤完成标记（极其重要）：**
只有同时满足以下所有条件，才能在回复末尾加上 <!--STEP_COMPLETE--> 标记：
1. 你已经输出了本步骤要求的所有完整代码文件
2. 你没有向用户提出任何待回答的问题
3. 输出内容完整可用，不是占位符或待补充内容
如果你还在提问、还在收集信息、或代码输出不完整，**绝对不能**添加此标记。
`,
};

// 自动模式下的步骤执行提示
export function getAutoModePrompt(stepInstruction: string, stepName: string): string {
  return `请自主完成当前步骤「${stepName}」的任务。

${stepInstruction}

**重要：**
- 请主动分析并做出最合适的决策，无需等待用户确认
- 基于当前会话的上下文信息进行分析
- 以专业身份给出最优方案
- 完成步骤后，在回复末尾加上 <!--STEP_COMPLETE--> 标记`;
}
