// Two-variable data: every number the pages quote and the figure draws. The data sets are drawn once from seeded
// generators (dist.js rng), so every visit sees the same points. Each scene reads one clock (seconds); with reduced
// motion each holds its own still moment (STILL).
import { mean, sd, sum, lsrl, rng, gauss } from '../dist.js';

export const loop = (c, run, rest = 0) => Math.min((c % (run + rest)) / run, 1);
export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));
export const STILL = { fit: 3.2, shuffle: 60, table: 0, kinds: 0, corr: 30, line: 2.2, resid: 30, infl: 6.4, logt: 4.6 };
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;
const r1 = v => Math.round(v * 10) / 10;

// ---------- the main data: femur length (cm) and height (cm) of 14 adults ----------
export const FEMUR = (() => {
  const u = rng(20), z = gauss(rng(77)), n = 14;
  const x = Array.from({ length: n }, () => r1(39 + 13 * u())).sort((a, b) => a - b);
  const y = x.map(v => r1(61.4 + 2.38 * v + 3.4 * z()));
  return { x, y, n };
})();
export const LS = lsrl(FEMUR.x, FEMUR.y);                  // a, b, r, r2, mx, my, sx, sy, res, s, seB
export const yhat = x => LS.a + LS.b * x;
export const XR = [Math.min(...FEMUR.x), Math.max(...FEMUR.x)];   // the x range of the data
// the sum of squared residuals of the line through (x̄, ȳ) with slope b; the least-squares slope makes it smallest
export const sse = b => sum(FEMUR.x.map((x, i) => (FEMUR.y[i] - LS.my - b * (x - LS.mx)) ** 2));
export const SSE = sse(LS.b), SST = sum(FEMUR.y.map(y => (y - LS.my) ** 2));
export const SSE0 = sse(0);                                // the flat line ŷ = ȳ: SST
// the same r from femur length in inches: changing units changes nothing
export const R_IN = lsrl(FEMUR.x.map(v => v / 2.54), FEMUR.y).r;
// computer output: standard errors of the coefficients (Unit 9 uses them)
const Sxx = sum(FEMUR.x.map(x => (x - LS.mx) ** 2));
export const SE_A = LS.s * Math.sqrt(1 / FEMUR.n + LS.mx ** 2 / Sxx);

// ---------- the opener and 2.8: a trial line through (x̄, ȳ) swinging to the least-squares slope ----------
export const FIT = { run: 11, rest: 3.5, amp: 2.6, spin: 2.1 };
export function fitSlope(c) {
  const t = c % (FIT.run + FIT.rest), u = Math.min(t / FIT.run, 1);
  return LS.b + FIT.amp * Math.exp(-3.2 * u) * Math.cos(2 * Math.PI * FIT.spin * u) * (1 - smooth((u - 0.85) / 0.15));
}
export const SLOPES = [LS.b - FIT.amp - 0.3, LS.b + FIT.amp + 0.3];   // the slope axis of the SSE board

