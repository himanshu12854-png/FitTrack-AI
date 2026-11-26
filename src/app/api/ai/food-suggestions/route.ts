import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import DietLog from '@/models/DietLog';
import { getTodayDate } from '@/lib/utils';
import { geminiClient } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export interface FoodSuggestion {
  name: string;
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snacks';
  reason: string;
}

function buildSmartFallbackSuggestions(remaining: {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}): FoodSuggestion[] {
  const highProteinLowCal: FoodSuggestion = {
    name: 'Greek Yogurt & Whey Bowl',
    servingSize: '200g',
    calories: 210,
    protein: 32,
    carbs: 12,
    fats: 3,
    mealType: 'snacks',
    reason: 'High protein with minimal fats to close your protein gap.',
  };

  const balancedMeal: FoodSuggestion = {
    name: 'Grilled Chicken & Jasmine Rice',
    servingSize: '150g chicken + 150g rice',
    calories: 440,
    protein: 42,
    carbs: 48,
    fats: 7,
    mealType: 'dinner',
    reason: 'Balanced protein and clean carbs for recovery and energy.',
  };

  const lightSnack: FoodSuggestion = {
    name: 'Boiled Eggs & Whole Wheat Toast',
    servingSize: '2 eggs + 1 slice',
    calories: 230,
    protein: 16,
    carbs: 16,
    fats: 11,
    mealType: 'breakfast',
    reason: 'Quick nutrient-dense option for steady energy.',
  };

  const carbBoost: FoodSuggestion = {
    name: 'Oats, Banana & Peanut Butter',
    servingSize: '60g oats + 1 banana',
    calories: 380,
    protein: 13,
    carbs: 58,
    fats: 10,
    mealType: 'breakfast',
    reason: 'Great complex carb boost for training fuel.',
  };

  const pool = [balancedMeal, highProteinLowCal, carbBoost, lightSnack];
  if (remaining.calories > 0 && remaining.calories < 300) {
    return [highProteinLowCal, lightSnack, {
      name: 'Cottage Cheese & Berries',
      servingSize: '150g',
      calories: 165,
      protein: 18,
      carbs: 11,
      fats: 4,
      mealType: 'snacks',
      reason: 'Fits tightly inside your remaining calorie budget.',
    }];
  }
  return pool;
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json().catch(() => ({}));
    const requestedDate = typeof body?.date === 'string' ? body.date : undefined;

    await connectDB();

    const profile = await UserFitnessProfile.findOne({ userId: user.id })
      .select('timezone dailyCalorieTarget proteinTarget carbsTarget fatsTarget fitnessGoal')
      .lean();

    const date = requestedDate || getTodayDate(profile?.timezone || 'UTC');
    const dietLog = await DietLog.findOne({ userId: user.id, date })
      .select('totalCalories totalProtein totalCarbs totalFats')
      .lean();

    const targetCalories = profile?.dailyCalorieTarget || 2000;
    const targetProtein = profile?.proteinTarget || 150;
    const targetCarbs = profile?.carbsTarget || 250;
    const targetFats = profile?.fatsTarget || 65;

    const remaining = {
      calories: Math.max(0, targetCalories - (dietLog?.totalCalories || 0)),
      protein: Math.max(0, targetProtein - (dietLog?.totalProtein || 0)),
      carbs: Math.max(0, targetCarbs - (dietLog?.totalCarbs || 0)),
      fats: Math.max(0, targetFats - (dietLog?.totalFats || 0)),
    };

    if (!geminiClient) {
      return NextResponse.json({
        success: true,
        data: {
          remaining,
          suggestions: buildSmartFallbackSuggestions(remaining),
          source: 'smart-fallback',
        },
      });
    }

    try {
      const model = geminiClient.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.5,
        },
      });

      const prompt = `You are a sports nutritionist. Suggest 4 practical, healthy food/meal items tailored to the user's remaining macros today.
User Goal: ${profile?.fitnessGoal || 'general_fitness'}
Remaining Today:
- Calories: ${remaining.calories} kcal
- Protein: ${remaining.protein} g
- Carbs: ${remaining.carbs} g
- Fats: ${remaining.fats} g

Return ONLY a JSON object with this exact shape:
{
  "suggestions": [
    {
      "name": "Food Name",
      "servingSize": "e.g. 150g or 1 bowl",
      "calories": 320,
      "protein": 30,
      "carbs": 35,
      "fats": 6,
      "mealType": "breakfast" | "lunch" | "dinner" | "snacks",
      "reason": "1 short sentence explaining why this fits their remaining macros."
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      const suggestions: FoodSuggestion[] = Array.isArray(parsed?.suggestions)
        ? parsed.suggestions.slice(0, 4)
        : buildSmartFallbackSuggestions(remaining);

      return NextResponse.json({
        success: true,
        data: {
          remaining,
          suggestions,
          source: 'ai',
        },
      });
    } catch {
      return NextResponse.json({
        success: true,
        data: {
          remaining,
          suggestions: buildSmartFallbackSuggestions(remaining),
          source: 'smart-fallback',
        },
      });
    }
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to generate food suggestions' },
      { status: 500 }
    );
  }
}
