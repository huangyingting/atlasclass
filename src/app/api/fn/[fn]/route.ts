import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, SESSION_COOKIE_NAME } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

const CONSUMER_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'aol.com',
  'proton.me',
  'protonmail.com',
  'mail.com',
  'gmx.com',
  'yandex.com',
]);

export async function POST(
  req: Request,
  context: { params: Promise<{ fn: string }> }
) {
  const { fn } = await context.params;
  const body = await req.json().catch(() => ({}));

  try {
    if (fn === 'teacher-request') {
      const current = await getCurrentUser(req);
      const name = String(body.name || '').trim();
      const email = String(body.email || current?.user.email || '').toLowerCase().trim();
      const school = String(body.school || '').trim();
      const courses = Array.isArray(body.courses)
        ? body.courses
        : body.course
          ? [String(body.course).trim()]
          : [];
      const students = body.students ? String(body.students).trim() : null;
      const notes = body.notes || body.note || body.staff_url
        ? [body.staff_url ? `Staff URL: ${body.staff_url}` : '', body.domain ? `Domain: ${body.domain}` : '', body.notes || body.note || '']
            .filter(Boolean)
            .join(' | ')
        : null;

      if (!name || !email || !school || courses.length === 0) {
        return NextResponse.json(
          { error: 'Please complete your name, school email, school name, and at least one course.' },
          { status: 400 }
        );
      }

      const domain = email.split('@')[1] || '';
      const studentDomain = String(body.domain || '').toLowerCase().trim();
      if (!domain || CONSUMER_EMAIL_DOMAINS.has(domain) || (studentDomain && CONSUMER_EMAIL_DOMAINS.has(studentDomain))) {
        return NextResponse.json(
          {
            error: 'Please use your school email address.',
            message: 'please sign in with your school email address',
            detail: { hint: 'webmail' },
          },
          { status: 400 }
        );
      }

      const record = await prisma.teacherRequest.create({
        data: {
          name,
          email,
          school,
          courses: JSON.stringify(courses),
          students,
          notes,
          status: 'PENDING',
        },
      });

      await writeAuditLog({
        actorId: current?.user.id ?? null,
        actorEmail: email,
        action: 'TEACHER_REQUEST_SUBMITTED',
        targetType: 'TeacherRequest',
        targetId: record.id,
        metadata: { name, school, courses, students },
        req,
      });

      return NextResponse.json({ ok: true, id: record.id });
    }

    if (fn === 'checkout') {
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }
      const plan =
        body.plan === 'monthly'
          ? 'monthly'
          : body.plan === 'lifetime'
            ? 'lifetime'
            : 'annual';
      const status = plan === 'lifetime' ? 'paid' : 'active';
      const periodEnd =
        plan === 'lifetime'
          ? null
          : new Date(Date.now() + (plan === 'monthly' ? 30 : 365) * 24 * 3600 * 1000);

      await prisma.subscription.upsert({
        where: { userId: current.user.id },
        update: {
          plan,
          status,
          via: 'stripe',
          periodEnd,
          cancels: false,
        },
        create: {
          userId: current.user.id,
          plan,
          status,
          via: 'stripe',
          periodEnd,
          cancels: false,
        },
      });

      await writeAuditLog({
        actorId: current.user.id,
        actorEmail: current.user.email,
        action: 'SUBSCRIPTION_CHANGED',
        targetType: 'Subscription',
        targetId: current.user.id,
        metadata: { action: 'checkout', plan, periodEnd: periodEnd ? periodEnd.toISOString() : null },
        req,
      });

      const base = String(body.base || '');
      return NextResponse.json({ url: `${base}/account/?paid=1` });
    }

    if (fn === 'class-checkout') {
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }
      const base = String(body.base || '');
      return NextResponse.json({ url: `${base}/teachers/?paid=1` });
    }

    if (fn === 'billing') {
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
      }
      const { user } = current;
      const action = String(body.action || 'summary');

      if (action === 'summary') {
        const sub = user.subscription;
        const isActive = sub?.status === 'active' || sub?.status === 'paid';
        const amount = sub?.plan === 'monthly' ? 1999 : sub?.plan === 'lifetime' ? 19900 : 5999;
        return NextResponse.json({
          plan: sub?.plan ?? null,
          status: sub?.plan === 'lifetime' ? 'paid' : (sub?.status ?? 'none'),
          cancels: sub?.cancels ?? false,
          period_end: sub?.periodEnd ? sub.periodEnd.toISOString() : null,
          price:
            isActive && sub?.plan !== 'lifetime'
              ? {
                  amount,
                  currency: 'usd',
                  interval: sub?.plan === 'monthly' ? 'month' : 'year',
                }
              : null,
          prices: { monthly: 1999, annual: 5999, lifetime: 19900 },
          card: isActive ? { brand: 'Visa', last4: '4242', exp: '12/28', exp_month: 12, exp_year: 2028 } : null,
          upcoming:
            sub?.status === 'active' && !sub.cancels && sub.periodEnd
              ? {
                  amount,
                  currency: 'usd',
                  date: sub.periodEnd.toISOString(),
                }
              : null,
          invoices: isActive
            ? [
                {
                  id: `inv_${sub!.id.slice(-6)}`,
                  date: sub!.createdAt.toISOString(),
                  amount,
                  currency: 'usd',
                  status: 'paid',
                  url: '/account/subscription/',
                  pdf: '/account/subscription/',
                },
              ]
            : [],
        });
      }

      if (action === 'cancel') {
        if (user.subscription) {
          await prisma.subscription.update({
            where: { userId: user.id },
            data: { cancels: true },
          });
        }
        await writeAuditLog({
          actorId: user.id,
          actorEmail: user.email,
          action: 'SUBSCRIPTION_CHANGED',
          targetType: 'Subscription',
          targetId: user.id,
          metadata: { action: 'cancel' },
          req,
        });
        return NextResponse.json({ ok: true });
      }

      if (action === 'resume') {
        if (user.subscription) {
          await prisma.subscription.update({
            where: { userId: user.id },
            data: { cancels: false, status: 'active' },
          });
        }
        await writeAuditLog({
          actorId: user.id,
          actorEmail: user.email,
          action: 'SUBSCRIPTION_CHANGED',
          targetType: 'Subscription',
          targetId: user.id,
          metadata: { action: 'resume' },
          req,
        });
        return NextResponse.json({ ok: true });
      }

      if (action === 'switch') {
        const newPlan = user.subscription?.plan === 'monthly' ? 'annual' : 'monthly';
        if (user.subscription) {
          await prisma.subscription.update({
            where: { userId: user.id },
            data: { plan: newPlan, cancels: false },
          });
        }
        await writeAuditLog({
          actorId: user.id,
          actorEmail: user.email,
          action: 'SUBSCRIPTION_CHANGED',
          targetType: 'Subscription',
          targetId: user.id,
          metadata: { action: 'switch', plan: newPlan },
          req,
        });
        return NextResponse.json({ ok: true });
      }

      if (action === 'card') {
        return NextResponse.json({ url: '/account/subscription/' });
      }

      if (action === 'delete-account') {
        await writeAuditLog({
          actorId: null,
          actorEmail: user.email,
          action: 'ACCOUNT_DELETED',
          targetType: 'User',
          targetId: user.id,
          metadata: { email: user.email, role: user.role },
          req,
        });
        await prisma.user.delete({ where: { id: user.id } });
        const res = NextResponse.json({ ok: true });
        res.cookies.delete(SESSION_COOKIE_NAME);
        return res;
      }

      return NextResponse.json({ ok: true });
    }

    if (fn === 'ask') {
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({ error: 'Please sign in to ask a follow-up.' }, { status: 401 });
      }
      const { user } = current;
      const isPremium =
        user.subscription?.status === 'active' ||
        user.subscription?.plan === 'lifetime' ||
        user.role === 'TEACHER' ||
        user.role === 'ADMIN';

      if (!isPremium) {
        return NextResponse.json(
          { error: 'Ask a follow-up requires an active Premium membership.' },
          { status: 403 }
        );
      }

      const contextText = String(body.context || '');
      const messages = Array.isArray(body.messages) ? body.messages : [];
      const lastMsg = messages.at(-1)?.content || '';

      // Extract context clues from the drawer's askContext string
      const lines = contextText.split('\n');
      const chapterLine = lines.find((l) => l.startsWith('Chapter:')) || '';
      const questionLine = lines.find((l) => l.startsWith('Question:')) || '';
      const figureLine = lines.find((l) => l.startsWith('Figure:')) || '';
      const slipLine = lines.find((l) => l.startsWith('Their number matches a known slip:')) || '';
      const solutionLine = lines.find((l) => l.includes('Step 1') || l.startsWith('Solution:')) || '';

      let reply = `Let's look closely at the 3D figure and the relationships in this problem.\n\n`;
      if (slipLine) {
        reply += `Notice what happens on the figure with your attempt: **${slipLine.replace('Their number matches a known slip: ', '')}**\n\n`;
      }
      if (solutionLine) {
        reply += `In the worked steps (${chapterLine.replace('Chapter: ', '')}), we connect the physical quantities directly: ${solutionLine.trim()}\n\n`;
      } else {
        reply += `For **${questionLine.replace('Question: ', '')}**, start by identifying the given quantities shown in the readout (${figureLine.replace('Figure: ', '')}) and how the rate of change or conservation law links them.`;
      }
      if (lastMsg) {
        reply += `\n\nRegarding your question (*"${lastMsg.slice(0, 120)}"*): focus on how scaling one variable affects the target quantity in the governing equation—check the exponents and signs in the formula.`;
      }

      await prisma.tutorChat.create({
        data: {
          userId: user.id,
          problemId: chapterLine.slice(0, 80) || 'practice',
          messages: JSON.stringify([...messages, { role: 'assistant', content: reply }]),
        },
      });

      return NextResponse.json({ reply });
    }

    return NextResponse.json({ error: `Unknown edge function: ${fn}` }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Function invocation failed.' },
      { status: 500 }
    );
  }
}
