import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: number | null;
  unit: string;
  maxValue?: number;
  showProgress?: boolean;
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  unit,
  maxValue = 100,
  showProgress = true,
  icon,
  isLoading,
  className,
}: MetricCardProps) {
  const percentage = value !== null ? (value / maxValue) * 100 : 0;
  const getStatusColor = (pct: number) => {
    if (pct >= 90) return 'text-red-500';
    if (pct >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-2 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={cn('text-2xl font-bold', showProgress && getStatusColor(percentage))}>
          {value !== null ? `${value.toFixed(1)}${unit}` : 'N/A'}
        </div>
        {showProgress && value !== null && <Progress value={percentage} className="mt-2" />}
      </CardContent>
    </Card>
  );
}
