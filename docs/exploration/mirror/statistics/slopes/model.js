// Inference for slopes: every number the pages quote and the figure draws. One population model (hours studied and
// test score), one seeded sample from it, and seeded repeated samples for the sampling distributions. Each scene reads
// one clock (seconds); with reduced motion each holds its own still moment (STILL).
import { mean, sd, sum, lsrl, rng, gauss, tCdf, tStar, normPdf, tPdf } from '../dist.js';

export { normPdf, tPdf };
const TAU = 2 * Math.PI;
export const loop = (c, run, rest = 0) => Math.min((c % (run + rest)) / run, 1);
export const sweep = (c, a, b, p) => a + (b - a) * (1 - Math.cos(TAU * c / p)) / 2;
export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));
// every run starts at its end (the whole sample, all the samples), holds there, then plays again from the start
export const STILL = { model: 0, fan: 0, resid: 0, ci: 0, stack: 0, nul: 0, tdist: 0, choose: 31 };
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;

// ---------- the population: score = α + β·hours, scores normal about the line with the same σ at every x ----------
export const POP = { alpha: 50, beta: 2.5, sigma: 9, n: 18, seed: 17, X: [0, 10.5], Y: [20, 100] };
export const SCHOOL = 950;                                  // students at the school the sample was drawn from
export const mu = x => POP.alpha + POP.beta * x;
export const BELLS = [1, 3, 5, 7, 9];                       // the x values where the figure stands a normal curve up

// ---------- the sample: 18 students (hours to the half hour, whole-number scores) ----------
export const DATA = (() => {
  const u = rng(POP.seed), g = gauss(u);
  const x = Array.from({ length: POP.n }, () => Math.round((1 + u() * 9) * 2) / 2);
  const y = x.map(v => Math.round(mu(v) + POP.sigma * g()));
  return { x, y };
})();
export const N = POP.n, DF = N - 2;
export const FIT = lsrl(DATA.x, DATA.y);                    // a, b, r, r2, mx, my, sx, sy, res, s, seB
export const yhat = x => FIT.a + FIT.b * x;
const Sxx = sum(DATA.x.map(x => (x - FIT.mx) ** 2));
const SE_A = FIT.s * Math.sqrt(1 / N + FIT.mx ** 2 / Sxx);
const p2 = (t, df) => 2 * (1 - tCdf(Math.abs(t), df));

// ---------- the computer output, rounded as printed; the pages compute from the printed numbers, as a student does ----------
const rd = (v, d) => +v.toFixed(d);
export const OUT = {
  a: rd(FIT.a, 3), seA: rd(SE_A, 3), tA: rd(FIT.a / SE_A, 2), pA: rd(p2(FIT.a / SE_A, DF), 3),
  b: rd(FIT.b, 3), seB: rd(FIT.seB, 3), t: rd(FIT.b / FIT.seB, 2), p: rd(p2(FIT.b / FIT.seB, DF), 3),
  s: rd(FIT.s, 3), r2: rd(100 * FIT.r2, 1), r2adj: rd(100 * (1 - (1 - FIT.r2) * (N - 1) / (N - 2)), 1),
};
// a regression printout as an HTML table: rows [[predictor, coef, se, t, p], …], and S, R-sq, R-sq(adj) in %
const f = (v, d) => (v < 0 ? '−' : '') + Math.abs(v).toFixed(d);
export const outputTable = (rows, s, r2, r2adj) => `<table class="data">
  <tr><th>Predictor</th><th>Coef</th><th>SE Coef</th><th>T</th><th>P</th></tr>
  ${rows.map(([n, c, se, t, p]) => `<tr><td>${n}</td><td>${f(c, 3)}</td><td>${f(se, 3)}</td><td>${f(t, 2)}</td><td>${p.toFixed(3)}</td></tr>`).join('')}
  <tr><td colspan="5">S = ${s.toFixed(3)}&ensp; R-Sq = ${r2.toFixed(1)}%&ensp; R-Sq(adj) = ${r2adj.toFixed(1)}%</td></tr></table>`;
export const OUTPUT = outputTable([['Constant', OUT.a, OUT.seA, OUT.tA, OUT.pA], ['Hours', OUT.b, OUT.seB, OUT.t, OUT.p]], OUT.s, OUT.r2, OUT.r2adj);

// ---------- 9.2 intervals, from the printed b and SE_b ----------
export const interval = C => { const ts = tStar(C, DF); return { C, ts, me: ts * OUT.seB, lo: OUT.b - ts * OUT.seB, hi: OUT.b + ts * OUT.seB }; };
export const CI95 = interval(0.95), CI99 = interval(0.99), CI90 = interval(0.90);
export const ciC = s => s.reduced ? 0.95 : sweep(s.c, 0.80, 0.99, 12);
export const CLAIM = 5;                                      // a tutoring company: "5 more points for every hour"
// residuals: a histogram, 5 points a bin, −25 to 25
export const RES = FIT.res;
export const HIST_W = 5, HIST_R = 25;
export const HIST = (() => { const bins = []; for (let a = -HIST_R; a < HIST_R; a += HIST_W) bins.push([a, a + HIST_W, RES.filter(r => r >= a && r < a + HIST_W).length]); return bins; })();
export const RES_RUN = { each: 0.55, rest: 4 };
export const residT = c => (c + N * RES_RUN.each) % (N * RES_RUN.each + RES_RUN.rest);

