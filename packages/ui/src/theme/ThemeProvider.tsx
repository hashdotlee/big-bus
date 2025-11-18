/**
 * Theme Provider Component
 * Provider cho theme system với khả năng customize
 */

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Theme, ThemeCustomization, ThemePreset } from './types';
import { themePresets } from './presets';
import { mergeTheme } from './utils';

interface ThemeContextValue {
  theme: Theme;
  themeName: string;
  setTheme: (name: ThemePreset | string) => void;
  customizeTheme: (customization: ThemeCustomization) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreset | string;
  customThemes?: Record<string, Theme>;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'default',
  customThemes = {},
  storageKey = 'big-bus-theme',
}: ThemeProviderProps) {
  // Merge custom themes with presets
  const allThemes = useMemo(
    () => ({ ...themePresets, ...customThemes }),
    [customThemes]
  );

  // Initialize theme from localStorage or default
  const [themeName, setThemeName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.name || defaultTheme;
        } catch {
          return defaultTheme;
        }
      }
    }
    return defaultTheme;
  });

  const [customization, setCustomization] = useState<ThemeCustomization>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.customization || {};
        } catch {
          return {};
        }
      }
    }
    return {};
  });

  // Get current theme with customization applied
  const theme = useMemo(() => {
    const baseTheme = allThemes[themeName] || themePresets.default;
    return mergeTheme(baseTheme, customization);
  }, [themeName, customization, allThemes]);

  // Save to localStorage when theme changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          name: themeName,
          customization,
        })
      );
    }
  }, [themeName, customization, storageKey]);

  // Apply CSS variables to document
  useEffect(() => {
    if (typeof window !== 'undefined' && theme) {
      const root = document.documentElement;

      // Apply color variables
      Object.entries(theme.colors.primary).forEach(([key, value]) => {
        root.style.setProperty(`--color-primary-${key}`, value);
      });

      if (theme.colors.secondary) {
        Object.entries(theme.colors.secondary).forEach(([key, value]) => {
          root.style.setProperty(`--color-secondary-${key}`, value);
        });
      }

      // Apply background colors
      root.style.setProperty('--color-background-main', theme.colors.background.main);
      root.style.setProperty('--color-background-paper', theme.colors.background.paper);
      root.style.setProperty('--color-background-elevated', theme.colors.background.elevated);

      // Apply text colors
      root.style.setProperty('--color-text-primary', theme.colors.text.primary);
      root.style.setProperty('--color-text-secondary', theme.colors.text.secondary);
      root.style.setProperty('--color-text-disabled', theme.colors.text.disabled);
      root.style.setProperty('--color-text-inverse', theme.colors.text.inverse);

      // Apply border colors
      root.style.setProperty('--color-border-light', theme.colors.border.light);
      root.style.setProperty('--color-border-main', theme.colors.border.main);
      root.style.setProperty('--color-border-dark', theme.colors.border.dark);

      // Apply font family
      root.style.setProperty('--font-sans', theme.typography.fontFamily.sans.join(', '));
      root.style.setProperty('--font-serif', theme.typography.fontFamily.serif.join(', '));
      root.style.setProperty('--font-mono', theme.typography.fontFamily.mono.join(', '));
    }
  }, [theme]);

  const handleSetTheme = (name: ThemePreset | string) => {
    setThemeName(name);
    setCustomization({}); // Reset customization when changing theme
  };

  const handleCustomizeTheme = (newCustomization: ThemeCustomization) => {
    setCustomization((prev) => ({
      ...prev,
      ...newCustomization,
    }));
  };

  const handleResetTheme = () => {
    setThemeName(defaultTheme);
    setCustomization({});
  };

  const value: ThemeContextValue = {
    theme,
    themeName,
    setTheme: handleSetTheme,
    customizeTheme: handleCustomizeTheme,
    resetTheme: handleResetTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to use theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
