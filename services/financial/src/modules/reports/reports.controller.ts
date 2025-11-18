import { Controller, Post, Body } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('generate')
  async generateReport(@Body() dto: GenerateReportDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    switch (dto.reportType) {
      case 'profit_loss':
        return await this.reportsService.generateProfitLossReport(startDate, endDate);
      case 'balance_sheet':
        return await this.reportsService.generateBalanceSheet(endDate);
      case 'cash_flow':
        return await this.reportsService.generateCashFlowReport(startDate, endDate);
      default:
        return await this.reportsService.generateProfitLossReport(startDate, endDate);
    }
  }
}
