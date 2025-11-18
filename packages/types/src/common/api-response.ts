/**
 * Standard API Response format for all services
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
  timestamp: string;
}

/**
 * API Error interface
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Standard pagination query parameters
 */
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Error codes enum
 */
export enum ErrorCodes {
  // Auth errors (1xxx)
  INVALID_CREDENTIALS = 'AUTH_1001',
  TOKEN_EXPIRED = 'AUTH_1002',
  UNAUTHORIZED = 'AUTH_1003',
  FORBIDDEN = 'AUTH_1004',
  EMAIL_ALREADY_EXISTS = 'AUTH_1005',
  PHONE_ALREADY_EXISTS = 'AUTH_1006',
  INVALID_TOKEN = 'AUTH_1007',
  TWO_FACTOR_REQUIRED = 'AUTH_1008',

  // Booking errors (2xxx)
  BOOKING_NOT_FOUND = 'BOOK_2001',
  SEATS_NOT_AVAILABLE = 'BOOK_2002',
  SCHEDULE_FULL = 'BOOK_2003',
  BOOKING_CANCELLED = 'BOOK_2004',
  SCHEDULE_NOT_FOUND = 'BOOK_2005',
  ROUTE_NOT_FOUND = 'BOOK_2006',
  STATION_NOT_FOUND = 'BOOK_2007',
  INVALID_BOOKING_DATE = 'BOOK_2008',

  // Payment errors (3xxx)
  PAYMENT_FAILED = 'PAY_3001',
  INSUFFICIENT_BALANCE = 'PAY_3002',
  PAYMENT_TIMEOUT = 'PAY_3003',
  REFUND_FAILED = 'PAY_3004',
  INVALID_PAYMENT_METHOD = 'PAY_3005',
  TRANSACTION_NOT_FOUND = 'PAY_3006',

  // Vehicle errors (4xxx)
  VEHICLE_NOT_FOUND = 'VEH_4001',
  VEHICLE_UNAVAILABLE = 'VEH_4002',
  MAINTENANCE_REQUIRED = 'VEH_4003',

  // General errors (9xxx)
  VALIDATION_ERROR = 'GEN_9001',
  INTERNAL_ERROR = 'GEN_9002',
  NOT_FOUND = 'GEN_9003',
  RATE_LIMIT_EXCEEDED = 'GEN_9004',
  BAD_REQUEST = 'GEN_9005',
}
