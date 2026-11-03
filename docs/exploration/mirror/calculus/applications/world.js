// The figure: one scene per topic, spread along +x. Flat areas are drawn on graph paper standing up; cross-section
// solids stand on a sheet lying on the floor; solids of revolution sweep round their axis in open space.
import * as THREE from 'three';
import { graphBoard, curve, dot, putAt, rod, setRod, bars, region, V } from '../kit.js';
import { part, box, cyl, lines, arrow, setArrow, shadeMat, TONE } from '../engine/parts.js';
import * as M from './model.js';

// where each scene stands (world x of its math origin)
export const ST = { avg: 0, pva: 14, tank: 28, areax: 42, areay: 56, multi: 70, squares: 86, tri: 114, discx: 134, discv: 152, washx: 172, washo: 190, arc: 208 };
export const TRI_OFF = 2.5;    // the triangle and semicircle solids stand one behind the other (in z) at ST.tri
const TAU = Math.PI * 2;

// a mesh that isn't made by part(): pickable and lit like one
const tag = (m, name, tone = 'mid') => { Object.assign(m.userData, { part: name, tone: TONE[tone], baseTone: TONE[tone], home: null, ex: V() }); return m; };

// a filled band between two point paths: set(pair, u0, u1), pair(u) = [[x, y], [x, y]] (math). Areas in x or in y.
function band(B, parent, { pal = 'red', opacity = 0.28, name = 'Region', n = 120, lift = 0.015 } = {}) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array((n + 1) * 6), idx = [];
  for (let i = 0; i < n; i++) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  geo.setIndex(idx); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(pos.length).map((_, i) => i % 3 === 2 ? 1 : 0), 3));
  const mat = shadeMat(pal, { opacity }).clone(); mat.side = THREE.DoubleSide;
  const m = tag(new THREE.Mesh(geo, mat), name); m.userData.noEdge = true; parent.add(m);
  m.set = (pair, u0 = 0, u1 = 1) => {
    m.visible = u1 > u0 + 1e-6;
    if (!m.visible) return;
    for (let i = 0; i <= n; i++) {
      const [[a, b], [c, d]] = pair(u0 + (u1 - u0) * i / n), p = B.P(a, b, lift), q = B.P(c, d, lift);
      pos.set([p.x, p.y, p.z, q.x, q.y, q.z], i * 6);
    }
    geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere(); geo.computeBoundingBox();
  };
  return m;
}

// a curve given as a path (x(u), y(u)): x = y², which y = f(x) can't draw
function path(B, parent, fn, u0, u1, { n = 160, r = 0.035, pal = 'ink', tone = 'hi', name = 'Curve', lift = 0.03 } = {}) {
  const pts = Array.from({ length: n + 1 }, (_, i) => B.P(...fn(u0 + (u1 - u0) * i / n), lift));
  return part(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, 'centripetal'), n * 2, r, 16), { pal, tone, name });
}

// a flat strip (one dx or dy) from math point A to math point B, `w` wide (math units), standing `depth` out of the plane
function strip(B, parent, { pal = 'red', name = 'Strip', depth = 0.1 } = {}) {
  const m = part(parent, new THREE.BoxGeometry(1, 1, 1), { pal, tone: 'hi', name }); m.userData.home = null;
  m.set = (ax, ay, bx, by, w) => {
    const p = B.P(ax, ay), q = B.P(bx, by), vert = Math.abs(ax - bx) < 1e-9;
    m.visible = p.distanceTo(q) > 1e-4;
    m.position.copy(p).add(q).multiplyScalar(0.5).add(V(0, 0, depth / 2));
    m.scale.set(vert ? w * B.unit : Math.abs(q.x - p.x), vert ? Math.abs(q.y - p.y) : w * B.unit, depth);
  };
  return m;
}

