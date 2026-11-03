// The figure: one sheet of graph paper per idea, spread along x, the camera flying between them.
//   lift     the loop x = t², y = t³ − 3t, with time lifted out of the paper as a third axis (opener, 9.1)
//   slope    a point riding the loop, its tangent, and dx/dt, dy/dt as run and rise (9.2)
//   concave  the two halves of the loop, concave up and concave down (9.3)
//   arc      chords inscribed in the loop, refining toward its length (9.4)
//   vec      position, velocity and acceleration vectors on the loop (9.5)
//   integ    the cycloid rebuilt from its velocity, v·Δt laid tip to tail (9.6)
//   wheel    a wheel rolling along the axis, a rim point tracing the cycloid (9.7)
//   polar, pslope, parea, between: the cardioid r = 2 + 2 cos θ on polar paper (9.8–9.11)
import * as THREE from 'three';
import { graphBoard, curve, dot, hole, putAt, rod, setRod, V } from '../kit.js';
import { part, lines, arrow, setArrow, shadeMat, liveTube, cyl } from '../engine/parts.js';
import * as M from './model.js';

// where each scene's paper stands
export const AT = { lift: [0, 0, 0], slope: [14, 0, 0], concave: [28, 0, 0], arc: [42, 0, 0], vec: [56, 0, 0], integ: [70, 0, 0], wheel: [84, 0, 0], polar: [100, 0, 0], pslope: [116, 0, 0], parea: [130, 0, 0], between: [144, 0, 0] };
export const LIFT = 0.75;      // world units of height per unit of t, in the opener's lifted curve
export const VS = 0.12, AS = 0.08;   // 9.5: arrow units per unit of velocity, of acceleration
export const WV = 0.6;               // 9.7: arrow units per unit of velocity and of acceleration

