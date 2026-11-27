import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectDB } from './db';
import User from '@/models/User';
import authConfig from '@/auth.config';
import { verifyPassword } from './password';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const user = await User.findOne({
          email: (credentials.email as string).toLowerCase().trim(),
        })
          // One small, indexed query is all credential login needs before
          // bcrypt verification. Do not hydrate unused account fields.
          .select('_id name email image password')
          .lean();

        if (!user || !user.password) {
          return null;
        }

        const isPasswordMatch = await verifyPassword(
          credentials.password as string,
          user.password
        );

        if (!isPasswordMatch) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  // Required in every environment. Never ship a fallback secret in source.
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
});
