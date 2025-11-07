import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BookingStatus, BookingType } from '@big-bus/types';
import { Schedule } from './schedule.entity';
import { Station } from './station.entity';
import { Passenger } from './passenger.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_code', length: 20, unique: true })
  bookingCode: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'schedule_id' })
  scheduleId: string;

  @Column({ name: 'pickup_station_id' })
  pickupStationId: string;

  @Column({ name: 'dropoff_station_id' })
  dropoffStationId: string;

  @Column('simple-array', { name: 'seat_numbers' })
  seatNumbers: string[];

  @Column({
    type: 'enum',
    enum: BookingType,
    name: 'booking_type',
  })
  bookingType: BookingType;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'final_price' })
  finalPrice: number;

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Column({ name: 'payment_id', nullable: true })
  paymentId: string;

  @Column({ name: 'promotion_code', nullable: true, length: 50 })
  promotionCode: string;

  @Column({ name: 'special_requests', nullable: true, type: 'text' })
  specialRequests: string;

  @Column({ name: 'qr_code', nullable: true, type: 'text' })
  qrCode: string;

  @Column({ nullable: true, type: 'int' })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  review: string;

  @ManyToOne(() => Schedule, (schedule) => schedule.bookings)
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'pickup_station_id' })
  pickupStation: Station;

  @ManyToOne(() => Station)
  @JoinColumn({ name: 'dropoff_station_id' })
  dropoffStation: Station;

  @OneToMany(() => Passenger, (passenger) => passenger.booking, { cascade: true })
  passengers: Passenger[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
