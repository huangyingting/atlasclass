import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SUBJECTS: Record<string, string[]> = {
  calculus: ['limits', 'derivatives', 'composite', 'rates', 'extrema', 'integrals', 'diffeq', 'applications', 'parametric', 'series'],
  biology: ['biochem', 'cells', 'energetics', 'signaling', 'heredity', 'genes', 'evolution', 'ecology'],
  chemistry: ['atoms', 'bonding', 'substances', 'reactions', 'kinetics', 'thermochem', 'equilibrium', 'acids', 'electrochem'],
  statistics: ['onevar', 'twovar', 'collecting', 'probability', 'sampling', 'proportions', 'means', 'chisquare', 'slopes'],
  history: ['contact', 'colonial', 'revolution', 'republic', 'civilwar', 'gilded', 'worldwars', 'coldwar', 'present'],
  macroeconomics: ['scarcity', 'indicators', 'adas', 'money', 'stabilization', 'trade'],
  government: ['foundations', 'branches', 'liberties', 'ideologies', 'participation'],
};

function subjectOf(ch: string): string {
  for (const [subj, chapters] of Object.entries(SUBJECTS)) {
    if (chapters.includes(ch)) return subj;
  }
  return 'physics';
}

function setIdFromProblemId(problemId: string): string {
  const idx = problemId.lastIndexOf('-');
  return idx > 0 ? problemId.slice(0, idx) : problemId;
}

