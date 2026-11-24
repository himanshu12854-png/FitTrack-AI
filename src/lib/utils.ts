import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export function getTodayDate(timezone = 'UTC'): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Formats as YYYY-MM-DD
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

export function getWeekStart(dateInput?: Date | string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
}

export function getDayName(dateInput?: Date | string): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(d);
}

// Mifflin-St Jeor Equation
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other'
): number {
  if (gender === 'female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }
  // male or other default
  return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
}

export function calculateTDEE(
  bmr: number,
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
): number {
  const multiplier = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }[activityLevel] || 1.375;

  return Math.round(bmr * multiplier);
}

export function calculateMacroTargets(
  calories: number,
  goal: 'lose_weight' | 'maintain' | 'build_muscle' | 'improve_endurance' | 'general_fitness'
) {
  let proteinRatio = 0.3;
  let carbsRatio = 0.45;
  let fatsRatio = 0.25;

  if (goal === 'build_muscle') {
    proteinRatio = 0.35;
    carbsRatio = 0.45;
    fatsRatio = 0.2;
  } else if (goal === 'lose_weight') {
    proteinRatio = 0.35;
    carbsRatio = 0.35;
    fatsRatio = 0.3;
  } else if (goal === 'improve_endurance') {
    proteinRatio = 0.25;
    carbsRatio = 0.55;
    fatsRatio = 0.2;
  }

  return {
    protein: Math.round((calories * proteinRatio) / 4), // 4 kcal per gram
    carbs: Math.round((calories * carbsRatio) / 4),     // 4 kcal per gram
    fats: Math.round((calories * fatsRatio) / 9),       // 9 kcal per gram
  };
}
