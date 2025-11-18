export enum ReportType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
  REVENUE = 'revenue',
  BOOKINGS = 'bookings',
  OCCUPANCY = 'occupancy',
}

export enum ReportStatus {
  PENDING = 'pending',
  GENERATING = 'generating',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  JSON = 'json',
}

export interface Report {
  id: string;
  reportType: ReportType;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  status: ReportStatus;
  format: ReportFormat;
  data?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  filePath?: string;
  fileSize?: number;
  generatedBy?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface GenerateReportRequest {
  reportType: ReportType;
  startDate: string;
  endDate: string;
  format?: ReportFormat;
  title?: string;
  description?: string;
}

export interface ExportReportRequest {
  reportId: string;
  format: ReportFormat;
}
