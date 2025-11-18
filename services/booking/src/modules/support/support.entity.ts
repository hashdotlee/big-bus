import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketCategory {
  BOOKING = 'BOOKING',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  TECHNICAL = 'TECHNICAL',
  FEEDBACK = 'FEEDBACK',
  OTHER = 'OTHER',
}

@Entity('support_tickets')
@Index(['userId', 'status'])
@Index(['assignedTo', 'status'])
export class SupportTicket {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TicketCategory, default: TicketCategory.OTHER })
  category: TicketCategory;

  @Column({ type: 'enum', enum: TicketPriority, default: TicketPriority.MEDIUM })
  priority: TicketPriority;

  @Column({ type: 'enum', enum: TicketStatus, default: TicketStatus.OPEN })
  status: TicketStatus;

  @Column({ nullable: true })
  bookingId: string;

  @Column({ nullable: true })
  assignedTo: string; // Agent user ID

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('support_messages')
@Index(['ticketId', 'createdAt'])
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  ticketId: string;

  @Column()
  senderId: string; // User ID or agent ID

  @Column({ default: false })
  isAgent: boolean;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  attachments: any[];

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
