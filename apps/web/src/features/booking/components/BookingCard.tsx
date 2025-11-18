'use client';

/**
 * Booking Card Component
 * Feature: Booking
 */

import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Badge } from '@big-bus/ui';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface BookingCardProps {
  booking: {
    id: string;
    routeName: string;
    departure: string;
    destination: string;
    departureTime: Date;
    arrivalTime: Date;
    seats: number;
    status: 'confirmed' | 'pending' | 'cancelled';
    totalPrice: number;
  };
  onViewDetails?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const statusColors = {
  confirmed: 'success' as const,
  pending: 'warning' as const,
  cancelled: 'error' as const,
};

export const BookingCard = ({ booking, onViewDetails, onCancel }: BookingCardProps) => {
  return (
    <Card variant="bordered" className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle as="h3">{booking.routeName}</CardTitle>
          <div className="flex items-center gap-2 mt-2 text-sm text-neutral-600">
            <MapPin className="w-4 h-4" />
            <span>{booking.departure} → {booking.destination}</span>
          </div>
        </div>
        <Badge variant={statusColors[booking.status]} rounded>
          {booking.status}
        </Badge>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-neutral-500" />
            <span>{format(booking.departureTime, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-neutral-500" />
            <span>{booking.seats} {booking.seats === 1 ? 'seat' : 'seats'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-neutral-500" />
            <span>{format(booking.departureTime, 'HH:mm')}</span>
          </div>
          <div className="text-sm font-semibold">
            ${booking.totalPrice.toFixed(2)}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewDetails?.(booking.id)}
        >
          View Details
        </Button>
        {booking.status === 'confirmed' && (
          <Button
            variant="error"
            size="sm"
            onClick={() => onCancel?.(booking.id)}
          >
            Cancel
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
