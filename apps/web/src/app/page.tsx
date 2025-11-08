import type { Metadata } from 'next';
import { Hero } from '@/components/organisms/Hero';
import { SearchWidget } from '@/components/organisms/SearchWidget';
import { PopularRoutes } from '@/components/organisms/PopularRoutes';
import { Features } from '@/components/organisms/Features';
import { Header } from '@/components/organisms/Header';
import { Footer } from '@/components/organisms/Footer';

export const metadata: Metadata = {
  title: 'Trang chủ',
  description: 'Đặt vé xe khách nhanh chóng, an toàn và tiện lợi. Hơn 1000+ tuyến đường khắp Việt Nam.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {/* Hero Section with Search */}
        <Hero>
          <SearchWidget />
        </Hero>

        {/* Features Section */}
        <Features />

        {/* Popular Routes */}
        <PopularRoutes />
      </main>

      <Footer />
    </div>
  );
}
