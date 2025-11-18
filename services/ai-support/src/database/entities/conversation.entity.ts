import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Message } from './message.entity';

export enum ConversationStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

export enum ConversationChannel {
  WEB_CHAT = 'web_chat',
  MOBILE_APP = 'mobile_app',
  EMAIL = 'email',
  PHONE = 'phone',
  WHATSAPP = 'whatsapp',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  customerId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  customerName: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ type: 'enum', enum: ConversationChannel, default: ConversationChannel.WEB_CHAT })
  channel: ConversationChannel;

  @Column({ type: 'enum', enum: ConversationStatus, default: ConversationStatus.ACTIVE })
  status: ConversationStatus;

  @Column({ type: 'text', nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'text', nullable: true })
  category: string;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  sentimentScore: number; // -1 to 1

  @Column({ type: 'text', nullable: true })
  sentiment: string; // positive, negative, neutral

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'int', default: 0 })
  aiMessageCount: number;

  @Column({ type: 'int', default: 0 })
  humanMessageCount: number;

  @Column({ nullable: true })
  assignedAgentId: string;

  @Column({ nullable: true })
  assignedAgentName: string;

  @Column({ type: 'timestamp', nullable: true })
  firstResponseAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'int', nullable: true })
  responseTimeSeconds: number;

  @Column({ type: 'int', nullable: true })
  resolutionTimeSeconds: number;

  @Column({ type: 'int', nullable: true })
  customerSatisfactionRating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  customerFeedback: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
