// Common types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar?: string;
  role: 'customer' | 'driver' | 'admin';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Route & Schedule types
export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Route {
  id: string;
  origin: Station;
  destination: Station;
  distance: number;
  estimatedDuration: number;
  isActive: boolean;
  stops?: Station[];
}

export interface Schedule {
  id: string;
  route: Route;
  departureTime: string;
  arrivalTime: string;
  vehicle: Vehicle;
  price: number;
  availableSeats: number;
  totalSeats: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// Vehicle types
export type VehicleType = 'standard' | 'limousine' | 'sleeper';

export interface Vehicle {
  id: string;
  licensePlate: string;
  type: VehicleType;
  model: string;
  totalSeats: number;
  amenities: string[];
  seatLayout: SeatLayout;
}

export interface SeatLayout {
  rows: number;
  columns: number;
  floors?: number;
  seats: Seat[];
}

export interface Seat {
  id: string;
  number: string;
  type: 'standard' | 'vip';
  floor?: number;
  row: number;
  column: number;
  position: 'window' | 'aisle' | 'middle';
}

// Booking types
export interface Booking {
  id: string;
  bookingCode: string;
  user: User;
  schedule: Schedule;
  seats: BookingSeat[];
  passengers: Passenger[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment?: Payment;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSeat {
  seat: Seat;
  price: number;
  passenger: Passenger;
}

export interface Passenger {
  id?: string;
  fullName: string;
  idNumber?: string;
  phoneNumber?: string;
  email?: string;
}

// Payment types
export type PaymentMethod = 'vnpay' | 'momo' | 'zalopay' | 'wallet' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  booking: Booking;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Promotion types
export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

// Search types
export interface SearchParams {
  originId: string;
  destinationId: string;
  departureDate: string;
  passengers?: number;
  vehicleType?: VehicleType;
}

export interface SearchFilters {
  departureTime?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  vehicleTypes?: VehicleType[];
  amenities?: string[];
  sortBy?: 'price' | 'duration' | 'departure' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'payment' | 'promotion' | 'system';
  isRead: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

// Analytics types
export interface BookingStats {
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
}
