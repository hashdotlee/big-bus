/**
 * Layout Configurations
 * Các cấu hình layout khác nhau cho storefront và admin
 */

import type { LayoutConfig } from './types';

/**
 * Default Layout - Standard layout với header, sidebar, content
 */
export const defaultLayout: LayoutConfig = {
  type: 'default',
  header: {
    height: '64px',
    sticky: true,
    transparent: false,
  },
  sidebar: {
    width: '256px',
    collapsible: true,
    defaultCollapsed: false,
    position: 'left',
  },
  footer: {
    height: '80px',
    sticky: false,
  },
  container: {
    maxWidth: '1280px',
    padding: '1rem',
  },
};

/**
 * Compact Layout - Layout nhỏ gọn cho mobile
 */
export const compactLayout: LayoutConfig = {
  type: 'compact',
  header: {
    height: '56px',
    sticky: true,
    transparent: false,
  },
  sidebar: {
    width: '200px',
    collapsible: true,
    defaultCollapsed: true,
    position: 'left',
  },
  footer: {
    height: '60px',
    sticky: false,
  },
  container: {
    maxWidth: '100%',
    padding: '0.75rem',
  },
};

/**
 * Wide Layout - Layout rộng cho admin dashboard
 */
export const wideLayout: LayoutConfig = {
  type: 'wide',
  header: {
    height: '72px',
    sticky: true,
    transparent: false,
  },
  sidebar: {
    width: '280px',
    collapsible: true,
    defaultCollapsed: false,
    position: 'left',
  },
  footer: {
    height: '100px',
    sticky: false,
  },
  container: {
    maxWidth: '1920px',
    padding: '2rem',
  },
};

/**
 * Minimal Layout - Layout tối giản không có sidebar
 */
export const minimalLayout: LayoutConfig = {
  type: 'minimal',
  header: {
    height: '64px',
    sticky: true,
    transparent: true,
  },
  sidebar: {
    width: '0px',
    collapsible: false,
    defaultCollapsed: true,
    position: 'left',
  },
  footer: {
    height: '60px',
    sticky: false,
  },
  container: {
    maxWidth: '1024px',
    padding: '1rem',
  },
};

/**
 * Storefront Layout - Layout cho trang bán hàng
 */
export const storefrontLayout: LayoutConfig = {
  type: 'default',
  header: {
    height: '80px',
    sticky: true,
    transparent: false,
  },
  sidebar: {
    width: '0px',
    collapsible: false,
    defaultCollapsed: true,
    position: 'left',
  },
  footer: {
    height: '200px',
    sticky: false,
  },
  container: {
    maxWidth: '1440px',
    padding: '1.5rem',
  },
};

/**
 * Admin Layout - Layout cho trang admin
 */
export const adminLayout: LayoutConfig = {
  type: 'default',
  header: {
    height: '64px',
    sticky: true,
    transparent: false,
  },
  sidebar: {
    width: '256px',
    collapsible: true,
    defaultCollapsed: false,
    position: 'left',
  },
  footer: {
    height: '48px',
    sticky: false,
  },
  container: {
    maxWidth: '100%',
    padding: '1.5rem',
  },
};

/**
 * All layout presets
 */
export const layoutPresets: Record<string, LayoutConfig> = {
  default: defaultLayout,
  compact: compactLayout,
  wide: wideLayout,
  minimal: minimalLayout,
  storefront: storefrontLayout,
  admin: adminLayout,
};
