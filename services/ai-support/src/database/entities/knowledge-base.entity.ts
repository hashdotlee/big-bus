import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ArticleStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum ArticleCategory {
  FAQ = 'faq',
  TROUBLESHOOTING = 'troubleshooting',
  HOW_TO = 'how_to',
  POLICIES = 'policies',
  GENERAL = 'general',
}

@Entity('knowledge_base')
export class KnowledgeBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary: string;

  @Column({ type: 'enum', enum: ArticleCategory })
  category: ArticleCategory;

  @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
  status: ArticleStatus;

  @Column({ type: 'jsonb', default: [] })
  tags: string[];

  @Column({ type: 'jsonb', default: [] })
  keywords: string[];

  @Column({ type: 'text', nullable: true })
  slug: string;

  @Column({ nullable: true })
  authorId: string;

  @Column({ nullable: true })
  authorName: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  helpfulCount: number;

  @Column({ type: 'int', default: 0 })
  notHelpfulCount: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  helpfulnessScore: number;

  @Column({ type: 'int', default: 0 })
  usedByAiCount: number; // How many times AI referenced this article

  @Column({ type: 'jsonb', nullable: true })
  relatedArticles: string[]; // Array of article IDs

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
