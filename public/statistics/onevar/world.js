// The figure: one scene per idea, spread along +x, the camera moving between them page by page.
// Graph paper from the kit for every plot; each student, value or height is a small ball. Red marks the thing that
// matters on the page, blue the second thing; ink and greys the rest.
import * as THREE from 'three';
import { graphBoard, curve, dot, rod, setRod, bars, region, V } from '../kit.js';
import { part, box, lines } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { drop: 0, cat: 34, shapes: 72, centre: 100, spread: 126, units: 152, box: 180, compare: 206, normal: 234, ncalc: 262, check: 290 };
// each mode's colour, wherever the categorical variable shows
export const PAL = { walk: 'ink', bike: 'dark', bus: 'blue', car: 'red' };

const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const f1 = x => (x < 0 ? '−' : '') + Math.abs(x).toFixed(1);
// a thin dashed line between two world points, moved with .set(a, b)
function guide(parent, color = '#8a8a8f') {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(6);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 }));
  l.userData = { noEdge: true }; l.frustumCulled = false; parent.add(l);
  l.set = (a, b) => { pos.set([a.x, a.y, a.z, b.x, b.y, b.z]); geo.attributes.position.needsUpdate = true; l.computeLineDistances(); return l; };
  return l;
}
const ballGeo = new Map();
const ball = (parent, r, pal, name) => {
  const m = part(parent, ballGeo.get(r) ?? ballGeo.set(r, new THREE.SphereGeometry(r, 20, 14)).get(r), { pal, tone: 'mid', name });
  m.userData.home = null; return m;
};
// for each value, how many equal values came before it: its height in a dotplot's stack
const stackOf = a => a.map((v, i) => a.slice(0, i).filter(w => w === v).length);
// numbers along a board's bottom edge and left edge, and the axis names
const axisLabels = (B, { xs = [], ys = [], xName, yName, xf = v => `${v}`, yf = v => `${v}`, below = false }) => [
  ...xs.map(x => ({ cls: 'tick', html: xf(x), at: () => B.P(x, B.y0).add(V(0.12, -0.22, 0)) })),
  ...ys.map(y => ({ cls: 'tick', html: yf(y), at: () => B.P(B.x0, y).add(V(-0.12, 0, 0)) })),
  ...(xName ? [below ? { cls: 'mark', html: xName, at: () => B.P((B.x0 + B.x1) / 2, B.y0).add(V(0, -0.62, 0)) }
    : { cls: 'axis', html: xName, at: () => B.P(B.x1, B.y0).add(V(0.3, -0.62, 0)) }] : []),
  // the vertical axis is named in the board's title line, above its top-left corner
  ...(yName ? [{ cls: 'board', html: yName, at: () => B.P(B.x0, B.y1).add(V(0, 0.6, 0)) }] : []),
];
const range = (a, b, d) => Array.from({ length: Math.floor((b - a) / d + 1e-9) + 1 }, (_, i) => +(a + i * d).toFixed(6));
// a horizontal boxplot on board B at height y (math units), half-height h: box, median, whiskers, outliers
function boxplot(B, g, { five, whisk, out = [] }, y, h, pal = 'ink') {
  const z = 0.12, P = (x, yy) => B.P(x, yy, z), r = 0.03;
  const fill = part(g, box(1, 1, 0.12, 0.01), { pal: 'base', tone: 'mid', name: 'Box' });
  fill.scale.set((five.q3 - five.q1) * B.ux, 2 * h * B.uy, 1); fill.position.copy(B.P((five.q1 + five.q3) / 2, y, 0.06));
  const seg = (a, b, name) => setRod(rod(g, { r, pal, name }), a, b);
  for (const x of [five.q1, five.q3]) seg(P(x, y - h), P(x, y + h), x === five.q1 ? 'Q1' : 'Q3');
  seg(P(five.q1, y - h), P(five.q3, y - h), 'Box'); seg(P(five.q1, y + h), P(five.q3, y + h), 'Box');
  seg(P(five.med, y - h), P(five.med, y + h), 'Median');
  seg(P(whisk.lo, y), P(five.q1, y), 'Whisker'); seg(P(five.q3, y), P(whisk.hi, y), 'Whisker');
  for (const x of [whisk.lo, whisk.hi]) seg(P(x, y - h / 2), P(x, y + h / 2), 'Whisker end');
  for (const x of out) part(g, new THREE.TorusGeometry(0.09, 0.03, 8, 24), { pal: 'red', tone: 'hi', name: 'Outlier', pos: P(x, y).toArray() });
}

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];          // per-frame updates, each (state) => void
  const tmp = V();

  // ---------- opener, 1.1, 1.5: the class drops into a dotplot; a histogram and a cumulative graph beneath ----------
  {
    const D = graphBoard(root, { at: [ST.drop - 6, 3.0, 0], x: [0, 60], y: [0, 5], unit: [0.2, 0.2], grid: [5, 0], ticks: [10, 100] });
    const H = graphBoard(root, { at: [ST.drop - 6, -2.4, 0], x: [0, 60], y: [0, 13], unit: [0.2, 0.25], grid: [5, 2], ticks: [10, 4] });
    const C = graphBoard(root, { at: [ST.drop - 6, -9.4, 0], x: [0, 60], y: [0, 1], unit: [0.2, 3.2], grid: [5, 0.1], ticks: [10, 0.25] });
    const dg = asm('dots', root, { title: 'The dotplot', sub: `${M.N} commute times, one ball per student` });
    const sg = asm('student', root, { title: 'One student', sub: 'an individual: one row of the data, one ball' });
    const k = stackOf(M.TIMES), rest = M.TIMES.map((t, i) => D.P(t, 0.5 + k[i] * 0.95, 0.1));
    const balls = M.TIMES.map((_, i) => i === M.ONE ? ball(sg, 0.11, 'red', 'Student') : ball(dg, 0.09, 'ink', 'Student'));
    const hg = asm('hist', root, { title: 'The histogram', sub: `the same times, counted in ${M.BIN.w}-minute bins` });
    const hb = bars(H, hg, M.BINS.length, { pal: 'blue', tone: 'mid', name: 'Bin', depth: 0.14, opacity: 1 });
    const og = asm('ogive', root, { title: 'The cumulative graph', sub: 'the fraction of the class under each time' });
    M.OGIVE.slice(1).forEach(([x, c], i) => setRod(rod(og, { r: 0.03, name: 'Cumulative graph' }), C.P(...M.OGIVE[i], 0.06), C.P(x, c, 0.06)));
    for (const [x, c] of M.OGIVE) dot(og, { pal: 'red', r: 0.07, name: 'Bin end' }).position.copy(C.P(x, c, 0.08));
    guide(og).set(C.P(0, 0.5, 0.03), C.P(M.OGIVE_MED, 0.5, 0.03)); guide(og).set(C.P(M.OGIVE_MED, 0.5, 0.03), C.P(M.OGIVE_MED, 0, 0.03));
    let t = 0, n = 0;
    const one = M.STUDENTS[M.ONE];
    labels.push(...axisLabels(D, { xs: range(0, 60, 10), xName: 'commute time (min)' }),
      ...axisLabels(H, { xs: range(0, 60, 10), ys: range(0, 12, 4), xName: 'commute time (min)', yName: `histogram: students per ${M.BIN.w}-minute bin` }),
      ...axisLabels(C, { xs: range(0, 60, 10), ys: [0, 0.5, 1], xName: 'commute time (min)', yName: 'cumulative relative frequency' }),
      mark('dotplot: one ball per student', () => D.P(0, 5).add(V(0, 0.6, 0)), 'board'),
      mark(`0.5 → median ≈ ${M.OGIVE_MED} min`, () => C.P(M.OGIVE_MED + 9, 0.42)),
      ...M.BINS.map((b, i) => live(() => b.n && t > M.DROP.bars[1] ? H.P((b.a + b.b) / 2, b.n + 0.9) : null, () => `${b.n}`)),
      live(() => n > M.ONE ? rest[M.ONE].clone().add(V(0, 0.75, 0)) : null, () => `student ${M.ONE + 1}: ${one.mode}, ${one.time} min`));
    ups.push(s => {
      t = M.dropT(M.clk(s, 'drop')); n = M.landed(t);
      balls.forEach((b, i) => {
        const u = (t - i * M.DROP.each) / M.DROP.fall;
        b.visible = u > 0;
        if (b.visible) b.position.copy(rest[i]).add(tmp.set(0, 3.2 * (1 - Math.min(u, 1) ** 2), 0));
      });
      const g = M.stage(t, ...M.DROP.bars);
      hb.set(M.BINS.map(b => [b.a, b.b, b.n * g]));
    });
  }

  // ---------- 1.2–1.4: the same students, sorted by how they travel; a table, a bar chart and a pie chart ----------
  {
    const D = graphBoard(root, { at: [ST.cat - 14, 2.2, 0], x: [0, 60], y: [0, 5], unit: [0.2, 0.2], grid: [5, 0], ticks: [10, 100] });
    const g = asm('students', root, { title: 'The students', sub: 'each ball one student, coloured by how they travel' });
    const k = stackOf(M.TIMES), FLOOR = -1.5, col = m => ST.cat + 0.6 + M.MODES.indexOf(m) * 1.25;
    const seen = Object.fromEntries(M.MODES.map(m => [m, 0]));
    const items = M.STUDENTS.map((s, i) => ({ m: ball(g, 0.16, PAL[s.mode], s.mode), a: D.P(s.time, 0.5 + k[i] * 0.95, 0.1), b: V(col(s.mode), FLOOR + 0.17 + 0.34 * seen[s.mode]++, 0.1), i }));
    part(g, box(5.2, 0.06, 0.8, 0.01), { pal: 'base', tone: 'lo', pos: [ST.cat + 2.47, FLOOR - 0.03, 0.1], name: 'Floor' });
    // the frequency table, as a card standing in the scene
    const tg = asm('table', root, { title: 'The frequency table', sub: 'a count and a proportion for each category' });
    const TC = V(ST.cat + 8.1, 1.0, 0), rows = [['mode', 'frequency', 'relative freq.'], ...M.MODES.map(m => [m, `${M.COUNT[m]}`, M.REL[m].toFixed(3)]), ['total', `${M.N}`, '1.000']];
    part(tg, box(4.8, 3.9, 0.12, 0.04), { pal: 'paper', tone: 'mid', pos: [TC.x, TC.y, -0.06], name: 'Table' });
    lines(tg, [TC.x - 2.2, TC.y + 1.3, 0.01, TC.x + 2.2, TC.y + 1.3, 0.01, TC.x - 2.2, TC.y - 1.4, 0.01, TC.x + 2.2, TC.y - 1.4, 0.01], '#6e6e74');
    rows.forEach((r, j) => r.forEach((c, i) => labels.push(mark(j ? c : `<i>${c}</i>`, () => TC.clone().add(V(-1.45 + i * 1.45, 1.6 - j * 0.57, 0.05))))));
    // relative frequency bar chart
    const R = graphBoard(root, { at: [ST.cat + 13.6, FLOOR, 0], x: [0, 4], y: [0, 0.4], unit: [1.15, 11], grid: [0, 0.05], ticks: [0, 0.1] });
    const bg = asm('barchart', root, { title: 'The bar chart', sub: 'relative frequency of each mode; bars apart, any order' });
    M.MODES.forEach((m, i) => {
      const h = M.REL[m] * R.uy, b = part(bg, new THREE.BoxGeometry(0.62 * R.ux, h, 0.2), { pal: PAL[m], tone: 'mid', name: m });
      b.position.copy(R.P(i + 0.5, M.REL[m] / 2, 0.1));
      labels.push(mark(m, () => R.P(i + 0.5, 0).add(V(0, -0.28, 0))), mark(M.REL[m].toFixed(3), () => R.P(i + 0.5, M.REL[m] + 0.02)));
    });
    labels.push(...axisLabels(R, { ys: range(0, 0.4, 0.1), yName: 'relative frequency', yf: v => v.toFixed(1) }));
    // pie chart: wedges in proportion, from the top, counter-clockwise
    const pg = asm('pie', root, { title: 'The pie chart', sub: 'each wedge’s angle is its share of 360°' });
    const PC = V(ST.cat + 22.2, 0.6, 0), PR = 2.2;
    let a0 = 0;
    M.MODES.forEach(m => {
      const da = M.REL[m] * 2 * Math.PI, mid = Math.PI + a0 + da / 2, dir = V(Math.sin(mid), -Math.cos(mid), 0);
      const geo = new THREE.CylinderGeometry(PR, PR, 0.3, 48, 1, false, Math.PI + a0, da).rotateX(Math.PI / 2);
      part(pg, geo, { pal: PAL[m], tone: 'mid', pos: [PC.x, PC.y, 0], name: m, ex: dir.clone().multiplyScalar(0.5).toArray() });
      labels.push(mark(`${m} ${Math.round(M.REL[m] * 100)}%`, () => PC.clone().addScaledVector(dir, PR + 0.65)));
      a0 += da;
    });
    let U = 0;
    labels.push(...axisLabels(D, { xs: range(0, 60, 10), xName: 'commute time (min)' }),
      mark('quantitative: a number on a scale', () => D.P(0, 5).add(V(0, 0.6, 0)), 'board'),
      mark('categorical: a group', () => V(ST.cat + 0.3, 4.6, 0), 'board'),
      ...M.MODES.map(m => mark(m, () => V(col(m), FLOOR - 0.35, 0))),
      ...M.MODES.map(m => live(() => U > 0.97 ? V(col(m), FLOOR + 0.34 * M.COUNT[m] + 0.3, 0) : null, () => `${M.COUNT[m]}`)));
    ups.push(s => {
      U = M.catU(M.clk(s, 'cat'));
      for (const it of items) {
        const u = M.smooth((U - 0.4 * it.i / M.N) / 0.6);
        it.m.position.lerpVectors(it.a, it.b, u).add(tmp.set(0, 1.2 * Math.sin(Math.PI * u), 0));
        it.m.scale.setScalar(0.56 + 0.44 * u);
      }
    });
  }

  // ---------- 1.6 four shapes ----------
  M.SHAPES.forEach((s, j) => {
    const [x0, x1] = s.x, W = 6.2, ux = W / (x1 - x0), ymax = Math.max(...s.bins.map(b => b[2])) * 1.2, uy = 2.4 / ymax;
    const left = ST.shapes - 7.4 + (j % 2) * 8.4, base = j < 2 ? 1.4 : -3.6;
    const B = graphBoard(root, { at: [left - x0 * ux, base, 0], x: [x0, x1], y: [0, ymax], unit: [ux, uy], grid: [0, 0], ticks: [10, 100] });
    const g = asm(s.key, root, { title: s.name[0].toUpperCase() + s.name.slice(1), sub: s.what });
    bars(B, g, s.bins.length, { pal: s.key === 'right' ? 'red' : 'base', tone: 'mid', name: 'Bin', depth: 0.12, opacity: 1 }).set(s.bins);
    const step = { sym: 10, right: 10, left: 4, bi: 10 }[s.key];
    labels.push(...axisLabels(B, { xs: range(Math.ceil(x0 / step) * step, x1, step), xName: s.what, below: true }),
      mark(s.name, () => B.P(x0, ymax).add(V(0, 0.6, 0)), 'board'));
    if (s.key === 'right') labels.push(mark('tail →', () => B.P(40, ymax * 0.45)), mark('gap', () => B.P(47.5, ymax * 0.2)), mark('outlier', () => B.P(57.5, ymax * 0.32)));
    if (s.key === 'left') labels.push(mark('← tail', () => B.P(9, ymax * 0.45)));
    if (s.key === 'bi') labels.push(mark('peak', () => B.P(56, ymax * 0.98)), mark('peak', () => B.P(82, ymax * 0.98)));
  });

  // ---------- 1.7 centre: nine values on a beam; it balances at the mean; the largest slides out ----------
  {
    const B = graphBoard(root, { at: [ST.centre - 6.6, 0.2, 0], x: [0, 60], y: [0, 5], unit: [0.22, 0.2], grid: [5, 0], ticks: [10, 100] });
    const ng = asm('nine', root, { title: 'Nine of the class', sub: 'their commute times, resting on a beam' });
    part(ng, box(60 * B.ux + 0.3, 0.1, 0.5, 0.02), { pal: 'dark', tone: 'mid', pos: B.P(30, 0, 0.2).add(V(0, -0.05, 0)).toArray(), name: 'Beam' });
    const k = stackOf(M.NINE), bs = M.NINE.map((_, i) => ball(ng, 0.1, i === M.NINE_TOP ? 'red' : 'ink', 'Value'));
    const mg = asm('fulcrum', root, { title: 'The mean, x̄', sub: 'the balance point: the deviations on either side cancel' });
    const fu = part(mg, new THREE.ConeGeometry(0.32, 0.6, 3), { pal: 'red', tone: 'hi', name: 'Mean' }); fu.userData.home = null;
    const dg = asm('median', root, { title: 'The median', sub: 'the middle value: four below it, four above' });
    setRod(rod(dg, { r: 0.03, pal: 'blue', name: 'Median' }), B.P(M.NINE_MED, -0.6, 0.25), B.P(M.NINE_MED, 4.6, 0.25));
    let xs = M.NINE, xbar = M.NINE_MEAN;
    labels.push(...axisLabels(B, { xs: range(0, 60, 10), xName: 'commute time (min)' }),
      mark(`median = ${M.NINE_MED}`, () => B.P(M.NINE_MED, 4.6).add(V(0, 0.3, 0))),
      live(() => B.P(xbar, 0).add(V(0, -1.25, 0)), () => `<i>x̄</i> = ${xbar.toFixed(1)}`, 'vec red'),
      live(() => B.P(xs[M.NINE_TOP], 0.5).add(V(0, 0.45, 0)), () => `${Math.round(xs[M.NINE_TOP])}`));
    ups.push(s => {
      xs = M.nineAt(M.clk(s, 'centre')); xbar = M.mean(xs);
      bs.forEach((b, i) => b.position.copy(B.P(xs[i], 0, 0.2)).add(tmp.set(0, 0.1 + 0.21 * k[i], 0)));
      fu.position.copy(B.P(xbar, 0, 0.2)).add(tmp.set(0, -0.4, 0));
    });
  }

  // ---------- 1.7 spread: each value's deviation from the mean, squared and summed ----------
  {
    const n = M.NINE.length, B = graphBoard(root, { at: [ST.spread - 6.3, -2.0, 0], x: [0, 35], y: [0, 10], unit: [0.36, 0.42], grid: [5, 0], ticks: [5, 100] });
    const row = i => n - i;
    const vg = asm('values', root, { title: 'The nine values', sub: 'one to a row, in the order of the table' });
    M.NINE.forEach((v, i) => ball(vg, 0.11, 'ink', 'Value').position.copy(B.P(v, row(i), 0.12)));
    setRod(rod(vg, { r: 0.02, pal: 'ink', name: 'Mean' }), B.P(M.NINE_MEAN, 0.6, 0.08), B.P(M.NINE_MEAN, 9.6, 0.08));
    const dg = asm('devs', root, { title: 'The deviations, x − x̄', sub: 'how far each value sits from the mean; they sum to zero' });
    const rods = M.NINE.map(() => rod(dg, { r: 0.035, pal: 'red', name: 'Deviation' }));
    const sg = asm('sdbar', root, { title: 'One standard deviation', sub: 'x̄ − s to x̄ + s: a typical distance from the mean' });
    const sb = rod(sg, { r: 0.04, pal: 'blue', name: 'Standard deviation' });
    const ends = [0, 1].map(() => rod(sg, { r: 0.03, pal: 'blue', name: 'Standard deviation' }));
    let t = 0, shown = 0;
    const ss = () => M.DEV.slice(0, shown).reduce((a, d) => a + d * d, 0), done = () => shown === n && t > M.SPREAD.start + n * M.SPREAD.each + 0.6;
    labels.push(...axisLabels(B, { xs: range(0, 35, 5), xName: 'commute time (min)' }),
      mark('<i>x̄</i>', () => B.P(M.NINE_MEAN, 9.6).add(V(0, 0.28, 0)), 'vec'),
      mark('<i>x</i> − <i>x̄</i> &ensp; (<i>x</i> − <i>x̄</i>)²', () => B.P(35, 9.6).add(V(-0.9, 0.3, 0))),
      ...M.DEV.map((d, i) => live(() => i < shown ? B.P(35, row(i)).add(V(-0.9, 0, 0)) : null, () => `${f1(d)} &ensp; ${(d * d).toFixed(1)}`)),
      live(() => B.P(17.5, 10).add(V(0, 0.95, 0)), () => `Σ(<i>x</i> − <i>x̄</i>)² = ${ss().toFixed(1)}${done() ? ` &ensp; <i>s</i> = √(${M.SS.toFixed(1)}/${n - 1}) = ${M.NINE_SD.toFixed(2)}` : ''}`),
      live(() => done() ? B.P(M.NINE_MEAN + M.NINE_SD, 0.25).add(V(0.5, 0, 0)) : null, () => `<i>x̄</i> ± <i>s</i>`));
    ups.push(s => {
      t = M.clk(s, 'spread') % M.SPREAD.period; shown = M.devShown(t);
      M.NINE.forEach((v, i) => {
        const u = i < shown ? M.smooth((t - M.SPREAD.start - i * M.SPREAD.each) / (M.SPREAD.each * 0.8)) : 0;
        rods[i].visible = u > 0; if (u > 0) setRod(rods[i], B.P(M.NINE_MEAN, row(i), 0.1), B.P(M.NINE_MEAN + (v - M.NINE_MEAN) * u, row(i), 0.1));
      });
      sb.visible = ends[0].visible = ends[1].visible = done();
      if (done()) {
        const a = M.NINE_MEAN - M.NINE_SD, b = M.NINE_MEAN + M.NINE_SD;
        setRod(sb, B.P(a, 0.25, 0.1), B.P(b, 0.25, 0.1));
        setRod(ends[0], B.P(a, 0, 0.1), B.P(a, 0.5, 0.1)); setRod(ends[1], B.P(b, 0, 0.1), B.P(b, 0.5, 0.1));
      }
    });
  }

  // ---------- 1.7 changing units: ten daily highs, °C to °F, scaled then shifted ----------
  {
    const B = graphBoard(root, { at: [ST.units - 6.6, -1.0, 0], x: [0, 95], y: [0, 7], unit: [0.14, 0.45], grid: [5, 0], ticks: [10, 100] });
    const k = stackOf(M.CELS);
    const cg = asm('celsius', root, { title: 'The highs in °C', sub: `${M.CELS.length} days, as recorded` });
    M.CELS.forEach((v, i) => ball(cg, 0.08, 'dark', 'Day').position.copy(B.P(v, 5 + 0.4 * k[i], 0.1)));
    const fg = asm('convert', root, { title: 'The same days, converted', sub: 'F = 1.8C + 32: every value multiplied, then shifted' });
    const bs = M.CELS.map(() => ball(fg, 0.1, 'red', 'Day'));
    const sg = asm('meanSd', root, { title: 'Mean and standard deviation', sub: 'the mean follows every step; the SD only the multiplying' });
    const mr = rod(sg, { r: 0.03, pal: 'blue', name: 'Mean' }), sr = rod(sg, { r: 0.035, pal: 'blue', name: 'One SD each side' });
    let U = M.unitsAt(0);
    const word = () => U.t < M.TEMP.scale[0] ? '°C' : U.t < M.TEMP.scale[1] ? '× 1.8' : U.t < M.TEMP.shift[0] ? '× 1.8 done' : U.t < M.TEMP.shift[1] ? '+ 32' : '°F';
    labels.push(...axisLabels(B, { xs: range(0, 90, 10), xName: 'temperature' }),
      mark('as recorded, °C', () => B.P(0, 7).add(V(0.1, 0.35, 0)), 'board'),
      live(() => B.P(55, 7).add(V(0.1, 0.35, 0)), () => `converting: ${word()}`, 'board'),
      live(() => B.P(M.mean(U.vals), 3.7), () => `mean ${M.mean(U.vals).toFixed(1)} &ensp; SD ${M.sd(U.vals).toFixed(2)}`));
    ups.push(s => {
      U = M.unitsAt(M.clk(s, 'units'));
      bs.forEach((b, i) => b.position.copy(B.P(U.vals[i], 0.6 + 0.45 * k[i], 0.12)));
      const m = M.mean(U.vals), d = M.sd(U.vals);
      setRod(mr, B.P(m, 0, 0.1), B.P(m, 3.2, 0.1)); setRod(sr, B.P(m - d, 3.0, 0.1), B.P(m + d, 3.0, 0.1));
    });
  }

  // ---------- 1.8 a boxplot assembled over the dotplot; the 1.5 × IQR fences find the outlier ----------
  {
    const B = graphBoard(root, { at: [ST.box - 6.6, -1.8, 0], x: [0, 60], y: [0, 14], unit: [0.22, 0.22], grid: [5, 0], ticks: [10, 100] });
    const F = M.FIVE, Y = 7.5, h = 1.6, z = 0.12, P = (x, y) => B.P(x, y, z);
    const k = stackOf(M.TIMES);
    const dg = asm('dots5', root, { title: 'The dotplot', sub: 'the class’s commute times' });
    const og = asm('outlier', root, { title: 'The outlier', sub: `${M.OUTLIERS.join(', ')} min: beyond Q3 + 1.5 × IQR` });
    M.TIMES.forEach((t, i) => ball(M.OUTLIERS.includes(t) ? og : dg, 0.1, M.OUTLIERS.includes(t) ? 'red' : 'ink', 'Student').position.copy(B.P(t, 0.5 + k[i] * 0.9, 0.1)));
    const ring = part(og, new THREE.TorusGeometry(0.11, 0.035, 8, 24), { pal: 'red', tone: 'hi', name: 'Outlier' }); ring.userData.home = null;
    const bg = asm('boxplot', root, { title: 'The boxplot', sub: 'the five-number summary: min, Q1, median, Q3, max' });
    const fill = part(bg, box(1, 1, 0.12, 0.01), { pal: 'base', tone: 'mid', name: 'Box' }); fill.userData.home = null;
    const qs = [F.q1, F.med, F.q3].map(x => ({ x, m: rod(bg, { r: 0.035, pal: x === F.med ? 'red' : 'ink', name: x === F.med ? 'Median' : 'Quartile' }), g: guide(root) }));
    const sides = [0, 1].map(() => rod(bg, { r: 0.03, pal: 'ink', name: 'Box' }));
    const whisk = [[F.q1, M.WHISK.lo], [F.q3, M.WHISK.hi]].map(([a, b]) => ({ a, b, m: rod(bg, { r: 0.03, pal: 'ink', name: 'Whisker' }), e: rod(bg, { r: 0.03, pal: 'ink', name: 'Whisker end' }) }));
    const fg = asm('fences', root, { title: 'The fences', sub: 'Q1 − 1.5 × IQR and Q3 + 1.5 × IQR: beyond them, an outlier' });
    const fence = guide(fg, '#e5484d'), fbar = rod(fg, { r: 0.025, pal: 'dark', name: '1.5 × IQR' });
    let t = 0;
    const st = key => M.stage(t, ...M.BOX[key]);
    labels.push(...axisLabels(B, { xs: range(0, 60, 10), xName: 'commute time (min)' }),
      ...[['Q<sub>1</sub>', F.q1], ['median', F.med], ['Q<sub>3</sub>', F.q3]].map(([n, x]) => live(() => st('quart') > 0.5 ? P(x, Y + h).add(V(0, 0.32, 0)) : null, () => `${n} ${x}`)),
      live(() => st('box') > 0.5 ? P((F.q1 + F.q3) / 2, Y - h).add(V(0, -0.3, 0)) : null, () => `IQR ${M.IQR}`),
      live(() => st('fence') > 0.5 ? P(M.FENCE.hi, 4.4) : null, () => `upper fence ${M.FENCE.hi}`),
      live(() => st('fence') > 0.5 ? P((F.q3 + M.FENCE.hi) / 2, 12.6).add(V(0, 0.25, 0)) : null, () => `1.5 × IQR = ${1.5 * M.IQR}`),
      live(() => st('whisk') > 0.5 ? P(M.WHISK.lo, Y).add(V(-0.35, 0, 0)) : null, () => `${M.WHISK.lo}`),
      live(() => st('whisk') > 0.5 ? P(M.WHISK.hi, Y).add(V(0, 0.55, 0)) : null, () => `${M.WHISK.hi}`),
      live(() => st('out') > 0.5 ? P(M.OUTLIERS[0], Y).add(V(0, 0.45, 0)) : null, () => `outlier ${M.OUTLIERS[0]}`));
    ups.push(s => {
      t = M.boxT(M.clk(s, 'box'));
      const uq = st('quart'), ub = st('box'), uf = st('fence'), uw = st('whisk'), uo = st('out');
      for (const q of qs) {
        q.m.visible = uq > 0.01; if (q.m.visible) setRod(q.m, P(q.x, Y - h * uq), P(q.x, Y + h * uq));
        q.g.visible = uq > 0.01; q.g.set(B.P(q.x, 2.4, 0.05), B.P(q.x, 2.4 + (Y - h - 2.4) * uq, 0.05));
      }
      fill.visible = ub > 0.01;
      if (fill.visible) { fill.scale.set(Math.max((F.q3 - F.q1) * B.ux * ub, 0.01), 2 * h * B.uy, 1); fill.position.copy(B.P((F.q1 + F.q3) / 2, Y, 0.06)); }
      sides.forEach((m, i) => { m.visible = ub > 0.01; if (m.visible) { const c = (F.q1 + F.q3) / 2, w = (F.q3 - F.q1) / 2 * ub, yy = Y + (i ? h : -h); setRod(m, P(c - w, yy), P(c + w, yy)); } });
      fence.visible = fbar.visible = uf > 0.01;
      fence.set(B.P(M.FENCE.hi, 0, 0.05), B.P(M.FENCE.hi, 13.6 * uf, 0.05));
      if (uf > 0.01) setRod(fbar, P(F.q3, 12.6), P(F.q3 + (M.FENCE.hi - F.q3) * uf, 12.6));
      for (const w of whisk) {
        w.m.visible = w.e.visible = uw > 0.01;
        if (uw > 0.01) { const x = w.a + (w.b - w.a) * uw; setRod(w.m, P(w.a, Y), P(x, Y)); setRod(w.e, P(x, Y - h / 2), P(x, Y + h / 2)); }
      }
      ring.visible = uo > 0.01; ring.position.copy(P(M.OUTLIERS[0], Y)); ring.scale.setScalar(Math.max(uo, 0.01));
    });
  }

  // ---------- 1.9 bus against car, on one axis ----------
  {
    const B = graphBoard(root, { at: [ST.compare - 6.6, -2.6, 0], x: [0, 60], y: [0, 20], unit: [0.22, 0.25], grid: [5, 0], ticks: [10, 100] });
    const groups = [['bus', M.BUS, M.BUS5, M.BUSF, M.BUS_OUT, 11], ['car', M.CAR, M.CAR5, M.CARF, M.CAR_OUT, 1]];
    for (const [m, a, five, fe, out, y0] of groups) {
      const g = asm(m, root, { title: `By ${m}`, sub: `${a.length} students: dotplot and boxplot` });
      const k = stackOf(a);
      a.forEach((t, i) => ball(g, 0.1, PAL[m], 'Student').position.copy(B.P(t, y0 + k[i] * 0.8, 0.1)));
      boxplot(B, g, { five, whisk: M.whiskOf(a, fe), out }, y0 + 4, 1.3, m === 'bus' ? 'blue' : 'ink');
      labels.push(mark(`${m} (<i>n</i> = ${a.length})`, () => B.P(42, y0 + 4), 'board'));
    }
    const mg = asm('medians', root, { title: 'The two medians', sub: `${M.BUS5.med} and ${M.CAR5.med} min: bus riders take longer, typically` });
    for (const x of [M.BUS5.med, M.CAR5.med]) setRod(rod(mg, { r: 0.025, pal: 'red', name: 'Median' }), B.P(x, 0.2, 0.2), B.P(x, 18.6, 0.2));
    setRod(rod(mg, { r: 0.03, pal: 'red', name: 'Difference' }), B.P(M.CAR5.med, 18.2, 0.2), B.P(M.BUS5.med, 18.2, 0.2));
    labels.push(...axisLabels(B, { xs: range(0, 60, 10), xName: 'commute time (min)' }),
      mark(`${M.BUS5.med - M.CAR5.med} min`, () => B.P((M.BUS5.med + M.CAR5.med) / 2, 18.2).add(V(0, 0.32, 0))),
      mark(`IQR ${M.BUS5.q3 - M.BUS5.q1}`, () => B.P((M.BUS5.q1 + M.BUS5.q3) / 2, 15 + 1.3).add(V(0, 0.28, 0))),
      mark(`IQR ${M.CAR5.q3 - M.CAR5.q1}`, () => B.P((M.CAR5.q1 + M.CAR5.q3) / 2, 5 + 1.3).add(V(0, 0.28, 0))));
  }

  // ---------- 1.10 the normal model: heights of 200 women, the curve over them, the empirical rule ----------
  const { mu, sigma } = M.HEIGHT, zs = [-3, -2, -1, 0, 1, 2, 3];
  function normalBoard(x) {
    const ux = 0.27, B = graphBoard(root, { at: [x - 6.5 - M.H_RANGE[0] * ux, -2.4, 0], x: M.H_RANGE, y: [0, 0.07], unit: [ux, 64], grid: [0, 0.01], ticks: [100, 100] });
    lines(root, zs.flatMap(z => [...B.P(mu + z * sigma, 0, 0.002).toArray(), ...B.P(mu + z * sigma, 0.07, 0.002).toArray()]), '#e4e4df');
    labels.push(...axisLabels(B, { xs: zs.map(z => mu + z * sigma), xName: 'height (cm)' }),
      ...zs.map(z => mark(`${z < 0 ? '−' : ''}${Math.abs(z)}`, () => B.P(mu + z * sigma, 0).add(V(0, -0.95, 0)))),
      mark('<i>z</i>', () => B.P(M.H_RANGE[0], 0).add(V(-0.25, -0.95, 0)), 'vec'));
    return B;
  }
  {
    const B = normalBoard(ST.normal);
    const hg = asm('heights', root, { title: 'The 200 heights', sub: 'a histogram scaled so its total area is 1' });
    bars(B, hg, M.H_BINS.length, { pal: 'base', tone: 'mid', name: 'Bin', depth: 0.1, opacity: 1 }).set(M.H_BINS.map(([a, b, n]) => [a, b, n / (M.HEIGHT.n * M.H_BIN)]));
    const cg = asm('curve', root, { title: `The normal model N(${mu}, ${sigma})`, sub: 'a smooth curve for the population; total area 1' });
    curve(B, cg, x => M.normPdf(x, mu, sigma), ...M.H_RANGE, { r: 0.04, pal: 'ink', name: 'Normal curve', lift: 0.16 });
    const bg = asm('band', root, { title: 'Within k standard deviations', sub: '68%, 95% and 99.7% of the area: the empirical rule' });
    const rg = region(B, bg, { pal: 'red', opacity: 0.5, name: 'Band' });
    rg.position.z = 0.13;
    let kk = 1;
    labels.push(live(() => B.P(mu, 0.022), () => `${(100 * M.RULE[kk - 1]).toFixed(kk === 3 ? 1 : 0)}% within ${kk} SD`),
      mark(`the normal model, μ = ${mu} cm, σ = ${sigma} cm`, () => B.P(M.H_RANGE[0], 0.07).add(V(0, 0.6, 0)), 'board'));
    ups.push(s => { kk = M.bandK(M.clk(s, 'normal')); rg.set(() => 0, x => M.normPdf(x, mu, sigma), mu - kk * sigma, mu + kk * sigma); });
  }
  {
    const B = normalBoard(ST.ncalc);
    const cg = asm('curve2', root, { title: `N(${mu}, ${sigma})`, sub: 'heights of women, as the model has them' });
    curve(B, cg, x => M.normPdf(x, mu, sigma), ...M.H_RANGE, { r: 0.04, pal: 'ink', name: 'Normal curve' });
    const ag = asm('area', root, { title: 'The area to the left', sub: 'the proportion of women shorter than x' });
    const rg = region(B, ag, { pal: 'red', opacity: 0.5, name: 'Area' });
    const cut = rod(ag, { r: 0.03, pal: 'red', name: 'x' });
    let x = mu;
    labels.push(live(() => B.P(x, 0.068), () => `<i>x</i> = ${x.toFixed(1)} cm, <i>z</i> = ${(M.zOf(x) < -0.005 ? '−' : '') + Math.abs(M.zOf(x)).toFixed(2)}`),
      live(() => B.P(Math.min(x, mu) - 4.5, 0.012), () => `area ${M.normCdf(x, mu, sigma).toFixed(3)}`),
      mark(`the normal model, μ = ${mu} cm, σ = ${sigma} cm`, () => B.P(M.H_RANGE[0], 0.07).add(V(0, 0.6, 0)), 'board'));
    ups.push(s => {
      x = M.calcX(M.clk(s, 'ncalc'));
      rg.set(() => 0, v => M.normPdf(v, mu, sigma), M.H_RANGE[0], x);
      setRod(cut, B.P(x, 0, 0.1), B.P(x, 0.064, 0.1));
    });
  }

  // ---------- 1.10 checking normality: two normal probability plots ----------
  [['npHeights', 'Heights of 200 women', M.NP_H, [140, 190], 10, 'cm', M.H_MEAN, M.H_SD, 'ink', -6.6],
    ['npTimes', 'Commute times of the class', M.NP_T, [0, 60], 10, 'min', M.MEAN, M.SD, 'red', 1.2]].forEach(([key, title, pts, [y0, y1], dy, name, m, s, pal, dx]) => {
    const ux = 0.9, uy = 4.5 / (y1 - y0), B = graphBoard(root, { at: [ST.check + dx + 3 * ux, -2.2 - y0 * uy, 0], x: [-3, 3], y: [y0, y1], unit: [ux, uy], grid: [1, dy], ticks: [100, 100], axes: false });
    const g = asm(key, root, { title, sub: key === 'npHeights' ? 'nearly a straight line: a normal model fits' : 'curved: skewed right, not normal' });
    for (const [z, v] of pts) dot(g, { pal, r: pts.length > 100 ? 0.05 : 0.08, name: 'Value' }).position.copy(B.P(z, v, 0.08));
    const a = Math.max(-3, (y0 - m) / s), b = Math.min(3, (y1 - m) / s);
    setRod(rod(g, { r: 0.02, pal: 'dark', name: 'Reference line' }), B.P(a, m + s * a, 0.05), B.P(b, m + s * b, 0.05));
    labels.push(...axisLabels(B, { xs: [-2, -1, 0, 1, 2], ys: range(y0, y1, dy), xName: 'expected <i>z</i>', yName: `${title} (${name})`, xf: v => `${v < 0 ? '−' : ''}${Math.abs(v)}` }));
  });

  return { labels, update: s => { for (const f of ups) f(s); } };
}
