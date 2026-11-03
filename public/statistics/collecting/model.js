// Collecting data: every number the pages quote and the figure draws. One school of 200 students for the sampling
// pages; one caffeine experiment for the design pages. All "random" choices come from seeded generators, so every
// visit (and every check) sees the same samples. Pure functions; each scene reads one clock (seconds) through clk().
import { rng, gauss, mean, sd } from '../dist.js';

export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));
// a run of n1 slow steps of d1 seconds, then n2 fast ones of d2, then a hold, and again: which step (k) and how far (u)
export function steps(c, n1, d1, n2, d2, hold) {
  const T1 = n1 * d1, T2 = T1 + n2 * d2, t = c % (T2 + hold);
  if (t < T1) return { k: Math.floor(t / d1), u: (t % d1) / d1, slow: true };
  if (t < T2) return { k: n1 + Math.floor((t - T1) / d2), u: ((t - T1) % d2) / d2, slow: false };
  return { k: n1 + n2, u: 0, slow: false, held: true };
}
// each scene's clock: the shared one, or its chosen still moment under reduced motion
export const STILL = { pop: 27.3, obs: 5.5, srs: 9.5, strat: 6, cluster: 5, sys: 7.5, bias: 16, exp: 9, block: 7.5, pairs: 12, rand: 25 };
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;

