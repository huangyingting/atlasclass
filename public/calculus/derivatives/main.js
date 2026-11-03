// Chapter 2: derivatives, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 3) => (x < -5e-4 ? '−' : ' ') + Math.abs(x).toFixed(n);

startBook({
  no: 2, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: reduced ? 1.7 : clock }),
  readout({ c }, page) {
    switch (page.scene) {
      case 'pair': { const x = M.pairX(c); return `x ${f(x)}   f(x) ${f(M.g(x))}\nslope f′(x) ${f(M.dg(x))}`; }
      case 'sec': { const h = M.secH(c); return `h ${f(h)} s   secant slope ${f(M.secSlope(h))} m/s\ntangent slope at t = 1:  2.000 m/s`; }
      case 'cool': { const h = M.coolH(c); return `h ${f(h, 2)} min   symmetric quotient ${f(M.symDiff(M.T, M.COOL.at, h))}\ntable estimate ${f(M.ESTIMATE, 2)}   T′(7) ${f(M.dT(M.COOL.at))} °C/min`; }
      case 'diff': { const h = M.diffH(c), s = k => { const F = M.FAILS.find(x => x.key === k).f, q = v => Math.abs(v) > 99 ? (v < 0 ? '−' : ' ') + '>99' : f(v, 2); return `${q(M.leftSlope(F, h))} | ${q(M.rightSlope(F, h))}`; };
        return `h ${f(h)}   left | right secant slopes\ncorner ${s('corner')}   cusp ${s('cusp')}\nvertical ${s('vert')}   jump ${s('jump')}`; }
      case 'cube': { const dx = M.cubeDx(c); return `x 2   Δx ${f(dx)}\nΔV/Δx ${f(M.cubeRate(dx))}   3x² ${M.cubeSlope}`; }
      case 'sum': { const x = M.sumX(c); return `x ${f(x, 2)}   u′ ${f(M.du(x), 2)}   v′ ${f(M.dv(x), 2)}\n(u + v)′ ${f(M.du(x) + M.dv(x), 2)}`; }
      case 'trig': { const x = M.sinX(c), a = M.expA(c); return `x ${f(x, 2)}   slope of sin ${f(Math.cos(x))} = cos x\neˣ ${f(Math.exp(a))}   slope ${f(Math.exp(a))}`; }
      case 'prod': { const dx = M.prodDx(c); return `Δx ${f(dx)}   ΔA/Δx ${f(M.prodRate(dx))}\nf′g + fg′ = ${M.PROD_RATE}`; }
      case 'quot': { const x = M.quotX(c); return `x ${f(x, 2)}   q ${f(M.q(x))}\nslope q′ ${f(M.dq(x))}`; }
      case 'tan': { const x = M.tanX(c); return `x ${f(x, 2)}   tan x ${f(Math.tan(x))}\nslope sec² x ${f(M.sec2(x))}`; }
    }
    return '';
  },
});
