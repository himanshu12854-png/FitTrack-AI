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

    await connectDB();

    const [recentSessions, prs, progressionData] = await Promise.all([
      // 1. Recent completed workout sessions
      WorkoutSession.find({
        userId: user.id,
      })
        .sort({ date: -1 })
        .limit(20)
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
            exerciseName: { $regex: new RegExp(`^${exercise}$`, 'i') },
          })
            .sort({ date: 1 })
            .limit(30)
            .lean()
        : Promise.resolve([]),
    ]);

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
