export const APP_NAME = 'Big Bus';

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_COUNT: 3,
  RETRY_DELAY: 1000,
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@big-bus:auth_token',
  REFRESH_TOKEN: '@big-bus:refresh_token',
  USER_DATA: '@big-bus:user_data',
  LANGUAGE: '@big-bus:language',
  THEME: '@big-bus:theme',
  RECENT_SEARCHES: '@big-bus:recent_searches',
  FAVORITE_ROUTES: '@big-bus:favorite_routes',
};

export const ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',

  // Main Tabs
  HOME: 'Home',
  BOOKINGS: 'Bookings',
  PROFILE: 'Profile',

  // Booking Flow
  SEARCH: 'Search',
  SCHEDULE: 'Schedule',
  SEAT_SELECTION: 'SeatSelection',
  PAYMENT: 'Payment',
  BOOKING_CONFIRMATION: 'BookingConfirmation',
  BOOKING_DETAIL: 'BookingDetail',

  // Tracking
  TRACK_BUS: 'TrackBus',

  // Profile
  EDIT_PROFILE: 'EditProfile',
  CHANGE_PASSWORD: 'ChangePassword',
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings',
  HELP: 'Help',
  ABOUT: 'About',
} as const;

export const LANGUAGES = {
  EN: 'en',
  VI: 'vi',
} as const;

export const PAYMENT_METHODS = {
  VNPAY: 'vnpay',
  MOMO: 'momo',
  ZALOPAY: 'zalopay',
  CASH: 'cash',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const SEAT_STATUS = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  BOOKED: 'booked',
} as const;

export const VEHICLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
} as const;
