import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ZaloNotification, NotificationResult } from '../../common/interfaces/notification.interface';

interface ZaloAccessTokenResponse {
  access_token: string;
  expires_in: number;
}

@Injectable()
export class ZaloService {
  private readonly logger = new Logger(ZaloService.name);
  private axiosInstance: AxiosInstance;
  private accessToken: string;
  private tokenExpiresAt: Date;

  constructor(private configService: ConfigService) {
    const zaloConfig = this.configService.get('zalo');
    this.axiosInstance = axios.create({
      baseURL: zaloConfig.apiUrl,
      timeout: 10000,
    });

    this.initializeAccessToken();
  }

  private async initializeAccessToken() {
    try {
      await this.refreshAccessToken();
      this.logger.log('Zalo access token initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Zalo access token:', error);
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const zaloConfig = this.configService.get('zalo');

    try {
      const response = await axios.post<ZaloAccessTokenResponse>(
        'https://oauth.zaloapp.com/v4/oa/access_token',
        {
          app_id: zaloConfig.oaId,
          grant_type: 'refresh_token',
          refresh_token: zaloConfig.refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            secret_key: zaloConfig.oaSecret,
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiresAt = new Date(Date.now() + response.data.expires_in * 1000);
      this.logger.log('Zalo access token refreshed successfully');
    } catch (error) {
      this.logger.error('Failed to refresh Zalo access token:', error);
      throw error;
    }
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || new Date() >= this.tokenExpiresAt) {
      await this.refreshAccessToken();
    }
  }

  async sendZaloMessage(notification: ZaloNotification): Promise<NotificationResult> {
    try {
      await this.ensureValidToken();

      this.logger.log(`Sending Zalo message to user ${notification.recipient}`);

      const response = await this.axiosInstance.post(
        '/oa/message/cs',
        {
          recipient: {
            user_id: notification.recipient,
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: notification.templateId,
                elements: [notification.templateData],
              },
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            access_token: this.accessToken,
          },
        },
      );

      if (response.data.error === 0) {
        this.logger.log(`Zalo message sent successfully: ${response.data.message}`);
        return {
          success: true,
          messageId: response.data.data?.msg_id || 'success',
          timestamp: new Date(),
        };
      } else {
        throw new Error(`Zalo API error: ${response.data.message}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send Zalo message to ${notification.recipient}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async sendTextMessage(userId: string, message: string): Promise<NotificationResult> {
    try {
      await this.ensureValidToken();

      this.logger.log(`Sending Zalo text message to user ${userId}`);

      const response = await this.axiosInstance.post(
        '/oa/message/cs',
        {
          recipient: {
            user_id: userId,
          },
          message: {
            text: message,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            access_token: this.accessToken,
          },
        },
      );

      if (response.data.error === 0) {
        return {
          success: true,
          messageId: response.data.data?.msg_id || 'success',
          timestamp: new Date(),
        };
      } else {
        throw new Error(`Zalo API error: ${response.data.message}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send Zalo text message to ${userId}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async sendImageMessage(userId: string, imageUrl: string): Promise<NotificationResult> {
    try {
      await this.ensureValidToken();

      const response = await this.axiosInstance.post(
        '/oa/message/cs',
        {
          recipient: {
            user_id: userId,
          },
          message: {
            attachment: {
              type: 'template',
              payload: {
                template_type: 'media',
                elements: [
                  {
                    media_type: 'image',
                    url: imageUrl,
                  },
                ],
              },
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            access_token: this.accessToken,
          },
        },
      );

      if (response.data.error === 0) {
        return {
          success: true,
          messageId: response.data.data?.msg_id || 'success',
          timestamp: new Date(),
        };
      } else {
        throw new Error(`Zalo API error: ${response.data.message}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send Zalo image to ${userId}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async getUserProfile(userId: string): Promise<any> {
    try {
      await this.ensureValidToken();

      const response = await this.axiosInstance.get('/oa/getprofile', {
        params: {
          data: JSON.stringify({
            user_id: userId,
          }),
        },
        headers: {
          access_token: this.accessToken,
        },
      });

      if (response.data.error === 0) {
        return response.data.data;
      } else {
        throw new Error(`Zalo API error: ${response.data.message}`);
      }
    } catch (error) {
      this.logger.error(`Failed to get Zalo user profile for ${userId}:`, error);
      throw error;
    }
  }
}
