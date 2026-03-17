import { LLMConfig } from '@/types';

// apiKey is intentionally empty — the real key lives in the server-side
// DEFAULT_API_KEY env var and is injected in the API routes at request time.
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  provider: 'glm-coding',
  apiKey: '',
  model: 'glm-5',
  baseURL: 'https://open.bigmodel.cn/api/paas/v4',
};
