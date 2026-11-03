// Chapter 9: parametric equations, polar coordinates and vector-valued functions, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -0.5 * 10 ** -n ? '−' : ' ') + Math.abs(x).toFixed(n);
const big = (x, n = 2) => Number.isFinite(x) && Math.abs(x) < 1e4 ? f(x, n) : ' undefined';
const ease = u => u * u * (3 - 2 * u);

// the state of every scene at this moment: each runs its own loop
export function stateOf(clock, reduced) {
  const u = k => reduced ? 0.8 : ease(M.loop(clock, M.RUNS[k]).u), step = k => reduced ? 0.999 : M.loop(clock, M.RUNS[k], 1.5).u;
  const tOf = k => M.T0 + (M.T1 - M.T0) * u(k);
  return {
    lift: tOf('lift'), slope: tOf('slope'), concave: tOf('concave'), vec: tOf('vec'),
    arc: M.CHORD_NS[Math.min(Math.floor(step('arc') * M.CHORD_NS.length), M.CHORD_NS.length - 1)],
    integ: reduced ? M.STEPS : M.STEPS * M.loop(clock, M.RUNS.integ, 1.5).u,
    wheel: M.CT1 * u('wheel'),
    polar: 2 * Math.PI * u('polar'), pslope: 2 * Math.PI * (reduced ? 0.25 : M.loop(clock, M.RUNS.pslope, 0.8).u),
    parea: Math.min(Math.floor(step('parea') * M.WEDGE_NS.length), M.WEDGE_NS.length - 1),
    between: -M.THT + 2 * M.THT * u('between'),
  };
}

startBook({
  no: 9, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: stateOf,
  // two short lines: the corner is narrow
  readout(s, page) {
    const t2 = x => f(x).trim();
    switch (page.scene) {
      case 'slope': { const t = s.slope; return `t ${t2(t)}   dy/dx ${big(M.slope(t)).trim()}\ndx/dt ${t2(M.DX(t))}   dy/dt ${t2(M.DY(t))}`; }
      case 'concave': { const t = s.concave; return `t ${t2(t)}   dy/dx ${big(M.slope(t)).trim()}\nd²y/dx² ${big(M.d2(t), 3).trim()}`; }
      case 'arc': return `${s.arc} chords ${M.chordLen(s.arc).toFixed(4)}\nlength ${M.LOOP_L.toFixed(4)}`;
      case 'vec': { const t = s.vec; return `t ${t2(t)}   speed ${M.speed(t).toFixed(2)}\nv ⟨${t2(M.DX(t))}, ${t2(M.DY(t))}⟩`; }
      case 'integ': { const k = Math.min(Math.floor(s.integ), M.STEPS), [x, y] = M.sumPath(k)[k]; return `${k} of ${M.STEPS} steps\nsum ⟨${t2(x)}, ${t2(y)}⟩`; }
      case 'wheel': { const t = s.wheel; return `t ${t.toFixed(2)}   speed ${M.cspeed(t).toFixed(2)}\ndistance ${M.cdist(t).toFixed(2)}`; }
      case 'polar': { const th = s.polar; return `θ ${th.toFixed(2)}   r ${M.R(th).toFixed(2)}\n(${t2(M.PX(th))}, ${t2(M.PY(th))})`; }
      case 'pslope': { const th = s.pslope; return `θ ${th.toFixed(2)}   dr/dθ ${t2(M.DR(th))}\ndy/dx ${big(M.pslope(th)).trim()}`; }
      case 'parea': { const n = M.WEDGE_NS[s.parea]; return `${n} wedges ${M.wedgeSum(n).toFixed(4)}\nexact ${M.AQ.toFixed(4)}`; }
      case 'between': { const th = s.between; return `θ ${t2(th)}   R ${M.R(th).toFixed(2)}\narea ${M.abSoFar(th).toFixed(3)} of ${M.AB.toFixed(3)}`; }
    }
    const t = s.lift;
    return `t ${t2(t)}\nx ${t2(M.X(t))}   y ${t2(M.Y(t))}`;
  },
});
