'use client';

import { useEffect, useState } from 'react';

export type Theme = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'bmad-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const resolved = theme === 'system' ? getSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
}

export function useTheme() {
  // 服务端和客户端首次渲染都用默认值，避免 hydration 不匹配
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'dark';
    setThemeState(saved);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system theme changes when in 'system' mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
  };

  return { theme, setTheme };
}

export function initTheme() {
  const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) as Theme) || 'dark';
  applyTheme(saved);
}
