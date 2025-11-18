import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Commission, CommissionStatus } from '../../database/entities/commission.entity';
import { Affiliate } from '../../database/entities/affiliate.entity';
import { ReferralClick } from '../../database/entities/referral-click.entity';
import { RecordConversionDto } from './dto/record-conversion.dto';
import { ApproveCommissionDto } from './dto/approve-commission.dto';

@Injectable()
export class CommissionsService {
  private readonly logger = new Logger(CommissionsService.name);

  constructor(
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(ReferralClick)
    private readonly referralClickRepository: Repository<ReferralClick>,
  ) {}

  async recordConversion(conversionDto: RecordConversionDto): Promise<Commission> {
    // Find affiliate by referral code
    const affiliate = await this.affiliateRepository.findOne({
      where: { referralCode: conversionDto.referralCode },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    // Check if commission already exists for this order
    const existing = await this.commissionRepository.findOne({
      where: { orderId: conversionDto.orderId },
    });

    if (existing) {
      throw new BadRequestException('Commission already recorded for this order');
    }

    // Calculate commission
    const commissionAmount = this.calculateCommission(
      conversionDto.orderAmount,
      affiliate.commissionRate,
      affiliate.commissionType,
    );

    // Create commission record
    const commission = this.commissionRepository.create({
      affiliateId: affiliate.id,
      orderId: conversionDto.orderId,
      customerId: conversionDto.customerId,
      orderAmount: conversionDto.orderAmount,
      commissionAmount,
      commissionRate: affiliate.commissionRate,
      status: CommissionStatus.PENDING,
      metadata: {
        products: conversionDto.products,
        referralCode: conversionDto.referralCode,
      },
    });

    const saved = await this.commissionRepository.save(commission);

    // Update affiliate stats
    await this.affiliateRepository.increment(
      { id: affiliate.id },
      'totalConversions',
      1,
    );
    await this.affiliateRepository.increment(
      { id: affiliate.id },
      'totalSales',
      conversionDto.orderAmount,
    );
    await this.affiliateRepository.increment(
      { id: affiliate.id },
      'pendingEarnings',
      commissionAmount,
    );
    await this.affiliateRepository.increment(
      { id: affiliate.id },
      'totalEarnings',
      commissionAmount,
    );

    // Mark referral click as converted
    await this.referralClickRepository
      .createQueryBuilder()
      .update(ReferralClick)
      .set({
        converted: true,
        orderId: conversionDto.orderId,
        convertedAt: new Date(),
      })
      .where('affiliateId = :affiliateId', { affiliateId: affiliate.id })
      .andWhere('customerId = :customerId', { customerId: conversionDto.customerId })
      .andWhere('converted = false')
      .execute();

    this.logger.log(
      `Conversion recorded: Order ${conversionDto.orderId} -> Affiliate ${affiliate.referralCode} -> Commission ${commissionAmount}`,
    );

    return saved;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    affiliateId?: string,
    status?: CommissionStatus,
  ): Promise<{
    data: Commission[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.commissionRepository.createQueryBuilder('commission');

    if (affiliateId) {
      query.where('commission.affiliateId = :affiliateId', { affiliateId });
    }

    if (status) {
      query.andWhere('commission.status = :status', { status });
    }

    query
      .orderBy('commission.createdAt', 'DESC')
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

  async findOne(id: string): Promise<Commission> {
    const commission = await this.commissionRepository.findOne({
      where: { id },
      relations: ['affiliate'],
    });

    if (!commission) {
      throw new NotFoundException(`Commission with ID ${id} not found`);
    }

    return commission;
  }

  async approve(id: string, approveDto: ApproveCommissionDto): Promise<Commission> {
    const commission = await this.findOne(id);

    if (commission.status !== CommissionStatus.PENDING) {
      throw new BadRequestException('Only pending commissions can be approved/rejected');
    }

    commission.status = approveDto.status;

    if (approveDto.status === CommissionStatus.APPROVED) {
      commission.approvedAt = new Date();
    } else if (approveDto.status === CommissionStatus.REJECTED) {
      commission.rejectedReason = approveDto.rejectedReason;

      // Deduct from affiliate pending earnings
      await this.affiliateRepository.decrement(
        { id: commission.affiliateId },
        'pendingEarnings',
        commission.commissionAmount,
      );
      await this.affiliateRepository.decrement(
        { id: commission.affiliateId },
        'totalEarnings',
        commission.commissionAmount,
      );
    }

    const updated = await this.commissionRepository.save(commission);

    this.logger.log(`Commission ${id} ${approveDto.status}`);

    return updated;
  }

  async markAsPaid(commissionIds: string[], payoutId: string): Promise<void> {
    const commissions = await this.commissionRepository
      .createQueryBuilder('commission')
      .whereInIds(commissionIds)
      .andWhere('commission.status = :status', { status: CommissionStatus.APPROVED })
      .getMany();

    if (commissions.length === 0) {
      throw new BadRequestException('No approved commissions found');
    }

    const totalAmount = commissions.reduce(
      (sum, c) => sum + parseFloat(c.commissionAmount.toString()),
      0,
    );

    // Update commissions
    await this.commissionRepository
      .createQueryBuilder()
      .update(Commission)
      .set({
        status: CommissionStatus.PAID,
        paidAt: new Date(),
        payoutId,
      })
      .whereInIds(commissionIds)
      .execute();

    // Update affiliate earnings
    const affiliateId = commissions[0].affiliateId;
    await this.affiliateRepository.decrement(
      { id: affiliateId },
      'pendingEarnings',
      totalAmount,
    );
    await this.affiliateRepository.increment(
      { id: affiliateId },
      'paidEarnings',
      totalAmount,
    );

    this.logger.log(`Marked ${commissions.length} commissions as paid (Payout: ${payoutId})`);
  }

  async getAffiliateEarnings(affiliateId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    paid: number;
    count: {
      pending: number;
      approved: number;
      paid: number;
      rejected: number;
    };
  }> {
    const commissions = await this.commissionRepository.find({
      where: { affiliateId },
    });

    const total = commissions.reduce(
      (sum, c) => sum + parseFloat(c.commissionAmount.toString()),
      0,
    );

    const pending = commissions
      .filter(c => c.status === CommissionStatus.PENDING)
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0);

    const approved = commissions
      .filter(c => c.status === CommissionStatus.APPROVED)
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0);

    const paid = commissions
      .filter(c => c.status === CommissionStatus.PAID)
      .reduce((sum, c) => sum + parseFloat(c.commissionAmount.toString()), 0);

    return {
      total,
      pending,
      approved,
      paid,
      count: {
        pending: commissions.filter(c => c.status === CommissionStatus.PENDING).length,
        approved: commissions.filter(c => c.status === CommissionStatus.APPROVED).length,
        paid: commissions.filter(c => c.status === CommissionStatus.PAID).length,
        rejected: commissions.filter(c => c.status === CommissionStatus.REJECTED).length,
      },
    };
  }

  private calculateCommission(
    orderAmount: number,
    commissionRate: number,
    commissionType: string,
  ): number {
    switch (commissionType) {
      case 'percentage':
        return (orderAmount * commissionRate) / 100;
      case 'fixed':
        return commissionRate;
      case 'tiered':
        // Simple tiered logic - can be expanded
        if (orderAmount >= 1000000) {
          return (orderAmount * 10) / 100; // 10% for orders >= 1M
        } else if (orderAmount >= 500000) {
          return (orderAmount * 7) / 100; // 7% for orders >= 500K
        } else {
          return (orderAmount * 5) / 100; // 5% for others
        }
      default:
        return (orderAmount * commissionRate) / 100;
    }
  }
}
