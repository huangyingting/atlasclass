// Probability model: every number the pages quote and the figure draws. Pure functions over named data; every
// "random" thing is drawn from a seeded rng (dist.js), so each visit and each check sees the same outcomes. Each scene
// reads one clock (seconds) through clk(); with reduced motion it holds its own still moment (STILL).
import { rng, sum, binomPdf, binomCdf, geomPdf, geomCdf, normCdf } from '../dist.js';

export const loop = (c, run, rest = 0) => Math.min((c % (run + rest)) / run, 1);
export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));
export const STILL = { galton: 30, runs: 8, lln: 14, dice: 5.2, venn: 14, tree: 13, rv: 14, linear: 9.5, sum: 4.2, geom: 22.5 };
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;
// a discrete distribution {x: [...], p: [...]}: its mean, standard deviation and cumulative probabilities
export const muOf = D => sum(D.x.map((x, i) => x * D.p[i]));
export const sdOf = D => { const m = muOf(D); return Math.sqrt(sum(D.x.map((x, i) => (x - m) ** 2 * D.p[i]))); };
export const cumOf = D => D.p.map((_, i) => sum(D.p.slice(0, i + 1)));
// a draw from D, given a uniform u
export const drawOf = (D, u) => { let c = 0; for (let i = 0; i < D.x.length; i++) { c += D.p[i]; if (u < c) return D.x[i]; } return D.x.at(-1); };

// ---------- the opener, 4.10 and 4.11: a Galton board. n rows of pins; at each a ball goes right with probability p ----------
export const GAL = { n: 10, p: 0.5, balls: 240, gap: 0.045, row: 0.15, drop: 0.45, rest: 3.5 };
const gr = rng(4410);
export const PATHS = Array.from({ length: GAL.balls }, () => Array.from({ length: GAL.n }, () => gr() < GAL.p ? 1 : 0));
export const BINOF = PATHS.map(p => sum(p));                       // X for each ball: how many times it went right
export const SLOT = BINOF.map((k, i) => BINOF.slice(0, i).filter(j => j === k).length);   // its place in its bin's stack
export const landT = i => i * GAL.gap + GAL.n * GAL.row + GAL.drop;
export const GAL_RUN = landT(GAL.balls - 1);
export const galT = c => c % (GAL_RUN + GAL.rest);
export const countsAt = t => { const c = Array(GAL.n + 1).fill(0); BINOF.forEach((k, i) => { if (landT(i) <= t) c[k]++; }); return c; };
export const COUNTS = countsAt(Infinity);
export const PMF = Array.from({ length: GAL.n + 1 }, (_, k) => binomPdf(k, GAL.n, GAL.p));
export const MU_B = GAL.n * GAL.p, SD_B = Math.sqrt(GAL.n * GAL.p * (1 - GAL.p));
export const GK = 6;                                                // the bin worked on 4.10
export const PATHS_K = Math.round(PMF[GK] * 2 ** GAL.n);            // C(10, 6): routes into bin 6
export const P_GE8 = 1 - binomCdf(7, GAL.n, GAL.p);
export const IN_1SD = sum(PMF.filter((_, k) => Math.abs(k - MU_B) <= SD_B));
// the worked example: a free-throw shooter who makes 70%, ten shots
export const FT = { n: 10, p: 0.7, k: 8 };
export const FT_P = binomPdf(FT.k, FT.n, FT.p), FT_GE = 1 - binomCdf(FT.k - 1, FT.n, FT.p), FT_LE = binomCdf(FT.k - 1, FT.n, FT.p);
export const FT_MU = FT.n * FT.p, FT_SD = Math.sqrt(FT.n * FT.p * (1 - FT.p));

// ---------- 4.1 random or not? 50 real tosses, 50 made up by a person ----------
export const RUNS = { n: 50, seed: 4101, sims: 10000, each: 0.1, rest: 4,
  invented: 'HTHHTHTTHTHHHTHTTHHTHTHTTHTHHTTHTHTHHTHTTTHTHHTHTT' };
