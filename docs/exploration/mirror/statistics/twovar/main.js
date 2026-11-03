// Chapter 2: exploring two-variable data, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const L = M.LS;

startBook({
  no: 2, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'fit': { const b = M.fitSlope(M.clk(s, 'fit')); return `slope ${f(b, 3)}   total area ${M.sse(b).toFixed(1)} cm²\nleast squares: b = ${L.b.toFixed(3)}, ${M.SSE.toFixed(1)} cm²`; }
      case 'shuffle': { const a = M.shufAt(M.clk(s, 'shuffle')); return `shuffle ${a.k + 1} of ${M.SHUF.k}   r ${f(M.SHUF_R[a.k])}\nreal r ${L.r.toFixed(3)}   largest |r| by chance ${M.SHUF_MAX.toFixed(2)}`; }
      case 'table': return `by car: city ${(100 * M.COND[0][2]).toFixed(0)}%   suburb ${(100 * M.COND[1][2]).toFixed(0)}%   rural ${(100 * M.COND[2][2]).toFixed(0)}%\nall ${M.TOT} students: ${(100 * M.MARG[2]).toFixed(0)}%`;
      case 'kinds': return `femur and height: r ${L.r.toFixed(3)}\n${Object.values(M.KINDS).map(k => f(k.r)).join(' · ')}`;
      case 'corr': { const n = Math.floor(M.corrN(M.clk(s, 'corr'))); return `products added ${n} of ${M.FEMUR.n}   sum ${f(M.partSum(n), 3)}\nsum ÷ ${M.FEMUR.n - 1} = ${f(M.partSum(n) / (M.FEMUR.n - 1), 3)}`; }
      case 'line': { const x = M.predX(M.clk(s, 'line')); return `x ${x.toFixed(1)} cm   ŷ ${M.yhat(x).toFixed(1)} cm${M.inRange(x) ? '' : '   extrapolation'}\nŷ = ${L.a.toFixed(1)} + ${L.b.toFixed(2)}x   s ${L.s.toFixed(2)} cm   r² ${L.r2.toFixed(3)}`; }
      case 'resid': { const k = M.resAt(M.clk(s, 'resid')).k; return k < M.FEMUR.n ? `x ${M.FEMUR.x[k].toFixed(1)}   y ${M.FEMUR.y[k].toFixed(1)}   ŷ ${M.yhat(M.FEMUR.x[k]).toFixed(1)}\nresidual ${f(L.res[k], 1)} cm` : `all ${M.FEMUR.n} residuals\nthey add to 0`; }
      case 'infl': { const p = M.xpAt(M.clk(s, 'infl')), w = M.withPoint(p.x, p.y); return `new point (${p.x.toFixed(1)}, ${p.y.toFixed(1)})\nb ${w.b.toFixed(2)} (was ${L.b.toFixed(2)})   r ${w.r.toFixed(3)} (was ${L.r.toFixed(3)})`; }
      case 'logt': { const u = M.logU(M.clk(s, 'logt')); return `${u < 0.5 ? 'count' : 'log₁₀(count)'} against t\nr ${M.bFit(u).r.toFixed(3)}`; }
    }
    return '';
  },
});
