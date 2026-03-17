import { NextRequest, NextResponse } from 'next/server';
import { validateLLMConfig } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { llmConfig } = await request.json();

    if (!llmConfig) {
      return NextResponse.json(
        { valid: false, error: 'LLM configuration is missing' },
        { status: 400 }
      );
    }

    const resolvedConfig = llmConfig.apiKey
      ? llmConfig
      : {
          ...llmConfig,
          apiKey: process.env.DEFAULT_API_KEY ?? '',
          model: llmConfig.model || process.env.DEFAULT_MODEL || 'glm-5',
        };

    if (!resolvedConfig.apiKey) {
      return NextResponse.json(
        { valid: false, error: 'No API key configured' },
        { status: 400 }
      );
    }

    const isValid = await validateLLMConfig(resolvedConfig);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { valid: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
