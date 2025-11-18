import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { Recommendation } from '../../database/entities/recommendation.entity';
import { UserPreference } from '../../database/entities/user-preference.entity';
import { UserBehavior } from '../../database/entities/user-behavior.entity';
import { UserSegment } from '../../database/entities/user-segment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Recommendation, UserPreference, UserBehavior, UserSegment])],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
