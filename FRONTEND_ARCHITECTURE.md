# Big Bus - Frontend Architecture

Tài liệu này mô tả kiến trúc frontend mới với design system, theme customization, và feature-based component structure.

## 📁 Cấu trúc Project

```
big-bus/
├── apps/
│   ├── web/                      # Storefront (Trang bán hàng)
│   │   └── src/
│   │       ├── app/              # Next.js App Router
│   │       ├── components/       # Shared components
│   │       ├── features/         # Feature-based modules
│   │       │   ├── auth/         # Authentication feature
│   │       │   │   ├── components/
│   │       │   │   ├── hooks/
│   │       │   │   ├── types/
│   │       │   │   └── utils/
│   │       │   ├── booking/      # Booking feature
│   │       │   ├── search/       # Search feature
│   │       │   └── schedule/     # Schedule feature
│   │       ├── hooks/            # Global hooks
│   │       └── store/            # Zustand stores
│   │
│   └── admin/                    # Admin Dashboard
│       └── src/
│           ├── app/
│           ├── components/
│           ├── features/         # Feature-based modules
│           │   ├── vehicles/     # Vehicle management
│           │   ├── bookings/     # Booking management
│           │   ├── routes/       # Route management
│           │   ├── finance/      # Financial reports
│           │   ├── reports/      # Analytics & reports
│           │   └── settings/     # Settings & customization
│           ├── hooks/
│           └── store/
│
└── packages/
    └── ui/                       # Shared UI Design System
        ├── src/
        │   ├── components/       # Base components
        │   │   ├── Button/
        │   │   ├── Card/
        │   │   ├── Input/
        │   │   ├── Select/
        │   │   ├── Badge/
        │   │   ├── Modal/
        │   │   └── Table/
        │   ├── theme/            # Theme system
        │   │   ├── presets/      # Theme presets
        │   │   │   ├── default.ts
        │   │   │   ├── ocean.ts
        │   │   │   ├── forest.ts
        │   │   │   ├── sunset.ts
        │   │   │   ├── midnight.ts
        │   │   │   └── minimal.ts
        │   │   ├── types.ts
        │   │   ├── ThemeProvider.tsx
        │   │   ├── utils.ts
        │   │   └── layouts.ts
        │   ├── layouts/          # Layout components
        │   │   ├── AppLayout/
        │   │   ├── StorefrontLayout/
        │   │   └── AdminLayout/
        │   ├── hooks/
        │   ├── utils/
        │   └── styles/
        │       └── globals.css
        └── .storybook/           # Storybook config
```

## 🎨 Design System (@big-bus/ui)

### Tính năng chính

1. **Theme System với 6 presets**:
   - `default` - Blue professional
   - `ocean` - Teal & Cyan
   - `forest` - Green & Emerald
   - `sunset` - Orange & Rose
   - `midnight` - Purple & Dark (Night mode)
   - `minimal` - Monochrome

2. **Component Library**:
   - Button, Card, Input, Select
   - Modal, Table, Badge
   - Tất cả đều responsive và accessible

3. **Layout System**:
   - AppLayout - Base layout
   - StorefrontLayout - Cho web app
   - AdminLayout - Cho admin dashboard

4. **Customization API**:
   - Theme switching runtime
   - Custom theme creation
   - Layout configuration
   - CSS Variables

### Setup trong App

#### 1. Import Global Styles

```tsx
// apps/web/src/app/layout.tsx hoặc apps/admin/src/app/layout.tsx
import '@big-bus/ui/src/styles/globals.css';
```

#### 2. Wrap với ThemeProvider

```tsx
import { ThemeProvider } from '@big-bus/ui';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="default">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 3. Sử dụng Components

```tsx
import { Button, Card, CardHeader, CardTitle } from '@big-bus/ui';

function MyPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello</CardTitle>
      </CardHeader>
      <Button variant="primary">Click me</Button>
    </Card>
  );
}
```

## 🧩 Feature-Based Architecture

### Nguyên tắc tổ chức

Mỗi feature là một module độc lập với:

```
feature-name/
├── components/        # React components cho feature này
├── hooks/            # Custom hooks
├── types/            # TypeScript types
└── utils/            # Utility functions
```

### Web App Features

#### 1. Authentication (`features/auth`)

**Components**:
- `LoginForm` - Form đăng nhập
- `RegisterForm` - Form đăng ký

```tsx
import { LoginForm } from '@/features/auth/components';

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm />
    </div>
  );
}
```

#### 2. Booking (`features/booking`)

**Components**:
- `BookingCard` - Hiển thị booking info

```tsx
import { BookingCard } from '@/features/booking/components';

function MyBookings() {
  const bookings = [...]; // từ API

  return (
    <div className="grid gap-4">
      {bookings.map(booking => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onViewDetails={handleView}
          onCancel={handleCancel}
        />
      ))}
    </div>
  );
}
```

#### 3. Search (`features/search`)

**Components**:
- `SearchForm` - Form tìm kiếm chuyến xe

```tsx
import { SearchForm } from '@/features/search/components';

