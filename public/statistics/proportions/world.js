// The figure: one scene per idea, spread along +x, the camera flying between them page by page.
// Graph paper from the kit for every distribution; intervals as rods, samples as balls, histograms as bars.
// Colour code: red for what the page is about (an interval that misses, the p-value, power), blue for a second
// thing (the middle 95%, α, β, a second study), ink and greys for the rest.
import * as THREE from 'three';
import { graphBoard, curve, liveCurve, dot, putAt, rod, setRod, region, bars, V } from '../kit.js';
import { part } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { rods: 0, why: 30, build: 60, size: 90, width: 118, nul: 146, decide: 176, power: 204, diff: 232, two: 262 };

const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const f2 = x => x.toFixed(2), f3 = x => x.toFixed(3);
// a thin dashed line between two world points, moved with .set(a, b)
function guide(parent, color = '#8a8a8f') {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(6);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 }));
  l.userData = { noEdge: true }; l.frustumCulled = false; parent.add(l);
  l.set = (a, b) => { pos.set([a.x, a.y, a.z, b.x, b.y, b.z]); geo.attributes.position.needsUpdate = true; l.computeLineDistances(); };
  return l;
}
// a shaded area that can be lit and picked like a part: region() with a part name
function area(B, parent, opts) {
  const m = region(B, parent, opts), set = m.set;
  m.userData.part = opts.name || 'Region'; m.userData.tone = m.userData.baseTone = 0.4;
  m.set = (...a) => { set(...a); m.geometry.boundingBox = null; };
  return m;
}
// a horizontal interval on board B at height y: a rod with end caps, set again with .to(lo, hi, y)
function interval(B, parent, { pal = 'ink', r = 0.035, cap = 0.13, name = 'Interval', tone = 'hi' } = {}) {
  const g = new THREE.Group(); parent.add(g);
  const bar = rod(g, { r, pal, name, tone }), c1 = rod(g, { r: r * 0.8, pal, name, tone }), c2 = rod(g, { r: r * 0.8, pal, name, tone });
  g.to = (lo, hi, y, lift = 0.06) => {
    const a = B.P(lo, y, lift), b = B.P(hi, y, lift);
    setRod(bar, a, b); setRod(c1, a.clone().add(V(0, -cap, 0)), a.clone().add(V(0, cap, 0))); setRod(c2, b.clone().add(V(0, -cap, 0)), b.clone().add(V(0, cap, 0)));
  };
  return g;
}
// a vertical rod on board B at x, from y a to y b
const vrod = (B, parent, x, a, b, opts) => { const m = rod(parent, opts); setRod(m, B.P(x, a, 0.05), B.P(x, b, 0.05)); return m; };
const ballGeo = new Map();
const ball = (parent, r, pal, name, tone = 'mid') => {
  const m = part(parent, ballGeo.get(r) ?? ballGeo.set(r, new THREE.SphereGeometry(r, 14, 10)).get(r), { pal, tone, name });
  m.userData.home = null; return m;
};

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];          // per-frame updates, each (state) => void
  const S = M.SIM;

  // ---------- the opener and 6.3: fifty samples of 500, fifty 95% intervals, and p ----------
  {
    const ux = 36, uy = 0.12, B = graphBoard(root, { at: [ST.rods - S.p * ux, 0.4, 0], x: [0.48, 0.72], y: [0, S.reps + 1], unit: [ux, uy], grid: [0.02, 0], ticks: [0.04, 0] });
    const hits = asm('rods', root, { title: 'Intervals that capture p', sub: `${S.reps - M.MISSES} of ${S.reps} samples: p̂ ± ${f2(M.ZS)} SE reaches over p` });
    const miss = asm('misses', root, { title: 'Intervals that miss', sub: `${M.MISSES} of ${S.reps}: their p̂ fell more than ${f2(M.ZS)} SE from p` });
    const items = M.SAMPLES.map((s, i) => {
      const g = new THREE.Group(); (s.hit ? hits : miss).add(g);
      interval(B, g, { pal: s.hit ? 'dark' : 'red', r: 0.026, cap: 0.045, name: `Sample ${i + 1}`, tone: s.hit ? 'lo' : 'hi' }).to(s.lo, s.hi, i + 1);
      putAt(B, dot(g, { r: 0.065, pal: s.hit ? 'ink' : 'red', name: `p̂ of sample ${i + 1}` }), s.ph, i + 1, 0.1);
      return g;
    });
    const tr = asm('truth', root, { title: 'The true proportion, p', sub: `${S.p} in the figure; unknown in a real survey` });
    vrod(B, tr, S.p, 0, S.reps + 1, { r: 0.035, pal: 'ink', name: 'p' });
    labels.push(...B.tickLabels({ xName: '<i>p̂</i>', yName: '' }),
      mark(`<i>p</i> = ${f2(S.p)}`, () => B.P(S.p, S.reps + 1).add(V(0, 0.35, 0))),
      mark('one sample of 500 each row', () => B.P(0.72, S.reps + 1).add(V(-1.6, 0.35, 0))));
    ups.push(s => { const m = M.rodsShown(M.clk(s, 'rods')); items.forEach((g, i) => { g.visible = i < m; }); });
  }

  // ---------- 6.1 why be normal: p̂ from samples of 20 and of 200, p = 0.10 ----------
  {
    const W = M.WHY;
    W.ns.forEach((n, j) => {
      const cx = ST.why + (j ? 3.3 : -3.3), ux = 12, ymax = W.ymax[j], uy = 4.2 / ymax, sd = M.whySd[j];
      const B = graphBoard(root, { at: [cx - 0.125 * ux, 0, 0], x: W.x, y: [0, ymax], unit: [ux, uy], grid: [0.05, j ? 4 : 1], ticks: [0.1, 0] });
      const g = asm(j ? 'big' : 'small', root, { title: `Samples of ${n}`, sub: `p̂ from ${W.reps} random samples, p = ${W.p}` });
      const br = bars(B, g, n + 1, { pal: 'blue', tone: 'lo', name: `p̂, n = ${n}`, opacity: 0.9 });
      const fg = asm(j ? 'fit200' : 'fit20', root, { title: `The normal model, n = ${n}`, sub: `mean ${W.p}, standard deviation ${f3(sd)}` });
      curve(B, fg, x => M.normPdf(x, W.p, sd), W.x[0], W.x[1], { r: 0.035, pal: 'red', name: 'Normal curve' });
      const [np, nq] = M.whyCounts[j];
      labels.push(...B.tickLabels({ xName: '<i>p̂</i>', yName: '' }),
        mark(`<i>n</i> = ${n}: <i>np</i> = ${+np.toFixed(1)}, <i>n</i>(1 − <i>p</i>) = ${+nq.toFixed(1)}`, () => B.P(W.x[0], ymax).add(V(0, 0.5, 0)), 'board'));
      if (!j) labels.push(mark(`the curve puts ${(100 * M.whyBelow0[0]).toFixed(1)}% below 0`, () => B.P(W.x[0], 0).add(V(0, -0.65, 0)), 'board'));
      ups.push(s => br.set(M.whyBars(j, M.whyDrawn(M.clk(s, 'why')))));
    });
  }

  // ---------- 6.2 one sample at a time: p̂ lands in its sampling distribution, and its interval opens ----------
  {
    const ux = 40, sd = M.simSd, B = graphBoard(root, { at: [ST.build - S.p * ux, 0, 0], x: [0.5, 0.7], y: [-5, 20], unit: [ux, 0.2], grid: [0.02, 0], ticks: [0.05, 0] });
    const sg = asm('sdist', root, { title: 'The sampling distribution of p̂', sub: `centre p = ${S.p}, standard deviation ${f3(sd)}, for n = ${S.n}` });
    curve(B, sg, x => M.normPdf(x, S.p, sd), 0.5, 0.7, { r: 0.035, pal: 'ink', name: 'Sampling distribution' });
    vrod(B, sg, S.p, -5, 19.5, { r: 0.022, pal: 'dark', name: 'p' });
    const bd = asm('band', root, { title: 'The middle 95%', sub: `p ± ${f2(M.ZS)}σ: where 95% of sample proportions land` });
    area(B, bd, { pal: 'blue', opacity: 0.3, name: 'Middle 95%' }).set(() => 0, x => M.normPdf(x, S.p, sd), S.p - M.ZS * sd, S.p + M.ZS * sd);
    vrod(B, bd, S.p - M.ZS * sd, 0, M.normPdf(S.p - M.ZS * sd, S.p, sd), { r: 0.02, pal: 'blue', name: 'p − 1.96σ' });
    vrod(B, bd, S.p + M.ZS * sd, 0, M.normPdf(S.p + M.ZS * sd, S.p, sd), { r: 0.02, pal: 'blue', name: 'p + 1.96σ' });
    const ph = asm('phat', root, { title: 'This sample’s p̂', sub: 'one random sample of 500' });
    const balls = [ball(ph, 0.15, 'ink', 'p̂'), ball(ph, 0.15, 'red', 'p̂')];
    const iv = asm('interval', root, { title: 'This sample’s 95% interval', sub: `p̂ ± ${f2(M.ZS)} √(p̂(1 − p̂)/n)` });
    const ivs = [interval(B, iv, { pal: 'ink', r: 0.04, name: 'Interval' }), interval(B, iv, { pal: 'red', r: 0.04, name: 'Interval' })];
    const cen = [ball(iv, 0.08, 'ink', 'p̂'), ball(iv, 0.08, 'red', 'p̂')];
    const drop = guide(ph);
    const ROW = -3.2;
    let now = M.buildAt(0);
    labels.push(...B.tickLabels({ xName: '<i>p̂</i>', yName: '' }),
      mark(`<i>p</i> = ${f2(S.p)}`, () => B.P(S.p, 19.5).add(V(0, 0.3, 0))),
      mark('middle 95%', () => B.P(S.p + 0.019, 3.2)),
      live(() => B.P(0.5, ROW).add(V(-0.2, 0, 0)), () => `sample ${now.i + 1}`, 'axis'),
      live(() => now.open > 0.5 ? B.P(M.SAMPLES[now.i].hi, ROW).add(V(0.25, 0, 0)) : null, () => M.SAMPLES[now.i].hit ? 'captures <i>p</i>' : 'misses <i>p</i>', 'board'));
    ups.push(s => {
      now = M.buildAt(M.clk(s, 'build'));
      const sm = M.SAMPLES[now.i], k = sm.hit ? 0 : 1, me = (sm.hi - sm.lo) / 2 * now.open;
      balls.forEach((b, j) => { b.visible = j === k; }); ivs.forEach((g, j) => { g.visible = j === k && now.open > 0.01; }); cen.forEach((b, j) => { b.visible = j === k && now.fall >= 1; });
      putAt(B, balls[k], sm.ph, 19 * (1 - now.fall) + 0.75, 0.15);
      putAt(B, cen[k], sm.ph, ROW, 0.1);
      if (now.open > 0.01) ivs[k].to(sm.ph - me, sm.ph + me, ROW);
      drop.visible = now.fall >= 1; drop.set(B.P(sm.ph, 0, 0.05), B.P(sm.ph, ROW, 0.05));
    });
  }

  // ---------- 6.2 choosing n: the margin of error against n ----------
  {
    const Z = M.SIZE, ux = 0.0032, B = graphBoard(root, { at: [ST.size - 1250 * ux, 0, 0], x: [0, 2500], y: [0, 0.1], unit: [ux, 45], grid: [250, 0.01], ticks: [500, 0.02] });
    const mc = asm('mecurve', root, { title: `Margin of error, p* = ${Z.pstar}`, sub: `${f2(M.ZS)} √(${Z.pstar * (1 - Z.pstar)}/n): the largest it can be for each n` });
    curve(B, mc, n => M.meOf(n), 20, 2500, { r: 0.04, pal: 'ink', name: 'ME, p* = 0.5' });
    const pc = asm('pilot', root, { title: `Margin of error, p* = ${Z.pilot}`, sub: 'with an estimate from a pilot study' });
    curve(B, pc, n => M.meOf(n, Z.pilot), 20, 2500, { r: 0.03, pal: 'blue', name: `ME, p* = ${Z.pilot}` });
    const nd = asm('need', root, { title: `The n for ME ≤ ${Z.ME}`, sub: `(${f2(M.ZS)}/${Z.ME})² × ${Z.pstar * (1 - Z.pstar)}, rounded up: ${M.N_NEED}` });
    setRod(rod(nd, { r: 0.025, pal: 'red', name: `ME = ${Z.ME}` }), B.P(0, Z.ME, 0.05), B.P(2500, Z.ME, 0.05));
    putAt(B, dot(nd, { r: 0.12, pal: 'red', name: `n = ${M.N_NEED}` }), M.N_NEED, Z.ME, 0.1);
    vrod(B, nd, M.N_NEED, 0, Z.ME, { r: 0.018, pal: 'red', name: `n = ${M.N_NEED}` });
    putAt(B, dot(pc, { r: 0.1, pal: 'blue', name: `n = ${M.N_PILOT}` }), M.N_PILOT, Z.ME, 0.1);
    const nw = asm('now', root, { title: 'One sample size', sub: 'its margin of error, read off the curve' });
    const d = dot(nw, { r: 0.13, pal: 'ink', name: 'n' }); d.userData.home = null;
    const dl = guide(nw);
    let n = 0;
    labels.push(...B.tickLabels({ xName: '<i>n</i>', yName: '' }), mark('margin of error', () => B.P(0, 0.1).add(V(0, 0.55, 0)), 'board'),
      mark(`<i>p</i>* = ${Z.pstar}`, () => B.P(330, M.meOf(330)).add(V(0.55, 0.2, 0))),
      mark(`<i>p</i>* = ${Z.pilot}`, () => B.P(250, M.meOf(250, Z.pilot)).add(V(-0.1, -0.35, 0))),
      mark(`<i>n</i> = ${M.N_NEED}`, () => B.P(M.N_NEED, 0).add(V(0, -0.6, 0))),
      mark(`${M.N_PILOT}`, () => B.P(M.N_PILOT, Z.ME).add(V(-0.35, -0.3, 0))),
      live(() => B.P(n, M.meOf(n)).add(V(0.15, 0.55, 0)), () => `ME ${f3(M.meOf(n))}`, 'board'));
    ups.push(s => { n = M.sizeN(M.clk(s, 'size')); putAt(B, d, n, M.meOf(n), 0.12); dl.set(B.P(n, 0, 0.03), B.P(n, M.meOf(n), 0.03)); });
  }

  // ---------- 6.3 width: one p̂ at 90, 95 and 99%, a live level, and four times the sample ----------
  {
    const ux = 45, Wd = M.WIDTH, B = graphBoard(root, { at: [ST.width - M.bikeP * ux, 0, 0], x: [0.5, 0.66], y: [0, 5.4], unit: [ux, 0.8], grid: [0.01, 0], ticks: [0.02, 0] });
    const rows = { live: 4.6, 0.99: 3.6, 0.95: 2.7, 0.90: 1.8, big: 0.8 };
    const lv = asm('levels', root, { title: '90%, 95% and 99% intervals', sub: `the same sample: p̂ = ${M.bikeP}, n = ${M.BIKE.n}` });
    for (const C of Wd.levels) { const me = M.meAt(C); interval(B, lv, { pal: 'ink', name: `${C * 100}%` }).to(M.bikeP - me, M.bikeP + me, rows[C]); putAt(B, dot(lv, { r: 0.08, pal: 'ink', name: 'p̂' }), M.bikeP, rows[C], 0.1); }
    const bg = asm('bign', root, { title: `95%, with n = ${M.BIKE.n * Wd.big}`, sub: 'four times the sample: half the margin of error' });
    { const me = M.meAt(0.95, M.BIKE.n * Wd.big); interval(B, bg, { pal: 'blue', name: `n = ${M.BIKE.n * Wd.big}` }).to(M.bikeP - me, M.bikeP + me, rows.big); putAt(B, dot(bg, { r: 0.08, pal: 'blue', name: 'p̂' }), M.bikeP, rows.big, 0.1); }
    const lg = asm('live', root, { title: 'Any confidence level', sub: 'z* grows with C, and the interval with it' });
    const li = interval(B, lg, { pal: 'red', r: 0.045, name: 'Interval' });
    putAt(B, dot(lg, { r: 0.09, pal: 'red', name: 'p̂' }), M.bikeP, rows.live, 0.1);
    guide(root).set(B.P(M.bikeP, 0, 0.02), B.P(M.bikeP, 5.3, 0.02));
    let C = 0.95;
    labels.push(...B.tickLabels({ xName: '<i>p</i>', yName: '' }),
      ...Wd.levels.map(c => mark(`${c * 100}%`, () => B.P(0.5, rows[c]).add(V(-0.2, 0, 0)), 'axis')),
      mark(`95%, <i>n</i> = ${M.BIKE.n * Wd.big}`, () => B.P(0.5, rows.big).add(V(-0.2, 0, 0)), 'axis'),
      live(() => B.P(0.5, rows.live).add(V(-0.2, 0, 0)), () => `${(100 * C).toFixed(1)}%`, 'axis'),
      mark(`<i>p̂</i> = ${f2(M.bikeP)}`, () => B.P(M.bikeP, 5.4).add(V(0, 0.3, 0))));
    ups.push(s => { C = M.widthC(M.clk(s, 'width')); const me = M.meAt(C); li.to(M.bikeP - me, M.bikeP + me, rows.live); });
  }

  // ---------- 6.4–6.5 the null distribution: 200 samples as if H0 were true, and where 0.295 falls ----------
  {
    const T = M.TEST, ux = 50, B = graphBoard(root, { at: [ST.nul - 0.25 * ux, 0, 0], x: [0.17, 0.33], y: [0, 25], unit: [ux, 0.25], grid: [0.01, 0], ticks: [0.05, 0] });
    const nc = asm('nullcurve', root, { title: 'If H₀ were true', sub: `p̂ would be about normal: centre ${T.p0}, standard deviation ${f3(M.sd0)}` });
    curve(B, nc, x => M.normPdf(x, T.p0, M.sd0), 0.17, 0.33, { r: 0.035, pal: 'ink', name: 'Null distribution' });
    vrod(B, nc, T.p0, 0, 19.2, { r: 0.02, pal: 'dark', name: 'p₀' });
    const sm = asm('sims', root, { title: `${T.sims} samples drawn with p = ${T.p0}`, sub: 'what chance alone gives, one dot per sample of 400' });
    const height = new Map();
    const dots = M.NULL_SIMS.map((v, i) => {
      const j = Math.floor(v / T.bin + 1e-9), k = height.get(j) || 0; height.set(j, k + 1);
      const m = ball(sm, 0.105, v >= M.testP - 1e-12 ? 'red' : 'dark', `Sample ${i + 1}`, 'lo');
      putAt(B, m, (j + 0.5) * T.bin, k + 0.5, 0.12);
      return m;
    });
    const tl = asm('tail', root, { title: 'The p-value', sub: `the area at or beyond p̂ = ${M.testP}, if H₀ is true` });
    area(B, tl, { pal: 'red', opacity: 0.4, name: 'p-value' }).set(() => 0, x => M.normPdf(x, T.p0, M.sd0), M.testP, 0.33);
    vrod(B, tl, M.testP, 0, 12, { r: 0.035, pal: 'red', name: 'Observed p̂' });
    let shown = 1;
    labels.push(...B.tickLabels({ xName: '<i>p̂</i>', yName: '' }),
      mark(`H<sub>0</sub>: <i>p</i> = ${T.p0}`, () => B.P(T.p0, 25).add(V(0, 0.3, 0))),
      mark(`observed <i>p̂</i> = ${M.testP}`, () => B.P(M.testP, 12).add(V(0, 0.3, 0))),
      mark(`p-value ${f3(M.testPV)}`, () => B.P(0.305, 2.2).add(V(0.5, 0, 0)), 'board'),
      live(() => B.P(0.17, 25).add(V(0, 0.7, 0)), () => `${shown} samples · ${M.NULL_SIMS.slice(0, shown).filter(v => v >= M.testP - 1e-12).length} at or above ${M.testP}`, 'board'));
    ups.push(s => { shown = M.nulShown(M.clk(s, 'nul')); dots.forEach((m, i) => { m.visible = i < shown; }); });
  }

  // ---------- 6.6 the decision: α's rejection region sweeps past the observed z ----------
  {
    const z = M.testZ, B = graphBoard(root, { at: [ST.decide, 0, 0], x: [-3.5, 3.5], y: [0, 0.45], unit: [1.1, 9], grid: [0.5, 0.05], ticks: [1, 0] });
    const zc = asm('zcurve', root, { title: 'The standard normal', sub: 'the distribution of z if H₀ is true' });
    curve(B, zc, x => M.normPdf(x), -3.5, 3.5, { r: 0.035, pal: 'ink', name: 'N(0, 1)' });
    const al = asm('alpha', root, { title: 'The rejection region, area α', sub: 'z beyond the critical value z*: reject H₀' });
    const ar = area(B, al, { pal: 'blue', opacity: 0.32, name: 'α' });
    const cr = rod(al, { r: 0.03, pal: 'blue', name: 'z*' });
    const zs = asm('zstat', root, { title: 'The test statistic and its p-value', sub: `z = ${f2(z)}; the area beyond it, ${f3(M.testPV)}` });
    area(B, zs, { pal: 'red', opacity: 0.5, name: 'p-value' }).set(() => 0, x => M.normPdf(x), z, 3.5);
    vrod(B, zs, z, 0, 0.3, { r: 0.04, pal: 'red', name: 'z' });
    let a = 0.05, zstar = M.zCrit(a);
    labels.push(...B.tickLabels({ xName: '<i>z</i>', yName: '' }),
      mark(`<i>z</i> = ${f2(z)}`, () => B.P(z, 0.3).add(V(0, 0.3, 0))),
      live(() => B.P(zstar, 0.03).add(V(-0.15, 0, 0)), () => `<i>z</i>* = ${f3(zstar)}`, 'axis'),
      live(() => B.P(-3.5, 0.45).add(V(0, 0.3, 0)), () => `α = ${f3(a)}: p-value ${f3(M.testPV)} ${M.testPV < a ? '&lt; α, reject H<sub>0</sub>' : '&gt; α, fail to reject H<sub>0</sub>'}`, 'board'));
    ups.push(s => {
      a = M.decideA(M.clk(s, 'decide')); zstar = M.zCrit(a);
      ar.set(() => 0, x => M.normPdf(x), zstar, 3.5);
      setRod(cr, B.P(zstar, 0, 0.05), B.P(zstar, M.normPdf(zstar) + 0.05, 0.05));
    });
  }

  // ---------- 6.7 errors and power: H0 (p = 0.25) and the truth (p = 0.30), n growing ----------
  {
    const T = M.TEST, P = M.POWER, ux = 32, B = graphBoard(root, { at: [ST.power - 0.275 * ux, 0, 0], x: [0.15, 0.4], y: [0, 24], unit: [ux, 0.18], grid: [0.01, 0], ticks: [0.05, 0] });
    const h0 = asm('h0', root, { title: 'p̂ if H₀ is true', sub: `centre ${T.p0}` }), ha = asm('ha', root, { title: `p̂ if the truth is p = ${P.pa}`, sub: 'a particular alternative' });
    const c0 = liveCurve(B, h0, { pal: 'ink', r: 0.035, name: 'H₀' }), ca = liveCurve(B, ha, { pal: 'blue', r: 0.035, name: `p = ${P.pa}` });
    const ag = asm('alphaR', root, { title: 'α: the Type I error rate', sub: 'H₀ true, but p̂ beyond the cut-off: rejected wrongly' });
    const aR = area(B, ag, { pal: 'dark', opacity: 0.45, name: 'α' }), cut = rod(ag, { r: 0.028, pal: 'ink', name: 'Cut-off' });
    const bg = asm('beta', root, { title: 'β: the Type II error rate', sub: `p really ${P.pa}, but p̂ short of the cut-off: H₀ kept wrongly` });
    const bR = area(B, bg, { pal: 'blue', opacity: 0.3, name: 'β' });
    const pg = asm('power', root, { title: 'Power', sub: `the chance of rejecting H₀ when p is really ${P.pa}: 1 − β` });
    const pR = area(B, pg, { pal: 'red', opacity: 0.38, name: 'Power' }), pd = dot(pg, { r: 0.1, pal: 'red', name: 'Power' }); pd.userData.home = null;
    let n = P.n0, r = M.powerOf(n);
    labels.push(...B.tickLabels({ xName: '<i>p̂</i>', yName: '' }),
      live(() => B.P(T.p0, M.normPdf(T.p0, T.p0, M.se1(T.p0, n))).add(V(-0.3, 0.3, 0)), () => `H<sub>0</sub>: <i>p</i> = ${T.p0}`),
      live(() => B.P(P.pa, M.normPdf(P.pa, P.pa, M.se1(P.pa, n))).add(V(0.4, 0.3, 0)), () => `true <i>p</i> = ${P.pa}`),
      live(() => B.P(r.crit, 0.25 * M.normPdf(P.pa, P.pa, M.se1(P.pa, n))).add(V(0.15, 0, 0)), () => `power ${f3(r.power)}`, 'board'),
      live(() => B.P(r.crit, 0).add(V(-0.2, -0.6, 0)), () => `β ${f3(r.beta)}`, 'axis'),
      live(() => B.P(0.15, 24).add(V(0, 0.55, 0)), () => `<i>n</i> = ${n} · α = ${T.alpha}`, 'board'));
    ups.push(s => {
      n = M.powerN(M.clk(s, 'power')); r = M.powerOf(n);
      const s0 = M.se1(T.p0, n), sa = M.se1(P.pa, n), f0 = x => M.normPdf(x, T.p0, s0), fa = x => M.normPdf(x, P.pa, sa);
      c0.set(f0, 0.15, 0.4); ca.set(fa, 0.15, 0.4);
      aR.set(() => 0, f0, r.crit, 0.4); bR.set(() => 0, fa, 0.15, r.crit); pR.set(() => 0, fa, r.crit, 0.4);
      setRod(cut, B.P(r.crit, 0, 0.06), B.P(r.crit, 23, 0.06));
      putAt(B, pd, r.crit, 0, 0.1);
    });
  }

  // ---------- 6.8–6.9 two proportions: teens and adults, and two intervals for the difference ----------
  {
    const BI = M.BIG_CI, SM = M.SMALL_CI;
    const L = graphBoard(root, { at: [ST.diff - 7.2, 0, 0], x: [0, 2], y: [0, 0.8], unit: [1.6, 5], grid: [0, 0.1], ticks: [0, 0.2] });
    const pr = asm('props', root, { title: 'The two sample proportions', sub: `teens ${f2(BI.p1)} (n = ${M.DIFF.n1}), adults ${f2(BI.p2)} (n = ${M.DIFF.n2})` });
    bars(L, pr, 2, { pal: 'dark', tone: 'mid', name: 'p̂', opacity: 1, depth: 0.3 }).set([[0.2, 0.7, BI.p1], [1.3, 1.8, BI.p2]]);
    const gap = rod(pr, { r: 0.04, pal: 'red', name: 'p̂₁ − p̂₂' }); setRod(gap, L.P(1, BI.p2, 0.35), L.P(1, BI.p1, 0.35));
    guide(pr).set(L.P(0.7, BI.p1, 0.3), L.P(1.3, BI.p1, 0.3));
    const ux = 15, B = graphBoard(root, { at: [ST.diff + 1.6 - 0.1 * ux, 0, 0], x: [-0.1, 0.3], y: [0, 3], unit: [ux, 1.2], grid: [0.05, 0], ticks: [0.05, 0] });
    const big = asm('bigci', root, { title: 'The 95% interval for p₁ − p₂', sub: `${M.DIFF.n1} teens and ${M.DIFF.n2} adults: (${f3(BI.lo)}, ${f3(BI.hi)})` });
    const bi = interval(B, big, { pal: 'red', r: 0.045, name: 'Interval' }); putAt(B, dot(big, { r: 0.1, pal: 'red', name: 'p̂₁ − p̂₂' }), BI.d, 2, 0.1);
    const sml = asm('smallci', root, { title: 'A smaller study', sub: `${M.SMALL.n1} and ${M.SMALL.n2}, the same proportions: (${f3(SM.lo)}, ${f3(SM.hi)})` });
    const si = interval(B, sml, { pal: 'blue', r: 0.04, name: 'Interval' }); putAt(B, dot(sml, { r: 0.09, pal: 'blue', name: 'p̂₁ − p̂₂' }), SM.d, 1, 0.1);
    const zr = asm('zero', root, { title: 'Zero: no difference', sub: 'p₁ = p₂; is it a plausible value?' });
    vrod(B, zr, 0, 0, 3, { r: 0.035, pal: 'ink', name: '0' });
    labels.push(...L.tickLabels({ xTicks: false, xName: '', yName: '' }), mark('teens', () => L.P(0.45, 0).add(V(0, -0.3, 0))), mark('adults', () => L.P(1.55, 0).add(V(0, -0.3, 0))),
      mark(f2(BI.p1), () => L.P(0.45, BI.p1).add(V(0, 0.3, 0))), mark(f2(BI.p2), () => L.P(1.55, BI.p2).add(V(0, 0.3, 0))),
      mark(`${f2(BI.d)}`, () => L.P(1, BI.p1).add(V(0, 0.3, 0))),
      ...B.tickLabels({ xName: '<i>p̂</i><sub>1</sub> − <i>p̂</i><sub>2</sub>', yName: '' }),
      mark(`<i>n</i> = ${M.DIFF.n1}, ${M.DIFF.n2}`, () => B.P(-0.1, 2).add(V(-0.15, 0, 0)), 'axis'),
      mark(`<i>n</i> = ${M.SMALL.n1}, ${M.SMALL.n2}`, () => B.P(-0.1, 1).add(V(-0.15, 0, 0)), 'axis'),
      mark('0: no difference', () => B.P(0, 3).add(V(0, 0.3, 0))));
    ups.push(s => { const u = M.diffGrow(M.clk(s, 'diff')); bi.to(BI.d - BI.me * u, BI.d + BI.me * u, 2); si.to(SM.d - SM.me * u, SM.d + SM.me * u, 1); bi.visible = si.visible = u > 0.01; });
  }

  // ---------- 6.10–6.11 an experiment: two groups of 150, pooled under H0; the null distribution of p̂₁ − p̂₂ ----------
  {
    const F = M.FLU, d = 0.24, cols = F.cols, gap0 = 0.9, y0 = 0.7, w = cols * d, left = ST.two - w;
    const gr = asm('groups', root, { title: 'The two groups, and pooled', sub: `${F.x1} + ${F.x2} flu shots in ${F.n1 + F.n2} people: p̂c = ${f3(M.fluPc)}` });
    const all = [];
    [[F.n1, F.x1], [F.n2, F.x2]].forEach(([n, x], g) => {
      for (let k = 0; k < n; k++) { const s = k < x, m = ball(gr, 0.095, s ? 'ink' : 'base', s ? 'Flu shot' : 'No flu shot', 'lo'); all.push({ m, g, gc: g * cols + k % cols, row: Math.floor(k / cols), s }); }
    });
    // pooled: the same grid without the gap, the shots levelled across both groups; balls that must move swap places
    const total = F.x1 + F.x2, poolS = b => b.row * 2 * cols + b.gc < total;
    for (const b of all) b.to = b;
    const order = (a, b) => a.row - b.row || a.gc - b.gc;
    const extraS = all.filter(b => b.s && !poolS(b)).sort(order), extraF = all.filter(b => !b.s && poolS(b)).sort(order);
    extraS.forEach((b, i) => { b.to = extraF[i]; extraF[i].to = b; });
    const at = (b, gap, out) => out.set(left + (b.gc + 0.5) * d + (b.gc >= cols ? gap / 2 : -gap / 2), y0 + (b.row + 0.5) * d, 0);
    const pa = V(), pb = V();
    const B = graphBoard(root, { at: [ST.two, -4.4, 0], x: [-0.2, 0.2], y: [0, 7.5], unit: [18, 0.5], grid: [0.05, 0], ticks: [0.1, 0] });
    const nc = asm('nul2', root, { title: 'p̂₁ − p̂₂ if H₀ is true', sub: `centre 0, standard error ${f3(M.fluSE)} from the pooled p̂c` });
    curve(B, nc, x => M.normPdf(x, 0, M.fluSE), -0.2, 0.2, { r: 0.035, pal: 'ink', name: 'Null distribution' });
    const tl = asm('tail2', root, { title: 'The p-value', sub: `the area beyond the observed ${f2(M.fluD)}: ${f3(M.fluPV)}` });
    area(B, tl, { pal: 'red', opacity: 0.45, name: 'p-value' }).set(() => 0, x => M.normPdf(x, 0, M.fluSE), M.fluD, 0.2);
    vrod(B, tl, M.fluD, 0, 4.2, { r: 0.035, pal: 'red', name: 'Observed difference' });
    let u = 0;
    labels.push(...B.tickLabels({ xName: '<i>p̂</i><sub>1</sub> − <i>p̂</i><sub>2</sub>', yName: '' }),
      mark(`H<sub>0</sub>: <i>p</i><sub>1</sub> − <i>p</i><sub>2</sub> = 0`, () => B.P(0, 7.1).add(V(0, 0.35, 0))),
      mark(`observed ${f2(M.fluD)}: <i>z</i> = ${f2(M.fluZ)}`, () => B.P(M.fluD, 4.2).add(V(0, 0.3, 0))),
      live(() => u < 0.3 ? V(left - gap0 / 2 + w / 2, y0 + 10 * d + 0.35, 0) : null, () => `reminder: ${F.x1}/${F.n1} = ${f2(M.fluP1)}`),
      live(() => u < 0.3 ? V(left + gap0 / 2 + 1.5 * w, y0 + 10 * d + 0.35, 0) : null, () => `no reminder: ${F.x2}/${F.n2} = ${f2(M.fluP2)}`),
      live(() => u > 0.7 ? V(ST.two, y0 + 10 * d + 0.35, 0) : null, () => `pooled: ${total}/${F.n1 + F.n2} = ${f3(M.fluPc)}`));
    ups.push(s => {
      u = M.poolU(M.clk(s, 'two'));
      const gap = gap0 * (1 - u);
      for (const b of all) { at(b, gap, pa); at(b.to, gap, pb); b.m.position.lerpVectors(pa, pb, u); b.m.position.z = b.to === b ? 0 : 0.6 * Math.sin(Math.PI * u); }
    });
  }

  return { labels, update: s => { for (const f of ups) f(s); } };
}
