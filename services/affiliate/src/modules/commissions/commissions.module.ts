import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommissionsController } from './commissions.controller';
import { CommissionsService } from './commissions.service';
import { Commission } from '../../database/entities/commission.entity';
import { Affiliate } from '../../database/entities/affiliate.entity';
import { ReferralClick } from '../../database/entities/referral-click.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Commission, Affiliate, ReferralClick])],
  controllers: [CommissionsController],
  providers: [CommissionsService],
  exports: [CommissionsService],
})
export class CommissionsModule {}
