import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { writeAuditLog } from '@/lib/audit';

export async function POST(
  req: Request,
  context: { params: Promise<{ fn: string }> }
) {
  const { fn } = await context.params;
  const body = await req.json().catch(() => ({}));

  try {
    if (fn === 'my_status') {
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({ data: null, error: null });
      }
      const { user } = current;
      const sub = user.subscription;
      const isPremium =
        sub?.status === 'active' ||
        sub?.plan === 'lifetime' ||
        user.role === 'TEACHER' ||
        user.role === 'ADMIN';
      const freeSets: string[] = JSON.parse(user.freeSetsJson || '[]');

      return NextResponse.json({
        data: {
          premium: isPremium,
          plan: sub?.plan ?? (user.role === 'TEACHER' || user.role === 'ADMIN' ? 'school' : null),
          status: sub?.status ?? (isPremium ? 'active' : 'none'),
          period_end: sub?.periodEnd ? sub.periodEnd.toISOString() : null,
          cancels: sub?.cancels ?? false,
          via: sub?.via ?? (user.role === 'TEACHER' || user.role === 'ADMIN' ? 'school' : null),
          free_limit: user.freeLimit,
          free_sets: freeSets,
          role: user.role,
          email: user.email,
        },
        error: null,
      });
    }

    if (fn === 'my_referrals') {
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({ data: null, error: { message: 'Not signed in' } }, { status: 401 });
      }
      const { user } = current;
      const referredUsers = await prisma.user.findMany({
        where: { referredByCode: user.referralCode, status: 'ACTIVE' },
        include: { subscription: true },
      });
      const counted = referredUsers.filter((u) => u.subscription?.status === 'active').length;
      const pending = referredUsers.length - counted;

      return NextResponse.json({
        data: {
          code: user.referralCode,
          counted,
          pending,
          needed: 5,
          lifetime: counted >= 5 || user.subscription?.plan === 'lifetime',
          reward: counted >= 5 ? 'lifetime' : null,
          discount: user.referredByCode ? 20 : null,
        },
        error: null,
      });
    }

    if (fn === 'claim_referral') {
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({ data: null, error: null });
      }
      const code = String(body.p_code || '').toUpperCase().trim();
      if (!code || code === current.user.referralCode || current.user.referredByCode) {
        return NextResponse.json({ data: false, error: null });
      }
      const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
      if (!referrer || referrer.id === current.user.id) {
        return NextResponse.json({ data: false, error: null });
      }
      await prisma.user.update({
        where: { id: current.user.id },
        data: { referredByCode: code },
      });
      return NextResponse.json({ data: true, error: null });
    }

    if (fn === 'my_classes') {
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({ data: [], error: null });
      }
      const classes = await prisma.classroom.findMany({
        where: { teacherId: current.user.id },
        include: { enrollments: true },
      });
      return NextResponse.json({
        data: classes.map((c) => ({
          id: c.id,
          name: c.name,
          school: c.name,
          subject: c.subject,
          domain: current.user.email.split('@')[1] || 'school.edu',
          until: 'June 30, 2027',
          join_code: c.joinCode,
          seats: Math.max(c.enrollments.length, 30),
          paid: true,
        })),
        error: null,
      });
    }

    if (fn === 'open_samples') {
      const chapter = String(body.p_chapter || '').trim();
      const samples = await prisma.problem.findMany({
        where: { chapter, isSample: true },
        orderBy: { sampleOrder: 'asc' },
      });

      const formatted = samples.map((p) => ({
        id: p.id,
        kind: p.kind === 'mc' ? 'mcq' : p.kind,
        prompt: p.prompt,
        choices: p.choicesJson ? JSON.parse(p.choicesJson) : null,
        scene: JSON.parse(p.sceneJson || 'null'),
        unit: p.unit,
      }));

      return NextResponse.json({ data: formatted, error: null });
    }

    if (fn === 'open_set') {
      const setId = String(body.p_set || '').trim();
      const current = await getCurrentUser(req);
      if (!current) {
        return NextResponse.json({
          data: null,
          error: { code: '28000', message: 'Authentication required' },
        });
      }

      const { user } = current;
      const ps = await prisma.problemSet.findUnique({ where: { id: setId } });
      if (!ps) {
        return NextResponse.json({
          data: null,
          error: { message: `Problem set "${setId}" not found.` },
        });
      }

      const sub = user.subscription;
      const isPremium =
        sub?.status === 'active' ||
        sub?.plan === 'lifetime' ||
        user.role === 'TEACHER' ||
        user.role === 'ADMIN';
      const freeSets: string[] = JSON.parse(user.freeSetsJson || '[]');

      if (!isPremium && !freeSets.includes(setId)) {
        if (freeSets.length >= user.freeLimit) {
          return NextResponse.json({
            data: null,
            error: { message: 'You have used all of your free problem sets.', hint: 'paywall' },
          });
        }
        freeSets.push(setId);
        await prisma.user.update({
          where: { id: user.id },
          data: { freeSetsJson: JSON.stringify(freeSets) },
        });
        await writeAuditLog({
          actorId: user.id,
          actorEmail: user.email,
          action: 'PROBLEM_SET_UNLOCKED',
          targetType: 'ProblemSet',
          targetId: setId,
          metadata: { freeSetsUsed: freeSets.length, freeLimit: user.freeLimit },
          req,
        });
      }

      const problems = await prisma.problem.findMany({
        where: { setId },
        orderBy: { id: 'asc' },
      });

      return NextResponse.json({
        data: {
          set: {
            id: ps.id,
            chapter: ps.chapter,
            chapter_no: ps.chapterNo,
            position: ps.position,
            title: ps.title,
            pages: ps.pages,
            n_problems: ps.nProblems,
            page_from: ps.pageFrom,
            page_to: ps.pageTo,
            i18n: JSON.parse(ps.i18nJson || '{}'),
          },
          problems: problems.map((p) => ({
            id: p.id,
            kind: p.kind === 'mc' ? 'mcq' : p.kind,
            prompt: p.prompt,
            choices: p.choicesJson ? JSON.parse(p.choicesJson) : null,
            scene: JSON.parse(p.sceneJson || 'null'),
            unit: p.unit,
          })),
        },
        error: null,
      });
    }

    if (fn === 'submit_answer' || fn === 'check_answer') {
      const problemId = String(body.p_problem || body.problem_id || '').trim();
      const rawAnswer = body.p_answer !== undefined ? body.p_answer : body.answer;

      const problem = await prisma.problem.findUnique({ where: { id: problemId } });
      if (!problem) {
        return NextResponse.json({
          data: null,
          error: { message: `Problem "${problemId}" not found.` },
        });
      }

      const current = await getCurrentUser(req);
      // If problem is not a sample, verify the user is signed in
      if (!problem.isSample && !current) {
        return NextResponse.json({
          data: null,
          error: { code: '28000', message: 'Authentication required' },
        });
      }

      let correct = false;
      if (rawAnswer === null || rawAnswer === undefined) {
        correct = false;
      } else if (typeof rawAnswer === 'object' && rawAnswer !== null && 'self' in rawAnswer) {
        correct = Boolean((rawAnswer as any).self);
      } else if (problem.kind === 'num') {
        const x = Number(rawAnswer);
        const v = Number(problem.value);
        correct = Number.isFinite(x) && Math.abs(x - v) <= Math.max(Math.abs(v) * 0.015, 1e-3);
      } else {
        correct = Number(rawAnswer) === problem.answer;
      }

      if (current && (correct || rawAnswer !== null)) {
        await prisma.attempt.upsert({
          where: {
            userId_problemId: {
              userId: current.user.id,
              problemId: problem.id,
            },
          },
          update: {
            correct,
            answer: rawAnswer === null ? null : String(rawAnswer),
          },
          create: {
            userId: current.user.id,
            problemId: problem.id,
            correct,
            answer: rawAnswer === null ? null : String(rawAnswer),
          },
        });

        await writeAuditLog({
          actorId: current.user.id,
          actorEmail: current.user.email,
          action: 'PROBLEM_ATTEMPT_SUBMITTED',
          targetType: 'Problem',
          targetId: problem.id,
          metadata: { correct, answer: rawAnswer },
          req,
        });
      }

      const steps = JSON.parse(problem.stepsJson || '[]');
      const slips = JSON.parse(problem.slipsJson || '[]');
      const ghost = JSON.parse(problem.ghostJson || '[]');

      return NextResponse.json({
        data: {
          correct,
          answer: problem.answer,
          value: problem.value,
          solution: problem.solution,
          steps: steps.length > 0 ? steps : null,
          slips: slips.length > 0 ? slips : null,
          ghost: ghost.length > 0 ? ghost : null,
        },
        error: null,
      });
    }

    return NextResponse.json(
      { data: null, error: { message: `Unknown RPC function: ${fn}` } },
      { status: 404 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: { message: err?.message || 'RPC execution failed' } },
      { status: 500 }
    );
  }
}
