import { IsString, IsEmail, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ConversationChannel } from '../../../database/entities/conversation.entity';

export class CreateConversationDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsEnum(ConversationChannel)
  channel?: ConversationChannel;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  userName?: string;
}

export class RateConversationDto {
  @IsString()
  conversationId: string;

  @IsOptional()
  rating?: number; // 1-5

  @IsOptional()
  @IsString()
  feedback?: string;
}
