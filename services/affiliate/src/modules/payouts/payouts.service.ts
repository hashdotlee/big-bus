import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payout, PayoutStatus } from '../../database/entities/payout.entity';
import { Affiliate } from '../../database/entities/affiliate.entity';
import { Commission, CommissionStatus } from '../../database/entities/commission.entity';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { ConfigService } from '@nestjs/config';
import { CommissionsService } from '../commissions/commissions.service';

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);

  constructor(
    @InjectRepository(Payout)
    private readonly payoutRepository: Repository<Payout>,
    @InjectRepository(Affiliate)
    private readonly affiliateRepository: Repository<Affiliate>,
    @InjectRepository(Commission)
    private readonly commissionRepository: Repository<Commission>,
    private readonly commissionsService: CommissionsService,
    private readonly configService: ConfigService,
  ) {}

  async requestPayout(requestDto: RequestPayoutDto): Promise<Payout> {
    const affiliate = await this.affiliateRepository.findOne({
      where: { id: requestDto.affiliateId },
    });

    if (!affiliate) {
      throw new NotFoundException('Affiliate not found');
    }

    // Check minimum payout amount
    const minimumPayout = this.configService.get('MINIMUM_PAYOUT', 100000);
    if (requestDto.amount < minimumPayout) {
      throw new BadRequestException(
        `Minimum payout amount is ${minimumPayout}`,
      );
    }

    // Check if affiliate has enough approved earnings
    const approvedCommissions = await this.commissionRepository.find({
      where: {
        affiliateId: requestDto.affiliateId,
        status: CommissionStatus.APPROVED,
      },
    });

    const availableAmount = approvedCommissions.reduce(
      (sum, c) => sum + parseFloat(c.commissionAmount.toString()),
      0,
    );

    if (requestDto.amount > availableAmount) {
      throw new BadRequestException(
        `Insufficient approved earnings. Available: ${availableAmount}`,
      );
    }

    // Create payout request
    const payout = this.payoutRepository.create({
      affiliateId: requestDto.affiliateId,
      amount: requestDto.amount,
      currency: 'VND',
      paymentMethod: requestDto.paymentMethod,
      paymentDetails: requestDto.paymentDetails || affiliate.bankAccount,
      status: PayoutStatus.PENDING,
    });

    const saved = await this.payoutRepository.save(payout);

    this.logger.log(
      `Payout requested: ${saved.id} - Affiliate ${affiliate.referralCode} - Amount ${requestDto.amount}`,
    );

    return saved;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    affiliateId?: string,
    status?: PayoutStatus,
  ): Promise<{
    data: Payout[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = this.payoutRepository.createQueryBuilder('payout');

    if (affiliateId) {
      query.where('payout.affiliateId = :affiliateId', { affiliateId });
    }

    if (status) {
      query.andWhere('payout.status = :status', { status });
    }

    query
      .leftJoinAndSelect('payout.affiliate', 'affiliate')
      .orderBy('payout.createdAt', 'DESC')
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

  async findOne(id: string): Promise<Payout> {
    const payout = await this.payoutRepository.findOne({
      where: { id },
      relations: ['affiliate'],
    });

    if (!payout) {
      throw new NotFoundException(`Payout with ID ${id} not found`);
    }

    return payout;
  }

  async processPayout(id: string, transactionId: string): Promise<Payout> {
    const payout = await this.findOne(id);

    if (payout.status !== PayoutStatus.PENDING) {
      throw new BadRequestException('Only pending payouts can be processed');
    }

    // Update payout status
    payout.status = PayoutStatus.PROCESSING;
    await this.payoutRepository.save(payout);

    try {
      // Here you would integrate with Payment Service to process the actual payment
      // For now, we'll simulate a successful payment

      // Get approved commissions up to the payout amount
      const commissions = await this.commissionRepository
        .createQueryBuilder('commission')
        .where('commission.affiliateId = :affiliateId', {
          affiliateId: payout.affiliateId,
        })
        .andWhere('commission.status = :status', {
          status: CommissionStatus.APPROVED,
        })
        .orderBy('commission.createdAt', 'ASC')
        .getMany();

      let remainingAmount = parseFloat(payout.amount.toString());
      const commissionsToPay: string[] = [];

      for (const commission of commissions) {
        if (remainingAmount <= 0) break;

        const commissionAmount = parseFloat(commission.commissionAmount.toString());
        if (commissionAmount <= remainingAmount) {
          commissionsToPay.push(commission.id);
          remainingAmount -= commissionAmount;
        }
      }

      // Mark commissions as paid
      await this.commissionsService.markAsPaid(commissionsToPay, payout.id);

      // Update payout status
      payout.status = PayoutStatus.COMPLETED;
      payout.transactionId = transactionId;
      payout.processedAt = new Date();

      const completed = await this.payoutRepository.save(payout);

      this.logger.log(`Payout processed successfully: ${id}`);

      return completed;
    } catch (error) {
      // Mark payout as failed
      payout.status = PayoutStatus.FAILED;
      payout.failureReason = error.message;
      await this.payoutRepository.save(payout);

      this.logger.error(`Payout processing failed: ${id}`, error);

      throw error;
    }
  }

  async cancelPayout(id: string): Promise<Payout> {
    const payout = await this.findOne(id);

    if (payout.status === PayoutStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed payout');
    }

    if (payout.status === PayoutStatus.PROCESSING) {
      throw new BadRequestException('Cannot cancel payout in processing');
    }

    payout.status = PayoutStatus.CANCELLED;
    const cancelled = await this.payoutRepository.save(payout);

    this.logger.log(`Payout cancelled: ${id}`);

    return cancelled;
  }

  async getPayoutStats(affiliateId: string): Promise<{
    totalPaid: number;
    totalPending: number;
    totalProcessing: number;
    count: {
      completed: number;
      pending: number;
      processing: number;
      failed: number;
      cancelled: number;
    };
  }> {
    const payouts = await this.payoutRepository.find({
      where: { affiliateId },
    });

    const totalPaid = payouts
      .filter(p => p.status === PayoutStatus.COMPLETED)
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    const totalPending = payouts
      .filter(p => p.status === PayoutStatus.PENDING)
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    const totalProcessing = payouts
      .filter(p => p.status === PayoutStatus.PROCESSING)
      .reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0);

    return {
      totalPaid,
      totalPending,
      totalProcessing,
      count: {
        completed: payouts.filter(p => p.status === PayoutStatus.COMPLETED).length,
        pending: payouts.filter(p => p.status === PayoutStatus.PENDING).length,
        processing: payouts.filter(p => p.status === PayoutStatus.PROCESSING).length,
        failed: payouts.filter(p => p.status === PayoutStatus.FAILED).length,
        cancelled: payouts.filter(p => p.status === PayoutStatus.CANCELLED).length,
      },
    };
  }
}
