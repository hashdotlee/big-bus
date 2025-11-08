import { Controller, Post, Body, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EmailService } from './email.service';
import { SendEmailDto } from '../../common/dto/send-email.dto';
import { NotificationType } from '../../common/constants/notification.constants';
import { EmailNotification } from '../../common/interfaces/notification.interface';

@ApiTags('Email Notifications')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an email notification' })
  @ApiResponse({ status: 200, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    const notification: EmailNotification = {
      type: NotificationType.EMAIL,
      template: sendEmailDto.template,
      recipient: sendEmailDto.recipient,
      subject: sendEmailDto.subject,
      data: sendEmailDto.data,
      cc: sendEmailDto.cc,
      bcc: sendEmailDto.bcc,
      priority: sendEmailDto.priority,
      metadata: sendEmailDto.metadata,
    };

    const result = await this.emailService.sendEmail(notification);

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      timestamp: result.timestamp,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check email service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    const isConnected = await this.emailService.verifyConnection();
    return {
      status: isConnected ? 'healthy' : 'unhealthy',
      service: 'email',
      timestamp: new Date(),
    };
  }
}
