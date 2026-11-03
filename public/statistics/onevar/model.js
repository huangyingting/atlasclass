// One-variable data: every number the pages quote and the figure draws. The data sets come from seeded draws, so
// every visit (and every check) sees the same class. Each scene reads one clock (seconds) through the helpers below;
// with reduced motion each scene holds its own still moment (STILL).
import { mean, sd, median, fiveNum, fences, rng, gauss, normCdf, normInv, normPdf } from '../dist.js';
export { mean, sd, median, fiveNum, fences, normCdf, normInv, normPdf };

export const loop = (c, run, rest = 0) => Math.min((c % (run + rest)) / run, 1);
export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));
export const sweep = (c, a, b, p) => a + (b - a) * (1 - Math.cos(2 * Math.PI * c / p)) / 2;
// progress 0 → 1 of a stage that runs from a to b seconds
export const stage = (t, a, b) => smooth((t - a) / (b - a));
export const STILL = { drop: 11.5, cat: 6, shapes: 0, centre: 2.5, spread: 11, units: 9, box: 12, compare: 0, normal: 1.5, ncalc: 6.2, check: 0 };
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;
const sorted = a => [...a].sort((x, y) => x - y);
const draw = (seed, n, f) => { const u = rng(seed), z = gauss(u); return Array.from({ length: n }, () => f(u, z)); };

// ---------- the class: 40 students, how each gets to school and how long it takes (minutes) ----------
// times are lognormal within each mode (a few long trips, none below zero), rounded to whole minutes
export const MODES = ['walk', 'bike', 'bus', 'car'];
export const CLASS = { seed: 88, n: 40, p: [0.2, 0.15, 0.35, 0.3], typical: { walk: [10, 0.35], bike: [14, 0.3], bus: [27, 0.3], car: [16, 0.35] } };
export const STUDENTS = draw(CLASS.seed, CLASS.n, (u, z) => {
  const r = u(); let k = 0, acc = CLASS.p[0];
  while (r > acc && k < 3) acc += CLASS.p[++k];
  const [m, s] = CLASS.typical[MODES[k]];
  return { mode: MODES[k], time: Math.max(3, Math.round(m * Math.exp(s * z()))) };
});
export const TIMES = STUDENTS.map(s => s.time);
export const SORTED = sorted(TIMES);
export const N = TIMES.length;
export const MEAN = mean(TIMES), SD = sd(TIMES), FIVE = fiveNum(TIMES), FENCE = fences(TIMES);
export const IQR = FIVE.q3 - FIVE.q1, RANGE = FIVE.max - FIVE.min;
export const OUTLIERS = TIMES.filter(t => t < FENCE.lo || t > FENCE.hi);
// whiskers reach the furthest values inside the fences
export const WHISK = { lo: Math.min(...TIMES.filter(t => t >= FENCE.lo)), hi: Math.max(...TIMES.filter(t => t <= FENCE.hi)) };
// one student, singled out on page 1.1
export const ONE = 4;

// the categorical variable: counts and relative frequencies
export const COUNT = Object.fromEntries(MODES.map(m => [m, STUDENTS.filter(s => s.mode === m).length]));
export const REL = Object.fromEntries(MODES.map(m => [m, COUNT[m] / N]));
export const BYMODE = Object.fromEntries(MODES.map(m => [m, STUDENTS.filter(s => s.mode === m).map(s => s.time)]));

// histogram: 5-minute bins from 0 to 60, and the cumulative relative frequency at each bin's right end
export const BIN = { w: 5, lo: 0, hi: 60 };
export const BINS = Array.from({ length: (BIN.hi - BIN.lo) / BIN.w }, (_, i) => {
  const a = BIN.lo + i * BIN.w, b = a + BIN.w;
  return { a, b, n: TIMES.filter(t => t >= a && t < b).length };
});
export const CUM = BINS.map((_, i) => BINS.slice(0, i + 1).reduce((s, b) => s + b.n, 0) / N);
// the cumulative graph (ogive): (0, 0), then each bin's right end; the median read where it crosses 0.5
export const OGIVE = [[BIN.lo, 0], ...BINS.map((b, i) => [b.b, CUM[i]])];
export const readOgive = p => { const k = OGIVE.findIndex(([, c]) => c >= p), [x0, c0] = OGIVE[k - 1], [x1, c1] = OGIVE[k]; return x0 + (x1 - x0) * (p - c0) / (c1 - c0); };
export const OGIVE_MED = readOgive(0.5);
// the stemplot: tens as stems, ones as leaves
export const STEMS = Array.from({ length: Math.floor(FIVE.max / 10) + 1 }, (_, s) => ({ stem: s, leaves: SORTED.filter(t => Math.floor(t / 10) === s).map(t => t % 10) }));
// a percentile read from the data: the share of students under a time (as the cumulative graph counts)
export const pctAt = t => TIMES.filter(v => v < t).length / N;
export const PCT = { t: 25 };

