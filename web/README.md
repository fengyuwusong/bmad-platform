# BMAD Platform

将 [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) 的专业 AI 开发流程带到网页端。通过结构化的对话工作流，帮助你完成产品需求分析、技术方案设计和项目脚手架生成。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 功能特性

- **三大核心工作流**：产品需求分析 → 技术方案设计 → 项目脚手架生成，覆盖从 0 到 1 的完整开发周期
- **多 LLM 支持**：内置智谱 AI GLM（无需配置），也支持 OpenAI、Anthropic Claude 及任意兼容接口
- **流式对话**：实时流式输出，支持手动 / 自动两种驱动模式
- **产出物提取**：自动识别 AI 回复中的代码块和文档，收集到右侧面板，支持全屏预览和下载
- **Mermaid 图表**：AI 生成的架构图、流程图直接在对话中渲染
- **文档导出**：一键导出 Markdown 格式的完整对话记录和所有产出物
- **主题切换**：支持亮色 / 暗色 / 跟随系统

## 工作流

### 📋 产品需求分析（~30-45 min）
由 PM Agent 引导，5 步完成：项目概述 → 用户研究 → 功能定义 → 用户故事 → 生成 PRD 文档

### 🏗️ 技术方案设计（~45-60 min）
由架构师 Agent 引导，5 步完成：需求理解 → 技术选型 → 系统架构 → API 设计 → 生成技术设计文档

### ⚙️ 项目脚手架生成（~30-45 min）
由开发者 Agent 引导，6 步完成：分析计划 → 项目初始化 → 数据模型 → API 实现 → 前端组件 → 完善导出

## 快速开始

**环境要求**：Node.js 18.18+

```bash
git clone https://github.com/fengyuwusong/bmad-platform.git
cd bmad-platform/web
npm install
cp .env.example .env.dev
```

编辑 `.env.dev`，填入平台默认 LLM 的 API Key：

```env
DEFAULT_API_KEY=your_api_key_here
DEFAULT_MODEL=glm-5
```

```bash
npm run dev
# 访问 http://localhost:3000
```

> **注意**：`DEFAULT_API_KEY` 仅在服务端使用，不会暴露给浏览器。用户也可以在应用内自行配置其他 LLM Provider。

## LLM 配置

内置智谱 AI GLM（`glm-5`）作为默认模型，用户无需配置即可使用。点击右上角 ⚙️ 可切换为自己的 Provider：

| Provider | 推荐模型 |
|----------|----------|
| OpenAI 官方 | `gpt-4o`、`gpt-4o-mini`、`o1-mini` |
| Anthropic Claude 官方 | `claude-sonnet-4-6`、`claude-opus-4-6` |
| GLM (智谱AI) | `glm-5`、`glm-4-plus`、`glm-4-air` |
| 自定义 OpenAI 兼容 | Azure OpenAI、国内第三方 API 等 |
| 自定义 Anthropic 兼容 | 兼容 Anthropic 格式的第三方服务 |

## 部署到 Vercel

1. Fork 此仓库
2. 在 [Vercel](https://vercel.com) 导入项目，**Root Directory 设为 `web`**
3. 添加环境变量：

   | 变量名 | 说明 |
   |--------|------|
   | `DEFAULT_API_KEY` | 平台默认 LLM 的 API Key |
   | `DEFAULT_MODEL` | 默认模型名称，如 `glm-5` |

4. 部署

## 项目结构

```
web/
├── app/
│   ├── page.tsx                 # 主页（工作流选择与执行）
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── llm/route.ts         # LLM 流式调用接口
│       └── validate/route.ts    # 配置验证接口
├── components/
│   ├── WorkflowRunner.tsx       # 工作流对话主界面
│   ├── WorkflowSelector.tsx     # 工作流选择页
│   ├── ArtifactPanel.tsx        # 产出物面板
│   ├── LLMConfigForm.tsx        # LLM 配置表单
│   └── ThemeToggle.tsx          # 主题切换
├── lib/
│   ├── workflow-engine.ts       # 工作流引擎（步骤管理、Prompt 生成）
│   ├── workflows.ts             # 工作流定义 + Agent 系统提示词
│   ├── store.ts                 # Zustand 全局状态
│   ├── llm.ts                   # LLM 服务层（OpenAI / Anthropic 兼容）
│   └── default-config.ts        # 平台默认配置
└── types/index.ts               # TypeScript 类型定义
```

## 技术栈

- **框架**：Next.js 16 + React 19 + TypeScript 5.9
- **样式**：Tailwind CSS v4 + @tailwindcss/typography
- **状态管理**：Zustand 5（持久化 `llmConfig` 和 `currentProject`）
- **Markdown**：react-markdown + remark-gfm
- **图表**：Mermaid（懒加载）

## 参考资源

- [BMAD-METHOD GitHub](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMAD 官方指南](https://bmadmethodguide.com/)

## License

MIT
