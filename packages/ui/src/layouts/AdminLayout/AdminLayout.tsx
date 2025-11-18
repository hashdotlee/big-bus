/**
 * Admin Layout Component
 * Layout cho trang admin
 */

import React from 'react';
import { AppLayout, type AppLayoutProps } from '../AppLayout';
import { adminLayout } from '../../theme/layouts';

export interface AdminLayoutProps extends Omit<AppLayoutProps, 'config'> {
  config?: AppLayoutProps['config'];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  config,
  ...props
}) => {
  const mergedConfig = { ...adminLayout, ...config };

  return <AppLayout config={mergedConfig} {...props} />;
};

AdminLayout.displayName = 'AdminLayout';