// ---------- 9.1 the model drawn: each point appears on the line and slides to its score ----------
export const MODEL_RUN = { each: 0.6, start: 0.6, slide: 0.45, rest: 5 };
const modelRun = MODEL_RUN.start + N * MODEL_RUN.each + MODEL_RUN.slide;
export const modelT = c => (c + modelRun) % (modelRun + MODEL_RUN.rest);
// how far point i has come: 0 not yet drawn, 0→1 sliding from μ_y to y, 1 there
export const drawn = (i, t) => t < MODEL_RUN.start + i * MODEL_RUN.each ? 0 : smooth((t - MODEL_RUN.start - i * MODEL_RUN.each) / MODEL_RUN.slide) || 1e-3;

// ---------- 9.1 repeated samples: the same 18 hours, new scores each time; their slopes ----------
export const NFAN = 100;
export const FAN = (() => {
  const g = gauss(rng(2024));
  return Array.from({ length: NFAN }, () => {
    const y = DATA.x.map(v => Math.round(mu(v) + POP.sigma * g()));
    const L = lsrl(DATA.x, y);
    return { y, a: L.a, b: L.b, se: L.seB };
  });
})();
// σ_b = σ/(σ_x √n), σ_x the hours' standard deviation with divisor n
export const SIGMA_X = sd(DATA.x, true), SIGMA_B = POP.sigma / (SIGMA_X * Math.sqrt(N));
export const FAN_MEAN = mean(FAN.map(s => s.b)), FAN_SD = sd(FAN.map(s => s.b));
export const FAN_BIN = 0.25;
// sample k's moment: slowly at first, then quickly
export const FAN_RUN = { slow: 8, slowEach: 1.3, each: 0.25, rest: 5 };
const fanEnd = FAN_RUN.slow * FAN_RUN.slowEach + (NFAN - FAN_RUN.slow) * FAN_RUN.each;
export const fanAt = k => k < FAN_RUN.slow ? k * FAN_RUN.slowEach : FAN_RUN.slow * FAN_RUN.slowEach + (k - FAN_RUN.slow) * FAN_RUN.each;
export const fanT = c => (c + fanEnd) % (fanEnd + FAN_RUN.rest);
export const fanCount = t => { let k = 0; while (k < NFAN && fanAt(k) <= t) k++; return k; };   // samples drawn so far
// 95% intervals from the first 25 repeated samples, each its own b ± t*·SE_b
export const NSTACK = 25;
export const STACK = FAN.slice(0, NSTACK).map(s => { const me = tStar(0.95, DF) * s.se; return { b: s.b, lo: s.b - me, hi: s.b + me, hit: s.b - me <= POP.beta && POP.beta <= s.b + me }; });
export const MISSES = STACK.filter(s => !s.hit).length;
export const STACK_RUN = { each: 0.6, rest: 3 };
export const stackT = c => (c + NSTACK * STACK_RUN.each) % (NSTACK * STACK_RUN.each + STACK_RUN.rest);

// ---------- 9.4–9.5 the test: H₀ β = 0, from the printed t; and a world where H₀ is true ----------
export const T_OBS = OUT.b / OUT.seB, P_OBS = p2(T_OBS, DF), P_ONE = OUT.p / 2;
// testing the tutoring company's claim, β₀ = 5, by hand: the printed T and P are for β₀ = 0 only
export const T_CLAIM = (OUT.b - CLAIM) / OUT.seB, P_CLAIM = p2(T_CLAIM, DF);
// null samples: the same hours, scores normal about the flat line ȳ with SD s
export const NNULL = 200;
export const NULLS = (() => {
  const g = gauss(rng(909));
  return Array.from({ length: NNULL }, () => {
    const y = DATA.x.map(v => FIT.my + FIT.s * g());
    const L = lsrl(DATA.x, y);
    return { a: L.a, b: L.b, t: L.b / L.seB };
  });
})();
export const NULL_EXTREME = NULLS.filter(s => Math.abs(s.t) >= T_OBS).length;
export const NULL_STEEP = NULLS.filter(s => Math.abs(s.b) >= OUT.b).length;
export const NULL_LINES = 30;                                // how many null fitted lines the figure draws
export const NULL_RUN = { each: 0.11, rest: 4 };
export const nullT = c => (c + NNULL * NULL_RUN.each) % (NNULL * NULL_RUN.each + NULL_RUN.rest);
export const T_BIN = 0.25;
export const tCrit = (C, df = DF) => tStar(C, df);

// ---------- 9.6 which procedure? ----------
export const PROCS = [
  ['1-prop z', 'one proportion'], ['2-prop z', 'two proportions'], ['χ² GOF', 'goodness of fit'],
  ['1-sample t', 'one mean'], ['2-sample t', 'two means'], ['paired t', 'mean difference'],
  ['χ² homog.', 'homogeneity'], ['χ² indep.', 'independence'], ['t for slope', 'linear regression'],
];
export const CASES = [
  ['What proportion of voters back the bond?', 0],
  ['Is the mean wait time over 5 minutes?', 3],
  ['Do the same runners run faster with new shoes?', 5],
  ['Is study time linearly related to score?', 8],
  ['Is a die fair across its six faces?', 2],
  ['Do two schools differ in the rate of absence?', 1],
  ['Are diet and sleep type related, in one sample?', 7],
  ['Do two fertilisers give different mean yields?', 4],
  ['Do three towns prefer the parks equally?', 6],
];
export const CASE_EACH = 3.5;
export const caseAt = c => Math.floor(c / CASE_EACH) % CASES.length;
