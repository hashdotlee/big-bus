import { IsEmail, IsString, IsOptional, IsArray, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPriority, NotificationTemplate } from '../constants/notification.constants';

export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com', description: 'Recipient email address' })
  @IsEmail()
  recipient: string;

  @ApiProperty({ example: 'booking-confirmation', enum: NotificationTemplate })
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @ApiProperty({ example: 'Booking Confirmation' })
  @IsString()
  subject: string;

  @ApiProperty({ example: { bookingId: '123', userName: 'John Doe' } })
  @IsObject()
  data: Record<string, any>;

  @ApiPropertyOptional({ example: ['cc@example.com'] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiPropertyOptional({ example: ['bcc@example.com'] })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @ApiPropertyOptional({ example: 'high', enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
