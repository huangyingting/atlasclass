// Chapter 3: composite, implicit and inverse functions, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -0.5 * 10 ** -n ? '−' : '') + Math.abs(x).toFixed(n);
const sl = v => Math.abs(v) > 200 ? 'vertical' : f(v, 3);

startBook({
  no: 3, PAGES, PLATES, equations: false,
  lookKeys: ['conc'],
  buildWorld,
  state: (clock, reduced) => ({ c: reduced ? 3 : clock * M.SLOW }),
  readout(s, page) {
    const c = s.c;
    switch (page.scene) {
      case 'gears': { const n = M.turns(c); return `turns: x ${f(n)}   u ${f(n * M.DU_DX)}   y ${f(n * M.DY_DX)}`; }
      case 'chain': { const x = M.chainX(c), u = M.g(x); return `x ${f(x)}   ${f(M.fp(u), 3)} × ${f(M.gp(x), 3)} = h′ ${f(M.hp(x), 3)}`; }
      case 'circle': { const a = M.circAngle(c), x = M.R * Math.cos(a), y = M.R * Math.sin(a);
        return page.look.conc ? `(${f(x)}, ${f(y)})   y″ ${Math.abs(y) < 0.05 ? 'undefined' : f(M.circY2(x, y), 3)}` : `(${f(x)}, ${f(y)})   dy/dx ${sl(-x / y)}`; }
      case 'folium': { const [x, y] = M.folAt(Math.tan(M.folTheta(c))); return `(${f(x)}, ${f(y)})   dy/dx ${sl(M.folSlope(x, y))}`; }
      case 'inverse': return `turned ${(M.flip(c) * 180 / Math.PI).toFixed(0).padStart(3)}°   f′(${M.IA}) = ${M.invp(M.IA)} → (f⁻¹)′(${M.IB}) = 1/${M.invp(M.IA)}`;
      case 'trig': { const x = M.trigX(c); return `x ${f(x)}   arcsin′ ${f(M.asinp(x), 3)}   arctan′ ${f(M.atanp(x), 3)}`; }
      case 'select': { const x = M.selX(c); return `x ${f(x)}   q ${f(M.q(x), 3)}   q′ ${f(M.qp(x), 3)}`; }
      case 'high': { const x = M.highX(c); return `x ${f(x)}   f ${f(M.sd(0, x))}   f′ ${f(M.sd(1, x))}   f″ ${f(M.sd(2, x))}`; }
    }
    return '';
  },
});
