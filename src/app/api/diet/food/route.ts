import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import DietLog from '@/models/DietLog';
import { foodEntrySchema } from '@/lib/validations';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function recalculateTotals(dietLog: any) {
  let calories = 0, protein = 0, carbs = 0, fats = 0;
  const meals = ['breakfast', 'lunch', 'dinner', 'snacks'];
  for (const meal of meals) {
    for (const item of (dietLog.meals[meal] || [])) {
      const qty = item.servingQuantity || 1;
      calories += (item.calories || 0) * qty;
      protein += (item.protein || 0) * qty;
      carbs += (item.carbs || 0) * qty;
      fats += (item.fats || 0) * qty;
    }
  }
  dietLog.totalCalories = Math.round(calories);
  dietLog.totalProtein = Math.round(protein);
  dietLog.totalCarbs = Math.round(carbs);
  dietLog.totalFats = Math.round(fats);
}

// POST: Add new food item
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = foodEntrySchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const { date, mealType, name, calories, protein, carbs, fats, servingSize, servingQuantity } = validated.data;

    await connectDB();

    let dietLog = await DietLog.findOne({ userId: user.id, date });

    if (!dietLog) {
      dietLog = new DietLog({
        userId: user.id,
        date,
        meals: { breakfast: [], lunch: [], dinner: [], snacks: [] },
      });
    }

    const newFoodEntry = {
      name,
      calories,
      protein,
      carbs,
      fats,
      servingSize: servingSize || '1 serving',
      servingQuantity: servingQuantity || 1,
    };

    dietLog.meals[mealType].push(newFoodEntry);
    recalculateTotals(dietLog);

    await dietLog.save();

    return NextResponse.json({
      success: true,
      message: 'Food item added successfully',
      data: dietLog,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to add food item' }, { status: 500 });
  }
}

const editFoodSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
  entryId: z.string(),
  name: z.string().min(1),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fats: z.number().min(0),
  servingSize: z.string().optional(),
  servingQuantity: z.number().min(0.1),
});

// PUT: Update an existing food item
export async function PUT(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = editFoodSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const { date, mealType, entryId, name, calories, protein, carbs, fats, servingSize, servingQuantity } = validated.data;

    await connectDB();

    const dietLog = await DietLog.findOne({ userId: user.id, date });
    if (!dietLog) {
      return NextResponse.json({ success: false, error: 'Diet log not found' }, { status: 404 });
    }

    const mealArray = dietLog.meals[mealType] as any;
    const foodItem = mealArray.id ? mealArray.id(entryId) : mealArray.find((item: any) => item._id?.toString() === entryId);

    if (!foodItem) {
      return NextResponse.json({ success: false, error: 'Food entry not found' }, { status: 404 });
    }

    foodItem.name = name;
    foodItem.calories = calories;
    foodItem.protein = protein;
    foodItem.carbs = carbs;
    foodItem.fats = fats;
    foodItem.servingSize = servingSize || foodItem.servingSize;
    foodItem.servingQuantity = servingQuantity;

    recalculateTotals(dietLog);
    await dietLog.save();

    return NextResponse.json({
      success: true,
      message: 'Food entry updated',
      data: dietLog,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update food entry' }, { status: 500 });
  }
}

// DELETE: Remove a food item
export async function DELETE(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    const date = searchParams.get('date');
    const mealType = searchParams.get('mealType') as 'breakfast' | 'lunch' | 'dinner' | 'snacks';
    const entryId = searchParams.get('entryId');

    if (!date || !mealType || !entryId) {
      return NextResponse.json({ success: false, error: 'Missing date, mealType, or entryId' }, { status: 400 });
    }

    await connectDB();

    const dietLog = await DietLog.findOne({ userId: user.id, date });
    if (!dietLog) {
      return NextResponse.json({ success: false, error: 'Diet log not found' }, { status: 404 });
    }

    const mealList = dietLog.meals[mealType] as any;
    if (typeof mealList.pull === 'function') {
      mealList.pull({ _id: entryId });
    } else {
      dietLog.meals[mealType] = mealList.filter((item: any) => item._id?.toString() !== entryId);
    }
    recalculateTotals(dietLog);

    await dietLog.save();

    return NextResponse.json({
      success: true,
      message: 'Food item deleted',
      data: dietLog,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to delete food entry' }, { status: 500 });
  }
}