const rr = rng(RUNS.seed);
export const REAL = Array.from({ length: RUNS.n }, () => rr() < 0.5 ? 1 : 0);   // 1 heads, 0 tails
export const INVENTED = [...RUNS.invented].map(ch => ch === 'H' ? 1 : 0);
export function longest(seq) {
  let best = { len: 1, start: 0 }, len = 1;
  for (let i = 1; i < seq.length; i++) { len = seq[i] === seq[i - 1] ? len + 1 : 1; if (len > best.len) best = { len, start: i - len + 1 }; }
  return best;
}
export const switches = seq => seq.slice(1).filter((v, i) => v !== seq[i]).length;
export const REAL_RUN = longest(REAL), INV_RUN = longest(INVENTED), REAL_SW = switches(REAL), INV_SW = switches(INVENTED);
export const HEADS_REAL = sum(REAL), HEADS_INV = sum(INVENTED);
// the longest run in each of 10 000 simulated sets of 50 fair tosses
const rs = rng(4102);
export const SIM_LONG = Array.from({ length: RUNS.sims }, () => longest(Array.from({ length: RUNS.n }, () => rs() < 0.5 ? 1 : 0)).len);
export const LONG_HIST = Array.from({ length: 13 }, (_, k) => SIM_LONG.filter(v => v === k).length);   // lengths 0–12
export const fracLong = (pred) => SIM_LONG.filter(pred).length / RUNS.sims;
export const P_LE_INV = fracLong(v => v <= INV_RUN.len);           // as short as the made-up one
export const P_GE_REAL = fracLong(v => v >= REAL_RUN.len);
export const P_GE5 = fracLong(v => v >= 5);
export const runsT = c => c % (RUNS.n * RUNS.each + RUNS.rest);

// ---------- 4.2 the law of large numbers: the proportion of sixes as the rolls pile up ----------
export const LLN = { n: 600, runs: 4, seed: 4201, run: 12, rest: 3 };
const rl = rng(LLN.seed);
export const ROLLS = Array.from({ length: LLN.runs }, () => Array.from({ length: LLN.n }, () => 1 + Math.floor(rl() * 6)));
export const PROP = ROLLS.map(r => { let s = 0; return r.map((v, i) => (s += v === 6) / (i + 1)); });   // after i + 1 rolls
export const llnN = c => Math.max(1, Math.ceil(LLN.n * loop(c, LLN.run, LLN.rest) ** 2));
export const facesAt = n => [1, 2, 3, 4, 5, 6].map(f => ROLLS[0].slice(0, n).filter(v => v === f).length);
export const LLN_AT = [10, 50, 600].map(n => ({ n, sixes: Math.round(PROP[0][n - 1] * n), prop: PROP[0][n - 1] }));
// a simulation: the chance of at least one six in four rolls, from 1000 trials of four rolls
export const SIM4 = { trials: 1000, rolls: 4, seed: 4202, show: 6 };
const r4 = rng(SIM4.seed);
export const SIM4_TRIALS = Array.from({ length: SIM4.trials }, () => Array.from({ length: SIM4.rolls }, () => 1 + Math.floor(r4() * 6)));
export const SIM4_HITS = SIM4_TRIALS.filter(t => t.includes(6)).length;
export const SIM4_EXACT = 1 - (5 / 6) ** SIM4.rolls;

// ---------- 4.3 two dice: 36 equally likely outcomes ----------
export const DICE = Array.from({ length: 36 }, (_, i) => [1 + (i % 6), 1 + Math.floor(i / 6)]);   // [first, second]
export const SEVENS = DICE.filter(([a, b]) => a + b === 7);
export const P7 = SEVENS.length / 36, PNOT7 = 1 - P7;
export const AT_LEAST_ONE6 = DICE.filter(([a, b]) => a === 6 || b === 6).length;   // 11
export const DROLL = { n: 120, each: 0.7, seed: 4301 };
const rd = rng(DROLL.seed);
export const DROLLS = Array.from({ length: DROLL.n }, () => [1 + Math.floor(rd() * 6), 1 + Math.floor(rd() * 6)]);
export const rollIdx = c => Math.floor(c / DROLL.each) % DROLL.n;
export const sevensUpTo = k => DROLLS.slice(0, k + 1).filter(([a, b]) => a + b === 7).length;

