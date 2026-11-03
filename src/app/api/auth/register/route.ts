import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';
import { createAtlasSession, formatClientUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').toLowerCase().trim();
    const password = String(body.password || '');
    const name = body.name ? String(body.name).trim() : null;
    const inviteCode = String(body.inviteCode || '').toUpperCase().trim();
    const referralCodeInput = body.referralCode ? String(body.referralCode).toUpperCase().trim() : null;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.', code: 'WEAK_PASSWORD' },
        { status: 400 }
      );
    }
    if (!inviteCode) {
      await writeAuditLog({
        actorEmail: email,
        action: 'INVITE_REDEMPTION_FAILED',
        targetType: 'Invitation',
        metadata: { reason: 'MISSING_INVITE_CODE' },
        req,
      });
      return NextResponse.json(
        { error: 'Registration is invite-only. A valid invitation code is required.', code: 'INVITE_REQUIRED' },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please log in instead.', code: 'EMAIL_ALREADY_REGISTERED' },
        { status: 409 }
      );
    }

    const invite = await prisma.invitation.findUnique({ where: { code: inviteCode } });
    if (!invite) {
      await writeAuditLog({
        actorEmail: email,
        action: 'INVITE_REDEMPTION_FAILED',
        targetType: 'Invitation',
        targetId: inviteCode,
        metadata: { reason: 'INVITE_INVALID', code: inviteCode },
        req,
      });
      return NextResponse.json(
        { error: 'Invalid invitation code.', code: 'INVITE_INVALID' },
        { status: 403 }
      );
    }

    if (invite.status === 'USED') {
      await writeAuditLog({
        actorEmail: email,
        action: 'INVITE_REDEMPTION_FAILED',
        targetType: 'Invitation',
        targetId: invite.id,
        metadata: { reason: 'INVITE_USED', code: inviteCode },
        req,
      });
      return NextResponse.json(
        { error: 'This invitation code has already been used.', code: 'INVITE_USED' },
        { status: 403 }
      );
    }

    if (invite.status === 'REVOKED') {
      await writeAuditLog({
        actorEmail: email,
        action: 'INVITE_REDEMPTION_FAILED',
        targetType: 'Invitation',
        targetId: invite.id,
        metadata: { reason: 'INVITE_REVOKED', code: inviteCode },
        req,
      });
      return NextResponse.json(
        { error: 'This invitation code has been revoked by an administrator.', code: 'INVITE_REVOKED' },
        { status: 403 }
      );
    }

    if (invite.status === 'EXPIRED' || invite.expiresAt <= new Date()) {
      if (invite.status !== 'EXPIRED') {
        await prisma.invitation.update({
          where: { id: invite.id },
          data: { status: 'EXPIRED' },
        });
      }
      await writeAuditLog({
        actorEmail: email,
        action: 'INVITE_REDEMPTION_FAILED',
        targetType: 'Invitation',
        targetId: invite.id,
        metadata: { reason: 'INVITE_EXPIRED', code: inviteCode, expiresAt: invite.expiresAt.toISOString() },
        req,
      });
      return NextResponse.json(
        { error: 'This invitation code has expired.', code: 'INVITE_EXPIRED' },
        { status: 403 }
      );
    }

    if (invite.email && invite.email.toLowerCase() !== email) {
      await writeAuditLog({
        actorEmail: email,
        action: 'INVITE_REDEMPTION_FAILED',
        targetType: 'Invitation',
        targetId: invite.id,
        metadata: { reason: 'INVITE_EMAIL_MISMATCH', code: inviteCode, expectedEmail: invite.email },
        req,
      });
      return NextResponse.json(
        { error: 'This invitation code is restricted to a different email address.', code: 'INVITE_EMAIL_MISMATCH' },
        { status: 403 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const user = await prisma.$transaction(async (tx) => {
      // Atomic check-and-set on the invitation status to prevent race conditions
      const updatedInvite = await tx.invitation.updateMany({
        where: {
          id: invite.id,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      });
      if (updatedInvite.count !== 1) {
        throw new Error('INVITE_CONCURRENT_USE');
      }

      const createdUser = await tx.user.create({
        data: {
          email,
          name,
          passwordHash,
          emailVerified: new Date(),
          role: invite.role,
          status: 'ACTIVE',
          referralCode,
          referredByCode: referralCodeInput,
        },
      });

      await tx.invitation.update({
        where: { id: invite.id },
        data: { usedById: createdUser.id },
      });

      return createdUser;
    });

    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'INVITE_REDEEMED',
      targetType: 'Invitation',
      targetId: invite.id,
      metadata: { code: invite.code, role: invite.role },
      req,
    });

    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      action: 'USER_REGISTERED',
      targetType: 'User',
      targetId: user.id,
      metadata: { role: user.role, inviteCode: invite.code },
      req,
    });

    const { sessionToken, expires } = await createAtlasSession(user.id);
    const clientUser = formatClientUser(user, true);

    const res = NextResponse.json(
      {
        user: clientUser,
        session: {
          access_token: sessionToken,
          token_type: 'bearer',
          expires_at: Math.floor(expires.getTime() / 1000),
          user: clientUser,
        },
      },
      { status: 201 }
    );

    res.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      expires,
    });

    return res;
  } catch (err: any) {
    if (err?.message === 'INVITE_CONCURRENT_USE') {
      return NextResponse.json(
        { error: 'This invitation code has already been used.', code: 'INVITE_USED' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: err?.message || 'Registration failed.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
