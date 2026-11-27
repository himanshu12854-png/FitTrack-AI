'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Flame,
  Dumbbell,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Plus,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import { getCached, setCached } from '@/lib/client-cache';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import CalorieRing from '@/components/ui/CalorieRing';
import LazySection from '@/components/ui/LazySection';

const WeeklyCalorieChart = dynamic(
  () => import('@/components/charts/WeeklyCalorieChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 w-full rounded-xl bg-slate-100 animate-pulse" />
    ),
  }
);

interface DashboardStats {
  isOnboarded?: boolean;
  user: { name: string; email: string };
  fitnessGoal: string;
  calories: {
    consumed: number;
    target: number;
    remaining: number;
  };
  macros: {
    protein: { consumed: number; target: number };
    carbs: { consumed: number; target: number };
    fats: { consumed: number; target: number };
  };
  workout: {
    todayWorkout: string;
    isRestDay: boolean;
    isCompleted: boolean;
    dayOfWeek: string;
    weeklyCompleted: number;
    weeklyTarget: number;
    activePlanName: string | null;
  };
  recentDietHistory: Array<{ date: string; totalCalories: number }>;
  recentActivity: Array<{
    id: string;
    type: 'diet' | 'workout';
    title: string;
    subtitle: string;
    date: string;
  }>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.06,
      duration: 0.35,
      ease: 'easeOut' as const,
    },
  }),
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(() => {
    const cached = getCached<DashboardStats>('dashboard', 30000);
    return cached ? cached.data : null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getCached<DashboardStats>('dashboard', 30000);
    return !cached;
  });
  const [error, setError] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchDashboard = useCallback(async (hasCache = false) => {
    try {
      if (!hasCache) setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard?view=summary');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const json = await res.json();
      if (json.success) {
        if (json.data?.isOnboarded === false) {
          router.replace('/dashboard/onboarding');
          return;
        }
        setData((prev) => {
          const merged = {
            ...json.data,
            recentDietHistory: prev?.recentDietHistory,
            recentActivity: prev?.recentActivity,
          };
          setCached('dashboard', merged);
          return merged;
        });
      } else {
        throw new Error(json.error || 'Failed to parse response');
      }
    } catch (err: any) {
      if (!hasCache) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchDashboardDetails = useCallback(async () => {
    try {
      setDetailsLoading(true);
      const res = await fetch('/api/dashboard?view=details');
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        setData((prev) => {
          if (!prev) return prev;
          const merged = {
            ...prev,
            recentDietHistory: json.data.recentDietHistory,
            recentActivity: json.data.recentActivity,
          };
          setCached('dashboard', merged);
          return merged;
        });
      }
    } catch {
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cached = getCached<DashboardStats>('dashboard', 30000);
    if (cached) {
      if (cached.data?.isOnboarded === false) {
        router.replace('/dashboard/onboarding');
        return;
      }
      setData(cached.data);
      setLoading(false);
      fetchDashboard(true);
    } else {
      fetchDashboard(false);
    }
  }, [fetchDashboard, router]);

  if (loading && !data) {
    return <DashboardSkeleton />;
  }

  if ((error || !data) && !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-900">Unable to load dashboard</h2>
        <p className="text-sm text-rose-700 mt-1">{error || 'Something went wrong.'}</p>
        <button
          onClick={() => fetchDashboard(false)}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const caloriePercentage = Math.round(
    (data.calories.consumed / (data.calories.target || 1)) * 100
  );
  const proteinPct = Math.round(
    (data.macros.protein.consumed / (data.macros.protein.target || 1)) * 100
  );
  const carbsPct = Math.round(
    (data.macros.carbs.consumed / (data.macros.carbs.target || 1)) * 100
  );
  const fatsPct = Math.round(
    (data.macros.fats.consumed / (data.macros.fats.target || 1)) * 100
  );

  const formatGoal = (goal: string) => {
    switch (goal) {
      case 'build_muscle':
        return 'Hypertrophy / Muscle Building';
      case 'lose_weight':
        return 'Fat Loss / Cutting';
      case 'maintain':
        return 'Maintenance & Health';
      case 'improve_endurance':
        return 'Endurance & Stamina';
      default:
        return 'General Fitness';
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Welcome & Goal Banner */}
      <motion.div
        custom={0}
        initial="hidden"
        animate="visible"
        variants={cardVariants}
        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Goal: {formatGoal(data.fitnessGoal)}</span>
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 tracking-tight">
            Welcome back, {data.user.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is your daily nutrition and training summary for today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <Link
            href="/dashboard/workout-session"
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold transition"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Today&apos;s Workout</span>
          </Link>
          <Link
            href="/dashboard/calories"
            className="inline-flex flex-1 sm:flex-initial items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add Meal</span>
          </Link>
        </div>
      </motion.div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
        {/* Calorie Card */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Daily Energy</span>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-semibold transition"
                title="Adjust Personalized Target"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Personalized</span>
              </Link>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4 flex items-center gap-4 sm:gap-5">
            <div className="shrink-0">
              <CalorieRing
                consumed={data.calories.consumed}
                target={data.calories.target}
                size={116}
                strokeWidth={10}
              />
            </div>

            <div className="space-y-2 min-w-0 flex-1">
              <div>
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                  Consumed
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {data.calories.consumed.toLocaleString()} <span className="text-xs font-medium text-slate-400">kcal</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Target</span>
                  <span className="text-xs font-bold text-slate-700">{data.calories.target.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-medium text-slate-400 uppercase block">Remaining</span>
                  <span className="text-xs font-bold text-emerald-700">{data.calories.remaining.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
            <Link
              href="/dashboard/calories"
              className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 gap-1"
            >
              <span>View Food Diary</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/profile"
              className="text-[11px] font-medium text-slate-400 hover:text-slate-700 transition"
            >
              Adjust
            </Link>
          </div>
        </motion.div>

        {/* Macronutrients Card */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Macronutrients</span>
            <span className="text-xs font-medium text-slate-400">Consumed / Target</span>
          </div>

          <div className="my-4 space-y-3.5">
            {/* Protein */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 font-semibold">Protein</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {proteinPct}%
                  </span>
                </div>
                <span className="text-slate-500">
                  {data.macros.protein.consumed}g / {data.macros.protein.target}g
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, proteinPct)}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="bg-emerald-600 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 font-semibold">Carbs</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-bold">
                    {carbsPct}%
                  </span>
                </div>
                <span className="text-slate-500">
                  {data.macros.carbs.consumed}g / {data.macros.carbs.target}g
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, carbsPct)}%` }}
                  transition={{ duration: 0.6, delay: 0.08, ease: 'easeOut' }}
                  className="bg-sky-500 h-2 rounded-full"
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-700 font-semibold">Fats</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold">
                    {fatsPct}%
                  </span>
                </div>
                <span className="text-slate-500">
                  {data.macros.fats.consumed}g / {data.macros.fats.target}g
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, fatsPct)}%` }}
                  transition={{ duration: 0.6, delay: 0.16, ease: 'easeOut' }}
                  className="bg-amber-500 h-2 rounded-full"
                />
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1 pt-2.5 border-t border-slate-100"
          >
            <span>Adjust Targets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        {/* Workout Split Status Card */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">{data.workout.dayOfWeek} Routine</span>
            <div
              className={`p-2 rounded-xl ${
                data.workout.isCompleted
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>

          <div className="my-4">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              {data.workout.todayWorkout}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              {data.workout.isCompleted ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed Today
                </span>
              ) : data.workout.isRestDay ? (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                  Rest &amp; Muscle Recovery
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                  Scheduled for Today
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-3">
              Weekly Frequency: <strong className="text-slate-900">{data.workout.weeklyCompleted}</strong> of {data.workout.weeklyTarget} sessions done this week
            </p>
          </div>

          <Link
            href="/dashboard/workout-session"
            className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 gap-1 pt-2.5 border-t border-slate-100"
          >
            <span>{data.workout.isCompleted ? 'Review Session' : 'Start Workout Session'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>
      </div>

      {/* Daily Milestones Strip */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.22 }}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">Today&apos;s Goal Milestones</h2>
          </div>
          <span className="text-xs text-slate-500">
            Unlock badges as you hit your daily nutrition &amp; training targets
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              label: '50% Daily Fuel',
              achieved: caloriePercentage >= 50,
              detail: `${Math.min(100, caloriePercentage)}% kcal`,
            },
            {
              label: '100% Calorie Target',
              achieved: caloriePercentage >= 100,
              detail: `${data.calories.consumed} / ${data.calories.target}`,
            },
            {
              label: 'Protein Goal',
              achieved: proteinPct >= 100,
              detail: `${proteinPct}% protein`,
            },
            {
              label: 'Workout Complete',
              achieved: data.workout.isCompleted,
              detail: data.workout.isCompleted ? 'Done' : 'Pending',
            },
          ].map((m) => (
            <motion.div
              key={m.label}
              whileHover={{ y: -2 }}
              className={`rounded-xl px-3 py-2.5 border transition-colors flex items-center justify-between gap-2 ${
                m.achieved
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50/70 border-slate-200/70 text-slate-500'
              }`}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{m.label}</p>
                <p className="text-[11px] opacity-80 truncate">{m.detail}</p>
              </div>
              <CheckCircle2
                className={`w-4 h-4 shrink-0 ${
                  m.achieved ? 'text-emerald-600' : 'text-slate-300'
                }`}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts & Activity Section (Lazy-loaded on viewport entry) */}
      <LazySection
        onVisible={fetchDashboardDetails}
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
            <div className="lg:col-span-2 h-80 bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse" />
            <div className="h-80 bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse" />
          </div>
        }
      >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Weekly Calorie Intake Bar Chart */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="lg:col-span-2 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Calorie Trend</h2>
              <p className="text-xs text-slate-500">Daily calorie intake over previous logs</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              Target: {data.calories.target} kcal
            </span>
          </div>

          <div className="h-64 w-full">
            {detailsLoading && !data.recentDietHistory ? (
              <div className="h-full w-full rounded-xl bg-slate-100 animate-pulse" />
            ) : data.recentDietHistory && data.recentDietHistory.length > 0 ? (
              <WeeklyCalorieChart data={data.recentDietHistory} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <Calendar className="w-8 h-8 mb-2" />
                <p className="text-sm">No historical diet logs recorded yet.</p>
                <p className="text-xs mt-1">Start logging your meals to see daily progress charts.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity Feed */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs"
        >
          <h2 className="text-base font-bold text-slate-900 mb-4">Recent Activity</h2>

          {detailsLoading && !data.recentActivity ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : data.recentActivity && data.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                  <div
                    className={`p-2 rounded-xl shrink-0 ${
                      activity.type === 'workout'
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {activity.type === 'workout' ? (
                      <Dumbbell className="w-4 h-4" />
                    ) : (
                      <Flame className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">{activity.subtitle}</p>
                    <span className="text-[10px] text-slate-400">{activity.date}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium">No recent activity</p>
              <p className="text-xs text-slate-500 mt-1">
                Your completed workouts and logged meals will appear here.
              </p>
            </div>
          )}
        </motion.div>
      </div>
      </LazySection>
    </div>
  );
}
