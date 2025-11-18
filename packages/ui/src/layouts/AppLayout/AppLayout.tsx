/**
 * App Layout Component
 * Base layout component với header, sidebar, content, footer
 */

import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import type { LayoutConfig } from '../../theme/types';
import { defaultLayout } from '../../theme/layouts';

export interface AppLayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  config?: Partial<LayoutConfig>;
  className?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  header,
  sidebar,
  footer,
  config = {},
  className,
}) => {
  const layoutConfig = { ...defaultLayout, ...config };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    layoutConfig.sidebar.defaultCollapsed
  );

  const toggleSidebar = () => {
    if (layoutConfig.sidebar.collapsible) {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const hasSidebar = sidebar && layoutConfig.sidebar.width !== '0px';

  return (
    <div className={cn('min-h-screen flex flex-col bg-background-main', className)}>
      {/* Header */}
      {header && (
        <header
          className={cn(
            'flex-shrink-0 z-40',
            layoutConfig.header.sticky && 'sticky top-0',
            layoutConfig.header.transparent ? 'bg-transparent' : 'bg-white border-b border-border-main'
          )}
          style={{ height: layoutConfig.header.height }}
        >
          {React.isValidElement(header)
            ? React.cloneElement(header as React.ReactElement, {
                onToggleSidebar: toggleSidebar,
                isSidebarCollapsed,
              })
            : header}
        </header>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {hasSidebar && (
          <aside
            className={cn(
              'flex-shrink-0 bg-white border-r border-border-main transition-all duration-300',
              layoutConfig.sidebar.position === 'right' && 'order-2'
            )}
            style={{
              width: isSidebarCollapsed ? '0' : layoutConfig.sidebar.width,
              overflow: isSidebarCollapsed ? 'hidden' : 'auto',
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div
            className="mx-auto h-full"
            style={{
              maxWidth: layoutConfig.container.maxWidth,
              padding: layoutConfig.container.padding,
            }}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {footer && (
        <footer
          className={cn(
            'flex-shrink-0 bg-white border-t border-border-main',
            layoutConfig.footer.sticky && 'sticky bottom-0'
          )}
          style={{ minHeight: layoutConfig.footer.height }}
        >
          {footer}
        </footer>
      )}
    </div>
  );
};

AppLayout.displayName = 'AppLayout';
