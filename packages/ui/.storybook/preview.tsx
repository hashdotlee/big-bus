import type { Preview } from '@storybook/react';
import React from 'react';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { themePresets } from '../src/theme/presets';
import '../src/styles/globals.css';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#1e293b',
        },
      ],
    },
  },
  decorators: [
    (Story, context) => {
      const themeName = context.globals.theme || 'default';

      return (
        <ThemeProvider defaultTheme={themeName}>
          <div className="p-4">
            <Story />
          </div>
        </ThemeProvider>
      );
    },
  ],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'default',
      toolbar: {
        icon: 'paintbrush',
        items: Object.keys(themePresets).map((key) => ({
          value: key,
          title: themePresets[key].name,
        })),
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
