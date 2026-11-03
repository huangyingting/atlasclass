// The figure: one scene per idea, spread along +x, the camera moving between them page by page.
// Graph paper from the calculus kit for every distribution; values as small balls (a dotplot), a population as bars.
// Samples are drawn on the clock: their values lift out of the population, their statistic drops into its sampling
// distribution. Red marks the thing that matters on the page; blue the parameter (μ, p); ink and greys the rest.
import * as THREE from 'three';
import { graphBoard, curve, dot, rod, setRod, bars, region, V } from '../kit.js';
import { part, box, cyl, lines, shadeMat, TONE } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { draw: 0, sim: 24, normal: 48, clt: 72, targets: 96, prop: 120, pdiff: 146, xbar: 172, mdiff: 196 };
const TAU = Math.PI * 2;
const f2 = x => (x < 0 ? '−' : '') + Math.abs(x).toFixed(2), f1 = x => (x < 0 ? '−' : '') + Math.abs(x).toFixed(1);
const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const lerp = (a, b, u) => a + (b - a) * u;
const span = (u, a, b) => Math.min(Math.max((u - a) / (b - a), 0), 1);

// many balls of one kind, placed each frame: an InstancedMesh centred at c, pickable and lit like a part
const sphere = new Map(), sph = r => sphere.get(r) ?? sphere.set(r, new THREE.SphereGeometry(r, 16, 12)).get(r);
const M4 = new THREE.Matrix4(), QI = new THREE.Quaternion(), SC = V(), LP = V();
function balls(parent, n, r, pal, name, c, reach = 6, tone = 'mid') {
  const m = new THREE.InstancedMesh(sph(r), shadeMat(pal), n);
  m.position.copy(c); m.frustumCulled = false; m.count = 0;
  Object.assign(m.userData, { part: name, tone: TONE[tone], baseTone: TONE[tone], home: null, ex: V() });
  m.boundingSphere = new THREE.Sphere(V(), reach);
  m.boundingBox = new THREE.Box3(V(-reach, -reach, -0.5), V(reach, reach, 0.5));
  parent.add(m);
  let k = 0;
  return {
    m, begin() { k = 0; },
    put(p, s = 1) { if (s < 0.02 || k >= n) return; M4.compose(LP.subVectors(p, c), QI, SC.setScalar(s)); m.setMatrixAt(k++, M4); },
    end() { m.count = k; m.instanceMatrix.needsUpdate = true; },
  };
}
const moving = m => { m.userData.home = null; return m; };
// where dot number h (from the bottom) of a dotplot column at math x sits on board B, for dots of radius r
const slot = (B, x, h, r, out = V(), lift = 0.2) => out.copy(B.P(x, 0, lift)).add(V(0, r + h * 2 * r * 0.98, 0));
// a vertical line on board B at math x from y0 to y1 (math units)
const vline = (B, parent, x, y0, y1, pal, r = 0.025, name = 'Line') => { const m = rod(parent, { pal, r, name }); setRod(m, B.P(x, y0, 0.06), B.P(x, y1, 0.06)); return m; };
// for a board whose x range takes in 0 (where the kit would stand a y-axis in the middle of the data): axes: false,
// then this x-axis line and numbers, with any y numbers down the left edge
const fmt = v => (v < 0 ? '−' : '') + +Math.abs(v).toFixed(2);
function axisX(B, parent, xs, ys = [], xName = '', yName = '') {
  lines(parent, [...B.P(B.x0, 0, 0.003).toArray(), ...B.P(B.x1, 0, 0.003).toArray()], '#6e6e74');
  return [
    ...xs.map(x => ({ cls: 'tick', html: fmt(x), at: () => B.P(x, B.y0).add(V(0.12, -0.2, 0)) })),
    ...ys.map(y => ({ cls: 'tick', html: fmt(y), at: () => B.P(B.x0, y).add(V(-0.08, 0, 0)) })),
    ...(xName ? [{ cls: 'axis', html: xName, at: () => B.P(B.x1, B.y0).add(V(0.3, 0.5, 0)) }] : []),
    ...(yName ? [{ cls: 'axis', html: yName, at: () => B.P(B.x0, B.y1).add(V(0.25, 0.15, 0)) }] : []),
  ];
}
const range = (a, b, d) => Array.from({ length: Math.round((b - a) / d) + 1 }, (_, i) => +(a + i * d).toFixed(6));
// a glass jar of beads, `red` of them in colour pal: returns the beads' home positions, for flights out of its mouth
function jar(parent, c, r, h, nb, red, pal, seed) {
  const glass = shadeMat('base', { opacity: 0.16 }).clone(); glass.side = THREE.DoubleSide; glass.depthWrite = false;
  const wall = part(parent, new THREE.CylinderGeometry(r, r, h, 48, 1, true), { mat: glass, name: 'Jar', pos: [c.x, c.y + h / 2, c.z] });
  wall.userData.noEdge = true;
  part(parent, cyl(r, 0.08, 48), { pal: 'base', tone: 'lo', name: 'Jar', pos: [c.x, c.y + 0.04, c.z] });
  const seg = [];
  for (let i = 0; i < 64; i++) { const a0 = i / 64 * TAU, a1 = (i + 1) / 64 * TAU; seg.push(c.x + r * Math.cos(a0), c.y + h, c.z + r * Math.sin(a0), c.x + r * Math.cos(a1), c.y + h, c.z + r * Math.sin(a1)); }
  seg.push(c.x - r, c.y, c.z, c.x - r, c.y + h, c.z, c.x + r, c.y, c.z, c.x + r, c.y + h, c.z);
  lines(parent, seg, '#8a8a8f');
  const u = (() => { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; })();
  const rb = 0.1, A = balls(parent, red, rb, pal, 'Bead', c, h), Bm = balls(parent, nb - red, rb, 'paper', 'Bead', c, h);
  // beads at random in the lower part of the jar, every third-ish one coloured (a shuffled order)
  const order = Array.from({ length: nb }, (_, i) => i).sort(() => u() - 0.5), isRed = new Set(order.slice(0, red));
  A.begin(); Bm.begin();
  for (let i = 0; i < nb; i++) {
    const a = u() * TAU, d = Math.sqrt(u()) * (r - 0.16), p = V(c.x + d * Math.cos(a), c.y + 0.18 + u() * h * 0.62, c.z + d * Math.sin(a));
    (isRed.has(i) ? A : Bm).put(p);
  }
  A.end(); Bm.end();
  return V(c.x, c.y + h + 0.25, c.z);   // the mouth
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];          // per-frame updates, each (state, look) => void
  const tmp = V(), tmp2 = V();

  // ---------- opener and 5.1: a skewed population; samples of 10 lift out; each mean drops into a dotplot ----------
  {
    const D = M.DRAW, n = D.n, rS = 0.17, rD = 0.095, SHELF = -0.5;
    const PB = graphBoard(root, { at: [ST.draw - 4.5, 1.6, 0], x: [-0.5, 9.5], y: [0, 0.25], unit: [1, 11], grid: [1, 0.05], axes: false });
    const pg = asm('pop', root, { title: 'The population', sub: 'books read last summer, every student at the school' });
    bars(PB, pg, 10, { pal: 'dark', tone: 'mid', depth: 0.3, opacity: 1, name: 'Population' }).set(M.POP_P.map((p, v) => [v - 0.4, v + 0.4, p]));
    vline(PB, pg, M.MU, 0, 0.25, 'blue', 0.022, 'μ');
    const XB = graphBoard(root, { at: [ST.draw - 4.5, -6.2, 0], x: [-0.5, 9.5], y: [0, 3], unit: [1, 1], grid: [1, 0], axes: false });
    const tg = asm('tray', root, { title: 'One sample', sub: `${n} students chosen at random; the cone is their mean, x̄`, focus: () => ({ target: [ST.draw, SHELF + 0.6, 0], radius: 5.4 }) });
    part(tg, box(10.2, 0.08, 0.7), { pal: 'base', tone: 'lo', name: 'Sample', pos: [ST.draw, SHELF - 0.04, 0.3] });
    const sb = balls(tg, n, rS, 'red', 'Sample', V(ST.draw, SHELF, 0.3), 6, 'hi');
    const cone = moving(part(tg, new THREE.ConeGeometry(0.2, 0.36, 24), { pal: 'red', tone: 'hi', name: 'x̄', pos: [0, SHELF - 0.26, 0.3] }));
    const xg = asm('xbars', root, { title: 'The sampling distribution of x̄', sub: `the means of ${D.k} samples of ${n}`, focus: () => ({ target: [ST.draw, -4.6, 0], radius: 5.6 }) });
    const db = balls(xg, D.k, rD, 'ink', 'Sample mean', V(ST.draw, -5, 0), 7);
    const fall = moving(dot(xg, { pal: 'red', r: rD, name: 'Sample mean' }));
    vline(XB, xg, M.MU, 0, 3, 'blue', 0.022, 'μ');
    let cur = null;
    labels.push(...axisX(PB, root, range(0, 9, 1), [0.1, 0.2], 'books', 'proportion'), ...axisX(XB, root, range(0, 9, 1), [], '<i>x̄</i>'),
      mark('the population', () => PB.P(5.2, 0.25).add(V(0, 0.55, 0)), 'board'),
      mark(`μ = ${M.MU.toFixed(2)}`, () => PB.P(M.MU, 0.25).add(V(0.15, 0.25, 0))),
      mark(`means of samples of ${n}`, () => XB.P(5.2, 3).add(V(0, 0.4, 0)), 'board'),
      live(() => cur ? V(ST.draw + 5.6, SHELF + 0.5, 0) : null, () => cur ? `<i>x̄</i> = ${cur.m.toFixed(1)}` : '', 'board'));
    const pos = V();
    ups.push(s => {
      const { i, u } = M.drawAt(M.clk(s, 'draw'));
      db.begin(); for (let k = 0; k < i; k++) db.put(slot(XB, ...M.DRAW_DOTS[k], rD, pos)); db.end();
      const held = i >= D.k, j0 = held ? D.k - 1 : i, uu = held ? 0.55 : u;
      cur = { m: M.DRAW_M[j0], vals: D.samples[j0] };
      sb.begin();
      {
        const seen = {};
        cur.vals.forEach((v, j) => {
          const h = seen[v] = (seen[v] ?? -1) + 1, w = span(uu, j * 0.02, j * 0.02 + 0.22);
          const a = PB.P(v, M.POP_P[v], 0.3), b = V(PB.P(v, 0).x, SHELF + rS + h * 2 * rS, 0.3);
          if (w > 0) sb.put(pos.lerpVectors(a, b, M.smooth(w)).add(V(0, Math.sin(Math.PI * w) * 0.8, 0)), Math.min(1, w * 4));
        });
      }
      sb.end();
      cone.visible = uu > 0.45;
      if (cone.visible) cone.position.set(PB.P(cur.m, 0).x, SHELF - 0.26, 0.3);
      fall.visible = !held && u > 0.62;
      if (fall.visible) { const w = M.smooth(span(u, 0.62, 0.98)); fall.position.lerpVectors(V(PB.P(cur.m, 0).x, SHELF - 0.6, 0.2), slot(XB, ...M.DRAW_DOTS[i], rD, tmp), w); }
    });
  }

  // ---------- 5.1 is it just chance? 100 simulated samples of 40 under the claim p = 0.5 ----------
  {
    const S = M.SIM, r = 0.2, rf = 0.16;
    const SB = graphBoard(root, { at: [ST.sim - 0.5 * 18, -5.6, 0], x: [0.25, 0.75], y: [0, 7.2], unit: [18, 1], grid: [0.05, 0], ticks: [0.1, 0] });
    const fg = asm('flips', root, { title: 'One simulated sample', sub: `${S.n} people, each “yes” with probability ${S.p}`, focus: () => ({ target: [ST.sim, 3, 0], radius: 4.6 }) });
    const yes = balls(fg, S.n, rf, 'red', 'Yes', V(ST.sim, 3, 0), 5, 'hi'), no = balls(fg, S.n, rf, 'paper', 'No', V(ST.sim, 3, 0), 5);
    const at = j => V(ST.sim + ((j % 20) - 9.5) * 0.42, 3.25 - Math.floor(j / 20) * 0.42, 0.2);
    const dg = asm('simDots', root, { title: 'The simulated sampling distribution', sub: `p̂ in ${S.k} samples of ${S.n}, if p = ${S.p}`, focus: () => ({ target: [ST.sim, -2.4, 0], radius: 5.6 }) });
    const db = balls(dg, S.k, r, 'ink', 'Simulated p̂', V(ST.sim, -3, 0), 7);
    const fall = moving(dot(dg, { pal: 'red', r, name: 'Simulated p̂' }));
    const tgp = asm('simTail', root, { title: 'As extreme as what was observed', sub: `simulated samples with p̂ ≥ ${M.SIM_OBS}`, focus: () => ({ target: [ST.sim + 3, -3, 0], radius: 3.6 }) });
    const tb = balls(tgp, S.k, r, 'red', 'p̂ ≥ observed', V(ST.sim + 3, -3, 0), 6, 'hi');
    vline(SB, tgp, M.SIM_OBS - 0.0125, 0, 7.2, 'red', 0.03, 'Observed');
    vline(SB, dg, S.p, 0, 7.2, 'blue', 0.022, 'Claimed p');
    let cur = null, inTail = 0;
    labels.push(...SB.tickLabels({ xName: '<i>p̂</i>', yName: '' }).filter(L => L.html !== '<i></i>'),
      mark(`claimed <i>p</i> = ${S.p}`, () => SB.P(S.p, 7.2).add(V(-0.1, 0.3, 0))),
      mark(`observed <i>p̂</i> = ${S.obs}/${S.n} = ${M.SIM_OBS.toFixed(3)}`, () => SB.P(M.SIM_OBS, 7.2).add(V(0.2, 0.3, 0))),
      live(() => SB.P(0.705, 2.6), () => `${inTail} of ${S.k}<br>at or beyond`),
      live(() => cur !== null ? V(ST.sim, 4.0, 0) : null, () => cur !== null ? `${M.SIM_X[cur]} yes of ${S.n}: <i>p̂</i> = ${M.SIM_PH[cur].toFixed(3)}` : '', 'mark'));
    const pos = V();
    ups.push(s => {
      const { i, u } = M.simAt(M.clk(s, 'sim'));
      db.begin(); tb.begin(); inTail = 0;
      for (let k = 0; k < i; k++) { const t = M.SIM_X[k] >= S.obs; (t ? tb : db).put(slot(SB, ...M.SIM_DOTS[k], r, pos)); inTail += t; }
      db.end(); tb.end();
      const held = i >= S.k; cur = held ? S.k - 1 : i;
      yes.begin(); no.begin();
      S.samples[cur].forEach((y, j) => { const w = held ? 1 : span(u, j * 0.011, j * 0.011 + 0.06); if (w > 0) (y ? yes : no).put(at(j), w); });
      yes.end(); no.end();
      fall.visible = !held && u > 0.6;
      if (fall.visible) fall.position.lerpVectors(V(ST.sim, 2.3, 0.2), slot(SB, ...M.SIM_DOTS[i], r, tmp), M.smooth(span(u, 0.6, 0.97)));
    });
  }

  // ---------- 5.2 apple weights, N(150, 12): an area, a cut-off; then a sample and its mean ----------
  {
    const A = M.APPLE, rS = 0.13;
    const B = graphBoard(root, { at: [ST.normal - A.mu * 0.125, -2.2, 0], x: [110, 190], y: [0, 0.04], unit: [0.125, 100], grid: [10, 0.01], ticks: [10, 0.01] });
    const f = x => M.normPdf(x, A.mu, A.sigma);
    const cg = asm('apples', root, { title: 'Apple weights', sub: `approximately normal, μ = ${A.mu} g, σ = ${A.sigma} g` });
    curve(B, cg, f, 110, 190, { r: 0.045, pal: 'ink' });
    const ag = asm('area', root, { title: `P(${A.a} < X < ${A.b})`, sub: 'the area under the curve between the two weights' });
    region(B, ag, { pal: 'red', opacity: 0.3 }).set(() => 0, f, A.a, A.b);
    vline(B, ag, A.a, 0, f(A.a), 'red', 0.03, 'Lower bound'); vline(B, ag, A.b, 0, f(A.b), 'red', 0.03, 'Upper bound');
    const kg = asm('cut', root, { title: 'The heaviest 10%', sub: 'the weight with an area of 0.10 above it' });
    region(B, kg, { pal: 'blue', opacity: 0.3 }).set(() => 0, f, M.CUT, 190);
    vline(B, kg, M.CUT, 0, 0.032, 'blue', 0.03, 'Cut-off');
    const sg = asm('sampleN', root, { title: 'A random sample of 8 apples', sub: 'each ball one apple’s weight' });
    const sb = balls(sg, M.APS.n, rS, 'ink', 'Apple', B.P(A.mu, 0), 6);
    const mg = asm('xbarMark', root, { title: 'The statistic: x̄', sub: 'the mean of this sample, a different number each sample' });
    const mr = rod(mg, { pal: 'red', r: 0.04, name: 'x̄' }), mb = moving(dot(mg, { pal: 'red', r: 0.16, name: 'x̄' }));
    const pg = asm('muMark', root, { title: 'The parameter: μ', sub: 'the mean of all the apples: one fixed number' });
    vline(B, pg, A.mu, 0, 0.04, 'blue', 0.03, 'μ');
    let cur = null, show = { calc: 1, sample: 0 };
    const stacks = M.APS.samples.map(smp => { const out = []; smp.forEach((x, j) => { let h = 0; for (let k = 0; k < j; k++) if (Math.abs(smp[k] - x) * B.ux < 2 * rS && out[k] === h) h++; out.push(h); }); return out; });
    labels.push(...B.tickLabels({ xName: 'weight (g)', yName: '' }).filter(L => L.html !== '<i></i>'),
      mark('μ', () => B.P(A.mu, 0.04).add(V(0, 0.25, 0)), 'vec blue'),
      live(() => show.calc > 0.5 ? B.P(145, 0.014) : null, () => M.P_AB.toFixed(3), 'vec red'),
      live(() => show.calc > 0.5 ? B.P(M.CUT, 0.032).add(V(0.4, 0.25, 0)) : null, () => `top 10%: ${M.CUT.toFixed(1)} g`, 'mark'),
      live(() => show.sample > 0.5 && cur ? B.P(cur.m, 0.034).add(V(cur.m < A.mu ? -1.1 : 1.1, 0.15, 0)) : null, () => cur ? `<i>x̄</i> = ${cur.m.toFixed(1)} g` : '', 'mark'));
    const pos = V();
    ups.push((s, look) => {
      show = look;
      ag.visible = kg.visible = look.calc > 0.5; sg.visible = mg.visible = look.sample > 0.5;
      const { i, u } = M.apsAt(M.clk(s, 'normal'));
      const smp = M.APS.samples[i]; cur = { m: M.APS_M[i] };
      sb.begin();
      smp.forEach((x, j) => { const w = M.smooth(span(u, j * 0.03, j * 0.03 + 0.12)); slot(B, x, stacks[i][j], rS, pos, 0.15); pos.y += (1 - w) * 3; if (w > 0) sb.put(pos); });
      sb.end();
      const on = u > 0.4; mr.visible = mb.visible = on; if (!on) cur = null;
      if (on) { setRod(mr, B.P(M.APS_M[i], 0, 0.1), B.P(M.APS_M[i], 0.034, 0.1)); mb.position.copy(B.P(M.APS_M[i], 0.034, 0.1)); }
    });
  }

  // ---------- 5.3 the central limit theorem: the population, then the means of 400 samples of 2, 10 and 30 ----------
  {
    const ys = [4.4, 1.3, -1.7, -4.7], uy = 2;
    const PB = graphBoard(root, { at: [ST.clt - 4.5, ys[0], 0], x: [-0.5, 9.5], y: [0, 0.3], unit: [1, 6.4], grid: [1, 0.1], axes: false });
    const pg = asm('popC', root, { title: 'The population', sub: `skewed right; μ = ${M.MU.toFixed(2)}, σ = ${M.SIGMA.toFixed(2)} books` });
    bars(PB, pg, 10, { pal: 'dark', depth: 0.25, opacity: 1, name: 'Population' }).set(M.POP_P.map((p, v) => [v - 0.4, v + 0.4, p]));
    labels.push(...axisX(PB, root, range(0, 9, 1), [0.1, 0.2, 0.3], 'books'), mark('the population', () => PB.P(5, 0.3).add(V(0, 0.4, 0)), 'board'));
    const hs = [];
    M.CLT.ns.forEach((n, j) => {
      const B = graphBoard(root, { at: [ST.clt - 4.5, ys[j + 1], 0], x: [-0.5, 9.5], y: [0, 1], unit: [1, uy], grid: [1, 0], axes: false });
      const sum = M.CLT_SUM[j];
      const g = asm(`n${n}`, root, { title: `Means of samples of ${n}`, sub: `${M.CLT.k} samples; the curve is normal with mean μ and SD σ/√${n}` });
      const hb = bars(B, g, 60, { pal: 'dark', depth: 0.25, opacity: 1, name: `x̄, n = ${n}` });
      curve(B, g, x => M.normPdf(x, M.MU, sum.se), -0.5, 9.5, { r: 0.04, pal: 'red', name: 'Normal model' });
      hs.push([j, hb]);
      labels.push(...axisX(B, root, range(0, 9, 1), [], '<i>x̄</i>'),
        mark(`<i>n</i> = ${n}`, () => B.P(5, 1).add(V(0, 0.35, 0)), 'board'),
        mark(`σ/√${n} = ${sum.se.toFixed(2)}`, () => B.P(9.4, 0.8), 'tick'));
    });
    // μ through every board: the centre does not move
    const mu = rod(pg, { pal: 'blue', r: 0.02, name: 'μ' }); setRod(mu, V(ST.clt - 4.5 + M.MU, ys[3], 0.08), V(ST.clt - 4.5 + M.MU, ys[0] + 0.3 * 6.4, 0.08));
    labels.push(mark('μ', () => V(ST.clt - 4.5 + M.MU, ys[0] + 2.2, 0), 'vec blue'));
    ups.push(s => { const L = M.cltAt(M.clk(s, 'clt')); for (const [j, hb] of hs) hb.set(M.cltBars(j, L)); });
  }

  // ---------- 5.4 four estimators as four targets: the bullseye is the parameter, each dart one sample's estimate ----------
  {
    const R = M.TG.R, cs = [[-2.15, 2.0], [2.15, 2.0], [-2.15, -2.6], [2.15, -2.6]];
    const discGeo = cyl(R, 0.08, 64).rotateX(Math.PI / 2);
    const hit = [];
    M.TG.list.forEach((t, k) => {
      const c = V(ST.targets + cs[k][0], cs[k][1], 0);
      const g = asm(t.key, root, { title: t.title, sub: 'each dart is the estimate from one sample' });
      part(g, discGeo, { pal: 'board', tone: 'lo', name: 'Target', pos: [c.x, c.y, c.z] });
      const seg = [];
      for (const rr of [R / 4, R / 2, 3 * R / 4, R]) for (let i = 0; i < 64; i++) { const a0 = i / 64 * TAU, a1 = (i + 1) / 64 * TAU; seg.push(c.x + rr * Math.cos(a0), c.y + rr * Math.sin(a0), 0.045, c.x + rr * Math.cos(a1), c.y + rr * Math.sin(a1), 0.045); }
      lines(g, seg, '#b4b4b8');
      part(g, cyl(0.13, 0.1, 24).rotateX(Math.PI / 2), { pal: 'blue', tone: 'hi', name: 'The parameter', pos: [c.x, c.y, 0.05] });
      const darts = balls(g, M.TG.darts, 0.085, k === 0 ? 'red' : 'ink', 'Estimate', c, R + 1, 'hi');
      hit.push([t, c, darts]);
      labels.push(mark(t.title.replace(', ', ',<br>'), () => c.clone().add(V(0, R + 0.55, 0)), 'mark'));
    });
    let shown = 0;
    const pos = V();
    ups.push(s => {
      shown = M.tgAt(M.clk(s, 'targets'));
      for (const [t, c, d] of hit) { d.begin(); for (let k = 0; k < shown; k++) d.put(pos.set(c.x + t.darts[k][0], c.y + t.darts[k][1], 0.12)); d.end(); }
    });
  }

  // ---------- 5.5 sample proportions: a jar at p = 0.35; scoops of 50; each p̂ drops into a dotplot ----------
  {
    const P = M.PROP, r = 0.18, rb = 0.14;
    const jc = V(ST.prop - 3.4, 1.2, 0);
    const jg = asm('jar', root, { title: 'The population', sub: `${P.N.toLocaleString('en-US')} students; ${P.p * 100}% walk to school (red)` });
    const mouth = jar(jg, jc, 1.3, 3, P.beads, Math.round(P.p * P.beads), 'red', 17);
    const sg = asm('scoop', root, { title: 'One random sample', sub: `${P.n} students; p̂ is the proportion red`, focus: () => ({ target: [ST.prop + 1.2, 2.4, 0], radius: 2.6 }) });
    const slotOf = j => V(ST.prop - 0.6 + (j % 10) * 0.4, 3.2 - Math.floor(j / 10) * 0.4, 0.2);
    part(sg, box(4.2, 2.2, 0.06), { pal: 'board', tone: 'lo', name: 'Sample', pos: [ST.prop + 1.2, 2.4, -0.05] });
    const ry = balls(sg, P.n, rb, 'red', 'Walks', V(ST.prop + 1.2, 2.4, 0), 4, 'hi'), rn = balls(sg, P.n, rb, 'paper', 'Does not walk', V(ST.prop + 1.2, 2.4, 0), 4);
    const B = graphBoard(root, { at: [ST.prop - 0.375 * 20, -5.0, 0], x: [0.15, 0.6], y: [0, 5], unit: [20, 1], grid: [0.05, 0], ticks: [0.05, 0] });
    const dg = asm('phats', root, { title: 'The sampling distribution of p̂', sub: `p̂ from ${P.k} samples of ${P.n}`, focus: () => ({ target: [ST.prop, -2.6, 0], radius: 5.2 }) });
    const db = balls(dg, P.k, r, 'ink', 'Sample proportion', V(ST.prop, -3, 0), 7);
    const fall = moving(dot(dg, { pal: 'red', r, name: 'Sample proportion' }));
    vline(B, dg, P.p, 0, 5, 'blue', 0.022, 'p');
    const kg = asm('phatCurve', root, { title: 'The normal model for p̂', sub: `mean p = ${P.p}, SD √(p(1 − p)/n) = ${M.PROP_SD.toFixed(4)}` });
    const sc = P.k * 0.02 * 2 * r * 0.98, fc = x => sc * M.normPdf(x, P.p, M.PROP_SD);
    curve(B, kg, fc, 0.15, 0.6, { r: 0.045, pal: 'red', name: 'Normal model' });
    region(B, kg, { pal: 'red', opacity: 0.3 }).set(() => 0, fc, P.cut, 0.6);
    vline(B, kg, P.cut, 0, 4.6, 'red', 0.025, 'p̂ = 0.45');
    let cur = null;
    labels.push(...B.tickLabels({ xName: '<i>p̂</i>', yName: '' }).filter(L => L.html !== '<i></i>'),
      mark(`<i>p</i> = ${P.p}`, () => B.P(P.p, 5).add(V(0, 0.3, 0)), 'mark'),
      mark(`<i>n</i> = ${P.n}`, () => V(ST.prop + 1.2, 3.95, 0), 'mark'),
      live(() => cur !== null ? V(ST.prop + 1.2, 0.85, 0) : null, () => cur !== null ? `${M.PROP_X[cur]}/${P.n} walk: <i>p̂</i> = ${M.PROP_PH[cur].toFixed(2)}` : '', 'mark'));
    const curveLbl = live(() => kg.visible ? B.P(P.cut, 4.6).add(V(0.25, 0.3, 0)) : null, () => `<i>p̂</i> ≥ ${P.cut}: ${M.PROP_TAIL.toFixed(3)}`, 'mark');
    labels.push(curveLbl);
    const pos = V();
    ups.push((s, look) => {
      kg.visible = look.curve > 0.5;
      const { i, u } = M.propAt(M.clk(s, 'prop'));
      db.begin(); for (let k = 0; k < i; k++) db.put(slot(B, ...M.PROP_DOTS[k], r, pos)); db.end();
      const held = i >= P.k; cur = held ? P.k - 1 : i;
      ry.begin(); rn.begin();
      P.samples[cur].forEach((y, j) => {
        const w = held ? 1 : span(u, j * 0.008, j * 0.008 + 0.12);
        if (w > 0) (y ? ry : rn).put(pos.lerpVectors(mouth, slotOf(j), M.smooth(w)).add(V(0, Math.sin(Math.PI * w) * 0.9, 0)));
      });
      ry.end(); rn.end();
      fall.visible = !held && u > 0.62;
      if (fall.visible) fall.position.lerpVectors(V(ST.prop + 1.2, 1.1, 0.2), slot(B, ...M.PROP_DOTS[i], r, tmp), M.smooth(span(u, 0.62, 0.97)));
    });
  }

  // ---------- 5.6 two jars, two sample proportions; their difference drops into a dotplot ----------
  {
    const P = M.PD, r = 0.17;
    const jg = asm('jars', root, { title: 'Two populations', sub: `district 1: ${P.p1 * 100}% walk (ink); district 2: ${P.p2 * 100}% walk (blue)` });
    const m1 = jar(jg, V(ST.pdiff - 2.6, 1.5, 0), 0.95, 2.1, 140, Math.round(P.p1 * 140), 'ink', 23);
    const m2 = jar(jg, V(ST.pdiff + 2.6, 1.5, 0), 0.95, 2.1, 140, Math.round(P.p2 * 140), 'blue', 29);
    const SB = graphBoard(root, { at: [ST.pdiff - 0.3 * 15, 0.15, 0], x: [0, 0.6], y: [0, 0.03], unit: [15, 10], grid: [0.1, 0], ticks: [0.1, 0] });
    const sg = asm('pstrip', root, { title: 'This pair of samples', sub: `p̂₁ from ${P.n1} in district 1, p̂₂ from ${P.n2} in district 2; the red bar is p̂₁ − p̂₂`, focus: () => ({ target: [ST.pdiff, 0.6, 0], radius: 4.8 }) });
    const b1 = moving(dot(sg, { pal: 'ink', r: 0.2, name: 'p̂₁' })), b2 = moving(dot(sg, { pal: 'blue', r: 0.2, name: 'p̂₂' }));
    const gap = rod(sg, { pal: 'red', r: 0.06, name: 'p̂₁ − p̂₂' });
    const B = graphBoard(root, { at: [ST.pdiff - 0.1 * 18, -5.6, 0], x: [-0.15, 0.35], y: [0, 4.2], unit: [18, 1], grid: [0.05, 0], axes: false });
    const dg = asm('diffs', root, { title: 'The sampling distribution of p̂₁ − p̂₂', sub: `${P.k} pairs of samples`, focus: () => ({ target: [ST.pdiff, -3.6, 0], radius: 5.2 }) });
    const db = balls(dg, P.k, r, 'ink', 'Difference', V(ST.pdiff, -3.6, 0), 7);
    const fall = moving(dot(dg, { pal: 'red', r, name: 'Difference' }));
    const mg = asm('diffModel', root, { title: 'The normal model for p̂₁ − p̂₂', sub: `mean p₁ − p₂ = ${P.p1 - P.p2 < 0 ? '−' : ''}${Math.abs(P.p1 - P.p2).toFixed(2)}, SD ${M.PD_SD.toFixed(4)}` });
    const sc = P.k * P.w * 2 * r * 0.98, fc = x => sc * M.normPdf(x, M.PD_MU, M.PD_SD);
    curve(B, mg, fc, -0.15, 0.35, { r: 0.045, pal: 'red', name: 'Normal model' });
    region(B, mg, { pal: 'red', opacity: 0.3 }).set(() => 0, fc, -0.15, 0);
    vline(B, mg, 0, 0, 4.2, 'ink', 0.02, 'Zero');
    let cur = null;
    labels.push(...SB.tickLabels({ xName: 'proportion', yName: '' }).filter(L => L.html !== '<i></i>'), ...axisX(B, root, range(-0.1, 0.3, 0.1), [], '<i>p̂</i><sub>1</sub> − <i>p̂</i><sub>2</sub>'),
      mark(`district 1, <i>n</i> = ${P.n1}`, () => V(ST.pdiff - 2.6, 4.05, 0)), mark(`district 2, <i>n</i> = ${P.n2}`, () => V(ST.pdiff + 2.6, 4.05, 0)),
      mark(`<i>p̂</i><sub>1</sub> − <i>p̂</i><sub>2</sub> &lt; 0: ${M.PD_LESS0.toFixed(3)}`, () => B.P(-0.06, 2.4).add(V(0, 0.3, 0)), 'mark'),
      live(() => cur !== null ? V(ST.pdiff, 3.2, 0) : null, () => cur !== null ? `${f2(P.pairs[cur][0])} − ${f2(P.pairs[cur][1])} = ${f2(M.PD_D[cur])}` : '', 'mark'));
    const pos = V();
    ups.push(s => {
      const { i, u } = M.pdAt(M.clk(s, 'pdiff'));
      db.begin(); for (let k = 0; k < i; k++) db.put(slot(B, ...M.PD_DOTS[k], r, pos)); db.end();
      const held = i >= P.k, uu = held ? 0.6 : u; cur = held ? P.k - 1 : i;
      gap.visible = false; fall.visible = false;
      const [p1, p2] = P.pairs[cur], w = M.smooth(span(uu, 0, 0.32));
      const e1 = SB.P(p1, 0.012, 0.25), e2 = SB.P(p2, 0.012, 0.25);
      b1.position.lerpVectors(m1, e1, w).y += Math.sin(Math.PI * w) * 0.6; b2.position.lerpVectors(m2, e2, w).y += Math.sin(Math.PI * w) * 0.6;
      const g = span(uu, 0.36, 0.56); gap.visible = g > 0;
      if (g > 0) setRod(gap, e2.clone().add(V(0, 0.35, 0)), tmp2.lerpVectors(e2, e1, g).add(V(0, 0.35, 0)));
      fall.visible = !held && u > 0.62;
      if (fall.visible) fall.position.lerpVectors(tmp2.lerpVectors(e1, e2, 0.5).add(V(0, 0.35, 0)), slot(B, ...M.PD_DOTS[i], r, tmp), M.smooth(span(u, 0.62, 0.97)));
    });
  }

  // ---------- 5.7 sample means of 9 apples: the population curve and the narrower curve of x̄ ----------
  {
    const X = M.XB, rS = 0.12;
    const B = graphBoard(root, { at: [ST.xbar - X.mu * 0.125, -2.6, 0], x: [110, 190], y: [0, 0.11], unit: [0.125, 40], grid: [10, 0.02], ticks: [10, 0.02] });
    const fp = x => M.normPdf(x, X.mu, X.sigma), fx = x => M.normPdf(x, X.mu, M.XB_SE);
    const pg = asm('popX', root, { title: 'One apple’s weight, X', sub: `N(${X.mu}, ${X.sigma})` });
    curve(B, pg, fp, 110, 190, { r: 0.04, pal: 'ink' });
    region(B, pg, { pal: 'blue', opacity: 0.22 }).set(() => 0, fp, X.cut, 190);
    const xg = asm('xbarX', root, { title: `The mean of ${X.n} apples, x̄`, sub: `N(${X.mu}, ${X.sigma}/√${X.n}) = N(${X.mu}, ${M.XB_SE})` });
    curve(B, xg, fx, 110, 190, { r: 0.05, pal: 'red', n: 400 });
    region(B, xg, { pal: 'red', opacity: 0.35 }).set(() => 0, fx, X.cut, 190);
    vline(B, xg, X.cut, 0, fx(X.cut), 'red', 0.025, 'x̄ = 155');
    const sg = asm('sampleX', root, { title: `A sample of ${X.n} apples`, sub: 'its values (ink) and its mean (red)' });
    const sb = balls(sg, X.n, rS, 'ink', 'Apple', B.P(X.mu, 0), 6);
    const mr = rod(sg, { pal: 'red', r: 0.04, name: 'x̄' });
    const stacks = X.samples.map(smp => { const out = []; smp.forEach((x, j) => { let h = 0; for (let k = 0; k < j; k++) if (Math.abs(smp[k] - x) * B.ux < 2 * rS && out[k] === h) h++; out.push(h); }); return out; });
    let cur = null;
    labels.push(...B.tickLabels({ xName: 'weight (g)', yName: '' }).filter(L => L.html !== '<i></i>'),
      mark('<i>x̄</i>', () => B.P(X.mu + 6, fx(X.mu + 6)).add(V(0.35, 0.15, 0)), 'vec red'),
      mark('<i>X</i>', () => B.P(X.mu - 22, fp(X.mu - 22)).add(V(-0.2, 0.3, 0)), 'vec'),
      mark(`<i>P</i>(<i>x̄</i> &gt; ${X.cut}) = ${M.XB_P.toFixed(3)}`, () => B.P(163, 0.062), 'mark'),
      mark(`<i>P</i>(<i>X</i> &gt; ${X.cut}) = ${M.XB_P1.toFixed(3)}`, () => B.P(176, 0.012).add(V(0, 0.2, 0)), 'mark'),
      live(() => cur !== null ? B.P(M.XB_M[cur], 0).add(V(0, -0.9, 0)) : null, () => cur !== null ? `<i>x̄</i> = ${M.XB_M[cur].toFixed(1)}` : '', 'mark'));
    const pos = V();
    ups.push(s => {
      const { i, u } = M.xbAt(M.clk(s, 'xbar'));
      sb.begin();
      X.samples[i].forEach((x, j) => { const w = M.smooth(span(u, j * 0.03, j * 0.03 + 0.12)); slot(B, x, stacks[i][j], rS, pos, 0.15); pos.y += (1 - w) * 3; if (w > 0) sb.put(pos); });
      sb.end();
      const on = u > 0.4; mr.visible = on; cur = on ? i : null;
      if (on) setRod(mr, B.P(M.XB_M[i], 0, 0.1).add(V(0, -0.6, 0)), B.P(M.XB_M[i], 0, 0.1));
    });
  }

  // ---------- 5.8 two sample means and their difference ----------
  {
    const D = M.MD, r = 0.17;
    const T = graphBoard(root, { at: [ST.mdiff - 145 * 0.2, 0.6, 0], x: [120, 170], y: [0, 0.17], unit: [0.2, 20], grid: [5, 0.05], ticks: [10, 0.05] });
    const fa = x => M.normPdf(x, D.A.mu, D.A.se), fb = x => M.normPdf(x, D.B.mu, D.B.se);
    const ag = asm('xbarA', root, { title: `Means of ${D.A.n} variety A apples`, sub: `mean ${D.A.mu} g, SD ${D.A.sigma}/√${D.A.n} = ${D.A.se} g` });
    curve(T, ag, fa, 120, 170, { r: 0.04, pal: 'ink', n: 300 });
    const bg = asm('xbarB', root, { title: `Means of ${D.B.n} variety B apples`, sub: `mean ${D.B.mu} g, SD ${D.B.sigma}/√${D.B.n} = ${D.B.se} g` });
    curve(T, bg, fb, 120, 170, { r: 0.04, pal: 'blue', n: 300 });
    const ba = moving(dot(ag, { pal: 'ink', r: 0.2, name: 'x̄, variety A' })), bb = moving(dot(bg, { pal: 'blue', r: 0.2, name: 'x̄, variety B' }));
    const B = graphBoard(root, { at: [ST.mdiff - 10 * 0.2, -4.6, 0], x: [-15, 35], y: [0, 0.09], unit: [0.2, 30], grid: [5, 0.02], axes: false });
    const fd = x => M.normPdf(x, M.MD_MU, M.MD_SD);
    const dg = asm('mdiff', root, { title: 'The difference of the two means', sub: `normal, mean ${M.MD_MU} g, SD √(${D.A.sigma}²/${D.A.n} + ${D.B.sigma}²/${D.B.n}) = ${M.MD_SD.toFixed(2)} g` });
    curve(B, dg, fd, -15, 35, { r: 0.05, pal: 'red', n: 300 });
    region(B, dg, { pal: 'red', opacity: 0.35 }).set(() => 0, fd, -15, 0);
    vline(B, dg, 0, 0, 0.09, 'ink', 0.02, 'Zero');
    const gap = rod(dg, { pal: 'red', r: 0.06, name: 'Difference' });
    const dd = balls(dg, D.k, r, 'ink', 'Difference', B.P(10, 0), 6), fall = moving(dot(dg, { pal: 'red', r, name: 'Difference' }));
    let cur = null;
    labels.push(...T.tickLabels({ xName: 'weight (g)', yName: '' }).filter(L => L.html !== '<i></i>'), ...axisX(B, root, range(-10, 30, 10), [0.02, 0.04, 0.06, 0.08], '<i>x̄</i><sub>A</sub> − <i>x̄</i><sub>B</sub> (g)'),
      mark('<i>x̄</i><sub>A</sub>', () => T.P(D.A.mu + 5, fa(D.A.mu + 5)).add(V(0.4, 0.1, 0)), 'vec'),
      mark('<i>x̄</i><sub>B</sub>', () => T.P(D.B.mu - 4, fb(D.B.mu - 4)).add(V(-0.4, 0.1, 0)), 'vec blue'),
      mark(`below 0: ${M.MD_LESS0.toFixed(3)}`, () => B.P(-3, 0.02).add(V(-1.0, 0.25, 0)), 'mark'),
      live(() => cur !== null ? B.P(M.MD_MU, 0.09).add(V(0, 0.35, 0)) : null, () => cur !== null ? `${D.pairs[cur][0].toFixed(1)} − ${D.pairs[cur][1].toFixed(1)} = ${f1(D.pairs[cur][0] - D.pairs[cur][1])} g` : '', 'mark'));
    const pos = V(), dstack = (() => { const out = []; D.pairs.forEach(([a, b], j) => { let h = 0; for (let k = 0; k < j; k++) if (Math.abs((D.pairs[k][0] - D.pairs[k][1]) - (a - b)) * B.ux < 2 * r && out[k] === h) h++; out.push(h); }); return out; })();
    ups.push(s => {
      const { i, u } = M.mdAt(M.clk(s, 'mdiff'));
      const [a, b] = D.pairs[i], d = a - b;
      dd.begin(); for (let k = 0; k < i; k++) dd.put(slot(B, D.pairs[k][0] - D.pairs[k][1], dstack[k], r, pos)); dd.end();
      const w = M.smooth(span(u, 0, 0.25)), ea = T.P(a, 0, 0.25).add(V(0, 0.2, 0)), eb = T.P(b, 0, 0.25).add(V(0, 0.2, 0));
      ba.position.copy(ea).add(V(0, (1 - w) * 2.5, 0)); bb.position.copy(eb).add(V(0, (1 - w) * 2.5, 0));
      const g = span(u, 0.3, 0.5); gap.visible = g > 0;
      if (g > 0) setRod(gap, eb.clone().add(V(0, 0.45, 0)), tmp2.lerpVectors(eb, ea, g).add(V(0, 0.45, 0)));
      fall.visible = u > 0.55; cur = u > 0.55 ? i : null;
      if (fall.visible) fall.position.lerpVectors(tmp2.lerpVectors(ea, eb, 0.5).add(V(0, 0.45, 0)), slot(B, d, dstack[i], r, tmp), M.smooth(span(u, 0.55, 0.85)));
    });
  }

  return { labels, update: (s, look) => { for (const f of ups) f(s, look); } };
}
