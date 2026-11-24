import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const foodEntrySchema = z.object({
  name: z.string().min(1, 'Food name is required').max(100),
  calories: z.number().min(0, 'Calories cannot be negative'),
  protein: z.number().min(0, 'Protein cannot be negative').default(0),
  carbs: z.number().min(0, 'Carbs cannot be negative').default(0),
  fats: z.number().min(0, 'Fats cannot be negative').default(0),
  servingSize: z.string().optional().default('1 serving'),
  servingQuantity: z.number().min(0.1, 'Quantity must be greater than 0').default(1),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const updateFoodEntrySchema = foodEntrySchema.partial().extend({
  entryId: z.string().min(1, 'Entry ID is required'),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});

export const exerciseSchema = z.object({
  name: z.string().min(1, 'Exercise name is required'),
  muscleGroup: z.string().default('Full Body'),
  sets: z.number().int().min(1, 'Sets must be at least 1').max(20),
  reps: z.string().min(1, 'Reps format required (e.g. 8-12)'),
  restSeconds: z.number().int().min(0).max(600).default(60),
  notes: z.string().optional(),
  order: z.number().int().default(0),
});

export const workoutDaySchema = z.object({
  dayName: z.string().min(1, 'Day name is required'),
  name: z.string().min(1, 'Routine name is required'),
  isRestDay: z.boolean().default(false),
  exercises: z.array(exerciseSchema).default([]),
});

export const workoutPlanSchema = z.object({
  name: z.string().min(2, 'Plan name must be at least 2 characters').max(100),
  description: z.string().optional(),
  days: z.array(workoutDaySchema).min(1, 'Plan must include at least one day'),
  isActive: z.boolean().default(true),
  createdBy: z.enum(['user', 'ai']).default('user'),
});

export const setRecordSchema = z.object({
  setNumber: z.number().int().min(1),
  targetReps: z.string(),
  actualReps: z.number().int().min(0).optional(),
  weight: z.number().min(0).optional(),
  isCompleted: z.boolean().default(false),
});

export const sessionExerciseSchema = z.object({
  exerciseName: z.string().min(1),
  muscleGroup: z.string().optional(),
  sets: z.array(setRecordSchema),
  isCompleted: z.boolean().default(false),
});

export const workoutSessionSchema = z.object({
  workoutPlanId: z.string().optional(),
  dayName: z.string().min(1),
  workoutName: z.string().min(1),
  date: z.string().or(z.date()),
  exercises: z.array(sessionExerciseSchema),
  isCompleted: z.boolean().default(false),
  duration: z.number().int().min(0).optional(),
  notes: z.string().optional(),
});

export const fitnessProfileSchema = z.object({
  age: z.number().int().min(13).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  height: z.number().min(50).max(300).optional(),
  weight: z.number().min(20).max(500).optional(),
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'very_active']).default('moderate'),
  fitnessGoal: z.enum(['lose_weight', 'maintain', 'build_muscle', 'improve_endurance', 'general_fitness']).default('build_muscle'),
  dailyCalorieTarget: z.number().min(800).max(10000).default(2000),
  proteinTarget: z.number().min(0).max(600).default(150),
  carbsTarget: z.number().min(0).max(1000).default(250),
  fatsTarget: z.number().min(0).max(500).default(65),
  timezone: z.string().default('UTC'),
});

export const aiChatMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, 'Message cannot be empty').max(4000),
  includeContext: z.boolean().default(true),
});
