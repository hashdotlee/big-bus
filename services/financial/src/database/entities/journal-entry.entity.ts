import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Transaction } from './transaction.entity';
import { Account } from './account.entity';

export enum EntryType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

@Entity('journal_entries')
@Index(['transactionId', 'accountId'])
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  transactionId: string;

  @ManyToOne(() => Transaction, transaction => transaction.journalEntries)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'enum', enum: EntryType })
  entryType: EntryType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
