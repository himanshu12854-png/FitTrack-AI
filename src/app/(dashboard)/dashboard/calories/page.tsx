'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Plus,
  Trash2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Flame,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Edit2,
  X,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { getTodayDate } from '@/lib/utils';
import { RECOMMENDED_DAILY_INTAKE } from '@/lib/nutrition';
import { IFoodEntry, IMicronutrients, MealType, NutrientSource } from '@/types';
import { getCached, setCached, invalidateCachePrefix } from '@/lib/client-cache';
import { useToast } from '@/components/ui/Toast';
import { useMilestone } from '@/components/ui/MilestoneCelebration';
import { CaloriesSkeleton } from '@/components/ui/Skeleton';
import CalorieRing from '@/components/ui/CalorieRing';
import LazySection from '@/components/ui/LazySection';

interface DietResponse {
  dietLog: {
    _id: string;
    date: string;
    meals: {
      breakfast: IFoodEntry[];
      lunch: IFoodEntry[];
      dinner: IFoodEntry[];
      snacks: IFoodEntry[];
    };
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFats: number;
    totalMicronutrients?: IMicronutrients;
  };
  targets: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

export default function CaloriesPage() {
  const { toast } = useToast();
  const { celebrate } = useMilestone();
  const [currentDate, setCurrentDate] = useState<string>(getTodayDate());
  const [data, setData] = useState<DietResponse | null>(() => {
    const cached = getCached<DietResponse>(`diet-${getTodayDate()}`, 30000);
    return cached ? cached.data : null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const cached = getCached<DietResponse>(`diet-${getTodayDate()}`, 30000);
    return !cached;
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fats, setFats] = useState<number | ''>('');
  const [servingSize, setServingSize] = useState('1 serving');
  const [servingQuantity, setServingQuantity] = useState(1);
  const [micronutrients, setMicronutrients] = useState<IMicronutrients | undefined>(undefined);
  const [nutrientSource, setNutrientSource] = useState<NutrientSource>('Manual');
  const [isEstimate, setIsEstimate] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupNoMatch, setLookupNoMatch] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // AI Food Suggestions state
  const [suggestions, setSuggestions] = useState<
    Array<{
      name: string;
      servingSize: string;
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      mealType: MealType;
      reason: string;
    }>
  >([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [loggingSuggestion, setLoggingSuggestion] = useState<string | null>(null);

  const fetchDietLog = useCallback(
    async (date: string, hasCache = false) => {
      try {
        if (!hasCache) setLoading(true);
        const res = await fetch(`/api/diet?date=${date}`);
        if (!res.ok) throw new Error('Failed to load diet data');
        const json = await res.json();
        if (json.success) {
          setCached(`diet-${date}`, json.data);
          setData(json.data);
        } else {
          throw new Error(json.error || 'Failed to fetch diet');
        }
      } catch (err: any) {
        if (!hasCache) {
          toast({
            title: 'Error loading food diary',
            description: err.message || 'Could not fetch diet log.',
            variant: 'error',
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    const cached = getCached<DietResponse>(`diet-${currentDate}`, 30000);
    if (cached) {
      setData(cached.data);
      setLoading(false);
      fetchDietLog(currentDate, true);
    } else {
      setData(null);
      fetchDietLog(currentDate, false);
    }
  }, [currentDate, fetchDietLog]);

  const changeDateByDays = (days: number) => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + days);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handleOpenAdd = (meal: MealType) => {
    setActiveMealType(meal);
    setEditingEntryId(null);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setServingSize('1 serving');
    setServingQuantity(1);
    setMicronutrients(undefined);
    setNutrientSource('Manual');
    setIsEstimate(false);
    setLookupNoMatch(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (meal: MealType, entry: IFoodEntry) => {
    setActiveMealType(meal);
    setEditingEntryId(entry._id?.toString() || null);
    setName(entry.name);
    setCalories(entry.calories);
    setProtein(entry.protein);
    setCarbs(entry.carbs);
    setFats(entry.fats);
    setServingSize(entry.servingSize || '1 serving');
    setServingQuantity(entry.servingQuantity || 1);
    setMicronutrients(entry.micronutrients);
    setNutrientSource(entry.nutrientSource || 'Manual');
    setIsEstimate(Boolean(entry.isEstimate));
    setLookupNoMatch(false);
    setIsModalOpen(true);
  };

  const handleLookupNutrition = async (allowAiEstimate = false) => {
    if (!name.trim() || name.trim().length < 2) {
      toast({ title: 'Enter food name', description: 'Type at least 2 characters to look up.', variant: 'info' });
      return;
    }
    try {
      setLookupLoading(true);
      setLookupNoMatch(false);
      const res = await fetch(
        `/api/nutrition/lookup?q=${encodeURIComponent(name.trim())}&aiEstimate=${allowAiEstimate ? 'true' : 'false'}`
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Lookup failed');
      if (!json.data) {
        setLookupNoMatch(true);
        toast({
          title: 'No database match',
          description: 'No exact match in nutrition DB. Enter manually or try AI Estimate.',
          variant: 'info',
        });
        return;
      }
      const match = json.data;
      setName(match.displayName || name);
      setServingSize(match.servingSize || '1 serving');
      setCalories(match.calories);
      setProtein(match.protein);
      setCarbs(match.carbs);
      setFats(match.fats);
      setMicronutrients(match.micronutrients);
      setNutrientSource(match.source);
      setIsEstimate(Boolean(match.isEstimate));
      toast({
        title: match.isEstimate ? 'AI Estimate loaded' : 'Nutrition loaded',
        description: `Source: ${match.source}`,
        variant: 'success',
      });
    } catch (err: any) {
      toast({ title: 'Lookup error', description: err.message || 'Unable to look up food', variant: 'error' });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || calories === '') return;

    try {
      setSubmitting(true);
      const savedJson = await (async () => {
        if (editingEntryId) {
          const res = await fetch('/api/diet/food', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: currentDate,
              mealType: activeMealType,
              entryId: editingEntryId,
              name,
              calories: Number(calories),
              protein: Number(protein || 0),
              carbs: Number(carbs || 0),
              fats: Number(fats || 0),
              servingSize,
              servingQuantity: Number(servingQuantity),
            }),
          });
          if (!res.ok) throw new Error('Failed to update food entry');
          return res.json();
        } else {
          const res = await fetch('/api/diet/food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: currentDate,
              mealType: activeMealType,
              name,
              calories: Number(calories),
              protein: Number(protein || 0),
              carbs: Number(carbs || 0),
              fats: Number(fats || 0),
              servingSize,
              servingQuantity: Number(servingQuantity),
              micronutrients,
              nutrientSource,
              isEstimate,
            }),
          });
          if (!res.ok) throw new Error('Failed to add food');
          return res.json();
        }
      })();

      setIsModalOpen(false);
      invalidateCachePrefix('diet-');
      invalidateCachePrefix('dashboard');
      toast({
        title: editingEntryId ? 'Food updated' : 'Food added',
        description: `${name} ${editingEntryId ? 'updated in' : 'logged to'} ${activeMealType}.`,
        variant: 'success',
      });

      const updatedLog = savedJson?.data;
      const targetCals = data?.targets?.calories || 2000;
      const targetProtein = data?.targets?.protein || 150;
      if (updatedLog && currentDate === getTodayDate()) {
        const calPct = Math.round(((updatedLog.totalCalories || 0) / targetCals) * 100);
        const protPct = Math.round(((updatedLog.totalProtein || 0) / targetProtein) * 100);

        if (calPct >= 100) {
          celebrate({
            id: 'calories-100',
            badge: 'Daily Goal Reached',
            title: '100% Daily Calorie Target Hit!',
            subtitle: `You logged ${updatedLog.totalCalories} kcal today — right on track with your personalized plan.`,
            progressPercent: 100,
            icon: 'trophy',
          });
        } else if (protPct >= 100) {
          celebrate({
            id: 'protein-100',
            badge: 'Macro Milestone',
            title: 'Protein Target Crushed!',
            subtitle: `${updatedLog.totalProtein}g protein logged today to fuel muscle recovery.`,
            progressPercent: 100,
            icon: 'award',
          });
        } else if (calPct >= 75) {
          celebrate({
            id: 'calories-75',
            badge: '75% Milestone',
            title: 'Three-Quarters of Daily Fuel!',
            subtitle: `You're at ${calPct}% of your daily calorie target (${updatedLog.totalCalories} / ${targetCals} kcal).`,
            progressPercent: calPct,
            icon: 'flame',
          });
        } else if (calPct >= 50) {
          celebrate({
            id: 'calories-50',
            badge: 'Halfway There',
            title: '50% Daily Nutrition Complete!',
            subtitle: `Great consistency — ${updatedLog.totalCalories} kcal logged so far today.`,
            progressPercent: calPct,
            icon: 'flame',
          });
        } else if (!editingEntryId && (data?.dietLog?.totalCalories || 0) === 0) {
          celebrate({
            id: 'first-meal',
            badge: 'First Meal Logged',
            title: 'Great Start Today!',
            subtitle: `Logged ${name} to ${activeMealType}. Consistency builds results.`,
            progressPercent: calPct,
            icon: 'sparkles',
          });
        }
      }

      await fetchDietLog(currentDate, true);
    } catch (err: any) {
      toast({
        title: 'Failed to save food',
        description: err.message || 'Error saving food',
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFood = async (mealType: MealType, entryId?: string) => {
    if (!entryId) return;
    if (!confirm('Remove this food item?')) return;

    try {
      const res = await fetch(
        `/api/diet/food?date=${currentDate}&mealType=${mealType}&entryId=${entryId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error('Failed to delete food entry');
      invalidateCachePrefix('diet-');
      invalidateCachePrefix('dashboard');
      toast({
        title: 'Food removed',
        description: 'Entry removed from your food diary.',
        variant: 'info',
      });
      await fetchDietLog(currentDate, true);
    } catch (err: any) {
      toast({
        title: 'Failed to remove food',
        description: err.message || 'Error deleting food',
        variant: 'error',
      });
    }
  };

  const handleFetchSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      const res = await fetch('/api/ai/food-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: currentDate }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Could not load AI food suggestions');
      }
      setSuggestions(json.data.suggestions || []);
    } catch (err: any) {
      toast({
        title: 'Suggestions unavailable',
        description: err.message || 'Unable to generate food suggestions right now.',
        variant: 'error',
      });
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleQuickLogSuggestion = async (item: {
    name: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    mealType: MealType;
  }) => {
    try {
      setLoggingSuggestion(item.name);
      const res = await fetch('/api/diet/food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: currentDate,
          mealType: item.mealType,
          name: item.name,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fats: item.fats,
          servingSize: item.servingSize,
          servingQuantity: 1,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to log food');

      invalidateCachePrefix('diet-');
      invalidateCachePrefix('dashboard');
      toast({
        title: 'Suggested food logged',
        description: `${item.name} added to ${item.mealType}.`,
        variant: 'success',
      });

      const updatedLog = json?.data;
      const targetCals = data?.targets?.calories || 2000;
      if (updatedLog && currentDate === getTodayDate()) {
        const calPct = Math.round(((updatedLog.totalCalories || 0) / targetCals) * 100);
        if (calPct >= 100) {
          celebrate({
            id: 'calories-100',
            badge: 'Daily Goal Reached',
            title: '100% Daily Calorie Target Hit!',
            subtitle: `You logged ${updatedLog.totalCalories} kcal today!`,
            progressPercent: 100,
            icon: 'trophy',
          });
        } else if (calPct >= 50) {
          celebrate({
            id: 'calories-50',
            badge: 'Halfway There',
            title: '50% Daily Nutrition Complete!',
            subtitle: `Great consistency — ${updatedLog.totalCalories} kcal logged today.`,
            progressPercent: calPct,
            icon: 'flame',
          });
        }
      }

      await fetchDietLog(currentDate, true);
    } catch (err: any) {
      toast({
        title: 'Failed to log food',
        description: err.message || 'Error logging suggested food',
        variant: 'error',
      });
    } finally {
      setLoggingSuggestion(null);
    }
  };

  const mealConfig: Array<{ type: MealType; label: string; icon: any }> = [
    { type: 'breakfast', label: 'Breakfast', icon: Coffee },
    { type: 'lunch', label: 'Lunch', icon: Sun },
    { type: 'dinner', label: 'Dinner', icon: Moon },
    { type: 'snacks', label: 'Snacks & Extras', icon: Cookie },
  ];

  if (loading && !data) {
    return <CaloriesSkeleton />;
  }

  const calorieTarget = data?.targets.calories || 2000;
  const consumed = data?.dietLog.totalCalories || 0;
  const remaining = Math.max(0, calorieTarget - consumed);

  return (
    <div className="space-y-6">
      {/* Date Navigation Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeDateByDays(-1)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Previous Day"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>{currentDate}</span>
          </div>
          <button
            onClick={() => changeDateByDays(1)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Next Day"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => setCurrentDate(getTodayDate())}
          className="text-xs font-semibold px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
        >
          Today
        </button>
      </div>

      {/* Energy & Macros Summary */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          {/* Main Calorie Ring */}
          <div className="md:col-span-1 border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6 flex items-center gap-4">
            <div className="shrink-0">
              <CalorieRing
                consumed={consumed}
                target={calorieTarget}
                size={112}
                strokeWidth={10}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold uppercase">
                <Flame className="w-3.5 h-3.5 text-emerald-600" />
                <span>Calories</span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-extrabold text-slate-900">
                  {consumed.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  / {calorieTarget.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <strong className="text-emerald-700">{remaining.toLocaleString()} kcal</strong> left
              </p>
            </div>
          </div>

          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Protein</span>
              <span className="text-emerald-700">
                {data?.dietLog.totalProtein || 0}g / {data?.targets.protein}g
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-600 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((data?.dietLog.totalProtein || 0) / (data?.targets.protein || 1)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Muscle repair & synthesis</p>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Carbohydrates</span>
              <span className="text-sky-700">
                {data?.dietLog.totalCarbs || 0}g / {data?.targets.carbs}g
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((data?.dietLog.totalCarbs || 0) / (data?.targets.carbs || 1)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Primary training fuel</p>
          </div>

          {/* Fats */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-700">Fats</span>
              <span className="text-amber-700">
                {data?.dietLog.totalFats || 0}g / {data?.targets.fats}g
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-amber-500 h-2 rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    ((data?.dietLog.totalFats || 0) / (data?.targets.fats || 1)) * 100
                  )}%`,
                }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Hormonal health & recovery</p>
          </div>
        </div>
      </div>

      {/* AI Food Suggestions */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>AI Meal Suggestions for Remaining Macros</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tailored to your remaining {remaining.toLocaleString()} kcal,{' '}
              {Math.max(0, (data?.targets.protein || 0) - (data?.dietLog.totalProtein || 0))}g protein,{' '}
              {Math.max(0, (data?.targets.carbs || 0) - (data?.dietLog.totalCarbs || 0))}g carbs, and{' '}
              {Math.max(0, (data?.targets.fats || 0) - (data?.dietLog.totalFats || 0))}g fats.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFetchSuggestions}
            disabled={suggestionsLoading}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition disabled:opacity-50 shrink-0"
          >
            {suggestionsLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span>{suggestionsLoading ? 'Finding Foods...' : suggestions.length > 0 ? 'Refresh Suggestions' : 'Suggest Foods'}</span>
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
            {suggestions.map((item) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between gap-2.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900">{item.name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {item.servingSize} • {item.calories} kcal (P:{item.protein}g C:{item.carbs}g F:{item.fats}g)
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                      {item.mealType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{item.reason}</p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickLogSuggestion(item)}
                  disabled={loggingSuggestion === item.name}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition disabled:opacity-50 w-full sm:w-auto self-end"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {loggingSuggestion === item.name ? 'Logging...' : `Log to ${item.mealType}`}
                  </span>
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Meals Sections */}
      <div className="space-y-4">
        {mealConfig.map(({ type, label, icon: MealIcon }) => {
          const entries = data?.dietLog.meals[type] || [];
          const mealCalories = entries.reduce(
            (sum, item) => sum + (item.calories || 0) * (item.servingQuantity || 1),
            0
          );

          return (
            <div
              key={type}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <MealIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{label}</h3>
                    <p className="text-xs text-slate-500">
                      {Math.round(mealCalories)} kcal total
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAdd(type)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Food</span>
                </button>
              </div>

              {entries.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  <AnimatePresence initial={false}>
                    {entries.map((item) => (
                      <motion.div
                        key={item._id?.toString() || item.name}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.2 }}
                        className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                              {item.name}
                            </h4>
                            {item.nutrientSource && item.nutrientSource !== 'Manual' && (
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                  item.isEstimate
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {item.nutrientSource}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {item.servingQuantity} × {item.servingSize || '1 serving'} •{' '}
                            <span className="font-semibold text-slate-700">
                              {Math.round((item.calories || 0) * (item.servingQuantity || 1))} kcal
                            </span>{' '}
                            (P: {Math.round((item.protein || 0) * (item.servingQuantity || 1))}g, C:{' '}
                            {Math.round((item.carbs || 0) * (item.servingQuantity || 1))}g, F:{' '}
                            {Math.round((item.fats || 0) * (item.servingQuantity || 1))}g)
                          </p>
                          {item.micronutrients &&
                          Object.values(item.micronutrients).some((v) => typeof v === 'number' && v > 0) ? (
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              Iron: {((item.micronutrients.iron_mg || 0) * (item.servingQuantity || 1)).toFixed(1)}mg •
                              Calcium: {Math.round((item.micronutrients.calcium_mg || 0) * (item.servingQuantity || 1))}mg •
                              Vit C: {((item.micronutrients.vitaminC_mg || 0) * (item.servingQuantity || 1)).toFixed(1)}mg •
                              Fiber: {((item.micronutrients.fiber_g || 0) * (item.servingQuantity || 1)).toFixed(1)}g
                            </p>
                          ) : (
                            <p className="text-[11px] text-slate-400 italic mt-0.5">
                              Micronutrients: no data
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEdit(type, item)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            title="Edit food"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFood(type, item._id?.toString())}
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete food"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-6 px-4 text-center text-slate-400 text-xs">
                  No foods logged in {label.toLowerCase()} yet.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Daily Micronutrients & % RDI (Lazy-loaded on viewport entry) */}
      <LazySection
        fallback={<div className="h-44 bg-white rounded-2xl border border-slate-200/80 animate-pulse" />}
      >
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Daily Micronutrients &amp; % Recommended Daily Intake
              </h2>
              <p className="text-xs text-slate-500">
                Server-computed totals across today&apos;s logged foods (USDA / Built-in DB / AI Estimate)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.keys(RECOMMENDED_DAILY_INTAKE) as Array<keyof typeof RECOMMENDED_DAILY_INTAKE>).map(
              (key) => {
                const meta = RECOMMENDED_DAILY_INTAKE[key];
                const rawVal = data?.dietLog.totalMicronutrients?.[key] || 0;
                const pct = Math.min(100, Math.round((rawVal / meta.rdi) * 100));
                return (
                  <div key={key} className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{meta.label}</span>
                      <span className="text-emerald-700">{pct}%</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {rawVal} {meta.unit} / {meta.rdi} {meta.unit}
                    </p>
                    <div className="w-full h-1.5 bg-slate-200/70 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </LazySection>

      {/* Add / Edit Food Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  {editingEntryId ? 'Edit Food Item' : `Add Food to ${activeMealType.toUpperCase()}`}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFood} className="space-y-4 mt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Food Name *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Grilled Chicken Breast"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setLookupNoMatch(false);
                      }}
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleLookupNutrition(false)}
                      disabled={lookupLoading}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition shrink-0 disabled:opacity-50"
                    >
                      {lookupLoading ? 'Looking up...' : 'Lookup DB'}
                    </button>
                  </div>
                  {lookupNoMatch && (
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200">
                      <span>No DB match found.</span>
                      <button
                        type="button"
                        onClick={() => handleLookupNutrition(true)}
                        disabled={lookupLoading}
                        className="font-bold underline hover:text-amber-900"
                      >
                        Try AI Estimate
                      </button>
                    </div>
                  )}
                  {nutrientSource !== 'Manual' && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Source: <strong className={isEstimate ? 'text-amber-700' : 'text-emerald-700'}>{nutrientSource}</strong>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Serving Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 150g or 1 cup"
                      value={servingSize}
                      onChange={(e) => setServingSize(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Serving Quantity
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={servingQuantity}
                      onChange={(e) => setServingQuantity(parseFloat(e.target.value) || 1)}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Calories (kcal) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      placeholder="250"
                      value={calories}
                      onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="30"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={carbs}
                      onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fats (g)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="5"
                      value={fats}
                      onChange={(e) => setFats(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingEntryId ? 'Update Food' : 'Add Food'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
