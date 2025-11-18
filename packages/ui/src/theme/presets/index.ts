/**
 * Theme Presets
 * Tập hợp các theme có sẵn cho khách hàng lựa chọn
 */

export { defaultTheme } from './default';
export { oceanTheme } from './ocean';
export { forestTheme } from './forest';
export { sunsetTheme } from './sunset';
export { midnightTheme } from './midnight';
export { minimalTheme } from './minimal';

import type { Theme } from '../types';
import { defaultTheme } from './default';
import { oceanTheme } from './ocean';
import { forestTheme } from './forest';
import { sunsetTheme } from './sunset';
import { midnightTheme } from './midnight';
import { minimalTheme } from './minimal';

export const themePresets: Record<string, Theme> = {
  default: defaultTheme,
  ocean: oceanTheme,
  forest: forestTheme,
  sunset: sunsetTheme,
  midnight: midnightTheme,
  minimal: minimalTheme,
};
