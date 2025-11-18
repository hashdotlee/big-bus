'use client';

/**
 * Theme Settings Component
 * Feature: Settings - Theme Customization
 */

import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@big-bus/ui';
import { useTheme, themePresets } from '@big-bus/ui';
import { Check } from 'lucide-react';

export const ThemeSettings = () => {
  const { themeName, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Customization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(themePresets).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => setTheme(key)}
              className={`
                relative p-4 border-2 rounded-lg transition-all
                ${themeName === key
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-neutral-200 hover:border-primary-300'
                }
              `}
            >
              {themeName === key && (
                <div className="absolute top-2 right-2">
                  <div className="bg-primary-600 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              )}

              <div className="mb-3">
                <h4 className="font-semibold text-left mb-2">{theme.name}</h4>
                <div className="flex gap-1">
                  {[500, 600, 700].map((shade) => (
                    <div
                      key={shade}
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: theme.colors.primary[shade as keyof typeof theme.colors.primary] }}
                    />
                  ))}
                </div>
              </div>

              {themeName === key && (
                <Badge variant="primary" size="sm">Active</Badge>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-neutral-200">
          <h4 className="font-semibold mb-4">Preview</h4>
          <div className="flex gap-2 flex-wrap">
            <Button variant="primary" size="sm">Primary</Button>
            <Button variant="secondary" size="sm">Secondary</Button>
            <Button variant="success" size="sm">Success</Button>
            <Button variant="warning" size="sm">Warning</Button>
            <Button variant="error" size="sm">Error</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
