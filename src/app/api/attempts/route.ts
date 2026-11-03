import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const current = await getCurrentUser(req);
    if (!current) {
      return NextResponse.json({ data: [], error: null });
    }

    const url = new URL(req.url);
    const like = url.searchParams.get('like');
    const inParam = url.searchParams.get('in');

    let where: any = { userId: current.user.id };
    if (like) {
      const prefix = like.replace(/%$/, '');
      where.problemId = { startsWith: prefix };
    } else if (inParam) {
      const ids = inParam.split(',').map((s) => s.trim()).filter(Boolean);
      where.problemId = { in: ids };
    }

    const attempts = await prisma.attempt.findMany({
      where,
      select: { problemId: true, correct: true, answer: true },
    });

    return NextResponse.json({
      data: attempts.map((a) => ({
        problem_id: a.problemId,
        correct: a.correct,
        answer: a.answer,
      })),
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: { message: err?.message || 'Failed to fetch attempts.' } },
      { status: 500 }
    );
  }
}
