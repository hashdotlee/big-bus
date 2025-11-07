import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Station } from './station.entity';
import { Schedule } from './schedule.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'origin_station_id' })
  originStationId: string;

  @Column({ name: 'destination_station_id' })
  destinationStationId: string;

  @Column('decimal', { precision: 10, scale: 2 })
  distance: number; // in kilometers

  @Column({ name: 'estimated_duration' })
  estimatedDuration: number; // in minutes

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ManyToOne(() => Station, (station) => station.routesAsOrigin)
  @JoinColumn({ name: 'origin_station_id' })
  originStation: Station;

  @ManyToOne(() => Station, (station) => station.routesAsDestination)
  @JoinColumn({ name: 'destination_station_id' })
  destinationStation: Station;

  @OneToMany(() => Schedule, (schedule) => schedule.route)
  schedules: Schedule[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
