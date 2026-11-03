// The figure: one scene per idea, spread along +x, the camera flying between them page by page.
// Graph paper from the kit for every plot; points as small balls, bars as boxes, normal and t curves as tubes with
// shaded regions; the population's normal curves stand up out of the paper. Red marks the thing that matters.
import * as THREE from 'three';
import { graphBoard, curve, dot, putAt, rod, setRod, bars, region, V } from '../kit.js';
import { part, box, lines, shadeMat } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { model: 0, fan: 30, resid: 64, ci: 98, nul: 128, tdist: 154, choose: 182 };
const AXIS = '#6e6e74';

const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const f = (v, d = 2) => (v < -1e-12 ? '−' : '') + Math.abs(v).toFixed(d);
// a thin dashed line between two world points
function dashed(parent, a, b, color = '#8a8a8f') {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 }));
  l.userData = { noEdge: true }; l.computeLineDistances(); parent.add(l);
  return l;
}
// axis lines along the bottom and the left of a board whose ranges leave out 0
const frame = (B, parent) => lines(parent, [...B.P(B.x0, B.y0, 0.003).toArray(), ...B.P(B.x1, B.y0, 0.003).toArray(), ...B.P(B.x0, B.y0, 0.003).toArray(), ...B.P(B.x0, B.y1, 0.003).toArray()], AXIS);
// numbers along the bottom edge only (for boards whose own axes would cut through the middle)
const xTicks = (B, vals, fmt = v => f(v, 0)) => vals.map(v => ({ cls: 'tick', html: fmt(v), at: () => B.P(v, B.y0).add(V(0.12, -0.22, 0)) }));
const ball = (parent, r, pal, name) => { const m = dot(parent, { r, pal, name, tone: 'mid' }); m.userData.home = null; return m; };
// a straight line y = a + b·x across the board's x range
const lineOn = (B, m, a, b, lift = 0.05) => setRod(m, B.P(B.x0, a + b * B.x0, lift), B.P(B.x1, a + b * B.x1, lift));

// up to n thin grey lines (earlier samples' fitted lines), set each frame: set([[A, B], …]) in world points
function linePool(parent, n, color = '#a8a8ae') {
  const pos = new Float32Array(n * 6), geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const l = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color }));
  l.userData = { noEdge: true }; l.frustumCulled = false; parent.add(l);
  l.set = segs => { segs.slice(0, n).forEach(([a, b], k) => pos.set([a.x, a.y, a.z, b.x, b.y, b.z], k * 6)); geo.setDrawRange(0, 2 * Math.min(segs.length, n)); geo.attributes.position.needsUpdate = true; };
  return l;
}
const ends = (B, a, b, lift = 0.04) => [B.P(B.x0, a + b * B.x0, lift), B.P(B.x1, a + b * B.x1, lift)];

