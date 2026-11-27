import type { IFoodEntry, IMicronutrients } from '../types/index.ts';

/**
 * Canonical nutrient units used across FitTrack AI:
 * - Energy: kcal
 * - Macronutrients & fiber: g
 * - Minerals & Vitamin C: mg
 * - Vitamin D & Vitamin B12: mcg
 */
export type NutrientUnit = 'kcal' | 'kj' | 'g' | 'mg' | 'mcg';

export const RECOMMENDED_DAILY_INTAKE = {
  fiber_g: { label: 'Dietary Fiber', unit: 'g', rdi: 28 },
  iron_mg: { label: 'Iron', unit: 'mg', rdi: 18 },
  calcium_mg: { label: 'Calcium', unit: 'mg', rdi: 1000 },
  vitaminC_mg: { label: 'Vitamin C', unit: 'mg', rdi: 90 },
  vitaminD_mcg: { label: 'Vitamin D', unit: 'mcg', rdi: 20 },
  vitaminB12_mcg: { label: 'Vitamin B12', unit: 'mcg', rdi: 2.4 },
  potassium_mg: { label: 'Potassium', unit: 'mg', rdi: 3500 },
  sodium_mg: { label: 'Sodium', unit: 'mg', rdi: 2300 },
} as const;

/**
 * Single unit-conversion helper for mass and energy units.
 */
export function convertNutrientUnit(
  value: number,
  from: NutrientUnit,
  to: NutrientUnit
): number {
  const safeVal = Number.isFinite(value) && value > 0 ? value : 0;
  if (from === to) return safeVal;

  if (from === 'kj' && to === 'kcal') return Math.round((safeVal / 4.184) * 100) / 100;
  if (from === 'kcal' && to === 'kj') return Math.round(safeVal * 4.184 * 100) / 100;

  const massToMg: Record<'g' | 'mg' | 'mcg', number> = {
    g: 1000,
    mg: 1,
    mcg: 0.001,
  };

  if (from in massToMg && to in massToMg) {
    const inMg = safeVal * massToMg[from as 'g' | 'mg' | 'mcg'];
    return Math.round((inMg / massToMg[to as 'g' | 'mg' | 'mcg']) * 1000) / 1000;
  }

  throw new Error(`Incompatible nutrient unit conversion: ${from} -> ${to}`);
}

function safeNonNegative(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) && num > 0 ? num : 0;
}

export interface DailyNutritionTotals {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  totalMicronutrients: Required<IMicronutrients>;
}

/**
 * Formula:
 *   entry_total(nutrient) = max(0, per_serving_value) * max(0, servingQuantity)
 *   daily_total(nutrient) = sum over all meals (breakfast, lunch, dinner, snacks)
 * Macros and calories are rounded to nearest integer; micronutrients to 2 decimal places.
 */
export function calculateDailyDietTotals(meals?: {
  breakfast?: Array<Partial<IFoodEntry>>;
  lunch?: Array<Partial<IFoodEntry>>;
  dinner?: Array<Partial<IFoodEntry>>;
  snacks?: Array<Partial<IFoodEntry>>;
} | null): DailyNutritionTotals {
  let calories = 0;
  let protein = 0;
  let carbs = 0;
  let fats = 0;

  const microTotals: Required<IMicronutrients> = {
    fiber_g: 0,
    iron_mg: 0,
    calcium_mg: 0,
    vitaminC_mg: 0,
    vitaminD_mcg: 0,
    vitaminB12_mcg: 0,
    potassium_mg: 0,
    sodium_mg: 0,
  };

  if (!meals) {
    return {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
      totalMicronutrients: microTotals,
    };
  }

  const buckets = [meals.breakfast, meals.lunch, meals.dinner, meals.snacks];
  for (const list of buckets) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      if (!item) continue;
      // Explicit zero quantity yields 0 contribution
      const qty =
        item.servingQuantity === undefined || item.servingQuantity === null
          ? 1
          : safeNonNegative(item.servingQuantity);
      if (qty === 0) continue;

      calories += safeNonNegative(item.calories) * qty;
      protein += safeNonNegative(item.protein) * qty;
      carbs += safeNonNegative(item.carbs) * qty;
      fats += safeNonNegative(item.fats) * qty;

      if (item.micronutrients) {
        for (const key of Object.keys(microTotals) as Array<keyof IMicronutrients>) {
          microTotals[key] += safeNonNegative(item.micronutrients[key]) * qty;
        }
      }
    }
  }

  for (const key of Object.keys(microTotals) as Array<keyof IMicronutrients>) {
    microTotals[key] = Math.round(microTotals[key] * 100) / 100;
  }

  return {
    totalCalories: Math.round(calories),
    totalProtein: Math.round(protein),
    totalCarbs: Math.round(carbs),
    totalFats: Math.round(fats),
    totalMicronutrients: microTotals,
  };
}

/**
 * Formula:
 *   caloriesBurned = round(MET * weightKg * (durationMinutes / 60))
 * Default MET = 5.0 for moderate strength training.
 * If durationMinutes is not supplied, estimates ~3 minutes per completed set.
 */
export function calculateWorkoutCaloriesBurned(params: {
  durationMinutes?: number;
  completedSetsCount?: number;
  weightKg?: number;
  met?: number;
}): number {
  const weightKg = safeNonNegative(params.weightKg) || 70;
  const met = safeNonNegative(params.met) || 5.0;
  const explicitDuration = safeNonNegative(params.durationMinutes);
  const completedSets = safeNonNegative(params.completedSetsCount);
  const effectiveMinutes =
    explicitDuration > 0 ? explicitDuration : completedSets * 3;

  if (effectiveMinutes <= 0) return 0;
  return Math.round(met * weightKg * (effectiveMinutes / 60));
}

/**
 * Formula:
 *   netCalories = totalCaloriesConsumed - workoutCaloriesBurned
 */
export function calculateNetDailyCalories(
  consumedCalories: number,
  caloriesBurned: number
): number {
  return Math.round(safeNonNegative(consumedCalories) - safeNonNegative(caloriesBurned));
}

/**
 * Formats a Date into YYYY-MM-DD in the user's configured IANA timezone,
 * safely falling back to UTC if the timezone is invalid.
 */
export function formatDateInTimezone(date: Date, timezone = 'UTC'): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}
