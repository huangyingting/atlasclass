import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const chapter = url.searchParams.get('chapter');

    const sets = await prisma.problemSet.findMany({
      where: chapter ? { chapter } : undefined,
      orderBy: [{ chapterNo: 'asc' }, { position: 'asc' }],
    });

    const formatted = sets.map((ps) => ({
      id: ps.id,
      subject: ps.subject,
      chapter: ps.chapter,
      chapter_no: ps.chapterNo,
      position: ps.position,
      title: ps.title,
      pages: ps.pages,
      n_problems: ps.nProblems,
      page_from: ps.pageFrom,
      page_to: ps.pageTo,
      i18n: JSON.parse(ps.i18nJson || '{}'),
    }));

    return NextResponse.json({ data: formatted, error: null });
  } catch (err: any) {
    return NextResponse.json(
      { data: null, error: { message: err?.message || 'Failed to fetch problem sets.' } },
      { status: 500 }
    );
  }
}
