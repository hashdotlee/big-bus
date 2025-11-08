import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { VehicleType, VehicleStatus } from '@big-bus/types';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plate_number', length: 50, unique: true })
  @Index()
  plateNumber: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.ECONOMY,
  })
  type: VehicleType;

  @Column({ length: 100 })
  model: string;

  @Column({ length: 100, nullable: true })
  manufacturer: string;

  @Column()
  capacity: number;

  @Column({ name: 'manufacture_year', nullable: true })
  manufactureYear: number;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_maintenance_date', type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ name: 'next_maintenance_date', type: 'timestamp', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ name: 'mileage', type: 'decimal', precision: 10, scale: 2, default: 0 })
  mileage: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
