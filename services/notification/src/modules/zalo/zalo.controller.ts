import { Controller, Post, Body, HttpStatus, HttpCode, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ZaloService } from './zalo.service';
import { SendZaloDto } from '../../common/dto/send-zalo.dto';
import { NotificationType } from '../../common/constants/notification.constants';
import { ZaloNotification } from '../../common/interfaces/notification.interface';

@ApiTags('Zalo OA Notifications')
@Controller('zalo')
export class ZaloController {
  constructor(private readonly zaloService: ZaloService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a Zalo OA notification' })
  @ApiResponse({ status: 200, description: 'Zalo notification sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendZalo(@Body() sendZaloDto: SendZaloDto) {
    const notification: ZaloNotification = {
      type: NotificationType.ZALO,
      template: sendZaloDto.template,
      recipient: sendZaloDto.recipient,
      templateId: sendZaloDto.templateId,
      templateData: sendZaloDto.templateData,
      data: sendZaloDto.templateData,
      priority: sendZaloDto.priority,
      metadata: sendZaloDto.metadata,
    };

    const result = await this.zaloService.sendZaloMessage(notification);

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      timestamp: result.timestamp,
    };
  }

  @Post('text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a text message via Zalo OA' })
  @ApiResponse({ status: 200, description: 'Text message sent successfully' })
  async sendText(@Body() body: { userId: string; message: string }) {
    const result = await this.zaloService.sendTextMessage(body.userId, body.message);
    return result;
  }

  @Post('image')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send an image via Zalo OA' })
  @ApiResponse({ status: 200, description: 'Image sent successfully' })
  async sendImage(@Body() body: { userId: string; imageUrl: string }) {
    const result = await this.zaloService.sendImageMessage(body.userId, body.imageUrl);
    return result;
  }

  @Get('profile/:userId')
  @ApiOperation({ summary: 'Get Zalo user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getUserProfile(@Param('userId') userId: string) {
    const profile = await this.zaloService.getUserProfile(userId);
    return profile;
  }

  @Get('health')
  @ApiOperation({ summary: 'Check Zalo service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      service: 'zalo',
      timestamp: new Date(),
    };
  }
}
