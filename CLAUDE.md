# BMAD Platform

## 项目结构
- Web 应用路径：`web/` (Next.js 16, React 19, TypeScript, Tailwind CSS v4)
- 启动开发服务器：`cd web && npm run dev` → http://localhost:3000
- TypeScript 检查：`cd web && npx tsc --noEmit`

## 核心架构
- 状态管理：Zustand (`lib/store.ts`)，持久化字段仅 `llmConfig` + `currentProject`
- 工作流引擎：`lib/workflow-engine.ts` - `WorkflowEngine` 类 + `detectArtifacts()`
- 工作流定义：`lib/workflows.ts` - 步骤含 `stepInstruction` 和 `completionHint`
- LLM 路由：`app/api/llm/route.ts`（SSE 流式），`app/api/validate/route.ts`

## 自动模式约定
- AI 在回复末尾加 `<!--STEP_COMPLETE-->` 表示当前步骤完成
- `WorkflowRunner` 检测到后显示确认卡片，不自动跳转
- `getAutoModePrompt()` 生成自动模式专用 prompt

## UI 设计系统（GitHub Dark）
- bg: `#0d1117` · surface: `#161b22` · border: `#30363d`
- text: `#e6edf3` · secondary: `#8b949e` · muted: `#484f58`
- blue: `#388bfd` · green: `#3fb950` · purple: `#bc8cff`
- prose 变量在 `app/globals.css` 统一覆盖

## 已知问题 / 坑
- flex 全屏高度：父容器需 `h-screen overflow-hidden flex flex-col`，子容器需 `flex-1 min-h-0 overflow-hidden`
- Zustand provider 迁移：旧 `'custom'` 类型用 `(config.provider as string) === 'custom'` 做类型转换
- 流式响应中隐藏 `STEP_COMPLETE_MARKER` 再显示，避免用户看到内部标记

## 已安装依赖
- `react-markdown` + `remark-gfm`：消息 Markdown 渲染
- `@tailwindcss/typography`：prose 样式，在 globals.css 用 `@plugin` 加载
