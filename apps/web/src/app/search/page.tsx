'use client';

import { useRouter } from 'next/navigation';
import { useBooking } from '@/hooks/useBooking';
import { useBookingStore } from '@/store/booking.store';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';

export default function SearchPage() {
  const router = useRouter();
  const { routes, isSearchingRoutes } = useBooking();
  const { searchParams, setSelectedSchedule } = useBookingStore();

  if (!searchParams) {
    router.push('/');
    return null;
  }

  const handleSelectRoute = (route: any) => {
    setSelectedSchedule(route);
    router.push('/schedules');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Available Routes</h1>
            <p className="text-gray-600">
              {searchParams.origin} → {searchParams.destination} on{' '}
              {format(new Date(searchParams.date), 'PPP')}
            </p>
          </div>

          {isSearchingRoutes ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600"></div>
              <p className="mt-4 text-gray-600">Searching for routes...</p>
            </div>
          ) : routes && routes.length > 0 ? (
            <div className="grid gap-4">
              {routes.map((route: any) => (
                <div
                  key={route.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">From</p>
                          <p className="text-lg font-semibold">{route.origin}</p>
                        </div>
                        <div className="flex-1 border-t-2 border-dashed border-gray-300"></div>
                        <div>
                          <p className="text-sm text-gray-500">To</p>
                          <p className="text-lg font-semibold">
                            {route.destination}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>Distance: {route.distance} km</span>
                        <span>
                          Duration: ~{Math.floor(route.estimatedDuration / 60)}{' '}
                          hours
                        </span>
                        <span>Stations: {route.stations?.length || 0}</span>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-primary-600 mb-2">
                        ${route.price}
                      </p>
                      <button
                        onClick={() => handleSelectRoute(route)}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition"
                      >
                        View Schedules
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">
                No routes found for your search criteria.
              </p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-semibold"
              >
                Try another search
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
