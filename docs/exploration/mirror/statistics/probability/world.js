// The figure: one scene per idea, spread along +x, the camera flying between them page by page.
// Graph paper from the kit for every distribution; coins, dice tiles, Venn discs, a tree of rods and a Galton board
// built here from parts. Every random outcome comes from model.js (seeded). Red marks the thing that matters.
import * as THREE from 'three';
import { graphBoard, curve, liveCurve, dot, putAt, rod, setRod, bars, V } from '../kit.js';
import { part, box, lines, shadeMat } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { runs: 0, lln: 30, dice: 60, venn: 90, table: 122, tree: 152, rv: 182, linear: 212, sum: 242, galton: 274, geom: 304 };
// the Galton board's layout, shared with pages.js for its camera
export const GB = { cx: ST.galton - 3.5, top: 7.7, sx: 0.62, sy: 0.5, floor: -1.7 };

const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const small = (html, at) => mark(`<span style="font-size:12px">${html}</span>`, at);
const f2 = x => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(2);
const geoCache = new Map();
const sphere = r => geoCache.get('s' + r) ?? geoCache.set('s' + r, new THREE.SphereGeometry(r, 18, 12)).get('s' + r);
const ball = (parent, r, pal, name) => { const m = part(parent, sphere(r), { pal, tone: 'mid', name }); m.userData.home = null; return m; };
// a thin dashed line between two world points
function dashed(parent, a, b, color = '#8a8a8f') {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 }));
  l.userData = { noEdge: true }; l.computeLineDistances(); parent.add(l);
  return l;
}
// a flat box standing on board B from (xa, ya) to (xb, yb), out of the paper by depth
function slab(B, m, xa, xb, ya, yb, depth = 0.14) {
  const w = (xb - xa) * B.ux, h = (yb - ya) * B.uy;
  m.visible = w > 1e-3 && h > 1e-3;
  m.scale.set(Math.max(w, 1e-3), Math.max(h, 1e-3), depth);
  m.position.copy(B.P((xa + xb) / 2, (ya + yb) / 2, depth / 2));
}
const unitBox = new THREE.BoxGeometry(1, 1, 1);
const block = (parent, pal, name, opacity = 1) => { const m = part(parent, unitBox, { pal, tone: 'mid', name, mat: opacity < 1 ? shadeMat(pal, { opacity }) : undefined }); m.userData.home = null; return m; };
// a bracket of width from a to b (world points), with end ticks: the ± σ marks
function bracket(parent, pal, name) {
  const g = new THREE.Group(); parent.add(g);
  const r = [rod(g, { r: 0.03, pal, name }), rod(g, { r: 0.03, pal, name }), rod(g, { r: 0.03, pal, name })];
  g.set = (a, b, h = 0.18) => { setRod(r[0], a, b); setRod(r[1], a.clone().add(V(0, -h, 0)), a.clone().add(V(0, h, 0))); setRod(r[2], b.clone().add(V(0, -h, 0)), b.clone().add(V(0, h, 0))); };
  return g;
}
// a wedge under the axis: the balance point
const wedgeGeo = new THREE.ConeGeometry(0.28, 0.48, 3);
const wedge = (parent, pal, name) => { const m = part(parent, wedgeGeo, { pal, tone: 'mid', name }); m.userData.home = null; return m; };

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];          // per-frame updates, each (state) => void

  // a board's numbers, with its axis names set clear of them: x below the middle, y above the top-left corner
  function named(B, { xName = '', yName = '', ...o } = {}) {
    labels.push(...B.tickLabels({ ...o, xName: '', yName: '' }).filter(L => L.cls !== 'axis'));
    if (xName) labels.push(mark(xName.includes('<') ? xName : `<i>${xName}</i>`, () => B.P((B.x0 + B.x1) / 2, B.y0).add(V(0, -0.64, 0))));
    if (yName) labels.push(mark(`<span style="font-size:14px;color:#86868c">${yName}</span>`, () => B.P(B.x0, B.y1).add(V(-0.3, 0.55, 0)), 'board'));
  }
  // a probability histogram's board: discrete values xs, value v centred at v − xs[0] + 0.5
  function pmfBoard({ at, xs, ymax, unit, grid, tick, xName, yName = 'probability', fmt = v => `${v}` }) {
    const B = graphBoard(root, { at, x: [0, xs.length], y: [0, ymax], unit, grid: [0, grid], ticks: [1, tick] });
    B.vx = v => v - xs[0] + 0.5;
    named(B, { xTicks: false, xName, yName });
    labels.push(...xs.map(v => small(fmt(v), () => B.P(B.vx(v), 0).add(V(0, -0.28, 0)))));
    return B;
  }

  // ---------- 4.1 random or not: 50 real tosses, 50 made up, and what a simulation says about runs ----------
  {
    const x0 = ST.runs, S = 0.62;
    const coinGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.07, 28).rotateX(Math.PI / 2);
    const grids = [
      { key: 'real', seq: M.REAL, run: M.REAL_RUN, at: V(x0 - 6.1, 6.2, 0), title: '50 real tosses', sub: 'a fair coin, tossed 50 times' },
      { key: 'invented', seq: M.INVENTED, run: M.INV_RUN, at: V(x0 - 6.1, 1.9, 0), title: '50 made up by a person', sub: 'written down to “look random”' },
    ];
    const lg = asm('longest', root, { title: 'The longest run', sub: `${M.REAL_RUN.len} tails in a row, in the real tosses` });
    const coins = [];
    for (const G of grids) {
      const g = asm(G.key, root, { title: G.title, sub: G.sub });
      G.seq.forEach((h, i) => {
        const inRun = i >= G.run.start && i < G.run.start + G.run.len;
        const pal = inRun ? (G.key === 'real' ? 'red' : 'blue') : h ? 'ink' : 'paper';
        const m = part(inRun && G.key === 'real' ? lg : g, coinGeo, { pal, tone: 'mid', name: h ? 'Heads' : 'Tails' });
        m.userData.home = null;
        m.position.copy(G.at).add(V((i % 10) * S, -Math.floor(i / 10) * S, 0));
        coins.push({ m, i });
      });
      labels.push(mark(G.title, () => G.at.clone().add(V(-0.3, 0.75, 0)), 'board'),
        small(`longest run ${G.run.len} · ${G.key === 'real' ? M.REAL_SW : M.INV_SW} switches`, () => G.at.clone().add(V(4.5 * S, -4 * S - 0.62, 0))));
    }
    labels.push(small('● heads&ensp;○ tails', () => V(x0 - 6.1 + 7.2 * S, 6.95, 0)));
    // the simulation: the longest run in each of 10 000 sets of 50 tosses
    const xs = Array.from({ length: 11 }, (_, k) => k + 2);
    const B = pmfBoard({ at: [x0 + 1.6, 0.9, 0], xs, ymax: 0.35, unit: [0.46, 14], grid: 0.05, tick: 0.1, xName: 'longest run in the set', yName: 'proportion of sets' });
    const sg = asm('simruns', root, { title: 'The longest run, simulated', sub: `in each of ${M.RUNS.sims.toLocaleString('en-US')} sets of 50 fair tosses` });
    bars(B, sg, xs.length, { pal: 'blue', depth: 0.12, opacity: 1, name: 'Proportion of sets' }).set(xs.map(v => [B.vx(v) - 0.38, B.vx(v) + 0.38, (M.LONG_HIST[v] || 0) / M.RUNS.sims]));
    for (const [v, pal, txt] of [[M.REAL_RUN.len, 'red', 'real'], [M.INV_RUN.len, 'blue', 'made up']]) {
      setRod(rod(sg, { r: 0.03, pal, name: `Longest run, ${txt}` }), B.P(B.vx(v), 0, 0.2), B.P(B.vx(v), 0.31, 0.2));
      labels.push(small(txt, () => B.P(B.vx(v), 0.31).add(V(0, 0.2, 0))));
    }
    labels.push(mark(`${M.RUNS.sims.toLocaleString('en-US')} simulated sets`, () => B.P(0, 0.35).add(V(-0.3, 1.1, 0)), 'board'));
    ups.push(s => {
      const t = M.runsT(M.clk(s, 'runs'));
      for (const { m, i } of coins) {
        const u = (t - i * M.RUNS.each) / 0.35;
        m.visible = u > 0;
        m.rotation.x = Math.PI * 3 * (1 - M.smooth(u));   // tossed: it spins and lands face up
      }
    });
  }

  // ---------- 4.2 the law of large numbers: the proportion of sixes as rolls pile up ----------
  {
    const x0 = ST.lln;
    const B = graphBoard(root, { at: [x0 - 6.6, 0, 0], x: [0, 600], y: [0, 0.5], unit: [0.0135, 11], grid: [50, 0.05], ticks: [100, 0.1] });
    named(B, { xName: 'number of rolls', yName: 'proportion of sixes' });
    const pg = asm('path', root, { title: 'The proportion of sixes', sub: 'after each roll of one die, run 1' });
    const og = asm('others', root, { title: 'Three more runs', sub: 'other sequences of rolls, each its own path' });
    const tg = asm('truth', root, { title: 'The probability, 1/6', sub: 'where every path settles' });
    const main = liveCurve(B, pg, { n: 300, r: 0.045, pal: 'red', name: 'Run 1' });
    const others = [1, 2, 3].map(r => liveCurve(B, og, { n: 300, r: 0.022, pal: 'dark', tone: 'lo', name: `Run ${r + 1}` }));
    const nowDot = dot(pg, { pal: 'red', r: 0.11, name: 'Now' });
    setRod(rod(tg, { r: 0.03, pal: 'blue', name: '1/6' }), B.P(0, 1 / 6, 0.02), B.P(600, 1 / 6, 0.02));
    // the six faces, counted so far in run 1
    const F = pmfBoard({ at: [x0 + 3.0, 0, 0], xs: [1, 2, 3, 4, 5, 6], ymax: 0.5, unit: [0.55, 11], grid: 0.05, tick: 0.1, xName: 'face', yName: 'relative frequency' });
    const fg = asm('faces', root, { title: 'Each face, run 1', sub: 'the relative frequency of each face so far' });
    const fb = bars(F, fg, 6, { pal: 'blue', depth: 0.12, opacity: 1, name: 'Relative frequency' });
    setRod(rod(fg, { r: 0.02, pal: 'ink', name: '1/6' }), F.P(0, 1 / 6, 0.2), F.P(6, 1 / 6, 0.2));
    let n = 1;
    const prop = r => x => M.PROP[r][Math.min(Math.max(Math.round(x), 1), M.LLN.n) - 1];
    labels.push(mark('1/6', () => B.P(600, 1 / 6).add(V(0.6, 0, 0)), 'vec blue'),
      live(() => B.P(Math.max(n, 30), M.PROP[0][n - 1]).add(V(0.2, 0.4, 0)), () => `${M.PROP[0][n - 1].toFixed(3)}`, 'vec red'));
    ups.push(s => {
      n = M.llnN(M.clk(s, 'lln'));
      const b = Math.max(n, 1.0001);
      main.set(prop(0), 1, b); others.forEach((c, r) => c.set(prop(r + 1), 1, b));
      putAt(B, nowDot, n, M.PROP[0][n - 1], 0.08);
      const f = M.facesAt(n);
      fb.set(f.map((c, k) => [k + 0.15, k + 0.85, Math.min(c / n, 0.5)]));
    });
  }

  // ---------- 4.3 two dice: the 36 outcomes, and the event "sum is 7" ----------
  {
    const x0 = ST.dice, at = (a, b) => V(x0 - 2.5 + (a - 1), 0.4 + (b - 1), 0);
    const sg = asm('sevens', root, { title: 'The event A: sum is 7', sub: `${M.SEVENS.length} of the 36 outcomes` });
    const og = asm('notSeven', root, { title: 'The complement, not A', sub: `the other ${36 - M.SEVENS.length} outcomes` });
    const tile = box(0.88, 0.88, 0.14, 0.04);
    for (const [a, b] of M.DICE) {
      const seven = a + b === 7, p = at(a, b);
      part(seven ? sg : og, tile, { pal: seven ? 'red' : 'paper', tone: 'mid', name: `(${a}, ${b})`, pos: [p.x, p.y, seven ? 0.14 : 0.07] });
      labels.push(small(`${a + b}`, () => at(a, b).add(V(0, 0, 0.25))));
    }
    labels.push(...[1, 2, 3, 4, 5, 6].map(a => mark(`${a}`, () => at(a, 1).add(V(0, -0.85, 0)))),
      ...[1, 2, 3, 4, 5, 6].map(b => mark(`${b}`, () => at(1, b).add(V(-0.85, 0, 0)))),
      mark('first die', () => at(3.5, 1).add(V(0, -1.45, 0))),
      mark('second die', () => at(1, 6).add(V(-0.6, 0.95, 0))));
    // a roll: the outcome it lands on
    const rg = asm('roll', root, { title: 'One roll', sub: 'one outcome, every one equally likely' });
    const ring = part(rg, new THREE.TorusGeometry(0.5, 0.07, 10, 40), { pal: 'ink', tone: 'hi', name: 'This roll' }); ring.userData.home = null;
    let k = 0;
    labels.push(live(() => at(6, 6).add(V(1.0, 0.2, 0)), () => { const [a, b] = M.DROLLS[k]; return `roll ${k + 1}: (${a}, ${b})<br>sum ${a + b}<br>sevens so far ${M.sevensUpTo(k)}/${k + 1}`; }, 'board'));
    ups.push(s => {
      const c = M.clk(s, 'dice'); k = M.rollIdx(c);
      const [a, b] = M.DROLLS[k], u = (c % M.DROLL.each) / M.DROLL.each;
      ring.position.copy(at(a, b)).add(V(0, 0, 0.3));
      ring.scale.setScalar(1 + 0.35 * (1 - M.smooth(u / 0.3)));
    });
  }

  // ---------- 4.4 and 4.6 Venn diagrams: two rectangles of area 1, darts thrown at random ----------
  {
    const W = M.VENN.W, H = M.VENN.H;
    const flat = new THREE.CircleGeometry(1, 72), ringGeo = r => new THREE.TorusGeometry(r, 0.03, 8, 96);
    // one board: its rectangle, and darts coloured by the region they land in
    function board(cx, key, title, sub, regions) {
      const c = V(cx, 3.0, 0), g = asm(key, root, { title, sub });
      part(g, box(W, H, 0.05, 0.02), { pal: 'board', tone: 'lo', pos: [c.x, c.y, -0.03], name: 'Sample space' });
      const geo = new THREE.BufferGeometry(), pos = new Float32Array(M.DARTS.n * 3), col = new Float32Array(M.DARTS.n * 3);
      M.DART.forEach(([x, y], i) => {
        pos.set([c.x + x, c.y + y, 0.09], i * 3);
        col.set(new THREE.Color(regions(x, y)).toArray(), i * 3);
      });
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size: 4, sizeAttenuation: false, vertexColors: true }));
      pts.userData = { noEdge: true }; pts.frustumCulled = false; root.add(pts);
      ups.push(s => geo.setDrawRange(0, M.dartsN(M.clk(s, 'venn'))));
      labels.push(mark('S', () => c.clone().add(V(-W / 2 + 0.3, H / 2 - 0.3, 0.1))));
      return c;
    }
    function disc(parent, c, C, pal, name, opacity = 0.45) {
      const m = part(parent, flat, { pal, tone: 'mid', name, mat: shadeMat(pal, { opacity }) });
      m.scale.setScalar(C.r); m.position.set(c.x + C.c[0], c.y + C.c[1], 0.04); m.userData.noEdge = true; m.material.depthWrite = false;
      part(parent, ringGeo(C.r), { pal, tone: 'hi', name, pos: [c.x + C.c[0], c.y + C.c[1], 0.05] });
    }
    const L = M.LEFT, R = M.RIGHT, RED = '#e5484d', BLUE = '#3d63a8', GREY = '#9c9ca2', INK = '#2c2c30';
    // 4.4: blood types A and B: no one is both
    const cl = board(ST.venn - 5.6, 'blood', 'One blood donor', 'the sample space: types O, A, B and AB', (x, y) => M.inC([x, y], L.A) ? RED : M.inC([x, y], L.B) ? BLUE : GREY);
    const dg = asm('disjoint', root, { title: 'Type A, type B', sub: 'mutually exclusive: no overlap' });
    disc(dg, cl, L.A, 'red', 'Type A'); disc(dg, cl, L.B, 'blue', 'Type B');
    // 4.6: Statistics and Biology: some students take both
    const cr = board(ST.venn + 5.6, 'courses', 'One student', 'the sample space: every student in the school', (x, y) => {
      const s = M.inC([x, y], R.S), b = M.inC([x, y], R.B); return s && b ? RED : s ? BLUE : b ? INK : GREY; });
    const eg = asm('events', root, { title: 'Statistics, Biology', sub: 'two events that overlap' });
    disc(eg, cr, R.S, 'blue', 'AP Statistics', 0.35); disc(eg, cr, R.B, 'dark', 'AP Biology', 0.35);
    // the overlap: arcs of both circles
    const ig = asm('inter', root, { title: 'Both: S and B', sub: `P(S ∩ B) = ${M.COURSE.SB}: counted in P(S) and again in P(B)` });
    {
      const d = R.d, a = R.S.r, b = R.B.r, ts = Math.acos((d * d + a * a - b * b) / (2 * d * a)), tb = Math.acos((d * d + b * b - a * a) / (2 * d * b));
      const sh = new THREE.Shape(), n = 40;
      for (let i = 0; i <= n; i++) { const t = -ts + 2 * ts * i / n, p = [R.S.c[0] + a * Math.cos(t), R.S.c[1] + a * Math.sin(t)]; i ? sh.lineTo(...p) : sh.moveTo(...p); }
      for (let i = 0; i <= n; i++) { const t = Math.PI - tb + 2 * tb * i / n; sh.lineTo(R.B.c[0] + b * Math.cos(t), R.B.c[1] + b * Math.sin(t)); }
      const m = part(ig, new THREE.ShapeGeometry(sh), { pal: 'red', tone: 'mid', name: 'S and B', mat: shadeMat('red', { opacity: 0.7 }), pos: [cr.x, cr.y, 0.06] });
      m.userData.noEdge = true; m.material.depthWrite = false;
    }
    let n = 0;
    const share = test => n ? `${(M.hits(n, test) / n).toFixed(2)}` : '–';
    labels.push(
      mark(`A&ensp;${M.BLOOD.A.toFixed(2)}`, () => cl.clone().add(V(L.A.c[0], L.A.c[1] + 0.3, 0.2)), 'vec red'),
      mark(`B&ensp;${M.BLOOD.B.toFixed(2)}`, () => cl.clone().add(V(L.B.c[0], L.B.c[1] + L.B.r + 0.35, 0.2)), 'vec blue'),
      small(`O or AB: ${(M.BLOOD.O + M.BLOOD.AB).toFixed(2)}`, () => cl.clone().add(V(L.B.c[0], -1.55, 0.2))),
      mark('S', () => cr.clone().add(V(R.S.c[0] - 0.85, R.S.c[1] + 0.4, 0.2)), 'vec blue'),
      mark('B', () => cr.clone().add(V(R.B.c[0] + 0.75, R.B.c[1] + 0.4, 0.2)), 'vec'),
      small(`${M.P_S_ONLY.toFixed(2)}`, () => cr.clone().add(V(R.S.c[0] - 0.75, R.S.c[1] - 0.35, 0.2))),
      small(`${M.P_B_ONLY.toFixed(2)}`, () => cr.clone().add(V(R.B.c[0] + 0.65, R.B.c[1] - 0.35, 0.2))),
      mark(`${M.COURSE.SB.toFixed(2)}`, () => cr.clone().add(V((R.S.c[0] + R.S.r + R.B.c[0] - R.B.r) / 2, R.S.c[1], 0.2)), 'vec red'),
      small(`neither ${M.P_NEITHER.toFixed(2)}`, () => cr.clone().add(V(W / 2 - 1.0, -H / 2 + 0.3, 0.2))),
      mark('blood type, one donor', () => cl.clone().add(V(-W / 2, H / 2 + 0.45, 0)), 'board'),
      mark('courses, one student', () => cr.clone().add(V(-W / 2, H / 2 + 0.45, 0)), 'board'),
      live(() => cl.clone().add(V(0, -H / 2 - 0.45, 0)), () => `${n} darts · share in A or B: ${share(p => M.inC(p, L.A) || M.inC(p, L.B))}`),
      live(() => cr.clone().add(V(0, -H / 2 - 0.45, 0)), () => `${n} darts · share in S or B: ${share(p => M.inC(p, R.S) || M.inC(p, R.B))}`));
    ups.push(s => { n = M.dartsN(M.clk(s, 'venn')); });
  }

  // ---------- 4.5 a two-way table: counts, and the conditional distribution within each age group ----------
  {
    const x0 = ST.table, T = M.TXT;
    const B = graphBoard(root, { at: [x0 - 6.6, 0, 0], x: [0, 4], y: [0, 300], unit: [1.25, 0.0175], grid: [0, 50], ticks: [1, 100] });
    const cg = asm('counts', root, { title: 'The counts', sub: `${M.TOT} drivers, by age group and texting` });
    const spots = [[0.3, 0.95], [1.05, 1.7], [2.3, 2.95], [3.05, 3.7]];
    T.n.flat().forEach((v, k) => slab(B, block(cg, k % 2 ? 'dark' : 'blue', `${T.rows[k >> 1]}, ${T.cols[k % 2]}`), ...spots[k], 0, v));
    named(B, { xTicks: false, yName: 'drivers' });
    labels.push(
      ...T.n.flat().map((v, k) => small(`${v}`, () => B.P((spots[k][0] + spots[k][1]) / 2, v).add(V(0, 0.25, 0)))),
      ...T.rows.map((r, i) => mark(r, () => B.P(1 + 2 * i, 0).add(V(0, -0.35, 0)))),
      small('<span style="color:#3d63a8">■</span> texted&ensp;<span style="color:#86868c">■</span> did not', () => B.P(4, 300).add(V(-1.2, 0.55, 0))));
    // within each row: the proportion who texted
    const C = graphBoard(root, { at: [x0 + 0.8, 0, 0], x: [0, 3], y: [0, 1], unit: [1.6, 5.25], grid: [0, 0.1], ticks: [1, 0.2] });
    const gg = asm('given', root, { title: 'Given the age group', sub: 'each row of the table on its own, as proportions' });
    const og = asm('givenOther', root, { title: 'Given 25 and older', sub: `${M.ROWT[1]} drivers` });
    const col = [[0.3, 1.2], [1.8, 2.7]];
    [[gg, M.P_T_GIVEN_Y, 'red'], [og, M.P_T_GIVEN_O, 'blue']].forEach(([g, p, pal], i) => {
      slab(C, block(g, pal, 'Texted'), ...col[i], 0, p);
      slab(C, block(g, 'paper', 'Did not'), ...col[i], p, 1);
      labels.push(mark(`<span style="color:#fff">${p.toFixed(2)}</span>`, () => C.P((col[i][0] + col[i][1]) / 2, p / 2).add(V(0, 0, 0.3)), 'vec'),
        small(`${(1 - p).toFixed(2)}`, () => C.P((col[i][0] + col[i][1]) / 2, (1 + p) / 2).add(V(0, 0, 0.3))),
        mark(T.rows[i], () => C.P((col[i][0] + col[i][1]) / 2, 0).add(V(0, -0.35, 0))));
    });
    named(C, { xTicks: false, yName: 'proportion who texted' });
    labels.push(mark(`<span style="font-size:12px;color:#86868c">P(texted) = ${M.P_T.toFixed(3)}</span>`, () => C.P(3, M.P_T).add(V(0.2, 0, 0)), 'board'));
    setRod(rod(gg, { r: 0.02, pal: 'ink', name: 'P(texted), everyone' }), C.P(0, M.P_T, 0.2), C.P(3, M.P_T, 0.2));
  }

  // ---------- 4.5 a tree diagram: a screening test, people flowing down the branches ----------
  {
    const x0 = ST.tree, Y = 3.2;
    const root0 = V(x0 - 6.0, Y, 0), n1 = [V(x0 - 2.6, Y + 2.2, 0), V(x0 - 2.6, Y - 2.2, 0)];
    const n2 = [V(x0 + 0.8, Y + 3.3, 0), V(x0 + 0.8, Y + 1.1, 0), V(x0 + 0.8, Y - 1.1, 0), V(x0 + 0.8, Y - 3.3, 0)];
    const bg = asm('branches', root, { title: 'The tree', sub: 'has the condition or not, then tests positive or not' });
    const pg = asm('positive', root, { title: 'Tested positive', sub: 'both ways to land here: with the condition and without' });
    const ng = asm('negative', root, { title: 'Tested negative', sub: 'the other two leaves' });
    const T = M.TEST, probs = [[T.prev, 1 - T.prev], [T.sens, 1 - T.sens, T.fpr, 1 - T.fpr]];
    n1.forEach((p, i) => setRod(rod(bg, { r: 0.05, pal: 'ink', name: i ? 'No condition' : 'Condition' }), root0, p));
    n2.forEach((p, j) => setRod(rod(bg, { r: 0.05, pal: j % 2 ? 'dark' : 'ink', name: j % 2 ? 'Negative' : 'Positive' }), n1[j >> 1], p));
    for (const p of [root0, ...n1, ...n2]) { const m = ball(bg, 0.13, 'ink', 'Branch point'); m.position.copy(p); }
    const mid = (a, b, dy) => () => a.clone().add(b).multiplyScalar(0.5).add(V(0, dy, 0));
    labels.push(mark(`${probs[0][0]}`, mid(root0, n1[0], 0.45)), mark(`${probs[0][1]}`, mid(root0, n1[1], -0.45)),
      ...n2.map((p, j) => mark(`${probs[1][j].toFixed(2)}`, mid(n1[j >> 1], p, j % 2 ? -0.32 : 0.32))),
      mark('condition', () => n1[0].clone().add(V(0, 0.45, 0))), mark('no condition', () => n1[1].clone().add(V(0, -0.45, 0))),
      ...n2.map((p, j) => mark(j % 2 ? '−' : '+', () => p.clone().add(V(-0.05, 0.38, 0)), j % 2 ? 'vec' : 'vec red')));
    // leaves: a bar per path, as long as its count of people so far
    const leaf = n2.map((p, j) => block(j % 2 ? ng : pg, j === 0 ? 'red' : j === 2 ? 'blue' : 'dark', ['Condition and positive', 'Condition and negative', 'No condition and positive', 'No condition and negative'][j]));
    const SC = 4.6 / 360;
    let cnt = [0, 0, 0, 0], tt = 0;
    labels.push(...n2.map((p, j) => live(() => p.clone().add(V(0.6 + Math.max(cnt[j] * SC, 0.02) + 0.15, 0, 0)), () => `${cnt[j]}`, 'board')),
      live(() => V(x0 + 0.6, Y - 4.6, 0), () => { const pos = cnt[0] + cnt[2]; return pos ? `P(condition | +) so far ${cnt[0]}/${pos} = ${(cnt[0] / pos).toFixed(2)}` : 'P(condition | +) so far –'; }, 'board'));
    // people: small balls, each down its own path
    const hg = asm('people', root, { title: 'People', sub: 'each one down its own path, at random' });
    const people = Array.from({ length: M.TREE.tokens }, () => ball(hg, 0.08, 'ink', 'Person'));
    const path = tk => [root0, n1[1 - tk[0]], n2[(1 - tk[0]) * 2 + (1 - tk[1])]];
    ups.push(s => {
      tt = M.treeT(M.clk(s, 'tree')); cnt = M.leafCounts(tt);
      leaf.forEach((m, j) => { const w = Math.max(cnt[j] * SC, 0.02); m.scale.set(w, 0.42, 0.2); m.position.copy(n2[j]).add(V(0.6 + w / 2, 0, 0)); });
      people.forEach((m, i) => {
        const u = (tt - i * M.TREE.gap) / M.TREE.travel;
        m.visible = u > 0 && u < 1;
        if (!m.visible) return;
        const [a, b, c] = path(M.TOKENS[i]), w = u < 0.45 ? u / 0.45 : u < 0.9 ? (u - 0.45) / 0.45 : 1;
        if (u < 0.45) m.position.lerpVectors(a, b, w);
        else if (u < 0.9) m.position.lerpVectors(b, c, w);
        else m.position.copy(c).add(V(0.6 * (u - 0.9) / 0.1, 0, 0));
        m.position.z = 0.15;
      });
    });
  }

  // ---------- 4.7 and 4.8 a discrete random variable: X = cars in a household ----------
  {
    const x0 = ST.rv, D = M.CARS;
    const B = pmfBoard({ at: [x0 - 3.6, -0.2, 0], xs: D.x, ymax: 1, unit: [1.25, 5.4], grid: 0.1, tick: 0.2, xName: '', yName: 'probability' });
    labels.push(small('<i>x</i> = cars', () => B.P(5, 0).add(V(0.55, -0.28, 0))));
    const bgp = asm('bars', root, { title: 'The probability distribution of X', sub: 'a bar per value; the heights add to 1' });
    bars(B, bgp, 5, { pal: 'blue', depth: 0.16, opacity: 1, name: 'P(X = x)' }).set(D.x.map((v, i) => [B.vx(v) - 0.35, B.vx(v) + 0.35, D.p[i]]));
    const cg = asm('cdf', root, { title: 'The cumulative probabilities', sub: 'P(X ≤ x): the bars added from the left' });
    D.x.forEach((v, i) => {
      setRod(rod(cg, { r: 0.025, pal: 'ink', name: `P(X ≤ ${v})` }), B.P(B.vx(v), M.CUM[i], 0.2), B.P(Math.min(B.vx(v) + 1, 5), M.CUM[i], 0.2));
      putAt(B, dot(cg, { r: 0.07, name: `P(X ≤ ${v})` }), B.vx(v), M.CUM[i], 0.2);
      if (i) dashed(cg, B.P(B.vx(v), M.CUM[i - 1], 0.2), B.P(B.vx(v), M.CUM[i], 0.2));
    });
    // draws: the relative frequency of each value so far (red), and the mean of the draws (under the axis)
    const dg = asm('draws', root, { title: 'Households drawn at random', sub: 'the relative frequency of each value so far' });
    const obs = D.x.map(v => dot(dg, { pal: 'red', r: 0.09, name: `Relative frequency of ${v}` }));
    const bl = asm('balance', root, { title: 'The mean, μ', sub: 'the balance point of the distribution' });
    const wd = wedge(bl, 'red', 'μ'); wd.position.copy(B.P(B.vx(M.MU_X), 0)).add(V(0, -0.62, 0.1));
    const mean = ball(bl, 0.1, 'ink', 'Mean of the draws');
    const sp = asm('spread', root, { title: 'The standard deviation, σ', sub: 'a typical distance of X from μ' });
    bracket(sp, 'ink', 'μ ± σ').set(B.P(B.vx(M.MU_X - M.SD_X), 0.5, 0.2), B.P(B.vx(M.MU_X + M.SD_X), 0.5, 0.2));
    dashed(sp, B.P(B.vx(M.MU_X), 0, 0.2), B.P(B.vx(M.MU_X), 0.56, 0.2), '#e5484d');
    let n = 1;
    labels.push(...D.x.map((v, i) => small(`${D.p[i].toFixed(2)}`, () => B.P(B.vx(v) + 0.12, D.p[i]).add(V(0.25, 0.22, 0)))),
      ...D.x.slice(1, 4).map((v, j) => [v, j + 1]).map(([v, i]) => small(`${M.CUM[i].toFixed(2)}`, () => B.P(B.vx(v), M.CUM[i]).add(V(0, 0.25, 0)))),
      mark(`μ = ${M.MU_X.toFixed(2)}`, () => B.P(B.vx(M.MU_X), 0).add(V(1.1, -0.62, 0)), 'vec red'),
      mark(`σ = ${M.SD_X.toFixed(2)}`, () => B.P(B.vx(M.MU_X + M.SD_X), 0.5).add(V(0.7, 0, 0))),
      live(() => B.P(5, 0).add(V(0.35, -0.7, 0)), () => `x̄ of ${n} draws: ${M.runMean(n).toFixed(2)}`));
    ups.push(s => {
      n = M.rvN(M.clk(s, 'rv'));
      M.obsFreq(n).forEach((f, i) => putAt(B, obs[i], B.vx(D.x[i]), f, 0.3));
      mean.position.copy(B.P(B.vx(M.runMean(n)), 0)).add(V(0, -1.05, 0.1));
    });
  }

  // ---------- 4.9 a linear transformation: Y = 3X − 7, the bars stretched then shifted ----------
  {
    const x0 = ST.linear, D = M.WHEEL;
    const B = graphBoard(root, { at: [x0 - 2.4, 0, 0], x: [-5, 13], y: [0, 0.5], unit: [0.6, 9], grid: [1, 0.05], ticks: [2, 0.1], axes: false });
    lines(root, [...B.P(-5, 0, 0.01).toArray(), ...B.P(13, 0, 0.01).toArray(), ...B.P(-5, 0, 0.01).toArray(), ...B.P(-5, 0.5, 0.01).toArray()], '#6e6e74');
    dashed(root, B.P(0, 0, 0.01), B.P(0, 0.5, 0.01));
    const xg = asm('xdist', root, { title: 'X: the number spun', sub: 'the wheel’s distribution, before the change' });
    bars(B, xg, 4, { pal: 'dark', depth: 0.06, opacity: 0.35, name: 'P(X = x)' }).set(D.x.map((v, i) => [v - 0.35, v + 0.35, D.p[i]]));
    const yg = asm('ydist', root, { title: 'Y = 3X − 7: the net gain', sub: 'every value stretched by 3, then shifted down by 7' });
    const yb = bars(B, yg, 4, { pal: 'red', depth: 0.16, opacity: 1, name: 'P(Y = y)' });
    const wd = wedge(yg, 'red', 'Mean'), br = bracket(yg, 'ink', 'Mean ± SD');
    let ph = { s: 0, h: 0 };
    const mu = () => M.morph(M.MU_W, ph), sdv = () => M.SD_W * (1 + (D.b - 1) * ph.s);
    // its numbers by hand: the y-axis stands at 0, among the bars, so the probabilities go down the left edge instead
    labels.push(...[-4, -2, 0, 2, 4, 6, 8, 10, 12].map(x => small(`${x < 0 ? '−' : ''}${Math.abs(x)}`, () => B.P(x, 0).add(V(0, -0.28, 0)))),
      ...[0.1, 0.2, 0.3, 0.4, 0.5].map(y => ({ cls: 'tick', html: `${y}`, at: () => B.P(-5, y).add(V(-0.3, 0, 0)) })),
      mark('<i>value</i> (dollars for Y)', () => B.P(4, 0).add(V(0, -1.6, 0))),
      mark('<span style="font-size:14px;color:#86868c">probability</span>', () => B.P(-5, 0.5).add(V(-0.6, 0.55, 0)), 'board'),

      live(() => B.P(mu(), 0).add(V(0, -1.05, 0)), () => `mean ${f2(mu())}`, 'vec red'),
      live(() => B.P(mu() + sdv(), 0.47).add(V(0.9, 0, 0)), () => `SD ${sdv().toFixed(2)}`),
      live(() => B.P(13, 0.5).add(V(-3.2, 0.55, 0)), () => ph.h > 0.5 ? 'Y = 3X − 7' : ph.s > 0.5 ? '3X: stretched by 3' : 'X', 'board'));
    ups.push(s => {
      ph = M.linPhase(M.clk(s, 'linear'));
      yb.set(D.x.map((v, i) => { const y = M.morph(v, ph); return [y - 0.35, y + 0.35, D.p[i]]; }));
      wd.position.copy(B.P(mu(), 0)).add(V(0, -0.45, 0.1));
      br.set(B.P(mu() - sdv(), 0.47, 0.2), B.P(mu() + sdv(), 0.47, 0.2), 0.12);
    });
  }

  // ---------- 4.9 a sum: the wheel plus a die. Means add; variances add ----------
  {
    const x0 = ST.sum;
    const X = pmfBoard({ at: [x0 - 7.2, 3.6, 0], xs: M.WHEEL.x, ymax: 0.45, unit: [0.6, 4.6], grid: 0.1, tick: 0.2, xName: 'X', yName: '' });
    const Y = pmfBoard({ at: [x0 - 7.2, -0.6, 0], xs: M.DIE.x, ymax: 0.45, unit: [0.6, 4.6], grid: 0.1, tick: 0.2, xName: 'Y', yName: '' });
    const T = pmfBoard({ at: [x0 - 2.4, -0.6, 0], xs: M.TSUM.x, ymax: 0.2, unit: [0.6, 22], grid: 0.02, tick: 0.05, xName: 'X + Y', yName: '' });
    const xg = asm('xbars', root, { title: 'X, the wheel', sub: `mean ${M.MU_W}, SD ${M.SD_W}` });
    const yg = asm('ybars', root, { title: 'Y, a fair die', sub: `mean ${M.MU_D}, SD ${M.SD_D.toFixed(3)}` });
    const tg = asm('tbars', root, { title: 'X + Y', sub: 'every pair of outcomes, added: the distribution of the sum' });
    bars(X, xg, 4, { pal: 'blue', opacity: 1, name: 'P(X = x)' }).set(M.WHEEL.x.map((v, i) => [X.vx(v) - 0.35, X.vx(v) + 0.35, M.WHEEL.p[i]]));
    bars(Y, yg, 6, { pal: 'dark', opacity: 1, name: 'P(Y = y)' }).set(M.DIE.x.map((v, i) => [Y.vx(v) - 0.35, Y.vx(v) + 0.35, M.DIE.p[i]]));
    bars(T, tg, M.TSUM.x.length, { pal: 'red', opacity: 1, name: 'P(X + Y = t)' }).set(M.TSUM.x.map((v, i) => [T.vx(v) - 0.35, T.vx(v) + 0.35, M.TSUM.p[i]]));
    // the standard deviations: a right triangle, legs σX and σY, hypotenuse σ of the sum
    const rg = asm('triangle', root, { title: 'Variances add', sub: 'σ²(X + Y) = σ²X + σ²Y: the SDs are the sides of a right triangle' });
    const k = 1.5, o = V(x0 + 4.6, 0.4, 0), a = o.clone().add(V(M.SD_W * k, 0, 0)), b = a.clone().add(V(0, M.SD_D * k, 0));
    setRod(rod(rg, { r: 0.045, pal: 'blue', name: 'σ of X' }), o, a); setRod(rod(rg, { r: 0.045, pal: 'dark', name: 'σ of Y' }), a, b); setRod(rod(rg, { r: 0.05, pal: 'red', name: 'σ of X + Y' }), o, b);
    lines(rg, [a.x - 0.22, a.y, 0, a.x - 0.22, a.y + 0.22, 0, a.x - 0.22, a.y + 0.22, 0, a.x, a.y + 0.22, 0], '#6e6e74');
    labels.push(mark(`σ<sub>X</sub> = ${M.SD_W}`, () => o.clone().lerp(a, 0.5).add(V(0, -0.35, 0))),
      mark(`σ<sub>Y</sub> = ${M.SD_D.toFixed(2)}`, () => a.clone().lerp(b, 0.5).add(V(0.85, 0, 0))),
      mark(`σ<sub>X+Y</sub> = ${M.SD_T.toFixed(2)}`, () => o.clone().lerp(b, 0.5).add(V(-1.25, 0.45, 0)), 'vec red'),
      mark('wheel, X', () => X.P(0, 0.45).add(V(0.2, 0.55, 0)), 'board'), mark('die, Y', () => Y.P(0, 0.45).add(V(0.2, 0.55, 0)), 'board'),
      mark('sum, X + Y', () => T.P(0, 0.2).add(V(0.2, 0.55, 0)), 'board'));
    // one play: the wheel, the die, and their sum
    const pg = asm('play', root, { title: 'One play', sub: 'a spin and a roll, and their sum' });
    const mx = ball(pg, 0.13, 'ink', 'This spin'), my = ball(pg, 0.13, 'ink', 'This roll'), mt = ball(pg, 0.15, 'ink', 'Their sum');
    let pr = [1, 1];
    labels.push(live(() => T.P(4.5, 0).add(V(0, -1.15, 0)), () => `this play: ${pr[0]} + ${pr[1]} = ${pr[0] + pr[1]}`));
    ups.push(s => {
      const c = M.clk(s, 'sum'); pr = M.PAIRS[M.pairIdx(c)];
      const u = M.smooth(((c % M.SUMD.each) / M.SUMD.each) / 0.4);
      const ix = M.WHEEL.x.indexOf(pr[0]), it = M.TSUM.x.indexOf(pr[0] + pr[1]);
      mx.position.copy(X.P(X.vx(pr[0]), M.WHEEL.p[ix], 0.1)).add(V(0, 0.22, 0));
      my.position.copy(Y.P(Y.vx(pr[1]), 1 / 6, 0.1)).add(V(0, 0.22, 0));
      mt.position.copy(T.P(T.vx(pr[0] + pr[1]), M.TSUM.p[it], 0.1)).add(V(0, 0.24 + 0.8 * (1 - u), 0));
      mt.scale.setScalar(Math.max(u, 0.01));
    });
  }

  // ---------- opener, 4.10 and 4.11: a Galton board. Ten rows of pins; at each a ball goes right with probability 1/2 ----------
  {
    const { n, balls: NB } = M.GAL, { cx, top, sx, sy, floor } = GB;
    const pg = asm('pins', root, { title: 'The board', sub: `${n} rows of pins: ${n} trials per ball` });
    const pinGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.5, 14).rotateX(Math.PI / 2);
    for (let r = 0; r < n; r++) for (let k = 0; k <= r; k++) part(pg, pinGeo, { pal: 'dark', tone: 'mid', name: 'Pin', pos: [cx + (k - r / 2) * sx, top - r * sy, 0] });
    part(pg, box((n + 1) * sx + 0.3, top - floor + 0.9, 0.05, 0.02), { pal: 'board', tone: 'faint', name: 'Board', pos: [cx, (top + floor) / 2 + 0.3, -0.32] });
    const binTop = top - (n - 1) * sy - 0.45;
    for (let k = 0; k <= n + 1; k++) part(pg, box(0.04, binTop - floor, 0.5, 0.01), { pal: 'dark', tone: 'lo', name: 'Bin wall', pos: [cx + (k - 0.5 - n / 2) * sx, (binTop + floor) / 2, 0] });
    part(pg, box((n + 1) * sx + 0.1, 0.08, 0.6, 0.02), { pal: 'dark', tone: 'mid', name: 'Floor', pos: [cx, floor - 0.04, 0] });
    // the expected height of each bin's stack, for 240 balls
    const LAYER = 0.25, PER = 4, eg = asm('expect', root, { title: 'The expected counts', sub: `${NB} × P(X = k) for each bin` });
    M.PMF.forEach((p, k) => { const h = floor + NB * p / PER * LAYER; if (NB * p >= 0.5) setRod(rod(eg, { r: 0.03, pal: 'red', name: `Expected, X = ${k}` }), V(cx + (k - n / 2) * sx - 0.27, h, 0.3), V(cx + (k - n / 2) * sx + 0.27, h, 0.3)); });
    const bg = asm('balls', root, { title: 'The balls', sub: `${NB} of them; each one’s X is how many times it went right` });
    const bm = Array.from({ length: NB }, () => ball(bg, 0.115, 'ink', 'Ball'));
    const PX = M.PATHS.map(p => { const out = [0]; let R = 0; p.forEach((d, r) => { R += d; out.push((R - (r + 1) / 2) * sx); }); return out; });
    const slotAt = i => { const j = M.SLOT[i], q = j % PER; return V(cx + (M.BINOF[i] - n / 2) * sx + (q % 2 ? 0.14 : -0.14), floor + 0.125 + Math.floor(j / PER) * LAYER, q < 2 ? -0.12 : 0.12); };
    const SLOTS = bm.map((_, i) => slotAt(i));
    let counts = Array(n + 1).fill(0);
    labels.push(...counts.map((_, k) => small(`${k}`, () => V(cx + (k - n / 2) * sx, floor - 0.35, 0))),
      mark('<i>X</i> = number of times right', () => V(cx, floor - 0.85, 0)),
      ...counts.map((_, k) => ({ ...small('', () => counts[k] ? V(cx + (k - n / 2) * sx, floor + Math.ceil(counts[k] / PER) * LAYER + 0.3, 0.3) : null), text: () => `<span style="font-size:11px">${counts[k]}</span>` })));
    ups.push(s => {
      const t = M.galT(M.clk(s, 'galton')), fade = Math.min(1, (M.GAL_RUN + M.GAL.rest - t) / 0.6);
      counts = M.countsAt(t);
      bm.forEach((m, i) => {
        const u = t - i * M.GAL.gap;
        m.visible = u > 0;
        if (!m.visible) return;
        const end = n * M.GAL.row;
        if (u < end) {
          const r = Math.floor(u / M.GAL.row), f = (u - r * M.GAL.row) / M.GAL.row;
          m.position.set(cx + PX[i][r] + (PX[i][r + 1] - PX[i][r]) * M.smooth(f), top - r * sy + 0.21 - f * sy + 0.22 * Math.sin(Math.PI * f), 0);
        } else {
          const f = Math.min((u - end) / M.GAL.drop, 1), S = SLOTS[i], y0 = top - n * sy + 0.21;
          m.position.set(cx + PX[i][n] + (S.x - cx - PX[i][n]) * f, y0 + (S.y - y0) * f * f, S.z * f);
        }
        m.scale.setScalar(Math.max(fade, 0.01));
      });
    });
    // the probability histogram of X, beside the board
    const B = pmfBoard({ at: [ST.galton + 5.0, floor, 0], xs: counts.map((_, k) => k), ymax: 0.3, unit: [0.5, 16], grid: 0.05, tick: 0.1, xName: '<i>k</i>', yName: 'P(<i>X</i> = <i>k</i>)' });
    const hg = asm('pmf', root, { title: 'The binomial distribution', sub: `n = ${n}, p = ${M.GAL.p}` });
    const k6 = asm('pmf6', root, { title: `P(X = ${M.GK})`, sub: `${M.PATHS_K} routes of the ${2 ** n}, each with probability (1/2)¹⁰` });
    bars(B, hg, n + 1, { pal: 'blue', opacity: 1, name: 'P(X = k)' }).set(M.PMF.map((p, k) => k === M.GK ? null : [B.vx(k) - 0.36, B.vx(k) + 0.36, p]));
    bars(B, k6, 1, { pal: 'red', opacity: 1, name: `P(X = ${M.GK})` }).set([[B.vx(M.GK) - 0.36, B.vx(M.GK) + 0.36, M.PMF[M.GK]]]);
    const ms = asm('musd', root, { title: 'μ = np and σ = √(np(1 − p))', sub: `the centre and spread: ${M.MU_B} and ${M.SD_B.toFixed(2)}` });
    setRod(rod(ms, { r: 0.035, pal: 'red', name: 'μ' }), B.P(B.vx(M.MU_B), 0, 0.25), B.P(B.vx(M.MU_B), 0.285, 0.25));
    bracket(ms, 'ink', 'μ ± σ').set(B.P(B.vx(M.MU_B - M.SD_B), 0.27, 0.25), B.P(B.vx(M.MU_B + M.SD_B), 0.27, 0.25), 0.1);
    labels.push(mark(`${M.PMF[M.GK].toFixed(3)}`, () => B.P(B.vx(M.GK) + 1.4, M.PMF[M.GK] + 0.012), 'vec red'),
      mark(`μ = ${M.MU_B}`, () => B.P(B.vx(M.MU_B), 0.285).add(V(-0.6, 0.05, 0))),
      mark(`σ = ${M.SD_B.toFixed(2)}`, () => B.P(B.vx(M.MU_B + M.SD_B), 0.27).add(V(0.85, 0, 0))));
  }

  // ---------- 4.12 the geometric distribution: boxes opened until the first prize ----------
  {
    const x0 = ST.geom, P = M.PRIZE, xs = Array.from({ length: P.show }, (_, k) => k + 1);
    const B = pmfBoard({ at: [x0 - 4.6, -0.6, 0], xs, ymax: 0.25, unit: [0.6, 18], grid: 0.05, tick: 0.05, xName: '<i>x</i> = boxes opened', yName: 'P(<i>X</i> = <i>x</i>)' });
    const gg = asm('gbars', root, { title: 'The geometric distribution', sub: `p = ${P.p}: each bar is 1 − p = ${1 - P.p} times the one before` });
    bars(B, gg, P.show, { pal: 'blue', opacity: 1, name: 'P(X = x)' }).set(M.GPMF.map((p, k) => [B.vx(k + 1) - 0.34, B.vx(k + 1) + 0.34, p]));
    const mg = asm('gmean', root, { title: 'The mean, 1/p', sub: `on average ${M.MU_GE} boxes to the first prize` });
    setRod(rod(mg, { r: 0.035, pal: 'red', name: 'μ' }), B.P(B.vx(M.MU_GE), 0, 0.25), B.P(B.vx(M.MU_GE), 0.235, 0.25));
    labels.push(mark(`μ = 1/<i>p</i> = ${M.MU_GE}`, () => B.P(B.vx(M.MU_GE), 0.235).add(V(0.1, 0.3, 0)), 'vec red'),
      ...M.GPMF.slice(0, 4).map((p, k) => small(p.toFixed(3), () => B.P(B.vx(k + 1), p).add(V(0, 0.22, 0)))));
    // one run at a time: a row of boxes, opened left to right until a prize turns up
    const tg = asm('trials', root, { title: 'One run', sub: 'boxes opened in turn; each has a prize with probability 0.2' });
    const cube = box(0.42, 0.42, 0.42, 0.05);
    const boxes = xs.map(v => { const m = part(tg, cube, { pal: 'paper', tone: 'mid', name: 'Box' }); m.userData.home = null; m.position.copy(B.P(B.vx(v), 0.25)).add(V(0, 1.15, 0.2)); return m; });
    const prize = xs.map(v => { const m = part(tg, cube, { pal: 'red', tone: 'mid', name: 'Prize' }); m.userData.home = null; m.position.copy(boxes[v - 1].position); return m; });
    const land = ball(tg, 0.14, 'ink', 'This run’s X');
    let g = { i: 0, open: 1, done: false };
    labels.push(live(() => B.P(0, 0.25).add(V(0.2, 1.95, 0)), () => `run ${g.i + 1}: ${g.done ? `first prize in box ${M.GRUNS[g.i]}, so X = ${M.GRUNS[g.i]}` : `box ${g.open}…`}`, 'board'));
    ups.push(s => {
      g = M.geomAt(M.clk(s, 'geom'));
      const k = M.GRUNS[g.i];
      boxes.forEach((m, j) => { m.visible = j < g.open && !(j === k - 1); });
      prize.forEach((m, j) => { m.visible = j === k - 1 && g.open === k; });
      land.visible = g.done;
      land.position.copy(B.P(B.vx(k), M.GPMF[k - 1], 0.1)).add(V(0, 0.25, 0));
    });
  }

  return { labels, update: s => { for (const f of ups) f(s); } };
}
