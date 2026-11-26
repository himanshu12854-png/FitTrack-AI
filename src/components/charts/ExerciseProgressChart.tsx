'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatDate } from '@/lib/utils';

interface ExerciseProgressChartProps {
  data: Array<{
    date: string;
    bestWeight: number;
    totalVolume: number;
  }>;
}

export default function ExerciseProgressChart({ data }: ExerciseProgressChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tickFormatter={(val) => formatDate(val)}
          stroke="#94a3b8"
          fontSize={11}
        />
        <YAxis stroke="#94a3b8" fontSize={11} unit="kg" />
        <Tooltip
          labelFormatter={(label) => formatDate(String(label || ''))}
          contentStyle={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.06)',
          }}
        />
        <Line
          type="monotone"
          dataKey="bestWeight"
          name="Best Weight (kg)"
          stroke="#16a34a"
          strokeWidth={3}
          dot={{ r: 4, fill: '#16a34a' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
