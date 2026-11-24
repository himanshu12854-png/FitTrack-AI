import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import WorkoutPlan from '@/models/WorkoutPlan';
import { workoutPlanSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// GET: Fetch active workout plan
export async function GET() {
  try {
    const user = await requireAuth();
    await connectDB();

    const plan = await WorkoutPlan.findOne({
      userId: user.id,
      isActive: true,
    }).sort({ updatedAt: -1 });

    return NextResponse.json({
      success: true,
      data: plan,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch workout plan' }, { status: 500 });
  }
}

// POST: Create or replace active workout plan
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = workoutPlanSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    // Deactivate existing active plans
    await WorkoutPlan.updateMany(
      { userId: user.id, isActive: true },
      { $set: { isActive: false } }
    );

    const newPlan = await WorkoutPlan.create({
      userId: user.id,
      name: validated.data.name,
      description: validated.data.description,
      days: validated.data.days,
      isActive: true,
      createdBy: validated.data.createdBy || 'user',
    });

    return NextResponse.json({
      success: true,
      message: 'Workout plan saved successfully',
      data: newPlan,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to save workout plan' }, { status: 500 });
  }
}
