/**
 * Theme System Types
 * Định nghĩa các types cho theme system có thể customize
 */

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ThemeColors {
  primary: ColorScale;
  secondary?: ColorScale;
  success: ColorScale;
  warning: ColorScale;
  error: ColorScale;
  info: ColorScale;
  neutral: ColorScale;
  background: {
    main: string;
    paper: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    light: string;
    main: string;
    dark: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    '5xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface ThemeSpacing {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  56: string;
  64: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  full: string;
}

export interface ThemeShadows {
  xs: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

export interface ThemeBreakpoints {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
}

export interface ThemeTransition {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  timing: {
    ease: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
  };
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  breakpoints: ThemeBreakpoints;
  transition: ThemeTransition;
}

export interface ThemeConfig {
  defaultTheme: string;
  themes: Record<string, Theme>;
}

/**
 * Layout configuration types
 */
export type LayoutType = 'default' | 'compact' | 'wide' | 'minimal';

export interface LayoutConfig {
  type: LayoutType;
  header: {
    height: string;
    sticky: boolean;
    transparent: boolean;
  };
  sidebar: {
    width: string;
    collapsible: boolean;
    defaultCollapsed: boolean;
    position: 'left' | 'right';
  };
  footer: {
    height: string;
    sticky: boolean;
  };
  container: {
    maxWidth: string;
    padding: string;
  };
}

/**
 * Theme customization options
 */
export interface ThemeCustomization {
  colors?: Partial<ThemeColors>;
  typography?: Partial<ThemeTypography>;
  spacing?: Partial<ThemeSpacing>;
  borderRadius?: Partial<ThemeBorderRadius>;
  shadows?: Partial<ThemeShadows>;
  layout?: Partial<LayoutConfig>;
}

/**
 * Theme preset types
 */
export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset' | 'midnight' | 'minimal';
