import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import DietLog from '@/models/DietLog';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    await connectDB();

    const dietLogs = await DietLog.find({ userId: user.id })
      .sort({ date: -1 })
      .limit(days)
      .lean();

    return NextResponse.json({
      success: true,
      data: dietLogs.reverse(), // ascending chronological order
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch history' }, { status: 500 });
  }
}
