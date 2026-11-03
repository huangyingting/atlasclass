// Series model: every series, sum, bound and polynomial the chapter shows. Every number on the page comes from here.
// The figure's clock counts terms: each scene adds one term every `per` seconds up to `max`, holds, and starts over.

export const sum = (a, n1, n0 = 1) => { let s = 0; for (let n = n0; n <= n1; n++) s += a(n); return s; };
export const fact = n => { let p = 1; for (let k = 2; k <= n; k++) p *= k; return p; };

// ---------- the clock: how many terms each scene shows now ----------
export const STEP = {
  tower: { max: 12, per: 0.75, hold: 2.6 },
  tele: { max: 20, per: 0.42, hold: 2.4 },
  nth: { max: 16, per: 0.5, hold: 2.4 },
  integral: { max: 10, per: 0.55, hold: 2.4 },
  pser: { max: 40, per: 0.2, hold: 2.4 },
  cmp: { max: 10, per: 0.6, hold: 2.4 },
  alt: { max: 12, per: 0.75, hold: 2.4 },
  ratio: { max: 13, per: 0.55, hold: 2.4 },
  abs: { max: 30, per: 0.26, hold: 2.4 },
  taylor: { max: 6, per: 1.1, hold: 1.6 },
  lagrange: { max: 40, per: 0.1, hold: 2.0 },
  interval: { max: 30, per: 0.32, hold: 2.0 },
  maclaurin: { max: 9, per: 0.9, hold: 1.6 },
  atan: { max: 12, per: 0.6, hold: 1.8 },
};
// { n: whole terms shown (1…max), f: 0→1 as the newest arrives }
export function count(s, key) {
  const { max, per, hold } = STEP[key];
  if (s.still) return { n: max, f: 1 };
  const c = s.t % (max * per + hold), k = Math.min(Math.floor(c / per), max - 1);
  return { n: k + 1, f: Math.min((c - k * per) / (per * 0.6), 1) };
}

// ---------- 10.1 · partial sums: a telescoping series ----------
export const tele = n => 1 / (n * (n + 1));          // = 1/n − 1/(n + 1)
export const teleS = N => 1 - 1 / (N + 1);           // the partial sum, after the middle cancels
export const TELE_SUM = 1;

// ---------- 10.2 · geometric: Σ (n = 0 → ∞) a rⁿ, and the tower drawn from it ----------
export const GA = 3, GR = 2 / 3, GSUM = +(GA / (1 - GR)).toFixed(9);   // 9
export const geo = n => GA * GR ** n;                     // n = 0, 1, 2, …
export const geoS = N => GA * (1 - GR ** N) / (1 - GR);   // the first N terms
export const GSUM1 = +(GA * GR / (1 - GR)).toFixed(9);    // the same series from n = 1: 6

// ---------- 10.3 · nth term test ----------
export const nth = n => n / (2 * n + 1), NTH_L = 0.5;

// ---------- 10.4 · integral test: Σ 1/(n² + 1) ----------
export const itf = x => 1 / (x * x + 1);
export const IT_INT = Math.PI / 4;                                   // ∫ from 1 to ∞ = π/2 − π/4
export const IT_SUM = (Math.PI / Math.tanh(Math.PI) - 1) / 2;        // the exact sum, 1.0767
export const IT_LO = IT_INT, IT_HI = itf(1) + IT_INT;                // π/4 < S < 1/2 + π/4
export const itArea = b => Math.atan(b) - Math.PI / 4;              // ∫ from 1 to b

// ---------- 10.5 · p-series ----------
export const harmS = N => sum(n => 1 / n, N);
export const baselS = N => sum(n => 1 / (n * n), N);
export const ZETA2 = Math.PI ** 2 / 6, EULER = 0.5772156649;

// ---------- 10.6 · comparison: 1/(n² + 3) under 1/n² ----------
export const cmpA = n => 1 / (n * n + 3), cmpB = n => 1 / (n * n);
// limit comparison: Σ 1/(2ⁿ − 1) against Σ 1/2ⁿ
export const lctA = n => 1 / (2 ** n - 1), lctB = n => 1 / 2 ** n;

// ---------- 10.7, 10.9, 10.10 · the alternating harmonic series ----------
export const alt = n => (n % 2 ? 1 : -1) / n;
export const altS = N => sum(alt, N);
export const LN2 = Math.LN2;
export const ERR_N = 4;                                   // the error-bound example: S₄
export const ERR_S = altS(ERR_N), ERR_BOUND = 1 / (ERR_N + 1), ERR_TRUE = LN2 - ERR_S;
export const ERR_TOL = 0.01, ERR_NEED = Math.ceil(1 / ERR_TOL) - 1;    // 1/(n + 1) ≤ 0.01 → n = 99

// ---------- 10.8 · ratio test: Σ n/3ⁿ ----------
export const rat = n => n / 3 ** n;
export const ratQ = n => rat(n + 1) / rat(n);            // (n + 1)/(3n)
export const RAT_L = 1 / 3, RAT_SUM = (1 / 3) / (1 - 1 / 3) ** 2;   // 3/4

// ---------- 10.11, 10.12 · Taylor polynomials of eˣ at 0, and the Lagrange bound at x = 1 ----------
export const expP = (k, x) => { let s = 0, t = 1; for (let j = 0; j <= k; j++) { s += t; t *= x / (j + 1); } return s; };
export const TX = 1, TDEG = 3;
export const TP = expP(TDEG, TX);                         // 8/3
export const TE = Math.E;
export const LAG_M = 3;                                   // eˣ ≤ e < 3 on [0, 1]
export const LAG_B = LAG_M * TX ** (TDEG + 1) / fact(TDEG + 1);   // 0.125
export const lagBound = x => LAG_M * Math.abs(x) ** (TDEG + 1) / fact(TDEG + 1);
export const lagErr = x => Math.exp(x) - expP(TDEG, x);

// ---------- 10.13 · interval of convergence: Σ (x − 2)ⁿ/(n·3ⁿ) ----------
export const IC = 2, IR = 3, IA = IC - IR, IB = IC + IR;           // [−1, 5)
export const intP = (N, x) => { let s = 0, u = (x - IC) / IR, p = 1; for (let n = 1; n <= N; n++) { p *= u; s += p / n; } return s; };
export const intF = x => Math.log(IR / (IB - x));                  // −ln(1 − (x − 2)/3), the sum inside

// ---------- 10.14 · Maclaurin series of sin x ----------
export const sinP = (k, x) => { let s = 0, t = x; for (let j = 0; j < k; j++) { s += t; t *= -x * x / ((2 * j + 2) * (2 * j + 3)); } return s; };   // k nonzero terms
export const SIN_X = 0.5, SIN_P2 = sinP(2, SIN_X);                  // x − x³/6 at 0.5

// ---------- 10.15 · from 1/(1 − u): 1/(1 + x²) and arctan x ----------
export const geoP = (k, x) => { let s = 0, t = 1; for (let j = 0; j < k; j++) { s += t; t *= -x * x; } return s; };          // k terms of Σ (−x²)ⁿ
export const atanP = (k, x) => { let s = 0, t = x; for (let j = 0; j < k; j++) { s += t / (2 * j + 1); t *= -x * x; } return s; };
export const AT_X = 0.5, AT_P3 = atanP(3, AT_X), AT_TRUE = Math.atan(AT_X);
