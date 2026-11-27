import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import WorkoutSession from '@/models/WorkoutSession';
import ExerciseHistory from '@/models/ExerciseHistory';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const exercise = searchParams.get('exercise');
    const limit = Math.min(30, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const skip = (page - 1) * limit;

    await connectDB();

    const [recentSessionsRaw, prs, progressionData] = await Promise.all([
      // 1. Recent completed workout sessions (paginated + projected)
      WorkoutSession.find({
        userId: user.id,
        isCompleted: true,
      })
        .select('workoutName dayName date duration caloriesBurned isCompleted exercises.exerciseName')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit + 1)
        .lean(),

      // 2. Personal records summary
      ExerciseHistory.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(user.id) } },
        { $sort: { bestWeight: -1 } },
        {
          $group: {
            _id: '$exerciseName',
            maxWeight: { $max: '$bestWeight' },
            date: { $first: '$date' },
            bestReps: { $first: '$bestReps' },
          },
        },
        { $sort: { maxWeight: -1 } },
        { $limit: 10 },
      ]),

      // 3. Exercise specific progression data if requested
      exercise
        ? ExerciseHistory.find({
            userId: user.id,
            exerciseName: { $regex: new RegExp(`^${exercise.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
          })
            .select('date bestWeight totalVolume')
            .sort({ date: 1 })
            .limit(30)
            .lean()
        : Promise.resolve([]),
    ]);

    const hasMore = recentSessionsRaw.length > limit;
    const recentSessions = hasMore ? recentSessionsRaw.slice(0, limit) : recentSessionsRaw;

    return NextResponse.json({
      success: true,
      data: {
        recentSessions,
        personalRecords: prs,
        progressionData,
        pagination: {
          page,
          limit,
          hasMore,
        },
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}