// ---------- 4.4 and 4.6 Venn diagrams: areas are probabilities ----------
export const VENN = { W: 7.2, H: 4.6 };
export const AREA = VENN.W * VENN.H;
export const BLOOD = { O: 0.44, A: 0.42, B: 0.10, AB: 0.04 };       // ABO blood types, one person
export const P_A_OR_B = BLOOD.A + BLOOD.B;
export const COURSE = { S: 0.35, B: 0.25, SB: 0.10 };               // a student takes AP Statistics, AP Biology, both
export const P_UNION = COURSE.S + COURSE.B - COURSE.SB, P_NEITHER = 1 - P_UNION;
export const P_S_GIVEN_B = COURSE.SB / COURSE.B, P_B_GIVEN_S = COURSE.SB / COURSE.S, P_S_TIMES_B = COURSE.S * COURSE.B;
export const P_S_ONLY = COURSE.S - COURSE.SB, P_B_ONLY = COURSE.B - COURSE.SB;
export const radius = p => Math.sqrt(p * AREA / Math.PI);
// the area shared by two circles of radii a and b whose centres are d apart; and the d that makes it `area`
export function lens(a, b, d) {
  if (d >= a + b) return 0;
  if (d <= Math.abs(a - b)) return Math.PI * Math.min(a, b) ** 2;
  return a * a * Math.acos((d * d + a * a - b * b) / (2 * d * a)) + b * b * Math.acos((d * d + b * b - a * a) / (2 * d * b))
    - 0.5 * Math.sqrt((-d + a + b) * (d + a - b) * (d - a + b) * (d + a + b));
}
export function apart(a, b, area) { let lo = Math.abs(a - b), hi = a + b; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2; if (lens(a, b, m) > area) lo = m; else hi = m; } return (lo + hi) / 2; }
// the circles in board coordinates (the rectangle's centre at 0, 0)
const rA = radius(BLOOD.A), rB = radius(BLOOD.B);
export const LEFT = { A: { c: [-VENN.W / 2 + 0.3 + rA, -0.05], r: rA }, B: { c: [VENN.W / 2 - 0.45 - rB, 0.75], r: rB } };
const rS = radius(COURSE.S), rBi = radius(COURSE.B), dSB = apart(rS, rBi, COURSE.SB * AREA), dl = (rS - rBi) / 2;
export const RIGHT = { S: { c: [-dSB / 2 + dl, 0.1], r: rS }, B: { c: [dSB / 2 + dl, 0.1], r: rBi }, d: dSB };
export const inC = ([x, y], C) => (x - C.c[0]) ** 2 + (y - C.c[1]) ** 2 <= C.r * C.r;
// darts thrown at random into the rectangle
export const DARTS = { n: 400, run: 12, rest: 3, seed: 4401 };
const rv = rng(DARTS.seed);
export const DART = Array.from({ length: DARTS.n }, () => [(rv() - 0.5) * VENN.W, (rv() - 0.5) * VENN.H]);
export const dartsN = c => Math.floor(DARTS.n * loop(c, DARTS.run, DARTS.rest));
export const hits = (n, test) => DART.slice(0, n).filter(test).length;

// ---------- 4.5 a two-way table, and conditioning on a row ----------
export const TXT = { rows: ['16–24', '25 and older'], cols: ['texted', 'did not'], n: [[72, 48], [95, 285]] };
export const ROWT = TXT.n.map(r => sum(r)), COLT = [0, 1].map(j => TXT.n[0][j] + TXT.n[1][j]), TOT = sum(ROWT);
export const P_T = COLT[0] / TOT, P_Y = ROWT[0] / TOT, P_TY = TXT.n[0][0] / TOT;
export const P_T_GIVEN_Y = TXT.n[0][0] / ROWT[0], P_Y_GIVEN_T = TXT.n[0][0] / COLT[0], P_T_GIVEN_O = TXT.n[1][0] / ROWT[1];

