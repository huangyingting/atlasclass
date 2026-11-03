// Chapter 7: differential equations, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);

startBook({
  no: 7, PAGES, PLATES, equations: false, clock0: 4.5,
  lookKeys: ['trace'],
  buildWorld,
  state: (clock, reduced) => ({ c: reduced ? 4 : clock }),
  readout(s, page) {
    const c = s.c;
    switch (page.scene) {
      case 'cover': { const t = M.coverT(c); return `t ${f(t)}   P ${M.COVER_P0.map(p => f(M.logi(t, p), 0)).join(' ')}`; }
      case 'coffee': { const t = M.coffeeT(c), T = M.coffee(t); return `t ${f(t, 1)} min   T ${f(T, 1)} °C   dT/dt ${f(M.coffeeRate(T))} °C/min`; }
      case 'verify': { const x = M.verifyX(c); return `x ${f(x)}   dy/dx ${f(M.dsol(x))}   x − y ${f(M.F(x, M.sol(x)))} | ${f(M.F(x, M.wrong(x)))}`; }
      case 'field': { const n = M.sketchCount(c); return `${n} of ${M.SKETCH_N} segments   slope = x − y`; }
      case 'trace': { const x = M.traceX(c), y = M.sol(x); return `x ${f(x)}  y ${f(y)}  y′ ${f(M.F(x, y))}  y″ ${f(1 - x + y)}`; }
      case 'euler': { const ep = M.eulerPhase(c), y = M.euler(ep.h)[ep.n][1]; return `h ${ep.h}   y(2) ≈ ${f(y, 4)}   true ${f(M.EXACT_E, 4)}`; }
      case 'sep': { const A = M.sepC(c); return `A = y(0) = ${f(A)}`; }
      case 'dom': { const x = M.domX(c), y = M.domSol(x); return `x ${f(x)}   y ${f(y)}   dy/dx ${f(2 * x * y * y)}`; }
      case 'exp': { const t = M.growT(c), P = M.grow(t); return `t ${f(t, 1)} h   P ${f(P, 0)}   dP/dt ${f(M.KG * P, 1)}/h`; }
      case 'logi': { const t = M.logiT(c), P = M.logi(t); return `t ${f(t)} yr   P ${f(P, 0)}   dP/dt ${f(M.logiRate(P), 1)}/yr`; }
    }
    return '';
  },
});
