import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { Transaction } from '../../database/entities/transaction.entity';
import { JournalEntry } from '../../database/entities/journal-entry.entity';
import { Account } from '../../database/entities/account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, JournalEntry, Account])],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
