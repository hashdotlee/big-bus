import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { StationsModule } from './modules/stations/stations.module';
import { RoutesModule } from './modules/routes/routes.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    StationsModule,
    RoutesModule,
    VehiclesModule,
    SchedulesModule,
    BookingsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
