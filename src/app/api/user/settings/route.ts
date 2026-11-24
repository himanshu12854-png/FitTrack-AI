import { NextResponse } from 'next/server';
import { requireAuth, hashPassword, verifyPassword } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateSettingsSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  timezone: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).optional(),
});

export async function PUT(req: Request) {
  try {
    const sessionUser = await requireAuth();
    const body = await req.json();

    const validated = updateSettingsSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const { name, timezone, currentPassword, newPassword } = validated.data;

    await connectDB();

    const user = await User.findById(sessionUser.id);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (name) {
      user.name = name.trim();
    }

    // Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ success: false, error: 'Current password is required to change password' }, { status: 400 });
      }
      const isMatch = await verifyPassword(currentPassword, user.password || '');
      if (!isMatch) {
        return NextResponse.json({ success: false, error: 'Current password is incorrect' }, { status: 400 });
      }
      user.password = await hashPassword(newPassword);
    }

    await user.save();

    if (timezone) {
      await UserFitnessProfile.updateOne({ userId: user._id }, { $set: { timezone } });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
  }
}
