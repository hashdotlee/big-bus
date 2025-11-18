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
  data: Record<string, unknown>;
  confidence?: number;
  parameters?: Record<string, unknown>;
  modelVersion?: string;
  status: PredictionStatus;
  actualValue?: number | Record<string, unknown>;
  accuracyScore?: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePredictionRequest {
  predictionType: PredictionType;
  targetDate: string;
  parameters?: Record<string, unknown>;
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

export interface VehicleMaintenanceInfo {
  vehicleId: string;
  maintenanceType: string;
  estimatedDate: Date;
  priority?: string;
}

export interface MaintenancePrediction {
  vehiclesNeedingMaintenance: VehicleMaintenanceInfo[];
  message?: string;
}
