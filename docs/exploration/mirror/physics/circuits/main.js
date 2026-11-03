// Chapter 13: Circuits, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES, CH, R } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
let W = null;

startBook({
  no: 13, PAGES, PLATES, clock0: 0,
  lookKeys: ['ohm'],
  buildWorld(E) {
    W = buildWorld(E);
    return { update: (s, look) => W.update(s, look), labels: W.labels, setMarks: W.setMarks };
  },
  state: (clock, reduced) => {
    const c = reduced ? 3 : clock * M.SLOW;
    return { clock: c, rc: M.rc(c), walk: W ? W.walk() : { sum: 0, loop: 1 } };
  },
  // ---------- questions (premium): the numbers, and the state at one physics time ----------
  setParams: M.setParams,
  // every scene at physics time t; charge keeps flowing round a frozen circuit (flow: real seconds)
  stateAt: t => ({ clock: t, flow: performance.now() / 1000, rc: M.rc(t), walk: W ? W.walk() : { sum: 0, loop: 1 } }),
  // physics seconds per real second (life speed everywhere), and how long one run lasts
  rate: () => M.SLOW,
  runOf: scene => ({ wire: M.CU.wave ? M.CU.wave[2] : 4, wires: M.RES.T, bulb: M.BULB.ramp ?? M.BULB.run, cell: M.CELL.T, kirch: 16, rc: M.RC.cycle })[scene] ?? 4,
  readout(s, page) {
    const c = s.clock;
    switch (page.scene) {
      case 'wire': if (M.CU.wave) { const t = Math.min(c, M.CU.wave[2]); return `t ${f(t, 1)} s   I ${f(M.wireI(t))} A\ncharge so far ${f(M.wireQ(t))} C`; }
        return `I ${f(M.CU.I, 1)} A   v_d ${f(M.CU.vd * 1e3, 4)} mm/s\nJ ${f(M.CU.J / 1e6, 1)} MA/m²   E ${f(M.CU.E * 1e3, 1)} mV/m`;
      case 'wires': { const L = M.resLength(c); return `L ${f(L)} m   ΔV 1.50 V\nthin R ${f(M.rThin(L))} Ω   thick R ${f(M.rThick(L))} Ω`; }
      case 'ohm': return `ΔV ${M.OHM.E < 0.1 ? f(M.OHM.E * 1e3, 1) + ' mV' : f(M.OHM.E, 1) + ' V'}   R ${M.OHM.R < 0.1 ? f(M.OHM.R * 1e6, 1) + ' µΩ' : f(M.OHM.R, 1) + ' Ω'}\nI = ΔV/R = ${f(M.OHM.E / M.OHM.R, 2)} A`;
      case 'bulb': { const t = c % (M.BULB.ramp ?? M.BULB.run), P = M.bulbP(t);
        return M.BULB.ramp ? `t ${f(t, 1)} s   ΔV ${f(M.bulbE(t), 1)} V   P ${f(P, 1)} W\nE = ∫P dt = ${f(M.bulbEnergy(t), 1)} J` : `t ${f(t, 1)} s   P ${f(P, 1)} W\nE = Pt = ${f(P * t, 1)} J`; }
      case 'cell': { const RL = M.cellLoad(c), I = M.cellI(RL); return `R ${f(RL)} Ω   I ${f(I)} A   terminal ${f(M.terminalV(I))} V\nbulb ${f(M.loadP(RL))} W   inside I²r ${f(I * I * M.CELL.r)} W`; }
      case 'sp': { const S = M.SERIES, P = M.PARALLEL, Rs = M.seriesR([S.R1, S.R2]), Rp = M.parallelR(P.R);
        return `series: ${+Rs.toPrecision(3)} Ω, ${f(S.E / Rs)} A\nparallel: ${f(Rp, 3)} Ω, ${f(P.E / Rp)} A`; }
      case 'combo': return `R_eq ${f(M.COMBO.Req, 1)} Ω\nI ${f(M.COMBO.E / M.COMBO.Req, 2)} A at every stage`;
      case 'kirch': { const k = M.solve(M.KIRCH.edges, 'bl'), I = n => M.edgeI(M.KIRCH, k, n); return `I₁ ${f(I('R1'), 3)} A   I₂ ${f(I('R5'), 3)} A   I₃ ${f(I('R3'), 3)} A\nI₂ + I₃ = ${f(I('R5') + I('R3'), 3)} A`; }
      case 'rc': { const r = s.rc; return `${r.charging ? 'charging' : 'discharging'}   t ${f(r.s, 1)} s   q ${f(r.Q * 1e3)} mC\nI ${f(r.I * 1e3, 3)} mA   ΔV_C ${f(r.Vc)} V   ΔV_R ${f(Math.abs(r.VR))} V`; }
    }
    return '';
  },
  onFrame(s, sheets) {
    const q = sel => sheets.flatMap(el => [...el.querySelectorAll(sel)]);
    const put = (key, r, x, y) => q(`circle[data-cursor="${key}"]`).forEach(el => { el.setAttribute('cx', CH.sx(x, r.x0, r.x1)); el.setAttribute('cy', CH.sy(Math.min(Math.max(y, r.y0), r.y1), r.y0, r.y1)); });
    const c = s.clock;
    // the highlighted electron (phase from world.js: its sawtooth, in units of collisions)
    const u = W ? W.oneElectron(c) : 0; put('drude', R.drude, u % 4, M.drudeV(u, 1, 1));
    const L = M.resLength(c); put('thin', R.res, L, M.rThin(L)); put('thick', R.res, L, M.rThick(L));
    const t = c % M.BULB.run; put('energy', R.energy, t, M.bulbEnergy(t));
    const RL = M.cellLoad(c), I = M.cellI(RL); put('pload', R.pload, RL, M.loadP(RL));
    put('rcq', R.rc, s.rc.c, 100 * s.rc.Q / M.RC.Qmax); put('rci', R.rc, s.rc.c, 100 * s.rc.I / M.RC.Imax);
  },
});
