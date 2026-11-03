// The figures: one sheet (or a stacked pair) of graph paper per idea, spread along x, the camera flying between them.
// Riemann pieces stand out of the paper as solid slabs; areas lie flat on it; everything moves on one clock.
import * as THREE from 'three';
import { graphBoard, curve, liveCurve, dot, putAt, rod, setRod, region, V } from '../kit.js';
import { part, lines, shadeMat } from '../engine/parts.js';
import { tex } from '../engine/tex.js';
import * as M from './model.js';

// where each scene stands (its centre's x)
// what the Riemann scene is showing now (its breakdown reads it)
export const live = { cyc: false, open: false };
export const ST = { flow: -26, riemann: 0, acc: 26, prop: 52, ftc: 76, family: 100, sub: 124, div: 148, parts: 172, pf: 196, improper: 220, pick: 244 };

// solid slabs standing on the axis, each with a top running from (xa, ha) to (xb, hb): rectangles when ha = hb,
// trapezoids otherwise. set([[xa, xb, ha, hb], …]). Heights are ≥ 0 here.
function slabs(B, parent, n, { pal = 'blue', depth = 0.14, opacity = 0.85, name = 'Rectangles' } = {}) {
  const g = new THREE.Group(); parent.add(g);
  const mat = shadeMat(pal, { opacity });
  const list = Array.from({ length: n }, () => {
    const geo = new THREE.BoxGeometry(1, 1, 1), unit = geo.attributes.position.array.slice();
    const m = part(g, geo, { pal, tone: 'mid', name, mat }); m.userData.home = null; m.visible = false; m.unit = unit;
    return m;
  });
  g.set = rects => list.forEach((m, i) => {
    const r = rects[i];
    m.visible = !!r && r[1] > r[0] && Math.max(r[2], r[3]) > 1e-6;
    if (!m.visible) return;
    const [xa, xb, ha, hb] = r, pos = m.geometry.attributes.position, gap = Math.min(0.006, (xb - xa) * 0.1) / B.unit;
    for (let k = 0; k < pos.count; k++) {
      const left = m.unit[3 * k] < 0, x = left ? xa + gap : xb - gap, h = left ? ha : hb;
      const p = B.P(x, m.unit[3 * k + 1] < 0 ? 0 : h, m.unit[3 * k + 2] < 0 ? 0.004 : depth);
      pos.setXYZ(k, p.x, p.y, p.z);
    }
    pos.needsUpdate = true;
    m.geometry.computeVertexNormals(); m.geometry.computeBoundingBox(); m.geometry.computeBoundingSphere();
  });
  return g;
}
// a short tangent segment through (x, y) with slope s, `half` math units long on each side
function tangent(B, m, x, y, s, half = 0.7, lift = 0.07) {
  const dx = half / Math.sqrt(1 + s * s);
  setRod(m, B.P(x - dx, y - s * dx, lift), B.P(x + dx, y + s * dx, lift));
}
// a dynamic two-point ink line
function guide(parent, color = '#9a9aa0') {
  const l = lines(parent, [0, 0, 0, 0, 1, 0], color);
  l.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);
  l.put = (a, b) => { const p = l.geometry.attributes.position; p.setXYZ(0, a.x, a.y, a.z); p.setXYZ(1, b.x, b.y, b.z); p.needsUpdate = true; l.geometry.computeBoundingSphere(); };
  return l;
}
const signed = (B, parent, opacity = 0.3) => {   // area above the axis red, below blue
  const pos = region(B, parent, { pal: 'red', opacity }), neg = region(B, parent, { pal: 'blue', opacity });
  return (fn, a, b) => { pos.set(() => 0, x => Math.max(fn(x), 0), a, b); neg.set(x => Math.min(fn(x), 0), () => 0, a, b); };
};

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  // a scene's labels show only while its centre is in view, so neighbours' numbers never crowd in
  const pv = V();
  const inView = c => { pv.copy(c).project(E.camera); return pv.z < 1 && Math.abs(pv.x) < 1.1 && Math.abs(pv.y) < 1.1; };
  const add = (center, list) => labels.push(...list.map(L => ({ ...L, at: () => inView(center) ? L.at() : null })));
  const ticks = (B, center, names) => add(center, B.tickLabels(names));
  const ups = [];   // per-frame updates: (s, look) => …

  // ================= Riemann sums (the opener, 6.2, 6.3): y = 1 + x²/4 on [0, 4] =================
  {
    const C = V(ST.riemann, 0, 0), B = graphBoard(root, { at: [ST.riemann - 2, -2.6, 0], x: [-0.4, 4.6], y: [-0.4, 5.6], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    region(B, root, { pal: 'red', opacity: 0.16 }).set(() => 0, M.fR, M.R.a, M.R.b);
    const crv = asm('curveR', root, { title: 'The curve', sub: 'y = 1 + x²/4, from x = 0 to 4' });
    curve(B, crv, M.fR, -0.2, 4.45, { lift: 0.4, r: 0.045 });
    const sl = asm('slabsR', root, { title: 'The pieces', sub: 'height × width, added up' });
    const S = slabs(B, sl, 64, { depth: 0.36 });
    ticks(B, C);
    add(C, [{ cls: 'mark', html: '<i>y</i> = 1 + <i>x</i>²/4', at: () => B.P(1.1, 4.7, 0.4) }]);
    ups.push((s, look) => {
      live.cyc = look.cyc > 0.5; live.open = look.open > 0.5;
      if (live.cyc) S.set(M.pieces(M.kindAt(s.c), M.N2));
      else S.set(M.pieces('right', look.open > 0.5 ? M.N0 : M.nAt(s.c)));
    });
  }

  // ================= 6.1 accumulation: v(t) = t(4 − t), and where the particle is =================
  {
    const u = 0.8, C = V(ST.flow, 0, 0);
    const B = graphBoard(root, { at: [ST.flow - 2.5 * u, -0.6, 0], x: [-0.3, 5.4], y: [-5.4, 4.6], unit: u, grid: [0.5, 1], ticks: [1, 1] });
    const area = signed(B, root);
    const rate = asm('rate', root, { title: 'The rate', sub: 'v(t) = t(4 − t) m/s' });
    curve(B, rate, M.v1, 0, 5.2);
    const now = asm('now', root, { title: 'Now', sub: 'the moment the area has reached' });
    const nd = dot(now, { pal: 'red', name: 'Now' }), drop = guide(root);
    // the track: a number line under the graph, 0.45 world units per metre
    const k = 0.45, ty = B.P(0, -5.4).y - 1.25, tx0 = B.P(0, 0).x, X = m => V(tx0 + m * k, ty, 0.05);
    const track = asm('track', root, { title: 'The particle', sub: 'its position is the area so far' });
    part(track, new THREE.BoxGeometry(12 * k, 0.03, 0.03), { pal: 'ink', tone: 'hi', name: 'Number line', pos: [tx0 + 6 * k, ty, 0.03] });
    const tk = []; for (let m = 0; m <= 12; m++) tk.push(tx0 + m * k, ty - 0.1, 0.03, tx0 + m * k, ty + 0.1, 0.03);
    lines(track, tk, '#6e6e74');
    const marker = part(track, new THREE.SphereGeometry(0.14, 24, 16), { pal: 'red', tone: 'hi', name: 'Particle' });
    ticks(B, C, { xName: 't', yName: 'v' });
    add(C, [...[0, 2, 4, 6, 8, 10, 12].map(m => ({ cls: 'tick', html: `${m}`, at: () => X(m).add(V(0.08, -0.32, 0)) })),
      { cls: 'axis', html: 'position (m)', at: () => X(12).add(V(1.6, 0.3, 0)) }]);
    ups.push(s => {
      const t = Math.max(M.flowT(s.c), 0.001);
      area(M.v1, 0, t);
      putAt(B, nd, t, M.v1(t)); drop.put(B.P(t, M.v1(t), 0.03), B.P(t, 0, 0.03));
      marker.position.copy(X(M.X1(t)));
    });
  }

  // ================= 6.4–6.5 g(x) = ∫ f from −2 to x, f a semicircle and two segments =================
  const semicircleBoard = (cx, cy, u) => graphBoard(root, { at: [cx - 2 * u, cy, 0], x: [-2.4, 6.4], y: [-2.4, 2.4], unit: u, grid: [0.5, 0.5], ticks: [1, 1] });
  {
    const u = 0.8, C = V(ST.acc, 0, 0);
    const Bf = semicircleBoard(ST.acc, 3.6, u);
    const Bg = graphBoard(root, { at: [ST.acc - 2 * u, -4.4, 0], x: [-2.4, 6.4], y: [-0.6, 7.2], unit: u, grid: [0.5, 0.5], ticks: [1, 1] });
    const area = signed(Bf, root);
    const fG = asm('fGraph', root, { title: 'The graph of f', sub: 'a semicircle, then two segments' });
    curve(Bf, fG, M.fS, -2, 6, { n: 400 });
    const fd = dot(fG, { pal: 'red', name: 'f(x)' });
    const gG = asm('gGraph', root, { title: 'The accumulation function g', sub: 'g(x) = ∫ f(t) dt from −2 to x' });
    curve(Bg, gG, M.gS, -2, 6, { n: 300, r: 0.02, pal: 'dark', tone: 'lo' });
    const gl = liveCurve(Bg, gG, { pal: 'red', r: 0.04, name: 'g so far' }), gd = dot(gG, { pal: 'red', name: 'g(x)' });
    const tg = asm('tangentG', root, { title: 'The slope of g', sub: 'equal to f(x): the Fundamental Theorem' });
    const tr = rod(tg, { pal: 'blue', r: 0.03, name: 'Tangent' });
    const vline = guide(root, '#b4b4b8');
    const ft = asm('features', root, { title: 'What f says about g', sub: 'a maximum and two inflection points' });
    const feats = [[2, 'red'], [0, 'blue'], [4, 'blue']].map(([x, pal]) => { const d = dot(ft, { pal, r: 0.13, name: x === 2 ? 'Maximum' : 'Inflection point' }); putAt(Bg, d, x, M.gS(x), 0.1); return d; });
    ticks(Bf, C, { xName: 'x', yName: 'f' }); ticks(Bg, C, { xName: 'x', yName: 'g' });
    let showF = false;
    add(C, [
      { cls: 'mark', html: 'max <i>g</i>(2) = 2π', at: () => showF ? Bg.P(2, M.gS(2)).add(V(0, 0.45, 0)) : null },
      { cls: 'mark', html: 'inflection', at: () => showF ? Bg.P(0, M.gS(0)).add(V(-0.9, 0.3, 0)) : null },
      { cls: 'mark', html: 'inflection', at: () => showF ? Bg.P(4, M.gS(4)).add(V(0.85, 0.35, 0)) : null },
    ]);
    ups.push((s, look) => {
      const x = Math.max(M.accX(s.c), M.S.a + 0.01);
      area(M.fS, M.S.a, x);
      putAt(Bf, fd, x, M.fS(x)); gl.set(M.gS, M.S.a, x); putAt(Bg, gd, x, M.gS(x));
      tangent(Bg, tr, x, M.gS(x), M.fS(x), 0.9);
      vline.put(Bf.P(x, 2.4, 0.02), Bg.P(x, -0.6, 0.02));
      showF = look.feat > 0.5; ft.visible = showF;
    });
  }

  // ================= 6.6 splitting the interval at c =================
  {
    const u = 0.95, C = V(ST.prop, 0, 0), B = semicircleBoard(ST.prop, -1, u);
    const left = region(B, root, { pal: 'red', opacity: 0.32 }), right = region(B, root, { pal: 'blue', opacity: 0.32 });
    const fG = asm('fProp', root, { title: 'The graph of f', sub: 'the same semicircle and segments' });
    curve(B, fG, M.fS, -2, 6, { n: 400 });
    const cG = asm('splitC', root, { title: 'The split point c', sub: 'any c: the two pieces always add to the whole' });
    const cr = rod(cG, { pal: 'ink', r: 0.03, name: 'x = c' }), cd = dot(cG, { pal: 'ink', name: 'c' });
    ticks(B, C, { xName: 'x', yName: 'f' });
    let cx = 0;
    add(C, [{ cls: 'mark', html: '<i>c</i>', at: () => B.P(cx, -2.4).add(V(0, -0.35, 0)) }]);
    ups.push(s => {
      cx = M.propC(s.c);
      const lo = x => Math.min(M.fS(x), 0), hi = x => Math.max(M.fS(x), 0);
      left.set(lo, hi, M.S.a, cx); right.set(lo, hi, cx, M.S.b);
      setRod(cr, B.P(cx, -2.3, 0.06), B.P(cx, 2.3, 0.06)); putAt(B, cd, cx, M.fS(cx));
    });
  }

  // ================= 6.7 FTC: area under x² from 1 to b = the rise of x³/3 + C =================
  {
    const C = V(ST.ftc, 0, 0);
    const Bf = graphBoard(root, { at: [ST.ftc - 3.7, -2.2, 0], x: [-0.3, 2.4], y: [-0.4, 4.6], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    const BF = graphBoard(root, { at: [ST.ftc + 0.9, -2.2, 0], x: [-0.3, 2.4], y: [-1.6, 4.6], unit: 1, grid: [0.5, 0.5], ticks: [1, 1] });
    const ar = region(Bf, root, { pal: 'red', opacity: 0.34 });
    const fG = asm('fFtc', root, { title: 'The integrand', sub: 'f(x) = x²' });
    curve(Bf, fG, M.f7, -0.2, 2.15);
    const FG = asm('FFtc', root, { title: 'An antiderivative', sub: 'F(x) = x³/3 + C, any C' });
    const Fl = liveCurve(BF, FG, { pal: 'ink', r: 0.035, name: 'F' });
    const da = dot(FG, { name: 'F(a)' }), db = dot(FG, { name: 'F(b)' });
    const rise = asm('rise', root, { title: 'The rise F(b) − F(a)', sub: 'the same length whatever C is' });
    const rr = rod(rise, { pal: 'red', r: 0.05, name: 'Rise' }), run = rod(rise, { pal: 'dark', r: 0.02, name: 'Level of F(a)' });
    ticks(Bf, C, { xName: 'x', yName: 'f' }); ticks(BF, C, { xName: 'x', yName: 'F' });
    add(C, [{ cls: 'mark', html: '<i>y</i> = <i>x</i>²', at: () => Bf.P(2.05, 4.4).add(V(-0.75, 0, 0)) },
      { cls: 'mark', html: '<i>y</i> = <i>x</i>³/3 + <i>C</i>', at: () => BF.P(1.2, 4.25) }]);
    ups.push(s => {
      const b = Math.max(M.ftcB(s.c), M.T7.a + 0.005), c = M.ftcC(s.c), F = x => M.F7(x) + c;
      ar.set(() => 0, M.f7, M.T7.a, b);
      Fl.set(F, -0.2, 2.25);
      putAt(BF, da, M.T7.a, F(M.T7.a)); putAt(BF, db, b, F(b));
      setRod(rr, BF.P(b, F(M.T7.a), 0.08), BF.P(b, F(b), 0.08)); setRod(run, BF.P(M.T7.a, F(M.T7.a), 0.07), BF.P(b, F(M.T7.a), 0.07));
    });
  }

  // ================= 6.8 the family x³/3 − x + C, with parallel tangents =================
  {
    const u = 0.95, C = V(ST.family, 0, 0);
    const B = graphBoard(root, { at: [ST.family, 0, 0], x: [-2.6, 2.6], y: [-3.6, 3.6], unit: u, grid: [0.5, 0.5], ticks: [1, 1] });
    const fam = asm('family', root, { title: 'The family F(x) + C', sub: 'every antiderivative of x² − 1' });
    const one = asm('picked', root, { title: 'The one through (0, 1)', sub: 'F(0) = 1 fixes C = 1' });
    const items = M.CS8.map(c => {
      const g = c === M.C8 ? one : fam;
      curve(B, g, x => M.F8(x) + c, -2.6, 2.6, { pal: c === M.C8 ? 'red' : 'ink', tone: c === M.C8 ? 'hi' : 'mid', r: c === M.C8 ? 0.04 : 0.028 });
      return { c, d: dot(g, { pal: c === M.C8 ? 'red' : 'ink', r: 0.08 }), t: rod(g, { pal: 'blue', r: 0.022, name: 'Tangent' }) };
    });
    const x0 = dot(one, { pal: 'red', r: 0.11, name: '(0, 1)' }); putAt(B, x0, 0, 1);
    const vl = guide(root, '#b4b4b8');
    ticks(B, C);
    // each curve named where it leaves the paper: through the right edge, or through the top
    const exitAt = c => { if (M.F8(2.6) + c <= 3.6) return B.P(2.6, M.F8(2.6) + c).add(V(0.5, 0, 0));
      let lo = 1, hi = 2.6; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (M.F8(m) + c < 3.6) lo = m; else hi = m; }
      return B.P(lo, 3.6).add(V(0, 0.3 + 0.38 * (c - 1), 0)); };
    add(C, M.CS8.map(c => ({ cls: 'mark', html: `<i>C</i> = ${c < 0 ? '−' : ''}${Math.abs(c)}`, at: () => exitAt(c) })));
    ups.push(s => {
      const x = M.famX(s.c);
      for (const it of items) { const y = M.F8(x) + it.c; putAt(B, it.d, x, y, 0.08); tangent(B, it.t, x, y, M.f8(x), 0.75); }
      vl.put(B.P(x, -3.6, 0.02), B.P(x, 3.6, 0.02));
    });
  }

  // ================= 6.9 substitution: the same area in x and in u = x² =================
  {
    const u = 1.9, C = V(ST.sub, 0, 0);
    const Bx = graphBoard(root, { at: [ST.sub - 3.9, -1.5, 0], x: [-0.2, 1.5], y: [-0.2, 1.6], unit: u, grid: [0.25, 0.25], ticks: [0.5, 0.5] });
    const Bu = graphBoard(root, { at: [ST.sub + 0.7, -1.5, 0], x: [-0.2, 1.8], y: [-0.2, 1.6], unit: u, grid: [0.25, 0.25], ticks: [0.5, 0.5] });
    const ax = region(Bx, root, { pal: 'red', opacity: 0.3 }), au = region(Bu, root, { pal: 'red', opacity: 0.3 });
    const xG = asm('xSide', root, { title: 'In x', sub: '2x cos(x²), from 0 to √(π/2)' });
    curve(Bx, xG, M.h9, 0, M.XB9 + 0.12);
    const uG = asm('uSide', root, { title: 'In u = x²', sub: 'cos u, from 0 to π/2' });
    curve(Bu, uG, M.g9, 0, M.UB9 + 0.15);
    const st = asm('strips', root, { title: 'A strip and its image', sub: 'width dx in x becomes du = 2x dx in u' });
    const sx = slabs(Bx, st, 1, { pal: 'blue', depth: 0.1, opacity: 0.9, name: 'Strip in x' }), su = slabs(Bu, st, 1, { pal: 'blue', depth: 0.1, opacity: 0.9, name: 'Strip in u' });
    ticks(Bx, C); ticks(Bu, C, { xName: 'u', yName: 'y' });
    add(C, [{ cls: 'mark', html: '<i>y</i> = 2<i>x</i> cos(<i>x</i>²)', at: () => Bx.P(0.7, 1.5) },
      { cls: 'mark', html: '<i>y</i> = cos <i>u</i>', at: () => Bu.P(0.9, 1.25) }]);
    ups.push(s => {
      const x = Math.max(M.subX(s.c), 0.002), x2 = Math.min(x + M.DX9, M.XB9);
      ax.set(() => 0, M.h9, 0, x); au.set(() => 0, M.g9, 0, x * x);
      sx.set(x2 > x + 1e-4 ? [[x, x2, M.h9(x), M.h9(x2)]] : []);
      su.set(x2 > x + 1e-4 ? [[x * x, x2 * x2, M.g9(x * x), M.g9(x2 * x2)]] : []);
    });
  }

  // ================= 6.10 long division (top) and completing the square (bottom) =================
  {
    const C = V(ST.div, 0, 0);
    const Bd = graphBoard(root, { at: [ST.div - 1.3, 0.6, 0], x: [-0.3, 2.5], y: [-0.3, 3.7], unit: 1.05, grid: [0.5, 0.5], ticks: [1, 1] });
    const Bs = graphBoard(root, { at: [ST.div + 0.9, -3.1, 0], x: [-4.4, 2.4], y: [-0.2, 1.5], unit: 0.95, grid: [0.5, 0.5], ticks: [1, 1] });
    const qa = region(Bd, root, { pal: 'blue', opacity: 0.3 }), ra = region(Bd, root, { pal: 'red', opacity: 0.45 });
    ra.position.z = 0.012;
    qa.set(() => 0, M.q10, M.D10.a, M.D10.b);
    const dG = asm('quotient', root, { title: 'After dividing', sub: '(x² + 2x + 2)/(x + 1) = (x + 1) + 1/(x + 1)' });
    curve(Bd, dG, M.f10, -0.2, 2.4);
    curve(Bd, dG, M.q10, -0.2, 2.4, { pal: 'blue', tone: 'mid', r: 0.025 });
    const sG = asm('square', root, { title: 'After completing the square', sub: 'x² + 2x + 5 = (x + 1)² + 4' });
    region(Bs, root, { pal: 'red', opacity: 0.3 }).set(() => 0, M.s10, M.SQ10.a, M.SQ10.b);
    curve(Bs, sG, M.s10, -4.4, 2.4);
    const sh = liveCurve(Bs, sG, { pal: 'blue', r: 0.025, name: '4/(u² + 4)' });
    ticks(Bd, C); ticks(Bs, C);
    add(C, [{ cls: 'mark', html: '<i>x</i> + 1', at: () => Bd.P(2.45, 3.25) },
      { cls: 'mark', html: '+ 1/(<i>x</i> + 1)', at: () => Bd.P(0.75, 3.1) },
      { cls: 'mark', html: '4/((<i>x</i> + 1)² + 4)', at: () => Bs.P(-3.2, 1.3) }]);
    ups.push(s => {
      const k = 1 - M.lift10(s.c);
      ra.set(x => k * M.q10(x), x => k * M.q10(x) + M.r10(x), M.D10.a, M.D10.b);
      const d = M.shift10(s.c);
      sh.set(x => 4 / ((x + d) ** 2 + 4), -4.4, 2.4);
    });
  }

  // ================= 6.11 parts: the rectangle uv = ∫v du + ∫u dv =================
  {
    const u = 1.45, C = V(ST.parts, 0, 0);
    const B = graphBoard(root, { at: [ST.parts - 0.8, -2.2, 0], x: [-0.2, 1.3], y: [-0.2, 3.2], unit: u, grid: [0.25, 0.25], ticks: [0.5, 1] });
    const red = region(B, root, { pal: 'red', opacity: 0.32 }), blue = region(B, root, { pal: 'blue', opacity: 0.32 });
    const cv = asm('curveP', root, { title: 'The curve (u, v) = (x, eˣ)', sub: 'u = x, v = eˣ' });
    curve(B, cv, Math.exp, 0, 1.15);
    const rect = asm('rectP', root, { title: 'The rectangle uv', sub: 'split by the curve into ∫v du and ∫u dv' });
    const top = rod(rect, { pal: 'ink', r: 0.025, name: 'Top' }), side = rod(rect, { pal: 'ink', r: 0.025, name: 'Side' });
    const corner = dot(rect, { pal: 'ink', name: '(u, v)' });
    ticks(B, C, { xName: 'u', yName: 'v' });
    let sNow = 1;
    add(C, [{ cls: 'mark', html: '∫ <i>v</i> d<i>u</i>', at: () => sNow > 0.45 ? B.P(sNow * 0.55, 0.55) : null },
      { cls: 'mark', html: '∫ <i>u</i> d<i>v</i>', at: () => sNow > 0.6 ? B.P(sNow * 0.25, (Math.exp(sNow) + Math.exp(sNow * 0.5)) / 2 + 0.1) : null }]);
    ups.push(s => {
      const t = Math.max(M.partsS(s.c), 0.004), et = Math.exp(t); sNow = t;
      red.set(() => 0, Math.exp, 0, t); blue.set(Math.exp, () => et, 0, t);
      setRod(top, B.P(0, et, 0.05), B.P(t, et, 0.05)); setRod(side, B.P(t, 0, 0.05), B.P(t, et, 0.05)); putAt(B, corner, t, et);
    });
  }

  // ================= 6.12 partial fractions: two simple curves add to one =================
  {
    const C = V(ST.pf, 0, 0);
    const B = graphBoard(root, { at: [ST.pf - 2, -0.5, 0], x: [-0.3, 4.4], y: [-1.2, 2.5], unit: 1.05, grid: [0.5, 0.5], ticks: [1, 1] });
    region(B, root, { pal: 'dark', opacity: 0.25 }).set(() => 0, M.f12, M.P12.a, M.P12.b);
    const fG = asm('fPf', root, { title: 'The integrand', sub: '3/(x(x + 3))' });
    curve(B, fG, M.f12, 0.05, 4.4);
    const aG = asm('pieceA', root, { title: 'The piece 1/x', sub: 'A = 1, from the factor x' });
    curve(B, aG, M.pA12, 0.05, 4.4, { pal: 'red', tone: 'mid', r: 0.028 });
    const bG = asm('pieceB', root, { title: 'The piece −1/(x + 3)', sub: 'B = −1, from the factor x + 3' });
    curve(B, bG, M.pB12, -0.3, 4.4, { pal: 'blue', tone: 'mid', r: 0.028 });
    const ra = rod(aG, { pal: 'red', r: 0.045, name: '1/x' }), rb = rod(bG, { pal: 'blue', r: 0.045, name: '−1/(x + 3)' });
    const dS = dot(fG, { name: 'Sum' });
    ticks(B, C);
    add(C, [{ cls: 'mark', html: '1/<i>x</i>', at: () => B.P(1.05, 2.05) }, { cls: 'mark', html: '−1/(<i>x</i> + 3)', at: () => B.P(3.6, -0.55) },
      { cls: 'mark', html: '3/(<i>x</i>(<i>x</i> + 3))', at: () => B.P(3.4, 0.62) }]);
    ups.push(s => {
      const x = M.pfX(s.c);
      setRod(ra, B.P(x - 0.035, 0, 0.08), B.P(x - 0.035, M.pA12(x), 0.08));
      setRod(rb, B.P(x + 0.035, M.pA12(x), 0.09), B.P(x + 0.035, M.f12(x), 0.09));
      putAt(B, dS, x, M.f12(x), 0.1);
    });
  }

  // ================= 6.13 improper: 1/x² settles, 1/x does not =================
  {
    const u = 0.82, C = V(ST.improper, 0, 0);
    const Ba = graphBoard(root, { at: [ST.improper - 4 * u, 1.3, 0], x: [-0.3, 8.6], y: [-0.2, 1.6], unit: u, grid: [0.5, 0.25], ticks: [1, 0.5] });
    const Bb = graphBoard(root, { at: [ST.improper - 4 * u, -3.3, 0], x: [-0.3, 8.6], y: [-0.2, 2.6], unit: u, grid: [0.5, 0.25], ticks: [1, 1] });
    const r1 = region(Ba, root, { pal: 'blue', opacity: 0.28 }), r2 = region(Ba, root, { pal: 'red', opacity: 0.4 });
    r2.position.z = 0.012;
    const c1 = asm('inv1', root, { title: 'y = 1/x', sub: 'area from 1 to b: ln b, without bound' });
    curve(Ba, c1, x => 1 / x, 0.3, 8.6, { pal: 'blue', tone: 'mid' });
    const c2 = asm('inv2', root, { title: 'y = 1/x²', sub: 'area from 1 to b: 1 − 1/b, closing in on 1' });
    curve(Ba, c2, x => 1 / (x * x), 0.3, 8.6, { pal: 'red' });
    const bR = rod(root, { pal: 'ink', r: 0.022, name: 'x = b' });
    const tally = asm('tally', root, { title: 'Area so far, against b', sub: 'one levels off, one keeps climbing' });
    const l1 = liveCurve(Bb, tally, { pal: 'blue', r: 0.035, name: 'ln b' }), l2 = liveCurve(Bb, tally, { pal: 'red', r: 0.035, name: '1 − 1/b' });
    const d1 = dot(tally, { pal: 'blue', r: 0.08 }), d2 = dot(tally, { pal: 'red', r: 0.08 });
    lines(root, [Bb.P(0, 1).x, Bb.P(0, 1).y, 0.01, Bb.P(8.6, 1).x, Bb.P(0, 1).y, 0.01], '#e5484d', 0.6);
    ticks(Ba, C); ticks(Bb, C, { xName: 'b', yName: 'area' });
    add(C, [{ cls: 'mark', html: 'ln <i>b</i>', at: () => Bb.P(8.4, Math.log(8.4) + 0.3) }, { cls: 'mark', html: '1 − 1/<i>b</i>', at: () => Bb.P(8.1, 0.65) },
      { cls: 'mark', html: '<i>b</i>', at: () => Ba.P(bNow, 1.5).add(V(0.25, 0, 0)) }]);
    let bNow = 1;
    ups.push(s => {
      const b = Math.max(M.impB(s.c), 1.01); bNow = b;
      r1.set(() => 0, x => 1 / x, 1, b); r2.set(() => 0, x => 1 / (x * x), 1, b);
      setRod(bR, Ba.P(b, 0, 0.05), Ba.P(b, 1.5, 0.05));
      l1.set(M.area1, 1, b); l2.set(M.area2, 1, b); putAt(Bb, d1, b, M.area1(b)); putAt(Bb, d2, b, M.area2(b));
    });
  }

  // ================= 6.14 one integrand at a time, morphing into the next =================
  {
    const u = 1.2, C = V(ST.pick, 0, 0);
    const B = graphBoard(root, { at: [ST.pick - 1.5 * u, -1.6, 0], x: [-0.3, 3.3], y: [-0.6, 3.1], unit: u, grid: [0.5, 0.5], ticks: [1, 1] });
    const ar = region(B, root, { pal: 'red', opacity: 0.3 });
    const g = asm('integrand', root, { title: 'The integrand', sub: 'read its form, then choose' });
    const lc = liveCurve(B, g, { pal: 'ink', r: 0.04, name: 'Integrand' });
    const wordsTex = M.PICK.map(p => tex.inline(p.tex));
    let now = { i: 0, m: 0 };
    add(C, [{ cls: 'board', html: '', text: () => `${wordsTex[now.i]}&ensp;<span style="font: 14px var(--sans, sans-serif); font-style: normal; color: #86868c">${M.PICK[now.i].how}</span>`, at: () => B.P(0.1, 3.45) }]);
    ups.push(s => {
      now = M.pickAt(s.c);
      const A = M.PICK[now.i].f, Bn = M.PICK[now.j].f, fn = x => A(x) + (Bn(x) - A(x)) * now.m;
      lc.set(fn, 0.001, 3); ar.set(() => 0, fn, M.PK.a, M.PK.b);
    });
  }

  return {
    labels,
    update(s, look) { for (const f of ups) f(s, look); },
  };
}
