// The figure: one world, eight scenes spread along x, the camera flying between them page by page.
// gears (rates multiply) · three chained graphs · a circle · the folium · a function flipped over y = x onto its
// inverse · arcsin and arctan with their triangle · a function beside its derivative · sin 2x and two derivatives.
import * as THREE from 'three';
import { part, cyl, zAxis, lines, shadeMat } from '../engine/parts.js';
import { graphBoard, curve, liveCurve, dot, putAt, rod, setRod, setLineThrough, V } from '../kit.js';
import * as M from './model.js';

// where each scene stands (world x)
export const ST = { gears: 0, chain: 40, circle: 80, folium: 120, inverse: 160, trig: 200, select: 240, high: 280 };
const CLAMP = 1e4;   // a vertical tangent's slope, for drawing
const cl = s => Math.max(-CLAMP, Math.min(CLAMP, s));

// a parametric curve (x(t), y(t)) on board B, broken where it leaves the board
function ptube(B, parent, fn, t0, t1, { n = 400, r = 0.035, pal = 'ink', tone = 'hi', name = 'Curve', lift = 0.03, mat } = {}) {
  const g = new THREE.Group(); parent.add(g);
  let run = [];
  const flush = () => {
    if (run.length > 1) part(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(run, false, 'centripetal'), Math.max(run.length * 2, 8), r, 12), { pal, tone, name, mat });
    run = [];
  };
  for (let i = 0; i <= n; i++) {
    const [x, y] = fn(t0 + (t1 - t0) * i / n);
    if (Number.isFinite(x) && Number.isFinite(y) && B.inside(x, y)) run.push(B.P(x, y, lift)); else flush();
  }
  flush();
  return g;
}

