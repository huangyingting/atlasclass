// Chapter 8: applications of integration, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 3) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const rev = (c, label, a, b, size) => { const u = M.revPhase(c); return u.slide < 0 ? `turning: ${Math.round(u.sweep * 360)}°` : (x => `${label} ${f(x, 2)}   ${size(x)}`)(a + u.slide * (b - a)); };

startBook({
  no: 8, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: reduced ? 4.5 : clock }),
  readout({ c }, page) {
    switch (page.scene) {
      case 'avg': { const n = M.avgN(c); return `n ${n}   mean of samples ${f(M.sampleMean(n), 4)}\nf_avg = 7.5 / 3 = ${f(M.AV.avg)}`; }
      case 'pva': { const t = M.pvTime(c); return `t ${f(t, 2)} s   v ${f(M.pv(t))} m/s   x ${f(M.px(t))} m\n∫v dt ${f(M.px(t) - M.px(0))} m   ∫|v| dt ${f(M.pdist(t))} m`; }
      case 'tank': { const t = M.tkTime(c); return `t ${f(t, 2)} min   R ${f(M.tR(t), 2)}   D ${f(M.tD(t), 2)} L/min\nA(t) = 30 + ∫(R − D) = ${f(M.tA(t), 2)} L`; }
      case 'areax': { const x = M.axX(c); return `x ${f(x)}   strip height ${f(M.AX.f(x) - M.AX.g(x))}\narea so far ${f(2 * x * x - 2 / 3 * x ** 3)}   whole ${f(M.AX.area)}`; }
      case 'areay': { const y = M.ayY(c), F = u => u * u / 2 + 2 * u - u ** 3 / 3; return `y ${f(y)}   strip length ${f(M.AY.right(y) - M.AY.left(y))}\narea so far ${f(F(y) - F(-1))}   whole ${f(M.AY.area)}`; }
      case 'multi': { const x = M.mxX(c); return `x ${f(x)}   ∫(f − g) dx ${f(M.mxSigned(x))}\n∫|f − g| dx ${f(M.mxAbs(x))}`; }
      case 'squares': { const x = M.csX(c), s = M.CS.s(x); return `x ${f(x)}   side ${f(s)}   A = s² ${f(s * s)}\nV = ∫ s² dx = ${f(M.CS.square)}`; }
      case 'tri': { const x = M.csX(c), s = M.CS.s(x); return `x ${f(x)}   s ${f(s)}\nV: triangles ${f(M.CS.tri)}   semicircles ${f(M.CS.semi)}`; }
      case 'discx': return rev(c, 'x', 0.06, 3.94, x => `R ${f(Math.sqrt(x))}   πR² ${f(Math.PI * x)}`) + `\nV = 8π ≈ ${f(M.DX.vol)}`;
      case 'discv': return rev(c, 'y', 0.05, 1.95, y => `R ${f(4 - y * y)}   πR² ${f(Math.PI * (4 - y * y) ** 2)}`) + `\nV = 256π/15 ≈ ${f(M.DV.vol)}`;
      case 'washx': return rev(c, 'x', 0.15, 3.85, x => `R ${f(Math.sqrt(x))}   r ${f(x / 2)}`) + `\nV = 8π/3 ≈ ${f(M.WX.vol)}`;
      case 'washo': return rev(c, 'x', 0.15, 3.85, x => `R ${f(Math.sqrt(x) + 1)}   r ${f(x / 2 + 1)}`) + `\nV = 16π/3 ≈ ${f(M.WO.vol)}`;
      case 'arc': { const n = M.alN(c), t = M.alT(c); return `${n} chord${n > 1 ? 's' : ''}: ${f(M.chordLen(n), 4)}   curve: ${f(M.AL.len, 4)}\nparticle: t ${f(t, 2)}   travelled ${f(M.alDist(t))}`; }
    }
    return '';
  },
});
