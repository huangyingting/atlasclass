import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeAuditLog } from '@/lib/audit';
import { getCurrentUser, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(req: Request) {
  const current = await getCurrentUser(req);
  if (current) {
    await prisma.session
      .deleteMany({ where: { sessionToken: current.sessionToken } })
      .catch(() => {});
    await writeAuditLog({
      actorId: current.user.id,
      actorEmail: current.user.email,
      action: 'USER_LOGOUT',
      targetType: 'User',
      targetId: current.user.id,
      req,
    });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE_NAME);
  return res;
}
