import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function parseArgs() {
  const args = process.argv.slice(2);
  let role = 'STUDENT';
  let email: string | null = null;
  let expiresInHours = 72;
  let note: string | null = null;
  let customCode: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--role' && args[i + 1]) {
      role = args[++i].toUpperCase();
    } else if (arg === '--email' && args[i + 1]) {
      email = args[++i].toLowerCase().trim();
    } else if ((arg === '--expires-in-hours' || arg === '--hours') && args[i + 1]) {
      expiresInHours = Number(args[++i]);
    } else if (arg === '--note' && args[i + 1]) {
      note = args[++i];
    } else if (arg === '--code' && args[i + 1]) {
      customCode = args[++i].toUpperCase().trim();
    }
  }

  if (!['STUDENT', 'TEACHER', 'ADMIN'].includes(role)) {
    throw new Error(`Invalid role "${role}". Expected STUDENT, TEACHER, or ADMIN.`);
  }
  if (!Number.isFinite(expiresInHours) || expiresInHours <= 0) {
    throw new Error(`Invalid expires-in-hours "${expiresInHours}".`);
  }

  return { role, email, expiresInHours, note, customCode };
}

export function generateInviteCode(role: string): string {
  const rand = crypto.randomBytes(4).toString('hex').toUpperCase();
  const prefix = role === 'ADMIN' ? 'ADM' : role === 'TEACHER' ? 'TCH' : 'STU';
  return `ATLAS-${prefix}-${rand}`;
}

async function main() {
  const { role, email, expiresInHours, note, customCode } = parseArgs();
  const code = customCode || generateInviteCode(role);
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

  const invite = await prisma.invitation.create({
    data: {
      code,
      role,
      email,
      status: 'ACTIVE',
      expiresAt,
      note: note ?? 'Created via CLI scripts/create-invite.ts',
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: null,
      actorEmail: 'cli@system',
      action: 'INVITE_CREATED',
      targetType: 'Invitation',
      targetId: invite.id,
      metadata: JSON.stringify({
        code: invite.code,
        role: invite.role,
        email: invite.email,
        expiresAt: invite.expiresAt.toISOString(),
        source: 'cli',
      }),
      ipAddress: '127.0.0.1',
      userAgent: 'scripts/create-invite.ts',
    },
  });

  console.log(JSON.stringify({
    id: invite.id,
    code: invite.code,
    role: invite.role,
    email: invite.email,
    status: invite.status,
    expiresAt: invite.expiresAt.toISOString(),
  }, null, 2));
}

if (require.main === module || process.argv[1]?.endsWith('create-invite.ts')) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
