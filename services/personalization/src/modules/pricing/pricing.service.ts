import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PricingRule, RuleStatus } from '../../database/entities/pricing-rule.entity';
import { UserSegment } from '../../database/entities/user-segment.entity';
import { GetPersonalizedPriceDto } from './dto/pricing.dto';

@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingRule)
    private readonly pricingRuleRepository: Repository<PricingRule>,
    @InjectRepository(UserSegment)
    private readonly segmentRepository: Repository<UserSegment>,
  ) {}

  async getPersonalizedPrice(dto: GetPersonalizedPriceDto, basePrice: number): Promise<{
    basePrice: number;
    adjustedPrice: number;
    discount: number;
    discountPercentage: number;
    appliedRules: Array<{ name: string; adjustment: number }>;
  }> {
    const { userId, entityType, entityId, date } = dto;

    // Get user segment
    const segment = await this.segmentRepository.findOne({ where: { userId } });

    // Find applicable rules
    const rules = await this.findApplicableRules(userId, entityType, entityId, segment, date);

    let adjustedPrice = basePrice;
    const appliedRules: Array<{ name: string; adjustment: number }> = [];

    // Apply rules in priority order
    for (const rule of rules) {
      const { price: newPrice, adjustment } = this.applyRule(adjustedPrice, rule);

      if (newPrice !== adjustedPrice) {
        adjustedPrice = newPrice;
        appliedRules.push({
          name: rule.name,
          adjustment,
        });

        // Update rule usage
        rule.currentUsageCount += 1;
        rule.totalApplications += 1;
        await this.pricingRuleRepository.save(rule);
      }
    }

    const discount = basePrice - adjustedPrice;
    const discountPercentage = basePrice > 0 ? (discount / basePrice) * 100 : 0;

    return {
      basePrice,
      adjustedPrice: Math.max(adjustedPrice, 0),
      discount: Math.max(discount, 0),
      discountPercentage: Number(discountPercentage.toFixed(2)),
      appliedRules,
    };
  }

  private async findApplicableRules(
    userId: string,
    entityType: string,
    entityId: string,
    segment: UserSegment | null,
    date?: string
  ): Promise<PricingRule[]> {
    const now = new Date();
    const queryBuilder = this.pricingRuleRepository.createQueryBuilder('rule');

    queryBuilder.where('rule.status = :status', { status: RuleStatus.ACTIVE });
    queryBuilder.andWhere('(rule.validFrom IS NULL OR rule.validFrom <= :now)', { now });
    queryBuilder.andWhere('(rule.validUntil IS NULL OR rule.validUntil >= :now)', { now });
    queryBuilder.andWhere(
      '(rule.maxTotalUsage IS NULL OR rule.currentUsageCount < rule.maxTotalUsage)'
    );

    queryBuilder.orderBy('rule.priority', 'DESC');

    const allRules = await queryBuilder.getMany();

    // Filter rules based on targeting criteria
    return allRules.filter(rule => {
      // Check user segment targeting
      if (rule.targetUserSegments && rule.targetUserSegments.length > 0) {
        if (!segment || !rule.targetUserSegments.includes(segment.userTier || '')) {
          return false;
        }
      }

      // Check entity targeting
      if (rule.targetRoutes && rule.targetRoutes.length > 0) {
        if (!rule.targetRoutes.includes(entityId)) {
          return false;
        }
      }

      // Check day of week targeting
      if (rule.targetDayOfWeek) {
        const targetDate = date ? new Date(date) : new Date();
        const dayOfWeek = targetDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
        if (rule.targetDayOfWeek !== dayOfWeek) {
          return false;
        }
      }

      return true;
    });
  }

  private applyRule(currentPrice: number, rule: PricingRule): { price: number; adjustment: number } {
    let newPrice = currentPrice;
    let adjustment = 0;

    switch (rule.adjustmentType) {
      case 'percentage':
        adjustment = (currentPrice * Number(rule.adjustmentValue)) / 100;
        newPrice = currentPrice - adjustment;
        break;

      case 'fixed_amount':
        adjustment = Number(rule.adjustmentValue);
        newPrice = currentPrice - adjustment;
        break;

      case 'multiplier':
        newPrice = currentPrice * Number(rule.adjustmentValue);
        adjustment = currentPrice - newPrice;
        break;
    }

    // Apply min/max price constraints
    if (rule.minPrice && newPrice < Number(rule.minPrice)) {
      newPrice = Number(rule.minPrice);
    }

    if (rule.maxPrice && newPrice > Number(rule.maxPrice)) {
      newPrice = Number(rule.maxPrice);
    }

    return {
      price: Number(newPrice.toFixed(2)),
      adjustment: Number(adjustment.toFixed(2)),
    };
  }
}
