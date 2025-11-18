import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType, TransactionCategory } from '../../database/entities/transaction.entity';
import { JournalEntry, EntryType } from '../../database/entities/journal-entry.entity';
import { Account, AccountType } from '../../database/entities/account.entity';
import { CreateTransactionDto, RecordRevenueDto, RecordExpenseDto } from './dto/transaction.dto';

@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly dataSource: DataSource,
  ) {}

  async createTransaction(dto: CreateTransactionDto): Promise<Transaction> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate transaction number
      const transactionNumber = await this.generateTransactionNumber();

      // Create transaction
      const transaction = this.transactionRepository.create({
        ...dto,
        transactionNumber,
        status: TransactionStatus.DRAFT,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Create journal entries if provided
      if (dto.journalEntries && dto.journalEntries.length > 0) {
        await this.createJournalEntries(savedTransaction.id, dto.journalEntries, queryRunner);

        // Validate double-entry
        await this.validateDoubleEntry(savedTransaction.id, queryRunner);

        // Post transaction
        savedTransaction.status = TransactionStatus.POSTED;
        savedTransaction.postedAt = new Date();
        await queryRunner.manager.save(savedTransaction);

        // Update account balances
        await this.updateAccountBalances(savedTransaction.id, queryRunner);
      }

      await queryRunner.commitTransaction();
      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async recordRevenue(dto: RecordRevenueDto): Promise<Transaction> {
    // Map source to category
    const categoryMap: Record<string, TransactionCategory> = {
      booking: TransactionCategory.BOOKING_REVENUE,
      marketplace: TransactionCategory.MARKETPLACE_REVENUE,
      affiliate: TransactionCategory.AFFILIATE_COMMISSION,
    };

    const category = categoryMap[dto.source] || TransactionCategory.OTHER_REVENUE;

    // Get revenue and cash accounts
    const revenueAccount = await this.getAccountByType(AccountType.REVENUE);
    const cashAccount = await this.getAccountByType(AccountType.ASSET, 'cash');

    return await this.createTransaction({
      type: TransactionType.REVENUE,
      category,
      transactionDate: dto.transactionDate,
      description: dto.description || `Revenue from ${dto.source}`,
      reference: dto.sourceId,
      amount: dto.amount,
      relatedEntityType: dto.source,
      relatedEntityId: dto.sourceId,
      isTaxable: dto.isTaxable,
      taxAmount: dto.taxAmount,
      journalEntries: [
        {
          accountId: cashAccount.id,
          entryType: 'debit',
          amount: dto.amount,
          description: 'Cash received',
        },
        {
          accountId: revenueAccount.id,
          entryType: 'credit',
          amount: dto.amount,
          description: 'Revenue recognized',
        },
      ],
    });
  }

  async recordExpense(dto: RecordExpenseDto): Promise<Transaction> {
    const expenseAccount = await this.getAccountByType(AccountType.EXPENSE);
    const cashAccount = await this.getAccountByType(AccountType.ASSET, 'cash');

    return await this.createTransaction({
      type: TransactionType.EXPENSE,
      category: dto.category,
      transactionDate: dto.transactionDate,
      description: dto.description,
      reference: dto.reference,
      amount: dto.amount,
      payeePayor: dto.payee,
      paymentMethod: dto.paymentMethod,
      isTaxable: dto.isTaxable,
      journalEntries: [
        {
          accountId: expenseAccount.id,
          entryType: 'debit',
          amount: dto.amount,
          description: dto.description,
        },
        {
          accountId: cashAccount.id,
          entryType: 'credit',
          amount: dto.amount,
          description: 'Cash paid',
        },
      ],
    });
  }

  async getAccountBalance(accountId: string): Promise<number> {
    const account = await this.accountRepository.findOne({ where: { id: accountId } });
    return account ? Number(account.balance) : 0;
  }

  async getTrialBalance(date?: Date): Promise<any> {
    const accounts = await this.accountRepository.find({ where: { isActive: true } });

    const trial Balance = {
      asOf: date || new Date(),
      accounts: accounts.map(account => ({
        code: account.code,
        name: account.name,
        type: account.type,
        debit: Number(account.debitBalance),
        credit: Number(account.creditBalance),
        balance: Number(account.balance),
      })),
      totalDebits: 0,
      totalCredits: 0,
      isBalanced: true,
    };

    trialBalance.totalDebits = trialBalance.accounts.reduce((sum, acc) => sum + acc.debit, 0);
    trialBalance.totalCredits = trialBalance.accounts.reduce((sum, acc) => sum + acc.credit, 0);
    trialBalance.isBalanced = Math.abs(trialBalance.totalDebits - trialBalance.totalCredits) < 0.01;

    return trialBalance;
  }

  private async createJournalEntries(
    transactionId: string,
    entries: any[],
    queryRunner: any
  ): Promise<void> {
    for (const entry of entries) {
      const journalEntry = this.journalEntryRepository.create({
        transactionId,
        ...entry,
      });
      await queryRunner.manager.save(journalEntry);
    }
  }

  private async validateDoubleEntry(transactionId: string, queryRunner: any): Promise<void> {
    const entries = await queryRunner.manager.find(JournalEntry, { where: { transactionId } });

    const totalDebits = entries
      .filter(e => e.entryType === EntryType.DEBIT)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    const totalCredits = entries
      .filter(e => e.entryType === EntryType.CREDIT)
      .reduce((sum, e) => sum + Number(e.amount), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException(
        `Double-entry validation failed: Debits (${totalDebits}) != Credits (${totalCredits})`
      );
    }
  }

  private async updateAccountBalances(transactionId: string, queryRunner: any): Promise<void> {
    const entries = await queryRunner.manager.find(JournalEntry, { where: { transactionId } });

    for (const entry of entries) {
      const account = await queryRunner.manager.findOne(Account, { where: { id: entry.accountId } });

      if (!account) continue;

      const amount = Number(entry.amount);

      if (entry.entryType === EntryType.DEBIT) {
        account.debitBalance = Number(account.debitBalance) + amount;
      } else {
        account.creditBalance = Number(account.creditBalance) + amount;
      }

      // Calculate net balance based on account type
      if ([AccountType.ASSET, AccountType.EXPENSE].includes(account.type)) {
        account.balance = Number(account.debitBalance) - Number(account.creditBalance);
      } else {
        account.balance = Number(account.creditBalance) - Number(account.debitBalance);
      }

      await queryRunner.manager.save(account);
    }
  }

  private async generateTransactionNumber(): Promise<string> {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `TXN-${timestamp}-${random}`;
  }

  private async getAccountByType(type: AccountType, subtype?: string): Promise<Account> {
    const where: any = { type, isActive: true };

    if (subtype) {
      where.subtype = subtype;
    }

    const account = await this.accountRepository.findOne({ where });

    if (!account) {
      throw new BadRequestException(`No active account found for type: ${type}${subtype ? ` (${subtype})` : ''}`);
    }

    return account;
  }
}
