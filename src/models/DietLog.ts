import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFoodEntry {
  _id?: mongoose.Types.ObjectId;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize?: string;
  servingQuantity: number;
}

export interface IDietLog extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FoodEntrySchema = new Schema<IFoodEntry>(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fats: {
      type: Number,
      default: 0,
    },
    servingSize: {
      type: String,
    },
    servingQuantity: {
      type: Number,
      default: 1,
    },
  },
  { _id: true }
);

const DietLogSchema = new Schema<IDietLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    meals: {
      breakfast: [FoodEntrySchema],
      lunch: [FoodEntrySchema],
      dinner: [FoodEntrySchema],
      snacks: [FoodEntrySchema],
    },
    totalCalories: {
      type: Number,
      default: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
    },
    totalFats: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

DietLogSchema.index({ userId: 1, date: 1 }, { unique: true });

const DietLog: Model<IDietLog> =
  mongoose.models.DietLog || mongoose.model<IDietLog>('DietLog', DietLogSchema);

export default DietLog;
