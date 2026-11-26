import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import DietLog from '@/models/DietLog';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import { getTodayDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);

    await connectDB();

    const dateParam = searchParams.get('date');

    let profile;
    let dietLog;
    let date: string;

    if (dateParam) {
      date = dateParam;
      [profile, dietLog] = await Promise.all([
        UserFitnessProfile.findOne({ userId: user.id })
          .select('timezone dailyCalorieTarget proteinTarget carbsTarget fatsTarget')
          .lean(),
        DietLog.findOne({ userId: user.id, date }).lean(),
      ]);
    } else {
      profile = await UserFitnessProfile.findOne({ userId: user.id })
        .select('timezone dailyCalorieTarget proteinTarget carbsTarget fatsTarget')
        .lean();
      const timezone = profile?.timezone || 'UTC';
      date = getTodayDate(timezone);
      dietLog = await DietLog.findOne({ userId: user.id, date }).lean();
    }

    if (!dietLog) {
      dietLog = {
        date,
        meals: {
          breakfast: [],
          lunch: [],
          dinner: [],
          snacks: [],
        },
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
      };
    }

    return NextResponse.json({
      success: true,
      data: {
        dietLog,
        targets: {
          calories: profile?.dailyCalorieTarget || 2000,
          protein: profile?.proteinTarget || 150,
          carbs: profile?.carbsTarget || 250,
          fats: profile?.fatsTarget || 65,
        },
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch diet log' }, { status: 500 });
  }
}
