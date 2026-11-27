import FoodNutritionCache from '@/models/FoodNutritionCache';
import type { IMicronutrients, NutrientSource } from '@/models/DietLog';
import { geminiClient } from '@/lib/gemini';

export interface NutritionLookupResult {
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
}

const BUILTIN_NUTRITION_DB: Array<
  NutritionLookupResult & { keywords: string[] }
> = [
  {
    displayName: 'Grilled Chicken Breast',
    keywords: ['chicken breast', 'grilled chicken', 'chicken'],
    servingSize: '100g',
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    micronutrients: {
      fiber_g: 0,
      iron_mg: 1.04,
      calcium_mg: 15,
      vitaminC_mg: 0,
      vitaminD_mcg: 0.1,
      vitaminB12_mcg: 0.34,
      potassium_mg: 256,
      sodium_mg: 74,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Whole Egg (Large)',
    keywords: ['egg', 'eggs', 'boiled egg', 'scrambled egg'],
    servingSize: '1 large (50g)',
    calories: 72,
    protein: 6.3,
    carbs: 0.4,
    fats: 4.8,
    micronutrients: {
      fiber_g: 0,
      iron_mg: 0.88,
      calcium_mg: 28,
      vitaminC_mg: 0,
      vitaminD_mcg: 1.0,
      vitaminB12_mcg: 0.45,
      potassium_mg: 69,
      sodium_mg: 71,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Rolled Oats (Dry)',
    keywords: ['oatmeal', 'oats', 'rolled oats'],
    servingSize: '1/2 cup (40g)',
    calories: 150,
    protein: 5.3,
    carbs: 27,
    fats: 2.7,
    micronutrients: {
      fiber_g: 4.0,
      iron_mg: 1.7,
      calcium_mg: 21,
      vitaminC_mg: 0,
      vitaminD_mcg: 0,
      vitaminB12_mcg: 0,
      potassium_mg: 147,
      sodium_mg: 2,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Greek Yogurt (Plain, Nonfat)',
    keywords: ['greek yogurt', 'yogurt'],
    servingSize: '170g',
    calories: 100,
    protein: 17,
    carbs: 6,
    fats: 0.7,
    micronutrients: {
      fiber_g: 0,
      iron_mg: 0.1,
      calcium_mg: 187,
      vitaminC_mg: 0,
      vitaminD_mcg: 0,
      vitaminB12_mcg: 1.3,
      potassium_mg: 240,
      sodium_mg: 61,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Atlantic Salmon (Cooked)',
    keywords: ['salmon', 'baked salmon', 'grilled salmon'],
    servingSize: '100g',
    calories: 206,
    protein: 22,
    carbs: 0,
    fats: 12.4,
    micronutrients: {
      fiber_g: 0,
      iron_mg: 0.34,
      calcium_mg: 9,
      vitaminC_mg: 0,
      vitaminD_mcg: 13.1,
      vitaminB12_mcg: 2.8,
      potassium_mg: 384,
      sodium_mg: 59,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Banana (Medium)',
    keywords: ['banana'],
    servingSize: '1 medium (118g)',
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fats: 0.4,
    micronutrients: {
      fiber_g: 3.1,
      iron_mg: 0.31,
      calcium_mg: 6,
      vitaminC_mg: 10.3,
      vitaminD_mcg: 0,
      vitaminB12_mcg: 0,
      potassium_mg: 422,
      sodium_mg: 1,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Spinach (Raw)',
    keywords: ['spinach'],
    servingSize: '100g',
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fats: 0.4,
    micronutrients: {
      fiber_g: 2.2,
      iron_mg: 2.71,
      calcium_mg: 99,
      vitaminC_mg: 28.1,
      vitaminD_mcg: 0,
      vitaminB12_mcg: 0,
      potassium_mg: 558,
      sodium_mg: 79,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Brown Rice (Cooked)',
    keywords: ['brown rice', 'rice', 'jasmine rice', 'white rice'],
    servingSize: '1 cup (195g)',
    calories: 218,
    protein: 4.5,
    carbs: 45.8,
    fats: 1.6,
    micronutrients: {
      fiber_g: 3.5,
      iron_mg: 1.0,
      calcium_mg: 20,
      vitaminC_mg: 0,
      vitaminD_mcg: 0,
      vitaminB12_mcg: 0,
      potassium_mg: 154,
      sodium_mg: 2,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Broccoli (Steamed)',
    keywords: ['broccoli'],
    servingSize: '100g',
    calories: 35,
    protein: 2.4,
    carbs: 7.2,
    fats: 0.4,
    micronutrients: {
      fiber_g: 3.3,
      iron_mg: 0.67,
      calcium_mg: 40,
      vitaminC_mg: 64.9,
      vitaminD_mcg: 0,
      vitaminB12_mcg: 0,
      potassium_mg: 293,
      sodium_mg: 41,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Almonds',
    keywords: ['almonds', 'almond'],
    servingSize: '28g (1 oz)',
    calories: 164,
    protein: 6.0,
    carbs: 6.1,
    fats: 14.2,
    micronutrients: {
      fiber_g: 3.5,
      iron_mg: 1.05,
      calcium_mg: 76,
      vitaminC_mg: 0,
      vitaminD_mcg: 0,
      vitaminB12_mcg: 0,
      potassium_mg: 208,
      sodium_mg: 0,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Sweet Potato (Baked)',
    keywords: ['sweet potato', 'potato'],
    servingSize: '150g',
    calories: 135,
    protein: 3.0,
    carbs: 31.1,
    fats: 0.2,
    micronutrients: {
      fiber_g: 4.9,
      iron_mg: 1.04,
      calcium_mg: 57,
      vitaminC_mg: 29.4,
      vitaminD_mcg: 0,
      vitaminB12_mcg: 0,
      potassium_mg: 713,
      sodium_mg: 54,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
  {
    displayName: 'Milk (Low-Fat 1%)',
    keywords: ['milk', 'skim milk'],
    servingSize: '1 cup (244g)',
    calories: 102,
    protein: 8.2,
    carbs: 12.2,
    fats: 2.4,
    micronutrients: {
      fiber_g: 0,
      iron_mg: 0.07,
      calcium_mg: 305,
      vitaminC_mg: 0,
      vitaminD_mcg: 2.9,
      vitaminB12_mcg: 1.1,
      potassium_mg: 366,
      sodium_mg: 107,
    },
    source: 'Built-in Nutrition DB',
    isEstimate: false,
  },
];

function matchBuiltinFood(normalized: string): NutritionLookupResult | null {
  for (const item of BUILTIN_NUTRITION_DB) {
    if (
      item.keywords.some((kw) => normalized.includes(kw) || kw.includes(normalized))
    ) {
      return {
        displayName: item.displayName,
        servingSize: item.servingSize,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        micronutrients: item.micronutrients,
        source: item.source,
        isEstimate: false,
      };
    }
  }
  return null;
}

async function fetchFromUsdaFdc(query: string): Promise<NutritionLookupResult | null> {
  const usdaKey = process.env.USDA_API_KEY;
  if (!usdaKey) return null;

  try {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(
      usdaKey
    )}&query=${encodeURIComponent(query)}&pageSize=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return null;
    const json = await res.json();
    const food = json?.foods?.[0];
    if (!food || !Array.isArray(food.foodNutrients)) return null;

    const getNutrient = (id: number) => {
      const n = food.foodNutrients.find((x: any) => x.nutrientId === id);
      return typeof n?.value === 'number' && n.value > 0 ? Math.round(n.value * 100) / 100 : 0;
    };

    return {
      displayName: food.description || query,
      servingSize: food.servingSize
        ? `${food.servingSize}${food.servingSizeUnit || 'g'}`
        : '100g',
      calories: Math.round(getNutrient(1008)),
      protein: Math.round(getNutrient(1003)),
      carbs: Math.round(getNutrient(1005)),
      fats: Math.round(getNutrient(1004)),
      micronutrients: {
        fiber_g: getNutrient(1079),
        iron_mg: getNutrient(1089),
        calcium_mg: getNutrient(1087),
        vitaminC_mg: getNutrient(1162),
        vitaminD_mcg: getNutrient(1114),
        vitaminB12_mcg: getNutrient(1178),
        potassium_mg: getNutrient(1092),
        sodium_mg: getNutrient(1093),
      },
      source: 'USDA FoodData Central',
      fdcId: food.fdcId,
      isEstimate: false,
    };
  } catch {
    return null;
  }
}

async function estimateWithAi(query: string): Promise<NutritionLookupResult | null> {
  if (!geminiClient) return null;
  try {
    const model = geminiClient.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });
    const prompt = `Provide an approximate nutrition and micronutrient estimate for 1 standard serving of "${query}".
Return ONLY valid JSON:
{
  "displayName": "string",
  "servingSize": "string",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number,
  "micronutrients": {
    "fiber_g": number,
    "iron_mg": number,
    "calcium_mg": number,
    "vitaminC_mg": number,
    "vitaminD_mcg": number,
    "vitaminB12_mcg": number,
    "potassium_mg": number,
    "sodium_mg": number
  }
}`;
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(result.response.text());
    if (typeof parsed?.calories !== 'number') return null;
    return {
      displayName: String(parsed.displayName || query),
      servingSize: String(parsed.servingSize || '1 serving'),
      calories: Math.max(0, Math.round(parsed.calories)),
      protein: Math.max(0, Math.round(parsed.protein || 0)),
      carbs: Math.max(0, Math.round(parsed.carbs || 0)),
      fats: Math.max(0, Math.round(parsed.fats || 0)),
      micronutrients: parsed.micronutrients || {},
      source: 'AI Estimate',
      isEstimate: true,
    };
  } catch {
    return null;
  }
}

export async function lookupFoodNutrition(
  query: string,
  options: { allowAiEstimate?: boolean } = {}
): Promise<NutritionLookupResult | null> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return null;

  // 1. Check MongoDB cache
  const cached = await FoodNutritionCache.findOne({ normalizedName: normalized }).lean();
  if (cached) {
    return {
      displayName: cached.displayName,
      servingSize: cached.servingSize,
      calories: cached.calories,
      protein: cached.protein,
      carbs: cached.carbs,
      fats: cached.fats,
      micronutrients: cached.micronutrients || {},
      source: cached.source,
      fdcId: cached.fdcId,
      isEstimate: cached.isEstimate,
    };
  }

  // 2. Try USDA FoodData Central (when USDA_API_KEY env var is set), then built-in structured DB
  let match = await fetchFromUsdaFdc(normalized);
  if (!match) {
    match = matchBuiltinFood(normalized);
  }

  // 3. Optional AI fallback ONLY when explicitly requested, never overwriting DB values
  if (!match && options.allowAiEstimate) {
    match = await estimateWithAi(query.trim());
  }

  if (!match) return null;

  // Cache non-null match
  await FoodNutritionCache.findOneAndUpdate(
    { normalizedName: normalized },
    {
      $set: {
        normalizedName: normalized,
        ...match,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    },
    { upsert: true }
  ).catch(() => {});

  return match;
}
