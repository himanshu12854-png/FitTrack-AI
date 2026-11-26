import type { NextAuthConfig } from 'next-auth';

// This configuration is safe to use in Next.js Proxy because it does not
// import database or password-hashing code.
const authConfig = {
  providers: [],
  // Netlify forwards requests through its own host/proxy layer. Explicitly
  // trust that host so Auth.js can serve sign-in and session endpoints.
  trustHost: true,
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

export default authConfig;
