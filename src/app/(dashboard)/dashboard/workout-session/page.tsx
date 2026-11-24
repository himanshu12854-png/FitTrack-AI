'use client';

import { useState, useEffect } from 'react';
import {
  Dumbbell,
  CheckCircle2,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  Save,
  Clock,
  Flame,
  Calendar,
  AlertCircle,
  RefreshCw,
  Award,
} from 'lucide-react';
import { getTodayDate, formatDate } from '@/lib/utils';
import { IWorkoutSession, ISessionExercise, ISetRecord } from '@/types';

export default function WorkoutSessionPage() {
  const [session, setSession] = useState<IWorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(getTodayDate());

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const startRestTimer = (seconds = 60) => {
    setTimerSeconds(seconds);
    setIsTimerRunning(true);
  };

  const fetchSession = async (date: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/workouts/session?date=${date}`);
      const json = await res.json();
      if (json.success && json.data) {
        setSession(json.data);
      } else {
        setSession(null);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession(currentDate);
  }, [currentDate]);

  const handleToggleSetComplete = (exIndex: number, setIndex: number) => {
    if (!session) return;
    const updatedExercises = [...session.exercises];
    const targetSet = updatedExercises[exIndex].sets[setIndex];
    const wasCompleted = targetSet.isCompleted;
    targetSet.isCompleted = !wasCompleted;

    // Check if all sets for this exercise are completed
    const allSetsCompleted = updatedExercises[exIndex].sets.every((s) => s.isCompleted);
    updatedExercises[exIndex].isCompleted = allSetsCompleted;

    // Trigger rest timer if set was completed
    if (!wasCompleted) {
      startRestTimer(60);
    }

    setSession({ ...session, exercises: updatedExercises });
  };

  const handleSetChange = (
    exIndex: number,
    setIndex: number,
    field: 'weight' | 'actualReps',
    value: number
  ) => {
    if (!session) return;
    const updatedExercises = [...session.exercises];
    updatedExercises[exIndex].sets[setIndex] = {
      ...updatedExercises[exIndex].sets[setIndex],
      [field]: value,
    };
    setSession({ ...session, exercises: updatedExercises });
  };

  const handleAddSet = (exIndex: number) => {
    if (!session) return;
    const updatedExercises = [...session.exercises];
    const sets = updatedExercises[exIndex].sets;
    const lastSet = sets[sets.length - 1];
    sets.push({
      setNumber: sets.length + 1,
      targetReps: lastSet?.targetReps || '8-12',
      actualReps: lastSet?.actualReps,
      weight: lastSet?.weight,
      isCompleted: false,
    });
    setSession({ ...session, exercises: updatedExercises });
  };

  const handleSaveSession = async (markComplete = false) => {
    if (!session) return;

    try {
      setSaving(true);
      const res = await fetch('/api/workouts/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...session,
          date: currentDate,
          isCompleted: markComplete ? true : session.isCompleted,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save workout session');

      setSession(json.data);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving session');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading workout session...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200/80 shadow-xs text-center max-w-xl mx-auto space-y-4">
        <Dumbbell className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">No Routine Scheduled Today</h2>
        <p className="text-sm text-slate-500">
          You don&apos;t have a workout split assigned for today or it is marked as a rest day.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => {
              setSession({
                userId: '',
                dayName: 'Custom Session',
                workoutName: 'Open Gym Workout',
                date: currentDate,
                weekStart: '',
                isCompleted: false,
                exercises: [
                  {
                    exerciseName: 'Barbell Bench Press',
                    muscleGroup: 'Chest',
                    isCompleted: false,
                    sets: [
                      { setNumber: 1, targetReps: '8-12', weight: 60, actualReps: 10, isCompleted: false },
                      { setNumber: 2, targetReps: '8-12', weight: 60, actualReps: 10, isCompleted: false },
                      { setNumber: 3, targetReps: '8-12', weight: 60, actualReps: 8, isCompleted: false },
                    ],
                  },
                ],
              });
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition"
          >
            Start Empty Workout
          </button>
        </div>
      </div>
    );
  }

  const completedSetsCount = session.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
    0
  );
  const totalSetsCount = session.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="space-y-6">
      {/* Session Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
              {session.dayName}
            </span>
            {session.isCompleted ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Session Completed
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500">
                {completedSetsCount} / {totalSetsCount} sets logged
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">{session.workoutName}</h1>
          <p className="text-xs text-slate-400 mt-1">{formatDate(currentDate)}</p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Rest Timer Widget */}
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-mono">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>
              Rest: {Math.floor(timerSeconds / 60)}:
              {(timerSeconds % 60).toString().padStart(2, '0')}
            </span>
            {isTimerRunning ? (
              <button
                onClick={() => setIsTimerRunning(false)}
                className="text-[10px] text-slate-400 hover:text-white underline ml-1"
              >
                Pause
              </button>
            ) : (
              <button
                onClick={() => startRestTimer(60)}
                className="text-[10px] text-emerald-400 hover:underline ml-1"
              >
                +60s
              </button>
            )}
          </div>

          <button
            onClick={() => handleSaveSession(false)}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Progress</span>
          </button>

          <button
            onClick={() => handleSaveSession(true)}
            disabled={saving || session.isCompleted}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{session.isCompleted ? 'Workout Finished' : 'Finish Workout'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <span>Workout session saved and personal records updated!</span>
        </div>
      )}

      {/* Exercises & Interactive Sets */}
      <div className="space-y-4">
        {session.exercises.map((exercise, exIndex) => (
          <div
            key={exercise.exerciseName}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
          >
            <div className="p-4 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">{exercise.exerciseName}</h3>
                {exercise.muscleGroup && (
                  <span className="text-xs font-medium text-slate-500">
                    Target: {exercise.muscleGroup}
                  </span>
                )}
              </div>

              <button
                onClick={() => handleAddSet(exIndex)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Set</span>
              </button>
            </div>

            {/* Set Table */}
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-400 uppercase font-semibold border-b border-slate-100 pb-2">
                    <th className="pb-2 w-16">Set</th>
                    <th className="pb-2 w-28">Target Reps</th>
                    <th className="pb-2 w-32">Weight (kg)</th>
                    <th className="pb-2 w-32">Actual Reps</th>
                    <th className="pb-2 w-20 text-center">Done</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {exercise.sets.map((set, setIndex) => (
                    <tr
                      key={setIndex}
                      className={`hover:bg-slate-50/50 transition ${
                        set.isCompleted ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      <td className="py-2.5 font-bold text-slate-700">{set.setNumber}</td>
                      <td className="py-2.5 text-slate-500">{set.targetReps}</td>
                      <td className="py-2.5">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={set.weight ?? ''}
                          placeholder="e.g. 80"
                          onChange={(e) =>
                            handleSetChange(
                              exIndex,
                              setIndex,
                              'weight',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                        />
                      </td>
                      <td className="py-2.5">
                        <input
                          type="number"
                          min="0"
                          value={set.actualReps ?? ''}
                          placeholder="reps"
                          onChange={(e) =>
                            handleSetChange(
                              exIndex,
                              setIndex,
                              'actualReps',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold"
                        />
                      </td>
                      <td className="py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSetComplete(exIndex, setIndex)}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition ${
                            set.isCompleted
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Workout Notes */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
          Workout Session Notes
        </label>
        <textarea
          rows={3}
          value={session.notes || ''}
          onChange={(e) => setSession({ ...session, notes: e.target.value })}
          placeholder="How did the session feel? Energy levels, form notes, pump..."
          className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>
  );
}
