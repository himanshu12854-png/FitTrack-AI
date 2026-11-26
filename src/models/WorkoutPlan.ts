import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExercise {
  _id?: mongoose.Types.ObjectId;
  name: string;
  muscleGroup?: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  order?: number;
}

export interface IWorkoutDay {
  _id?: mongoose.Types.ObjectId;
  dayName: string;
  name: string;
  isRestDay: boolean;
  exercises: IExercise[];
}

export type WorkoutCreator = 'user' | 'ai';

export interface IWorkoutPlan extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  days: IWorkoutDay[];
  isActive: boolean;
  createdBy: WorkoutCreator;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema = new Schema<IExercise>(
  {
    name: {
      type: String,
      required: [true, 'Exercise name is required'],
    },
    muscleGroup: {
      type: String,
    },
    sets: {
      type: Number,
      required: [true, 'Number of sets is required'],
    },
    reps: {
      type: String,
      required: [true, 'Reps are required'],
    },
    restSeconds: {
      type: Number,
      default: 60,
    },
    notes: {
      type: String,
    },
    order: {
      type: Number,
    },
  },
  { _id: true }
);

const WorkoutDaySchema = new Schema<IWorkoutDay>(
  {
    dayName: {
      type: String,
      required: [true, 'Day name is required'],
    },
    name: {
      type: String,
      required: [true, 'Workout name is required'],
    },
    isRestDay: {
      type: Boolean,
      default: false,
    },
    exercises: [ExerciseSchema],
  },
  { _id: true }
);

const WorkoutPlanSchema = new Schema<IWorkoutPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Plan name is required'],
    },
    description: {
      type: String,
    },
    days: [WorkoutDaySchema],
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      enum: ['user', 'ai'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

WorkoutPlanSchema.index({ userId: 1 });
WorkoutPlanSchema.index({ userId: 1, isActive: 1 });

const WorkoutPlan: Model<IWorkoutPlan> =
  mongoose.models.WorkoutPlan ||
  mongoose.model<IWorkoutPlan>('WorkoutPlan', WorkoutPlanSchema);

export default WorkoutPlan;