// ---------- drawing helpers this chapter needs beyond the kit ----------
// a fixed parametric curve (fx(t), fy(t)), a ≤ t ≤ b; broken where it leaves the board
function pcurve(B, parent, fx, fy, a, b, { n = 300, r = 0.035, pal = 'ink', tone = 'hi', name = 'Curve', lift = 0.03 } = {}) {
  const g = new THREE.Group(); parent.add(g);
  let run = [];
  const flush = () => { if (run.length > 1) part(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(run, false, 'centripetal'), Math.max(run.length * 2, 8), r, 12), { pal, tone, name }); run = []; };
  for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n, x = fx(t), y = fy(t); if (B.inside(x, y)) run.push(B.P(x, y, lift)); else flush(); }
  flush();
  return g;
}
// a parametric curve redrawn every frame (a trace growing): set(fx, fy, a, b)
function livePath(B, parent, { n = 200, r = 0.04, pal = 'red', tone = 'hi', name = 'Trace', lift = 0.045 } = {}) {
  const geo = liveTube(n, r, 12), m = part(parent, geo, { pal, tone, name });
  const pts = Array.from({ length: n + 1 }, () => V());
  m.set = (fx, fy, a, b) => {
    m.visible = b - a > 1e-3;
    if (!m.visible) return;
    for (let i = 0; i <= n; i++) { const t = a + (b - a) * i / n; pts[i].copy(B.P(fx(t), fy(t), lift)); }
    geo.update(pts);
  };
  return m;
}
// polar paper: circles r = 1, 2, … and rays every 30°, inside the board
function polarGrid(B, parent, rmax) {
  const seg = [], z = B.P(0, 0).z + 0.003;
  for (let r = 1; r <= rmax; r++) for (let i = 0; i < 96; i++) {
    const a = i / 96 * 2 * Math.PI, b = (i + 1) / 96 * 2 * Math.PI, p = [r * Math.cos(a), r * Math.sin(a)], q = [r * Math.cos(b), r * Math.sin(b)];
    if (B.inside(...p) && B.inside(...q)) seg.push(B.P(...p).x, B.P(...p).y, z, B.P(...q).x, B.P(...q).y, z);
  }
  for (let k = 0; k < 12; k++) {
    if (k % 3 === 0) continue;   // the axes are drawn by the board
    const a = k * Math.PI / 6; let r = rmax; while (r > 0 && !B.inside(r * Math.cos(a), r * Math.sin(a))) r -= 0.05;
    seg.push(B.P(0, 0).x, B.P(0, 0).y, z, B.P(r * Math.cos(a), 0).x, B.P(0, r * Math.sin(a)).y, z);
  }
  lines(parent, seg, '#e2e2dc');
}
// the region between r = rin(θ) and r = rout(θ), a ≤ θ ≤ b, flat on the paper
function polarRegion(B, parent, { pal = 'red', opacity = 0.3, n = 160, name = 'Region' } = {}) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array((n + 1) * 2 * 3), idx = [];
  for (let i = 0; i < n; i++) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  geo.setIndex(idx); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(pos.length).map((_, i) => i % 3 === 2 ? 1 : 0), 3));
  const mat = shadeMat(pal, { opacity }).clone(); mat.side = THREE.DoubleSide;
  const m = new THREE.Mesh(geo, mat); m.userData = { noEdge: true, part: name, tone: 0.2, baseTone: 0.2 }; parent.add(m);
  m.set = (rin, rout, a, b) => {
    m.visible = b - a > 1e-4;
    for (let i = 0; i <= n; i++) {
      const th = a + (b - a) * i / n, c = Math.cos(th), s = Math.sin(th), p = B.P(rin(th) * c, rin(th) * s, 0.012), q = B.P(rout(th) * c, rout(th) * s, 0.012);
      pos.set([p.x, p.y, p.z, q.x, q.y, q.z], i * 6);
    }
    geo.attributes.position.needsUpdate = true; geo.computeBoundingSphere(); geo.computeBoundingBox();
  };
  return m;
}
// an arrow for a math vector (vx, vy) drawn from math point (x, y), at `scale` math units per unit
const setVec = (B, a, x, y, vx, vy, scale, lift = 0.1) => setArrow(a, B.P(x, y, lift), V(vx * scale * B.unit, vy * scale * B.unit, 0));
// a segment of half-length h through math point (x, y) along direction (dx, dy): a tangent line
function setTangent(B, m, x, y, dx, dy, h = 1.5) {
  const L = Math.hypot(dx, dy);
  if (!(L > 1e-9)) { m.visible = false; return; }
  const ux = dx / L * h, uy = dy / L * h;
  setRod(m, B.P(x - ux, y - uy, 0.06), B.P(x + ux, y + uy, 0.06));
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const board = (key, opts) => graphBoard(root, { at: AT[key], ...opts });

  // ---------- lift: the loop, and time as a third axis ----------
  const BL = board('lift', { x: [-1, 5], y: [-2.5, 2.5], grid: [0.5, 0.5], ticks: [1, 1] });
  const zl = t => (t - M.T0) * LIFT;
  const gPath = asm('path', root, { title: 'The path', sub: 'x = t², y = t³ − 3t, drawn on the paper' });
  pcurve(BL, gPath, M.X, M.Y, M.T0, M.T1);
  for (const t of [-1.5, -0.5, 0.5, 1.5]) {   // which way it is traced
    const c = part(gPath, new THREE.ConeGeometry(0.11, 0.3, 20), { pal: 'ink', tone: 'hi', name: 'Direction', pos: BL.P(M.X(t), M.Y(t), 0.05).toArray() });
    c.quaternion.setFromUnitVectors(V(0, 1, 0), V(M.DX(t), M.DY(t), 0).normalize());
  }
  const gLift = asm('lifted', root, { title: 'Time, lifted', sub: 'each point raised by its t' });
  const liftPts = []; for (let i = 0; i <= 240; i++) { const t = M.T0 + (M.T1 - M.T0) * i / 240; liftPts.push(BL.P(M.X(t), M.Y(t), zl(t))); }
  part(gLift, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(liftPts), 480, 0.035, 12), { pal: 'blue', tone: 'hi', name: 'Lifted curve' });
  { // a curtain from the path up to the lifted curve
    const geo = new THREE.BufferGeometry(), pos = [];
    for (const p of liftPts) pos.push(p.x, p.y, AT.lift[2] + 0.02, p.x, p.y, p.z);
    const idx = []; for (let i = 0; i < liftPts.length - 1; i++) { const k = i * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    geo.setIndex(idx); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    const mat = shadeMat('blue', { opacity: 0.16 }).clone(); mat.side = THREE.DoubleSide;
    const m = new THREE.Mesh(geo, mat); m.userData = { noEdge: true }; gLift.add(m);
    const rungs = [];
    for (let t = M.T0; t <= M.T1; t++) { const p = BL.P(M.X(t), M.Y(t)); rungs.push(p.x, p.y, 0.02, p.x, p.y, zl(t)); }
    lines(gLift, rungs, '#5b86d6');
  }
  const gPart = asm('particle', root, { title: 'The moving point', sub: 'where it is at time t' });
  const pDot = dot(gPart, { pal: 'red', r: 0.12, name: 'Point' }), pHi = dot(gPart, { pal: 'red', r: 0.1, name: 'Point at height t' });
  const pDrop = rod(gPart, { pal: 'red', r: 0.015, name: 'Drop line' });
  labels.push(...BL.tickLabels(),
    ...[-2, -1, 0, 1, 2].map(t => ({ cls: 'mark', html: `<i>t</i> = ${t < 0 ? '−' : ''}${Math.abs(t)}`, at: () => BL.P(M.X(t), M.Y(t), zl(t)).add(t === 0 ? V(-0.55, 0.3, 0) : V(0.45, 0.2, 0)) })),
    { cls: 'mark', html: '(3, 0) twice', at: () => BL.P(3, 0).add(V(0.9, -0.3, 0)) });

  // ---------- slope: dy/dx = (dy/dt)/(dx/dt) ----------
  const BS = board('slope', { x: [-1, 5], y: [-2.5, 2.5], grid: [0.5, 0.5], ticks: [1, 1] });
  const gSC = asm('sCurve', root, { title: 'The loop', sub: 'x = t², y = t³ − 3t' });
  pcurve(BS, gSC, M.X, M.Y, M.T0, M.T1);
  const gST = asm('sTangent', root, { title: 'The tangent line', sub: 'slope dy/dx = (dy/dt)/(dx/dt)' });
  const sTan = rod(gST, { pal: 'red', r: 0.03, name: 'Tangent' }), sDot = dot(gST, { pal: 'red', r: 0.11, name: 'Point' });
  const gSR = asm('sRates', root, { title: 'Run and rise', sub: 'dx/dt across, dy/dt up' });
  const sRun = arrow(gSR, 'blue', { r: 0.025, head: 0.14, headR: 0.07, name: 'dx/dt' }), sRise = arrow(gSR, 'blue', { r: 0.025, head: 0.14, headR: 0.07, name: 'dy/dt' });
  const gSS = asm('sSpecial', root, { title: 'Level and upright', sub: 'where dy/dt = 0, and where dx/dt = 0' });
  for (const [x, y] of [[1, -2], [1, 2], [0, 0]]) putAt(BS, hole(gSS, { r: 0.13, name: 'Special point' }), x, y, 0.07);
  const sv = { t: 0 };
  labels.push(...BS.tickLabels(),
    { cls: 'mark', html: 'horizontal', at: () => BS.P(1, 2).add(V(0.15, 0.32, 0)) },
    { cls: 'mark', html: 'horizontal', at: () => BS.P(1, -2).add(V(0.15, -0.34, 0)) },
    { cls: 'mark', html: 'vertical', at: () => BS.P(0, 0).add(V(-0.7, 0.3, 0)) },
    { cls: 'vec blue', html: '<i>dx</i>/<i>dt</i>', at: () => Math.abs(M.DX(sv.t)) > 1.2 ? BS.P(M.X(sv.t) + M.DX(sv.t) * VS * 0.5, M.Y(sv.t) - 0.3 * Math.sign(M.DY(sv.t) || 1)) : null },
    { cls: 'vec blue', html: '<i>dy</i>/<i>dt</i>', at: () => Math.abs(M.DY(sv.t)) > 1.5 ? BS.P(M.X(sv.t) + M.DX(sv.t) * VS + 0.45 * Math.sign(M.DX(sv.t) || 1), M.Y(sv.t) + M.DY(sv.t) * VS * 0.5) : null });

  // ---------- concave: d²y/dx² ----------
  const BC = board('concave', { x: [-1, 5], y: [-2.5, 2.5], grid: [0.5, 0.5], ticks: [1, 1] });
  const gUp = asm('cUp', root, { title: 'Concave up', sub: 't > 0: d²y/dx² = 3(t² + 1)/(4t³) > 0' });
  pcurve(BC, gUp, M.X, M.Y, 0, M.T1, { pal: 'red', r: 0.045 });
  const gDn = asm('cDown', root, { title: 'Concave down', sub: 't < 0: d²y/dx² < 0' });
  pcurve(BC, gDn, M.X, M.Y, M.T0, 0, { pal: 'blue', r: 0.045 });
  const gCT = asm('cTangent', root, { title: 'The turning tangent', sub: 'how fast dy/dx changes, per unit of x' });
  const cTan = rod(gCT, { pal: 'ink', r: 0.028, name: 'Tangent' }), cDot = dot(gCT, { pal: 'ink', r: 0.11, name: 'Point' });
  labels.push(...BC.tickLabels(),
    { cls: 'mark', html: 'concave up, <i>t</i> &gt; 0', at: () => BC.P(2.4, -2.05) },
    { cls: 'mark', html: 'concave down, <i>t</i> &lt; 0', at: () => BC.P(2.4, 2.1) });

  // ---------- arc: chords refining toward the length ----------
  const BA = board('arc', { x: [-1, 5], y: [-2.5, 2.5], grid: [0.5, 0.5], ticks: [1, 1] });
  const gAL = asm('aLoop', root, { title: 'The loop', sub: `−√3 ≤ t ≤ √3, length ${M.LOOP_L.toFixed(3)}` });
  pcurve(BA, gAL, M.X, M.Y, -M.TC, M.TC);
  pcurve(BA, gAL, M.X, M.Y, M.T0, -M.TC, { pal: 'dark', tone: 'lo', r: 0.025 }); pcurve(BA, gAL, M.X, M.Y, M.TC, M.T1, { pal: 'dark', tone: 'lo', r: 0.025 });
  const gAC = asm('aChords', root, { title: 'The chords', sub: 'straight pieces, each √(Δx² + Δy²)' });
  const NMAX = Math.max(...M.CHORD_NS);
  const aRods = Array.from({ length: NMAX }, () => rod(gAC, { pal: 'red', r: 0.03, name: 'Chord' }));
  const aDots = Array.from({ length: NMAX + 1 }, () => dot(gAC, { pal: 'red', r: 0.06, name: 'Vertex' }));
  labels.push(...BA.tickLabels());

  // ---------- vec: r, v, a ----------
  const BV = board('vec', { x: [-1, 5], y: [-2.5, 2.5], grid: [0.5, 0.5], ticks: [1, 1] });
  const gVC = asm('vCurve', root, { title: 'The path', sub: 'r(t) = ⟨t², t³ − 3t⟩' });
  pcurve(BV, gVC, M.X, M.Y, M.T0, M.T1, { pal: 'dark', tone: 'mid', r: 0.03 });
  const vDot = dot(gVC, { pal: 'ink', r: 0.11, name: 'Particle' });
  const gVR = asm('vPos', root, { title: 'Position', sub: 'r(t), from the origin to the particle' });
  const vPos = arrow(gVR, 'ink', { r: 0.018, head: 0.14, headR: 0.06, name: 'Position r' });
  const gVV = asm('vVel', root, { title: 'Velocity', sub: 'v(t) = r′(t) = ⟨2t, 3t² − 3⟩' });
  const vVel = arrow(gVV, 'blue', { name: 'Velocity v' });
  const gVA = asm('vAcc', root, { title: 'Acceleration', sub: 'a(t) = v′(t) = ⟨2, 6t⟩' });
  const vAcc = arrow(gVA, 'red', { name: 'Acceleration a' });
  const vv = { t: 0 };
  const tipV = t => BV.P(M.X(t) + M.DX(t) * VS * 1.12, M.Y(t) + M.DY(t) * VS * 1.12).add(V(0.22, 0.05, 0));
  labels.push(...BV.tickLabels(),
    { cls: 'vec', html: '<b>r</b>', at: () => BV.P(M.X(vv.t) / 2, M.Y(vv.t) / 2).add(V(-0.2, 0.25, 0)) },
    { cls: 'vec blue', html: '<b>v</b>', at: () => tipV(vv.t) },
    { cls: 'vec red', html: '<b>a</b>', at: () => BV.P(M.X(vv.t) + M.D2X() * AS * 1.15, M.Y(vv.t) + M.D2Y(vv.t) * AS * 1.15).add(V(0.25, 0, 0)) });

  // ---------- integ: the cycloid rebuilt from v·Δt ----------
  const BI = board('integ', { x: [-0.5, 7], y: [-0.5, 2.5], grid: [0.5, 0.5], ticks: [1, 1] });
  const gIC = asm('iPath', root, { title: 'The true path', sub: 'r(t) = ⟨t − sin t, 1 − cos t⟩' });
  pcurve(BI, gIC, M.CX, M.CY, 0, M.CT1, { pal: 'dark', tone: 'mid', r: 0.025 });
  const gIS = asm('iSteps', root, { title: 'v · Δt, tip to tail', sub: `${M.STEPS} steps of Δt = 2π/${M.STEPS}` });
  const iArr = Array.from({ length: M.STEPS }, () => arrow(gIS, 'blue', { r: 0.022, head: 0.13, headR: 0.06, name: 'v·Δt' }));
  const gIE = asm('iEnds', root, { title: 'Start and finish', sub: 'r(0), then r(0) + ∫ v dt' });
  putAt(BI, dot(gIE, { pal: 'ink', r: 0.09, name: 'r(0)' }), 0, 0, 0.08);
  putAt(BI, hole(gIE, { r: 0.12, name: 'r(π)' }), Math.PI, 2, 0.08);
  putAt(BI, hole(gIE, { r: 0.12, name: 'r(2π)' }), M.CT1, 0, 0.08);
  labels.push(...BI.tickLabels(),
    { cls: 'mark', html: '<b>r</b>(0)', at: () => BI.P(0, 0).add(V(-0.1, 0.35, 0)) },
    { cls: 'mark', html: '<b>r</b>(π) = ⟨π, 2⟩', at: () => BI.P(Math.PI, 2).add(V(0, 0.38, 0)) },
    { cls: 'mark', html: '<b>r</b>(2π) = ⟨2π, 0⟩', at: () => BI.P(M.CT1, 0).add(V(-0.2, 0.42, 0)) });

  // ---------- wheel: a rolling wheel, a rim point tracing the cycloid ----------
  const BW = board('wheel', { x: [-1, 7.5], y: [-0.5, 2.5], grid: [0.5, 0.5], ticks: [1, 1] });
  const gWW = asm('wWheel', root, { title: 'The wheel', sub: 'radius 1, rolling at 1 radian per second' });
  const wheel = new THREE.Group(); gWW.add(wheel);
  const WZ = 0.2;   // the wheel stands just in front of the paper
  part(wheel, new THREE.TorusGeometry(BW.unit * 0.96, 0.05, 12, 96), { pal: 'paper', tone: 'hi', name: 'Rim' });
  part(wheel, cyl(0.12, 0.12, 24).rotateX(Math.PI / 2), { pal: 'paper', tone: 'hi', name: 'Hub' });
  for (let k = 0; k < 3; k++) part(wheel, cyl(0.02, BW.unit * 1.86, 8), { pal: 'paper', tone: 'mid', name: 'Spoke', rot: [0, 0, k * Math.PI / 3] });
  const gWT = asm('wTrace', root, { title: 'The cycloid', sub: 'the rim point’s path' });
  pcurve(BW, gWT, M.CX, M.CY, 0, M.CT1, { pal: 'dark', tone: 'lo', r: 0.018 });
  const wTrace = livePath(BW, gWT, { pal: 'ink', r: 0.035 });
  const gWP = asm('wPoint', root, { title: 'The rim point', sub: 'at rest each time it touches the ground' });
  const wDot = dot(gWP, { pal: 'red', r: 0.11, name: 'Rim point' });
  const gWV = asm('wVel', root, { title: 'Velocity', sub: 'v = ⟨1 − cos t, sin t⟩, speed 2|sin(t/2)|' });
  const wVel = arrow(gWV, 'blue', { name: 'Velocity' });
  const gWA = asm('wAcc', root, { title: 'Acceleration', sub: 'a = ⟨sin t, cos t⟩: length 1, toward the hub' });
  const wAcc = arrow(gWA, 'red', { r: 0.028, head: 0.14, headR: 0.07, name: 'Acceleration' });
  const wv = { t: 0 };
  labels.push(...BW.tickLabels(),
    { cls: 'vec blue', html: '<b>v</b>', at: () => M.cspeed(wv.t) > 0.3 ? BW.P(M.CX(wv.t) + M.CVX(wv.t) * WV + 0.2, M.CY(wv.t) + M.CVY(wv.t) * WV + 0.12, WZ + 0.2) : null },
    { cls: 'vec red', html: '<b>a</b>', at: () => BW.P(M.CX(wv.t) + M.CAX(wv.t) * WV * 0.55 - 0.22, M.CY(wv.t) + M.CAY(wv.t) * WV * 0.55, WZ + 0.2) });

  // ---------- polar: r = 2 + 2 cos θ, and its r–θ graph ----------
  const BP = board('polar', { x: [-1.5, 4.5], y: [-3, 3], grid: [0, 0], ticks: [1, 1] });
  polarGrid(BP, root, 4);
  const BG = graphBoard(root, { at: [AT.polar[0] - 0.95, AT.polar[1] - 7.3, 0], x: [0, 2 * Math.PI], y: [0, 4], unit: 0.72, grid: [Math.PI / 4, 1], ticks: [0, 1] });
  const gPC = asm('pCurve', root, { title: 'The cardioid', sub: 'r = 2 + 2 cos θ' });
  pcurve(BP, gPC, M.PX, M.PY, 0, 2 * Math.PI, { pal: 'dark', tone: 'lo', r: 0.018 });
  const pTrace = livePath(BP, gPC, { pal: 'ink', r: 0.04 });
  const gPR = asm('pRay', root, { title: 'The ray at angle θ', sub: 'out from the pole a distance r' });
  const pRay = rod(gPR, { pal: 'blue', r: 0.03, name: 'Ray' }), plDot = dot(gPR, { pal: 'red', r: 0.11, name: 'Point' });
  const gPG = asm('pGraph', root, { title: 'r against θ', sub: 'the same function on ordinary axes' });
  curve(BG, gPG, M.R, 0, 2 * Math.PI, { pal: 'dark', tone: 'lo', r: 0.018 });
  const gTrace = livePath(BG, gPG, { pal: 'ink', r: 0.035 });
  const gBar = rod(gPG, { pal: 'blue', r: 0.03, name: 'r' }), gDot = dot(gPG, { pal: 'red', r: 0.09, name: 'Point' });
  const theta = [[Math.PI / 2, 'π/2'], [Math.PI, 'π'], [3 * Math.PI / 2, '3π/2'], [2 * Math.PI, '2π']];
  labels.push(...BP.tickLabels(), ...BG.tickLabels({ xName: 'θ', yName: 'r' }),
    ...theta.map(([th, s]) => ({ cls: 'tick', html: s, at: () => BG.P(th, 0).add(V(0.18, -0.2, 0)) })));

  // ---------- pslope: the slope of a polar curve, and what dr/dθ says ----------
  const BQ = board('pslope', { x: [-1.5, 4.5], y: [-3, 3], grid: [0, 0], ticks: [1, 1] });
  polarGrid(BQ, root, 4);
  const gQC = asm('qCurve', root, { title: 'The cardioid', sub: 'x = r cos θ, y = r sin θ' });
  pcurve(BQ, gQC, M.PX, M.PY, 0, 2 * Math.PI);
  const gQT = asm('qTangent', root, { title: 'The tangent line', sub: 'dy/dx = (dy/dθ)/(dx/dθ)' });
  const qTan = rod(gQT, { pal: 'red', r: 0.03, name: 'Tangent' }), qDot = dot(gQT, { pal: 'red', r: 0.11, name: 'Point' });
  const gQR = asm('qRay', root, { title: 'The ray, and dr/dθ', sub: 'out or in: the sign of dr/dθ' });
  const qRay = rod(gQR, { pal: 'dark', r: 0.016, name: 'Ray' }), qDr = arrow(gQR, 'blue', { r: 0.028, head: 0.15, headR: 0.075, name: 'dr/dθ' });
  const gQS = asm('qSpecial', root, { title: 'Two marked points', sub: 'θ = π/3 (level) and θ = π/2 (slope 1)' });
  putAt(BQ, hole(gQS, { r: 0.13, name: 'Top' }), M.PX(M.THT), M.PY(M.THT), 0.07);
  putAt(BQ, hole(gQS, { r: 0.13, name: 'Worked point' }), M.PX(M.THS), M.PY(M.THS), 0.07);
  const qv = { th: 0 };
  labels.push(...BQ.tickLabels(),
    { cls: 'mark', html: 'θ = π/3', at: () => BQ.P(M.PX(M.THT), M.PY(M.THT)).add(V(0.55, 0.3, 0)) },
    { cls: 'mark', html: 'θ = π/2', at: () => BQ.P(M.PX(M.THS), M.PY(M.THS)).add(V(-0.75, 0.25, 0)) },
    { cls: 'vec blue', html: '<i>dr</i>/<i>dθ</i>', at: () => Math.abs(M.DR(qv.th)) > 0.6 ? BQ.P(M.PX(qv.th) + Math.cos(qv.th) * M.DR(qv.th) * 0.35 - 0.1, M.PY(qv.th) + Math.sin(qv.th) * M.DR(qv.th) * 0.35 - 0.35) : null });

  // ---------- parea: wedges ½r²Δθ filling the first quadrant ----------
  const BR = board('parea', { x: [-1.5, 4.5], y: [-3, 3], grid: [0, 0], ticks: [1, 1] });
  polarGrid(BR, root, 4);
  const gRC = asm('rCurve', root, { title: 'The cardioid', sub: 'r = 2 + 2 cos θ, all of it: area 6π' });
  pcurve(BR, gRC, M.PX, M.PY, 0, 2 * Math.PI);
  const gRR = asm('rRegion', root, { title: 'The region', sub: `0 ≤ θ ≤ π/2: area 3π/2 + 4 = ${M.AQ.toFixed(3)}` });
  const rReg = polarRegion(BR, gRR, { pal: 'blue', opacity: 0.22 }); rReg.set(() => 0, M.R, 0, Math.PI / 2);
  const gRW = asm('rWedges', root, { title: 'The wedges', sub: 'sectors of circles: ½ r² Δθ each' });
  const wedgeSets = M.WEDGE_NS.map(n => {
    const g = new THREE.Group(); gRW.add(g); g.visible = false;
    const mat = shadeMat('red', { opacity: 0.75 });
    for (const [a, b, r] of M.wedges(n)) {
      const geo = new THREE.CylinderGeometry(r * BR.unit, r * BR.unit, 0.1, Math.max(4, Math.ceil(48 / n * 2)), 1, false, a + Math.PI / 2, (b - a) * 0.985).rotateX(Math.PI / 2);
      part(g, geo, { pal: 'red', tone: 'mid', name: 'Wedge', mat, pos: BR.P(0, 0, 0.06).toArray() });
    }
    return g;
  });
  labels.push(...BR.tickLabels());

  // ---------- between: inside the cardioid, outside the circle r = 3 ----------
  const BB = board('between', { x: [-3.5, 4.5], y: [-3.5, 3.5], grid: [0, 0], ticks: [1, 1] });
  polarGrid(BB, root, 5);
  const gBO = asm('bOuter', root, { title: 'The outer curve', sub: 'the cardioid R = 2 + 2 cos θ' });
  pcurve(BB, gBO, M.PX, M.PY, 0, 2 * Math.PI);
  const gBI = asm('bInner', root, { title: 'The inner curve', sub: 'the circle r = 3' });
  pcurve(BB, gBI, th => M.RC * Math.cos(th), th => M.RC * Math.sin(th), 0, 2 * Math.PI, { pal: 'blue' });
  const gBX = asm('bMeet', root, { title: 'Where they meet', sub: '2 + 2 cos θ = 3 at θ = ±π/3' });
  for (const s of [1, -1]) putAt(BB, dot(gBX, { r: 0.11, name: 'Intersection' }), M.PX(s * M.THT), M.PY(s * M.THT), 0.08);
  const gBR = asm('bRegion', root, { title: 'The region', sub: `½∫(R² − r²) dθ = ${M.AB.toFixed(3)}` });
  const bReg = polarRegion(BB, gBR, { pal: 'red', opacity: 0.32 });
  const bIn = rod(gBR, { pal: 'blue', r: 0.02, name: 'Inner radius r' }), bOut = rod(gBR, { pal: 'red', r: 0.04, name: 'Outer part, R − r' });
  labels.push(...BB.tickLabels(),
    { cls: 'mark', html: 'θ = π/3', at: () => BB.P(M.PX(M.THT), M.PY(M.THT)).add(V(0.15, 0.35, 0)) },
    { cls: 'mark', html: 'θ = −π/3', at: () => BB.P(M.PX(-M.THT), M.PY(-M.THT)).add(V(0.15, -0.35, 0)) },
    { cls: 'vec blue', html: '<i>r</i> = 3', at: () => BB.P(-2.3, 2.45) },
    { cls: 'vec', html: '<i>R</i> = 2 + 2 cos θ', at: () => BB.P(3.2, -2.7) });

  return {
    labels,
    update(s) {
      // lift
      { const t = s.lift, p = BL.P(M.X(t), M.Y(t), 0.06), q = BL.P(M.X(t), M.Y(t), zl(t));
        pDot.position.copy(p); pHi.position.copy(q); setRod(pDrop, p, q); }
      // slope
      { const t = sv.t = s.slope, x = M.X(t), y = M.Y(t);
        putAt(BS, sDot, x, y, 0.08); setTangent(BS, sTan, x, y, M.DX(t), M.DY(t), 1.4);
        setVec(BS, sRun, x, y, M.DX(t), 0, VS); setVec(BS, sRise, x + M.DX(t) * VS, y, 0, M.DY(t), VS); }
      // concave
      { const t = s.concave, x = M.X(t), y = M.Y(t);
        putAt(BC, cDot, x, y, 0.08); setTangent(BC, cTan, x, y, M.DX(t), M.DY(t), 1.1); }
      // arc
      { const n = s.arc, ts = M.chords(n);
        aRods.forEach((m, i) => { if (i < n) setRod(m, BA.P(M.X(ts[i]), M.Y(ts[i]), 0.07), BA.P(M.X(ts[i + 1]), M.Y(ts[i + 1]), 0.07)); else m.visible = false; });
        aDots.forEach((d, i) => { d.visible = i <= n; if (d.visible) putAt(BA, d, M.X(ts[i]), M.Y(ts[i]), 0.08); }); }
      // vec
      { const t = vv.t = s.vec, x = M.X(t), y = M.Y(t);
        putAt(BV, vDot, x, y, 0.08);
        setArrow(vPos, BV.P(0, 0, 0.05), BV.P(x, y, 0.05).sub(BV.P(0, 0, 0.05)).multiplyScalar(Math.max(0, 1 - 0.11 / Math.max(Math.hypot(x, y), 1e-6))));
        setVec(BV, vVel, x, y, M.DX(t), M.DY(t), VS); setVec(BV, vAcc, x, y, M.D2X(), M.D2Y(t), AS); }
      // integ: k whole steps, the next one growing
      { const k = s.integ, whole = Math.floor(k), pts = M.sumPath(Math.min(whole + 1, M.STEPS)), dt = M.CT1 / M.STEPS;
        iArr.forEach((a, i) => {
          if (i > whole || i >= M.STEPS) { a.visible = false; return; }
          const frac = i < whole ? 1 : k - whole, [x, y] = pts[i], tm = (i + 0.5) * dt;
          setVec(BI, a, x, y, M.CVX(tm) * dt * frac, M.CVY(tm) * dt * frac, 1, 0.09);
        }); }
      // wheel
      { const t = wv.t = s.wheel, x = M.CX(t), y = M.CY(t);
        wheel.position.copy(BW.P(t, 1, WZ)); wheel.rotation.z = -t;
        wTrace.set(M.CX, M.CY, 0, t); putAt(BW, wDot, x, y, WZ + 0.06);
        setVec(BW, wVel, x, y, M.CVX(t), M.CVY(t), WV, WZ + 0.12); setVec(BW, wAcc, x, y, M.CAX(t), M.CAY(t), WV * 0.75, WZ + 0.14); }
      // polar
      { const th = s.polar, x = M.PX(th), y = M.PY(th);
        pTrace.set(M.PX, M.PY, 0, th); setRod(pRay, BP.P(0, 0, 0.05), BP.P(x, y, 0.05)); putAt(BP, plDot, x, y, 0.08);
        gTrace.set(u => u, M.R, 0, th); setRod(gBar, BG.P(th, 0, 0.05), BG.P(th, M.R(th), 0.05)); putAt(BG, gDot, th, M.R(th), 0.08); }
      // pslope
      { const th = qv.th = s.pslope, x = M.PX(th), y = M.PY(th);
        putAt(BQ, qDot, x, y, 0.08); setTangent(BQ, qTan, x, y, M.DXT(th), M.DYT(th), 1.4);
        setRod(qRay, BQ.P(0, 0, 0.04), BQ.P(x, y, 0.04));
        setVec(BQ, qDr, x, y, Math.cos(th) * M.DR(th), Math.sin(th) * M.DR(th), 0.35, 0.1); }
      // parea
      wedgeSets.forEach((g, i) => { g.visible = i === s.parea; });
      // between
      { const th = s.between, R = M.R(th);
        bReg.set(() => M.RC, M.R, -M.THT, th);
        setRod(bIn, BB.P(0, 0, 0.05), BB.P(M.RC * Math.cos(th), M.RC * Math.sin(th), 0.05));
        setRod(bOut, BB.P(M.RC * Math.cos(th), M.RC * Math.sin(th), 0.06), BB.P(R * Math.cos(th), R * Math.sin(th), 0.06)); }
    },
  };
}
