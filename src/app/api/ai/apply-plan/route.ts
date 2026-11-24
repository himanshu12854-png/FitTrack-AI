import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import WorkoutPlan from '@/models/WorkoutPlan';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import { workoutPlanSchema } from '@/lib/validations';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const applyDietSchema = z.object({
  dailyCalorieTarget: z.number().min(800).max(10000),
  proteinTarget: z.number().min(0).max(600),
  carbsTarget: z.number().min(0).max(1000),
  fatsTarget: z.number().min(0).max(500),
});

const applyPlanSchema = z.object({
  applyType: z.enum(['workout', 'diet', 'both']),
  workoutPlan: workoutPlanSchema.optional(),
  dietPlan: applyDietSchema.optional(),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = applyPlanSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const { applyType, workoutPlan, dietPlan } = validated.data;

    await connectDB();

    let updatedWorkout = null;
    let updatedProfile = null;

    // Apply Workout Plan
    if ((applyType === 'workout' || applyType === 'both') && workoutPlan) {
      // Deactivate current active plans
      await WorkoutPlan.updateMany({ userId: user.id, isActive: true }, { $set: { isActive: false } });

      updatedWorkout = await WorkoutPlan.create({
        userId: user.id,
        name: workoutPlan.name,
        description: workoutPlan.description || 'AI Generated Plan',
        days: workoutPlan.days,
        isActive: true,
        createdBy: 'ai',
      });
    }

    // Apply Diet Plan
    if ((applyType === 'diet' || applyType === 'both') && dietPlan) {
      updatedProfile = await UserFitnessProfile.findOneAndUpdate(
        { userId: user.id },
        {
          $set: {
            dailyCalorieTarget: dietPlan.dailyCalorieTarget,
            proteinTarget: dietPlan.proteinTarget,
            carbsTarget: dietPlan.carbsTarget,
            fatsTarget: dietPlan.fatsTarget,
          },
        },
        { new: true, upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Plan successfully applied to your account!',
      data: {
        workoutPlan: updatedWorkout,
        profile: updatedProfile,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to apply plan' }, { status: 500 });
  }
}
