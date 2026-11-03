// The figure: one long table of scenes, side by side along x, the camera flying between them page by page.
// A tower of slabs whose heights are the terms of a geometric series; graph paper for partial sums, terms and
// ratios (one dot per partial sum, one bar per term); and graph paper for power series, their partial sums
// gaining terms on top of the function they add up to. Every number comes from model.js.
import * as THREE from 'three';
import { part, box, lines, shadeMat } from '../engine/parts.js';
import { graphBoard, curve, liveCurve, dot, hole, putAt, rod, setRod, bars, region, V } from '../kit.js';
import * as M from './model.js';

// each scene's centre along x
export const SC = { tower: 0, tele: 16, nth: 32, integral: 48, pser: 64, cmp: 80, alt: 96, ratio: 112, abs: 128, taylor: 144, lagrange: 160, interval: 176, maclaurin: 192, atan: 208 };

const fmt = v => (v < 0 ? '−' : '') + +Math.abs(v).toFixed(2);
const steps = (a, b, d) => { const out = []; for (let v = Math.ceil(a / d - 1e-9) * d; v <= b + 1e-9; v += d) out.push(+v.toFixed(10)); return out; };
const ease = u => u * u * (3 - 2 * u);

// graph paper with its own x and y scales (world metres per math unit), centred on x = X. The kit's board is
// isotropic, so it is built in world units and everything drawn on it goes through P / fn.
function plot(root, { X, z = 0, x: [x0, x1], y: [y0, y1], sx, sy = sx, grid = [1, 1], ticks = [1, 1], xName = 'n', yName = '', fy = fmt, xTicks }) {
  const at = [X - (x0 + x1) / 2 * sx, 0, z];
  const B = graphBoard(root, { at, x: [x0 * sx, x1 * sx], y: [y0 * sy, y1 * sy], unit: 1, grid: [grid[0] * sx, grid[1] * sy], ticks: [0, 0] });
  const P = (x, y, lift = 0) => B.P(x * sx, y * sy, lift);
  const yAt = y0 <= 0 && y1 >= 0 ? 0 : y0, xAt = x0 <= 0 && x1 >= 0 ? 0 : x0;
  const labels = [
    ...(xTicks || steps(x0, x1, ticks[0])).filter(x => x !== xAt || xAt !== 0).map(x => ({ cls: 'tick', html: fmt(x), at: () => P(x, yAt).add(V(0.1, -0.2, 0)) })),
    ...steps(y0, y1, ticks[1]).filter(y => y !== yAt || yAt !== 0).map(y => ({ cls: 'tick', html: fy(y), at: () => P(xAt, y).add(V(-0.08, 0, 0)) })),
    { cls: 'axis', html: `<i>${xName}</i>`, at: () => P(x1, yAt).add(V(0.3, 0.22, 0)) },
    ...(yName ? [{ cls: 'axis', html: yName, at: () => P(xAt, y1).add(V(0.2, 0.2, 0)).add(V(yName.length > 12 ? 0.9 : 0.3, 0, 0)) }] : []),
  ];
  return { B, P, sx, sy, x0, x1, y0, y1, labels, fn: f => u => sy * f(u / sx), X: x => x * sx };
}
// a dashed line between two world points (a limit, a level, an endpoint)
function dashed(parent, A, Bp, color = '#e5484d', seg = 0.11) {
  const L = A.distanceTo(Bp), n = Math.max(1, Math.floor(L / (2 * seg))), c = [];
  for (let i = 0; i < n; i++) { const a = A.clone().lerp(Bp, (2 * i) / (2 * n - 1)), b = A.clone().lerp(Bp, (2 * i + 1) / (2 * n - 1)); c.push(a.x, a.y, a.z, b.x, b.y, b.z); }
  return lines(parent, c, color);
}
const legend = (PL, row, color, html, [x, y] = [PL.x0, PL.y1]) => ({ cls: 'board', html: `<span style="color:${color}">●</span> ${html}`, at: () => PL.P(x, y).add(V(0.35, -0.3 - 0.36 * row, 0)) });
const RED = '#e5484d', BLUE = '#3d63a8';
const level = (PL, parent, y, color) => dashed(parent, PL.P(PL.x0, y, 0.02), PL.P(PL.x1, y, 0.02), color);
// n dots for a sequence; show(k, x, y) places dot k, hideFrom(k) hides the rest
function dotRow(parent, n, opts) {
  const list = Array.from({ length: n }, () => { const d = dot(parent, opts); d.userData.home = null; d.visible = false; return d; });
  return list;
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [], updates = [];

  // ================= the tower: Σ 3(2/3)ⁿ, one slab per term, under a ceiling at 9 =================
  {
    const X = SC.tower, K = 0.5, TX = X - 3.3;                 // tower: world metres per unit of sum, and where it stands
    const PL = plot(root, { X: X + 1.2, z: -0.6, x: [0, 12], y: [0, 10], sx: 0.42, sy: K, grid: [1, 1], ticks: [2, 3], xName: 'n', yName: '<i>S<sub>n</sub></i>' });
    labels.push(...PL.labels);
    part(root, box(2.6, 0.08, 2.6, 0.02), { tone: 'lo', pal: 'base', pos: [TX, -0.04, 0] });
    const tower = asm('tower', root, { title: 'The tower', sub: `one slab per term: ${M.GA}, 2, 4/3, …` });
    const slabs = Array.from({ length: M.STEP.tower.max }, (_, n) => {
      const h = M.geo(n) * K;
      const m = part(tower, box(1.5, Math.max(h - 0.012, 0.004), 1.5, 0.03), { tone: 'hi', pal: n % 2 ? 'base' : 'paper', name: `Term ${n + 1}: ${fmt(M.geo(n))}` });
      m.userData.home = null; m.userData.y = (M.geoS(n) + M.geo(n) / 2) * K;
      return m;
    });
    const ceil = asm('ceiling', root, { title: 'The sum', sub: `${M.GA}/(1 − 2/3) = ${M.GSUM}` });
    const cm = shadeMat('red', { opacity: 0.22 }).clone(); cm.depthWrite = false;
    part(ceil, box(2.3, 0.03, 2.3, 0.01), { tone: 'mid', pal: 'red', mat: cm, pos: [TX, M.GSUM * K, 0], name: 'The limit' });
    level(PL, ceil, M.GSUM);
    dashed(ceil, V(TX + 1.15, M.GSUM * K, 0), PL.P(0, M.GSUM, 0.02));
    const sums = asm('towerSums', root, { title: 'Partial sums', sub: 'the height after each slab' });
    const dots = dotRow(sums, M.STEP.tower.max, { pal: 'red', r: 0.085, name: 'Partial sum' });
    const guide = rod(sums, { r: 0.012, pal: 'dark', name: 'Level' });
    labels.push({ cls: 'mark', html: `<i>S</i> = ${M.GSUM}`, at: () => PL.P(12, M.GSUM).add(V(0.5, 0.18, 0)) });
    updates.push((s, look) => {
      const { n, f } = (look.full || 0) > 0.5 ? { n: M.STEP.tower.max, f: 1 } : M.count(s, 'tower');   // the opener shows the whole tower
      slabs.forEach((m, k) => { m.visible = k < n; m.position.set(TX, m.userData.y + (k === n - 1 ? (1 - ease(f)) * 0.7 : 0), 0); });
      dots.forEach((d, k) => { d.visible = k < n - 1 || (k === n - 1 && f >= 1); putAt(PL.B, d, (k + 1) * PL.sx, M.geoS(k + 1) * K); });
      setRod(guide, V(TX + 0.76, M.geoS(n) * K, 0), PL.P(n, M.geoS(n), 0.03));
      guide.visible = f >= 1;
    });
  }

  // ================= 10.1 · partial sums of Σ 1/(n(n + 1)) climbing to 1 =================
  {
    const PL = plot(root, { X: SC.tele, x: [0, 20], y: [0, 1.2], sx: 0.4, sy: 3.5, grid: [1, 0.1], ticks: [5, 0.5], xName: 'n' });
    labels.push(...PL.labels, { cls: 'mark', html: '<i>S</i> = 1', at: () => PL.P(20, 1).add(V(0.5, 0.18, 0)) }, { ...legend(PL, 0, RED, 'partial sums <i>S<sub>n</sub></i>'), at: () => PL.P(10, 0.45) }, { ...legend(PL, 1, BLUE, 'terms <i>a<sub>n</sub></i>'), at: () => PL.P(10, 0.45 - 0.36 / PL.sy) });
    const terms = asm('teleTerms', root, { title: 'The terms', sub: 'aₙ = 1/(n(n + 1))' });
    const tb = bars(PL.B, terms, 20, { pal: 'blue', depth: 0.1 });
    const sums = asm('teleSums', root, { title: 'The partial sums', sub: 'Sₙ = 1 − 1/(n + 1)' });
    level(PL, sums, M.TELE_SUM);
    const dots = dotRow(sums, 20, { pal: 'red', r: 0.075, name: 'Partial sum' });
    updates.push(s => {
      const { n } = M.count(s, 'tele');
      tb.set(Array.from({ length: n }, (_, k) => [(k + 1 - 0.3) * PL.sx, (k + 1 + 0.3) * PL.sx, M.tele(k + 1) * PL.sy]));
      dots.forEach((d, k) => { d.visible = k < n; putAt(PL.B, d, (k + 1) * PL.sx, M.teleS(k + 1) * PL.sy, 0.14); });
    });
  }

  // ================= 10.3 · terms that settle at 1/2, sums that never stop =================
  {
    const PL = plot(root, { X: SC.nth, x: [0, 16], y: [0, 8.5], sx: 0.5, sy: 0.5, grid: [1, 0.5], ticks: [4, 2], xName: 'n' });
    labels.push(...PL.labels, legend(PL, 0, RED, 'partial sums <i>S<sub>n</sub></i>'), legend(PL, 1, BLUE, 'terms <i>a<sub>n</sub></i> → ½'));
    const terms = asm('nthTerms', root, { title: 'The terms', sub: 'aₙ = n/(2n + 1), heading to 1/2' });
    const tb = bars(PL.B, terms, 16, { pal: 'blue', depth: 0.1 });
    level(PL, terms, M.NTH_L, '#3d63a8');
    const sums = asm('nthSums', root, { title: 'The partial sums', sub: 'each adds nearly 1/2 more' });
    const dots = dotRow(sums, 16, { pal: 'red', r: 0.08, name: 'Partial sum' });
    updates.push(s => {
      const { n } = M.count(s, 'nth');
      tb.set(Array.from({ length: n }, (_, k) => [(k + 1 - 0.3) * PL.sx, (k + 1 + 0.3) * PL.sx, M.nth(k + 1) * PL.sy]));
      dots.forEach((d, k) => { d.visible = k < n; putAt(PL.B, d, (k + 1) * PL.sx, M.sum(M.nth, k + 1) * PL.sy, 0.14); });
    });
  }

  // ================= 10.4 · integral test: bars under y = 1/(x² + 1) =================
  {
    const PL = plot(root, { X: SC.integral, x: [0, 10], y: [0, 0.6], sx: 0.8, sy: 7, grid: [1, 0.05], ticks: [1, 0.25], xName: 'x', yName: '' });
    labels.push(...PL.labels, { cls: 'mark', html: '<i>y</i> = 1/(<i>x</i>² + 1)', at: () => PL.P(2.4, M.itf(2.4)).add(V(1.0, 0.45, 0)) });
    const cg = asm('itCurve', root, { title: 'The area', sub: '∫ from 1 to ∞ of 1/(x² + 1) dx = π/4' });
    curve(PL.B, cg, PL.fn(M.itf), 0, 10 * PL.sx, { r: 0.035 });
    const area = region(PL.B, cg, { pal: 'red', opacity: 0.3, name: 'Area' });
    const bg = asm('itBars', root, { title: 'The terms as bars', sub: 'bar n: width 1, height 1/(n² + 1)' });
    const tb = bars(PL.B, bg, 10, { pal: 'blue', depth: 0.1, opacity: 0.8 });
    const first = bars(PL.B, bg, 1, { pal: 'dark', depth: 0.1, opacity: 0.7 });
    updates.push(s => {
      const { n, f } = M.count(s, 'integral'), b = 1 + (n - 1 + f) * 9 / M.STEP.integral.max;
      area.set(() => 0, PL.fn(M.itf), PL.sx, Math.min(b, 10) * PL.sx);
      // bar n stands on [n − 1, n], under the curve: its top-right corner is on it
      tb.set(Array.from({ length: n }, (_, k) => k + 2 <= 10 ? [(k + 1) * PL.sx, (k + 2) * PL.sx, M.itf(k + 2) * PL.sy] : null).filter(Boolean));
      first.set([[0, PL.sx, M.itf(1) * PL.sy]]);
    });
  }

  // ================= 10.5 · p-series: p = 1 runs away, p = 2 settles at π²/6 =================
  {
    const PL = plot(root, { X: SC.pser, x: [0, 40], y: [0, 4.5], sx: 0.2, sy: 0.95, grid: [2, 0.5], ticks: [10, 1], xName: 'n' });
    labels.push(...PL.labels,
      { cls: 'mark', html: 'π²/6', at: () => PL.P(40, M.ZETA2).add(V(0.45, 0.16, 0)) },
      legend(PL, 0, RED, '<i>p</i> = 1: Σ 1/<i>n</i>'), legend(PL, 1, BLUE, '<i>p</i> = 2: Σ 1/<i>n</i>²'));
    const hg = asm('harm', root, { title: 'The harmonic series', sub: 'Σ 1/n: p = 1, diverges' });
    curve(PL.B, hg, PL.fn(x => Math.log(x) + M.EULER), 1 * PL.sx, 40 * PL.sx, { r: 0.012, pal: 'dark', tone: 'lo', name: 'ln n + 0.577' });
    const hd = dotRow(hg, 40, { pal: 'red', r: 0.06, name: 'Partial sum' });
    const bgp = asm('basel', root, { title: 'The p = 2 series', sub: 'Σ 1/n²: converges to π²/6' });
    level(PL, bgp, M.ZETA2, '#3d63a8');
    const bd = dotRow(bgp, 40, { pal: 'blue', r: 0.06, name: 'Partial sum' });
    updates.push(s => {
      const { n } = M.count(s, 'pser');
      for (let k = 0; k < 40; k++) {
        hd[k].visible = bd[k].visible = k < n;
        putAt(PL.B, hd[k], (k + 1) * PL.sx, M.harmS(k + 1) * PL.sy, 0.12); putAt(PL.B, bd[k], (k + 1) * PL.sx, M.baselS(k + 1) * PL.sy, 0.12);
      }
    });
  }

  // ================= 10.6 · direct comparison: 1/(n² + 3) inside 1/n² =================
  {
    const PL = plot(root, { X: SC.cmp, x: [0, 10], y: [0, 1.05], sx: 0.75, sy: 4, grid: [1, 0.1], ticks: [1, 0.25], xName: 'n' });
    labels.push(...PL.labels);
    const big = asm('cmpB', root, { title: 'The larger series', sub: 'bₙ = 1/n², a convergent p-series' });
    const bb = bars(PL.B, big, 10, { pal: 'blue', depth: 0.08, opacity: 0.55 });
    const small = asm('cmpA', root, { title: 'The smaller series', sub: 'aₙ = 1/(n² + 3)' });
    const sb = bars(PL.B, small, 10, { pal: 'red', depth: 0.22, opacity: 0.9 });
    labels.push({ ...legend(PL, 0, BLUE, '<i>b<sub>n</sub></i> = 1/<i>n</i>²'), at: () => PL.P(4.5, 0.95) }, { ...legend(PL, 1, RED, '<i>a<sub>n</sub></i> = 1/(<i>n</i>² + 3)'), at: () => PL.P(4.5, 0.86) });
    updates.push(s => {
      const { n } = M.count(s, 'cmp');
      bb.set(Array.from({ length: n }, (_, k) => [(k + 1 - 0.38) * PL.sx, (k + 1 + 0.38) * PL.sx, M.cmpB(k + 1) * PL.sy]));
      sb.set(Array.from({ length: n }, (_, k) => [(k + 1 - 0.2) * PL.sx, (k + 1 + 0.2) * PL.sx, M.cmpA(k + 1) * PL.sy]));
    });
  }

  // ================= 10.7 / 10.10 · the alternating harmonic series zigzags onto ln 2 =================
  {
    const PL = plot(root, { X: SC.alt, x: [0, 12], y: [0, 1.1], sx: 0.65, sy: 3.8, grid: [1, 0.1], ticks: [2, 0.25], xName: 'n' });
    labels.push(...PL.labels, { cls: 'mark', html: 'ln 2', at: () => PL.P(12, M.LN2).add(V(0.45, 0.16, 0)) });
    const sg = asm('altSums', root, { title: 'The partial sums', sub: '1 − 1/2 + 1/3 − 1/4 + …' });
    level(PL, sg, M.LN2);
    const dots = dotRow(sg, 12, { pal: 'ink', r: 0.08, name: 'Partial sum' });
    const zig = Array.from({ length: 11 }, () => rod(sg, { r: 0.022, pal: 'red', name: 'Step' }));
    const eg = asm('altBand', root, { title: 'The error bound', sub: 'the sum lies between Sₙ and Sₙ₊₁' });
    const band = region(PL.B, eg, { pal: 'blue', opacity: 0.25, name: 'Where S lies' });
    const gap = rod(eg, { r: 0.03, pal: 'blue', name: 'Next term' });
    let bandOn = 0;
    updates.push((s, look) => {
      let { n } = M.count(s, 'alt');
      bandOn = look.err || 0;
      if (bandOn > 0.5) n = M.ERR_N + 1;          // the error page holds S₄ and S₅
      dots.forEach((d, k) => { d.visible = k < n; putAt(PL.B, d, (k + 1) * PL.sx, M.altS(k + 1) * PL.sy, 0.12); });
      zig.forEach((z, k) => { z.visible = k < n - 1; if (z.visible) setRod(z, PL.P(k + 1, M.altS(k + 1), 0.1), PL.P(k + 2, M.altS(k + 2), 0.1)); });
      eg.visible = bandOn > 0.5;
      const lo = Math.min(M.altS(M.ERR_N), M.altS(M.ERR_N + 1)), hi = Math.max(M.altS(M.ERR_N), M.altS(M.ERR_N + 1));
      band.set(() => lo * PL.sy, () => hi * PL.sy, M.ERR_N * PL.sx, 12 * PL.sx);
      setRod(gap, PL.P(M.ERR_N + 1, M.altS(M.ERR_N), 0.1), PL.P(M.ERR_N + 1, M.altS(M.ERR_N + 1), 0.1));
    });
    labels.push({ cls: 'mark', html: '<i>S</i><sub>4</sub>', at: () => bandOn > 0.5 ? PL.P(M.ERR_N, M.altS(M.ERR_N)).add(V(0, -0.32, 0)) : null },
      { cls: 'mark', html: '<i>S</i><sub>5</sub>', at: () => bandOn > 0.5 ? PL.P(M.ERR_N + 1, M.altS(M.ERR_N + 1)).add(V(0, 0.32, 0)) : null });
  }

  // ================= 10.8 · ratio test: Σ n/3ⁿ, its ratios heading to 1/3 =================
  {
    const PL = plot(root, { X: SC.ratio, x: [0, 14], y: [0, 1], sx: 0.55, sy: 4.2, grid: [1, 0.1], ticks: [2, 0.25], xName: 'n' });
    labels.push(...PL.labels, legend(PL, 0, RED, 'ratios <i>a</i><sub><i>n</i>+1</sub>/<i>a<sub>n</sub></i>'), legend(PL, 1, BLUE, 'terms <i>a<sub>n</sub></i> = <i>n</i>/3<sup><i>n</i></sup>'), { cls: 'mark', html: '<i>L</i> = ⅓', at: () => PL.P(14, M.RAT_L).add(V(0.5, 0.15, 0)) },
      { cls: 'mark', html: '1', at: () => PL.P(14, 1).add(V(0.3, 0.0, 0)) });
    const tg = asm('ratTerms', root, { title: 'The terms', sub: 'aₙ = n/3ⁿ' });
    const tb = bars(PL.B, tg, 14, { pal: 'blue', depth: 0.1 });
    const qg = asm('ratQ', root, { title: 'The ratios', sub: 'aₙ₊₁/aₙ = (n + 1)/(3n)' });
    level(PL, qg, M.RAT_L); level(PL, qg, 1, '#6e6e74');
    const qd = dotRow(qg, 14, { pal: 'red', r: 0.08, name: 'Ratio' });
    updates.push(s => {
      const { n } = M.count(s, 'ratio');
      tb.set(Array.from({ length: n }, (_, k) => [(k + 1 - 0.3) * PL.sx, (k + 1 + 0.3) * PL.sx, M.rat(k + 1) * PL.sy]));
      qd.forEach((d, k) => { d.visible = k < n; putAt(PL.B, d, (k + 1) * PL.sx, M.ratQ(k + 1) * PL.sy, 0.18); });
    });
  }

  // ================= 10.9 · absolute vs conditional: Σ 1/n against 1 − 1/2 + 1/3 − … =================
  {
    const PL = plot(root, { X: SC.abs, x: [0, 30], y: [0, 4.2], sx: 0.27, sy: 1, grid: [2, 0.5], ticks: [10, 1], xName: 'n' });
    labels.push(...PL.labels, { cls: 'mark', html: 'ln 2', at: () => PL.P(30, M.LN2).add(V(0.45, 0.15, 0)) },
      legend(PL, 0, RED, 'Σ |<i>a<sub>n</sub></i>| = Σ 1/<i>n</i>'), legend(PL, 1, BLUE, 'Σ <i>a<sub>n</sub></i> = Σ (−1)<sup><i>n</i>+1</sup>/<i>n</i>'));
    const ag = asm('absSums', root, { title: 'Sums of the sizes', sub: 'Σ |aₙ| = Σ 1/n: diverges' });
    const ad = dotRow(ag, 30, { pal: 'red', r: 0.065, name: 'Partial sum' });
    const cg = asm('condSums', root, { title: 'Sums with the signs', sub: 'Σ (−1)ⁿ⁺¹/n: converges to ln 2' });
    level(PL, cg, M.LN2, '#3d63a8');
    const cd = dotRow(cg, 30, { pal: 'blue', r: 0.065, name: 'Partial sum' });
    updates.push(s => {
      const { n } = M.count(s, 'abs');
      for (let k = 0; k < 30; k++) {
        ad[k].visible = cd[k].visible = k < n;
        putAt(PL.B, ad[k], (k + 1) * PL.sx, M.harmS(k + 1) * PL.sy, 0.12); putAt(PL.B, cd[k], (k + 1) * PL.sx, M.altS(k + 1) * PL.sy, 0.12);
      }
    });
  }

  // ================= 10.11 · Taylor polynomials of eˣ about 0, gaining degrees =================
  {
    const U = 0.72, PL = plot(root, { X: SC.taylor, x: [-3.5, 2.2], y: [-1, 8], sx: U, sy: U, grid: [0.5, 0.5], ticks: [1, 1], xName: 'x', yName: '<i>y</i>' });
    labels.push(...PL.labels, { cls: 'mark', html: '<i>y</i> = e<sup><i>x</i></sup>', at: () => PL.P(1.95, Math.exp(1.95)).add(V(-0.7, 0.1, 0)) });
    const eg = asm('expCurve', root, { title: 'y = eˣ', sub: 'every derivative at 0 equals 1' });
    curve(PL.B, eg, PL.fn(Math.exp), -3.5 * U, 2.2 * U, { r: 0.03 });
    const pg = asm('taylorP', root, { title: 'The Taylor polynomial', sub: 'Pₙ(x) = 1 + x + x²/2! + … + xⁿ/n!' });
    const pc = liveCurve(PL.B, pg, { pal: 'red', r: 0.03 });
    let deg = 0;
    updates.push(s => { deg = M.count(s, 'taylor').n - 1; pc.set(PL.fn(x => M.expP(deg, x)), -3.5 * U, 2.2 * U); });
    labels.push({ ...legend(PL, 0, RED, ''), text: () => `<span style="color:${RED}">●</span> <i>P</i><sub>${deg}</sub>(<i>x</i>), degree ${deg}` });
  }

  // ================= 10.12 · Lagrange: the true error of P₃ under the bound 3x⁴/4!, on [0, 1] =================
  {
    const PL = plot(root, { X: SC.lagrange, x: [0, 1], y: [0, 0.14], sx: 7, sy: 30, grid: [0.1, 0.01], ticks: [0.25, 0.05], xName: 'x', yName: '' });
    labels.push(...PL.labels, legend(PL, 0, BLUE, 'Lagrange bound 3<i>x</i>⁴/4!'), legend(PL, 1, RED, 'true error e<sup><i>x</i></sup> − <i>P</i><sub>3</sub>(<i>x</i>)'));
    const bg = asm('lagBand', root, { title: 'The Lagrange bound', sub: `M·x⁴/4! with M = ${M.LAG_M}` });
    curve(PL.B, bg, PL.fn(M.lagBound), 0, PL.sx, { r: 0.035, pal: 'blue' });
    region(PL.B, bg, { pal: 'blue', opacity: 0.18, name: 'Allowed error' }).set(() => 0, PL.fn(M.lagBound), 0, PL.sx);
    const eg = asm('lagErr', root, { title: 'The true error', sub: 'eˣ − P₃(x)' });
    curve(PL.B, eg, PL.fn(M.lagErr), 0, PL.sx, { r: 0.035, pal: 'red' });
    const dB = dot(bg, { pal: 'blue', r: 0.09, name: 'Bound here' }), dE = dot(eg, { pal: 'red', r: 0.09, name: 'Error here' });
    dB.userData.home = dE.userData.home = null;
    const gap = rod(bg, { r: 0.015, pal: 'dark', name: 'Room to spare' });
    updates.push(s => {
      const x = M.count(s, 'lagrange').n / M.STEP.lagrange.max;
      putAt(PL.B, dB, x * PL.sx, M.lagBound(x) * PL.sy, 0.1); putAt(PL.B, dE, x * PL.sx, M.lagErr(x) * PL.sy, 0.1);
      setRod(gap, PL.P(x, 0, 0.06), PL.P(x, M.lagBound(x), 0.06));
    });
    labels.push({ cls: 'mark', html: `${M.LAG_B}`, at: () => PL.P(1, M.LAG_B).add(V(0.45, 0, 0)) }, { cls: 'mark', html: `${(M.TE - M.TP).toFixed(4)}`, at: () => PL.P(1, M.TE - M.TP).add(V(0.55, 0, 0)) });
  }

  // ================= 10.13 · interval of convergence of Σ (x − 2)ⁿ/(n·3ⁿ): [−1, 5) =================
  {
    const U = 0.72, PL = plot(root, { X: SC.interval, x: [-3, 7], y: [-2, 3.5], sx: U, sy: U, grid: [0.5, 0.5], ticks: [1, 1], xName: 'x', yName: '<i>y</i>' });
    labels.push(...PL.labels);
    const fg = asm('intF', root, { title: 'The sum inside', sub: 'ln(3/(5 − x)) for −1 ≤ x < 5' });
    curve(PL.B, fg, PL.fn(M.intF), -1 * U, 4.99 * U, { r: 0.03 });
    curve(PL.B, fg, PL.fn(M.intF), -3 * U, -1 * U, { r: 0.016, pal: 'dark', tone: 'lo' });
    const sg = asm('intSums', root, { title: 'The partial sums', sub: 'Σ (x − 2)ⁿ/(n·3ⁿ), n = 1 to N' });
    const pc = liveCurve(PL.B, sg, { pal: 'red', r: 0.028, n: 240 });
    const ig = asm('intInterval', root, { title: 'The interval of convergence', sub: `[${M.IA}, ${M.IB}): centre ${M.IC}, radius ${M.IR}` });
    const bar = rod(ig, { r: 0.05, pal: 'blue', name: 'Interval' });
    setRod(bar, PL.P(M.IA, 0, 0.06), PL.P(M.IB, 0, 0.06));
    putAt(PL.B, dot(ig, { pal: 'blue', r: 0.12, name: 'x = −1: included' }), M.IA * U, 0, 0.08);
    putAt(PL.B, hole(ig, { pal: 'blue', r: 0.12, name: 'x = 5: excluded' }), M.IB * U, 0, 0.08);
    putAt(PL.B, dot(ig, { pal: 'ink', r: 0.07, name: 'Centre' }), M.IC * U, 0, 0.1);
    dashed(ig, PL.P(M.IB, -2, 0.02), PL.P(M.IB, 3.5, 0.02), '#3d63a8');
    let N = 1;
    updates.push(s => { N = M.count(s, 'interval').n; pc.set(PL.fn(x => M.intP(N, x)), -3 * U, 7 * U); });
    labels.push({ ...legend(PL, 0, '#fff', '', [2.6, -0.9]), text: () => `<i>N</i> = ${N} terms` },
legend(PL, 1, RED, 'partial sums', [2.6, -0.9]), legend(PL, 2, '#2c2c30', 'ln(3/(5 − <i>x</i>))', [2.6, -0.9]));
  }

  // ================= 10.14 · the Maclaurin series of sin x, term by term =================
  {
    const U = 0.5, PL = plot(root, { X: SC.maclaurin, x: [-8, 8], y: [-2.5, 2.5], sx: U, sy: U, grid: [0.5, 0.5], ticks: [2, 1], xName: 'x', yName: '<i>y</i>' });
    labels.push(...PL.labels);
    const sg = asm('sinCurve', root, { title: 'y = sin x', sub: 'derivatives at 0: 0, 1, 0, −1, …' });
    curve(PL.B, sg, PL.fn(Math.sin), -8 * U, 8 * U, { r: 0.03 });
    const pg = asm('sinP', root, { title: 'The Maclaurin polynomial', sub: 'x − x³/3! + x⁵/5! − …' });
    const pc = liveCurve(PL.B, pg, { pal: 'red', r: 0.028, n: 240 });
    let k = 1;
    updates.push(s => { k = M.count(s, 'maclaurin').n; pc.set(PL.fn(x => M.sinP(k, x)), -8 * U, 8 * U); });
    labels.push({ ...legend(PL, 0, RED, ''), text: () => `<span style="color:${RED}">●</span> degree ${2 * k - 1}: ${k} term${k > 1 ? 's' : ''}` });
  }

  // ================= 10.15 · 1/(1 + x²) from the geometric series, and arctan x by integrating it =================
  {
    const U = 1.05, PL = plot(root, { X: SC.atan, x: [-2, 2], y: [-1.6, 2], sx: U, sy: U, grid: [0.25, 0.25], ticks: [1, 1], xName: 'x', yName: '<i>y</i>' });
    labels.push(...PL.labels,
      { cls: 'mark', html: '1/(1 + <i>x</i>²)', at: () => PL.P(1.5, M.itf(1.5)).add(V(0.35, 0.3, 0)) },
      { cls: 'mark', html: 'arctan <i>x</i>', at: () => PL.P(1.6, Math.atan(1.6)).add(V(0.3, 0.32, 0)) });
    const gg = asm('atanGeo', root, { title: 'The geometric series', sub: '1 − x² + x⁴ − … = 1/(1 + x²) for |x| < 1' });
    curve(PL.B, gg, PL.fn(M.itf), -2 * U, 2 * U, { r: 0.022, pal: 'dark' });
    const gc = liveCurve(PL.B, gg, { pal: 'blue', r: 0.024 });
    const ag = asm('atanP', root, { title: 'Integrated term by term', sub: 'x − x³/3 + x⁵/5 − … = arctan x' });
    curve(PL.B, ag, PL.fn(Math.atan), -2 * U, 2 * U, { r: 0.03 });
    const ac = liveCurve(PL.B, ag, { pal: 'red', r: 0.026 });
    for (const xe of [-1, 1]) dashed(root, PL.P(xe, -1.6, 0.02), PL.P(xe, 2, 0.02), '#8a8a8f');
    let k = 1;
    updates.push(s => { k = M.count(s, 'atan').n; gc.set(PL.fn(x => M.geoP(k, x)), -2 * U, 2 * U); ac.set(PL.fn(x => M.atanP(k, x)), -2 * U, 2 * U); });
    labels.push({ ...legend(PL, 0, '#fff', '', [-0.75, 2.05]), text: () => `${k} term${k > 1 ? 's' : ''} of each` });
  }

  return { labels, update: (s, look) => updates.forEach(u => u(s, look)) };
}
