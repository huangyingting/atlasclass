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
  const existing = await prisma.invitation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Invitation not found.' }, { status: 404 });
  }

  if (existing.status === 'USED') {
    return NextResponse.json(
      { error: 'Cannot revoke an invitation that has already been redeemed. Revoke the user account instead.' },
      { status: 400 }
    );
  }

  const invitation = await prisma.invitation.update({
    where: { id },
    data: {
      status: 'REVOKED',
      revokedAt: new Date(),
    },
  });

  await writeAuditLog({
    actorId: check.user.id,
    actorEmail: check.user.email,
    action: 'INVITE_REVOKED',
    targetType: 'Invitation',
    targetId: invitation.id,
    metadata: { code: invitation.code, role: invitation.role, email: invitation.email },
    req,
  });

  return NextResponse.json({ invitation });
}
