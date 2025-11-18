import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PricingRule } from '../../database/entities/pricing-rule.entity';
import { UserSegment } from '../../database/entities/user-segment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PricingRule, UserSegment])],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
