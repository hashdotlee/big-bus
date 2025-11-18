import { IsString, IsEnum, IsOptional, IsObject, IsNumber } from 'class-validator';
import { BehaviorEventType } from '../../../database/entities/user-behavior.entity';

export class TrackEventDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsEnum(BehaviorEventType)
  eventType: BehaviorEventType;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;

  @IsOptional()
  @IsString()
  device?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  browser?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsNumber()
  durationSeconds?: number;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
