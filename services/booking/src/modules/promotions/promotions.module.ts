import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionsService } from './promotions.service';
import { Promotion, CouponUsage } from './promotions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Promotion, CouponUsage])],
  providers: [PromotionsService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
