import { BaseApiClient } from '../base-client';
import { SERVICE_URLS } from '../config';
import {
  INotification,
  SendNotificationDto,
  NotificationFilterDto,
  INotificationTemplate,
} from '@big-bus/types';

export class NotificationService extends BaseApiClient {
  constructor() {
    super({ baseURL: SERVICE_URLS.notification });
  }

  // Notification operations
  async sendNotification(data: SendNotificationDto): Promise<INotification> {
    return this.post('/notifications/send', data);
  }

  async getMyNotifications(filter?: NotificationFilterDto): Promise<INotification[]> {
    return this.get('/notifications/my-notifications', { params: filter });
  }

  async getNotification(id: string): Promise<INotification> {
    return this.get(`/notifications/${id}`);
  }

  async markAsRead(id: string): Promise<INotification> {
    return this.patch(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<void> {
    return this.post('/notifications/mark-all-read');
  }

  async deleteNotification(id: string): Promise<void> {
    return this.delete(`/notifications/${id}`);
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.get('/notifications/unread-count');
  }

  // Notification preferences
  async getNotificationPreferences(): Promise<{
    email: boolean;
    sms: boolean;
    push: boolean;
    zalo: boolean;
  }> {
    return this.get('/notifications/preferences');
  }

  async updateNotificationPreferences(preferences: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
    zalo?: boolean;
  }): Promise<void> {
    return this.put('/notifications/preferences', preferences);
  }

  // Push notification device registration
  async registerDevice(deviceToken: string, platform: 'ios' | 'android' | 'web'): Promise<void> {
    return this.post('/notifications/devices', { deviceToken, platform });
  }

  async unregisterDevice(deviceToken: string): Promise<void> {
    return this.delete('/notifications/devices', { data: { deviceToken } });
  }
}
