import {renderHook, act} from '@testing-library/react-native';
import {useBookingStore, Route, Seat, Passenger} from '@store/bookingStore';

// Mock fetch globally
global.fetch = jest.fn();

describe('bookingStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const {result} = renderHook(() => useBookingStore());
    act(() => {
      result.current.resetBooking();
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const {result} = renderHook(() => useBookingStore());

      expect(result.current.currentBooking.route).toBeNull();
      expect(result.current.currentBooking.selectedSeats).toEqual([]);
      expect(result.current.currentBooking.passengers).toEqual([]);
      expect(result.current.currentBooking.totalPrice).toBe(0);
      expect(result.current.currentBooking.paymentMethod).toBeNull();
      expect(result.current.currentBooking.status).toBe('pending');
      expect(result.current.searchResults).toEqual([]);
      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('searchRoutes', () => {
    it('should successfully search routes', async () => {
      const mockRoutes: Route[] = [
        {
          id: '1',
          departure: 'Hanoi',
          destination: 'Saigon',
          departureTime: '08:00',
          arrivalTime: '20:00',
          price: 500000,
          availableSeats: 30,
          vehicleType: 'Limousine',
        },
        {
          id: '2',
          departure: 'Hanoi',
          destination: 'Saigon',
          departureTime: '14:00',
          arrivalTime: '02:00',
          price: 450000,
          availableSeats: 25,
          vehicleType: 'Sleeper',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({routes: mockRoutes}),
      });

      const {result} = renderHook(() => useBookingStore());

      await act(async () => {
        await result.current.searchRoutes('Hanoi', 'Saigon', '2024-02-01');
      });

      expect(result.current.searchResults).toEqual(mockRoutes);
      expect(result.current.isSearching).toBe(false);
    });

    it('should handle search failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const {result} = renderHook(() => useBookingStore());

      await expect(
        act(async () => {
          await result.current.searchRoutes('Hanoi', 'Saigon', '2024-02-01');
        })
      ).rejects.toThrow('Search failed');

      expect(result.current.isSearching).toBe(false);
    });

    it('should set isSearching during search', async () => {
      let resolveSearch: any;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });

      (global.fetch as jest.Mock).mockImplementationOnce(() => searchPromise);

      const {result} = renderHook(() => useBookingStore());

      act(() => {
        result.current.searchRoutes('Hanoi', 'Saigon', '2024-02-01');
      });

      expect(result.current.isSearching).toBe(true);

      await act(async () => {
        resolveSearch({ok: true, json: async () => ({routes: []})});
        await searchPromise;
      });

      expect(result.current.isSearching).toBe(false);
    });
  });

  describe('selectRoute', () => {
    it('should select a route', () => {
      const mockRoute: Route = {
        id: '1',
        departure: 'Hanoi',
        destination: 'Saigon',
        departureTime: '08:00',
        arrivalTime: '20:00',
        price: 500000,
        availableSeats: 30,
        vehicleType: 'Limousine',
      };

      const {result} = renderHook(() => useBookingStore());

      act(() => {
        result.current.selectRoute(mockRoute);
      });

      expect(result.current.currentBooking.route).toEqual(mockRoute);
    });

    it('should reset seats and passengers when selecting a new route', () => {
      const {result} = renderHook(() => useBookingStore());

      const mockSeat: Seat = {
        id: 's1',
        number: 'A1',
        isAvailable: true,
        price: 500000,
      };

      const mockRoute: Route = {
        id: '1',
        departure: 'Hanoi',
        destination: 'Saigon',
        departureTime: '08:00',
        arrivalTime: '20:00',
        price: 500000,
        availableSeats: 30,
        vehicleType: 'Limousine',
      };

      // First add a seat
      act(() => {
        result.current.selectRoute(mockRoute);
        result.current.selectSeat(mockSeat);
      });

      expect(result.current.currentBooking.selectedSeats).toHaveLength(1);

      // Then select a new route
      const newRoute = {...mockRoute, id: '2'};
      act(() => {
        result.current.selectRoute(newRoute);
      });

      expect(result.current.currentBooking.route).toEqual(newRoute);
      expect(result.current.currentBooking.selectedSeats).toEqual([]);
      expect(result.current.currentBooking.passengers).toEqual([]);
    });
  });

  describe('selectSeat and removeSeat', () => {
    it('should select a seat', () => {
      const {result} = renderHook(() => useBookingStore());

      const mockSeat: Seat = {
        id: 's1',
        number: 'A1',
        isAvailable: true,
        price: 500000,
      };

      act(() => {
        result.current.selectSeat(mockSeat);
      });

      expect(result.current.currentBooking.selectedSeats).toContainEqual(mockSeat);
      expect(result.current.currentBooking.totalPrice).toBe(500000);
    });

    it('should select multiple seats', () => {
      const {result} = renderHook(() => useBookingStore());

      const seat1: Seat = {id: 's1', number: 'A1', isAvailable: true, price: 500000};
      const seat2: Seat = {id: 's2', number: 'A2', isAvailable: true, price: 500000};

      act(() => {
        result.current.selectSeat(seat1);
        result.current.selectSeat(seat2);
      });

      expect(result.current.currentBooking.selectedSeats).toHaveLength(2);
      expect(result.current.currentBooking.totalPrice).toBe(1000000);
    });

    it('should remove a seat', () => {
      const {result} = renderHook(() => useBookingStore());

      const seat1: Seat = {id: 's1', number: 'A1', isAvailable: true, price: 500000};
      const seat2: Seat = {id: 's2', number: 'A2', isAvailable: true, price: 500000};

      act(() => {
        result.current.selectSeat(seat1);
        result.current.selectSeat(seat2);
      });

      expect(result.current.currentBooking.selectedSeats).toHaveLength(2);

      act(() => {
        result.current.removeSeat('s1');
      });

      expect(result.current.currentBooking.selectedSeats).toHaveLength(1);
      expect(result.current.currentBooking.selectedSeats[0].id).toBe('s2');
      expect(result.current.currentBooking.totalPrice).toBe(500000);
    });

    it('should recalculate total price when adding/removing seats', () => {
      const {result} = renderHook(() => useBookingStore());

      const seat1: Seat = {id: 's1', number: 'A1', isAvailable: true, price: 500000};
      const seat2: Seat = {id: 's2', number: 'A2', isAvailable: true, price: 600000};

      act(() => {
        result.current.selectSeat(seat1);
      });
      expect(result.current.currentBooking.totalPrice).toBe(500000);

      act(() => {
        result.current.selectSeat(seat2);
      });
      expect(result.current.currentBooking.totalPrice).toBe(1100000);

      act(() => {
        result.current.removeSeat('s1');
      });
      expect(result.current.currentBooking.totalPrice).toBe(600000);
    });
  });

  describe('Passenger Management', () => {
    it('should add a passenger', () => {
      const {result} = renderHook(() => useBookingStore());

      const passenger: Passenger = {
        fullName: 'John Doe',
        phoneNumber: '0123456789',
        email: 'john@example.com',
        idNumber: '123456789',
      };

      act(() => {
        result.current.addPassenger(passenger);
      });

      expect(result.current.currentBooking.passengers).toContainEqual(passenger);
    });

    it('should update a passenger', () => {
      const {result} = renderHook(() => useBookingStore());

      const passenger1: Passenger = {
        fullName: 'John Doe',
        phoneNumber: '0123456789',
        email: 'john@example.com',
      };

      const passenger2: Passenger = {
        fullName: 'Jane Smith',
        phoneNumber: '0987654321',
        email: 'jane@example.com',
      };

      act(() => {
        result.current.addPassenger(passenger1);
        result.current.addPassenger(passenger2);
      });

      expect(result.current.currentBooking.passengers).toHaveLength(2);

      const updatedPassenger: Passenger = {
        fullName: 'John Updated',
        phoneNumber: '0111111111',
        email: 'johnupdated@example.com',
      };

      act(() => {
        result.current.updatePassenger(0, updatedPassenger);
      });

      expect(result.current.currentBooking.passengers[0]).toEqual(updatedPassenger);
      expect(result.current.currentBooking.passengers[1]).toEqual(passenger2);
    });
  });

  describe('setPaymentMethod', () => {
    it('should set payment method', () => {
      const {result} = renderHook(() => useBookingStore());

      act(() => {
        result.current.setPaymentMethod('vnpay');
      });

      expect(result.current.currentBooking.paymentMethod).toBe('vnpay');
    });
  });

  describe('confirmBooking', () => {
    it('should successfully confirm booking', async () => {
      const mockBookingId = 'booking-123';

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({bookingId: mockBookingId}),
      });

      const {result} = renderHook(() => useBookingStore());

      const bookingId = await act(async () => {
        return await result.current.confirmBooking();
      });

      expect(bookingId).toBe(mockBookingId);
      expect(result.current.currentBooking.id).toBe(mockBookingId);
      expect(result.current.currentBooking.status).toBe('confirmed');
    });

    it('should handle booking confirmation failure', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const {result} = renderHook(() => useBookingStore());

      await expect(
        act(async () => {
          await result.current.confirmBooking();
        })
      ).rejects.toThrow('Booking confirmation failed');
    });
  });

  describe('resetBooking', () => {
    it('should reset booking to initial state', () => {
      const {result} = renderHook(() => useBookingStore());

      // Set up some booking data
      const mockRoute: Route = {
        id: '1',
        departure: 'Hanoi',
        destination: 'Saigon',
        departureTime: '08:00',
        arrivalTime: '20:00',
        price: 500000,
        availableSeats: 30,
        vehicleType: 'Limousine',
      };

      const mockSeat: Seat = {
        id: 's1',
        number: 'A1',
        isAvailable: true,
        price: 500000,
      };

      act(() => {
        result.current.selectRoute(mockRoute);
        result.current.selectSeat(mockSeat);
        result.current.setPaymentMethod('vnpay');
      });

      expect(result.current.currentBooking.route).not.toBeNull();
      expect(result.current.currentBooking.selectedSeats).toHaveLength(1);

      // Reset
      act(() => {
        result.current.resetBooking();
      });

      expect(result.current.currentBooking.route).toBeNull();
      expect(result.current.currentBooking.selectedSeats).toEqual([]);
      expect(result.current.currentBooking.passengers).toEqual([]);
      expect(result.current.currentBooking.totalPrice).toBe(0);
      expect(result.current.currentBooking.paymentMethod).toBeNull();
      expect(result.current.currentBooking.status).toBe('pending');
    });
  });
});
