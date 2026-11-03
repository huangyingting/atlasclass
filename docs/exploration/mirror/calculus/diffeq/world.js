// The figure: nine sheets of graph paper in a row along +x, one per idea. Slope fields are short solid rods standing
// on the paper; solutions are tubes; a red dot rides each moving thing. Every curve and number comes from model.js.
import * as THREE from 'three';
import { graphBoard, curve, liveCurve, dot, putAt, rod, setRod, setLineThrough, V } from '../kit.js';
import { part } from '../engine/parts.js';
import * as M from './model.js';

// ---------- the scenes: where each board sits (world x of its math origin), and its scale ----------
const S = {
  cover: { at: [-3, -2.2, 0], x: [0, 10], y: [0, 1600], sx: 0.6, sy: 0.0028, grid: [1, 200], ticks: [2, 400], names: ['t', 'P'] },
  coffee: { at: [13, -2.1, 0], x: [0, 30], y: [0, 100], sx: 0.2, sy: 0.042, grid: [5, 10], ticks: [10, 20], names: ['<i>t</i> (min)', '<i>T</i> (°C)'] },
  verify: { at: [32.5, -2.6, 0], x: [-0.5, 3.5], y: [0, 4], sx: 1.3, sy: 1.3, grid: [0.5, 0.5], ticks: [1, 1], names: ['x', 'y'] },
  field: { at: [50, 0, 0], x: [-3, 3], y: [-3, 3], sx: 0.85, sy: 0.85, grid: [0.5, 0.5], ticks: [1, 1], names: ['x', 'y'] },
  euler: { at: [63, -1.9, 0], x: [0, 2], y: [0, 1.5], sx: 2.5, sy: 2.5, grid: [0.25, 0.25], ticks: [0.5, 0.5], names: ['x', 'y'] },
  sep: { at: [80.5, 0, 0], x: [-3, 6], y: [-4, 4], sx: 0.6, sy: 0.6, grid: [1, 1], ticks: [1, 1], names: ['x', 'y'] },
  dom: { at: [98, -0.25, 0], x: [-2.5, 2.5], y: [-3, 4], sx: 0.8, sy: 0.8, grid: [0.5, 0.5], ticks: [1, 1], names: ['x', 'y'] },
  exp: { at: [111.3, -2.2, 0], x: [0, 12], y: [0, 4000], sx: 0.45, sy: 0.0011, grid: [1, 500], ticks: [2, 1000], names: ['<i>t</i> (h)', '<i>P</i>'] },
  logiP: { at: [127.5, 0.6, 0], x: [0, 12], y: [0, 1400], sx: 0.42, sy: 0.003, grid: [1, 100], ticks: [2, 200], names: ['<i>t</i> (years)', '<i>P</i>'] },
  logiR: { at: [127.5, -3.8, 0], x: [0, 1200], y: [0, 200], sx: 0.0042, sy: 0.016, grid: [100, 20], ticks: [200, 50], names: ['<i>P</i>', '<i>dP</i>/<i>dt</i>'] },
};
// the centre of a board in world space, for the cameras in pages.js
export const CENTER = Object.fromEntries(Object.entries(S).map(([k, s]) => [k, [s.at[0] + (s.x[0] + s.x[1]) / 2 * s.sx, s.at[1] + (s.y[0] + s.y[1]) / 2 * s.sy, 0]]));

const fmt = v => (v < 0 ? '−' : '') + +Math.abs(v).toFixed(2);
// graph paper whose x and y have their own scales (minutes against degrees, hours against thousands), on the kit's board
function board(parent, s) {
  const G = graphBoard(parent, { at: s.at, x: s.x, y: s.y, unit: [s.sx, s.sy], grid: s.grid, ticks: s.ticks });
  return { ...G, sx: s.sx, sy: s.sy, tickLabels: () => G.tickLabels({ xName: s.names[0], yName: s.names[1] }) };
}

