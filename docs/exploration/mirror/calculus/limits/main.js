// Chapter 1: limits and continuity, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 3) => { if (!Number.isFinite(x)) return 'undefined'; const a = Math.abs(x).toFixed(n); return (x < 0 && +a ? '−' : '') + a; };
const pair = (fn, a, h, n = 3) => `x ${f(a - h, n)}   f(x) ${f(fn(a - h), n)}\nx ${f(a + h, n)}   f(x) ${f(fn(a + h), n)}`;

startBook({
  no: 1, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  // t: the sliding points' time in their run; clock: the slow sweeps (1.13, 1.16)
  state: (clock, reduced) => reduced ? { t: 2, resting: false, clock: 2 } : { ...M.loop(clock * M.SLOW), clock: clock * M.SLOW },
  readout(s, page) {
    const h = (h0 = 1.5) => M.gap(s.t, h0);
    switch (page.scene) {
      case 'open': return pair(M.sinc, 0, h(M.OPEN.h0), 4);
      case 'sec': { const d = h(M.H1); return `h ${f(d)}   Q (${f(M.P1 + d)}, ${f(M.sq(M.P1 + d))})\nsecant slope ${f(M.secant(d))} → ${M.TAN1}`; }
      case 'lim': return pair(M.f2, M.A2, h());
      case 'one': return pair(M.g3, M.A3, h(1.8));
      case 'tab': return pair(M.e4, 0, h(M.H4), 4);
      case 'prop': { const x = M.C5 - h(1.8); return `x ${f(x)}   f ${f(M.f5(x))}   g ${f(M.g5(x))}\nf + g ${f(M.f5(x) + M.g5(x))}   f·g ${f(M.f5(x) * M.g5(x))}`; }
      case 'alg': { const d = h(1.5), e = h(3); return `x ${f(M.A6F - d)}   factored ${f(M.fac6(M.A6F - d))}\nx ${f(M.A6R - e)}   rationalized ${f(M.rat6(M.A6R - e))}`; }
      case 'pick': { const x = 1 - h(); return `x ${f(x)}\n${f(M.sub7(x))}   ${f(M.zero7(x))}   ${f(M.inf7(1 - h(1.2)), 1)}`; }
      case 'sqz': { const x = h(0.9), y = h(2.8); return `x ${f(x, 4)}   x² sin(1/x) ${f(M.wig8(x), 4)}   ±${f(x * x, 4)}\nx ${f(y, 4)}   sin x / x ${f(M.sinc8(y), 4)}`; }
      case 'rep': return pair(M.s9, 0, h(2.2), 4);
      case 'disc': { const x = 1 - h(); return `x → 1⁻: jump ${f(M.jump10(x))}   infinite ${f(M.inf10(1 - h(1.4)), 1)}\nx → 1⁺: jump ${f(M.jump10(1 + h()))}   infinite ${f(M.inf10(1 + h(1.4)), 1)}`; }
      case 'cont': return pair(M.c11, M.A11, h(1.6));
      case 'ival': { const x = M.pen12(s.t); return `x ${f(x)}   √(9 − x²) ${f(M.semi(x))}\npen down on [−3, ${f(x, 2)}]`; }
      case 'fix': { const k = M.k13(s.clock), L = M.left13(k, M.A13); return `k ${f(k)}   left limit 2k + 1 = ${f(L)}\nright limit ${f(M.right13(M.A13))}   ${Math.abs(L - 3) < 0.03 ? 'continuous' : 'gap ' + f(Math.abs(L - 3), 2)}`; }
      case 'vert': return pair(M.r14, M.A14, h(2.5), 3);
      case 'horiz': { const x = Math.min(M.far15(s.t), 19.9); return `x ${f(-x, 2)}   f(x) ${f(M.f15(-x))}\nx ${f(x, 2)}   f(x) ${f(M.f15(x))}`; }
      case 'ivt': { const N = M.N16(s.clock), c = M.c16(N); return `N ${f(N)}   c ${f(c, 4)}\nf(c) ${f(M.f16(c))}`; }
    }
    return '';
  },
});
