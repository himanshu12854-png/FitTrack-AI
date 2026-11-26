'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Dumbbell,
  Clock,
  Zap,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { getCached, setCached } from '@/lib/client-cache';

const ExerciseProgressChart = dynamic(
  () => import('@/components/charts/ExerciseProgressChart'),
  {
    ssr: false,
    loading: () => (
      <div className="h-72 w-full rounded-xl bg-slate-100 animate-pulse" />
    ),
  }
);

interface HistoryResponse {
  recentSessions: any[];
  personalRecords: Array<{
    _id: string;
    maxWeight: number;
    bestReps: number;
    date: string;
  }>;
  progressionData: Array<{
    date: string;
    bestWeight: number;
    totalVolume: number;
  }>;
}

export default function ProgressPage() {
  const [selectedExercise, setSelectedExercise] = useState('Barbell Bench Press');
  const [data, setData] = useState<HistoryResponse | null>(() => {
    const cached = getCached<HistoryResponse>('workout-history-Barbell Bench Press', 60000);
    return cached ? cached.data : null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getCached<HistoryResponse>('workout-history-Barbell Bench Press', 60000);
    return !cached;
  });

  const fetchHistory = async (exerciseName: string, hasCache = false) => {
    try {
      if (!hasCache) setLoading(true);
      const res = await fetch(`/api/workouts/history?exercise=${encodeURIComponent(exerciseName)}`);
      const json = await res.json();
      if (json.success) {
        setCached(`workout-history-${exerciseName}`, json.data);
        setData(json.data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = getCached<HistoryResponse>(`workout-history-${selectedExercise}`, 60000);
    if (cached) {
      setData(cached.data);
      setLoading(false);
      fetchHistory(selectedExercise, true);
    } else {
      fetchHistory(selectedExercise, false);
    }
  }, [selectedExercise]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading progression metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Progress & Performance Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Visualize your progressive overload, personal records, and workout consistency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Exercise:</span>
            <input
              type="text"
              value={selectedExercise}
              onChange={(e) => setSelectedExercise(e.target.value)}
              placeholder="e.g. Barbell Bench Press"
              className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Progression Line Chart */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Strength Progression — {selectedExercise}
            </h2>
            <p className="text-xs text-slate-400">Heaviest successful set (kg) over time</p>
          </div>
        </div>

        <div className="h-72 w-full">
          {data?.progressionData && data.progressionData.length > 0 ? (
            <ExerciseProgressChart data={data.progressionData} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
              <TrendingUp className="w-8 h-8 mb-2 text-slate-300" />
              <p className="text-sm font-semibold">No logged sets for {selectedExercise} yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Log completed workouts in your live session to plot your strength progression curves.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Personal Records & Recent Workout Logs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Records Trophy Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Personal Records (PRs)</h2>
              <p className="text-xs text-slate-400">All-time peak weights recorded</p>
            </div>
          </div>

          {data?.personalRecords && data.personalRecords.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.personalRecords.map((pr) => (
                <div key={pr._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{pr._id}</p>
                      <p className="text-[10px] text-slate-400">{formatDate(pr.date)}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">
                      {pr.maxWeight} kg
                    </span>
                    {pr.bestReps > 0 && (
                      <span className="text-xs text-slate-400 ml-1">× {pr.bestReps} reps</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">
              Complete your first workout to establish your personal records.
            </div>
          )}
        </div>

        {/* Recent Session Logs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Completed Workout Sessions</h2>
              <p className="text-xs text-slate-400">Historical workout completions</p>
            </div>
          </div>

          {data?.recentSessions && data.recentSessions.length > 0 ? (
            <div className="space-y-3">
              {data.recentSessions.map((s) => (
                <div
                  key={s._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-10 rounded-full ${
                        s.isCompleted ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">{s.workoutName}</p>
                      <p className="text-[11px] text-slate-500">
                        {s.dayName} • {formatDate(s.date)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                      s.isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.isCompleted ? 'Finished' : 'In Progress'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">
              No completed workout logs found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
