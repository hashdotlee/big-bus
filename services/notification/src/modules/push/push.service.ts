import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { PushNotification, NotificationResult } from '../../common/interfaces/notification.interface';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private firebaseApp: admin.app.App;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    const firebaseConfig = this.configService.get('firebase');

    if (!firebaseConfig.projectId || !firebaseConfig.privateKey || !firebaseConfig.clientEmail) {
      this.logger.warn('Firebase credentials not configured. Push notifications will not work.');
      return;
    }

    try {
      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: firebaseConfig.projectId,
          privateKey: firebaseConfig.privateKey,
          clientEmail: firebaseConfig.clientEmail,
        }),
        databaseURL: firebaseConfig.databaseURL,
      });

      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async sendPushNotification(notification: PushNotification): Promise<NotificationResult> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      this.logger.log(`Sending push notification to ${notification.recipient}`);

      const message: admin.messaging.Message = {
        token: notification.recipient,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        android: {
          priority: 'high',
          notification: {
            sound: notification.sound || 'default',
            priority: 'high',
            channelId: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: notification.badge,
              sound: notification.sound || 'default',
              contentAvailable: true,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);

      this.logger.log(`Push notification sent successfully: ${response}`);

      return {
        success: true,
        messageId: response,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification to ${notification.recipient}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async sendMulticast(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<NotificationResult> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      this.logger.log(`Sending multicast push notification to ${tokens.length} devices`);

      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
            },
          },
        },
      };

      const response = await admin.messaging().sendMulticast(message);

      this.logger.log(
        `Multicast sent. Success: ${response.successCount}, Failed: ${response.failureCount}`,
      );

      return {
        success: response.successCount > 0,
        messageId: `${response.successCount}/${tokens.length}`,
        error: response.failureCount > 0 ? `${response.failureCount} failed` : undefined,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to send multicast push notification:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async sendToTopic(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<NotificationResult> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      this.logger.log(`Sending push notification to topic: ${topic}`);

      const message: admin.messaging.Message = {
        topic,
        notification: {
          title,
          body,
        },
        data,
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);

      this.logger.log(`Push notification sent to topic ${topic}: ${response}`);

      return {
        success: true,
        messageId: response,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification to topic ${topic}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async subscribeToTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      const response = await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`Subscribed ${response.successCount} devices to topic ${topic}`);
      return response.successCount > 0;
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic ${topic}:`, error);
      return false;
    }
  }

  async unsubscribeFromTopic(tokens: string[], topic: string): Promise<boolean> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Firebase not initialized');
      }

      const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
      this.logger.log(`Unsubscribed ${response.successCount} devices from topic ${topic}`);
      return response.successCount > 0;
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic ${topic}:`, error);
      return false;
    }
  }
}
