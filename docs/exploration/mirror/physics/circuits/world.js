// The figure: circuit scenes in a row, one per page. A magnified copper wire, two resistance
// wires, then simple circuits lying flat on the paper like a textbook diagram: wires, batteries,
// resistors (zigzags), a bulb, a capacitor and a switch. Red dots are charge carriers moving with
// the current (conventional, + charge); their speed is proportional to the current. Clicked, a
// circuit rises so each point stands at a height equal to its potential: batteries lift, resistors
// slope down, ideal wires stay level. Every height, speed, arrow and number comes from model.js.
// Premium: built from the numbers in force (a question's params), with heights, dot speeds and arrows
// scaled down if they would leave the frame; setMarks() draws a question's marks (levels, currents, labels).
import * as THREE from 'three';
import { part, box, lines, arrow, setArrow, shadeMat, xAxis, V, PALETTE } from '../engine/parts.js';
import * as M from './model.js';

PALETTE.glow = ['#fff6d6', '#ffdc7a', '#f0b43c'];   // a lit filament
export const STATIONS = { wire: 0, resist: 16, ohm: 31, power: 44, cell: 57, sp: 72, combo: 90, kirch: 107, rc: 122 };
export const HS = 0.2;                 // potential as height: 0.2 units per volt, one grid square per 5 V
export const MAG = 800;                // the copper wire is drawn 800× life size
export const SPEEDUP = 10;             // and its electrons drift 10× faster than life (at that size)
export const T_COLL = 1.2;             // drawn time between collisions (really ~25 fs)
export const LEN_SCALE = 2;            // resistance wires: 2 units per metre of length
export const K_DOT = { ohm: 0.35, power: 1.2, cell: 0.18, series: 0.4, parallel: 0.12, combo: 0.3, kirch: 1.6, rc: 1500 };   // dot speed, units/s per ampere
export const K_ARROW = { ohm: 0.3, power: 1.2, cell: 0.12, series: 0.4, parallel: 0.11, combo: 0.3, kirch: 1.6, rc: 1500 };  // arrow length, units per ampere
const Y0 = 0.16, SP = 0.26;            // a flat circuit's height; spacing between dots
const fv = x => String(+x.toPrecision(3));   // a value as the tags write it: 2, 1.6, 13.5
const INK = '#2c2c30', RED = '#e5484d';

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const label = (cls, html, at, text) => labels.push({ cls, html, at, text });
  const opened = g => Math.max(g.userData.explode, 0);

  // faint graph-paper ground
  const grid = [];
  for (let x = -6; x <= 128; x++) grid.push(x, 0.001, -4, x, 0.001, 4);
  for (let z = -4; z <= 4; z++) grid.push(-6, 0.001, z, 128, 0.001, z);
  lines(root, grid, '#e6e6e2');

  // ---------- kit ----------
  const UPV = V(0, 1, 0), B4 = new THREE.Matrix4(), M4 = new THREE.Matrix4();
  const rodGeo = new THREE.CylinderGeometry(1, 1, 1, 10);
  const rod = (g, r = 0.025, name = 'Wires', pal = 'ink') => { const m = part(g, rodGeo, { tone: 'hi', pal, name }); m.scale.set(r, 1, r); m.userData.r = r; return m; };
  const stretch = (m, a, b) => { const r = m.userData.r; m.position.copy(a).add(b).multiplyScalar(0.5); m.scale.set(r, Math.max(a.distanceTo(b), 1e-4), r); m.quaternion.setFromUnitVectors(UPV, b.clone().sub(a).normalize()); };
  // a body's frame: y along p→q, x across it in the ground plane, z its normal (up when flat)
  const orient = (o, p, q) => { const d = q.clone().sub(p).normalize(), s = d.clone().cross(UPV); if (s.lengthSq() < 1e-6) s.set(1, 0, 0); s.normalize(); B4.makeBasis(s, d, s.clone().cross(d)); o.quaternion.setFromRotationMatrix(B4); o.position.copy(p).add(q).multiplyScalar(0.5); return s; };
  const zigGeo = (len, amp, n, r) => {
    const pts = [V(0, -len / 2, 0)]; for (let i = 0; i < n; i++) pts.push(V(i % 2 ? -amp : amp, -len / 2 + len * (i + 0.5) / n, 0)); pts.push(V(0, len / 2, 0));
    const path = new THREE.CurvePath(); for (let i = 0; i + 1 < pts.length; i++) path.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    return new THREE.TubeGeometry(path, pts.length * 8, r, 8, false);
  };
  const ZIG = zigGeo(0.7, 0.13, 8, 0.024), ZIG_S = zigGeo(0.42, 0.09, 6, 0.02), FIL = zigGeo(0.22, 0.06, 6, 0.012);
  const dotGeo = new THREE.SphereGeometry(0.042, 12, 8);
  function dotPool(g, n, pal = 'red', geo = dotGeo) {
    const m = new THREE.InstancedMesh(geo, shadeMat(pal), n); m.userData.noEdge = true; m.count = 0; m.frustumCulled = false; g.add(m);
    let k = 0;
    return { m, begin() { k = 0; }, put(p) { if (k < n) { M4.makeTranslation(p.x, p.y, p.z); m.setMatrixAt(k++, M4); } }, end() { m.count = k; m.instanceMatrix.needsUpdate = true; } };
  }
  const BODY = { R: 0.7, bat: 0.62, cap: 0.2, bulb: 0.5, wire: 0 };
  const kindOf = e => e.kind || (e.E !== undefined ? 'bat' : e.R !== undefined ? 'R' : 'wire');
  function body(g, e) {
    const b = new THREE.Group(); g.add(b);
    const k = kindOf(e);
    if (k === 'R') part(b, e.small ? ZIG_S : ZIG, { tone: 'hi', pal: 'ink', name: e.small ? 'Internal resistance' : 'Resistors' });
    if (k === 'bat') {
      part(b, new THREE.CylinderGeometry(0.15, 0.15, 0.5, 32), { tone: 'hi', name: 'Battery' });
      part(b, new THREE.CylinderGeometry(0.06, 0.06, 0.07, 20), { tone: 'mid', pal: 'dark', pos: [0, 0.285, 0], name: 'Battery' });
      part(b, new THREE.CylinderGeometry(0.153, 0.153, 0.08, 32), { tone: 'mid', pal: 'dark', pos: [0, -0.21, 0], name: 'Battery' });
    }
    if (k === 'cap') {
      for (const y of [-0.085, 0.085]) part(b, box(0.62, 0.035, 0.46, 0.01), { tone: 'hi', pos: [0, y, 0.0], name: 'Capacitor' });
    }
    if (k === 'bulb') {
      const glass = part(b, new THREE.SphereGeometry(0.26, 32, 20), { tone: 'hi', name: 'Bulb', mat: shadeMat('paper', { opacity: 0.38 }), ex: g.userData.asm === 'bulb' ? [0, 0, 0.9] : [0, 0, 0] });
      glass.userData.glass = true;
      part(b, FIL, { tone: 'hi', pal: 'ink', name: 'Filament' });
      for (const y of [-0.19, 0.19]) { const r = part(b, new THREE.CylinderGeometry(0.012, 0.012, 0.12, 8), { tone: 'hi', pal: 'ink', name: 'Filament' }); r.position.y = y; }
      for (const y of [-0.27, 0.27]) part(b, new THREE.CylinderGeometry(0.07, 0.07, 0.06, 20), { tone: 'mid', pal: 'dark', pos: [0, y, 0], name: 'Bulb' });
      const glow = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), shadeMat('glow', { opacity: 0.42 })); glow.userData.noEdge = true; b.add(glow); b.userData.glow = glow;
    }
    return b;
  }

  // a circuit lying on the paper. def: { edges, pos: {point: [x, z]}, at: [x, z], K, IK, Imax, Vmax, nodes, arrows, tags, plus }
  // Imax, Vmax: its largest current and potential; dots, arrows and heights scale down if they would run off
  function circuit(g, def) {
    const { edges, pos, at } = def;
    // dots slow only past 1.5× the arrows' limit, so a question's extra current still shows as faster dots
    const fit = Math.min(1, 1 / (def.IK * def.Imax)), K = def.K * Math.min(1, 1.5 / (def.IK * def.Imax)), IK = def.IK * fit, hs = HS * Math.min(1, 12 / def.Vmax);
    const P = {}; for (const k in pos) P[k] = V(at[0] + pos[k][0], Y0, at[1] + pos[k][1]);
    const items = edges.map(e => {
      const k = kindOf(e), it = { e, k, lb: BODY[k] * (e.small ? 0.65 : 1), phase: 0, mid: V(), s: V(1, 0, 0), d: V(1, 0, 0) };
      if (k === 'wire') it.w = rod(g); else { it.l1 = rod(g); it.l2 = rod(g); it.body = body(g, e); }
      return it;
    });
    const total = edges.reduce((s, e) => s + P[e.a].distanceTo(P[e.b]) + 3, 0);
    const dots = dotPool(g, Math.ceil(total / SP) + 40);
    // the flat diagram's shadow on the paper, and posts up to each point when it rises
    const flat = []; for (const e of edges) flat.push(P[e.a].x, 0.004, P[e.a].z, P[e.b].x, 0.004, P[e.b].z);
    const shadow = lines(root, flat, '#c9c9ce'); shadow.visible = false;
    const postPts = Object.keys(P), posts = lines(root, new Array(postPts.length * 6).fill(0), '#a9a9b0');
    const arrows = (def.arrows || []).map(a => ({ ...a, A: arrow(g, 'ink', { r: 0.02, head: 0.11, headR: 0.055, name: 'Current' }) }));
    const C = { P, items, h: 0, sol: null, P3: {}, IK, hs };
    for (const k in P) C.P3[k] = P[k].clone();
    const tipOf = a => (a.visible ? a.localToWorld(V(0, a.userData.arrow.shaft.scale.y + 0.16, 0)) : null);
    for (const a of arrows) label('vec', a.html, () => tipOf(a.A));
    for (const t of def.tags || []) {
      const it = items.find(i => i.e.n === t.n);
      label(t.cls || 'tick', t.html, () => it.mid.clone().addScaledVector(it.s, t.side ?? 0.42).add(V(0, t.up ?? 0.1, 0)), t.text);
    }
    for (const it of items) if (it.k === 'bat' && !def.noPlus) label('vec red', '+', () => it.mid.clone().addScaledVector(it.d, 0.42).addScaledVector(it.s, -0.24).add(V(0, 0.12, 0)));
    for (const nd of def.nodes || []) { const [n, dx = -0.08, dz = 0] = [].concat(nd);
      label('tick', '', () => (C.h > 0.45 ? C.P3[n].clone().add(V(dx, 0.28, dz)) : null), () => (def.Vmax < 0.1 ? `${((C.sol ? C.sol.V[n] : 0) * 1e3).toFixed(1)} mV` : `${(C.sol ? C.sol.V[n] : 0).toFixed(1)} V`)); }   // a question's millivolts
    C.update = (sol, h, dt) => {
      C.sol = sol; C.h = h;
      for (const k in P) C.P3[k].set(P[k].x, Y0 + h * hs * sol.V[k], P[k].z);
      dots.begin();
      items.forEach((it, i) => {
        // an ideal wire or lead is level; the whole rise or drop happens inside the element's body
        const p = C.P3[it.e.a], q = C.P3[it.e.b];
        it.d.copy(q).sub(p).normalize();
        let path = [p, q];
        if (it.w) { stretch(it.w, p, q); it.mid.copy(p).add(q).multiplyScalar(0.5); it.s.copy(it.d.clone().cross(UPV).normalize()); }
        else {
          const df = V(q.x - p.x, 0, q.z - p.z).normalize(), m = V((p.x + q.x) / 2, 0, (p.z + q.z) / 2);
          const s1 = m.clone().addScaledVector(df, -it.lb / 2).setY(p.y), s2 = m.clone().addScaledVector(df, it.lb / 2).setY(q.y);
          it.s.copy(orient(it.body, s1, s2)); it.mid.copy(it.body.position);
          if (it.k === 'bulb') {   // a bulb keeps its shape: its leads slope to meet it
            const u = s2.clone().sub(s1).normalize();
            stretch(it.l1, p, it.mid.clone().addScaledVector(u, -it.lb / 2)); stretch(it.l2, it.mid.clone().addScaledVector(u, it.lb / 2), q);
          } else { it.body.scale.set(1, s1.distanceTo(s2) / it.lb, 1); stretch(it.l1, p, s1); stretch(it.l2, s2, q); }
          path = [p, s1, s2, q];
        }
        const I = (def.I ? def.I(i) : sol.I[i]);
        it.phase = (it.phase + K * I * dt) % SP;
        let s = ((it.phase % SP) + SP) % SP;
        for (let k = 0; k + 1 < path.length; k++) {
          const a = path[k], b = path[k + 1], L = a.distanceTo(b), u = b.clone().sub(a).normalize();
          for (; s < L; s += SP) if (!(it.k === 'cap' && k === 1)) dots.put(a.clone().addScaledVector(u, s));   // no charge crosses the gap
          s -= L;
        }
      });
      dots.end();
      for (const a of arrows) {
        const it = items.find(i => i.e.n === a.n), i = items.indexOf(it), I = def.I ? def.I(i) : sol.I[i];
        const c = C.P3[it.e.a].clone().lerp(C.P3[it.e.b], a.frac ?? 0.5).add(V(a.off[0], 0.08, a.off[1]));
        const v = it.d.clone().multiplyScalar(IK * I);
        setArrow(a.A, c.clone().addScaledVector(v, -0.5), v, Math.abs(I) > 1e-9 ? 1 : 0);
      }
      for (const it of items) if (it.body && it.body.userData.glow) {
        const I = sol.I[items.indexOf(it)], Pw = I * I * it.e.R;
        it.body.userData.glow.scale.setScalar(0.27 + 0.2 * Math.sqrt(Pw / (def.Pref || 6)));
        it.body.userData.glow.visible = Pw > 1e-3;
      }
      const pa = posts.geometry.attributes.position;
      postPts.forEach((k, i) => { const q = C.P3[k]; pa.setXYZ(2 * i, q.x, 0.004, q.z); pa.setXYZ(2 * i + 1, q.x, q.y, q.z); });
      pa.needsUpdate = true; posts.visible = shadow.visible = h > 0.02;
    };
    return C;
  }
  const named = (edges, pre) => edges.map((e, i) => ({ ...e, n: e.n || pre + i }));

  // ---------- 0 · current: electrons drifting in a copper wire ----------
  const X0 = STATIONS.wire, WY = 1.0, RW = M.CU.r * MAG, WL = 7;
  const g0 = asm('wire', root, { title: 'Charge drifting in a wire', sub: 'I = nqAv_d' });
  part(g0, xAxis(new THREE.CylinderGeometry(RW, RW, WL, 48)), { tone: 'mid', name: 'Copper wire', pos: [X0, WY, 0], mat: shadeMat('paper', { opacity: 0.22 }) });
  const ring = (x, r, n = 64) => { const p = []; for (let i = 0; i < n; i++) for (const k of [i, i + 1]) { const a = 2 * Math.PI * k / n; p.push(x, WY + r * Math.cos(a), r * Math.sin(a)); } return p; };
  lines(g0, ring(X0, RW * 1.01), '#2c2c30');
  label('vec', '<i>A</i>', () => V(X0 - 0.12, WY + RW + 0.2, -0.1));
  // the ions of the lattice, fixed
  const ions = dotPool(g0, 200, 'dark', new THREE.SphereGeometry(0.028, 8, 6)); ions.begin();
  for (let x = X0 - WL / 2 + 0.2; x < X0 + WL / 2; x += 0.42) for (let j = 0; j < 7; j++) { const a = j * 2 * Math.PI / 6, r = j ? 0.27 : 0; ions.put(V(x + (j % 2) * 0.21, WY + r * Math.cos(a), r * Math.sin(a))); }
  ions.end();
  const rand = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(11);
  const NE = 110, elec = Array.from({ length: NE }, () => { const a = rand() * 2 * Math.PI, r = Math.sqrt(rand()) * (RW - 0.07); return { x: rand() * WL, y: r * Math.cos(a), z: r * Math.sin(a), ph: rand() * T_COLL }; });
  elec[0].y = 0.05; elec[0].z = RW * 0.55;
  const ePool = dotPool(g0, NE, 'blue', new THREE.SphereGeometry(0.05, 12, 8));
  const eOne = part(g0, new THREE.SphereGeometry(0.075, 16, 12), { tone: 'hi', pal: 'ink', name: 'One electron' });
  label('tick', 'one electron', () => eOne.position.clone().add(V(-0.12, 0.62, 0)));
  const DRIFT = M.CU.vd * MAG * SPEEDUP;           // drawn drift speed, units/s
  const PER_C = MAG * SPEEDUP / (M.CU.n * M.E_CH * M.CU.A);   // a changing current: drawn drift per coulomb passed
  const eArr = [-2, 0.6, 2.4].map(() => arrow(g0, 'blue', { r: 0.03, head: 0.16, headR: 0.08, name: 'Field E' }));
  eArr.forEach((a, k) => setArrow(a, V(X0 - 2.6 + k * 2.1, WY, -0.05), V(1.0, 0, 0)));
  label('vec blue', '<i>E</i>', () => V(X0 - 1.45, WY + 0.2, -0.05));
  const iArr = arrow(g0, 'ink', { r: 0.03, head: 0.16, headR: 0.08, name: 'Current I' });
  setArrow(iArr, V(X0 + 1.4, WY + RW + 0.35, 0), V(1.4, 0, 0));
  label('vec', '<i>I</i>', () => V(X0 + 3.05, WY + RW + 0.35, 0));
  const vArr = arrow(g0, 'dark', { r: 0.022, head: 0.12, headR: 0.06, name: 'Drift velocity', tone: 'mid' });
  setArrow(vArr, V(X0 + 2.8, WY - RW - 0.35, 0), V(-1.0, 0, 0));
  label('tick', 'electrons drift ←', () => V(X0 + 1.65, WY - RW - 0.35, 0));
  // breakdown: the slab of length Δx = v_d Δt just upstream of A; all of it crosses A in Δt
  const SLAB = 1.5;
  const slab = part(g0, xAxis(new THREE.CylinderGeometry(RW * 1.02, RW * 1.02, 1, 48)), { tone: 'lo', name: 'Slab AΔx', mat: shadeMat('blue', { opacity: 0.18 }) });
  slab.userData.noEdge = true;
  const slabRing = lines(g0, ring(0, RW * 1.02), '#3d63a8');
  label('tick', 'Δ<i>x</i> = <i>v</i><sub>d</sub>Δ<i>t</i>', () => (opened(g0) > 0.5 ? V(X0 + SLAB + 0.1, WY + RW + 0.25, 0) : null));

  // ---------- 1 · resistance: R = ρL/A ----------
  const X1 = STATIONS.resist, RY = 0.45, ZT = -0.75, ZK = 0.75, RT = 0.075;
  const g1 = asm('wires', root, { title: 'Two nichrome wires', sub: 'R = ρL/A' });
  const wireMat = shadeMat('paper', { opacity: 0.45 });
  const thin = part(g1, xAxis(new THREE.CylinderGeometry(RT, RT, 1, 24)), { tone: 'hi', name: 'Thin wire', mat: wireMat });
  const thick = part(g1, xAxis(new THREE.CylinderGeometry(2 * RT, 2 * RT, 1, 32)), { tone: 'hi', name: 'Thick wire', mat: wireMat });
  const strands = [0, 1, 2, 3].map(() => part(g1, xAxis(new THREE.CylinderGeometry(RT, RT, 1, 24)), { tone: 'hi', name: 'Four thin strands', mat: wireMat }));
  const LANES = [[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([a, b]) => [a * RT * 0.95, b * RT * 0.95]);
  const caps = [ZT, ZK].flatMap(z => [0, 1].map(() => part(g1, xAxis(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 32)), { tone: 'mid', pal: 'dark', name: 'Ends', pos: [0, RY, z] })));
  const rDots = dotPool(g1, 220);
  let rPhase = 0;
  const xL = X1 - 2.6;
  label('tick', '+1.5 V', () => V(xL - 0.15, RY + 0.42, ZT));
  label('tick', '0 V', () => caps[1].position.clone().add(V(0.25, 0.42, 0)));
  label('tick', '<i>d</i>', () => V(xL + 0.5, RY + 0.25, ZT));
  label('tick', '2<i>d</i>', () => V(xL + 0.5, RY + 0.33, ZK));
  label('tick', '', () => caps[1].position.clone().add(V(0.9, 0, 0)), () => `R = ${M.rThin(M.resLength(rClock)).toFixed(2)} Ω`);
  label('tick', '', () => caps[3].position.clone().add(V(0.9, 0, 0)), () => `R = ${M.rThick(M.resLength(rClock)).toFixed(2)} Ω`);
  let rClock = 0;

  // ---------- 2 · Ohm's law, as heights ----------
  const OHM_E = named(M.OHM.edges, 'w'), BULB_E = named(M.BULB.edges, 'w');
  const volts = x => (x >= 0.1 ? `${x.toFixed(1)} V` : `${(x * 1e3).toFixed(1)} mV`), ohms = x => (x >= 0.1 ? `${x.toFixed(1)} Ω` : `${(x * 1e6).toFixed(1)} µΩ`);
  const g2 = asm('ohm', root, { title: 'One battery, one resistor', sub: 'potential drawn as height' });
  const cOhm = circuit(g2, { edges: OHM_E, at: [STATIONS.ohm, 0], pos: { bl: [-1.3, 1], tl: [-1.3, -1], tr: [1.3, -1], br: [1.3, 1] }, K: K_DOT.ohm, IK: K_ARROW.ohm,
    Imax: M.OHM.E / M.OHM.R, Vmax: M.OHM.E, nodes: ['tl', 'br'], arrows: [{ n: 'w1', frac: 0.5, off: [0, -0.28], html: '<i>I</i>' }],
    tags: [{ n: 'bat', html: volts(M.OHM.E), side: 0.5 }, { n: 'R', html: ohms(M.OHM.R), side: -0.38 }] });
  const ohmE = [0, 1, 2].map(() => arrow(g2, 'blue', { r: 0.02, head: 0.1, headR: 0.05, name: 'Field in the resistor' }));
  label('vec blue', '<i>E</i>', () => (opened(g2) > 0.5 && ohmE[0].visible ? ohmE[0].localToWorld(V(0, ohmE[0].userData.arrow.shaft.scale.y + 0.15, 0)) : null));

  // ---------- 3 · power: a bulb ----------
  const BU = M.BULB;
  const g3 = asm('bulb', root, { title: `${BU.n > 1 ? 'Two' : 'A'} ${fv(BU.R)} Ω bulb${BU.n > 1 ? 's' : ''} on ${BU.ramp ? `0 → ${fv(BU.E)}` : fv(BU.E)} V`, sub: 'a bulb is a resistor that glows' });
  const cBulb = circuit(g3, { edges: BULB_E, at: [STATIONS.power, 0], pos: { bl: [-1.4, 0.9], tl: [-1.4, -0.9], tr: [1.4, -0.9], br: [1.4, 0.9] }, K: K_DOT.power, IK: K_ARROW.power,
    Imax: BU.E / (BU.n * BU.R), Vmax: BU.E, arrows: [{ n: 'w3', frac: 0.5, off: [0, 0.28], html: '<i>I</i>' }],
    tags: [{ n: 'bat', html: `${fv(BU.E)} V`, side: 0.5 }, { n: 'bulb', html: `${fv(BU.R)} Ω`, side: 0.55, up: 0.35 }, ...(BU.n > 1 ? [{ n: 'bulb2', html: `${fv(BU.R)} Ω`, side: -0.6, up: 0.35 }] : [])] });

  // ---------- 4 · a real battery: emf and internal resistance ----------
  const X4 = STATIONS.cell;
  const g4 = asm('cell', root, { title: 'A real battery', sub: 'an ideal emf with a resistor inside' });
  let cellR = M.cellLoad(0);
  const cellDef = { edges: M.cellEdges(cellR), at: [X4, 0], pos: { n0: [-1.5, 1.1], m: [-1.5, 0], p: [-1.5, -1.1], tr: [1.5, -1.1], br: [1.5, 1.1] }, K: K_DOT.cell, IK: K_ARROW.cell, noPlus: false,
    Imax: M.cellI(M.CELL.RL ?? M.CELL.Rmin), Vmax: M.CELL.E, nodes: [['p', -0.1, -0.35]], arrows: [{ n: 'w3', frac: 0.5, off: [0, -0.3], html: '<i>I</i>' }], Pref: 18,
    tags: [{ n: 'emf', html: `emf ${fv(M.CELL.E)} V`, side: 0.62 }, { n: 'r', html: `<i>r</i> ${fv(M.CELL.r)} Ω`, side: 0.45 }, { n: 'load', html: '', side: -0.5, up: 0.35, text: () => `R ${cellR.toFixed(2)} Ω` }] };
  cellDef.edges[2].n = 'w3';
  const cCell = circuit(g4, cellDef);
  // a question's fixed bulb (CELL.RL) sends the opened case further left, clear of its framing of the raised circuit
  const caseG = new THREE.Group(); caseG.userData = { home: V(), ex: V(M.CELL.RL == null ? -1.2 : -4.5, 3.2, 0) }; g4.add(caseG);
  part(caseG, box(0.62, 0.5, 2.0, 0.08), { tone: 'mid', name: 'Battery case', pos: [X4 - 1.5, Y0, 0], mat: shadeMat('paper', { opacity: 0.3 }) });
  label('tick', 'the battery', () => (opened(g4) < 0.3 ? V(X4 - 1.85, Y0 + 0.45, -0.95) : null));

  // ---------- 5 · series and parallel ----------
  const X5 = STATIONS.sp;
  const g5a = asm('series', root, { title: 'In series', sub: 'one path: same current, voltages add' });
  const SER = { edges: M.SERIES.edges.map((e, i) => ({ ...e, n: e.n || 'ws' + i })), ground: 'br' };
  const SE = M.SERIES, PA = M.PARALLEL, NB = PA.R.length;
  const cSer = circuit(g5a, { edges: SER.edges, at: [X5 - 2.15, 0], pos: { bl: [-1.4, 1], tl: [-1.4, -1], tm: [0, -1], tr: [1.4, -1], br: [1.4, 1] }, K: K_DOT.series, IK: K_ARROW.series,
    Imax: SE.E / (SE.R1 + SE.R2), Vmax: SE.E, nodes: ['tl', 'tm', 'tr'], arrows: [{ n: 'ws1', frac: 0.5, off: [-0.28, 0], html: '<i>I</i>' }],
    tags: [{ n: 'bat', html: `${fv(SE.E)} V`, side: -0.45 }, { n: 'R1', html: `R₁ ${fv(SE.R1)} Ω`, side: -0.3, up: 0.3 }, { n: 'R2', html: `R₂ ${fv(SE.R2)} Ω`, side: -0.3, up: 0.3 }] });
  const g5b = asm('parallel', root, { title: 'In parallel', sub: 'side by side: same voltage, currents add' });
  const PAR = { edges: PA.edges.map((e, i) => ({ ...e, n: e.n || 'wp' + i })), ground: PA.ground };
  // the branches spread over the same depth whatever their number (three: −1.2, −0.4, 0.4); the battery's rung at 1.25
  const pp = {}; [...PA.R.map((_, k) => (4 * (NB - 1) - 16 * (NB - 1 - k)) / (10 * Math.max(NB - 1, 1))), 1.25].forEach((z, k) => { pp['l' + k] = [-1.2, z]; pp['r' + k] = [1.2, z]; });
  const cPar = circuit(g5b, { edges: PAR.edges, at: [X5 + 2.3, 0], pos: pp, K: K_DOT.parallel, IK: K_ARROW.parallel,
    Imax: PA.E / M.parallelR(PA.R), Vmax: PA.E, nodes: ['l0', 'r0'],
    arrows: [...PA.R.map((_, k) => ({ n: 'R' + (k + 1), frac: 0.5, off: [0, 0.26], html: `<i>I</i><sub>${k + 1}</sub>` })), { n: 'wp' + (NB + 1), frac: 0.5, off: [-0.3, 0], html: '<i>I</i>' }],
    tags: [{ n: 'bat', html: `${fv(PA.E)} V`, side: -0.45 }, ...PA.R.map((r, k) => ({ n: 'R' + (k + 1), html: `${fv(r)} Ω`, side: -0.25, up: 0.25 }))] });

  // ---------- 6 · a combination, reduced step by step ----------
  const X6 = STATIONS.combo, OFF = [[-2.15, -1.55], [2.15, -1.55], [-2.15, 1.55], [2.15, 1.55]];
  const g6 = asm('combo', root, { title: 'The full circuit', sub: 'five resistors, one battery' });
  g6.userData.minDist = 19;
  const POS6 = [{ tl: [-1.5, -1], a: [0, -1], tr: [1.5, -1], br: [1.5, 1], b: [0, 1], bl: [-1.5, 1] }, { tl: [-1.5, -1], a: [0, -1], tr: [1.5, -1], br: [1.5, 1], b: [0, 1], bl: [-1.5, 1] }, { tl: [-1.5, -1], tr: [1.5, -1], br: [1.5, 1], b: [0, 1], bl: [-1.5, 1] }, { tl: [-1.5, -1], tr: [1.5, -1], br: [1.5, 1], b: [0, 1], bl: [-1.5, 1] }];
  const TAG6 = { R1: 'R₁', R2: 'R₂', R3: 'R₃', R4: 'R₄', R5: 'R₅', R245: 'R₂₄₅', R2345: 'R₂₃₄₅', Req: 'R<sub>eq</sub>' };
  const SIDE6 = { R1: -0.3, R2: -0.3, R3: 0.3, R4: 0.3, R5: 0.3, R245: 0.3, R2345: 0.3, Req: -0.3 };
  const tag6 = e => `${TAG6[e.n]} ${e.R === undefined ? 'shorted' : e.R === Infinity ? 'open' : fv(e.R) + ' Ω'}`;   // a question's short or break
  const combos = M.COMBO_STAGES.map((ed, k) => {
    const g = k === 0 ? g6 : new THREE.Group(); if (k) root.add(g);
    const edges = ed.map((e, i) => ({ ...e, n: e.n || 'w' + i }));
    const c = circuit(g, { edges, at: [X6 + OFF[k][0], OFF[k][1]], pos: POS6[k], K: K_DOT.combo, IK: K_ARROW.combo, scale: 1,
      Imax: M.COMBO.E / M.COMBO.Req, Vmax: M.COMBO.E,
      nodes: k ? [] : ['tl', 'a', 'tr', 'br'], tags: [{ n: 'bat', html: `${fv(M.COMBO.E)} V`, side: 0.38 }, ...edges.filter(e => TAG6[e.n]).map(e => ({ n: e.n, html: tag6(e), side: SIDE6[e.n], up: 0.25 }))] });
    c.sol = M.solve(edges, 'b');
    label('tick', `${k + 1}`, () => V(X6 + OFF[k][0] - 1.75, Y0 + 0.1, OFF[k][1] - 1.05));
    return c;
  });
  label('vec', '→', () => V(X6 + 0.05, Y0, -1.55)); label('vec', '↙', () => V(X6 + 0.05, Y0, 0.05)); label('vec', '→', () => V(X6 + 0.05, Y0, 1.55));

  // ---------- 7 · Kirchhoff's rules ----------
  const X7 = STATIONS.kirch;
  const g7 = asm('kirch', root, { title: 'Two batteries, two loops', sub: 'junction rule and loop rule' });
  const KP = { z: [-1.8, -1.05], a: [0, -1.05], tr: [1.8, -1.05], br: [1.8, 1.05], b: [0, 1.05], bl: [-1.8, 1.05] };
  const KI = M.KIRCH, kSol = M.solve(KI.edges, 'bl'), e2 = KI.edges.find(e => e.n === 'E2');
  const cK = circuit(g7, { edges: KI.edges, at: [X7, 0], pos: KP, K: K_DOT.kirch, IK: K_ARROW.kirch, nodes: ['z', 'a', 'tr', 'br', 'b'],
    Imax: Math.max(...kSol.I.map(Math.abs)), Vmax: Math.max(...Object.values(kSol.V).map(Math.abs)),
    arrows: [{ n: 'R1', frac: 0.5, off: [0, -0.42], html: '<i>I</i><sub>1</sub>' }, { n: 'R5', frac: 0.16, off: [0.3, 0], html: '<i>I</i><sub>2</sub>' }, { n: 'R3', frac: 0.5, off: [0, -0.42], html: '<i>I</i><sub>3</sub>' }],
    tags: [{ n: 'E1', html: `${fv(KI.E1)} V`, side: -0.5 }, ...(e2.E ? [{ n: 'E2', html: `${fv(e2.E)} V`, side: e2.a === 'tr' ? -0.48 : 0.48 }] : []),
      ...[1, 2, 3, 4, 5].map(k => ({ n: 'R' + k, html: `R${'₁₂₃₄₅'[k - 1]} ${fv(KI['R' + k])} Ω`, side: k === 2 || k === 4 ? -0.32 : 0.32, up: 0.2 }))] });
  label('tick', 'A', () => cK.P3.a.clone().add(V(0.12, 0.25, -0.22))); label('tick', 'B', () => cK.P3.b.clone().add(V(0.12, 0.25, 0.25)));
  label('tick', '1', () => V(X7 - 0.9, Y0, 0)); label('tick', '2', () => V(X7 + 1.0, Y0, 0));
  // the loop walker: round loop 1, then loop 2, adding up each ΔV
  const walker = part(g7, new THREE.SphereGeometry(0.09, 20, 14), { tone: 'hi', pal: 'blue', name: 'Loop walker' });
  let walk = { sum: 0, loop: 0 };
  label('vec blue', '', () => (opened(g7) > 0.5 ? walker.position.clone().add(V(0, 0.35, 0)) : null), () => `ΣΔ<i>V</i> = ${walk.sum >= -0.005 ? '+' : '−'}${Math.abs(walk.sum).toFixed(2)} V`);

  // ---------- 8 · RC: charge, then discharge ----------
  const X8 = STATIONS.rc;
  const g8 = asm('rc', root, { title: 'An RC circuit', sub: 'charging, then discharging' });
  const RCP = { bl: [-1.7, 1.1], sa: [-1.7, -1.1], pv: [-0.75, -1.1], sb: [-0.75, -0.3], ct: [1.7, -1.1], cb: [1.7, 1.1], pm: [-0.75, 1.1] };
  const RCE = M.RC_EDGES.map((e, i) => ({ ...e, n: e.n || 'wr' + i }));
  let rcs = M.rc(0);
  const cRC = circuit(g8, { edges: RCE, at: [X8, 0], pos: RCP, K: K_DOT.rc, IK: K_ARROW.rc, nodes: ['sa', 'ct'], I: i => rcs.I_e[i],
    Imax: M.RC.Imax, Vmax: M.RC.E, arrows: [{ n: 'R', frac: 0.5, off: [0, -0.3], html: '<i>I</i>' }],
    tags: [{ n: 'bat', html: `${fv(M.RC.E)} V`, side: -0.5 }, { n: 'R', html: `${fv(M.RC.R / 1e3)} kΩ`, side: 0.35, up: 0.22 }, { n: 'C', html: `${fv(M.RC.C * 1e6)} µF`, side: -0.6 }, { n: 'C', html: '', side: 0.75, cls: 'vec red', text: () => `+${(rcs.Q * 1e3).toFixed(2)} mC` }] });
  const capIt = cRC.items.find(i => i.e.n === 'C');
  const plus = dotPool(capIt.body, 12, 'red', new THREE.SphereGeometry(0.035, 10, 8)), minus = dotPool(capIt.body, 12, 'blue', new THREE.SphereGeometry(0.035, 10, 8));
  const SITES = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) SITES.push([(i - 1.5) * 0.14, (j - 1) * 0.13]);
  // the switch: a blade from the pivot to contact a (charge) or b (discharge)
  const blade = rod(g8, 0.03, 'Switch');
  const posts8 = ['pv', 'sa', 'sb'].map(k => ({ k, m: part(g8, new THREE.CylinderGeometry(0.06, 0.06, 0.12, 16), { tone: 'mid', pal: 'dark', name: 'Switch' }) }));
  label('tick', 'a', () => cRC.P3.sa.clone().add(V(-0.12, 0.25, -0.2))); label('tick', 'b', () => cRC.P3.sb.clone().add(V(-0.12, 0.25, 0.15)));

  // ---------- per-frame ----------
  // a question's frozen moment still flows: dots and electrons run on s.flow (real seconds) when it is given
  let lastFlow = null;
  const ohmSol = M.solve(OHM_E, 'bl'), bulbSol = M.solve(BULB_E, 'bl'), serSol = M.solve(SER.edges, 'br'), parSol = M.solve(PAR.edges, PAR.ground);
  function update(s, look) {
    const t = s.clock, tf = s.flow ?? t, dt = lastFlow === null ? 0 : Math.min(Math.max(tf - lastFlow, 0), 0.1); lastFlow = tf;

    // 0 · drifting electrons: a sawtooth in speed (accelerate, collide, stop), averaging v_d;
    // a question's changing current moves them smoothly, as far as the charge passed so far
    { const xl = X0 - WL / 2, wave = M.CU.wave; ePool.begin();
      elec.forEach((e, i) => { const dx = wave ? PER_C * M.wireQ(t) : M.drudeX(tf + e.ph, T_COLL, DRIFT), x = xl + ((((e.x - dx) % WL) + WL) % WL), p = V(x, WY + e.y, e.z); if (i) ePool.put(p); else eOne.position.copy(p); });
      ePool.end();
      if (wave) setArrow(iArr, V(X0 + 1.4, WY + RW + 0.35, 0), V(1.4 * M.wireI(t) / M.CU.I, 0, 0));
      const ex = opened(g0); slab.visible = slabRing.visible = ex > 0.02;
      slab.scale.set(1, SLAB * Math.min(ex, 1), 1); slab.position.set(X0 + SLAB * Math.min(ex, 1) / 2, WY, 0);
      slabRing.position.set(X0 + SLAB * Math.min(ex, 1), 0, 0); }

    // 1 · two wires, the length breathing
    { rClock = t; const L = M.resLength(t) * LEN_SCALE, xr = xL + L, ex = opened(g1);
      thin.position.set(xL + L / 2, RY, ZT); thin.scale.set(L, 1, 1);
      thick.position.set(xL + L / 2, RY, ZK); thick.scale.set(L, 1, 1); thick.visible = ex < 0.05;
      const spread = 1 + 3.2 * ex;
      strands.forEach((m, k) => { m.visible = ex >= 0.05; m.position.set(xL + L / 2, RY + LANES[k][0] * spread, ZK + LANES[k][1] * spread); m.scale.set(L, 1, 1); });
      caps[0].position.set(xL - 0.03, RY, ZT); caps[1].position.set(xr + 0.03, RY, ZT); caps[2].position.set(xL - 0.03, RY, ZK); caps[3].position.set(xr + 0.03, RY, ZK);
      // drift speed ∝ E = V/L, the same in both wires; the thick one has four times the carriers
      rPhase = (rPhase + 0.9 / M.resLength(t) * dt) % 0.3;
      rDots.begin();
      for (let x = rPhase; x < L; x += 0.3) { rDots.put(V(xL + x, RY, ZT)); for (const [a, b] of LANES) rDots.put(V(xL + x, RY + a * spread, ZK + b * spread)); }
      rDots.end(); }

    // 2 · Ohm: risen by the page; opened, the field along the resistor
    { const h = Math.max(look.ohm || 0, opened(g2)); cOhm.update(ohmSol, h, dt);
      const it = cOhm.items.find(i => i.e.n === 'R'), p = cOhm.P3.tr, q = cOhm.P3.br, ex = opened(g2);
      ohmE.forEach((a, k) => setArrow(a, p.clone().lerp(q, 0.22 + k * 0.22).addScaledVector(it.s, 0.28).add(V(0, 0.05, 0)), it.d.clone().multiplyScalar(0.32), ex > 0.3 ? 1 : 0)); }

    // 3 · bulb (a question's ramped voltage scales every potential and current with it)
    { const k = M.bulbE(t) / BU.E;
      cBulb.update(k === 1 ? bulbSol : { V: Object.fromEntries(Object.entries(bulbSol.V).map(([p, v]) => [p, v * k])), I: bulbSol.I.map(i => i * k) }, 0, dt); }

    // 4 · real battery: the load sweeps
    { cellR = M.cellLoad(t); const ed = cellDef.edges; ed[3].R = cellR; cCell.update(M.solve(ed, 'n0'), opened(g4), dt); }

    // 5 · series and parallel
    cSer.update(serSol, opened(g5a), dt); cPar.update(parSol, opened(g5b), dt);

    // 6 · combination
    combos.forEach((c, k) => c.update(c.sol, k ? 0 : opened(g6), dt));

    // 7 · Kirchhoff, and the loop walker when opened
    { const h = opened(g7); cK.update(kSol, h, dt);
      const W = 8, u = (t % (2 * W)) / W, L = M.KIRCH.loops[u < 1 ? 0 : 1], f = (u % 1) * (L.length - 1), i = Math.min(Math.floor(f), L.length - 2), w = f - i;
      walker.visible = h > 0.5;
      walker.position.copy(cK.P3[L[i]]).lerp(cK.P3[L[i + 1]], w).add(V(0, 0.12, 0));
      const Vnow = kSol.V[L[i]] + (kSol.V[L[i + 1]] - kSol.V[L[i]]) * w;
      walk = { sum: Vnow - kSol.V[L[0]], loop: u < 1 ? 1 : 2 }; }

    // 8 · RC
    { rcs = M.rc(t); cRC.update({ V: rcs.V, I: rcs.I_e }, opened(g8), dt);
      const n = Math.round(12 * rcs.Q / M.RC.Qmax);
      plus.begin(); minus.begin();
      for (let k = 0; k < n; k++) { plus.put(V(SITES[k][0], -0.06, SITES[k][1])); minus.put(V(SITES[k][0], 0.06, SITES[k][1])); }
      plus.end(); minus.end();
      for (const { k, m } of posts8) m.position.copy(cRC.P3[k]);
      // the blade swings over in 0.25 s when the switch flips
      const c = rcs.c, sw = c < M.RC.Tch ? Math.max(0, 1 - c / 0.25) : Math.min(1, (c - M.RC.Tch) / 0.25);
      const end = cRC.P3.sa.clone().lerp(cRC.P3.sb, sw);
      stretch(blade, cRC.P3.pv.clone().add(V(0, 0.07, 0)), end.add(V(0, 0.07, 0))); }

    for (const d of dyn) d();   // a question's marks that ride on a raised circuit
  }

  // ---------- a question's marks (premium) ----------
  // Each names its scene with c: a circuit (ohm, bulb, cell, series, parallel, combo, combo1–3, kirch, rc), 'wire' or 'wires'.
  //   { c, n, label, side? }   a label above element n (side: moved off it, across)
  //   { c, node, label }       a label above a point
  //   { c, cur, n, scale?, side? } a current arrow beside element n (inside the loop unless side < 0), cur in A
  //                            (× scale: 1e-3 for mA); held to 2 units, so a wild answer stays on the page
  //   { c, level, label }      a frame at potential `level` (V) over the circuit, shown when it is raised
  //   { c: 'rc', capAt }       the level the capacitor is at, capAt s into the cycle
  //   { c: 'wire', drift, dt } how far the electrons drift in dt s at drift µm/s (drawn 800×); { c: 'wire', label }
  //   { c: 'wires', len }      a tick at length len (m); { c: 'wires', n: 'thin' | 'thick', label }
  // red: true draws it in red (the student's number). Returns the labels.
  const CIRC = { ohm: cOhm, bulb: cBulb, cell: cCell, series: cSer, parallel: cPar, combo: combos[0], combo1: combos[1], combo2: combos[2], combo3: combos[3], kirch: cK, rc: cRC };
  let markRoot = null, dyn = [];
  function setMarks(list = []) {
    if (markRoot) { root.remove(markRoot); markRoot.traverse(o => o.geometry?.dispose()); }
    markRoot = new THREE.Group(); root.add(markRoot); dyn = [];
    const out = [];
    for (const m of list) {
      const cls = m.red ? 'qmark red' : 'qmark', col = m.red ? RED : INK;
      const tag = at => m.label && out.push({ cls, html: m.label, at });
      if (m.c === 'wire') {
        if (m.drift !== undefined) {
          const L = Math.min(m.drift * 1e-6 * m.dt * MAG, WL - 0.4), y = WY - RW - (m.red ? 0.85 : 0.65);
          const a = arrow(markRoot, m.red ? 'red' : 'ink', { r: 0.022, head: 0.12, headR: 0.06, name: 'Drift' });
          setArrow(a, V(X0 + WL / 2 - 0.2, y, 0), V(-L, 0, 0));
          tag(() => V(X0 + WL / 2 - 0.2 - L / 2, y - 0.25, 0));
        } else tag(() => V(X0 - 1.6, WY + RW + 0.75, 0));
        continue;
      }
      if (m.c === 'wires') {
        if (m.len !== undefined) {
          const x = xL + m.len * LEN_SCALE;
          lines(markRoot, [x, RY - 0.3, ZT - 0.45, x, RY + 0.3, ZT - 0.45, x, 0.004, ZT - 0.45, x, 0.004, ZK + 0.45, x, RY - 0.3, ZK + 0.45, x, RY + 0.3, ZK + 0.45], col);
          tag(() => V(x, 0.05, ZK + 0.75));
        } else tag(() => V(xL + M.resLength(rClock) * LEN_SCALE / 2, RY + 0.55, m.n === 'thick' ? ZK : ZT));
        continue;
      }
      const C = CIRC[m.c];
      if (!C) continue;
      const item = m.n && C.items.find(i => i.e.n === m.n);
      if (m.cur !== undefined && item) {
        const a = arrow(markRoot, m.red ? 'red' : 'ink', { r: 0.02, head: 0.11, headR: 0.055, name: 'Current' }), I = m.cur * (m.scale ?? 1), off = m.side ?? 0.4;
        dyn.push(() => { const v = item.d.clone().multiplyScalar(Math.max(-2, Math.min(2, C.IK * I))); setArrow(a, item.mid.clone().addScaledVector(item.s, off).add(V(0, 0.08, 0)).addScaledVector(v, -0.5), v); });
        tag(() => item.mid.clone().addScaledVector(item.s, off * 1.9).add(V(0, 0.1, 0)));
        continue;
      }
      const lv = m.capAt !== undefined ? M.rc(m.capAt).Vc : m.level;
      if (lv !== undefined) {
        const ps = Object.values(C.P), x0 = Math.min(...ps.map(p => p.x)) - 0.35, x1 = Math.max(...ps.map(p => p.x)) + 0.35;
        const z0 = Math.min(...ps.map(p => p.z)) - 0.35, z1 = Math.max(...ps.map(p => p.z)) + 0.35;
        const fr = lines(markRoot, [x0, 0, z0, x1, 0, z0, x1, 0, z0, x1, 0, z1, x1, 0, z1, x0, 0, z1, x0, 0, z1, x0, 0, z0], col, 0.8);
        dyn.push(() => { fr.visible = C.h > 0.3; fr.position.y = Y0 + C.h * C.hs * lv; });
        tag(() => (C.h > 0.3 ? V(x0 - 0.15, Y0 + C.h * C.hs * lv, (z0 + z1) / 2) : null));   // off the left edge, clear of the corner points
        continue;
      }
      if (m.node) { tag(() => C.P3[m.node].clone().add(V(0, 0.5, 0))); continue; }
      if (item) tag(() => item.mid.clone().addScaledVector(item.s, m.side ?? 0).add(V(0, 0.55, 0)));
    }
    for (const d of dyn) d();
    return out;
  }
  return { update, labels, setMarks, walk: () => walk, oneElectron: c => (c + elec[0].ph) / T_COLL };
}
