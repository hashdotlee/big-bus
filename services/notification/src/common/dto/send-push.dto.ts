import { IsString, IsOptional, IsEnum, IsObject, IsNumber, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPriority, NotificationTemplate } from '../constants/notification.constants';

export class SendPushDto {
  @ApiProperty({ example: 'device-token-or-user-id', description: 'Device token or user ID' })
  @IsString()
  recipient: string;

  @ApiProperty({ example: 'push-booking-status', enum: NotificationTemplate })
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @ApiProperty({ example: 'Booking Confirmed' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Your booking for Hanoi to Ho Chi Minh has been confirmed' })
  @IsString()
  body: string;

  @ApiProperty({ example: { bookingId: '123', screen: 'BookingDetails' } })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  badge?: number;

  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  sound?: string;

  @ApiPropertyOptional({ example: 'high', enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