function HomePage() {
  const handleSearch = (data) => {
    // Navigate to search results
    router.push(`/search?from=${data.from}&to=${data.to}...`);
  };

  return <SearchForm onSearch={handleSearch} />;
}
```

### Admin Features

#### 1. Vehicles (`features/vehicles`)

**Components**:
- `VehicleTable` - Bảng danh sách xe
- `VehicleForm` - Form thêm/sửa xe

```tsx
import { VehicleTable, VehicleForm } from '@/features/vehicles/components';

function VehiclesPage() {
  return (
    <>
      <VehicleTable
        vehicles={vehicles}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <VehicleForm
        drivers={drivers}
        onSubmit={handleSubmit}
      />
    </>
  );
}
```

#### 2. Reports (`features/reports`)

**Components**:
- `RevenueChart` - Biểu đồ doanh thu
- `StatsCard` - Card hiển thị thống kê

```tsx
import { RevenueChart, StatsCard } from '@/features/reports/components';
import { DollarSign, Users, Bus } from 'lucide-react';

function DashboardPage() {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-3 gap-4">
        <StatsCard
          title="Total Revenue"
          value="$45,678"
          change={12}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Users"
          value="1,234"
          change={8}
          icon={Users}
        />
        <StatsCard
          title="Active Buses"
          value="24"
          change={-3}
          icon={Bus}
        />
      </div>
      <RevenueChart data={revenueData} />
    </div>
  );
}
```

#### 3. Settings (`features/settings`)

**Components**:
- `ThemeSettings` - Tùy chỉnh theme

```tsx
import { ThemeSettings } from '@/features/settings/components';

function SettingsPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <ThemeSettings />
    </div>
  );
}
```

## 🎨 Theme Customization

### Switching Themes

```tsx
import { useTheme } from '@big-bus/ui';

