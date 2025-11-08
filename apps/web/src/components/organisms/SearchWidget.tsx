'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { MapPin, Calendar, Users, ArrowRightLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export function SearchWidget() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    passengers: 1,
  });

  const handleSwap = () => {
    setSearchParams((prev) => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin,
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // TODO: Add validation
    const queryParams = new URLSearchParams({
      origin: searchParams.origin,
      destination: searchParams.destination,
      date: searchParams.departureDate,
      passengers: searchParams.passengers.toString(),
    });

    router.push(`/routes?${queryParams.toString()}`);
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-5xl mx-auto animate-slide-in">
      <form
        onSubmit={handleSearch}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
          {/* Origin */}
          <div className="lg:col-span-4">
            <Input
              label="Điểm đi"
              placeholder="TP. Hồ Chí Minh"
              value={searchParams.origin}
              onChange={(e) =>
                setSearchParams({ ...searchParams, origin: e.target.value })
              }
              leftIcon={<MapPin className="w-5 h-5" />}
              required
            />
          </div>

          {/* Swap Button */}
          <div className="hidden lg:flex lg:col-span-1 items-end justify-center pb-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSwap}
              className="rounded-full w-10 h-10 p-0"
            >
              <ArrowRightLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Destination */}
          <div className="lg:col-span-4">
            <Input
              label="Điểm đến"
              placeholder="Đà Lạt"
              value={searchParams.destination}
              onChange={(e) =>
                setSearchParams({ ...searchParams, destination: e.target.value })
              }
              leftIcon={<MapPin className="w-5 h-5" />}
              required
            />
          </div>

          {/* Date */}
          <div className="lg:col-span-2">
            <Input
              label="Ngày đi"
              type="date"
              min={minDate}
              value={searchParams.departureDate}
              onChange={(e) =>
                setSearchParams({ ...searchParams, departureDate: e.target.value })
              }
              leftIcon={<Calendar className="w-5 h-5" />}
              required
            />
          </div>

          {/* Passengers */}
          <div className="lg:col-span-1">
            <Input
              label="Số khách"
              type="number"
              min={1}
              max={10}
              value={searchParams.passengers}
              onChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  passengers: parseInt(e.target.value) || 1,
                })
              }
              leftIcon={<Users className="w-5 h-5" />}
              required
            />
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-6">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            Tìm chuyến xe
          </Button>
        </div>

        {/* Popular Routes Quick Links */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-secondary-gray mb-3">Tuyến đường phổ biến:</p>
          <div className="flex flex-wrap gap-2">
            {[
              { from: 'TP.HCM', to: 'Đà Lạt' },
              { from: 'TP.HCM', to: 'Nha Trang' },
              { from: 'Hà Nội', to: 'Hải Phòng' },
              { from: 'Hà Nội', to: 'Sapa' },
            ].map((route, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSearchParams({
                    ...searchParams,
                    origin: route.from,
                    destination: route.to,
                  });
                }}
                className="text-sm px-3 py-1.5 rounded-full bg-blue-50 dark:bg-gray-700 text-primary-blue dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
              >
                {route.from} → {route.to}
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