// the opener and 1.5: the students drop one by one into the dotplot, then the histogram rises beneath
export const DROP = { each: 0.2, fall: 0.6, bars: [9, 10.5], period: 15 };
export const dropT = c => c % DROP.period;
export const landed = t => Math.max(0, Math.min(N, Math.floor((t - DROP.fall) / DROP.each) + 1));

// 1.2–1.4: the same students sorted by mode, from the dotplot into columns and back
export const CAT = { period: 13, out: [1, 4.2], back: [10, 12.5] };
export const catU = c => { const t = c % CAT.period; return stage(t, ...CAT.out) * (1 - stage(t, ...CAT.back)); };

// ---------- 1.6 four shapes ----------
const HEIGHT = { seed: 7, n: 200, mu: 163, sigma: 7 };
export { HEIGHT };
export const HEIGHTS = draw(HEIGHT.seed, HEIGHT.n, (u, z) => Math.round((HEIGHT.mu + HEIGHT.sigma * z()) * 10) / 10);
export const QUIZ = draw(23, 60, (u, z) => Math.min(20, Math.max(4, 20 - Math.round(Math.exp(0.9 + 0.6 * z())))));
export const GEYSER = draw(9, 80, (u, z) => Math.round(u() < 0.4 ? 54 + 5 * z() : 80 + 6 * z()));
export const SHAPES = [
  { key: 'sym', name: 'roughly symmetric', what: 'heights of 200 women (cm)', data: HEIGHTS, x: [140, 188], w: 3 },
  { key: 'right', name: 'skewed right', what: 'commute times of the class (min)', data: TIMES, x: [0, 60], w: 5 },
  { key: 'left', name: 'skewed left', what: 'scores on an easy 20-point quiz', data: QUIZ, x: [3.5, 20.5], w: 1 },
  { key: 'bi', name: 'bimodal', what: 'minutes between geyser eruptions', data: GEYSER, x: [36, 100], w: 4 },
].map(s => ({ ...s, mean: mean(s.data), median: median(s.data), bins: Array.from({ length: Math.round((s.x[1] - s.x[0]) / s.w) }, (_, i) => {
  const a = s.x[0] + i * s.w; return [a, a + s.w, s.data.filter(v => v >= a && v < a + s.w).length]; }) }));

// ---------- 1.7 centre: nine of the class, on a balance beam; one value slides out ----------
export const NINE = TIMES.slice(0, 9);
export const NINE_TOP = NINE.indexOf(Math.max(...NINE));
export const SLIDE = { by: 30, period: 10 };
export const nineAt = c => { const d = sweep(c, 0, SLIDE.by, SLIDE.period); return NINE.map((v, i) => i === NINE_TOP ? v + d : v); };
export const NINE_MEAN = mean(NINE), NINE_MED = median(NINE);
export const NINE_OUT = NINE.map((v, i) => i === NINE_TOP ? v + SLIDE.by : v);

// ---------- 1.7 spread: the deviations of the nine from their mean ----------
export const DEV = NINE.map(v => v - NINE_MEAN);
export const SS = DEV.reduce((s, d) => s + d * d, 0);
export const NINE_SD = Math.sqrt(SS / (NINE.length - 1));
export const NINE_FIVE = fiveNum(NINE);
export const SPREAD = { each: 0.9, start: 0.6, period: 14 };
export const devShown = t => Math.max(0, Math.min(NINE.length, Math.floor((t - SPREAD.start) / SPREAD.each) + 1));

