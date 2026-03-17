**中文 | [English](./README.md)**

# BMAD Platform

将 [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) 的专业 AI 开发流程带到浏览器端。通过与专属 AI Agent 的结构化多步对话，引导项目从想法到脚手架的完整生命周期。

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 简介

BMAD Platform 让你在浏览器中完成完整的 BMAD 开发周期，无需本地工具链。每个工作流都是与专属 AI Agent 的引导式对话，每一步都会产出结构化、可导出的文档。

## 功能特性

- **三大核心工作流**：产品需求分析 → 技术方案设计 → 项目脚手架生成
- **多 LLM 支持**：内置智谱 AI GLM（开箱即用），也支持 OpenAI、Anthropic 或任意兼容接口
- **流式对话**：实时输出，支持手动 / 自动两种步骤驱动模式
- **产出物提取**：自动识别代码块和文档，收集到侧边面板，支持预览和下载
- **Mermaid 图表**：AI 生成的架构图、流程图直接在对话中渲染
- **一键导出**：将完整对话记录和所有产出物导出为 Markdown
- **亮色 / 暗色 / 跟随系统主题**

## 工作流

| 工作流 | Agent | 步骤数 | 预计时长 |
|--------|-------|--------|----------|
| 📋 产品需求分析 | PM Agent | 5 | 30–45 分钟 |
| 🏗️ 技术方案设计 | 架构师 Agent | 5 | 45–60 分钟 |
| ⚙️ 项目脚手架生成 | 开发者 Agent | 6 | 30–45 分钟 |

## 仓库结构

```
bmad-platform/
└── web/        # Next.js 16 Web 应用
```

## 快速开始

```bash
git clone https://github.com/fengyuwusong/bmad-platform.git
cd bmad-platform/web
npm install
cp .env.example .env.dev
# 在 .env.dev 中填入 DEFAULT_API_KEY
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

完整的环境变量配置和部署说明请参考 [`web/README.md`](./web/README.md)。

## 部署到 Vercel

1. 在 [Vercel](https://vercel.com) 导入此仓库
2. **Root Directory 设为 `web`**
3. 添加环境变量：`DEFAULT_API_KEY`、`DEFAULT_MODEL`
4. 部署

## 技术栈

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · react-markdown · Mermaid

## 参考资源

- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMAD 官方指南](https://bmadmethodguide.com/)

## License

MIT
