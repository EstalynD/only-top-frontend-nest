"use client";
import React from 'react';

export type Theme = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'ot_theme';

function applyTheme(t: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', t);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('light');

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved === 'dark' || saved === 'light') {
        setThemeState(saved);
        applyTheme(saved);
        return;
      }
      // fallback a preferencia del sistema
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const sys: Theme = prefersDark ? 'dark' : 'light';
      setThemeState(sys);
      applyTheme(sys);
    } catch {}
  }, []);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch {}
    applyTheme(t);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(STORAGE_KEY, next); } catch {}
      applyTheme(next);
      return next;
    });
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
