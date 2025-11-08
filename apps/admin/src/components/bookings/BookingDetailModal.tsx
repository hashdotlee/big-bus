'use client';

import { format } from 'date-fns';
import Modal, { ModalFooter } from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

interface BookingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onConfirm?: (bookingId: string) => void;
  onCancel?: (bookingId: string) => void;
  isLoading?: boolean;
}

export default function BookingDetailModal({
  isOpen,
  onClose,
  booking,
  onConfirm,
  onCancel,
  isLoading,
}: BookingDetailModalProps) {
  if (!booking) return null;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Booking Details" size="lg">
      <div className="space-y-6">
        {/* Booking Info */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Booking Information</h4>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500">Booking ID</p>
              <p className="mt-1 font-medium">{booking.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <div className="mt-1">{getStatusBadge(booking.status)}</div>
            </div>
            <div>
              <p className="text-xs text-gray-500">Booking Date</p>
              <p className="mt-1 font-medium">
                {booking.createdAt ? format(new Date(booking.createdAt), 'PPP') : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Price</p>
              <p className="mt-1 text-lg font-semibold text-green-600">
                ${booking.totalPrice?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Passenger Info */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Passenger Information</h4>
          <div className="space-y-2 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="mt-1 font-medium">{booking.passengerInfo?.name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="mt-1 font-medium">{booking.passengerInfo?.email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="mt-1 font-medium">{booking.passengerInfo?.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Route Info */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-gray-700">Route Information</h4>
          <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
            <div>
              <p className="text-xs text-gray-500">Pickup Station</p>
              <p className="mt-1 font-medium">{booking.pickupStation?.name || 'N/A'}</p>
              <p className="text-xs text-gray-500">{booking.pickupStation?.address || ''}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Dropoff Station</p>
              <p className="mt-1 font-medium">{booking.dropoffStation?.name || 'N/A'}</p>
              <p className="text-xs text-gray-500">{booking.dropoffStation?.address || ''}</p>
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        {booking.schedule && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Schedule Information</h4>
            <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
              <div>
                <p className="text-xs text-gray-500">Departure Time</p>
                <p className="mt-1 font-medium">
                  {booking.schedule.departureTime
                    ? format(new Date(booking.schedule.departureTime), 'PPp')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Arrival Time</p>
                <p className="mt-1 font-medium">
                  {booking.schedule.arrivalTime
                    ? format(new Date(booking.schedule.arrivalTime), 'PPp')
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Seats</p>
                <p className="mt-1 font-medium">{booking.seats?.join(', ') || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Available Seats</p>
                <p className="mt-1 font-medium">{booking.schedule.availableSeats || 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* QR Code */}
        {booking.qrCode && (
          <div>
            <h4 className="mb-3 text-sm font-semibold text-gray-700">QR Code</h4>
            <div className="flex justify-center rounded-lg bg-gray-50 p-4">
              <img src={booking.qrCode} alt="Booking QR Code" className="h-48 w-48" />
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {booking.status === 'pending' && (
          <>
            <Button
              variant="danger"
              onClick={() => onCancel?.(booking.id)}
              disabled={isLoading}
            >
              {isLoading ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
            <Button onClick={() => onConfirm?.(booking.id)} disabled={isLoading}>
              {isLoading ? 'Confirming...' : 'Confirm Booking'}
            </Button>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
}