// ---------- 2.1 are they related? The real pairs, and the heights shuffled among the femurs ----------
export const SHUF = { k: 40, each: 1.6 };
const perm = (n, u) => { const p = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(u() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; };
export const SHUFFLES = (() => { const u = rng(5); return Array.from({ length: SHUF.k }, () => perm(FEMUR.n, u)); })();
export const SHUF_R = SHUFFLES.map(p => lsrl(FEMUR.x, p.map(i => FEMUR.y[i])).r);
export const SHUF_MAX = Math.max(...SHUF_R.map(Math.abs));
// which shuffle is showing at clock c, and how far its points have slid there (0 → 1)
export const shufAt = c => { const k = Math.floor(c / SHUF.each), u = (c % SHUF.each) / SHUF.each; return { k: k % SHUF.k, done: Math.min(k, SHUF.k), u: smooth(u / 0.45) }; };

// ---------- 2.2–2.3 two categorical variables: where 300 students live, and how they get to school ----------
export const CAT = {
  rows: ['city', 'suburb', 'rural'],
  cols: ['walk or bike', 'bus', 'car'],
  n: [[48, 36, 16], [22, 50, 48], [6, 30, 44]],
};
export const ROWT = CAT.n.map(r => sum(r));                       // 100, 120, 80
export const COLT = CAT.cols.map((_, j) => sum(CAT.n.map(r => r[j])));
export const TOT = sum(ROWT);
export const COND = CAT.n.map((r, i) => r.map(v => v / ROWT[i]));  // how each group travels: rows sum to 1
export const MARG = COLT.map(v => v / TOT);                        // everyone together
export const JOINT = CAT.n.map(r => r.map(v => v / TOT));
export const COLCOND = CAT.n.map(r => r.map((v, j) => v / COLT[j]));  // of the car riders, the share from each place

// ---------- 2.4–2.5 four kinds of scatter, 20 points each ----------
export const KINDS = (() => {
  const mk = (seed, f, sdz) => { const u = rng(seed), z = gauss(rng(seed + 100)); const x = Array.from({ length: 20 }, () => 10 * u()); return { x, y: x.map(v => f(v) + sdz * z()) }; };
  const k = {
    pos: { ...mk(3, x => 1 + 0.75 * x, 0.6), name: 'strong, positive, linear' },
    neg: { ...mk(8, x => 8.5 - 0.5 * x, 1.6), name: 'moderate, negative, linear' },
    curved: { ...mk(15, x => 9 - 0.33 * (x - 5) ** 2, 0.35), name: 'strong, curved' },
    none: { ...mk(21, () => 5, 1.5), name: 'no association' },
  };
  for (const v of Object.values(k)) v.r = lsrl(v.x, v.y).r;
  return k;
})();

// ---------- 2.5 correlation as the average product of z-scores ----------
export const ZX = FEMUR.x.map(x => (x - LS.mx) / LS.sx), ZY = FEMUR.y.map(y => (y - LS.my) / LS.sy);
export const PROD = ZX.map((z, i) => z * ZY[i]);
export const PROD_SUM = sum(PROD);
export const CORR = { each: 0.9, rest: 4 };
// how many products are in so far at clock c
export const corrN = c => { const t = c % (FEMUR.n * CORR.each + CORR.rest); return Math.min(FEMUR.n, t / CORR.each); };
export const partSum = k => sum(PROD.slice(0, Math.floor(k)));

// ---------- 2.6 a prediction, and an extrapolation ----------
export const PRED = { x: 45.0, far: 30.0, lo: 28, hi: 56, run: 9 };
export const predX = c => { const u = (c % PRED.run) / PRED.run; return PRED.lo + 4 + (PRED.hi - PRED.lo - 6) * (1 - Math.cos(2 * Math.PI * u)) / 2; };
export const inRange = x => x >= XR[0] && x <= XR[1];

// ---------- 2.7 residuals, one at a time, dropped onto the residual plot ----------
export const RES = { each: 1.1, rest: 3 };
export const resAt = c => { const t = c % (FEMUR.n * RES.each + RES.rest), k = t / RES.each; return { k: Math.min(Math.floor(k), FEMUR.n), u: Math.min(k - Math.floor(k), 1) }; };
// the point farthest above its line, and farthest below
export const RMAX = LS.res.indexOf(Math.max(...LS.res)), RMIN = LS.res.indexOf(Math.min(...LS.res));

// ---------- 2.9 one more point, moved: leverage, outliers and influence ----------
export const XP = (() => {
  const far = 66, mid = r1(LS.mx);
  return {
    far, keys: [
      { x: far, y: r1(yhat(far)), kind: 'high leverage, on the line' },
      { x: far, y: r1(yhat(far) - 26), kind: 'high leverage, off the line: influential' },
      { x: mid, y: r1(yhat(mid) + 18), kind: 'an outlier in y, near x̄' },
    ], run: 13,
  };
})();
export const withPoint = (px, py) => lsrl([...FEMUR.x, px], [...FEMUR.y, py]);
export const XFITS = XP.keys.map(k => withPoint(k.x, k.y));
// the extra point's place at clock c: it rests at each key, moving between them
export function xpAt(c) {
  const t = (c % XP.run) / XP.run * 3, k = Math.floor(t), u = smooth(Math.max(0, (t - k - 0.55) / 0.45));
  const a = XP.keys[k % 3], b = XP.keys[(k + 1) % 3];
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, key: u < 0.5 ? k % 3 : (k + 1) % 3 };
}

// ---------- 2.9 a curve straightened: a bacteria culture counted every hour ----------
export const BACT = (() => {
  const z = gauss(rng(41)), t = Array.from({ length: 11 }, (_, i) => i);
  const y = t.map(h => Math.round(40 * 1.45 ** h * Math.exp(0.07 * z())));
  return { t, y, logy: y.map(Math.log10) };
})();
export const FIT_RAW = lsrl(BACT.t, BACT.y), FIT_LOG = lsrl(BACT.t, BACT.logy);
export const LOGT = { run: 12, at: 8.5 };                  // a prediction at 8.5 hours, from the log model
export const LOG_PRED = 10 ** (FIT_LOG.a + FIT_LOG.b * LOGT.at);
export const GROWTH = 10 ** FIT_LOG.b;                     // the count is multiplied by this each hour
// how far the curve is straightened at clock c: 0 the counts, 1 their logarithms (held at each end)
export const logU = c => { const u = (c % LOGT.run) / LOGT.run; return smooth((u < 0.5 ? u : 1 - u) * 4 - 0.5); };
// both scales mapped onto 0 → 1, so one board can show either, and anything between
const ymax = Math.max(...BACT.y), lmin = 1, lmax = Math.ceil(Math.max(...BACT.logy) * 2) / 2;
export const BSCALE = { ymax: Math.ceil(ymax / 500) * 500, lmin, lmax };
export const bNorm = (y, u) => (1 - u) * y / BSCALE.ymax + u * (Math.log10(y) - lmin) / (lmax - lmin);
export const bFit = u => lsrl(BACT.t, BACT.y.map(y => bNorm(y, u)));

export { mean, sd };
