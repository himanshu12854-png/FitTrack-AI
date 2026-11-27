import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import DietLog from '@/models/DietLog';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(30, Math.max(1, parseInt(searchParams.get('limit') || searchParams.get('days') || '7', 10) || 7));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const cursor = searchParams.get('cursor');

    await connectDB();

    const query: Record<string, unknown> = { userId: user.id };
    if (cursor && /^\d{4}-\d{2}-\d{2}$/.test(cursor)) {
      query.date = { $lt: cursor };
    }

    const skip = cursor ? 0 : (page - 1) * limit;

    const dietLogs = await DietLog.find(query)
      .select('date totalCalories totalProtein totalCarbs totalFats')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit + 1)
      .lean();

    const hasMore = dietLogs.length > limit;
    const sliced = hasMore ? dietLogs.slice(0, limit) : dietLogs;
    const nextCursor = hasMore && sliced.length > 0 ? sliced[sliced.length - 1].date : null;

    return NextResponse.json({
      success: true,
      data: sliced.reverse(), // ascending chronological order
      pagination: {
        page,
        limit,
        hasMore,
        nextCursor,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}