// math (x, y) on a plane with no paper: for the solids, which would pass through a sheet
const plane = (at, unit = 1) => ({ unit, P: (x, y, lift = 0) => V(at[0] + x * unit, at[1] + y * unit, at[2] + lift), inside: () => true, y0: -1e9, y1: 1e9 });
// axes as ink lines with ticks, and their tick labels (for main.js)
function axes(parent, B, [x0, x1], [y0, y1], { xt = [], yt = [], xName = 'x', yName = 'y' } = {}) {
  const P = (x, y) => B.P(x, y, 0).toArray(), seg = [...P(x0, 0), ...P(x1, 0), ...P(0, y0), ...P(0, y1)];
  for (const x of xt) seg.push(...P(x, -0.06), ...P(x, 0.06));
  for (const y of yt) seg.push(...P(-0.06, y), ...P(0.06, y));
  lines(parent, seg, '#6e6e74');
  return [
    ...xt.map(x => ({ cls: 'tick', html: `${x}`, at: () => B.P(x, 0).add(V(0.12, -0.22, 0)) })),
    ...yt.map(y => ({ cls: 'tick', html: `${y < 0 ? '−' : ''}${Math.abs(y)}`, at: () => B.P(0, y).add(V(-0.1, 0, 0)) })),
    { cls: 'axis', html: `<i>${xName}</i>`, at: () => B.P(x1, 0).add(V(0.3, 0.22, 0)) },
    { cls: 'axis', html: `<i>${yName}</i>`, at: () => B.P(0, y1).add(V(0.25, 0.15, 0)) },
  ];
}

// a solid of revolution: the closed profile [[s, r], …] (s along the axis, r out from it) turned about the local
// x-axis, starting in the local xy-plane and turning away from the viewer (toward −z), so the cut stays open to view. setSweep(f): only the first f of the turn.
// setProfile(p): a new profile with the same number of points (a moving slab).
function revolve(parent, profile, { pal = 'paper', nT = 96, name = 'Solid', tone = 'mid' } = {}) {
  const segs = profile.length, nv = segs * 2 * (nT + 1);
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), idx = [];
  const vi = (j, e, k) => (j * 2 + e) * (nT + 1) + k;
  for (let k = 0; k < nT; k++) for (let j = 0; j < segs; j++) { const a = vi(j, 0, k), b = vi(j, 1, k), c = vi(j, 0, k + 1), d = vi(j, 1, k + 1); idx.push(a, c, b, b, c, d); }
  geo.setIndex(idx); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  const mat = shadeMat(pal).clone(); mat.side = THREE.DoubleSide;
  const m = tag(new THREE.Mesh(geo, mat), name, tone); parent.add(m);
  const cs = Array.from({ length: nT + 1 }, (_, k) => [Math.cos(k / nT * TAU), Math.sin(k / nT * TAU)]);
  m.setProfile = prof => {
    let area = 0; prof.forEach((p, j) => { const q = prof[(j + 1) % segs]; area += p[0] * q[1] - q[0] * p[1]; });
    const P = area < 0 ? [...prof].reverse() : prof;   // counter-clockwise in (s, r): normals point out, faces wind out
    for (let j = 0; j < segs; j++) {
      const p0 = P[j], p1 = P[(j + 1) % segs], ds = p1[0] - p0[0], dr = p1[1] - p0[1], L = Math.hypot(ds, dr) || 1, ns = dr / L, nr = -ds / L;
      for (let e = 0; e < 2; e++) {
        const [s, r] = e ? p1 : p0;
        for (let k = 0; k <= nT; k++) { const [c, sn] = cs[k], i = vi(j, e, k) * 3; pos[i] = s; pos[i + 1] = r * c; pos[i + 2] = -r * sn; nor[i] = ns; nor[i + 1] = nr * c; nor[i + 2] = -nr * sn; }
      }
    }
    geo.attributes.position.needsUpdate = geo.attributes.normal.needsUpdate = true; geo.computeBoundingSphere(); geo.computeBoundingBox();
  };
  m.setSweep = f => geo.setDrawRange(0, 6 * segs * Math.round(Math.min(Math.max(f, 0), 1) * nT));
  m.setProfile(profile);
  return m;
}
// the flat region itself, as a sheet in the profile's plane (it turns with the sweep)
function blade(parent, profile, { pal = 'red', opacity = 0.55, name = 'Region' } = {}) {
  const geo = new THREE.ShapeGeometry(new THREE.Shape(profile.map(([s, r]) => new THREE.Vector2(s, r))));
  const mat = shadeMat(pal, { opacity }).clone(); mat.side = THREE.DoubleSide;
  const m = tag(new THREE.Mesh(geo, mat), name, 'hi'); m.userData.noEdge = true; parent.add(m);
  return m;
}
// a frame for a solid: origin on the axis, local x along it, local y toward the region, local z toward the viewer
function axisFrame(parent, origin, vertical = false) {
  const g = new THREE.Group(); g.position.copy(origin); if (vertical) g.rotation.z = Math.PI / 2; parent.add(g);
  return g;
}
const sample = (fn, a, b, n, warp = u => u) => Array.from({ length: n + 1 }, (_, i) => { const x = a + (b - a) * warp(i / n); return [x, fn(x)]; });

