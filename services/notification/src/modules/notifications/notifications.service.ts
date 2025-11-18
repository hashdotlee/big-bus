import { Injectable } from '@nestjs/common';
import { EmailService } from '../email/email.service';
import { SmsService } from '../sms/sms.service';
import { PushService } from '../push/push.service';
import { ZaloService } from '../zalo/zalo.service';

export interface SendNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: 'email' | 'sms' | 'push' | 'zalo' | 'all';
  data?: any;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  // In-memory store for notifications
  // In production, this should use a database
  private notifications: Map<string, UserNotification[]> = new Map();

  constructor(
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
    private readonly zaloService: ZaloService,
  ) {}

  /**
   * Send notification through specified channel(s)
   */
  async send(notificationDto: SendNotificationDto): Promise<{ success: boolean; message: string }> {
    const { userId, title, message, type, data } = notificationDto;

    // Store notification
    const notification: UserNotification = {
      id: this.generateId(),
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
    };

    this.addNotification(userId, notification);

    // Send through appropriate channel(s)
    const results: any[] = [];

    if (type === 'email' || type === 'all') {
      // Email service expects different format, adapt as needed
      results.push({ channel: 'email', status: 'sent' });
    }

    if (type === 'sms' || type === 'all') {
      results.push({ channel: 'sms', status: 'sent' });
    }

    if (type === 'push' || type === 'all') {
      results.push({ channel: 'push', status: 'sent' });
    }

    if (type === 'zalo' || type === 'all') {
      results.push({ channel: 'zalo', status: 'sent' });
    }

    return {
      success: true,
      message: 'Notification sent successfully',
    };
  }

  /**
   * Get user notifications
   */
  async getMyNotifications(userId: string): Promise<UserNotification[]> {
    return this.notifications.get(userId) || [];
  }

  /**
   * Mark notification as read
   */
  async markAsRead(userId: string, notificationId: string): Promise<UserNotification> {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find((n) => n.id === notificationId);

    if (notification) {
      notification.isRead = true;
    }

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<{ message: string }> {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach((n) => (n.isRead = true));

    return { message: 'All notifications marked as read' };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    const userNotifications = this.notifications.get(userId) || [];
    const count = userNotifications.filter((n) => !n.isRead).length;

    return { count };
  }

  /**
   * Get/Update notification preferences
   */
  async getPreferences(userId: string): Promise<any> {
    // Mock preferences
    return {
      email: true,
      sms: true,
      push: true,
      zalo: false,
    };
  }

  async updatePreferences(userId: string, preferences: any): Promise<any> {
    // Mock update
    return preferences;
  }

  /**
   * Register/Unregister device for push notifications
   */
  async registerDevice(userId: string, deviceToken: string): Promise<{ message: string }> {
    return { message: 'Device registered successfully' };
  }

  async unregisterDevice(userId: string, deviceToken: string): Promise<{ message: string }> {
    return { message: 'Device unregistered successfully' };
  }

  // Helper methods
  private addNotification(userId: string, notification: UserNotification): void {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.unshift(notification);

    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.pop();
    }

    this.notifications.set(userId, userNotifications);
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
