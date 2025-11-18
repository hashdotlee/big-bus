import {create} from 'zustand';

export interface Route {
  id: string;
  departure: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number;
  vehicleType: string;
}

export interface Seat {
  id: string;
  number: string;
  isAvailable: boolean;
  price: number;
}

export interface Passenger {
  fullName: string;
  phoneNumber: string;
  email: string;
  idNumber?: string;
}

export interface Booking {
  id?: string;
  route: Route | null;
  selectedSeats: Seat[];
  passengers: Passenger[];
  totalPrice: number;
  paymentMethod: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
}

interface BookingState {
  currentBooking: Booking;
  searchResults: Route[];
  isSearching: boolean;

  // Search actions
  searchRoutes: (departure: string, destination: string, date: string) => Promise<void>;
  setSearchResults: (routes: Route[]) => void;

  // Booking actions
  selectRoute: (route: Route) => void;
  selectSeat: (seat: Seat) => void;
  removeSeat: (seatId: string) => void;
  addPassenger: (passenger: Passenger) => void;
  updatePassenger: (index: number, passenger: Passenger) => void;
  setPaymentMethod: (method: string) => void;
  calculateTotalPrice: () => void;
  confirmBooking: () => Promise<string>;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  currentBooking: {
    route: null,
    selectedSeats: [],
    passengers: [],
    totalPrice: 0,
    paymentMethod: null,
    status: 'pending',
  },
  searchResults: [],
  isSearching: false,

  searchRoutes: async (departure, destination, date) => {
    set({isSearching: true});
    try {
      const response = await fetch(
        `http://localhost:3002/api/routes/search?departure=${departure}&destination=${destination}&date=${date}`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      set({searchResults: data.routes, isSearching: false});
    } catch (error) {
      set({isSearching: false});
      throw error;
    }
  },

  setSearchResults: (routes) => {
    set({searchResults: routes});
  },

  selectRoute: (route) => {
    set((state) => ({
      currentBooking: {
        ...state.currentBooking,
        route,
        selectedSeats: [],
        passengers: [],
      },
    }));
  },

  selectSeat: (seat) => {
    set((state) => {
      const newSeats = [...state.currentBooking.selectedSeats, seat];
      return {
        currentBooking: {
          ...state.currentBooking,
          selectedSeats: newSeats,
        },
      };
    });
    get().calculateTotalPrice();
  },

  removeSeat: (seatId) => {
    set((state) => ({
      currentBooking: {
        ...state.currentBooking,
        selectedSeats: state.currentBooking.selectedSeats.filter(
          (seat) => seat.id !== seatId
        ),
      },
    }));
    get().calculateTotalPrice();
  },

  addPassenger: (passenger) => {
    set((state) => ({
      currentBooking: {
        ...state.currentBooking,
        passengers: [...state.currentBooking.passengers, passenger],
      },
    }));
  },

  updatePassenger: (index, passenger) => {
    set((state) => {
      const newPassengers = [...state.currentBooking.passengers];
      newPassengers[index] = passenger;
      return {
        currentBooking: {
          ...state.currentBooking,
          passengers: newPassengers,
        },
      };
    });
  },

  setPaymentMethod: (method) => {
    set((state) => ({
      currentBooking: {
        ...state.currentBooking,
        paymentMethod: method,
      },
    }));
  },

  calculateTotalPrice: () => {
    set((state) => {
      const total = state.currentBooking.selectedSeats.reduce(
        (sum, seat) => sum + seat.price,
        0
      );
      return {
        currentBooking: {
          ...state.currentBooking,
          totalPrice: total,
        },
      };
    });
  },

  confirmBooking: async () => {
    const {currentBooking} = get();

    try {
      const response = await fetch('http://localhost:3002/api/bookings', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(currentBooking),
      });

      if (!response.ok) {
        throw new Error('Booking confirmation failed');
      }

      const data = await response.json();
      set((state) => ({
        currentBooking: {
          ...state.currentBooking,
          id: data.bookingId,
          status: 'confirmed',
        },
      }));

      return data.bookingId;
    } catch (error) {
      throw error;
    }
  },

  resetBooking: () => {
    set({
      currentBooking: {
        route: null,
        selectedSeats: [],
        passengers: [],
        totalPrice: 0,
        paymentMethod: null,
        status: 'pending',
      },
    });
  },
}));