// a cross-section slab, unit size: thickness 1 along x (centred), base 1 along y (from 0), up along z
function slabGeo(kind) {
  const sh = new THREE.Shape();
  if (kind === 'square') sh.moveTo(0, 0), sh.lineTo(1, 0), sh.lineTo(1, 1), sh.lineTo(0, 1);
  else if (kind === 'tri') sh.moveTo(0, 0), sh.lineTo(1, 0), sh.lineTo(0.5, Math.sqrt(3) / 2);
  else { sh.moveTo(0, 0); sh.lineTo(1, 0); sh.absarc(0.5, 0, 0.5, 0, Math.PI, false); }
  sh.closePath();
  const g = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 32 });
  g.applyMatrix4(new THREE.Matrix4().set(0, 0, 1, -0.5, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1));   // shape x → y, shape y → z, extrude → x
  g.computeVertexNormals();
  return g;
}
// a sheet of graph paper lying on the floor (math y runs away from the viewer; up is out of the paper)
function floorBoard(root, at, opts) {
  const g = new THREE.Group(); g.position.set(...at); g.rotation.x = -Math.PI / 2; root.add(g);
  const B = graphBoard(g, { at: [0, 0, 0], ...opts });
  const W = p => { g.updateMatrixWorld(); return g.localToWorld(p.clone()); };
  return { g, B, W, labels: B.tickLabels().map(L => ({ ...L, at: () => W(L.at()) })) };
}
// a solid of cross sections on the base under y = s(x): n slabs, shown up to x; and a red slice at x
function sectionSolid(F, asmSolid, asmSlice, kind) {
  const geo = slabGeo(kind), { B } = F, dx = (M.CS.b - M.CS.a) / M.CS.n;
  const slabs = Array.from({ length: M.CS.n }, (_, i) => {
    const x = M.CS.a + (i + 0.5) * dx, s = M.CS.s(x);
    const m = part(asmSolid, geo, { pal: 'paper', tone: 'mid', name: 'Slab', pos: B.P(x, 0, 0.005).toArray() });
    m.scale.set(dx * B.unit * 0.94, s * B.unit, s * B.unit); m.userData.x = x;
    return m;
  });
  const holder = new THREE.Group(); holder.position.copy(F.g.position); holder.rotation.copy(F.g.rotation); asmSlice.add(holder);
  const slice = part(holder, geo, { pal: 'red', tone: 'hi', name: 'Slice' }); slice.userData.home = null;
  return x => {
    for (const m of slabs) m.visible = m.userData.x < x;
    const s = M.CS.s(x);
    slice.visible = s > 1e-3; slice.position.copy(B.P(x, 0, 0.006)); slice.scale.set(0.06 * B.unit, s * B.unit * 1.004, s * B.unit * 1.004);
  };
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [], ups = [];
  const mark = (html, at, cls = 'mark') => labels.push({ cls, html, at });

  // ---------- 8.1 average value ----------
  {
    const X = ST.avg, f = M.AV.f;
    const B = graphBoard(root, { at: [X, 0, 0], x: [-0.5, 3.5], y: [-0.5, 6], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...B.tickLabels());
    const g1 = asm('avgCurve', root, { title: 'The function', sub: 'f(x) = x²/2 + 1 on [0, 3]' });
    curve(B, g1, f, -0.4, 3.15);
    region(B, g1, { pal: 'red', opacity: 0.12 }).set(() => 0, f, M.AV.a, M.AV.b);
    const g2 = asm('avgSamples', root, { title: 'Equal samples', sub: 'f at the middle of n equal pieces' });
    const sticks = bars(B, g2, 32, { pal: 'blue', depth: 0.1, opacity: 0.85 });
    const g3 = asm('avgLevel', root, { title: 'The average', sub: 'the mean of the samples, and its limit' });
    const level = rod(g3, { r: 0.035, pal: 'red', name: 'Mean height' });
    const cDot = dot(g3, { pal: 'ink', name: 'x = c' }); putAt(B, cDot, M.AV.c, M.AV.avg, 0.2);
    mark('<i>c</i> = √3', () => B.P(M.AV.c, M.AV.avg).add(V(0.05, 0.42, 0)));
    mark('<i>y</i> = <i>f</i>(<i>x</i>)', () => B.P(3.1, 5.6).add(V(-0.95, 0, 0)), 'board');
    const live = { n: 1, mean: M.sampleMean(1) };
    labels.push({ cls: 'mark', html: '', text: () => `mean ${live.mean.toFixed(3)}`, at: () => B.P(3.05, live.mean).add(V(0.75, 0, 0)) });
    ups.push(c => {
      const n = M.avgN(c), w = (M.AV.b - M.AV.a) / n, mean = M.sampleMean(n);
      live.n = n; live.mean = mean;
      sticks.set(Array.from({ length: n }, (_, i) => { const x = M.AV.a + (i + 0.5) * w; return [x - w * 0.32, x + w * 0.32, f(x)]; }));
      setRod(level, B.P(M.AV.a - 0.05, mean, 0.16), B.P(M.AV.b + 0.05, mean, 0.16));
    });
  }

  // ---------- 8.2 position, velocity: areas under v(t), and the particle on its line ----------
  {
    const X = ST.pva;
    const B = graphBoard(root, { at: [X, 0, 0], x: [-0.3, 4.3], y: [-1.5, 3.5], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...B.tickLabels({ xName: 't', yName: 'v' }));
    const g1 = asm('vGraph', root, { title: 'Velocity', sub: 'v(t) = t² − 4t + 3' });
    curve(B, g1, M.pv, -0.25, 4.25);
    const cur = dot(g1, { pal: 'ink', r: 0.08, name: 'Now' });
    const g2 = asm('vArea', root, { title: 'Area under v', sub: 'above the axis: forward · below: backward' });
    const pos = region(B, g2, { pal: 'red', opacity: 0.35, name: 'Forward' }), neg = region(B, g2, { pal: 'blue', opacity: 0.4, name: 'Backward' });
    tag(pos, 'Forward'); tag(neg, 'Backward');
    // the particle's line, above the graph: position p drawn at t-coordinate NL0 + p·NLS
    const NY = 4.75, NL0 = 0.7, NLS = 1.8, at = p => B.P(NL0 + p * NLS, NY, 0.05);
    const g3 = asm('particle', root, { title: 'The particle', sub: 'moving along a line, x(0) = 0' });
    part(g3, cyl(0.015, 2.6 * NLS, 12).rotateZ(Math.PI / 2), { pal: 'ink', tone: 'hi', name: 'Line', pos: at(0.75).toArray() });
    const tk = []; for (const p of [0, 0.5, 1, 1.5]) tk.push(...at(p).add(V(0, -0.1, 0)).toArray(), ...at(p).add(V(0, 0.1, 0)).toArray());
    lines(g3, tk, '#6e6e74');
    for (const p of [0, 1]) labels.push({ cls: 'tick', html: `${p}`, at: () => at(p).add(V(0.06, -0.3, 0)) });
    labels.push({ cls: 'axis', html: '<i>x</i>', at: () => at(2.05).add(V(0, 0.2, 0)) });
    const pd = dot(g3, { pal: 'red', r: 0.12, name: 'Particle' }), va = arrow(g3, 'blue', { name: 'Velocity' });
    mark('<i>v</i>(<i>t</i>)', () => B.P(4.2, 3.4).add(V(-0.1, 0, 0)), 'board');
    ups.push(c => {
      const t = M.pvTime(c);
      putAt(B, cur, t, M.pv(t), 0.1);
      pos.set(() => 0, x => Math.max(M.pv(x), 0), 0, t); neg.set(x => Math.min(M.pv(x), 0), () => 0, 0, t);
      pd.position.copy(at(M.px(t)).add(V(0, 0, 0.05)));
      setArrow(va, pd.position.clone().add(V(Math.sign(M.pv(t)) * 0.14, 0, 0)), V(M.pv(t) * 0.45, 0, 0));
    });
  }

  // ---------- 8.3 a tank: rate in, rate out, amount ----------
  {
    const X = ST.tank, U = 0.62;
    const B = graphBoard(root, { at: [X, 0, 0], x: [0, 6], y: [0, 9], unit: U, grid: [1, 1], ticks: [1, 2] });
    labels.push(...B.tickLabels({ xName: 't', yName: 'L/min' }));
    const g1 = asm('rates', root, { title: 'The two rates', sub: 'in R(t) = 5 + 3 sin(πt/4) · out D(t) = 1 + t' });
    curve(B, g1, M.tR, 0, 6, { pal: 'blue', name: 'Rate in' }); curve(B, g1, M.tD, 0, 6, { pal: 'red', name: 'Rate out' });
    const now = rod(g1, { r: 0.015, pal: 'ink', name: 'Now' });
    const g2 = asm('net', root, { title: 'Net change', sub: 'the area between R and D' });
    const gain = region(B, g2, { pal: 'blue', opacity: 0.35, name: 'Gain' }), loss = region(B, g2, { pal: 'red', opacity: 0.35, name: 'Loss' });
    tag(gain, 'Gain'); tag(loss, 'Loss');
    mark('<i>R</i>(<i>t</i>)', () => B.P(2, M.tR(2)).add(V(0, 0.32, 0)), 'board');
    mark('<i>D</i>(<i>t</i>)', () => B.P(5.4, M.tD(5.4)).add(V(0.25, -0.3, 0)), 'board');
    // the tank: glass, water, a tap above and a drain at the foot
    const g3 = asm('tank', root, { title: 'The tank', sub: `${M.TK.A0} L at t = 0; holds ${M.TK.cap} L` });
    const TX = X + 6 * U + 1.6, TR = 0.75, TH = 3.6, glassMat = shadeMat('paper', { opacity: 0.3 });
    part(g3, cyl(TR, TH, 48), { mat: glassMat, tone: 'lo', name: 'Glass', pos: [TX, TH / 2, 0] });
    part(g3, cyl(TR + 0.08, 0.08, 48), { pal: 'ink', tone: 'hi', name: 'Base', pos: [TX, 0.04, 0] });
    const water = part(g3, cyl(TR * 0.96, 1, 48), { pal: 'blue', tone: 'mid', name: 'Water' }); water.userData.home = null;
    const tick = []; for (let L = 10; L <= 50; L += 10) tick.push(TX + TR, TH * L / M.TK.cap, 0, TX + TR + 0.14, TH * L / M.TK.cap, 0);
    lines(g3, tick, '#6e6e74');
    labels.push({ cls: 'tick', html: '60 L', at: () => V(TX + TR + 0.75, TH, 0) }, { cls: 'tick', html: '30 L', at: () => V(TX + TR + 0.75, TH / 2, 0) });
    const inA = arrow(g3, 'blue', { name: 'In' }), outA = arrow(g3, 'red', { name: 'Out' });
    ups.push(c => {
      const t = M.tkTime(c), A = M.tA(t);
      setRod(now, B.P(t, 0, 0.04), B.P(t, 9, 0.04));
      gain.set(M.tD, x => Math.max(M.tR(x), M.tD(x)), 0, t); loss.set(M.tR, x => Math.max(M.tR(x), M.tD(x)), 0, t);
      water.scale.y = TH * A / M.TK.cap; water.position.set(TX, TH * A / M.TK.cap / 2 + 0.02, 0);
      setArrow(inA, V(TX, TH + 0.25 + M.tR(t) * 0.12, 0), V(0, -M.tR(t) * 0.12, 0));
      setArrow(outA, V(TX + TR + 0.05, 0.3, 0.2), V(M.tD(t) * 0.12, 0, 0));
    });
  }

  // ---------- 8.4 area between curves, in x ----------
  {
    const X = ST.areax, { f, g } = M.AX;
    const B = graphBoard(root, { at: [X, 0, 0], x: [-0.5, 2.5], y: [-0.5, 4.5], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...B.tickLabels());
    const g1 = asm('axCurves', root, { title: 'The two curves', sub: 'top y = 4x − x² · bottom y = x²' });
    curve(B, g1, f, -0.1, 2.5); curve(B, g1, g, -0.4, 2.1, { pal: 'dark' });
    const g2 = asm('axRegion', root, { title: 'The region', sub: 'between x = 0 and x = 2, where they meet' });
    region(B, g2, { pal: 'red', opacity: 0.1, name: 'Whole' }).set(g, f, 0, 2);
    const fill = region(B, g2, { pal: 'red', opacity: 0.35, name: 'So far' }); tag(fill, 'So far');
    const g3 = asm('axStrip', root, { title: 'One strip', sub: 'height top − bottom, width dx' });
    const st = strip(B, g3);
    mark('<i>y</i> = 4<i>x</i> − <i>x</i>²', () => B.P(1.0, 3.0).add(V(-0.95, 0.35, 0)), 'board');
    mark('<i>y</i> = <i>x</i>²', () => B.P(1.75, 3.06).add(V(0.55, -0.1, 0)), 'board');
    ups.push(c => { const x = M.axX(c); fill.set(g, f, 0, x); st.set(x, g(x), x, f(x), 0.07); });
  }

  // ---------- 8.5 area between curves, in y ----------
  {
    const X = ST.areay, { left, right } = M.AY;
    const B = graphBoard(root, { at: [X, 0, 0], x: [-0.5, 4.5], y: [-1.5, 2.5], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...B.tickLabels());
    const g1 = asm('ayCurves', root, { title: 'The two curves', sub: 'left x = y² · right x = y + 2' });
    path(B, g1, y => [left(y), y], -1.5, Math.sqrt(4.5)); curve(B, g1, x => x - 2, 0.5, 4.5, { pal: 'dark' });
    const g2 = asm('ayRegion', root, { title: 'The region', sub: 'from y = −1 to y = 2' });
    const pair = y => [[left(y), y], [right(y), y]], yu = (a, b) => u => pair(a + (b - a) * u);
    band(B, g2, { opacity: 0.1, name: 'Whole' }).set(yu(-1, 2));
    const fill = band(B, g2, { opacity: 0.35, name: 'So far' });
    const g3 = asm('ayStrip', root, { title: 'One strip', sub: 'length right − left, thickness dy' });
    const st = strip(B, g3);
    mark('<i>x</i> = <i>y</i>²', () => B.P(left(-1.4), -1.4).add(V(0.55, 0.1, 0)), 'board');
    mark('<i>x</i> = <i>y</i> + 2', () => B.P(4.2, 2.2).add(V(-1.6, 0.1, 0)), 'board');
    ups.push(c => { const y = M.ayY(c); fill.set(yu(-1, y)); st.set(left(y), y, right(y), y, 0.07); });
  }

  // ---------- 8.6 three crossings ----------
  {
    const X = ST.multi, { f, g } = M.MX;
    const B = graphBoard(root, { at: [X, 0, 0], x: [-2.5, 2.5], y: [-3, 3], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...B.tickLabels());
    const g1 = asm('mCurves', root, { title: 'The two curves', sub: 'f(x) = x³ − 3x · g(x) = x' });
    curve(B, g1, f, -2.4, 2.4); curve(B, g1, g, -2.5, 2.5, { pal: 'dark' });
    const g2 = asm('mRegions', root, { title: 'Two pieces', sub: 'f on top, then g on top' });
    const top = x => Math.max(f(x), g(x)), bot = x => Math.min(f(x), g(x));
    region(B, g2, { pal: 'red', opacity: 0.1, name: 'f on top' }).set(bot, top, -2, 0); region(B, g2, { pal: 'blue', opacity: 0.12, name: 'g on top' }).set(bot, top, 0, 2);
    const fl = region(B, g2, { pal: 'red', opacity: 0.38, name: 'f on top' }), fr = region(B, g2, { pal: 'blue', opacity: 0.4, name: 'g on top' });
    tag(fl, 'f on top'); tag(fr, 'g on top');
    const g3 = asm('mStrip', root, { title: 'One strip', sub: '|f − g| dx: always the top minus the bottom' });
    const st = strip(B, g3);
    mark('<i>f</i>', () => B.P(-1, 2).add(V(0, 0.32, 0)), 'board'); mark('<i>g</i>', () => B.P(2.4, 2.4).add(V(0.25, -0.1, 0)), 'board');
    ups.push(c => {
      const x = M.mxX(c);
      fl.set(bot, top, -2, Math.min(x, 0)); fr.set(bot, top, 0, Math.max(x, 0));
      st.set(x, bot(x), x, top(x), 0.06);
    });
  }

  // ---------- 8.7 squares on a base ----------
  {
    const F = floorBoard(root, [ST.squares, 0, 0], { x: [-2.5, 2.5], y: [-0.4, 2.6], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...F.labels);
    const gB = asm('sqBase', F.g, { title: 'The base', sub: 'under y = 2 − x²/2, on the floor' });
    curve(F.B, gB, M.CS.s, -2.05, 2.05); region(F.B, gB, { pal: 'red', opacity: 0.25 }).set(() => 0, M.CS.s, -2, 2);
    const set = sectionSolid(F, asm('sqSlabs', F.g, { title: 'Square slabs', sub: 'side s(x), thickness dx' }), asm('sqSlice', root, { title: 'One cross section', sub: 'a square of side s(x)' }), 'square');
    ups.push(c => set(M.csX(c)));
  }

  // ---------- 8.8 triangles and semicircles on the same base ----------
  {
    const parts = [['tri', TRI_OFF - 0.6, 'triSolid', 'Equilateral triangles', 'side s(x): area (√3/4)s²'], ['semi', -TRI_OFF - 0.6, 'semiSolid', 'Semicircles', 'diameter s(x): area (π/8)s²']];
    const slice = asm('triSlice', root, { title: 'Two cross sections', sub: 'the same s(x), two shapes' });
    const sets = parts.map(([kind, dx, key, title, sub]) => {
      const F = floorBoard(root, [ST.tri, 0, dx], { x: [-2.3, 2.3], y: [-0.3, 2.3], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
      labels.push(...F.labels.filter(L => L.cls === 'tick'));
      const g = asm(key, F.g, { title, sub });
      curve(F.B, g, M.CS.s, -2.05, 2.05); region(F.B, g, { pal: 'red', opacity: 0.22 }).set(() => 0, M.CS.s, -2, 2);
      return sectionSolid(F, g, slice, kind);
    });
    ups.push(c => sets.forEach(s => s(M.csX(c))));
  }

  // ---------- 8.9 – 8.12 solids of revolution ----------
  const revScene = ({ X, origin, vertical = false, profile, slab, keys, titles, ax, axisLine, curves = [] }) => {
    const B = plane([X + origin[0], origin[1], 0]);
    labels.push(...axes(root, B, ...ax));
    const O = B.P(...(vertical ? [M.DV.k, 0] : [0, axisLine ?? 0]));
    const [gS, gR, gD] = keys.map((k, i) => asm(k, root, titles[i])), [fS, fR, fD] = [gS, gR, gD].map(g => axisFrame(g, O, vertical));
    const solid = revolve(fS, profile, { pal: 'paper', name: 'Solid' });
    blade(fR, profile, { opacity: 0.22, name: 'Region' }).position.z = 0.002;
    const turning = new THREE.Group(); fR.add(turning); blade(turning, profile, { opacity: 0.6, name: 'Turning region' });
    for (const [fn, a, b] of curves) curve(B, gR, fn, a, b, { r: 0.03 });
    const disc = revolve(fD, slab(0.5), { pal: 'red', name: 'Slab', tone: 'hi', nT: 64 });
    if (axisLine !== undefined || vertical) setRod(rod(gS, { r: 0.018, pal: 'red', name: 'Axis' }), ...(vertical ? [B.P(M.DV.k, -0.6), B.P(M.DV.k, 2.9)] : [B.P(-0.6, axisLine), B.P(4.8, axisLine)]));
    return c => {
      const { sweep, slide } = M.revPhase(c);
      solid.setSweep(sweep); turning.rotation.x = -sweep * TAU; turning.visible = sweep < 1;
      disc.visible = slide >= 0;
      if (slide >= 0) disc.setProfile(slab(slide));
    };
  };
  {
    const T = (x, w = 0.12) => [x - w / 2, x + w / 2];
    // 8.9 disc about the x-axis: y = √x
    ups.push(revScene({
      X: ST.discx, origin: [0, 0],
      profile: [[0, 0], ...sample(M.DX.r, 0, 4, 80, u => u * u).slice(1), [4, 0]],
      slab: u => { const x = 0.06 + u * 3.88, [a, b] = T(x), r = M.DX.r(x) * 1.03; return [[a, 0], [b, 0], [b, r], [a, r]]; },
      keys: ['dxSolid', 'dxRegion', 'dxDisc'],
      titles: [{ title: 'The solid', sub: 'y = √x turned about the x-axis' }, { title: 'The region', sub: 'under y = √x, 0 ≤ x ≤ 4' }, { title: 'One disc', sub: 'radius √x, thickness dx' }],
      ax: [[-0.6, 4.9], [-2.6, 2.6], { xt: [1, 2, 3, 4], yt: [-2, -1, 1, 2] }],
      curves: [[M.DX.r, 0, 4]],
    }));
    // 8.10 disc about x = 4: the same region, slabs horizontal
    ups.push(revScene({
      X: ST.discv, origin: [-4, 0], vertical: true,
      profile: [[0, 4], [0, 0], [2, 0], ...sample(y => 4 - y * y, 2, 0, 80).slice(1, -1)],
      slab: u => { const y = 0.05 + u * 1.9, [a, b] = T(y, 0.1), r = M.DV.r(y) * 1.02; return [[a, 0], [b, 0], [b, r], [a, r]]; },
      keys: ['dvSolid', 'dvRegion', 'dvDisc'],
      titles: [{ title: 'The solid', sub: 'the region turned about x = 4' }, { title: 'The region', sub: 'under y = √x, 0 ≤ x ≤ 4' }, { title: 'One disc', sub: 'radius 4 − y², thickness dy' }],
      ax: [[-0.6, 8.6], [-0.6, 3.0], { xt: [2, 4, 6, 8], yt: [1, 2] }],
      curves: [[M.DX.r, 0, 4]],
    }));
    // 8.11 washer about the x-axis: between y = √x and y = x/2
    const washProfile = k => [...sample(x => M.WX.R(x) - k, 0, 4, 80, u => u * u), ...sample(x => M.WX.r(x) - k, 4, 0, 8).slice(1, -1)];
    const washSlab = k => u => { const x = 0.15 + u * 3.7, [a, b] = T(x), R = (M.WX.R(x) - k) * 1.03 + 0.01, r = (M.WX.r(x) - k) * 0.97; return [[a, r], [b, r], [b, R], [a, R]]; };
    ups.push(revScene({
      X: ST.washx, origin: [0, 0],
      profile: washProfile(0), slab: washSlab(0),
      keys: ['wxSolid', 'wxRegion', 'wxWasher'],
      titles: [{ title: 'The solid', sub: 'a bowl with a cone cut out of it' }, { title: 'The region', sub: 'between y = √x and y = x/2' }, { title: 'One washer', sub: 'outer radius √x, inner x/2' }],
      ax: [[-0.6, 4.9], [-2.6, 2.6], { xt: [1, 2, 3, 4], yt: [-2, -1, 1, 2] }],
      curves: [[M.WX.R, 0, 4], [M.WX.r, 0, 4]],
    }));
    // 8.12 the same region about y = −1
    ups.push(revScene({
      X: ST.washo, origin: [0, 0], axisLine: M.WO.k,
      profile: washProfile(M.WO.k), slab: washSlab(M.WO.k),
      keys: ['woSolid', 'woRegion', 'woWasher'],
      titles: [{ title: 'The solid', sub: 'the region turned about y = −1' }, { title: 'The region', sub: 'between y = √x and y = x/2' }, { title: 'One washer', sub: 'outer radius √x + 1, inner x/2 + 1' }],
      ax: [[-0.6, 4.9], [-4.2, 2.6], { xt: [1, 2, 3, 4], yt: [-4, -3, -2, -1, 1, 2] }],
      curves: [[M.WX.R, 0, 4], [M.WX.r, 0, 4]],
    }));
  }

  // ---------- 8.13 arc length ----------
  {
    const X = ST.arc, { f } = M.AL;
    const B = graphBoard(root, { at: [X, 0, 0], x: [-0.5, 3.5], y: [-0.5, 4], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    labels.push(...B.tickLabels());
    const g1 = asm('arcCurve', root, { title: 'The curve', sub: 'y = (2/3)x^(3/2), 0 ≤ x ≤ 3' });
    curve(B, g1, f, 0, 3.3, { r: 0.03, pal: 'dark' });
    const g2 = asm('arcChords', root, { title: 'Chords', sub: 'n straight pieces, each √(Δx² + Δy²)' });
    const chords = Array.from({ length: 16 }, () => rod(g2, { r: 0.03, pal: 'red', name: 'Chord' }));
    const nodes = Array.from({ length: 17 }, () => dot(g2, { r: 0.06, pal: 'red', name: 'Node' }));
    const g3 = asm('arcParticle', root, { title: 'A particle on the curve', sub: 'x = t, y = (2/3)t^(3/2): speed √(1 + t)' });
    const pd = dot(g3, { r: 0.11, pal: 'blue', name: 'Particle' });
    mark('<i>y</i> = ⅔<i>x</i><sup>3/2</sup>', () => B.P(2.2, f(2.2)).add(V(-1.0, 0.35, 0)), 'board');
    ups.push(c => {
      const n = M.alN(c);
      chords.forEach((m, i) => { m.visible = i < n; if (i < n) setRod(m, B.P(3 * i / n, f(3 * i / n), 0.08), B.P(3 * (i + 1) / n, f(3 * (i + 1) / n), 0.08)); });
      nodes.forEach((m, i) => { m.visible = i <= n; if (i <= n) putAt(B, m, 3 * i / n, f(3 * i / n), 0.08); });
      const t = M.alT(c); putAt(B, pd, t, f(t), 0.14);
    });
  }

  return { labels, update(s) { for (const u of ups) u(s.c); } };
}
