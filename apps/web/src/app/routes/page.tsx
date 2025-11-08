'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { Footer } from '@/components/organisms/Footer';
import { Card, CardContent } from '@/components/atoms/Card';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { MapPin, Clock, Users, DollarSign, Star, ArrowRight } from 'lucide-react';
import { formatCurrency, formatTime, calculateDuration } from '@/lib/utils';
import Link from 'next/link';

function RouteResults() {
  const searchParams = useSearchParams();
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';
  const passengers = searchParams.get('passengers') || '1';

  // Mock data - replace with actual API call
  const [schedules] = useState([
    {
      id: '1',
      departureTime: '2024-12-25T07:00:00',
      arrivalTime: '2024-12-25T13:00:00',
      price: 200000,
      availableSeats: 15,
      totalSeats: 45,
      vehicleType: 'Giường nằm',
      rating: 4.8,
      company: 'Big Bus Express',
      amenities: ['WiFi', 'Nước uống', 'Điều hòa', 'USB'],
    },
    {
      id: '2',
      departureTime: '2024-12-25T09:30:00',
      arrivalTime: '2024-12-25T15:30:00',
      price: 180000,
      availableSeats: 8,
      totalSeats: 45,
      vehicleType: 'Ghế ngồi',
      rating: 4.5,
      company: 'Big Bus Standard',
      amenities: ['WiFi', 'Điều hòa'],
    },
    {
      id: '3',
      departureTime: '2024-12-25T14:00:00',
      arrivalTime: '2024-12-25T20:00:00',
      price: 250000,
      availableSeats: 20,
      totalSeats: 24,
      vehicleType: 'Limousine',
      rating: 4.9,
      company: 'Big Bus Premium',
      amenities: ['WiFi', 'Nước uống', 'Điều hòa', 'USB', 'Massage'],
    },
  ]);

  const [sortBy, setSortBy] = useState<'price' | 'departure' | 'duration'>('departure');

  return (
    <>
      {/* Search Summary */}
      <div className="bg-gradient-primary text-white py-8">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {origin} → {destination}
              </h1>
              <p className="text-white/90">
                {date} • {passengers} hành khách • {schedules.length} chuyến xe
              </p>
            </div>
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-primary-blue">
              Thay đổi tìm kiếm
            </Button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-5 space-y-6">
                <div>
                  <h3 className="font-semibold text-secondary-dark dark:text-white mb-3">
                    Sắp xếp theo
                  </h3>
                  <div className="space-y-2">
                    {[
                      { value: 'departure', label: 'Giờ khởi hành' },
                      { value: 'price', label: 'Giá vé' },
                      { value: 'duration', label: 'Thời gian' },
                    ].map((option) => (
                      <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="sort"
                          value={option.value}
                          checked={sortBy === option.value}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="w-4 h-4 text-primary-blue"
                        />
                        <span className="text-sm text-secondary-gray">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-secondary-dark dark:text-white mb-3">
                    Loại xe
                  </h3>
                  <div className="space-y-2">
                    {['Tất cả', 'Giường nằm', 'Ghế ngồi', 'Limousine'].map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-primary-blue rounded" />
                        <span className="text-sm text-secondary-gray">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="font-semibold text-secondary-dark dark:text-white mb-3">
                    Giờ khởi hành
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: 'Sáng sớm (00:00 - 06:00)', value: 'early' },
                      { label: 'Buổi sáng (06:00 - 12:00)', value: 'morning' },
                      { label: 'Buổi chiều (12:00 - 18:00)', value: 'afternoon' },
                      { label: 'Buổi tối (18:00 - 24:00)', value: 'evening' },
                    ].map((time) => (
                      <label key={time.value} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 text-primary-blue rounded" />
                        <span className="text-sm text-secondary-gray">{time.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1 space-y-4">
            {schedules.map((schedule) => (
              <Card key={schedule.id} hover>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Time & Route Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-secondary-dark dark:text-white">
                            {formatTime(schedule.departureTime)}
                          </p>
                          <p className="text-sm text-secondary-gray">{origin}</p>
                        </div>

                        <div className="flex-1 flex flex-col items-center">
                          <p className="text-sm text-secondary-gray mb-1">
                            {calculateDuration(schedule.departureTime, schedule.arrivalTime)}
                          </p>
                          <div className="w-full h-0.5 bg-gray-300 dark:bg-gray-600 relative">
                            <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-2xl font-bold text-secondary-dark dark:text-white">
                            {formatTime(schedule.arrivalTime)}
                          </p>
                          <p className="text-sm text-secondary-gray">{destination}</p>
                        </div>
                      </div>

                      {/* Vehicle & Company Info */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <Badge variant="primary">{schedule.vehicleType}</Badge>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">{schedule.rating}</span>
                        </div>
                        <span className="text-sm text-secondary-gray">{schedule.company}</span>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {schedule.amenities.map((amenity) => (
                          <span
                            key={amenity}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-secondary-gray"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>

                      {/* Seats Info */}
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-secondary-gray" />
                        <span className="text-secondary-gray">
                          {schedule.availableSeats} chỗ trống / {schedule.totalSeats}
                        </span>
                        {schedule.availableSeats < 10 && (
                          <Badge variant="warning" size="sm">
                            Sắp hết chỗ
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-4 md:w-48 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 pt-4 md:pt-0 md:pl-6">
                      <div className="text-left md:text-right">
                        <p className="text-sm text-secondary-gray mb-1">Giá từ</p>
                        <p className="text-2xl font-bold text-primary-blue">
                          {formatCurrency(schedule.price)}
                        </p>
                        <p className="text-xs text-secondary-gray mt-1">/ khách</p>
                      </div>

                      <Link href={`/booking/${schedule.id}?passengers=${passengers}`}>
                        <Button variant="primary" size="lg" className="w-full md:w-auto">
                          Chọn chuyến
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* No Results */}
            {schedules.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-lg text-secondary-gray mb-4">
                    Không tìm thấy chuyến xe phù hợp
                  </p>
                  <Button variant="outline">Thay đổi tìm kiếm</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function RoutesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><Spinner size="xl" /></div>}>
          <RouteResults />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
