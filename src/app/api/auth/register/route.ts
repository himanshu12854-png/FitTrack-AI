import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import { hashPassword } from '@/lib/password';
import { registerSchema } from '@/lib/validations';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validatedData.data;

    await connectDB();

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Initialize default fitness profile
    await UserFitnessProfile.create({
      userId: newUser._id,
      dailyCalorieTarget: 2000,
      proteinTarget: 150,
      carbsTarget: 250,
      fatsTarget: 65,
      fitnessGoal: 'build_muscle',
      activityLevel: 'moderate',
      timezone: 'UTC',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully',
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof Error &&
      /Mongo|database|server selection|connection/i.test(error.message)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection is unavailable. Please try again shortly.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
