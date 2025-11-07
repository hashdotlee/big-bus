import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PassengerGender } from '@big-bus/types';
import { Booking } from './booking.entity';

@Entity('passengers')
export class Passenger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id' })
  bookingId: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column()
  age: number;

  @Column({
    type: 'enum',
    enum: PassengerGender,
  })
  gender: PassengerGender;

  @Column({ name: 'id_number', length: 50 })
  idNumber: string;

  @Column({ name: 'seat_number', length: 10, nullable: true })
  seatNumber: string;

  @ManyToOne(() => Booking, (booking) => booking.passengers)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;
}
