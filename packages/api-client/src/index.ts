// Export base client
export { BaseApiClient } from './base-client';

// Export configuration
export { ApiClientConfig, DEFAULT_CONFIG, SERVICE_URLS } from './config';

// Export interceptors
export * from './interceptors';

// Export services
export * from './services';

// Export utilities
export { WebSocketClient, TrackingWebSocketClient } from './utils/websocket-client';

// Create singleton instances for easy use
import { AuthService } from './services/auth.service';
import { BookingService } from './services/booking.service';
import { PaymentService } from './services/payment.service';
import { VehicleService } from './services/vehicle.service';
import { NotificationService } from './services/notification.service';
import { AnalyticsService } from './services/analytics.service';

export const authService = new AuthService();
export const bookingService = new BookingService();
export const paymentService = new PaymentService();
export const vehicleService = new VehicleService();
export const notificationService = new NotificationService();
export const analyticsService = new AnalyticsService();

// Export a default API object
export const api = {
  auth: authService,
  booking: bookingService,
  payment: paymentService,
  vehicle: vehicleService,
  notification: notificationService,
  analytics: analyticsService,
};
