import { BaseApiClient } from '../base-client';
import { SERVICE_URLS } from '../config';

export interface RevenueAnalytics {
  totalRevenue: number;
  bookingCount: number;
  averageTicketPrice: number;
  period: string;
  breakdown: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
}

export interface RouteAnalytics {
  routeId: string;
  routeName: string;
  bookingCount: number;
  revenue: number;
  averageOccupancy: number;
  popularDepartureTimes: string[];
}

export interface CustomerAnalytics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageBookingsPerCustomer: number;
  topCustomers: Array<{
    userId: string;
    name: string;
    bookingCount: number;
    totalSpent: number;
  }>;
}

export interface DemandPrediction {
  routeId: string;
  date: string;
  predictedDemand: number;
  confidence: number;
  recommendedVehicles: number;
}

export interface ReportOptions {
  type: 'revenue' | 'bookings' | 'routes' | 'customers';
  format: 'pdf' | 'excel' | 'csv';
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}

export class AnalyticsService extends BaseApiClient {
  constructor() {
    super({ baseURL: SERVICE_URLS.analytics });
  }

  // Revenue analytics
  async getRevenueAnalytics(params: {
    startDate: string;
    endDate: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<RevenueAnalytics> {
    return this.get('/analytics/revenue', { params });
  }

  async getRevenueByRoute(routeId: string, params: {
    startDate: string;
    endDate: string;
  }): Promise<RevenueAnalytics> {
    return this.get(`/analytics/revenue/route/${routeId}`, { params });
  }

  // Route analytics
  async getRouteAnalytics(params: {
    startDate: string;
    endDate: string;
  }): Promise<RouteAnalytics[]> {
    return this.get('/analytics/routes', { params });
  }

  async getTopRoutes(limit?: number): Promise<RouteAnalytics[]> {
    return this.get('/analytics/routes/top', { params: { limit } });
  }

  // Customer analytics
  async getCustomerAnalytics(params: {
    startDate: string;
    endDate: string;
  }): Promise<CustomerAnalytics> {
    return this.get('/analytics/customers', { params });
  }

  // Occupancy analytics
  async getOccupancyRate(params: {
    routeId?: string;
    startDate: string;
    endDate: string;
  }): Promise<{
    averageOccupancy: number;
    breakdown: Array<{
      date: string;
      occupancy: number;
    }>;
  }> {
    return this.get('/analytics/occupancy', { params });
  }

  // Predictions
  async predictDemand(params: {
    routeId: string;
    date: string;
  }): Promise<DemandPrediction> {
    return this.get('/analytics/predictions/demand', { params });
  }

  async getPriceRecommendation(params: {
    routeId: string;
    date: string;
  }): Promise<{
    recommendedPrice: number;
    currentPrice: number;
    expectedRevenue: number;
    confidence: number;
  }> {
    return this.get('/analytics/predictions/price', { params });
  }

  // Reports
  async generateReport(options: ReportOptions): Promise<{
    reportId: string;
    downloadUrl: string;
  }> {
    return this.post('/reports/generate', options);
  }

  async getReport(reportId: string): Promise<{
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
  }> {
    return this.get(`/reports/${reportId}`);
  }

  async downloadReport(reportId: string): Promise<Blob> {
    return this.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });
  }

  async getMyReports(): Promise<Array<{
    id: string;
    type: string;
    createdAt: string;
    status: string;
  }>> {
    return this.get('/reports/my-reports');
  }

  // Dashboard
  async getDashboardStats(): Promise<{
    todayBookings: number;
    todayRevenue: number;
    activeVehicles: number;
    occupancyRate: number;
    pendingRefunds: number;
  }> {
    return this.get('/analytics/dashboard');
  }
}
