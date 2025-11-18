import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  WAITING_CUSTOMER = 'waiting_customer',
  WAITING_INTERNAL = 'waiting_internal',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum TicketCategory {
  BOOKING = 'booking',
  PAYMENT = 'payment',
  CANCELLATION = 'cancellation',
  REFUND = 'refund',
  ROUTE_INFO = 'route_info',
  SCHEDULE = 'schedule',
  LOST_FOUND = 'lost_found',
  COMPLAINT = 'complaint',
  FEEDBACK = 'feedback',
  TECHNICAL = 'technical',
  ACCOUNT = 'account',
  MARKETPLACE = 'marketplace',
  OTHER = 'other',
}

export enum TicketSource {
  WEB_CHAT = 'web_chat',
  EMAIL = 'email',
  PHONE = 'phone',
  MOBILE_APP = 'mobile_app',
  SOCIAL_MEDIA = 'social_media',
  WALK_IN = 'walk_in',
}

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  ticketNumber: string;

  @Column({ nullable: true })
  conversationId: string;

  @Column({ nullable: true })
  customerId: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ type: 'text' })
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketCategory })
  category: TicketCategory;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ type: 'enum', enum: TicketSource })
  source: TicketSource;

  @Column({ nullable: true })
  assignedAgentId: string;

  @Column({ nullable: true })
  assignedAgentName: string;

  @Column({ nullable: true })
  assignedTeam: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    type: string;
    url: string;
    filename: string;
    size: number;
  }>;

  @Column({ type: 'text', nullable: true })
  resolution: string;

  @Column({ type: 'int', nullable: true })
  customerSatisfactionRating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  customerFeedback: string;

  @Column({ nullable: true })
  relatedBookingId: string;

  @Column({ nullable: true })
  relatedOrderId: string;

  @Column({ nullable: true })
  relatedPaymentId: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  aiConfidence: number;

  @Column({ type: 'text', nullable: true })
  aiSuggestedCategory: string;

  @Column({ type: 'text', nullable: true })
  aiSuggestedPriority: string;

  @Column({ type: 'text', nullable: true })
  aiSuggestedResponse: string;

  @Column({ type: 'boolean', default: false })
  isEscalated: boolean;

  @Column({ type: 'text', nullable: true })
  escalationReason: string;

  @Column({ type: 'timestamp', nullable: true })
  firstResponseAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  assignedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'int', nullable: true })
  responseTimeSeconds: number;

  @Column({ type: 'int', nullable: true })
  resolutionTimeSeconds: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  history: Array<{
    timestamp: Date;
    action: string;
    userId: string;
    userName: string;
    oldValue?: any;
    newValue?: any;
    note?: string;
  }>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
