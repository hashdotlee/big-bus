export enum PredictionType {
  DEMAND = 'demand',
  REVENUE = 'revenue',
  OCCUPANCY = 'occupancy',
  MAINTENANCE = 'maintenance',
}

export enum PredictionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface Prediction {
  id: string;
  predictionType: PredictionType;
  targetDate: Date;
  predictionDate: Date;
  data: any;
  confidence?: number;
  parameters?: any;
  modelVersion?: string;
  status: PredictionStatus;
  actualValue?: any;
  accuracyScore?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePredictionRequest {
  predictionType: PredictionType;
  targetDate: string;
  parameters?: any;
}

export interface QueryPredictionsRequest {
  predictionType?: PredictionType;
  status?: PredictionStatus;
  startDate?: string;
  endDate?: string;
}

export interface DemandPrediction {
  predictedBookings: number;
  dayOfWeek: string;
  historicalAverage: number;
  trend: number;
}

export interface RevenuePrediction {
  predictedRevenue: number;
  dayOfWeek: string;
  historicalAverage: number;
  trend: number;
}

export interface OccupancyPrediction {
  predictedOccupancy: number;
  message?: string;
}

export interface MaintenancePrediction {
  vehiclesNeedingMaintenance: any[];
  message?: string;
}
