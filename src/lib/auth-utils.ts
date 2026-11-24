import { auth } from './auth';
export { hashPassword, verifyPassword } from './password';

export async function getAuthSession() {
  try {
    const session = await auth();
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }
  return session.user;
}

