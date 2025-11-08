import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Param,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { AnalyticsQueryDto } from '../analytics/dto/analytics-query.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all reports' })
  async getAllReports(@Query() query: any) {
    return this.reportsService.getAllReports(query);
  }

  @Get('daily')
  @ApiOperation({ summary: 'Get daily report' })
  async getDailyReport(@Query() query: AnalyticsQueryDto) {
    return this.reportsService.getDailyReport(query);
  }

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly report' })
  async getWeeklyReport(@Query() query: AnalyticsQueryDto) {
    return this.reportsService.getWeeklyReport(query);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly report' })
  async getMonthlyReport(@Query() query: AnalyticsQueryDto) {
    return this.reportsService.getMonthlyReport(query);
  }

  @Get('custom')
  @ApiOperation({ summary: 'Get custom date range report' })
  async getCustomReport(@Query() query: AnalyticsQueryDto) {
    return this.reportsService.getCustomReport(query);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a new report' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Report generation started' })
  async generateReport(@Body() dto: GenerateReportDto) {
    return this.reportsService.generateReport(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  async getReportById(@Param('id') id: string) {
    return this.reportsService.getReportById(id);
  }

  @Get(':id/export')
  @ApiOperation({ summary: 'Export report to PDF or Excel' })
  async exportReport(
    @Param('id') id: string,
    @Query('format') format: string,
    @Res() res: Response,
  ) {
    const result = await this.reportsService.exportReport(id, format);

    if (result.type === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    } else if (result.type === 'excel') {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    }

    return res.send(result.data);
  }
}
