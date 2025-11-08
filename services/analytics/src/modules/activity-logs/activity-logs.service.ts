import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { CreateLogDto } from './dto/create-log.dto';
import { QueryLogsDto } from './dto/query-logs.dto';

@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger(ActivityLogsService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepo: Repository<ActivityLog>,
  ) {}

  /**
   * Create a new activity log entry
   */
  async createLog(dto: CreateLogDto) {
    this.logger.log(`Creating log entry for action: ${dto.action}`);

    const log = this.activityLogRepo.create({
      userId: dto.userId,
      userEmail: dto.userEmail,
      action: dto.action,
      entityType: dto.entityType,
      entityId: dto.entityId,
      metadata: dto.metadata,
      ipAddress: dto.ipAddress,
      userAgent: dto.userAgent,
      status: dto.status || 'success',
      errorMessage: dto.errorMessage,
    });

    return this.activityLogRepo.save(log);
  }

  /**
   * Get activity logs with filtering
   */
  async getLogs(query: QueryLogsDto) {
    const {
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = query;

    const where: FindOptionsWhere<ActivityLog> = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      where.createdAt = Between(new Date(startDate), new Date());
    }

    const [logs, total] = await this.activityLogRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get activity log by ID
   */
  async getLogById(id: string) {
    const log = await this.activityLogRepo.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }
    return log;
  }

  /**
   * Get activity log statistics
   */
  async getLogStats(query: QueryLogsDto) {
    const { startDate, endDate, userId, entityType } = query;

    const where: FindOptionsWhere<ActivityLog> = {};

    if (userId) where.userId = userId;
    if (entityType) where.entityType = entityType;

    if (startDate && endDate) {
      where.createdAt = Between(new Date(startDate), new Date(endDate));
    }

    const logs = await this.activityLogRepo.find({ where });

    // Calculate statistics
    const actionCounts = new Map<string, number>();
    const entityTypeCounts = new Map<string, number>();
    const statusCounts = new Map<string, number>();
    const userActivityCounts = new Map<string, number>();

    logs.forEach((log) => {
      // Count by action
      actionCounts.set(log.action, (actionCounts.get(log.action) || 0) + 1);

      // Count by entity type
      if (log.entityType) {
        entityTypeCounts.set(
          log.entityType,
          (entityTypeCounts.get(log.entityType) || 0) + 1,
        );
      }

      // Count by status
      if (log.status) {
        statusCounts.set(log.status, (statusCounts.get(log.status) || 0) + 1);
      }

      // Count by user
      if (log.userId) {
        userActivityCounts.set(
          log.userId,
          (userActivityCounts.get(log.userId) || 0) + 1,
        );
      }
    });

    return {
      total: logs.length,
      period: {
        startDate: startDate || logs[logs.length - 1]?.createdAt,
        endDate: endDate || logs[0]?.createdAt,
      },
      byAction: Object.fromEntries(actionCounts),
      byEntityType: Object.fromEntries(entityTypeCounts),
      byStatus: Object.fromEntries(statusCounts),
      topUsers: Array.from(userActivityCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId, count]) => ({ userId, count })),
    };
  }

  /**
   * Export activity logs to CSV
   */
  async exportLogs(query: QueryLogsDto) {
    const { data } = await this.getLogs({ ...query, limit: 10000 });

    // Create CSV header
    const headers = [
      'ID',
      'User ID',
      'User Email',
      'Action',
      'Entity Type',
      'Entity ID',
      'Status',
      'IP Address',
      'Created At',
    ];

    // Create CSV rows
    const rows = data.map((log) => [
      log.id,
      log.userId || '',
      log.userEmail || '',
      log.action,
      log.entityType || '',
      log.entityId || '',
      log.status || '',
      log.ipAddress || '',
      log.createdAt.toISOString(),
    ]);

    // Combine header and rows
    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }
}
