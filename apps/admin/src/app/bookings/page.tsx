'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { api } from '@big-bus/api-client';
import { format } from 'date-fns';
import AdminLayout from '@/components/layout/AdminLayout';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Table, { TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import BookingDetailModal from '@/components/bookings/BookingDetailModal';
import { useToast } from '@/components/ui/ToastContainer';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

export default function BookingsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: bookings, isLoading } = useQuery(['bookings', statusFilter], () => {
    const params: any = {};
    if (statusFilter !== 'all') params.status = statusFilter;
    return api.booking.getMyBookings();
  });

  // Confirm booking mutation
  const confirmMutation = useMutation(
    (bookingId: string) => api.booking.confirmBooking(bookingId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
        setIsDetailModalOpen(false);
        showToast({
          type: 'success',
          message: 'Booking confirmed successfully!',
        });
      },
      onError: (error: any) => {
        showToast({
          type: 'error',
          message: error.message || 'Failed to confirm booking',
        });
      },
    }
  );

  // Cancel booking mutation
  const cancelMutation = useMutation(
    (bookingId: string) => api.booking.cancelBooking(bookingId, 'Cancelled by admin'),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('bookings');
        setIsDetailModalOpen(false);
        showToast({
          type: 'success',
          message: 'Booking cancelled successfully!',
        });
      },
      onError: (error: any) => {
        showToast({
          type: 'error',
          message: error.message || 'Failed to cancel booking',
        });
      },
    }
  );

  const filteredBookings = bookings?.filter((booking: any) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      booking.id?.toLowerCase().includes(search) ||
      booking.passengerInfo?.name?.toLowerCase().includes(search) ||
      booking.passengerInfo?.email?.toLowerCase().includes(search)
    );
  });

  const handleViewDetails = (booking: any) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const handleQuickConfirm = (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to confirm this booking?')) {
      confirmMutation.mutate(bookingId);
    }
  };

  const handleQuickCancel = (bookingId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      cancelMutation.mutate(bookingId);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
      pending: 'warning',
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter((b: any) => b.status === 'pending').length || 0,
    confirmed: bookings?.filter((b: any) => b.status === 'confirmed').length || 0,
    cancelled: bookings?.filter((b: any) => b.status === 'cancelled').length || 0,
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all bookings, passenger information, and booking status.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="mt-2 text-3xl font-semibold text-yellow-600">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Confirmed</p>
                <p className="mt-2 text-3xl font-semibold text-green-600">{stats.confirmed}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <div>
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <p className="mt-2 text-3xl font-semibold text-red-600">{stats.cancelled}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and search */}
        <Card>
          <CardContent className="py-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'completed', label: 'Completed' },
                ]}
              />
              <Button variant="secondary" fullWidth onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bookings table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">Loading bookings...</p>
              </div>
            ) : filteredBookings && filteredBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking ID</TableHead>
                    <TableHead>Passenger</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Seats</TableHead>
                    <TableHead>Total Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking: any) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {booking.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.passengerInfo?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500">
                            {booking.passengerInfo?.email || ''}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">
                            {booking.pickupStation?.name} → {booking.dropoffStation?.name}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{booking.seats?.length || 0}</TableCell>
                      <TableCell className="font-medium">
                        ${booking.totalPrice?.toLocaleString() || 0}
                      </TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        {booking.createdAt
                          ? format(new Date(booking.createdAt), 'MMM dd, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(booking)}
                            className="text-blue-600 hover:text-blue-800"
                            title="View details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={(e) => handleQuickConfirm(booking.id, e)}
                                className="text-green-600 hover:text-green-800"
                                title="Confirm booking"
                                disabled={confirmMutation.isLoading}
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => handleQuickCancel(booking.id, e)}
                                className="text-red-600 hover:text-red-800"
                                title="Cancel booking"
                                disabled={cancelMutation.isLoading}
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex h-64 flex-col items-center justify-center">
                <p className="text-gray-500">No bookings found</p>
                <p className="mt-1 text-sm text-gray-400">
                  Try adjusting your filters or wait for new bookings
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        booking={selectedBooking}
        onConfirm={(bookingId) => confirmMutation.mutate(bookingId)}
        onCancel={(bookingId) => cancelMutation.mutate(bookingId)}
        isLoading={confirmMutation.isLoading || cancelMutation.isLoading}
      />
    </AdminLayout>
  );
}
