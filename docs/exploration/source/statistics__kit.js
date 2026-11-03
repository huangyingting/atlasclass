// Calculus kit: graph paper standing in the scene, and what is drawn on it (curves, points, holes, lines, bars).
// Every chapter of calculus draws with these, so the figures read as one book. A board maps math (x, y) to the
// world: x to the right, y up, on the plane z = at[2], facing the camera at +z. Solids (volumes, surfaces) are
// built by the chapters themselves with parts.js.
import * as THREE from 'three';
import { part, box, lines, shadeMat, liveTube, V } from './engine/parts.js';

export { V };
const fmt = v => (v < 0 ? '−' : '') + +Math.abs(v).toFixed(2);

// a sheet of graph paper. x: [x0, x1], y: [y0, y1] in math units; unit: world metres per math unit, or [ux, uy] when
// y needs its own scale (a flat function, minutes against degrees); grid: [dx, dy] spacing of the faint lines (0 for
// none); ticks: [dx, dy] spacing of the labelled numbers. Everything drawn on it goes through P, so it is in math units.
export function graphBoard(parent, { at = [0, 0, 0], x: [x0, x1], y: [y0, y1], unit = 1, grid = [1, 1], ticks = grid, pad = 0.35, axes = true }) {
  const g = new THREE.Group(); parent.add(g);
  const [ux, uy] = Array.isArray(unit) ? unit : [unit, unit];
  const P = (x, y, lift = 0) => V(at[0] + x * ux, at[1] + y * uy, at[2] + lift);
  const W = (x1 - x0) * ux + 2 * pad, H = (y1 - y0) * uy + 2 * pad, c = P((x0 + x1) / 2, (y0 + y1) / 2);
  part(g, box(W, H, 0.04, 0.01), { tone: 'faint', pal: 'board', pos: [c.x, c.y, at[2] - 0.03] });
  const z = at[2] + 0.002, seg = [];
  const steps = (a, b, d) => { const out = []; if (d > 0) for (let v = Math.ceil(a / d - 1e-9) * d; v <= b + 1e-9; v += d) out.push(+v.toFixed(10)); return out; };
  for (const x of steps(x0, x1, grid[0])) seg.push(...P(x, y0).toArray().slice(0, 2), z, ...P(x, y1).toArray().slice(0, 2), z);
  for (const y of steps(y0, y1, grid[1])) seg.push(...P(x0, y).toArray().slice(0, 2), z, ...P(x1, y).toArray().slice(0, 2), z);
  if (seg.length) lines(g, seg, '#e4e4df');
  const ax = [];
  if (axes && y0 <= 0 && y1 >= 0) ax.push(P(x0, 0).x, P(0, 0).y, z + 0.001, P(x1, 0).x, P(0, 0).y, z + 0.001);
  if (axes && x0 <= 0 && x1 >= 0) ax.push(P(0, 0).x, P(0, y0).y, z + 0.001, P(0, 0).x, P(0, y1).y, z + 0.001);
  if (ax.length) lines(g, ax, '#6e6e74');
  // labels for main.js: numbers along each axis (where it crosses the board), and the axis names (a plain name is
  // set in italics; one with tags as given). skipX / skipY: numbers left off where something else is labelled.
  const yAt = y0 <= 0 && y1 >= 0 ? 0 : y0, xAt = x0 <= 0 && x1 >= 0 ? 0 : x0, name = n => n.includes('<') ? n : `<i>${n}</i>`;
  const tickLabels = ({ xName = 'x', yName = 'y', skipX = [], skipY = [], xTicks = true } = {}) => [
    ...(xTicks ? steps(x0, x1, ticks[0]) : []).filter(x => (x !== xAt || xAt !== 0) && !skipX.includes(x)).map(x => ({ cls: 'tick', html: fmt(x), at: () => P(x, yAt).add(V(0.12, -0.2, 0)) })),
    ...steps(y0, y1, ticks[1]).filter(y => (y !== yAt || yAt !== 0) && !skipY.includes(y)).map(y => ({ cls: 'tick', html: fmt(y), at: () => P(xAt, y).add(V(-0.08, 0, 0)) })),
    { cls: 'axis', html: name(xName), at: () => P(x1, yAt).add(V(0.3, 0.22, 0)) },
    { cls: 'axis', html: name(yName), at: () => P(xAt, y1).add(V(0.25, 0.15, 0)) },
  ];
  const inside = (x, y) => x >= x0 - 1e-9 && x <= x1 + 1e-9 && y >= y0 - 1e-9 && y <= y1 + 1e-9;
  return { group: g, P, unit: ux, ux, uy, x0, x1, y0, y1, inside, tickLabels };
}

// y = fn(x) on [a, b] as a solid tube. Where fn leaves the board or isn't finite the curve breaks (asymptotes,
// jumps), so each unbroken run is its own tube. Returns a group (hide or light it as one).
export function curve(B, parent, fn, a, b, { n = 240, r = 0.035, pal = 'ink', tone = 'hi', name = 'Curve', lift = 0.03 } = {}) {
  const g = new THREE.Group(); parent.add(g);
  let run = [];
  const flush = () => {
    if (run.length > 1) part(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(run, false, 'centripetal'), Math.max(run.length * 2, 8), r, 16), { pal, tone, name });
    run = [];
  };
  for (let i = 0; i <= n; i++) {
    const x = a + (b - a) * i / n, y = fn(x);
    if (Number.isFinite(y) && B.inside(x, y)) run.push(B.P(x, y, lift)); else flush();
  }
  flush();
  return g;
}

