import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const requests = await prisma.teacherRequest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    teacherRequests: requests.map((r) => ({
      ...r,
      courses: JSON.parse(r.courses || '[]'),
    })),
  });
}

export async function PATCH(req: Request) {
  const check = await requireAdmin(req);
  if (check.error || !check.user) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const body = await req.json().catch(() => ({}));
  const id = String(body.id || '').trim();
  const status = String(body.status || '').toUpperCase();

  if (!id || !['APPROVED', 'REJECTED'].includes(status)) {
    return NextResponse.json(
      { error: 'id and status (APPROVED or REJECTED) are required.' },
      { status: 400 }
    );
  }

  const tr = await prisma.teacherRequest.findUnique({ where: { id } });
  if (!tr) {
    return NextResponse.json({ error: 'Teacher request not found.' }, { status: 404 });
  }

  let inviteCode: string | null = tr.inviteCode;
  if (status === 'APPROVED' && !inviteCode) {
    inviteCode = `ATLAS-TCH-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 14 * 24 * 3600 * 1000);
    const invite = await prisma.invitation.create({
      data: {
        code: inviteCode,
        role: 'TEACHER',
        email: tr.email,
        status: 'ACTIVE',
        expiresAt,
        createdById: check.user.id,
        note: `Approved teacher request for ${tr.name} (${tr.school})`,
      },
    });
    await writeAuditLog({
      actorId: check.user.id,
      actorEmail: check.user.email,
      action: 'INVITE_CREATED',
      targetType: 'Invitation',
      targetId: invite.id,
      metadata: { code: inviteCode, role: 'TEACHER', email: tr.email, teacherRequestId: tr.id },
      req,
    });
  }

  const updated = await prisma.teacherRequest.update({
    where: { id },
    data: { status, inviteCode },
  });

  await writeAuditLog({
    actorId: check.user.id,
    actorEmail: check.user.email,
    action: status === 'APPROVED' ? 'TEACHER_REQUEST_APPROVED' : 'TEACHER_REQUEST_REJECTED',
    targetType: 'TeacherRequest',
    targetId: updated.id,
    metadata: { email: updated.email, school: updated.school, inviteCode },
    req,
  });

  return NextResponse.json({
    teacherRequest: {
      ...updated,
      courses: JSON.parse(updated.courses || '[]'),
    },
  });
}
