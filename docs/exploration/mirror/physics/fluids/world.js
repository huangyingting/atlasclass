// The figure: nine simple scenes along x, one per page. Water is translucent blue with an outline;
// pressure is black arrows normal to a surface, forces are black arrows, velocity is blue, and moving
// water is drawn as dots carried along by the flow. Metres, y up. Every number comes from model.js.
// Premium: built from the numbers in force (model.setParams). An arrow that a question's numbers would make
// too long is drawn to a smaller scale (k < 1), so the camera framing still holds; the number a question asks
// for shows as ? (model.asked); setMarks() draws a question's marks (lines, spans, arrows, ghosts of an answer).
import * as THREE from 'three';
import { part, box, cyl, lines, arrow, setArrow, shadeMat, xAxis, V } from '../engine/parts.js';
import * as M from './model.js';

export const STATIONS = { density: 0, pressure: 6, depth: 22, pascal: 40, buoy: 48, float: 56, continuity: 66, bernoulli: 77, torricelli: 90 };
// arrow scales, stated on each page
export const SC = {
  shoeP: 0.022 / 1000,      // m per Pa: 2.2 cm per kPa
  lakeP: 0.012 / 1000,      // 1.2 cm per kPa
  pascalP: 0.10 / 1000,     // 10 cm per kPa
  buoyP: 0.02 / 1000,       // 2 cm per kPa
  buoyF: 0.0006,            // 0.6 mm per N
  floatF: 0.0004,           // 0.4 mm per N
  flowV: 0.4,               // 40 cm per m/s
  bernP: 0.016 / 1000,      // 1.6 cm per kPa
  bernV: 0.1,               // 10 cm per m/s
  bar: 0.05 / 1000,         // 5 cm per kPa
  jetV: 0.15,               // 15 cm per m/s
};
export const PY6 = 0.7, PY7 = 0.6;          // pipe centre heights

