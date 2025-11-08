export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  withCredentials?: boolean;
  headers?: Record<string, string>;
}

export const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api',
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const SERVICE_URLS = {
  auth: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost/api/auth',
  booking: process.env.NEXT_PUBLIC_BOOKING_SERVICE_URL || 'http://localhost/api',
  vehicle: process.env.NEXT_PUBLIC_VEHICLE_SERVICE_URL || 'http://localhost/api',
  payment: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost/api/v1',
  notification: process.env.NEXT_PUBLIC_NOTIFICATION_SERVICE_URL || 'http://localhost/api',
  analytics: process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_URL || 'http://localhost/api',
};
