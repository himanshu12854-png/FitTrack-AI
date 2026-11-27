import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import WorkoutSession from '@/models/WorkoutSession';
import WorkoutPlan from '@/models/WorkoutPlan';
import ExerciseHistory from '@/models/ExerciseHistory';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import { getTodayDate, getWeekStart, getDayName } from '@/lib/utils';
import { workoutSessionSchema } from '@/lib/validations';
import { calculateWorkoutCaloriesBurned } from '@/lib/nutrition';

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

    const { workoutPlanId, dayName, workoutName, date, exercises, isCompleted, duration, caloriesBurned, notes } = validated.data;
    const sessionDate = new Date(date);
    const weekStart = getWeekStart(sessionDate);

    await connectDB();

    const profile = await UserFitnessProfile.findOne({ userId: user.id }).select('weight').lean();
    const completedSetsCount = exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.isCompleted).length,
      0
    );
    const computedCaloriesBurned =
      typeof caloriesBurned === 'number' && caloriesBurned > 0
        ? Math.round(caloriesBurned)
        : calculateWorkoutCaloriesBurned({
            durationMinutes: duration,
            completedSetsCount,
            weightKg: profile?.weight,
          });

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
      session.caloriesBurned = computedCaloriesBurned;
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
        caloriesBurned: computedCaloriesBurned,
        notes,
      });
    }

    // Rebuild this day's exercise history whenever a session is saved. This
    // removes stale records after the user edits a finished workout, combines
    // duplicate exercise rows, and avoids one database lookup per exercise.
    const startOfSessionDay = new Date(sessionDate);
    startOfSessionDay.setUTCHours(0, 0, 0, 0);
    const endOfSessionDay = new Date(sessionDate);
    endOfSessionDay.setUTCHours(23, 59, 59, 999);

    type ExerciseSummary = {
      exerciseName: string;
      maxWeight: number;
      maxRepsAtBest: number;
      totalSets: number;
      totalVolume: number;
    };
    const summaries = new Map<string, ExerciseSummary>();

    if (isCompleted) {
      for (const exercise of exercises) {
        const completedSets = exercise.sets.filter(
          (set) => set.isCompleted && (set.weight || 0) > 0
        );
        if (completedSets.length === 0) continue;

        const key = exercise.exerciseName.trim().toLocaleLowerCase();
        const summary = summaries.get(key) || {
          exerciseName: exercise.exerciseName.trim(),
          maxWeight: 0,
          maxRepsAtBest: 0,
          totalSets: 0,
          totalVolume: 0,
        };

        for (const set of completedSets) {
          const weight = set.weight || 0;
          const reps = set.actualReps || 0;
          summary.totalSets += 1;
          summary.totalVolume += weight * reps;
          if (weight > summary.maxWeight) {
            summary.maxWeight = weight;
            summary.maxRepsAtBest = reps;
          }
        }
        summaries.set(key, summary);
      }
    }

    const completedExerciseNames = [...summaries.values()].map((summary) => summary.exerciseName);
    const userObjectId = new mongoose.Types.ObjectId(user.id);
    const [, previousBests] = await Promise.all([
      // Always clear the whole day. An incomplete save therefore cannot leave
      // a completed workout's old PR or volume visible in Progress.
      ExerciseHistory.deleteMany({
        userId: user.id,
        date: { $gte: startOfSessionDay, $lte: endOfSessionDay },
      }),
      completedExerciseNames.length > 0
        ? ExerciseHistory.aggregate<{ _id: string; maxWeight: number }>([
            {
              $match: {
                userId: userObjectId,
                exerciseName: { $in: completedExerciseNames },
                date: { $lt: startOfSessionDay },
              },
            },
            { $group: { _id: '$exerciseName', maxWeight: { $max: '$bestWeight' } } },
          ])
        : Promise.resolve([]),
    ]);

    if (summaries.size > 0) {
      const previousBestByExercise = new Map(
        previousBests.map((record) => [record._id.toLocaleLowerCase(), record.maxWeight || 0])
      );

      await ExerciseHistory.insertMany(
        [...summaries.values()].map((summary) => ({
          userId: user.id,
          exerciseName: summary.exerciseName,
          date: sessionDate,
          bestWeight: summary.maxWeight,
          bestReps: summary.maxRepsAtBest,
          totalSets: summary.totalSets,
          totalVolume: summary.totalVolume,
          personalRecord:
            !previousBestByExercise.has(summary.exerciseName.toLocaleLowerCase()) ||
            summary.maxWeight > (previousBestByExercise.get(summary.exerciseName.toLocaleLowerCase()) || 0),
        }))
      );
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
