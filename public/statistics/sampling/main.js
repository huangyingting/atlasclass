// Chapter 5: sampling distributions, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);

startBook({
  no: 5, PAGES, PLATES, equations: false,
  lookKeys: ['calc', 'sample', 'curve'],
  buildWorld,
  clock0: M.CLOCK0,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'draw': { const { i } = M.drawAt(M.clk(s, 'draw')), D = M.DRAW;
        return `${i < D.k ? `sample ${i + 1} of ${D.k}   x̄ ${M.DRAW_M[i].toFixed(1)}` : `${D.k} samples of ${D.n}`}\nμ ${M.MU.toFixed(2)}   σ ${M.SIGMA.toFixed(2)}   σ/√${D.n} ${M.DRAW_SE.toFixed(2)}`; }
      case 'sim': { const { i } = M.simAt(M.clk(s, 'sim')), t = M.SIM_X.slice(0, i).filter(x => x >= M.SIM.obs).length;
        return `simulated samples ${i}   with p̂ ≥ ${M.SIM_OBS.toFixed(3)}: ${t}\nestimated probability ${i ? (t / i).toFixed(3) : '–'}`; }
      case 'normal': { if (page.lit === 'area') return `P(${M.APPLE.a} < X < ${M.APPLE.b}) ${M.P_AB.toFixed(3)}\nheaviest 10%: X ≥ ${M.CUT.toFixed(1)} g`;
        const { i } = M.apsAt(M.clk(s, 'normal')); return `sample ${i + 1}: x̄ ${M.APS_M[i].toFixed(1)} g   s ${M.APS_S[i].toFixed(1)} g\nμ ${M.APPLE.mu} g, the same every time`; }
      case 'clt': return `${M.cltAt(M.clk(s, 'clt'))} of ${M.CLT.k} samples of each size\nσ/√n  ${M.CLT_SUM.map(c => `${c.n}: ${c.se.toFixed(2)}`).join('   ')}`;
      case 'targets': return `${M.tgAt(M.clk(s, 'targets'))} of ${M.TG.darts} samples\nbullseye: the parameter`;
      case 'prop': { if (page.look.curve) return `np ${M.PROP_NP}   n(1 − p) ${M.PROP_NQ}\nP(p̂ ≥ ${M.PROP.cut}) ${M.PROP_TAIL.toFixed(3)}   simulated ${M.PROP_SIMTAIL.toFixed(2)}`;
        const { i } = M.propAt(M.clk(s, 'prop')); return `${i < M.PROP.k ? `sample ${i + 1}: p̂ ${M.PROP_PH[i].toFixed(2)}` : `${M.PROP.k} samples of ${M.PROP.n}`}\nμ = p ${M.PROP.p}   σ ${M.PROP_SD.toFixed(4)}`; }
      case 'pdiff': { const { i } = M.pdAt(M.clk(s, 'pdiff'));
        return `${i < M.PD.k ? `p̂₁ − p̂₂ = ${f(M.PD.pairs[i][0])} − ${f(M.PD.pairs[i][1])} = ${f(M.PD_D[i])}` : `${M.PD.k} pairs of samples`}\nmean ${f(M.PD_MU)}   SD ${M.PD_SD.toFixed(4)}`; }
      case 'xbar': { const { i } = M.xbAt(M.clk(s, 'xbar')); return `sample of ${M.XB.n}: x̄ ${M.XB_M[i].toFixed(1)} g\nσ/√n = ${M.XB.sigma}/√${M.XB.n} = ${M.XB_SE} g`; }
      case 'mdiff': { const { i } = M.mdAt(M.clk(s, 'mdiff')), [a, b] = M.MD.pairs[i];
        return `x̄(A) − x̄(B) = ${a.toFixed(1)} − ${b.toFixed(1)} = ${f(a - b, 1)} g\nmean ${M.MD_MU} g   SD ${M.MD_SD.toFixed(2)} g`; }
    }
    return '';
  },
});
