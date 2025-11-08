import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  Prediction,
  PredictionType,
  PredictionStatus,
} from '../../database/entities/prediction.entity';
import { CreatePredictionDto } from './dto/create-prediction.dto';
import { QueryPredictionsDto } from './dto/query-predictions.dto';
import * as moment from 'moment';

@Injectable()
export class PredictionsService {
  private readonly logger = new Logger(PredictionsService.name);

  constructor(
    @InjectRepository(Prediction)
    private readonly predictionRepo: Repository<Prediction>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Get all predictions with filtering
   */
  async getPredictions(query: QueryPredictionsDto) {
    const { predictionType, status, startDate, endDate } = query;

    const where: FindOptionsWhere<Prediction> = {};

    if (predictionType) where.predictionType = predictionType;
    if (status) where.status = status;

    if (startDate && endDate) {
      where.targetDate = Between(new Date(startDate), new Date(endDate));
    }

    const predictions = await this.predictionRepo.find({
      where,
      order: { targetDate: 'ASC' },
    });

    return {
      data: predictions,
      total: predictions.length,
    };
  }

  /**
   * Get prediction by ID
   */
  async getPredictionById(id: string) {
    const prediction = await this.predictionRepo.findOne({ where: { id } });
    if (!prediction) {
      throw new NotFoundException(`Prediction with ID ${id} not found`);
    }
    return prediction;
  }

  /**
   * Create a new prediction
   */
  async createPrediction(dto: CreatePredictionDto) {
    this.logger.log(`Creating ${dto.predictionType} prediction for ${dto.targetDate}`);

    const prediction = this.predictionRepo.create({
      predictionType: dto.predictionType,
      targetDate: new Date(dto.targetDate),
      parameters: dto.parameters,
      status: PredictionStatus.PENDING,
    });

    const saved = await this.predictionRepo.save(prediction);

    // Process prediction asynchronously
    this.processPrediction(saved.id, dto).catch((error) => {
      this.logger.error(`Failed to process prediction ${saved.id}`, error);
    });

    return {
      id: saved.id,
      status: saved.status,
      message: 'Prediction processing started',
    };
  }

  /**
   * Process prediction (async)
   */
  private async processPrediction(predictionId: string, dto: CreatePredictionDto) {
    try {
      await this.predictionRepo.update(predictionId, {
        status: PredictionStatus.PROCESSING,
      });

      let predictionData: any;

      switch (dto.predictionType) {
        case PredictionType.DEMAND:
          predictionData = await this.predictDemand(new Date(dto.targetDate));
          break;
        case PredictionType.REVENUE:
          predictionData = await this.predictRevenue(new Date(dto.targetDate));
          break;
        case PredictionType.OCCUPANCY:
          predictionData = await this.predictOccupancy(new Date(dto.targetDate));
          break;
        case PredictionType.MAINTENANCE:
          predictionData = await this.predictMaintenance(new Date(dto.targetDate));
          break;
        default:
          throw new Error('Unsupported prediction type');
      }

      await this.predictionRepo.update(predictionId, {
        status: PredictionStatus.COMPLETED,
        data: predictionData.data,
        confidence: predictionData.confidence,
        modelVersion: '1.0.0',
      });

      this.logger.log(`Prediction ${predictionId} completed successfully`);
    } catch (error) {
      this.logger.error(`Failed to process prediction ${predictionId}`, error);
      await this.predictionRepo.update(predictionId, {
        status: PredictionStatus.FAILED,
        errorMessage: error.message,
      });
    }
  }

  /**
   * Get demand predictions
   */
  async getDemandPredictions(query: QueryPredictionsDto) {
    return this.getPredictions({
      ...query,
      predictionType: PredictionType.DEMAND,
    });
  }

  /**
   * Get revenue predictions
   */
  async getRevenuePredictions(query: QueryPredictionsDto) {
    return this.getPredictions({
      ...query,
      predictionType: PredictionType.REVENUE,
    });
  }

  /**
   * Get occupancy predictions
   */
  async getOccupancyPredictions(query: QueryPredictionsDto) {
    return this.getPredictions({
      ...query,
      predictionType: PredictionType.OCCUPANCY,
    });
  }

  /**
   * Get maintenance predictions
   */
  async getMaintenancePredictions(query: QueryPredictionsDto) {
    return this.getPredictions({
      ...query,
      predictionType: PredictionType.MAINTENANCE,
    });
  }

  /**
   * Predict demand for a target date
   */
  private async predictDemand(targetDate: Date) {
    // Simple moving average-based prediction
    // In production, this would use a proper ML model
    const historicalData = await this.fetchHistoricalBookings();

    // Calculate average bookings for the same day of week
    const dayOfWeek = moment(targetDate).day();
    const sameDayBookings = historicalData.filter(
      (d: any) => moment(d.date).day() === dayOfWeek,
    );

    const averageBookings = sameDayBookings.length > 0
      ? sameDayBookings.reduce((sum: number, d: any) => sum + d.bookings, 0) / sameDayBookings.length
      : 0;

    // Add some variance based on trend
    const trend = this.calculateTrend(historicalData);
    const predictedDemand = Math.round(averageBookings * (1 + trend));

    return {
      data: {
        predictedBookings: predictedDemand,
        dayOfWeek: moment(targetDate).format('dddd'),
        historicalAverage: averageBookings,
        trend: trend * 100,
      },
      confidence: 0.75,
    };
  }

  /**
   * Predict revenue for a target date
   */
  private async predictRevenue(targetDate: Date) {
    const historicalData = await this.fetchHistoricalBookings();

    const dayOfWeek = moment(targetDate).day();
    const sameDayRevenue = historicalData.filter(
      (d: any) => moment(d.date).day() === dayOfWeek,
    );

    const averageRevenue = sameDayRevenue.length > 0
      ? sameDayRevenue.reduce((sum: number, d: any) => sum + d.revenue, 0) / sameDayRevenue.length
      : 0;

    const trend = this.calculateTrend(historicalData.map((d: any) => ({ ...d, bookings: d.revenue })));
    const predictedRevenue = averageRevenue * (1 + trend);

    return {
      data: {
        predictedRevenue: Math.round(predictedRevenue * 100) / 100,
        dayOfWeek: moment(targetDate).format('dddd'),
        historicalAverage: averageRevenue,
        trend: trend * 100,
      },
      confidence: 0.72,
    };
  }

  /**
   * Predict occupancy for a target date
   */
  private async predictOccupancy(targetDate: Date) {
    // Mock implementation
    return {
      data: {
        predictedOccupancy: 0.75,
        message: 'Occupancy prediction requires vehicle capacity data',
      },
      confidence: 0.65,
    };
  }

  /**
   * Predict maintenance needs
   */
  private async predictMaintenance(targetDate: Date) {
    // Mock implementation
    return {
      data: {
        vehiclesNeedingMaintenance: [],
        message: 'Maintenance prediction requires vehicle usage data',
      },
      confidence: 0.60,
    };
  }

  /**
   * Fetch historical booking data
   */
  private async fetchHistoricalBookings() {
    try {
      const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
      const endDate = new Date();
      const startDate = moment().subtract(90, 'days').toDate();

      const response = await firstValueFrom(
        this.httpService.get(`${bookingServiceUrl}/api/v1/bookings`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        }),
      );

      // Group by date
      const bookingsByDate = new Map<string, any>();
      response.data.data?.forEach((booking: any) => {
        const date = moment(booking.createdAt).format('YYYY-MM-DD');
        if (!bookingsByDate.has(date)) {
          bookingsByDate.set(date, { date, bookings: 0, revenue: 0 });
        }
        const day = bookingsByDate.get(date);
        day.bookings++;
        day.revenue += booking.totalPrice || 0;
      });

      return Array.from(bookingsByDate.values());
    } catch (error) {
      this.logger.error('Failed to fetch historical bookings', error);
      return [];
    }
  }

