'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Check,
  Flame,
  Globe,
  RotateCcw,
  Sparkles,
  Target,
  User,
} from 'lucide-react';
import {
  calculateBMR,
  calculateMacroTargets,
  calculateTDEE,
} from '@/lib/utils';
import { invalidateCachePrefix } from '@/lib/client-cache';
import { useToast } from '@/components/ui/Toast';
import type { ActivityLevel, FitnessGoal, Gender } from '@/models/UserFitnessProfile';

interface OnboardingFormData {
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  timezone: string;
  activityLevel: ActivityLevel;
  fitnessGoal: FitnessGoal;
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
}

const GENDER_OPTIONS: { value: Gender; label: string; subtitle: string }[] = [
  { value: 'male', label: 'Male', subtitle: 'Mifflin-St Jeor (+5)' },
  { value: 'female', label: 'Female', subtitle: 'Mifflin-St Jeor (-161)' },
  { value: 'other', label: 'Other', subtitle: 'Balanced baseline' },
];

const ACTIVITY_OPTIONS: {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: string;
}[] = [
  {
    value: 'sedentary',
    label: 'Sedentary',
    description: 'Desk job with little or no structured exercise',
    multiplier: '1.2x',
  },
  {
    value: 'light',
    label: 'Lightly Active',
    description: 'Light exercise or sports 1–3 days per week',
    multiplier: '1.375x',
  },
  {
    value: 'moderate',
    label: 'Moderately Active',
    description: 'Moderate workouts 3–5 days per week',
    multiplier: '1.55x',
  },
  {
    value: 'active',
    label: 'Very Active',
    description: 'Hard training or sports 6–7 days per week',
    multiplier: '1.725x',
  },
  {
    value: 'very_active',
    label: 'Extremely Active',
    description: 'Physical job or intense twice-daily training',
    multiplier: '1.9x',
  },
];

const GOAL_OPTIONS: {
  value: FitnessGoal;
  label: string;
  description: string;
  badge: string;
}[] = [
  {
    value: 'lose_weight',
    label: 'Fat Loss / Cutting',
    description: 'Preserve lean muscle while shedding body fat',
    badge: '-400 kcal',
  },
  {
    value: 'maintain',
    label: 'Weight Maintenance',
    description: 'Stay at your current weight and fuel recovery',
    badge: 'Maintenance',
  },
  {
    value: 'build_muscle',
    label: 'Build Muscle / Hypertrophy',
    description: 'Controlled lean surplus for strength & size',
    badge: '+300 kcal',
  },
  {
    value: 'improve_endurance',
    label: 'Endurance & Stamina',
    description: 'Higher carbs to power longer aerobic sessions',
    badge: 'High Carb',
  },
  {
    value: 'general_fitness',
    label: 'General Fitness',
    description: 'Balanced nutrition for everyday energy & health',
    badge: 'Balanced',
  },
];

