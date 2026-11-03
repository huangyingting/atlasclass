import { prisma } from './prisma';

export interface AuditLogInput {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, any>;
  req?: Request | null;
}

export async function writeAuditLog(input: AuditLogInput) {
  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  if (input.req) {
    const headers = input.req.headers;
    ipAddress =
      headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headers.get('x-real-ip') ||
      '127.0.0.1';
    userAgent = headers.get('user-agent') || null;
  }

  return prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      actorEmail: input.actorEmail ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId ?? null,
      metadata: JSON.stringify(input.metadata ?? {}),
      ipAddress,
      userAgent,
    },
  });
}
