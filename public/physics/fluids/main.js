// Chapter 8: fluids, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES, CURSORS } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const kPa = (p, n = 1) => `${f(p / 1000, n)} kPa`;
const q = M.asked;   // a number the question asks for reads ?

startBook({
  no: 8, PAGES, PLATES, clock0: 0,
  lookKeys: [],
  buildWorld(E) {
    const W = buildWorld(E);
    return { update: s => W.update(s.clock), labels: W.labels, setMarks: W.setMarks };
  },
  // everything the pages and plates read, straight from the model (a reduced-motion reader gets one still moment)
  state: (clock, reduced) => {
    const c = reduced ? 5.0 : clock, Vt = M.PIPE1.vol;
    return { clock: c, st4: M.buoy(M.buoyBottom(c)), slab6: M.PIPE1.sOfVol(((0.04 * Vt + M.FLOW.Q * c) % Vt + Vt) % Vt), h8: M.tankH(M.loop(c, M.TANK.Tdrain).t) };
  },
  // ---------- questions (premium): the numbers, and the state at one physics time ----------
  setParams: M.setParams,
  // every scene at physics time t: the lesson's clock is physics time, so a question's t is a clock reading
  stateAt: t => { const Vt = M.PIPE1.vol;
    return { clock: t, st4: M.buoy(M.buoyBottom(t)), slab6: M.PIPE1.sOfVol(((0.04 * Vt + M.FLOW.Q * t) % Vt + Vt) % Vt), h8: M.tankH(M.loop(t, M.TANK.Tdrain).t) }; },
  // physics seconds per real second (all scenes run in real time), and how long one run lasts
  rate: () => 1,
  runOf: scene => ({ depth: M.DIVE_T, pascal: M.PASCAL.T, buoy: M.BUOY.T, torricelli: M.TANK.Tdrain, continuity: 8, bernoulli: 8 })[scene] ?? 4,
  readout(s, page) {
    switch (page.scene) {
      case 'density': return `same volume ${f(M.CUBE_V * 1000, M.CUBE < 0.1 ? 3 : 1)} L\nmass from ${q('mass.cork', `${f(M.MATERIALS[0].mass)} kg`)} to ${q('mass.iron', `${f(M.MATERIALS[4].mass)} kg`)}`;
      case 'pressure': return `W ${f(M.PERSON.W, 0)} N\nshoes ${q('P.shoe', kPa(M.P_SHOE))}   snowshoes ${q('P.snow', kPa(M.P_SNOW, 2))}`;
      case 'depth': { const d = M.diveDepth(s.clock); return `h ${f(d)} m   gauge ${q('P', kPa(M.gauge(d)))}\nabsolute ${q('P', `${kPa(M.pAt(d))} = ${f(M.pAt(d) / M.P0)} atm`)}`; }
      case 'pascal': { const p = M.pascal(s.clock); return `ΔP ${q('F1', kPa(M.PASCAL.dP, 2))}   F₁ ${q('F1', `${M.PASCAL.F1} N`)}   F₂ ${q('F2', `${f(M.PASCAL.F2, 0)} N`)}\nd₁ ${f(p.d1 * 100, 1)} cm   d₂ ${q('d2', `${f(p.d2 * 100, 2)} cm`)}`; }
      case 'buoy': { const b = s.st4, hid = M.ASK === 'Fb' || M.ASK === 'T';   // W − T = F_b: asked for one, hide both
        return `under ${f(b.h * 100, 1)} cm   F_b ${hid ? '?' : `${f(b.Fb, 1)} N`}\nW ${f(M.BUOY.W, 1)} N   T ${hid ? '?' : `${f(b.T, 1)} N`}`; }
      case 'float': return `wood ${q('wood', `${f(100 * M.WOOD.draft / M.WOOD.s, 0)}%`)} under   ice ${q('ice', `${f(100 * M.ICE.draft / M.ICE.s, 1)}%`)} under\nsteel ball F_N ${q('N', `${f(M.BALL.N, 0)} N`)}   ship draft ${f(M.SHIP.draft * 100, 1)} cm`;
      case 'continuity': { const A = M.PIPE1.area(s.slab6); return `Q ${q('Q', `${f(M.FLOW.Q * 1000, 1)} L/s`)}\ndark slice: A ${f(A, 4)} m²   v ${q('v', `${f(M.FLOW.Q / A)} m/s`)}`; }
      case 'bernoulli': return M.BERN.pts.map((p, k) => `${k + 1}: v ${f(p.v, 1)} m/s  P ${q(`P${k + 1}`, kPa(p.P))}`).join('\n');
      case 'torricelli': { const v = M.torricelli(s.h8); return `h ${f(s.h8)} m   v ${q('v', `${f(v)} m/s`)}\nrange ${q('range', `${f(M.jetRange(s.h8))} m`)}`; }
    }
    return '';
  },
  onFrame(s, sheets) {
    const d = M.diveDepth(s.clock), b = s.st4, A = M.PIPE1.area(s.slab6);
    const vals = { depth: [d, M.pAt(d) / 1000], gauge: [d, M.gauge(d) / 1000], fb: [M.BUOY.L0 - b.yb, b.Fb], T: [M.BUOY.L0 - b.yb, b.T], flow: [A, M.FLOW.Q / A], tank: [s.h8, M.torricelli(s.h8)] };
    for (const el of sheets) el.querySelectorAll('circle[data-cursor]').forEach(c => {
      const k = c.dataset.cursor; if (!vals[k] || !CURSORS[k]) return;
      const [cx, cy] = CURSORS[k](...vals[k]); c.setAttribute('cx', cx); c.setAttribute('cy', cy);
    });
  },
});