// one gear: N teeth of module m, facing +z, thickness w; a knob near the rim shows it turning
function gear(parent, N, m, w, name, pal = 'paper') {
  const r = m * N / 2, ra = r + m, rf = r - 1.25 * m, p = 2 * Math.PI / N, s = new THREE.Shape();
  for (let k = 0; k < N; k++) {
    const c = k * p, pts = [[rf, c - 0.5 * p], [rf, c - 0.27 * p], [ra, c - 0.13 * p], [ra, c + 0.13 * p], [rf, c + 0.27 * p]];
    pts.forEach(([rr, a], i) => (k === 0 && i === 0 ? s.moveTo : s.lineTo).call(s, rr * Math.cos(a), rr * Math.sin(a)));
  }
  s.closePath();
  const hole = new THREE.Path(); hole.absarc(0, 0, Math.min(0.09, rf * 0.3), 0, Math.PI * 2, true); s.holes.push(hole);
  const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 6 }); geo.translate(0, 0, -w / 2);
  const g = new THREE.Group(); parent.add(g);
  part(g, geo, { tone: 'hi', pal, name });
  part(g, cyl(m * 0.9, 0.04, 20).rotateX(Math.PI / 2), { tone: 'hi', pal: 'ink', name: 'Marker', pos: [0, rf * 0.72, w / 2 + 0.02] });
  if (rf > 0.6) part(g, new THREE.TorusGeometry(rf * 0.5, 0.012, 6, 64), { tone: 'mid', pal: 'dark', name, pos: [0, 0, w / 2 + 0.005] });
  return g;
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const lab = (cls, html, at, text) => labels.push({ cls, html, at, text });

  // ============ gears ============
  const G = M.GEAR, Rp = N => G.MOD * N / 2;
  const OX = V(ST.gears - 1.9, -0.55, 0), uBeta = 0, yBeta = 52 * Math.PI / 180;
  const OU = OX.clone().add(V(Rp(G.Nx) + Rp(G.Nu), 0, 0));
  const ZU2 = 0.36;
  const OY = OU.clone().add(V((Rp(G.Nu2) + Rp(G.Ny)) * Math.cos(yBeta), (Rp(G.Nu2) + Rp(G.Ny)) * Math.sin(yBeta), ZU2));
  part(root, new THREE.BoxGeometry(6.0, 4.3, 0.06), { tone: 'faint', pal: 'board', pos: [ST.gears - 0.93, -0.45, -0.55], name: 'Plate' });
  const axle = (parent, o, z0, z1) => part(parent, zAxis(cyl(0.07, z1 - z0, 20)), { tone: 'hi', pal: 'ink', name: 'Axle', pos: [o.x, o.y, (z0 + z1) / 2] });
  const gx = asm('gearX', root, { title: 'The x gear', sub: `${G.Nx} teeth: the input` });
  const gearX = gear(gx, G.Nx, G.MOD, 0.2, 'x gear', 'paper'); gearX.position.copy(OX); axle(gx, OX, -0.52, 0.16);
  const gu = asm('gearU', root, { title: 'The u shaft', sub: `${G.Nu} teeth driven, ${G.Nu2} teeth driving` });
  const gearU = new THREE.Group(); gu.add(gearU); gearU.position.copy(OU);
  gear(gearU, G.Nu, G.MOD, 0.2, 'u pinion', 'blue'); const big = gear(gearU, G.Nu2, G.MOD, 0.16, 'u gear', 'blue'); big.position.z = ZU2;
  axle(gu, OU, -0.52, ZU2 + 0.12);
  const gy = asm('gearY', root, { title: 'The y gear', sub: `${G.Ny} teeth: the output` });
  const gearY = gear(gy, G.Ny, G.MOD, 0.2, 'y gear', 'red'); gearY.position.copy(OY); axle(gy, OY, -0.52, ZU2 + 0.12);
  const gearAngles = c => {
    const tx = 2 * Math.PI * M.turns(c);
    const tu = uBeta + Math.PI + Math.PI / G.Nu - (G.Nx / G.Nu) * (tx - uBeta);
    const ty = yBeta + Math.PI + Math.PI / G.Ny - (G.Nu2 / G.Ny) * (tu - yBeta);
    return [tx, tu, ty];
  };
  lab('vec', 'x', () => OX.clone().add(V(0.3, -0.3, 0.12)));
  lab('vec', 'u', () => OU.clone().add(V(0.3, -0.3, ZU2 + 0.1)));
  lab('vec', 'y', () => OY.clone().add(V(0.3, -0.3, 0.12)));
  lab('mark', '<i>du</i>/<i>dx</i> = 3', () => OU.clone().add(V(-0.4, -1.55, 0.2)));
  lab('mark', '<i>dy</i>/<i>du</i> = 2', () => OY.clone().add(V(0.75, 0.75, 0)));

  // ============ the chain rule on three graphs ============
  const C = ST.chain;
  const BG = graphBoard(root, { at: [C - 5.4, -1.9, 0], x: [0, 2], y: [0, 4], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
  const BF = graphBoard(root, { at: [C - 2.1, 0, 0], x: [0, 4], y: [-1.2, 1.2], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
  const BH = graphBoard(root, { at: [C + 3.0, 0, 0], x: [0, 2], y: [-1.2, 1.2], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
  const chG = asm('inner', root, { title: 'The inner function', sub: 'u = g(x) = x²' });
  curve(BG, chG, M.g, 0, 2); const dG = dot(chG, { pal: 'red', name: 'Point' }), tG = rod(chG, { name: 'Tangent' });
  const guG = rod(chG, { r: 0.012, pal: 'dark', tone: 'mid', name: 'u' });
  const chF = asm('outer', root, { title: 'The outer function', sub: 'y = f(u) = sin u' });
  curve(BF, chF, M.f, 0, 4); const dF = dot(chF, { pal: 'red', name: 'Point' }), tF = rod(chF, { name: 'Tangent' });
  const guF = rod(chF, { r: 0.012, pal: 'dark', tone: 'mid', name: 'u' });
  const chH = asm('comp', root, { title: 'The composite', sub: 'y = f(g(x)) = sin(x²)' });
  curve(BH, chH, M.h, 0, 2); const dH = dot(chH, { pal: 'red', name: 'Point' }), tH = rod(chH, { name: 'Tangent' });
  labels.push(...BG.tickLabels({ xName: 'x', yName: 'u' }), ...BF.tickLabels({ xName: 'u', yName: 'y' }), ...BH.tickLabels({ xName: 'x', yName: 'y' }));
  lab('board', '<i>u</i> = <i>x</i>²', () => BG.P(0.15, 4.55));
  lab('board', '<i>y</i> = sin <i>u</i>', () => BF.P(0.15, 1.75));
  lab('board', '<i>y</i> = sin(<i>x</i>²)', () => BH.P(0.15, 1.75));

  // ============ the circle x² + y² = 25 ============
  const BC = graphBoard(root, { at: [ST.circle, 0, 0], x: [-6, 6], y: [-6, 6], unit: 0.5, grid: [1, 1], ticks: [2, 2] });
  const circ = asm('circle', root, { title: 'The circle', sub: `x² + y² = ${M.R * M.R}` });
  ptube(BC, circ, a => [M.R * Math.cos(a), M.R * Math.sin(a)], 0, 2 * Math.PI, { r: 0.03 });
  const halves = asm('halves', root, { title: 'Its two halves', sub: 'concave down on top, concave up below' });
  ptube(BC, halves, a => [M.R * Math.cos(a), M.R * Math.sin(a)], 0.02, Math.PI - 0.02, { r: 0.034, pal: 'red', lift: 0.05, name: 'Top half' });
  ptube(BC, halves, a => [M.R * Math.cos(a), M.R * Math.sin(a)], Math.PI + 0.02, 2 * Math.PI - 0.02, { r: 0.034, pal: 'blue', lift: 0.05, name: 'Bottom half' });
  const cPt = asm('circPt', root, { title: 'The moving point', sub: 'its tangent, from dy/dx = −x/y' });
  const cDot = dot(cPt, { pal: 'red', name: 'Point', r: 0.08 }), cTan = rod(cPt, { name: 'Tangent' });
  const cRad = rod(cPt, { r: 0.016, pal: 'ink', tone: 'mid', name: 'Radius' });
  const fitG = asm('fit', root, { title: 'The matching parabola', sub: 'the same value, slope and second derivative' });
  const fit = liveCurve(BC, fitG, { pal: 'ink', r: 0.02, name: 'Parabola', lift: 0.1 });
  labels.push(...BC.tickLabels());
  lab('mark', '(3, 4)', () => BC.P(3.35, 4.45));
  const p34 = dot(root, { r: 0.05, name: 'Mark' }); putAt(BC, p34, 3, 4, 0.04);

  // ============ the folium x³ + y³ = 6xy ============
  const BL = graphBoard(root, { at: [ST.folium, 0, 0], x: [-4, 4.5], y: [-4, 4.5], unit: 0.62, grid: [1, 1], ticks: [2, 2] });
  const fol = asm('folium', root, { title: 'The folium of Descartes', sub: 'x³ + y³ = 6xy' });
  const branch = t => M.folAt(t);
  ptube(BL, fol, branch, -0.75, 0, { n: 300 }); ptube(BL, fol, branch, 0, 60, { n: 1600 }); ptube(BL, fol, branch, -60, -1.3, { n: 900 });
  const asy = rod(fol, { r: 0.01, pal: 'dark', tone: 'lo', name: 'Asymptote x + y = −2' });
  setRod(asy, BL.P(-4, 2, 0.02), BL.P(2, -4, 0.02));
  const flat = asm('folFlat', root, { title: 'Where the tangent turns', sub: 'horizontal and vertical tangents' });
  for (const [P, s] of [[M.FOL_H, 0], [M.FOL_V, CLAMP]]) {
    putAt(BL, dot(flat, { r: 0.07, name: 'Point' }), ...P);
    const st = rod(flat, { r: 0.016, pal: 'dark', tone: 'mid', name: s ? 'Vertical tangent' : 'Horizontal tangent' });
    setLineThrough(BL, st, P[0], P[1], s, P[0] - 0.6, P[0] + 0.6, 0.04);
    if (s) setRod(st, BL.P(P[0], P[1] - 0.6, 0.04), BL.P(P[0], P[1] + 0.6, 0.04));
  }
  const fPt = asm('folPt', root, { title: 'The moving point', sub: 'slope (2y − x²)/(y² − 2x)' });
  const fDot = dot(fPt, { pal: 'red', name: 'Point' }), fTan = rod(fPt, { name: 'Tangent' });
  labels.push(...BL.tickLabels());
  putAt(BL, dot(root, { r: 0.055, name: 'Mark' }), ...M.FOL_P, 0.04);
  lab('mark', '(3, 3)', () => BL.P(3.7, 3.25));
  lab('mark', '<i>x</i> + <i>y</i> = −2', () => BL.P(-3.2, 0.6));

  // ============ the inverse: f(x) = x³ + x flipped over y = x ============
  const BI = graphBoard(root, { at: [ST.inverse, 0, 0], x: [-1.5, 3.2], y: [-1.5, 3.2], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
  const fI = asm('fcurve', root, { title: 'The function', sub: 'f(x) = x³ + x' });
  curve(BI, fI, M.inv, -1.5, 1.5);
  const tf = rod(fI, { r: 0.018, pal: 'ink', tone: 'mid', name: 'Tangent' }); setLineThrough(BI, tf, M.IA, M.IB, M.invp(M.IA), M.IA - 0.55, M.IA + 0.4, 0.045);
  putAt(BI, dot(fI, { name: 'Point (1, 2)' }), M.IA, M.IB);
  const gI = asm('ginv', root, { title: 'The inverse', sub: 'f⁻¹: the same points, x and y swapped' });
  ptube(BI, gI, t => [M.inv(t), t], -1.2, 1.5, { pal: 'blue' });
  const tg = rod(gI, { r: 0.018, pal: 'blue', tone: 'mid', name: 'Tangent' }); setLineThrough(BI, tg, M.IB, M.IA, 1 / M.invp(M.IA), M.IB - 1.6, M.IB + 1.1, 0.045);
  putAt(BI, dot(gI, { pal: 'blue', name: 'Point (2, 1)' }), M.IB, M.IA);
  const mir = asm('mirror', root, { title: 'The line y = x', sub: 'the mirror between f and f⁻¹' });
  const diag = rod(mir, { r: 0.012, pal: 'dark', tone: 'mid', name: 'y = x' }); setRod(diag, BI.P(-1.5, -1.5, 0.02), BI.P(3.2, 3.2, 0.02));
  const glass = part(mir, new THREE.BoxGeometry(4.7 * Math.SQRT2, 1.3, 0.01), { pal: 'blue', tone: 'faint', name: 'Mirror', mat: shadeMat('blue', { opacity: 0.1 }) });
  glass.position.copy(BI.P(0.85, 0.85, 0.65));
  glass.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(V(1, 1, 0).normalize(), V(0, 0, 1), V(1, -1, 0).normalize()));
  glass.userData.noEdge = true;
  // the flipping copy: a group pivoting on the line y = x, holding f's piece above the line, its tangent and slope triangle
  const flipA = asm('flip', root, { title: 'f, flipped over y = x', sub: 'rise and run trade places' });
  const pivot = new THREE.Group(); flipA.add(pivot); pivot.position.copy(BI.P(0, 0, 0.07));
  const LB = { P: (x, y, lift = 0) => V(x * BI.unit, y * BI.unit, lift), inside: BI.inside };
  ptube(LB, pivot, t => [t, M.inv(t)], 0, 1.24, { pal: 'red', lift: 0, r: 0.04, name: 'Copy of f' });
  const run = 0.5, rise = run * M.invp(M.IA);
  for (const [a, b] of [[[M.IA - run, M.IB - rise], [M.IA + 0.25, M.IB + 0.25 * M.invp(M.IA)]], [[M.IA - run, M.IB - rise], [M.IA, M.IB - rise]], [[M.IA, M.IB - rise], [M.IA, M.IB]]])
    setRod(rod(pivot, { r: 0.02, pal: 'red', name: 'Slope triangle' }), LB.P(...a), LB.P(...b));
  const fd = dot(pivot, { pal: 'red', name: 'Point' }); fd.position.copy(LB.P(M.IA, M.IB));
  const AX = V(1, 1, 0).normalize();
  labels.push(...BI.tickLabels());
  lab('mark', '<i>y</i> = <i>x</i>', () => BI.P(2.75, 3.05));
  lab('vec', '<i>f</i>', () => BI.P(1.5, 2.95));
  lab('vec blue', '<i>f</i> <sup>−1</sup>', () => BI.P(2.9, 1.55));
  lab('mark', 'slope 4', () => BI.P(0.2, 2.4));
  lab('mark', 'slope ¼', () => BI.P(2.4, 0.75));

  // ============ inverse trig: arcsin and arctan, and the triangle ============
  const BT = graphBoard(root, { at: [ST.trig - 1.2, 0, 0], x: [-1.25, 1.25], y: [-1.8, 1.8], unit: 1.3, grid: [0.25, 0.25], ticks: [0.5, 0.5] });
  const aS = asm('arcsin', root, { title: 'y = arcsin x', sub: 'slope 1/√(1 − x²)' });
  curve(BT, aS, M.asin, -1, 1, { n: 600 });
  const sDot = dot(aS, { pal: 'red', name: 'Point' }), sTan = rod(aS, { name: 'Tangent' });
  const aT = asm('arctan', root, { title: 'y = arctan x', sub: 'slope 1/(1 + x²)' });
  curve(BT, aT, M.atan, -1.25, 1.25, { pal: 'blue', tone: 'mid', r: 0.028 });
  const tDot = dot(aT, { pal: 'blue', name: 'Point', r: 0.075 }), tTan = rod(aT, { pal: 'blue', r: 0.02, name: 'Tangent' });
  const tri = asm('triangle', root, { title: 'The triangle', sub: 'sin y = x, so cos y = √(1 − x²)' });
  const TO = V(ST.trig + 1.25, -0.1, 0.05), TS = 2.3;
  const hyp = rod(tri, { r: 0.025, pal: 'ink', name: 'Hypotenuse 1' }), adj = rod(tri, { r: 0.025, pal: 'ink', tone: 'mid', name: 'Adjacent √(1 − x²)' }), opp = rod(tri, { r: 0.025, pal: 'red', name: 'Opposite x' });
  const triPts = x => { const c = Math.sqrt(1 - x * x); return [TO, TO.clone().add(V(TS * c, 0, 0)), TO.clone().add(V(TS * c, TS * x, 0))]; };
  labels.push(...BT.tickLabels());
  lab('board', 'arcsin <i>x</i>', () => BT.P(-1.15, 1.75));
  lab('vec blue', 'arctan', () => BT.P(0.75, 0.25));
  const trigLab = (html, fn) => lab('mark', html, () => fn(triPts(M.trigX(cur.c))));
  trigLab('1', ([o, , c]) => o.clone().lerp(c, 0.5).add(V(-0.14, 0.14 * Math.sign(c.y - o.y || 1), 0)));
  trigLab('<i>x</i>', ([, b, c]) => b.clone().lerp(c, 0.5).add(V(0.18, 0, 0)));
  trigLab('√(1 − <i>x</i>²)', ([o, b, c]) => o.clone().lerp(b, 0.5).add(V(0, c.y > o.y ? -0.2 : 0.2, 0)));
  trigLab('<i>y</i>', ([o, , c]) => o.clone().add(V(0.42, (c.y - o.y) * 0.12, 0)));

  // ============ selecting a procedure: q and q′ ============
  const BS = graphBoard(root, { at: [ST.select, 0, 0], x: [-3, 3], y: [-1.2, 1.2], unit: 1, grid: [0.5, 0.25], ticks: [1, 0.5] });
  const sQ = asm('q', root, { title: 'The function', sub: 'q(x) = x/(x² + 1)' });
  curve(BS, sQ, M.q, -3, 3);
  const qDot = dot(sQ, { pal: 'red', name: 'Point' }), qTan = rod(sQ, { name: 'Tangent' });
  const sQp = asm('qp', root, { title: 'Its derivative', sub: 'q′(x) = (1 − x²)/(x² + 1)²' });
  curve(BS, sQp, M.qp, -3, 3, { pal: 'blue', tone: 'mid' });
  const qpDot = dot(sQp, { pal: 'blue', name: 'Point' }), qGuide = rod(sQp, { r: 0.01, pal: 'dark', tone: 'lo', name: 'Guide' });
  labels.push(...BS.tickLabels());
  lab('vec', '<i>q</i>', () => BS.P(-2.3, -0.62));
  lab('vec blue', '<i>q</i>′', () => BS.P(0.32, 1.05));

  // ============ higher derivatives: sin 2x, 2 cos 2x, −4 sin 2x ============
  const HB = [0, 1, 2].map(k => graphBoard(root, { at: [ST.high - 3.6 + k * 3.0, 0, -k * 0.9], x: [0, Math.PI], y: [-4.2, 4.2], unit: 0.6, grid: [Math.PI / 4, 1], ticks: [1, 2] }));
  const hiNames = ['f(x) = sin 2x', 'f′(x) = 2 cos 2x', 'f″(x) = −4 sin 2x'];
  const hi = HB.map((B, k) => {
    const a = asm(['high0', 'high1', 'high2'][k], root, { title: ['The function', 'The first derivative', 'The second derivative'][k], sub: hiNames[k] });
    curve(B, a, x => M.sd(k, x), 0, Math.PI, { n: 300 });
    return { a, d: dot(a, { pal: 'red', name: 'Point' }), t: k < 2 ? rod(a, { name: 'Tangent' }) : null };
  });
  HB.forEach(B => labels.push(...B.tickLabels({ xName: 'x', yName: '' })));
  HB.forEach((B, k) => lab('board', ['<i>f</i> = sin 2<i>x</i>', '<i>f</i>′ = 2 cos 2<i>x</i>', '<i>f</i>″ = −4 sin 2<i>x</i>'][k], () => B.P(0.05, 4.75)));

  // ============ per frame ============
  const cur = { c: 0 };
  return {
    labels,
    update(s, look) {
      const c = cur.c = s.c;
      // gears
      const [ax, au, ay] = gearAngles(c);
      gearX.rotation.z = ax; gearU.rotation.z = au; gearY.rotation.z = ay;
      // chain
      const x = M.chainX(c), u = M.g(x), y = M.f(u);
      putAt(BG, dG, x, u); setLineThrough(BG, tG, x, u, M.gp(x), x - 0.6, x + 0.6); setRod(guG, BG.P(0, u, 0.04), BG.P(x, u, 0.04));
      putAt(BF, dF, u, y); setLineThrough(BF, tF, u, y, M.fp(u), u - 0.7, u + 0.7); setRod(guF, BF.P(u, 0, 0.04), BF.P(u, y, 0.04));
      putAt(BH, dH, x, y); setLineThrough(BH, tH, x, y, M.hp(x), x - 0.5, x + 0.5);
      // circle
      const a = M.circAngle(c), cx = M.R * Math.cos(a), cy = M.R * Math.sin(a);
      putAt(BC, cDot, cx, cy, 0.08); setLineThrough(BC, cTan, cx, cy, cl(M.circSlope(cx, cy)), cx - 2.5, cx + 2.5, 0.07);
      if (Math.abs(cy) < 0.05) setRod(cTan, BC.P(cx, cy - 2.5, 0.07), BC.P(cx, cy + 2.5, 0.07));
      setRod(cRad, BC.P(0, 0, 0.05), BC.P(cx, cy, 0.05));
      const conc = (look.conc || 0) > 0.5;
      halves.visible = conc; cRad.visible = cRad.visible && !conc; cTan.visible = cTan.visible && !conc; fitG.visible = conc;
      if (conc) {
        const s1 = M.circSlope(cx, cy), s2 = M.circY2(cx, cy);
        // as wide as keeps the parabola within 4 of the point's height (and on the board)
        const qa = 0.5 * Math.abs(s2), qb = Math.abs(s1), w = Math.min(2.6, (-qb + Math.sqrt(qb * qb + 16 * qa)) / (2 * qa));
        fitG.visible = Math.abs(cy) > 0.6;
        fit.set(xx => cy + s1 * (xx - cx) + 0.5 * s2 * (xx - cx) ** 2, Math.max(-6, cx - w), Math.min(6, cx + w));
      }
      // folium
      const th = M.folTheta(c), [fx, fy] = M.folAt(Math.tan(th));
      putAt(BL, fDot, fx, fy, 0.07); setLineThrough(BL, fTan, fx, fy, cl(M.folSlope(fx, fy)), fx - 1.6, fx + 1.6, 0.06);
      // inverse: the flip about the line y = x
      pivot.quaternion.setFromAxisAngle(AX, M.flip(c));
      // trig
      const tx = M.trigX(c);
      putAt(BT, sDot, tx, M.asin(tx), 0.08); setLineThrough(BT, sTan, tx, M.asin(tx), M.asinp(tx), tx - 0.45, tx + 0.45, 0.06);
      putAt(BT, tDot, tx, M.atan(tx), 0.08); setLineThrough(BT, tTan, tx, M.atan(tx), M.atanp(tx), tx - 0.45, tx + 0.45, 0.06);
      const [o, b, cc] = triPts(tx); setRod(hyp, o, cc); setRod(adj, o, b); setRod(opp, b, cc);
      // select
      const sx = M.selX(c);
      putAt(BS, qDot, sx, M.q(sx)); setLineThrough(BS, qTan, sx, M.q(sx), M.qp(sx), sx - 0.8, sx + 0.8);
      putAt(BS, qpDot, sx, M.qp(sx)); setRod(qGuide, BS.P(sx, M.q(sx), 0.03), BS.P(sx, M.qp(sx), 0.03));
      // higher
      const hx = M.highX(c);
      hi.forEach((H, k) => { putAt(HB[k], H.d, hx, M.sd(k, hx)); if (H.t) setLineThrough(HB[k], H.t, hx, M.sd(k, hx), M.sd(k + 1, hx), hx - 0.45, hx + 0.45); });
    },
  };
}
