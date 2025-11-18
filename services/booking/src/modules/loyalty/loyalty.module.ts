import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyAccount, LoyaltyTransaction, LoyaltyReward } from './loyalty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LoyaltyAccount, LoyaltyTransaction, LoyaltyReward]),
  ],
  controllers: [LoyaltyController],
  providers: [LoyaltyService],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
