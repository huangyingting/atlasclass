// The figure: one sheet of graph paper per page (three on the pages that compare cases), spread along +x so
// the camera can fly from one to the next. Curves, holes, sliding points and lines all come from the kit;
// every function and number comes from model.js.
import * as THREE from 'three';
import { graphBoard, curve, liveCurve, dot, hole, putAt, rod, setRod, setLineThrough, V } from '../kit.js';
import * as M from './model.js';

const fmt = v => (v < 0 ? '−' : '') + +Math.abs(v).toFixed(2);

// where each page's sheet sits (its centre, in world metres); pages.js aims the camera from these
export const SPOT = {
  open: [0, 0], sec: [30, 0], lim: [60, 0], one: [90, 0], tab: [120, 0], prop: [150, 0], alg: [180, 0], pick: [210, 0],
  sqz: [240, 0], rep: [270, 0], disc: [300, 0], cont: [330, 0], ival: [360, 0], fix: [390, 0], vert: [420, 0], horiz: [450, 0], ivt: [480, 0],
};

// a graph board centred at world c, with y drawn k times taller than x when a function is flat (k = 1: true shape).
// Everything drawn on it uses math coordinates; the tick numbers are the real ones.
function board(root, { c, x, y, unit = 1, k = 1, grid = [1, 1], ticks = grid, names = {}, skipX = [], skipY = [] }) {
  const at = [c[0] - (x[0] + x[1]) / 2 * unit, c[1] - (y[0] + y[1]) / 2 * k * unit, 0];
  const S = graphBoard(root, { at, x, y, unit: [unit, unit * k], grid, ticks });
  return Object.assign(S, { k, labels: S.tickLabels({ ...names, skipX, skipY }) });
}

// a dashed line between math points (asymptotes, guides), made of short solid dashes so it can be picked and lit
function dashes(S, parent, [xa, ya], [xb, yb], { pal = 'red', r = 0.018, len = 0.16, gapLen = 0.12, name = 'Asymptote' } = {}) {
  const A = S.P(xa, ya, 0.04), B = S.P(xb, yb, 0.04), n = Math.floor(A.distanceTo(B) / (len + gapLen));
  for (let i = 0; i <= n; i++) {
    const u0 = i * (len + gapLen) / A.distanceTo(B), u1 = Math.min(u0 + len / A.distanceTo(B), 1);
    const m = rod(parent, { r, pal, tone: 'mid', name }); setRod(m, A.clone().lerp(B, u0), A.clone().lerp(B, u1));
  }
}