// ---------- 4.5 a tree diagram: a screening test ----------
export const TEST = { prev: 0.04, sens: 0.90, fpr: 0.10, people: 1000 };
export const LEAVES = [                                              // the four paths: [has it, tests positive, probability]
  [1, 1, TEST.prev * TEST.sens], [1, 0, TEST.prev * (1 - TEST.sens)], [0, 1, (1 - TEST.prev) * TEST.fpr], [0, 0, (1 - TEST.prev) * (1 - TEST.fpr)]];
export const P_POS = LEAVES[0][2] + LEAVES[2][2], P_D_POS = LEAVES[0][2] / P_POS, P_ND_NEG = LEAVES[3][2] / (LEAVES[1][2] + LEAVES[3][2]);
export const NAT = LEAVES.map(l => Math.round(l[2] * TEST.people));  // per 1000 people
export const TREE = { tokens: 400, gap: 0.025, travel: 2.4, rest: 2.5, seed: 4501 };
const rt = rng(TREE.seed);
export const TOKENS = Array.from({ length: TREE.tokens }, () => { const d = rt() < TEST.prev ? 1 : 0; return [d, rt() < (d ? TEST.sens : TEST.fpr) ? 1 : 0]; });
export const TREE_RUN = (TREE.tokens - 1) * TREE.gap + TREE.travel;
export const treeT = c => c % (TREE_RUN + TREE.rest);
export const leafOf = ([d, pos]) => d ? (pos ? 0 : 1) : (pos ? 2 : 3);
export const leafCounts = t => { const c = [0, 0, 0, 0]; TOKENS.forEach((tk, i) => { if (i * TREE.gap + TREE.travel <= t) c[leafOf(tk)]++; }); return c; };

// ---------- 4.7 and 4.8 a discrete random variable: X = cars in a household ----------
export const CARS = { x: [0, 1, 2, 3, 4], p: [0.08, 0.32, 0.38, 0.15, 0.07] };
export const MU_X = muOf(CARS), SD_X = sdOf(CARS), CUM = cumOf(CARS);
export const EX2 = sum(CARS.x.map((x, i) => x * x * CARS.p[i]));
export const P_GE2 = 1 - CUM[1], P_1TO3 = CUM[3] - CUM[0];
export const RVD = { n: 500, run: 12, rest: 3, seed: 4701 };
const rx = rng(RVD.seed);
export const XDRAWS = Array.from({ length: RVD.n }, () => drawOf(CARS, rx()));
export const rvN = c => Math.max(1, Math.ceil(RVD.n * loop(c, RVD.run, RVD.rest) ** 2));
export const obsFreq = n => CARS.x.map(v => XDRAWS.slice(0, n).filter(d => d === v).length / n);
export const runMean = n => sum(XDRAWS.slice(0, n)) / n;

// ---------- 4.9 a linear transformation: a wheel game, Y = a + bX dollars ----------
export const WHEEL = { x: [1, 2, 3, 4], p: [0.4, 0.3, 0.2, 0.1], a: -7, b: 3 };
export const MU_W = muOf(WHEEL), SD_W = sdOf(WHEEL);
export const GAIN = { x: WHEEL.x.map(x => WHEEL.a + WHEEL.b * x), p: WHEEL.p };
export const MU_G = muOf(GAIN), SD_G = sdOf(GAIN);
export const P_WIN = sum(GAIN.p.filter((_, i) => GAIN.x[i] > 0));
// the morph: hold X, stretch by b, hold, shift by a, hold, then back
export const LIN = { hold: 2, move: 2, pause: 1.5, end: 3, back: 1 };
export const LIN_RUN = LIN.hold + LIN.move + LIN.pause + LIN.move + LIN.end + LIN.back;
export function linPhase(c) {
  let t = c % LIN_RUN; const st = (d) => { const u = t / d; t -= d; return u; };
  if (t < LIN.hold) return { s: 0, h: 0 }; st(LIN.hold);
  if (t < LIN.move) return { s: smooth(t / LIN.move), h: 0 }; st(LIN.move);
  if (t < LIN.pause) return { s: 1, h: 0 }; st(LIN.pause);
  if (t < LIN.move) return { s: 1, h: smooth(t / LIN.move) }; st(LIN.move);
  if (t < LIN.end) return { s: 1, h: 1 }; st(LIN.end);
  const u = 1 - smooth(t / LIN.back); return { s: u, h: u };
}
// a value x mid-morph: stretched by a fraction s of the way to b, shifted a fraction h of the way to a
export const morph = (x, { s, h }) => x * (1 + (WHEEL.b - 1) * s) + WHEEL.a * h;

