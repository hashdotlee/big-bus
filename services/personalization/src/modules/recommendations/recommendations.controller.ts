import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { GetRecommendationsDto, TrackRecommendationDto } from './dto/recommendation.dto';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  async getRecommendations(@Query() query: GetRecommendationsDto) {
    return await this.recommendationsService.getRecommendations(query);
  }

  @Post('track')
  async trackRecommendation(@Body() dto: TrackRecommendationDto) {
    return await this.recommendationsService.trackRecommendation(dto);
  }
}
