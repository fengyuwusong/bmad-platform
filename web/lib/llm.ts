import { LLMConfig, LLMProvider } from '@/types';

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamMessage {
  type: 'content' | 'error' | 'done';
  content?: string;
  error?: string;
}

// 判断是否使用 Anthropic 格式的 API
function isAnthropicType(provider: LLMProvider): boolean {
  return provider === 'anthropic' || provider === 'anthropic-custom';
}

// OpenAI 兼容的 API 调用
async function callOpenAI(
  config: LLMConfig,
  messages: Array<{ role: string; content: string }>,
  stream: boolean = false,
  signal?: AbortSignal,
): Promise<Response> {
  const baseURL = config.baseURL || 'https://api.openai.com/v1';
  const model = config.model || 'gpt-4o-mini';

  const response = await fetch(`${baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  return response;
}

// Anthropic API 调用
async function callAnthropic(
  config: LLMConfig,
  messages: Array<{ role: string; content: string }>,
  stream: boolean = false,
  signal?: AbortSignal,
): Promise<Response> {
  const baseURL = config.baseURL || 'https://api.anthropic.com';
  const model = config.model || 'claude-sonnet-4-6';

  // 转换消息格式（Anthropic 格式）
  const systemMessage = messages.find(m => m.role === 'system')?.content || '';
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(`${baseURL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      system: systemMessage,
      messages: chatMessages,
      max_tokens: 8192,
      stream,
    }),
    signal,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${error}`);
  }

  return response;
}

// 统一的 LLM 调用接口
export async function callLLM(
  config: LLMConfig,
  messages: Array<{ role: string; content: string }>,
  onStream?: (message: StreamMessage) => void,
  signal?: AbortSignal,
): Promise<LLMResponse> {
  const stream = !!onStream;
  let response: Response;

  try {
    // 根据 provider 类型选择 API 调用方式
    if (isAnthropicType(config.provider)) {
      response = await callAnthropic(config, messages, stream, signal);
    } else {
      // OpenAI 或 openai-custom 使用 OpenAI 格式
      response = await callOpenAI(config, messages, stream, signal);
    }

    if (stream) {
      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      if (!reader) {
        throw new Error('Response body is null');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              let content = '';

              if (isAnthropicType(config.provider)) {
                // Anthropic 流式格式
                if (parsed.type === 'content_block_delta') {
                  content = parsed.delta?.text || '';
                }
              } else {
                // OpenAI 流式格式
                content = parsed.choices?.[0]?.delta?.content || '';
              }

              if (content) {
                fullContent += content;
                onStream?.({ type: 'content', content });
              }
            } catch (e) {
              // 跳过解析错误
            }
          }
        }
      }

      onStream?.({ type: 'done' });
      return { content: fullContent };
    } else {
      // 非流式响应
      const data = await response.json();
      let content = '';

      if (isAnthropicType(config.provider)) {
        // Anthropic 响应格式
        content = data.content?.[0]?.text || '';
      } else {
        // OpenAI 响应格式
        content = data.choices?.[0]?.message?.content || '';
      }

      return {
        content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || data.usage.input_tokens,
          completionTokens: data.usage.completion_tokens || data.usage.output_tokens,
          totalTokens: data.usage.total_tokens || (data.usage.input_tokens + data.usage.output_tokens),
        } : undefined,
      };
    }
  } catch (error) {
    onStream?.({ type: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
}

// 验证 API Key 是否有效
export async function validateLLMConfig(config: LLMConfig): Promise<boolean> {
  try {
    const result = await callLLM(config, [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Say "OK" if you can read this.' },
    ]);
    return result.content.includes('OK');
  } catch {
    return false;
  }
}