// slope segments: one short rod per point, centred on it, at the slope f gives there (on the board's own scales)
const segGeo = new Map();
function field(B, parent, f, pts, { len = 0.42, r = 0.022, pal = 'ink', tone = 'mid', name = 'Slope segment', lift = 0.07 } = {}) {
  if (!segGeo.has(r)) segGeo.set(r, new THREE.CylinderGeometry(r, r, 1, 28));
  return pts.map(([x, y]) => {
    const m = part(parent, segGeo.get(r), { pal, tone, name }); m.userData.home = null;
    const d = V(B.sx, f(x, y) * B.sy, 0).normalize().multiplyScalar(len / 2), c = B.P(x, y, lift);
    setRod(m, c.clone().sub(d), c.clone().add(d));
    return m;
  });
}
const gridPts = (xs, ys) => ys.flatMap(y => xs.map(x => [x, y]));
const range = (a, b, d) => Array.from({ length: Math.round((b - a) / d) + 1 }, (_, i) => +(a + i * d).toFixed(10));
// a dashed straight line between math points, as short rods
function dashes(B, parent, [xa, ya], [xb, yb], { n = 16, r = 0.016, pal = 'dark', tone = 'lo', name = 'Line', lift = 0.03 } = {}) {
  for (let i = 0; i < n; i++) {
    if (!segGeo.has(r)) segGeo.set(r, new THREE.CylinderGeometry(r, r, 1, 28));
    const u0 = i / n, u1 = (i + 0.55) / n, m = part(parent, segGeo.get(r), { pal, tone, name }); m.userData.home = null;
    setRod(m, B.P(xa + (xb - xa) * u0, ya + (yb - ya) * u0, lift), B.P(xa + (xb - xa) * u1, ya + (yb - ya) * u1, lift));
  }
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const B = {};
  for (const k of Object.keys(S)) { B[k] = board(root, S[k]); labels.push(...B[k].tickLabels()); }
  const mark = (html, at, cls = 'mark') => labels.push({ cls, html, at });

  // ---------- opener: the logistic field, and solutions from four starting sizes ----------
  const bc = B.cover;
  const cField = asm('coverField', root, { title: 'The slope field', sub: `dP/dt = ${M.KL}P(1 − P/${M.L})` });
  field(bc, cField, (t, P) => M.logiRate(P), gridPts(range(0.5, 9.5, 1), range(100, 1500, 200)), { len: 0.4 });
  const cSols = asm('coverSols', root, { title: 'Solution curves', sub: 'each one follows the segments' });
  const cCurves = M.COVER_P0.map((p, i) => ({ p, c: liveCurve(bc, cSols, { pal: i % 2 ? 'blue' : 'red', name: `Starting at P = ${p}`, r: 0.04 }), d: dot(cSols, { pal: i % 2 ? 'blue' : 'red', r: 0.1 }) }));
  const cCarry = asm('coverL', root, { title: 'Carrying capacity', sub: `P = L = ${M.L}` });
  dashes(bc, cCarry, [0, M.L], [10, M.L], { n: 22, pal: 'blue', tone: 'mid', r: 0.02 });
  mark(`<i>L</i> = ${M.L}`, () => bc.P(10, M.L).add(V(0.55, 0.0, 0)));

  // ---------- 7.1 · the coffee model ----------
  const bf = B.coffee;
  const cof = asm('coffeeCurve', root, { title: 'Temperature', sub: 'T(t), °C after t minutes' });
  curve(bf, cof, M.coffee, 0, M.COFFEE_RUN, { name: 'T(t)' });
  const room = asm('room', root, { title: 'Room temperature', sub: `${M.ROOM} °C: where the coffee is heading` });
  dashes(bf, room, [0, M.ROOM], [M.COFFEE_RUN, M.ROOM], { n: 20, pal: 'blue', tone: 'mid' });
  const cGap = asm('gap', root, { title: 'T − 20', sub: 'how much hotter than the room' });
  const gapRod = rod(cGap, { pal: 'blue', r: 0.035, name: 'T − 20' });
  const cTan = asm('tangent', root, { title: 'The rate dT/dt', sub: 'the slope of the curve, set by the model' });
  const tanRod = rod(cTan, { name: 'Tangent' });
  const cDot = dot(cTan, { pal: 'red', name: 'Now' });
  mark(`room, ${M.ROOM} °C`, () => bf.P(25, M.ROOM).add(V(0, -0.3, 0)));

  // ---------- 7.2 · two candidates for dy/dx = x − y ----------
  const bv = B.verify;
  const good = asm('good', root, { title: 'y = x − 1 + 2e^(−x)', sub: 'a solution: its slope is x − y everywhere' });
  curve(bv, good, M.sol, bv.x0, bv.x1, { name: 'Solution' });
  const gDot = dot(good, { pal: 'red' });
  const bad = asm('bad', root, { title: 'y = x + 2e^(−x)', sub: 'not a solution: its slope is never x − y' });
  curve(bv, bad, M.wrong, bv.x0, bv.x1, { pal: 'dark', name: 'Candidate' });
  const bDot = dot(bad, { pal: 'red' });
  const tans = asm('tangents', root, { title: 'Tangent lines', sub: 'the slope the curve actually has, dy/dx' });
  const gTan = rod(tans, { r: 0.022 }), bTan = rod(tans, { r: 0.022 });
  const des = asm('deSlopes', root, { title: 'What the equation asks for', sub: 'a segment of slope x − y at the same point' });
  const gDe = rod(des, { pal: 'blue', r: 0.05 }), bDe = rod(des, { pal: 'blue', r: 0.05 });
  mark('<i>y</i> = <i>x</i> + 2<i>e</i><sup>−<i>x</i></sup>', () => bv.P(0.69, M.wrong(0.69)).add(V(0, 0.38, 0)));
  mark('<i>y</i> = <i>x</i> − 1 + 2<i>e</i><sup>−<i>x</i></sup>', () => bv.P(0.69, M.sol(0.69)).add(V(0, -0.4, 0)));

  // ---------- 7.3 and 7.4 · the slope field of dy/dx = x − y ----------
  const bs = B.field;
  const fld = asm('field', root, { title: 'Slope field', sub: 'dy/dx = x − y at each point (x, y)' });
  const segs = field(bs, fld, M.F, gridPts(M.GRID, [...M.GRID].reverse()), { len: 0.5, r: 0.026, tone: 'hi' });
  const pen = dot(fld, { pal: 'red', r: 0.08, name: 'Pen' });
  const iso = asm('isocline', root, { title: 'Slope 0', sub: 'on the line y = x, where x − y = 0' });
  dashes(bs, iso, [-3, -3], [3, 3], { n: 18 });
  const straight = asm('straight', root, { title: 'y = x − 1', sub: 'the slope is 1 all along it: a straight solution' });
  const strRod = rod(straight, { pal: 'blue', r: 0.035 }); setRod(strRod, bs.P(-2, -3, 0.04), bs.P(3, 2, 0.04));
  const fam = asm('family', root, { title: 'Other solutions', sub: 'y = x − 1 + Ce^(−x), for other C' });
  for (const C of M.TRACE_C.filter(C => C !== 2 && C !== 0)) curve(bs, fam, M.solC(C), -3, 3, { pal: 'dark', r: 0.028 });
  const trc = asm('solution', root, { title: 'The solution through (0, 1)', sub: 'traced along the field' });
  const trCurve = liveCurve(bs, trc, { r: 0.04 }), trDot = dot(trc, { pal: 'red' });
  curve(bs, trc, M.sol, -0.85, 0, { pal: 'red', tone: 'mid', r: 0.025 });
  const minAsm = asm('lowest', root, { title: 'The lowest point', sub: `(ln 2, ln 2): the solution crosses y = x` });
  const minDot = dot(minAsm, { pal: 'blue', r: 0.08 }); putAt(bs, minDot, M.XMIN, M.YMIN, 0.08);
  let traceOn = false;
  mark('<i>y</i> = <i>x</i> − 1', () => traceOn ? bs.P(2.55, 1.05) : null);

  // ---------- 7.5 · BC · Euler's method ----------
  const be = B.euler;
  const eFld = asm('eField', root, { title: 'The slope field', sub: 'dy/dx = x − y, the directions Euler follows' });
  field(be, eFld, M.F, gridPts(range(0, 2, 0.25), range(0, 1.5, 0.25)), { len: 0.32, r: 0.014, pal: 'dark', tone: 'lo' });
  const ex = asm('exact', root, { title: 'The true solution', sub: 'y = x − 1 + 2e^(−x)' });
  curve(be, ex, M.sol, 0, 2, { name: 'Exact' });
  const eu = asm('euler', root, { title: "Euler's polygon", sub: 'step along the tangent, then look again' });
  const eRods = Array.from({ length: 16 }, () => rod(eu, { r: 0.03 }));
  const eDots = Array.from({ length: 17 }, () => dot(eu, { pal: 'red', r: 0.06 }));
  const tbl = asm('table', root, { title: 'The table’s steps', sub: `h = ${M.H}: four steps from (0, 1)` });
  M.EULER.slice(1).forEach(([x, y], i) => { setRod(rod(tbl, { pal: 'dark', r: 0.02 }), be.P(...M.EULER[i], 0.045), be.P(x, y, 0.045)); putAt(be, dot(tbl, { pal: 'dark', r: 0.05 }), x, y, 0.06); });
  const err = asm('error', root, { title: 'The error at x = 2', sub: 'true value minus the estimate' });
  const errRod = rod(err, { pal: 'blue', r: 0.04 });
  labels.push({ cls: 'mark', html: '', at: () => be.P(2, 0.95).add(V(0.25, 0, 0)), text: () => `<i>h</i> = ${eulerNow.h}` });

  // ---------- 7.6 · separation of variables: y = C e^(sin x) ----------
  const bp = B.sep;
  const sFld = asm('sepField', root, { title: 'The slope field', sub: 'dy/dx = y cos x' });
  field(bp, sFld, M.SEP, gridPts(range(-3, 6, 1), range(-4, 4, 1)), { len: 0.34, r: 0.016, pal: 'dark', tone: 'lo' });
  const sFam = asm('sepFamily', root, { title: 'The general solution', sub: 'y = Ae^(sin x): one curve for each A' });
  for (const C of M.SEP_FAMILY) curve(bp, sFam, M.sepSol(C), -3, 6, { pal: 'ink', tone: 'mid', r: 0.026 });
  const sLive = asm('sepLive', root, { title: 'One member', sub: 'A runs through its values' });
  const sCurve = liveCurve(bp, sLive, { r: 0.04 }), sDot = dot(sLive, { pal: 'red' });
  labels.push({ cls: 'mark', html: '', at: () => bp.P(0, sepNow).add(V(-0.75, 0.32, 0)), text: () => `<i>A</i> = ${fmt(+sepNow.toFixed(2))}` });

  // ---------- 7.7 · a particular solution and its domain ----------
  const bd = B.dom;
  const dSol = asm('domSol', root, { title: 'The particular solution', sub: 'y = 1/(1 − x²), on −1 < x < 1' });
  curve(bd, dSol, M.domSol, -0.999, 0.999, { name: 'Solution', r: 0.045 });
  const dDot = dot(dSol, { pal: 'red' });
  const out = asm('outside', root, { title: 'Not part of it', sub: 'the same formula, past the asymptotes' });
  curve(bd, out, M.domSol, -2.5, -1.001, { pal: 'dark', r: 0.026 }); curve(bd, out, M.domSol, 1.001, 2.5, { pal: 'dark', r: 0.026 });
  const asy = asm('asymptotes', root, { title: 'Vertical asymptotes', sub: 'x = −1 and x = 1, where 1 − x² = 0' });
  dashes(bd, asy, [-1, -3], [-1, 4], { n: 18, pal: 'blue', tone: 'mid' }); dashes(bd, asy, [1, -3], [1, 4], { n: 18, pal: 'blue', tone: 'mid' });
  const st = asm('start', root, { title: 'The initial condition', sub: 'y(0) = 1' });
  putAt(bd, dot(st, { pal: 'blue', r: 0.12 }), 0, 1, 0.08);
  mark('<i>y</i>(0) = 1', () => bd.P(0, 1).add(V(0, -0.45, 0)));

  // ---------- 7.8 · exponential growth ----------
  const bg = B.exp;
  const gC = asm('growCurve', root, { title: 'P = 500e^(kt)', sub: `k = ln 2/${M.TD} per hour` });
  curve(bg, gC, M.grow, 0, M.GROW_RUN, { name: 'P(t)' });
  const dbl = asm('doubling', root, { title: 'Doubling', sub: `every ${M.TD} hours, from any start` });
  for (let t = 0; t <= M.GROW_RUN; t += M.TD) {
    putAt(bg, dot(dbl, { pal: 'blue', r: 0.08 }), t, M.grow(t), 0.07);
    dashes(bg, dbl, [t, 0], [t, M.grow(t)], { n: Math.max(3, Math.round(M.grow(t) / 300)), pal: 'blue', tone: 'lo' });
    mark(`${Math.round(M.grow(t))}`, () => bg.P(t, M.grow(t)).add(V(0.5, -0.22, 0)));
  }
  const gT = asm('growTangent', root, { title: 'The rate dP/dt = kP', sub: 'steeper as P grows' });
  const gRod = rod(gT), pDot = dot(gT, { pal: 'red' });

  // ---------- 7.9 · BC · logistic growth: P against t above, dP/dt against P below ----------
  const b1 = B.logiP, b2 = B.logiR;
  const lC = asm('logiCurve', root, { title: 'The logistic curve', sub: `P = ${M.L}/(1 + ${M.AL}e^(−${M.KL}t))` });
  curve(b1, lC, t => M.logi(t), 0, 12, { name: 'P(t)' });
  const lL = asm('carrying', root, { title: 'Carrying capacity', sub: `L = ${M.L}: P approaches it, never passes it` });
  dashes(b1, lL, [0, M.L], [12, M.L], { n: 22, pal: 'blue', tone: 'mid' });
  const lHalf = asm('half', root, { title: 'Half the capacity', sub: `P = L/2 = ${M.L / 2}: the steepest point` });
  dashes(b1, lHalf, [0, M.L / 2], [12, M.L / 2], { n: 22 });
  putAt(b1, dot(lHalf, { pal: 'blue', r: 0.09 }), M.TH, M.L / 2, 0.08);
  const lT = asm('logiTangent', root, { title: 'The rate now', sub: 'the slope of P(t)' });
  const lRod = rod(lT), lDot = dot(lT, { pal: 'red' });
  const rC = asm('rateCurve', root, { title: 'Rate against size', sub: `dP/dt = ${M.KL}P(1 − P/${M.L}): a parabola` });
  curve(b2, rC, M.logiRate, 0, M.L, { name: 'dP/dt' });
  putAt(b2, dot(rC, { pal: 'blue', r: 0.09 }), M.L / 2, M.RMAX, 0.08);
  const rNow = asm('rateNow', root, { title: 'The same moment', sub: 'this population, this rate' });
  const rDot = dot(rNow, { pal: 'red' }), rDrop = rod(rNow, { pal: 'red', r: 0.018 });
  mark(`<i>L</i> = ${M.L}`, () => b1.P(12, M.L).add(V(0.5, 0, 0)));
  mark(`<i>L</i>/2`, () => b1.P(12, M.L / 2).add(V(0.45, 0, 0)));
  mark(`max ${M.RMAX}`, () => b2.P(M.L / 2, M.RMAX).add(V(0.85, 0.12, 0)));

  let eulerNow = M.eulerPhase(0), sepNow = 0;
  return {
    labels,
    update(s, look) {
      const c = s.c;
      // opener
      const tc = M.coverT(c);
      for (const { p, c: lc, d } of cCurves) { lc.visible = tc > 0.02; if (lc.visible) lc.set(t => M.logi(t, p), 0, tc); putAt(bc, d, tc, M.logi(tc, p), 0.08); }
      // coffee
      const t = M.coffeeT(c), T = M.coffee(t);
      putAt(bf, cDot, t, T, 0.08); setLineThrough(bf, tanRod, t, T, M.coffeeRate(T), t - 6, t + 6);
      setRod(gapRod, bf.P(t, M.ROOM, 0.05), bf.P(t, T, 0.05));
      // verify: the tangent (red) against the segment the equation asks for (blue)
      const x = M.verifyX(c);
      for (const [fn, d, tn, de] of [[M.sol, gDot, gTan, gDe], [M.wrong, bDot, bTan, bDe]]) {
        const y = fn(x);
        putAt(bv, d, x, y, 0.08);
        setLineThrough(bv, tn, x, y, M.dsol(x), x - 0.75, x + 0.75, 0.07);
        setLineThrough(bv, de, x, y, M.F(x, y), x - 0.38, x + 0.38, 0.06);
      }
      // field: sketched one segment at a time (7.3), or all of it with solutions traced (7.4)
      const trace = (look.trace || 0) > 0.5, n = trace ? M.SKETCH_N : M.sketchCount(c);
      segs.forEach((m, i) => { m.visible = i < n; });
      pen.visible = !trace && n < M.SKETCH_N;
      if (pen.visible) { const i = n, r = Math.floor(i / 7); putAt(bs, pen, M.GRID[i % 7], M.GRID[6 - r], 0.1); }
      for (const g of [straight, fam, trc, minAsm]) g.visible = trace;
      iso.visible = true;
      if (trace) { const xt = M.traceX(c); trCurve.visible = xt > 0.02; if (trCurve.visible) trCurve.set(M.sol, 0, xt); putAt(bs, trDot, xt, M.sol(xt), 0.09); }
      traceOn = trace;
      // Euler
      eulerNow = M.eulerPhase(c);
      const pts = M.euler(eulerNow.h);
      eRods.forEach((m, i) => {
        const f = Math.min(Math.max(eulerNow.shown - i, 0), 1);
        m.visible = f > 0;
        if (m.visible) { const [xa, ya] = pts[i], [xb, yb] = pts[i + 1]; setRod(m, be.P(xa, ya, 0.06), be.P(xa + (xb - xa) * f, ya + (yb - ya) * f, 0.06)); }
      });
      eDots.forEach((d, i) => { d.visible = i <= eulerNow.shown + 1e-9; if (d.visible) putAt(be, d, ...pts[i], 0.08); });
      errRod.visible = eulerNow.shown >= eulerNow.n;
      if (errRod.visible) setRod(errRod, be.P(2, pts[eulerNow.n][1], 0.07), be.P(2, M.EXACT_E, 0.07));
      // separation
      sepNow = M.sepC(c);
      sCurve.set(M.sepSol(sepNow), -3, 6); putAt(bp, sDot, 0, sepNow, 0.09);
      // domain
      const xd = M.domX(c); putAt(bd, dDot, xd, M.domSol(xd), 0.09);
      // exponential
      const tg = M.growT(c), Pg = M.grow(tg);
      putAt(bg, pDot, tg, Pg, 0.08); setLineThrough(bg, gRod, tg, Pg, M.KG * Pg, tg - 1.6, tg + 1.6);
      // logistic
      const tl = M.logiT(c), Pl = M.logi(tl);
      putAt(b1, lDot, tl, Pl, 0.08); setLineThrough(b1, lRod, tl, Pl, M.logiRate(Pl), tl - 1.4, tl + 1.4);
      putAt(b2, rDot, Pl, M.logiRate(Pl), 0.08); setRod(rDrop, b2.P(Pl, 0, 0.05), b2.P(Pl, M.logiRate(Pl), 0.05));
    },
  };
}
