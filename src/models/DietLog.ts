import mongoose, { Schema, Document, Model } from 'mongoose';

export type NutrientSource =
  | 'USDA FoodData Central'
  | 'Built-in Nutrition DB'
  | 'AI Estimate'
  | 'Manual';

export interface IMicronutrients {
  fiber_g?: number;
  iron_mg?: number;
  calcium_mg?: number;
  vitaminC_mg?: number;
  vitaminD_mcg?: number;
  vitaminB12_mcg?: number;
  potassium_mg?: number;
  sodium_mg?: number;
}

export interface IFoodEntry {
  _id?: mongoose.Types.ObjectId;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize?: string;
  servingQuantity: number;
  micronutrients?: IMicronutrients;
  nutrientSource?: NutrientSource;
  isEstimate?: boolean;
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
  totalMicronutrients?: IMicronutrients;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MicronutrientsSchema = new Schema<IMicronutrients>(
  {
    fiber_g: { type: Number, min: 0 },
    iron_mg: { type: Number, min: 0 },
    calcium_mg: { type: Number, min: 0 },
    vitaminC_mg: { type: Number, min: 0 },
    vitaminD_mcg: { type: Number, min: 0 },
    vitaminB12_mcg: { type: Number, min: 0 },
    potassium_mg: { type: Number, min: 0 },
    sodium_mg: { type: Number, min: 0 },
  },
  { _id: false }
);

const FoodEntrySchema = new Schema<IFoodEntry>(
  {
    name: {
      type: String,
      required: [true, 'Food name is required'],
      trim: true,
      maxlength: 120,
    },
    calories: {
      type: Number,
      required: [true, 'Calories are required'],
      min: 0,
    },
    protein: {
      type: Number,
      default: 0,
      min: 0,
    },
    carbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    fats: {
      type: Number,
      default: 0,
      min: 0,
    },
    servingSize: {
      type: String,
      trim: true,
      maxlength: 80,
    },
    servingQuantity: {
      type: Number,
      default: 1,
      min: 0.1,
    },
    micronutrients: {
      type: MicronutrientsSchema,
      default: undefined,
    },
    nutrientSource: {
      type: String,
      enum: ['USDA FoodData Central', 'Built-in Nutrition DB', 'AI Estimate', 'Manual'],
      default: 'Manual',
    },
    isEstimate: {
      type: Boolean,
      default: false,
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
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'],
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
      min: 0,
    },
    totalProtein: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalCarbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalFats: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMicronutrients: {
      type: MicronutrientsSchema,
      default: undefined,
    },
    notes: {
      type: String,
      maxlength: 1000,
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
