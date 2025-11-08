import { IsString, IsOptional, IsEnum, IsObject, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPriority, NotificationTemplate } from '../constants/notification.constants';

export class SendSmsDto {
  @ApiProperty({ example: '+84901234567', description: 'Recipient phone number with country code' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
  recipient: string;

  @ApiProperty({ example: 'sms-booking-confirmation', enum: NotificationTemplate })
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @ApiProperty({ example: 'Your booking has been confirmed' })
  @IsString()
  message: string;

  @ApiProperty({ example: { bookingCode: 'BB123456' } })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ example: 'BIGBUS' })
  @IsOptional()
  @IsString()
  sender?: string;

  @ApiPropertyOptional({ example: 'high', enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
