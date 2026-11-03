// Chapter 2: Newton's laws, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES, CH } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
// each looping scene's run, read live (a question's numbers change some)
const RUN = { car: () => M.CAR.run, glide: () => M.GLIDE_T, second: () => M.PUSH_T, friction: () => M.FRIC_T, third: () => M.PAIR_T, incline: () => M.INC_T,
  tug: () => M.TUG.run, board: () => M.BOARD.run, drag: () => M.DRAG.run, honey: () => M.HONEY.run };

startBook({
  no: 2, PAGES, PLATES, clock0: 0,
  lookKeys: [],
  buildWorld(E) {
    const W = buildWorld(E);
    return { update: (s, look) => W.update(s, look), labels: W.labels, setMarks: W.setMarks };
  },
  state: (clock, reduced) => {
    const c = reduced ? 1.0 / M.SLOW : clock;
    return { clock: c, tension: c * M.SLOW, plane: c * M.SLOW, car: M.loop(c, M.CAR.run), glide: M.loop(c, M.GLIDE_T), second: M.loop(c, M.PUSH_T), friction: M.loop(c, M.FRIC_T), third: M.loop(c, M.PAIR_T), incline: M.loop(c, M.INC_T), tug: M.loop(c, M.TUG.run), board: M.loop(c, M.BOARD.run), drag: M.loop(c, M.DRAG.run), honey: M.loop(c, M.HONEY.run) };
  },
  // ---------- questions (premium): the numbers, and the state at one physics time ----------
  setParams: M.setParams,
  // every scene at physics time t (a question freezes or loops the figure in physics time); clock for the plates
  stateAt: t => ({ clock: t / M.SLOW, tension: t, plane: t,
    ...Object.fromEntries(Object.keys(RUN).map(k => [k, { t: Math.min(t, RUN[k]()), resting: t > RUN[k]() }])) }),
  // physics seconds per real second, as the lesson shows them (a long car run faster); and how long one run lasts
  rate: scene => scene === 'car' ? M.SLOW * Math.max(1, M.CAR.run / M.DEFAULTS.CAR_RUN) : M.SLOW,
  runOf: scene => scene === 'tension' ? M.HANG_PERIOD : scene === 'plane' ? 16 / 2.2 : RUN[scene]?.() ?? 1,   // plane: one drift across (world.js)
  // a question's own numbers show, but not its unknown: with them the readout leaves out what is asked
  readout(s, page) {
    switch (page.scene) {
      case 'tension': { const th = M.hangAngle(s.tension); return `one string: T ${f(M.W1)} N\ntwo strings at ${th.toFixed(1)}°${M.HANG === null ? `: T ${f(M.tension2(th))} N each` : ''}`; }
      case 'plane': return `lift ${f(M.PLANE.L / 1000)} kN   weight ${f(M.PLANE.W / 1000)} kN\nthrust ${f(M.PLANE.T / 1000)} kN   drag ${f(M.PLANE.D / 1000)} kN${M.PLANE.T === M.PLANE.D ? '   ΣF 0' : ''}`;
      case 'car': { const c = M.car(s.car.t); return `t ${f(s.car.t)} s   v ${f(c.v)} m/s\nfriction ${f(M.CAR.F)} N   drag ${f(c.D)} N   a ${f(c.a)} m/s²`; }
      case 'rest': return M.PRESS ? `weight ${f(M.W1)} N   push ${f(M.PRESS)} N down\na = 0 m/s²` : `ΣF = ${f(M.FN)} − ${f(M.W1)} = 0 N\na = 0 m/s²`;
      case 'glide': return `v ${f(M.V_GLIDE)} m/s   ΣF 0 N${M.MU_GLIDE ? `\nμk ${f(M.MU_GLIDE)}: push = friction` : ''}\na 0 m/s²`;
      case 'second': { const t = s.second.t; return `t ${f(t)} s\n2 kg: v ${f(M.A1 * t)} m/s   4 kg: v ${f(M.A2 * t)} m/s`; }
      case 'friction': { const r = M.friction(s.friction.t); return `F ${f(r.F)} N   f ${f(r.f)} N (${r.kind})\nΣF ${f(r.F - r.f)} N   a ${f(r.a)} m/s²`; }
      case 'third': { const t = s.third.t, [a, b] = M.PUSHED === 'A' ? 'AB' : 'BA'; return `t ${f(t)} s   a ${f(M.A_PAIR)} m/s²\n${M.PUSHED === 'A' ? `F_${a} on ${b} ${f(M.CONTACT, 1)} N   F_${b} on ${a} ${f(M.CONTACT, 1)} N` : `F_${b} on ${a} = F_${a} on ${b}`}`; }
      case 'incline': { const r = M.incline(s.incline.t); return `along the slope: s ${f(r.s)} m   v ${f(r.v)} m/s\na = ${M.MU_INC ? 'g(sin θ − μk cos θ)' : `g sin θ = ${f(M.A_SLIDE)} m/s²`}`; }
      case 'tug': { const r = M.tug(s.tug.t); return `x_A ${f(r.xA)} m   x_B ${f(r.xB)} m\nx_cm ${f(0)} m   T ${M.TUG.T} N each`; }
      case 'board': { const r = M.board(s.board.t); return `t ${f(s.board.t)} s   F ${M.BOARD.F} N${M.BOARD.F === M.DEFAULTS.BOARD_F ? `   a_cm ${f(M.BOARD.aCm)} m/s²` : ''}\nv block ${f(r.vBlock)}   board ${f(r.vBoard)}   cm ${f(M.xcm([M.BOARD.m, M.BOARD.Mb], [r.vBlock, r.vBoard]))} m/s`; }
      case 'drag': { const r = M.linDrag(s.drag.t); return `t ${f(s.drag.t)} s   v ${f(r.v)} m/s (${(100 * r.v / M.DRAG.vt).toFixed(1)}% of v_t)\nmg ${f(M.DRAG.W)} N   bv ${f(r.D)} N`; }
      case 'honey': { const r = M.honey(s.honey.t); return `sunk ${f(r.x * 100, 1)} cm   v ${f(r.v * 100)} cm/s\nmg ${f(M.HONEY.W * 1000, 1)} mN = bv ${f(M.HONEY.b * r.v * 1000, 1)} + B ${f(M.HONEY.B * 1000, 1)} mN`; }
    }
    return '';
  },
  onFrame(s, sheets) {
    // the friction chart's cursor follows the live push
    const r = M.friction(s.friction.t), th = M.hangAngle(s.tension), cv = M.car(s.car.t);
    const put = (key, x, y) => { for (const el of sheets) el.querySelectorAll(`circle[data-cursor="${key}"]`).forEach(c => { c.setAttribute('cx', x); c.setAttribute('cy', y); }); };
    put('friction', CH.sx(Math.min(r.F, 12), 0, 12), CH.sy(r.f, 0, 12));
    put('tension', CH.sx(th, 10, 90), CH.sy(Math.min(M.tension2(th), 60), 0, 60));
    put('car', CH.sx(Math.min(s.car.t, 3.2), 0, 3.2), CH.sy(Math.min(cv.v, 10), 0, 10));   // a question's long run stays on the chart
    put('tug', CH.sx(s.tug.t, 0, 1.7), CH.sy(0, -3, 2));
    put('board', CH.sx(s.board.t, 0, 1.1), CH.sy(M.BOARD.aCm * s.board.t, 0, 4.5));
    const ld = M.linDrag(s.drag.t);
    put('drag', CH.sx(s.drag.t, 0, 2), CH.sy(ld.v, 0, 4.5)); put('dragF', CH.sx(s.drag.t, 0, 2), CH.sy(ld.D, 0, 6));
  },
});
