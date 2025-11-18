import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { PayoutStatus } from '../../database/entities/payout.entity';

@Controller('payouts')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  async requestPayout(@Body() requestDto: RequestPayoutDto) {
    return this.payoutsService.requestPayout(requestDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('affiliateId') affiliateId?: string,
    @Query('status') status?: PayoutStatus,
  ) {
    return this.payoutsService.findAll(
      page || 1,
      limit || 10,
      affiliateId,
      status,
    );
  }

  @Get('affiliate/:affiliateId/stats')
  async getPayoutStats(@Param('affiliateId') affiliateId: string) {
    return this.payoutsService.getPayoutStats(affiliateId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.payoutsService.findOne(id);
  }

  @Patch(':id/process')
  async processPayout(
    @Param('id') id: string,
    @Body('transactionId') transactionId: string,
  ) {
    return this.payoutsService.processPayout(id, transactionId);
  }

  @Patch(':id/cancel')
  async cancelPayout(@Param('id') id: string) {
    return this.payoutsService.cancelPayout(id);
  }
}
