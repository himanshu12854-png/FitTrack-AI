import mongoose, { Schema, Document, Model } from 'mongoose';

export type Gender = 'male' | 'female' | 'other';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type FitnessGoal =
  | 'lose_weight'
  | 'maintain'
  | 'build_muscle'
  | 'improve_endurance'
  | 'general_fitness';

export interface IUserFitnessProfile extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  age?: number;
  gender?: Gender;
  height?: number;
  weight?: number;
  activityLevel?: ActivityLevel;
  fitnessGoal?: FitnessGoal;
  dailyCalorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatsTarget: number;
  timezone: string;
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserFitnessProfileSchema = new Schema<IUserFitnessProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    height: {
      type: Number,
    },
    weight: {
      type: Number,
    },
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    },
    fitnessGoal: {
      type: String,
      enum: ['lose_weight', 'maintain', 'build_muscle', 'improve_endurance', 'general_fitness'],
    },
    dailyCalorieTarget: {
      type: Number,
      default: 2000,
    },
    proteinTarget: {
      type: Number,
      default: 150,
    },
    carbsTarget: {
      type: Number,
      default: 250,
    },
    fatsTarget: {
      type: Number,
      default: 65,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserFitnessProfile: Model<IUserFitnessProfile> =
  mongoose.models.UserFitnessProfile ||
  mongoose.model<IUserFitnessProfile>('UserFitnessProfile', UserFitnessProfileSchema);

export default UserFitnessProfile;
