// Chapter 3: collecting data, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES } from './pages.js';
import * as M from './model.js';

const f1 = x => x.toFixed(1), f2 = x => x.toFixed(2);
const n = M.POP.n;
const methodLine = (key, idx, name) => (s => { const k = M.shownOf(key, M.clk(s, key)), [len] = M.METHOD_RUN[key]; return `${name}\n${k < len ? `choosing… ${k} of ${len}` : `p̂ = ${f2(M.phatOf(idx))}   p = ${M.P}`}`; });
const methods = {
  srs: methodLine('srs', M.SRS_IDX, `SRS of ${n}: labels 001–${M.N}, random digits`),
  strat: methodLine('strat', M.STRAT.flat(), `stratified: ${M.STRAT_N} from each grade`),
};

startBook({
  no: 3, PAGES, PLATES, equations: false,
  lookKeys: [],
  buildWorld,
  state: (clock, reduced) => ({ c: clock, reduced }),
  readout(s, page) {
    switch (page.scene) {
      case 'pop': { const st = M.popAt(M.clk(s, 'pop')), k = Math.min(st.k, M.KPOP - 1); return `sample ${k + 1} of ${M.KPOP}: ${Math.round(M.PHATS[k] * n)} of ${n} have a licence, p̂ = ${f2(M.PHATS[k])}\nparameter p = ${M.COUNT}/${M.N} = ${M.P}`; }
      case 'obs': return `well rested, coffee | none\nthey chose: ${M.OBS_COUNTS.obs[0]} | ${M.OBS_COUNTS.obs[1]}    random: ${M.OBS_COUNTS.exp[0]} | ${M.OBS_COUNTS.exp[1]}`;
      case 'srs': case 'strat': return methods[page.scene](s);
      case 'bias': return M.STRIPS.map(S => `${S.name}: mean p̂ ${f2(S.m)}`).join('\n');
      case 'exp': return `caffeine x̄ = ${f1(M.MCAF)} ms   placebo x̄ = ${f1(M.MPLA)} ms\ndifference ${f1(M.DIFF)} ms`;
      case 'block': return `block 1, coffee drinkers: ${M.BLOCK.drinkers / 2} caffeine, ${M.BLOCK.drinkers / 2} placebo\nblock 2, non-drinkers: ${(M.BLOCK.n - M.BLOCK.drinkers) / 2} caffeine, ${(M.BLOCK.n - M.BLOCK.drinkers) / 2} placebo`;
      case 'pairs': return `${M.PAIR_ORDER.first} took caffeine first, ${M.PAIRS.n - M.PAIR_ORDER.first} the placebo\nmean difference (placebo − caffeine) ${f1(M.PD_MEAN)} ms`;
      case 'rand': { const st = M.randAt(M.clk(s, 'rand')), k = st.held ? M.RAND.R : Math.min(st.k, M.RAND.R - 1) + 1; return `reshuffles ${k} of ${M.RAND.R}\nas large as the observed ${f1(M.DIFF)} ms: ${M.RDIFFS.slice(0, k).filter(d => d >= M.DIFF).length}`; }
      case 'scope': return 'random selection → generalize to the population\nrandom assignment → cause and effect';
    }
    return '';
  },
});
