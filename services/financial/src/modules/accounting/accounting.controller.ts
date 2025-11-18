import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { AccountingService } from './accounting.service';
import { CreateTransactionDto, RecordRevenueDto, RecordExpenseDto } from './dto/transaction.dto';

@Controller('accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Post('transactions')
  async createTransaction(@Body() dto: CreateTransactionDto) {
    return await this.accountingService.createTransaction(dto);
  }

  @Post('revenue')
  async recordRevenue(@Body() dto: RecordRevenueDto) {
    return await this.accountingService.recordRevenue(dto);
  }

  @Post('expenses')
  async recordExpense(@Body() dto: RecordExpenseDto) {
    return await this.accountingService.recordExpense(dto);
  }

  @Get('accounts/:id/balance')
  async getAccountBalance(@Param('id') id: string) {
    const balance = await this.accountingService.getAccountBalance(id);
    return { accountId: id, balance };
  }

  @Get('trial-balance')
  async getTrialBalance() {
    return await this.accountingService.getTrialBalance();
  }
}
