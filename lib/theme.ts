import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export type ThemeColors = {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  background: string;
  backgroundSurface: string;
  backgroundCard: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
};

export const DEFAULT_THEME: ThemeColors = {
  primary: '#1e3a5f',
  primaryDark: '#0a1828',
  primaryLight: '#4a72a8',
  secondary: '#d4af37',
  secondaryLight: '#facc15',
  secondaryDark: '#b8942e',
  background: '#0a1828',
  backgroundSurface: '#0f1f36',
  backgroundCard: '#1a2f4d',
  textPrimary: '#f8fafc',
  textSecondary: '#cbd5e1',
  accent: '#d4af37'
};

export const THEME_PRESETS = {
  'navy-gold': { name: 'Navy & Gold (الافتراضي)', colors: DEFAULT_THEME },
  'royal-gold': {
    name: 'Royal Blue & Gold',
    colors: {
      primary: '#1e40af',
      primaryDark: '#1e3a8a',
      primaryLight: '#3b82f6',
      secondary: '#fbbf24',
      secondaryLight: '#fcd34d',
      secondaryDark: '#f59e0b',
      background: '#0f172a',
      backgroundSurface: '#1e293b',
      backgroundCard: '#334155',
      textPrimary: '#f8fafc',
      textSecondary: '#cbd5e1',
      accent: '#fbbf24'
    }
  },
  'black-gold': {
    name: 'Black & Gold',
    colors: {
      primary: '#18181b',
      primaryDark: '#09090b',
      primaryLight: '#3f3f46',
      secondary: '#facc15',
      secondaryLight: '#fde047',
      secondaryDark: '#eab308',
      background: '#09090b',
      backgroundSurface: '#18181b',
      backgroundCard: '#27272a',
      textPrimary: '#fafafa',
      textSecondary: '#d4d4d8',
      accent: '#facc15'
    }
  },
  'dark-emerald': {
    name: 'Dark & Emerald',
    colors: {
      primary: '#064e3b',
      primaryDark: '#022c22',
      primaryLight: '#10b981',
      secondary: '#d4af37',
      secondaryLight: '#facc15',
      secondaryDark: '#b8942e',
      background: '#022c22',
      backgroundSurface: '#064e3b',
      backgroundCard: '#065f46',
      textPrimary: '#f0fdf4',
      textSecondary: '#bbf7d0',
      accent: '#d4af37'
    }
  },
  'dark-purple': {
    name: 'Dark & Royal Purple',
    colors: {
      primary: '#4c1d95',
      primaryDark: '#2e1065',
      primaryLight: '#8b5cf6',
      secondary: '#d4af37',
      secondaryLight: '#facc15',
      secondaryDark: '#b8942e',
      background: '#1e1b4b',
      backgroundSurface: '#312e81',
      backgroundCard: '#4c1d95',
      textPrimary: '#f5f3ff',
      textSecondary: '#ddd6fe',
      accent: '#d4af37'
    }
  }
};

export const getTheme = async (): Promise<ThemeColors> => {
  try {
    const ref = doc(db, 'settings', 'theme');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return { ...DEFAULT_THEME, ...snap.data() } as ThemeColors;
    }
    return DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const saveTheme = async (colors: ThemeColors) => {
  const ref = doc(db, 'settings', 'theme');
  await setDoc(
    ref,
    { ...colors, updatedAt: serverTimestamp() },
    { merge: true }
  );
};

export const applyTheme = (theme: ThemeColors) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  root.style.setProperty('--color-primary-500', theme.primary);
  root.style.setProperty('--color-primary-700', theme.primaryDark);
  root.style.setProperty('--color-primary-900', theme.primaryDark);
  root.style.setProperty('--color-primary-300', theme.primaryLight);
  root.style.setProperty('--color-primary-400', theme.primaryLight);

  root.style.setProperty('--color-secondary-500', theme.secondary);
  root.style.setProperty('--color-secondary-400', theme.secondaryLight);
  root.style.setProperty('--color-secondary-600', theme.secondaryDark);

  root.style.setProperty('--color-bg-base', theme.background);
  root.style.setProperty('--color-bg-surface', theme.backgroundSurface);
  root.style.setProperty('--color-bg-card', theme.backgroundCard);
  root.style.setProperty('--color-bg-elevated', theme.backgroundCard);

  root.style.setProperty('--color-text-primary', theme.textPrimary);
  root.style.setProperty('--color-text-secondary', theme.textSecondary);

  root.style.setProperty('--color-accent', theme.accent);
};