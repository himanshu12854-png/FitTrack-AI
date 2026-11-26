'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface WeeklyCalorieChartProps {
  data: Array<{ date: string; totalCalories: number }>;
}

export default function WeeklyCalorieChart({ data }: WeeklyCalorieChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tickFormatter={(val) => {
            const parts = String(val).split('-');
            return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
          }}
          stroke="#94a3b8"
          fontSize={12}
        />
        <YAxis stroke="#94a3b8" fontSize={12} />
        <Tooltip
          formatter={(value: unknown) => [`${value} kcal`, 'Calories']}
          labelFormatter={(label) => `Date: ${label}`}
          contentStyle={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.06)',
          }}
        />
        <Bar dataKey="totalCalories" fill="#16a34a" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