// ---------- 4.9 a sum of independent random variables: the wheel plus a die ----------
export const DIE = { x: [1, 2, 3, 4, 5, 6], p: Array(6).fill(1 / 6) };
export const MU_D = muOf(DIE), SD_D = sdOf(DIE);
export function convolve(A, B, sign = 1) {
  const m = new Map();
  A.x.forEach((a, i) => B.x.forEach((b, j) => { const v = a + sign * b; m.set(v, (m.get(v) || 0) + A.p[i] * B.p[j]); }));
  const x = [...m.keys()].sort((u, v) => u - v);
  return { x, p: x.map(v => m.get(v)) };
}
export const TSUM = convolve(WHEEL, DIE), TDIFF = convolve(DIE, WHEEL, -1);   // T = X + Y; D = Y − X
export const MU_T = muOf(TSUM), SD_T = sdOf(TSUM), MU_DF = muOf(TDIFF), SD_DF = sdOf(TDIFF);
export const SUMD = { n: 80, each: 1.1, seed: 4901 };
const rp = rng(SUMD.seed);
export const PAIRS = Array.from({ length: SUMD.n }, () => [drawOf(WHEEL, rp()), drawOf(DIE, rp())]);
export const pairIdx = c => Math.floor(c / SUMD.each) % SUMD.n;
// combining normal variables (4.9): two independent normal times
export const RUNW = { mu1: 24.0, sd1: 1.5, mu2: 26.5, sd2: 2.0 };     // two legs of a relay, minutes
export const RUNW_MU = RUNW.mu1 + RUNW.mu2, RUNW_SD = Math.hypot(RUNW.sd1, RUNW.sd2);
export const RUNW_T = 48, RUNW_Z = (RUNW_T - RUNW_MU) / RUNW_SD, RUNW_P = normCdf(RUNW_T, RUNW_MU, RUNW_SD);   // P(total < 48 min)

// ---------- 4.12 the geometric distribution: boxes opened until the first prize ----------
export const PRIZE = { p: 0.2, show: 15, each: 0.32, gapRun: 0.9, seed: 4121, runs: 40 };
export const GPMF = Array.from({ length: PRIZE.show }, (_, k) => geomPdf(k + 1, PRIZE.p));   // x = 1 … 15
export const MU_GE = 1 / PRIZE.p, SD_GE = Math.sqrt(1 - PRIZE.p) / PRIZE.p;
export const G_K = 3, P_G3 = geomPdf(3, PRIZE.p), P_LE3 = geomCdf(3, PRIZE.p), P_GT5 = (1 - PRIZE.p) ** 5;
const rg = rng(PRIZE.seed);
// each run: how many boxes until the first prize (capped at the row's length, so every run fits)
export const GRUNS = []; while (GRUNS.length < PRIZE.runs) { let k = 1; while (rg() >= PRIZE.p) k++; if (k <= PRIZE.show) GRUNS.push(k); }
export const GSTART = GRUNS.map((_, i) => sum(GRUNS.slice(0, i).map(k => k * PRIZE.each + PRIZE.gapRun)));
export const GEO_RUN = GSTART.at(-1) + GRUNS.at(-1) * PRIZE.each + PRIZE.gapRun;
// the run playing at clock c, and how many boxes of it are open
export function geomAt(c) {
  const t = c % GEO_RUN; let i = 0; while (i < GRUNS.length - 1 && GSTART[i + 1] <= t) i++;
  return { i, open: Math.min(GRUNS[i], Math.floor((t - GSTART[i]) / PRIZE.each) + 1), done: t - GSTART[i] >= GRUNS[i] * PRIZE.each };
}
