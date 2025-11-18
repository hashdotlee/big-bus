import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { BehaviorService } from './behavior.service';
import { TrackEventDto } from './dto/track-event.dto';

@Controller('behavior')
export class BehaviorController {
  constructor(private readonly behaviorService: BehaviorService) {}

  @Post('track')
  async trackEvent(@Body() dto: TrackEventDto) {
    return await this.behaviorService.trackEvent(dto);
  }

  @Get(':userId')
  async getUserBehaviors(
    @Param('userId') userId: string,
    @Query('eventType') eventType?: string,
    @Query('limit') limit?: string,
  ) {
    return await this.behaviorService.getUserBehaviors(userId, {
      eventType: eventType as any,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get(':userId/stats')
  async getStats(@Param('userId') userId: string, @Query('days') days?: string) {
    return await this.behaviorService.getUserBehaviorStats(userId, days ? parseInt(days) : 30);
  }

  @Get(':userId/segment')
  async getSegment(@Param('userId') userId: string) {
    return await this.behaviorService.getUserSegment(userId);
  }
}