function ThemeSelector() {
  const { themeName, setTheme } = useTheme();

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

### Creating Custom Theme

```tsx
import { ThemeProvider, createCustomTheme } from '@big-bus/ui';

const myBrandTheme = createCustomTheme(
  'mybrand',
  '#FF6B6B', // Primary color
  '#4ECDC4'  // Secondary color
);

function App() {
  return (
    <ThemeProvider
      defaultTheme="mybrand"
      customThemes={{ mybrand: myBrandTheme }}
    >
      {/* Your app */}
    </ThemeProvider>
  );
}
```

### Runtime Theme Customization

```tsx
import { useTheme } from '@big-bus/ui';

function CustomizeButton() {
  const { customizeTheme } = useTheme();

  const applyCustomColors = () => {
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

  return <button onClick={applyCustomColors}>Apply Custom Colors</button>;
}
```

## 📐 Layout Customization

### Using Layouts

```tsx
import { StorefrontLayout } from '@big-bus/ui';

function WebApp() {
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

### Custom Layout Configuration

```tsx
import { AdminLayout } from '@big-bus/ui';

function AdminApp() {
  return (
    <AdminLayout
      header={<AdminHeader />}
      sidebar={<AdminSidebar />}
      footer={<AdminFooter />}
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
      {/* Admin pages */}
    </AdminLayout>
  );
}
```

## 📚 Storybook

Xem documentation và test components interactively:

```bash
cd packages/ui
pnpm dev
```

Mở browser tại `http://localhost:6006`

Features:
- Live theme switching
- Interactive component playground
- Props documentation
- Accessibility testing

## 🚀 Development Workflow

### 1. Tạo Component mới trong Feature

```bash
# Ví dụ: Tạo PaymentForm trong booking feature
mkdir -p apps/web/src/features/booking/components
touch apps/web/src/features/booking/components/PaymentForm.tsx
```

```tsx
// PaymentForm.tsx
'use client';

import { Button, Input, Card } from '@big-bus/ui';

export const PaymentForm = ({ onSubmit }) => {
  // Component logic
  return (
    <Card>
      {/* Form UI */}
    </Card>
  );
};
```

### 2. Tạo Base Component mới trong UI Package

```bash
mkdir -p packages/ui/src/components/Checkbox
touch packages/ui/src/components/Checkbox/Checkbox.tsx
touch packages/ui/src/components/Checkbox/Checkbox.stories.tsx
touch packages/ui/src/components/Checkbox/index.ts
```

```tsx
// Checkbox.tsx
export const Checkbox = ({ ... }) => {
  // Component logic
};

// Checkbox.stories.tsx
export default {
  title: 'Components/Checkbox',
  component: Checkbox,
};

// index.ts
export { Checkbox } from './Checkbox';
```

### 3. Thêm Component vào exports

```tsx
// packages/ui/src/components/index.ts
export * from './Checkbox';
```

## 🔧 Configuration Files

### Next.js Config

```js
// apps/web/next.config.js hoặc apps/admin/next.config.js
module.exports = {
  reactStrictMode: true,
  transpilePackages: ['@big-bus/api-client', '@big-bus/types', '@big-bus/ui'],
};
```

### Tailwind Config

```js
// apps/web/tailwind.config.js hoặc apps/admin/tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ...
};
```

### Package.json

```json
{
  "dependencies": {
    "@big-bus/ui": "*",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.303.0"
  }
}
```

## 🎯 Best Practices

### 1. Component Organization

- ✅ **DO**: Tạo components trong feature folder nếu chỉ dùng cho feature đó
- ✅ **DO**: Tạo trong `@big-bus/ui` nếu component có thể reuse
- ❌ **DON'T**: Duplicate components giữa features

### 2. Styling

- ✅ **DO**: Sử dụng Tailwind classes
- ✅ **DO**: Sử dụng theme colors (`bg-primary-600`)
- ✅ **DO**: Sử dụng `cn()` utility để merge classes
- ❌ **DON'T**: Hardcode colors

### 3. Theme Usage

- ✅ **DO**: Persist theme selection trong localStorage
- ✅ **DO**: Sử dụng CSS variables cho dynamic theming
- ✅ **DO**: Test components với multiple themes
- ❌ **DON'T**: Override theme colors inline

### 4. Feature Structure

- ✅ **DO**: Keep features independent
- ✅ **DO**: Export components through index files
- ✅ **DO**: Co-locate related files
- ❌ **DON'T**: Cross-import between features

## 📦 Package Development

### Tạo Theme Package mới

1. Tạo theme preset trong `packages/ui/src/theme/presets/`:

```tsx
// custom.ts
export const customTheme: Theme = {
  ...defaultTheme,
  name: 'custom',
  colors: {
    // Your custom colors
  },
};
```

2. Export trong `presets/index.ts`:

```tsx
export { customTheme } from './custom';
export const themePresets = {
  // ...existing
  custom: customTheme,
};
```

### Tạo Layout Package mới

1. Tạo layout config trong `packages/ui/src/theme/layouts.ts`:

```tsx
export const customLayout: LayoutConfig = {
  type: 'custom',
  header: { ... },
  sidebar: { ... },
  footer: { ... },
  container: { ... },
};
```

2. Tạo Layout component trong `packages/ui/src/layouts/`:

```tsx
export const CustomLayout = ({ ...props }) => {
  return <AppLayout config={customLayout} {...props} />;
};
```

## 🧪 Testing

### Component Testing

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@big-bus/ui';
import { LoginForm } from './LoginForm';

test('renders login form', () => {
  render(
    <ThemeProvider defaultTheme="default">
      <LoginForm />
    </ThemeProvider>
  );

  expect(screen.getByLabelText('Email')).toBeInTheDocument();
});
```

### Theme Testing

```tsx
test('switches theme correctly', () => {
  const { rerender } = render(
    <ThemeProvider defaultTheme="default">
      <MyComponent />
    </ThemeProvider>
  );

  // Verify default theme
  expect(getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary-600'))
    .toBe('#2563eb');

  // Switch theme
  rerender(
    <ThemeProvider defaultTheme="ocean">
      <MyComponent />
    </ThemeProvider>
  );

  // Verify ocean theme
  expect(getComputedStyle(document.documentElement)
    .getPropertyValue('--color-primary-600'))
    .toBe('#0d9488');
});
```

## 🚢 Deployment

### Build Process

```bash
# Build all packages and apps
pnpm build

# Build specific app
cd apps/web && pnpm build
cd apps/admin && pnpm build

# Build Storybook
cd packages/ui && pnpm build-storybook
```

### Environment Variables

```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=https://api.bigbus.com

# apps/admin/.env.local
NEXT_PUBLIC_API_URL=https://api.bigbus.com
```

## 📖 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Storybook Documentation](https://storybook.js.org/docs)
- [@big-bus/ui README](./packages/ui/README.md)

## 🤝 Contributing

### Adding New Features

1. Create feature folder với proper structure
2. Implement components using design system
3. Add Storybook stories nếu là base component
4. Update documentation
5. Test với multiple themes

### Adding New Themes

1. Create theme preset file
2. Export trong presets/index.ts
3. Add to Storybook theme switcher
4. Document theme purpose và use cases

## 📝 Migration Guide

### Migrating từ old components sang new architecture

1. **Identify component type**:
   - Feature-specific → Move to feature folder
   - Reusable → Move/use from @big-bus/ui

2. **Update imports**:
   ```tsx
   // Old
   import Button from '@/components/ui/Button';

   // New
   import { Button } from '@big-bus/ui';
   ```

3. **Apply theme support**:
   - Replace hardcoded colors với theme colors
   - Test với multiple themes

4. **Update styling**:
   - Use `cn()` utility
   - Follow design system conventions

## 🎉 Kết luận

Architecture mới này cung cấp:

✅ Scalable component organization
✅ Powerful theme customization
✅ Reusable design system
✅ Feature-based structure
✅ Comprehensive documentation
✅ Type-safe development

Hãy tận dụng các tính năng này để xây dựng ứng dụng hiện đại, dễ maintain và customize!
