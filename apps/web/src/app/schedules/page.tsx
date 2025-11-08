'use client';

import { useRouter } from 'next/navigation';
import { useBooking } from '@/hooks/useBooking';
import { useBookingStore } from '@/store/booking.store';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';

export default function SchedulesPage() {
  const router = useRouter();
  const { schedules, isLoadingSchedules } = useBooking();
  const { selectedSchedule, setSelectedSchedule } = useBookingStore();

  if (!selectedSchedule) {
    router.push('/search');
    return null;
  }

  const handleSelectSchedule = (schedule: any) => {
    setSelectedSchedule(schedule);
    router.push('/seats');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">Select Schedule</h1>
            <p className="text-gray-600">
              {selectedSchedule.origin} → {selectedSchedule.destination}
            </p>
          </div>

          {isLoadingSchedules ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading schedules...</p>
            </div>
          ) : schedules && schedules.length > 0 ? (
            <div className="grid gap-4">
              {schedules.map((schedule: any) => (
                <div
                  key={schedule.id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-8 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Departure</p>
                          <p className="text-xl font-semibold">
                            {format(
                              new Date(schedule.departureTime),
                              'HH:mm'
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 border-t-2 border-gray-300"></div>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Arrival</p>
                          <p className="text-xl font-semibold">
                            {format(new Date(schedule.arrivalTime), 'HH:mm')}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm text-gray-600">
                        <span
                          className={`px-2 py-1 rounded ${
                            schedule.availableSeats > 10
                              ? 'bg-green-100 text-green-700'
                              : schedule.availableSeats > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {schedule.availableSeats} seats available
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {schedule.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-right ml-6">
                      <p className="text-2xl font-bold text-primary-600 mb-2">
                        ${schedule.price}
                      </p>
                      <button
                        onClick={() => handleSelectSchedule(schedule)}
                        disabled={schedule.availableSeats === 0}
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {schedule.availableSeats === 0
                          ? 'Sold Out'
                          : 'Select Seats'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">
                No schedules available for this route.
              </p>
              <button
                onClick={() => router.push('/search')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-semibold"
              >
                Back to routes
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
