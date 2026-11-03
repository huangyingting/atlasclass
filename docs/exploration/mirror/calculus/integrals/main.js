// Chapter 6: integration, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 3) => (x < -5e-10 ? '−' : '') + Math.abs(x).toFixed(n);

startBook({
  no: 6, PAGES, PLATES, equations: false,
  lookKeys: ['cyc', 'feat', 'open'],
  buildWorld,
  state: (clock, reduced) => ({ c: reduced ? 3.3 : clock }),
  readout({ c }, page) {
    switch (page.scene) {
      case 'flow': { const t = M.flowT(c); return `t ${f(t, 2)} s   v ${f(M.v1(t), 2)} m/s\narea so far ${f(M.X1(t))} m`; }
      case 'cycle': { const k = M.kindAt(c); return `${k}, n = ${M.N2}   sum ${f(M.sum(k, M.N2))}\nexact 28/3 = ${f(M.EXACT)}`; }
      case 'open': { const r = M.sum('right', M.N0); return `right sum, n = ${M.N0}   R ${f(r)}\nexact 28/3 = ${f(M.EXACT)}`; }
      case 'refine': { const n = M.nAt(c), r = M.sum('right', n); return `right sum, n = ${n}   R ${f(r)}\nexact ${f(M.EXACT)}   error ${f(r - M.EXACT)}`; }
      case 'acc': { const x = M.accX(c); return `x ${f(x, 2)}   f(x) ${f(M.fS(x))}\ng(x) ${f(M.gS(x))}   g′(x) = f(x)`; }
      case 'prop': { const x = M.propC(c), l = M.intS(M.S.a, x), r = M.intS(x, M.S.b); return `c ${f(x, 2)}   left ${f(l)}   right ${f(r)}\nsum ${f(l + r)} = 2π − 4`; }
      case 'ftc': { const b = M.ftcB(c), C = M.ftcC(c); return `b ${f(b, 2)}   C ${f(C, 2)}\narea ${f(M.F7(b) - M.F7(M.T7.a))}   F(b) − F(a) ${f(M.F7(b) + C - M.F7(M.T7.a) - C)}`; }
      case 'family': { const x = M.famX(c); return `x ${f(x, 2)}\nevery slope ${f(M.f8(x))} = x² − 1`; }
      case 'sub': { const x = M.subX(c); return `x ${f(x)}   u = x² ${f(x * x)}\narea in x ${f(M.simpson(M.h9, 0, x))}   in u ${f(Math.sin(x * x))}`; }
      case 'div': { const k = M.lift10(c); return `remainder layer ${k > 0.98 ? 'on the axis' : k < 0.02 ? 'stacked on x + 1' : 'moving'}\n∫₀² ${f(M.DIV10)}   ∫₋₁¹ square ${f(M.SQV10)}`; }
      case 'parts': { const s = M.partsS(c); return `u ${f(s)}   v ${f(Math.exp(s))}   uv ${f(s * Math.exp(s))}\n∫v du ${f(M.vdu(s))}   ∫u dv ${f(M.udv(s))}`; }
      case 'pf': { const x = M.pfX(c); return `x ${f(x, 2)}   1/x ${f(M.pA12(x))}   −1/(x+3) ${f(M.pB12(x))}\nsum ${f(M.f12(x))}   ∫₁³ = ln 2 = ${f(M.PF12)}`; }
      case 'improper': { const b = M.impB(c); return `b ${f(b, 2)}\n∫ 1/x² ${f(M.area2(b))}   ∫ 1/x ${f(M.area1(b))}`; }
      case 'pick': { const { i } = M.pickAt(c), p = M.PICK[i]; return `${p.how}\n∫₀³ = ${f(p.val)}`; }
    }
    return '';
  },
});
