import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { VehicleType } from '@big-bus/types';
import { Route } from './route.entity';
import { Vehicle } from './vehicle.entity';
import { Booking } from './booking.entity';

export enum ScheduleStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'route_id' })
  routeId: string;

  @Column({ name: 'vehicle_id' })
  vehicleId: string;

  @Column({ name: 'departure_time' })
  departureTime: Date;

  @Column({ name: 'arrival_time' })
  arrivalTime: Date;

  @Column('decimal', { precision: 10, scale: 2, name: 'base_price' })
  basePrice: number;

  @Column({ name: 'available_seats' })
  availableSeats: number;

  @Column({ name: 'total_seats' })
  totalSeats: number;

  @Column({
    type: 'enum',
    enum: VehicleType,
    name: 'vehicle_type',
  })
  vehicleType: VehicleType;

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.ACTIVE,
  })
  status: ScheduleStatus;

  @ManyToOne(() => Route, (route) => route.schedules)
  @JoinColumn({ name: 'route_id' })
  route: Route;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.schedules)
  @JoinColumn({ name: 'vehicle_id' })
  vehicle: Vehicle;

  @OneToMany(() => Booking, (booking) => booking.schedule)
  bookings: Booking[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
