export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  ZALO = 'zalo',
}

export enum NotificationTemplate {
  // Email templates
  BOOKING_CONFIRMATION = 'booking-confirmation',
  BOOKING_CANCELLED = 'booking-cancelled',
  BOOKING_REMINDER = 'booking-reminder',
  PAYMENT_SUCCESS = 'payment-success',
  PAYMENT_FAILED = 'payment-failed',
  PASSWORD_RESET = 'password-reset',
  ACCOUNT_VERIFICATION = 'account-verification',
  REFUND_PROCESSED = 'refund-processed',

  // SMS templates
  SMS_BOOKING_CONFIRMATION = 'sms-booking-confirmation',
  SMS_BOOKING_REMINDER = 'sms-booking-reminder',
  SMS_OTP = 'sms-otp',

  // Push notification templates
  PUSH_BOOKING_STATUS = 'push-booking-status',
  PUSH_PROMOTIONAL = 'push-promotional',
  PUSH_VEHICLE_TRACKING = 'push-vehicle-tracking',

  // Zalo templates
  ZALO_BOOKING_CONFIRMATION = 'zalo-booking-confirmation',
  ZALO_PAYMENT_SUCCESS = 'zalo-payment-success',
}

export enum NotificationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SENT = 'sent',
  FAILED = 'failed',
  RETRY = 'retry',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export const NOTIFICATION_QUEUES = {
  EMAIL: 'notifications.email',
  SMS: 'notifications.sms',
  PUSH: 'notifications.push',
  ZALO: 'notifications.zalo',
} as const;

export const NOTIFICATION_EXCHANGES = {
  MAIN: 'notifications.exchange',
  DLX: 'notifications.dlx', // Dead Letter Exchange
} as const;

export const NOTIFICATION_ROUTING_KEYS = {
  EMAIL: 'notification.email',
  SMS: 'notification.sms',
  PUSH: 'notification.push',
  ZALO: 'notification.zalo',
} as const;

export const MAX_RETRY_ATTEMPTS = 3;
export const RETRY_DELAY = 5000; // 5 seconds

export const SMS_PROVIDERS = {
  TWILIO: 'twilio',
  ESMS: 'esms',
  VIETGUYS: 'vietguys',
} as const;
