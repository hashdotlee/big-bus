import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Commission } from './commission.entity';

export enum AffiliateStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  TIERED = 'tiered',
}

@Entity('affiliates')
export class Affiliate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ unique: true })
  referralCode: string;

  @Column({
    type: 'enum',
    enum: AffiliateStatus,
    default: AffiliateStatus.PENDING,
  })
  status: AffiliateStatus;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'jsonb', nullable: true })
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };

  @Column({ nullable: true })
  taxId: string;

  @Column({ type: 'jsonb', nullable: true })
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };

  @Column({
    type: 'enum',
    enum: CommissionType,
    default: CommissionType.PERCENTAGE,
  })
  commissionType: CommissionType;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  commissionRate: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalEarnings: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  pendingEarnings: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidEarnings: number;

  @Column({ type: 'int', default: 0 })
  totalReferrals: number;

  @Column({ type: 'int', default: 0 })
  totalConversions: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  totalSales: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @OneToMany(() => Commission, commission => commission.affiliate)
  commissions: Commission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
