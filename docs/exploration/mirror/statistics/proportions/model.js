// Inference for proportions, the model: every number the pages quote and the figure draws. Pure functions; each scene
// reads one clock (seconds) through the loop helpers below. With reduced motion each scene holds its own still moment
// (STILL). Samples come from a seeded generator, so every visit draws the same ones.
import { rng, normPdf, normCdf, normInv, zStar } from '../dist.js';

const TAU = 2 * Math.PI;
// progress 0 → 1 through a run of `run` seconds, then held for `rest` seconds, and again
export const loop = (c, run, rest = 0) => Math.min((c % (run + rest)) / run, 1);
export const sweep = (c, a, b, p) => a + (b - a) * (1 - Math.cos(TAU * c / p)) / 2;
export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));
// each scene's clock: the shared one, or its chosen still moment under reduced motion
export const STILL = { rods: 8, why: 13, build: 13.6, size: 7, width: 2.2, nul: 13, decide: 6.6, power: 8.75, diff: 6, two: 2 };
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;

// the number of successes in n trials with success probability p, from the uniform source u
const count = (u, n, p) => { let x = 0; for (let k = 0; k < n; k++) if (u() < p) x++; return x; };
export const se1 = (p, n) => Math.sqrt(p * (1 - p) / n);
// the upper-tail area beyond z, and the two-tailed one
export const upper = z => 1 - normCdf(z);
export const twoTail = z => 2 * (1 - normCdf(Math.abs(z)));

// ---------- 6.1 why be normal: p̂ from many samples of 20 and of 200, p = 0.10 ----------
export const WHY = { p: 0.10, ns: [20, 200], reps: 1500, run: 12, rest: 2.5, seed: 7, x: [-0.1, 0.35], start: 60, bin: [1, 3], ymax: [7, 24] };
export const whySd = WHY.ns.map(n => se1(WHY.p, n));
export const whyCounts = WHY.ns.map(n => [n * WHY.p, n * (1 - WHY.p)]);        // np, n(1 − p)
// every simulated p̂, in the order drawn
export const WHY_SIMS = WHY.ns.map((n, j) => { const u = rng(WHY.seed + j); return Array.from({ length: WHY.reps }, () => count(u, n, WHY.p) / n); });
// what the normal model says about p̂ < 0, which cannot happen
export const whyBelow0 = whySd.map(s => normCdf(0, WHY.p, s));
// a worked probability with n = 200: P(p̂ ≥ 0.15)
export const FAR = { at: 0.15, j: 1 };
export const farZ = (FAR.at - WHY.p) / whySd[FAR.j];
export const farP = upper(farZ);
export const whyDrawn = c => Math.round(WHY.start + (WHY.reps - WHY.start) * loop(c, WHY.run, WHY.rest));
// the histogram of the first m samples: [[xa, xb, density], …], one bar per WHY.bin[j] possible values k/n
// (heights held to the board while only a few samples are in)
export function whyBars(j, m) {
  const n = WHY.ns[j], b = WHY.bin[j], w = b / n, k = new Map();
  for (let i = 0; i < m; i++) { const key = Math.floor(Math.round(WHY_SIMS[j][i] * n) / b); k.set(key, (k.get(key) || 0) + 1); }
  return [...k].map(([key, c]) => [(key * b - 0.5) / n, (key * b - 0.5) / n + w, Math.min(c / (m * w), WHY.ymax[j])]);
}

// ---------- 6.2 and 6.3: a city's support for a bike lane. One sample of 500; and, in the figure, the truth ----------
// The worked example: one random sample. The figure sets the city's true proportion so the intervals can be judged.
export const BIKE = { n: 500, x: 290, C: 0.95, claim: 0.5, guess: 0.60, high: 0.65, N: 820000 };
export const ZS = zStar(BIKE.C);                                                 // 1.960
export const bikeP = BIKE.x / BIKE.n;
export const bikeSE = se1(bikeP, BIKE.n);
export const bikeME = ZS * bikeSE;
export const BIKE_CI = [bikeP - bikeME, bikeP + bikeME];
// 50 samples of 500 from a city where p = 0.60, each with its 95% interval
export const SIM = { p: 0.60, n: 500, reps: 50, seed: 101, every: 0.12, rest: 9 };
export const SAMPLES = (() => {
  const u = rng(SIM.seed);
  return Array.from({ length: SIM.reps }, () => { const ph = count(u, SIM.n, SIM.p) / SIM.n, me = ZS * se1(ph, SIM.n); return { ph, lo: ph - me, hi: ph + me, hit: Math.abs(ph - SIM.p) <= me }; });
})();
export const MISSES = SAMPLES.filter(s => !s.hit).length;
export const simSd = se1(SIM.p, SIM.n);
// the opener and 6.3: intervals appear one by one, then all of them hold
export const rodsShown = c => { const run = SIM.reps * SIM.every; return Math.min(SIM.reps, Math.floor((c % (run + SIM.rest)) / SIM.every) + 1); };
export const caught = m => SAMPLES.slice(0, m).filter(s => s.hit).length;

// 6.2 one sample at a time: p̂ drops into the sampling distribution, then its interval opens around it
export const BUILD = { shown: 8, each: 2.6, fall: 0.8, open: 0.7 };
export function buildAt(c) {
  const i = Math.floor(c / BUILD.each) % BUILD.shown, t = c % BUILD.each;
  return { i, fall: M01(t / BUILD.fall), open: M01((t - BUILD.fall) / BUILD.open) };
}
const M01 = u => smooth(u);

