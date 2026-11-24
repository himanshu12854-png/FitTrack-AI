'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Dumbbell,
  CheckCircle2,
  Calendar,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Plus,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface DashboardStats {
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        throw new Error(json.error || 'Failed to parse response');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading your fitness dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center max-w-lg mx-auto mt-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-rose-900">Unable to load dashboard</h2>
        <p className="text-sm text-rose-700 mt-1">{error || 'Something went wrong.'}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition"
        >
          Retry
        </button>
      </div>
    );
  }

  const caloriePercentage = Math.min(
    100,
    Math.round((data.calories.consumed / (data.calories.target || 2000)) * 100)
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
    <div className="space-y-6">
      {/* Welcome & Goal Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Goal: {formatGoal(data.fitnessGoal)}
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">
            Welcome back, {data.user.name}! 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is your daily nutrition and training summary for today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/workout-session"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition"
          >
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <span>Today&apos;s Workout</span>
          </Link>
          <Link
            href="/dashboard/calories"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Meal</span>
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Calorie Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Daily Energy</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Flame className="w-5 h-5" />
            </div>
          </div>

          <div className="my-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {data.calories.consumed}
              </span>
              <span className="text-sm font-medium text-slate-400">
                / {data.calories.target} kcal
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              <strong className="text-emerald-700 font-semibold">{data.calories.remaining} kcal</strong> remaining for today
            </p>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 mt-3 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  caloriePercentage > 100 ? 'bg-amber-500' : 'bg-emerald-600'
                }`}
                style={{ width: `${caloriePercentage}%` }}
              />
            </div>
          </div>

          <Link
            href="/dashboard/calories"
            className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 gap-1 pt-2 border-t border-slate-100"
          >
            <span>View Food Diary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Macronutrients Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Macronutrients</span>
            <span className="text-xs font-semibold text-slate-400">Consumed / Target</span>
          </div>

          <div className="my-4 space-y-3">
            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 font-semibold">Protein</span>
                <span className="text-slate-500">
                  {data.macros.protein.consumed}g / {data.macros.protein.target}g
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.macros.protein.consumed / (data.macros.protein.target || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 font-semibold">Carbs</span>
                <span className="text-slate-500">
                  {data.macros.carbs.consumed}g / {data.macros.carbs.target}g
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-sky-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.macros.carbs.consumed / (data.macros.carbs.target || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-700 font-semibold">Fats</span>
                <span className="text-slate-500">
                  {data.macros.fats.consumed}g / {data.macros.fats.target}g
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      100,
                      (data.macros.fats.consumed / (data.macros.fats.target || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <Link
            href="/dashboard/profile"
            className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 gap-1 pt-2 border-t border-slate-100"
          >
            <span>Adjust Targets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Workout Split Status Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">{data.workout.dayOfWeek} Routine</span>
            <div
              className={`p-2 rounded-xl ${
                data.workout.isCompleted
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <Dumbbell className="w-5 h-5" />
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
                  Rest & Muscle Recovery
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
            className="inline-flex items-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 gap-1 pt-2 border-t border-slate-100"
          >
            <span>{data.workout.isCompleted ? 'Review Session' : 'Start Workout Session'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Charts & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Calorie Intake Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Weekly Calorie Trend</h2>
              <p className="text-xs text-slate-500">Daily calorie intake over previous logs</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600">
              Target: {data.calories.target} kcal
            </span>
          </div>

          <div className="h-64 w-full">
            {data.recentDietHistory && data.recentDietHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.recentDietHistory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(val) => {
                      const parts = val.split('-');
                      return `${parts[1]}/${parts[2]}`;
                    }}
                    stroke="#94a3b8"
                    fontSize={12}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    formatter={(value: any) => [`${value} kcal`, 'Calories']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    }}
                  />
                  <Bar dataKey="totalCalories" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                <Calendar className="w-8 h-8 mb-2" />
                <p className="text-sm">No historical diet logs recorded yet.</p>
                <p className="text-xs mt-1">Start logging your meals to see daily progress charts.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <h2 className="text-base font-bold text-slate-900 mb-4">Recent Activity</h2>

          {data.recentActivity && data.recentActivity.length > 0 ? (
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
        </div>
      </div>
    </div>
  );
}
