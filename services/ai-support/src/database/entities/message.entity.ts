import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  AGENT = 'agent',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  LINK = 'link',
  QUICK_REPLY = 'quick_reply',
  CARD = 'card',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  conversationId: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation: Conversation;

  @Column({ type: 'enum', enum: MessageRole })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: 'jsonb', nullable: true })
  attachments: Array<{
    type: string;
    url: string;
    filename?: string;
    size?: number;
  }>;

  @Column({ type: 'boolean', default: false })
  isAiGenerated: boolean;

  @Column({ type: 'text', nullable: true })
  aiModel: string; // e.g., gpt-4, gpt-3.5-turbo

  @Column({ type: 'int', nullable: true })
  aiTokensUsed: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceScore: number; // 0 to 1

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  sentimentScore: number; // -1 to 1

  @Column({ type: 'text', nullable: true })
  sentiment: string;

  @Column({ type: 'text', nullable: true })
  intent: string;

  @Column({ type: 'jsonb', nullable: true })
  entities: Array<{
    type: string;
    value: string;
    confidence: number;
  }>;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  userName: string;

  @Column({ type: 'boolean', default: false })
  isInternal: boolean; // Internal notes not visible to customer

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
