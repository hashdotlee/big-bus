import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LoyaltyService } from './loyalty.service';

// Placeholder guard
class JwtAuthGuard {}

@ApiTags('Loyalty & Rewards')
@Controller('loyalty')
@ApiBearerAuth()
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('account')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get my loyalty account' })
  async getMyAccount(@Request() req: any) {
    const account = await this.loyaltyService.getAccount(req.user.sub);
    return { success: true, data: account };
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get transaction history' })
  async getTransactions(@Request() req: any) {
    const transactions = await this.loyaltyService.getTransactions(req.user.sub);
    return { success: true, data: transactions };
  }

  @Get('rewards')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get available rewards' })
  async getRewards(@Request() req: any) {
    const rewards = await this.loyaltyService.getAvailableRewards(req.user.sub);
    return { success: true, data: rewards };
  }

  @Post('redeem/:rewardId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Redeem a reward' })
  async redeemReward(@Request() req: any, @Param('rewardId') rewardId: string) {
    const result = await this.loyaltyService.redeemPoints(req.user.sub, rewardId);
    return { success: true, data: result };
  }
}
