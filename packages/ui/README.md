# @big-bus/ui

Shared UI components và design system cho Big Bus platform.

## Tính năng

### 🎨 Theme System
- **6 theme presets**: Default, Ocean, Forest, Sunset, Midnight, Minimal
- **Customizable colors**: Dễ dàng tùy chỉnh màu sắc theo brand
- **CSS Variables**: Hỗ trợ runtime theme switching
- **Type-safe**: Đầy đủ TypeScript definitions

### 🧩 Component Library
- Button với nhiều variants và sizes
- Card với compound components
- Form inputs (Input, Select)
- Modal dialogs
- Table với responsive design
- Badge và status indicators

### 📐 Layout System
- AppLayout - Base layout có thể customize
- StorefrontLayout - Layout cho trang bán hàng
- AdminLayout - Layout cho trang quản trị
- Responsive và flexible

### 📚 Storybook Documentation
- Interactive component documentation
- Live theme switching
- Component variants showcase

## Cài đặt

Package này là một phần của monorepo và được cài đặt tự động khi chạy:

```bash
pnpm install
```

## Sử dụng

### 1. Setup ThemeProvider

Wrap ứng dụng của bạn với `ThemeProvider`:

```tsx
import { ThemeProvider } from '@big-bus/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="default">
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 2. Import CSS Globals

Import global styles trong entry point của bạn:

```tsx
import '@big-bus/ui/src/styles/globals.css';
```

### 3. Sử dụng Components

```tsx
import { Button, Card, CardHeader, CardTitle, CardContent } from '@big-bus/ui';

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
      </CardHeader>
      <CardContent>
        <p>This is a card component.</p>
        <Button variant="primary">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

### 4. Sử dụng Theme Hook

```tsx
import { useTheme } from '@big-bus/ui';

function ThemeSelector() {
  const { theme, themeName, setTheme } = useTheme();

  return (
    <select value={themeName} onChange={(e) => setTheme(e.target.value)}>
      <option value="default">Default</option>
      <option value="ocean">Ocean</option>
      <option value="forest">Forest</option>
      <option value="sunset">Sunset</option>
      <option value="midnight">Midnight</option>
      <option value="minimal">Minimal</option>
    </select>
  );
}
```

### 5. Customize Theme

```tsx
import { ThemeProvider, createCustomTheme } from '@big-bus/ui';

const myTheme = createCustomTheme('mybrand', '#FF6B6B', '#4ECDC4');

function App() {
  return (
    <ThemeProvider
      defaultTheme="mybrand"
      customThemes={{ mybrand: myTheme }}
    >
      {/* Your app content */}
    </ThemeProvider>
  );
}
```

### 6. Sử dụng Layouts

#### Storefront Layout

```tsx
import { StorefrontLayout } from '@big-bus/ui';

function StorefrontApp() {
  return (
    <StorefrontLayout
      header={<Header />}
      footer={<Footer />}
    >
      {/* Page content */}
    </StorefrontLayout>
  );
}
```

#### Admin Layout

```tsx
import { AdminLayout } from '@big-bus/ui';

function AdminApp() {
  return (
    <AdminLayout
      header={<AdminHeader />}
      sidebar={<AdminSidebar />}
      footer={<AdminFooter />}
    >
      {/* Page content */}
    </AdminLayout>
  );
}
```

## Theme Presets

### Default (Blue)
Professional blue theme cho business applications.

### Ocean (Teal/Cyan)
Theme biển cả với màu xanh ngọc và xanh dương nhạt.

### Forest (Green/Emerald)
Theme rừng xanh với màu xanh lá và emerald.

### Sunset (Orange/Rose)
Theme hoàng hôn với màu cam và hồng.

### Midnight (Purple/Dark)
Dark theme với màu tím cho night mode.

### Minimal (Monochrome)
Theme tối giản với màu đơn sắc.

## Customization API

### Theme Customization

