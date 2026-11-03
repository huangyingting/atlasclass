// Chi-square model: every number the pages quote and the figure draws. Pure functions; each scene reads one clock
// (seconds) through the loop helpers below. With reduced motion each scene holds its own still moment (STILL).
// The data are drawn from a seeded rng (dist.js), so every visit and every check sees the same counts.
import { rng, sum, chiPdf, chiCdf, chiStar } from '../dist.js';

export const loop = (c, run, rest = 0) => Math.min((c % (run + rest)) / run, 1);
export const smooth = u => (u = Math.min(Math.max(u, 0), 1), u * u * (3 - 2 * u));
export const STILL = { gof: 17, sim: 30, family: 5.3, table: 3.2, designs: 11, choose: 18.5 };
export const clk = (s, key) => s.reduced ? STILL[key] : s.c;

// n draws from a categorical distribution p: the category of each draw, in order
export function draws(n, p, u) {
  const out = [];
  for (let i = 0; i < n; i++) { let r = u(), k = 0; while (k < p.length - 1 && r >= p[k]) { r -= p[k]; k++; } out.push(k); }
  return out;
}
export const tally = (seq, k) => { const c = Array(k).fill(0); for (const v of seq) c[v]++; return c; };
// χ² = Σ (O − E)²/E, cell by cell
export const contribs = (o, e) => o.map((v, i) => (v - e[i]) ** 2 / e[i]);
export const chi2 = (o, e) => sum(contribs(o, e));
export const pUpper = (x, df) => 1 - chiCdf(x, df);
export { chiPdf, chiStar };

// ---------- the opener, 8.2, 8.3: a goodness-of-fit test on one bag of candies ----------
// The maker's claimed colour mix; the bag is drawn (seeded) from a mix a little different from the claim.
export const GOF = {
  cats: ['blue', 'orange', 'green', 'yellow', 'red', 'brown'],
  claim: [0.24, 0.20, 0.16, 0.14, 0.13, 0.13],
  truth: [0.21, 0.22, 0.19, 0.12, 0.13, 0.13],
  n: 200, seed: 21, alpha: 0.05,
  // the figure's run: counting the bag, then the gaps and the stack cell by cell, then a hold
  count: 4, each: 0.8, rest: 10,
};
export const K = GOF.cats.length;
export const SEQ = draws(GOF.n, GOF.truth, rng(GOF.seed));       // the bag, candy by candy
export const OBS = tally(SEQ, K);                                // 34 48 41 19 27 31
export const EXP = GOF.claim.map(p => p * GOF.n);                // 48 40 32 28 26 26
export const CON = contribs(OBS, EXP);
export const CHI = sum(CON);                                     // 12.11
export const DF = K - 1;
export const P = pUpper(CHI, DF);                                // 0.033
export const CRIT = chiStar(GOF.alpha, DF);                      // 11.07
export const BIG = CON.indexOf(Math.max(...CON));                // the largest contribution: blue
export const GOF_RUN = GOF.count + K * GOF.each + GOF.rest;
// where the run is: counted candies so far, and how many cells have joined the stack
export function gofAt(c) {
  const t = c % GOF_RUN, u = smooth(t / GOF.count), m = Math.round(u * GOF.n);
  const counts = tally(SEQ.slice(0, m), K);
  const cells = Math.max(0, Math.min(K, (t - GOF.count) / GOF.each));   // fractional: the next cell is dropping
  return { t, m, counts, cells };
}

// ---------- 8.1 are my results unexpected? Samples of 200 drawn as if the claim were true ----------
export const SIM = { n: 300, seed: 811, run: 24, rest: 8, bin: 0.5 };
const simU = rng(SIM.seed);
export const SIM_COUNTS = Array.from({ length: SIM.n }, () => tally(draws(GOF.n, GOF.claim, simU), K));
export const SIM_CHI = SIM_COUNTS.map(o => chi2(o, EXP));
export const SIM_BEYOND = SIM_CHI.filter(x => x >= CHI).length;
export const SIM_MEAN = sum(SIM_CHI) / SIM.n;
// how many samples are in after c seconds (slow at first, so the first few can be followed)
export const simShown = c => { const t = c % (SIM.run + SIM.rest); return Math.min(SIM.n, Math.floor(SIM.n * Math.min(t / SIM.run, 1) ** 2)); };
// each sample's place in its dot-plot stack: bin, and how many earlier samples share that bin
export const SIM_BIN = SIM_CHI.map(x => Math.floor(x / SIM.bin));
export const SIM_LEVEL = SIM_BIN.map((b, i) => SIM_BIN.slice(0, i).filter(v => v === b).length);

