import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard overview',
    description: 'Returns key metrics for the analytics dashboard',
  })
  async getDashboard(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getDashboard(query);
  }

  @Get('revenue')
  @ApiOperation({
    summary: 'Get revenue analytics',
    description: 'Returns revenue metrics and trends',
  })
  async getRevenue(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getRevenue(query);
  }

  @Get('bookings')
  @ApiOperation({
    summary: 'Get booking analytics',
    description: 'Returns booking statistics and trends',
  })
  async getBookings(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getBookings(query);
  }

  @Get('occupancy')
  @ApiOperation({
    summary: 'Get occupancy analytics',
    description: 'Returns vehicle occupancy rates and trends',
  })
  async getOccupancy(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getOccupancy(query);
  }

  @Get('routes')
  @ApiOperation({
    summary: 'Get route performance analytics',
    description: 'Returns performance metrics for routes',
  })
  async getRoutes(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getRoutes(query);
  }

  @Get('customers')
  @ApiOperation({
    summary: 'Get customer analytics',
    description: 'Returns customer behavior and demographics',
  })
  async getCustomers(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getCustomers(query);
  }
}