// 6.2 choosing n: margin of error against n, and the n a target margin needs
export const SIZE = { ME: 0.03, C: 0.95, pstar: 0.5, pilot: 0.2, nmax: 2500, run: 14 };
export const meOf = (n, p = SIZE.pstar, C = SIZE.C) => zStar(C) * se1(p, n);
export const nFor = (me, p = SIZE.pstar, C = SIZE.C) => Math.ceil(zStar(C) ** 2 * p * (1 - p) / me ** 2);
export const N_NEED = nFor(SIZE.ME);                                              // 1068
export const N_PILOT = nFor(SIZE.ME, SIZE.pilot);                                 // 683
export const sizeN = c => sweep(c, 150, 2350, SIZE.run);

// 6.3 width: the same p̂ and n at several confidence levels, and with four times the sample
export const WIDTH = { levels: [0.90, 0.95, 0.99], big: 4, run: 9, lo: 0.80, hi: 0.995 };
export const meAt = (C, n = BIKE.n) => zStar(C) * se1(bikeP, n);
export const widthC = c => sweep(c, WIDTH.lo, WIDTH.hi, WIDTH.run);

// ---------- 6.4–6.6 a test: phones needing repair within two years. H0: p = 0.25, Ha: p > 0.25 ----------
export const TEST = { p0: 0.25, n: 400, x: 118, alpha: 0.05, alphaLow: 0.01, sims: 200, seed: 23, bin: 0.005, every: 0.06, rest: 3 };
export const testP = TEST.x / TEST.n;                                              // 0.295
export const sd0 = se1(TEST.p0, TEST.n);
export const testZ = (testP - TEST.p0) / sd0;
export const testPV = upper(testZ);
export const testCounts = [TEST.n * TEST.p0, TEST.n * (1 - TEST.p0)];
// 200 samples of 400 drawn as if H0 were true
export const NULL_SIMS = (() => { const u = rng(TEST.seed); return Array.from({ length: TEST.sims }, () => count(u, TEST.n, TEST.p0) / TEST.n); })();
export const NULL_BEYOND = NULL_SIMS.filter(v => v >= testP - 1e-12).length;
export const nulShown = c => { const run = TEST.sims * TEST.every; return Math.min(TEST.sims, Math.floor((c % (run + TEST.rest)) / TEST.every) + 1); };
export const zCrit = a => normInv(1 - a);                                          // one-sided critical z
// 6.6 α sweeps past the p-value and the decision flips
export const DECIDE = { amin: 0.005, amax: 0.1, run: 12 };
export const decideA = c => sweep(c, DECIDE.amin, DECIDE.amax, DECIDE.run);

// ---------- 6.7 errors and power: the same test when the truth is p = 0.30 ----------
export const POWER = { pa: 0.30, alpha2: 0.10, ns: [100, 200, 400, 800], run: 16, n0: 400 };
export function powerOf(n, a = TEST.alpha, p0 = TEST.p0, pa = POWER.pa) {
  const crit = p0 + zCrit(a) * se1(p0, n);
  return { crit, power: 1 - normCdf(crit, pa, se1(pa, n)), beta: normCdf(crit, pa, se1(pa, n)) };
}
export const powerN = c => Math.round(sweep(c, 100, 800, POWER.run));

// ---------- 6.8–6.9 the difference of two proportions: teens and adults who get news mainly from social media ----------
export const DIFF = { n1: 400, x1: 248, n2: 500, x2: 255, C: 0.95, grow: 2.5, rest: 4 };
export const SMALL = { n1: 100, x1: 62, n2: 100, x2: 51 };
export function twoCI({ n1, x1, n2, x2 }, C = DIFF.C) {
  const p1 = x1 / n1, p2 = x2 / n2, se = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2), me = zStar(C) * se, d = p1 - p2;
  return { p1, p2, d, se, me, lo: d - me, hi: d + me };
}
export const BIG_CI = twoCI(DIFF), SMALL_CI = twoCI(SMALL);
export const diffGrow = c => smooth(loop(c, DIFF.grow, DIFF.rest));

// ---------- 6.10–6.11 a two-sample test: an experiment, text reminders and flu shots ----------
export const FLU = { n1: 150, x1: 87, n2: 150, x2: 66, alpha: 0.05, cols: 15, run: 9 };
export const fluP1 = FLU.x1 / FLU.n1, fluP2 = FLU.x2 / FLU.n2, fluD = fluP1 - fluP2;
export const fluPc = (FLU.x1 + FLU.x2) / (FLU.n1 + FLU.n2);
export const fluSE = Math.sqrt(fluPc * (1 - fluPc) * (1 / FLU.n1 + 1 / FLU.n2));
export const fluZ = fluD / fluSE;
export const fluPV = upper(fluZ);
export const fluCounts = [FLU.n1 * fluPc, FLU.n1 * (1 - fluPc), FLU.n2 * fluPc, FLU.n2 * (1 - fluPc)];
// how far the two groups have slid together (0 apart, 1 pooled), over a run
export const poolU = c => smooth((1 - Math.cos(TAU * c / FLU.run)) / 2 * 1.3 - 0.15);

export { normPdf, normCdf, zStar };
