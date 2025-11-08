import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PredictionsService } from './predictions.service';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { QueryPredictionsDto } from './dto/query-predictions.dto';

@ApiTags('predictions')
@Controller('predictions')
export class PredictionsController {
  constructor(private readonly predictionsService: PredictionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all predictions' })
  async getPredictions(@Query() query: QueryPredictionsDto) {
    return this.predictionsService.getPredictions(query);
  }

  @Get('demand')
  @ApiOperation({ summary: 'Get demand predictions' })
  async getDemandPredictions(@Query() query: QueryPredictionsDto) {
    return this.predictionsService.getDemandPredictions(query);
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue predictions' })
  async getRevenuePredictions(@Query() query: QueryPredictionsDto) {
    return this.predictionsService.getRevenuePredictions(query);
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get occupancy predictions' })
  async getOccupancyPredictions(@Query() query: QueryPredictionsDto) {
    return this.predictionsService.getOccupancyPredictions(query);
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'Get maintenance predictions' })
  async getMaintenancePredictions(@Query() query: QueryPredictionsDto) {
    return this.predictionsService.getMaintenancePredictions(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new prediction' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Prediction created' })
  async createPrediction(@Body() dto: CreatePredictionDto) {
    return this.predictionsService.createPrediction(dto);
  }

  @Post('train')
  @ApiOperation({ summary: 'Train prediction models' })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Training started' })
  async trainModels() {
    return this.predictionsService.trainModels();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prediction by ID' })
  async getPredictionById(@Param('id') id: string) {
    return this.predictionsService.getPredictionById(id);
  }

  @Get(':id/accuracy')
  @ApiOperation({ summary: 'Get prediction accuracy' })
  async getPredictionAccuracy(@Param('id') id: string) {
    return this.predictionsService.getPredictionAccuracy(id);
  }
}
