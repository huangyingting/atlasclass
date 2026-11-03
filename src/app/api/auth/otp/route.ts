import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';
import { createAtlasSession, formatClientUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').toLowerCase().trim();
    const inviteCode = body.inviteCode ? String(body.inviteCode).toUpperCase().trim() : '';
    const redirectTo = String(body.redirectTo || '/login/');

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (existingUser.status === 'REVOKED') {
        await writeAuditLog({
          actorId: existingUser.id,
          actorEmail: email,
          action: 'USER_LOGIN_FAILED',
          targetType: 'User',
          targetId: existingUser.id,
          metadata: { reason: 'ACCOUNT_REVOKED', method: 'otp' },
          req,
        });
        return NextResponse.json(
          { error: 'Your account access has been revoked by an administrator.', code: 'ACCOUNT_REVOKED' },
          { status: 403 }
        );
      }
    } else {
      // Invite-only check for new users attempting magic link sign-up
      if (!inviteCode) {
        return NextResponse.json(
          {
            error: 'Registration is invite-only. Please enter a valid invitation code to create a new account.',
            code: 'INVITE_REQUIRED',
          },
          { status: 403 }
        );
      }
      const invite = await prisma.invitation.findUnique({ where: { code: inviteCode } });
      if (!invite || invite.status !== 'ACTIVE' || invite.expiresAt <= new Date()) {
        return NextResponse.json(
          {
            error: !invite
              ? 'Invalid invitation code.'
              : invite.status === 'USED'
              ? 'This invitation code has already been used.'
              : invite.status === 'REVOKED'
              ? 'This invitation code has been revoked.'
              : 'This invitation code has expired.',
            code: 'INVITE_INVALID',
          },
          { status: 403 }
        );
      }
      if (invite.email && invite.email.toLowerCase() !== email) {
        return NextResponse.json(
          { error: 'This invitation code is restricted to a different email address.', code: 'INVITE_EMAIL_MISMATCH' },
          { status: 403 }
        );
      }
    }

    const tokenHash = crypto.randomBytes(24).toString('hex');
    const expires = new Date(Date.now() + 30 * 60 * 1000);
    const identifier = inviteCode ? `${email}|${inviteCode}` : email;

    await prisma.verificationToken.create({
      data: {
        identifier,
        token: tokenHash,
        expires,
      },
    });

    const sep = redirectTo.includes('#') ? '&' : '#';
    const magicLink = `${redirectTo}${sep}token_hash=${tokenHash}&type=email`;

    return NextResponse.json({
      ok: true,
      token_hash: tokenHash,
      magicLink,
      message: 'Check your email for the link. It opens you straight back here, signed in.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to send link.' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const tokenHash = String(body.token_hash || '').trim();
    if (!tokenHash) {
      return NextResponse.json({ error: 'Missing token_hash.' }, { status: 400 });
    }

    const vt = await prisma.verificationToken.findUnique({ where: { token: tokenHash } });
    if (!vt || vt.expires <= new Date()) {
      if (vt) await prisma.verificationToken.delete({ where: { token: tokenHash } }).catch(() => {});
      return NextResponse.json(
        { error: 'That link has expired or was already used. Send yourself a new one.' },
        { status: 401 }
      );
    }

    // Consume the verification token immediately (single-use)
    await prisma.verificationToken.delete({ where: { token: tokenHash } });

    const [email, inviteCode] = vt.identifier.split('|');
    let user = await prisma.user.findUnique({ where: { email } });
    let isNewSignIn = false;

    if (user) {
      if (user.status === 'REVOKED') {
        return NextResponse.json(
          { error: 'Your account access has been revoked by an administrator.', code: 'ACCOUNT_REVOKED' },
          { status: 403 }
        );
      }
    } else {
      if (!inviteCode) {
        return NextResponse.json(
          { error: 'Registration is invite-only. A valid invitation code is required.' },
          { status: 403 }
        );
      }
      const invite = await prisma.invitation.findUnique({ where: { code: inviteCode } });
      if (!invite || invite.status !== 'ACTIVE' || invite.expiresAt <= new Date()) {
        return NextResponse.json(
          { error: 'Invitation code is no longer valid.' },
          { status: 403 }
        );
      }
      const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      user = await prisma.$transaction(async (tx) => {
        const created = await tx.user.create({
          data: {
            email,
            emailVerified: new Date(),
            role: invite.role,
            status: 'ACTIVE',
            referralCode,
          },
        });
        await tx.invitation.update({
          where: { id: invite.id },
          data: { status: 'USED', usedAt: new Date(), usedById: created.id },
        });
        return created;
      });
      isNewSignIn = true;
      await writeAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'INVITE_REDEEMED',
        targetType: 'Invitation',
        targetId: invite.id,
        metadata: { code: invite.code, role: invite.role, method: 'otp' },
        req,
      });
      await writeAuditLog({
        actorId: user.id,
        actorEmail: user.email,
        action: 'USER_REGISTERED',
        targetType: 'User',
        targetId: user.id,
        metadata: { role: user.role, inviteCode: invite.code, method: 'otp' },
        req,
      });
    }

    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'USER_LOGIN_SUCCESS',
      targetType: 'User',
      targetId: user.id,
      metadata: { method: 'otp', role: user.role },
      req,
    });

    const { sessionToken, expires } = await createAtlasSession(user.id);
    const clientUser = formatClientUser(user, isNewSignIn);

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
    return NextResponse.json({ error: err?.message || 'OTP verification failed.' }, { status: 500 });
  }
}
