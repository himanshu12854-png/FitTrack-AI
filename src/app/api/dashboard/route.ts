import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import DietLog from '@/models/DietLog';
import WorkoutPlan from '@/models/WorkoutPlan';
import WorkoutSession from '@/models/WorkoutSession';
import { getTodayDate, getWeekStart, getDayName } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessionUser = await requireAuth();
    await connectDB();

    const [user, profile, activePlan, recentDietHistory, recentSessions] = await Promise.all([
      User.findById(sessionUser.id).select('name email image').lean(),
      UserFitnessProfile.findOne({ userId: sessionUser.id })
        .select('timezone dailyCalorieTarget proteinTarget carbsTarget fatsTarget fitnessGoal isOnboarded age height weight')
        .lean(),
      WorkoutPlan.findOne({ userId: sessionUser.id, isActive: true })
        .select('name days')
        .lean(),
      DietLog.find({ userId: sessionUser.id })
        .select('date totalCalories totalProtein totalCarbs totalFats')
        .sort({ date: -1 })
        .limit(7)
        .lean(),
      WorkoutSession.find({ userId: sessionUser.id, isCompleted: true })
        .select('workoutName date exercises')
        .sort({ date: -1 })
        .limit(3)
        .lean(),
    ]);

    const timezone = profile?.timezone || 'UTC';
    const todayStr = getTodayDate(timezone);
    const todayDate = new Date();
    const dayOfWeek = getDayName(todayDate);
    const weekStart = getWeekStart(todayDate);

    const startOfDay = new Date(todayStr);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(todayStr);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const [todaySession, weeklyCompletedCount] = await Promise.all([
      WorkoutSession.findOne({
        userId: sessionUser.id,
        date: { $gte: startOfDay, $lte: endOfDay },
      })
        .select('workoutName isCompleted')
        .lean(),
      WorkoutSession.countDocuments({
        userId: sessionUser.id,
        weekStart,
        isCompleted: true,
      }),
    ]);

    const rawDiet = recentDietHistory.find((d: any) => d.date === todayStr);
    const todayDiet = rawDiet || {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFats: 0,
    };

    // Check scheduled workout in active plan for today
    let todayScheduledWorkout = null;
    if (activePlan) {
      const scheduledDay = activePlan.days.find(
        (d: any) => d.dayName.toLowerCase() === dayOfWeek.toLowerCase()
      );
      if (scheduledDay) {
        todayScheduledWorkout = scheduledDay;
      }
    }

    // Target workouts per week
    const weeklyTargetCount = activePlan
      ? activePlan.days.filter((d: any) => !d.isRestDay).length
      : 4;

    // Derive recent foods from recentDietHistory instead of an extra DB query
    const recentFoods = recentDietHistory.filter((d: any) => d.totalCalories > 0).slice(0, 3);

    const recentActivity: Array<{
      id: string;
      type: 'diet' | 'workout';
      title: string;
      subtitle: string;
      date: string;
    }> = [];

    recentSessions.forEach((s: any) => {
      recentActivity.push({
        id: s._id.toString(),
        type: 'workout',
        title: `Completed ${s.workoutName}`,
        subtitle: `${s.exercises?.length || 0} exercises completed`,
        date: new Date(s.date).toISOString().split('T')[0],
      });
    });

    recentFoods.forEach((d: any) => {
      recentActivity.push({
        id: d._id.toString(),
        type: 'diet',
        title: `Logged ${d.totalCalories} kcal`,
        subtitle: `P: ${d.totalProtein}g | C: ${d.totalCarbs}g | F: ${d.totalFats}g`,
        date: d.date,
      });
    });

    recentActivity.sort((a, b) => (b.date > a.date ? 1 : -1));

    const calorieTarget = profile?.dailyCalorieTarget || 2000;
    const consumedCalories = todayDiet.totalCalories || 0;
    const remainingCalories = Math.max(0, calorieTarget - consumedCalories);
    const isOnboarded =
      profile?.isOnboarded === true ||
      (profile?.isOnboarded !== false &&
        Boolean(profile?.age && profile?.height && profile?.weight));

    return NextResponse.json({
      success: true,
      data: {
        user: {
          name: user?.name || 'Athlete',
          email: user?.email || '',
        },
        isOnboarded,
        fitnessGoal: profile?.fitnessGoal || 'build_muscle',
        calories: {
          consumed: consumedCalories,
          target: calorieTarget,
          remaining: remainingCalories,
        },
        macros: {
          protein: {
            consumed: todayDiet.totalProtein || 0,
            target: profile?.proteinTarget || 150,
          },
          carbs: {
            consumed: todayDiet.totalCarbs || 0,
            target: profile?.carbsTarget || 250,
          },
          fats: {
            consumed: todayDiet.totalFats || 0,
            target: profile?.fatsTarget || 65,
          },
        },
        workout: {
          todayWorkout: todaySession?.workoutName || todayScheduledWorkout?.name || (todayScheduledWorkout?.isRestDay ? 'Rest Day' : 'No Scheduled Routine'),
          isRestDay: todayScheduledWorkout?.isRestDay || false,
          isCompleted: todaySession?.isCompleted || false,
          dayOfWeek,
          weeklyCompleted: weeklyCompletedCount,
          weeklyTarget: weeklyTargetCount,
          activePlanName: activePlan?.name || null,
        },
        recentDietHistory: recentDietHistory.reverse(),
        recentActivity: recentActivity.slice(0, 5),
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to load dashboard data' }, { status: 500 });
  }
}
