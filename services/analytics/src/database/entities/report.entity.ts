import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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

@Entity('reports')
@Index(['reportType', 'status'])
@Index(['generatedBy', 'createdAt'])
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'report_type', type: 'enum', enum: ReportType })
  reportType: ReportType;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.JSON })
  format: ReportFormat;

  @Column({ type: 'jsonb', nullable: true })
  data: any; // Report data

  @Column({ type: 'jsonb', nullable: true })
  parameters: any; // Report generation parameters

  @Column({ name: 'file_path', nullable: true })
  filePath: string; // Path to generated file (PDF/Excel)

  @Column({ name: 'file_size', type: 'int', nullable: true })
  fileSize: number; // File size in bytes

  @Column({ name: 'generated_by', type: 'uuid', nullable: true })
  generatedBy: string; // User ID who requested the report

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date;
}
