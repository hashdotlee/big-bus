import { create } from 'zustand';

interface SearchParams {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
}

interface BookingState {
  searchParams: SearchParams | null;
  selectedSchedule: any | null;
  selectedSeats: string[];
  passengerInfo: any | null;
  setSearchParams: (params: SearchParams) => void;
  setSelectedSchedule: (schedule: any) => void;
  setSelectedSeats: (seats: string[]) => void;
  setPassengerInfo: (info: any) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  searchParams: null,
  selectedSchedule: null,
  selectedSeats: [],
  passengerInfo: null,
  setSearchParams: (params) => set({ searchParams: params }),
  setSelectedSchedule: (schedule) => set({ selectedSchedule: schedule }),
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
  setPassengerInfo: (info) => set({ passengerInfo: info }),
  clearBooking: () =>
    set({
      searchParams: null,
      selectedSchedule: null,
      selectedSeats: [],
      passengerInfo: null,
    }),
}));
