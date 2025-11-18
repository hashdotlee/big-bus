import {Route, Seat, Passenger} from '@store/bookingStore';

// Mock Users
export const mockUsers = {
  validUser: {
    id: '1',
    email: 'test@example.com',
    fullName: 'Test User',
    phoneNumber: '0123456789',
    role: 'user',
  },
  adminUser: {
    id: '2',
    email: 'admin@example.com',
    fullName: 'Admin User',
    phoneNumber: '0987654321',
    role: 'admin',
  },
};

// Mock Tokens
export const mockTokens = {
  validToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mocktoken',
  expiredToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expiredtoken',
};

// Mock Routes
export const mockRoutes: Route[] = [
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
  {
    id: '3',
    departure: 'Hanoi',
    destination: 'Da Nang',
    departureTime: '09:00',
    arrivalTime: '18:00',
    price: 350000,
    availableSeats: 20,
    vehicleType: 'Standard',
  },
];

// Mock Seats
export const mockSeats: Seat[] = [
  {id: 's1', number: 'A1', isAvailable: true, price: 500000},
  {id: 's2', number: 'A2', isAvailable: true, price: 500000},
  {id: 's3', number: 'A3', isAvailable: true, price: 500000},
  {id: 's4', number: 'A4', isAvailable: true, price: 500000},
  {id: 's5', number: 'A5', isAvailable: true, price: 500000},
  {id: 's6', number: 'B1', isAvailable: true, price: 500000},
  {id: 's7', number: 'B2', isAvailable: true, price: 500000},
  {id: 's8', number: 'B3', isAvailable: true, price: 500000},
  {id: 's9', number: 'B4', isAvailable: false, price: 500000},
  {id: 's10', number: 'B5', isAvailable: false, price: 500000},
];

// Mock Passengers
export const mockPassengers: Passenger[] = [
  {
    fullName: 'John Doe',
    phoneNumber: '0123456789',
    email: 'john@example.com',
    idNumber: '123456789',
  },
  {
    fullName: 'Jane Smith',
    phoneNumber: '0987654321',
    email: 'jane@example.com',
    idNumber: '987654321',
  },
];

// Mock Bookings
export const mockBookings = [
  {
    id: 'BK-001',
    userId: '1',
    route: mockRoutes[0],
    selectedSeats: [mockSeats[0], mockSeats[1]],
    passengers: mockPassengers,
    totalPrice: 1000000,
    paymentMethod: 'vnpay',
    status: 'confirmed',
    bookingDate: '2024-01-15T10:30:00Z',
    travelDate: '2024-02-01',
  },
  {
    id: 'BK-002',
    userId: '1',
    route: mockRoutes[2],
    selectedSeats: [mockSeats[0]],
    passengers: [mockPassengers[0]],
    totalPrice: 350000,
    paymentMethod: 'momo',
    status: 'pending',
    bookingDate: '2024-01-16T14:20:00Z',
    travelDate: '2024-02-05',
  },
];

// Mock Payment Methods
export const mockPaymentMethods = [
  {id: 'vnpay', name: 'VNPay', icon: 'vnpay-icon'},
  {id: 'momo', name: 'Momo', icon: 'momo-icon'},
  {id: 'zalopay', name: 'ZaloPay', icon: 'zalopay-icon'},
  {id: 'wallet', name: 'Wallet', icon: 'wallet-icon'},
];

// Mock Notifications
export const mockNotifications = [
  {
    id: 'n1',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Your booking BK-001 has been confirmed',
    timestamp: '2024-01-15T10:35:00Z',
    read: false,
  },
  {
    id: 'n2',
    type: 'trip_reminder',
    title: 'Trip Reminder',
    message: 'Your trip to Saigon departs in 2 hours',
    timestamp: '2024-02-01T06:00:00Z',
    read: false,
  },
  {
    id: 'n3',
    type: 'payment_success',
    title: 'Payment Successful',
    message: 'Payment of 1,000,000 VND received',
    timestamp: '2024-01-15T10:31:00Z',
    read: true,
  },
];

// Mock API Responses
export const mockApiResponses = {
  login: {
    success: {
      user: mockUsers.validUser,
      token: mockTokens.validToken,
    },
    failure: {
      error: 'Invalid credentials',
    },
  },
  register: {
    success: {
      user: {
        id: '3',
        email: 'newuser@example.com',
        fullName: 'New User',
        role: 'user',
      },
      token: 'new-user-token',
    },
    failure: {
      error: 'Email already exists',
    },
  },
  searchRoutes: {
    success: {
      routes: mockRoutes,
    },
    empty: {
      routes: [],
    },
  },
  createBooking: {
    success: {
      bookingId: 'BK-123456',
      status: 'confirmed',
    },
    failure: {
      error: 'Booking failed',
    },
  },
};

// Helper function to create mock fetch response
export const createMockFetchResponse = (data: any, ok: boolean = true, status: number = 200) => {
  return Promise.resolve({
    ok,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
};

// Helper function to create mock fetch error
export const createMockFetchError = (message: string = 'Network error') => {
  return Promise.reject(new Error(message));
};
