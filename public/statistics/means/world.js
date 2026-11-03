// The figure: one scene per idea, spread along +x, the camera flying between them page by page.
// Graph paper from the kit for every plot: samples as dotplots of small balls dropping in as they are drawn, intervals
// as rods built out from x̄, t curves with their tails shaded. Red marks the thing that matters on the page, blue the
// second thing (x̄, the claimed value, the normal curve).
import * as THREE from 'three';
import { graphBoard, curve, liveCurve, dot, rod, setRod, region, V } from '../kit.js';
import { part, box, lines } from '../engine/parts.js';
import { normPdf, tPdf } from '../dist.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { cap: 0, tdist: 34, cond: 64, one: 96, paired: 140, two: 184, choose: 222 };

const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const ballGeo = new Map();
const ball = (parent, r, pal, name) => {
  const m = part(parent, ballGeo.get(r) ?? ballGeo.set(r, new THREE.SphereGeometry(r, 20, 14)).get(r), { pal, tone: 'mid', name });
  m.userData.home = null; return m;
};
// a thin dashed line between two world points
function dashed(parent, a, b, color = '#8a8a8f') {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 }));
  l.userData = { noEdge: true }; l.computeLineDistances(); parent.add(l);
  return l;
}
const lerp = (a, b, u) => a + (b - a) * u;
// 0 → 1 over [a, a + d] seconds
const ramp = (t, a, d) => M.smooth((t - a) / d);
// a rod along math y = y on board B, from x = a to x = b (grown out from its centre by u)
function hrod(B, m, a, b, y, u = 1, lift = 0.08) {
  const c = (a + b) / 2, h = (b - a) / 2 * Math.max(u, 1e-3);
  setRod(m, B.P(c - h, y, lift), B.P(c + h, y, lift));
}
// a dotplot: balls dropping onto a baseline (math y = base) of board B, one after another over [t0, t1]
function dotplot(B, parent, vals, { base = 0, r = 0.12, pal = 'ink', palOf, drop = 2.2, name = 'Value' } = {}) {
  const w = 2 * r / B.ux, lv = M.stack(vals, w);
  const balls = vals.map((v, i) => ball(parent, r, palOf ? palOf(v, i) : pal, name));
  const home = vals.map((v, i) => B.P(Math.round(v / w) * w, base, 0.1).add(V(0, r + 0.01 + lv[i] * 2 * r, 0)));
  return (t, t0, t1) => balls.forEach((m, i) => {
    const s = t0 + (t1 - t0) * i / vals.length, u = ramp(t, s, 0.3);
    m.visible = t >= s;
    m.position.copy(home[i]); m.position.y += drop * (1 - u) * (1 - u);
  });
}