async function main() {
  const dataPath = path.join(process.cwd(), 'docs/exploration/data/supabase-data.json');
  const raw = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  const problemSets: any[] = raw.problem_sets || [];
  const samplesByChapter: Record<string, any[]> = raw.samples || {};
  const solutionsById: Record<string, any> = raw.sampleSolutions || {};
  const fullSets: Record<string, { set: any; problems: any[] }> = raw.fullSets || {};

  console.log(`Seeding ${problemSets.length} problem sets...`);

  const validSetIds = new Set<string>();
  for (const ps of problemSets) {
    validSetIds.add(ps.id);
    await prisma.problemSet.upsert({
      where: { id: ps.id },
      update: {
        subject: subjectOf(ps.chapter),
        chapter: ps.chapter,
        chapterNo: ps.chapter_no,
        position: ps.position,
        title: ps.title,
        pages: ps.pages,
        nProblems: ps.n_problems,
        pageFrom: ps.page_from,
        pageTo: ps.page_to,
        i18nJson: JSON.stringify(ps.i18n || {}),
      },
      create: {
        id: ps.id,
        subject: subjectOf(ps.chapter),
        chapter: ps.chapter,
        chapterNo: ps.chapter_no,
        position: ps.position,
        title: ps.title,
        pages: ps.pages,
        nProblems: ps.n_problems,
        pageFrom: ps.page_from,
        pageTo: ps.page_to,
        i18nJson: JSON.stringify(ps.i18n || {}),
      },
    });
  }

  // Collect all authentic problems from samples and fullSets
  const problemsMap = new Map<
    string,
    {
      id: string;
      setId: string | null;
      chapter: string;
      isSample: boolean;
      sampleOrder: number | null;
      kind: string;
      prompt: string;
      choices: any;
      scene: any;
      unit: string | null;
      answer: number | null;
      value: number | null;
      solution: string;
      steps: any[];
      slips: any[];
      ghost: any[];
    }
  >();

  // 1. Add fullSets problems first
  for (const [setId, fsData] of Object.entries(fullSets)) {
    const ch = fsData.set.chapter;
    for (const p of fsData.problems || []) {
      const sol = solutionsById[p.id] || {};
      problemsMap.set(p.id, {
        id: p.id,
        setId: validSetIds.has(setId) ? setId : null,
        chapter: ch,
        isSample: false,
        sampleOrder: null,
        kind: p.kind || 'mcq',
        prompt: p.prompt || '',
        choices: p.choices ?? null,
        scene: p.scene ?? null,
        unit: p.unit ?? null,
        answer: sol.answer ?? null,
        value: sol.value ?? null,
        solution: sol.solution ?? '',
        steps: sol.steps ?? [],
        slips: sol.slips ?? [],
        ghost: sol.ghost ?? [],
      });
    }
  }

  // 2. Add sample problems (and mark isSample = true, sampleOrder = idx)
  for (const [ch, sList] of Object.entries(samplesByChapter)) {
    (sList || []).forEach((p: any, idx: number) => {
      const sol = solutionsById[p.id] || {};
      const inferredSetId = setIdFromProblemId(p.id);
      const existing = problemsMap.get(p.id);
      problemsMap.set(p.id, {
        id: p.id,
        setId: existing?.setId ?? (validSetIds.has(inferredSetId) ? inferredSetId : null),
        chapter: ch,
        isSample: true,
        sampleOrder: idx,
        kind: p.kind || existing?.kind || 'mcq',
        prompt: p.prompt || existing?.prompt || '',
        choices: p.choices ?? existing?.choices ?? null,
        scene: p.scene ?? existing?.scene ?? null,
        unit: p.unit ?? existing?.unit ?? null,
        answer: sol.answer ?? existing?.answer ?? null,
        value: sol.value ?? existing?.value ?? null,
        solution: sol.solution ?? existing?.solution ?? '',
        steps: sol.steps ?? existing?.steps ?? [],
        slips: sol.slips ?? existing?.slips ?? [],
        ghost: sol.ghost ?? existing?.ghost ?? [],
      });
    });
  }

  // 3. Ensure every problem set has its full n_problems populated using the chapter's authentic problems as templates
  // when not already present in fullSets, so opening any of the 374 problem sets works seamlessly with real 3D scenes.
  for (const ps of problemSets) {
    const ch = ps.chapter;
    const chTemplates = (samplesByChapter[ch] || []).map((p: any) => ({
      ...p,
      sol: solutionsById[p.id] || {},
    }));
    if (chTemplates.length === 0) continue;

    for (let i = 1; i <= ps.n_problems; i++) {
      const pid = `${ps.id}-${String(i).padStart(2, '0')}`;
      if (!problemsMap.has(pid)) {
        const tpl = chTemplates[(i - 1) % chTemplates.length];
        const sol = tpl.sol || {};
        problemsMap.set(pid, {
          id: pid,
          setId: ps.id,
          chapter: ch,
          isSample: false,
          sampleOrder: null,
          kind: tpl.kind || 'mcq',
          prompt: tpl.prompt || '',
          choices: tpl.choices ?? null,
          scene: tpl.scene ?? { page: ps.page_from },
          unit: tpl.unit ?? null,
          answer: sol.answer ?? null,
          value: sol.value ?? null,
          solution: sol.solution ?? '',
          steps: sol.steps ?? [],
          slips: sol.slips ?? [],
          ghost: sol.ghost ?? [],
        });
      }
    }
  }

  console.log(`Seeding ${problemsMap.size} problems across all chapters...`);
  for (const p of problemsMap.values()) {
    await prisma.problem.upsert({
      where: { id: p.id },
      update: {
        setId: p.setId,
        chapter: p.chapter,
        isSample: p.isSample,
        sampleOrder: p.sampleOrder,
        kind: p.kind,
        prompt: p.prompt,
        choicesJson: p.choices ? JSON.stringify(p.choices) : null,
        sceneJson: JSON.stringify(p.scene),
        unit: p.unit,
        answer: p.answer,
        value: p.value,
        solution: p.solution,
        stepsJson: JSON.stringify(p.steps),
        slipsJson: JSON.stringify(p.slips),
        ghostJson: JSON.stringify(p.ghost),
      },
      create: {
        id: p.id,
        setId: p.setId,
        chapter: p.chapter,
        isSample: p.isSample,
        sampleOrder: p.sampleOrder,
        kind: p.kind,
        prompt: p.prompt,
        choicesJson: p.choices ? JSON.stringify(p.choices) : null,
        sceneJson: JSON.stringify(p.scene),
        unit: p.unit,
        answer: p.answer,
        value: p.value,
        solution: p.solution,
        stepsJson: JSON.stringify(p.steps),
        slipsJson: JSON.stringify(p.slips),
        ghostJson: JSON.stringify(p.ghost),
      },
    });
  }

  const userCount = await prisma.user.count();
  console.log(`Seed complete! ProblemSets: ${problemSets.length}, Problems: ${problemsMap.size}, Users: ${userCount} (no dummy accounts).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
