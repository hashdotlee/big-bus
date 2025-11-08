import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum MetricType {
  REVENUE = 'revenue',
  BOOKINGS = 'bookings',
  OCCUPANCY = 'occupancy',
  CUSTOMERS = 'customers',
  ROUTES = 'routes',
  VEHICLES = 'vehicles',
}

export enum SnapshotPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

@Entity('metric_snapshots')
@Index(['metricType', 'period', 'timestamp'])
@Index(['timestamp'])
export class MetricSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'metric_type', type: 'enum', enum: MetricType })
  metricType: MetricType;

  @Column({ type: 'enum', enum: SnapshotPeriod })
  period: SnapshotPeriod;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'jsonb' })
  data: any; // Metric data (flexible structure based on metric type)

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value: number; // Primary numeric value for quick queries

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Additional contextual information

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
