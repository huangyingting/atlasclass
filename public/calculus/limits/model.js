// Limits and continuity model: every function drawn and every number printed in the chapter comes from here.
// Pure functions, no three.js (the question bank imports this too).

// ---------- the clock ----------
export const SLOW = 0.5, RUN = 4;                // seconds of approach (shown at half speed)
export function loop(time, run = RUN, rest = 0.8) { const c = time % (run + rest); return { t: Math.min(c, run), resting: c > run }; }
// how far a sliding point still is from the point it approaches: h0 at t = 0, closing in as e^(−1.3t)
export const gap = (t, h0 = 1.5) => h0 * Math.exp(-1.3 * t);
// a slow back-and-forth in [−1, 1] for the pages whose figure sweeps a value (1.13, 1.16)
export const sweep = (clock, rate = 0.45) => Math.sin(clock * rate);

// ---------- opener: sin x / x, a hole at (0, 1) ----------
export const sinc = x => Math.sin(x) / x;
export const OPEN = { h0: 5, L: 1 };

// ---------- 1.1 change at an instant: y = x², the secant from x = 1 to x = 1 + h ----------
export const sq = x => x * x;
export const P1 = 1;
export const secant = h => (sq(P1 + h) - sq(P1)) / h;    // = 2 + h
export const TAN1 = 2;                                   // the slope the secants close in on
export const H1 = 1.6;
export const SEC_H = [1, 0.1, 0.01, 0.001];

// ---------- 1.2 the limit: (x² − 1)/(x − 1), and f(1) assigned the value 3 ----------
export const f2 = x => x === 1 ? F2_AT : (x * x - 1) / (x - 1);
export const A2 = 1, L2 = 2, F2_AT = 3;

// ---------- 1.3 one-sided limits: x²/2 + 1 left of 2, x − 1 from 2 on ----------
export const g3 = x => x < A3 ? x * x / 2 + 1 : x - 1;
export const A3 = 2, LEFT3 = A3 * A3 / 2 + 1, RIGHT3 = A3 - 1;   // 3 and 1; g(2) = 1

// ---------- 1.4 a table: (1 + x)^(1/x) near 0 ----------
export const e4 = x => (1 + x) ** (1 / x);
export const TABLE4 = [-0.1, -0.01, -0.001, 0.001, 0.01, 0.1];
export const H4 = 0.6;

// ---------- 1.5 properties: f = x²/2 and g = 3 − x near x = 2 ----------
export const f5 = x => x * x / 2, g5 = x => 3 - x;
export const C5 = 2, LF5 = f5(C5), LG5 = g5(C5);   // 2 and 1

// ---------- 1.6 factoring and rationalizing ----------
export const fac6 = x => (x * x + x - 6) / (x - 2);           // = x + 3, hole at (2, 5)
export const A6F = 2, L6F = A6F + 3;
export const rat6 = x => (x - 4) / (Math.sqrt(x) - 2);         // = √x + 2, hole at (4, 4)
export const A6R = 4, L6R = Math.sqrt(A6R) + 2;

// ---------- 1.7 three ways a limit at x = 1 can go ----------
export const sub7 = x => x * x + 1;                 // substitution: 2
export const zero7 = x => (x * x - 1) / (x - 1);    // 0/0: factor, 2
export const inf7 = x => 1 / (x - 1) ** 2;          // 1/0: grows without bound
export const A7 = 1;

// ---------- 1.8 the squeeze ----------
export const wig8 = x => x * x * Math.sin(1 / x);
export const sinc8 = x => Math.sin(x) / x;
export const SQ8 = [0.5, 0.1, 0.01];

// ---------- 1.9 one limit, three views: sin 3x / x → 3 ----------
export const s9 = x => Math.sin(3 * x) / x;
export const K9 = 3, TABLE9 = [-0.1, -0.01, 0.01, 0.1];

// ---------- 1.10 three discontinuities ----------
export const rem10 = x => (x * x - x - 2) / (x - 2);       // x + 1, hole at (2, 3)
export const jump10 = x => x < 1 ? x + 1 : x - 2;          // 2 from the left, −1 from the right (and at 1)
export const inf10 = x => 1 / (x - 1);
export const A10R = 2, L10R = 3, A10J = 1, A10I = 1;

// ---------- 1.11 continuity at a point: a corner, still continuous ----------
export const c11 = x => x <= A11 ? x + 1 : 3 - x * x;
export const A11 = 1, L11 = 2;

// ---------- 1.12 continuity on an interval: the half circle √(9 − x²) on [−3, 3] ----------
export const R12 = 3;
export const semi = x => Math.sqrt(R12 * R12 - x * x);
export const pen12 = t => -R12 + 2 * R12 * Math.min(t / RUN, 1);

// ---------- 1.13 removing a discontinuity: kx + 1 left of 2, x² − 1 from 2 on ----------
export const A13 = 2;
export const left13 = (k, x) => k * x + 1, right13 = x => x * x - 1;
export const K13 = (right13(A13) - 1) / A13;           // 2k + 1 = 3 → k = 1
export const k13 = clock => K13 + 0.8 * sweep(clock, 0.4);

// ---------- 1.14 infinite limits: (x + 1)/(x − 2) ----------
export const r14 = x => (x + 1) / (x - 2);
export const A14 = 2, HA14 = 1;

// ---------- 1.15 limits at infinity: (3x² + 4x)/(x² + 1) → 3 both ways, crossing y = 3 at x = 3/4 ----------
export const f15 = x => (3 * x * x + 4 * x) / (x * x + 1);
export const HA15 = 3, CROSS15 = 0.75;
export const far15 = t => Math.exp(0.75 * t);            // the sliding points sit at ±e^(0.75t)

// ---------- 1.16 the Intermediate Value Theorem: x³ − x − 1 on [1, 2] ----------
export const f16 = x => x ** 3 - x - 1;
export const A16 = 1, B16 = 2, FA16 = f16(A16), FB16 = f16(B16);   // −1 and 5
export const N16 = clock => (FA16 + FB16) / 2 + 0.92 * (FB16 - FA16) / 2 * sweep(clock, 0.35);
// the c in (1, 2) with f(c) = N, by bisection (f is increasing there)
export function c16(N) {
  let lo = A16, hi = B16;
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (f16(m) < N) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
export const ROOT16 = c16(0);
