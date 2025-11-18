import { BaseExtension, ExtensionCategory } from '../core/base-extension';

/**
 * Affiliate commission types
 */
export enum CommissionType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  TIERED = 'tiered',
  RECURRING = 'recurring',
}

/**
 * Affiliate status
 */
export enum AffiliateStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

/**
 * Commission status
 */
export enum CommissionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  PAID = 'paid',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

/**
 * Affiliate configuration
 */
export interface AffiliateConfig {
  defaultCommissionRate?: number;
  defaultCommissionType?: CommissionType;
  cookieDuration?: number; // days
  minimumPayout?: number;
  payoutSchedule?: 'daily' | 'weekly' | 'monthly';
  autoApprove?: boolean;
  [key: string]: any;
}

/**
 * Affiliate registration request
 */
export interface AffiliateRegistrationRequest {
  userId: string;
  email: string;
  name: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  taxId?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  referralCode?: string;
  metadata?: Record<string, any>;
}

/**
 * Affiliate profile
 */
export interface AffiliateProfile {
  affiliateId: string;
  userId: string;
  referralCode: string;
  status: AffiliateStatus;
  commissionRate: number;
  commissionType: CommissionType;
  totalEarnings: number;
  pendingEarnings: number;
  paidEarnings: number;
  totalReferrals: number;
  totalSales: number;
  joinedAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Referral tracking request
 */
export interface ReferralTrackingRequest {
  referralCode: string;
  customerId?: string;
  sessionId?: string;
  sourceUrl?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

/**
 * Referral conversion request
 */
export interface ReferralConversionRequest {
  referralCode: string;
  customerId: string;
  orderId: string;
  orderAmount: number;
  products?: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  metadata?: Record<string, any>;
}

/**
 * Commission calculation request
 */
export interface CommissionCalculationRequest {
  affiliateId: string;
  orderAmount: number;
  productIds?: string[];
  customCommissionRate?: number;
}

/**
 * Commission calculation response
 */
export interface CommissionCalculationResponse {
  commissionAmount: number;
  commissionRate: number;
  commissionType: CommissionType;
  orderAmount: number;
  breakdown?: Array<{
    productId?: string;
    amount: number;
    rate: number;
  }>;
}

/**
 * Commission record
 */
export interface CommissionRecord {
  commissionId: string;
  affiliateId: string;
  orderId: string;
  customerId: string;
  amount: number;
  rate: number;
  type: CommissionType;
  status: CommissionStatus;
  approvedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  metadata?: Record<string, any>;
}

/**
 * Payout request
 */
export interface PayoutRequest {
  affiliateId: string;
  amount: number;
  paymentMethod: string;
  paymentDetails?: Record<string, any>;
}

/**
 * Payout response
 */
export interface PayoutResponse {
  payoutId: string;
  affiliateId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  paidAt?: Date;
}

/**
 * Performance metrics
 */
export interface AffiliatePerformanceMetrics {
  affiliateId: string;
  period: {
    start: Date;
    end: Date;
  };
  clicks: number;
  conversions: number;
  conversionRate: number;
  sales: number;
  revenue: number;
  commission: number;
  averageOrderValue: number;
  topProducts?: Array<{
    productId: string;
    sales: number;
    revenue: number;
  }>;
}

/**
 * Base interface for affiliate extensions
 */
export interface IAffiliateExtension extends BaseExtension {
  readonly category: ExtensionCategory.AFFILIATE;

  /**
   * Register new affiliate
   */
  registerAffiliate(request: AffiliateRegistrationRequest): Promise<AffiliateProfile>;

  /**
   * Get affiliate profile
   */
  getAffiliateProfile(affiliateId: string): Promise<AffiliateProfile>;

  /**
   * Track referral click
   */
  trackReferral(request: ReferralTrackingRequest): Promise<void>;

  /**
   * Record referral conversion
   */
  recordConversion(request: ReferralConversionRequest): Promise<CommissionRecord>;

  /**
   * Calculate commission
   */
  calculateCommission(
    request: CommissionCalculationRequest,
  ): Promise<CommissionCalculationResponse>;

  /**
   * Get affiliate commissions
   */
  getCommissions(affiliateId: string, filters?: {
    status?: CommissionStatus;
    startDate?: Date;
    endDate?: Date;
  }): Promise<CommissionRecord[]>;

  /**
   * Approve commission
   */
  approveCommission(commissionId: string): Promise<void>;

  /**
   * Process payout
   */
  processPayout(request: PayoutRequest): Promise<PayoutResponse>;

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(affiliateId: string, startDate: Date, endDate: Date): Promise<AffiliatePerformanceMetrics>;

  /**
   * Generate referral code
   */
  generateReferralCode?(prefix?: string): string;

  /**
   * Validate referral code
   */
  validateReferralCode?(code: string): Promise<boolean>;

  /**
   * Get affiliate by referral code
   */
  getAffiliateByReferralCode?(code: string): Promise<AffiliateProfile>;
}

/**
 * Abstract base class for affiliate extensions
 */
export abstract class BaseAffiliateExtension
  extends BaseExtension
  implements IAffiliateExtension
{
  readonly category = ExtensionCategory.AFFILIATE;
  protected affiliateConfig: AffiliateConfig;

  abstract registerAffiliate(request: AffiliateRegistrationRequest): Promise<AffiliateProfile>;
  abstract getAffiliateProfile(affiliateId: string): Promise<AffiliateProfile>;
  abstract trackReferral(request: ReferralTrackingRequest): Promise<void>;
  abstract recordConversion(request: ReferralConversionRequest): Promise<CommissionRecord>;
  abstract calculateCommission(
    request: CommissionCalculationRequest,
  ): Promise<CommissionCalculationResponse>;
  abstract getCommissions(
    affiliateId: string,
    filters?: { status?: CommissionStatus; startDate?: Date; endDate?: Date },
  ): Promise<CommissionRecord[]>;
  abstract approveCommission(commissionId: string): Promise<void>;
  abstract processPayout(request: PayoutRequest): Promise<PayoutResponse>;
  abstract getPerformanceMetrics(
    affiliateId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AffiliatePerformanceMetrics>;

  async initialize(config: AffiliateConfig): Promise<void> {
    await super.initialize(config);
    this.affiliateConfig = config;
  }

  generateReferralCode(prefix: string = 'REF'): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  async validateReferralCode(code: string): Promise<boolean> {
    try {
      const affiliate = await this.getAffiliateByReferralCode?.(code);
      return !!affiliate && affiliate.status === AffiliateStatus.ACTIVE;
    } catch {
      return false;
    }
  }

  async getAffiliateByReferralCode(code: string): Promise<AffiliateProfile> {
    throw new Error('Not implemented');
  }
}
