import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AffiliatesController } from './affiliates.controller';
import { AffiliatesService } from './affiliates.service';
import { Affiliate } from '../../database/entities/affiliate.entity';
import { ReferralClick } from '../../database/entities/referral-click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Affiliate, ReferralClick])],
  controllers: [AffiliatesController],
  providers: [AffiliatesService],
  exports: [AffiliatesService],
})
export class AffiliatesModule {}
