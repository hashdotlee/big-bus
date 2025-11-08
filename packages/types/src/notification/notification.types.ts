export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  ZALO = 'zalo',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  DELIVERED = 'delivered',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationType {
  BOOKING_CONFIRMATION = 'booking_confirmation',
  BOOKING_CANCELLATION = 'booking_cancellation',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  REFUND_PROCESSED = 'refund_processed',
  TRIP_REMINDER = 'trip_reminder',
  VEHICLE_DELAY = 'vehicle_delay',
  PROMOTIONAL = 'promotional',
  SYSTEM_ALERT = 'system_alert',
}

export interface INotification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  subject?: string;
  message: string;
  templateId?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failedReason?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendNotificationDto {
  userId: string;
  channel: NotificationChannel | NotificationChannel[];
  type: NotificationType;
  priority?: NotificationPriority;
  subject?: string;
  message?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
}

export interface SendBulkNotificationDto {
  userIds: string[];
  channel: NotificationChannel | NotificationChannel[];
  type: NotificationType;
  priority?: NotificationPriority;
  subject?: string;
  message?: string;
  templateId?: string;
  templateData?: Record<string, any>;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
}

export interface NotificationFilterDto {
  userId?: string;
  channel?: NotificationChannel;
  type?: NotificationType;
  status?: NotificationStatus;
  priority?: NotificationPriority;
  fromDate?: Date;
  toDate?: Date;
}
