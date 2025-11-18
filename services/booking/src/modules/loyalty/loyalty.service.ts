import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LoyaltyAccount,
  LoyaltyTransaction,
  LoyaltyReward,
  LoyaltyTier,
  TransactionType,
} from './loyalty.entity';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  // Tier thresholds (lifetime points needed)
  private readonly TIER_THRESHOLDS = {
    [LoyaltyTier.BRONZE]: 0,
    [LoyaltyTier.SILVER]: 1000,
    [LoyaltyTier.GOLD]: 5000,
    [LoyaltyTier.PLATINUM]: 15000,
  };

  // Points earning rates (points per 10,000 VND spent)
  private readonly EARNING_RATES = {
    [LoyaltyTier.BRONZE]: 1,
    [LoyaltyTier.SILVER]: 1.25,
    [LoyaltyTier.GOLD]: 1.5,
    [LoyaltyTier.PLATINUM]: 2,
  };

  constructor(
    @InjectRepository(LoyaltyAccount)
    private readonly accountRepository: Repository<LoyaltyAccount>,
    @InjectRepository(LoyaltyTransaction)
    private readonly transactionRepository: Repository<LoyaltyTransaction>,
    @InjectRepository(LoyaltyReward)
    private readonly rewardRepository: Repository<LoyaltyReward>,
  ) {}

  /**
   * Create loyalty account for new user
   */
  async createAccount(userId: string): Promise<LoyaltyAccount> {
    const existing = await this.accountRepository.findOne({ where: { userId } });
    if (existing) {
      return existing;
    }

    const account = this.accountRepository.create({
      userId,
      points: 0,
      lifetimePoints: 0,
      tier: LoyaltyTier.BRONZE,
      tierProgress: 0,
    });

    await this.accountRepository.save(account);
    this.logger.log(`Created loyalty account for user ${userId}`);

    return account;
  }

  /**
   * Earn points from a booking
   */
  async earnPoints(
    userId: string,
    amount: number,
    bookingId: string,
    description?: string,
  ): Promise<LoyaltyTransaction> {
    let account = await this.accountRepository.findOne({ where: { userId } });

    if (!account) {
      account = await this.createAccount(userId);
    }

    // Calculate points based on tier
    const pointsPerUnit = this.EARNING_RATES[account.tier];
    const pointsEarned = Math.floor((amount / 10000) * pointsPerUnit);

    // Update account
    account.points += pointsEarned;
    account.lifetimePoints += pointsEarned;

    // Check tier upgrade
    const newTier = this.calculateTier(account.lifetimePoints);
    if (newTier !== account.tier) {
      account.tier = newTier;
      this.logger.log(`User ${userId} upgraded to ${newTier} tier`);
    }

    account.tierProgress = this.calculateTierProgress(account.lifetimePoints);
    await this.accountRepository.save(account);

    // Create transaction
    const transaction = this.transactionRepository.create({
      accountId: account.id,
      userId,
      type: TransactionType.EARN,
      points: pointsEarned,
      balanceAfter: account.points,
      description: description || `Earned from booking`,
      bookingId,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    });

    await this.transactionRepository.save(transaction);

    this.logger.log(`User ${userId} earned ${pointsEarned} points`);

    return transaction;
  }

  /**
   * Redeem points for a reward
   */
  async redeemPoints(
    userId: string,
    rewardId: string,
  ): Promise<{ transaction: LoyaltyTransaction; reward: LoyaltyReward }> {
    const account = await this.accountRepository.findOne({ where: { userId } });
    if (!account) {
      throw new NotFoundException('Loyalty account not found');
    }

    const reward = await this.rewardRepository.findOne({ where: { id: rewardId } });
    if (!reward) {
      throw new NotFoundException('Reward not found');
    }

    if (!reward.isActive) {
      throw new BadRequestException('Reward is not available');
    }

    if (account.points < reward.pointsCost) {
      throw new BadRequestException('Insufficient points');
    }

    if (reward.minTier && this.compareTiers(account.tier, reward.minTier) < 0) {
      throw new BadRequestException(`Requires ${reward.minTier} tier or higher`);
    }

    if (reward.stockQuantity !== null && reward.redeemedCount >= reward.stockQuantity) {
      throw new BadRequestException('Reward is out of stock');
    }

    // Deduct points
    account.points -= reward.pointsCost;
    await this.accountRepository.save(account);

    // Increment redeemed count
    reward.redeemedCount += 1;
    await this.rewardRepository.save(reward);

    // Create transaction
    const transaction = this.transactionRepository.create({
      accountId: account.id,
      userId,
      type: TransactionType.REDEEM,
      points: -reward.pointsCost,
      balanceAfter: account.points,
      description: `Redeemed ${reward.name}`,
      metadata: { rewardId: reward.id, rewardData: reward.rewardData },
    });

    await this.transactionRepository.save(transaction);

    this.logger.log(`User ${userId} redeemed reward ${reward.name}`);

    return { transaction, reward };
  }

  /**
   * Get user loyalty account
   */
  async getAccount(userId: string): Promise<LoyaltyAccount> {
    let account = await this.accountRepository.findOne({ where: { userId } });

    if (!account) {
      account = await this.createAccount(userId);
    }

    return account;
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    userId: string,
    limit: number = 50,
  ): Promise<LoyaltyTransaction[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Get available rewards
   */
  async getAvailableRewards(userId?: string): Promise<LoyaltyReward[]> {
    const rewards = await this.rewardRepository.find({
      where: { isActive: true },
      order: { pointsCost: 'ASC' },
    });

    // If user is provided, filter by their tier
    if (userId) {
      const account = await this.getAccount(userId);
      return rewards.filter(
        (r) => !r.minTier || this.compareTiers(account.tier, r.minTier) >= 0,
      );
    }

    return rewards;
  }

  /**
   * Calculate tier based on lifetime points
   */
  private calculateTier(lifetimePoints: number): LoyaltyTier {
    if (lifetimePoints >= this.TIER_THRESHOLDS[LoyaltyTier.PLATINUM]) {
      return LoyaltyTier.PLATINUM;
    } else if (lifetimePoints >= this.TIER_THRESHOLDS[LoyaltyTier.GOLD]) {
      return LoyaltyTier.GOLD;
    } else if (lifetimePoints >= this.TIER_THRESHOLDS[LoyaltyTier.SILVER]) {
      return LoyaltyTier.SILVER;
    }
    return LoyaltyTier.BRONZE;
  }

  /**
   * Calculate progress towards next tier
   */
  private calculateTierProgress(lifetimePoints: number): number {
    const tiers = [
      LoyaltyTier.BRONZE,
      LoyaltyTier.SILVER,
      LoyaltyTier.GOLD,
      LoyaltyTier.PLATINUM,
    ];
    const currentTier = this.calculateTier(lifetimePoints);
    const currentIndex = tiers.indexOf(currentTier);

    if (currentIndex === tiers.length - 1) {
      return 100; // Max tier
    }

    const nextTier = tiers[currentIndex + 1];
    const currentThreshold = this.TIER_THRESHOLDS[currentTier];
    const nextThreshold = this.TIER_THRESHOLDS[nextTier];

    const progress =
      ((lifetimePoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100;

    return Math.floor(progress);
  }

  /**
   * Compare two tiers
   */
  private compareTiers(tier1: LoyaltyTier, tier2: LoyaltyTier): number {
    return (
      this.TIER_THRESHOLDS[tier1] - this.TIER_THRESHOLDS[tier2]
    );
  }
}
