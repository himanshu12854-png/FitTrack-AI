import mongoose, { Schema, Document, Model } from 'mongoose';
import type { IMicronutrients, NutrientSource } from './DietLog';

export interface IFoodNutritionCache extends Document {
  normalizedName: string;
  displayName: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  micronutrients: IMicronutrients;
  source: NutrientSource;
  fdcId?: number;
  isEstimate: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FoodNutritionCacheSchema = new Schema<IFoodNutritionCache>(
  {
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: { type: String, required: true, trim: true },
    servingSize: { type: String, default: '100g', trim: true },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fats: { type: Number, default: 0, min: 0 },
    micronutrients: {
      fiber_g: { type: Number, min: 0 },
      iron_mg: { type: Number, min: 0 },
      calcium_mg: { type: Number, min: 0 },
      vitaminC_mg: { type: Number, min: 0 },
      vitaminD_mcg: { type: Number, min: 0 },
      vitaminB12_mcg: { type: Number, min: 0 },
      potassium_mg: { type: Number, min: 0 },
      sodium_mg: { type: Number, min: 0 },
    },
    source: {
      type: String,
      enum: ['USDA FoodData Central', 'Built-in Nutrition DB', 'AI Estimate', 'Manual'],
      required: true,
    },
    fdcId: { type: Number },
    isEstimate: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day TTL
    },
  },
  { timestamps: true }
);

FoodNutritionCacheSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const FoodNutritionCache: Model<IFoodNutritionCache> =
  mongoose.models.FoodNutritionCache ||
  mongoose.model<IFoodNutritionCache>('FoodNutritionCache', FoodNutritionCacheSchema);

export default FoodNutritionCache;