// a corner of a t curve magnified (a p-value's tail is too thin to see at full scale): its own small board,
// x over xr, placed with its left end at world (X, Y); returns the board and the red region to fill
function inset(root, g, pg, labels, { X, Y, z = 0.25, xr, ymax, p, title }) {
  const ux = 1.0, uy = 1.6 / ymax;
  const I = graphBoard(root, { at: [X - xr[0] * ux, Y, z], x: xr, y: [0, ymax], unit: [ux, uy], grid: [0.5, ymax / 4], ticks: [1, 100] });
  curve(I, g, p, xr[0], xr[1], { pal: 'ink', r: 0.025, name: 't' });
  const R = region(I, pg, { pal: 'red', opacity: 0.5, name: 'Tail' });
  labels.push(...I.tickLabels({ xName: '', yName: '' }), mark(title, () => I.P(xr[0], ymax).add(V(-0.1, 0.32, 0)), 'board'));
  return { I, R };
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];          // per-frame updates, each (state) => void

  // ---------- opener: twenty samples from a known population, a 95% t interval from each ----------
  {
    const C = M.CAP, ux = 0.3, uy = 0.5, YB = 9.0, YR = 8.5, row = k => 7.9 - 0.39 * k;
    const B = graphBoard(root, { at: [ST.cap - C.mu * ux, -3.5, 0], x: [232, 268], y: [0, 13.6], unit: [ux, uy], grid: [2, 0], ticks: [5, 100] });
    const popY = x => 11 + 2.4 * Math.exp(-0.5 * ((x - C.mu) / C.sigma) ** 2);
    const pg = asm('pop', root, { title: 'The population', sub: `normal, μ = ${C.mu}, σ = ${C.sigma}: known only in a simulation` });
    curve(B, pg, popY, 232, 268, { pal: 'dark', r: 0.03, name: 'Population' });
    region(B, pg, { pal: 'dark', opacity: 0.14, name: 'Population' }).set(() => 11, popY, 232, 268);
    const mg = asm('mu', root, { title: 'The population mean, μ', sub: 'the parameter: fixed, unknown in real life' });
    setRod(rod(mg, { r: 0.03, pal: 'blue', name: 'μ' }), B.P(C.mu, 0, 0.05), B.P(C.mu, 13.5, 0.05));
    const sg = asm('sample0', root, { title: `A random sample of ${C.n}`, sub: 'and its mean, x̄' });
    const dots = Array.from({ length: C.n }, () => ball(sg, 0.12, 'ink', 'Value'));
    const xb = ball(sg, 0.16, 'blue', 'x̄');
    const ig = asm('intervals', root, { title: '95% t intervals', sub: 'x̄ ± t*·s/√n, one per sample: black capture μ, red miss' });
    const rows = M.CAPS.map(c => ({ m: rod(ig, { r: 0.04, pal: c.hit ? 'ink' : 'red', name: 'Interval' }), x: ball(ig, 0.07, c.hit ? 'ink' : 'red', 'x̄') }));
    const now = M.CAPS.map(c => rod(ig, { r: 0.045, pal: c.hit ? 'ink' : 'red', name: 'Interval' }));
    let a = { k: 0, u: 0, done: 0 };
    labels.push(...B.tickLabels({ xName: 'x', yName: '' }),
      mark(`<i>μ</i> = ${C.mu}`, () => B.P(C.mu, 13.6).add(V(0, 0.3, 0))),
      mark('population', () => B.P(259.5, 12.1)),
      mark(`sample of ${C.n}`, () => B.P(236, YB + 0.5)),
      live(() => B.P(261, YB - 0.4), () => `captured <i>μ</i>: ${M.CAPS.slice(0, a.done).filter(c => c.hit).length} of ${a.done}`, 'board'));
    ups.push(s => {
      a = M.capAt(M.clk(s, 'cap'));
      const k = Math.min(a.k, C.reps - 1), c = M.CAPS[k], t = a.k >= C.reps ? 9 : a.u * C.each;
      rows.forEach((r, j) => { r.m.visible = r.x.visible = j < a.done; if (j < a.done) { const cj = M.CAPS[j]; hrod(B, r.m, cj.lo, cj.hi, row(j)); r.x.position.copy(B.P(cj.xbar, row(j), 0.1)); } });
      dots.forEach((m, i) => {
        const v = c.vals[i], s0 = 0.04 * i, u = ramp(t, s0, 0.25), lv = c.lv[i];
        m.visible = t >= s0;
        m.position.copy(B.P(v, lerp(popY(v), YB, u), 0.1)).add(V(0, u * (0.13 + lv * 0.24), 0));
      });
      const ux0 = ramp(t, 0.62, 0.12);
      xb.visible = ux0 > 0.01; xb.scale.setScalar(Math.max(ux0, 1e-3)); xb.position.copy(B.P(c.xbar, YR, 0.12));
      now.forEach((m, j) => { m.visible = j === k && a.k < C.reps && t > 0.75; });
      if (a.k < C.reps && t > 0.75) hrod(B, now[k], c.lo, c.hi, lerp(YR, row(k), ramp(t, 1.0, 0.25)), ramp(t, 0.75, 0.2));
    });
  }

  // ---------- 7.1 the t curve, its df changing, against the standard normal; the outer 5% in red ----------
  {
    const B = graphBoard(root, { at: [ST.tdist, -2.9, 0], x: [-4.5, 4.5], y: [0, 0.42], unit: [1.2, 14], grid: [0.5, 0.05], ticks: [1, 0.1] });
    const ng = asm('normal', root, { title: 'The standard normal', sub: 'z: when σ is known' });
    curve(B, ng, x => normPdf(x), -4.5, 4.5, { pal: 'blue', r: 0.03, name: 'Normal' });
    for (const z of [-M.Z95, M.Z95]) setRod(rod(ng, { r: 0.02, pal: 'blue', name: 'z*' }), B.P(z, 0, 0.04), B.P(z, -0.02, 0.04));
    const tg = asm('tcurve', root, { title: 'A t distribution', sub: 'when s stands in for σ: heavier tails, set by df' });
    const tc = liveCurve(B, tg, { pal: 'ink', r: 0.045, name: 't' });
    const rg = asm('tails', root, { title: 'The outer 5%', sub: 'beyond ±t*, the 95% critical values' });
    const L = region(B, rg, { pal: 'red', opacity: 0.45, name: 'Tail' }), R = region(B, rg, { pal: 'red', opacity: 0.45, name: 'Tail' });
    const sL = rod(rg, { r: 0.03, name: '−t*' }), sR = rod(rg, { r: 0.03, name: 't*' });
    let df = 4, ts = 2;
    labels.push(...B.tickLabels({ xName: 't', yName: 'density' }),
      live(() => B.P(2.3, 0.37), () => `<i>df</i> = ${df < 10 ? f(df, 1).replace(/\.0$/, '') : Math.round(df)}`, 'board'),
      live(() => B.P(Math.min(ts, 4.2), tPdf(ts, df) + 0.035), () => `<i>t</i>* = ${ts.toFixed(2)}`),
      mark('normal', () => B.P(-1.55, normPdf(1.3) + 0.06).add(V(-0.2, 0, 0))),
      mark(`<i>z</i>* = ${M.Z95.toFixed(2)}`, () => B.P(M.Z95, -0.042)));
    ups.push(s => {
      df = M.dfAt(M.clk(s, 'tdist')); ts = M.tStarOf(df);
      const p = x => tPdf(x, df);
      tc.set(p, -4.5, 4.5);
      L.set(() => 0, p, -4.5, -Math.min(ts, 4.5)); R.set(() => 0, p, Math.min(ts, 4.5), 4.5);
      sL.visible = sR.visible = ts < 4.5;
      if (ts < 4.5) { setRod(sL, B.P(-ts, 0, 0.05), B.P(-ts, p(ts), 0.05)); setRod(sR, B.P(ts, 0, 0.05), B.P(ts, p(ts), 0.05)); }
    });
  }

  // ---------- 7.2 conditions: three samples on one scale ----------
  {
    const C = M.COND, out = new Set(M.COND_OUT);
    const sets = [
      ['symm', C.A, `<b>A</b>&ensp;<i>n</i> = ${C.A.length}, roughly symmetric: <i>t</i> is safe`, 'Sample A', 'small, symmetric, no outliers'],
      ['skewed', C.B, `<b>B</b>&ensp;<i>n</i> = ${C.B.length}, strongly skewed, an outlier: not safe`, 'Sample B', 'small, skewed, an outlier'],
      ['large', C.C, `<b>C</b>&ensp;<i>n</i> = ${C.C.length}, skewed, but <i>n</i> ≥ 30: <i>t</i> is safe`, 'Sample C', 'skewed, but large'],
    ];
    const plays = sets.map(([key, vals, html, title, sub], j) => {
      const B = graphBoard(root, { at: [ST.cond - 4.8, 2.7 - j * 3.1, 0], x: [0, 16], y: [0, 3.2], unit: [0.6, 0.6], grid: [1, 0], ticks: [2, 100] });
      const g = asm(key, root, { title, sub });
      const play = dotplot(B, g, vals, { r: 0.11, palOf: v => key === 'skewed' && out.has(v) ? 'red' : key === 'skewed' ? 'ink' : 'dark', name: 'Value' });
      labels.push(...B.tickLabels({ xName: j === 2 ? 'value' : '', yName: '' }), mark(html, () => B.P(0, 3.2).add(V(-0.1, 0.05, 0)), 'board'));
      if (key === 'skewed') labels.push(mark('outlier', () => B.P(M.COND_OUT[0], 0).add(V(0, 0.75, 0))));
      return play;
    });
    ups.push(s => { const t = M.loop(M.clk(s, 'cond'), M.COND.run, M.COND.rest) * M.COND.run; plays.forEach(p => p(t, 0, M.COND.run * 0.8)); });
  }

  // ---------- 7.2–7.5 one sample of cups: the interval built from x̄, SE and t*; the test on the t curve ----------
  {
    const O = M.ONE, F = M.FILL, YI = 1.1, YD = 2.5;
    const B = graphBoard(root, { at: [ST.one - 5 - 249 * 0.5, -1.6, 0], x: [240, 258], y: [0, 5.2], unit: [0.5, 0.6], grid: [1, 0], ticks: [2, 100] });
    lines(root, [...B.P(240, YD, 0.01).toArray(), ...B.P(258, YD, 0.01).toArray()], '#c4c4c8');
    const sg = asm('sample1', root, { title: `${F.n} cups`, sub: 'a random sample of the machine’s pours (mL)' });
    const play = dotplot(B, sg, M.FILLD, { base: YD, r: 0.13, pal: 'ink', name: 'Cup' });
    const xg = asm('xbar1', root, { title: 'The sample mean, x̄', sub: 'the point estimate of μ' });
    const xb = ball(xg, 0.17, 'blue', 'x̄');
    const cg = asm('ci1', root, { title: 'The 95% confidence interval', sub: 'x̄ ± t*·SE: the dark rod is one SE each way' });
    const se = rod(cg, { r: 0.075, pal: 'dark', name: 'SE' }), ci = rod(cg, { r: 0.04, pal: 'red', name: 'Interval' });
    const caps = [rod(cg, { r: 0.03, pal: 'red', name: 'End' }), rod(cg, { r: 0.03, pal: 'red', name: 'End' })];
    const mg = asm('mu0', root, { title: `The claimed mean, μ₀ = ${F.mu0} mL`, sub: 'outside the 95% interval: not plausible' });
    setRod(rod(mg, { r: 0.035, pal: 'blue', name: 'μ₀' }), B.P(F.mu0, 0, 0.06), B.P(F.mu0, 5.1, 0.06));
    let t = 0;
    labels.push(...B.tickLabels({ xName: 'mL', yName: '' }),
      mark(`<i>μ</i><sub>0</sub> = ${F.mu0}`, () => B.P(F.mu0, 5.2).add(V(0.15, 0.3, 0))),
      mark('<i>x̄</i>', () => t > 3.6 ? B.P(O.xbar, YI).add(V(0, 0.42, 0)) : null),
      mark('±1 <i>SE</i>', () => t > 4.6 ? B.P(O.xbar, YI - 0.65) : null),
      mark(f(O.lo), () => t > 6 ? B.P(O.lo, YI - 0.65) : null), mark(f(O.hi), () => t > 6 ? B.P(O.hi, YI - 0.65).add(V(-0.3, 0, 0)) : null),
      mark(`${F.n} cups`, () => B.P(241.6, 4.3)));

    const T = graphBoard(root, { at: [ST.one + 5.5, -2.2, 0], x: [-4, 4], y: [0, 0.42], unit: [1, 12], grid: [0.5, 0.05], ticks: [1, 0.1] });
    const tg = asm('tcurve1', root, { title: `The t distribution, df = ${O.df}`, sub: `how t varies if μ = ${F.mu0}` });
    const p = x => tPdf(x, O.df);
    curve(T, tg, p, -4, 4, { pal: 'ink', r: 0.03, name: 't' });
    const pg = asm('pval1', root, { title: 'The p-value', sub: 'both tails beyond |t|: Hₐ is two-sided' });
    const L = region(T, pg, { pal: 'red', opacity: 0.5, name: 'Tail' }), R = region(T, pg, { pal: 'red', opacity: 0.5, name: 'Tail' });
    const tb = ball(pg, 0.15, 'red', 't'), a = Math.abs(M.T1);
    setRod(rod(pg, { r: 0.025, name: 't' }), T.P(M.T1, 0, 0.05), T.P(M.T1, p(M.T1), 0.05));
    setRod(rod(pg, { r: 0.02, pal: 'dark', name: '−t' }), T.P(-M.T1, 0, 0.05), T.P(-M.T1, p(M.T1), 0.05));
    labels.push(...T.tickLabels({ xName: 't', yName: 'density' }),
      mark(`<i>df</i> = ${O.df}`, () => T.P(1.3, 0.36)),
      mark(`<i>t</i> = ${f(M.T1)}`, () => t > 6.6 ? T.P(M.T1, 0).add(V(-0.3, 0.75, 0)) : null),
      mark(`<i>t</i> = ${f(-M.T1)}`, () => t > 6.6 ? T.P(-M.T1, 0).add(V(0.3, 0.75, 0)) : null));
    const zoom = inset(root, tg, pg, labels, { X: ST.one + 1.9, Y: 0.55, xr: [-4, -2], ymax: 0.025, p, title: `p-value = 2 × ${(M.P1 / 2).toFixed(4)} = ${M.P1.toFixed(3)}` });
    ups.push(s => {
      t = M.oneT_(M.clk(s, 'one'));
      play(t, 0, 3.2);
      const u = ramp(t, 3.3, 0.4);
      xb.visible = u > 0.01; xb.scale.setScalar(Math.max(u, 1e-3)); xb.position.copy(B.P(O.xbar, YI, 0.12));
      se.visible = t > 4; if (se.visible) hrod(B, se, O.xbar - O.se, O.xbar + O.se, YI, ramp(t, 4, 0.8), 0.06);
      ci.visible = t > 5; if (ci.visible) hrod(B, ci, O.lo, O.hi, YI, ramp(t, 5, 1), 0.1);
      caps.forEach((m, i) => { const x = i ? O.hi : O.lo; setRod(m, B.P(x, YI - 0.3, 0.1), B.P(x, YI + 0.3, 0.1)); m.visible = t > 6; });
      const d = ramp(t, 6.2, 0.5);
      tb.visible = t > 6.2; tb.position.copy(T.P(M.T1, 0, 0.12)).add(V(0, 0.16 + 3 * (1 - d) ** 2, 0));
      const g = ramp(t, 6.8, 1.4), e = -4 + (M.T1 + 4) * g;
      L.set(() => 0, p, -4, e); R.set(() => 0, p, 4 - (4 - a) * g, 4); zoom.R.set(() => 0, p, -4, Math.max(e, -4 + 1e-3));
    });
  }

  // ---------- 7.5 / 7.8 paired: before–after rods slide over to start at 0, their lengths the differences ----------
  {
    const P = M.PAIR, D = M.PD, Wr = M.WRONG, uy = 0.4, at1 = -2.12, Y = i => 13 - 0.95 * i, YP = 1.6, YW = 0.7;
    const S = graphBoard(root, { at: [ST.paired - 4.7 - 200 * 0.05, at1, 0], x: [120, 280], y: [0, 13.6], unit: [0.05, uy], grid: [20, 0], ticks: [20, 100] });
    const Dd = graphBoard(root, { at: [ST.paired + 4.7 - 5 * 0.1, at1, 0], x: [-30, 40], y: [0, 13.6], unit: [0.1, uy], grid: [5, 0], ticks: [10, 100] });
    dashed(root, Dd.P(0, 0, 0.02), Dd.P(0, 13.5, 0.02));
    const pg = asm('pairs', root, { title: `${P.n} students, before and after`, sub: 'reading speed (words per minute): one rod per student' });
    const pairs = M.BEFORE.map((b, i) => {
      const g = new THREE.Group(); pg.add(g);
      const ends = [ball(g, 0.12, 'dark', 'Before'), ball(g, 0.12, 'ink', 'After')];
      ends[0].position.copy(S.P(b, Y(i), 0.1)); ends[1].position.copy(S.P(M.AFTER[i], Y(i), 0.1));
      setRod(rod(g, { r: 0.03, pal: 'dark', tone: 'lo', name: 'Student' }), S.P(b, Y(i), 0.08), S.P(M.AFTER[i], Y(i), 0.08));
      return { g, ends };
    });
    const dg = asm('diffs', root, { title: 'The differences', sub: 'after − before: each rod slid to start at 0' });
    const slides = M.DIFF.map(() => ({ m: rod(dg, { r: 0.035, pal: 'ink', name: 'Difference' }), e: ball(dg, 0.12, 'red', 'd') }));
    const mean = rod(dg, { r: 0.03, pal: 'blue', name: 'x̄_d' });
    const cg = asm('pairedCI', root, { title: 'The paired t interval', sub: '95% for μ_d, the mean difference' });
    const pci = rod(cg, { r: 0.05, pal: 'red', name: 'Interval' });
    const wg = asm('twoCI', root, { title: 'The two-sample interval (wrong here)', sub: 'the same data treated as independent samples' });
    const wci = rod(wg, { r: 0.05, pal: 'blue', name: 'Interval' });
    let t = 0;
    labels.push(...S.tickLabels({ xName: 'words per minute', yName: '' }), ...Dd.tickLabels({ xName: '<i>d</i>', yName: '' }),
      mark('<span style="color:#9c9ca2">●</span> before&ensp;<span style="color:#2c2c30">● after</span>', () => S.P(200, 13.6).add(V(0, 0.4, 0))),
      mark('<i>d</i> = after − before', () => Dd.P(-14, 13.6).add(V(0, 0.4, 0))),
      mark('paired', () => t > 9.2 ? Dd.P(-19, YP) : null, 'axis'), mark('two-sample', () => t > 10.7 ? Dd.P(-19, YW) : null, 'axis'),
      mark('<i>x̄</i><sub><i>d</i></sub>', () => t > 8.5 ? Dd.P(D.xbar, 13.6).add(V(0.2, 0.4, 0)) : null));
    ups.push(s => {
      t = M.pairT(M.clk(s, 'paired'));
      pairs.forEach(({ g, ends }, i) => { const u = ramp(t, 0.1 * i, 0.5); g.visible = u > 0.01; for (const m of ends) m.scale.setScalar(Math.max(u, 1e-3)); });
      slides.forEach(({ m, e }, i) => {
        const s0 = 1.8 + 0.5 * i, u = ramp(t, s0, 0.8), b = M.BEFORE[i], a = M.AFTER[i], d = M.DIFF[i];
        m.visible = t > s0; e.visible = u > 0.98;
        if (!m.visible) return;
        const A = S.P(b, Y(i), 0.12).lerp(Dd.P(0, Y(i), 0.12), u), Bq = S.P(a, Y(i), 0.12).lerp(Dd.P(d, Y(i), 0.12), u);
        setRod(m, A, Bq); e.position.copy(Dd.P(d, Y(i), 0.14));
      });
      const um = ramp(t, 8.3, 0.7);
      mean.visible = um > 0.01; if (mean.visible) setRod(mean, Dd.P(D.xbar, Y(11) - 0.6, 0.06), Dd.P(D.xbar, lerp(Y(11) - 0.6, 13.4, um), 0.06));
      pci.visible = t > 9; if (pci.visible) hrod(Dd, pci, D.lo, D.hi, YP, ramp(t, 9, 1.2));
      wci.visible = t > 10.5; if (wci.visible) hrod(Dd, wci, Wr.lo, Wr.hi, YW, ramp(t, 10.5, 1.4));
    });
  }

  // ---------- 7.6–7.9 two samples of batteries; the interval for the difference; the one-sided test ----------
  {
    const TT = M.TT, A = TT.A, Bs = TT.B, YA = 2.6, YB = 0.35;
    const B = graphBoard(root, { at: [ST.two - 4 - 12 * 1.3, 0.6, 0], x: [9, 15], y: [0, 4.8], unit: [1.3, 0.6], grid: [0.5, 0], ticks: [1, 100] });
    lines(root, [...B.P(9, YA, 0.01).toArray(), ...B.P(15, YA, 0.01).toArray()], '#c4c4c8');
    const ag = asm('brandA', root, { title: 'Brand A', sub: `${A.n} batteries: hours of light` }), bg = asm('brandB', root, { title: 'Brand B', sub: `${Bs.n} batteries: hours of light` });
    const playA = dotplot(B, ag, M.BAT_A, { base: YA, r: 0.12, pal: 'ink', name: 'Battery' }), playB = dotplot(B, bg, M.BAT_B, { base: YB, r: 0.12, pal: 'dark', name: 'Battery' });
    const mA = rod(ag, { r: 0.03, pal: 'blue', name: 'x̄_A' }), mB = rod(bg, { r: 0.03, pal: 'blue', name: 'x̄_B' });
    const Dg = graphBoard(root, { at: [ST.two - 4 - 1.25 * 1.6, -2.4, 0], x: [-1, 3.5], y: [0, 1.4], unit: [1.6, 0.6], grid: [0.25, 0], ticks: [0.5, 100] });
    const cg = asm('diffCI', root, { title: 'The 95% interval for μ_A − μ_B', sub: '(x̄_A − x̄_B) ± t*·SE' });
    const db = ball(cg, 0.15, 'ink', 'x̄_A − x̄_B'), ci = rod(cg, { r: 0.045, pal: 'red', name: 'Interval' });
    const kg = asm('claims2', root, { title: 'Two claims', sub: `0 (no difference) and ${M.TWO.claim} hours` });
    setRod(rod(kg, { r: 0.03, pal: 'blue', name: '0' }), Dg.P(0, 0, 0.06), Dg.P(0, 1.4, 0.06));
    setRod(rod(kg, { r: 0.03, pal: 'dark', name: `${M.TWO.claim}` }), Dg.P(M.TWO.claim, 0, 0.06), Dg.P(M.TWO.claim, 1.4, 0.06));
    let t = 0;
    labels.push(...B.tickLabels({ xName: 'hours', yName: '' }), ...Dg.tickLabels({ xName: '<i>μ</i><sub>A</sub> − <i>μ</i><sub>B</sub>', yName: '' }),
      mark('brand A', () => B.P(9, YA + 0.4), 'axis'), mark('brand B', () => B.P(9, YB + 0.4), 'axis'),
      mark('<i>x̄</i><sub>A</sub>', () => t > 3 ? B.P(A.xbar, YA + 1.95) : null), mark('<i>x̄</i><sub>B</sub>', () => t > 3 ? B.P(Bs.xbar, YB + 1.95) : null),
      mark('0: outside', () => Dg.P(0, 1.4).add(V(0, 0.3, 0))), mark(`${M.TWO.claim}: inside`, () => Dg.P(M.TWO.claim, 1.4).add(V(0, 0.3, 0))),
      mark(f(TT.lo), () => t > 6 ? Dg.P(TT.lo, 0.7).add(V(0.15, 0.32, 0)) : null), mark(f(TT.hi), () => t > 6 ? Dg.P(TT.hi, 0.7).add(V(0.45, 0.32, 0)) : null));

    const T = graphBoard(root, { at: [ST.two + 7, -1.8, 0], x: [-4, 4], y: [0, 0.42], unit: [0.9, 11], grid: [0.5, 0.05], ticks: [1, 0.1] });
    const tg = asm('tcurve2', root, { title: `The t distribution, df = ${TT.df.toFixed(1)}`, sub: 'from the two-sample formula' });
    const p = x => tPdf(x, TT.df);
    curve(T, tg, p, -4, 4, { pal: 'ink', r: 0.03, name: 't' });
    const pg = asm('pval2', root, { title: 'The p-value', sub: 'the area above t: Hₐ is μ_A − μ_B > 0' });
    const R = region(T, pg, { pal: 'red', opacity: 0.5, name: 'Tail' }), tb = ball(pg, 0.15, 'red', 't');
    setRod(rod(pg, { r: 0.025, name: 't' }), T.P(M.T2, 0, 0.05), T.P(M.T2, p(M.T2), 0.05));
    labels.push(...T.tickLabels({ xName: 't', yName: 'density' }),
      mark(`<i>df</i> = ${TT.df.toFixed(1)}`, () => T.P(-2.2, 0.36)),
      mark(`<i>t</i> = ${f(M.T2)}`, () => t > 6.6 ? T.P(M.T2, 0).add(V(0.1, 0.75, 0)) : null));
    const zoom = inset(root, tg, pg, labels, { X: ST.two + 8.6, Y: 0.6, xr: [2, 4], ymax: 0.02, p, title: `p-value = ${M.P2.toFixed(4)}` });
    ups.push(s => {
      t = M.twoT_(M.clk(s, 'two'));
      playA(t, 0, 1.4); playB(t, 1.3, 2.6);
      const um = ramp(t, 2.8, 0.7);
      mA.visible = mB.visible = um > 0.01;
      if (um > 0.01) { setRod(mA, B.P(A.xbar, YA - 0.1, 0.06), B.P(A.xbar, YA - 0.1 + 1.8 * um, 0.06)); setRod(mB, B.P(Bs.xbar, YB - 0.1, 0.06), B.P(Bs.xbar, YB - 0.1 + 1.8 * um, 0.06)); }
      const ud = ramp(t, 3.6, 0.6);
      db.visible = ud > 0.01; db.scale.setScalar(Math.max(ud, 1e-3)); db.position.copy(Dg.P(TT.d, 0.7, 0.14));
      ci.visible = t > 4.6; if (ci.visible) hrod(Dg, ci, TT.lo, TT.hi, 0.7, ramp(t, 4.6, 1.2), 0.1);
      const d = ramp(t, 6.2, 0.5);
      tb.visible = t > 6.2; tb.position.copy(T.P(M.T2, 0, 0.12)).add(V(0, 0.16 + 3 * (1 - d) ** 2, 0));
      const g = ramp(t, 6.8, 1.4);
      R.set(() => 0, p, 4 - (4 - M.T2) * g, 4); zoom.R.set(() => 0, p, 4 - (4 - M.T2) * g, 4);
    });
  }

  // ---------- 7.10 choosing: a path through the questions for each example ----------
  {
    const at = [[-1.45, 3.4], [-5.6, 1.0], [2.7, 1.0], [-5.6, -1.4], [-1.4, -1.4], [2.7, -1.4], [6.8, -1.4]];
    const html = ['What is the parameter?', 'a proportion <i>p</i>', 'a mean <i>μ</i>', '<i>z</i> for <i>p</i>', 'one-sample <i>t</i>', 'paired <i>t</i>', 'two-sample <i>t</i>'];
    const edges = [[0, 1], [0, 2], [1, 3], [2, 4], [2, 5], [2, 6]];
    const Wp = ([x, y], z = 0) => V(ST.choose + x, y, z);
    const tg = asm('tree', root, { title: 'The questions', sub: 'what kind of data, then how it was produced' });
    at.forEach(p => part(tg, box(3.6, 1.0, 0.16, 0.05), { pal: 'paper', tone: 'lo', pos: Wp(p, -0.08).toArray(), name: 'Question' }));
    const ends = ([a, b]) => [Wp(at[a]).add(V(0, -0.5, 0.02)), Wp(at[b]).add(V(0, 0.5, 0.02))];
    for (const e of edges) setRod(rod(tg, { r: 0.025, pal: 'dark', tone: 'lo', name: 'Branch' }), ...ends(e));
    at.forEach((p, k) => labels.push(mark(html[k], () => Wp(p, 0.1))));
    labels.push(mark('categorical', () => Wp([-4.4, 2.4])), mark('quantitative', () => Wp([1.6, 2.4])),
      mark('one sample', () => Wp([-0.6, -0.15])), mark('paired', () => Wp([3.35, -0.2])), mark('two, independent', () => Wp([6.0, -0.15])));
    const pg = asm('path', root, { title: 'This example’s path', sub: 'ending at its procedure' });
    const red = edges.map(e => rod(pg, { r: 0.04, pal: 'red', name: 'Path' }));
    const leaf = part(pg, box(3.8, 1.2, 0.1, 0.06), { pal: 'red', tone: 'mid', name: 'Procedure' }); leaf.userData.home = null;
    const b = ball(pg, 0.2, 'red', 'Example');
    let c = { k: 0, u: 0 };
    labels.push(live(() => Wp([-6.9, 5.1]), () => `“${M.CHOOSE.ex[c.k][0]}”`, 'board'));
    ups.push(s => {
      c = M.chooseAt(M.clk(s, 'choose'));
      const path = M.CHOOSE.ex[c.k][1], u1 = ramp(c.u, 0.15, 0.22), u2 = ramp(c.u, 0.42, 0.22);
      edges.forEach((e, j) => {
        const step = e[0] === path[0] && e[1] === path[1] ? u1 : e[0] === path[1] && e[1] === path[2] ? u2 : 0;
        red[j].visible = step > 0.01;
        if (step > 0.01) { const [p, q] = ends(e); setRod(red[j], p, p.clone().lerp(q, step)); }
      });
      const pos = c.u < 0.42 ? Wp(at[path[0]]).lerp(Wp(at[path[1]]), u1) : Wp(at[path[1]]).lerp(Wp(at[path[2]]), u2);
      b.position.copy(pos).add(V(-1.6, 0, 0.25));
      leaf.visible = u2 > 0.99; leaf.position.copy(Wp(at[path[2]], -0.2));
    });
  }

  return { labels, update: s => { for (const f of ups) f(s); } };
}
