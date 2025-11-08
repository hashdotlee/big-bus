import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Transaction } from './transaction.entity';

export enum WalletStatus {
  ACTIVE = 'active',
  LOCKED = 'locked',
  SUSPENDED = 'suspended',
}

export enum Currency {
  VND = 'VND',
  USD = 'USD',
}

@Entity('wallets')
@Index(['userId'])
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  balance: number;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.VND,
  })
  currency: Currency;

  @Column({
    type: 'enum',
    enum: WalletStatus,
    default: WalletStatus.ACTIVE,
  })
  status: WalletStatus;

  @Column({ name: 'is_primary', default: true })
  isPrimary: boolean;

  @Column({ name: 'last_transaction_at', nullable: true })
  lastTransactionAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.wallet)
  transactions: Transaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
