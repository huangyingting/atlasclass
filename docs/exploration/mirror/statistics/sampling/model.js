// Sampling distributions model: every number the pages quote and the figure draws. Every sample is drawn once, here,
// from a seeded generator, so each visit (and each check) sees the same samples. Each scene reads one clock (seconds)
// through the helpers below; with reduced motion each scene holds its own still moment (STILL).
import { sum, mean, sd, rng, gauss, normCdf, normInv, normPdf, binomCdf } from '../dist.js';

export { normPdf };
export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));

// a run of k samples: the first `slow` take `a` seconds each (so they can be followed), the rest `b`; then the
// finished picture is held for `rest` seconds, and again. → { i: the sample in flight (k when all have landed),
// u: how far through it (0 → 1) }; samples 0 … i − 1 have landed.
export const runLength = R => R.slow * R.a + (R.k - R.slow) * R.b;
export function runAt(c, R) {
  const T = runLength(R), t = c % (T + R.rest);
  if (t >= T) return { i: R.k, u: 1 };
  const i = t < R.slow * R.a ? Math.floor(t / R.a) : Math.min(R.slow + Math.floor((t - R.slow * R.a) / R.b), R.k - 1);
  const t0 = i < R.slow ? i * R.a : R.slow * R.a + (i - R.slow) * R.b;
  return { i, u: Math.min((t - t0) / (i < R.slow ? R.a : R.b), 1) };
}
// a dotplot: each value's column (x, its bin's centre) and how many dots are already below it
export function stack(vals, binOf) {
  const seen = new Map();
  return vals.map(v => { const x = binOf(v), key = x.toFixed(6), h = seen.get(key) || 0; seen.set(key, h + 1); return [x, h]; });
}
// the n values of a sample, drawn from a discrete distribution (probabilities pr over values 0, 1, 2 …)
const pick = (pr, u) => { let a = 0; for (let v = 0; v < pr.length; v++) { a += pr[v]; if (u < a) return v; } return pr.length - 1; };
const round1 = x => Math.round(x * 10) / 10;

// ---------- the population: books read last summer by the students of a large school (percent of students) ----------
export const POP = { pct: [24, 20, 15, 11, 9, 7, 5, 4, 3, 2] };
export const POP_P = POP.pct.map(p => p / 100);
export const MU = sum(POP_P.map((p, v) => p * v));                                 // 2.54 books
export const SIGMA = Math.sqrt(sum(POP_P.map((p, v) => p * (v - MU) ** 2)));      // 2.41 books
export const drawBooks = (u, n) => Array.from({ length: n }, () => pick(POP_P, u()));

// ---------- the opener and 5.1: samples of 10 students, each sample's mean dropped into a dotplot ----------
export const DRAW = { n: 10, k: 120, seed: 7, slow: 3, a: 2.6, b: 0.18, rest: 5, w: 0.2 };
{ const u = rng(DRAW.seed); DRAW.samples = Array.from({ length: DRAW.k }, () => drawBooks(u, DRAW.n)); }
export const DRAW_M = DRAW.samples.map(mean);
export const DRAW_DOTS = stack(DRAW_M, v => (Math.floor(v / DRAW.w + 1e-9) + 0.5) * DRAW.w);
export const DRAW_SE = SIGMA / Math.sqrt(DRAW.n);                                   // σ/√n
export const DRAW_SUM = { mean: mean(DRAW_M), sd: sd(DRAW_M) };
export const drawAt = c => runAt(c, DRAW);
export const FIRST = 4;                                                             // the samples in the 5.1 table
export const FIRST_S = DRAW.samples.slice(0, FIRST).map(s => ({ s, m: mean(s) }));

// ---------- 5.1 is it just chance? A claim p = 0.5; a sample of 40 found 26 in favour; 100 simulated samples ----------
export const SIM = { p: 0.5, n: 40, obs: 26, k: 100, seed: 9, slow: 3, a: 2.4, b: 0.16, rest: 5 };
{ const u = rng(SIM.seed); SIM.samples = Array.from({ length: SIM.k }, () => Array.from({ length: SIM.n }, () => u() < SIM.p)); }
export const SIM_X = SIM.samples.map(s => s.filter(Boolean).length);
export const SIM_PH = SIM_X.map(x => x / SIM.n);
export const SIM_DOTS = stack(SIM_PH, v => v);
export const SIM_OBS = SIM.obs / SIM.n;                                             // 0.65
export const SIM_TAIL = SIM_X.filter(x => x >= SIM.obs).length;
export const SIM_EST = SIM_TAIL / SIM.k;
export const SIM_EXACT = 1 - binomCdf(SIM.obs - 1, SIM.n, SIM.p);                   // the binomial answer, for comparison
export const simAt = c => runAt(c, SIM);