// a normal curve standing up out of the paper at x0: centre m, SD sd, peak H world units out of the board (+z)
function bell(B, parent, x0, m, sd, H, name) {
  const g = new THREE.Group(); parent.add(g);
  const lo = Math.max(B.y0, m - 3.3 * sd), hi = Math.min(B.y1, m + 3.3 * sd), n = 60, pts = [], pos = [];
  for (let i = 0; i <= n; i++) {
    const y = lo + (hi - lo) * i / n, z = H * Math.exp(-0.5 * ((y - m) / sd) ** 2);
    pts.push(B.P(x0, y, z + 0.02));
    pos.push(...B.P(x0, y, 0.02).toArray(), ...B.P(x0, y, z + 0.02).toArray());
  }
  part(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.035, 16), { pal: 'blue', tone: 'hi', name });
  const geo = new THREE.BufferGeometry(), idx = [];
  for (let i = 0; i < n; i++) { const k = 2 * i; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  geo.setIndex(idx); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
  const mat = shadeMat('blue', { opacity: 0.22 }).clone(); mat.side = THREE.DoubleSide; mat.depthWrite = false;
  const fill = new THREE.Mesh(geo, mat); fill.userData = { noEdge: true }; g.add(fill);
  return g;
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];          // per-frame updates, each (state) => void
  const P = M.POP;
  const hoursBoard = x0 => {
    const B = graphBoard(root, { at: [x0, -P.Y[0] * 0.07, 0], x: P.X, y: P.Y, unit: [0.8, 0.07], grid: [1, 10], ticks: [2, 20] });
    frame(B, root);
    labels.push(...B.tickLabels({ xName: 'hours studied', yName: 'score', skipY: [100] }));
    return B;
  };

  // ---------- opener and 9.1: the population model, and one sample drawn from it ----------
  {
    const B = hoursBoard(ST.model - 4.2);
    const pl = asm('popline', root, { title: 'The population regression line', sub: 'μ_y = α + βx: the mean score at each number of hours' });
    lineOn(B, rod(pl, { r: 0.045, pal: 'ink', name: 'μ_y = α + βx' }), P.alpha, P.beta);
    const bl = asm('bells', root, { title: 'The distributions of y', sub: 'at each x the scores are normal about the line, with the same σ' });
    const H = 1.5;
    for (const x of M.BELLS) {
      bell(B, bl, x, M.mu(x), P.sigma, H, `Scores at ${x} h`);
      putAt(B, dot(bl, { r: 0.07, pal: 'ink', name: `μ_y at ${x} h` }), x, M.mu(x), 0.05);
    }
    const sm = asm('sample', root, { title: 'One sample of 18 students', sub: 'each score drawn from the normal curve at its hours' });
    const pts = M.DATA.x.map(() => ball(sm, 0.11, 'ink', 'Student'));
    const ft = asm('fit0', root, { title: 'The sample’s least-squares line', sub: 'ŷ = a + bx: an estimate of the population line' });
    const fl = rod(ft, { r: 0.04, pal: 'red', name: 'ŷ = a + bx' });
    let t = 0;
    const done = () => M.drawn(M.N - 1, t) >= 1;
    labels.push(mark('μ<sub><i>y</i></sub> = α + β<i>x</i>', () => B.P(10.5, M.mu(10.5) + 4).add(V(0.2, 0.15, 0))),
      mark('<i>ŷ</i> = <i>a</i> + <i>bx</i>', () => done() ? B.P(10.5, M.yhat(10.5) - 6).add(V(0.25, 0, 0)) : null),
      mark('σ', () => B.P(9, M.mu(9) + P.sigma).add(V(0, 0, 0.6 * H + 0.15))));
    ups.push(s => {
      t = M.modelT(M.clk(s, 'model'));
      M.DATA.x.forEach((x, i) => {
        const u = M.drawn(i, t); pts[i].visible = u > 0;
        if (u > 0) putAt(B, pts[i], x, M.mu(x) + (M.DATA.y[i] - M.mu(x)) * u, 0.12);
      });
      fl.visible = done(); if (fl.visible) lineOn(B, fl, M.FIT.a, M.FIT.b, 0.07);
    });
  }

  // ---------- 9.1 repeated samples: fitted lines fan about the true line; their slopes pile up ----------
  {
    const B = hoursBoard(ST.fan - 9.6);
    lineOn(B, rod(root, { r: 0.04, pal: 'ink', name: 'Population line' }), P.alpha, P.beta, 0.04);
    const fg = asm('fan', root, { title: 'Repeated samples', sub: 'the same 18 hours, new scores each time, a new fitted line each time' });
    const pts = M.DATA.x.map(() => ball(fg, 0.09, 'ink', 'Student'));
    const now = rod(fg, { r: 0.04, pal: 'red', name: 'This sample’s line' });
    const old = linePool(fg, 14);
    // the dotplot of b, and the sampling distribution N(β, σ_b) scaled to counts
    const D = graphBoard(root, { at: [ST.fan + 0.9 + 0.5 * 1.3, 0.6, 0], x: [-0.5, 5.5], y: [0, 16], unit: [1.3, 0.25], grid: [0.5, 2], ticks: [1, 4], axes: false });
    frame(D, root);
    const dg = asm('dotplot', root, { title: 'The sample slopes, b', sub: 'one ball per sample: the sampling distribution of b' });
    const scale = M.NFAN * M.FAN_BIN;
    curve(D, dg, b => scale * M.normPdf(b, P.beta, M.SIGMA_B), -0.5, 5.5, { r: 0.03, pal: 'blue', name: 'Normal, mean β, SD σ_b' });
    const level = [], seen = {};
    const bin = b => Math.floor((b + 0.5) / M.FAN_BIN);
    M.FAN.forEach(s => { const k = bin(s.b); level.push(seen[k] = (seen[k] || 0) + 1); });
    const balls = M.FAN.map(() => ball(dg, 0.12, 'ink', 'A sample slope'));
    setRod(rod(dg, { r: 0.02, pal: 'ink', name: 'β' }), D.P(P.beta, 0, 0.02), D.P(P.beta, 15, 0.02));
    let k = 0;
    labels.push(...xTicks(D, [0, 1, 2, 3, 4, 5]), mark('sample slope <i>b</i>', () => D.P(5.5, 0).add(V(0.3, -0.62, 0)), 'axis'),
      mark('β = ' + P.beta, () => D.P(P.beta, 15.6)),
      live(() => D.P(-0.4, 14.8), () => `samples: ${k}`, 'board'));
    ups.push(s => {
      const t = M.fanT(M.clk(s, 'fan')); k = M.fanCount(t);
      const cur = M.FAN[Math.max(k - 1, 0)];
      M.DATA.x.forEach((x, i) => putAt(B, pts[i], x, cur.y[i], 0.1));
      lineOn(B, now, cur.a, cur.b, 0.08);
      old.set(M.FAN.slice(Math.max(k - 15, 0), Math.max(k - 1, 0)).map(q => ends(B, q.a, q.b)));
      balls.forEach((m, i) => {
        m.visible = i < k; if (!m.visible) return;
        const drop = 3 * (1 - M.smooth((t - M.fanAt(i)) / 0.35)), bb = M.FAN[i].b, c = -0.5 + (bin(bb) + 0.5) * M.FAN_BIN;
        m.position.copy(D.P(c, level[i] - 0.5 + drop, 0.13));
        m.material = shadeMat(i === k - 1 ? 'red' : 'ink');
      });
    });
  }

  // ---------- 9.2 the fitted line, its residuals, the residual plot and the histogram of residuals ----------
  {
    const B = hoursBoard(ST.resid - 14);
    const fg = asm('fit', root, { title: 'The least-squares line', sub: `ŷ = ${f(M.OUT.a, 3)} + ${f(M.OUT.b, 3)}x, from the computer output` });
    lineOn(B, rod(fg, { r: 0.045, pal: 'red', name: 'ŷ = a + bx' }), M.FIT.a, M.FIT.b, 0.06);
    const sg = asm('data', root, { title: 'The sample', sub: '18 students: hours studied and test score' });
    M.DATA.x.forEach((x, i) => putAt(B, dot(sg, { r: 0.1, pal: 'ink', name: `${x} h, ${M.DATA.y[i]}` }), x, M.DATA.y[i], 0.12));
    const rg = asm('resids', root, { title: 'The residuals', sub: 'y − ŷ: each point’s distance above or below the line' });
    const sticks = M.DATA.x.map(() => rod(rg, { r: 0.025, pal: 'blue', name: 'Residual' }));

    const R = graphBoard(root, { at: [ST.resid - 3.4, 2.5, 0], x: [0, 10.5], y: [-25, 25], unit: [0.6, 0.09], grid: [1, 5], ticks: [2, 10] });
    const pg = asm('residplot', root, { title: 'The residual plot', sub: 'residual against x: no curve, no fan, so the line and σ fit' });
    const rdots = M.DATA.x.map(() => ball(pg, 0.11, 'ink', 'Residual'));
    const H = graphBoard(root, { at: [ST.resid + 7.6, 0.25, 0], x: [-25, 25], y: [0, 8], unit: [0.13, 0.5], grid: [5, 1], ticks: [10, 2], axes: false });
    frame(H, root);
    const hg = asm('hist', root, { title: 'Histogram of the residuals', sub: 'roughly symmetric, one peak: normal enough' });
    const hb = bars(H, hg, M.HIST.length, { pal: 'blue', name: 'Residuals', depth: 0.3 });
    labels.push(...R.tickLabels({ xName: 'hours', yName: 'residual' }), ...xTicks(H, [-20, -10, 0, 10, 20]),
      ...[2, 4, 6, 8].map(c => ({ cls: 'tick', html: `${c}`, at: () => H.P(-25, c).add(V(-0.1, 0, 0)) })),
      mark('residual', () => H.P(25, 0).add(V(0.15, -0.62, 0)), 'axis'), mark('count', () => H.P(-25, 8).add(V(0.25, 0.3, 0)), 'axis'),
      mark('<i>ŷ</i> = <i>a</i> + <i>bx</i>', () => B.P(10.5, M.yhat(10.5) - 7).add(V(0.25, 0, 0))));
    let n = 0;
    ups.push(s => {
      const t = M.residT(M.clk(s, 'resid')); n = Math.min(Math.floor(t / M.RES_RUN.each) + 1, M.N);
      M.DATA.x.forEach((x, i) => {
        const on = i < n; sticks[i].visible = rdots[i].visible = on;
        if (!on) return;
        setRod(sticks[i], B.P(x, M.yhat(x), 0.09), B.P(x, M.DATA.y[i], 0.09));
        putAt(R, rdots[i], x, M.RES[i], 0.1);
      });
      hb.set(M.HIST.map(([a, b]) => [a, b, M.RES.slice(0, n).filter(r => r >= a && r < b).length]));
    });
  }

  // ---------- 9.2–9.3 the interval for β, against 0 and a claimed value; and 25 intervals from 25 samples ----------
  {
    const B = graphBoard(root, { at: [ST.ci - 9.4 + 1.5 * 1.1, 0.6, 0], x: [-1.5, 6], y: [-0.14, 0.55], unit: [1.1, 6], grid: [0.5, 0.1], ticks: [1, 0.1], axes: false });
    lines(root, [...B.P(-1.5, 0, 0.003).toArray(), ...B.P(6, 0, 0.003).toArray()], AXIS);
    const sd = asm('sampdist', root, { title: 'Where β could be', sub: 't curve centred at b, spread SE_b, df = n − 2' });
    const dens = x => M.tPdf((x - M.OUT.b) / M.OUT.seB, M.DF) / M.OUT.seB;
    curve(B, sd, dens, -1.5, 6, { r: 0.03, pal: 'ink', name: 'b ± t·SE_b' });
    const shade = region(B, sd, { pal: 'red', opacity: 0.3, name: 'The middle C' });
    const ig = asm('interval', root, { title: 'The confidence interval', sub: 'b ± t*·SE_b' });
    const bar = rod(ig, { r: 0.055, pal: 'red', name: 'Interval' }), ends = [0, 1].map(() => ball(ig, 0.1, 'red', 'End'));
    putAt(B, dot(ig, { r: 0.13, pal: 'ink', name: 'b' }), M.OUT.b, -0.07, 0.1);
    const cg = asm('claims', root, { title: 'Values to test against', sub: `0 (no linear relationship) and ${M.CLAIM} (a claim)` });
    for (const v of [0, M.CLAIM]) setRod(rod(cg, { r: 0.025, pal: 'blue', name: v ? 'The claim' : 'No relationship' }), B.P(v, -0.13, 0.05), B.P(v, 0.5, 0.05));
    let I = M.CI95;
    labels.push(...xTicks(B, [-1, 0, 1, 2, 3, 4, 5, 6]),
      mark('slope β (points per hour)', () => B.P(6, -0.14).add(V(0.3, -0.5, 0)), 'axis'),
      mark('<i>b</i>', () => B.P(M.OUT.b, -0.07).add(V(0, -0.35, 0))),
      mark('0', () => B.P(0, 0.5).add(V(0, 0.25, 0))), mark(`claim: ${M.CLAIM}`, () => B.P(M.CLAIM, 0.5).add(V(0, 0.25, 0))),
      live(() => B.P(-1.5, 0.55).add(V(0, 0.55, 0)), () => `${(100 * I.C).toFixed(0)}% interval: ${f(I.lo, 2)} to ${f(I.hi, 2)}`, 'board'));

    const S = graphBoard(root, { at: [ST.ci + 0.4 + 1.5 * 0.7, 0.6, 0], x: [-1.5, 6], y: [0, 26], unit: [0.7, 0.16], grid: [0.5, 0], ticks: [1, 5], axes: false });
    frame(S, root);
    const kg = asm('stack', root, { title: '25 samples, 25 intervals', sub: `about 95% of them catch β; here ${M.NSTACK - M.MISSES} of ${M.NSTACK}` });
    setRod(rod(kg, { r: 0.025, pal: 'ink', name: 'β' }), S.P(P.beta, 0, 0.03), S.P(P.beta, 26, 0.03));
    const ivs = M.STACK.map((iv, i) => { const m = rod(kg, { r: 0.022, pal: iv.hit ? 'dark' : 'red', name: iv.hit ? 'Catches β' : 'Misses β' }); setRod(m, S.P(iv.lo, i + 1, 0.07), S.P(iv.hi, i + 1, 0.07)); return m; });
    const cs = M.STACK.map((iv, i) => { const m = dot(kg, { r: 0.06, pal: iv.hit ? 'ink' : 'red', name: 'b' }); putAt(S, m, iv.b, i + 1, 0.08); return m; });
    let shown = 0;
    labels.push(...xTicks(S, [0, 2, 4, 6]), mark('β = ' + P.beta, () => S.P(P.beta, 26).add(V(0, 0.3, 0))),
      live(() => S.P(-1.5, 26).add(V(0, 0.75, 0)), () => `missed β: ${M.STACK.slice(0, shown).filter(s => !s.hit).length} of ${shown}`, 'board'));
    ups.push(s => {
      I = M.interval(M.ciC(s));
      shade.set(() => 0, dens, I.lo, I.hi);
      setRod(bar, B.P(I.lo, -0.07, 0.1), B.P(I.hi, -0.07, 0.1)); putAt(B, ends[0], I.lo, -0.07, 0.1); putAt(B, ends[1], I.hi, -0.07, 0.1);
      const t = M.stackT(M.clk(s, 'stack')); shown = Math.min(Math.floor(t / M.STACK_RUN.each) + 1, M.NSTACK);
      ivs.forEach((m, i) => { m.visible = cs[i].visible = i < shown; });
    });
  }

  // ---------- 9.4 the world of H₀: a flat true line; fitted lines from samples drawn there, against ours ----------
  {
    const B = hoursBoard(ST.nul - 4.2);
    const ng = asm('nullfan', root, { title: 'If H₀ were true', sub: 'β = 0: samples from a flat line, and their fitted lines' });
    lineOn(B, rod(ng, { r: 0.04, pal: 'ink', name: 'β = 0' }), M.FIT.my, 0, 0.04);
    const ls = linePool(ng, M.NULL_LINES);
    const og = asm('ours', root, { title: 'Our sample’s line', sub: `slope ${f(M.OUT.b, 3)}: steeper than almost every null line` });
    lineOn(B, rod(og, { r: 0.045, pal: 'red', name: 'Our ŷ' }), M.FIT.a, M.FIT.b, 0.08);
    M.DATA.x.forEach((x, i) => putAt(B, dot(og, { r: 0.1, pal: 'ink', name: 'Student' }), x, M.DATA.y[i], 0.1));
    let n = 0;
    labels.push(mark('β = 0', () => B.P(10.5, M.FIT.my).add(V(0.5, 0, 0))), mark('ours', () => B.P(10.5, M.yhat(10.5)).add(V(0.45, 0, 0))),
      live(() => B.P(0.3, 96), () => `null samples: ${n} &ensp; as steep as ours: ${M.NULLS.slice(0, n).filter(s => Math.abs(s.b) >= M.OUT.b).length}`, 'board'));
    ups.push(s => {
      const t = M.nullT(M.clk(s, 'nul')); n = Math.min(Math.floor(t / M.NULL_RUN.each) + 1, M.NNULL);
      ls.set(M.NULLS.slice(Math.max(n - M.NULL_LINES, 0), n).map(q => ends(B, q.a, q.b)));
    });
  }

  // ---------- 9.5 the t distribution, df = n − 2: the null samples' t values pile up; the tails beyond ours are P ----------
  {
    const B = graphBoard(root, { at: [ST.tdist, 0, 0], x: [-4.5, 4.5], y: [0, 26], unit: [1.1, 0.18], grid: [0.5, 0], ticks: [1, 5], axes: false });
    frame(B, root);
    const scale = M.NNULL * M.T_BIN, dens = t => scale * M.tPdf(t, M.DF);
    const cg = asm('tcurve', root, { title: `The t distribution, df = ${M.DF}`, sub: 'how t = b/SE_b varies when β = 0' });
    curve(B, cg, dens, -4.5, 4.5, { r: 0.035, pal: 'ink', name: `t, df = ${M.DF}` });
    const pg = asm('pvalue', root, { title: 'The P-value', sub: `the area beyond ±${M.OUT.t}: two-sided` });
    for (const sg of [1, -1]) region(B, pg, { pal: 'red', opacity: 0.45, name: 'Tail' }).set(() => 0, dens, sg > 0 ? M.T_OBS : -4.5, sg > 0 ? 4.5 : -M.T_OBS);
    const tg = asm('tstat', root, { title: 'Our t statistic', sub: `T = ${M.OUT.t} in the output: b over SE_b` });
    setRod(rod(tg, { r: 0.035, pal: 'red', name: 't' }), B.P(M.T_OBS, 0, 0.06), B.P(M.T_OBS, 12, 0.06));
    setRod(rod(tg, { r: 0.02, pal: 'dark', name: '−t' }), B.P(-M.T_OBS, 0, 0.06), B.P(-M.T_OBS, 12, 0.06));
    const dg = asm('nullts', root, { title: 'The null samples’ t values', sub: `${M.NNULL} samples from the flat line: ${M.NULL_EXTREME} as far out as ours` });
    const level = [], seen = {}, bin = t => Math.floor((t + 4.5) / M.T_BIN);
    M.NULLS.forEach(s => { const k = bin(s.t); level.push(seen[k] = (seen[k] || 0) + 1); });
    const balls = M.NULLS.map(s => ball(dg, 0.085, Math.abs(s.t) >= M.T_OBS ? 'red' : 'dark', 'A null t'));
    let n = 0;
    labels.push(...xTicks(B, [-4, -3, -2, -1, 0, 1, 2, 3, 4]), mark('<i>t</i>', () => B.P(4.5, 0).add(V(0.3, -0.25, 0)), 'axis'),
      mark(`<i>t</i> = ${M.OUT.t}`, () => B.P(M.T_OBS, 12).add(V(0, 0.3, 0))), mark(`−${M.OUT.t}`, () => B.P(-M.T_OBS, 12).add(V(0, 0.3, 0))),
      mark(`<i>P</i> = ${M.OUT.p.toFixed(3)}`, () => B.P(3.4, 3.2)),
      live(() => B.P(-4.4, 24), () => `null samples: ${n} &ensp; |<i>t</i>| ≥ ${M.OUT.t}: ${M.NULLS.slice(0, n).filter(s => Math.abs(s.t) >= M.T_OBS).length}`, 'board'));
    ups.push(s => {
      const t = M.nullT(M.clk(s, 'tdist')); n = Math.min(Math.floor(t / M.NULL_RUN.each) + 1, M.NNULL);
      balls.forEach((m, i) => {
        m.visible = i < n; if (!m.visible) return;
        const c = -4.5 + (bin(M.NULLS[i].t) + 0.5) * M.T_BIN, drop = 4 * (1 - M.smooth((t - i * M.NULL_RUN.each) / 0.3));
        m.position.copy(B.P(c, level[i] - 0.5 + drop, 0.1));
      });
    });
  }

  // ---------- 9.6 which procedure? a question at the top, nine procedures below; the one that fits steps out ----------
  {
    const W = 3.1, Hh = 1.15, gap = 0.3, top = 5.2;
    const qg = asm('question', root, { title: 'The question', sub: 'what is measured, how many samples, estimate or test' });
    part(qg, box(3 * W + 2 * gap, 1.0, 0.2, 0.04), { pal: 'paper', tone: 'lo', pos: [ST.choose, top, 0], name: 'The question' });
    const pk = asm('pick', root, { title: 'The procedures', sub: 'the one that fits the question steps forward' });
    const cards = M.PROCS.map((_, i) => {
      const c = V(ST.choose + (i % 3 - 1) * (W + gap), top - 1.6 - Math.floor(i / 3) * (Hh + gap), 0);
      const m = part(pk, box(W, Hh, 0.3, 0.05), { pal: 'paper', tone: 'lo', pos: [c.x, c.y, 0], name: M.PROCS[i][0] }); m.userData.home = null;
      const bar = part(pk, box(W - 0.3, 0.1, 0.05, 0.02), { pal: 'red', tone: 'hi', pos: [c.x, c.y - 0.38, 0.2], name: 'Chosen' }); bar.userData.home = null;
      return { m, bar, c };
    });
    const heads = ['categorical', 'quantitative', 'relationships'];
    let k = 0;
    labels.push(live(() => V(ST.choose - 1.5 * W - gap + 0.25, top, 0.15), () => M.CASES[k][0], 'board'),
      ...M.PROCS.map(([a, b], i) => live(() => cards[i].c.clone().add(V(-W / 2 + 0.2, 0.08, 0.25 + cards[i].m.position.z)), () => `<b>${a}</b><br><span style="font-size:13px">${b}</span>`, 'board')),
      ...heads.map((h, r) => mark(h, () => V(ST.choose + 1.5 * W + gap + 0.3, top - 1.6 - r * (Hh + gap), 0), 'board')));
    ups.push(s => {
      const c = M.clk(s, 'choose'); k = M.caseAt(c);
      const u = M.smooth(((c % M.CASE_EACH) - 0.6) / 0.5);
      cards.forEach((o, i) => {
        const on = i === M.CASES[k][1], z = on ? 0.6 * u : 0;
        o.m.position.set(o.c.x, o.c.y, z); o.bar.position.set(o.c.x, o.c.y - 0.38, z + 0.17);
        o.bar.visible = on && u > 0.05;
      });
    });
  }

  return { labels, update: s => { for (const fn of ups) fn(s); } };
}
