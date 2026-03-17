'use client';

import { useTheme, Theme } from '@/lib/theme';

const options: { value: Theme; label: string; icon: string }[] = [
  { value: 'system', label: '跟随系统', icon: '💻' },
  { value: 'light', label: '浅色', icon: '☀️' },
  { value: 'dark', label: '深色', icon: '🌙' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const current = options.find(o => o.value === theme) ?? options[2];
  const next = options[(options.indexOf(current) + 1) % options.length];

  return (
    <button
      onClick={() => setTheme(next.value)}
      title={`切换主题（当前：${current.label}）`}
      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded transition-colors"
      style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
    >
      <span>{current.icon}</span>
      <span className="hidden sm:inline">{current.label}</span>
    </button>
  );
}
