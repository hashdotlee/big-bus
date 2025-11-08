import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as moment from 'moment';
import * as PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';
import {
  Report,
  ReportType,
  ReportStatus,
  ReportFormat,
} from '../../database/entities/report.entity';
import { GenerateReportDto } from './dto/generate-report.dto';
import { AnalyticsQueryDto } from '../analytics/dto/analytics-query.dto';
import { AnalyticsService } from '../analytics/analytics.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private readonly reportRepo: Repository<Report>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * Get all reports with filtering
   */
  async getAllReports(query: any) {
    const { page = 1, limit = 10, status, reportType } = query;

    const where: any = {};
    if (status) where.status = status;
    if (reportType) where.reportType = reportType;

    const [reports, total] = await this.reportRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: reports,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get report by ID
   */
  async getReportById(id: string) {
    const report = await this.reportRepo.findOne({ where: { id } });
    if (!report) {
      throw new NotFoundException(`Report with ID ${id} not found`);
    }
    return report;
  }

  /**
   * Get daily report
   */
  async getDailyReport(query: AnalyticsQueryDto) {
    const startDate = query.startDate
      ? new Date(query.startDate)
      : moment().startOf('day').toDate();
    const endDate = query.endDate
      ? new Date(query.endDate)
      : moment().endOf('day').toDate();

    const analyticsQuery = { ...query, startDate: startDate.toISOString(), endDate: endDate.toISOString() };

    const [dashboard, revenue, bookings] = await Promise.all([
      this.analyticsService.getDashboard(analyticsQuery),
      this.analyticsService.getRevenue(analyticsQuery),
      this.analyticsService.getBookings(analyticsQuery),
    ]);

    return {
      reportType: ReportType.DAILY,
      period: { startDate, endDate },
      dashboard,
      revenue,
      bookings,
    };
  }

  /**
   * Get weekly report
   */
  async getWeeklyReport(query: AnalyticsQueryDto) {
    const startDate = query.startDate
      ? new Date(query.startDate)
      : moment().startOf('week').toDate();
    const endDate = query.endDate
      ? new Date(query.endDate)
      : moment().endOf('week').toDate();

    const analyticsQuery = { ...query, startDate: startDate.toISOString(), endDate: endDate.toISOString() };

    const [dashboard, revenue, bookings] = await Promise.all([
      this.analyticsService.getDashboard(analyticsQuery),
      this.analyticsService.getRevenue(analyticsQuery),
      this.analyticsService.getBookings(analyticsQuery),
    ]);

    return {
      reportType: ReportType.WEEKLY,
      period: { startDate, endDate },
      dashboard,
      revenue,
      bookings,
    };
  }

  /**
   * Get monthly report
   */
  async getMonthlyReport(query: AnalyticsQueryDto) {
    const startDate = query.startDate
      ? new Date(query.startDate)
      : moment().startOf('month').toDate();
    const endDate = query.endDate
      ? new Date(query.endDate)
      : moment().endOf('month').toDate();

    const analyticsQuery = { ...query, startDate: startDate.toISOString(), endDate: endDate.toISOString() };

    const [dashboard, revenue, bookings, routes, customers] = await Promise.all([
      this.analyticsService.getDashboard(analyticsQuery),
      this.analyticsService.getRevenue(analyticsQuery),
      this.analyticsService.getBookings(analyticsQuery),
      this.analyticsService.getRoutes(analyticsQuery),
      this.analyticsService.getCustomers(analyticsQuery),
    ]);

    return {
      reportType: ReportType.MONTHLY,
      period: { startDate, endDate },
      dashboard,
      revenue,
      bookings,
      routes,
      customers,
    };
  }

  /**
   * Get custom date range report
   */
  async getCustomReport(query: AnalyticsQueryDto) {
    if (!query.startDate || !query.endDate) {
      throw new Error('Start date and end date are required for custom reports');
    }

    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    const [dashboard, revenue, bookings, routes, customers] = await Promise.all([
      this.analyticsService.getDashboard(query),
      this.analyticsService.getRevenue(query),
      this.analyticsService.getBookings(query),
      this.analyticsService.getRoutes(query),
      this.analyticsService.getCustomers(query),
    ]);

    return {
      reportType: ReportType.CUSTOM,
      period: { startDate, endDate },
      dashboard,
      revenue,
      bookings,
      routes,
      customers,
    };
  }

  /**
   * Generate a new report
   */
  async generateReport(dto: GenerateReportDto) {
    this.logger.log(`Generating ${dto.reportType} report`);

    const report = this.reportRepo.create({
      reportType: dto.reportType,
      title: dto.title || `${dto.reportType} Report`,
      description: dto.description,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      format: dto.format || ReportFormat.JSON,
      status: ReportStatus.GENERATING,
      parameters: dto,
    });

    await this.reportRepo.save(report);

    // Generate report asynchronously
    this.generateReportData(report.id, dto).catch((error) => {
      this.logger.error(`Failed to generate report ${report.id}`, error);
    });

    return {
      id: report.id,
      status: report.status,
      message: 'Report generation started',
    };
  }

  /**
   * Generate report data (async)
   */
  private async generateReportData(reportId: string, dto: GenerateReportDto) {
    try {
      const query: AnalyticsQueryDto = {
        startDate: dto.startDate,
        endDate: dto.endDate,
      };

      let reportData: any;

      switch (dto.reportType) {
        case ReportType.DAILY:
          reportData = await this.getDailyReport(query);
          break;
        case ReportType.WEEKLY:
          reportData = await this.getWeeklyReport(query);
          break;
        case ReportType.MONTHLY:
          reportData = await this.getMonthlyReport(query);
          break;
        case ReportType.CUSTOM:
          reportData = await this.getCustomReport(query);
          break;
        default:
          reportData = await this.getDailyReport(query);
      }

      await this.reportRepo.update(reportId, {
        status: ReportStatus.COMPLETED,
        data: reportData,
        completedAt: new Date(),
      });

      this.logger.log(`Report ${reportId} generated successfully`);
    } catch (error) {
      this.logger.error(`Failed to generate report ${reportId}`, error);
      await this.reportRepo.update(reportId, {
        status: ReportStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  /**
   * Export report to PDF or Excel
   */
  async exportReport(reportId: string, format: string) {
    const report = await this.getReportById(reportId);

    if (!report.data) {
      throw new Error('Report data not available');
    }

    if (format === 'pdf') {
      return this.generatePDF(report);
    } else if (format === 'excel') {
      return this.generateExcel(report);
    } else {
      throw new Error('Unsupported export format');
    }
  }

  /**
   * Generate PDF report
   */
  private async generatePDF(report: Report) {
    const doc = new PDFDocument();
    const chunks: any[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));

    // Add content to PDF
    doc.fontSize(20).text(report.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Period: ${report.startDate.toLocaleDateString()} - ${report.endDate.toLocaleDateString()}`);
    doc.moveDown();

    if (report.data.dashboard) {
      doc.fontSize(16).text('Dashboard Summary');
      doc.fontSize(10).text(JSON.stringify(report.data.dashboard.metrics, null, 2));
      doc.moveDown();
    }

    if (report.data.revenue) {
      doc.fontSize(16).text('Revenue Analytics');
      doc.fontSize(10).text(`Total Revenue: ${report.data.revenue.totalRevenue}`);
      doc.moveDown();
    }

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(chunks);
        resolve({
          type: 'pdf',
          data: pdfData,
          filename: `report-${report.id}.pdf`,
        });
      });
    });
  }

  /**
   * Generate Excel report
   */
  private async generateExcel(report: Report) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Report');

    // Add header
    worksheet.columns = [
      { header: 'Metric', key: 'metric', width: 30 },
      { header: 'Value', key: 'value', width: 20 },
    ];

    // Add data
    if (report.data.dashboard?.metrics) {
      const metrics = report.data.dashboard.metrics;
      Object.keys(metrics).forEach((key) => {
        worksheet.addRow({ metric: key, value: metrics[key] });
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();

    return {
      type: 'excel',
      data: buffer,
      filename: `report-${report.id}.xlsx`,
    };
  }
}
