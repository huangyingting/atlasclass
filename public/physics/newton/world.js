// The figure: a row of six simple scenes on the floor, one per page. A block, the surface it
// sits on, and its forces as solid arrows drawn from its centre (a free-body diagram in 3D).
// Metres, y up. Black arrows are individual forces; the red arrow is the net force.
// Premium: built from the numbers in force (model.js setParams), so a question's own numbers show; the car's run
// is drawn to scale (CS < 1) when it would leave the road. setMarks() draws a question's marks (forces, positions, notes).
import * as THREE from 'three';
import { part, box, cyl, lines, arrow, setArrow, shadeMat, xAxis, zAxis, V } from '../engine/parts.js';
import * as M from './model.js';

export const F_SCALE = 0.06;      // arrow metres per newton, the same in every scene
export const STATIONS = { rest: 0, tension: 8, glide: 17, plane: 31, second: 45, car: 58, friction: 75, third: 84, tug: 96, board: 108, incline: 120, drag: 132, honey: 141 };
export const TUG_SCALE = 0.008;    // tug of war: arrow metres per newton
export const DRAG_SCALE = 0.2;    // falling ball: arrow metres per newton
export const HONEY_SCALE = 10;    // honey: arrow metres per newton (the ball weighs 0.04 N)
export const KN_SCALE = 0.25;     // car and plane: arrow metres per kilonewton
const S1 = 0.5, S2 = 0.5 * Math.cbrt(2);   // 2 kg and 4 kg cubes of the same material

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const label = (cls, html, at) => labels.push({ cls, html, at });
  const f2 = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);

  // faint graph-paper ground
  const grid = [];
  for (let x = -4; x <= 146; x++) grid.push(x, 0.001, -3, x, 0.001, 3);
  for (let z = -3; z <= 3; z++) grid.push(-4, 0.001, z, 146, 0.001, z);
  lines(root, grid, '#e6e6e2');

  // surfaces: smooth strips are frictionless, hatched patches are rough
  const smooth = (x0, x1, z0 = -0.9, z1 = 0.9) => part(root, box(x1 - x0, 0.02, z1 - z0, 0.005), { tone: 'lo', pal: 'board', pos: [(x0 + x1) / 2, 0.01, (z0 + z1) / 2], name: 'Surface' });
  const rough = (x0, x1, z0 = -0.9, z1 = 0.9) => {
    smooth(x0, x1, z0, z1);
    const h = [];
    for (let x = x0 + 0.05; x < x1; x += 0.09) h.push(x, 0.022, z1, x - 0.12, 0.022, z1 - 0.12);
    lines(root, h, '#9a9aa0');
  };

  const block = (parent, s, name = 'Block') => part(parent, box(s, s, s, 0.03), { tone: 'hi', name });
  const force = (parent, red = false) => arrow(parent, red ? 'red' : 'ink', { r: 0.022, head: 0.12, headR: 0.06, name: 'Forces' });
  const tip = a => a.visible ? a.localToWorld(V(0, a.userData.arrow.shaft.scale.y + 0.16, 0)) : null;

  // ---------- 1 · forces: a block at rest ----------
  const X0 = STATIONS.rest;
  smooth(X0 - 1.2, X0 + 1.2);
  const g0 = asm('rest', root, { title: 'A block at rest', sub: 'two forces, balanced' });
  const b0 = block(g0, S1); b0.position.set(X0, 0.02 + S1 / 2, 0);
  const fg0 = force(g0), fn0 = force(g0);
  label('vec', 'F<sub>g</sub>', () => tip(fg0)); label('vec', 'F<sub>N</sub>', () => tip(fn0));
  label('tick', '2.0 kg', () => V(X0 - S1 / 2 - 0.05, 0.02 + S1 + 0.12, S1 / 2));
  const push0 = M.PRESS ? force(g0) : null;   // a question's push down on the top face
  if (push0) label('vec', 'F<sub>push</sub>', () => tip(push0).add(V(0.2, 0, 0)));

  // ---------- 2 · first law: gliding at constant velocity ----------
  const X1 = STATIONS.glide;
  (M.MU_GLIDE ? rough : smooth)(X1 - 2.4, X1 + 2.4);
  const g1 = asm('glide', root, { title: 'Gliding block', sub: 'no net force, so no change in motion' });
  const b1 = block(g1, S1);
  const fg1 = force(g1), fn1 = force(g1);
  label('vec', 'F<sub>g</sub>', () => tip(fg1)); label('vec', 'F<sub>N</sub>', () => tip(fn1));
  const [fa1, ff1] = M.MU_GLIDE ? [force(g1), force(g1)] : [];   // a rough floor: the push that matches friction
  if (fa1) { label('vec', 'F<sub>app</sub>', () => tip(fa1)); label('vec', 'f', () => tip(ff1)); }
  // strobe images as faint outlines, so overlapping ones still read
  const ghostBox = s => { const l = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s, s, s)), new THREE.LineBasicMaterial({ color: '#bdbdc2' })); l.userData = { noEdge: true }; root.add(l); return l; };
  const ghosts1 = Array.from({ length: 5 }, () => ghostBox(S1));

  // ---------- 3 · second law: same push, double the mass ----------
  const X2 = STATIONS.second;
  smooth(X2 - 1.0, X2 + 3.2, -1.4, 1.4);
  const g2 = asm('second', root, { title: 'Same push, different mass', sub: 'ΣF = ma' });
  const b2a = block(g2, S1, '2.0 kg block'), b2b = block(g2, S2, '4.0 kg block');
  const push2a = force(g2), push2b = force(g2), net2a = force(g2, true), net2b = force(g2, true);
  label('vec', 'F', () => tip(push2a)); label('vec', 'F', () => tip(push2b));
  label('tick', '2.0 kg', () => V(b2a.position.x - S1 / 2, S1 + 0.16, b2a.position.z + S1 / 2));
  label('tick', '4.0 kg', () => V(b2b.position.x - S2 / 2, S2 + 0.16, b2b.position.z + S2 / 2));
  const ghosts2 = Array.from({ length: 14 }, (_, k) => ghostBox(k < 7 ? S1 : S2));

  // ---------- 4 · friction: a growing push on a rough floor ----------
  const X3 = STATIONS.friction;
  rough(X3 - 1.4, X3 + 2.2);
  const g3 = asm('friction', root, { title: 'Friction', sub: 'static until it can’t, then kinetic' });
  const b3 = block(g3, S1);
  const fg3 = force(g3), fn3 = force(g3), fa3 = force(g3), ff3 = force(g3), net3 = force(g3, true);
  label('vec', 'F<sub>app</sub>', () => tip(fa3)); label('vec', 'f', () => tip(ff3));
  label('vec', 'F<sub>g</sub>', () => tip(fg3)); label('vec', 'F<sub>N</sub>', () => tip(fn3)); label('vec red', 'ΣF', () => tip(net3));

  // ---------- 5 · third law: A pushes B ----------
  const X4 = STATIONS.third;
  smooth(X4 - 1.4, X4 + 2.4);
  const g4 = asm('third', root, { title: 'Two blocks in contact', sub: 'A pushes B; B pushes A back' });
  // b4a is the pushed block (behind), b4b the one it pushes: A then B, or B then A when a question swaps them
  const [nA, nB, SA, SB] = M.PUSHED === 'A' ? ['A', 'B', S1, S2] : ['B', 'A', S2, S1];
  const b4a = block(g4, SA, `Block ${nA} · ${f2(M.M_PUSHED, 1)} kg`), b4b = block(g4, SB, `Block ${nB} · ${f2(M.M_OTHER, 1)} kg`);
  const push4 = force(g4), onB = force(g4), onA = force(g4);
  label('vec', 'F', () => tip(push4)); label('vec', `F<sub>${nA} on ${nB}</sub>`, () => tip(onB)); label('vec', `F<sub>${nB} on ${nA}</sub>`, () => tip(onA));
  label('tick', nA, () => V(b4a.position.x, SA + 0.14, SA / 2)); label('tick', nB, () => V(b4b.position.x, SB + 0.14, SB / 2));

  // ---------- 6 · inclined plane ----------
  const X5 = STATIONS.incline, L = M.INC_LEN + 1.0, th = M.THETA;
  const topX = X5 - L * Math.cos(th) / 2, topY = L * Math.sin(th);
  const tri = new THREE.Shape(); tri.moveTo(topX, 0); tri.lineTo(topX + L * Math.cos(th), 0); tri.lineTo(topX, topY); tri.closePath();
  const rampGeo = new THREE.ExtrudeGeometry(tri, { depth: 1.4, bevelEnabled: false }); rampGeo.translate(0, 0, -0.7);
  part(root, rampGeo, { tone: 'mid', name: 'Ramp', mat: shadeMat('board', { opacity: 0.55 }) });
  const g5 = asm('incline', root, { title: 'Block on a ramp', sub: `${M.THETA_DEG}°, frictionless` });
  const b5 = block(g5, S1); b5.rotation.z = -th;
  const fg5 = force(g5), fn5 = force(g5), par5 = arrow(g5, 'dark', { r: 0.018, head: 0.1, headR: 0.05, name: 'Components', tone: 'mid' }), perp5 = arrow(g5, 'dark', { r: 0.018, head: 0.1, headR: 0.05, name: 'Components', tone: 'mid' }), net5 = force(g5, true);
  label('vec', 'F<sub>g</sub>', () => tip(fg5)); label('vec', 'F<sub>N</sub>', () => tip(fn5)); label('vec red', 'ΣF', () => tip(net5));
  label('vec', 'mg sin θ', () => tip(par5)); label('vec', 'mg cos θ', () => tip(perp5));
  const fr5 = M.MU_INC ? force(g5) : null;   // a rough ramp: kinetic friction up the slope
  if (fr5) label('vec', 'f', () => tip(fr5));
  label('tick', `θ = ${M.THETA_DEG}°`, () => V(topX + L * Math.cos(th) - 0.95, 0.18, 0.75));

  // ---------- tension: one string, and two strings at a changing angle ----------
  const XT = STATIONS.tension, CEIL = 2.6;
  part(root, box(4.4, 0.08, 0.5, 0.02), { tone: 'mid', pal: 'board', pos: [XT, CEIL + 0.04, 0], name: 'Ceiling' });
  const gT = asm('tension', root, { title: 'Hanging block', sub: 'tension holds it up' });
  const bT1 = block(gT, S1, 'One string'), bT2 = block(gT, S1, 'Two strings');
  const thin = r => part(gT, new THREE.CylinderGeometry(0.008, 0.008, 1, 8), { tone: 'hi', pal: 'ink', name: 'Strings' });
  const s1 = thin(), s2a = thin(), s2b = thin(), s2c = thin();
  const fgT1 = force(gT), tT1 = force(gT), fgT2 = force(gT), tT2a = force(gT), tT2b = force(gT);
  const cmp = () => arrow(gT, 'dark', { r: 0.014, head: 0.08, headR: 0.04, name: 'Components', tone: 'mid' });
  const tx2a = cmp(), ty2a = cmp(), tx2b = cmp(), ty2b = cmp();
  label('vec', 'T', () => tip(tT1)); label('vec', 'F<sub>g</sub>', () => tip(fgT1));
  label('vec', 'T<sub>1</sub>', () => tip(tT2a)); label('vec', 'T<sub>2</sub>', () => tip(tT2b)); label('vec', '<i>mg</i>', () => tip(fgT2));
  const stringTo = (m, a, b) => { const mid = a.clone().add(b).multiplyScalar(0.5); m.position.copy(mid); m.scale.set(1, a.distanceTo(b), 1); m.quaternion.setFromUnitVectors(V(0, 1, 0), b.clone().sub(a).normalize()); };

  // ---------- a plane in level flight ----------
  const XP = STATIONS.plane, PY = 3.2;
  const gP = asm('plane', root, { title: 'Plane in level flight', sub: 'four forces, all balanced' });
  const plane = new THREE.Group(); gP.add(plane);
  part(plane, xAxis(new THREE.CylinderGeometry(0.42, 0.3, 4.6, 32)), { tone: 'hi', name: 'Fuselage' });
  part(plane, xAxis(new THREE.ConeGeometry(0.42, 1.0, 32)).translate(2.8, 0, 0), { tone: 'hi', name: 'Fuselage' });
  part(plane, xAxis(new THREE.ConeGeometry(0.3, 1.4, 32)).rotateZ(Math.PI).translate(-3.0, 0, 0), { tone: 'hi', name: 'Fuselage' });
  part(plane, box(1.3, 0.1, 8.4, 0.04), { tone: 'hi', pos: [0.5, 0.15, 0], name: 'Wing' });
  part(plane, box(0.75, 0.07, 2.8, 0.03), { tone: 'hi', pos: [-3.3, 0.1, 0], name: 'Tail' });
  part(plane, box(0.9, 1.1, 0.07, 0.03), { tone: 'hi', pos: [-3.35, 0.6, 0], name: 'Tail' });
  part(plane, box(0.06, 1.7, 0.16, 0.03), { tone: 'mid', pal: 'dark', pos: [3.32, 0, 0], name: 'Propeller' });
  part(plane, box(0.4, 0.18, 0.5, 0.05), { tone: 'mid', pal: 'dark', pos: [1.2, 0.42, 0], name: 'Canopy' });
  const pLift = force(gP), pW = force(gP), pT = force(gP), pD = force(gP);
  label('vec', 'lift', () => tip(pLift)); label('vec', 'F<sub>g</sub>', () => tip(pW)); label('vec', 'thrust', () => tip(pT)); label('vec', 'drag', () => tip(pD));
  const pNet = M.PLANE.T !== M.PLANE.D ? force(gP, true) : null;   // a question's thrust, unbalanced
  if (pNet) label('vec red', 'ΣF', () => tip(pNet));

  // ---------- a car speeding up ----------
  // a run longer than the lesson's is drawn to scale, ending mid-road where the camera sees it
  const XC = STATIONS.car - 6, CS = M.CAR.run > M.DEFAULTS.CAR_RUN ? 9 / M.car(M.CAR.run).x : 1;
  part(root, box(24, 0.03, 3.4, 0.01), { tone: 'lo', pal: 'board', pos: [XC + 9, 0.015, 0], name: 'Road' });
  const dashes = []; for (let x = XC - 2.5; x < XC + 20.5; x += 2) dashes.push(x, 0.035, 0, x + 1, 0.035, 0);
  lines(root, dashes, '#9a9aa0');
  const gC = asm('car', root, { title: 'Car speeding up', sub: 'the road pushes it forward' });
  const carG = new THREE.Group(); gC.add(carG);
  part(carG, box(4.2, 0.7, 1.8, 0.18), { tone: 'hi', pos: [0, 0.75, 0], name: 'Body' });
  part(carG, box(2.2, 0.6, 1.6, 0.2), { tone: 'hi', pos: [-0.3, 1.38, 0], name: 'Cabin' });
  for (const [x, z] of [[1.35, 0.85], [1.35, -0.85], [-1.35, 0.85], [-1.35, -0.85]]) {
    part(carG, zAxis(new THREE.CylinderGeometry(0.36, 0.36, 0.26, 28)), { tone: 'mid', pal: 'dark', pos: [x, 0.36, z], name: 'Wheels' });
    part(carG, zAxis(new THREE.CylinderGeometry(0.17, 0.17, 0.28, 20)), { tone: 'mid', pos: [x, 0.36, z], name: 'Wheels' });
  }
  const cW = force(gC), cN = force(gC), cF = force(gC), cD = force(gC), cNet = force(gC, true);
  label('vec', 'F<sub>g</sub>', () => tip(cW)); label('vec', 'F<sub>N</sub>', () => tip(cN)); label('vec', 'friction', () => tip(cF)); label('vec', 'drag', () => tip(cD)); label('vec red', 'ΣF', () => tip(cNet));


  // centre of mass: the quartered disc, drawn over solids so it can be seen inside them
  function cmMark(parent, r = 0.08) {
    const g = new THREE.Group(); parent.add(g);
    for (let k = 0; k < 4; k++) {
      const geo = new THREE.CylinderGeometry(r, r, 0.01, 12, 1, false, k * Math.PI / 2, Math.PI / 2); geo.rotateX(Math.PI / 2);
      const mat = shadeMat(k % 2 ? 'paper' : 'ink').clone(); mat.depthTest = false; mat.transparent = true;
      part(g, geo, { tone: 'hi', name: 'Centre of mass', mat }).renderOrder = 11;
    }
    return g;
  }
  const ghostCircle = r => { const pts = []; for (let i = 0; i < 40; i++) { const a = i / 40 * 2 * Math.PI, b = (i + 1) / 40 * 2 * Math.PI; pts.push(r * Math.cos(a), r * Math.sin(a), 0, r * Math.cos(b), r * Math.sin(b), 0); } return lines(root, pts, '#bdbdc2'); };

  // ---------- systems: a tug of war on ice ----------
  const XG = STATIONS.tug, TG = M.TUG, HAND = 1.0, REACH = 0.26;
  smooth(XG - 3.6, XG + 2.8, -1.1, 1.1);
  const gG = asm('tug', root, { title: 'Tug of war on ice', sub: 'internal forces cancel; the centre of mass stays put' });
  const skater = (r, h, dir, name) => {
    const g = new THREE.Group(); gG.add(g);
    part(g, cyl(r, h, 28), { tone: 'hi', pos: [0, h / 2 + 0.02, 0], name });
    part(g, new THREE.SphereGeometry(r * 0.72, 24, 16), { tone: 'hi', pos: [0, h + 0.04 + r * 0.72, 0], name });
    part(g, xAxis(cyl(0.035, REACH + 0.04, 12)), { tone: 'hi', pos: [dir * (r + REACH / 2 - 0.02), HAND, 0], name });
    g.userData.r = r; return g;
  };
  const skA = skater(0.17, 1.25, 1, 'Skater A · 50 kg'), skB = skater(0.21, 1.4, -1, 'Skater B · 75 kg');
  const rope = part(gG, new THREE.CylinderGeometry(0.012, 0.012, 1, 8), { tone: 'mid', pal: 'dark', name: 'Rope' });
  const tOnA = force(gG), tOnB = force(gG);
  const cmG = cmMark(gG, 0.09);
  const sysBox = part(gG, box(1, 1, 1, 0.04), { tone: 'lo', name: 'System', mat: shadeMat('board', { opacity: 0.35 }) });
  const above = a => a.visible ? a.localToWorld(V(0, a.userData.arrow.shaft.scale.y / 2, 0)).add(V(0, 0.2, 0)) : null;
  label('vec', 'T<sub>on A</sub>', () => above(tOnA)); label('vec', 'T<sub>on B</sub>', () => above(tOnB));
  label('tick', 'A · 50 kg', () => V(skA.position.x - 0.12, 1.25 + 0.42, 0.2)); label('tick', 'B · 75 kg', () => V(skB.position.x + 0.62, 1.4 + 0.48, 0.2));
  label('vec blue', 'x<sub>cm</sub>', () => V(XG, 0.32, 0.5));
  label('board', 'system', () => sysBox.visible && gG.userData.explode > 0.5 ? V(sysBox.position.x - sysBox.scale.x / 2 + 0.08, 2.32, 0.65) : null);
  { const t = []; for (let k = -1; k <= 1; k += 0.25) t.push(XG, 0.025, k * 1.0, XG, 0.025, k * 1.0 + 0.12); lines(root, t, '#5b86d6'); }   // dashed line through x_cm

  // ---------- ΣF_ext = M a_cm: a block on a board, the board pulled ----------
  const XB = STATIONS.board, BD = M.BOARD, XB0 = XB - 1.6, BH = 0.08;
  smooth(XB - 3.2, XB + 3.6, -1.0, 1.0);
  const gB = asm('board', root, { title: 'Block on a board', sub: 'friction between them is internal' });
  const plank = part(gB, box(BD.len, BH, 0.9, 0.02), { tone: 'mid', name: 'Board · 4.0 kg' });
  const bB = block(gB, S1, 'Block · 2.0 kg');
  const pullB = force(gB), fOnBlock = force(gB), fOnBoard = force(gB), netB = force(gB, true);
  const cmB = cmMark(gB, 0.07);
  label('vec', 'F', () => tip(pullB)); const below = a => a.visible ? a.localToWorld(V(0, a.userData.arrow.shaft.scale.y / 2, 0)).add(V(-0.1, -0.2, 0.15)) : null;
  label('vec', 'f<sub>on block</sub>', () => fOnBlock.visible ? tip(fOnBlock).add(V(0.25, 0.08, 0)) : null); label('vec', 'f<sub>on board</sub>', () => below(fOnBoard));
  label('vec red', 'ΣF<sub>ext</sub>', () => tip(netB));
  label('tick', '2.0 kg', () => V(bB.position.x - S1 / 2, bB.position.y + S1 / 2 + 0.14, S1 / 2));
  label('tick', '4.0 kg', () => V(plank.position.x - BD.len / 2 + 0.1, 0.42, 0.45));

  // ---------- AP C: a ball falling with drag F = −bv ----------
  const XD = STATIONS.drag, DR = M.DRAG, RB = 0.24;
  smooth(XD - 1.4, XD + 1.4);
  { const t = [XD - 1.0, 0.02, 0, XD - 1.0, DR.y0 + 0.2, 0];
    for (let y = 0; y <= DR.y0; y += 0.5) t.push(XD - 1.0, y, 0, XD - (y % 1 ? 0.92 : 0.84), y, 0);
    lines(root, t, '#8a8a8f'); }
  label('axis', '5 m', () => V(XD - 1.05, 5, 0)); label('axis', '0', () => V(XD - 1.05, 0.05, 0));
  const gD = asm('drag', root, { title: 'Falling with drag ∝ v', sub: 'drag grows until it matches the weight' });
  const ballD = part(gD, new THREE.SphereGeometry(RB, 32, 20), { tone: 'hi', name: 'Ball · 0.50 kg' });
  const wD = force(gD), dD = force(gD), netD = force(gD, true);
  const ghostsD = Array.from({ length: 8 }, () => ghostCircle(RB));
  label('vec', 'F<sub>g</sub> = <i>mg</i>', () => tip(wD)); label('vec', 'F<sub>d</sub> = <i>bv</i>', () => tip(dD)); label('vec red', 'ΣF', () => tip(netD));
  let vNowD = 0;
  labels.push({ cls: 'tick', html: '', at: () => ballD.position.clone().add(V(-RB - 0.12, 0, 0)), text: () => `v = ${f2(vNowD)} m/s` });

  // ---------- AP C: a steel ball sinking in honey, drawn 10× life size ----------
  const XH = STATIONS.honey, HN = M.HONEY, Z10 = 10, JR = 0.32, BASE = 0.04, HTOP = BASE + HN.jarH * Z10, JH = HTOP + 0.16;
  part(root, cyl(JR, BASE, 40), { tone: 'mid', pal: 'board', pos: [XH, BASE / 2, 0], name: 'Jar' });
  part(root, cyl(JR - 0.01, HN.jarH * Z10, 40), { tone: 'lo', pal: 'base', pos: [XH, BASE + HN.jarH * Z10 / 2, 0], name: 'Honey', mat: shadeMat('base', { opacity: 0.4 }) });
  part(root, new THREE.CylinderGeometry(JR, JR, JH - BASE, 40, 1, true), { tone: 'lo', pal: 'board', pos: [XH, BASE + (JH - BASE) / 2, 0], name: 'Jar', mat: shadeMat('board', { opacity: 0.25 }) });
  { const t = []; for (let k = 0; k <= 12; k++) { const y = BASE + k * 0.1, w = k % 5 ? 0.06 : 0.12; t.push(XH + JR + 0.02, y, 0, XH + JR + 0.02 + w, y, 0); } lines(root, t, '#8a8a8f'); }
  label('board', '0', () => V(XH + JR + 0.2, BASE, 0)); label('board', '5 cm', () => V(XH + JR + 0.2, BASE + 0.5, 0)); label('board', '10 cm', () => V(XH + JR + 0.2, BASE + 1.0, 0));
  const gH = asm('honey', root, { title: 'Steel ball in honey', sub: 'at terminal speed within milliseconds' });
  gH.userData.minDist = 4; gH.userData.minRadius = 0.6;
  const RH = HN.r * Z10, YH0 = HTOP - 0.09;
  const ballH = part(gH, new THREE.SphereGeometry(RH, 24, 16), { tone: 'mid', pal: 'dark', name: 'Steel ball · 10 mm' });
  const thinF = (red = false) => arrow(gH, red ? 'red' : 'ink', { r: 0.009, head: 0.06, headR: 0.026, name: 'Forces' });
  const wH = thinF(), dH = thinF(), bH = thinF();
  const ghostsH = Array.from({ length: 6 }, () => ghostCircle(RH));
  label('vec', 'F<sub>g</sub>', () => tip(wH)); label('vec', 'F<sub>d</sub>', () => tip(dH)); label('vec', 'B', () => tip(bH));
  let vNowH = 0;
  labels.push({ cls: 'tick', html: '', at: () => ballH.position.clone().add(V(-JR - 0.05, 0, 0)), text: () => `v = ${f2(vNowH * 100)} cm/s` });

  // ---------- per-frame ----------
  const F = n => n * F_SCALE;
  // a block that is "opened" shrinks to a dot: the free-body diagram
  const shrink = (mesh, g) => { const k = 1 - 0.85 * Math.max(g.userData.explode, 0); mesh.scale.setScalar(k); return k; };
  // where each scene's body is now (a question's marks ride on it), and its arrow metres per newton
  const now = {};
  const NS = { rest: F_SCALE, tension: F_SCALE, glide: F_SCALE, plane: KN_SCALE / 1000, second: F_SCALE, secondB: F_SCALE, car: KN_SCALE / 1000,
    friction: F_SCALE, third: F_SCALE, thirdB: F_SCALE, tug: TUG_SCALE, board: F_SCALE, incline: F_SCALE, drag: DRAG_SCALE, honey: HONEY_SCALE };
  let live = [];   // marks that follow a moving body, redrawn each frame
  // s: each scene's { t, resting } in physics time; tension and plane: physics time (main.js state / stateAt)
  function update(s, look) {
    // tension: θ sweeps slowly (or holds a question's angle); the block hangs where the strings put it
    { const th = M.hangAngle(s.tension), r = th * Math.PI / 180, T = M.tension2(th);
      const top1 = V(XT - 1.3, CEIL, 0), c1 = V(XT - 1.3, CEIL - 1.3 - S1 / 2, 0);
      bT1.position.copy(c1); stringTo(s1, top1, c1.clone().add(V(0, S1 / 2, 0)));
      setArrow(tT1, c1, V(0, F(M.W1), 0)); setArrow(fgT1, c1, V(0, -F(M.W1), 0));
      const knot = V(XT + 0.75, CEIL - M.STRING_L * Math.sin(r), 0), c2 = knot.clone().add(V(0, -0.35 - S1 / 2, 0));
      const A = V(XT + 0.75 - M.STRING_L * Math.cos(r), CEIL, 0), B = V(XT + 0.75 + M.STRING_L * Math.cos(r), CEIL, 0);
      bT2.position.copy(c2); stringTo(s2a, A, knot); stringTo(s2b, B, knot); stringTo(s2c, knot, c2.clone().add(V(0, S1 / 2, 0)));
      // the block hangs from the knot by a short string pulling down with mg; forces drawn at the knot
      const ua = A.clone().sub(knot).normalize(), ub = B.clone().sub(knot).normalize();
      setArrow(tT2a, knot, ua.clone().multiplyScalar(F(T))); setArrow(tT2b, knot, ub.clone().multiplyScalar(F(T)));
      setArrow(fgT2, knot, V(0, -F(M.W1), 0));
      const ex = Math.max(gT.userData.explode, 0);
      setArrow(tx2a, knot, V(ua.x * F(T), 0, 0), ex); setArrow(ty2a, knot.clone().add(V(-0.04, 0, 0)), V(0, ua.y * F(T), 0), ex);
      setArrow(tx2b, knot, V(ub.x * F(T), 0, 0), ex); setArrow(ty2b, knot.clone().add(V(0.04, 0, 0)), V(0, ub.y * F(T), 0), ex);
      now.tension = knot; }

    // plane: constant velocity, so it just drifts across the frame and starts over
    { const span = 16, x = ((s.plane * 2.2) % span) - span / 2, c = V(XP + x, PY, 0);
      plane.position.copy(c);
      const K = n => n / 1000 * KN_SCALE;
      setArrow(pLift, c.clone().add(V(0.5, 0.2, 0)), V(0, K(M.PLANE.L), 0)); setArrow(pW, c, V(0, -K(M.PLANE.W), 0));
      setArrow(pT, c.clone().add(V(3.4, 0, 0)), V(K(M.PLANE.T), 0, 0)); setArrow(pD, c.clone().add(V(-3.8, 0, 0)), V(-K(M.PLANE.D), 0, 0));
      if (pNet) setArrow(pNet, c.clone().add(V(0, 1.3, 0)), V(K(M.PLANE.T - M.PLANE.D), 0, 0));
      now.plane = c; }

    // car: speeds up from rest, then starts over
    { const { t } = s.car, r = M.car(t), c = V(XC + CS * r.x, 0.8, 0);
      carG.position.set(XC + CS * r.x, 0, 0);
      const K = n => n / 1000 * KN_SCALE;
      setArrow(cW, c, V(0, -K(M.CAR.W), 0)); setArrow(cN, c.clone().add(V(0, 0, 0)), V(0, K(M.CAR.W), 0));
      setArrow(cF, V(XC + CS * r.x + 1.35, 0.02, 1.15), V(K(M.CAR.F), 0, 0));
      setArrow(cD, c.clone().add(V(-2.15, 0.3, 0)), V(-Math.max(K(r.D), 0.001), 0, 0), r.D > 1 ? 1 : 0);
      setArrow(cNet, c.clone().add(V(0, 1.4, 0)), V(K(M.CAR.F - r.D), 0, 0));
      now.car = c; }


    // tug of war: the skaters close in; the centre of mass (and the dashed line through it) never moves
    { const { t } = s.tug, r = M.tug(t), ex = Math.max(gG.userData.explode, 0);
      skA.position.set(XG + r.xA, 0, 0); skB.position.set(XG + r.xB, 0, 0);
      const hA = V(XG + r.xA + skA.userData.r + REACH, HAND, 0), hB = V(XG + r.xB - skB.userData.r - REACH, HAND, 0);
      if (hB.x - hA.x > 0.01) { rope.visible = true; stringTo(rope, hA, hB); } else rope.visible = false;
      setArrow(tOnA, hA.clone().add(V(0, 0.14, 0)), V(TG.T * TUG_SCALE, 0, 0));
      setArrow(tOnB, hB.clone().add(V(0, 0.14, 0)), V(-TG.T * TUG_SCALE, 0, 0));
      cmG.position.set(XG + M.xcm([TG.mA, TG.mB], [r.xA, r.xB]), 0.7, 0.3);
      sysBox.visible = ex > 0.03;
      const x0 = XG + r.xA - 0.4, x1 = XG + r.xB + 0.45;
      sysBox.position.set((x0 + x1) / 2, 1.1, 0); sysBox.scale.set((x1 - x0) * (0.6 + 0.4 * ex), 2.2 * (0.6 + 0.4 * ex), 1.3);
      now.tug = cmG.position.clone(); }

    // block on a board: the board is pulled ahead; friction drags the block along more slowly
    { const { t } = s.board, r = M.board(t), ex = Math.max(gB.userData.explode, 0), on = 1;
      const cx = XB0 + r.xBoard, bx = XB0 + BD.x0 + r.xBlock, lift = 0.3 * ex;
      plank.position.set(cx, 0.02 + BH / 2, 0);
      const by = 0.02 + BH + S1 / 2 + lift;
      bB.position.set(bx, by, 0);
      setArrow(pullB, V(cx + BD.len / 2, 0.02 + BH / 2, 0), V(F(BD.F), 0, 0), on);
      setArrow(fOnBlock, V(bx - 0.05, by - S1 / 2 + 0.1, S1 / 2 + 0.06), V(F(BD.f), 0, 0), on);
      setArrow(fOnBoard, V(bx + 0.05, 0.02 + BH + 0.01, S1 / 2 + 0.06), V(-F(BD.f), 0, 0), on);
      const xc = M.xcm([BD.m, BD.Mb], [bx, cx]), yc = M.xcm([BD.m, BD.Mb], [0.02 + BH + S1 / 2, 0.02 + BH / 2]);
      cmB.position.set(xc, yc, 0.5);
      setArrow(netB, V(xc, 1.0, 0.5), V(F(BD.F), 0, 0), on);   // drawn above the centre of mass, clear of F
      now.board = V(xc, 1.0, 0.5); }

    // falling with linear drag: the drag arrow grows to match the weight; the net force fades away
    { const { t } = s.drag, r = M.linDrag(t), c = V(XD, DR.y0 - r.x, 0);
      vNowD = r.v; ballD.position.copy(c); shrink(ballD, gD);
      const S = DRAG_SCALE;
      setArrow(wD, c, V(0, -DR.W * S, 0)); setArrow(dD, c, V(0, r.D * S, 0), r.D * S > 0.03 ? 1 : 0);
      setArrow(netD, c.clone().add(V(0.42, 0, 0)), V(0, -(DR.W - r.D) * S, 0), (DR.W - r.D) * S > 0.03 ? 1 : 0);
      ghostsD.forEach((m, k) => { const tk = k * 0.2; m.visible = tk < t - 0.05; m.position.set(XD, DR.y0 - M.linDrag(tk).x, 0); });
      now.drag = c; }

    // honey: already at terminal speed, so three balanced forces and evenly spaced strobes
    { const { t } = s.honey, r = M.honey(t), c = V(XH, YH0 - r.x * Z10, 0);
      vNowH = r.v; ballH.position.copy(c); shrink(ballH, gH);
      const S = HONEY_SCALE, D = HN.b * r.v;
      setArrow(wH, c, V(0, -HN.W * S, 0)); setArrow(dH, c.clone().add(V(-0.03, 0, 0)), V(0, D * S, 0)); setArrow(bH, c.clone().add(V(0.035, 0, 0)), V(0, HN.B * S, 0));
      ghostsH.forEach((m, k) => { const tk = k * 0.5; m.visible = tk < t - 0.05; m.position.set(XH, YH0 - M.honey(tk).x * Z10, 0.0); });
      now.honey = c; }

    // 1 · rest
    { const c = V(X0, 0.02 + S1 / 2, 0); shrink(b0, g0);
      setArrow(fg0, c, V(0, -F(M.W1), 0)); setArrow(fn0, c, V(0, F(M.FN), 0));
      // the push ends on the top face; opened, at the dot like the other forces
      if (push0) { const y = 0.04 + S1 + (c.y - 0.04 - S1) * Math.max(g0.userData.explode, 0); setArrow(push0, V(X0 + 0.14, y + F(M.PRESS), 0), V(0, -F(M.PRESS), 0)); }
      now.rest = c; }

    // 2 · glide (loops: across, then starts over)
    { const { t } = s.glide, r = M.glide(t), c = V(X1 + r.x, 0.02 + S1 / 2, 0);
      b1.position.copy(c); shrink(b1, g1);
      setArrow(fg1, c, V(0, -F(M.W1), 0)); setArrow(fn1, c, V(0, F(M.FN), 0));
      if (fa1) { setArrow(fa1, c.clone().add(V(-S1 / 2 - F(M.F_GLIDE) - 0.02, 0, 0)), V(F(M.F_GLIDE), 0, 0));
        setArrow(ff1, c.clone().add(V(S1 / 2 - 0.02, -S1 / 2 + 0.03, S1 / 2 + 0.05)), V(-F(M.F_GLIDE), 0, 0)); }
      ghosts1.forEach((m, k) => { const tk = k * 0.6; m.visible = tk <= t; m.position.set(X1 + M.glide(tk).x, 0.02 + S1 / 2, 0); });
      now.glide = c; }

    // 3 · second law
    { const { t, resting } = s.second, on = resting ? Math.max(g2.userData.explode, 0) : 1;   // an opened scene always shows its forces
      const sa = M.pushed(M.A1, t), sb = M.pushed(M.A2, t);
      const ca = V(X2 + sa.x, 0.02 + S1 / 2, 0.75), cb = V(X2 + sb.x, 0.02 + S2 / 2, -0.75);
      b2a.position.copy(ca); b2b.position.copy(cb);
      setArrow(push2a, ca.clone().add(V(-S1 / 2 - F(M.PUSH) - 0.02, 0, 0)), V(F(M.PUSH), 0, 0), on);
      setArrow(push2b, cb.clone().add(V(-S2 / 2 - F(M.PUSH_B) - 0.02, 0, 0)), V(F(M.PUSH_B), 0, 0), on);
      const ex = Math.max(g2.userData.explode, 0);
      setArrow(net2a, ca.clone().add(V(0, S1 / 2 + 0.1, 0)), V(F(M.PUSH), 0, 0), on * ex);
      setArrow(net2b, cb.clone().add(V(0, S2 / 2 + 0.1, 0)), V(F(M.PUSH_B), 0, 0), on * ex);
      ghosts2.forEach((m, k) => { const tk = (k % 7) * 0.2, a = k < 7 ? M.A1 : M.A2, s = k < 7 ? S1 : S2;
        m.visible = tk <= t; m.position.set(X2 + 0.5 * a * tk * tk, 0.02 + s / 2, k < 7 ? 0.75 : -0.75); });
      now.second = ca; now.secondB = cb; }

    // 4 · friction
    { const { t } = s.friction, r = M.friction(t), c = V(X3 + r.x, 0.02 + S1 / 2, 0);
      b3.position.copy(c); shrink(b3, g3);
      setArrow(fg3, c, V(0, -F(M.W1), 0)); setArrow(fn3, c, V(0, F(M.FN), 0));
      setArrow(fa3, c.clone().add(V(-S1 / 2 - F(r.F) - 0.02, 0, 0)), V(F(r.F), 0, 0), r.F > 0.1 ? 1 : 0);
      setArrow(ff3, c.clone().add(V(S1 / 2 - 0.02, -S1 / 2 + 0.03, S1 / 2 + 0.05)), V(-F(r.f), 0, 0), r.f > 0.1 ? 1 : 0);
      setArrow(net3, c.clone().add(V(0, S1 / 2 + 0.12, 0)), V(F(r.F - r.f), 0, 0), r.F - r.f > 0.05 ? 1 : 0);
      now.friction = c; }

    // 5 · third law: opened, the blocks part so the pair can be seen
    { const { t, resting } = s.third, r = M.pair(t), on = resting ? Math.max(g4.userData.explode, 0) : 1;
      const gap = 0.7 * Math.max(g4.userData.explode, 0);
      const ca = V(X4 + r.x, 0.02 + SA / 2, 0), cb = V(X4 + r.x + SA / 2 + SB / 2 + gap, 0.02 + SB / 2, 0);
      b4a.position.copy(ca); b4b.position.copy(cb);
      setArrow(push4, ca.clone().add(V(-SA / 2 - F(M.PUSH) - 0.02, 0, 0)), V(F(M.PUSH), 0, 0), on);
      const zf = Math.max(SA, SB) / 2 + 0.05, yf = 0.02 + Math.min(SA, SB) / 2;
      setArrow(onB, V(cb.x - SB / 2, yf + 0.09, zf), V(F(M.CONTACT), 0, 0), on);
      setArrow(onA, V(ca.x + SA / 2, yf - 0.09, zf), V(-F(M.CONTACT), 0, 0), on);
      now.third = ca; now.thirdB = cb; }

    // 6 · incline: opened, the weight splits into components along and into the slope
    { const { t } = s.incline, r = M.incline(t);
      const d = V(Math.cos(th), -Math.sin(th), 0), n = V(Math.sin(th), Math.cos(th), 0);
      const c = V(topX, topY, 0).addScaledVector(d, 0.4 + r.s).addScaledVector(n, S1 / 2 + 0.01);
      b5.position.copy(c); shrink(b5, g5);
      const ex = Math.max(g5.userData.explode, 0);
      setArrow(fg5, c, V(0, -F(M.W1), 0)); setArrow(fn5, c, n.clone().multiplyScalar(F(M.FN_INC)));
      setArrow(par5, c, d.clone().multiplyScalar(F(M.W_PAR)), ex); setArrow(perp5, c, n.clone().multiplyScalar(-F(M.W_PERP)), ex);
      if (fr5) setArrow(fr5, c.clone().addScaledVector(n, -S1 / 2 + 0.03).add(V(0, 0, S1 / 2 + 0.05)), d.clone().multiplyScalar(-F(M.F_INC)));
      setArrow(net5, c.clone().addScaledVector(n, S1 / 2 + 0.14), d.clone().multiplyScalar(F(M.W_PAR - M.F_INC)), 1);
      now.incline = c; }

    for (const fn of live) fn();
  }

  // ---------- a question's marks ----------
  // { force: scene, n, k?, deg?, off?, end?, lift?, red?, label }   an arrow of n·k newtons from the scene's body (deg from
  //                                                    +x, 90 up; end: it ends there; lift: its label raised so far),
  //                                                    drawn to that scene's scale; red: a ghost
  // { pos: scene, x | a, t | t, k?, red?, label }      where the body would be after moving x (or ½at² from rest,
  //                                                    or after t of its own fall), along its path; red: a ghost body
  // { note: scene, off?, label }                       a label at the scene's body
  const dirOf = deg => V(Math.cos(deg * Math.PI / 180), Math.sin(deg * Math.PI / 180), 0);
  const slope = V(Math.cos(th), -Math.sin(th), 0), normal = V(Math.sin(th), Math.cos(th), 0);
  // the body's centre after moving d along its path from the start; and its ghost's shape
  const PATH = {
    second: d => V(X2 + d, 0.02 + S1 / 2, 0.75),
    board: d => V(XB0 + BD.x0 + d, 0.02 + BH + S1 / 2, 0),
    incline: d => V(topX, topY, 0).addScaledVector(slope, 0.4 + d).addScaledVector(normal, S1 / 2 + 0.01),
    tug: d => V(XG + TG.xA0 + d, 0.02, 0),
    drag: d => V(XD, DR.y0 - d, 0),
    honey: d => V(XH, YH0 - d * Z10, 0),
  };
  const FALL = { drag: t => M.linDrag(t).x, honey: t => M.honey(t).x };
  const ghostMat = shadeMat('red', { opacity: 0.4 });
  let markRoot = null;
  function setMarks(list = []) {
    if (markRoot) { root.remove(markRoot); markRoot.traverse(o => o.geometry?.dispose()); }
    markRoot = new THREE.Group(); root.add(markRoot);
    live = [];
    const out = [];
    const cls = m => m.red ? 'qmark red' : 'qmark';
    for (const m of list) {
      const k = m.k ?? 1, off = V(...(m.off ?? [0, 0, 0]));
      if (m.force) {
        const a = arrow(markRoot, m.red ? 'red' : 'blue', { r: 0.022, head: 0.12, headR: 0.06, name: 'Mark' });
        if (m.red) { a.userData.arrow.shaft.material.uniforms.uOpacity.value = 0.55; }
        const vec = dirOf(m.deg ?? 90).multiplyScalar(m.n * k * NS[m.force]);
        const put = () => setArrow(a, now[m.force].clone().add(off).addScaledVector(vec, m.end ? -1 : 0), vec);
        put(); live.push(put);
        out.push({ cls: cls(m), html: m.label, at: () => a.visible ? a.localToWorld(V(0, a.userData.arrow.shaft.scale.y + 0.2, 0)).add(V(0, m.lift ?? 0, 0)) : null });
      }
      if (m.pos) {
        const d = m.x !== undefined ? m.x * k : m.a !== undefined ? 0.5 * m.a * k * m.t * m.t : FALL[m.pos](m.t * k);
        const c = PATH[m.pos](d), col = m.red ? '#e5484d' : '#2c2c30';
        let at;
        if (m.pos === 'tug') {   // a post on the ice where they would meet
          lines(markRoot, [c.x, 0.03, -1.0, c.x, 0.03, 1.0, c.x, 0.03, 0.9, c.x, 2.2, 0.9], col);
          at = V(c.x, 2.35, 0.9);
        } else if (m.pos === 'drag' || m.pos === 'honey') {   // a level line to the scale, and a ghost ball
          const r = m.pos === 'drag' ? RB : RH, x0 = m.pos === 'drag' ? XD - 1.0 : XH + JR + 0.02;
          lines(markRoot, [x0, c.y, 0, c.x, c.y, 0], col);
          if (m.red) { const g = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), ghostMat); g.userData = { tone: 0.2, ghost: true }; g.position.copy(c); markRoot.add(g); }
          at = c.clone().add(V(m.pos === 'drag' ? 0.45 : -0.45, 0, 0));
        } else {   // a tick across the floor under the centre, and a ghost block
          const foot = m.pos === 'incline' ? c.clone().addScaledVector(normal, -S1 / 2) : V(c.x, 0.03, c.z);
          const across = m.pos === 'second' ? 0.45 : 0.6;
          lines(markRoot, [foot.x, foot.y + 0.005, c.z - across, foot.x, foot.y + 0.005, c.z + across], col);
          if (m.red) { const g = new THREE.Mesh(new THREE.BoxGeometry(S1, S1, S1), ghostMat); g.userData = { tone: 0.2, ghost: true };
            g.position.copy(c); if (m.pos === 'incline') g.rotation.z = -th; markRoot.add(g); }
          at = c.clone().add(V(0, S1 / 2 + 0.25, 0));
        }
        out.push({ cls: cls(m), html: m.label, at: () => at.clone().add(off) });
      }
      if (m.note) out.push({ cls: cls(m), html: m.label, at: () => now[m.note].clone().add(off) });
    }
    return out;
  }

  return { update, labels, setMarks };
}
