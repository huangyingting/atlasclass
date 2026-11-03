// Chapter 5: analyzing functions, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-9 ? '−' : ' ') + Math.abs(x).toFixed(n);

startBook({
  no: 5, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: reduced ? 4 : clock * M.SLOW * 2 }),
  readout(s, page) {
    const c = s.c;
    switch (page.scene) {
      case 'stack': { const x = M.stackX(c); return `x ${f(x)}   f ${f(M.f(x))}\nf′ ${f(M.df(x))}   f″ ${f(M.d2f(x))}`; }
      case 'mvt': { const x = M.mvtX(c); return `x ${f(x)}   f′(x) ${f(M.df(x))}\nsecant slope ${f(M.MS)}`; }
      case 'evt': return `level line y ${f(M.evtY(c))}\nmax ${f(M.f(M.C1))}   min ${f(M.f(M.C2))}`;
      case 'inc': { const x = M.incX(c); return `x ${f(x)}   f′(x) ${f(M.df(x))}\nf is ${M.df(x) > 0 ? 'increasing' : 'decreasing'}`; }
      case 'fdt': { const x = M.fdtX(c); return `x ${f(x)}   g′(x) ${f(M.dg(x))}\ng is ${M.dg(x) > 0 ? 'increasing' : 'decreasing'}`; }
      case 'cand': { const x = M.candX(c); return `x ${f(x)}   h(x) ${f(M.h(x))}\nh′(x) ${f(M.dh(x))}`; }
      case 'conc': { const x = M.concX(c); return `x ${f(x)}   f″(x) ${f(M.d2f(x))}\nconcave ${M.d2f(x) > 0 ? 'up' : 'down'}`; }
      case 'sdt': { const x = M.sdtX(c); return `x ${f(x)}   f′ ${f(M.df(x))}\nf″ ${f(M.d2f(x))}: opens ${M.d2f(x) > 0 ? 'up' : 'down'}`; }
      case 'read': { const x = M.readX(c); return `x ${f(x)}   p′(x) ${f(M.dp(x))}\np(x) ${f(M.p(x))}`; }
      case 'fence': { const x = M.fenceX(c); return `x ${f(x, 1)} m   A ${f(M.area(x), 0)} m²\nA′ ${f(M.darea(x), 1)} m²/m`; }
      case 'box': { const x = M.boxX(c); return `x ${f(x)} cm   V ${f(M.vol(x), 0)} cm³\nV′ ${f(M.dvol(x), 0)} cm³/cm`; }
      case 'impl': { const [x, y] = M.ICURVE(M.implTh(c)), d = 2 * y - x; return `(${f(x).trim()}, ${f(y).trim()})\ndy/dx ${Math.abs(d) < 0.02 ? 'vertical' : f(M.slope(x, y))}`; }
    }
    return '';
  },
});
