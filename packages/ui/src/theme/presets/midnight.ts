import type { Theme } from '../types';
import { defaultTheme } from './default';

/**
 * Midnight Theme - Dark & Purple
 * Theme đêm với màu tối và tím
 */
export const midnightTheme: Theme = {
  ...defaultTheme,
  name: 'midnight',
  colors: {
    ...defaultTheme.colors,
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
      950: '#3b0764',
    },
    secondary: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
      950: '#2e1065',
    },
    background: {
      main: '#0f172a',
      paper: '#1e293b',
      elevated: '#334155',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      disabled: '#64748b',
      inverse: '#0f172a',
    },
    border: {
      light: '#334155',
      main: '#475569',
      dark: '#64748b',
    },
  },
};
