// Export data to CSV format
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    // Header row
    headers.join(','),
    // Data rows
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Handle values with commas, quotes, or newlines
          if (value === null || value === undefined) return '';
          const stringValue = String(value);
          if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(',')
    ),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export chart data to CSV
export function exportChartToCSV(data: any[], filename: string) {
  exportToCSV(data, filename);
}

// Format revenue data for export
export function formatRevenueDataForExport(revenueData: any) {
  if (!revenueData?.breakdown) return [];

  return revenueData.breakdown.map((item: any) => ({
    Date: item.date,
    Revenue: item.revenue,
    Bookings: item.bookings,
    'Average Ticket Price': (item.revenue / item.bookings).toFixed(2),
  }));
}

// Format route analytics for export
export function formatRouteAnalyticsForExport(routeAnalytics: any[]) {
  if (!routeAnalytics) return [];

  return routeAnalytics.map((route: any) => ({
    'Route Name': route.routeName || 'Unknown',
    'Route ID': route.routeId,
    Revenue: route.revenue,
    'Booking Count': route.bookingCount,
    'Average Occupancy': `${route.averageOccupancy}%`,
  }));
}

// Format customer analytics for export
export function formatCustomerAnalyticsForExport(customerAnalytics: any) {
  if (!customerAnalytics?.topCustomers) return [];

  return customerAnalytics.topCustomers.map((customer: any, index: number) => ({
    Rank: index + 1,
    'Customer Name': customer.name || 'Anonymous',
    'User ID': customer.userId,
    'Booking Count': customer.bookingCount,
    'Total Spent': customer.totalSpent,
  }));
}
