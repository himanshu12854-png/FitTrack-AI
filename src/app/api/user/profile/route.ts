import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import User from '@/models/User';
import { fitnessProfileSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessionUser = await requireAuth();
    await connectDB();

    const [user, profile] = await Promise.all([
      User.findById(sessionUser.id).select('name email image createdAt'),
      UserFitnessProfile.findOne({ userId: sessionUser.id }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        user,
        profile,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();

    const validated = fitnessProfileSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const profile = await UserFitnessProfile.findOneAndUpdate(
      { userId: sessionUser.id },
      { $set: validated.data },
      { new: true, upsert: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Fitness profile updated successfully',
      data: profile,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 });
  }
}
