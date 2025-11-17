import { NotificationChannel, NotificationType } from './notification.types';

export interface INotificationTemplate {
  id: string;
  name: string;
  channel: NotificationChannel;
  type: NotificationType;
  subject?: string;
  body: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateDto {
  name: string;
  channel: NotificationChannel;
  type: NotificationType;
  subject?: string;
  body: string;
  variables?: string[];
  isActive?: boolean;
}

export interface UpdateTemplateDto {
  name?: string;
  subject?: string;
  body?: string;
  variables?: string[];
  isActive?: boolean;
}

export interface RenderTemplateDto {
  templateId: string;
  data: Record<string, unknown>;
}

export interface RenderedTemplate {
  subject?: string;
  body: string;
}
