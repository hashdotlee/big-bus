import { Controller, Post, Body, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SmsService } from './sms.service';
import { SendSmsDto } from '../../common/dto/send-sms.dto';
import { NotificationType } from '../../common/constants/notification.constants';
import { SmsNotification } from '../../common/interfaces/notification.interface';

@ApiTags('SMS Notifications')
@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an SMS notification' })
  @ApiResponse({ status: 200, description: 'SMS sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendSms(@Body() sendSmsDto: SendSmsDto) {
    const notification: SmsNotification = {
      type: NotificationType.SMS,
      template: sendSmsDto.template,
      recipient: sendSmsDto.recipient,
      message: sendSmsDto.message,
      data: sendSmsDto.data,
      sender: sendSmsDto.sender,
      priority: sendSmsDto.priority,
      metadata: sendSmsDto.metadata,
    };

    const result = await this.smsService.sendSms(notification);

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      timestamp: result.timestamp,
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check SMS service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'sms',
      timestamp: new Date(),
    };
  }
}
