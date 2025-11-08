import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationPriority, NotificationTemplate } from '../constants/notification.constants';

export class SendZaloDto {
  @ApiProperty({ example: 'zalo-user-id-123', description: 'Zalo user ID' })
  @IsString()
  recipient: string;

  @ApiProperty({ example: 'zalo-booking-confirmation', enum: NotificationTemplate })
  @IsEnum(NotificationTemplate)
  template: NotificationTemplate;

  @ApiProperty({ example: 'template-id-from-zalo' })
  @IsString()
  templateId: string;

  @ApiProperty({
    example: {
      customer_name: 'Nguyen Van A',
      booking_code: 'BB123456',
      route: 'Hanoi - Ho Chi Minh',
      date: '2024-01-15',
    },
  })
  @IsObject()
  templateData: Record<string, any>;

  @ApiPropertyOptional({ example: 'high', enum: NotificationPriority })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