// ---------- 5.2 apple weights: approximately normal, μ = 150 g, σ = 12 g ----------
export const APPLE = { mu: 150, sigma: 12, a: 140, b: 165, top: 0.10 };
export const Z_A = (APPLE.a - APPLE.mu) / APPLE.sigma, Z_B = (APPLE.b - APPLE.mu) / APPLE.sigma;
export const P_AB = normCdf(Z_B) - normCdf(Z_A);
export const P_OVER_B = 1 - normCdf(Z_B);
export const Z_TOP = normInv(1 - APPLE.top);                                        // 1.28
export const CUT = APPLE.mu + Z_TOP * APPLE.sigma;                                  // the heaviest 10% weigh at least this
// samples of 8 apples, one every `each` seconds: the statistic x̄ beside the parameter μ
export const APS = { n: 8, k: 12, each: 3.6, seed: 21 };
{ const z = gauss(rng(APS.seed)); APS.samples = Array.from({ length: APS.k }, () => Array.from({ length: APS.n }, () => round1(APPLE.mu + APPLE.sigma * z()))); }
export const APS_M = APS.samples.map(mean), APS_S = APS.samples.map(s => sd(s));
export const apsAt = c => { const t = c % (APS.each * APS.k); return { i: Math.floor(t / APS.each), u: (t % APS.each) / APS.each }; };

// ---------- 5.3 the central limit theorem: 400 samples of each size from the skewed population ----------
export const CLT = { ns: [2, 10, 30], k: 400, seed: 5, run: 16, rest: 4, w: [0.5, 0.2, 0.2] };
export const CLT_M = CLT.ns.map((n, j) => { const u = rng(CLT.seed + 100 * j); return Array.from({ length: CLT.k }, () => mean(drawBooks(u, n))); });
export const CLT_SUM = CLT_M.map((m, j) => ({ n: CLT.ns[j], mean: mean(m), sd: sd(m), se: SIGMA / Math.sqrt(CLT.ns[j]) }));
// how many of the 400 have landed at clock c
export const cltAt = c => { const t = c % (CLT.run + CLT.rest); return Math.min(Math.floor(CLT.k * t / CLT.run), CLT.k); };
// the histogram of the first `landed` means: [[xa, xb, density]] (bins [jw, (j + 1)w), so each holds as many
// possible means as the next)
export function cltBars(j, landed) {
  const w = CLT.w[j], counts = new Map();
  for (let i = 0; i < landed; i++) { const b = Math.floor(CLT_M[j][i] / w + 1e-9); counts.set(b, (counts.get(b) || 0) + 1); }
  return [...counts].map(([b, c]) => [b * w, (b + 1) * w, c / (CLT.k * w)]);
}

// ---------- 5.4 four estimators as four targets: each dart is one sample's estimate ----------
export const TG = {
  darts: 18, each: 0.55, rest: 3, seed: 13, R: 1.6,
  list: [
    { key: 'tA', bias: 0, sd: 0.2, title: 'Unbiased, low variability' },
    { key: 'tB', bias: 0, sd: 0.6, title: 'Unbiased, high variability' },
    { key: 'tC', bias: 0.8, sd: 0.2, title: 'Biased, low variability' },
    { key: 'tD', bias: 0.8, sd: 0.6, title: 'Biased, high variability' },
  ],
};
{ const z = gauss(rng(TG.seed)); for (const t of TG.list) t.darts = Array.from({ length: TG.darts }, () => [t.bias * 0.7 + t.sd * z(), t.bias * 0.7 + t.sd * z()]); }
for (const t of TG.list) { t.cx = mean(t.darts.map(d => d[0])); t.cy = mean(t.darts.map(d => d[1])); t.off = Math.hypot(t.cx, t.cy); t.spread = Math.sqrt(mean(t.darts.map(([x, y]) => (x - t.cx) ** 2 + (y - t.cy) ** 2))); }
export const tgAt = c => Math.min(Math.floor((c % (TG.darts * TG.each + TG.rest)) / TG.each), TG.darts);
// the spread of x̄ at two sample sizes, from the 5.3 simulation: larger samples, less variability, same centre
export const N_SMALL = CLT_SUM[1], N_LARGE = CLT_SUM[2];

// ---------- 5.5 sample proportions: 35% of a district's 8,000 students walk to school; samples of 50 ----------
export const PROP = { p: 0.35, n: 50, N: 8000, k: 100, seed: 3, slow: 3, a: 3, b: 0.18, rest: 5, cut: 0.45, beads: 260 };
{ const u = rng(PROP.seed); PROP.samples = Array.from({ length: PROP.k }, () => Array.from({ length: PROP.n }, () => u() < PROP.p)); }
export const PROP_X = PROP.samples.map(s => s.filter(Boolean).length);
export const PROP_PH = PROP_X.map(x => x / PROP.n);
export const PROP_DOTS = stack(PROP_PH, v => v);
export const PROP_SD = Math.sqrt(PROP.p * (1 - PROP.p) / PROP.n);                  // 0.0675
export const PROP_SUM = { mean: mean(PROP_PH), sd: sd(PROP_PH) };
export const PROP_NP = PROP.n * PROP.p, PROP_NQ = PROP.n * (1 - PROP.p);           // 17.5, 32.5: both ≥ 10
export const PROP_Z = (PROP.cut - PROP.p) / PROP_SD;
export const PROP_TAIL = 1 - normCdf(PROP_Z);
export const PROP_SIMTAIL = PROP_PH.filter(v => v >= PROP.cut - 1e-9).length / PROP.k;
export const propAt = c => runAt(c, PROP);

