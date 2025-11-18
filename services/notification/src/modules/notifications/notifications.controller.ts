import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService, SendNotificationDto } from './notifications.service';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send notification to user' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  send(@Body() sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.send(sendNotificationDto);
  }

  @Get('my-notifications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'Return user notifications' })
  getMyNotifications(@Request() req: any) {
    const userId = req.user?.id || 'temp-user-id';
    return this.notificationsService.getMyNotifications(userId);
  }

  @Post(':id/read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(@Request() req: any, @Param('id') id: string) {
    const userId = req.user?.id || 'temp-user-id';
    return this.notificationsService.markAsRead(userId, id);
  }

  @Post('mark-all-read')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(@Request() req: any) {
    const userId = req.user?.id || 'temp-user-id';
    return this.notificationsService.markAllAsRead(userId);
  }

  @Get('unread-count')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Return unread count' })
  getUnreadCount(@Request() req: any) {
    const userId = req.user?.id || 'temp-user-id';
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Return notification preferences' })
  getPreferences(@Request() req: any) {
    const userId = req.user?.id || 'temp-user-id';
    return this.notificationsService.getPreferences(userId);
  }

  @Put('preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  updatePreferences(@Request() req: any, @Body() preferences: any) {
    const userId = req.user?.id || 'temp-user-id';
    return this.notificationsService.updatePreferences(userId, preferences);
  }

  @Post('devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Register device for push notifications' })
  @ApiResponse({ status: 200, description: 'Device registered successfully' })
  registerDevice(@Request() req: any, @Body('deviceToken') deviceToken: string) {
    const userId = req.user?.id || 'temp-user-id';
    return this.notificationsService.registerDevice(userId, deviceToken);
  }

  @Delete('devices')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unregister device from push notifications' })
  @ApiResponse({ status: 200, description: 'Device unregistered successfully' })
  unregisterDevice(@Request() req: any, @Body('deviceToken') deviceToken: string) {
    const userId = req.user?.id || 'temp-user-id';
    return this.notificationsService.unregisterDevice(userId, deviceToken);
  }
}
