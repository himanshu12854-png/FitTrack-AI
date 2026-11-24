import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import { generateAIStructuredPlan } from '@/lib/gemini';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const planPromptSchema = z.object({
  prompt: z.string().min(5, 'Goal description must be at least 5 characters').max(1000),
});

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = planPromptSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    await connectDB();

    const profile = await UserFitnessProfile.findOne({ userId: user.id }).lean();

    const generatedPlan = await generateAIStructuredPlan(validated.data.prompt, profile as any);

    return NextResponse.json({
      success: true,
      data: generatedPlan,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate plan' },
      { status: 500 }
    );
  }
}
