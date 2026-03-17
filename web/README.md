# BMAD Platform

> 将 [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) 的专业 AI 敏捷开发流程带到网页端

BMAD Platform 是一个 Web 平台，让非技术用户也能通过可视化界面使用 BMAD 的专业开发流程来构建项目。

## 功能特性

### 当前 MVP (v0.1.0)

- 🔑 **LLM Provider 配置** - 支持 OpenAI、Anthropic Claude 和自定义兼容 API
- 📋 **工作流选择** - 3 个核心开发流程模板
- 💬 **交互式向导** - 流式响应的对话界面
- 📥 **文档导出** - 导出 Markdown 格式的对话记录和产出

### 工作流模板

| 模板 | 描述 | 步骤 |
|------|------|------|
| 产品需求分析 | 深入理解产品需求，输出 PRD 文档 | 5 步 |
| 技术方案设计 | 设计技术架构、API 接口和数据模型 | 5 步 |
| 项目脚手架生成 | 生成基础项目结构和核心代码 | 6 步 |

## 快速开始

### 安装依赖

```bash
cd web
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 使用指南

1. **配置 LLM Provider**
   - 选择提供商（OpenAI / Anthropic / 自定义）
   - 输入 API Key
   - 点击"验证并保存"

2. **选择工作流**
   - 浏览 3 个可用的工作流模板
   - 查看每个工作流的步骤和预计时间
   - 选择一个并点击"开始工作流"

3. **执行流程**
   - 与 AI Agent 进行对话
   - 回答问题，提供需求细节
   - 查看实时生成的建议
   - 完成后可进入下一步或导出文档

4. **导出结果**
   - 点击"导出文档"按钮
   - 下载 Markdown 格式的完整对话记录

## 项目结构

```
web/
├── app/              # Next.js App Router
│   ├── page.tsx      # 主页面
│   ├── layout.tsx    # 根布局
│   └── globals.css   # 全局样式
├── api/              # API 路由
│   ├── llm/          # LLM 调用接口
│   └── validate/     # 配置验证接口
├── components/       # React 组件
│   ├── LLMConfigForm.tsx
│   ├── WorkflowSelector.tsx
│   └── WorkflowRunner.tsx
├── lib/              # 核心逻辑
│   ├── store.ts      # Zustand 状态管理
│   ├── llm.ts        # LLM 服务层
│   ├── workflows.ts  # 工作流定义
│   └── workflow-engine.ts  # 工作流引擎
└── types/            # TypeScript 类型定义
```

## 技术栈

- **前端**: Next.js 16 + React 19 + TypeScript
- **样式**: Tailwind CSS v4
- **状态管理**: Zustand
- **LLM 集成**: OpenAI / Anthropic SDK

## 待办事项

- [ ] 添加代码生成和导出功能
- [ ] 支持更多工作流模板
- [ ] 添加项目保存和恢复
- [ ] 支持多语言
- [ ] 添加用户认证

## 参考资源

- [BMAD-METHOD GitHub](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMAD 官方指南](https://bmadmethodguide.com/)

## License

MIT
