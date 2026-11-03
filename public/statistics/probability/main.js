// Chapter 4: probability and random variables, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);

startBook({
  no: 4, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  // the clock starts with the Galton board mostly filled, so the opening figure already shows its shape
  clock0: 10.5,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'galton': { const c = M.countsAt(M.galT(M.clk(s, 'galton'))), n = c.reduce((a, b) => a + b, 0);
        return `balls landed ${n} of ${M.GAL.balls}\nin bins 4–6: ${c[4] + c[5] + c[6]}${n ? ` (${f(100 * (c[4] + c[5] + c[6]) / n, 1)}%)` : ''}   expected ${f(100 * (M.PMF[4] + M.PMF[5] + M.PMF[6]), 1)}%`; }
      case 'runs': return `real: longest run ${M.REAL_RUN.len}, ${M.REAL_SW} switches\nmade up: longest run ${M.INV_RUN.len}, ${M.INV_SW} switches`;
      case 'lln': { const n = M.llnN(M.clk(s, 'lln')), p = M.PROP[0][n - 1]; return `rolls ${n}   sixes ${Math.round(p * n)}\nproportion ${f(p, 3)}   probability ${f(1 / 6, 3)}`; }
      case 'dice': { const k = M.rollIdx(M.clk(s, 'dice')); return `P(sum is 7) = 6/36 = ${f(M.P7, 3)}\nsevens so far ${M.sevensUpTo(k)} of ${k + 1} rolls`; }
      case 'venn': { const n = M.dartsN(M.clk(s, 'venn')); return n ? `darts ${n}\nA or B ${f(M.hits(n, p => M.inC(p, M.LEFT.A) || M.inC(p, M.LEFT.B)) / n)} (area ${f(M.P_A_OR_B)})   S or B ${f(M.hits(n, p => M.inC(p, M.RIGHT.S) || M.inC(p, M.RIGHT.B)) / n)} (area ${f(M.P_UNION)})` : 'darts 0'; }
      case 'table': return `P(texted) ${f(M.P_T, 3)}\nP(texted | 16–24) ${f(M.P_T_GIVEN_Y, 3)}   P(16–24 | texted) ${f(M.P_Y_GIVEN_T, 3)}`;
      case 'tree': { const c = M.leafCounts(M.treeT(M.clk(s, 'tree'))), n = c.reduce((a, b) => a + b, 0); return `people ${n}   positive ${c[0] + c[2]}, with the condition ${c[0]}\nP(condition | +) = ${f(M.P_D_POS, 3)}`; }
      case 'rv': { const n = M.rvN(M.clk(s, 'rv')); return `households drawn ${n}   mean ${f(M.runMean(n), 3)}\nμ = ${f(M.MU_X)}   σ = ${f(M.SD_X, 3)}`; }
      case 'linear': { const ph = M.linPhase(M.clk(s, 'linear')); return `${ph.h > 0.5 ? 'Y = 3X − 7' : ph.s > 0.5 ? '3X' : 'X'}\nmean ${f(M.morph(M.MU_W, ph))}   SD ${f(M.SD_W * (1 + (M.WHEEL.b - 1) * ph.s))}`; }
      case 'sum': { const [x, y] = M.PAIRS[M.pairIdx(M.clk(s, 'sum'))]; return `spin ${x} + roll ${y} = ${x + y}\nμ ${M.MU_W} + ${M.MU_D} = ${M.MU_T}   σ √(${f(M.SD_W ** 2, 3)} + ${f(M.SD_D ** 2, 3)}) = ${f(M.SD_T, 3)}`; }
      case 'geom': { const g = M.geomAt(M.clk(s, 'geom')); return `run ${g.i + 1}: ${g.done ? `X = ${M.GRUNS[g.i]}` : `box ${g.open}`}\nμ = 1/p = ${M.MU_GE}   σ = ${f(M.SD_GE, 2)}`; }
    }
    return '';
  },
});
