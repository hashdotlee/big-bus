import { IsString, IsEnum, IsBoolean, IsOptional, IsArray, IsNumber, IsObject } from 'class-validator';
import { PreferenceCategory } from '../../../database/entities/user-preference.entity';

export class UpdatePreferenceDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(PreferenceCategory)
  category?: PreferenceCategory;

  @IsOptional()
  @IsArray()
  favoriteRoutes?: string[];

  @IsOptional()
  @IsArray()
  favoriteStops?: string[];

  @IsOptional()
  @IsArray()
  preferredDepartureTime?: string[];

  @IsOptional()
  @IsBoolean()
  preferExpressRoutes?: boolean;

  @IsOptional()
  @IsBoolean()
  preferScenicRoutes?: boolean;

  @IsOptional()
  @IsString()
  preferredSeatType?: string;

  @IsOptional()
  @IsString()
  preferredDeckLevel?: string;

  @IsOptional()
  @IsBoolean()
  requiresWheelchairAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  prefersWifi?: boolean;

  @IsOptional()
  @IsBoolean()
  prefersAirConditioning?: boolean;

  @IsOptional()
  @IsBoolean()
  prefersUSBCharging?: boolean;

  @IsOptional()
  @IsBoolean()
  prefersSnackBar?: boolean;

  @IsOptional()
  @IsArray()
  favoriteProducts?: string[];

  @IsOptional()
  @IsArray()
  productCategories?: string[];

  @IsOptional()
  @IsBoolean()
  enableEmailNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  enablePushNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  enableSMSNotifications?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnDeals?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyOnBookingUpdates?: boolean;

  @IsOptional()
  @IsString()
  preferredPaymentMethod?: string;

  @IsOptional()
  @IsString()
  preferredCurrency?: string;

  @IsOptional()
  @IsNumber()
  maxBudgetPerTrip?: number;

  @IsOptional()
  @IsString()
  budgetTier?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsBoolean()
  requiresLargeText?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresAudioAssistance?: boolean;

  @IsOptional()
  @IsBoolean()
  allowPersonalizedRecommendations?: boolean;

  @IsOptional()
  @IsBoolean()
  allowDataCollection?: boolean;

  @IsOptional()
  @IsObject()
  customPreferences?: Record<string, any>;
}
