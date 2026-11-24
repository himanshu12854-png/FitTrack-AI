'use client';

import { useState, useEffect } from 'react';
import {
  Dumbbell,
  Plus,
  Trash2,
  Save,
  Sparkles,
  Calendar,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { IWorkoutPlan, IWorkoutDay, IExercise } from '@/types';

const PRESET_SPLITS = [
  {
    name: '4-Day Upper / Lower Split',
    description: 'Optimal balance of frequency and recovery for hypertrophy and strength',
    days: [
      {
        dayName: 'Monday',
        name: 'Upper Body Power',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 4, reps: '6-8', restSeconds: 90, order: 0 },
          { name: 'Bent-Over Barbell Row', muscleGroup: 'Back', sets: 4, reps: '6-8', restSeconds: 90, order: 1 },
          { name: 'Overhead Barbell Press', muscleGroup: 'Shoulders', sets: 3, reps: '8-10', restSeconds: 75, order: 2 },
          { name: 'Incline Dumbbell Curl', muscleGroup: 'Biceps', sets: 3, reps: '10-12', restSeconds: 60, order: 3 },
          { name: 'Triceps Rope Pushdown', muscleGroup: 'Triceps', sets: 3, reps: '10-12', restSeconds: 60, order: 4 },
        ],
      },
      {
        dayName: 'Tuesday',
        name: 'Lower Body Strength',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Back Squat', muscleGroup: 'Quads', sets: 4, reps: '6-8', restSeconds: 120, order: 0 },
          { name: 'Romanian Deadlift', muscleGroup: 'Hamstrings', sets: 4, reps: '8-10', restSeconds: 90, order: 1 },
          { name: 'Leg Press', muscleGroup: 'Quads', sets: 3, reps: '10-12', restSeconds: 90, order: 2 },
          { name: 'Standing Calf Raise', muscleGroup: 'Calves', sets: 4, reps: '12-15', restSeconds: 60, order: 3 },
          { name: 'Hanging Leg Raise', muscleGroup: 'Core', sets: 3, reps: '12-15', restSeconds: 60, order: 4 },
        ],
      },
      {
        dayName: 'Wednesday',
        name: 'Rest & Recovery',
        isRestDay: true,
        exercises: [],
      },
      {
        dayName: 'Thursday',
        name: 'Upper Body Hypertrophy',
        isRestDay: false,
        exercises: [
          { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 4, reps: '8-12', restSeconds: 75, order: 0 },
          { name: 'Lat Pulldown', muscleGroup: 'Back', sets: 4, reps: '10-12', restSeconds: 75, order: 1 },
          { name: 'Dumbbell Lateral Raise', muscleGroup: 'Shoulders', sets: 4, reps: '12-15', restSeconds: 60, order: 2 },
          { name: 'Cable Face Pull', muscleGroup: 'Rear Delts', sets: 3, reps: '12-15', restSeconds: 60, order: 3 },
          { name: 'Dumbbell Hammer Curl', muscleGroup: 'Biceps', sets: 3, reps: '10-12', restSeconds: 60, order: 4 },
        ],
      },
      {
        dayName: 'Friday',
        name: 'Lower Body Hypertrophy',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Deadlift', muscleGroup: 'Back/Hamstrings', sets: 3, reps: '5', restSeconds: 120, order: 0 },
          { name: 'Bulgarian Split Squat', muscleGroup: 'Quads/Glutes', sets: 3, reps: '8-10', restSeconds: 90, order: 1 },
          { name: 'Lying Hamstring Curl', muscleGroup: 'Hamstrings', sets: 3, reps: '10-12', restSeconds: 60, order: 2 },
          { name: 'Seated Calf Raise', muscleGroup: 'Calves', sets: 4, reps: '12-15', restSeconds: 60, order: 3 },
        ],
      },
      {
        dayName: 'Saturday',
        name: 'Active Recovery / Mobility',
        isRestDay: true,
        exercises: [],
      },
      {
        dayName: 'Sunday',
        name: 'Rest Day',
        isRestDay: true,
        exercises: [],
      },
    ],
  },
  {
    name: '3-Day Full Body Foundations',
    description: 'High frequency full body stimulation ideal for beginner to intermediate trainees',
    days: [
      {
        dayName: 'Monday',
        name: 'Full Body A',
        isRestDay: false,
        exercises: [
          { name: 'Barbell Squat', muscleGroup: 'Legs', sets: 3, reps: '8-10', restSeconds: 90, order: 0 },
          { name: 'Barbell Bench Press', muscleGroup: 'Chest', sets: 3, reps: '8-10', restSeconds: 90, order: 1 },
          { name: 'Barbell Row', muscleGroup: 'Back', sets: 3, reps: '8-10', restSeconds: 90, order: 2 },
          { name: 'Overhead Dumbbell Extension', muscleGroup: 'Triceps', sets: 2, reps: '12', restSeconds: 60, order: 3 },
        ],
      },
      { dayName: 'Tuesday', name: 'Rest', isRestDay: true, exercises: [] },
      {
        dayName: 'Wednesday',
        name: 'Full Body B',
        isRestDay: false,
        exercises: [
          { name: 'Deadlift', muscleGroup: 'Back/Legs', sets: 3, reps: '6-8', restSeconds: 120, order: 0 },
          { name: 'Overhead Press', muscleGroup: 'Shoulders', sets: 3, reps: '8-10', restSeconds: 90, order: 1 },
          { name: 'Lat Pulldown', muscleGroup: 'Back', sets: 3, reps: '10-12', restSeconds: 75, order: 2 },
          { name: 'Barbell Bicep Curl', muscleGroup: 'Biceps', sets: 2, reps: '10-12', restSeconds: 60, order: 3 },
        ],
      },
      { dayName: 'Thursday', name: 'Rest', isRestDay: true, exercises: [] },
      {
        dayName: 'Friday',
        name: 'Full Body C',
        isRestDay: false,
        exercises: [
          { name: 'Leg Press', muscleGroup: 'Legs', sets: 3, reps: '10-12', restSeconds: 90, order: 0 },
          { name: 'Incline Dumbbell Press', muscleGroup: 'Chest', sets: 3, reps: '10-12', restSeconds: 75, order: 1 },
          { name: 'Seated Cable Row', muscleGroup: 'Back', sets: 3, reps: '10-12', restSeconds: 75, order: 2 },
          { name: 'Plank', muscleGroup: 'Core', sets: 3, reps: '45-60s', restSeconds: 60, order: 3 },
        ],
      },
      { dayName: 'Saturday', name: 'Rest', isRestDay: true, exercises: [] },
      { dayName: 'Sunday', name: 'Rest', isRestDay: true, exercises: [] },
    ],
  },
];

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function WorkoutPlannerPage() {
  const [plan, setPlan] = useState<Partial<IWorkoutPlan> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fetchActivePlan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/workouts/plan');
      const json = await res.json();
      if (json.success && json.data) {
        setPlan(json.data);
      } else {
        // Default to the 4-day split preset if no plan exists
        setPlan(PRESET_SPLITS[0]);
      }
    } catch {
      setPlan(PRESET_SPLITS[0]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivePlan();
  }, []);

  const handleApplyPreset = (preset: typeof PRESET_SPLITS[0]) => {
    if (confirm(`Load the preset "${preset.name}"? Unsaved changes will be replaced.`)) {
      setPlan({
        name: preset.name,
        description: preset.description,
        days: JSON.parse(JSON.stringify(preset.days)),
        isActive: true,
        createdBy: 'user',
      });
    }
  };

  const handleToggleRestDay = (dayIndex: number) => {
    if (!plan?.days) return;
    const updatedDays = [...plan.days];
    const isNowRest = !updatedDays[dayIndex].isRestDay;
    updatedDays[dayIndex].isRestDay = isNowRest;
    if (isNowRest) {
      updatedDays[dayIndex].name = 'Rest & Recovery';
      updatedDays[dayIndex].exercises = [];
    } else {
      updatedDays[dayIndex].name = 'Workout Routine';
    }
    setPlan({ ...plan, days: updatedDays });
  };

  const handleUpdateDayName = (dayIndex: number, newName: string) => {
    if (!plan?.days) return;
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].name = newName;
    setPlan({ ...plan, days: updatedDays });
  };

  const handleAddExercise = (dayIndex: number) => {
    if (!plan?.days) return;
    const updatedDays = [...plan.days];
    const exercises = updatedDays[dayIndex].exercises || [];
    exercises.push({
      name: 'New Exercise',
      muscleGroup: 'Chest',
      sets: 3,
      reps: '8-12',
      restSeconds: 60,
      order: exercises.length,
    });
    updatedDays[dayIndex].exercises = exercises;
    setPlan({ ...plan, days: updatedDays });
  };

  const handleRemoveExercise = (dayIndex: number, exIndex: number) => {
    if (!plan?.days) return;
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].exercises.splice(exIndex, 1);
    setPlan({ ...plan, days: updatedDays });
  };

  const handleExerciseChange = (
    dayIndex: number,
    exIndex: number,
    field: keyof IExercise,
    value: any
  ) => {
    if (!plan?.days) return;
    const updatedDays = [...plan.days];
    updatedDays[dayIndex].exercises[exIndex] = {
      ...updatedDays[dayIndex].exercises[exIndex],
      [field]: value,
    };
    setPlan({ ...plan, days: updatedDays });
  };

  const handleSavePlan = async () => {
    if (!plan?.name) {
      alert('Please enter a plan name.');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/workouts/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: plan.name,
          description: plan.description || '',
          days: plan.days,
          isActive: true,
          createdBy: 'user',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save workout plan');

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving workout plan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading workout split...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
              Active Split
            </span>
            {plan?.createdBy === 'ai' && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                <Sparkles className="w-3 h-3" /> AI Generated
              </span>
            )}
          </div>
          <input
            type="text"
            value={plan?.name || ''}
            onChange={(e) => setPlan({ ...plan, name: e.target.value })}
            placeholder="e.g. 4-Day Hypertrophy Split"
            className="text-2xl font-extrabold text-slate-900 mt-2 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-none transition w-full"
          />
          <input
            type="text"
            value={plan?.description || ''}
            onChange={(e) => setPlan({ ...plan, description: e.target.value })}
            placeholder="Add split notes or goals..."
            className="text-xs text-slate-500 mt-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-600 focus:outline-none transition w-full"
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/ai-assistant"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-sm font-semibold transition border border-emerald-200"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Generate with AI</span>
          </Link>
          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-xs disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save Routine'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Workout split successfully saved and activated for your dashboard!</span>
        </div>
      )}

      {/* Preset Split Templates */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Or Load a Science-Based Split Template
        </h3>
        <div className="flex flex-wrap gap-2">
          {PRESET_SPLITS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 7-Day Workout Routine Schedule */}
      <div className="space-y-4">
        {plan?.days?.map((day, dayIndex) => (
          <div
            key={day.dayName}
            className={`bg-white rounded-2xl border transition-all ${
              day.isRestDay ? 'border-slate-200 bg-slate-50/50' : 'border-slate-200/90 shadow-xs'
            }`}
          >
            {/* Day Header */}
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md text-center">
                  {day.dayName}
                </span>
                <input
                  type="text"
                  value={day.name}
                  disabled={day.isRestDay}
                  onChange={(e) => handleUpdateDayName(dayIndex, e.target.value)}
                  className={`text-sm font-bold text-slate-900 bg-transparent border-b border-transparent focus:border-emerald-500 focus:outline-none ${
                    day.isRestDay ? 'text-slate-400 italic' : ''
                  }`}
                  placeholder="Routine name (e.g. Push, Pull, Legs)"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleRestDay(dayIndex)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition ${
                    day.isRestDay
                      ? 'bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {day.isRestDay ? 'Mark as Workout Day' : 'Mark as Rest Day'}
                </button>

                {!day.isRestDay && (
                  <button
                    type="button"
                    onClick={() => handleAddExercise(dayIndex)}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Exercise</span>
                  </button>
                )}
              </div>
            </div>

            {/* Exercises List */}
            {!day.isRestDay && (
              <div className="p-4 sm:p-5 space-y-3">
                {day.exercises && day.exercises.length > 0 ? (
                  <div className="space-y-2">
                    {day.exercises.map((exercise, exIndex) => (
                      <div
                        key={exIndex}
                        className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 items-center">
                          <div className="md:col-span-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Exercise Name
                            </label>
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) =>
                                handleExerciseChange(dayIndex, exIndex, 'name', e.target.value)
                              }
                              className="w-full px-2.5 py-1.5 font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Muscle Group
                            </label>
                            <input
                              type="text"
                              value={exercise.muscleGroup || ''}
                              onChange={(e) =>
                                handleExerciseChange(dayIndex, exIndex, 'muscleGroup', e.target.value)
                              }
                              className="w-full px-2 py-1.5 text-slate-700 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Sets × Reps
                            </label>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                max="20"
                                value={exercise.sets}
                                onChange={(e) =>
                                  handleExerciseChange(
                                    dayIndex,
                                    exIndex,
                                    'sets',
                                    parseInt(e.target.value, 10) || 1
                                  )
                                }
                                className="w-14 px-2 py-1.5 text-center font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg"
                              />
                              <span className="text-slate-400">×</span>
                              <input
                                type="text"
                                value={exercise.reps}
                                onChange={(e) =>
                                  handleExerciseChange(dayIndex, exIndex, 'reps', e.target.value)
                                }
                                placeholder="8-12"
                                className="w-20 px-2 py-1.5 text-center font-semibold text-slate-800 bg-white border border-slate-200 rounded-lg"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Rest (seconds)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="15"
                              value={exercise.restSeconds}
                              onChange={(e) =>
                                handleExerciseChange(
                                  dayIndex,
                                  exIndex,
                                  'restSeconds',
                                  parseInt(e.target.value, 10) || 60
                                )
                              }
                              className="w-20 px-2 py-1.5 text-center text-slate-700 bg-white border border-slate-200 rounded-lg"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(dayIndex, exIndex)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-lg self-end md:self-center transition"
                          title="Remove Exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-2">
                    No exercises added for this day yet. Click &quot;Add Exercise&quot; to build this workout.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
