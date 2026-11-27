import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { connectDB } from '@/lib/db';
import AIConversation from '@/models/AIConversation';
import UserFitnessProfile from '@/models/UserFitnessProfile';
import DietLog from '@/models/DietLog';
import WorkoutPlan from '@/models/WorkoutPlan';
import { chatWithFitnessAssistant, FitnessContext, getGeminiErrorMessage } from '@/lib/gemini';
import { aiChatMessageSchema } from '@/lib/validations';
import { getTodayDate } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const CHAT_RETENTION_MS = 6 * 60 * 60 * 1000;

async function removeExpiredChats(userId: string | undefined) {
  if (!userId) return;

  const cutoff = new Date(Date.now() - CHAT_RETENTION_MS);
  await AIConversation.deleteMany({
    userId,
    $or: [
      { lastMessageAt: { $lt: cutoff } },
      // Covers chats created before lastMessageAt existed in the schema.
      { lastMessageAt: { $exists: false }, updatedAt: { $lt: cutoff } },
    ],
  });
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const body = await req.json();

    const validated = aiChatMessageSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json({ success: false, error: validated.error.issues[0].message }, { status: 400 });
    }

    const { conversationId, message, includeContext } = validated.data;

    await connectDB();
    await removeExpiredChats(user.id);

    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findOne({ _id: conversationId, userId: user.id });
    }

    if (!conversation) {
      conversation = new AIConversation({
        userId: user.id,
        title: message.slice(0, 35) + '...',
        messages: [],
      });
    }

    // Retrieve context if requested
    const context: FitnessContext = {};
    if (includeContext) {
      const [profile, dietLog, workoutPlan] = await Promise.all([
        UserFitnessProfile.findOne({ userId: user.id }).lean(),
        DietLog.findOne({ userId: user.id, date: getTodayDate() }).lean(),
        WorkoutPlan.findOne({ userId: user.id, isActive: true }).lean(),
      ]);
      context.profile = profile as any;
      context.recentDiet = dietLog as any;
      context.currentWorkoutPlan = workoutPlan as any;
    }

    // Append user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Pass conversation history
    const history = conversation.messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content as string,
    }));

    // Call Gemini
    const aiResponseText = await chatWithFitnessAssistant(history, context);

    // Save assistant response
    conversation.messages.push({
      role: 'assistant',
      content: aiResponseText,
      timestamp: new Date(),
    });
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return NextResponse.json({
      success: true,
      data: {
        conversationId: conversation._id,
        message: aiResponseText,
        history: conversation.messages,
      },
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: getGeminiErrorMessage(error) }, { status: 503 });
  }
}

// GET: Fetch conversations list or single conversation history
export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get('id');

    await connectDB();
    await removeExpiredChats(user.id);

    if (conversationId) {
      const conv = await AIConversation.findOne({ _id: conversationId, userId: user.id });
      return NextResponse.json({ success: true, data: conv });
    }

    const conversations = await AIConversation.find({ userId: user.id })
      .select('title lastMessageAt createdAt')
      .sort({ lastMessageAt: -1 })
      .limit(10);

    return NextResponse.json({ success: true, data: conversations });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: 'Failed to fetch conversations' }, { status: 500 });
  }
}
