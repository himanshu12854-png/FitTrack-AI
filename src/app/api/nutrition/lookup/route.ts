import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import { lookupFoodNutrition } from '@/lib/micronutrients';

export const dynamic = 'force-dynamic';

const querySchema = z.object({
  q: z.string().trim().min(2, 'Enter at least 2 characters').max(100),
  aiEstimate: z.enum(['true', 'false']).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(req.url);

    const validated = querySchema.safeParse({
      q: searchParams.get('q') || '',
      aiEstimate: searchParams.get('aiEstimate') || 'false',
    });

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await lookupFoodNutrition(validated.data.q, {
      allowAiEstimate: validated.data.aiEstimate === 'true',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(
      { success: false, error: 'Failed to look up food nutrition' },
      { status: 500 }
    );
  }
}