```tsx
import { useTheme } from '@big-bus/ui';

function MyComponent() {
  const { customizeTheme } = useTheme();

  const applyBrandColors = () => {
    customizeTheme({
      colors: {
        primary: {
          500: '#FF6B6B',
          600: '#FF5252',
          // ... other shades
        }
      }
    });
  };

  return <Button onClick={applyBrandColors}>Apply Brand Colors</Button>;
}
```

### Layout Customization

```tsx
<AdminLayout
  config={{
    header: {
      height: '80px',
      sticky: true,
    },
    sidebar: {
      width: '300px',
      collapsible: true,
      defaultCollapsed: false,
    },
    container: {
      maxWidth: '1920px',
      padding: '2rem',
    }
  }}
>
  {/* Content */}
</AdminLayout>
```

## Storybook

Xem component documentation và interactive examples:

```bash
cd packages/ui
pnpm dev
```

Storybook sẽ mở tại `http://localhost:6006`

## Build Storybook

Build static Storybook documentation:

```bash
pnpm build-storybook
```

## Component API

### Button

Props:
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `fullWidth`: boolean
- `loading`: boolean
- `leftIcon`, `rightIcon`: React.ReactNode

### Card

Components:
- `Card` - Container
- `CardHeader` - Header section
- `CardTitle` - Title heading
- `CardDescription` - Description text
- `CardContent` - Main content
- `CardFooter` - Footer section

### Input

Props:
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`, `rightIcon`: React.ReactNode
- `fullWidth`: boolean

### Select

Props:
- `label`: string
- `error`: string
- `helperText`: string
- `options`: SelectOption[]
- `placeholder`: string
- `fullWidth`: boolean

### Badge

Props:
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
- `size`: 'sm' | 'md' | 'lg'
- `rounded`: boolean
- `dot`: boolean

### Modal

Props:
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `showCloseButton`: boolean
- `closeOnOverlayClick`: boolean
- `closeOnEscape`: boolean

### Table

Components:
- `Table` - Table container
- `TableHeader` - Header section
- `TableBody` - Body section
- `TableRow` - Row
- `TableHead` - Header cell
- `TableCell` - Data cell

## Phát triển thêm Theme

### Tạo Theme Package mới

1. Tạo theme preset mới trong `src/theme/presets/`:

```tsx
// src/theme/presets/custom.ts
import type { Theme } from '../types';
import { defaultTheme } from './default';

export const customTheme: Theme = {
  ...defaultTheme,
  name: 'custom',
  colors: {
    // Customize colors
  },
};
```

2. Export trong `src/theme/presets/index.ts`:

```tsx
export { customTheme } from './custom';
```

3. Thêm vào `themePresets`:

```tsx
export const themePresets: Record<string, Theme> = {
  // ...existing themes
  custom: customTheme,
};
```

### Tạo Layout mới

1. Tạo layout preset trong `src/theme/layouts.ts`:

```tsx
export const customLayout: LayoutConfig = {
  type: 'default',
  header: { height: '64px', sticky: true, transparent: false },
  sidebar: { width: '256px', collapsible: true, defaultCollapsed: false, position: 'left' },
  footer: { height: '80px', sticky: false },
  container: { maxWidth: '1280px', padding: '1rem' },
};
```

2. Thêm vào `layoutPresets`:

```tsx
export const layoutPresets: Record<string, LayoutConfig> = {
  // ...existing layouts
  custom: customLayout,
};
```

## TailwindCSS Integration

Package này sử dụng TailwindCSS với CSS variables cho theming. Khi integrate vào app:

1. Add package vào Tailwind content:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@big-bus/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};
```

2. Import UI package styles:

```tsx
import '@big-bus/ui/src/styles/globals.css';
```

## TypeScript

Package này được build với TypeScript và export đầy đủ type definitions. IDE của bạn sẽ có full autocomplete và type checking.

## License

MIT
