import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Affiliate } from './affiliate.entity';

@Entity('referral_clicks')
export class ReferralClick {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  affiliateId: string;

  @ManyToOne(() => Affiliate)
  @JoinColumn({ name: 'affiliateId' })
  affiliate: Affiliate;

  @Column()
  referralCode: string;

  @Column({ nullable: true })
  customerId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  sourceUrl: string;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ default: false })
  converted: boolean;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  convertedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
