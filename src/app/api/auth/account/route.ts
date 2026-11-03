import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';
import { getCurrentUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function DELETE(req: Request) {
  const current = await getCurrentUser(req);
  if (!current) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  if (body.confirm !== 'DELETE') {
    return NextResponse.json(
      { error: 'Type DELETE to confirm account deletion.' },
      { status: 400 }
    );
  }

  await writeAuditLog({
    actorId: null,
    actorEmail: current.user.email,
    action: 'ACCOUNT_DELETED',
    targetType: 'User',
    targetId: current.user.id,
    metadata: { email: current.user.email, role: current.user.role },
    req,
  });

  await prisma.user.delete({ where: { id: current.user.id } });

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
