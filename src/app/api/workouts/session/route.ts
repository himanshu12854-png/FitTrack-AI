import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import WorkoutSession from '@/models/WorkoutSession';
import WorkoutPlan from '@/models/WorkoutPlan';
import ExerciseHistory from '@/models/ExerciseHistory';
import { getTodayDate, getWeekStart, getDayName } from '@/lib/utils';
import { workoutSessionSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

// GET: Fetch today's workout session or prepare one from active split
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date') || getTodayDate();
    const weekStart = getWeekStart(dateStr);
    const targetDate = new Date(dateStr);
    const dayOfWeek = getDayName(targetDate);

    await connectDB();

    // Look for existing session recorded on this date
    const startOfDay = new Date(dateStr);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setUTCHours(23, 59, 59, 999);

    let session = await WorkoutSession.findOne({
      userId: user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!session) {
      // Find active plan to prepopulate
      const activePlan = await WorkoutPlan.findOne({ userId: user.id, isActive: true });
      if (activePlan) {
        const scheduledDay = activePlan.days.find(
          (d: any) => d.dayName.toLowerCase() === dayOfWeek.toLowerCase()
        );

        if (scheduledDay && !scheduledDay.isRestDay) {
          const exercises = scheduledDay.exercises.map((ex: any) => ({
            exerciseName: ex.name,
            muscleGroup: ex.muscleGroup,
            isCompleted: false,
            sets: Array.from({ length: ex.sets || 3 }).map((_, i) => ({
              setNumber: i + 1,
              targetReps: ex.reps || '8-12',
              actualReps: undefined,
              weight: undefined,
              isCompleted: false,
            })),
          }));

          session = await WorkoutSession.create({
            userId: user.id,
            workoutPlanId: activePlan._id,
            dayName: scheduledDay.dayName,
            workoutName: scheduledDay.name,
            date: targetDate,
            weekStart,
            exercises,
            isCompleted: false,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: session,
      dayOfWeek,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch session' }, { status: 500 });
  }
}

// POST: Save/complete workout session and update personal records
export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = workoutSessionSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const { workoutPlanId, dayName, workoutName, date, exercises, isCompleted, duration, notes } = validated.data;
    const sessionDate = new Date(date);
    const weekStart = getWeekStart(sessionDate);

    await connectDB();

    const startOfDay = new Date(sessionDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(sessionDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    let session = await WorkoutSession.findOne({
      userId: user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (session) {
      session.exercises = exercises as any;
      session.isCompleted = isCompleted;
      session.duration = duration;
      session.notes = notes;
      session.workoutName = workoutName;
      session.dayName = dayName;
      await session.save();
    } else {
      session = await WorkoutSession.create({
        userId: user.id,
        workoutPlanId,
        dayName,
        workoutName,
        date: sessionDate,
        weekStart,
        exercises,
        isCompleted,
        duration,
        notes,
      });
    }

    // Record progression only when the workout is completed. Replacing same-day
    // entries prevents repeated saves from inflating volume and PR history.
    if (isCompleted) {
      for (const ex of exercises) {
        const completedSets = ex.sets.filter((s) => s.isCompleted && (s.weight || 0) > 0);
        if (completedSets.length > 0) {
          let maxWeight = 0;
          let maxRepsAtBest = 0;
          let volume = 0;

          for (const set of completedSets) {
            const weight = set.weight || 0;
            const reps = set.actualReps || 0;
            volume += weight * reps;
            if (weight > maxWeight) {
              maxWeight = weight;
              maxRepsAtBest = reps;
            }
          }

          const startOfSessionDay = new Date(sessionDate);
          startOfSessionDay.setUTCHours(0, 0, 0, 0);
          const endOfSessionDay = new Date(sessionDate);
          endOfSessionDay.setUTCHours(23, 59, 59, 999);

          await ExerciseHistory.deleteMany({
            userId: user.id,
            exerciseName: ex.exerciseName,
            date: { $gte: startOfSessionDay, $lte: endOfSessionDay },
          });

          const previousBest = await ExerciseHistory.findOne({
            userId: user.id,
            exerciseName: ex.exerciseName,
          }).sort({ bestWeight: -1 });

          const isPR = !previousBest || maxWeight > (previousBest.bestWeight || 0);

          await ExerciseHistory.create({
            userId: user.id,
            exerciseName: ex.exerciseName,
            date: sessionDate,
            bestWeight: maxWeight,
            bestReps: maxRepsAtBest,
            totalSets: completedSets.length,
            totalVolume: volume,
            personalRecord: isPR,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Workout session saved successfully',
      data: session,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to save workout session' }, { status: 500 });
  }
}
