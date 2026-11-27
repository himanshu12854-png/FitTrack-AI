import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import WorkoutSession from '@/models/WorkoutSession';
import ExerciseHistory from '@/models/ExerciseHistory';
import { generateExerciseRoadmap } from '@/lib/gemini';
import type { IUserFitnessProfile } from '@/types';

export const dynamic = 'force-dynamic';

const roadmapRequestSchema = z.object({
  goal: z.string().trim().min(5, 'Describe your goal in at least 5 characters').max(800),
  weeks: z.number().int().min(4).max(24).optional().default(12),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = roadmapRequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    // Strictly scope all queries to the authenticated user's ID
    const [profile, recentSessions, prs] = await Promise.all([
      UserFitnessProfile.findOne({ userId: user.id }).lean(),
      WorkoutSession.find({ userId: user.id, isCompleted: true })
        .select('workoutName date exercises.exerciseName')
        .sort({ date: -1 })
        .limit(5)
        .lean(),
      ExerciseHistory.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(user.id) } },
        { $sort: { bestWeight: -1 } },
        {
          $group: {
            _id: '$exerciseName',
            maxWeight: { $max: '$bestWeight' },
            bestReps: { $first: '$bestReps' },
          },
        },
        { $sort: { maxWeight: -1 } },
        { $limit: 8 },
      ]),
    ]);

    const roadmap = await generateExerciseRoadmap({
      goalPrompt: validated.data.goal,
      weeks: validated.data.weeks,
      profile: profile as unknown as IUserFitnessProfile | null,
      recentWorkouts: recentSessions.map((s: any) => ({
        workoutName: s.workoutName,
        date: new Date(s.date).toISOString().split('T')[0],
        exercises: (s.exercises || []).map((e: any) => e.exerciseName),
      })),
      personalRecords: prs.map((p: any) => ({
        exerciseName: p._id,
        maxWeight: p.maxWeight || 0,
        bestReps: p.bestReps,
      })),
    });

    return NextResponse.json({
      success: true,
      data: roadmap,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to generate exercise roadmap right now.',
      },
      { status: 500 }
    );
  }
}
