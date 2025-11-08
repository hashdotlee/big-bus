import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { Refund } from '../../database/entities/refund.entity';
import { Transaction } from '../../database/entities/transaction.entity';
import { Wallet } from '../../database/entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Refund, Transaction, Wallet])],
  controllers: [RefundsController],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
