// Chapter 9: inference for slopes, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (v, d = 2) => (v < -1e-12 ? '−' : '') + Math.abs(v).toFixed(d);

startBook({
  no: 9, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'model': { const t = M.modelT(M.clk(s, 'model')), k = M.DATA.x.filter((_, i) => M.drawn(i, t) > 0).length;
        return `μ_y = ${M.POP.alpha} + ${M.POP.beta}x   σ = ${M.POP.sigma}\nstudents drawn ${k} of ${M.N}${k === M.N ? `   ŷ = ${f(M.OUT.a, 2)} + ${f(M.OUT.b, 3)}x` : ''}`; }
      case 'fan': { const k = M.fanCount(M.fanT(M.clk(s, 'fan'))), c = M.FAN[Math.max(k - 1, 0)];
        return `sample ${k}   b = ${f(c.b, 3)}\nβ = ${M.POP.beta}   σ_b = ${f(M.SIGMA_B, 3)}`; }
      case 'resid': return `ŷ = ${f(M.OUT.a, 3)} + ${f(M.OUT.b, 3)}x\ns = ${f(M.OUT.s, 3)}   r² = ${M.OUT.r2}%`;
      case 'ci': { const I = M.interval(M.ciC(s)); return `${(100 * I.C).toFixed(1)}%   t* = ${I.ts.toFixed(3)}   df = ${M.DF}\nβ in (${f(I.lo, 3)}, ${f(I.hi, 3)})`; }
      case 'nul': return `H₀: β = 0   Hₐ: β ≠ 0\nours: b = ${f(M.OUT.b, 3)}`;
      case 'tdist': return `T = ${M.OUT.t} (output)   df = ${M.DF}\nP = ${M.OUT.p.toFixed(3)} (two-sided)`;
      case 'choose': { const k = M.caseAt(M.clk(s, 'choose')); return `${M.CASES[k][0]}\n→ ${M.PROCS[M.CASES[k][1]][0]}`; }
    }
    return '';
  },
});
