import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from '../../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [],
  providers: [],
  exports: [],
})
export class RolesModule {}
