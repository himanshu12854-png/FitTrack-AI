'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  RefreshCw,
  Calculator,
  Flame,
  Scale,
  Activity,
} from 'lucide-react';
import { calculateBMR, calculateTDEE, calculateMacroTargets } from '@/lib/utils';
import { IUserFitnessProfile } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import { getCached, setCached, invalidateCachePrefix } from '@/lib/client-cache';

export default function ProfilePage() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<Partial<IUserFitnessProfile>>({
    age: 26,
    gender: 'male',
    height: 178,
    weight: 75,
    activityLevel: 'moderate',
    fitnessGoal: 'build_muscle',
    dailyCalorieTarget: 2400,
    proteinTarget: 170,
    carbsTarget: 260,
    fatsTarget: 70,
    timezone: 'UTC',
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getCached<Partial<IUserFitnessProfile>>('user-profile', 60000);
    return !cached;
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cached = getCached<Partial<IUserFitnessProfile>>('user-profile', 60000);
    if (cached) {
      setProfile(cached.data);
      setLoading(false);
    }

    const fetchProfile = async () => {
      try {
        if (!cached) setLoading(true);
        const res = await fetch('/api/user/profile');
        const json = await res.json();
        if (json.success && json.data.profile) {
          setCached('user-profile', json.data.profile);
          setProfile(json.data.profile);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const liveMetrics = useMemo(() => {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
      return null;
    }
    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel || 'moderate');
    return {
      bmr: Math.round(bmr),
      tdee,
    };
  }, [profile.weight, profile.height, profile.age, profile.gender, profile.activityLevel]);

  const handleAutoCalculate = () => {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender) {
      toast({
        title: 'Missing biometrics',
        description: 'Please fill in your Age, Gender, Height, and Weight first.',
        variant: 'error',
      });
      return;
    }

    const bmr = calculateBMR(profile.weight, profile.height, profile.age, profile.gender);
    const tdee = calculateTDEE(bmr, profile.activityLevel || 'moderate');

    let targetCalories = tdee;
    if (profile.fitnessGoal === 'build_muscle') targetCalories += 300;
    else if (profile.fitnessGoal === 'lose_weight') targetCalories -= 400;

    const macros = calculateMacroTargets(targetCalories, profile.fitnessGoal || 'build_muscle');

    setProfile({
      ...profile,
      dailyCalorieTarget: targetCalories,
      proteinTarget: macros.protein,
      carbsTarget: macros.carbs,
      fatsTarget: macros.fats,
    });

    toast({
      title: 'Targets auto-calculated',
      description: `Personalized to ${targetCalories.toLocaleString()} kcal/day based on your TDEE (${tdee.toLocaleString()} kcal).`,
      variant: 'success',
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          isOnboarded: true,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save profile');

      invalidateCachePrefix('dashboard');
      invalidateCachePrefix('diet-');
      toast({
        title: 'Profile updated',
        description: 'Your biometrics and daily nutrition targets have been saved.',
        variant: 'success',
      });
    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err.message || 'Error updating profile',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Fitness Profile &amp; Nutrition Targets
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          These biometric parameters configure your daily calorie targets, macronutrient calculations, and AI fitness guidance.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Biometrics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <span>Biometric Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min="13"
                max="120"
                value={profile.age || ''}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={profile.gender || 'male'}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Height (cm)</label>
              <input
                type="number"
                min="50"
                max="300"
                value={profile.height || ''}
                onChange={(e) =>
                  setProfile({ ...profile, height: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                min="20"
                max="500"
                value={profile.weight || ''}
                onChange={(e) =>
                  setProfile({ ...profile, weight: parseFloat(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Activity Level
              </label>
              <select
                value={profile.activityLevel || 'moderate'}
                onChange={(e) => setProfile({ ...profile, activityLevel: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="sedentary">Sedentary (Little or no exercise)</option>
                <option value="light">Lightly Active (Exercise 1-3 times/week)</option>
                <option value="moderate">Moderately Active (Exercise 4-5 times/week)</option>
                <option value="active">Very Active (Daily intense workouts)</option>
                <option value="very_active">Extremely Active (Twice daily training / athletic)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Primary Fitness Goal
              </label>
              <select
                value={profile.fitnessGoal || 'build_muscle'}
                onChange={(e) => setProfile({ ...profile, fitnessGoal: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="build_muscle">Build Muscle / Hypertrophy (+Surplus)</option>
                <option value="lose_weight">Fat Loss / Cutting (-Deficit)</option>
                <option value="maintain">Weight Maintenance & Body Recomp</option>
                <option value="improve_endurance">Endurance & Cardiovascular Stamina</option>
                <option value="general_fitness">General Health & Longevity</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nutrition Targets */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-emerald-600" />
                <span>Daily Calorie &amp; Macronutrient Targets</span>
              </h2>
              {liveMetrics && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                    <Activity className="w-3 h-3 text-slate-500" />
                    BMR: {liveMetrics.bmr.toLocaleString()} kcal
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold">
                    Maintenance TDEE: {liveMetrics.tdee.toLocaleString()} kcal
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAutoCalculate}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold hover:bg-emerald-100 transition border border-emerald-200 w-fit shrink-0"
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-600" />
              <span>Auto-Calculate (TDEE Formula)</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                min="800"
                max="10000"
                value={profile.dailyCalorieTarget || 2000}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    dailyCalorieTarget: parseInt(e.target.value, 10) || 2000,
                  })
                }
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-emerald-700 mb-1">
                Protein (grams)
              </label>
              <input
                type="number"
                min="0"
                value={profile.proteinTarget || 150}
                onChange={(e) =>
                  setProfile({ ...profile, proteinTarget: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sky-700 mb-1">
                Carbohydrates (grams)
              </label>
              <input
                type="number"
                min="0"
                value={profile.carbsTarget || 250}
                onChange={(e) =>
                  setProfile({ ...profile, carbsTarget: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-700 mb-1">
                Fats (grams)
              </label>
              <input
                type="number"
                min="0"
                value={profile.fatsTarget || 65}
                onChange={(e) =>
                  setProfile({ ...profile, fatsTarget: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-3 py-2 text-sm font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition shadow-xs disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
