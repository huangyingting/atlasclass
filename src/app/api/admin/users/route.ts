import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      subscription: true,
      invitationUsed: { select: { code: true, role: true } },
      _count: { select: { attempts: true } },
    },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      revokedAt: u.revokedAt,
      revokedReason: u.revokedReason,
      freeLimit: u.freeLimit,
      freeSets: JSON.parse(u.freeSetsJson || '[]'),
      referralCode: u.referralCode,
      subscription: u.subscription,
      invitationUsed: u.invitationUsed,
      attemptsCount: u._count.attempts,
      createdAt: u.createdAt,
    })),
  });
}
