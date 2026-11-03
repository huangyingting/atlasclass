// The figure: one scene per idea, spread along +x, the camera flying between them page by page.
// Graph paper from the calculus kit for every plot; each data value a small ball; counts as blocks.
// Red marks what the page is about (the residuals and their squares, the fitted line, the car riders, the moved
// point); blue the second thing (the bus riders, negative products, the band of typical error).
import * as THREE from 'three';
import { graphBoard, dot, rod, setRod, setLineThrough, putAt, liveCurve, region, V } from '../kit.js';
import { part, box, lines, shadeMat } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { fit: 0, shuffle: 30, table: 60, kinds: 92, corr: 124, line: 154, resid: 184, infl: 214, logt: 244 };
const F = M.FEMUR, L = M.LS;
const PALS = ['dark', 'blue', 'red'];               // walk or bike, bus, car

const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const f1 = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(1), f2 = v => (v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
// graph paper with its lower-left corner (of the data range) at world (ox, oy)
const board = (parent, ox, oy, x, y, unit, grid, ticks = grid) =>
  graphBoard(parent, { at: [ox - x[0] * unit[0], oy - y[0] * unit[1], 0], x, y, unit, grid, ticks });
// a thin dashed line between two world points, moved with .set(a, b)
function guide(parent, color = '#8a8a8f') {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(6);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 }));
  l.userData = { noEdge: true }; l.frustumCulled = false; parent.add(l);
  l.set = (a, b) => { pos.set([a.x, a.y, a.z, b.x, b.y, b.z]); geo.attributes.position.needsUpdate = true; l.computeLineDistances(); return l; };
  return l;
}
// data values as balls on board B
const ballGeo = new Map();
function balls(parent, B, xs, ys, { pal = 'ink', r = 0.11, name = 'Data value', still = true } = {}) {
  const geo = ballGeo.get(r) ?? ballGeo.set(r, new THREE.SphereGeometry(r, 20, 14)).get(r);
  return xs.map((x, i) => { const m = part(parent, geo, { pal, tone: 'mid', name }); putAt(B, m, x, ys[i], r); if (!still) m.userData.home = null; return m; });
}
// a block (count, share) moved and sized every frame or once
const unitBox = new THREE.BoxGeometry(1, 1, 1);
function block(parent, pal, name, { opacity = 1, tone = 'mid' } = {}) {
  const m = part(parent, unitBox, { pal, tone, name, mat: opacity < 1 ? shadeMat(pal, { opacity }) : undefined });
  m.userData.home = null; return m;
}
const place = (m, x0, x1, y0, y1, z0, z1) => { m.scale.set(Math.max(x1 - x0, 1e-3), Math.max(y1 - y0, 1e-3), z1 - z0); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); };

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [], ups = [];

  // ---------- opener and 2.8: a trial line swinging to the least-squares line; each residual's square ----------
  {
    const B = board(root, ST.fit - 8.6, -3.4, [36, 52], [145, 190], [0.55, 0.16], [1, 5], [2, 10]);
    const pts = asm('points', root, { title: 'The data', sub: `femur length and height of ${F.n} adults` });
    balls(pts, B, F.x, F.y, { name: 'Adult' });
    const tr = asm('trial', root, { title: 'A trial line', sub: 'through (x̄, ȳ), turning' });
    const line = rod(tr, { r: 0.04, pal: 'ink', name: 'Trial line' });
    const mp = dot(tr, { r: 0.16, pal: 'blue', name: '(x̄, ȳ)' }); putAt(B, mp, L.mx, L.my, 0.12);
    const sq = asm('squares', root, { title: 'The squared residuals', sub: 'one square per point; their total area is what least squares makes smallest' });
    const rods = F.x.map(() => rod(sq, { r: 0.022, pal: 'red', name: 'Residual' }));
    const squares = F.x.map(() => block(sq, 'red', 'Squared residual', { opacity: 0.3 }));
    // the sum of squares, against the slope: a parabola, smallest at the least-squares slope
    const S = board(root, ST.fit + 3.2, -3.4, M.SLOPES, [0, 1500], [1, 0.0036], [0.5, 100], [1, 500]);
    const sg = asm('sse', root, { title: 'Total area against slope', sub: 'the sum of squared residuals for each slope through (x̄, ȳ)' });
    const cv = liveCurve(S, sg, { pal: 'ink', r: 0.03, name: 'Sum of squares' }); cv.set(M.sse, M.SLOPES[0], M.SLOPES[1]);
    const ball = dot(sg, { r: 0.16, pal: 'red', name: 'This slope' }); ball.userData.home = null;
    guide(sg, '#6e6e74').set(S.P(L.b, 0, 0.02), S.P(L.b, 1500, 0.02));
    let b = L.b;
    labels.push(...B.tickLabels({ xName: 'femur (cm)', yName: 'height (cm)', skipY: [190] }), ...S.tickLabels({ xName: 'slope', yName: 'total area (cm²)', skipY: [1500] }),
      mark('(<i>x̄</i>, <i>ȳ</i>)', () => B.P(L.mx - 1.6, L.my + 3.4)),
      mark(`least squares, <i>b</i> = ${f2(L.b)}`, () => S.P(L.b, 1500).add(V(0, 0.3, 0))),
      live(() => S.P(b, M.sse(b)).add(V(0.35, 0.3, 0)), () => `${M.sse(b).toFixed(0)} cm²`, 'board'));
    const tmp = V();
    ups.push(s => {
      b = M.fitSlope(M.clk(s, 'fit'));
      setLineThrough(B, line, L.mx, L.my, b, 36, 52, 0.06);
      putAt(S, ball, b, M.sse(b), 0.12);
      F.x.forEach((x, i) => {
        const yl = L.my + b * (x - L.mx), e = F.y[i] - yl, side = Math.abs(e) * B.uy;
        setRod(rods[i], B.P(x, F.y[i], 0.05), B.P(x, yl, 0.05));
        tmp.copy(B.P(x, Math.min(yl, F.y[i])));
        // the square stands on the residual, to the right of it, flat on the paper
        place(squares[i], tmp.x, tmp.x + side, tmp.y, tmp.y + side, 0.01, 0.03);
        squares[i].visible = side > 0.01;
      });
    });
  }

  // ---------- 2.1 the real pairs, and the same heights shuffled among the femurs ----------
  {
    const X = [37, 51], Y = [148, 186], U = [0.42, 0.12];
    const A = board(root, ST.shuffle - 6.6, -0.6, X, Y, U, [1, 5], [4, 10]);
    const Bs = board(root, ST.shuffle + 0.9, -0.6, X, Y, U, [1, 5], [4, 10]);
    const re = asm('real', root, { title: 'The real pairs', sub: 'each femur with its own height' });
    balls(re, A, F.x, F.y, { name: 'Adult' });
    const sh = asm('shuffled', root, { title: 'The heights shuffled', sub: 'each femur given another adult’s height, at random' });
    const ms = balls(sh, Bs, F.x, F.y, { pal: 'blue', name: 'Shuffled pair', still: false });
    const D = board(root, ST.shuffle - 6.6, -4.6, [-1, 1], [0, 8], [6.5, 0.26], [0.1, 1], [0.5, 0]);
    const rd = asm('rdots', root, { title: 'r of each shuffle', sub: `${M.SHUF.k} shuffles; the real r in red` });
    // stack the shuffles' r values in bins of 0.05
    const bin = v => Math.round(v / 0.05), seen = new Map();
    const stack = M.SHUF_R.map(v => { const k = bin(v), h = seen.get(k) || 0; seen.set(k, h + 1); return [k * 0.05, h]; });
    const dots = stack.map(([x, h]) => { const m = dot(rd, { r: 0.1, pal: 'blue', name: 'One shuffle' }); putAt(D, m, x, 0.5 + h, 0.1); m.userData.home = null; return m; });
    putAt(D, dot(rd, { r: 0.15, pal: 'red', name: 'The real r' }), L.r, 0.5, 0.12);
    let k = 0;
    labels.push(...A.tickLabels({ xName: 'femur (cm)', yName: 'height (cm)', skipY: [180] }), ...Bs.tickLabels({ xName: 'femur (cm)', yName: '' }),
      mark('as measured', () => A.P(44, 186).add(V(0, 0.65, 0)), 'board'), mark('shuffled', () => Bs.P(44, 186).add(V(0, 0.65, 0)), 'board'),
      mark(`<i>r</i> = ${L.r.toFixed(2)}`, () => A.P(37.6, 182), 'board'),
      live(() => Bs.P(37.6, 182), () => `<i>r</i> = ${f2(M.SHUF_R[k])}`, 'board'),
      ...D.tickLabels({ xName: '<i>r</i>', yName: '' }), mark('real', () => D.P(L.r, 0).add(V(0, 0.75, 0)), 'vec red'));
    ups.push(s => {
      const a = M.shufAt(M.clk(s, 'shuffle')), p = M.SHUFFLES[a.k], q = M.SHUFFLES[(a.k + M.SHUF.k - 1) % M.SHUF.k];
      k = a.u > 0.5 ? a.k : (a.k + M.SHUF.k - 1) % M.SHUF.k;
      ms.forEach((m, i) => putAt(Bs, m, F.x[i], F.y[q[i]] + (F.y[p[i]] - F.y[q[i]]) * a.u, 0.11));
      dots.forEach((m, i) => m.scale.setScalar(i === k ? 1.6 : 1));
    });
  }

  // ---------- 2.2–2.3 two categorical variables: counts, the segmented bars, the mosaic ----------
  {
    const D = 0.55, Y0 = -1.2;
    // side-by-side bars: the counts, three bars per place
    const C = board(root, ST.table - 14.6, Y0, [0, 3], [0, 60], [1.45, 0.092], [0, 10], [1, 10]);
    const sb = asm('sideby', root, { title: 'Side-by-side bars', sub: 'the counts: how each place’s students get to school' });
    M.CAT.n.forEach((row, i) => row.forEach((v, j) => { const a = C.P(i + 0.12 + j * 0.26, 0, 0), b = C.P(i + 0.12 + (j + 1) * 0.26 - 0.03, v, 0); place(block(sb, PALS[j], `${M.CAT.rows[i]}, ${M.CAT.cols[j]}`), a.x, b.x, a.y, b.y, 0, D); }));
    // segmented bars: each place's conditional distribution, and everyone's (the marginal)
    const H = 5.2, W = 1.0, x0 = ST.table - 5.6;
    const sg = asm('segmented', root, { title: 'Segmented bars', sub: 'each place’s students as 100%; the last bar is all 300' });
    const segs = [...M.COND, M.MARG];
    segs.forEach((col, i) => { let y = Y0; const xa = x0 + i * 1.45 + (i === 3 ? 0.35 : 0); col.forEach((p, j) => { place(block(sg, PALS[j], i < 3 ? `${M.CAT.rows[i]}, ${M.CAT.cols[j]}` : `all, ${M.CAT.cols[j]}`), xa, xa + W, y, y + p * H, 0, D); y += p * H; }); });
    lines(sg, [x0 - 0.15, Y0 + H, 0.01, x0 + 4 * 1.45 + 0.35, Y0 + H, 0.01], '#b4b4b8');
    // mosaic: widths by how many live in each place, heights by how they travel; area is the joint share
    const MW = 6.0, mx0 = ST.table + 4.4;
    const mo = asm('mosaic', root, { title: 'Mosaic plot', sub: 'width: share living there; height: share of them by each way; area: share of all 300' });
    let xa = mx0;
    M.CAT.n.forEach((row, i) => { const w = MW * M.ROWT[i] / M.TOT; let y = Y0; M.COND[i].forEach((p, j) => { place(block(mo, PALS[j], `${M.CAT.rows[i]}, ${M.CAT.cols[j]}`), xa, xa + w - 0.06, y, y + p * H - 0.04, 0, D); y += p * H; }); xa += w; });
    labels.push(...C.tickLabels({ xTicks: false, xName: '', yName: 'students', skipY: [60] }),
      ...M.CAT.rows.map((r, i) => mark(r, () => C.P(i + 0.5, 0).add(V(0, -0.35, 0)))),
      ...['city', 'suburb', 'rural', 'all'].map((r, i) => mark(r, () => V(x0 + i * 1.45 + (i === 3 ? 0.35 : 0) + W / 2, Y0 - 0.35, D))),
      ...[0, 50, 100].map(p => ({ cls: 'tick', html: `${p}%`, at: () => V(x0 - 0.2, Y0 + H * p / 100, 0) })),
      ...(() => { let a = mx0; return M.CAT.rows.map((r, i) => { const w = MW * M.ROWT[i] / M.TOT, c = a + w / 2; a += w; return mark(`${r}<br>${M.ROWT[i]}`, () => V(c, Y0 - 0.5, D)); }); })(),
      ...M.CAT.cols.map((c, j) => mark(c, () => V(x0 + [0.5, 2.8, 4.3][j], Y0 + H + 1.15, 0), j === 2 ? 'vec red' : j === 1 ? 'vec blue' : 'vec grey')),
      mark(`by car: ${Math.round(100 * M.COND[0][2])}% → ${Math.round(100 * M.COND[2][2])}%`, () => V(x0 + 2.2, Y0 + H + 0.4, 0)),
      mark(`rural and car: ${(100 * M.JOINT[2][2]).toFixed(1)}% of all`, () => V(mx0 + MW * (1 - M.ROWT[2] / M.TOT / 2), Y0 + H + 0.45, D)));
  }

  // ---------- 2.4–2.5 the femur scatter, and four other kinds ----------
  {
    const B = board(root, ST.kinds - 12.8, -2.6, [36, 52], [145, 190], [0.42, 0.12], [1, 5], [4, 10]);
    const fm = asm('femur', root, { title: 'Femur and height', sub: 'explanatory on x, response on y' });
    balls(fm, B, F.x, F.y, { name: 'Adult' });
    labels.push(...B.tickLabels({ xName: 'femur length (cm)', yName: 'height (cm)', skipY: [190] }),
      mark('explanatory →', () => B.P(44, 145).add(V(0, -0.85, 0))), mark('response ↑', () => B.P(36, 167.5).add(V(-1.7, 0, 0))));
    const KEYS = [['kpos', 'pos'], ['kneg', 'neg'], ['curved', 'curved'], ['knone', 'none']];
    KEYS.forEach(([key, k], i) => {
      const d = M.KINDS[k], ox = ST.kinds - 2.2 + (i % 2) * 4.9, oy = i < 2 ? 1.4 : -3.9;
      const Bk = board(root, ox, oy, [0, 10], [0, 10], [0.3, 0.3], [1, 1], [20, 20]);
      const g = asm(key, root, { title: d.name[0].toUpperCase() + d.name.slice(1), sub: `r = ${f2(d.r)}` });
      balls(g, Bk, d.x, d.y, { r: 0.07, pal: k === 'curved' ? 'red' : 'ink', name: 'Data value' });
      labels.push(mark(`${d.name}<br><i>r</i> = ${f2(d.r)}`, () => Bk.P(5, 0).add(V(0, -0.55, 0))));
    });
  }

  // ---------- 2.5 r as the average product of z-scores: each point's rectangle from the means ----------
  {
    const Z = board(root, ST.corr - 7.2, -3.0, [-2.4, 2.4], [-2.4, 2.4], [1.25, 1.25], [0.5, 0.5], [1, 1]);
    const zp = asm('zpoints', root, { title: 'The z-scores', sub: 'each adult, in standard deviations from the means' });
    const ms = balls(zp, Z, M.ZX, M.ZY, { name: 'Adult' });
    const pr = asm('products', root, { title: 'The products z_x · z_y', sub: 'each rectangle from (0, 0) to the point; red positive, blue negative' });
    const rects = M.PROD.map((p, i) => block(pr, p > 0 ? 'red' : 'blue', p > 0 ? 'Positive product' : 'Negative product', { opacity: 0.22 }));
    const R = board(root, ST.corr + 1.4, -3.0, [0, 1], [-0.25, 1], [1.4, 4.8], [0, 0.25], [2, 0.25]);
    const rb = asm('rbar', root, { title: 'The running sum ÷ (n − 1)', sub: 'it ends at r' });
    const bar = block(rb, 'red', 'Sum so far');
    const end = R.P(0, L.r), endB = R.P(1, L.r); lines(rb, [end.x, end.y, 0.3, endB.x, endB.y, 0.3], '#2c2c30');
    let n = 0;
    labels.push(...Z.tickLabels({ xName: '<i>z<sub>x</sub></i>', yName: '<i>z<sub>y</sub></i>' }), ...R.tickLabels({ xTicks: false, xName: '', yName: '' }), mark('Σ<i>z<sub>x</sub>z<sub>y</sub></i> ÷ (<i>n</i> − 1)', () => R.P(0.5, -0.25).add(V(0, -0.9, 0))),
      mark('+', () => Z.P(1.9, 1.9), 'vec red'), mark('+', () => Z.P(-1.9, -1.9), 'vec red'), mark('−', () => Z.P(-1.9, 1.9), 'vec blue'), mark('−', () => Z.P(1.9, -1.9), 'vec blue'),
      mark(`<i>r</i> = ${L.r.toFixed(3)}`, () => R.P(1, L.r).add(V(0.75, 0, 0))),
      live(() => R.P(0.5, -0.25).add(V(0, -0.45, 0)), () => `${Math.floor(n)} of ${F.n}`));
    ups.push(s => {
      n = M.corrN(M.clk(s, 'corr'));
      const k = Math.floor(n), lit = Math.min(k, F.n - 1);
      rects.forEach((m, i) => {
        m.visible = i < k || (i === k && n < F.n);
        const g = i < k ? 1 : M.smooth((n - k) / 0.6), a = Z.P(0, 0), b = Z.P(M.ZX[i] * g, M.ZY[i] * g);
        place(m, Math.min(a.x, b.x), Math.max(a.x, b.x), Math.min(a.y, b.y), Math.max(a.y, b.y), 0.005 + i * 0.002, 0.02 + i * 0.002);
      });
      ms.forEach((m, i) => m.scale.setScalar(i === lit && n < F.n ? 1.5 : 1));
      const v = M.partSum(n) / (F.n - 1), a = R.P(0.2, 0), b = R.P(0.8, v);
      place(bar, a.x, b.x, Math.min(a.y, b.y), Math.max(a.y, b.y), 0, 0.25);
    });
  }

  // ---------- 2.6 the line, a prediction, and extrapolation; 2.8 the band of typical error ----------
  {
    const X = [28, 56], Y = [120, 196];
    const B = board(root, ST.line - 4.6, -3.2, X, Y, [0.33, 0.085], [2, 5], [4, 20]);
    balls(asm('lpoints', root, { title: 'The data', sub: `${F.n} adults` }), B, F.x, F.y, { name: 'Adult' });
    const ln = asm('lsrl', root, { title: 'The least-squares line', sub: `ŷ = ${L.a.toFixed(1)} + ${L.b.toFixed(2)}x` });
    setLineThrough(B, rod(ln, { r: 0.04, pal: 'red', name: 'Least-squares line' }), L.mx, L.my, L.b, M.XR[0], M.XR[1]);
    guide(ln, '#e5484d').set(B.P(X[0], M.yhat(X[0]), 0.05), B.P(M.XR[0], M.yhat(M.XR[0]), 0.05));
    guide(ln, '#e5484d').set(B.P(M.XR[1], M.yhat(M.XR[1]), 0.05), B.P(X[1], M.yhat(X[1]), 0.05));
    const bd = asm('band', root, { title: 'ŷ ± s', sub: `most points lie within about s = ${L.s.toFixed(1)} cm of the line` });
    region(B, bd, { pal: 'blue', opacity: 0.16, name: 'Typical error' }).set(x => M.yhat(x) - L.s, x => M.yhat(x) + L.s, M.XR[0], M.XR[1]);
    const pd = asm('predict', root, { title: 'A prediction', sub: 'up from x to the line, across to ŷ' });
    const up = guide(pd), across = guide(pd), pt = dot(pd, { r: 0.15, pal: 'red', name: 'Prediction' }); pt.userData.home = null;
    // the data's x range, shaded on the axis: inside it, interpolation
    const r0 = B.P(M.XR[0], Y[0], 0.01), r1 = B.P(M.XR[1], Y[0], 0.01);
    place(block(pd, 'dark', 'Range of the data', { opacity: 0.45 }), r0.x, r1.x, r0.y - 0.04, r0.y + 0.08, 0, 0.03);
    let x = M.PRED.x;
    labels.push(...B.tickLabels({ xName: 'femur (cm)', yName: 'height (cm)' }),
      mark(`<i>ŷ</i> = ${L.a.toFixed(1)} + ${L.b.toFixed(2)}<i>x</i>`, () => B.P(29, 188), 'board'),
      mark('range of the data', () => B.P((M.XR[0] + M.XR[1]) / 2, Y[0]).add(V(0, 0.4, 0))),
      live(() => B.P(x, M.yhat(x)).add(V(-0.25, 0.45, 0)), () => M.inRange(x) ? `<i>ŷ</i> = ${M.yhat(x).toFixed(1)}` : 'extrapolation', 'vec red'));
    ups.push(s => {
      x = M.predX(M.clk(s, 'line'));
      const y = M.yhat(x);
      up.set(B.P(x, Y[0], 0.04), B.P(x, y, 0.04)); across.set(B.P(x, y, 0.04), B.P(X[0], y, 0.04));
      putAt(B, pt, x, y, 0.1);
      pt.material = shadeMat(M.inRange(x) ? 'red' : 'dark');
    });
  }

  // ---------- 2.7 residuals, dropped one by one onto the residual plot ----------
  {
    const X = [38, 51];
    const B = board(root, ST.resid - 4.0, 0.4, X, [148, 186], [0.62, 0.13], [1, 5], [2, 10]);
    const R = board(root, ST.resid - 4.0, -4.4, X, [-8, 8], [0.62, 0.2], [1, 2], [2, 4]);
    balls(asm('rpoints', root, { title: 'The data and its line', sub: 'residual = y − ŷ, up or down to the line' }), B, F.x, F.y, { name: 'Adult' });
    setLineThrough(B, rod(E.ASM.rpoints, { r: 0.035, pal: 'ink', name: 'Least-squares line' }), L.mx, L.my, L.b, X[0], X[1]);
    const rr = asm('rods', root, { title: 'The residuals', sub: 'red rods, each from ŷ to y' });
    const rods = F.x.map(() => rod(rr, { r: 0.05, pal: 'red', name: 'Residual' }));
    const rp = asm('residplot', root, { title: 'The residual plot', sub: 'residual against x: no pattern, so a line suits' });
    const pts = F.x.map(() => dot(rp, { r: 0.1, pal: 'ink', name: 'Residual' }));
    pts.forEach(m => { m.userData.home = null; });
    const tmpA = V(), tmpB = V();
    let k = 0;
    labels.push(...B.tickLabels({ xName: 'femur (cm)', yName: 'height (cm)' }), ...R.tickLabels({ xName: '', yName: 'residual (cm)', skipY: [8] }),
      live(() => k < F.n ? B.P(F.x[k], F.y[k]).add(V(0.15, F.y[k] > M.yhat(F.x[k]) ? 0.45 : -0.45, 0)) : null, () => k < F.n ? `${f1(L.res[k])}` : '', 'vec red'));
    ups.push(s => {
      const a = M.resAt(M.clk(s, 'resid')); k = a.k;
      F.x.forEach((x, i) => {
        const done = i < a.k, now = i === a.k, e = L.res[i];
        // a rod in the scatter, then the same length falling to the residual plot
        const top = [B.P(x, M.yhat(x), 0.05), B.P(x, F.y[i], 0.05)], bot = [R.P(x, 0, 0.05), R.P(x, e, 0.05)];
        const u = done ? 1 : now ? M.smooth((a.u - 0.35) / 0.55) : 0;
        tmpA.lerpVectors(top[0], bot[0], u); tmpB.copy(tmpA).add(V(0, (F.y[i] - M.yhat(x)) * (B.uy + (R.uy - B.uy) * u), 0));
        setRod(rods[i], tmpA, tmpB);
        rods[i].visible = rods[i].visible && (done || now);
        pts[i].visible = done || (now && u > 0.98);
        putAt(R, pts[i], x, e, 0.1);
      });
    });
  }

  // ---------- 2.9 one more point, moved: leverage, outliers and influence ----------
  {
    const X = [36, 70], Y = [145, 230];
    const B = board(root, ST.infl - 5.2, -3.2, X, Y, [0.28, 0.075], [2, 5], [4, 20]);
    balls(asm('base', root, { title: 'The 14 adults', sub: 'the data as before' }), B, F.x, F.y, { name: 'Adult' });
    const old = asm('oldline', root, { title: 'The line without the new point', sub: `ŷ = ${L.a.toFixed(1)} + ${L.b.toFixed(2)}x` });
    setLineThrough(B, rod(old, { r: 0.03, pal: 'dark', name: 'Line without it' }), L.mx, L.my, L.b, X[0], X[1]);
    const nl = asm('newline', root, { title: 'The line with the new point', sub: 'refitted to all 15' });
    const line = rod(nl, { r: 0.04, pal: 'red', name: 'Line with it' });
    const mv = asm('mover', root, { title: 'The new point', sub: 'moved between three places' });
    const p = dot(mv, { r: 0.2, pal: 'red', name: 'New point' }); p.userData.home = null;
    let at = M.xpAt(0);
    labels.push(...B.tickLabels({ xName: 'femur (cm)', yName: 'height (cm)' }),
      live(() => B.P(37, 226), () => M.XP.keys[at.key].kind, 'board'),
      live(() => B.P(at.x, at.y).add(V(0.2, -0.55, 0)), () => `(${at.x.toFixed(0)}, ${at.y.toFixed(0)})`, 'vec red'));
    ups.push(s => {
      at = M.xpAt(M.clk(s, 'infl'));
      const fit = M.withPoint(at.x, at.y);
      putAt(B, p, at.x, at.y, 0.14);
      setLineThrough(B, line, fit.mx, fit.my, fit.b, X[0], X[1], 0.07);
    });
  }

  // ---------- 2.9 a curve straightened by taking logs ----------
  {
    const T = [0, 10], H = 5, U = 0.72;
    const B = graphBoard(root, { at: [ST.logt - 3.6, 0.2, 0], x: T, y: [0, 1], unit: [U, H], grid: [1, 0.1], ticks: [2, 0] });
    const R = board(root, ST.logt - 3.6, -4.6, T, [-0.25, 0.25], [U, 6], [1, 0.05], [2, 0]);
    const bc = asm('bact', root, { title: 'The culture', sub: 'bacteria counted every hour' });
    const ms = BACT_BALLS(bc, B);
    const bl = asm('bactline', root, { title: 'The least-squares line', sub: 'fitted to what is plotted now' });
    const line = rod(bl, { r: 0.035, pal: 'red', name: 'Least-squares line' });
    const br = asm('bactres', root, { title: 'The residual plot', sub: 'a curve in the counts; no pattern in the logs' });
    const rs = M.BACT.t.map(() => { const m = dot(br, { r: 0.09, pal: 'ink', name: 'Residual' }); m.userData.home = null; return m; });
    let u = 0, fit = M.bFit(0);
    // the y ticks of either scale, shown with their own scale
    const S = M.BSCALE, cnt = [0, 500, 1000, 1500, 2000], lg = [1, 1.5, 2, 2.5, 3, 3.5];
    labels.push(...B.tickLabels({ xName: '<i>t</i> (hours)', yName: '' }), ...R.tickLabels({ xName: '', yName: '' }),
      ...cnt.map(c => ({ cls: 'tick', html: `${c}`, at: () => u < 0.5 ? B.P(0, c / S.ymax).add(V(-0.08, 0, 0)) : null })),
      ...lg.map(l => ({ cls: 'tick', html: `${l}`, at: () => u >= 0.5 ? B.P(0, (l - S.lmin) / (S.lmax - S.lmin)).add(V(-0.08, 0, 0)) : null })),
      live(() => B.P(0, 1).add(V(0.25, 0.5, 0)), () => u < 0.5 ? '<i>count</i>' : '<i>log<sub>10</sub>(count)</i>', 'axis'),
      mark('residual', () => R.P(0, 0.25).add(V(0.25, 0.3, 0)), 'axis'),
      live(() => B.P(0.3, 0.92), () => `<i>r</i> = ${fit.r.toFixed(3)}`, 'board'));
    ups.push(s => {
      u = M.logU(M.clk(s, 'logt')); fit = M.bFit(u);
      M.BACT.t.forEach((t, i) => { putAt(B, ms[i], t, M.bNorm(M.BACT.y[i], u), 0.1); putAt(R, rs[i], t, fit.res[i], 0.1); });
      setLineThrough(B, line, fit.mx, fit.my, fit.b, T[0], T[1], 0.06);
    });
  }

  return { labels, update: s => { for (const f of ups) f(s); } };
}
// the culture's counts as balls, placed every frame
function BACT_BALLS(parent, B) {
  return M.BACT.t.map(() => { const m = dot(parent, { r: 0.12, pal: 'ink', name: 'Hourly count' }); m.userData.home = null; return m; });
}
