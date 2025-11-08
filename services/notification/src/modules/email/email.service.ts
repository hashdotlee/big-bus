import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { EmailNotification, NotificationResult } from '../../common/interfaces/notification.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
    this.registerHandlebarsHelpers();
  }

  private initializeTransporter() {
    const smtpConfig = this.configService.get('email.smtp');

    this.transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: smtpConfig.auth,
    });

    // Verify connection
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error);
      } else {
        this.logger.log('SMTP server is ready to send emails');
      }
    });
  }

  private registerHandlebarsHelpers() {
    Handlebars.registerHelper('formatDate', (date: Date, format: string) => {
      // Simple date formatting - you can enhance this
      return new Date(date).toLocaleDateString('vi-VN');
    });

    Handlebars.registerHelper('formatCurrency', (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(amount);
    });

    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
  }

  private async getTemplate(templateName: string): Promise<HandlebarsTemplateDelegate> {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName);
    }

    const templateDir = this.configService.get('templates.dir');
    const templatePath = path.join(process.cwd(), templateDir, 'email', `${templateName}.hbs`);

    try {
      const templateContent = await fs.promises.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);
      this.templateCache.set(templateName, template);
      return template;
    } catch (error) {
      this.logger.error(`Failed to load template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  async sendEmail(notification: EmailNotification): Promise<NotificationResult> {
    try {
      this.logger.log(`Sending email to ${notification.recipient}`);

      // Get and compile template
      const template = await this.getTemplate(notification.template);
      const html = template(notification.data);

      // Prepare email options
      const fromConfig = this.configService.get('email.from');
      const mailOptions = {
        from: `"${fromConfig.name}" <${fromConfig.email}>`,
        to: notification.recipient,
        subject: notification.subject,
        html,
        cc: notification.cc,
        bcc: notification.bcc,
        attachments: notification.attachments,
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      this.logger.log(`Email sent successfully to ${notification.recipient}: ${result.messageId}`);

      return {
        success: true,
        messageId: result.messageId,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${notification.recipient}:`, error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date(),
      };
    }
  }

  async sendBulkEmails(notifications: EmailNotification[]): Promise<NotificationResult[]> {
    const results = await Promise.all(
      notifications.map((notification) => this.sendEmail(notification)),
    );
    return results;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      this.logger.error('SMTP verification failed:', error);
      return false;
    }
  }
}
