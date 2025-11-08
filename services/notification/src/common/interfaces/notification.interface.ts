import { NotificationPriority, NotificationStatus, NotificationTemplate, NotificationType } from '../constants/notification.constants';

export interface BaseNotification {
  id?: string;
  type: NotificationType;
  template: NotificationTemplate;
  recipient: string;
  data: Record<string, any>;
  priority?: NotificationPriority;
  scheduledAt?: Date;
  status?: NotificationStatus;
  retryCount?: number;
  metadata?: Record<string, any>;
}

export interface EmailNotification extends BaseNotification {
  type: NotificationType.EMAIL;
  recipient: string; // email address
  subject: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

export interface SmsNotification extends BaseNotification {
  type: NotificationType.SMS;
  recipient: string; // phone number
  message: string;
  sender?: string;
}

export interface PushNotification extends BaseNotification {
  type: NotificationType.PUSH;
  recipient: string; // device token or user ID
  title: string;
  body: string;
  imageUrl?: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
}

export interface ZaloNotification extends BaseNotification {
  type: NotificationType.ZALO;
  recipient: string; // Zalo user ID
  templateId: string;
  templateData: Record<string, any>;
}

export type Notification =
  | EmailNotification
  | SmsNotification
  | PushNotification
  | ZaloNotification;

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export interface NotificationLog {
  notificationId: string;
  type: NotificationType;
  recipient: string;
  status: NotificationStatus;
  attempts: number;
  error?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
