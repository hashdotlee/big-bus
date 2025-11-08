export enum TimeRange {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  CUSTOM = 'custom',
}

export interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  timeRange?: TimeRange;
  routeId?: string;
  stationId?: string;
}

export interface DashboardMetrics {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  cancellationRate: number;
}

export interface DashboardTrends {
  bookingsGrowth: number;
  revenueGrowth: number;
}

export interface DashboardResponse {
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: DashboardMetrics;
  trends: DashboardTrends;
}

export interface RevenueAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRevenue: number;
  revenueByDate: Array<{
    date: string;
    revenue: number;
  }>;
  metrics: {
    averageDailyRevenue: number;
    peakDay: {
      date: string;
      value: number;
    };
  };
}

export interface BookingAnalytics {
  period: {
    startDate: Date;
    endDate: Date;
  };
  total: number;
  byStatus: Record<string, number>;
  metrics: {
    confirmationRate: number;
    cancellationRate: number;
  };
}

export interface RoutePerformance {
  routeId: string;
  bookings: number;
  revenue: number;
  averageBookingValue: number;
}

export interface CustomerMetrics {
  userId: string;
  bookings: number;
  totalSpent: number;
}