// ---------- 1.7 changing units: ten daily highs, °C → °F, F = 1.8C + 32 ----------
export const TEMP = { a: 32, b: 1.8, period: 13, scale: [2, 4.5], shift: [6, 8.5] };
export const CELS = draw(31, 10, (u, z) => Math.round(22 + 3.5 * z()));
export const FAHR = CELS.map(c => TEMP.a + TEMP.b * c);
export const C_MEAN = mean(CELS), C_SD = sd(CELS), F_MEAN = mean(FAHR), F_SD = sd(FAHR);
export const C_IQR = fiveNum(CELS).q3 - fiveNum(CELS).q1;
// each value part-way: scaled by 1 → b, then shifted by 0 → a
export const unitsAt = c => { const t = c % TEMP.period, k = 1 + (TEMP.b - 1) * stage(t, ...TEMP.scale), a = TEMP.a * stage(t, ...TEMP.shift); return { t, k, a, vals: CELS.map(v => a + k * v) }; };

// ---------- 1.8 the boxplot, assembled over the dotplot ----------
export const BOX = { period: 15, quart: [1, 2.5], box: [2.5, 4], fence: [4.5, 6], whisk: [6.5, 8], out: [8, 9], hold: 13.5 };
export const boxT = c => c % BOX.period;

// ---------- 1.9 bus against car ----------
export const BUS = BYMODE.bus, CAR = BYMODE.car;
export const BUS5 = fiveNum(BUS), CAR5 = fiveNum(CAR), BUSF = fences(BUS), CARF = fences(CAR);
export const BUS_OUT = BUS.filter(t => t < BUSF.lo || t > BUSF.hi), CAR_OUT = CAR.filter(t => t < CARF.lo || t > CARF.hi);
export const whiskOf = (a, f) => ({ lo: Math.min(...a.filter(t => t >= f.lo)), hi: Math.max(...a.filter(t => t <= f.hi)) });

// ---------- 1.10 the normal model of heights ----------
export const H_MEAN = mean(HEIGHTS), H_SD = sd(HEIGHTS);
export const H_BIN = 3, H_RANGE = [139, 187];
export const H_BINS = Array.from({ length: (H_RANGE[1] - H_RANGE[0]) / H_BIN }, (_, i) => { const a = H_RANGE[0] + i * H_BIN; return [a, a + H_BIN, HEIGHTS.filter(v => v >= a && v < a + H_BIN).length]; });
// the share of the 200 within 1, 2, 3 SD of their own mean, against the empirical rule
export const WITHIN = [1, 2, 3].map(k => HEIGHTS.filter(v => Math.abs(v - H_MEAN) <= k * H_SD).length / HEIGHT.n);
export const RULE = [1, 2, 3].map(k => normCdf(k) - normCdf(-k));
export const BAND = { each: 4 };
export const bandK = c => 1 + Math.floor((c % (3 * BAND.each)) / BAND.each);
// z-score examples: one woman 175 cm tall; a cut-off
export const Z_EX = { x: 175 };
export const zOf = (x, mu = HEIGHT.mu, s = HEIGHT.sigma) => (x - mu) / s;
// normal calculations: below a height, between two, and the height at a percentile
export const CALC = { below: 170, between: [155, 170], pct: 0.90, period: 12, sweep: [150, 178] };
export const P_BELOW = normCdf(CALC.below, HEIGHT.mu, HEIGHT.sigma);
export const P_BETWEEN = normCdf(CALC.between[1], HEIGHT.mu, HEIGHT.sigma) - normCdf(CALC.between[0], HEIGHT.mu, HEIGHT.sigma);
export const X_PCT = normInv(CALC.pct, HEIGHT.mu, HEIGHT.sigma);
export const calcX = c => sweep(c, CALC.sweep[0], CALC.sweep[1], CALC.period);

// ---------- 1.10 checking normality: normal probability plots ----------
// each value against the z-score expected for its rank, Φ⁻¹((i − 0.5)/n)
export const nplot = a => sorted(a).map((v, i) => [normInv((i + 0.5) / a.length), v]);
export const NP_H = nplot(HEIGHTS), NP_T = nplot(TIMES);
