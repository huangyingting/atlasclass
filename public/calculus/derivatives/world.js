// The figure: one scene per idea, spread along +x, the camera flying between them page by page.
// Graph paper from the kit; the power-rule cube and the product-rule rectangle are solids.
// Colour code throughout: the curve in ink, a tangent or secant in red, the derivative (or the second secant) in blue.
import * as THREE from 'three';
import { graphBoard, curve, dot, hole, putAt, rod, setRod, setLineThrough, V } from '../kit.js';
import { part, box, lines } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { pair: 0, sec: 24, cool: 48, diff: 72, cube: 96, sum: 118, trig: 140, prod: 166, quot: 188, tan: 212 };
export const PAIR_LOW = -6.5;                  // the derivative's board, below the function's
export const TRIG_Y = { sin: 3.2, exp: -3.6 };
export const DIFF_AT = [[-2.1, 2.1], [2.1, 2.1], [-2.1, -2.1], [2.1, -2.1]];
export const CUBE_S = 1.3;                     // world metres per unit of the cube's side
const cubeO = V(ST.cube - 1.5, -1.5, -1.5);    // the cube's corner at the origin of its axes
export const coolY = T => (T - 30) / 5;        // the cooling board plots (T − 30)/5: one square is 1 min by 5 °C

// a red (or other) tangent segment of world length about 2·half, centred on (x, y)
function tangentAt(B, m, x, y, s, half) {
  const dx = half / Math.sqrt(1 + s * s);
  setLineThrough(B, m, x, y, s, Math.max(B.x0, x - dx), Math.min(B.x1, x + dx), 0.1);
}
// a thin dashed line between two world points, moved with .set(a, b) (links between a point and its slope)
function guide(parent, color = '#6e6e74') {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(6);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.1, gapSize: 0.07 }));
  l.userData = { noEdge: true }; l.frustumCulled = false; parent.add(l);
  l.set = (a, b) => { pos.set([a.x, a.y, a.z, b.x, b.y, b.z]); geo.attributes.position.needsUpdate = true; l.computeLineDistances(); };
  return l;
}
const mark = (html, at, cls = 'mark') => ({ cls, html, at });

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];          // per-frame updates, each (state) => void

  // ---------- opener and 2.2: f above, f′ below ----------
  {
    const B = graphBoard(root, { at: [ST.pair, 0, 0], x: [-2.5, 2.5], y: [-2, 2], grid: [0.5, 0.5], ticks: [1, 1] });
    const D = graphBoard(root, { at: [ST.pair, PAIR_LOW, 0], x: [-2.5, 2.5], y: [-1.5, 3.5], grid: [0.5, 0.5], ticks: [1, 1] });
    const fg = asm('fcurve', root, { title: 'The function', sub: 'f(x) = x³/3 − x' });
    curve(B, fg, M.g, B.x0, B.x1, { r: 0.04 });
    const pt = dot(fg, { name: 'The point' });
    const tg = asm('ftangent', root, { title: 'The tangent line', sub: 'the slope of f at one point' });
    const tl = rod(tg, { r: 0.03, name: 'Tangent' }), tp = dot(tg, { pal: 'red', r: 0.1, name: 'Point of tangency' });
    const dg = asm('fderiv', root, { title: 'The derivative', sub: 'f′(x) = x² − 1, the slope at every x' });
    curve(D, dg, M.dg, D.x0, D.x1, { pal: 'blue', r: 0.04, name: 'f′' });
    const dd = dot(dg, { pal: 'blue', r: 0.11, name: 'Slope, plotted' });
    const link = guide(root);
    labels.push(...B.tickLabels(), ...D.tickLabels(),
      mark('<i>y</i> = <i>f</i>(<i>x</i>)', () => B.P(-2.4, 1.7), 'board'), mark('<i>y</i> = <i>f</i> ′(<i>x</i>)', () => D.P(-2.4, 3.2), 'board'));
    ups.push(s => {
      const x = M.pairX(s.c), y = M.g(x), m = M.dg(x);
      tangentAt(B, tl, x, y, m, 1.6); putAt(B, tp, x, y, 0.08); putAt(B, pt, x, y, 0.02);
      putAt(D, dd, x, m, 0.08);
      link.set(B.P(x, y, 0.02), D.P(x, m, 0.02));
    });
  }

  // ---------- 2.1 secant to tangent: s(t) = t² at t = 1 ----------
  {
    const B = graphBoard(root, { at: [ST.sec, 0, 0], x: [-0.5, 2.5], y: [-0.5, 5], grid: [0.5, 0.5], ticks: [1, 1] });
    const sg = asm('sgraph', root, { title: 'Position', sub: 's(t) = t² metres' });
    curve(B, sg, M.s, B.x0, B.x1, { r: 0.04 });
    const sc = asm('secant', root, { title: 'The secant line', sub: 'through P and Q: the average rate of change' });
    const sl = rod(sc, { r: 0.03, name: 'Secant' }), Q = dot(sc, { pal: 'red', r: 0.1, name: 'Q' });
    const run = rod(sc, { r: 0.014, pal: 'dark', name: 'Run h' }), rise = rod(sc, { r: 0.014, pal: 'dark', name: 'Rise' });
    const tn = asm('stangent', root, { title: 'The tangent line', sub: 'at P: the instantaneous rate of change' });
    const tl = rod(tn, { r: 0.018, pal: 'blue', name: 'Tangent' });
    setLineThrough(B, tl, M.SEC.a, M.s(M.SEC.a), M.ds(M.SEC.a), B.x0, B.x1, 0.03);
    const P = dot(sg, { r: 0.1, name: 'P' }); putAt(B, P, M.SEC.a, M.s(M.SEC.a), 0.09);
    let h = 1;
    labels.push(...B.tickLabels({ xName: 't', yName: 's' }),
      mark('<i>P</i>', () => B.P(M.SEC.a - 0.22, M.s(M.SEC.a) + 0.25)),
      mark('<i>Q</i>', () => h > 0.2 ? B.P(M.SEC.a + h - 0.25, M.s(M.SEC.a + h) + 0.15) : null),
      { ...mark('', () => h > 0.25 ? B.P(M.SEC.a + h / 2, M.s(M.SEC.a) - 0.22) : null), text: () => `<i>h</i> = ${h.toFixed(2)}` });
    ups.push(st => {
      h = M.secH(st.c);
      const a = M.SEC.a, x1 = a + h;
      setLineThrough(B, sl, a, M.s(a), M.secSlope(h));
      putAt(B, Q, x1, M.s(x1), 0.1);
      setRod(run, B.P(a, M.s(a), 0.05), B.P(x1, M.s(a), 0.05)); setRod(rise, B.P(x1, M.s(a), 0.05), B.P(x1, M.s(x1), 0.05));
    });
  }

  // ---------- 2.3 estimating from a table: cooling coffee ----------
  {
    const B = graphBoard(root, { at: [ST.cool, 0, 0], x: [0, 12], y: [0, 13], unit: 0.5, grid: [1, 1], ticks: [3, 2] });
    const fm = asm('formula', root, { title: 'The smooth curve', sub: 'T = 22 + 68e^(−t/10), which the table samples' });
    curve(B, fm, t => coolY(M.T(t)), 0, 12, { r: 0.016, pal: 'dark', tone: 'lo' });
    const dt = asm('data', root, { title: 'The table', sub: 'five readings of the temperature' });
    for (const [t, T] of M.TABLE) putAt(B, dot(dt, { r: 0.085, name: `t = ${t}` }), t, coolY(T), 0.07);
    const ch = asm('chord', root, { title: 'The estimate', sub: 'the secant across the readings at t = 5 and 9' });
    const cl = rod(ch, { r: 0.026, name: 'Secant' });
    { const s = (coolY(M.Tread(M.COOL.hi)) - coolY(M.Tread(M.COOL.lo))) / (M.COOL.hi - M.COOL.lo); setLineThrough(B, cl, M.COOL.lo, coolY(M.Tread(M.COOL.lo)), s, 3.6, 10.4, 0.04); }
    const sy = asm('symm', root, { title: 'The symmetric difference', sub: 'a secant centred on t = 7, shrinking' });
    const yl = rod(sy, { r: 0.018, pal: 'blue', name: 'Symmetric secant' });
    const ya = dot(sy, { pal: 'blue', r: 0.065, name: 't = 7 − h' }), yb = dot(sy, { pal: 'blue', r: 0.065, name: 't = 7 + h' });
    const tick = []; const x7 = B.P(M.COOL.at, 0, 0.01), y7 = B.P(M.COOL.at, coolY(M.T(M.COOL.at)), 0.01);
    for (let k = 0; k < 12; k++) { const a = k / 12, b = (k + 0.5) / 12; tick.push(...x7.clone().lerp(y7, a).toArray(), ...x7.clone().lerp(y7, b).toArray()); }
    lines(root, tick, '#9c9ca2');
    labels.push(
      ...[0, 3, 6, 9, 12].map(t => ({ cls: 'tick', html: `${t}`, at: () => B.P(t, 0).add(V(0.12, -0.2, 0)) })),
      ...[30, 40, 50, 60, 70, 80, 90].map(T => ({ cls: 'tick', html: `${T}`, at: () => B.P(0, coolY(T)).add(V(-0.08, 0, 0)) })),
      mark('<i>t</i> (min)', () => B.P(12, 0).add(V(0.2, 0.3, 0)), 'axis'), mark('<i>T</i> (°C)', () => B.P(0, 13).add(V(0.65, 0.15, 0)), 'axis'),
      mark('<i>t</i> = 7', () => B.P(M.COOL.at, 0).add(V(0, -0.25, 0))));
    ups.push(s => {
      const h = M.coolH(s.c), a = M.COOL.at - h, b = M.COOL.at + h, sl = (coolY(M.T(b)) - coolY(M.T(a))) / (2 * h);
      setLineThrough(B, yl, a, coolY(M.T(a)), sl, Math.max(0, a - 1.2), Math.min(12, b + 1.2), 0.05);
      putAt(B, ya, a, coolY(M.T(a)), 0.08); putAt(B, yb, b, coolY(M.T(b)), 0.08);
    });
  }

  // ---------- 2.4 four ways to fail at x = 0 ----------
  {
    M.FAILS.forEach((F, i) => {
      const [ox, oy] = DIFF_AT[i];
      const B = graphBoard(root, { at: [ST.diff + ox, oy, 0], x: [-1.5, 1.5], y: [-1.5, 1.5], grid: [0.5, 0.5], ticks: [1, 1] });
      const g = asm(F.key, root, { title: F.name[0].toUpperCase() + F.name.slice(1), sub: { corner: 'y = |x|', cusp: 'y = x^(2/3)', vert: 'y = x^(1/3)', jump: 'x/2 + 1 for x < 0, x/2 for x ≥ 0' }[F.key] });
      if (F.key === 'jump') {
        curve(B, g, F.f, -1.5, -0.001, { r: 0.035 }); curve(B, g, F.f, 0, 1.5, { r: 0.035 });
        putAt(B, hole(g, { r: 0.08 }), 0, 1, 0.07);
      } else if (F.key === 'vert') curve(B, g, F.f, -1.5, 1.5, { r: 0.035, n: 400 });
      else { curve(B, g, F.f, -1.5, 0, { r: 0.035, n: 200 }); curve(B, g, F.f, 0, 1.5, { r: 0.035, n: 200 }); }   // two pieces: a spline would round the point
      putAt(B, dot(g, { r: 0.085, name: 'x = 0' }), 0, F.f(0), 0.08);
      const L = rod(g, { r: 0.02, pal: 'blue', name: 'Secant from the left' }), R = rod(g, { r: 0.02, pal: 'red', name: 'Secant from the right' });
      const dl = dot(g, { pal: 'blue', r: 0.07, name: 'x = −h' }), dr = dot(g, { pal: 'red', r: 0.07, name: 'x = h' });
      labels.push(...B.tickLabels(), mark(F.name, () => B.P(-1.5, 1.5).add(V(0.0, 0.55, 0)), 'board'));
      ups.push(s => {
        const h = M.diffH(s.c);
        setLineThrough(B, L, 0, F.f(0), M.leftSlope(F.f, h), B.x0, 0, 0.045);
        setLineThrough(B, R, 0, F.f(0), M.rightSlope(F.f, h), 0, B.x1, 0.045);
        putAt(B, dl, -h, F.f(-h), 0.08); putAt(B, dr, h, F.f(h), 0.08);
      });
    });
  }

  // ---------- 2.5 the power rule: a cube of side x grown by Δx, its new pieces pulled out to be seen ----------
  {
    const X = M.CUBE.x * CUBE_S, Ex = 0.6;           // Ex: how far the new pieces stand off the cube
    part(root, box(8, 0.05, 8, 0.01), { pal: 'board', tone: 'faint', pos: [cubeO.x + X / 2 + 0.6, cubeO.y - 0.06, cubeO.z + X / 2 + 0.6] });
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const block = (g, pal, tone, name) => { const m = part(g, unitBox, { pal, tone, name }); m.userData.home = null; return m; };
    // a box from corner (x0, y0, z0) of size (w, h, d), in cube units of world metres; o: which axes it is pushed out along
    const place = (m, [x0, y0, z0], [w, h, d], o = [0, 0, 0]) => {
      m.position.set(cubeO.x + x0 + w / 2 + o[0] * Ex, cubeO.y + y0 + h / 2 + o[1] * Ex, cubeO.z + z0 + d / 2 + o[2] * Ex);
      m.scale.set(Math.max(w, 1e-3), Math.max(h, 1e-3), Math.max(d, 1e-3));
    };
    const cg = asm('cube', root, { title: 'The cube', sub: `side x = ${M.CUBE.x}, volume x³ = ${M.CUBE.x ** 3}` });
    place(block(cg, 'paper', 'hi', 'x³'), [0, 0, 0], [X, X, X]);
    const sg = asm('slabs', root, { title: 'Three slabs', sub: 'x² Δx each: the 3x² of the power rule' });
    const slabs = [0, 1, 2].map(() => block(sg, 'red', 'hi', 'x² Δx'));
    const rg = asm('rods', root, { title: 'Three rods', sub: 'x (Δx)² each: gone faster than Δx' });
    const rods = [0, 1, 2].map(() => block(rg, 'blue', 'hi', 'x (Δx)²'));
    const kg = asm('corner3', root, { title: 'The corner', sub: '(Δx)³' });
    const corner = block(kg, 'ink', 'hi', '(Δx)³');
    let dx = 0;
    labels.push(
      mark('<i>x</i>', () => V(cubeO.x + X / 2, cubeO.y - 0.3, cubeO.z + X + dx + Ex)),
      mark('<i>x</i>', () => V(cubeO.x - 0.3, cubeO.y + X / 2, cubeO.z + X + dx + Ex)),
      mark('Δ<i>x</i>', () => dx > 0.2 ? V(cubeO.x + X + Ex + dx / 2, cubeO.y - 0.3, cubeO.z + X + dx + Ex) : null));
    ups.push(s => {
      dx = M.cubeDx(s.c) * CUBE_S;
      place(slabs[0], [X, 0, 0], [dx, X, X], [1, 0, 0]); place(slabs[1], [0, X, 0], [X, dx, X], [0, 1, 0]); place(slabs[2], [0, 0, X], [X, X, dx], [0, 0, 1]);
      place(rods[0], [X, X, 0], [dx, dx, X], [1, 1, 0]); place(rods[1], [X, 0, X], [dx, X, dx], [1, 0, 1]); place(rods[2], [0, X, X], [X, dx, dx], [0, 1, 1]);
      place(corner, [X, X, X], [dx, dx, dx], [1, 1, 1]);
    });
  }

  // ---------- 2.6 sums: u, v and u + v, tangents at the same x ----------
  {
    const B = graphBoard(root, { at: [ST.sum, 0, 0], x: [-1, 3.5], y: [-1, 6.5], grid: [0.5, 0.5], ticks: [1, 1] });
    const uu = asm('u', root, { title: 'u(x) = x²/2', sub: 'slope u′(x) = x' }), vv = asm('v', root, { title: 'v(x) = 3 − x', sub: 'slope v′(x) = −1' });
    const ww = asm('uv', root, { title: 'u + v', sub: 'slope u′ + v′ = x − 1' });
    curve(B, uu, M.u, B.x0, B.x1, { pal: 'blue', r: 0.03 }); curve(B, vv, M.v, B.x0, B.x1, { pal: 'dark', r: 0.03 });
    const w = x => M.u(x) + M.v(x), dw = x => M.du(x) + M.dv(x);
    curve(B, ww, w, B.x0, B.x1, { r: 0.045 });
    const parts = [[uu, M.u, M.du], [vv, M.v, M.dv], [ww, w, dw]].map(([g, fn, dfn]) => ({ fn, dfn, t: rod(g, { r: 0.026, name: 'Tangent' }), p: dot(g, { r: 0.085, name: 'Point' }) }));
    const gl = guide(root);
    labels.push(...B.tickLabels(),
      mark('<i>u</i>', () => B.P(3.3, M.u(3.3)).add(V(-0.35, 0.1, 0))), mark('<i>v</i>', () => B.P(3.3, M.v(3.3)).add(V(0.1, 0.3, 0))),
      mark('<i>u</i> + <i>v</i>', () => B.P(-0.85, w(-0.85)).add(V(0.2, 0.45, 0))));
    ups.push(s => {
      const x = M.sumX(s.c);
      for (const P of parts) { tangentAt(B, P.t, x, P.fn(x), P.dfn(x), 0.9); putAt(B, P.p, x, P.fn(x), 0.08); }
      gl.set(B.P(x, B.y0, 0.01), B.P(x, B.y1, 0.01));
    });
  }

  // ---------- 2.7 sin x (its slope traces cos x); eˣ and ln x, mirror images ----------
  {
    const S = graphBoard(root, { at: [ST.trig, TRIG_Y.sin, 0], x: [-3.4, 3.4], y: [-1.5, 1.5], grid: [0.5, 0.5], ticks: [1, 1] });
    const sg = asm('sin', root, { title: 'y = sin x', sub: 'its tangent, sliding' });
    curve(S, sg, Math.sin, S.x0, S.x1, { r: 0.04 });
    const st = rod(sg, { r: 0.026, name: 'Tangent' }), sp = dot(sg, { r: 0.085, name: 'Point' });
    const cg = asm('cos', root, { title: 'y = cos x', sub: 'the slope of sin x, plotted' });
    curve(S, cg, Math.cos, S.x0, S.x1, { pal: 'blue', r: 0.022, tone: 'mid' });
    const cp = dot(cg, { pal: 'blue', r: 0.095, name: 'Slope of sin x' });
    const sl = guide(root);

    const X = graphBoard(root, { at: [ST.trig, TRIG_Y.exp, 0], x: [-2.5, 3.5], y: [-2.5, 3.5], grid: [0.5, 0.5], ticks: [1, 1] });
    lines(root, [...X.P(-2.5, -2.5, 0.01).toArray(), ...X.P(3.5, 3.5, 0.01).toArray()], '#b4b4b8');
    const eg = asm('exp', root, { title: 'y = eˣ', sub: 'slope = height, everywhere' });
    curve(X, eg, Math.exp, X.x0, X.x1, { r: 0.04 });
    const et = rod(eg, { r: 0.026, name: 'Tangent' }), ep = dot(eg, { r: 0.085, name: 'Point' });
    const rise = guide(root);
    const lg = asm('ln', root, { title: 'y = ln x', sub: 'the mirror image: slope 1/x' });
    curve(X, lg, Math.log, 0.05, X.x1, { r: 0.04 });
    const lt = rod(lg, { r: 0.026, pal: 'blue', name: 'Tangent' }), lp = dot(lg, { r: 0.085, name: 'Point' });
    const mir = guide(root, '#b4b4b8');
    const piTicks = [[-Math.PI, '−π'], [-Math.PI / 2, '−π/2'], [Math.PI / 2, 'π/2'], [Math.PI, 'π']];
    labels.push(...S.tickLabels().filter(L => !(L.cls === 'tick' && L.at().y < S.P(0, 0).y - 0.1)), ...X.tickLabels(),   // x in multiples of π/2 instead
      ...piTicks.map(([x, h]) => ({ cls: 'tick', html: h, at: () => S.P(x, 0).add(V(0.15, -0.2, 0)) })),
      mark('sin <i>x</i>', () => S.P(1.57, 1).add(V(0, 0.32, 0))), mark('cos <i>x</i>', () => S.P(-2.5, Math.cos(-2.5)).add(V(-0.1, -0.35, 0))),
      mark('<i>e</i><sup><i>x</i></sup>', () => X.P(1.05, Math.exp(1.05)).add(V(-0.45, 0.15, 0))), mark('ln <i>x</i>', () => X.P(3.2, Math.log(3.2)).add(V(0, 0.35, 0))),
      mark('<i>y</i> = <i>x</i>', () => X.P(2.9, 2.9).add(V(0.45, -0.1, 0))));
    ups.push(s => {
      const x = M.sinX(s.c);
      tangentAt(S, st, x, Math.sin(x), Math.cos(x), 1.2); putAt(S, sp, x, Math.sin(x), 0.08); putAt(S, cp, x, Math.cos(x), 0.09);
      sl.set(S.P(x, Math.sin(x), 0.02), S.P(x, Math.cos(x), 0.02));
      const a = M.expA(s.c), ea = Math.exp(a);
      tangentAt(X, et, a, ea, ea, 1.3); putAt(X, ep, a, ea, 0.08);
      rise.set(X.P(a, 0, 0.02), X.P(a, ea, 0.02));
      tangentAt(X, lt, ea, a, 1 / ea, 1.3); putAt(X, lp, ea, a, 0.08);
      mir.set(X.P(a, ea, 0.015), X.P(ea, a, 0.015));
    });
  }

  // ---------- 2.8 the product rule: a rectangle f by g, grown ----------
  {
    const B = graphBoard(root, { at: [ST.prod, 0, 0], x: [-0.5, 4.5], y: [-0.5, 3], grid: [0.5, 0.5], ticks: [1, 1] });
    const D = 0.12;
    const unitBox = new THREE.BoxGeometry(1, 1, 1);
    const block = (g, pal, name) => { const m = part(g, unitBox, { pal, tone: 'hi', name }); m.userData.home = null; return m; };
    const place = (m, x0, y0, w, h, d = D) => { const c = B.P(x0 + w / 2, y0 + h / 2, d / 2); m.position.copy(c); m.scale.set(Math.max(w - 0.012, 1e-3), Math.max(h - 0.012, 1e-3), d); };
    const ag = asm('area', root, { title: 'The rectangle', sub: `sides f(2) = ${M.PROD.f} and g(2) = ${M.PROD.g}: area f·g` });
    place(block(ag, 'base', 'f·g'), 0, 0, M.PROD.f, M.PROD.g);
    const rg = asm('stripG', root, { title: 'f · Δg', sub: 'the top strip: f stays, g grows' }), bg = asm('stripF', root, { title: 'g · Δf', sub: 'the side strip: g stays, f grows' });
    const kg = asm('cornerFG', root, { title: 'Δf · Δg', sub: 'the corner: gone faster than Δx' });
    const top = block(rg, 'red', 'f Δg'), side = block(bg, 'blue', 'g Δf'), cor = block(kg, 'ink', 'Δf Δg');
    let dx = 0;
    labels.push(...B.tickLabels(),
      mark('<i>f</i>', () => B.P(M.PROD.f / 2, 0).add(V(0, -0.35, 0.1))), mark('<i>g</i>', () => B.P(0, M.PROD.g / 2).add(V(-0.3, 0, 0.1))),
      { ...mark('', () => dx > 0.12 ? B.P(M.PROD.f / 2, M.PROD.g + M.PROD.dg * dx).add(V(0, 0.28, 0.1)) : null), text: () => '<i>f</i>·Δ<i>g</i>' },
      { ...mark('', () => dx > 0.12 ? B.P(M.PROD.f + M.PROD.df * dx, M.PROD.g / 2).add(V(0.45, 0, 0.1)) : null), text: () => '<i>g</i>·Δ<i>f</i>' });
    ups.push(s => {
      dx = M.prodDx(s.c);
      const Df = M.PROD.df * dx, Dg = M.PROD.dg * dx;
      place(top, 0, M.PROD.g, M.PROD.f, Dg); place(side, M.PROD.f, 0, Df, M.PROD.g); place(cor, M.PROD.f, M.PROD.g, Df, Dg);
    });
  }

  // ---------- 2.9 the quotient rule: q = (3x + 1)/(x² + 1), its slope traced ----------
  {
    const B = graphBoard(root, { at: [ST.quot, 0, 0], x: [-4, 4], y: [-1.5, 3.5], grid: [0.5, 0.5], ticks: [1, 1] });
    const qg = asm('quot', root, { title: 'q(x) = (3x + 1)/(x² + 1)', sub: 'a quotient of two functions' });
    curve(B, qg, M.q, B.x0, B.x1, { r: 0.04 });
    const tl = rod(qg, { r: 0.026, name: 'Tangent' }), tp = dot(qg, { r: 0.085, name: 'Point' });
    const dg = asm('dquot', root, { title: 'q′(x)', sub: '(−3x² − 2x + 3)/(x² + 1)²' });
    curve(B, dg, M.dq, B.x0, B.x1, { pal: 'blue', r: 0.022 });
    const dp = dot(dg, { pal: 'blue', r: 0.095, name: 'Slope of q' });
    const sl = guide(root);
    labels.push(...B.tickLabels(),
      mark('<i>q</i>', () => B.P(3.2, M.q(3.2)).add(V(0.1, 0.35, 0))), mark('<i>q</i> ′', () => B.P(-0.35, M.dq(-0.35)).add(V(-0.4, 0.2, 0))));
    ups.push(s => {
      const x = M.quotX(s.c);
      tangentAt(B, tl, x, M.q(x), M.dq(x), 1.3); putAt(B, tp, x, M.q(x), 0.08); putAt(B, dp, x, M.dq(x), 0.09);
      sl.set(B.P(x, M.q(x), 0.02), B.P(x, M.dq(x), 0.02));
    });
  }

  // ---------- 2.10 tan x, and its slope sec² x ----------
  {
    const B = graphBoard(root, { at: [ST.tan, 0, 0], x: [-2, 2], y: [-3, 4.5], grid: [0.5, 0.5], ticks: [1, 1] });
    const e = 1e-3, H = Math.PI / 2;
    const tg = asm('tan', root, { title: 'y = tan x', sub: 'between its asymptotes at ±π/2' });
    curve(B, tg, Math.tan, -H + e, H - e, { r: 0.04, n: 400 });
    const tl = rod(tg, { r: 0.026, name: 'Tangent' }), tp = dot(tg, { r: 0.085, name: 'Point' });
    const sg = asm('sec2', root, { title: 'y = sec² x', sub: 'the slope of tan x: never below 1' });
    curve(B, sg, M.sec2, -H + e, H - e, { pal: 'blue', r: 0.022, n: 400 });
    const sp = dot(sg, { pal: 'blue', r: 0.095, name: 'Slope of tan x' });
    const sl = guide(root);
    const dash = [];
    for (const xa of [-H, H]) for (let y = -3; y < 4.5; y += 0.3) dash.push(...B.P(xa, y, 0.01).toArray(), ...B.P(xa, Math.min(y + 0.15, 4.5), 0.01).toArray());
    lines(root, dash, '#8a8a8f');
    labels.push(...B.tickLabels(),
      mark('tan <i>x</i>', () => B.P(1.2, Math.tan(1.2)).add(V(0.45, 0, 0))), mark('sec² <i>x</i>', () => B.P(-1.15, M.sec2(-1.15)).add(V(-0.55, 0, 0))),
      mark('π/2', () => B.P(H, -3).add(V(0.25, 0.2, 0))), mark('−π/2', () => B.P(-H, -3).add(V(-0.3, 0.2, 0))));
    ups.push(s => {
      const x = M.tanX(s.c);
      tangentAt(B, tl, x, Math.tan(x), M.sec2(x), 1.2); putAt(B, tp, x, Math.tan(x), 0.08); putAt(B, sp, x, M.sec2(x), 0.09);
      sl.set(B.P(x, Math.tan(x), 0.02), B.P(x, M.sec2(x), 0.02));
    });
  }

  return { labels, update: s => { for (const f of ups) f(s); } };
}
