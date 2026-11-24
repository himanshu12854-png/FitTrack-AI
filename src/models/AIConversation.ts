import mongoose, { Schema, Document, Model } from 'mongoose';

export type MessageRole = 'user' | 'assistant';

export interface IMessage {
  _id?: mongoose.Types.ObjectId;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface IAIConversation extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IMessage[];
  context: {
    includesDietData?: boolean;
    includesWorkoutData?: boolean;
    includesProfileData?: boolean;
  };
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { _id: true }
);

const AIConversationSchema = new Schema<IAIConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      default: 'New Conversation',
    },
    messages: [MessageSchema],
    context: {
      includesDietData: {
        type: Boolean,
      },
      includesWorkoutData: {
        type: Boolean,
      },
      includesProfileData: {
        type: Boolean,
      },
    },
    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

AIConversationSchema.index({ userId: 1, updatedAt: -1 });

const AIConversation: Model<IAIConversation> =
  mongoose.models.AIConversation ||
  mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);

export default AIConversation;
