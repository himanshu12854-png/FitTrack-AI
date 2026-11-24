import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetRecord {
  _id?: mongoose.Types.ObjectId;
  setNumber: number;
  targetReps?: string;
  actualReps?: number;
  weight?: number;
  isCompleted: boolean;
}

export interface ISessionExercise {
  _id?: mongoose.Types.ObjectId;
  exerciseName: string;
  muscleGroup?: string;
  sets: ISetRecord[];
  isCompleted: boolean;
}

export interface IWorkoutSession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workoutPlanId?: mongoose.Types.ObjectId;
  dayName: string;
  workoutName: string;
  date: Date;
  weekStart?: string;
  exercises: ISessionExercise[];
  isCompleted: boolean;
  duration?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SetRecordSchema = new Schema<ISetRecord>(
  {
    setNumber: {
      type: Number,
      required: [true, 'Set number is required'],
    },
    targetReps: {
      type: String,
    },
    actualReps: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const SessionExerciseSchema = new Schema<ISessionExercise>(
  {
    exerciseName: {
      type: String,
      required: [true, 'Exercise name is required'],
    },
    muscleGroup: {
      type: String,
    },
    sets: [SetRecordSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const WorkoutSessionSchema = new Schema<IWorkoutSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    workoutPlanId: {
      type: Schema.Types.ObjectId,
      ref: 'WorkoutPlan',
    },
    dayName: {
      type: String,
      required: [true, 'Day name is required'],
    },
    workoutName: {
      type: String,
      required: [true, 'Workout name is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    weekStart: {
      type: String,
    },
    exercises: [SessionExerciseSchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

WorkoutSessionSchema.index({ userId: 1, date: -1 });
WorkoutSessionSchema.index({ userId: 1, weekStart: 1 });

const WorkoutSession: Model<IWorkoutSession> =
  mongoose.models.WorkoutSession ||
  mongoose.model<IWorkoutSession>('WorkoutSession', WorkoutSessionSchema);

export default WorkoutSession;
