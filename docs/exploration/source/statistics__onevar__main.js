// Chapter 1: exploring one-variable data, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const F = M.FIVE;

startBook({
  no: 1, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'drop': { const n = M.landed(M.dropT(M.clk(s, 'drop'))); return n < M.N ? `${n} of ${M.N} students\nlatest: ${n ? M.TIMES[n - 1] : '—'} min` : `${M.N} students   mean ${M.MEAN.toFixed(1)} min   median ${F.med} min\nSD ${M.SD.toFixed(1)} min   IQR ${M.IQR} min`; }
      case 'cat': return `${M.MODES.map(m => `${m} ${M.COUNT[m]}`).join(' · ')}   n = ${M.N}\nrelative: ${M.MODES.map(m => M.REL[m].toFixed(3)).join(' · ')}`;
      case 'shapes': return M.SHAPES.map(x => `${x.name}: mean ${x.mean.toFixed(1)}, median ${x.median}`).join('\n');
      case 'centre': { const x = M.nineAt(M.clk(s, 'centre')); return `largest ${Math.round(x[M.NINE_TOP])} min\nmean ${M.mean(x).toFixed(1)}   median ${M.median(x)}`; }
      case 'spread': { const k = M.devShown(M.clk(s, 'spread') % M.SPREAD.period), ss = M.DEV.slice(0, k).reduce((a, d) => a + d * d, 0); return `deviations ${k} of ${M.NINE.length}   Σ(x − x̄)² ${ss.toFixed(1)}\ns = √(${M.SS.toFixed(1)}/${M.NINE.length - 1}) = ${M.NINE_SD.toFixed(2)} min`; }
      case 'units': { const U = M.unitsAt(M.clk(s, 'units')); return `× ${U.k.toFixed(2)}  + ${U.a.toFixed(1)}\nmean ${M.mean(U.vals).toFixed(2)}   SD ${M.sd(U.vals).toFixed(2)}`; }
      case 'box': return `min ${F.min}  Q1 ${F.q1}  median ${F.med}  Q3 ${F.q3}  max ${F.max}\nIQR ${M.IQR}   fences ${M.FENCE.lo} and ${M.FENCE.hi}`;
      case 'compare': return `bus: median ${M.BUS5.med}, IQR ${M.BUS5.q3 - M.BUS5.q1}\ncar: median ${M.CAR5.med}, IQR ${M.CAR5.q3 - M.CAR5.q1}, outlier ${M.CAR_OUT.join(', ')}`;
      case 'normal': { const k = M.bandK(M.clk(s, 'normal')); return `within ${k} SD: model ${(100 * M.RULE[k - 1]).toFixed(1)}%\nthe ${M.HEIGHT.n} heights ${(100 * M.WITHIN[k - 1]).toFixed(1)}%`; }
      case 'ncalc': { const x = M.calcX(M.clk(s, 'ncalc')); return `x ${x.toFixed(1)} cm   z ${M.zOf(x).toFixed(2)}\nP(X < x) = ${M.normCdf(x, M.HEIGHT.mu, M.HEIGHT.sigma).toFixed(3)}`; }
      case 'check': return `heights: straight, normal is reasonable\ncommute times: curved, skewed right`;
    }
    return '';
  },
});
