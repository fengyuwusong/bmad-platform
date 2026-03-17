import { LLMConfig } from '@/types';

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'glm-coding',
  apiKey: process.env.NEXT_PUBLIC_DEFAULT_API_KEY ?? '',
  model: process.env.NEXT_PUBLIC_DEFAULT_MODEL ?? 'glm-4-flash',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
};
