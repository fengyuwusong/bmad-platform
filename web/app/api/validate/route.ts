import { NextRequest, NextResponse } from 'next/server';
import { validateLLMConfig } from '@/lib/llm';

export async function POST(request: NextRequest) {
  try {
    const { llmConfig } = await request.json();

    if (!llmConfig || !llmConfig.apiKey) {
      return NextResponse.json(
        { valid: false, error: 'API Key is required' },
        { status: 400 }
      );
    }

    const isValid = await validateLLMConfig(llmConfig);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { valid: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
