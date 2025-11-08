# Big Bus - Customer Web Application

Modern, SEO-optimized web application for Big Bus booking system built with Next.js 14, React 18, TypeScript, and Tailwind CSS.

## 🚀 Features

### Core Features
- ✅ **SEO Optimized**: Server-side rendering, meta tags, sitemap, robots.txt
- ✅ **Responsive Design**: Mobile-first approach with beautiful UI
- ✅ **Route Search**: Advanced search with filters and sorting
- ✅ **Seat Selection**: Interactive bus seat layout selection
- ✅ **Booking Flow**: Complete booking process with passenger info and payment
- ✅ **Authentication**: Login/Register with OAuth support
- ✅ **Dark Mode**: Theme toggle with system preference detection
- ✅ **PWA Ready**: Manifest and service worker support

### Technical Features
- ⚡ **Next.js 14**: App Router, Server Components, Suspense
- 🎨 **Tailwind CSS**: Utility-first CSS framework
- 📱 **Mobile Responsive**: Optimized for all screen sizes
- 🔄 **React Query**: Data fetching and caching
- 🎭 **Framer Motion**: Smooth animations
- 🌐 **Internationalization**: Vietnamese language support
- 🔒 **Security**: CORS, CSP headers, input validation
- 📊 **Analytics**: Google Analytics, GTM integration ready

## 📁 Project Structure

```
apps/web/
├── public/               # Static assets
│   ├── images/          # Images
│   └── icons/           # App icons
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── booking/     # Booking pages
│   │   ├── login/       # Login page
│   │   ├── register/    # Register page
│   │   ├── routes/      # Route search page
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx     # Homepage
│   │   ├── globals.css  # Global styles
│   │   ├── manifest.ts  # PWA manifest
│   │   ├── robots.ts    # Robots.txt
│   │   └── sitemap.ts   # Sitemap
│   ├── components/      # React components
│   │   ├── atoms/       # Basic components (Button, Input, Badge)
│   │   ├── molecules/   # Composite components
│   │   ├── organisms/   # Complex components (Header, Footer)
│   │   └── templates/   # Page templates
│   ├── lib/             # Utilities
│   │   ├── api-client.ts # API client with interceptors
│   │   └── utils.ts      # Helper functions
│   ├── types/           # TypeScript types
│   └── hooks/           # Custom React hooks
├── .env.example         # Environment variables example
├── next.config.js       # Next.js configuration
├── tailwind.config.js   # Tailwind configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies
```

## 🛠️ Setup & Development

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Other Commands

```bash
# Lint code
npm run lint

# Type check
npm run typecheck
```

## 🎨 Design System

### Colors

```css
Primary Blue: #0066CC    /* Main CTA buttons */
Primary Orange: #FF6B35  /* Accent & highlights */
Primary Green: #00A86B   /* Success states */

Secondary Dark: #2C3E50  /* Headers, main text */
Secondary Gray: #7F8C8D  /* Secondary text */
Secondary Light: #ECF0F1 /* Backgrounds */

Status Success: #27AE60
Status Warning: #F39C12
Status Danger: #E74C3C
Status Info: #3498DB
```

### Typography

- Primary: Inter
- Vietnamese: Be Vietnam Pro

### Components

All components follow atomic design principles:

- **Atoms**: Button, Input, Badge, Spinner, Card
- **Molecules**: SearchBar, DatePicker, SeatSelector
- **Organisms**: Header, Footer, Hero, SearchWidget, Features, PopularRoutes

## 🔌 API Integration

The app connects to backend microservices:

- **Auth Service** (Port 3001): Authentication and user management
- **Booking Service** (Port 3002): Routes, schedules, and bookings
- **Payment Service** (Port 3004): Payment processing
- **Analytics Service** (Port 3006): Analytics and tracking

API configuration is in `src/lib/api-client.ts`

## 🔐 Environment Variables

```bash
# App Configuration
NEXT_PUBLIC_APP_NAME=Big Bus
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Endpoints
NEXT_PUBLIC_API_URL=http://localhost:80
NEXT_PUBLIC_AUTH_SERVICE=http://localhost:3001
NEXT_PUBLIC_BOOKING_SERVICE=http://localhost:3002
NEXT_PUBLIC_PAYMENT_SERVICE=http://localhost:3004
NEXT_PUBLIC_ANALYTICS_SERVICE=http://localhost:3006

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_GTM_ID=

# Maps (Optional)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Feature Flags
NEXT_PUBLIC_ENABLE_PWA=true
NEXT_PUBLIC_ENABLE_DARK_MODE=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

## 📱 Pages

### Homepage (/)
- Hero section with search widget
- Features showcase
- Popular routes
- Responsive design

### Routes Search (/routes)
- Advanced search filters
- Sort by price, time, duration
- Vehicle type filtering
- Real-time availability

### Booking Flow (/booking/[scheduleId])
- Interactive seat selection
- Passenger information form
- Payment method selection
- Booking confirmation

### Authentication
- Login (/login)
- Register (/register)
- OAuth integration (Google, Facebook, Zalo)

## 🎯 SEO Optimization

- ✅ Server-side rendering (SSR)
- ✅ Metadata and Open Graph tags
- ✅ Structured data (JSON-LD)
- ✅ Sitemap.xml generation
- ✅ Robots.txt configuration
- ✅ Image optimization
- ✅ Core Web Vitals optimization
- ✅ Mobile-friendly design

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Performance

Target metrics:
- Lighthouse Score: > 90
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.0s
- Cumulative Layout Shift: < 0.1

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for type safety
3. Write meaningful commit messages
4. Test on multiple screen sizes
5. Ensure accessibility (WCAG 2.1 AA)

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Lucide React for beautiful icons
- All open-source contributors

---

Built with ❤️ by Big Bus Team
