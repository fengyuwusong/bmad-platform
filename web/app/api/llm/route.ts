import { NextRequest, NextResponse } from 'next/server';
import { callLLM, StreamMessage } from '@/lib/llm';
import { agentSystemPrompts } from '@/lib/workflows';

export async function POST(request: NextRequest) {
  try {
    const { llmConfig, agent, messages, stream } = await request.json();

    if (!llmConfig) {
      return NextResponse.json(
        { error: 'LLM configuration is missing' },
        { status: 400 }
      );
    }

    // When apiKey is empty the client is using the platform default.
    // Substitute the key from the server-side environment variable so it
    // is never exposed in the client bundle or network responses.
    const resolvedConfig = llmConfig.apiKey
      ? llmConfig
      : {
          ...llmConfig,
          apiKey: process.env.DEFAULT_API_KEY ?? '',
          model: llmConfig.model || process.env.DEFAULT_MODEL || 'glm-5',
        };

    if (!resolvedConfig.apiKey) {
      return NextResponse.json(
        { error: 'No API key configured. Set DEFAULT_API_KEY in environment variables.' },
        { status: 400 }
      );
    }

    // 获取对应 Agent 的系统提示
    const systemPrompt = agentSystemPrompts[agent as keyof typeof agentSystemPrompts] || agentSystemPrompts.pm;

    // 构建消息数组
    const allMessages = [
      { role: 'system', content: systemPrompt },
      ...(messages || []),
    ];

    if (stream) {
      // 流式响应
      const encoder = new TextEncoder();
      const signal = request.signal;
      const streamResponse = new ReadableStream({
        async start(controller) {
          const safeEnqueue = (data: string) => {
            try { controller.enqueue(encoder.encode(data)); } catch { /* client disconnected */ }
          };
          try {
            await callLLM(resolvedConfig, allMessages, (message: StreamMessage) => {
              if (signal.aborted) return;
              if (message.type === 'content') {
                safeEnqueue(`data: ${JSON.stringify({ content: message.content })}\n\n`);
              } else if (message.type === 'error') {
                safeEnqueue(`data: ${JSON.stringify({ error: message.error })}\n\n`);
              } else if (message.type === 'done') {
                safeEnqueue(`data: [DONE]\n\n`);
                try { controller.close(); } catch { /* already closed */ }
              }
            }, signal);
          } catch (error) {
            if (!signal.aborted) {
              safeEnqueue(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
            }
            try { controller.close(); } catch { /* already closed */ }
          }
        },
        cancel() { /* client disconnected, callLLM will stop if signal fires */ },
      });

      return new Response(streamResponse, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // 非流式响应
      const result = await callLLM(resolvedConfig, allMessages);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('LLM API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
