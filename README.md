# BMAD Platform

A web-based platform that brings the [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) AI-driven development workflow to your browser. Guide your projects from idea to scaffold through structured, multi-step conversations with specialized AI agents.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

BMAD Platform lets you run the full BMAD development cycle in a browser — no local tooling required. Each workflow is a guided conversation with a purpose-built AI agent that produces structured, exportable documents at every step.

## Features

- **Three core workflows** covering the full dev cycle: Product Requirements → Technical Design → Project Scaffold
- **Multi-LLM support** — works out of the box with the built-in GLM model, or connect your own OpenAI, Anthropic, or any compatible API
- **Streaming chat** with real-time output and auto / manual step progression
- **Artifact extraction** — code blocks and documents are automatically detected and collected in a side panel for preview and download
- **Mermaid diagrams** rendered inline from AI responses
- **One-click export** of the full conversation and all artifacts as Markdown
- **Light / dark / system theme**

## Workflows

| Workflow | Agent | Steps | Est. Time |
|----------|-------|-------|-----------|
| 📋 Product Requirements Analysis | PM Agent | 5 | 30–45 min |
| 🏗️ Technical Design | Architect Agent | 5 | 45–60 min |
| ⚙️ Project Scaffold Generation | Developer Agent | 6 | 30–45 min |

## Repository Structure

```
bmad-platform/
└── web/        # Next.js 16 web application
```

## Getting Started

```bash
git clone https://github.com/fengyuwusong/bmad-platform.git
cd bmad-platform/web
npm install
cp .env.example .env.dev
# fill in DEFAULT_API_KEY in .env.dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

See [`web/README.md`](./web/README.md) for full setup instructions, environment variables, and deployment guide.

## Deploy to Vercel

1. Import this repository in [Vercel](https://vercel.com)
2. Set **Root Directory** to `web`
3. Add environment variables: `DEFAULT_API_KEY`, `DEFAULT_MODEL`
4. Deploy

## Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · react-markdown · Mermaid

## References

- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMAD Guide](https://bmadmethodguide.com/)

## License

MIT
