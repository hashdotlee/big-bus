import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BehaviorController } from './behavior.controller';
import { BehaviorService } from './behavior.service';
import { UserBehavior } from '../../database/entities/user-behavior.entity';
import { UserSegment } from '../../database/entities/user-segment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserBehavior, UserSegment])],
  controllers: [BehaviorController],
  providers: [BehaviorService],
  exports: [BehaviorService],
})
export class BehaviorModule {}
