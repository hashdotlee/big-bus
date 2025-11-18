'use client';

/**
 * Stats Card Component
 * Feature: Reports & Analytics
 */

import { Card, CardContent, Badge } from '@big-bus/ui';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
}

export const StatsCard = ({ title, value, change, icon: Icon, iconColor = 'text-primary-600' }: StatsCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card variant="elevated">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {change !== undefined && (
              <div className="mt-2">
                <Badge
                  variant={isPositive ? 'success' : isNegative ? 'error' : 'neutral'}
                  size="sm"
                >
                  {isPositive ? '+' : ''}{change}%
                </Badge>
                <span className="text-xs text-neutral-500 ml-2">from last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-primary-50 ${iconColor}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
