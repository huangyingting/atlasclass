// Chapter 10: infinite series, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 3) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(n);
const L = { err: 0, full: 0 };   // the last look, so a breakdown reads what the figure shows
const plates = Object.fromEntries(Object.entries(PLATES).map(([k, p]) => [k, { text: p.text, facts: s => p.facts({ ...s, err: L.err > 0.5, full: L.full > 0.5 }) }]));
const n = (s, k) => M.count(s, k).n;

startBook({
  no: 10, PAGES, PLATES: plates, equations: false,
  lookKeys: ['err', 'full'],
  buildWorld(E) {
    const W = buildWorld(E);
    return { labels: W.labels, update: (s, look) => { L.err = look.err || 0; L.full = look.full || 0; W.update(s, look); } };
  },
  state: (clock, reduced) => ({ t: clock, still: reduced }),
  forceLook(selected, look) {
    if (selected === 'altBand') look.err = 1;
  },
  readout(s, page) {
    switch (page.scene) {
      case 'tower': { const N = page.look.full ? M.STEP.tower.max : n(s, 'tower'); return `N ${N}   S_N ${f(M.geoS(N))}\nsum a/(1 − r) = ${M.GSUM}`; }
      case 'tele': { const N = n(s, 'tele'); return `n ${N}   a_n ${f(M.tele(N), 4)}\nS_n = 1 − 1/(n + 1) = ${f(M.teleS(N), 4)}`; }
      case 'nth': { const N = n(s, 'nth'); return `n ${N}   a_n ${f(M.nth(N), 4)} → 0.5\nS_n ${f(M.sum(M.nth, N))} → ∞`; }
      case 'integral': { const N = Math.min(n(s, 'integral') + 1, 10); return `Σ to n = ${N}: ${f(M.sum(M.itf, N), 4)}\n∫₁^∞ = π/4 = ${f(M.IT_INT, 4)}`; }
      case 'pser': { const N = n(s, 'pser'); return `n ${N}\np = 1: ${f(M.harmS(N))}   p = 2: ${f(M.baselS(N))}`; }
      case 'cmp': { const N = n(s, 'cmp'); return `n ${N}   a_n ${f(M.cmpA(N), 4)} ≤ b_n ${f(M.cmpB(N), 4)}\na_n/b_n ${f(M.cmpA(N) / M.cmpB(N))} → 1`; }
      case 'alt': {
        if (L.err > 0.5) return `S₄ ${f(M.ERR_S, 4)}   S₅ ${f(M.altS(M.ERR_N + 1), 4)}\nerror ${f(M.ERR_TRUE, 4)} ≤ b₅ = ${f(M.ERR_BOUND, 1)}`;
        const N = n(s, 'alt'); return `n ${N}   S_n ${f(M.altS(N), 4)}\nln 2 = ${f(M.LN2, 4)}`;
      }
      case 'ratio': { const N = n(s, 'ratio'); return `n ${N}   a_n ${f(M.rat(N), 4)}\na_{n+1}/a_n ${f(M.ratQ(N), 4)} → 1/3`; }
      case 'abs': { const N = n(s, 'abs'); return `n ${N}\nΣ a_n ${f(M.altS(N))}   Σ |a_n| ${f(M.harmS(N))}`; }
      case 'taylor': {
        const d = n(s, 'taylor') - 1; return `degree ${d}   P(1) ${f(M.expP(d, 1), 4)}\ne = ${f(M.TE, 4)}`;
      }
      case 'lagrange': { const x = n(s, 'lagrange') / M.STEP.lagrange.max; return `x ${f(x, 3)}   error ${f(M.lagErr(x), 4)}\nbound 3x⁴/4! ${f(M.lagBound(x), 4)}`; }
      case 'interval': { const N = n(s, 'interval'); return `N ${N}   at x = 4: ${f(M.intP(N, 4), 4)}\nsum there ${f(M.intF(4), 4)}`; }
      case 'maclaurin': { const k = n(s, 'maclaurin'); return `degree ${2 * k - 1}\nP(3) ${f(M.sinP(k, 3), 4)}   sin 3 ${f(Math.sin(3), 4)}`; }
      case 'atan': { const k = n(s, 'atan'); return `${k} terms, x = 0.5\n${f(M.atanP(k, 0.5), 4)}   arctan ${f(M.AT_TRUE, 4)}`; }
    }
    return '';
  },
});
