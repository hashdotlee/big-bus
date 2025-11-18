import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';
import { RecommendationType } from '../../../database/entities/recommendation.entity';

export class GetRecommendationsDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(RecommendationType)
  type?: RecommendationType;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  placement?: string;

  @IsOptional()
  @IsString()
  context?: string; // home, search, checkout, etc.
}

export class TrackRecommendationDto {
  @IsString()
  recommendationId: string;

  @IsString()
  action: string; // viewed, clicked, converted, dismissed
}
