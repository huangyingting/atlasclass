// The figures: one scene per idea, spread out along +x, the camera flying between them page by page.
// Graph paper (the kit) for the functions; paper solids for the contexts (a cup, a balloon, a tank, a ladder,
// a cone, a lamp post), so a rate is always seen beside the thing that is changing.
import * as THREE from 'three';
import { part, box, cyl, lines, arrow, setArrow, shadeMat, liveTube } from '../engine/parts.js';
import { graphBoard, curve, liveCurve, dot, putAt, rod, setRod, setLineThrough, region, V } from '../kit.js';
import * as M from './model.js';

// where each scene stands (world x of its centre)
export const ST = { coffee: 0, part: 30, balloon: 62, table: 90, pond: 120, ladder: 150, cone: 180, shadow: 208, lin: 240, over: 272, lh: 304, inf: 334 };

const fm = (v, n = 2) => (v < -1e-9 ? '−' : '') + Math.abs(v).toFixed(n);
const nf = v => (v < 0 ? '−' : '') + +Math.abs(v).toFixed(2);
const dyn = (parent, n, color) => { const l = lines(parent, new Array(n * 6).fill(0), color); l.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage); l.frustumCulled = false; return l; };
const setLines = (l, pts) => { const a = l.geometry.attributes.position; pts.forEach((p, i) => a.setXYZ(i, p.x, p.y, p.z)); for (let i = pts.length; i < a.count; i++) a.setXYZ(i, 0, -50, 0); a.needsUpdate = true; l.geometry.computeBoundingSphere(); };
const floor = (parent, x0, x1, z0, z1) => { const g = []; for (let x = Math.ceil(x0); x <= x1; x++) g.push(x, 0.001, z0, x, 0.001, z1); for (let z = Math.ceil(z0); z <= z1; z++) g.push(x0, 0.001, z, x1, 0.001, z); lines(parent, g, '#e6e6e2'); };

