// Chapter 7: inference for means, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const p3 = x => x < 0.01 ? x.toFixed(4) : x.toFixed(3);

startBook({
  no: 7, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'cap': { const a = M.capAt(M.clk(s, 'cap')), c = M.CAPS[Math.min(a.k, M.CAP.reps - 1)], hit = M.CAPS.slice(0, a.done).filter(x => x.hit).length;
        return `sample ${Math.min(a.k, M.CAP.reps - 1) + 1} of ${M.CAP.reps}   x̄ ${f(c.xbar)}   s ${f(c.s)}\ninterval ${f(c.lo)} to ${f(c.hi)}\ncaptured μ: ${hit} of ${a.done}`; }
      case 'tdist': { const d = M.dfAt(M.clk(s, 'tdist')); return `df ${d < 10 ? d.toFixed(1) : d.toFixed(0)}   t* ${M.tStarOf(d).toFixed(3)}   z* ${M.Z95.toFixed(3)}\nP(|t| > 2) ${M.tailBeyond(2, d).toFixed(3)}   P(|z| > 2) ${M.normBeyond(2).toFixed(3)}`; }
      case 'cond': return `A n = ${M.COND.A.length}   B n = ${M.COND.B.length}   C n = ${M.COND.C.length}\nB: ${M.COND_OUT.map(v => f(v, 1)).join(', ')} > Q₃ + 1.5·IQR = ${f(M.COND_F.hi)}`;
      case 'one': { const O = M.ONE; return `x̄ ${f(O.xbar)} mL   s ${f(O.s)}   SE ${O.se.toFixed(3)}\n95% CI ${f(O.lo)} to ${f(O.hi)}\nt ${f(M.T1)}   df ${O.df}   p ${p3(M.P1)}`; }
      case 'paired': return `x̄d ${f(M.PD.xbar)}   sd ${f(M.PD.s)}   SE ${f(M.PD.se)}\npaired: t ${f(M.T_PAIR)}, p ${p3(M.P_PAIR)}\nas two samples: t ${f(M.T_WRONG)}, p ${p3(M.P_WRONG)}`;
      case 'two': return `x̄A − x̄B ${f(M.TT.d)} h   SE ${M.TT.se.toFixed(3)}   df ${M.TT.df.toFixed(1)}\n95% CI ${f(M.TT.lo)} to ${f(M.TT.hi)}\nt ${f(M.T2)}   p ${p3(M.P2)}`;
      case 'choose': { const { k } = M.chooseAt(M.clk(s, 'choose')), [ex, path] = M.CHOOSE.ex[k]; return `${ex}\n→ ${M.NODE[path[2]]}`; }
    }
    return '';
  },
});
