// The figure: sheets of graph paper standing in a row, one scene per idea (f with f′ and f″ beneath it, the Mean
// Value Theorem, a closed interval, sign charts, concavity, a function read off its derivative), then two solid
// problems (a fenced field, an open box) and an implicit curve. Each scene sits further along +x.
import * as THREE from 'three';
import { graphBoard, curve, liveCurve, dot, putAt, rod, setRod, setLineThrough, bars, region, V } from '../kit.js';
import { part, box, cyl, lines, shadeMat } from '../engine/parts.js';
import * as M from './model.js';

// where each scene stands (world x of its centre); pages.js aims the camera from these
const FU = 1.15, FS = 0.7, TU = 1.2;   // single f boards: unit and y-squash; two-board scenes: unit
export const SC = { stack: 0, mvt: 22, evt: 40, inc: 58, fdt: 76, cand: 94, conc: 112, sdt: 130, read: 148, fence: 168, box: 192, impl: 214 };

const fmt = v => (v < 0 ? '−' : '') + +Math.abs(v).toFixed(2);

// a kit board whose y is drawn sy times as tall as x (f′ and f″ run larger than f; areas and volumes much larger).
// Everything takes math (x, y); B.labels are its ticks, axis names and a title above the sheet.
function plot(parent, { at, x: [x0, x1], y: [y0, y1], unit = 1, sy = 1, grid = [1, 1], ticks = grid, title, xName = 'x', yName = 'y', xTicks = true }) {
  const B = Object.assign(graphBoard(parent, { at, x: [x0, x1], y: [y0, y1], unit: [unit, unit * sy], grid, ticks }), { sy });
  B.labels = [...B.tickLabels({ xName, yName, xTicks }), ...(title ? [{ cls: 'board', html: title, at: () => B.P(x0, y1).add(V(-0.3, 0.62, 0)) }] : [])];
  return B;
}
// a short tangent of world length about 2L at (x, fn(x))
const tangentAt = (B, m, fn, dfn, x, L = 1.1) => { const s = dfn(x), half = L / B.unit / Math.hypot(1, s * B.sy); setLineThrough(B, m, x, fn(x), s, Math.max(x - half, B.x0), Math.min(x + half, B.x1)); };
// world heights of math y = 0 for boards stacked bottom to top: [{ y: [y0, y1], sy }], a gap between sheets
const column = (unit, gap, ...bs) => { let top = 0; return bs.map(({ y: [y0, y1], sy }, i) => { const at = (i ? top + gap : 0) - y0 * sy * unit; top = at + y1 * sy * unit; return at; }); };
// a vertical guide through a set of boards at math x
const guide = (parent, Bs, x, color = '#c4c4c8') => lines(parent, Bs.flatMap(B => [...B.P(x, B.y0, 0.004).toArray(), ...B.P(x, B.y1, 0.004).toArray()]), color);
const pos = (fn, a, b, B, parent, pal) => { const r = region(B, parent, { pal, opacity: 0.22 }); r.set(() => 0, x => Math.max(fn(x), 0), a, b); return r; };
const neg = (fn, a, b, B, parent, pal) => { const r = region(B, parent, { pal, opacity: 0.22 }); r.set(x => Math.min(fn(x), 0), () => 0, a, b); return r; };

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const mark = (html, at, cls = 'mark') => labels.push({ cls, html, at });

  // ---------- opener and 5.8: f, f′, f″ stacked, one x shared ----------
  const X0 = SC.stack, U = 1.1, [yDD, yD, yF] = column(U, 1.5, { y: [-12, 12], sy: 0.12 }, { y: [-4, 6], sy: 0.3 }, { y: [-1, 6.5], sy: 0.45 });
  const sF = plot(root, { at: [X0 - 2 * U, yF, 0], x: [-0.5, 4.5], y: [-1, 6.5], unit: U, sy: 0.45, grid: [0.5, 1], ticks: [1, 2], title: '<i>y</i> = <i>f</i>(<i>x</i>)' });
  const sD = plot(root, { at: [X0 - 2 * U, yD, 0], x: [-0.5, 4.5], y: [-4, 6], unit: U, sy: 0.3, grid: [0.5, 2], ticks: [1, 2], title: '<i>y</i> = <i>f</i> ′(<i>x</i>)' });
  const sDD = plot(root, { at: [X0 - 2 * U, yDD, 0], x: [-0.5, 4.5], y: [-12, 12], unit: U, sy: 0.12, grid: [0.5, 6], ticks: [1, 6], title: '<i>y</i> = <i>f</i> ″(<i>x</i>)' });
  labels.push(...sF.labels, ...sD.labels, ...sDD.labels);
  const gSF = asm('stackF', root, { title: 'The function f', sub: 'f(x) = x³ − 6x² + 9x + 1' });
  curve(sF, gSF, M.f, -0.5, 4.5, { name: 'Graph of f' });
  for (const [x, y] of [M.MAX, M.MIN]) putAt(sF, dot(gSF, { name: 'Extremum' }), x, y);
  putAt(sF, dot(gSF, { pal: 'blue', name: 'Inflection point' }), ...M.INFL);
  const gSD = asm('stackD', root, { title: 'Its derivative f′', sub: 'f′(x) = 3x² − 12x + 9: the slope of f' });
  curve(sD, gSD, M.df, -0.5, 4.5, { name: 'Graph of f′' });
  for (const x of [M.C1, M.C2]) putAt(sD, dot(gSD, { name: 'Zero of f′' }), x, 0);
  putAt(sD, dot(gSD, { pal: 'blue', name: 'Lowest point of f′' }), M.XI, M.df(M.XI));
  const gSDD = asm('stackDD', root, { title: 'Its second derivative f″', sub: 'f″(x) = 6x − 12: the slope of f′' });
  curve(sDD, gSDD, M.d2f, -0.5, 4.5, { name: 'Graph of f″' });
  putAt(sDD, dot(gSDD, { pal: 'blue', name: 'Zero of f″' }), M.XI, 0);
  for (const x of [M.C1, M.XI, M.C2]) guide(root, [sF, sD, sDD], x);
  const gSN = asm('stackNow', root, { title: 'One x, three heights', sub: 'the slope of each graph is the height of the next' });
  const sTan = rod(gSN, { name: 'Tangent to f' }), sTan2 = rod(gSN, { name: 'Tangent to f′', pal: 'blue' });
  const sDots = [sF, sD, sDD].map(() => dot(gSN, { pal: 'red', name: 'Now' }));
  const sNow = lines(gSN, [0, 0, 0, 0, 1, 0], '#e5484d');
  sNow.geometry.attributes.position.setUsage(THREE.DynamicDrawUsage);

  // ---------- 5.1 the Mean Value Theorem ----------
  const X1 = SC.mvt;
  const mB = plot(root, { at: [X1 - 2 * FU, FU * FS, 0], x: [-0.5, 4.5], y: [-1, 6.5], unit: FU, sy: FS, grid: [0.5, 0.5], ticks: [1, 1] });
  labels.push(...mB.labels);
  const gMF = asm('mvtF', root, { title: 'f on [0, 4]', sub: 'continuous on [0, 4], differentiable on (0, 4)' });
  curve(mB, gMF, M.f, -0.5, 4.5, { name: 'Graph of f' });
  const gMS = asm('secant', root, { title: 'The secant', sub: `from (0, ${M.f(0)}) to (4, ${M.f(4)}): slope ${M.MS}` });
  setRod(rod(gMS, { pal: 'blue', name: 'Secant', r: 0.03 }), mB.P(M.MA, M.f(M.MA), 0.05), mB.P(M.MB, M.f(M.MB), 0.05));
  for (const x of [M.MA, M.MB]) putAt(mB, dot(gMS, { pal: 'blue', name: 'Endpoint' }), x, M.f(x));
  const gMC = asm('mvtC', root, { title: 'The two values of c', sub: 'where the tangent is parallel to the secant' });
  for (const c of M.MC) { putAt(mB, dot(gMC, { name: 'c' }), c, M.f(c)); const m = rod(gMC, { pal: 'blue', r: 0.018, name: 'Parallel tangent' }); tangentAt(mB, m, M.f, M.df, c, 1.0); }
  const gMR = asm('rolle', root, { title: 'Rolle’s theorem', sub: 'f(0) = f(3) = 1, so f′(c) = 0 somewhere between' });
  setRod(rod(gMR, { pal: 'dark', r: 0.018, name: 'Level chord' }), mB.P(M.RA, M.f(M.RA), 0.05), mB.P(M.RB, M.f(M.RB), 0.05));
  { const m = rod(gMR, { pal: 'dark', r: 0.018, name: 'Flat tangent' }); tangentAt(mB, m, M.f, M.df, M.C1, 0.8); }
  const gMT = asm('mvtTan', root, { title: 'A sliding tangent', sub: 'its slope is f′(x)' });
  const mTan = rod(gMT, { name: 'Tangent' }), mDot = dot(gMT, { pal: 'red', name: 'Point' });
  M.MC.forEach((c, i) => mark(`<i>c</i><sub>${i + 1}</sub>`, () => mB.P(c, M.f(c)).add(V(0.05, i ? -0.42 : 0.42, 0))));

  // ---------- 5.2 a closed interval: the Extreme Value Theorem ----------
  const X2 = SC.evt;
  const eB = plot(root, { at: [X2 - 2 * FU, FU * FS, 0], x: [-0.5, 4.5], y: [-1, 6.5], unit: FU, sy: FS, grid: [0.5, 0.5], ticks: [1, 1] });
  labels.push(...eB.labels);
  const gEI = asm('interval', root, { title: 'The closed interval', sub: `[${M.EA}, ${M.EB}], endpoints included` });
  region(eB, gEI, { pal: 'blue', opacity: 0.1 }).set(() => eB.y0, () => eB.y1, M.EA, M.EB);
  curve(eB, gEI, M.f, M.EA, M.EB, { name: 'f on the interval', r: 0.045 });
  for (const x of [M.EA, M.EB]) putAt(eB, dot(gEI, { name: 'Endpoint' }), x, M.f(x));
  const gEO = asm('outside', root, { title: 'Outside the interval', sub: 'f keeps going: no absolute max on all reals' });
  curve(eB, gEO, M.f, -0.5, M.EA, { pal: 'dark', tone: 'lo', r: 0.022, name: 'f outside' });
  curve(eB, gEO, M.f, M.EB, 4.5, { pal: 'dark', tone: 'lo', r: 0.022, name: 'f outside' });
  const gEC = asm('crit', root, { title: 'Critical points', sub: 'f′(x) = 0 at x = 1 and x = 3' });
  for (const x of [M.C1, M.C2]) { putAt(eB, dot(gEC, { pal: 'red', name: 'Critical point' }), x, M.f(x)); tangentAt(eB, rod(gEC, { pal: 'red', r: 0.02, name: 'Flat tangent' }), M.f, M.df, x, 0.7); }
  const gEL = asm('level', root, { title: 'A falling level line', sub: 'the first height it touches is the max; the last, the min' });
  const eLvl = rod(gEL, { pal: 'blue', r: 0.022, name: 'Level line' });
  mark('absolute max', () => eB.P(M.C1, M.f(M.C1)).add(V(0, 0.45, 0)));
  mark('absolute min', () => eB.P(M.C2, M.f(M.C2)).add(V(0, -0.45, 0)));

  // ---------- 5.3 increasing and decreasing: f over f′ ----------
  const X3 = SC.inc;
  const [yID, yIF] = column(TU, 1.6, { y: [-4, 6], sy: 0.3 }, { y: [-1, 6.5], sy: 0.5 });
  const iF = plot(root, { at: [X3 - 2 * TU, yIF, 0], x: [-0.5, 4.5], y: [-1, 6.5], unit: TU, sy: 0.5, grid: [0.5, 1], ticks: [1, 2], title: '<i>y</i> = <i>f</i>(<i>x</i>)' });
  const iD = plot(root, { at: [X3 - 2 * TU, yID, 0], x: [-0.5, 4.5], y: [-4, 6], unit: TU, sy: 0.3, grid: [0.5, 2], ticks: [1, 2], title: '<i>y</i> = <i>f</i> ′(<i>x</i>)' });
  labels.push(...iF.labels, ...iD.labels);
  const gIU = asm('incr', root, { title: 'Increasing', sub: 'f′ > 0 on (−∞, 1) and (3, ∞)' });
  curve(iF, gIU, M.f, -0.5, M.C1, { pal: 'blue', name: 'f rising' }); curve(iF, gIU, M.f, M.C2, 4.5, { pal: 'blue', name: 'f rising' });
  pos(M.df, -0.5, 4.5, iD, gIU, 'blue');
  const gID = asm('decr', root, { title: 'Decreasing', sub: 'f′ < 0 on (1, 3)' });
  curve(iF, gID, M.f, M.C1, M.C2, { pal: 'red', name: 'f falling' });
  neg(M.df, -0.5, 4.5, iD, gID, 'red');
  const gIDf = asm('incD', root, { title: 'The derivative f′', sub: 'f′(x) = 3(x − 1)(x − 3)' });
  curve(iD, gIDf, M.df, -0.5, 4.5, { name: 'Graph of f′' });
  for (const x of [M.C1, M.C2]) { guide(root, [iF, iD], x); putAt(iD, dot(gIDf, { name: 'Zero of f′' }), x, 0); }
  const gIN = asm('incNow', root, { title: 'Slope and sign', sub: 'the tangent’s slope is the height of f′' });
  const iTan = rod(gIN, { name: 'Tangent' }), iDot = dot(gIN, { pal: 'red', name: 'On f' }), iDot2 = dot(gIN, { pal: 'red', name: 'On f′' });
  [[0.25, '+'], [2, '−'], [3.85, '+']].forEach(([x, s]) => mark(s, () => iD.P(x, s === '+' ? 2.6 : -2.6), 'vec' + (s === '+' ? ' blue' : ' red')));

  // ---------- 5.4 the first derivative test: g over g′ ----------
  const X4 = SC.fdt;
  const [yGD, yGG] = column(1.1, 1.6, { y: [-3, 3], sy: 0.55 }, { y: [-3.5, 2.5], sy: 0.65 });
  const fG = plot(root, { at: [X4 - 1.6 * 1.1, yGG, 0], x: [-1.25, 4.5], y: [-3.5, 2.5], unit: 1.1, sy: 0.65, grid: [0.5, 0.5], ticks: [1, 1], title: '<i>y</i> = <i>g</i>(<i>x</i>)' });
  const fD = plot(root, { at: [X4 - 1.6 * 1.1, yGD, 0], x: [-1.25, 4.5], y: [-3, 3], unit: 1.1, sy: 0.55, grid: [0.5, 1], ticks: [1, 1], title: '<i>y</i> = <i>g</i> ′(<i>x</i>)' });
  labels.push(...fG.labels, ...fD.labels);
  const gFG = asm('fdtG', root, { title: 'The function g', sub: 'g(x) = (x⁴ − 4x³)/9' });
  curve(fG, gFG, M.g, -1.25, M.G3, { pal: 'red', name: 'g falling' }); curve(fG, gFG, M.g, M.G3, 4.5, { pal: 'blue', name: 'g rising' });
  const gFD = asm('fdtD', root, { title: 'Its derivative g′', sub: 'g′(x) = 4x²(x − 3)/9' });
  curve(fD, gFD, M.dg, -1.25, 4.5, { name: 'Graph of g′' });
  neg(M.dg, -1.25, 4.5, fD, gFD, 'red'); pos(M.dg, -1.25, 4.5, fD, gFD, 'blue');
  const gF0 = asm('shelf', root, { title: 'x = 0: no sign change', sub: 'g′ touches zero and stays negative: not an extremum' });
  putAt(fG, dot(gF0, { name: 'Flat, still falling' }), M.G0, M.g(M.G0)); putAt(fD, dot(gF0, { name: 'Touches zero' }), M.G0, 0);
  tangentAt(fG, rod(gF0, { pal: 'dark', r: 0.02, name: 'Flat tangent' }), M.g, M.dg, M.G0, 0.7);
  const gF3 = asm('fdtMin', root, { title: 'x = 3: − to +', sub: 'g′ changes from negative to positive: a relative minimum' });
  putAt(fG, dot(gF3, { name: 'Relative minimum' }), M.G3, M.g(M.G3)); putAt(fD, dot(gF3, { name: 'Crosses zero' }), M.G3, 0);
  tangentAt(fG, rod(gF3, { pal: 'dark', r: 0.02, name: 'Flat tangent' }), M.g, M.dg, M.G3, 0.7);
  for (const x of [M.G0, M.G3]) guide(root, [fG, fD], x);
  const gFN = asm('fdtNow', root, { title: 'Slope and sign', sub: 'the tangent’s slope is the height of g′' });
  const fTan = rod(gFN, { name: 'Tangent' }), fDot = dot(gFN, { pal: 'red', name: 'On g' }), fDot2 = dot(gFN, { pal: 'red', name: 'On g′' });
  [[-0.65, '−'], [1.5, '−'], [3.9, '+']].forEach(([x, s]) => mark(s, () => fD.P(x, s === '+' ? 2.2 : -2.4), 'vec' + (s === '+' ? ' blue' : ' red')));
  mark('relative min', () => fG.P(M.G3, M.g(M.G3)).add(V(0, -0.42, 0)));
  mark('not an extremum', () => fG.P(M.G0, M.g(M.G0)).add(V(0.4, 0.55, 0)));

  // ---------- 5.5 the candidates test on [0, π] ----------
  const X5 = SC.cand;
  const cB = plot(root, { at: [X5 - 1.9, 0, 0], x: [-0.3, 3.6], y: [-1.2, 3.6], unit: 1.2, grid: [0.25, 0.25], ticks: [1, 1] });
  labels.push(...cB.labels);
  const gCH = asm('candH', root, { title: 'h on [0, π]', sub: 'h(x) = x − 2 sin x' });
  curve(cB, gCH, M.h, M.HA, M.HB, { name: 'Graph of h', r: 0.04 });
  curve(cB, gCH, M.h, -0.3, M.HA, { pal: 'dark', tone: 'lo', r: 0.02, name: 'Outside' }); curve(cB, gCH, M.h, M.HB, 3.6, { pal: 'dark', tone: 'lo', r: 0.02, name: 'Outside' });
  const gCC = asm('candidates', root, { title: 'The candidates', sub: 'both endpoints and the critical point π/3' });
  bars(cB, gCC, 3, { pal: 'blue', depth: 0.1, opacity: 0.6 }).set(M.HCAND.map(([x, y]) => [x - 0.07, x + 0.07, y]));
  M.HCAND.forEach(([x, y]) => putAt(cB, dot(gCC, { name: 'Candidate' }), x, y));
  const gCN = asm('candNow', root, { title: 'A sliding tangent', sub: 'h′(x) = 1 − 2 cos x' });
  const cTan = rod(gCN, { name: 'Tangent' }), cDot = dot(gCN, { pal: 'red', name: 'Point' });
  mark('absolute max', () => cB.P(M.HB, M.h(M.HB)).add(V(-0.1, 0.42, 0)));
  mark('absolute min', () => cB.P(M.HC, M.h(M.HC)).add(V(0.0, -0.42, 0)));
  mark('π/3', () => cB.P(M.HC, 0).add(V(0, 0.28, 0)));
  mark('π', () => cB.P(M.HB, 0).add(V(0.3, -0.25, 0)));

  // ---------- 5.6 concavity: f over f″ ----------
  const X6 = SC.conc;
  const [yKD, yKF] = column(TU, 1.6, { y: [-12, 12], sy: 0.13 }, { y: [-1, 6.5], sy: 0.5 });
  const kF = plot(root, { at: [X6 - 2 * TU, yKF, 0], x: [-0.5, 4.5], y: [-1, 6.5], unit: TU, sy: 0.5, grid: [0.5, 1], ticks: [1, 2], title: '<i>y</i> = <i>f</i>(<i>x</i>)' });
  const kD = plot(root, { at: [X6 - 2 * TU, yKD, 0], x: [-0.5, 4.5], y: [-12, 12], unit: TU, sy: 0.13, grid: [0.5, 3], ticks: [1, 6], title: '<i>y</i> = <i>f</i> ″(<i>x</i>)' });
  labels.push(...kF.labels, ...kD.labels);
  const gKF = asm('concF', root, { title: 'The function f', sub: 'concave down, then concave up' });
  curve(kF, gKF, M.f, -0.5, M.XI, { pal: 'red', name: 'Concave down' }); curve(kF, gKF, M.f, M.XI, 4.5, { pal: 'blue', name: 'Concave up' });
  const gKI = asm('inflect', root, { title: 'The inflection point', sub: `(${M.INFL[0]}, ${M.INFL[1]}): f″ changes sign` });
  putAt(kF, dot(gKI, { name: 'Inflection point' }), ...M.INFL); putAt(kD, dot(gKI, { name: 'Zero of f″' }), M.XI, 0);
  guide(root, [kF, kD], M.XI);
  const gKD = asm('concD', root, { title: 'The second derivative f″', sub: 'f″(x) = 6x − 12' });
  curve(kD, gKD, M.d2f, -0.5, 4.5, { name: 'Graph of f″' });
  neg(M.d2f, -0.5, 4.5, kD, gKD, 'red'); pos(M.d2f, -0.5, 4.5, kD, gKD, 'blue');
  const gKN = asm('concNow', root, { title: 'Tangent and gap', sub: 'concave up: the curve lies above its tangents' });
  const kTan = rod(gKN, { name: 'Tangent' }), kDot = dot(gKN, { pal: 'red', name: 'On f' }), kDot2 = dot(gKN, { pal: 'red', name: 'On f″' });
  const kUp = region(kF, gKN, { pal: 'blue', opacity: 0.3 }), kDn = region(kF, gKN, { pal: 'red', opacity: 0.3 });
  mark('concave down', () => kF.P(1.15, -0.55)); mark('concave up', () => kF.P(2.85, 5.9));

  // ---------- 5.7 the second derivative test ----------
  const X7 = SC.sdt;
  const dB = plot(root, { at: [X7 - 2 * FU, FU * FS, 0], x: [-0.5, 4.5], y: [-1, 6.5], unit: FU, sy: FS, grid: [0.5, 0.5], ticks: [1, 1] });
  labels.push(...dB.labels);
  const gDF = asm('sdtF', root, { title: 'The function f', sub: 'critical points at x = 1 and x = 3' });
  curve(dB, gDF, M.f, -0.5, 4.5, { name: 'Graph of f' });
  const cap = c => x => M.f(c) + M.d2f(c) * (x - c) ** 2 / 2;
  const gDX = asm('sdtCrit', root, { title: 'Cap and cup', sub: 'f″(1) = −6 < 0: max · f″(3) = 6 > 0: min' });
  for (const c of [M.C1, M.C2]) { putAt(dB, dot(gDX, { name: 'Critical point' }), c, M.f(c)); curve(dB, gDX, cap(c), c - 0.75, c + 0.75, { pal: 'dark', r: 0.022, name: c === M.C1 ? 'Cap: f″ < 0' : 'Cup: f″ > 0' }); }
  const gDN = asm('sdtNow', root, { title: 'The bending parabola', sub: 'the parabola that matches f, f′ and f″ here' });
  const dPar = liveCurve(dB, gDN, { name: 'Matching parabola', pal: 'red' }), dDot = dot(gDN, { pal: 'red', name: 'Point' });
  mark('relative max', () => dB.P(M.C1, M.f(M.C1)).add(V(0, 0.5, 0)));
  mark('relative min', () => dB.P(M.C2, M.f(M.C2)).add(V(0, -0.5, 0)));

  // ---------- 5.9 reading p from the graph of p′ ----------
  const X9 = SC.read;
  const [yRD, yRF] = column(1.15, 1.6, { y: [-3, 3], sy: 0.5 }, { y: [-0.5, 3.5], sy: 0.9 });
  const rF = plot(root, { at: [X9 - 1.9 * 1.15, yRF, 0], x: [M.PX0, M.PX1], y: [-0.5, 3.5], unit: 1.15, sy: 0.9, grid: [0.5, 0.5], ticks: [1, 1], title: '<i>y</i> = <i>p</i>(<i>x</i>), with <i>p</i>(0) = 1' });
  const rD = plot(root, { at: [X9 - 1.9 * 1.15, yRD, 0], x: [M.PX0, M.PX1], y: [-3, 3], unit: 1.15, sy: 0.5, grid: [0.5, 1], ticks: [1, 1], title: 'given: <i>y</i> = <i>p</i> ′(<i>x</i>)' });
  labels.push(...rF.labels, ...rD.labels);
  const gRD = asm('readD', root, { title: 'The graph of p′', sub: 'all we are given, with p(0) = 1' });
  curve(rD, gRD, M.dp, M.PX0, M.PX1, { name: 'Graph of p′' });
  neg(M.dp, M.PX0, M.PX1, rD, gRD, 'red'); pos(M.dp, M.PX0, M.PX1, rD, gRD, 'blue');
  const gRF = asm('readF', root, { title: 'p, traced from its slope', sub: 'rising where p′ > 0, bending up where p′ rises' });
  curve(rF, gRF, M.p, M.PX0, M.PX1, { pal: 'base', tone: 'faint', r: 0.02, name: 'Graph of p' });
  const rTrace = liveCurve(rF, gRF, { pal: 'ink', r: 0.035, name: 'Graph of p' });
  const gRK = asm('readKey', root, { title: 'Where p′ turns', sub: 'p′ has a max at 1 and a min at 3: p has inflection points' });
  for (const x of [1, 3]) { putAt(rF, dot(gRK, { pal: 'blue', name: 'Inflection point' }), x, M.p(x)); putAt(rD, dot(gRK, { pal: 'blue', name: 'Turning point of p′' }), x, M.dp(x)); }
  putAt(rF, dot(gRK, { name: 'Relative minimum' }), 0, M.p(0)); putAt(rD, dot(gRK, { name: 'Zero crossing' }), 0, 0);
  for (const x of [0, 1, 3]) guide(root, [rF, rD], x);
  const gRN = asm('readNow', root, { title: 'Height becomes slope', sub: 'the height of p′ is the slope of p' });
  const rTan = rod(gRN, { name: 'Tangent' }), rDot = dot(gRN, { pal: 'red', name: 'On p' }), rDot2 = dot(gRN, { pal: 'red', name: 'On p′' });
  mark('relative min', () => rF.P(0, M.p(0)).add(V(0, -0.4, 0)));

  // ---------- 5.10 a fenced field along a river ----------
  const X10 = SC.fence, S10 = 1 / 12;    // 1 world unit = 12 m
  const gFR = asm('river', root, { title: 'The river', sub: 'the fourth side needs no fence' });
  part(gFR, box(10, 0.03, 0.9, 0.01), { pal: 'blue', tone: 'lo', pos: [X10, 0.015, -0.7], name: 'River' });
  const gFF = asm('field', root, { title: 'The field', sub: 'A = x(120 − 2x)' });
  const fieldM = part(gFF, new THREE.BoxGeometry(1, 1, 1), { pal: 'blue', mat: shadeMat('blue', { opacity: 0.25 }), tone: 'faint', name: 'Field' });
  const gFE = asm('fence', root, { title: 'The fence', sub: `${M.FENCE} m in all, on three sides` });
  const rails = [0, 1, 2].map(() => part(gFE, new THREE.BoxGeometry(1, 1, 1), { pal: 'paper', tone: 'hi', name: 'Fence' }));
  const posts = [0, 1, 2, 3].map(() => part(gFE, cyl(0.05, 0.42, 14), { pal: 'ink', tone: 'hi', name: 'Post' }));
  const aB = plot(root, { at: [X10 - 2.4, 0.9, -2.6], x: [0, 60], y: [0, 2000], unit: 0.08, sy: 0.0275, grid: [5, 250], ticks: [10, 500], yName: '<i>A</i> (m²)', title: 'area <i>A</i>(<i>x</i>)' });
  labels.push(...aB.labels);
  const gFA = asm('areaGraph', root, { title: 'Area against x', sub: 'zero at both ends, largest between' });
  curve(aB, gFA, M.area, 0, 60, { name: 'A(x)', r: 0.03 });
  putAt(aB, dot(gFA, { name: 'Maximum' }), M.FX, M.FAREA);
  const aDot = dot(gFA, { pal: 'red', name: 'Now' }), aTan = rod(gFA, { name: 'Tangent' });
  const fz = -0.25;   // the river bank
  labels.push({ cls: 'vec', html: '<i>x</i>', at: () => fenceAt.side }, { cls: 'vec', html: '120 − 2<i>x</i>', at: () => fenceAt.front });
  const fenceAt = { side: V(), front: V() };

  // ---------- 5.11 an open box from a square sheet ----------
  const X11 = SC.box, S11 = 1 / 6;     // 1 world unit = 6 cm
  const Z11 = 0.6, half = M.SHEET * S11 / 2;
  const gBS = asm('sheet', root, { title: 'The sheet', sub: `${M.SHEET} cm square; a square of side x cut from each corner` });
  lines(gBS, [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]].flatMap(([a, b, c, d]) => [X11 + a * half, 0.004, Z11 + b * half, X11 + c * half, 0.004, Z11 + d * half]), '#8a8a8f');
  const cuts = [0, 1, 2, 3].map(() => part(gBS, new THREE.BoxGeometry(1, 1, 1), { pal: 'red', mat: shadeMat('red', { opacity: 0.35 }), tone: 'faint', name: 'Cut square' }));
  const gBB = asm('box', root, { title: 'The box', sub: 'V = x(30 − 2x)²' });
  const base = part(gBB, new THREE.BoxGeometry(1, 1, 1), { pal: 'paper', tone: 'hi', name: 'Base' });
  const walls = [0, 1, 2, 3].map(() => part(gBB, new THREE.BoxGeometry(1, 1, 1), { pal: 'paper', tone: 'hi', name: 'Side' }));
  const vB = plot(root, { at: [X11 - 2.5, 2.6, -3.2], x: [0, 15], y: [0, 2200], unit: 0.33, sy: 0.0055, grid: [1, 250], ticks: [3, 500], yName: '<i>V</i> (cm³)', title: 'volume <i>V</i>(<i>x</i>)' });
  labels.push(...vB.labels);
  const gBV = asm('volGraph', root, { title: 'Volume against x', sub: 'zero at x = 0 and x = 15' });
  curve(vB, gBV, M.vol, 0, 15, { name: 'V(x)', r: 0.03 });
  putAt(vB, dot(gBV, { name: 'Maximum' }), M.BX, M.BVOL);
  const vDot = dot(gBV, { pal: 'red', name: 'Now' }), vTan = rod(gBV, { name: 'Tangent' });
  const boxAt = { h: V(), w: V() };
  labels.push({ cls: 'vec', html: '<i>x</i>', at: () => boxAt.h }, { cls: 'vec', html: '30 − 2<i>x</i>', at: () => boxAt.w });

  // ---------- 5.12 an implicit curve ----------
  const X12 = SC.impl;
  const pB = plot(root, { at: [X12, 0, 0], x: [-3, 3], y: [-3, 3], grid: [0.5, 0.5], ticks: [1, 1] });
  labels.push(...pB.labels);
  const gPC = asm('implC', root, { title: 'The curve', sub: 'x² − xy + y² = 3' });
  { const pts = Array.from({ length: 240 }, (_, i) => pB.P(...M.ICURVE(i / 240 * 2 * Math.PI), 0.03));
    part(gPC, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), 480, 0.035, 16), { pal: 'ink', tone: 'hi', name: 'Curve' }); }
  const gPH = asm('implH', root, { title: 'Horizontal tangents', sub: 'dy/dx = 0 where y = 2x: (1, 2) and (−1, −2)' });
  setRod(rod(gPH, { pal: 'dark', r: 0.015, name: 'y = 2x' }), pB.P(-1.5, -3, 0.02), pB.P(1.5, 3, 0.02));
  for (const [x, y] of [M.HTOP, M.HBOT]) { putAt(pB, dot(gPH, { pal: 'blue', name: 'Horizontal tangent' }), x, y); setRod(rod(gPH, { pal: 'blue', r: 0.022, name: 'Tangent' }), pB.P(x - 0.7, y, 0.05), pB.P(x + 0.7, y, 0.05)); }
  const gPV = asm('implV', root, { title: 'Vertical tangents', sub: 'dy/dx undefined where x = 2y: (2, 1) and (−2, −1)' });
  setRod(rod(gPV, { pal: 'dark', r: 0.015, name: 'x = 2y' }), pB.P(-3, -1.5, 0.02), pB.P(3, 1.5, 0.02));
  for (const [x, y] of [M.VR, M.VL]) { putAt(pB, dot(gPV, { pal: 'red', name: 'Vertical tangent' }), x, y); setRod(rod(gPV, { pal: 'red', r: 0.022, name: 'Tangent' }), pB.P(x, y - 0.7, 0.05), pB.P(x, y + 0.7, 0.05)); }
  const gPN = asm('implNow', root, { title: 'A point going round', sub: 'its tangent has slope (y − 2x)/(2y − x)' });
  const pTan = rod(gPN, { name: 'Tangent' }), pDot = dot(gPN, { pal: 'red', name: 'Point' });
  mark('<i>y</i> = 2<i>x</i>', () => pB.P(1.5, 3).add(V(0.35, -0.2, 0))); mark('<i>x</i> = 2<i>y</i>', () => pB.P(3, 1.5).add(V(-0.1, 0.3, 0)));
  mark('(1, 2)', () => pB.P(1, 2).add(V(-0.45, 0.3, 0))); mark('(2, 1)', () => pB.P(2, 1).add(V(0.45, 0, 0)));

  // ---------- per frame ----------
  const setLine = (l, pts) => { const a = l.geometry.attributes.position; pts.forEach((q, i) => a.setXYZ(i, q.x, q.y, q.z)); a.needsUpdate = true; l.geometry.computeBoundingSphere(); };
  const place = (m, x, y, z, sx, sy, sz) => { m.position.set(x, y, z); m.scale.set(sx, sy, sz); };
  function update(s) {
    const c = s.c;
    // stack
    { const x = M.stackX(c);
      putAt(sF, sDots[0], x, M.f(x)); putAt(sD, sDots[1], x, M.df(x)); putAt(sDD, sDots[2], x, M.d2f(x));
      tangentAt(sF, sTan, M.f, M.df, x, 0.9); tangentAt(sD, sTan2, M.df, M.d2f, x, 0.7);
      sDots[1].visible = sTan2.visible = M.df(x) <= sD.y1;
      setLine(sNow, [sF.P(x, M.f(x), 0.01), sDD.P(x, Math.max(Math.min(M.d2f(x), 12), -12), 0.01)]); }
    // mvt
    { const x = M.mvtX(c); putAt(mB, mDot, x, M.f(x)); tangentAt(mB, mTan, M.f, M.df, x, 1.3); }
    // evt
    { const y = M.evtY(c); setRod(eLvl, eB.P(M.EA, y, 0.06), eB.P(M.EB, y, 0.06)); }
    // inc
    { const x = M.incX(c); putAt(iF, iDot, x, M.f(x)); putAt(iD, iDot2, x, M.df(x)); tangentAt(iF, iTan, M.f, M.df, x, 0.9); iDot2.visible = M.df(x) <= iD.y1; }
    // fdt
    { const x = M.fdtX(c); putAt(fG, fDot, x, M.g(x)); putAt(fD, fDot2, x, M.dg(x)); tangentAt(fG, fTan, M.g, M.dg, x, 0.9); fDot2.visible = M.dg(x) <= fD.y1; }
    // cand
    { const x = M.candX(c); putAt(cB, cDot, x, M.h(x)); tangentAt(cB, cTan, M.h, M.dh, x, 1.0); }
    // conc
    { const x = M.concX(c), y = M.f(x), s1 = M.df(x), L = u => y + s1 * (u - x), a = Math.max(x - 0.8, -0.5), b = Math.min(x + 0.8, 4.5);
      putAt(kF, kDot, x, y); putAt(kD, kDot2, x, M.d2f(x)); setLineThrough(kF, kTan, x, y, s1, a, b);
      const up = M.d2f(x) > 0; kUp.visible = up; kDn.visible = !up;
      (up ? kUp : kDn).set(u => Math.min(M.f(u), L(u)), u => Math.max(M.f(u), L(u)), a, b); kUp.visible = up; kDn.visible = !up; }
    // sdt
    { const x = M.sdtX(c), q = u => M.f(x) + M.df(x) * (u - x) + M.d2f(x) * (u - x) ** 2 / 2;
      let w = 1.1; while (w > 0.2 && [-1, -0.5, 0.5, 1].some(k => q(x + k * w) < dB.y0 || q(x + k * w) > dB.y1)) w -= 0.05;
      putAt(dB, dDot, x, M.f(x)); dPar.set(q, x - w, x + w); }
    // read
    { const x = M.readX(c);
      rTrace.set(M.p, M.PX0, Math.max(x, M.PX0 + 1e-3)); putAt(rF, rDot, x, M.p(x)); putAt(rD, rDot2, x, M.dp(x)); tangentAt(rF, rTan, M.p, M.dp, x, 0.8); }
    // fence
    { const x = M.fenceX(c), d = x * S10, w = (M.FENCE - 2 * x) * S10, z1 = fz + d, xl = X10 - w / 2, xr = X10 + w / 2, H = 0.06, Y = 0.26;
      place(fieldM, X10, 0.01, fz + d / 2, w, 0.02, d);
      place(rails[0], xl, Y, fz + d / 2, H, 0.05, d); place(rails[1], xr, Y, fz + d / 2, H, 0.05, d); place(rails[2], X10, Y, z1, w, 0.05, H);
      [[xl, fz], [xr, fz], [xl, z1], [xr, z1]].forEach(([px, pz], i) => posts[i].position.set(px, 0.21, pz));
      fenceAt.side.set(xl - 0.25, 0.35, fz + d / 2); fenceAt.front.set(X10, 0.55, z1 + 0.1);
      putAt(aB, aDot, x, M.area(x)); tangentAt(aB, aTan, M.area, M.darea, x, 0.8); }
    // box
    { const x = M.boxX(c), b = (M.SHEET - 2 * x) * S11, hh = x * S11, t = 0.04;
      place(base, X11, t / 2, Z11, b, t, b);
      place(walls[0], X11, hh / 2, Z11 + b / 2 - t / 2, b, hh, t); place(walls[1], X11, hh / 2, Z11 - b / 2 + t / 2, b, hh, t);
      place(walls[2], X11 + b / 2 - t / 2, hh / 2, Z11, t, hh, b); place(walls[3], X11 - b / 2 + t / 2, hh / 2, Z11, t, hh, b);
      [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz], i) => place(cuts[i], X11 + sx * (half - hh / 2), 0.006, Z11 + sz * (half - hh / 2), hh, 0.008, hh));
      boxAt.h.set(X11 - b / 2 - 0.25, hh / 2, Z11 + b / 2); boxAt.w.set(X11, -0.05, Z11 + b / 2 + 0.35);
      putAt(vB, vDot, x, M.vol(x)); tangentAt(vB, vTan, M.vol, M.dvol, x, 0.8); }
    // impl
    { const th = M.implTh(c), [x, y] = M.ICURVE(th), dx = 2 * y - x, dy = -(2 * x - y), n = Math.hypot(dx, dy), L = 0.9;
      putAt(pB, pDot, x, y); setRod(pTan, pB.P(x - L * dx / n, y - L * dy / n, 0.05), pB.P(x + L * dx / n, y + L * dy / n, 0.05)); }
  }
  return { labels, update };
}