  /**
   * Calculate trend from historical data
   */
  private calculateTrend(data: any[]) {
    if (data.length < 2) return 0;

    // Simple linear regression slope
    const n = data.length;
    const sumX = data.reduce((sum, _, i) => sum + i, 0);
    const sumY = data.reduce((sum, d) => sum + d.bookings, 0);
    const sumXY = data.reduce((sum, d, i) => sum + i * d.bookings, 0);
    const sumX2 = data.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const avgY = sumY / n;

    return slope / avgY; // Normalized slope
  }

  /**
   * Get prediction accuracy
   */
  async getPredictionAccuracy(id: string) {
    const prediction = await this.getPredictionById(id);

    if (!prediction.actualValue) {
      return {
        predictionId: id,
        hasActualValue: false,
        message: 'Actual value not yet available',
      };
    }

    return {
      predictionId: id,
      hasActualValue: true,
      accuracyScore: prediction.accuracyScore,
      prediction: prediction.data,
      actual: prediction.actualValue,
    };
  }

  /**
   * Train prediction models
   */
  async trainModels() {
    this.logger.log('Starting model training');

    // Mock implementation
    // In production, this would trigger ML model training

    return {
      status: 'accepted',
      message: 'Model training started',
      estimatedTime: '30 minutes',
    };
  }
}