// a small deterministic random stream, so the water dots are the same every visit
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const label = (cls, html, at, text) => labels.push({ cls, html, at, text });

  // faint graph-paper ground
  const grid = [];
  for (let x = -3; x <= 96; x++) grid.push(x, 0.001, -3, x, 0.001, 3);
  for (let z = -3; z <= 3; z++) grid.push(-3, 0.001, z, 96, 0.001, z);
  lines(root, grid, '#e6e6e2');

  // ---------- helpers ----------
  const edgeMat = new THREE.LineBasicMaterial({ color: '#7d9bd0' });
  const glassMat = new THREE.LineBasicMaterial({ color: '#a4a4aa' });
  function water(parent, w, h, d, pos, opacity = 0.2) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), shadeMat('blue', { opacity }));
    m.position.set(...pos); m.userData = { noEdge: true }; parent.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry), edgeMat); e.userData = { noEdge: true }; m.add(e);
    return m;
  }
  const outline = (parent, geo, pos, mat = glassMat) => { const e = new THREE.LineSegments(new THREE.EdgesGeometry(geo), mat); e.userData = { noEdge: true }; e.position.set(...pos); parent.add(e); return e; };
  const force = (parent, pal = 'ink', name = 'Forces', s = 1) => arrow(parent, pal, { r: 0.022 * s, head: 0.12 * s, headR: 0.06 * s, name });
  const small = (parent, pal = 'ink', name = 'Pressure', s = 1) => arrow(parent, pal, { r: 0.007 * s, head: 0.045 * s, headR: 0.022 * s, name, tone: 'hi' });
  const tip = (a, off = 0.1) => a.visible ? a.localToWorld(V(0, a.userData.arrow.shaft.scale.y + a.userData.arrow.head + off, 0)) : null;
  const thinRod = (parent, r = 0.006, pal = 'ink', name = 'String') => part(parent, cyl(r, 1, 8), { tone: 'hi', pal, name });
  const rodTo = (m, a, b) => { m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(1, Math.max(a.distanceTo(b), 1e-4), 1); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); };
  const ex = g => Math.max(g.userData.explode, 0);
  const M4 = new THREE.Matrix4();
  function dots(parent, n, pal, r) {
    const m = new THREE.InstancedMesh(new THREE.SphereGeometry(r, 10, 7), shadeMat(pal), n);
    m.userData.noEdge = true; m.frustumCulled = false; m.count = 0; parent.add(m);
    let k = 0;
    return { begin() { k = 0; }, put(x, y, z) { if (k < n) { M4.makeTranslation(x, y, z); m.setMatrixAt(k++, M4); } }, end() { m.count = k; m.instanceMatrix.needsUpdate = true; } };
  }
  // a pipe drawn from its model table: rings across the centre line
  function tubeGeo(P, scale = 1, nS = 220, nT = 40) {
    const pos = [], nor = [], idx = [];
    for (let i = 0; i <= nS; i++) {
      const p = P.atS(P.len * i / nS), t = Math.hypot(p.tx, p.ty), nx = -p.ty / t, ny = p.tx / t;
      for (let j = 0; j <= nT; j++) {
        const th = 2 * Math.PI * j / nT, c = Math.cos(th), s = Math.sin(th), r = p.r * scale;
        pos.push(p.x + nx * c * r, p.y + ny * c * r, s * r); nor.push(nx * c, ny * c, s);
      }
    }
    for (let i = 0; i < nS; i++) for (let j = 0; j < nT; j++) { const a = i * (nT + 1) + j, b = a + nT + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx);
    return g;
  }
  // where a water dot is: volume coordinate → arc length → a point across the pipe
  const inPipe = (P, vol, rf, th) => { const p = P.atS(P.sOfVol(vol)), t = Math.hypot(p.tx, p.ty), r = rf * p.r;
    return [p.x - p.ty / t * Math.cos(th) * r, p.y + p.tx / t * Math.cos(th) * r, Math.sin(th) * r]; };

  // =====================================================================================
  // 0 · density: five 10 cm cubes
  const X0 = STATIONS.density, S = M.CUBE;
  part(root, box(1.3, 0.02, 0.42, 0.005), { tone: 'lo', pal: 'board', pos: [X0, 0.01, 0], name: 'Table' });
  const g0 = asm('blocks', root, { title: 'Five cubes, one size', sub: 'same volume, different mass' });
  g0.userData.focus = () => ({ target: [X0, 0.1, 0], radius: 0.55 }); g0.userData.minDist = 1;
  const cubeMat = { cork: shadeMat('base'), ice: shadeMat('paper', { opacity: 0.35 }), water: shadeMat('blue', { opacity: 0.45 }), al: shadeMat('paper'), iron: shadeMat('dark') };
  const wholes = [], pieces = [];
  M.MATERIALS.forEach((m, i) => {
    const x = X0 + (i - 2) * 0.24, y = 0.02 + S / 2;
    wholes.push(part(g0, box(S, S, S, 0.006), { tone: 'hi', name: m.name, mat: cubeMat[m.key], pos: [x, y, 0] }));
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1])
      pieces.push(part(g0, box(S / 2, S / 2, S / 2, 0.004), { tone: 'hi', name: m.name, mat: cubeMat[m.key], pos: [x + sx * S / 4, y + sy * S / 4, sz * S / 4], ex: [sx * 0.03, sy * 0.03 + 0.03, sz * 0.03] }));
    label('mark', m.name, () => V(x, 0.02 + S + 0.06 + 0.06 * ex(g0), 0));
    label('mark', M.asked(`mass.${m.key}`, `${m.mass.toFixed(2)} kg`), () => V(x, -0.02, 0.24));
  });

  // =====================================================================================
  // 1 · pressure: the same person in shoes and on snowshoes
  const X1 = STATIONS.pressure, TOP = 0.4;
  part(root, box(2.8, TOP, 1.5, 0.02), { tone: 'lo', pos: [X1, TOP / 2, 0.05], name: 'Snow', mat: shadeMat('paper', { opacity: 0.55 }) });
  const g1 = asm('feet', root, { title: 'Shoes and snowshoes', sub: 'same weight, spread over more area' });
  g1.userData.focus = () => ({ target: [X1, 1.3, 0], radius: 1.75 });
  const pArrows = [], kP1 = SC.shoeP * Math.min(1, 0.36 / (M.P_SHOE * SC.shoeP));   // m per Pa, as drawn
  const feet = {};                                           // the foot on the snow, for marks
  function person(xc, snowshoe) {
    const lift = [0, 0.55, 0], sp = snowshoe ? 0.17 : 0.13, base = TOP + (snowshoe ? 0.02 : 0);
    const P = snowshoe ? M.P_SNOW : M.P_SHOE, sole = snowshoe ? M.SNOWSHOE : M.SHOE;
    const body = (geo, pal, pos, name) => part(g1, geo, { tone: 'hi', pal, pos, name, ex: lift });
    for (const s of [-1, 1]) {
      const fx = xc + s * sp, up = M.FEET === 1 && s < 0 ? 0.15 : 0;   // standing on one foot: the left one lifted
      if (snowshoe) body(box(sole.w, 0.02, sole.l, 0.008), 'dark', [fx, TOP + 0.01 + up, 0.06], 'Snowshoes');
      body(box(0.1, 0.07, 0.25, 0.02), 'ink', [fx, base + 0.035 + up, 0.06], 'Shoes');
      body(cyl(0.055, 0.82, 20), 'paper', [fx, base + 0.07 + 0.41 + up, 0], 'Body');
      if (up) continue;
      feet[snowshoe ? 'snow' : 'shoe'] = { x: fx, sole };
      // the contact patch on the snow
      part(g1, box(sole.w, 0.004, sole.l, 0.001), { tone: 'lo', name: 'Contact area', mat: shadeMat('dark', { opacity: 0.45 }), pos: [fx, TOP + 0.002, 0.06] });
      // one arrow per 125 cm² of contact, as long as the pressure is high
      const nx = snowshoe ? 2 : 1, nz = snowshoe ? 8 : 2;
      for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
        const a = small(g1, 'ink', 'Pressure', 1.1), at = V(fx + (i + 0.5 - nx / 2) * sole.w / nx, TOP, 0.06 + (k + 0.5 - nz / 2) * sole.l / nz);
        pArrows.push([a, at, P]);
      }
    }
    body(box(0.4, 0.62, 0.22, 0.06), 'paper', [xc, base + 0.89 + 0.31, 0], 'Body');
    body(new THREE.SphereGeometry(0.11, 24, 16), 'paper', [xc, base + 1.66, 0], 'Body');
    for (const s of [-1, 1]) body(cyl(0.042, 0.6, 16), 'paper', [xc + s * 0.25, base + 1.17, 0], 'Body');
    label('mark', `${snowshoe ? 'snowshoes' : 'shoes'} · ${M.asked(snowshoe ? 'P.snow' : 'P.shoe', `${(P / 1000).toFixed(1)} kPa`)}`, () => V(xc, base + 2.0 + 0.55 * ex(g1), 0));
  }
  person(X1 - 0.65, false); person(X1 + 0.65, true);

  // =====================================================================================
  // 2 · pressure with depth: a diver in a lake
  const X2 = STATIONS.depth, D = M.LAKE.depth;
  water(root, 5, D, 2.4, [X2, D / 2, 0], 0.15);
  water(root, 5, 0.02, 2.4, [X2, D, 0], 0.3);
  const ticks = []; for (let d = 0; d <= D; d += 2) { ticks.push(X2 - 2.5, D - d, 1.2, X2 - 2.75, D - d, 1.2); label('tick', `${d} m`, () => V(X2 - 2.82, D - d, 1.2)); }
  lines(root, ticks, '#6c6c72');
  const g2 = asm('diver', root, { title: 'A diver going down', sub: 'the deeper, the more water above' });
  const diver = new THREE.Group(); g2.add(diver);
  const dv = (geo, pal, pos, name = 'Diver') => part(diver, geo, { tone: 'hi', pal, pos, name });
  dv(box(0.42, 0.7, 0.26, 0.08), 'paper', [0, 0, 0]);
  dv(new THREE.SphereGeometry(0.13, 24, 16), 'paper', [0, 0.5, 0]);
  dv(box(0.2, 0.08, 0.06, 0.02), 'ink', [0, 0.52, 0.12], 'Mask');
  dv(cyl(0.1, 0.6, 20), 'dark', [0, 0.05, -0.22], 'Air tank');
  for (const s of [-1, 1]) {
    dv(cyl(0.07, 0.75, 16), 'paper', [s * 0.11, -0.72, 0]);
    dv(box(0.16, 0.36, 0.04, 0.015), 'ink', [s * 0.11, -1.25, 0.02], 'Fins');
    dv(cyl(0.05, 0.62, 16), 'paper', [s * 0.27, -0.02, 0]);
  }
  const TOPD = 0.63, BOTD = 1.43, SIDE = 0.34;            // head top, fin tips, side reach from the chest
  const dPress = { top: small(g2, 'ink', 'Pressure', 3.5), bot: small(g2, 'ink', 'Pressure', 3.5), l: small(g2, 'ink', 'Pressure', 3.5), r: small(g2, 'ink', 'Pressure', 3.5) };
  const atm = [-1.8, -0.6, 0.6, 1.8].map(() => small(root, 'ink', 'Pressure', 3.5));
  label('vec', '<i>P</i><sub>0</sub>', () => V(X2 + 2.2, D + 0.75, 0));
  label('vec', '', () => V(X2 - 0.6 - SIDE - M.pAt(diveNow) * SC.lakeP / 2, D - diveNow + 0.75, 0), () => `<i>P</i> = ${M.asked('P', `${(M.pAt(diveNow) / 1000).toFixed(0)} kPa`)}`);
  const hBar = thinRod(g2, 0.012, 'ink', 'Depth h');
  label('vec', '', () => V(X2 + 3.3, D - diveNow / 2, 0), () => `<i>h</i> = ${diveNow.toFixed(1)} m`);
  // opened: the column of water above the diver, 1 m² across
  const column = water(g2, 1, 1, 1, [X2, 0, 0], 0.32);
  let diveNow = 1;

  // =====================================================================================
  // 3 · Pascal: two pistons on one sealed column of water
  const X3 = STATIONS.pascal, PA = M.PASCAL, LX = X3 - 0.75, RX = X3 + 0.35, W0 = 0.9, YB = 0.05, TUBE = 0.06;
  const g3 = asm('pascal', root, { title: 'Two pistons, one column of water', sub: 'the push spreads to every part' });
  g3.userData.focus = () => ({ target: [X3 - 0.2, 1.05, 0], radius: 1.35 });
  const wallMat = shadeMat('paper', { opacity: 0.22 });
  for (const [x, r] of [[LX, PA.r1], [RX, PA.r2]]) {
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.012, r + 0.012, 1.35, 48, 1, true), wallMat); wall.position.set(x, YB + 0.675, 0); wall.userData = { noEdge: true }; root.add(wall);
    outline(root, new THREE.CircleGeometry(r + 0.012, 48).rotateX(-Math.PI / 2), [x, YB + 1.35, 0]);
    part(root, cyl(r + 0.012, 0.02, 48), { tone: 'mid', pal: 'paper', pos: [x, YB - 0.01, 0], name: 'Bottom' });
  }
  const tubeLen = RX - LX;
  const tubeW = new THREE.Mesh(xAxis(new THREE.CylinderGeometry(TUBE + 0.01, TUBE + 0.01, tubeLen, 32, 1, true)), wallMat); tubeW.position.set((LX + RX) / 2, YB + TUBE, 0); tubeW.userData = { noEdge: true }; root.add(tubeW);
  const tubeWater = new THREE.Mesh(xAxis(new THREE.CylinderGeometry(TUBE, TUBE, tubeLen, 32)), shadeMat('blue', { opacity: 0.3 })); tubeWater.position.set((LX + RX) / 2, YB + TUBE, 0); tubeWater.userData = { noEdge: true }; root.add(tubeWater);
  const colL = new THREE.Mesh(new THREE.CylinderGeometry(PA.r1, PA.r1, 1, 32).translate(0, 0.5, 0), shadeMat('blue', { opacity: 0.3 })); colL.position.set(LX, YB, 0); colL.userData = { noEdge: true }; root.add(colL);
  const colR = new THREE.Mesh(new THREE.CylinderGeometry(PA.r2, PA.r2, 1, 48).translate(0, 0.5, 0), shadeMat('blue', { opacity: 0.3 })); colR.position.set(RX, YB, 0); colR.userData = { noEdge: true }; root.add(colR);
  const pistL = part(g3, cyl(PA.r1, 0.04, 32), { tone: 'hi', name: 'Small piston' });
  const pistR = part(g3, cyl(PA.r2, 0.04, 48), { tone: 'hi', name: 'Large piston' });
  const load = part(g3, box(0.46, 0.3, 0.46, 0.03), { tone: 'hi', pal: 'dark', name: 'Load' });
  const F1a = force(g3, 'ink', 'Push', 0.6);
  label('vec', `<i>F</i><sub>1</sub> = ${M.asked('F1', `${PA.F1} N`)}`, () => V(LX, pistL.position.y + 0.42, 0));
  label('mark', M.asked('F2', `${PA.load.toFixed(1)} kg · ${PA.F2.toFixed(0)} N`), () => V(RX, load.position.y + 0.3, 0));
  const under = [small(g3, 'ink', 'Pressure', 1.15)], kP3 = SC.pascalP * Math.min(1, 0.3 / (PA.dP * SC.pascalP));
  const aG = Math.sqrt(PA.A1), nG = Math.round(PA.r2 / PA.r1);   // one arrow per A1 of piston face
  for (let i = 0; i < nG; i++) for (let k = 0; k < nG; k++) under.push(small(g3, 'ink', 'Pressure', 1.15));
  const underAt = [[0, 0]]; for (let i = 0; i < nG; i++) for (let k = 0; k < nG; k++) underAt.push([(i - (nG - 1) / 2) * aG, (k - (nG - 1) / 2) * aG]);
  label('tick', '<i>A</i><sub>1</sub>', () => V(LX - PA.r1 - 0.04, pistL.position.y, 0));
  label('tick', `<i>A</i><sub>2</sub> = ${(PA.A2 / PA.A1).toFixed(0)} <i>A</i><sub>1</sub>`, () => V(RX + PA.r2 + 0.5, pistR.position.y, 0));
  // opened: the same extra pressure on every wall
  const walls = Array.from({ length: 10 }, () => small(g3, 'ink', 'Pressure', 1.15));

  // =====================================================================================
  // 4 · buoyancy: an aluminium cube lowered into a tank
  const X4 = STATIONS.buoy, B = M.BUOY, BS = B.s;
  part(root, box(B.tankW + 0.04, 0.02, B.tankD + 0.04, 0.005), { tone: 'lo', pal: 'board', pos: [X4, 0.01, 0], name: 'Tank floor' });
  outline(root, new THREE.BoxGeometry(B.tankW, 1.4, B.tankD), [X4, 0.72, 0]);
  const tankWater = water(root, B.tankW, 1, B.tankD, [X4, 0.5, 0], 0.2);
  const g4 = asm('cube', root, { title: 'A cube under water', sub: 'pushed harder from below than above' });
  g4.userData.focus = () => ({ target: [X4, cube.position.y, 0], radius: 0.95 }); g4.userData.minDist = 2;
  const cube = part(g4, box(BS, BS, BS, 0.01), { tone: 'hi', name: B.rho === 2700 ? 'Aluminium cube' : 'Cube' });
  const kF4 = SC.buoyF * Math.min(1, 0.5 / (B.W * SC.buoyF));   // m per N, as drawn
  const str4 = thinRod(g4, 0.005);
  part(g4, new THREE.SphereGeometry(0.03, 16, 10), { tone: 'hi', pal: 'dark', pos: [X4, 2.0, 0], name: 'String' });
  const faces = [V(0, 1, 0), V(0, -1, 0), V(1, 0, 0), V(-1, 0, 0), V(0, 0, 1), V(0, 0, -1)];
  // drawn as a cross-section: three arrows across the middle of the top, bottom and two side faces
  // (the front and back faces get the same pushes as the sides, and cancel the same way)
  const facePts = [];
  for (const n of faces.slice(0, 4)) {
    const u = Math.abs(n.y) > 0.5 ? V(1, 0, 0) : V(0, 1, 0), w = n.clone().cross(u);
    for (let i = -1; i <= 1; i++) for (let k = 0; k <= 0; k++) facePts.push({ n, off: n.clone().multiplyScalar(BS / 2).addScaledVector(u, i * BS / 3).addScaledVector(w, k * BS / 3), a: small(g4) });
  }
  const totals = faces.slice(0, 4).map(() => arrow(g4, 'ink', { r: 0.009, head: 0.05, headR: 0.025, name: 'Face totals' }));
  const W4 = force(g4, 'ink', 'Forces', 0.5), Fb4 = force(g4, 'ink', 'Forces', 0.5), T4 = force(g4, 'ink', 'Forces', 0.5);
  label('vec', '<i>W</i>', () => tip(W4, 0.04)); label('vec', '<i>F</i><sub>b</sub>', () => tip(Fb4, 0.05)); label('vec', '<i>T</i>', () => tip(T4, 0.05));
  label('vec grey', '', () => ex(g4) > 0.5 ? cube.position.clone().add(V(0.32, BS / 2 + 0.08, 0)) : null, () => `${(st4.dTop > 0 ? B.rhoF * M.G * st4.dTop * BS * BS : 0).toFixed(0)} N`);
  label('vec grey', '', () => ex(g4) > 0.5 ? cube.position.clone().add(V(0.32, -BS / 2 - 0.1, 0)) : null, () => `${(B.rhoF * M.G * Math.max(st4.dBot, 0) * BS * BS).toFixed(0)} N`);
  let st4 = M.buoy(B.L0);

  // =====================================================================================
  // 5 · float or sink: a wooden block, ice, a steel ball and a steel ship in a pool
  const X5 = STATIONS.float, PL = M.POOL.L;
  const poolX0 = X5 - 2.1, poolX1 = X5 + 2.4;
  part(root, box(poolX1 - poolX0 + 0.04, 0.02, 1.64, 0.005), { tone: 'lo', pal: 'board', pos: [(poolX0 + poolX1) / 2, 0.01, 0], name: 'Pool floor' });
  water(root, poolX1 - poolX0, PL, 1.6, [(poolX0 + poolX1) / 2, 0.02 + PL / 2, 0], 0.2);
  outline(root, new THREE.BoxGeometry(poolX1 - poolX0, 1.0, 1.6), [(poolX0 + poolX1) / 2, 0.52, 0]);
  const L5 = 0.02 + PL;
  const g5 = asm('float', root, { title: 'Float or sink', sub: 'F_b = W, if it can' });
  g5.userData.focus = () => ({ target: [X5 + 0.15, 0.9, 0], radius: 2.4 });
  const floaters = [];
  const fl = (x, c, mat, name) => {
    const y = L5 - c.draft + c.s / 2;
    part(g5, box(c.s, c.s, c.s, 0.015), { tone: 'hi', mat, pos: [x, y, 0], name });
    // opened: the water it pushed aside, lifted out
    const ghost = new THREE.Mesh(new THREE.BoxGeometry(c.s, c.draft, c.s), shadeMat('blue', { opacity: 0.45 })); ghost.userData = { noEdge: true, home: V(x, L5 - c.draft / 2, 0), ex: V(0, 0.95, 0) }; ghost.position.copy(ghost.userData.home); g5.add(ghost);
    outline(ghost, ghost.geometry, [0, 0, 0], edgeMat);
    floaters.push({ x, y, c, W: c.W, Fb: c.Fb, fbY: L5 - c.draft / 2, ghost });
  };
  fl(X5 - 1.55, M.WOOD, shadeMat('base'), 'Wooden block');
  fl(X5 - 0.75, M.ICE, shadeMat('paper', { opacity: 0.6 }), 'Ice');
  const BX5 = X5 + 0.1, BY5 = 0.02 + M.BALL.r;
  part(g5, new THREE.SphereGeometry(M.BALL.r, 32, 20), { tone: 'hi', pal: 'dark', pos: [BX5, BY5, 0], name: 'Steel ball' });
  const ballGhost = new THREE.Mesh(new THREE.SphereGeometry(M.BALL.r, 32, 20), shadeMat('blue', { opacity: 0.45 })); ballGhost.userData = { noEdge: true, home: V(BX5, BY5, 0), ex: V(0, 1.4, 0) }; g5.add(ballGhost);
  const SH = M.SHIP, SX = X5 + 1.5, sy0 = L5 - SH.draft, T5 = 0.016;   // plate drawn 16 mm thick so it can be seen
  for (const [w, h, d, x, y, z] of [[SH.l, T5, SH.w, 0, T5 / 2, 0], [SH.l, SH.h, T5, 0, SH.h / 2, SH.w / 2 - T5 / 2], [SH.l, SH.h, T5, 0, SH.h / 2, -SH.w / 2 + T5 / 2], [T5, SH.h, SH.w, SH.l / 2 - T5 / 2, SH.h / 2, 0], [T5, SH.h, SH.w, -SH.l / 2 + T5 / 2, SH.h / 2, 0]])
    part(g5, box(w, h, d, 0.004), { tone: 'hi', pal: 'paper', pos: [SX + x, sy0 + y, z], name: 'Steel ship' });
  const shipGhost = new THREE.Mesh(new THREE.BoxGeometry(SH.l, SH.draft, SH.w), shadeMat('blue', { opacity: 0.45 })); shipGhost.userData = { noEdge: true, home: V(SX, L5 - SH.draft / 2, 0), ex: V(0, 1.1, 0) }; g5.add(shipGhost);
  outline(shipGhost, shipGhost.geometry, [0, 0, 0], edgeMat);
  const fArrows = [], kF5 = SC.floatF * Math.min(1, 0.5 / (Math.max(M.BALL.W, SH.W, M.WOOD.W, M.ICE.W) * SC.floatF));   // m per N, as drawn
  const pair = (x, cy, fbY, W, Fb) => { const a = force(g5, 'ink', 'Forces', 0.6), b = force(g5, 'ink', 'Forces', 0.6); fArrows.push([a, V(x + 0.03, cy, 0.0), V(0, -W * kF5, 0)], [b, V(x - 0.03, fbY, 0.0), V(0, Fb * kF5, 0)]); return [a, b]; };
  const fa = floaters.map(f => pair(f.x, f.y, f.fbY, f.W, f.Fb));
  const ballA = pair(BX5, BY5, BY5, M.BALL.W, M.BALL.Fb);
  const ballN = force(g5, 'ink', 'Forces', 0.6); fArrows.push([ballN, V(BX5 + 0.1, 0.02, 0), V(0, M.BALL.N * kF5, 0)]);
  const shipA = pair(SX, sy0 + 0.13, L5 - SH.draft / 2, SH.W, SH.Fb);
  for (const [a, b] of [...fa, ballA, shipA]) { label('vec', '<i>W</i>', () => tip(a, 0.05)); if (b !== ballA[1]) label('vec', '<i>F</i><sub>b</sub>', () => tip(b, 0.05)); }
  label('vec', '<i>F</i><sub>b</sub>', () => V(BX5 - 0.25, BY5 + 0.05, 0));
  label('vec', '<i>F</i><sub>N</sub>', () => tip(ballN, 0.05));
  const pct = x => `${(100 * x).toFixed(0)}% under`;
  label('mark', `wood · ${M.asked('wood', pct(M.WOOD.draft / M.WOOD.s))}`, () => V(X5 - 1.55, L5 + 0.5, 0));
  label('mark', `ice · ${M.asked('ice', pct(M.ICE.draft / M.ICE.s))}`, () => V(X5 - 0.75, L5 + 0.5, 0));
  label('mark', 'steel ball · sinks', () => V(BX5, L5 + 0.5, 0));
  label('mark', 'steel ship · floats', () => V(SX, L5 + 0.5, 0));

  // =====================================================================================
  // 6 · continuity: a pipe that narrows
  const X6 = STATIONS.continuity, P1 = M.PIPE1, F = M.FLOW;
  const g6 = asm('pipe', root, { title: 'A pipe that narrows', sub: 'what goes in must come out' });
  g6.userData.focus = () => ({ target: [X6, PY6 + 0.5, 0], radius: 2.8 });
  const pipe6 = new THREE.Group(); pipe6.position.set(X6, PY6, 0); g6.add(pipe6);
  part(pipe6, tubeGeo(P1), { tone: 'mid', name: 'Pipe', mat: shadeMat('paper', { opacity: 0.2 }) });
  const fill6 = new THREE.Mesh(tubeGeo(P1, 0.985), shadeMat('blue', { opacity: 0.1 })); fill6.userData = { noEdge: true }; pipe6.add(fill6);
  const rnd6 = rng(6), N6 = 650, HI6 = 70;
  const parts6 = Array.from({ length: N6 }, (_, k) => ({ u: k < HI6 ? 0.08 * k / HI6 : 0.08 + 0.92 * rnd6(), rf: 0.88 * Math.sqrt(rnd6()), th: 2 * Math.PI * rnd6() }));
  const dots6 = dots(pipe6, N6 - HI6, 'blue', 0.016), hot6 = dots(pipe6, HI6, 'ink', 0.018);
  const v6a = force(g6, 'blue', 'Velocity', 0.7), v6b = force(g6, 'blue', 'Velocity', 0.7), kV6 = SC.flowV * Math.min(1, 1.0 / (F.v2 * SC.flowV));
  label('vec blue', '<i>v</i><sub>1</sub>', () => tip(v6a, 0.06)); label('vec blue', '<i>v</i><sub>2</sub>', () => tip(v6b, 0.06));
  const discs6 = [[-1.8, F.r1, 'A₁'], [1.8, F.r2, 'A₂']].map(([x, r, name]) => {
    const d = part(g6, xAxis(cyl(r * 0.99, 0.01, 48)), { tone: 'hi', name: 'Cross-sections', mat: shadeMat('dark', { opacity: 0.55 }), pos: [X6 + x, PY6, 0], ex: [0, 1.0, 0] });
    label('vec', `<i>A</i><sub>${name[1]}</sub>`, () => ex(g6) > 0.3 ? V(d.position.x - r - 0.15, d.position.y, d.position.z) : null);
    return d;
  });
  let slab6 = 0;
  const showDiscs = () => discs6.forEach(d => { d.visible = ex(g6) > 0.02; d.rotation.y = ex(g6) * Math.PI / 2; });

  // =====================================================================================
  // 7 · Bernoulli: narrow, then up
  const X7 = STATIONS.bernoulli, P2 = M.PIPE2, BE = M.BERN;
  const g7 = asm('bernoulli', root, { title: 'Bernoulli’s pipe', sub: 'P + ½ρv² + ρgy, the same all along' });
  g7.userData.focus = () => ({ target: [X7 + 0.8, PY7 + 0.9, -0.6], radius: 4.2 });
  const pipe7 = new THREE.Group(); pipe7.position.set(X7, PY7, 0); g7.add(pipe7);
  part(pipe7, tubeGeo(P2, 1, 320), { tone: 'mid', name: 'Pipe', mat: shadeMat('paper', { opacity: 0.2 }) });
  const fill7 = new THREE.Mesh(tubeGeo(P2, 0.985, 320), shadeMat('blue', { opacity: 0.1 })); fill7.userData = { noEdge: true }; pipe7.add(fill7);
  const rnd7 = rng(7), N7 = 900;
  const parts7 = Array.from({ length: N7 }, () => ({ u: rnd7(), rf: 0.88 * Math.sqrt(rnd7()), th: 2 * Math.PI * rnd7() }));
  const dots7 = dots(pipe7, N7, 'blue', 0.016);
  const bArrows = [], kP7 = SC.bernP * Math.min(1, 1.0 / (Math.max(...BE.pts.map(p => Math.abs(p.P))) * SC.bernP)),
    kV7 = SC.bernV * Math.min(1, 1.0 / (Math.max(...BE.pts.map(p => p.v)) * SC.bernV)), kBar = SC.bar * Math.min(1, 3.2 / (BE.E * SC.bar));   // as drawn
  BE.pts.forEach((p, k) => {
    const c = V(X7 + p.x, PY7 + p.y, 0);
    const out = [V(0, 1, 0), V(0, -1, 0)].map(n => { const a = small(g7, 'ink', 'Pressure', 2.2); setArrow(a, c.clone().addScaledVector(n, p.r), n.clone().multiplyScalar(p.P * kP7)); return a; });
    const va = force(g7, 'blue', 'Velocity', 0.8); setArrow(va, c.clone().add(V(-p.v * kV7 / 2, 0, 0)), V(p.v * kV7, 0, 0));
    bArrows.push(out);
    label('mark', `${k + 1}`, () => V(c.x, c.y + p.r + p.P * kP7 + 0.16, 0));
    label('tick', M.asked(`P${k + 1}`, `${(p.P / 1000).toFixed(0)} kPa`), () => V(c.x - 0.06, c.y - p.r - p.P * kP7 - 0.1, 0));
  });
  // opened: the energy per volume as three stacked bars behind each point
  const barGeo = box(0.32, 1, 0.32, 0.006).translate(0, 0.5, 0);
  const bars7 = BE.pts.map(p => {
    const bx = X7 + p.x, bz = -1.2;
    const seg = [['paper', p.P, 'Pressure P'], ['blue', p.K, 'Kinetic ½ρv²'], ['dark', p.U, 'Potential ρgy']].map(([pal, val, name]) => ({ m: part(g7, barGeo, { tone: 'hi', pal, pos: [bx, 0.02, bz], name }), val }));
    return seg;
  });
  label('tick', '', () => ex(g7) > 0.5 ? V(X7 + BE.pts[0].x - 0.2, 0.02 + BE.E * kBar, -1.2) : null, () => `${(BE.E / 1000).toFixed(0)} kPa`);

  // =====================================================================================
  // 8 · Torricelli: a tank on a block, draining through a hole
  const X8 = STATIONS.torricelli, TK = M.TANK, TX = X8 - 0.9, HOLE_X = TX + TK.w / 2;
  part(root, box(1.2, TK.base, 0.8, 0.02), { tone: 'mid', pal: 'paper', pos: [TX, TK.base / 2, 0], name: 'Block' });
  const g8 = asm('tank', root, { title: 'A draining tank', sub: 'v = √(2gh), then a projectile' });
  g8.userData.focus = () => ({ target: [X8 + 0.1, 1.1, 0], radius: 1.9 });
  part(g8, box(TK.w + 0.03, 0.02, TK.d + 0.03, 0.005), { tone: 'hi', pal: 'paper', pos: [TX, TK.base + 0.01, 0], name: 'Tank' });
  for (const [w, d, x, z] of [[TK.w, 0.012, 0, TK.d / 2], [TK.w, 0.012, 0, -TK.d / 2], [0.012, TK.d, -TK.w / 2, 0], [0.012, TK.d, TK.w / 2, 0]]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.6, d), wallMat); m.position.set(TX + x, TK.base + 0.8, z); m.userData = { noEdge: true }; root.add(m);
  }
  outline(root, new THREE.BoxGeometry(TK.w, 1.6, TK.d), [TX, TK.base + 0.8, 0]);
  const tankW8 = water(root, TK.w - 0.01, 1, TK.d - 0.01, [TX, 0, 0], 0.22);
  part(g8, xAxis(cyl(Math.sqrt(TK.a / Math.PI), 0.016, 24)), { tone: 'hi', pal: 'ink', pos: [HOLE_X + 0.002, TK.yh, 0], name: 'Hole' });
  const N8 = 90, dots8 = dots(root, N8, 'blue', 0.02), DT8 = 0.016;
  const v8 = force(g8, 'blue', 'Velocity', 0.6);
  label('vec blue', '', () => tip(v8, 0.12), () => `<i>v</i> = ${M.asked('v', `${M.torricelli(h8).toFixed(2)} m/s`)}`);
  const hRod = thinRod(g8, 0.008, 'ink', 'Height h');
  label('vec', '', () => V(TX - TK.w / 2 + 0.38, TK.yh + h8 / 2, TK.d / 2), () => `<i>h</i> = ${h8.toFixed(2)} m`);
  const landMark = part(g8, cyl(0.06, 0.006, 24), { tone: 'hi', pal: 'ink', name: 'Landing point' });
  label('tick', '', () => V(landMark.position.x + 0.5, 0.12, 0.3), () => `range ${M.asked('range', `${M.jetRange(h8).toFixed(2)} m`)}`);
  // opened: the jet's velocity split, on one drop of water
  const vx8 = arrow(g8, 'dark', { r: 0.014, head: 0.08, headR: 0.04, name: 'Components', tone: 'mid' }), vy8 = arrow(g8, 'dark', { r: 0.014, head: 0.08, headR: 0.04, name: 'Components', tone: 'mid' }), vv8 = force(g8, 'blue', 'Velocity', 0.6);
  label('vec grey', '<i>v</i><sub>x</sub>', () => ex(g8) > 0.5 ? tip(vx8, 0.06) : null); label('vec grey', '<i>v</i><sub>y</sub>', () => ex(g8) > 0.5 ? tip(vy8, 0.06) : null);
  const traj = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineDashedMaterial({ color: '#8a8a8f', dashSize: 0.05, gapSize: 0.04 })); traj.userData = { noEdge: true }; traj.frustumCulled = false; root.add(traj);
  let h8 = TK.h0;

  // =====================================================================================
  function update(clock) {
    // 1 · pressure arrows, fixed
    for (const [a, at, P] of pArrows) setArrow(a, at, V(0, -P * kP1, 0));   // the push on the snow, from its surface down

    // 0 · density: opened, each cube comes apart into eight
    { const open = ex(g0) > 0.02; wholes.forEach(m => { m.visible = !open; }); pieces.forEach(m => { m.visible = open; }); }

    // 2 · the diver
    { const d = M.diveDepth(clock); diveNow = d;
      const c = V(X2 - 0.6, D - d, 0); diver.position.copy(c);
      const L = (dd, n, at) => { const len = M.pAt(dd) * SC.lakeP; return [at.clone().addScaledVector(n, -len), n.clone().multiplyScalar(len)]; };
      setArrow(dPress.top, ...L(d - TOPD, V(0, -1, 0), c.clone().add(V(0, TOPD, 0))));
      setArrow(dPress.bot, ...L(d + BOTD, V(0, 1, 0), c.clone().add(V(0, -BOTD, 0))));
      setArrow(dPress.l, ...L(d, V(1, 0, 0), c.clone().add(V(-SIDE, 0, 0))));
      setArrow(dPress.r, ...L(d, V(-1, 0, 0), c.clone().add(V(SIDE, 0, 0))));
      atm.forEach((a, k) => setArrow(a, V(X2 + [-1.8, -0.6, 0.6, 1.8][k], D + M.P0 * SC.lakeP, 0), V(0, -M.P0 * SC.lakeP, 0)));
      rodTo(hBar, V(X2 + 2.2, D, 0), V(X2 + 2.2, D - d, 0));
      const e = ex(g2), colH = d - TOPD;
      column.visible = e > 0.02 && colH > 0.05;
      column.scale.set(1, Math.max(colH, 0.01), 1); column.position.set(c.x, D - colH / 2, 0); }

    // 3 · Pascal
    { const { d1, d2 } = M.pascal(clock), yL = W0 - d1, yR = W0 + d2;
      colL.scale.y = yL - YB; colR.scale.y = yR - YB;
      pistL.position.set(LX, yL + 0.02, 0); pistR.position.set(RX, yR + 0.02, 0); load.position.set(RX, yR + 0.04 + 0.15, 0);
      setArrow(F1a, V(LX, yL + 0.34, 0), V(0, -0.3, 0));
      const len = PA.dP * kP3;
      under.forEach((a, k) => { const [ox, oz] = underAt[k], x = k ? RX : LX, y = k ? yR : yL; setArrow(a, V(x + ox, y - len, oz), V(0, len, 0)); });
      const e = ex(g3) > 0.3 ? 1 : 0, wy = YB + 0.18;
      const wl = [[LX - PA.r1, wy, 0, -1, 0], [LX + PA.r1, wy + 0.2, 0, 1, 0], [LX - PA.r1, wy + 0.4, 0, -1, 0], [LX + PA.r1, wy + 0.6, 0, 1, 0],
        [RX - PA.r2, wy, 0, -1, 0], [RX + PA.r2, wy + 0.2, 0, 1, 0], [RX - PA.r2, wy + 0.4, 0, -1, 0], [RX + PA.r2, wy + 0.6, 0, 1, 0]];
      walls.forEach((a, k) => {
        if (k < 8) { const [x, y, z, nx, nz] = wl[k]; setArrow(a, V(x, y, z), V(nx * len, 0, nz * len), e); }
        else { const x = LX + (RX - LX) * (k === 8 ? 0.35 : 0.65); setArrow(a, V(x, YB, 0), V(0, -len, 0), e); }
      }); }

    // 4 · buoyancy
    { const s = M.buoy(M.buoyBottom(clock)); st4 = s;
      tankWater.scale.y = s.L; tankWater.position.y = s.L / 2;
      const c = V(X4, s.yb + BS / 2, 0); cube.position.copy(c);
      rodTo(str4, c.clone().add(V(0, BS / 2, 0)), V(X4, 2.0, 0));
      const open = ex(g4) > 0.5;
      for (const p of facePts) {
        const at = c.clone().add(p.off), P = M.gaugeAtY(at.y, s.L), len = P * SC.buoyP;
        setArrow(p.a, at.clone().addScaledVector(p.n, len), p.n.clone().multiplyScalar(-len), open ? 0 : 1);
      }
      // opened: each face's total push, P·A at its centre, drawn at the force scale
      faces.slice(0, 4).forEach((n, k) => {
        const at = c.clone().addScaledVector(n, BS / 2), Ftot = M.gaugeAtY(at.y, s.L) * BS * BS, len = Ftot * kF4;
        setArrow(totals[k], at.clone().addScaledVector(n, len), n.clone().multiplyScalar(-len), open ? 1 : 0);
      });
      const fbd = open ? 0 : 1;
      setArrow(W4, c.clone().add(V(0.05, 0, 0)), V(0, -B.W * kF4, 0), fbd);
      setArrow(Fb4, c.clone().add(V(-0.06, 0, 0)), V(0, s.Fb * kF4, 0), s.Fb > 1 ? fbd : 0);
      setArrow(T4, c.clone().add(V(0, BS / 2, 0)), V(0, s.T * kF4, 0), fbd);
      if (mark4) mark4.position.copy(c); }

    // 5 · floating: forces fixed; opened, the displaced water lifts out
    { for (const [a, at, v] of fArrows) setArrow(a, at, v);
      const e = ex(g5); for (const gh of [...floaters.map(f => f.ghost), ballGhost, shipGhost]) gh.visible = e > 0.02; }

    // 6 · continuity: every dot moves by the same volume Q·t
    { const t = clock, Vt = P1.vol; dots6.begin(); hot6.begin(); 
      parts6.forEach((p, k) => {
        const vol = ((p.u * Vt + F.Q * t) % Vt + Vt) % Vt, [x, y, z] = inPipe(P1, P1.VOL[0] + vol, p.rf, p.th);
        if (k < HI6) hot6.put(x, y, z); else dots6.put(x, y, z);
      });
      dots6.end(); hot6.end(); showDiscs();
      slab6 = P1.sOfVol(((0.04 * Vt + F.Q * t) % Vt + Vt) % Vt);
      setArrow(v6a, V(X6 - 1.8 - F.v1 * kV6 / 2, PY6 + F.r1 + 0.2, 0), V(F.v1 * kV6, 0, 0));
      setArrow(v6b, V(X6 + 1.8 - F.v2 * kV6 / 2, PY6 + F.r2 + 0.2, 0), V(F.v2 * kV6, 0, 0)); }

    // 7 · Bernoulli (shown at half speed)
    { const t = clock * BE.slow, Vt = P2.vol; dots7.begin();
      for (const p of parts7) { const vol = ((p.u * Vt + BE.Q * t) % Vt + Vt) % Vt, [x, y, z] = inPipe(P2, vol, p.rf, p.th); dots7.put(x, y, z); }
      dots7.end();
      const e = ex(g7);
      bars7.forEach(seg => { let y0 = 0.02; for (const { m, val } of seg) { const h = Math.max(val * kBar * e, 0.0005); m.visible = e > 0.02; m.position.y = y0; m.scale.y = h; y0 += h; } }); }

    // 8 · Torricelli: the plug is pulled at t = 0; the jet's front runs out along a parabola
    { const { t } = M.loop(clock, M.TANK.Tdrain); h8 = M.tankH(t);
      const wh = TK.hole + h8; tankW8.scale.y = wh; tankW8.position.y = TK.base + 0.02 + wh / 2 - 0.01;
      dots8.begin();
      const phase = t % DT8;
      for (let k = 0; k < N8 * 4; k++) {
        const age = phase + k * DT8, tau = t - age; if (tau < 0) break;
        const v = M.torricelli(M.tankH(tau)), y = TK.yh - 0.5 * M.G * age * age; if (y < 0.02) break;
        dots8.put(HOLE_X + v * age, y, 0);
      }
      dots8.end();
      const v = M.torricelli(h8);
      setArrow(v8, V(HOLE_X + 0.02, TK.yh, 0.0), V(v * SC.jetV, 0, 0));
      rodTo(hRod, V(TX - TK.w / 2 + 0.1, TK.yh, TK.d / 2), V(TX - TK.w / 2 + 0.1, TK.yh + h8, TK.d / 2));
      landMark.position.set(HOLE_X + M.jetRange(h8), 0.006, 0);
      // the current trajectory, and the split velocity of a drop 0.25 s out
      const e = ex(g8), pts = [];
      for (let i = 0; i <= 40; i++) { const a = M.jetFlight * i / 40; pts.push(V(HOLE_X + v * a, TK.yh - 0.5 * M.G * a * a, 0)); }
      traj.geometry.setFromPoints(pts); traj.computeLineDistances(); traj.visible = e > 0.02;
      const a = 0.25, P = V(HOLE_X + v * a, TK.yh - 0.5 * M.G * a * a, 0), vy = -M.G * a, k = SC.jetV;
      setArrow(vx8, P, V(v * k, 0, 0), e > 0.5 ? 1 : 0); setArrow(vy8, P, V(0, vy * k, 0), e > 0.5 ? 1 : 0); setArrow(vv8, P, V(v * k, vy * k, 0), e > 0.5 ? 1 : 0); }
  }
  // ---------- a question's marks, in physics units (m, kg, N, Pa, m/s); red: the student's wrong number ----------
  // { tag: where, label }           a note beside a thing: a cube's key, 'shoe' | 'snow', 'small' | 'large' | 'load', 'cube',
  //                                 'wood' | 'iceblock' | 'ball' | 'ship', 'wide' | 'narrow', 'p1' … 'p3', 'hole'
  // { depth: d, label }             a line across the lake, d below its surface
  // { pressure: kPa, gauge?, label } the same line, at the depth where the lake's pressure (absolute, or gauge) is that
  // { arrow: where, value, label }  an arrow at the figure's own scale: 'shoe' | 'snow' (kPa, into the snow), 'F1' (N, the push),
  //                                 'T' | 'Fb' (N, on the cube), 'N' (N, the floor on the ball), 'v1' | 'v2' (m/s), 'p1' … 'p3' (kPa), 'jet' (m/s)
  // { span: where, d | cm, label }  a length: 'small' (piston down), 'large' (piston up), 'under' (cube under)
  // { waterline: 'wood' | 'iceblock', pct, label }   where the water would reach on the block with pct % under
  // { land: x, label }              a mark on the floor, x beyond the hole
  // { cube: key, m | L, label }     a cube of that material with mass m (kg) or volume L (litres), in front of it
  let markRoot = null, mark4 = null;
  const GHOST = { arrow: 1.2, span: 0.8, cube: 0.4 };   // m: the most a ghost is drawn (the figure's own arrows reach 1.0 m, cubes 0.33 m)
  const ghostMark = shadeMat('red', { opacity: 0.4 }), plainMark = shadeMat('paper', { opacity: 0.4 });
  const cubeX = key => X0 + (M.MATERIALS.findIndex(m => m.key === key) - 2) * 0.24;
  const blocks = { wood: floaters[0], iceblock: floaters[1] };
  const bAt = k => { const p = BE.pts[k - 1]; return { c: V(X7 + p.x, PY7 + p.y, 0), p }; };
  const footAt = k => { const f = feet[k]; return V(f.x + f.sole.w / 2 + 0.06, TOP, 0.06 + f.sole.l / 2 + 0.06); };
  // world points, or [group, local point] for things on the moving cube
  const TAG = {
    ...Object.fromEntries(M.MATERIALS.map(m => [m.key, () => V(cubeX(m.key), 0.02 + S + 0.17, 0)])),
    shoe: () => footAt('shoe').add(V(0.5, 0.15, 0)), snow: () => footAt('snow').add(V(0.5, 0.15, 0)),   // clear of the pressure arrows
    small: () => V(LX + PA.r1 + 0.06, W0 + 0.3, 0), large: () => V(RX + PA.r2 + 0.08, W0 + 0.3, 0), load: () => V(RX + 0.3, W0 + 0.6, 0),
    cube: () => [V(BS / 2 + 0.3, 0, BS / 2)],
    wood: () => V(blocks.wood.x + M.WOOD.s / 2 + 0.04, L5 + 0.15, M.WOOD.s / 2), iceblock: () => V(blocks.iceblock.x + M.ICE.s / 2 + 0.04, L5 + 0.15, M.ICE.s / 2),
    ball: () => V(BX5 + 0.6, BY5 + 0.1, 0), ship: () => V(SX + 0.5, L5 - SH.draft - 0.1, 0),   // right of the floor's push; under the hull
    wide: () => V(X6 - 1.8, PY6 + F.r1 + 0.6, 0), narrow: () => V(X6 + 1.8, PY6 + F.r2 + 0.6, 0),
    ...Object.fromEntries([1, 2, 3].map(k => [`p${k}`, () => bAt(k).c.add(V(-0.85, bAt(k).p.r + 0.3, 0))])),   // left of the pressure arrows
    hole: () => V(HOLE_X + 0.1, TK.yh + 0.25, 0),
  };
  // arrows: [from, unit direction, metres per unit, on the cube?, label offset from the tip]
  const ARROW = {
    shoe: () => [footAt('shoe'), V(0, -1, 0), kP1 * 1000, false, V(0.4, -0.05, 0)], snow: () => [footAt('snow'), V(0, -1, 0), kP1 * 1000, false, V(0.4, -0.05, 0)],
    F1: v => [V(LX + PA.r1 + 0.1, W0 + 0.04 + v * 0.12 / PA.F1, 0), V(0, -1, 0), 0.12 / PA.F1, false, V(0.28, 0, 0)],   // beside the cylinder, clear of the page's F₁
    T: () => [V(0.07, BS / 2, 0), V(0, 1, 0), kF4, true, V(0.22, 0.05, 0)], Fb: () => [V(-0.12, 0, 0), V(0, 1, 0), kF4, true],
    N: () => [V(BX5 + 0.18, 0.02, 0), V(0, 1, 0), kF5],
    v1: v => [V(X6 - 1.8 - v * kV6 / 2, PY6 + F.r1 + 0.4, 0), V(1, 0, 0), kV6], v2: v => [V(X6 + 1.8 - v * kV6 / 2, PY6 + F.r2 + 0.4, 0), V(1, 0, 0), kV6],
    p1: () => [bAt(1).c.add(V(0.14, bAt(1).p.r, 0)), V(0, 1, 0), kP7 * 1000], p2: () => [bAt(2).c.add(V(0.14, bAt(2).p.r, 0)), V(0, 1, 0), kP7 * 1000],
    p3: () => [bAt(3).c.add(V(0.14, bAt(3).p.r, 0)), V(0, 1, 0), kP7 * 1000],
    jet: () => [V(HOLE_X + 0.02, TK.yh + 0.1, 0), V(1, 0, 0), SC.jetV],
  };
  // spans: [from, unit direction, on the cube?, label offset]
  const SPAN = {
    small: () => [V(LX - PA.r1 - 0.1, W0 + 0.04, 0), V(0, -1, 0)], large: () => [V(RX + PA.r2 + 0.1, W0 + 0.04, 0), V(0, 1, 0), false, V(0.06, 0.2, 0)],
    under: () => [V(BS / 2 + 0.06, -BS / 2, BS / 2), V(0, 1, 0), true],
  };
  function setMarks(list = []) {
    if (markRoot) { root.remove(markRoot); markRoot.traverse(o => o.geometry?.dispose()); }
    markRoot = new THREE.Group(); root.add(markRoot);
    mark4 = new THREE.Group(); mark4.position.copy(cube.position); markRoot.add(mark4);
    const out = [], g4m = mark4;
    const put = (m, at, onCube) => out.push({ cls: m.red ? 'qmark red' : 'qmark', html: m.label, at: onCube ? () => g4m.localToWorld(at.clone()) : () => at });
    for (const m of list) {
      const col = m.red ? '#e5484d' : '#2c2c30';
      if (m.tag) { const t = TAG[m.tag](); if (Array.isArray(t)) put(m, t[0], true); else put(m, t); }
      if (m.depth !== undefined || m.pressure !== undefined) {
        const d = m.depth ?? (m.pressure * 1000 - (m.gauge ? 0 : M.P0)) / (M.LAKE.rho * M.G), y = D - Math.min(Math.max(d, -0.5), D + 0.5);
        lines(markRoot, [X2 - 2.5, y, 1.2, X2 + 2.5, y, 1.2, X2 - 2.5, y, -1.2, X2 - 2.5, y, 1.2, X2 + 2.5, y, -1.2, X2 + 2.5, y, 1.2], col);
        put(m, V(X2 + 2.6, m.red ? y - 0.6 : y, -1.2));   // at the back corner, clear of the depth rod; a ghost's under its line
      }
      if (m.arrow) {
        const [from, dir, k, onCube, off] = ARROW[m.arrow](m.value), a = arrow(onCube ? mark4 : markRoot, m.red ? 'red' : 'ink', { r: 0.012, head: 0.07, headR: 0.035, name: 'Mark' });
        const len = m.red ? Math.min(m.value * k, GHOST.arrow) : m.value * k;   // a wild ghost stays in frame; its label has the number
        setArrow(a, from, dir.clone().multiplyScalar(len));
        put(m, from.clone().addScaledVector(dir, len).add(off ?? V(0.05, dir.y < 0 ? -0.05 : 0.08, 0)), onCube);
      }
      if (m.span) {
        const [from, dir, onCube, off = V(0.06, 0, 0)] = SPAN[m.span](), d = m.d ?? m.cm / 100;
        const to = from.clone().addScaledVector(dir, m.red ? Math.min(d, GHOST.span) : d), par = onCube ? mark4 : markRoot;
        lines(par, [from.x, from.y, from.z, to.x, to.y, to.z, from.x - 0.05, from.y, from.z, from.x + 0.05, from.y, from.z, to.x - 0.05, to.y, to.z, to.x + 0.05, to.y, to.z], col);
        put(m, from.clone().add(to).multiplyScalar(0.5).add(off), onCube);
      }
      if (m.waterline) {
        const b = blocks[m.waterline], s = b.c.s, y = L5 - b.c.draft + m.pct / 100 * s, h = s / 2 + 0.012;
        lines(markRoot, [[-h, -h, h, -h], [h, -h, h, h], [h, h, -h, h], [-h, h, -h, -h]].flatMap(([x1, z1, x2, z2]) => [b.x + x1, y, z1, b.x + x2, y, z2]), col);
        put(m, V(b.x + h + 0.03, y, h));
      }
      if (m.land !== undefined) {
        const x = HOLE_X + m.land;
        lines(markRoot, [x - 0.12, 0.004, 0, x + 0.12, 0.004, 0, x, 0.004, -0.12, x, 0.004, 0.12], col);
        put(m, V(x + 0.05, 0.3, 0.2));
      }
      if (m.cube) {
        const rho = M.MATERIALS.find(x => x.key === m.cube).rho, c0 = Math.cbrt(m.m !== undefined ? m.m / rho : m.L / 1000), c = m.red ? Math.min(c0, GHOST.cube) : c0;
        const g = new THREE.Mesh(new THREE.BoxGeometry(c, c, c), m.red ? ghostMark : plainMark); g.userData = { tone: 0.2, ghost: true };
        g.position.set(cubeX(m.cube), 0.02 + c / 2, 0.34); markRoot.add(g);
        put(m, V(cubeX(m.cube) + c / 2 + 0.02, 0.02 + c, 0.34));
      }
    }
    return out;
  }
  return { update, labels, setMarks, get slab6() { return slab6; }, get st4() { return st4; }, get h8() { return h8; } };
}
