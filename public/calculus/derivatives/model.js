// Derivatives model: the functions every page draws and every number it quotes. Pure functions; each scene of the
// figure reads one clock (seconds) through the sweep and shrink helpers below.
const TAU = 2 * Math.PI;

// a smooth back-and-forth between a and b, once every p seconds
export const sweep = (c, a, b, p) => a + (b - a) * (1 - Math.cos(TAU * c / p)) / 2;
// a run that shrinks from h0 toward 0 over `run` seconds (to 1.5% of h0), holds `rest` seconds, and starts again
export const shrink = (c, h0, run, rest = 1.2) => h0 * (0.015 + 0.985 * (1 - Math.min((c % (run + rest)) / run, 1)) ** 2);
// slope of the secant through (a, fn(a)) and (b, fn(b))
export const secant = (fn, a, b) => (fn(b) - fn(a)) / (b - a);
// a smallest fraction p/q (q ≤ 12) equal to x, or null
export function fraction(x) {
  for (let q = 1; q <= 12; q++) { const p = Math.round(x * q); if (Math.abs(p / q - x) < 1e-9) return [p, q]; }
  return null;
}

// ---------- the opener and 2.2: f(x) = x³/3 − x and its derivative, drawn one above the other ----------
export const PAIR = { run: 10, a: -2.1, b: 2.1, at: 2 };
export const g = x => x ** 3 / 3 - x;
export const dg = x => x * x - 1;
export const pairX = c => sweep(c, PAIR.a, PAIR.b, PAIR.run);

// ---------- 2.1 average and instantaneous rate: a cart at s(t) = t² m, at t = 1 s ----------
export const SEC = { a: 1, h0: 1.2, run: 5, hs: [1, 0.5, 0.1, 0.01] };
export const s = t => t * t;
export const ds = t => 2 * t;
export const secH = c => shrink(c, SEC.h0, SEC.run);
export const secSlope = h => secant(s, SEC.a, SEC.a + h);

// ---------- 2.3 estimating from a table: coffee cooling, T(t) = 22 + 68 e^(−t/10) °C, t in minutes ----------
export const COOL = { room: 22, d0: 68, k: 10, ts: [0, 3, 5, 9, 12], at: 7, lo: 5, hi: 9, h0: 5, run: 5 };
export const T = t => COOL.room + COOL.d0 * Math.exp(-t / COOL.k);
export const dT = t => -COOL.d0 / COOL.k * Math.exp(-t / COOL.k);
export const TABLE = COOL.ts.map(t => [t, Math.round(T(t) * 10) / 10]);     // what was measured, to 0.1 °C
export const Tread = t => TABLE.find(r => r[0] === t)[1];
export const ESTIMATE = (Tread(COOL.hi) - Tread(COOL.lo)) / (COOL.hi - COOL.lo);   // −3.40 °C/min
export const coolH = c => shrink(c, COOL.h0, COOL.run);
export const symDiff = (fn, a, h) => (fn(a + h) - fn(a - h)) / (2 * h);

// ---------- 2.4 differentiability: four ways to fail at x = 0 ----------
export const FAILS = [
  { key: 'corner', name: 'corner', f: x => Math.abs(x), tex: '|x|' },
  { key: 'cusp', name: 'cusp', f: x => Math.cbrt(x * x), tex: 'x^{2/3}' },
  { key: 'vert', name: 'vertical tangent', f: x => Math.cbrt(x), tex: 'x^{1/3}' },
  { key: 'jump', name: 'jump', f: x => x < 0 ? x / 2 + 1 : x / 2, tex: '' },
];
export const DIFF = { h0: 1.3, run: 5 };
export const diffH = c => shrink(c, DIFF.h0, DIFF.run);
export const leftSlope = (fn, h) => (fn(-h) - fn(0)) / -h;
export const rightSlope = (fn, h) => (fn(h) - fn(0)) / h;
// the worked example: x² for x ≤ 1, 2x − 1 for x > 1
export const PIECE = { at: 1, left: x => x * x, right: x => 2 * x - 1, dleft: x => 2 * x, dright: () => 2 };

// ---------- 2.5 the power rule: a cube of side x = 2 grown by Δx ----------
export const CUBE = { x: 2, dx0: 0.8, run: 5 };
export const cubeDx = c => shrink(c, CUBE.dx0, CUBE.run);
export const cubeRate = dx => ((CUBE.x + dx) ** 3 - CUBE.x ** 3) / dx;      // ΔV/Δx
export const cubeSlope = 3 * CUBE.x ** 2;                                   // dV/dx = 3x² = 12

// ---------- 2.6 sums and constants: u = x²/2, v = 3 − x, and u + v ----------
export const SUM = { a: -0.5, b: 3.2, run: 9 };
export const u = x => x * x / 2, du = x => x;
export const v = x => 3 - x, dv = () => -1;
export const sumX = c => sweep(c, SUM.a, SUM.b, SUM.run);
export const POLY = { c: [4, -5, 7, -2], at: 1 };                           // 4x³ − 5x² + 7x − 2
export const poly = x => POLY.c.reduce((s, k) => s * x + k, 0);
export const dpoly = x => 3 * POLY.c[0] * x * x + 2 * POLY.c[1] * x + POLY.c[2];

// ---------- 2.7 sin, cos, eˣ, ln x ----------
export const TRIG = { a: -3, b: 3, run: 11, ea: -1.6, eb: 1.15 };
export const sinX = c => sweep(c, TRIG.a, TRIG.b, TRIG.run);
export const expA = c => sweep(c + 2, TRIG.ea, TRIG.eb, 9);
export const MIX = { at: 1, f: x => 3 * Math.sin(x) - 2 * Math.exp(x) + 5 * Math.log(x), df: x => 3 * Math.cos(x) - 2 * Math.exp(x) + 5 / x };

// ---------- 2.8 the product rule: a rectangle of sides f and g at x = 2 ----------
export const PROD = { f: 3, df: 2, g: 2, dg: 1, dx0: 0.5, run: 5 };
export const prodDx = c => shrink(c, PROD.dx0, PROD.run);
export const PROD_RATE = PROD.df * PROD.g + PROD.f * PROD.dg;                // 7
export const prodRate = dx => ((PROD.f + PROD.df * dx) * (PROD.g + PROD.dg * dx) - PROD.f * PROD.g) / dx;

// ---------- 2.9 the quotient rule: q = (3x + 1)/(x² + 1) ----------
export const QUOT = { a: -3.6, b: 3.6, run: 11, at: 1 };
export const q = x => (3 * x + 1) / (x * x + 1);
export const dq = x => (-3 * x * x - 2 * x + 3) / (x * x + 1) ** 2;
export const quotX = c => sweep(c, QUOT.a, QUOT.b, QUOT.run);
export const QPEAK = (-1 + Math.sqrt(10)) / 3, QLOW = (-1 - Math.sqrt(10)) / 3;   // where q′ = 0

// ---------- 2.10 tan x and its slope sec² x ----------
export const TAN = { a: -1.05, b: 1.05, run: 9 };
export const tanX = c => sweep(c, TAN.a, TAN.b, TAN.run);
export const sec2 = x => 1 / Math.cos(x) ** 2;
