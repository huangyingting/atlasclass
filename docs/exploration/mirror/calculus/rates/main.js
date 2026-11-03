// Chapter 4: derivatives in context, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -5 * 10 ** -(n + 1) ? '−' : ' ') + Math.abs(x).toFixed(n);
// each scene runs on its own loop: [model, rate (model units per second), run, and the moment shown with reduced motion]
const SCENES = {
  coffee: [M.COFFEE.rate, M.COFFEE.run, M.COFFEE.at],
  part: [M.PART.rate, M.PART.run, 2.5],
  balloon: [M.BAL.rate, M.BAL.run, (M.BAL.at - M.BAL.r0) / (M.BAL.r1 - M.BAL.r0) * M.BAL.run],
  table: [M.TAB.rate * 2, 12, M.TAB.at],
  pond: [M.POND.rate, M.POND.run, M.POND.at / M.POND.drdt],
  ladder: [M.LAD.rate, M.LAD.run, (M.LAD.at - M.LAD.x0) / M.LAD.dxdt],
  cone: [M.CONE.rate, M.CONE.run, M.coneV(M.CONE.at) / M.CONE.q],
  shadow: [M.SHA.rate, M.SHA.run, (M.SHA.at - M.SHA.x0) / M.SHA.v],
  lin: [M.LIN.rate, M.LIN.run, M.LIN.run],
  over: [M.OVR.rate, M.OVR.run, M.OVR.run * 0.6],
  lh: [M.LH.rate, M.LH.run, 2],
  inf: [M.INF.rate, M.INF.run, 3],
};

startBook({
  no: 4, PAGES, PLATES, equations: false,
  lookKeys: ['rest', 'speed'],
  buildWorld,
  state: (clock, reduced) => Object.fromEntries(Object.entries(SCENES).map(([k, [rate, run, still]]) =>
    [k, reduced ? { t: still, resting: false } : M.loop(clock * rate, run, 1.2 * rate)])),
  readout(s, page) {
    switch (page.scene) {
      case 'coffee': { const t = s.coffee.t; return `t ${f(t, 1)} min   T ${f(M.temp(t))} °C\nT′(t) ${f(M.dtemp(t))} °C/min`; }
      case 'part': { const t = s.part.t; return `t ${f(t)} s   x ${f(M.px(t))} m\nv ${f(M.pv(t))} m/s   a ${f(M.pa(t))} m/s²`; }
      case 'balloon': { const q = M.balR(s.balloon.t); return `r ${f(q)} cm   V ${f(M.bvol(q), 1)} cm³\ndV/dr ${f(M.bdvol(q), 1)} cm³ per cm`; }
      case 'table': { const t = s.table.t; let i = 0; while (i < 3 && t > M.TAB.t[i + 1]) i++; return `t ${f(t, 1)} h\naverage rate on [${M.TAB.t[i]}, ${M.TAB.t[i + 1]}]: ${f(M.tabSlope(i))} gal/h`; }
      case 'pond': { const q = M.pondR(s.pond.t); return `t ${f(s.pond.t, 1)} s   r ${f(q)} m   A ${f(M.pondA(q))} m²\ndr/dt  0.50 m/s   dA/dt ${f(M.pondDA(q))} m²/s`; }
      case 'ladder': { const x = M.ladX(s.ladder.t); return `x ${f(x)} m   y ${f(M.ladY(x))} m\ndx/dt ${f(M.LAD.dxdt)} m/s   dy/dt ${f(M.ladDY(x))} m/s`; }
      case 'cone': { const h = M.coneHt(s.cone.t); return `t ${f(s.cone.t, 1)} min   h ${f(h)} m   V ${f(M.coneV(h))} m³\ndV/dt ${f(M.CONE.q)} m³/min   dh/dt ${f(M.coneDH(h), 3)} m/min`; }
      case 'shadow': { const x = M.shaX(s.shadow.t); return `x ${f(x)} m   s ${f(M.shaS(x))} m\nds/dt ${f(M.SHA_DS, 3)} m/s   tip ${f(M.SHA_TIP, 3)} m/s`; }
      case 'lin': { const k = M.zoomK(s.lin.t), x = 4 + 2 * k; return `zoom ×${Math.round(M.ZOOM0 / k)}   at x = ${f(x, 3)}\n√x ${f(M.sq(x), 4)}   L(x) ${f(M.sqL(x), 4)}`; }
      case 'over': { const x = M.ovrX(s.over.t), u = M.ovrU(s.over.t); return `x ${f(x)}   L ${f(M.sqL(x), 3)}  √x ${f(M.sq(x), 3)}  over\nx ${f(u)}   L ${f(M.exL(u), 3)}  eˣ ${f(Math.exp(u), 3)}  under`; }
      case 'lh': { const x = M.lhX(s.lh.t); return `x ${f(x, 4)}   f/g ${f(M.lhF(x) / M.lhG(x), 4)}\nf′/g′ ${f(M.lhDF(x) / M.lhDG(x), 4)}   → 0.5`; }
      case 'inf': { const x = M.infX(s.inf.t); return `x ${f(x)}   x²/eˣ ${M.r0(x).toPrecision(3)}\n2x/eˣ ${M.r1(x).toPrecision(3)}   2/eˣ ${M.r2(x).toPrecision(3)}`; }
    }
    return '';
  },
});
