// Email specific types
export interface EmailConfig {
  from: string;
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  subject: string;
  body: string;
  html?: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  filename: string;
  content?: Buffer | string;
  path?: string;
  contentType?: string;
}

// SMS specific types
export interface SmsConfig {
  to: string | string[];
  message: string;
  senderId?: string;
}

// Push notification specific types
export interface PushConfig {
  deviceTokens: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

// Zalo specific types
export interface ZaloConfig {
  userId: string | string[];
  templateId: string;
  templateData: Record<string, any>;
}

export interface ZaloOAResponse {
  error: number;
  message: string;
  data?: {
    msg_id: string;
  };
}
