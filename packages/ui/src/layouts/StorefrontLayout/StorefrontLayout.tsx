/**
 * Storefront Layout Component
 * Layout cho trang bán hàng (web app)
 */

import React from 'react';
import { AppLayout, type AppLayoutProps } from '../AppLayout';
import { storefrontLayout } from '../../theme/layouts';

export interface StorefrontLayoutProps extends Omit<AppLayoutProps, 'config'> {
  config?: AppLayoutProps['config'];
}

export const StorefrontLayout: React.FC<StorefrontLayoutProps> = ({
  config,
  ...props
}) => {
  const mergedConfig = { ...storefrontLayout, ...config };

  return <AppLayout config={mergedConfig} {...props} />;
};

StorefrontLayout.displayName = 'StorefrontLayout';
