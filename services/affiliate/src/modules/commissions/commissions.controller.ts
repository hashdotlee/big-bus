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
import { CommissionsService } from './commissions.service';
import { RecordConversionDto } from './dto/record-conversion.dto';
import { ApproveCommissionDto } from './dto/approve-commission.dto';
import { CommissionStatus } from '../../database/entities/commission.entity';

@Controller('commissions')
export class CommissionsController {
  constructor(private readonly commissionsService: CommissionsService) {}

  @Post('record-conversion')
  @HttpCode(HttpStatus.CREATED)
  async recordConversion(@Body() conversionDto: RecordConversionDto) {
    return this.commissionsService.recordConversion(conversionDto);
  }

  @Get()
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('affiliateId') affiliateId?: string,
    @Query('status') status?: CommissionStatus,
  ) {
    return this.commissionsService.findAll(
      page || 1,
      limit || 10,
      affiliateId,
      status,
    );
  }

  @Get('affiliate/:affiliateId/earnings')
  async getAffiliateEarnings(@Param('affiliateId') affiliateId: string) {
    return this.commissionsService.getAffiliateEarnings(affiliateId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.commissionsService.findOne(id);
  }

  @Patch(':id/approve')
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveCommissionDto,
  ) {
    return this.commissionsService.approve(id, approveDto);
  }
}