// ---------- 5.6 the difference of two sample proportions: a second district, 25% walk; samples of 60 ----------
export const PD = { p1: PROP.p, n1: PROP.n, p2: 0.25, n2: 60, k: 100, seed: 9, slow: 3, a: 2.6, b: 0.18, rest: 5, w: 0.02 };
{ const u = rng(PD.seed); PD.pairs = Array.from({ length: PD.k }, () => {
  let a = 0, b = 0; for (let i = 0; i < PD.n1; i++) a += u() < PD.p1; for (let i = 0; i < PD.n2; i++) b += u() < PD.p2; return [a / PD.n1, b / PD.n2]; }); }
export const PD_D = PD.pairs.map(([a, b]) => a - b);
export const PD_DOTS = stack(PD_D, v => Math.round(v / PD.w) * PD.w);
export const PD_MU = PD.p1 - PD.p2;
export const PD_SD = Math.sqrt(PD.p1 * (1 - PD.p1) / PD.n1 + PD.p2 * (1 - PD.p2) / PD.n2);
export const PD_Z = (0 - PD_MU) / PD_SD;
export const PD_LESS0 = normCdf(PD_Z);                                              // P(p̂₁ − p̂₂ < 0)
export const PD_SIMLESS = PD_D.filter(d => d < 0).length / PD.k;
export const PD_COUNTS = [PD.n1 * PD.p1, PD.n1 * (1 - PD.p1), PD.n2 * PD.p2, PD.n2 * (1 - PD.p2)];
export const pdAt = c => runAt(c, PD);

// ---------- 5.7 sample means of 9 apples ----------
export const XB = { mu: APPLE.mu, sigma: APPLE.sigma, n: 9, cut: 155, k: 12, each: 3.6, seed: 31 };
{ const z = gauss(rng(XB.seed)); XB.samples = Array.from({ length: XB.k }, () => Array.from({ length: XB.n }, () => round1(XB.mu + XB.sigma * z()))); }
export const XB_M = XB.samples.map(mean);
export const XB_SE = XB.sigma / Math.sqrt(XB.n);                                   // 4 g
export const XB_Z = (XB.cut - XB.mu) / XB_SE, XB_Z1 = (XB.cut - XB.mu) / XB.sigma;
export const XB_P = 1 - normCdf(XB_Z), XB_P1 = 1 - normCdf(XB_Z1);
export const xbAt = c => { const t = c % (XB.each * XB.k); return { i: Math.floor(t / XB.each), u: (t % XB.each) / XB.each }; };

// ---------- 5.8 the difference of two sample means: variety A (as above) against variety B ----------
export const MD = { A: { mu: 150, sigma: 12, n: 9 }, B: { mu: 140, sigma: 10, n: 16 }, k: 12, each: 3.6, seed: 41 };
for (const g of [MD.A, MD.B]) g.se = g.sigma / Math.sqrt(g.n);
{ const z = gauss(rng(MD.seed)); MD.pairs = Array.from({ length: MD.k }, () => [MD.A, MD.B].map(g => mean(Array.from({ length: g.n }, () => g.mu + g.sigma * z())))); }
export const MD_MU = MD.A.mu - MD.B.mu;
export const MD_SD = Math.sqrt(MD.A.sigma ** 2 / MD.A.n + MD.B.sigma ** 2 / MD.B.n);
export const MD_Z = (0 - MD_MU) / MD_SD;
export const MD_LESS0 = normCdf(MD_Z);                                              // P(x̄_A − x̄_B < 0)
export const mdAt = c => { const t = c % (MD.each * MD.k); return { i: Math.floor(t / MD.each), u: (t % MD.each) / MD.each }; };

// each scene's clock: the shared one, or its chosen still moment under reduced motion (the finished picture)
export const STILL = {
  draw: runLength(DRAW) + 1, sim: runLength(SIM) + 1, normal: APS.each * 0.8, clt: CLT.run + 1, targets: TG.darts * TG.each + 1,
  prop: runLength(PROP) + 1, pdiff: runLength(PD) + 1, xbar: XB.each * 0.8, mdiff: MD.each * 0.8,
};
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;
// the book opens with the opener's dotplot half built and filling fast
export const CLOCK0 = DRAW.slow * DRAW.a + 70 * DRAW.b;
export const PRACTICE = {};   // the paid questions are in problems/sampling.mjs
