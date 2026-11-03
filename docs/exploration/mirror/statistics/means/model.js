// Inference for means: every number the pages quote and the figure draws. Pure functions over seeded samples, so
// every visit (and every check) sees the same data. Each scene reads one clock (seconds) through the loop helpers;
// with reduced motion each scene holds its own still moment (STILL).
import { mean, sd, rng as rng0, gauss, tCdf, tStar, zStar, normCdf, fences, fiveNum } from '../dist.js';

export const loop = (c, run, rest = 0) => Math.min((c % (run + rest)) / run, 1);
export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));
export const STILL = { cap: 27, tdist: 7.4, cond: 6, one: 9, paired: 13, two: 11, choose: 2.6 };
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;

// ---------- samples ----------
// a seeded source, warmed up (xorshift's first outputs from a small seed are tiny)
export const rng = seed => { const u = rng0(seed); for (let i = 0; i < 8; i++) u(); return u; };
const r1 = x => Math.round(x * 10) / 10;
export const draw = (seed, n, mu, sigma) => { const g = gauss(rng(seed)); return Array.from({ length: n }, () => r1(mu + sigma * g())); };
// right-skewed: lo plus an exponential with mean m
export const expo = (seed, n, lo, m) => { const u = rng(seed); return Array.from({ length: n }, () => r1(lo + m * -Math.log(1 - u()))); };
// a dotplot: each value's level in its stack, values binned by width w
export function stack(vals, w) {
  const seen = new Map();
  return vals.map(v => { const k = Math.round(v / w), c = seen.get(k) || 0; seen.set(k, c + 1); return c; });
}

// ---------- the t procedures ----------
export function oneT(a, C = 0.95) {
  const n = a.length, xbar = mean(a), s = sd(a), se = s / Math.sqrt(n), df = n - 1, ts = tStar(C, df);
  return { n, xbar, s, se, df, ts, me: ts * se, lo: xbar - ts * se, hi: xbar + ts * se };
}
// two independent samples, unpooled; df from the Welch–Satterthwaite formula (what technology uses), dfc the conservative
export function twoT(a, b, C = 0.95) {
  const A = oneT(a, C), B = oneT(b, C), v1 = A.se ** 2, v2 = B.se ** 2, se = Math.sqrt(v1 + v2);
  const df = (v1 + v2) ** 2 / (v1 * v1 / (A.n - 1) + v2 * v2 / (B.n - 1)), dfc = Math.min(A.n, B.n) - 1, ts = tStar(C, df), d = A.xbar - B.xbar;
  return { A, B, d, se, df, dfc, ts, tsc: tStar(C, dfc), me: ts * se, lo: d - ts * se, hi: d + ts * se };
}

// ---------- opener: repeated samples from a known population, a 95% t interval from each ----------
export const CAP = { mu: 250, sigma: 5, n: 10, reps: 20, C: 0.95, seed: 5, each: 1.3, rest: 3 };
export const CAPS = (() => {
  const g = gauss(rng(CAP.seed));
  return Array.from({ length: CAP.reps }, () => {
    const vals = Array.from({ length: CAP.n }, () => r1(CAP.mu + CAP.sigma * g())), T = oneT(vals, CAP.C);
    return { vals, ...T, hit: T.lo <= CAP.mu && CAP.mu <= T.hi, lv: stack(vals, 0.8) };
  });
})();
export const CAP_HITS = CAPS.filter(x => x.hit).length;
// where the run is: sample k being drawn (phase u in 0..1); `done` intervals already in the stack
export function capAt(c) {
  const run = CAP.reps * CAP.each, t = c % (run + CAP.rest);
  if (t >= run) return { k: CAP.reps, u: 1, done: CAP.reps };
  const k = Math.floor(t / CAP.each);
  return { k, u: (t - k * CAP.each) / CAP.each, done: k };
}

// ---------- 7.1 t distributions: heavier tails, approaching the normal as df grows ----------
export const TD = { dfs: [1, 2, 4, 9, 30], hold: 2.2, morph: 1.1, C: 0.95, beyond: 2 };
export const Z95 = zStar(0.95);
// df now: held at each value, then eased (on a log scale) to the next
export function dfAt(c) {
  const step = TD.hold + TD.morph, N = TD.dfs.length, t = c % (step * N), i = Math.floor(t / step), u = smooth((t - i * step - TD.hold) / TD.morph);
  const a = TD.dfs[i], b = TD.dfs[(i + 1) % N];
  return b < a ? (u < 0.5 ? a : b) : Math.exp(Math.log(a) + (Math.log(b) - Math.log(a)) * u);
}
export const tStarOf = df => tStar(TD.C, df);
export const TTABLE = [2, 5, 10, 15, 30, 100].map(df => [df, tStar(0.95, df)]);
export const tailBeyond = (x, df) => 2 * tCdf(-x, df);                 // P(|t| > x)
export const normBeyond = x => 2 * normCdf(-x);

