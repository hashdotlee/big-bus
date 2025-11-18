import { BaseExtension, ExtensionCategory } from '../core/base-extension';

/**
 * Personalization strategy types
 */
export enum PersonalizationStrategy {
  COLLABORATIVE_FILTERING = 'collaborative_filtering',
  CONTENT_BASED = 'content_based',
  HYBRID = 'hybrid',
  RULE_BASED = 'rule_based',
  AI_POWERED = 'ai_powered',
}

/**
 * User segment
 */
export enum UserSegment {
  NEW_USER = 'new_user',
  FREQUENT_TRAVELER = 'frequent_traveler',
  OCCASIONAL_TRAVELER = 'occasional_traveler',
  BUSINESS_TRAVELER = 'business_traveler',
  TOURIST = 'tourist',
  STUDENT = 'student',
  SENIOR = 'senior',
  VIP = 'vip',
}

/**
 * Personalization configuration
 */
export interface PersonalizationConfig {
  strategy?: PersonalizationStrategy;
  enableRouteOptimization?: boolean;
  enablePriceOptimization?: boolean;
  enableContentPersonalization?: boolean;
  privacyMode?: 'strict' | 'balanced' | 'personalized';
  [key: string]: any;
}

/**
 * User preferences
 */
export interface UserPreferences {
  userId: string;
  language?: string;
  currency?: string;
  timezone?: string;
  preferredSeatType?: 'window' | 'aisle' | 'any';
  preferredDepartureTime?: 'morning' | 'afternoon' | 'evening' | 'night';
  budgetRange?: {
    min: number;
    max: number;
  };
  amenityPreferences?: {
    wifi?: boolean;
    ac?: boolean;
    tv?: boolean;
    charging?: boolean;
    sleeper?: boolean;
  };
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string[];
  communicationPreferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  metadata?: Record<string, any>;
}

/**
 * User behavior
 */
export interface UserBehavior {
  userId: string;
  sessionId?: string;
  timestamp: Date;
  eventType: string;
  eventData: Record<string, any>;
  deviceInfo?: {
    type: 'mobile' | 'desktop' | 'tablet';
    os?: string;
    browser?: string;
  };
  locationInfo?: {
    country?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}

/**
 * User profile
 */
export interface UserProfile {
  userId: string;
  segment: UserSegment;
  lifetimeValue?: number;
  totalBookings?: number;
  averageBookingValue?: number;
  favoriteRoutes?: string[];
  frequentDestinations?: string[];
  preferredPaymentMethod?: string;
  loyaltyPoints?: number;
  joinDate?: Date;
  lastActivityDate?: Date;
  demographics?: {
    age?: number;
    gender?: string;
    occupation?: string;
  };
  interests?: string[];
  metadata?: Record<string, any>;
}

/**
 * Route recommendation request
 */
export interface RouteRecommendationRequest {
  userId: string;
  origin?: string;
  destination?: string;
  date?: Date;
  budget?: number;
  preferences?: Partial<UserPreferences>;
  context?: Record<string, any>;
}

/**
 * Route recommendation response
 */
export interface RouteRecommendationResponse {
  recommendations: Array<{
    routeId: string;
    score: number;
    reason: string;
    estimatedPrice: number;
    estimatedDuration: number;
    highlights?: string[];
    metadata?: Record<string, any>;
  }>;
}

/**
 * Price optimization request
 */
export interface PriceOptimizationRequest {
  userId: string;
  routeId: string;
  basePrice: number;
  date: Date;
  seatAvailability: number;
  demandForecast?: number;
}

/**
 * Price optimization response
 */
export interface PriceOptimizationResponse {
  optimizedPrice: number;
  discountPercentage?: number;
  dynamicPricingApplied: boolean;
  reason?: string;
  validUntil?: Date;
}

/**
 * Content personalization request
 */
export interface ContentPersonalizationRequest {
  userId: string;
  contentType: 'homepage' | 'search_results' | 'product_page' | 'email' | 'notification';
  context?: Record<string, any>;
}

/**
 * Content personalization response
 */
export interface ContentPersonalizationResponse {
  content: {
    hero?: {
      title: string;
      description: string;
      image?: string;
      cta?: string;
    };
    featuredRoutes?: string[];
    promotions?: Array<{
      id: string;
      title: string;
      description: string;
      discount?: number;
    }>;
    recommendations?: any[];
    layout?: string;
  };
  metadata?: Record<string, any>;
}

/**
 * A/B test variant
 */
export interface ABTestVariant {
  variantId: string;
  name: string;
  weight: number;
  config: Record<string, any>;
}

/**
 * Base interface for personalization extensions
 */
export interface IPersonalizationExtension extends BaseExtension {
  readonly category: ExtensionCategory.PERSONALIZATION;

  /**
   * Get user preferences
   */
  getUserPreferences(userId: string): Promise<UserPreferences>;

  /**
   * Update user preferences
   */
  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences>;

  /**
   * Track user behavior
   */
  trackBehavior(behavior: UserBehavior): Promise<void>;

  /**
   * Get user profile
   */
  getUserProfile(userId: string): Promise<UserProfile>;

  /**
   * Get personalized route recommendations
   */
  getRouteRecommendations(request: RouteRecommendationRequest): Promise<RouteRecommendationResponse>;

  /**
   * Optimize pricing for user
   */
  optimizePrice(request: PriceOptimizationRequest): Promise<PriceOptimizationResponse>;

  /**
   * Personalize content
   */
  personalizeContent(request: ContentPersonalizationRequest): Promise<ContentPersonalizationResponse>;

  /**
   * Segment user
   */
  segmentUser(userId: string): Promise<UserSegment>;

  /**
   * Get A/B test variant for user
   */
  getABTestVariant?(userId: string, testId: string): Promise<ABTestVariant>;

  /**
   * Calculate user lifetime value
   */
  calculateLifetimeValue?(userId: string): Promise<number>;
}

/**
 * Abstract base class for personalization extensions
 */
export abstract class BasePersonalizationExtension
  extends BaseExtension
  implements IPersonalizationExtension
{
  readonly category = ExtensionCategory.PERSONALIZATION;
  protected personalizationConfig: PersonalizationConfig;

  abstract getUserPreferences(userId: string): Promise<UserPreferences>;
  abstract updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>,
  ): Promise<UserPreferences>;
  abstract trackBehavior(behavior: UserBehavior): Promise<void>;
  abstract getUserProfile(userId: string): Promise<UserProfile>;
  abstract getRouteRecommendations(
    request: RouteRecommendationRequest,
  ): Promise<RouteRecommendationResponse>;
  abstract optimizePrice(request: PriceOptimizationRequest): Promise<PriceOptimizationResponse>;
  abstract personalizeContent(
    request: ContentPersonalizationRequest,
  ): Promise<ContentPersonalizationResponse>;
  abstract segmentUser(userId: string): Promise<UserSegment>;

  async initialize(config: PersonalizationConfig): Promise<void> {
    await super.initialize(config);
    this.personalizationConfig = config;
  }

  async getABTestVariant(userId: string, testId: string): Promise<ABTestVariant> {
    // Simple hash-based assignment
    const hash = this.hashUserId(userId, testId);
    // Override in subclasses for more sophisticated A/B testing
    return {
      variantId: 'control',
      name: 'Control',
      weight: 1,
      config: {},
    };
  }

  async calculateLifetimeValue(userId: string): Promise<number> {
    const profile = await this.getUserProfile(userId);
    return profile.lifetimeValue || 0;
  }

  protected hashUserId(userId: string, seed: string): number {
    let hash = 0;
    const str = userId + seed;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
