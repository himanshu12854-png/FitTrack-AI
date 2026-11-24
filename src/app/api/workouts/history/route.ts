import { NextResponse } from 'next/server';
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

    await connectDB();

    // 1. Recent completed workout sessions
    const recentSessions = await WorkoutSession.find({
      userId: user.id,
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    // 2. Personal records summary
    const prs = await ExerciseHistory.aggregate([
      { $match: { userId: user.id } },
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
    ]);

    // 3. Exercise specific progression data if requested
    let progressionData: any[] = [];
    if (exercise) {
      progressionData = await ExerciseHistory.find({
        userId: user.id,
        exerciseName: { $regex: new RegExp(`^${exercise}$`, 'i') },
      })
        .sort({ date: 1 })
        .limit(30)
        .lean();
    }

    return NextResponse.json({
      success: true,
      data: {
        recentSessions,
        personalRecords: prs,
        progressionData,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}
