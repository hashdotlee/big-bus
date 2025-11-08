import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AnalyticsQueryDto, TimeRange } from './dto/analytics-query.dto';
import { MetricSnapshot } from '../../database/entities/metric-snapshot.entity';
import * as moment from 'moment';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(MetricSnapshot)
    private readonly metricSnapshotRepo: Repository<MetricSnapshot>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Get date range from query parameters
   */
  private getDateRange(query: AnalyticsQueryDto): { startDate: Date; endDate: Date } {
    let startDate: Date;
    let endDate: Date = new Date();

    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
    } else if (query.timeRange) {
      switch (query.timeRange) {
        case TimeRange.DAY:
          startDate = moment().startOf('day').toDate();
          endDate = moment().endOf('day').toDate();
          break;
        case TimeRange.WEEK:
          startDate = moment().startOf('week').toDate();
          endDate = moment().endOf('week').toDate();
          break;
        case TimeRange.MONTH:
          startDate = moment().startOf('month').toDate();
          endDate = moment().endOf('month').toDate();
          break;
        case TimeRange.QUARTER:
          startDate = moment().startOf('quarter').toDate();
          endDate = moment().endOf('quarter').toDate();
          break;
        case TimeRange.YEAR:
          startDate = moment().startOf('year').toDate();
          endDate = moment().endOf('year').toDate();
          break;
        default:
          startDate = moment().subtract(30, 'days').toDate();
      }
    } else {
      // Default to last 30 days
      startDate = moment().subtract(30, 'days').toDate();
    }

    return { startDate, endDate };
  }

  /**
   * Fetch booking data from booking service
   */
  private async fetchBookingData(startDate: Date, endDate: Date, filters?: any) {
    try {
      const bookingServiceUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:3002';
      const response = await firstValueFrom(
        this.httpService.get(`${bookingServiceUrl}/api/v1/bookings`, {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            ...filters,
          },
        }),
      );
      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch booking data', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Get dashboard overview
   */
  async getDashboard(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    this.logger.log(`Fetching dashboard data from ${startDate} to ${endDate}`);

    // Fetch data from booking service
    const bookingData = await this.fetchBookingData(startDate, endDate);

    // Calculate metrics
    const totalBookings = bookingData.total || 0;
    const totalRevenue = bookingData.data?.reduce((sum: number, booking: any) => {
      return sum + (booking.totalPrice || 0);
    }, 0) || 0;

    const confirmedBookings = bookingData.data?.filter(
      (b: any) => b.status === 'confirmed',
    ).length || 0;

    const cancelledBookings = bookingData.data?.filter(
      (b: any) => b.status === 'cancelled',
    ).length || 0;

    return {
      period: {
        startDate,
        endDate,
      },
      metrics: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue,
        averageBookingValue: totalBookings > 0 ? totalRevenue / totalBookings : 0,
        cancellationRate: totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0,
      },
      trends: {
        bookingsGrowth: 0, // TODO: Compare with previous period
        revenueGrowth: 0,
      },
    };
  }

  /**
   * Get revenue analytics
   */
  async getRevenue(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    this.logger.log(`Fetching revenue data from ${startDate} to ${endDate}`);

    const bookingData = await this.fetchBookingData(startDate, endDate, {
      routeId: query.routeId,
    });

    // Group revenue by date
    const revenueByDate = new Map<string, number>();
    bookingData.data?.forEach((booking: any) => {
      const date = moment(booking.createdAt).format('YYYY-MM-DD');
      const current = revenueByDate.get(date) || 0;
      revenueByDate.set(date, current + (booking.totalPrice || 0));
    });

    const totalRevenue = Array.from(revenueByDate.values()).reduce((sum, val) => sum + val, 0);

    return {
      period: { startDate, endDate },
      totalRevenue,
      revenueByDate: Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
        date,
        revenue,
      })),
      metrics: {
        averageDailyRevenue: revenueByDate.size > 0 ? totalRevenue / revenueByDate.size : 0,
        peakDay: this.findPeakDay(revenueByDate),
      },
    };
  }

  /**
   * Get booking analytics
   */
  async getBookings(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    this.logger.log(`Fetching bookings data from ${startDate} to ${endDate}`);

    const bookingData = await this.fetchBookingData(startDate, endDate, {
      routeId: query.routeId,
      stationId: query.stationId,
    });

    // Group bookings by status
    const statusCounts = new Map<string, number>();
    bookingData.data?.forEach((booking: any) => {
      const status = booking.status || 'unknown';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });

    return {
      period: { startDate, endDate },
      total: bookingData.total || 0,
      byStatus: Object.fromEntries(statusCounts),
      metrics: {
        confirmationRate: this.calculateRate(statusCounts, 'confirmed', bookingData.total),
        cancellationRate: this.calculateRate(statusCounts, 'cancelled', bookingData.total),
      },
    };
  }

  /**
   * Get occupancy analytics
   */
  async getOccupancy(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    this.logger.log(`Fetching occupancy data from ${startDate} to ${endDate}`);

    // This would require fetching schedule and booking data
    // For now, return mock structure
    return {
      period: { startDate, endDate },
      averageOccupancy: 0,
      occupancyByRoute: [],
      peakTimes: [],
      message: 'Occupancy calculation requires vehicle capacity data',
    };
  }

  /**
   * Get route performance analytics
   */
  async getRoutes(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    this.logger.log(`Fetching route performance data from ${startDate} to ${endDate}`);

    const bookingData = await this.fetchBookingData(startDate, endDate);

    // Group by route
    const routeMetrics = new Map<string, any>();
    bookingData.data?.forEach((booking: any) => {
      const routeId = booking.routeId;
      if (!routeId) return;

      if (!routeMetrics.has(routeId)) {
        routeMetrics.set(routeId, {
          routeId,
          bookings: 0,
          revenue: 0,
        });
      }

      const metrics = routeMetrics.get(routeId);
      metrics.bookings++;
      metrics.revenue += booking.totalPrice || 0;
    });

    return {
      period: { startDate, endDate },
      routes: Array.from(routeMetrics.values()).map(route => ({
        ...route,
        averageBookingValue: route.bookings > 0 ? route.revenue / route.bookings : 0,
      })),
    };
  }

  /**
   * Get customer analytics
   */
  async getCustomers(query: AnalyticsQueryDto) {
    const { startDate, endDate } = this.getDateRange(query);

    this.logger.log(`Fetching customer data from ${startDate} to ${endDate}`);

    const bookingData = await this.fetchBookingData(startDate, endDate);

    // Group by customer
    const customerMetrics = new Map<string, any>();
    bookingData.data?.forEach((booking: any) => {
      const userId = booking.userId;
      if (!userId) return;

      if (!customerMetrics.has(userId)) {
        customerMetrics.set(userId, {
          userId,
          bookings: 0,
          totalSpent: 0,
        });
      }

      const metrics = customerMetrics.get(userId);
      metrics.bookings++;
      metrics.totalSpent += booking.totalPrice || 0;
    });

    const customers = Array.from(customerMetrics.values());

    return {
      period: { startDate, endDate },
      totalCustomers: customers.length,
      averageBookingsPerCustomer: customers.length > 0
        ? customers.reduce((sum, c) => sum + c.bookings, 0) / customers.length
        : 0,
      averageSpendPerCustomer: customers.length > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length
        : 0,
      topCustomers: customers
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10),
    };
  }

  /**
   * Helper: Find peak day
   */
  private findPeakDay(dataByDate: Map<string, number>) {
    let peakDate = '';
    let peakValue = 0;

    dataByDate.forEach((value, date) => {
      if (value > peakValue) {
        peakValue = value;
        peakDate = date;
      }
    });

    return { date: peakDate, value: peakValue };
  }

  /**
   * Helper: Calculate rate
   */
  private calculateRate(statusCounts: Map<string, number>, status: string, total: number) {
    const count = statusCounts.get(status) || 0;
    return total > 0 ? (count / total) * 100 : 0;
  }
}