const STEPS = [
  { id: 1, title: 'Your Biometrics', icon: User },
  { id: 2, title: 'Activity & Goal', icon: Target },
  { id: 3, title: 'Daily Targets', icon: Sparkles },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingFormData>({
    gender: 'male',
    age: 26,
    height: 175,
    weight: 72,
    timezone: 'UTC',
    activityLevel: 'moderate',
    fitnessGoal: 'build_muscle',
    dailyCalorieTarget: 2500,
    proteinTarget: 180,
    carbsTarget: 280,
    fatsTarget: 70,
  });

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (detected) {
        setFormData((prev) => ({ ...prev, timezone: detected }));
      }
    } catch {
      // Fallback remains UTC
    }
  }, []);

  const recommended = useMemo(() => {
    const bmr = Math.round(
      calculateBMR(
        Number(formData.weight) || 70,
        Number(formData.height) || 170,
        Number(formData.age) || 25,
        formData.gender
      )
    );
    const tdee = calculateTDEE(bmr, formData.activityLevel);
    const adjustment =
      formData.fitnessGoal === 'build_muscle'
        ? 300
        : formData.fitnessGoal === 'lose_weight'
        ? -400
        : 0;
    const calories = Math.max(800, tdee + adjustment);
    const macros = calculateMacroTargets(calories, formData.fitnessGoal);

    return {
      bmr,
      tdee,
      calories,
      protein: macros.protein,
      carbs: macros.carbs,
      fats: macros.fats,
    };
  }, [
    formData.weight,
    formData.height,
    formData.age,
    formData.gender,
    formData.activityLevel,
    formData.fitnessGoal,
  ]);

  const applyRecommendedTargets = () => {
    setFormData((prev) => ({
      ...prev,
      dailyCalorieTarget: recommended.calories,
      proteinTarget: recommended.protein,
      carbsTarget: recommended.carbs,
      fatsTarget: recommended.fats,
    }));
  };

  const validateStep1 = (): boolean => {
    if (!Number.isFinite(formData.age) || formData.age < 13 || formData.age > 120) {
      setStepError('Please enter a valid age between 13 and 120.');
      return false;
    }
    if (
      !Number.isFinite(formData.height) ||
      formData.height < 50 ||
      formData.height > 300
    ) {
      setStepError('Please enter a valid height between 50 and 300 cm.');
      return false;
    }
    if (
      !Number.isFinite(formData.weight) ||
      formData.weight < 20 ||
      formData.weight > 500
    ) {
      setStepError('Please enter a valid weight between 20 and 500 kg.');
      return false;
    }
    setStepError(null);
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2) {
      applyRecommendedTargets();
    }
    setStepError(null);
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStepError(null);
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.dailyCalorieTarget < 800 ||
      formData.dailyCalorieTarget > 10000
    ) {
      setStepError('Daily calories must be between 800 and 10,000 kcal.');
      return;
    }

    setStepError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: Math.round(formData.age),
          isOnboarded: true,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save your fitness profile');
      }

      invalidateCachePrefix('dashboard');
      invalidateCachePrefix('diet');

      toast({
        title: 'Profile configured!',
        description: 'Your personalized calorie and macro targets are ready.',
        variant: 'success',
      });

      router.replace('/dashboard');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong.';
      setStepError(message);
      toast({
        title: 'Could not save profile',
        description: message,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-2 sm:py-6">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-700 mb-3">
          <Activity className="h-3.5 w-3.5" />
          Personalize Your FitTrack AI Experience
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Let&apos;s set up your fitness profile
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Complete these 3 quick steps so we can calculate your daily calorie and macro targets.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="mb-6 sm:mb-8">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {STEPS.map((item) => {
            const Icon = item.icon;
            const isCompleted = step > item.id;
            const isCurrent = step === item.id;

            return (
              <div
                key={item.id}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors ${
                  isCurrent
                    ? 'border-emerald-600 bg-emerald-50/70'
                    : isCompleted
                    ? 'border-emerald-200 bg-white'
                    : 'border-slate-200 bg-white opacity-70'
                }`}
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                    isCurrent
                      ? 'bg-emerald-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400">
                    Step {item.id}
                  </p>
                  <p
                    className={`truncate text-xs sm:text-sm font-semibold ${
                      isCurrent ? 'text-emerald-900' : 'text-slate-700'
                    }`}
                  >
                    {item.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Wizard Card */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-8 shadow-xs overflow-hidden"
      >
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Your Biometrics
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Used to estimate your Basal Metabolic Rate (BMR) accurately.
                </p>
              </div>

              {/* Gender Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Gender
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {GENDER_OPTIONS.map((option) => {
                    const selected = formData.gender === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, gender: option.value }))
                        }
                        className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition-all ${
                          selected
                            ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm font-semibold text-slate-900">
                          {option.label}
                        </span>
                        <span className="mt-0.5 text-xs text-slate-500">
                          {option.subtitle}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Numeric Biometrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="onboard-age"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Age (years)
                  </label>
                  <input
                    id="onboard-age"
                    type="number"
                    min={13}
                    max={120}
                    value={formData.age || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        age: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="onboard-height"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Height (cm)
                  </label>
                  <input
                    id="onboard-height"
                    type="number"
                    min={50}
                    max={300}
                    step="0.5"
                    value={formData.height || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        height: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="onboard-weight"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Weight (kg)
                  </label>
                  <input
                    id="onboard-weight"
                    type="number"
                    min={20}
                    max={500}
                    step="0.1"
                    value={formData.weight || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        weight: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>
              </div>

              {/* Auto-detected Timezone */}
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <Globe className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Detected Timezone</span>
                </div>
                <span className="text-xs font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                  {formData.timezone}
                </span>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Activity & Fitness Goal
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Choose your weekly activity level and primary training objective.
                </p>
              </div>

              {/* Activity Level */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Activity Level
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {ACTIVITY_OPTIONS.map((option) => {
                    const selected = formData.activityLevel === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            activityLevel: option.value,
                          }))
                        }
                        className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all ${
                          selected
                            ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {option.label}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {option.description}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold ${
                            selected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {option.multiplier}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary Fitness Goal */}
              <div className="space-y-2.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Primary Fitness Goal
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {GOAL_OPTIONS.map((option) => {
                    const selected = formData.fitnessGoal === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            fitnessGoal: option.value,
                          }))
                        }
                        className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                          selected
                            ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 w-full">
                          <span className="text-sm font-semibold text-slate-900">
                            {option.label}
                          </span>
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
                              selected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {option.badge}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={direction}
              initial={{ opacity: 0, x: direction * 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -24 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Your Personalized Daily Targets
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Fine-tune your daily calories and macros or keep our recommendation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={applyRecommendedTargets}
                  className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                  Reset to Recommended
                </button>
              </div>

              {/* BMR & TDEE Info Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500">
                      Basal Metabolic Rate (BMR)
                    </p>
                    <p className="mt-0.5 text-xl font-bold text-slate-900">
                      {recommended.bmr.toLocaleString()}{' '}
                      <span className="text-xs font-medium text-slate-500">
                        kcal/day
                      </span>
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600">
                    <Activity className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
                  <div>
                    <p className="text-xs font-medium text-emerald-800">
                      Maintenance TDEE
                    </p>
                    <p className="mt-0.5 text-xl font-bold text-emerald-950">
                      {recommended.tdee.toLocaleString()}{' '}
                      <span className="text-xs font-medium text-emerald-700">
                        kcal/day
                      </span>
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                    <Flame className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Editable Calorie & Macro Targets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="target-calories"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Daily Calories (kcal)
                  </label>
                  <input
                    id="target-calories"
                    type="number"
                    min={800}
                    max={10000}
                    value={formData.dailyCalorieTarget || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dailyCalorieTarget: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="target-protein"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Protein (g)
                  </label>
                  <input
                    id="target-protein"
                    type="number"
                    min={0}
                    max={600}
                    value={formData.proteinTarget || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        proteinTarget: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="target-carbs"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Carbs (g)
                  </label>
                  <input
                    id="target-carbs"
                    type="number"
                    min={0}
                    max={1000}
                    value={formData.carbsTarget || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        carbsTarget: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>

                <div>
                  <label
                    htmlFor="target-fats"
                    className="block text-sm font-semibold text-slate-700 mb-1.5"
                  >
                    Fats (g)
                  </label>
                  <input
                    id="target-fats"
                    type="number"
                    min={0}
                    max={500}
                    value={formData.fatsTarget || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fatsTarget: Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/15"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline Validation Error */}
        {stepError ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            {stepError}
          </p>
        ) : null}

        {/* Wizard Footer Navigation */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Saving Profile...' : 'Complete Setup'}
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
