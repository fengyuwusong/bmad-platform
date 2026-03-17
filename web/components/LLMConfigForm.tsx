'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { DEFAULT_LLM_CONFIG } from '@/lib/default-config';
import { LLMProvider, LLMConfig, ProviderInfo } from '@/types';

const providerOptions: ProviderInfo[] = [
  {
    value: 'openai',
    label: 'OpenAI 官方',
    defaultModel: 'gpt-4o-mini',
    baseURL: 'https://api.openai.com/v1',
    apiType: 'openai',
    description: '使用 OpenAI 官方 API',
  },
  {
    value: 'anthropic',
    label: 'Anthropic Claude 官方',
    defaultModel: 'claude-sonnet-4-6',
    baseURL: 'https://api.anthropic.com',
    apiType: 'anthropic',
    description: '使用 Anthropic 官方 API',
  },
  {
    value: 'glm-coding',
    label: 'GLM (智谱AI)',
    defaultModel: 'glm-5',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    apiType: 'openai',
    description: '智谱AI GLM 模型，兼容 OpenAI 格式',
  },
  {
    value: 'openai-custom',
    label: '自定义 OpenAI 兼容',
    defaultModel: 'gpt-4o-mini',
    apiType: 'openai',
    description: '兼容 OpenAI API 格式的第三方服务（如 Azure OpenAI、国内 API 等）',
  },
  {
    value: 'anthropic-custom',
    label: '自定义 Anthropic 兼容',
    defaultModel: 'claude-sonnet-4-6',
    apiType: 'anthropic',
    description: '兼容 Anthropic API 格式的第三方服务',
  },
];

export function LLMConfigForm({ onSaved }: { onSaved?: () => void }) {
  const { llmConfig, setLLMConfig } = useStore();
  const isUsingDefault = llmConfig === DEFAULT_LLM_CONFIG || llmConfig?.apiKey === DEFAULT_LLM_CONFIG.apiKey;
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<LLMConfig>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    baseURL: 'https://api.openai.com/v1',
  });

  const selectedProvider = providerOptions.find(p => p.value === formData.provider);
  const isCustom = formData.provider === 'openai-custom' || formData.provider === 'anthropic-custom';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    setValidationResult(null);

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ llmConfig: formData }),
      });

      const result = await response.json();
      setValidationResult(result.valid);

      if (result.valid) {
        setLLMConfig(formData);
        onSaved?.();
      }
    } catch {
      setValidationResult(false);
    } finally {
      setIsValidating(false);
    }
  };

  const inputStyle = {
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    color: 'var(--text)',
  };

  return (
    <div
      className="max-w-md mx-auto rounded-lg p-6"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text)' }}>
        LLM Provider 设置
      </h2>

      {/* Default config notice */}
      <div
        className="rounded-md px-3 py-2.5 mb-4 flex items-start justify-between gap-3"
        style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}
      >
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isUsingDefault ? '当前使用平台默认配置' : '当前使用自定义配置'}
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {isUsingDefault
              ? '已内置智谱 AI GLM 模型，无需额外配置即可使用'
              : `${providerOptions.find(p => p.value === llmConfig?.provider)?.label ?? ''} · ${llmConfig?.model ?? ''}`}
          </p>
        </div>
        {!isUsingDefault && (
          <button
            type="button"
            onClick={() => { setLLMConfig(null as any); onSaved?.(); }}
            className="text-[11px] flex-shrink-0 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            重置为默认
          </button>
        )}
      </div>

      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        填写以下信息以切换为你自己的 LLM Provider：
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Provider */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Provider
          </label>
          <select
            value={formData.provider}
            onChange={(e) => {
              const provider = e.target.value as LLMProvider;
              const option = providerOptions.find(p => p.value === provider);
              setFormData({
                ...formData,
                provider,
                model: option?.defaultModel || 'gpt-4o-mini',
                baseURL: option?.baseURL || '',
              });
            }}
            className="w-full rounded-md px-3 py-2 text-sm focus:outline-none transition-colors"
            style={{ ...inputStyle, appearance: 'auto' }}
          >
            {providerOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                style={{ background: 'var(--surface)' }}
              >
                {option.label}
              </option>
            ))}
          </select>
          {selectedProvider?.description && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {selectedProvider.description}
            </p>
          )}
        </div>

        {/* API Key */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            API Key
          </label>
          <input
            type="password"
            value={formData.apiKey}
            onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            placeholder={
              formData.provider === 'glm-coding'
                ? '输入智谱 API Key'
                : selectedProvider?.apiType === 'anthropic'
                ? 'sk-ant-...'
                : 'sk-...'
            }
            className="w-full rounded-md px-3 py-2 text-sm focus:outline-none transition-colors"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            required
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            模型
          </label>
          <input
            type="text"
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder={selectedProvider?.defaultModel}
            className="w-full rounded-md px-3 py-2 text-sm focus:outline-none transition-colors"
            style={inputStyle}
            onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
            onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
          {formData.provider === 'glm-coding' && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              常用模型: glm-5, glm-4-plus, glm-4-air
            </p>
          )}
          {selectedProvider?.apiType === 'anthropic' && formData.provider !== 'glm-coding' && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              常用模型: claude-sonnet-4-6, claude-opus-4-6, claude-haiku-4-5-20251001
            </p>
          )}
          {selectedProvider?.apiType === 'openai' && formData.provider !== 'glm-coding' && (
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              常用模型: gpt-4o, gpt-4o-mini, o1-mini
            </p>
          )}
        </div>

        {/* Base URL — custom providers only */}
        {isCustom && (
          <div>
            <label className="block text-sm mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Base URL <span style={{ color: 'var(--red)' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.baseURL || ''}
              onChange={(e) => setFormData({ ...formData, baseURL: e.target.value })}
              placeholder="https://api.example.com/v1"
              className="w-full rounded-md px-3 py-2 text-sm focus:outline-none transition-colors"
              style={inputStyle}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--blue)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              required={isCustom}
            />
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {formData.provider === 'anthropic-custom'
                ? '输入兼容 Anthropic API 格式的服务地址'
                : '输入兼容 OpenAI API 格式的服务地址'}
            </p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isValidating || !formData.apiKey || (isCustom && !formData.baseURL)}
          className="w-full py-2 text-white rounded-md font-medium text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--blue)' }}
        >
          {isValidating ? '验证中...' : '验证并保存'}
        </button>

        {validationResult === true && (
          <p className="text-xs text-center" style={{ color: 'var(--green)' }}>配置验证成功</p>
        )}
        {validationResult === false && (
          <p className="text-xs text-center" style={{ color: 'var(--red)' }}>配置验证失败，请检查配置</p>
        )}

        {llmConfig && validationResult === true && (
          <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
            已配置 {providerOptions.find(p => p.value === llmConfig.provider)?.label} — {llmConfig.model}
          </p>
        )}
      </form>
    </div>
  );
}