// two points sliding along fn toward x = a, one from each side (red from the left, blue from the right)
function pair(S, parent, fn, a, { h0 = 1.5, names = ['From the left', 'From the right'], r = 0.09 } = {}) {
  const L = dot(parent, { pal: 'red', name: names[0], r }), R = dot(parent, { pal: 'blue', name: names[1], r });
  return t => {
    const h = M.gap(t, h0);
    for (const [m, x] of [[L, a - h], [R, a + h]]) { const y = fn(x); m.visible = Number.isFinite(y) && S.inside(x, y); if (m.visible) putAt(S, m, x, y); }
  };
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [], updates = [];
  let now = 0;   // the clock, for labels that ride on swept values
  const mark = (html, at, cls = 'mark') => labels.push({ cls, html, at });

  // ---------- opener: sin x / x ----------
  {
    const S = board(root, { c: SPOT.open, x: [-9.5, 9.5], y: [-0.5, 1.5], unit: 0.55, k: 3.6, grid: [1, 0.25], ticks: [3, 0.5] });
    labels.push(...S.labels);
    const g = asm('sincCurve', root, { title: 'y = sin x / x', sub: 'defined everywhere but x = 0' });
    curve(S, g, M.sinc, S.x0, S.x1, { n: 600 });
    const h = asm('sincHole', root, { title: 'The hole', sub: 'at x = 0 the formula reads 0/0' });
    putAt(S, hole(h, { r: 0.16 }), 0, M.OPEN.L, 0.1);
    const p = asm('sincPts', root, { title: 'Two points', sub: 'closing in on x = 0 from each side' });
    const slide = pair(S, p, M.sinc, 0, { h0: M.OPEN.h0, r: 0.11 });
    // dashed guides from each point across to the y-axis: both heights close in on 1
    const gl = rod(p, { r: 0.012, pal: 'dark', tone: 'mid', name: 'Height' }), gr = rod(p, { r: 0.012, pal: 'dark', tone: 'mid', name: 'Height' });
    updates.push(s => {
      slide(s.t);
      const x = M.gap(s.t, M.OPEN.h0);
      setRod(gl, S.P(-x, M.sinc(x), 0.03), S.P(0, M.sinc(x), 0.03)); setRod(gr, S.P(x, M.sinc(x), 0.03), S.P(0, M.sinc(x), 0.03));
    });
    mark('<i>L</i> = 1', () => S.P(0.9, 1.2));
  }

  // ---------- 1.1 secant to tangent on y = x² ----------
  {
    const S = board(root, { c: SPOT.sec, x: [-1, 3], y: [-1, 7], unit: 0.8, grid: [0.5, 1], ticks: [1, 1] });
    labels.push(...S.labels);
    const g = asm('parab', root, { title: 'y = x²', sub: 'a position that changes faster and faster' });
    curve(S, g, M.sq, S.x0, S.x1);
    const P = asm('instant', root, { title: 'The instant x = 1', sub: 'one point: no change can be seen in it alone' });
    putAt(S, dot(P, { r: 0.1, name: 'P' }), M.P1, M.sq(M.P1));
    const sg = asm('secLine', root, { title: 'The secant', sub: 'average rate of change over [1, 1 + h]' });
    const sec = rod(sg, { r: 0.03, pal: 'red', name: 'Secant' }), Q = dot(sg, { pal: 'red', r: 0.1, name: 'Q' });
    const tg = asm('tanLine', root, { title: 'The tangent', sub: `slope ${M.TAN1}: the instantaneous rate` });
    dashes(S, tg, [0, -1], [3, 5], { pal: 'dark', name: 'Tangent' });
    updates.push(s => {
      const h = M.gap(s.t, M.H1), x = M.P1 + h;
      putAt(S, Q, x, M.sq(x)); setLineThrough(S, sec, M.P1, M.sq(M.P1), M.secant(h));
    });
    mark('<i>P</i>', () => S.P(M.P1 - 0.25, M.sq(M.P1) + 0.35));
  }

  // ---------- 1.2 the limit, and the value that doesn't matter ----------
  {
    const S = board(root, { c: SPOT.lim, x: [-1, 3], y: [-1, 4], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...S.labels);
    const g = asm('limCurve', root, { title: 'y = (x² − 1)/(x − 1)', sub: 'the same as x + 1, except at x = 1' });
    curve(S, g, x => x === 1 ? NaN : M.f2(x), S.x0, S.x1, { n: 241 });
    const h = asm('limHole', root, { title: 'The hole', sub: `the limit, ${M.L2}` });
    putAt(S, hole(h), M.A2, M.L2);
    const v = asm('limValue', root, { title: 'The value f(1)', sub: `assigned: f(1) = ${M.F2_AT}` });
    putAt(S, dot(v, { r: 0.1, name: 'f(1)' }), M.A2, M.F2_AT);
    const p = asm('limPts', root, { title: 'Nearby inputs', sub: 'what the limit is about' });
    const slide = pair(S, p, M.f2, M.A2);
    updates.push(s => slide(s.t));
    mark(`<i>f</i>(1) = ${M.F2_AT}`, () => S.P(M.A2 + 0.55, M.F2_AT + 0.15));
    mark(`<i>L</i> = ${M.L2}`, () => S.P(M.A2 + 0.75, M.L2 - 0.2));
  }

  // ---------- 1.3 one-sided limits from a graph ----------
  {
    const S = board(root, { c: SPOT.one, x: [-1, 4.5], y: [-1, 5], unit: 0.9, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...S.labels);
    const l = asm('oneLeft', root, { title: 'The left piece', sub: 'y = x²/2 + 1 for x < 2' });
    curve(S, l, M.g3, S.x0, M.A3 - 1e-6);
    putAt(S, hole(l), M.A3, M.LEFT3);
    const r = asm('oneRight', root, { title: 'The right piece', sub: 'y = x − 1 for x ≥ 2' });
    curve(S, r, M.g3, M.A3, S.x1);
    putAt(S, dot(r, { r: 0.1, name: 'g(2)' }), M.A3, M.RIGHT3);
    const pl = asm('fromLeft', root, { title: 'From the left', sub: `heads to ${M.LEFT3}` }), pr = asm('fromRight', root, { title: 'From the right', sub: `heads to ${M.RIGHT3}` });
    const L = dot(pl, { pal: 'red', name: 'x → 2⁻' }), R = dot(pr, { pal: 'blue', name: 'x → 2⁺' });
    updates.push(s => { const h = M.gap(s.t, 1.8); putAt(S, L, M.A3 - h, M.g3(M.A3 - h)); putAt(S, R, M.A3 + h, M.g3(M.A3 + h)); });
    mark(`${M.LEFT3}`, () => S.P(M.A3 - 0.4, M.LEFT3 + 0.3), 'vec red');
    mark(`${M.RIGHT3}`, () => S.P(M.A3 + 0.45, M.RIGHT3 - 0.4), 'vec blue');
  }

  // ---------- 1.4 a table, drawn: (1 + x)^(1/x) near 0 ----------
  {
    const S = board(root, { c: SPOT.tab, x: [-0.75, 2.25], y: [0, 5], unit: 1.6, k: 0.6, grid: [0.25, 0.5], ticks: [0.5, 1] });
    labels.push(...S.labels);
    const g = asm('tabCurve', root, { title: 'y = (1 + x)^(1/x)', sub: 'undefined at x = 0' });
    curve(S, g, x => x === 0 ? NaN : M.e4(x), S.x0, S.x1, { n: 301 });
    const h = asm('tabHole', root, { title: 'The hole', sub: `height e ≈ ${Math.E.toFixed(4)}` });
    putAt(S, hole(h, { r: 0.08 }), 0, Math.E);
    const p = asm('tabPts', root, { title: 'The table’s rows', sub: 'x closing in on 0 from each side' });
    const slide = pair(S, p, M.e4, 0, { h0: M.H4, r: 0.08 });
    updates.push(s => slide(s.t));
    mark('<i>e</i>', () => S.P(0.18, Math.E + 0.5));
  }

  // ---------- 1.5 properties: f, g and f + g near x = 2 ----------
  {
    const S = board(root, { c: SPOT.prop, x: [-1, 4], y: [-1, 5], unit: 0.9, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...S.labels);
    const fg = asm('propF', root, { title: 'f(x) = x²/2', sub: `→ ${M.LF5} as x → 2` }), gg = asm('propG', root, { title: 'g(x) = 3 − x', sub: `→ ${M.LG5} as x → 2` });
    const sg = asm('propSum', root, { title: 'f(x) + g(x)', sub: `→ ${M.LF5} + ${M.LG5} = ${M.LF5 + M.LG5}` });
    const sum = x => M.f5(x) + M.g5(x);
    curve(S, fg, M.f5, S.x0, S.x1); curve(S, gg, M.g5, S.x0, S.x1, { pal: 'blue' }); curve(S, sg, sum, S.x0, S.x1, { pal: 'red' });
    dashes(S, root, [M.C5, -1], [M.C5, 5], { pal: 'dark', name: 'x = 2', r: 0.012 });
    const df = dot(fg, { r: 0.08 }), dg = dot(gg, { r: 0.08, pal: 'blue' }), ds = dot(sg, { r: 0.08, pal: 'red' });
    updates.push(s => { const x = M.C5 - M.gap(s.t, 1.8); putAt(S, df, x, M.f5(x)); putAt(S, dg, x, M.g5(x)); putAt(S, ds, x, sum(x)); });
    mark('<i>f</i>', () => S.P(3.3, M.f5(3.3) - 0.45), 'vec');
    mark('<i>g</i>', () => S.P(3.6, M.g5(3.6) + 0.45), 'vec blue');
    mark('<i>f</i> + <i>g</i>', () => S.P(-0.45, sum(-0.45) + 0.6), 'vec red');
  }

  // ---------- 1.6 factoring and rationalizing: two boards ----------
  {
    const [cx, cy] = SPOT.alg;
    const A = board(root, { c: [cx - 3.1, cy], x: [-1, 4], y: [-1, 7], unit: 0.7, grid: [0.5, 1], ticks: [1, 1] });
    const B = board(root, { c: [cx + 3.1, cy], x: [0, 8], y: [-1, 7], unit: 0.7, grid: [1, 1], ticks: [2, 1] });
    labels.push(...A.labels, ...B.labels);
    const fa = asm('facCurve', root, { title: 'Factor and cancel', sub: '(x² + x − 6)/(x − 2) = x + 3, x ≠ 2' });
    curve(A, fa, x => x === 2 ? NaN : M.fac6(x), A.x0, A.x1, { n: 241 }); putAt(A, hole(fa), M.A6F, M.L6F);
    const ra = asm('ratCurve', root, { title: 'Rationalize', sub: '(x − 4)/(√x − 2) = √x + 2, x ≠ 4' });
    curve(B, ra, x => x === 4 ? NaN : M.rat6(x), 0.001, B.x1, { n: 241 }); putAt(B, hole(ra), M.A6R, M.L6R);
    const s1 = pair(A, fa, M.fac6, M.A6F, { h0: 1.5, r: 0.08 }), s2 = pair(B, ra, M.rat6, M.A6R, { h0: 3, r: 0.08 });
    updates.push(s => { s1(s.t); s2(s.t); });
    mark('factor', () => A.P(1.5, 7.8), 'board');
    mark('rationalize', () => B.P(3, 7.8), 'board');
  }

  // ---------- 1.7 three cases at x = 1 ----------
  {
    const [cx, cy] = SPOT.pick, o = { x: [-1, 3], y: [-1, 5], unit: 0.62, grid: [0.5, 1], ticks: [1, 1] };
    const Bs = [board(root, { ...o, c: [cx - 3.1, cy + 2.2] }), board(root, { ...o, c: [cx + 3.1, cy + 2.2] }), board(root, { ...o, c: [cx, cy - 2.4] })];
    Bs.forEach(b => labels.push(...b.labels));
    const [B1, B2, B3] = Bs;
    const a1 = asm('pickSub', root, { title: 'Substitute', sub: 'x² + 1 at x = 1: a number, 2' });
    curve(B1, a1, M.sub7, B1.x0, B1.x1); putAt(B1, dot(a1, { r: 0.09 }), 1, M.sub7(1));
    const a2 = asm('pickZero', root, { title: '0/0: more work to do', sub: '(x² − 1)/(x − 1): factor, then 2' });
    curve(B2, a2, x => x === 1 ? NaN : M.zero7(x), B2.x0, B2.x1, { n: 241 }); putAt(B2, hole(a2), 1, 2);
    const a3 = asm('pickInf', root, { title: 'b/0 with b ≠ 0', sub: '1/(x − 1)²: no finite limit' });
    curve(B3, a3, M.inf7, B3.x0, B3.x1, { n: 400 }); dashes(B3, a3, [1, -1], [1, 5]);
    const sl = [pair(B1, a1, M.sub7, 1, { r: 0.08 }), pair(B2, a2, M.zero7, 1, { r: 0.08 }), pair(B3, a3, M.inf7, 1, { r: 0.08, h0: 1.2 })];
    updates.push(s => sl.forEach(f => f(s.t)));
    mark('number', () => B1.P(1, 5.6), 'board'); mark('0 / 0', () => B2.P(1, 5.6), 'board'); mark('b / 0', () => B3.P(1, 5.6), 'board');
  }

  // ---------- 1.8 the squeeze: x² sin(1/x) between ±x², and sin x / x between cos x and 1 ----------
  {
    const [cx, cy] = SPOT.sqz;
    const A = board(root, { c: [cx, cy + 2.3], x: [-1, 1], y: [-1, 1], unit: 2.1, grid: [0.25, 0.25], ticks: [0.5, 0.5] });
    const B = board(root, { c: [cx, cy - 2.6], x: [-3.2, 3.2], y: [-1.2, 1.4], unit: 0.85, k: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...A.labels, ...B.labels);
    const w = asm('sqzWig', root, { title: 'y = x² sin(1/x)', sub: 'wiggles without end, but ever more tightly' });
    curve(A, w, x => x === 0 ? 0 : M.wig8(x), -1, 1, { n: 4000, r: 0.022 });
    const b = asm('sqzBounds', root, { title: 'The bounds ±x²', sub: 'both → 0 as x → 0' });
    curve(A, b, x => x * x, -1, 1, { pal: 'blue', r: 0.025 }); curve(A, b, x => -x * x, -1, 1, { pal: 'blue', r: 0.025 });
    const sc = asm('sqzSinc', root, { title: 'y = sin x / x', sub: 'trapped between cos x and 1' });
    curve(B, sc, x => x === 0 ? NaN : M.sinc8(x), B.x0, B.x1, { n: 241 }); putAt(B, hole(sc, { r: 0.08 }), 0, 1);
    const cb = asm('sqzCos', root, { title: 'cos x and 1', sub: 'cos x ≤ sin x / x ≤ 1 near 0' });
    curve(B, cb, Math.cos, B.x0, B.x1, { pal: 'blue', r: 0.025 }); curve(B, cb, () => 1, B.x0, B.x1, { pal: 'blue', r: 0.025 });
    // a vertical slice that closes in on 0: the three heights on it, squeezed together
    const p = asm('sqzSlice', root, { title: 'A slice at x', sub: 'the three heights there' });
    const bar = rod(p, { r: 0.016, pal: 'dark', tone: 'mid', name: 'Slice' }), dw = dot(p, { pal: 'red', r: 0.07 });
    const bar2 = rod(p, { r: 0.016, pal: 'dark', tone: 'mid', name: 'Slice' }), ds = dot(p, { pal: 'red', r: 0.07 });
    updates.push(s => {
      const x = M.gap(s.t, 0.9);
      setRod(bar, A.P(x, -x * x, 0.03), A.P(x, x * x, 0.03)); putAt(A, dw, x, M.wig8(x));
      const x2 = M.gap(s.t, 2.8);
      setRod(bar2, B.P(x2, Math.cos(x2), 0.03), B.P(x2, 1, 0.03)); putAt(B, ds, x2, M.sinc8(x2));
    });
    mark('<i>x</i>²', () => A.P(0.85, 0.72 + 0.2), 'vec blue'); mark('−<i>x</i>²', () => A.P(0.85, -0.72 - 0.2), 'vec blue');
    mark('cos <i>x</i>', () => B.P(-2.6, Math.cos(-2.6) + 0.35), 'vec blue');
  }

  // ---------- 1.9 sin 3x / x: graph, table and algebra agree ----------
  {
    const S = board(root, { c: SPOT.rep, x: [-3.2, 3.2], y: [-1, 3.5], unit: 0.95, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...S.labels);
    const g = asm('repCurve', root, { title: 'y = sin 3x / x', sub: 'the graph' });
    curve(S, g, x => x === 0 ? NaN : M.s9(x), S.x0, S.x1, { n: 321 }); putAt(S, hole(g), 0, M.K9);
    const tb = asm('repTable', root, { title: 'The table', sub: 'rows at x = ±1, ±0.5, ±0.25' });
    for (const x of [-1, -0.5, -0.25, 0.25, 0.5, 1]) putAt(S, dot(tb, { pal: 'blue', r: 0.075, name: `x = ${fmt(x)}` }), x, M.s9(x));
    const p = asm('repPts', root, { title: 'Closing in', sub: 'x → 0 from each side' });
    const slide = pair(S, p, M.s9, 0, { h0: 2.2, r: 0.085 });
    updates.push(s => slide(s.t));
    mark(`<i>L</i> = ${M.K9}`, () => S.P(0.6, M.K9 + 0.35));
  }

  // ---------- 1.10 removable, jump, infinite ----------
  {
    const [cx, cy] = SPOT.disc, o = { x: [-1.5, 3.5], y: [-3, 4], unit: 0.55, grid: [0.5, 1], ticks: [1, 1] };
    const Bs = [board(root, { ...o, c: [cx - 3.1, cy + 2.4] }), board(root, { ...o, c: [cx + 3.1, cy + 2.4] }), board(root, { ...o, c: [cx, cy - 2.4] })];
    Bs.forEach(b => labels.push(...b.labels));
    const [B1, B2, B3] = Bs;
    const r = asm('discRem', root, { title: 'Removable', sub: 'the limit exists; the point is missing or misplaced' });
    curve(B1, r, x => x === 2 ? NaN : M.rem10(x), B1.x0, B1.x1, { n: 201 }); putAt(B1, hole(r), M.A10R, M.L10R);
    const j = asm('discJump', root, { title: 'Jump', sub: 'the one-sided limits differ' });
    curve(B2, j, M.jump10, B2.x0, M.A10J - 1e-6); curve(B2, j, M.jump10, M.A10J, B2.x1);
    putAt(B2, hole(j), M.A10J, 2); putAt(B2, dot(j, { r: 0.09 }), M.A10J, -1);
    const n = asm('discInf', root, { title: 'Infinite', sub: 'a vertical asymptote' });
    curve(B3, n, M.inf10, B3.x0, B3.x1, { n: 400 }); dashes(B3, n, [1, -3], [1, 4]);
    const sl = [pair(B1, r, M.rem10, M.A10R, { r: 0.075 }), pair(B2, j, M.jump10, M.A10J, { r: 0.075 }), pair(B3, n, M.inf10, M.A10I, { r: 0.075, h0: 1.4 })];
    updates.push(s => sl.forEach(f => f(s.t)));
    mark('removable', () => B1.P(1, 4.6), 'board'); mark('jump', () => B2.P(1, 4.6), 'board'); mark('infinite', () => B3.P(1, 4.6), 'board');
  }

  // ---------- 1.11 continuity at a point (with a corner) ----------
  {
    const S = board(root, { c: SPOT.cont, x: [-2.5, 2.5], y: [-3.5, 3.5], unit: 0.85, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...S.labels);
    const g = asm('contCurve', root, { title: 'The function', sub: 'x + 1 up to x = 1, then 3 − x²' });
    curve(S, g, M.c11, S.x0, S.x1, { n: 400 });
    const pt = asm('contPoint', root, { title: 'The point (1, 2)', sub: 'f(1) is defined, and equals the limit' });
    putAt(S, dot(pt, { r: 0.11, name: 'f(1)' }), M.A11, M.L11);
    const p = asm('contPts', root, { title: 'Both sides', sub: `each heads to ${M.L11}` });
    const slide = pair(S, p, M.c11, M.A11, { h0: 1.6 });
    updates.push(s => slide(s.t));
    mark('(1, 2)', () => S.P(M.A11 + 0.55, M.L11 + 0.3));
  }

  // ---------- 1.12 continuity on an interval: a pen drawing √(9 − x²) without lifting ----------
  {
    const S = board(root, { c: SPOT.ival, x: [-4, 4], y: [-1, 4], unit: 0.85, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...S.labels);
    const ghost = asm('ivalGraph', root, { title: 'y = √(9 − x²)', sub: 'domain [−3, 3]' });
    curve(S, ghost, M.semi, -M.R12, M.R12, { n: 400, pal: 'dark', tone: 'lo', r: 0.02 });
    const pen = asm('ivalPen', root, { title: 'The pen', sub: 'traces the whole interval in one stroke' });
    const ink = liveCurve(S, pen, { pal: 'ink', r: 0.04, n: 200, name: 'Ink' }), tip = dot(pen, { pal: 'red', r: 0.1, name: 'Pen' });
    const ends = asm('ivalEnds', root, { title: 'The endpoints', sub: 'continuous from one side only' });
    putAt(S, dot(ends, { r: 0.1, pal: 'blue' }), -M.R12, 0); putAt(S, dot(ends, { r: 0.1, pal: 'blue' }), M.R12, 0);
    updates.push(s => {
      const x = M.pen12(s.t);
      ink.visible = x > -M.R12 + 1e-3;
      if (ink.visible) ink.set(M.semi, -M.R12, x);
      putAt(S, tip, x, M.semi(x));
    });
  }

  // ---------- 1.13 removing a discontinuity: choose k ----------
  {
    const S = board(root, { c: SPOT.fix, x: [-1, 3.2], y: [-1, 6], unit: 0.85, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...S.labels);
    const l = asm('fixLeft', root, { title: 'The left piece', sub: 'kx + 1, a line that turns with k' });
    const line = liveCurve(S, l, { pal: 'red', r: 0.035, n: 40, name: 'kx + 1' }), end = hole(l, { pal: 'red' });
    const r = asm('fixRight', root, { title: 'The right piece', sub: 'x² − 1 from x = 2 on' });
    curve(S, r, M.right13, M.A13, S.x1); putAt(S, dot(r, { r: 0.1 }), M.A13, M.right13(M.A13));
    putAt(S, dot(root, { r: 0.06, pal: 'dark', tone: 'mid' }), 0, 1);
    updates.push(s => {
      const k = M.k13(s.clock);
      line.set(x => M.left13(k, x), S.x0, M.A13 - 0.1); putAt(S, end, M.A13, M.left13(k, M.A13), 0.07);
    });
    mark('(2, 3)', () => S.P(M.A13 + 0.55, 2.75));
  }

  // ---------- 1.14 infinite limits and a vertical asymptote ----------
  {
    const S = board(root, { c: SPOT.vert, x: [-3, 7], y: [-6, 8], unit: 0.55, grid: [1, 1], ticks: [2, 2] });
    labels.push(...S.labels);
    const g = asm('vertCurve', root, { title: 'y = (x + 1)/(x − 2)', sub: 'top 3 and bottom 0 at x = 2' });
    curve(S, g, M.r14, S.x0, S.x1, { n: 600 });
    const a = asm('vertAsym', root, { title: 'x = 2', sub: 'the vertical asymptote' });
    dashes(S, a, [M.A14, -6], [M.A14, 8]);
    const h = asm('vertHA', root, { title: 'y = 1', sub: 'where the graph levels off (1.15)' });
    dashes(S, h, [-3, M.HA14], [7, M.HA14], { pal: 'dark', r: 0.012 });
    const p = asm('vertPts', root, { title: 'Closing in on x = 2', sub: 'down from the left, up from the right' });
    const slide = pair(S, p, M.r14, M.A14, { h0: 2.5 });
    updates.push(s => slide(s.t));
    mark('−∞', () => S.P(M.A14 - 0.75, -5.4), 'vec red'); mark('+∞', () => S.P(M.A14 + 0.8, 7.4), 'vec blue');
  }

  // ---------- 1.15 limits at infinity: a horizontal asymptote ----------
  {
    const S = board(root, { c: SPOT.horiz, x: [-20, 20], y: [-2, 5], unit: 0.3, k: 2.2, grid: [2, 1], ticks: [10, 1] });
    labels.push(...S.labels);
    const g = asm('horizCurve', root, { title: 'y = (3x² + 4x)/(x² + 1)', sub: 'leading terms 3x²/x² = 3' });
    curve(S, g, M.f15, S.x0, S.x1, { n: 800 });
    const a = asm('horizAsym', root, { title: 'y = 3', sub: 'the horizontal asymptote, both ways' });
    dashes(S, a, [-20, M.HA15], [20, M.HA15]);
    const p = asm('horizPts', root, { title: 'Running away', sub: 'x → −∞ and x → +∞' });
    const L = dot(p, { pal: 'red', r: 0.09 }), R = dot(p, { pal: 'blue', r: 0.09 });
    updates.push(s => { const x = Math.min(M.far15(s.t), 19.9); putAt(S, L, -x, M.f15(-x)); putAt(S, R, x, M.f15(x)); });
    mark('<i>y</i> = 3', () => S.P(15, 2.4), 'vec red');
  }

  // ---------- 1.16 the Intermediate Value Theorem ----------
  {
    const S = board(root, { c: SPOT.ivt, x: [-0.5, 2.5], y: [-2, 6], unit: 1.5, k: 0.5, grid: [0.25, 1], ticks: [0.5, 1] });
    labels.push(...S.labels);
    const g = asm('ivtCurve', root, { title: 'y = x³ − x − 1', sub: 'continuous: a polynomial' });
    curve(S, g, M.f16, S.x0, S.x1);
    const e = asm('ivtEnds', root, { title: 'The endpoints', sub: `f(1) = ${M.FA16}, f(2) = ${M.FB16}` });
    putAt(S, dot(e, { r: 0.1, pal: 'blue' }), M.A16, M.FA16); putAt(S, dot(e, { r: 0.1, pal: 'blue' }), M.B16, M.FB16);
    dashes(S, e, [M.A16, 0], [M.A16, M.FA16], { pal: 'blue', r: 0.012 }); dashes(S, e, [M.B16, 0], [M.B16, M.FB16], { pal: 'blue', r: 0.012 });
    const lv = asm('ivtLevel', root, { title: 'A level N between them', sub: 'the graph must cross it' });
    const line = rod(lv, { r: 0.022, name: 'y = N' }), c = dot(lv, { pal: 'red', r: 0.1, name: 'c' }), drop = rod(lv, { r: 0.012, pal: 'dark', tone: 'mid', name: 'x = c' });
    updates.push(s => {
      const N = M.N16(s.clock), x = M.c16(N);
      setRod(line, S.P(S.x0, N, 0.04), S.P(S.x1, N, 0.04)); putAt(S, c, x, N); setRod(drop, S.P(x, 0, 0.03), S.P(x, N, 0.03));
    });
    mark('<i>N</i>', () => S.P(-0.62, M.N16(now)), 'vec red');
    mark('<i>c</i>', () => S.P(M.c16(M.N16(now)), -0.8), 'vec red');
  }

  return {
    labels,
    update(s) { now = s.clock; for (const u of updates) u(s); },
  };
}
