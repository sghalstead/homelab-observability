'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { SystemMetric } from '@/db/schema';

interface SystemMetricsChartProps {
  data: SystemMetric[];
  isLoading: boolean;
  title: string;
  hours?: number;
  metrics: Array<{
    key: keyof SystemMetric;
    name: string;
    color: string;
  }>;
}

function formatTimeLabel(date: Date, hours: number): string {
  if (hours <= 6) {
    // 1h, 6h: Show time only (HH:MM)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (hours <= 24) {
    // 24h: Show time with day indicator if needed
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (hours <= 168) {
    // 7d: Show day and time (Mon HH:MM)
    const day = date.toLocaleDateString([], { weekday: 'short' });
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${day} ${time}`;
  } else {
    // 30d: Show date (Jan 21)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

function formatTooltipTime(date: Date, hours: number): string {
  if (hours <= 24) {
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  return date.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SystemMetricsChart({
  data,
  isLoading,
  title,
  hours = 24,
  metrics,
}: SystemMetricsChartProps) {
  const chartData = useMemo(() => {
    return [...data].reverse().map((d) => ({
      ...d,
      time: formatTimeLabel(new Date(d.timestamp), hours),
      fullTime: formatTooltipTime(new Date(d.timestamp), hours),
    }));
  }, [data, hours]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px]" />
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            No data available for this time range
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="time" tick={{ fontSize: 10 }} className="text-muted-foreground" />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              labelFormatter={(_, payload) => {
                if (payload && payload[0]?.payload?.fullTime) {
                  return payload[0].payload.fullTime;
                }
                return '';
              }}
            />
            <Legend />
            {metrics.map((metric) => (
              <Line
                key={String(metric.key)}
                type="monotone"
                dataKey={String(metric.key)}
                name={metric.name}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
