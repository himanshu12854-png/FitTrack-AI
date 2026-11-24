// Food Entry Interface
export interface IFoodEntry {
  _id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize?: string;
  servingQuantity: number;
}

// Meal Types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

// Diet Log Interface
export interface IDietLog {
  _id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
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
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Exercise
export interface IExercise {
  _id?: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  order: number;
}

// Workout Day
export interface IWorkoutDay {
  _id?: string;
  dayName: string; // e.g. "Monday"
  name: string;    // e.g. "Push Day"
  isRestDay: boolean;
  exercises: IExercise[];
}

// Workout Plan
export interface IWorkoutPlan {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  days: IWorkoutDay[];
  isActive: boolean;
  createdBy: 'user' | 'ai';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Set Record inside a Workout Session
export interface ISetRecord {
  setNumber: number;
  targetReps: string;
  actualReps?: number;
  weight?: number;
  isCompleted: boolean;
}

// Session Exercise
export interface ISessionExercise {
  exerciseName: string;
  muscleGroup?: string;
  sets: ISetRecord[];
  isCompleted: boolean;
}

// Workout Session
export interface IWorkoutSession {
  _id?: string;
  userId: string;
  workoutPlanId?: string;
  dayName: string;
  workoutName: string;
  date: string | Date;
  weekStart: string; // YYYY-MM-DD of Monday
  exercises: ISessionExercise[];
  isCompleted: boolean;
  duration?: number; // in minutes
  notes?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// Exercise History Record
export interface IExerciseHistory {
  _id?: string;
  userId: string;
  exerciseName: string;
  date: string | Date;
  bestWeight: number;
  bestReps: number;
  totalSets: number;
  totalVolume: number;
  personalRecord: boolean;
}

// User Fitness Profile
export interface IUserFitnessProfile {
  _id?: string;
  userId: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  height?: number; // cm
  weight?: number; // kg
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  fitnessGoal?: 'lose_weight' | 'maintain' | 'build_muscle' | 'improve_endurance' | 'general_fitness';
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  timezone: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

// AI Message
export interface IAIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string | Date;
  metadata?: {
    proposedPlan?: {
      type: 'workout' | 'diet' | 'both';
      workoutPlan?: Partial<IWorkoutPlan>;
      dietPlan?: {
        dailyCalorieTarget: number;
        proteinTarget: number;
        carbsTarget: number;
        fatsTarget: number;
        mealSuggestions?: Array<{
          meal: string;
          items: string[];
          calories: number;
        }>;
      };
    };
    [key: string]: unknown;
  };
}

// AI Conversation
export interface IAIConversation {
  _id?: string;
  userId: string;
  title: string;
  messages: IAIMessage[];
  context?: {
    includesDietData?: boolean;
    includesWorkoutData?: boolean;
    includesProfileData?: boolean;
  };
  lastMessageAt?: string | Date;
}

// Dashboard Aggregation
export interface IDashboardData {
  user: {
    name: string;
    email: string;
  };
  profile: IUserFitnessProfile | null;
  todayDiet: IDietLog | null;
  workoutPlan: IWorkoutPlan | null;
  todaySession: IWorkoutSession | null;
  weeklyWorkoutsCount: number;
  recentActivity: Array<{
    id: string;
    type: 'diet' | 'workout';
    title: string;
    subtitle: string;
    date: string;
  }>;
}

// Generic API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
