import { useMutation, useQuery } from 'react-query';
import { api } from '@big-bus/api-client';
import { useBookingStore } from '@/store/booking.store';

export const useBooking = () => {
  const { searchParams, selectedSchedule, selectedSeats } = useBookingStore();

  const searchRoutesQuery = useQuery(
    ['routes', searchParams],
    () => api.booking.searchRoutes(searchParams!),
    {
      enabled: !!searchParams,
    }
  );

  const schedulesQuery = useQuery(
    ['schedules', selectedSchedule?.routeId],
    () =>
      api.booking.getSchedules({
        routeId: selectedSchedule?.routeId,
        date: searchParams?.date,
      }),
    {
      enabled: !!selectedSchedule?.routeId && !!searchParams?.date,
    }
  );

  const myBookingsQuery = useQuery('myBookings', () =>
    api.booking.getMyBookings()
  );

  const createBookingMutation = useMutation(
    async (data: any) => {
      return api.booking.createBooking(data);
    }
  );

  const cancelBookingMutation = useMutation(
    async ({ id, reason }: { id: string; reason?: string }) => {
      return api.booking.cancelBooking(id, reason);
    },
    {
      onSuccess: () => {
        myBookingsQuery.refetch();
      },
    }
  );

  return {
    routes: searchRoutesQuery.data,
    schedules: schedulesQuery.data,
    myBookings: myBookingsQuery.data,
    isSearchingRoutes: searchRoutesQuery.isLoading,
    isLoadingSchedules: schedulesQuery.isLoading,
    isLoadingMyBookings: myBookingsQuery.isLoading,
    createBooking: createBookingMutation.mutate,
    cancelBooking: cancelBookingMutation.mutate,
    isCreatingBooking: createBookingMutation.isLoading,
    createBookingError: createBookingMutation.error,
  };
};
