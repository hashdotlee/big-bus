export interface ActivityLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
  errorMessage?: string;
  createdAt: Date;
}

export interface CreateActivityLogRequest {
  userId?: string;
  userEmail?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  status?: string;
  errorMessage?: string;
}

export interface QueryActivityLogsRequest {
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ActivityLogStats {
  total: number;
  period: {
    startDate?: Date;
    endDate?: Date;
  };
  byAction: Record<string, number>;
  byEntityType: Record<string, number>;
  byStatus: Record<string, number>;
  topUsers: Array<{
    userId: string;
    count: number;
  }>;
}
