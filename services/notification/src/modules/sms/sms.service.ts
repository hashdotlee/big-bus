import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';
import axios from 'axios';
import { SmsNotification, NotificationResult } from '../../common/interfaces/notification.interface';
import { SMS_PROVIDERS } from '../../common/constants/notification.constants';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: Twilio;
  private smsProvider: string;

  constructor(private configService: ConfigService) {
    this.smsProvider = this.configService.get('sms.provider');
    this.initializeProvider();
  }

  private initializeProvider() {
    if (this.smsProvider === SMS_PROVIDERS.TWILIO) {
      this.initializeTwilio();
    }
    this.logger.log(`SMS provider initialized: ${this.smsProvider}`);
  }

  private initializeTwilio() {
    const twilioConfig = this.configService.get('sms.twilio');
    if (twilioConfig.accountSid && twilioConfig.authToken) {
      this.twilioClient = new Twilio(twilioConfig.accountSid, twilioConfig.authToken);
    } else {
      this.logger.warn('Twilio credentials not configured');
    }
  }

  async sendSms(notification: SmsNotification): Promise<NotificationResult> {
    try {
      this.logger.log(`Sending SMS to ${notification.recipient} via ${this.smsProvider}`);

      let result: NotificationResult;

      switch (this.smsProvider) {
        case SMS_PROVIDERS.TWILIO:
          result = await this.sendViaTwilio(notification);
          break;
        case SMS_PROVIDERS.ESMS:
          result = await this.sendViaESMS(notification);
          break;
        default:
          throw new Error(`Unsupported SMS provider: ${this.smsProvider}`);
      }

      this.logger.log(`SMS sent successfully to ${notification.recipient}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${notification.recipient}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  private async sendViaTwilio(notification: SmsNotification): Promise<NotificationResult> {
    if (!this.twilioClient) {
      throw new Error('Twilio client not initialized');
    }

    const twilioConfig = this.configService.get('sms.twilio');
    const message = await this.twilioClient.messages.create({
      body: notification.message,
      from: notification.sender || twilioConfig.phoneNumber,
      to: notification.recipient,
    });

    return {
      success: true,
      messageId: message.sid,
      timestamp: new Date(),
    };
  }

  private async sendViaESMS(notification: SmsNotification): Promise<NotificationResult> {
    const esmsConfig = this.configService.get('sms.esms');

    if (!esmsConfig.apiKey || !esmsConfig.secretKey) {
      throw new Error('ESMS credentials not configured');
    }

    try {
      const response = await axios.post('http://rest.esms.vn/MainService.svc/json/SendMultipleMessage_V4_post_json/', {
        ApiKey: esmsConfig.apiKey,
        SecretKey: esmsConfig.secretKey,
        Phone: notification.recipient,
        Content: notification.message,
        Brandname: notification.sender || esmsConfig.brandName,
        SmsType: 2, // 2 = Brandname, 4 = Brandname with Unicode
      });

      if (response.data.CodeResult === '100') {
        return {
          success: true,
          messageId: response.data.SMSID,
          timestamp: new Date(),
        };
      } else {
        throw new Error(`ESMS error: ${response.data.ErrorMessage}`);
      }
    } catch (error) {
      throw new Error(`ESMS request failed: ${error.message}`);
    }
  }

  async sendBulkSms(notifications: SmsNotification[]): Promise<NotificationResult[]> {
    const results = await Promise.all(
      notifications.map((notification) => this.sendSms(notification)),
    );
    return results;
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<NotificationResult> {
    const notification: SmsNotification = {
      type: null,
      template: null,
      recipient: phoneNumber,
      message: `Your OTP code is: ${otp}. Valid for 5 minutes.`,
      data: { otp },
    };

    return this.sendSms(notification);
  }
}
