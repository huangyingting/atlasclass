import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

function generateInviteCode(role: string): string {
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  const prefix = role === 'ADMIN' ? 'ADM' : role === 'TEACHER' ? 'TCH' : 'STU';
  return `ATLAS-${prefix}-${rand}`;
}

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  // Mark any past-due ACTIVE invitations as EXPIRED
  await prisma.invitation.updateMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lte: new Date() },
    },
    data: { status: 'EXPIRED' },
  });

  const invitations = await prisma.invitation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdBy: { select: { id: true, email: true, role: true } },
      usedBy: { select: { id: true, email: true, role: true, status: true } },
    },
  });

  return NextResponse.json({ invitations });
}

export async function POST(req: Request) {
  const check = await requireAdmin(req);
  if (check.error || !check.user) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const body = await req.json().catch(() => ({}));
  const role = String(body.role || 'STUDENT').toUpperCase();
  const email = body.email ? String(body.email).toLowerCase().trim() : null;
  const expiresInHours = Number(body.expiresInHours ?? 72);
  const note = body.note ? String(body.note).trim() : null;

  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
    return NextResponse.json(
      { error: 'Invalid role. Must be STUDENT, TEACHER, or ADMIN.' },
      { status: 400 }
    );
  }
  if (!Number.isFinite(expiresInHours) || expiresInHours <= 0) {
    return NextResponse.json(
      { error: 'Expiration hours must be a positive number.' },
      { status: 400 }
    );
  }

  const code = body.code ? String(body.code).toUpperCase().trim() : generateInviteCode(role);
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

  const invitation = await prisma.invitation.create({
    data: {
      code,
      role,
      email,
      status: 'ACTIVE',
      expiresAt,
      createdById: check.user.id,
      note,
    },
  });

  await writeAuditLog({
    actorId: check.user.id,
    actorEmail: check.user.email,
    action: 'INVITE_CREATED',
    targetType: 'Invitation',
    targetId: invitation.id,
    metadata: {
      code: invitation.code,
      role: invitation.role,
      email: invitation.email,
      expiresAt: invitation.expiresAt.toISOString(),
      note: invitation.note,
    },
    req,
  });

  return NextResponse.json({ invitation }, { status: 201 });
}