// ---------- 7.2 conditions: three samples, one that fails ----------
export const COND = {
  A: draw(49, 12, 10, 2.2),     // small, roughly symmetric: fine
  B: expo(15, 12, 1, 2.5),      // small, strongly skewed with an outlier: not fine
  C: expo(7, 40, 1, 3),         // skewed, but n ≥ 30: fine
  run: 3, rest: 5,
};
export const COND_F = fences(COND.B);
export const COND_5 = fiveNum(COND.B);
export const COND_OUT = COND.B.filter(v => v > COND_F.hi || v < COND_F.lo);

// ---------- 7.2–7.5 one sample: a coffee machine set to 250 mL ----------
export const FILL = { mu0: 250, n: 16, mu: 247.6, sigma: 4, seed: 16, C: 0.95, run: 9, rest: 3 };
export const FILLD = draw(FILL.seed, FILL.n, FILL.mu, FILL.sigma);
export const ONE = oneT(FILLD, FILL.C);
export const T1 = (ONE.xbar - FILL.mu0) / ONE.se;
export const P1 = 2 * tCdf(-Math.abs(T1), ONE.df);                    // two-sided
export const ONE90 = oneT(FILLD, 0.90), ONE99 = oneT(FILLD, 0.99);
export const oneT_ = c => loop(c, FILL.run, FILL.rest) * FILL.run;     // seconds into the build

// ---------- 7.5 / 7.8 paired: reading speed (words per minute) of 12 students before and after a course ----------
export const PAIR = { n: 12, seed: 24, base: 200, spread: 35, gain: 12, noise: 10, C: 0.95, run: 13, rest: 4 };
export const [BEFORE, AFTER] = (() => {
  const g = gauss(rng(PAIR.seed)), b = [], a = [];
  for (let i = 0; i < PAIR.n; i++) { const x = Math.round(PAIR.base + PAIR.spread * g()); b.push(x); a.push(Math.round(x + PAIR.gain + PAIR.noise * g())); }
  return [b, a];
})();
export const DIFF = AFTER.map((v, i) => v - BEFORE[i]);
export const PD = oneT(DIFF, PAIR.C);
export const T_PAIR = PD.xbar / PD.se;
export const P_PAIR = 1 - tCdf(T_PAIR, PD.df);                         // Ha: μd > 0
export const WRONG = twoT(AFTER, BEFORE, PAIR.C);                       // the same numbers, wrongly as two samples
export const T_WRONG = WRONG.d / WRONG.se, P_WRONG = 1 - tCdf(T_WRONG, WRONG.df);
export const pairT = c => loop(c, PAIR.run, PAIR.rest) * PAIR.run;

// ---------- 7.6–7.9 two samples: battery life (hours) of two brands ----------
export const TWO = { nA: 14, nB: 12, seed: 44, muA: 11.8, sA: 1.3, muB: 10.6, sB: 1.7, C: 0.95, claim: 2, run: 11, rest: 3 };
export const BAT_A = draw(TWO.seed, TWO.nA, TWO.muA, TWO.sA), BAT_B = draw(TWO.seed + 1000, TWO.nB, TWO.muB, TWO.sB);
export const TT = twoT(BAT_A, BAT_B, TWO.C);
export const T2 = TT.d / TT.se;
export const P2 = 1 - tCdf(T2, TT.df);                                 // Ha: μA − μB > 0
export const P2C = 1 - tCdf(T2, TT.dfc);                              // the same, conservative df
export const CI_C = [TT.d - TT.tsc * TT.se, TT.d + TT.tsc * TT.se];
export const twoT_ = c => loop(c, TWO.run, TWO.rest) * TWO.run;

// ---------- 7.10 choosing a procedure: a path through the questions for each example ----------
// nodes: 0 the question, 1 proportion, 2 mean; leaves 3 z for p, 4 one-sample t, 5 paired t, 6 two-sample t
export const CHOOSE = { each: 4.2, ex: [
  ['the mean weight of apples from an orchard, from 40 picked at random', [0, 2, 4]],
  ['15 runners, each timed in old shoes and in new ones', [0, 2, 5]],
  ['mean commute times of random samples from two cities', [0, 2, 6]],
  ['the share of 500 voters who back a plan', [0, 1, 3]],
  ['twins, one of each pair given a new diet at random', [0, 2, 5]],
] };
export const NODE = ['What is the parameter?', 'a proportion', 'a mean', 'z for a proportion', 'one-sample t', 'paired t', 'two-sample t'];
export const chooseAt = c => { const n = CHOOSE.ex.length, t = c % (CHOOSE.each * n), k = Math.floor(t / CHOOSE.each); return { k, u: (t - k * CHOOSE.each) / CHOOSE.each }; };
