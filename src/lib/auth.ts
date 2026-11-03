import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cookies, headers } from 'next/headers';
import { prisma } from './prisma';
import { writeAuditLog } from './audit';

export const SESSION_COOKIE_NAME = 'atlas_session';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || 'atlasclass-production-grade-secret-key-2026',
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login/',
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || '').toLowerCase().trim();
        const password = String(credentials?.password || '');
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        if (user.status === 'REVOKED') {
          throw new Error('ACCOUNT_REVOKED');
        }
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        (token as any).role = (user as any).role;
        (token as any).status = (user as any).status;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as any).id = token.sub;
        (session.user as any).role = (token as any).role;
        (session.user as any).status = (token as any).status;
      }
      return session;
    },
  },
});

export async function createAtlasSession(userId: string) {
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000);
  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });
  return { sessionToken, expires };
}

export function formatClientUser(
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    emailVerified?: Date | null;
  },
  isNewSignIn = false
) {
  const nowIso = new Date().toISOString();
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    status: user.status,
    created_at: user.createdAt.toISOString(),
    email_confirmed_at: (user.emailVerified ?? user.createdAt).toISOString(),
    last_sign_in_at: isNewSignIn ? user.createdAt.toISOString() : nowIso,
  };
}

export async function getCurrentUser(req?: Request | null) {
  let token: string | null = null;

  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7).trim();
    }
    if (!token) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${SESSION_COOKIE_NAME}=`));
      if (match) {
        token = decodeURIComponent(match.slice(SESSION_COOKIE_NAME.length + 1));
      }
    }
  } else {
    try {
      const h = await headers();
      const authHeader = h.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7).trim();
      }
      if (!token) {
        const c = await cookies();
        token = c.get(SESSION_COOKIE_NAME)?.value ?? null;
      }
    } catch {
      // Ignore outside request context
    }
  }

  if (token) {
    const dbSession = await prisma.session.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: { subscription: true },
        },
      },
    });
    if (dbSession) {
      if (dbSession.expires > new Date() && dbSession.user && dbSession.user.status === 'ACTIVE') {
        return { user: dbSession.user, sessionToken: dbSession.sessionToken };
      }
      if (dbSession.expires <= new Date() || dbSession.user?.status === 'REVOKED') {
        await prisma.session.delete({ where: { id: dbSession.id } }).catch(() => {});
      }
      return null;
    }
  }

  try {
    const nextAuthSession = await auth();
    const userId = (nextAuthSession?.user as any)?.id;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });
      if (user && user.status === 'ACTIVE') {
        return { user, sessionToken: token || 'nextauth-jwt' };
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

export async function requireAdmin(req: Request) {
  const current = await getCurrentUser(req);
  if (!current) {
    return { error: 'Authentication required.', status: 401 as const, user: null };
  }
  if (current.user.role !== 'ADMIN') {
    await writeAuditLog({
      actorId: current.user.id,
      actorEmail: current.user.email,
      action: 'UNAUTHORIZED_ADMIN_ATTEMPT',
      targetType: 'Endpoint',
      targetId: new URL(req.url).pathname,
      req,
    });
    return { error: 'Administrator privileges required.', status: 403 as const, user: null };
  }
  return { error: null, status: 200 as const, user: current.user };
}
