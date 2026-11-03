import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';
import { createAtlasSession, formatClientUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').toLowerCase().trim();
    const password = String(body.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.', code: 'MISSING_CREDENTIALS' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      await writeAuditLog({
        actorEmail: email,
        action: 'USER_LOGIN_FAILED',
        targetType: 'User',
        metadata: { reason: 'USER_NOT_FOUND_OR_NO_PASSWORD' },
        req,
      });
      return NextResponse.json(
        { error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    if (user.status === 'REVOKED') {
      await writeAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'USER_LOGIN_FAILED',
        targetType: 'User',
        targetId: user.id,
        metadata: { reason: 'ACCOUNT_REVOKED', revokedReason: user.revokedReason },
        req,
      });
      return NextResponse.json(
        {
          error: 'Your account access has been revoked by an administrator.',
          code: 'ACCOUNT_REVOKED',
        },
        { status: 403 }
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await writeAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'USER_LOGIN_FAILED',
        targetType: 'User',
        targetId: user.id,
        metadata: { reason: 'INVALID_PASSWORD' },
        req,
      });
      return NextResponse.json(
        { error: 'Invalid email or password.', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'USER_LOGIN_SUCCESS',
      targetType: 'User',
      targetId: user.id,
      metadata: { method: 'password', role: user.role },
      req,
    });

    const { sessionToken, expires } = await createAtlasSession(user.id);
    const clientUser = formatClientUser(user, false);

    const res = NextResponse.json({
      user: clientUser,
      session: {
        access_token: sessionToken,
        token_type: 'bearer',
        expires_at: Math.floor(expires.getTime() / 1000),
        user: clientUser,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Sign in failed.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