// a curve that changes every frame (a Taylor polynomial gaining terms, a secant line's family): set(fn, a, b).
// ponytail: off-board values are clamped to the board's edge rather than broken; draw with curve() when a fixed
// curve leaves the board.
export function liveCurve(B, parent, { n = 160, r = 0.03, pal = 'red', tone = 'hi', name = 'Curve', lift = 0.04 } = {}) {
  const geo = liveTube(n, r, 16), m = part(parent, geo, { pal, tone, name });
  const pts = Array.from({ length: n + 1 }, () => V());
  m.set = (fn, a, b) => {
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * i / n, y = fn(x);
      pts[i].copy(B.P(x, Math.min(Math.max(Number.isFinite(y) ? y : 0, B.y0), B.y1), lift));
    }
    geo.update(pts);
  };
  return m;
}

// a filled point on the curve, and an open circle (a hole: the function is undefined there)
export const dot = (parent, { r = 0.09, pal = 'ink', tone = 'hi', name = 'Point' } = {}) =>
  part(parent, new THREE.SphereGeometry(r, 24, 16), { pal, tone, name });
export function hole(parent, { r = 0.09, pal = 'ink', tone = 'hi', name = 'Hole' } = {}) {
  const g = new THREE.Group(); parent.add(g);
  part(g, new THREE.TorusGeometry(r, r * 0.3, 10, 32), { pal, tone, name });
  part(g, new THREE.CircleGeometry(r * 0.9, 24), { pal: 'board', tone: 'faint', name, pos: [0, 0, -0.01] });
  return g;
}
// place a dot or hole at math (x, y) on board B
export const putAt = (B, o, x, y, lift = 0.06) => o.position.copy(B.P(x, y, lift));

// a straight segment between two world points (tangent and secant lines, a run and rise), moved with setRod
export function rod(parent, { r = 0.025, pal = 'red', tone = 'hi', name = 'Line' } = {}) {
  const m = part(parent, new THREE.CylinderGeometry(r, r, 1, 10), { pal, tone, name });
  m.userData.home = null;   // placed by setRod, never by the explode springs
  return m;
}
const UP = V(0, 1, 0), d = V();
export function setRod(m, A, Bp) {
  d.subVectors(Bp, A);
  const len = d.length();
  m.visible = len > 1e-4;
  if (!m.visible) return;
  m.position.copy(A).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(UP, d.normalize());
  m.scale.set(1, len, 1);
}
// the line through math point (x, y) with slope s, clipped to the board's x range [a, b] (default the board's)
export function setLineThrough(B, m, x, y, s, a = B.x0, b = B.x1, lift = 0.05) {
  let xa = a, xb = b;
  if (Math.abs(s) > 1e-9) for (const yy of [B.y0, B.y1]) { const u = x + (yy - y) / s; if (u > x && u < xb) xb = u; if (u < x && u > xa) xa = u; }
  setRod(m, B.P(xa, y + s * (xa - x), lift), B.P(xb, y + s * (xb - x), lift));
}

// up to n bars standing on the x-axis (Riemann rectangles, a slab of a sum): set([[xa, xb, height], …]).
// Bars below the axis hang down from it. depth: how far they stand out of the paper.
export function bars(B, parent, n, { pal = 'blue', tone = 'mid', name = 'Rectangles', depth = 0.12, opacity = 0.85 } = {}) {
  const g = new THREE.Group(); parent.add(g);
  const mat = shadeMat(pal, { opacity }), geo = new THREE.BoxGeometry(1, 1, 1);
  const list = Array.from({ length: n }, () => { const m = part(g, geo, { pal, tone, name, mat }); m.userData.home = null; m.visible = false; return m; });
  g.set = rects => list.forEach((m, i) => {
    const r = rects[i];
    m.visible = !!r && Math.abs(r[2]) > 1e-6 && r[1] > r[0];
    if (!m.visible) return;
    const [xa, xb, h] = r, w = (xb - xa) * B.ux, hh = Math.abs(h) * B.uy;
    m.scale.set(Math.max(w - 0.01, 0.005), hh, depth);
    m.position.copy(B.P((xa + xb) / 2, h / 2, depth / 2));
  });
  return g;
}

// a filled region between y = lo(x) and y = hi(x) on [a, b], flat on the paper (areas, accumulated change)
export function region(B, parent, { pal = 'red', opacity = 0.28, name = 'Region', n = 120 } = {}) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array((n + 1) * 2 * 3), idx = [];
  for (let i = 0; i < n; i++) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  geo.setIndex(idx); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(pos.length).map((_, i) => i % 3 === 2 ? 1 : 0), 3));
  const mat = shadeMat(pal, { opacity }).clone(); mat.side = THREE.DoubleSide;
  const m = new THREE.Mesh(geo, mat); m.userData = { noEdge: true }; parent.add(m);
  m.set = (lo, hi, a, b) => {
    for (let i = 0; i <= n; i++) {
      const x = a + (b - a) * i / n, cl = y => Math.min(Math.max(y, B.y0), B.y1);
      const p = B.P(x, cl(lo(x)), 0.015), q = B.P(x, cl(hi(x)), 0.015);
      pos.set([p.x, p.y, p.z, q.x, q.y, q.z], i * 6);
    }
    geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere();
    m.visible = b > a;
  };
  return m;
}
