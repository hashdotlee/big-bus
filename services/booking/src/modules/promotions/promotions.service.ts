import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, LessThan } from 'typeorm';
import { Promotion, CouponUsage, PromotionType } from './promotions.entity';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(CouponUsage)
    private readonly usageRepository: Repository<CouponUsage>,
  ) {}

  /**
   * Validate and calculate discount for a promotion code
   */
  async validatePromotion(
    code: string,
    userId: string,
    amount: number,
    routeId?: string,
  ): Promise<{ valid: boolean; discount: number; promotion: Promotion }> {
    const promotion = await this.promotionRepository.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion code not found');
    }

    const now = new Date();

    // Check dates
    if (now < promotion.startDate || now > promotion.endDate) {
      throw new BadRequestException('Promotion code has expired');
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      throw new BadRequestException('Promotion code usage limit reached');
    }

    // Check per-user limit
    if (promotion.perUserLimit) {
      const userUsageCount = await this.usageRepository.count({
        where: { promotionId: promotion.id, userId },
      });

      if (userUsageCount >= promotion.perUserLimit) {
        throw new BadRequestException('You have already used this promotion code');
      }
    }

    // Check minimum purchase
    if (promotion.minPurchase && amount < promotion.minPurchase) {
      throw new BadRequestException(
        `Minimum purchase amount is ${promotion.minPurchase}`,
      );
    }

    // Check applicable routes
    if (
      promotion.applicableRoutes &&
      promotion.applicableRoutes.length > 0 &&
      routeId
    ) {
      if (!promotion.applicableRoutes.includes(routeId)) {
        throw new BadRequestException('Promotion not applicable to this route');
      }
    }

    // Calculate discount
    let discount = 0;

    switch (promotion.type) {
      case PromotionType.PERCENTAGE:
        discount = (amount * promotion.discountValue) / 100;
        if (promotion.maxDiscount) {
          discount = Math.min(discount, promotion.maxDiscount);
        }
        break;

      case PromotionType.FIXED_AMOUNT:
        discount = promotion.discountValue;
        break;

      default:
        discount = 0;
    }

    discount = Math.min(discount, amount); // Can't discount more than total

    return {
      valid: true,
      discount,
      promotion,
    };
  }

  /**
   * Apply promotion to a booking
   */
  async applyPromotion(
    promotionId: string,
    userId: string,
    bookingId: string,
    originalAmount: number,
    discountAmount: number,
  ): Promise<CouponUsage> {
    const promotion = await this.promotionRepository.findOne({
      where: { id: promotionId },
    });

    if (!promotion) {
      throw new NotFoundException('Promotion not found');
    }

    // Increment usage count
    promotion.usageCount += 1;
    await this.promotionRepository.save(promotion);

    // Record usage
    const usage = this.usageRepository.create({
      userId,
      promotionId,
      bookingId,
      originalAmount,
      discountAmount,
      finalAmount: originalAmount - discountAmount,
    });

    await this.usageRepository.save(usage);

    this.logger.log(
      `Applied promotion ${promotion.code} to booking ${bookingId}, saved ${discountAmount}`,
    );

    return usage;
  }

  /**
   * Get active promotions
   */
  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();

    return this.promotionRepository.find({
      where: {
        isActive: true,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get user's promotion usage history
   */
  async getUserUsageHistory(userId: string): Promise<CouponUsage[]> {
    return this.usageRepository.find({
      where: { userId },
      order: { usedAt: 'DESC' },
      take: 50,
    });
  }
}
