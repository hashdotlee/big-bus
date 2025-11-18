import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Affiliate, AffiliateStatus } from '../../database/entities/affiliate.entity';
import { ReferralClick } from '../../database/entities/referral-click.entity';
import { RegisterAffiliateDto } from './dto/register-affiliate.dto';
import { UpdateAffiliateDto } from './dto/update-affiliate.dto';
import { TrackReferralDto } from './dto/track-referral.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AffiliatesService {
  private readonly logger = new Logger(AffiliatesService.name);

  constructor(
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(ReferralClick)
    private readonly referralClickRepository: Repository<ReferralClick>,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterAffiliateDto): Promise<Affiliate> {
    // Check if user already has an affiliate account
    const existing = await this.affiliateRepository.findOne({
      where: { userId: registerDto.userId },
    });

    if (existing) {
      throw new ConflictException('User already has an affiliate account');
    }

    // Check if email is already used
    const existingEmail = await this.affiliateRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingEmail) {
      throw new ConflictException('Email already registered as affiliate');
    }

    // Generate unique referral code
    const referralCode = registerDto.referralCode || this.generateReferralCode();

    // Check if referral code is unique
    const existingCode = await this.affiliateRepository.findOne({
      where: { referralCode },
    });

    if (existingCode) {
      throw new ConflictException('Referral code already exists');
    }

    // Get default commission rate from config
    const defaultCommissionRate = this.configService.get('DEFAULT_COMMISSION_RATE', 5);

    const affiliate = this.affiliateRepository.create({
      ...registerDto,
      referralCode,
      commissionRate: defaultCommissionRate,
      status: AffiliateStatus.PENDING,
    });

    const saved = await this.affiliateRepository.save(affiliate);

    this.logger.log(`New affiliate registered: ${saved.id} (${saved.email})`);

    return saved;
  }

  async findAll(page: number = 1, limit: number = 10, status?: AffiliateStatus): Promise<{
    data: Affiliate[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.affiliateRepository.createQueryBuilder('affiliate');

    if (status) {
      query.where('affiliate.status = :status', { status });
    }

    query
      .orderBy('affiliate.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Affiliate> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id },
      relations: ['commissions'],
    });

    if (!affiliate) {
      throw new NotFoundException(`Affiliate with ID ${id} not found`);
    }

    return affiliate;
  }

  async findByUserId(userId: string): Promise<Affiliate> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { userId },
    });

    if (!affiliate) {
      throw new NotFoundException(`Affiliate for user ${userId} not found`);
    }

    return affiliate;
  }

  async findByReferralCode(referralCode: string): Promise<Affiliate> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { referralCode },
    });

    if (!affiliate) {
      throw new NotFoundException(`Affiliate with referral code ${referralCode} not found`);
    }

    return affiliate;
  }

  async update(id: string, updateDto: UpdateAffiliateDto): Promise<Affiliate> {
    const affiliate = await this.findOne(id);

    Object.assign(affiliate, updateDto);

    const updated = await this.affiliateRepository.save(affiliate);

    this.logger.log(`Affiliate updated: ${updated.id}`);

    return updated;
  }

  async updateStatus(id: string, status: AffiliateStatus): Promise<Affiliate> {
    const affiliate = await this.findOne(id);

    affiliate.status = status;

    const updated = await this.affiliateRepository.save(affiliate);

    this.logger.log(`Affiliate status updated: ${updated.id} -> ${status}`);

    return updated;
  }

  async trackReferral(trackDto: TrackReferralDto): Promise<ReferralClick> {
    // Verify referral code exists and affiliate is active
    const affiliate = await this.findByReferralCode(trackDto.referralCode);

    if (affiliate.status !== AffiliateStatus.ACTIVE) {
      throw new BadRequestException('Affiliate is not active');
    }

    // Create referral click record
    const click = this.referralClickRepository.create({
      affiliateId: affiliate.id,
      referralCode: trackDto.referralCode,
      customerId: trackDto.customerId,
      sessionId: trackDto.sessionId,
      sourceUrl: trackDto.sourceUrl,
      ipAddress: trackDto.ipAddress,
      userAgent: trackDto.userAgent,
    });

    const saved = await this.referralClickRepository.save(click);

    // Update affiliate total referrals
    await this.affiliateRepository.increment(
      { id: affiliate.id },
      'totalReferrals',
      1,
    );

    this.logger.log(`Referral tracked: ${affiliate.referralCode} -> Click ID: ${saved.id}`);

    return saved;
  }

  async getPerformanceMetrics(
    affiliateId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<any> {
    const affiliate = await this.findOne(affiliateId);

    // Build query for referral clicks
    const clickQuery = this.referralClickRepository
      .createQueryBuilder('click')
      .where('click.affiliateId = :affiliateId', { affiliateId });

    if (startDate) {
      clickQuery.andWhere('click.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      clickQuery.andWhere('click.createdAt <= :endDate', { endDate });
    }

    const [clicks, totalClicks] = await clickQuery.getManyAndCount();
    const conversions = clicks.filter(c => c.converted).length;
    const conversionRate = totalClicks > 0 ? (conversions / totalClicks) * 100 : 0;

    return {
      affiliateId,
      period: {
        start: startDate || affiliate.createdAt,
        end: endDate || new Date(),
      },
      clicks: totalClicks,
      conversions,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalEarnings: parseFloat(affiliate.totalEarnings.toString()),
      pendingEarnings: parseFloat(affiliate.pendingEarnings.toString()),
      paidEarnings: parseFloat(affiliate.paidEarnings.toString()),
      totalSales: parseFloat(affiliate.totalSales.toString()),
      averageOrderValue: conversions > 0
        ? parseFloat(affiliate.totalSales.toString()) / conversions
        : 0,
    };
  }

  async getTopAffiliates(limit: number = 10): Promise<Affiliate[]> {
    return this.affiliateRepository
      .createQueryBuilder('affiliate')
      .where('affiliate.status = :status', { status: AffiliateStatus.ACTIVE })
      .orderBy('affiliate.totalEarnings', 'DESC')
      .take(limit)
      .getMany();
  }

  private generateReferralCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REF${timestamp}${random}`;
  }

  async validateReferralCode(code: string): Promise<boolean> {
    try {
      const affiliate = await this.findByReferralCode(code);
      return affiliate.status === AffiliateStatus.ACTIVE;
    } catch {
      return false;
    }
  }
}
