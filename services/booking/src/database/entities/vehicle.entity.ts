import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { VehicleType } from '@big-bus/types';
import { Schedule } from './schedule.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  plateNumber: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.ECONOMY,
  })
  type: VehicleType;

  @Column({ length: 100 })
  model: string;

  @Column()
  capacity: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastMaintenanceDate: Date;

  @OneToMany(() => Schedule, (schedule) => schedule.vehicle)
  schedules: Schedule[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
