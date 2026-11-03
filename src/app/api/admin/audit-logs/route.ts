import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (check.error) {
    return NextResponse.json({ error: check.error }, { status: check.status });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');
  const limit = Math.min(Number(url.searchParams.get('limit') || 200), 500);

  const logs = await prisma.auditLog.findMany({
    where: action ? { action } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({
    auditLogs: logs.map((l) => ({
      ...l,
      metadata: JSON.parse(l.metadata || '{}'),
    })),
  });
}
