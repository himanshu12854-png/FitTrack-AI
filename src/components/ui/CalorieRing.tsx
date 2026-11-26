'use client';

import { motion } from 'framer-motion';

interface CalorieRingProps {
  consumed: number;
  target: number;
  size?: number;
  strokeWidth?: number;
}

export default function CalorieRing({
  consumed,
  target,
  size = 140,
  strokeWidth = 12,
}: CalorieRingProps) {
  const safeTarget = target > 0 ? target : 1;
  const rawPercent = (consumed / safeTarget) * 100;
  const clampedPercent = Math.min(Math.max(rawPercent, 0), 100);
  const isOver = rawPercent > 100;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedPercent / 100);

  const remaining = Math.round(target - consumed);
  const displayPercent = Math.round(Math.max(rawPercent, 0));

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-label={`Calorie progress: ${displayPercent}%`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-100"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={isOver ? 'stroke-amber-500' : 'stroke-emerald-600'}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3">
        <span
          className={`text-2xl font-bold tracking-tight ${
            isOver ? 'text-amber-600' : 'text-slate-900'
          }`}
        >
          {displayPercent}%
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-slate-500 leading-tight">
          {remaining >= 0
            ? `${remaining.toLocaleString()} left`
            : `${Math.abs(remaining).toLocaleString()} over`}
        </span>
      </div>
    </div>
  );
}
