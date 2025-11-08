import type { Metadata, Viewport } from 'next';
import { Inter, Be_Vietnam_Pro } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const beVietnam = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['vietnamese'],
  variable: '--font-be-vietnam',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: {
    default: 'Big Bus - Đặt vé xe khách trực tuyến',
    template: '%s | Big Bus',
  },
  description: 'Đặt vé xe khách nhanh chóng, an toàn và tiện lợi. Hơn 1000+ tuyến đường khắp Việt Nam với giá cả cạnh tranh.',
  keywords: [
    'đặt vé xe khách',
    'vé xe online',
    'xe khách',
    'bus booking',
    'Vietnam bus',
    'đặt vé online',
    'xe giường nằm',
    'xe limousine',
  ],
  authors: [{ name: 'Big Bus Team' }],
  creator: 'Big Bus',
  publisher: 'Big Bus',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: 'Big Bus - Đặt vé xe khách trực tuyến',
    description: 'Đặt vé xe khách nhanh chóng, an toàn và tiện lợi',
    siteName: 'Big Bus',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Big Bus - Đặt vé xe khách trực tuyến',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Big Bus - Đặt vé xe khách trực tuyến',
    description: 'Đặt vé xe khách nhanh chóng, an toàn và tiện lợi',
    images: ['/images/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a1a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.variable} ${beVietnam.variable} font-vietnamese antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
