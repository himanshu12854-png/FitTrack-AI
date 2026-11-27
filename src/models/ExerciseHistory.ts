import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExerciseHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  exerciseName: string;
  date: Date;
  bestWeight?: number;
  bestReps?: number;
  totalSets?: number;
  totalVolume?: number;
  personalRecord: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseHistorySchema = new Schema<IExerciseHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    exerciseName: {
      type: String,
      required: [true, 'Exercise name is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    bestWeight: {
      type: Number,
    },
    bestReps: {
      type: Number,
    },
    totalSets: {
      type: Number,
    },
    totalVolume: {
      type: Number,
    },
    personalRecord: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

ExerciseHistorySchema.index({ userId: 1, exerciseName: 1, date: -1 });
ExerciseHistorySchema.index({ userId: 1, exerciseName: 1, bestWeight: -1 });

const ExerciseHistory: Model<IExerciseHistory> =
  mongoose.models.ExerciseHistory ||
  mongoose.model<IExerciseHistory>('ExerciseHistory', ExerciseHistorySchema);

export default ExerciseHistory;
