import { create } from 'zustand';
import apiService from '@services/api';

interface Route {
  id: string;
  from: string;
  to: string;
  distance: number;
  duration: number;
  price: number;
}

interface Schedule {
  id: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
  vehicleId: string;
  availableSeats: number;
  price: number;
}

interface Seat {
  id: string;
  number: string;
  status: 'available' | 'selected' | 'booked';
  price: number;
}

interface Booking {
  id: string;
  scheduleId: string;
  userId: string;
  seatIds: string[];
  status: string;
  totalPrice: number;
  qrCode?: string;
  createdAt: string;
  route?: Route;
  schedule?: Schedule;
}

interface BookingState {
  // Search
  searchResults: Route[];
  isSearching: boolean;

  // Schedules
  schedules: Schedule[];
  selectedSchedule: Schedule | null;
  isLoadingSchedules: boolean;

  // Seats
  seats: Seat[];
  selectedSeats: string[];
  isLoadingSeats: boolean;

  // Bookings
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoadingBookings: boolean;

  // Error
  error: string | null;

  // Actions
  searchRoutes: (from: string, to: string, date: string) => Promise<void>;
  getSchedules: (routeId: string, date: string) => Promise<void>;
  selectSchedule: (schedule: Schedule) => void;
  getSeats: (scheduleId: string) => Promise<void>;
  toggleSeat: (seatId: string) => void;
  clearSelectedSeats: () => void;
  createBooking: (data: {
    scheduleId: string;
    seatIds: string[];
    passengerInfo: {
      name: string;
      phone: string;
      email: string;
    };
  }) => Promise<Booking>;
  getBookings: () => Promise<void>;
  getBookingById: (id: string) => Promise<void>;
  cancelBooking: (id: string, reason?: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  searchResults: [],
  isSearching: false,

  schedules: [],
  selectedSchedule: null,
  isLoadingSchedules: false,

  seats: [],
  selectedSeats: [],
  isLoadingSeats: false,

  bookings: [],
  currentBooking: null,
  isLoadingBookings: false,

  error: null,

  searchRoutes: async (from: string, to: string, date: string) => {
    try {
      set({ isSearching: true, error: null });

      const response = await apiService.searchRoutes(from, to, date);
      const routes = response.routes || [];

      set({
        searchResults: routes,
        isSearching: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Search failed',
        isSearching: false,
      });
      throw error;
    }
  },

  getSchedules: async (routeId: string, date: string) => {
    try {
      set({ isLoadingSchedules: true, error: null });

      const response = await apiService.getSchedules(routeId, date);
      const schedules = response.schedules || [];

      set({
        schedules,
        isLoadingSchedules: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load schedules',
        isLoadingSchedules: false,
      });
      throw error;
    }
  },

  selectSchedule: (schedule: Schedule) => {
    set({ selectedSchedule: schedule });
  },

  getSeats: async (scheduleId: string) => {
    try {
      set({ isLoadingSeats: true, error: null });

      const response = await apiService.getAvailableSeats(scheduleId);
      const seats = response.seats || [];

      set({
        seats,
        isLoadingSeats: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load seats',
        isLoadingSeats: false,
      });
      throw error;
    }
  },

  toggleSeat: (seatId: string) => {
    const { selectedSeats, seats } = get();
    const seat = seats.find(s => s.id === seatId);

    if (!seat || seat.status === 'booked') return;

    if (selectedSeats.includes(seatId)) {
      set({
        selectedSeats: selectedSeats.filter(id => id !== seatId),
        seats: seats.map(s =>
          s.id === seatId ? { ...s, status: 'available' } : s
        ),
      });
    } else {
      set({
        selectedSeats: [...selectedSeats, seatId],
        seats: seats.map(s =>
          s.id === seatId ? { ...s, status: 'selected' } : s
        ),
      });
    }
  },

  clearSelectedSeats: () => {
    const { seats } = get();
    set({
      selectedSeats: [],
      seats: seats.map(s =>
        s.status === 'selected' ? { ...s, status: 'available' } : s
      ),
    });
  },

  createBooking: async (data) => {
    try {
      set({ isLoadingBookings: true, error: null });

      const response = await apiService.createBooking(data);
      const booking = response.booking;

      set({
        currentBooking: booking,
        isLoadingBookings: false,
      });

      return booking;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create booking',
        isLoadingBookings: false,
      });
      throw error;
    }
  },

  getBookings: async () => {
    try {
      set({ isLoadingBookings: true, error: null });

      const response = await apiService.getBookings();
      const bookings = response.bookings || [];

      set({
        bookings,
        isLoadingBookings: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load bookings',
        isLoadingBookings: false,
      });
      throw error;
    }
  },

  getBookingById: async (id: string) => {
    try {
      set({ isLoadingBookings: true, error: null });

      const response = await apiService.getBookingById(id);
      const booking = response.booking;

      set({
        currentBooking: booking,
        isLoadingBookings: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to load booking',
        isLoadingBookings: false,
      });
      throw error;
    }
  },

  cancelBooking: async (id: string, reason?: string) => {
    try {
      set({ isLoadingBookings: true, error: null });

      await apiService.cancelBooking(id, reason);

      // Update booking in list
      const { bookings, currentBooking } = get();
      set({
        bookings: bookings.map(b =>
          b.id === id ? { ...b, status: 'cancelled' } : b
        ),
        currentBooking:
          currentBooking?.id === id
            ? { ...currentBooking, status: 'cancelled' }
            : currentBooking,
        isLoadingBookings: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to cancel booking',
        isLoadingBookings: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),

  reset: () =>
    set({
      searchResults: [],
      schedules: [],
      selectedSchedule: null,
      seats: [],
      selectedSeats: [],
      currentBooking: null,
      error: null,
    }),
}));
