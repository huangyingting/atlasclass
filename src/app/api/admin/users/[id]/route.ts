import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const check = await requireAdmin(req);
  if (check.error || !check.user) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const { id } = await context.params;
  const target = await prisma.user.findUnique({
    where: { id },
    include: { subscription: true },
  });
  if (!target) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const data: any = {};

  if (body.role && ['STUDENT', 'TEACHER', 'ADMIN'].includes(String(body.role).toUpperCase())) {
    const newRole = String(body.role).toUpperCase();
    if (newRole !== target.role) {
      data.role = newRole;
      await writeAuditLog({
        actorId: check.user.id,
        actorEmail: check.user.email,
        action: 'USER_ROLE_CHANGED',
        targetType: 'User',
        targetId: target.id,
        metadata: { email: target.email, previousRole: target.role, newRole },
        req,
      });
    }
  }

  if (body.status && ['ACTIVE', 'REVOKED'].includes(String(body.status).toUpperCase())) {
    const newStatus = String(body.status).toUpperCase();
    if (newStatus !== target.status) {
      data.status = newStatus;
      if (newStatus === 'REVOKED') {
        data.revokedAt = new Date();
        data.revokedReason = body.reason ? String(body.reason).trim() : 'Revoked by administrator';
        // Immediately destroy all active sessions for the revoked user
        await prisma.session.deleteMany({ where: { userId: target.id } });
        await writeAuditLog({
          actorId: check.user.id,
          actorEmail: check.user.email,
          action: 'USER_REVOKED',
          targetType: 'User',
          targetId: target.id,
          metadata: { email: target.email, reason: data.revokedReason },
          req,
        });
      } else {
        data.revokedAt = null;
        data.revokedReason = null;
        await writeAuditLog({
          actorId: check.user.id,
          actorEmail: check.user.email,
          action: 'USER_RESTORED',
          targetType: 'User',
          targetId: target.id,
          metadata: { email: target.email },
          req,
        });
      }
    }
  }

  if (typeof body.grantPremium === 'boolean') {
    if (body.grantPremium) {
      await prisma.subscription.upsert({
        where: { userId: target.id },
        update: {
          plan: 'lifetime',
          status: 'active',
          via: 'admin_grant',
          cancels: false,
        },
        create: {
          userId: target.id,
          plan: 'lifetime',
          status: 'active',
          via: 'admin_grant',
          cancels: false,
        },
      });
    } else if (target.subscription) {
      await prisma.subscription.update({
        where: { userId: target.id },
        data: { status: 'none', plan: null, via: null },
      });
    }

    await writeAuditLog({
      actorId: check.user.id,
      actorEmail: check.user.email,
      action: 'SUBSCRIPTION_CHANGED',
      targetType: 'Subscription',
      targetId: target.id,
      metadata: { email: target.email, grantPremium: body.grantPremium },
      req,
    });
  }

  const updated = await prisma.user.update({
    where: { id: target.id },
    data,
    include: { subscription: true },
  });

  return NextResponse.json({ user: updated });
}
