// Chapter 8: chi-square tests, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f2 = x => x.toFixed(2);

startBook({
  no: 8, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'gof': {
        const g = M.gofAt(M.clk(s, 'gof')), done = Math.floor(g.cells), part = M.CON.slice(0, done).reduce((a, b) => a + b, 0);
        return `counted ${g.m} of ${M.GOF.n}\n${done ? `χ² so far ${f2(part)} (${done} of ${M.K} colours)` : 'χ² waits for the whole bag'}\ndf ${M.DF}   χ²* at α = ${M.GOF.alpha}: ${f2(M.CRIT)}`;
      }
      case 'sim': {
        const k = M.simShown(M.clk(s, 'sim')), b = M.SIM_CHI.slice(0, k).filter(x => x >= M.CHI).length;
        return `bags simulated under H₀: ${k}\nχ² ≥ ${f2(M.CHI)}: ${b}${k ? ` (${(b / k).toFixed(3)})` : ''}`;
      }
      case 'curve': return `χ² ${f2(M.CHI)}   df ${M.DF}\np = P(χ² ≥ ${f2(M.CHI)}) = ${M.P.toFixed(3)}\nχ²* (α = ${M.GOF.alpha}) = ${f2(M.CRIT)}`;
      case 'family': { const df = M.famDf(M.clk(s, 'family')); return `df ${df}   mean ${df}   peak at ${M.mode(df)}\nχ²* (α = 0.05) = ${f2(M.chiStar(0.05, df))}`; }
      case 'table': {
        if (page.lit === 'tContrib') return `χ² = Σ (O − E)²/E = ${f2(M.CHI_T)}\nlargest: ${M.TAB.rows[M.BIG_T[0]]}, ${M.TAB.cols[M.BIG_T[1]]}  ${f2(M.TC[M.BIG_T[0]][M.BIG_T[1]])}`;
        const [i, j] = M.cellAt(M.clk(s, 'table'));
        return `${M.TAB.rows[i]}, ${M.TAB.cols[j]}\nE = ${M.ROWT[i]} × ${M.COLT[j]} / ${M.NT} = ${M.TE[i][j].toFixed(2)}   O = ${M.TO[i][j]}`;
      }
      case 'tcurve': return `χ² ${f2(M.CHI_T)}   df (${M.R} − 1)(${M.C} − 1) = ${M.DF_T}\np = ${M.P_T.toFixed(4)}   χ²* (α = ${M.TAB.alpha}) = ${f2(M.CRIT_T)}`;
      case 'designs': { const c = M.clk(s, 'designs'), n = M.HOMO.filter((_, i) => M.flight(c, i) >= 1).length; return `people classified: ${n} of ${M.DES.balls} in each design\nleft: row totals set by the design · right: only the total`; }
      case 'choose': { const c = M.clk(s, 'choose'), sc = M.SCEN[M.scenAt(c)], on = (c % M.SCEN_EACH) > M.SCEN_EACH * 0.4; return on ? `→ ${M.PROCS.find(p => p.key === sc.key).short}` : 'which procedure?'; }
    }
    return '';
  },
});