// ---------- 8.3 the χ² family ----------
export const FAM = { dfs: [1, 3, 5, 10], lo: 1, hi: 12, each: 1.3 };
// the red curve steps through df = 1, 2, …, 12 and starts again
export const famDf = c => FAM.lo + Math.floor(c / FAM.each) % (FAM.hi - FAM.lo + 1);
export const mode = df => Math.max(df - 2, 0);

// ---------- 8.4–8.6 a two-way table: one random sample of adults, by age group and main news source ----------
export const TAB = {
  rows: ['18–34', '35–54', '55+'], cols: ['online', 'TV', 'print'],
  joint: [[0.12, 0.10, 0.05], [0.11, 0.11, 0.08], [0.10, 0.13, 0.12]],
  n: 400, seed: 104, alpha: 0.05, each: 1.4,
};
const JT = TAB.joint.flat(), JS = sum(JT);
const cells = tally(draws(TAB.n, JT.map(v => v / JS), rng(TAB.seed)), 9);
export const R = TAB.rows.length, C = TAB.cols.length;
export const TO = TAB.rows.map((_, i) => cells.slice(C * i, C * i + C));                       // observed
export const ROWT = TO.map(r => sum(r));
export const COLT = TAB.cols.map((_, j) => sum(TO.map(r => r[j])));
export const NT = sum(ROWT);
export const TE = TO.map((r, i) => r.map((_, j) => ROWT[i] * COLT[j] / NT));                   // row × column / table total
export const TC = TO.map((r, i) => r.map((o, j) => (o - TE[i][j]) ** 2 / TE[i][j]));
export const CHI_T = sum(TC.flat());                                                            // 15.06
export const DF_T = (R - 1) * (C - 1);
export const P_T = pUpper(CHI_T, DF_T);                                                         // 0.0046
export const CRIT_T = chiStar(TAB.alpha, DF_T);
export const MIN_TE = Math.min(...TE.flat());
const flatC = TC.flat(), bigK = flatC.indexOf(Math.max(...flatC));
export const BIG_T = [Math.floor(bigK / C), bigK % C];
// 8.4: the cell whose expected count is being worked out now
export const cellAt = c => { const k = Math.floor(c / TAB.each) % (R * C); return [Math.floor(k / C), k % C]; };

// ---------- 8.5 two designs, one table: balls from the population(s) to their cells ----------
export const DES = { balls: 36, every: 0.22, fly: 0.9, rest: 3, seed: 85 };
const desU = rng(DES.seed);
const jointP = JT.map(v => v / JS);
// homogeneity: equal samples from each age group, each ball's column drawn within its row; independence: one sample
export const HOMO = Array.from({ length: DES.balls }, (_, i) => { const r = i % R, rowP = TAB.joint[r].map(v => v / sum(TAB.joint[r])); return [r, draws(1, rowP, desU)[0]]; });
export const INDE = draws(DES.balls, jointP, desU).map(k => [Math.floor(k / C), k % C]);
export const DES_RUN = DES.balls * DES.every + DES.fly + DES.rest;
// ball i's flight: 0 before launch, 1 landed
export const flight = (c, i) => smooth(((c % DES_RUN) - i * DES.every) / DES.fly);
// each ball's slot within its cell: how many earlier balls landed in the same cell
const slots = list => list.map(([r, c], i) => list.slice(0, i).filter(([a, b]) => a === r && b === c).length);
export const HOMO_SLOT = slots(HOMO), INDE_SLOT = slots(INDE);

// ---------- 8.7 which procedure? ----------
export const PROCS = [
  { key: 'c1p', name: 'one-sample <i>z</i> for <i>p</i>', short: 'one-sample z' },
  { key: 'c2p', name: 'two-sample <i>z</i> for <i>p</i><sub>1</sub> − <i>p</i><sub>2</sub>', short: 'two-sample z' },
  { key: 'cGof', name: 'χ² goodness of fit', short: 'χ² goodness of fit' },
  { key: 'cHom', name: 'χ² homogeneity', short: 'χ² homogeneity' },
  { key: 'cInd', name: 'χ² independence', short: 'χ² independence' },
];
export const SCEN = [
  { text: 'Is the share of voters who back a bond measure above 50%?', key: 'c1p' },
  { text: 'Do more 12th graders than 9th graders own a bike? (two separate samples)', key: 'c2p' },
  { text: 'Do births fall evenly across the seven days of the week?', key: 'cGof' },
  { text: 'Do three schools’ students differ in their favourite sport? (a sample from each)', key: 'cHom' },
  { text: 'Is eye colour associated with hair colour? (one sample, both recorded)', key: 'cInd' },
];
export const SCEN_EACH = 4;
export const scenAt = c => Math.floor(c / SCEN_EACH) % SCEN.length;

export const PRACTICE = {};   // the paid questions are in problems/chisquare.mjs
