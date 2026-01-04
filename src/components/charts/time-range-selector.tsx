'use client';

import { Button } from '@/components/ui/button';

interface TimeRangeSelectorProps {
  value: number;
  onChange: (hours: number) => void;
}

const ranges = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
];

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-1">
      {ranges.map((range) => (
        <Button
          key={range.hours}
          variant={value === range.hours ? 'default' : 'outline'}
          size="sm"
          onClick={() => onChange(range.hours)}
        >
          {range.label}
        </Button>
      ))}
    </div>
  );
}
