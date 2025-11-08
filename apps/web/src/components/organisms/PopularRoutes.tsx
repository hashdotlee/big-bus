'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PopularRoute {
  id: string;
  origin: string;
  destination: string;
  duration: string;
  priceFrom: number;
  discount?: number;
  image: string;
  popular: boolean;
}

export function PopularRoutes() {
  const [routes] = useState<PopularRoute[]>([
    {
      id: '1',
      origin: 'TP. Hồ Chí Minh',
      destination: 'Đà Lạt',
      duration: '6 giờ',
      priceFrom: 200000,
      discount: 10,
      image: '/images/routes/sgn-dlt.jpg',
      popular: true,
    },
    {
      id: '2',
      origin: 'TP. Hồ Chí Minh',
      destination: 'Nha Trang',
      duration: '8 giờ',
      priceFrom: 250000,
      image: '/images/routes/sgn-nha.jpg',
      popular: true,
    },
    {
      id: '3',
      origin: 'Hà Nội',
      destination: 'Hải Phòng',
      duration: '2 giờ',
      priceFrom: 120000,
      discount: 15,
      image: '/images/routes/han-hp.jpg',
      popular: false,
    },
    {
      id: '4',
      origin: 'Hà Nội',
      destination: 'Sapa',
      duration: '5 giờ',
      priceFrom: 300000,
      image: '/images/routes/han-sapa.jpg',
      popular: true,
    },
    {
      id: '5',
      origin: 'TP. Hồ Chí Minh',
      destination: 'Vũng Tàu',
      duration: '2.5 giờ',
      priceFrom: 100000,
      image: '/images/routes/sgn-vt.jpg',
      popular: false,
    },
    {
      id: '6',
      origin: 'Đà Nẵng',
      destination: 'Hội An',
      duration: '1 giờ',
      priceFrom: 80000,
      discount: 20,
      image: '/images/routes/dn-ha.jpg',
      popular: false,
    },
  ]);

  return (
    <section className="py-16 md:py-24">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-dark dark:text-white mb-2">
              Tuyến đường phổ biến
            </h2>
            <p className="text-lg text-secondary-gray">
              Những tuyến đường được khách hàng lựa chọn nhiều nhất
            </p>
          </div>
          <Link href="/routes" className="hidden md:block">
            <Button variant="outline">Xem tất cả</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <Card key={route.id} hover className="overflow-hidden p-0">
              {/* Image */}
              <div className="relative h-48 bg-gradient-primary overflow-hidden">
                {route.discount && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="danger" size="md">
                      -{route.discount}%
                    </Badge>
                  </div>
                )}
                {route.popular && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge variant="warning" size="md">
                      Phổ biến
                    </Badge>
                  </div>
                )}
                <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                  {route.origin.split(' ').slice(-1)[0]} → {route.destination.split(' ').slice(-1)[0]}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="space-y-3">
                  {/* Route */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-5 h-5 text-primary-blue flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-secondary-dark dark:text-white">
                        {route.origin}
                      </p>
                      <p className="text-sm text-secondary-gray">đến {route.destination}</p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="flex items-center gap-2 text-sm text-secondary-gray">
                    <Clock className="w-4 h-4" />
                    <span>Thời gian: {route.duration}</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-status-success" />
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm text-secondary-gray">Từ</span>
                      <span className="text-xl font-bold text-primary-blue">
                        {formatCurrency(route.priceFrom)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-5 pt-0">
                <Link href={`/routes?origin=${route.origin}&destination=${route.destination}`} className="w-full">
                  <Button variant="primary" size="md" className="w-full">
                    Đặt vé ngay
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="mt-8 text-center md:hidden">
          <Link href="/routes">
            <Button variant="outline" size="lg" className="w-full">
              Xem tất cả tuyến đường
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
