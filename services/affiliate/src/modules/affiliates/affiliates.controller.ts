import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AffiliatesService } from './affiliates.service';
import { RegisterAffiliateDto } from './dto/register-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { TrackReferralDto } from './dto/track-referral.dto';
import { AffiliateStatus } from '../../database/entities/affiliate.entity';

@Controller('affiliates')
export class AffiliatesController {
  constructor(private readonly affiliatesService: AffiliatesService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterAffiliateDto) {
    return this.affiliatesService.register(registerDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: AffiliateStatus,
  ) {
    return this.affiliatesService.findAll(
      page || 1,
      limit || 10,
      status,
    );
  }

  @Get('top')
  async getTopAffiliates(@Query('limit') limit?: number) {
    return this.affiliatesService.getTopAffiliates(limit || 10);
  }

  @Get('validate/:code')
  async validateReferralCode(@Param('code') code: string) {
    const isValid = await this.affiliatesService.validateReferralCode(code);
    return { code, valid: isValid };
  }

  @Get('referral-code/:code')
  async findByReferralCode(@Param('code') code: string) {
    return this.affiliatesService.findByReferralCode(code);
  }

  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string) {
    return this.affiliatesService.findByUserId(userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.affiliatesService.findOne(id);
  }

  @Get(':id/performance')
  async getPerformanceMetrics(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.affiliatesService.getPerformanceMetrics(
      id,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAffiliateDto,
  ) {
    return this.affiliatesService.update(id, updateDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: AffiliateStatus,
  ) {
    return this.affiliatesService.updateStatus(id, status);
  }

  @Post('track-referral')
  @HttpCode(HttpStatus.OK)
  async trackReferral(@Body() trackDto: TrackReferralDto) {
    return this.affiliatesService.trackReferral(trackDto);
  }
}
