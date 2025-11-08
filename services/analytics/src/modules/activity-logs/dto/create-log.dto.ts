import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, IsObject } from 'class-validator';

export class CreateLogDto {
  @ApiProperty({
    description: 'User ID performing the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({
    description: 'User email',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiProperty({
    description: 'Action performed',
    example: 'CREATE_BOOKING',
  })
  @IsString()
  action: string;

  @ApiProperty({
    description: 'Entity type',
    example: 'booking',
    required: false,
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    description: 'Additional metadata',
    example: { routeId: 'route-1', totalPrice: 100 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiProperty({
    description: 'IP address',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiProperty({
    description: 'Status of the action',
    example: 'success',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Error message if action failed',
    required: false,
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;
}
