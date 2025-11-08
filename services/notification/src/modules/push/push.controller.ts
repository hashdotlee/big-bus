import { Controller, Post, Body, HttpStatus, HttpCode, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PushService } from './push.service';
import { SendPushDto } from '../../common/dto/send-push.dto';
import { NotificationType } from '../../common/constants/notification.constants';
import { PushNotification } from '../../common/interfaces/notification.interface';

@ApiTags('Push Notifications')
@Controller('push')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a push notification' })
  @ApiResponse({ status: 200, description: 'Push notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendPush(@Body() sendPushDto: SendPushDto) {
    const notification: PushNotification = {
      type: NotificationType.PUSH,
      template: sendPushDto.template,
      recipient: sendPushDto.recipient,
      title: sendPushDto.title,
      body: sendPushDto.body,
      data: sendPushDto.data,
      imageUrl: sendPushDto.imageUrl,
      badge: sendPushDto.badge,
      sound: sendPushDto.sound,
      priority: sendPushDto.priority,
      metadata: sendPushDto.metadata,
    };

    const result = await this.pushService.sendPushNotification(notification);

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      timestamp: result.timestamp,
    };
  }

  @Post('multicast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send push notification to multiple devices' })
  @ApiResponse({ status: 200, description: 'Multicast sent successfully' })
  async sendMulticast(
    @Body() body: { tokens: string[]; title: string; body: string; data?: Record<string, string> },
  ) {
    const result = await this.pushService.sendMulticast(body.tokens, body.title, body.body, body.data);
    return result;
  }

  @Post('topic')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send push notification to a topic' })
  @ApiResponse({ status: 200, description: 'Topic notification sent successfully' })
  async sendToTopic(
    @Body() body: { topic: string; title: string; body: string; data?: Record<string, string> },
  ) {
    const result = await this.pushService.sendToTopic(body.topic, body.title, body.body, body.data);
    return result;
  }

  @Post('subscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Subscribe devices to a topic' })
  @ApiResponse({ status: 200, description: 'Subscribed successfully' })
  async subscribeToTopic(@Body() body: { tokens: string[]; topic: string }) {
    const success = await this.pushService.subscribeToTopic(body.tokens, body.topic);
    return { success };
  }

  @Post('unsubscribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unsubscribe devices from a topic' })
  @ApiResponse({ status: 200, description: 'Unsubscribed successfully' })
  async unsubscribeFromTopic(@Body() body: { tokens: string[]; topic: string }) {
    const success = await this.pushService.unsubscribeFromTopic(body.tokens, body.topic);
    return { success };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check push notification service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'push',
      timestamp: new Date(),
    };
  }
}
