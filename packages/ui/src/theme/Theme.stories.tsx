import type { Meta, StoryObj } from '@storybook/react';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { themePresets } from './presets';
import { Button } from '../components/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';

const meta: Meta = {
  title: 'Theme/Theme System',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;

const ThemeShowcase = () => {
  const { theme, themeName, setTheme } = useTheme();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Theme: {themeName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(themePresets).map((key) => (
              <Button
                key={key}
                variant={themeName === key ? 'primary' : 'outline'}
                onClick={() => setTheme(key)}
              >
                {themePresets[key].name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Primary Colors</h4>
              <div className="flex gap-1">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                  <div
                    key={shade}
                    className={`w-8 h-8 rounded bg-primary-${shade}`}
                    title={`primary-${shade}`}
                  />
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Secondary Colors</h4>
              <div className="flex gap-1">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((shade) => (
                  <div
                    key={shade}
                    className={`w-8 h-8 rounded bg-secondary-${shade}`}
                    title={`secondary-${shade}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Components with Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="error">Error</Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <Badge variant="primary">Primary</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ThemeDemo: StoryObj = {
  render: () => (
    <ThemeProvider defaultTheme="default">
      <ThemeShowcase />
    </ThemeProvider>
  ),
};

export const DefaultTheme: StoryObj = {
  render: () => (
    <ThemeProvider defaultTheme="default">
      <Card>
        <CardHeader>
          <CardTitle>Default Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Blue professional theme for business applications.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="primary">Primary Button</Button>
            <Badge variant="primary">Badge</Badge>
          </div>
        </CardContent>
      </Card>
    </ThemeProvider>
  ),
};

export const OceanTheme: StoryObj = {
  render: () => (
    <ThemeProvider defaultTheme="ocean">
      <Card>
        <CardHeader>
          <CardTitle>Ocean Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Teal and cyan theme inspired by the ocean.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="primary">Primary Button</Button>
            <Badge variant="primary">Badge</Badge>
          </div>
        </CardContent>
      </Card>
    </ThemeProvider>
  ),
};

export const ForestTheme: StoryObj = {
  render: () => (
    <ThemeProvider defaultTheme="forest">
      <Card>
        <CardHeader>
          <CardTitle>Forest Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Green and emerald theme inspired by nature.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="primary">Primary Button</Button>
            <Badge variant="primary">Badge</Badge>
          </div>
        </CardContent>
      </Card>
    </ThemeProvider>
  ),
};

export const SunsetTheme: StoryObj = {
  render: () => (
    <ThemeProvider defaultTheme="sunset">
      <Card>
        <CardHeader>
          <CardTitle>Sunset Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Orange and rose theme inspired by sunset.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="primary">Primary Button</Button>
            <Badge variant="primary">Badge</Badge>
          </div>
        </CardContent>
      </Card>
    </ThemeProvider>
  ),
};

export const MidnightTheme: StoryObj = {
  render: () => (
    <ThemeProvider defaultTheme="midnight">
      <Card>
        <CardHeader>
          <CardTitle>Midnight Theme</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dark theme with purple accents for night mode.</p>
          <div className="mt-4 flex gap-2">
            <Button variant="primary">Primary Button</Button>
            <Badge variant="primary">Badge</Badge>
          </div>
        </CardContent>
      </Card>
    </ThemeProvider>
  ),
};
