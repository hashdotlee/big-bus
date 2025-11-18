import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum LoyaltyTier {
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
}

export enum TransactionType {
  EARN = 'EARN',
  REDEEM = 'REDEEM',
  EXPIRE = 'EXPIRE',
  BONUS = 'BONUS',
  ADJUSTMENT = 'ADJUSTMENT',
}

@Entity('loyalty_accounts')
@Index(['userId'], { unique: true })
export class LoyaltyAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  userId: string;

  @Column({ type: 'int', default: 0 })
  points: number;

  @Column({ type: 'int', default: 0 })
  lifetimePoints: number;

  @Column({
    type: 'enum',
    enum: LoyaltyTier,
    default: LoyaltyTier.BRONZE,
  })
  tier: LoyaltyTier;

  @Column({ type: 'int', default: 0 })
  tierProgress: number; // Points needed for next tier

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('loyalty_transactions')
@Index(['accountId', 'createdAt'])
@Index(['userId'])
export class LoyaltyTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountId: string;

  @Column()
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'int' })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  bookingId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('loyalty_rewards')
export class LoyaltyReward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  pointsCost: number;

  @Column({
    type: 'enum',
    enum: LoyaltyTier,
    nullable: true,
  })
  minTier: LoyaltyTier;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  rewardData: any; // Discount amount, free ticket, etc.

  @Column({ type: 'int', nullable: true })
  stockQuantity: number;

  @Column({ type: 'int', default: 0 })
  redeemedCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
