'use client';
import {
  createContext, useContext, useEffect, useState, ReactNode, useCallback
} from 'react';
import {
  ThemeColors, DEFAULT_THEME, getTheme, saveTheme, applyTheme
} from '@/lib/theme';

type ThemeCtx = {
  theme: ThemeColors;
  loading: boolean;
  updateTheme: (colors: ThemeColors) => Promise<void>;
  refreshTheme: () => Promise<void>;
};

const Ctx = createContext<ThemeCtx>({
  theme: DEFAULT_THEME,
  loading: true,
  updateTheme: async () => {},
  refreshTheme: async () => {}
});

export const useTheme = () => useContext(Ctx);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeColors>(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  const isDarkTheme = (colors: ThemeColors) => {
    const hex = colors.background.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  };

  const applyMode = (colors: ThemeColors) => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.classList.remove('theme-dark', 'theme-light');
    html.classList.add(isDarkTheme(colors) ? 'theme-dark' : 'theme-light');
    html.style.colorScheme = isDarkTheme(colors) ? 'dark' : 'light';
  };

  const loadTheme = useCallback(async () => {
    setLoading(true);
    const t = await getTheme();
    setTheme(t);
    applyTheme(t);
    applyMode(t);
    setLoading(false);
  }, []);

  useEffect(() => {
    applyTheme(DEFAULT_THEME);
    loadTheme();
  }, [loadTheme]);

  const updateTheme = async (colors: ThemeColors) => {
    setTheme(colors);
    applyTheme(colors);
    applyMode(colors);
    await saveTheme(colors);
  };

  return (
    <Ctx.Provider value={{ theme, loading, updateTheme, refreshTheme: loadTheme }}>
      {children}
    </Ctx.Provider>
  );
}