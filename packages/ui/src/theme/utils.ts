/**
 * Theme Utilities
 * Các hàm tiện ích để làm việc với theme
 */

import type { Theme, ThemeCustomization } from './types';

/**
 * Deep merge two objects
 */
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        result[key] || ({} as any),
        source[key] as any
      );
    } else if (source[key] !== undefined) {
      result[key] = source[key] as any;
    }
  }

  return result;
}

/**
 * Merge theme with customization
 */
export function mergeTheme(baseTheme: Theme, customization: ThemeCustomization): Theme {
  return {
    ...baseTheme,
    colors: customization.colors
      ? deepMerge(baseTheme.colors, customization.colors)
      : baseTheme.colors,
    typography: customization.typography
      ? deepMerge(baseTheme.typography, customization.typography)
      : baseTheme.typography,
    spacing: customization.spacing
      ? deepMerge(baseTheme.spacing, customization.spacing)
      : baseTheme.spacing,
    borderRadius: customization.borderRadius
      ? deepMerge(baseTheme.borderRadius, customization.borderRadius)
      : baseTheme.borderRadius,
    shadows: customization.shadows
      ? deepMerge(baseTheme.shadows, customization.shadows)
      : baseTheme.shadows,
  };
}

/**
 * Generate CSS variables from theme
 */
export function generateCSSVariables(theme: Theme): Record<string, string> {
  const variables: Record<string, string> = {};

  // Primary colors
  Object.entries(theme.colors.primary).forEach(([key, value]) => {
    variables[`--color-primary-${key}`] = value;
  });

  // Secondary colors
  if (theme.colors.secondary) {
    Object.entries(theme.colors.secondary).forEach(([key, value]) => {
      variables[`--color-secondary-${key}`] = value;
    });
  }

  // Success colors
  Object.entries(theme.colors.success).forEach(([key, value]) => {
    variables[`--color-success-${key}`] = value;
  });

  // Warning colors
  Object.entries(theme.colors.warning).forEach(([key, value]) => {
    variables[`--color-warning-${key}`] = value;
  });

  // Error colors
  Object.entries(theme.colors.error).forEach(([key, value]) => {
    variables[`--color-error-${key}`] = value;
  });

  // Info colors
  Object.entries(theme.colors.info).forEach(([key, value]) => {
    variables[`--color-info-${key}`] = value;
  });

  // Neutral colors
  Object.entries(theme.colors.neutral).forEach(([key, value]) => {
    variables[`--color-neutral-${key}`] = value;
  });

  // Background colors
  variables['--color-background-main'] = theme.colors.background.main;
  variables['--color-background-paper'] = theme.colors.background.paper;
  variables['--color-background-elevated'] = theme.colors.background.elevated;

  // Text colors
  variables['--color-text-primary'] = theme.colors.text.primary;
  variables['--color-text-secondary'] = theme.colors.text.secondary;
  variables['--color-text-disabled'] = theme.colors.text.disabled;
  variables['--color-text-inverse'] = theme.colors.text.inverse;

  // Border colors
  variables['--color-border-light'] = theme.colors.border.light;
  variables['--color-border-main'] = theme.colors.border.main;
  variables['--color-border-dark'] = theme.colors.border.dark;

  // Typography
  variables['--font-sans'] = theme.typography.fontFamily.sans.join(', ');
  variables['--font-serif'] = theme.typography.fontFamily.serif.join(', ');
  variables['--font-mono'] = theme.typography.fontFamily.mono.join(', ');

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    variables[`--spacing-${key}`] = value;
  });

  // Border radius
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    variables[`--radius-${key}`] = value;
  });

  // Shadows
  Object.entries(theme.shadows).forEach(([key, value]) => {
    variables[`--shadow-${key}`] = value;
  });

  return variables;
}

/**
 * Convert hex color to RGB
 */
export function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Get contrast color (black or white) for a given background color
 */
export function getContrastColor(backgroundColor: string): string {
  const rgb = hexToRGB(backgroundColor);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * Generate color scale from base color
 */
export function generateColorScale(baseColor: string): Record<number, string> {
  // This is a simplified version - in production, use a library like chroma-js
  const rgb = hexToRGB(baseColor);

  const scale: Record<number, string> = {
    500: baseColor,
  };

  // Generate lighter shades
  for (let i = 1; i <= 4; i++) {
    const factor = i * 0.15;
    scale[500 - i * 100] = `rgb(${Math.min(255, rgb.r + (255 - rgb.r) * factor)}, ${Math.min(255, rgb.g + (255 - rgb.g) * factor)}, ${Math.min(255, rgb.b + (255 - rgb.b) * factor)})`;
  }

  // Add 50
  scale[50] = `rgb(${Math.min(255, rgb.r + (255 - rgb.r) * 0.7)}, ${Math.min(255, rgb.g + (255 - rgb.g) * 0.7)}, ${Math.min(255, rgb.b + (255 - rgb.b) * 0.7)})`;

  // Generate darker shades
  for (let i = 1; i <= 4; i++) {
    const factor = i * 0.15;
    scale[500 + i * 100] = `rgb(${Math.max(0, rgb.r * (1 - factor))}, ${Math.max(0, rgb.g * (1 - factor))}, ${Math.max(0, rgb.b * (1 - factor))})`;
  }

  // Add 950
  scale[950] = `rgb(${Math.max(0, rgb.r * 0.1)}, ${Math.max(0, rgb.g * 0.1)}, ${Math.max(0, rgb.b * 0.1)})`;

  return scale;
}

/**
 * Create a custom theme from brand colors
 */
export function createCustomTheme(
  name: string,
  primaryColor: string,
  secondaryColor?: string
): Theme {
  const { defaultTheme } = require('./presets/default');

  return {
    ...defaultTheme,
    name,
    colors: {
      ...defaultTheme.colors,
      primary: generateColorScale(primaryColor) as any,
      ...(secondaryColor && {
        secondary: generateColorScale(secondaryColor) as any,
      }),
    },
  };
}
