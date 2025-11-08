import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum PredictionType {
  DEMAND = 'demand',
  REVENUE = 'revenue',
  OCCUPANCY = 'occupancy',
  MAINTENANCE = 'maintenance',
}

export enum PredictionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('predictions')
@Index(['predictionType', 'status'])
@Index(['targetDate'])
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'prediction_type', type: 'enum', enum: PredictionType })
  predictionType: PredictionType;

  @Column({ name: 'target_date', type: 'timestamp' })
  targetDate: Date; // Date being predicted for

  @Column({ name: 'prediction_date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  predictionDate: Date; // When prediction was made

  @Column({ type: 'jsonb' })
  data: any; // Prediction data

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  confidence: number; // Confidence score (0-1)

  @Column({ type: 'jsonb', nullable: true })
  parameters: any; // Model parameters used

  @Column({ name: 'model_version', nullable: true })
  modelVersion: string; // Version of the ML model used

  @Column({ type: 'enum', enum: PredictionStatus, default: PredictionStatus.PENDING })
  status: PredictionStatus;

  @Column({ name: 'actual_value', type: 'jsonb', nullable: true })
  actualValue: any; // Actual value when available (for accuracy tracking)

  @Column({ name: 'accuracy_score', type: 'decimal', precision: 10, scale: 4, nullable: true })
  accuracyScore: number; // How accurate the prediction was

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
