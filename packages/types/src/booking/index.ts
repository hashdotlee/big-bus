/**
 * Booking status enum
 */
export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  REFUNDED = 'refunded',
}

/**
 * Booking type enum
 */
export enum BookingType {
  ONE_WAY = 'one_way',
  ROUND_TRIP = 'round_trip',
}

/**
 * Vehicle type enum
 */
export enum VehicleType {
  ECONOMY = 'economy',
  VIP = 'vip',
  SLEEPER = 'sleeper',
}

/**
 * Passenger gender enum
 */
export enum PassengerGender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

/**
 * Passenger information
 */
export interface Passenger {
  id?: string;
  fullName: string;
  age: number;
  gender: PassengerGender;
  idNumber: string;
  seatNumber?: string;
}

/**
 * Station entity
 */
export interface Station {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Route entity
 */
export interface Route {
  id: string;
  name: string;
  originStationId: string;
  destinationStationId: string;
  distance: number; // in kilometers
  estimatedDuration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schedule entity
 */
export interface Schedule {
  id: string;
  routeId: string;
  vehicleId: string;
  departureTime: Date;
  arrivalTime: Date;
  basePrice: number;
  availableSeats: number;
  totalSeats: number;
  vehicleType: VehicleType;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Booking entity
 */
export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  scheduleId: string;
  pickupStationId: string;
  dropoffStationId: string;
  passengers: Passenger[];
  seatNumbers: string[];
  bookingType: BookingType;
  totalPrice: number;
  discount: number;
  finalPrice: number;
  status: BookingStatus;
  paymentId?: string;
  promotionCode?: string;
  specialRequests?: string;
  qrCode?: string;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create booking DTO
 */
export interface CreateBookingDto {
  scheduleId: string;
  passengers: Passenger[];
  seatNumbers?: string[];
  pickupStationId: string;
  dropoffStationId: string;
  promotionCode?: string;
  specialRequests?: string;
  bookingType: BookingType;
}

/**
 * Search schedule DTO
 */
export interface SearchScheduleDto {
  originStationId: string;
  destinationStationId: string;
  departureDate: string; // ISO date string
  passengerCount?: number;
  vehicleType?: VehicleType;
}

/**
 * Calculate price DTO
 */
export interface CalculatePriceDto {
  scheduleId: string;
  passengerCount: number;
  pickupStationId: string;
  dropoffStationId: string;
  promotionCode?: string;
}

/**
 * Price calculation response
 */
export interface PriceCalculation {
  basePrice: number;
  discount: number;
  finalPrice: number;
  breakdown: {
    ticketPrice: number;
    serviceFee: number;
    tax: number;
    promotionDiscount: number;
  };
}

/**
 * Seat layout
 */
export interface SeatLayout {
  rows: SeatRow[];
  totalSeats: number;
  availableSeats: string[];
  occupiedSeats: string[];
}

/**
 * Seat row
 */
export interface SeatRow {
  rowNumber: number;
  seats: Seat[];
}

/**
 * Seat
 */
export interface Seat {
  id: string;
  number: string;
  type: 'regular' | 'vip' | 'sleeper';
  isAvailable: boolean;
  price?: number;
}

/**
 * Cancel booking DTO
 */
export interface CancelBookingDto {
  bookingId: string;
  reason?: string;
}

/**
 * Rate booking DTO
 */
export interface RateBookingDto {
  bookingId: string;
  rating: number; // 1-5
  review?: string;
}

/**
 * Subscription booking
 */
export interface SubscriptionBooking {
  id: string;
  userId: string;
  routeId: string;
  schedulePattern: string; // e.g., "MON,WED,FRI"
  startDate: Date;
  endDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