// shuffle a copy of a list with a seeded generator (Fisher–Yates); the first n of it are a random sample
export function shuffled(list, seed) {
  const a = [...list], r = rng(seed);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const pick = (list, n, seed) => shuffled(list, seed).slice(0, n).sort((x, y) => x - y);
// dot-plot stacking: level[k] = how many earlier values fall in the same bin
export const stack = (vals, bin) => vals.map((v, k) => vals.slice(0, k).filter(w => Math.round(w / bin) === Math.round(v / bin)).length);
const range = n => Array.from({ length: n }, (_, i) => i);

// ---------- the school: 200 students, 25 advisory groups (columns) of 8, two rows per grade ----------
// a student is red-letter "has a driver's licence"; the share rises steeply with grade
export const POP = { cols: 25, rows: 8, grades: [9, 10, 11, 12], lic: [2, 12, 30, 43], n: 20 };
export const N = POP.cols * POP.rows;                                 // 200
export const PER = N / POP.grades.length;                             // 50 a grade
export const ALL = range(N);
export const gradeOf = i => Math.floor(Math.floor(i / POP.cols) / 2);  // 0 … 3 for grades 9 … 12
export const groupOf = i => i % POP.cols;                             // advisory group 0 … 24
export const LIC = new Uint8Array(N);
POP.grades.forEach((_, g) => { const seats = ALL.filter(i => gradeOf(i) === g); shuffled(seats, 11 + g).slice(0, POP.lic[g]).forEach(i => { LIC[i] = 1; }); });
export const COUNT = POP.lic.reduce((a, b) => a + b, 0);              // 87
export const P = COUNT / N;                                           // 0.435, the parameter
export const phatOf = idx => idx.reduce((s, i) => s + LIC[i], 0) / idx.length;

// the opener and 3.1: one SRS of 20 after another; each p̂ lands on a dot plot
export const POPRUN = { slow: 3, dSlow: 5, fast: 37, dFast: 0.45, hold: 5 };
export const KPOP = POPRUN.slow + POPRUN.fast;                       // 40 samples
export const SAMPLES = range(KPOP).map(k => pick(ALL, POP.n, 1000 + k));
export const PHATS = SAMPLES.map(phatOf);
export const PSTACK = stack(PHATS, 0.05);
export const popAt = c => steps(c, POPRUN.slow, POPRUN.dSlow, POPRUN.fast, POPRUN.dFast, POPRUN.hold);
export const PH_MEAN = mean(PHATS), PH_SD = sd(PHATS);
export const PH_LO = Math.min(...PHATS), PH_HI = Math.max(...PHATS);

// ---------- 3.3 a simple random sample from a line of random digits: labels 001–200, read in threes ----------
export const DIG = { seed: 2004, len: 900, show: 15 };
export const DIGITS = (() => { const r = rng(DIG.seed); return Array.from({ length: DIG.len }, () => Math.floor(r() * 10)).join(''); })();
// every three-digit group in turn: its label, and whether it is used, skipped (out of range) or a repeat
export const TRIPLES = (() => {
  const out = [], got = new Set();
  for (let k = 0; got.size < POP.n; k++) {
    const t = DIGITS.slice(3 * k, 3 * k + 3), v = +t;
    const why = v < 1 || v > N ? 'skip' : got.has(v) ? 'repeat' : 'use';
    if (why === 'use') got.add(v);
    out.push({ t, v, why });
  }
  return out;
})();
export const SRS_LABELS = TRIPLES.filter(x => x.why === 'use').map(x => x.v);   // in the order chosen
export const SRS_IDX = SRS_LABELS.map(v => v - 1);
export const SRS_PHAT = phatOf(SRS_IDX);
// stratified: 5 from each grade (proportional: 50/200 of 20)
export const STRAT_N = POP.n / POP.grades.length;
export const STRAT = POP.grades.map((_, g) => pick(ALL.filter(i => gradeOf(i) === g), STRAT_N, 21 + g));
export const STRAT_PHAT = phatOf(STRAT.flat());
// cluster: 3 whole advisory groups of 8
export const CLUSTER = { take: 3 };
export const CL_GROUPS = pick(range(POP.cols), CLUSTER.take, 33);
export const CL_IDX = ALL.filter(i => CL_GROUPS.includes(groupOf(i)));
export const CL_PHAT = phatOf(CL_IDX);
// systematic: every k-th on the list from a random start in 1 … k
export const SYS = { k: N / POP.n, start: 1 + Math.floor(rng(123457)() * (N / POP.n)) };
export const SYS_LABELS = range(POP.n).map(j => SYS.start + j * SYS.k);
export const SYS_IDX = SYS_LABELS.map(v => v - 1);
export const SYS_PHAT = phatOf(SYS_IDX);
export const METHOD_RUN = { srs: [POP.n, 0.4, 2.5], strat: [POP.grades.length, 1.2, 2.5], cluster: [CLUSTER.take, 1.2, 2.5], sys: [POP.n, 0.3, 2.5] };
// how many of a method's steps are shown at clock c
export const shownOf = (key, c) => { const [n, d, hold] = METHOD_RUN[key], t = c % (n * d + hold); return Math.min(Math.floor(t / d) + 1, n); };

// ---------- 3.4 bias and variability: the same school, three ways of sampling, 40 samples each ----------
export const FRAME = ALL.filter(i => gradeOf(i) > 0);                // the portal list: grade 9 not on it yet
export const P_FRAME = phatOf(FRAME);
export const STRIPS = [
  { key: 'stripA', from: ALL, n: 20, seed: 2000, name: 'SRS of 20 from the whole school' },
  { key: 'stripB', from: FRAME, n: 20, seed: 3000, name: 'SRS of 20 from the portal list' },
  { key: 'stripC', from: ALL, n: 80, seed: 4000, name: 'SRS of 80 from the whole school' },
].map(s => { const ph = range(40).map(k => phatOf(pick(s.from, s.n, s.seed + k))); return { ...s, ph, lv: stack(ph, 0.025), m: mean(ph), s: sd(ph) }; });
export const BIASRUN = { each: 0.35, hold: 4 };
export const biasShown = c => Math.min(Math.floor((c % (40 * BIASRUN.each + BIASRUN.hold)) / BIASRUN.each) + 1, 40);

// ---------- 3.2 observational study or experiment: 24 students, coffee or none; are they well rested? ----------
export const OBS = { n: 24, rested: 12, coffeeRested: 3, coffeeTired: 9, run: 4, hold: 3 };
export const RESTED = range(OBS.n).map(i => i < OBS.rested);
// the observational groups: chosen by the students themselves, and tired students reach for coffee
export const OBS_COFFEE = range(OBS.n).map(i => RESTED[i] ? i < OBS.coffeeRested : i < OBS.rested + OBS.coffeeTired);
// the experiment: the same 24, assigned by a random shuffle, 12 and 12
export const EXP_ORDER = shuffled(range(OBS.n), 51);
export const EXP_COFFEE = range(OBS.n).map(i => EXP_ORDER.indexOf(i) < OBS.n / 2);
const restedIn = grp => range(OBS.n).filter(i => grp[i] && RESTED[i]).length;
export const OBS_COUNTS = { obs: [restedIn(OBS_COFFEE), restedIn(OBS_COFFEE.map(x => !x))], exp: [restedIn(EXP_COFFEE), restedIn(EXP_COFFEE.map(x => !x))] };
export const POOL_ORDER = shuffled(range(OBS.n), 52);                // how they stand before they are grouped
export const obsT = c => Math.min((c % (OBS.run + OBS.hold)) / OBS.run, 1);

// ---------- 3.5 the caffeine experiment: 24 volunteers, reaction time (ms), caffeine or a placebo ----------
export const EXP = { n: 24, mu: 255, sd: 22, effect: -20, run: 7, hold: 3 };
export const BASE = (() => { const z = gauss(rng(61)); return range(EXP.n).map(() => Math.round(EXP.mu + EXP.sd * z())); })();
export const CAF = (() => { const s = new Set(shuffled(range(EXP.n), 62).slice(0, EXP.n / 2)); return range(EXP.n).map(i => s.has(i)); })();
export const RESP = BASE.map((b, i) => b + (CAF[i] ? EXP.effect : 0));
const split = (resp, caf) => [resp.filter((_, i) => caf[i]), resp.filter((_, i) => !caf[i])];
export const [RCAF, RPLA] = split(RESP, CAF);
export const MCAF = mean(RCAF), MPLA = mean(RPLA), DIFF = MPLA - MCAF;   // how much faster the caffeine group was
export const expT = c => (c % (EXP.run + EXP.hold));
export const RSTACK = (() => { const lv = new Array(EXP.n), seen = {}; RESP.forEach((v, i) => { const k = (CAF[i] ? 'c' : 'p') + Math.round(v / 4); lv[i] = seen[k] = (seen[k] ?? -1) + 1; }); return lv; })();

// ---------- 3.7 re-randomizing: if caffeine did nothing, how big a difference would chance alone make? ----------
export const RAND = { R: 100, bin: 2, slow: 3, dSlow: 2.4, dFast: 0.16, hold: 5 };
export const REDRAWS = range(RAND.R).map(k => { const s = new Set(shuffled(range(EXP.n), 700 + k).slice(0, EXP.n / 2)); return range(EXP.n).map(i => s.has(i)); });
export const RDIFFS = REDRAWS.map(caf => { const [a, b] = split(RESP, caf); return mean(b) - mean(a); });
export const RLEVEL = stack(RDIFFS, RAND.bin);
export const AS_BIG = RDIFFS.filter(d => d >= DIFF - 1e-9).length;
export const randAt = c => steps(c, RAND.slow, RAND.dSlow, RAND.R - RAND.slow, RAND.dFast, RAND.hold);

// ---------- 3.6 a randomized block design: block on coffee habit, then randomize within each block ----------
export const BLOCK = { n: 24, drinkers: 8, run: 6, hold: 3 };
export const DRINKER = range(BLOCK.n).map(i => i < BLOCK.drinkers);
export const BL_CAF = (() => {
  const d = shuffled(range(BLOCK.drinkers), 81).slice(0, BLOCK.drinkers / 2), n = shuffled(range(BLOCK.n).slice(BLOCK.drinkers), 82).slice(0, (BLOCK.n - BLOCK.drinkers) / 2);
  const s = new Set([...d, ...n]); return range(BLOCK.n).map(i => s.has(i));
})();
export const BL_POOL = shuffled(range(BLOCK.n), 83);
export const blockT = c => c % (BLOCK.run + BLOCK.hold);

// ---------- 3.6 matched pairs: 12 volunteers each tested twice, the order of the two pills by a coin flip ----------
export const PAIRS = { n: 12, mu: 255, sd: 22, noise: 6, effect: -14, learn: -8, each: 0.45, hold: 4 };
export const PAIR_DATA = (() => {
  const z = gauss(rng(91)), coin = rng(92);
  return range(PAIRS.n).map(() => {
    const b = EXP.mu + PAIRS.sd * z(), cafFirst = coin() < 0.5;
    const caf = Math.round(b + PAIRS.effect + (cafFirst ? 0 : PAIRS.learn) + PAIRS.noise * z());
    const pla = Math.round(b + (cafFirst ? PAIRS.learn : 0) + PAIRS.noise * z());
    return { cafFirst, caf, pla, d: pla - caf };
  });
})();
export const PDIFFS = PAIR_DATA.map(p => p.d);
export const PD_MEAN = mean(PDIFFS), PD_SD = sd(PDIFFS);
export const PD_LEVEL = stack(PDIFFS, 2);
export const PAIR_ORDER = { first: PAIR_DATA.filter(p => p.cafFirst).length };
export const pairsShown = c => Math.min(Math.floor((c % (PAIRS.n * PAIRS.each * 2 + PAIRS.hold)) / PAIRS.each), 2 * PAIRS.n);

// ---------- 3.7 the scope of inference ----------
export const SCOPE = [
  { key: 'scopeBoth', sel: true, asg: true },
  { key: 'scopeSel', sel: true, asg: false },
  { key: 'scopeAsg', sel: false, asg: true },
  { key: 'scopeNone', sel: false, asg: false },
];