// tick labels in real units for a board drawn in display units (X(v), Y(v) map a real value to the board)
function ticks(B, { xs = [], ys = [], X = v => v, Y = v => v, xName, yName, xf = nf, yf = nf }) {
  const yAt = B.y0 <= 0 && B.y1 >= 0 ? 0 : B.y0, xAt = B.x0 <= 0 && B.x1 >= 0 ? 0 : B.x0;
  return [
    ...xs.map(v => ({ cls: 'tick', html: xf(v), at: () => B.P(X(v), yAt).add(V(0.12, -0.2, 0)) })),
    ...ys.map(v => ({ cls: 'tick', html: yf(v), at: () => B.P(xAt, Y(v)).add(V(-0.08, 0, 0)) })),
    ...(xName ? [{ cls: 'axis', html: xName, at: () => B.P(B.x1, yAt).add(V(0.35, 0.24, 0)) }] : []),
    ...(yName ? [{ cls: 'board', html: yName, at: () => B.P(xAt, B.y1).add(V(0.12, 0.2, 0)) }] : []),
  ];
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [], ups = [];
  const label = (cls, html, at, text) => labels.push({ cls, html, at, text });

  // ======================= 4.1 coffee cooling =======================
  {
    const X0 = ST.coffee, BY = 0.8;
    const B = graphBoard(root, { at: [X0 - 1.5, BY, 0], x: [0, 6.2], y: [0, 5], unit: 1, grid: [1, 0.5] });
    const tx = t => t / 5, ty = T => T / 20;
    const g = asm('tempGraph', root, { title: 'Temperature against time', sub: 'T(t) = 20 + 70e^(−0.08t), in °C' });
    curve(B, g, x => ty(M.temp(5 * x)), 0, 6);
    const room = rod(g, { r: 0.012, pal: 'dark', tone: 'lo', name: 'Room temperature' });
    setRod(room, B.P(0, ty(M.COFFEE.room), 0.02), B.P(6.2, ty(M.COFFEE.room), 0.02));
    const tg = asm('tangent', root, { title: 'The tangent line', sub: 'its slope is T′(t), in °C per minute' });
    const tan = rod(tg, { r: 0.03, name: 'Tangent' }), pt = dot(tg, { pal: 'red', name: 'The moment t' });
    labels.push(...ticks(B, { xs: [10, 20, 30], ys: [20, 40, 60, 80, 100], X: tx, Y: ty, xName: '<i>t</i> (min)', yName: 'temperature <i>T</i> (°C)' }));
    label('mark', 'room, 20 °C', () => B.P(5.2, ty(M.COFFEE.room) + 0.25, 0));
    // the cup, with a thermometer drawn to the same height scale as the graph
    const cup = asm('cup', root, { title: 'The coffee', sub: 'poured at 90 °C into a 20 °C room' });
    const CX = X0 - 3.6, CZ = 0.9;
    part(cup, cyl(0.62, 1.0, 48, 0.7), { tone: 'hi', pos: [CX, 0.5, CZ], name: 'Cup' });
    part(cup, cyl(0.6, 0.02, 48), { tone: 'mid', pal: 'ink', pos: [CX, 0.92, CZ], name: 'Coffee' });
    part(cup, new THREE.TorusGeometry(0.26, 0.06, 12, 32, Math.PI), { tone: 'hi', pos: [CX - 0.62, 0.5, CZ], rot: [0, 0, Math.PI / 2], name: 'Cup' });
    const TX = CX + 0.25, tyW = T => BY + ty(T);
    part(cup, cyl(0.07, tyW(104) - 0.75, 20), { tone: 'mid', pos: [TX, (tyW(104) + 0.75) / 2, CZ], name: 'Thermometer', mat: shadeMat('paper', { opacity: 0.55 }) });
    const col = part(cup, cyl(0.04, 1, 16), { tone: 'hi', pal: 'red', name: 'Mercury' }); col.userData.home = null;
    const tk = []; for (let T = 0; T <= 100; T += 10) tk.push(TX + 0.07, tyW(T), CZ, TX + (T % 50 ? 0.15 : 0.22), tyW(T), CZ);
    lines(cup, tk, '#6e6e74');
    const level = dyn(root, 1, '#b4b4b8');
    floor(root, X0 - 5.5, X0 + 5.5, -1, 2.5);
    label('board', 'the cup', () => V(CX - 1.5, 0.3, CZ + 0.95));
    label('mark', '', () => tan.visible ? tan.position.clone().add(V(0.25, 0.75, 0)) : null, () => `slope ${fm(M.dtemp(sc.coffee.t))} °C/min`);
    const sc = { coffee: { t: 0 } };
    ups.push(s => {
      const t = s.coffee.t; sc.coffee = s.coffee;
      const X = tx(t), Y = ty(M.temp(t)), m = M.dtemp(t) / 4;   // board slope: (°C/20)/(min/5)
      putAt(B, pt, X, Y);
      setLineThrough(B, tan, X, Y, m, Math.max(0, X - 1.3), Math.min(6.2, X + 1.3));
      col.position.set(TX, (0.75 + tyW(M.temp(t))) / 2, CZ); col.scale.y = tyW(M.temp(t)) - 0.75;
      setLines(level, [V(TX + 0.08, tyW(M.temp(t)), CZ), B.P(X, Y, 0.04)]);
    });
  }

  // ======================= 4.2 a particle on a line =======================
  const PZ = 1.6;
  const part2 = {};
  {
    const X0 = ST.part;
    const mk = (key, x0, yr, Yf, title, sub, yName) => {
      const B = graphBoard(root, { at: [x0, 1.4 - yr[0], 0], x: [0, 4], y: yr, unit: 1, grid: [0.5, 0.5] });
      const g = asm(key, root, { title, sub });
      curve(B, g, t => Yf(t), 0, 4);
      return { B, g, cur: dot(g, { name: 'Now' }), tan: rod(g, { r: 0.026, name: 'Tangent' }), yName };
    };
    const bx = mk('xGraph', X0 - 6.6, [-0.5, 5], M.px, 'Position x(t)', 'x(t) = t³ − 6t² + 9t, metres', 'position <i>x</i> (m)');
    const bv = mk('vGraph', X0 - 1, [-1.5, 4], t => M.pv(t) / 3, 'Velocity v(t) = x′(t)', 'v(t) = 3t² − 12t + 9 = 3(t − 1)(t − 3), m/s', 'velocity <i>v</i> (m/s)');
    const ba = mk('aGraph', X0 + 5, [-2.75, 2.75], t => M.pa(t) / 5, 'Acceleration a(t) = v′(t)', 'a(t) = 6t − 12, m/s²', 'acceleration <i>a</i> (m/s²)');
    ba.tan.visible = false;
    labels.push(...ticks(bx.B, { xs: [1, 2, 3, 4], ys: [1, 2, 3, 4], xName: '<i>t</i>', yName: bx.yName }));
    labels.push(...ticks(bv.B, { xs: [1, 2, 3, 4], ys: [-3, 3, 6, 9], Y: v => v / 3, xName: '<i>t</i>', yName: bv.yName }));
    labels.push(...ticks(ba.B, { xs: [1, 2, 3, 4], ys: [-10, -5, 5, 10], Y: a => a / 5, xName: '<i>t</i>', yName: ba.yName }));
    // speeding-up bands (v and a the same sign) on the velocity and acceleration graphs
    const bands = [bv, ba].flatMap(b => [[1, 2], [3, 4]].map(([lo, hi]) => { const r = region(b.B, b.g, { pal: 'red', opacity: 0.16, name: 'Speeding up' }); r.set(() => b.B.y0, () => b.B.y1, lo, hi); return r; }));
    const restMarks = M.REST.map(t => { const d = dot(bx.g, { r: 0.07, pal: 'red', name: 'At rest' }); putAt(bx.B, d, t, M.px(t)); return d; });
    const vZero = M.REST.map(t => { const d = dot(bv.g, { r: 0.07, pal: 'red', name: 'v = 0' }); putAt(bv.B, d, t, 0); return d; });
    M.REST.forEach(t => label('mark', `at rest, <i>t</i> = ${t}`, () => restMarks[0].visible ? bx.B.P(t, M.px(t)).add(V(t === 1 ? 0 : 0.2, 0.38, 0)) : null));
    // the number line, in front, under the velocity graph
    const NX = X0 - 1, NY = 0.25;
    const nl = asm('line', root, { title: 'The number line', sub: 'where the particle is: x in metres' });
    part(nl, cyl(0.014, 5.6, 12).rotateZ(-Math.PI / 2), { tone: 'hi', pal: 'ink', pos: [NX + 2, NY, PZ], name: 'Axis' });
    part(nl, new THREE.ConeGeometry(0.05, 0.16, 20).rotateZ(-Math.PI / 2), { tone: 'hi', pal: 'ink', pos: [NX + 4.86, NY, PZ], name: 'Axis' });
    const lt = []; for (let q = -1; q <= 9; q++) lt.push(NX + q * 0.5, NY, PZ, NX + q * 0.5, NY - (q % 2 ? 0.07 : 0.14), PZ);
    lines(nl, lt, '#6e6e74');
    for (let q = 0; q <= 4; q++) label('tick', `${q}`, () => V(NX + q + 0.05, NY - 0.3, PZ));
    label('axis', '<i>x</i>', () => V(NX + 5.15, NY + 0.1, PZ));
    const pg = asm('particle', root, { title: 'The particle', sub: 'its velocity (black) and acceleration (red)' });
    const ball = part(pg, new THREE.SphereGeometry(0.15, 40, 28), { tone: 'hi', name: 'Particle' });
    const va = arrow(pg, 'ink', { r: 0.024, head: 0.12, headR: 0.06, name: 'Velocity' });
    const aa = arrow(pg, 'red', { r: 0.024, head: 0.12, headR: 0.06, name: 'Acceleration' });
    const ghostMat = shadeMat('paper', { opacity: 0.55 });
    const ghosts = Array.from({ length: 41 }, (_, k) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 12), ghostMat); m.userData = { tone: 0.2, ghost: true, t: k * 0.1 }; root.add(m); return m; });
    const tipOf = (a, d) => a.visible ? a.localToWorld(V(0, a.userData.arrow.shaft.scale.y + d, 0)) : null;
    label('vec', 'v', () => tipOf(va, 0.16)); label('vec red', 'a', () => tipOf(aa, 0.16));
    label('mark', '', () => V(NX + 2, NY + 1.25, PZ), () => part2.word || '');
    floor(root, X0 - 7, X0 + 9, -1, 3);
    Object.assign(part2, { bx, bv, ba, bands, restMarks, vZero });
    ups.push((s, look) => {
      const t = s.part.t, x = M.px(t), v = M.pv(t), a = M.pa(t);
      ball.position.set(NX + x, NY + 0.17, PZ);
      setArrow(va, V(NX + x + Math.sign(v) * 0.15, NY + 0.17, PZ), V(v * 0.14, 0, 0));
      setArrow(aa, V(NX + x, NY + 0.62, PZ), V(a * 0.07, 0, 0));
      // the trail: one lane per leg, so each turn-round shows
      ghosts.forEach(m => { const tk = m.userData.t; m.visible = tk <= t + 1e-6; m.position.set(NX + M.px(tk), NY + 0.07, PZ + (tk < 1 - 1e-9 ? -0.5 : tk > 3 + 1e-9 ? 0.5 : 0)); });
      for (const [b, Y, s1] of [[bx, M.px(t), v], [bv, v / 3, a / 3], [ba, a / 5, 0]]) {
        putAt(b.B, b.cur, t, Y);
        if (b !== ba) setLineThrough(b.B, b.tan, t, Y, s1, Math.max(0, t - 0.6), Math.min(4, t + 0.6));
      }
      bands.forEach(r => { r.visible = look.speed > 0.02; r.material.uniforms.uOpacity.value = 0.18 * look.speed; });
      [...restMarks, ...vZero].forEach(d => d.visible = look.rest > 0.02);
      part2.word = Math.abs(v) < 0.08 ? 'at rest: turning round' : (v > 0 ? 'moving right' : 'moving left') + (look.speed > 0.5 ? (v * a > 0 ? ' · speeding up' : ' · slowing down') : '');
    });
  }

  // ======================= 4.3 a balloon: dV/dr =======================
  {
    const X0 = ST.balloon, S = 0.45;
    const B = graphBoard(root, { at: [X0 - 0.4, 0.6, 0], x: [0, 4.5], y: [0, 5], unit: 1, grid: [0.5, 0.5] });
    const vy = Vv => Vv / 60;
    const g = asm('volGraph', root, { title: 'Volume against radius', sub: 'V = (4/3)πr³: cm³ against cm' });
    curve(B, g, r => vy(M.bvol(r)), 0, 4.5);
    labels.push(...ticks(B, { xs: [1, 2, 3, 4], ys: [60, 120, 180, 240], Y: vy, xName: '<i>r</i> (cm)', yName: 'volume <i>V</i> (cm³)' }));
    const tg = asm('volTangent', root, { title: 'Slope of V against r', sub: 'dV/dr = 4πr², cm³ per cm' });
    const tan = rod(tg, { r: 0.03, name: 'Tangent' }), pt = dot(tg, { pal: 'red', name: 'Now' });
    const CXb = X0 - 3.2, CY = 2.6, CZ = 0.6;
    const bal = asm('balloon', root, { title: 'The balloon', sub: 'a sphere of radius r' });
    const sph = part(bal, new THREE.SphereGeometry(1, 64, 40), { tone: 'hi', pal: 'blue', name: 'Balloon', mat: shadeMat('blue', { opacity: 0.5 }) });
    const knot = part(bal, new THREE.ConeGeometry(0.08, 0.16, 16), { tone: 'mid', pal: 'blue', name: 'Knot' });
    const str = dyn(root, 1, '#8a8a8f');
    const sh = asm('shell', root, { title: 'A thin shell', sub: `the next ${M.BAL.dr} cm of radius` });
    const shell = part(sh, new THREE.SphereGeometry(1, 64, 40), { tone: 'lo', pal: 'red', name: 'Shell', mat: shadeMat('red', { opacity: 0.22 }) });
    const rr = rod(bal, { r: 0.015, pal: 'ink', name: 'Radius' });
    label('vec', '<i>r</i>', () => rr.visible ? rr.position.clone().add(V(0, 0.25, 0)) : null);
    label('mark', '', () => B.P(0.25, 4.6).add(V(1.3, 0, 0)), () => `dV/dr = 4π<i>r</i>² = ${fm(M.bdvol(sc.r), 1)} cm³/cm`);
    floor(root, X0 - 6, X0 + 5.5, -1, 2.5);
    const sc = { r: 1 };
    ups.push(s => {
      const r = M.balR(s.balloon.t); sc.r = r;
      sph.scale.setScalar(r * S); sph.position.set(CXb, CY, CZ);
      shell.scale.setScalar((r + M.BAL.dr) * S); shell.position.set(CXb, CY, CZ);
      knot.position.set(CXb, CY - r * S - 0.06, CZ); knot.rotation.x = Math.PI;
      setLines(str, [V(CXb, CY - r * S - 0.12, CZ), V(CXb + 0.15, 0.02, CZ)]);
      setRod(rr, V(CXb, CY, CZ), V(CXb + r * S * 0.71, CY, CZ + r * S * 0.71));
      putAt(B, pt, r, vy(M.bvol(r)));
      setLineThrough(B, tan, r, vy(M.bvol(r)), vy(M.bdvol(r)), Math.max(0, r - 0.9), Math.min(4.5, r + 0.9));
    });
  }

  // ======================= 4.3 rates from a table =======================
  {
    const X0 = ST.table;
    const tx = t => t / 2, wy = W => W / 50;
    const B = graphBoard(root, { at: [X0 - 1.2, 0.6, 0], x: [0, 6.5], y: [0, 5.5], unit: 1, grid: [0.5, 0.5] });
    labels.push(...ticks(B, { xs: [2, 5, 9, 12], ys: [50, 100, 150, 200, 250], X: tx, Y: wy, xName: '<i>t</i> (h)', yName: 'water <i>W</i> (gal)' }));
    const dg = asm('data', root, { title: 'The measurements', sub: 'five readings of W(t), the water in the tank' });
    M.TAB.t.forEach((t, i) => { const d = dot(dg, { r: 0.1, name: 'A reading' }); putAt(B, d, tx(t), wy(M.TAB.W[i])); });
    const faint = rod(dg, { r: 0.012, pal: 'dark', tone: 'lo', name: 'Joined up' });
    faint.visible = false;
    const pl = []; M.TAB.t.forEach((t, i) => { if (i) { const a = B.P(tx(M.TAB.t[i - 1]), wy(M.TAB.W[i - 1]), 0.02), b = B.P(tx(t), wy(M.TAB.W[i]), 0.02); pl.push(a.x, a.y, a.z, b.x, b.y, b.z); } });
    lines(dg, pl, '#b4b4b8');
    const sg = asm('secant', root, { title: 'The secant', sub: 'its slope is the average rate over the interval' });
    const sec = rod(sg, { r: 0.03, name: 'Secant' });
    { const a = B.P(tx(M.TAB.at), 0, 0.02), b = B.P(tx(M.TAB.at), 5.3, 0.02); lines(sg, [a.x, a.y, a.z, b.x, b.y, b.z], '#e5484d'); }
    label('mark', '<i>t</i> = 7', () => B.P(tx(M.TAB.at), 5.3).add(V(0.35, 0.05, 0)));
    label('mark', '', () => sec.visible ? sec.position.clone().add(V(-0.2, 0.55, 0)) : null, () => `${fm(sc.m)} gal/h`);
    // the tank, filling
    const tk = asm('waterTank', root, { title: 'The tank', sub: 'it holds 250 gallons when full' });
    const TXc = X0 - 3.6, TZ = 0.9, TH = 3.2, TR = 0.8;
    part(tk, cyl(TR, TH, 48), { tone: 'mid', pos: [TXc, TH / 2, TZ], name: 'Tank', mat: shadeMat('paper', { opacity: 0.35 }) });
    part(tk, new THREE.TorusGeometry(TR, 0.03, 8, 48).rotateX(Math.PI / 2), { tone: 'hi', pal: 'ink', pos: [TXc, TH, TZ], name: 'Rim' });
    const water = part(tk, cyl(TR - 0.02, 1, 48), { tone: 'mid', pal: 'blue', name: 'Water', mat: shadeMat('blue', { opacity: 0.6 }) }); water.userData.home = null;
    floor(root, X0 - 5.5, X0 + 6, -1, 2.5);
    const sc = { m: 0 };
    ups.push(s => {
      const t = s.table.t;
      let i = 0; while (i < 3 && t > M.TAB.t[i + 1]) i++;
      sc.m = M.tabSlope(i);
      setRod(sec, B.P(tx(M.TAB.t[i]) - 0.5, wy(M.TAB.W[i] - sc.m * 1), 0.05), B.P(tx(M.TAB.t[i + 1]) + 0.5, wy(M.TAB.W[i + 1] + sc.m * 1), 0.05));
      const h = M.tabW(t) / 250 * TH;
      water.scale.y = h; water.position.set(TXc, h / 2 + 0.01, TZ);
    });
  }

  // ======================= 4.4 a ripple on a pond =======================
  {
    const X0 = ST.pond;
    const pd = asm('pond', root, { title: 'The pond', sub: 'still water; a stone has just dropped in' });
    part(pd, cyl(M.POND.R + 0.4, 0.04, 96), { tone: 'lo', pal: 'blue', pos: [X0, 0.02, 0], name: 'Water', mat: shadeMat('blue', { opacity: 0.16 }) });
    const rg = asm('ripple', root, { title: 'The ripple', sub: `its radius grows at ${M.POND.drdt} m/s` });
    const N = 128, ringGeo = liveTube(N, 0.05, 8);
    part(rg, ringGeo, { tone: 'hi', pal: 'ink', name: 'Ripple' });
    const disc = part(rg, new THREE.CircleGeometry(1, 96).rotateX(-Math.PI / 2), { tone: 'lo', pal: 'red', name: 'Area inside', mat: shadeMat('red', { opacity: 0.25 }) });
    disc.userData.home = null;
    const strip = new THREE.Mesh(new THREE.RingGeometry(1, 1.1, 96), shadeMat('red', { opacity: 0.7 })); strip.rotation.x = -Math.PI / 2; strip.userData = { noEdge: true }; rg.add(strip);
    const ra = asm('radius', root, { title: 'The radius and its rate', sub: 'dr/dt = 0.5 m/s, the same at every instant' });
    const rr = rod(ra, { r: 0.025, pal: 'ink', name: 'Radius r' });
    const dra = arrow(ra, 'blue', { r: 0.03, head: 0.16, headR: 0.08, name: 'dr/dt' });
    part(pd, new THREE.SphereGeometry(0.09, 16, 12), { tone: 'hi', pal: 'ink', pos: [X0, 0.06, 0], name: 'Centre' });
    const pts = Array.from({ length: N + 1 }, () => V());
    const dirR = V(Math.cos(0.5), 0, Math.sin(0.5));
    label('vec', '<i>r</i>', () => rr.visible ? rr.position.clone().add(V(-0.1, 0.35, -0.3)) : null);
    label('vec blue', 'd<i>r</i>/d<i>t</i>', () => dra.visible ? dra.localToWorld(V(0, dra.userData.arrow.shaft.scale.y + 0.4, 0)) : null);
    label('mark', '', () => V(X0 - 2.6, 0.06, 5.0), () => `<i>A</i> = π<i>r</i>² = ${fm(M.pondA(sc.r), 1)} m²`);
    const sc = { r: 0 };
    ups.push(s => {
      const r = Math.max(M.pondR(s.pond.t), 0.02); sc.r = r;
      for (let i = 0; i <= N; i++) { const a = i / N * Math.PI * 2; pts[i].set(X0 + r * Math.cos(a), 0.07, r * Math.sin(a)); }
      ringGeo.update(pts);
      disc.scale.set(r, 1, r); disc.position.set(X0, 0.05, 0);
      // the strip the area gains in the next 0.25 s: width (dr/dt)(0.25 s), length ≈ 2πr
      const w = M.POND.drdt * 0.25;
      strip.geometry.dispose(); strip.geometry = new THREE.RingGeometry(r, r + w, 96); strip.position.set(X0, 0.055, 0);
      setRod(rr, V(X0, 0.08, 0), V(X0, 0.08, 0).addScaledVector(dirR, r));
      setArrow(dra, V(X0, 0.12, 0).addScaledVector(dirR, r + 0.08), dirR.clone().multiplyScalar(M.POND.drdt * 2.4));
    });
  }

  // ======================= 4.5 the sliding ladder =======================
  {
    const X0 = ST.ladder - 2.5;   // the wall's face
    floor(root, X0 - 1, X0 + 7, -2, 2.5);
    const wall = asm('wall', root, { title: 'Wall and floor', sub: 'at right angles: x² + y² = 5²' });
    part(wall, box(0.3, 5.6, 3.2, 0.02), { tone: 'mid', pal: 'base', pos: [X0 - 0.15, 2.8, 0], name: 'Wall' });
    part(wall, box(7.5, 0.06, 3.2, 0.01), { tone: 'lo', pal: 'board', pos: [X0 + 3.6, -0.03, 0], name: 'Floor' });
    const ld = asm('ladder', root, { title: 'The ladder', sub: `${M.LAD.L} m long; its foot is pulled out at ${M.LAD.dxdt} m/s` });
    const lg = new THREE.Group(); ld.add(lg);
    for (const z of [-0.28, 0.28]) part(lg, box(0.09, M.LAD.L, 0.07, 0.02), { tone: 'hi', pos: [0, M.LAD.L / 2, z], name: 'Rail' });
    for (let k = 1; k < 11; k++) part(lg, cyl(0.025, 0.56, 12).rotateX(Math.PI / 2), { tone: 'mid', pos: [0, k * M.LAD.L / 11, 0], name: 'Rung' });
    const fr = asm('footRate', root, { title: 'The foot', sub: 'dx/dt = +0.4 m/s: steady' });
    const fa = arrow(fr, 'blue', { r: 0.03, head: 0.16, headR: 0.08, name: 'dx/dt' });
    const tr = asm('topRate', root, { title: 'The top', sub: 'dy/dt = −(x/y)·dx/dt: not steady' });
    const ta = arrow(tr, 'red', { r: 0.03, head: 0.16, headR: 0.08, name: 'dy/dt' });
    const dims = dyn(root, 6, '#6e6e74');
    const ZD = 1.25;
    label('vec', '<i>x</i>', () => V(X0 + sc.x / 2, 0.05, ZD + 0.35));
    label('vec', '<i>y</i>', () => V(X0 + 0.05, sc.y / 2, ZD + 0.35));
    label('mark', `${M.LAD.L} m`, () => V(X0 + sc.x / 2 + 0.45, sc.y / 2 + 0.25, -0.6));
    label('vec blue', 'd<i>x</i>/d<i>t</i>', () => fa.visible ? fa.localToWorld(V(0, fa.userData.arrow.shaft.scale.y + 0.45, 0)) : null);
    label('vec red', '', () => V(X0 - 1.25, sc.y + M.ladDY(sc.x) * 1.1, -0.75), () => `d<i>y</i>/d<i>t</i> = ${fm(M.ladDY(sc.x))}`);
    const sc = { x: 1, y: 1 };
    ups.push(s => {
      const x = M.ladX(s.ladder.t), y = M.ladY(x); sc.x = x; sc.y = y;
      lg.position.set(X0 + x, 0, 0); lg.rotation.set(0, 0, Math.atan2(x, y));
      setArrow(fa, V(X0 + x + 0.12, 0.12, 0), V(M.LAD.dxdt * 2.2, 0, 0));
      setArrow(ta, V(X0 + 0.1, y, -0.75), V(0, M.ladDY(x) * 2.2, 0));
      setLines(dims, [V(X0, 0.02, ZD), V(X0 + x, 0.02, ZD), V(X0 + x, 0.02, ZD - 0.12), V(X0 + x, 0.02, ZD + 0.12),
        V(X0 + 0.02, 0, ZD), V(X0 + 0.02, y, ZD), V(X0 + 0.02, y, ZD), V(X0 + 0.02, y, 0)]);
    });
  }

  // ======================= 4.5 the cone filling =======================
  {
    const X0 = ST.cone, AY = 0.9, { R, H } = M.CONE;
    floor(root, X0 - 4, X0 + 4, -3, 3);
    const tank = asm('tank', root, { title: 'The tank', sub: `an inverted cone: radius ${R} m, depth ${H} m` });
    const shellMat = shadeMat('paper', { opacity: 0.28 }).clone(); shellMat.side = THREE.DoubleSide;
    part(tank, new THREE.CylinderGeometry(R, 0.001, H, 72, 1, true), { tone: 'lo', pos: [X0, AY + H / 2, 0], name: 'Tank', mat: shellMat });
    part(tank, new THREE.TorusGeometry(R, 0.035, 10, 72).rotateX(Math.PI / 2), { tone: 'hi', pal: 'ink', pos: [X0, AY + H, 0], name: 'Rim' });
    for (let k = 0; k < 3; k++) {
      const a = k / 3 * Math.PI * 2 - Math.PI / 2, top = V(X0 + R * Math.cos(a), AY + H, R * Math.sin(a)), foot = V(X0 + R * Math.cos(a), 0, R * Math.sin(a));
      const leg = rod(tank, { r: 0.04, pal: 'dark', tone: 'mid', name: 'Stand' }); setRod(leg, foot, top);
    }
    const wg = asm('water', root, { title: 'The water', sub: 'a smaller cone: r = h/2 at every depth' });
    const wGeo = new THREE.CylinderGeometry(R / H, 0.001, 1, 72, 1, false); wGeo.translate(0, 0.5, 0);
    const water = part(wg, wGeo, { tone: 'mid', pal: 'blue', name: 'Water', mat: shadeMat('blue', { opacity: 0.6 }) }); water.userData.home = null;
    const stream = part(wg, cyl(0.05, 1, 12), { tone: 'mid', pal: 'blue', name: 'Inflow: 1.5 m³/min' }); stream.userData.home = null;
    part(wg, cyl(0.09, 0.5, 16).rotateZ(Math.PI / 2), { tone: 'hi', pal: 'dark', pos: [X0 - 0.2, AY + H + 1.6, 0], name: 'Pipe' });
    const rise = asm('rise', root, { title: 'The level', sub: 'dh/dt: rising ever more slowly' });
    const ra = arrow(rise, 'red', { r: 0.03, head: 0.16, headR: 0.08, name: 'dh/dt' });
    const dims = dyn(root, 4, '#4a4a50');
    lines(tank, [X0 + R + 0.4, AY, 0, X0 + R + 0.4, AY + H, 0, X0 + R + 0.3, AY, 0, X0 + R + 0.5, AY, 0, X0 + R + 0.3, AY + H, 0, X0 + R + 0.5, AY + H, 0], '#8a8a8f');
    label('vec', '<i>h</i>', () => V(X0 - R - 0.75, AY + sc.h / 2, 0));
    label('vec', '<i>r</i>', () => V(X0 + sc.h * R / H / 2, AY + sc.h + 0.25, 0.25));
    label('mark', `${R} m`, () => V(X0 - R / 2, AY + H + 0.3, 0));
    label('mark', `${H} m`, () => V(X0 + R + 0.95, AY + H / 2, 0));
    label('vec red', '', () => ra.visible ? V(X0 + R + 1.3, AY + sc.h + 0.55, 0) : null, () => `d<i>h</i>/d<i>t</i> = ${fm(M.coneDH(sc.h), 3)}`);
    const sc = { h: 0.1 };
    ups.push(s => {
      const h = M.coneHt(s.cone.t); sc.h = h;
      water.scale.setScalar(h); water.position.set(X0, AY, 0);
      stream.position.set(X0, (AY + h + AY + H + 1.6) / 2, 0); stream.scale.y = AY + H + 1.6 - (AY + h);
      setArrow(ra, V(X0 + 0.35, AY + h + 0.02, 0.3), V(0, Math.min(M.coneDH(h), 3) * 4, 0));
      const r = h * R / H;
      setLines(dims, [V(X0 - R - 0.4, AY, 0), V(X0 - R - 0.4, AY + h, 0), V(X0, AY + h + 0.01, 0.02), V(X0 + r, AY + h + 0.01, 0.02),
        V(X0, AY, 0), V(X0 - R - 0.5, AY, 0), V(X0 - r, AY + h, 0), V(X0 - R - 0.5, AY + h, 0)]);
    });
  }

  // ======================= 4.5 the shadow =======================
  {
    const X0 = ST.shadow - 5, { lamp, tall } = M.SHA;
    floor(root, X0 - 1.5, X0 + 12.5, -2, 2.5);
    const lp = asm('lamp', root, { title: 'The street lamp', sub: `${lamp} m high` });
    part(lp, cyl(0.07, lamp, 20), { tone: 'hi', pal: 'ink', pos: [X0, lamp / 2, 0], name: 'Post' });
    part(lp, cyl(0.25, 0.05, 24), { tone: 'mid', pal: 'dark', pos: [X0, 0.025, 0], name: 'Base' });
    part(lp, new THREE.SphereGeometry(0.22, 32, 20), { tone: 'lit', pal: 'paper', pos: [X0, lamp, 0], name: 'Light' });
    const ps = asm('person', root, { title: 'The walker', sub: `${tall} m tall, walking away at ${M.SHA.v} m/s` });
    const body = new THREE.Group(); ps.add(body);
    part(body, cyl(0.17, 1.15, 24, 0.2), { tone: 'hi', pal: 'dark', pos: [0, 1.0, 0], name: 'Walker' });
    part(body, cyl(0.07, 0.45, 12), { tone: 'hi', pal: 'dark', pos: [0, 0.22, 0.09], name: 'Walker' });
    part(body, cyl(0.07, 0.45, 12), { tone: 'hi', pal: 'dark', pos: [0, 0.22, -0.09], name: 'Walker' });
    part(body, new THREE.SphereGeometry(0.15, 24, 16), { tone: 'hi', pal: 'paper', pos: [0, tall - 0.15, 0], name: 'Walker' });
    const wa = arrow(ps, 'blue', { r: 0.03, head: 0.16, headR: 0.08, name: 'dx/dt' });
    const sh = asm('shadowLen', root, { title: 'The shadow', sub: 's = (3/7)x: it grows at a constant 0.514 m/s' });
    const shadow = part(sh, box(1, 0.012, 0.3, 0.004), { tone: 'mid', pal: 'ink', name: 'Shadow' }); shadow.userData.home = null;
    const tipA = arrow(sh, 'red', { r: 0.03, head: 0.16, headR: 0.08, name: 'The tip: d(x + s)/dt' });
    const ray = dyn(root, 1, '#e5484d');
    const dims = dyn(root, 4, '#6e6e74');
    const ZD = 1.0;
    label('vec', '<i>x</i>', () => V(X0 + sc.x / 2, 0.05, ZD + 0.35));
    label('vec', '<i>s</i>', () => V(X0 + sc.x + sc.s / 2, 0.05, ZD + 0.35));
    label('mark', `${lamp} m`, () => V(X0 - 0.5, lamp / 2, 0));
    label('mark', `${tall} m`, () => V(X0 + sc.x - 0.75, tall / 2, -0.3));
    label('vec blue', 'd<i>x</i>/d<i>t</i>', () => wa.visible ? wa.localToWorld(V(0, wa.userData.arrow.shaft.scale.y + 0.4, 0)) : null);
    label('vec red', 'tip', () => tipA.visible ? tipA.localToWorld(V(0, tipA.userData.arrow.shaft.scale.y + 0.35, 0)) : null);
    const sc = { x: 1, s: 0.4 };
    ups.push(s => {
      const x = M.shaX(s.shadow.t), sl = M.shaS(x); sc.x = x; sc.s = sl;
      body.position.set(X0 + x, 0, 0);
      shadow.scale.set(sl, 1, 1); shadow.position.set(X0 + x + sl / 2, 0.008, 0);
      setArrow(wa, V(X0 + x + 0.25, 1.0, 0), V(M.SHA.v * 1.0, 0, 0));
      setArrow(tipA, V(X0 + x + sl, 0.1, 0.35), V(M.SHA_TIP * 1.0, 0, 0));
      setLines(ray, [V(X0, lamp, 0), V(X0 + x + sl, 0.01, 0)]);
      setLines(dims, [V(X0, 0.02, ZD), V(X0 + x, 0.02, ZD), V(X0 + x, 0.02, ZD), V(X0 + x + sl, 0.02, ZD),
        V(X0 + x, 0.02, ZD - 0.12), V(X0 + x, 0.02, ZD + 0.12), V(X0 + x + sl, 0.02, ZD - 0.12), V(X0 + x + sl, 0.02, ZD + 0.12)]);
    });
  }

  // ======================= 4.6 local linearity: zooming in =======================
  {
    const X0 = ST.lin;
    const B0 = graphBoard(root, { at: [X0 - 2.4, 5.0, 0], x: [0, 8], y: [0, 3.5], unit: 0.6, grid: [1, 0.5] });
    const ov = asm('overview', root, { title: 'The whole graph', sub: 'y = √x, with the window being zoomed into' });
    curve(B0, ov, M.sq, 0, 8);
    const frame = dyn(root, 4, '#e5484d');
    labels.push(...ticks(B0, { xs: [2, 4, 6, 8], ys: [1, 2, 3], xName: '<i>x</i>', yName: '<i>y</i> = √<i>x</i>' }));
    const Bz = graphBoard(root, { at: [X0, 2.2, 0], x: [-2, 2], y: [-2, 2], unit: 0.95, grid: [0.5, 0.5], axes: false });
    const zm = asm('zoom', root, { title: 'The window around (4, 2)', sub: 'every zoom keeps the same aspect' });
    const lc = liveCurve(Bz, zm, { pal: 'ink', r: 0.035, name: 'y = √x, magnified' });
    const ln = asm('tangentLine', root, { title: 'The tangent line', sub: 'L(x) = 2 + (x − 4)/4' });
    const tl = rod(ln, { r: 0.022, pal: 'red', name: 'L(x)' });
    setRod(tl, Bz.P(-2, -0.5, 0.06), Bz.P(2, 0.5, 0.06));
    const tlo = rod(ln, { r: 0.018, pal: 'red', name: 'L(x)' });
    setRod(tlo, B0.P(0, 1, 0.05), B0.P(8, 3, 0.05));
    const c = dot(zm, { pal: 'red', r: 0.08, name: '(4, 2)' }); putAt(Bz, c, 0, 0);
    label('board', 'the window, magnified', () => Bz.P(-2, 2).add(V(0.05, 0.25, 0)));
    label('mark', '', () => Bz.P(0, -2).add(V(0, -0.32, 0)), () => `<i>x</i> from ${fm(4 - 2 * sc.k, sc.k < 0.1 ? 2 : 1)} to ${fm(4 + 2 * sc.k, sc.k < 0.1 ? 2 : 1)} · ×${Math.round(M.ZOOM0 / sc.k)}`);
    const sc = { k: 2 };
    ups.push(s => {
      const k = M.zoomK(s.lin.t); sc.k = k;
      lc.set(X => (Math.sqrt(4 + k * X) - 2) / k, -2, 2);
      const P = (x, y) => B0.P(Math.min(Math.max(x, 0), 8), Math.min(Math.max(y, 0), 3.5), 0.06);
      const a = 4 - 2 * k, b = 4 + 2 * k, lo = 2 - 2 * k, hi = 2 + 2 * k;
      setLines(frame, [P(a, lo), P(b, lo), P(b, lo), P(b, hi), P(b, hi), P(a, hi), P(a, hi), P(a, lo)]);
    });
  }

  // ======================= 4.6 over or under =======================
  {
    const X0 = ST.over;
    const Bd = graphBoard(root, { at: [X0 - 3.1, 4.6, 0], x: [0, 8.5], y: [0, 4], unit: 0.72, grid: [1, 0.5] });
    const Bu = graphBoard(root, { at: [X0, 1.0, 0], x: [-2, 2], y: [-0.5, 3.5], unit: 0.75, grid: [0.5, 0.5] });
    labels.push(...ticks(Bd, { xs: [2, 4, 6, 8], ys: [1, 2, 3, 4], xName: '<i>x</i>', yName: '<i>y</i> = √<i>x</i>: concave down' }));
    labels.push(...ticks(Bu, { xs: [-1, 1], ys: [1, 2, 3], xName: '<i>x</i>', yName: '<i>y</i> = e<sup><i>x</i></sup>: concave up' }));
    const cd = asm('concDown', root, { title: 'Concave down', sub: 'f″ < 0: the tangent line runs above the curve' });
    curve(Bd, cd, M.sq, 0, 8.5);
    const t1 = rod(cd, { r: 0.022, name: 'Tangent at x = 4' }); setLineThrough(Bd, t1, 4, 2, 0.25, 0, 8.5);
    putAt(Bd, dot(cd, { r: 0.08, name: '(4, 2)' }), 4, 2);
    const cu = asm('concUp', root, { title: 'Concave up', sub: 'f″ > 0: the tangent line runs below the curve' });
    curve(Bu, cu, Math.exp, -2, 2);
    const t2 = rod(cu, { r: 0.022, name: 'Tangent at x = 0' }); setLineThrough(Bu, t2, 0, 1, 1, -1.5, 2);
    putAt(Bu, dot(cu, { r: 0.08, name: '(0, 1)' }), 0, 1);
    const gd = asm('gapDown', root, { title: 'An overestimate', sub: 'L(x) − √x > 0' });
    const gu = asm('gapUp', root, { title: 'An underestimate', sub: 'L(x) − eˣ < 0' });
    const rd = region(Bd, gd, { pal: 'red', opacity: 0.3, name: 'Error' }), ru = region(Bu, gu, { pal: 'blue', opacity: 0.3, name: 'Error' });
    const gapD = rod(gd, { r: 0.03, pal: 'red', name: 'L(x) − f(x)' }), gapU = rod(gu, { r: 0.03, pal: 'blue', name: 'L(x) − f(x)' });
    const dLd = dot(gd, { r: 0.07, pal: 'red', name: 'On the line' }), dFd = dot(gd, { r: 0.07, name: 'On the curve' });
    const dLu = dot(gu, { r: 0.07, pal: 'blue', name: 'On the line' }), dFu = dot(gu, { r: 0.07, name: 'On the curve' });
    label('mark', 'over', () => Bd.P(sc.x, M.sqL(sc.x)).add(V(0.15, 0.35, 0)));
    label('mark', 'under', () => Bu.P(sc.u, M.exL(sc.u)).add(V(-0.15, -0.35, 0)));
    const sc = { x: 4, u: 0 };
    ups.push(s => {
      const x = M.ovrX(s.over.t), u = M.ovrU(s.over.t); sc.x = x; sc.u = u;
      rd.set(M.sq, M.sqL, 4, x); ru.set(M.exL, Math.exp, Math.min(u, -1e-3), 0);
      setRod(gapD, Bd.P(x, M.sq(x), 0.05), Bd.P(x, M.sqL(x), 0.05)); setRod(gapU, Bu.P(u, Math.exp(u), 0.05), Bu.P(u, M.exL(u), 0.05));
      putAt(Bd, dLd, x, M.sqL(x)); putAt(Bd, dFd, x, M.sq(x)); putAt(Bu, dLu, u, M.exL(u)); putAt(Bu, dFu, u, Math.exp(u));
    });
  }

  // ======================= 4.7 L'Hôpital, 0/0 =======================
  {
    const X0 = ST.lh;
    const B = graphBoard(root, { at: [X0 - 2.2, 2.6, 0], x: [0, 2.6], y: [-2, 3], unit: 1.3, grid: [0.25, 0.5], ticks: [1, 1] });
    labels.push(...B.tickLabels());
    const nu = asm('numer', root, { title: 'The top: f(x) = ln x', sub: 'f(1) = 0, f′(1) = 1' });
    curve(B, nu, M.lhF, 0.01, 2.6);
    const de = asm('denom', root, { title: 'The bottom: g(x) = x² − 1', sub: 'g(1) = 0, g′(1) = 2' });
    curve(B, de, M.lhG, 0, 2.6, { pal: 'blue' });
    const tg = asm('tangents', root, { title: 'Their tangent lines at x = 1', sub: 'slopes 1 and 2: near 1, f/g ≈ 1/2' });
    const tf = rod(tg, { r: 0.016, pal: 'ink', tone: 'mid', name: 'y = x − 1' }); setLineThrough(B, tf, 1, 0, 1, 0, 2.6);
    const tgg = rod(tg, { r: 0.016, pal: 'blue', tone: 'mid', name: 'y = 2(x − 1)' }); setLineThrough(B, tgg, 1, 0, 2, 0, 2.6);
    const ht = asm('heights', root, { title: 'The two heights at x', sub: 'both shrink to 0; their ratio does not' });
    const hf = rod(ht, { r: 0.04, pal: 'ink', name: 'f(x)' }), hg = rod(ht, { r: 0.04, pal: 'blue', name: 'g(x)' });
    const df = dot(ht, { r: 0.07, name: 'f(x)' }), dg = dot(ht, { r: 0.07, pal: 'blue', name: 'g(x)' });
    label('vec', '<i>f</i>', () => B.P(2.45, M.lhF(2.45) + 0.3));
    label('vec blue', '<i>g</i>', () => B.P(2.05, M.lhG(2.05) + 0.1).add(V(-0.35, 0, 0)));
    label('mark', '', () => B.P(1.3, -1.6), () => `<i>f</i>(<i>x</i>)/<i>g</i>(<i>x</i>) = ${fm(M.lhF(sc.x) / M.lhG(sc.x), 4)}`);
    const sc = { x: 2 };
    ups.push(s => {
      const x = M.lhX(s.lh.t); sc.x = x;
      setRod(hf, B.P(x - 0.025, 0, 0.06), B.P(x - 0.025, M.lhF(x), 0.06)); setRod(hg, B.P(x + 0.025, 0, 0.07), B.P(x + 0.025, M.lhG(x), 0.07));
      putAt(B, df, x, M.lhF(x)); putAt(B, dg, x, M.lhG(x));
    });
  }

  // ======================= 4.7 L'Hôpital, ∞/∞ =======================
  {
    const X0 = ST.inf;
    const xs = x => x / 2, ys = y => y * 2;
    const B = graphBoard(root, { at: [X0 - 2.6, 1.0, 0], x: [0, 5.2], y: [0, 4.4], unit: 1, grid: [0.5, 0.5] });
    labels.push(...ticks(B, { xs: [2, 4, 6, 8, 10], ys: [0.5, 1, 1.5, 2], X: xs, Y: ys, xName: '<i>x</i>' }));
    const mk = (key, fn, pal, title, sub) => { const g = asm(key, root, { title, sub }); curve(B, g, X => ys(fn(2 * X)), 0, 5.2, { pal }); return { g, d: dot(g, { pal, r: 0.08, name: 'At x' }), fn }; };
    const cs = [
      mk('ratio0', M.r0, 'ink', 'x²/eˣ', 'the limit asked for: ∞/∞'),
      mk('ratio1', M.r1, 'blue', '2x/eˣ', 'after one L’Hôpital step: still ∞/∞'),
      mk('ratio2', M.r2, 'red', '2/eˣ', 'after two steps: 2/∞ → 0'),
    ];
    label('vec', '<i>x</i>²/e<sup><i>x</i></sup>', () => B.P(xs(4), ys(M.r0(4)) + 0.4));
    label('vec blue', '2<i>x</i>/e<sup><i>x</i></sup>', () => B.P(1.25, 1.95));
    label('vec red', '2/e<sup><i>x</i></sup>', () => B.P(xs(0.35), ys(M.r2(0.35))).add(V(0.7, 0.1, 0)));
    ups.push(s => { const x = M.infX(s.inf.t); for (const c of cs) putAt(B, c.d, xs(x), ys(c.fn(x))); });
  }

  return { labels, update: (s, look) => ups.forEach(u => u(s, look)) };
}
