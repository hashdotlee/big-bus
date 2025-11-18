import { IsString, IsEmail, IsEnum, IsOptional, IsArray, IsObject } from 'class-validator';
import { TicketCategory, TicketPriority, TicketSource, TicketStatus } from '../../../database/entities/ticket.entity';

export class CreateTicketDto {
  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsString()
  subject: string;

  @IsString()
  description: string;

  @IsEnum(TicketCategory)
  category: TicketCategory;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsEnum(TicketSource)
  source: TicketSource;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  relatedBookingId?: string;

  @IsOptional()
  @IsString()
  relatedOrderId?: string;

  @IsOptional()
  @IsString()
  relatedPaymentId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TicketCategory)
  category?: TicketCategory;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsString()
  assignedAgentId?: string;

  @IsOptional()
  @IsString()
  assignedAgentName?: string;

  @IsOptional()
  @IsString()
  assignedTeam?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  @IsString()
  resolution?: string;
}

export class AssignTicketDto {
  @IsString()
  ticketId: string;

  @IsString()
  agentId: string;

  @IsString()
  agentName: string;

  @IsOptional()
  @IsString()
  team?: string;
}

export class ResolveTicketDto {
  @IsString()
  ticketId: string;

  @IsString()
  resolution: string;

  @IsOptional()
  @IsString()
  agentId?: string;
}

export class EscalateTicketDto {
  @IsString()
  ticketId: string;

  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  escalatedTo?: string;
}

export class RateTicketDto {
  @IsString()
  ticketId: string;

  @IsOptional()
  rating?: number; // 1-5

  @IsOptional()
  @IsString()
  feedback?: string;
}
