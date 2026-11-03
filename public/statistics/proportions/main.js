// Chapter 6: inference for proportions, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f3 = x => x.toFixed(3), f4 = x => x.toFixed(4);

startBook({
  no: 6, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  // the opener starts with all fifty intervals drawn, then they are drawn again
  clock0: M.SIM.reps * M.SIM.every,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'rods': { const m = M.rodsShown(M.clk(s, 'rods')), k = M.caught(m); return `samples ${m}   p = ${M.SIM.p}   n = ${M.SIM.n}\ncapture p: ${k} of ${m} (${(100 * k / m).toFixed(0)}%)`; }
      case 'why': { const m = M.whyDrawn(M.clk(s, 'why')); return `samples drawn ${m} of each size\nnp = ${M.whyCounts[0][0]} | np = ${M.whyCounts[1][0]}`; }
      case 'build': { const b = M.SAMPLES[M.buildAt(M.clk(s, 'build')).i]; return `p̂ ${f3(b.ph)}   SE ${f4(M.se1(b.ph, M.SIM.n))}\n95% interval (${f3(b.lo)}, ${f3(b.hi)}): ${b.hit ? 'captures' : 'misses'} p`; }
      case 'size': { const n = M.sizeN(M.clk(s, 'size')); return `n ${Math.round(n)}   ME ${f3(M.meOf(n))}\nME ≤ ${M.SIZE.ME} needs n = ${M.N_NEED}`; }
      case 'width': { const C = M.widthC(M.clk(s, 'width')); return `C ${(100 * C).toFixed(1)}%   z* ${f3(M.zStar(C))}\ninterval (${f3(M.bikeP - M.meAt(C))}, ${f3(M.bikeP + M.meAt(C))})`; }
      case 'nul': { const m = M.nulShown(M.clk(s, 'nul')), k = M.NULL_SIMS.slice(0, m).filter(v => v >= M.testP - 1e-12).length; return `simulated under H₀: ${k} of ${m} at or above ${M.testP}\nz ${M.testZ.toFixed(2)}   p-value ${f4(M.testPV)}`; }
      case 'decide': { const a = M.decideA(M.clk(s, 'decide')); return `α ${f3(a)}   z* ${f3(M.zCrit(a))}   z ${M.testZ.toFixed(2)}\n${M.testPV < a ? 'p-value < α: reject H₀' : 'p-value > α: fail to reject H₀'}`; }
      case 'power': { const n = M.powerN(M.clk(s, 'power')), r = M.powerOf(n); return `n ${n}   cut-off p̂ ${f4(r.crit)}\nα ${M.TEST.alpha}   β ${f3(r.beta)}   power ${f3(r.power)}`; }
      case 'diff': return `p̂₁ − p̂₂ ${M.BIG_CI.d.toFixed(2)}\n(${f3(M.BIG_CI.lo)}, ${f3(M.BIG_CI.hi)})  |  (${f3(M.SMALL_CI.lo)}, ${f3(M.SMALL_CI.hi)})`;
      case 'two': return `p̂c ${f3(M.fluPc)}   SE ${f4(M.fluSE)}\nz ${M.fluZ.toFixed(2)}   p-value ${f4(M.fluPV)}`;
    }
    return '';
  },
});
