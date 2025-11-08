'use client';

import { useBooking } from '@/hooks/useBooking';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { myBookings, isLoadingMyBookings, cancelBooking } = useBooking();

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBooking({ id: bookingId, reason: 'User requested cancellation' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">My Bookings</h1>

          {isLoadingMyBookings ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading bookings...</p>
            </div>
          ) : myBookings && myBookings.length > 0 ? (
            <div className="grid gap-4">
              {myBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        Booking #{booking.id.slice(0, 8)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary-600">
                      ${booking.totalPrice}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Route</p>
                      <p className="font-medium">
                        {booking.pickupStation.city} →{' '}
                        {booking.dropoffStation.city}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date & Time</p>
                      <p className="font-medium">
                        {format(
                          new Date(booking.schedule.departureTime),
                          'PPP HH:mm'
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Seats</p>
                      <p className="font-medium">{booking.seats.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Passenger</p>
                      <p className="font-medium">
                        {booking.passengerInfo.firstName}{' '}
                        {booking.passengerInfo.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {booking.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() =>
                            router.push(`/bookings/${booking.id}/ticket`)
                          }
                          className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          View Ticket
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                        >
                          Cancel Booking
                        </button>
                      </>
                    )}
                    {booking.status === 'pending' && (
                      <button
                        onClick={() =>
                          router.push(`/payment/${booking.id}`)
                        }
                        className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                      >
                        Complete Payment
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg mb-4">
                You don't have any bookings yet.
              </p>
              <button
                onClick={() => router.push('/')}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Book a Ticket
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
