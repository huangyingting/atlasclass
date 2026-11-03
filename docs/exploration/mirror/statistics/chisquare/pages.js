// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f2 = x => x.toFixed(2), f3 = x => x.toFixed(3), e1 = x => `${+x.toFixed(1)}`, pct = p => `${+(100 * p).toFixed(1)}%`;
const sgn = x => (x < 0 ? '−' : '+') + Math.abs(x).toFixed(1).replace(/\.0$/, '');
const G = M.GOF, cats = G.cats, T = M.TAB;
const big = cats[M.BIG], bigT = `${T.rows[M.BIG_T[0]]}, ${T.cols[M.BIG_T[1]]}`;
const flatTC = M.TC.flat(), second = flatTC.indexOf([...flatTC].sort((a, b) => b - a)[1]), sec = [Math.floor(second / M.C), second % M.C];
const [w0, w1] = [0, 0];                                       // the worked cell of 8.4: first row, first column
const simP = M.SIM_BEYOND / M.SIM.n;
const CRITS = [1, 2, 3, 4, 5, 10].map(df => [df, M.chiStar(0.05, df), M.chiStar(0.01, df)]);
// a two-way table: observed with expected in brackets, and the margins
const twoWay = (withE = true) => `<table class="data">
  <tr><th></th>${T.cols.map(c => `<th>${c}</th>`).join('')}<th>total</th></tr>
  ${M.TO.map((r, i) => `<tr><th>${T.rows[i]}</th>${r.map((o, j) => `<td>${o}${withE ? ` (${M.TE[i][j].toFixed(1)})` : ''}</td>`).join('')}<td>${M.ROWT[i]}</td></tr>`).join('')}
  <tr><th>total</th>${M.COLT.map(t => `<td>${t}</td>`).join('')}<td>${M.NT}</td></tr></table>`;

export const PAGES = [
  {
    kicker: 'Chapter 8', title: 'Chi-square tests', sub: 'counts against expectations',
    body: `
      <p class="lede">A chi-square test asks whether counts in categories are too far from what a hypothesis predicts to blame on chance.</p>
      <p>A candy maker says its bags are ${cats.map((c, i) => `${pct(G.claim[i])} ${c}`).join(', ')}. A bag of ${G.n} is counted (black bars). If the claim is true, the bag should hold about ${G.n} × ${G.claim[0]} = ${e1(M.EXP[0])} blue, and so on (blue ghosts).</p>
      <p>No bag matches exactly. The red rods are the gaps, observed − expected. Each gap is squared and divided by its expected count, and the pieces stack into one number, the <b>chi-square statistic</b>, χ² = ${f2(M.CHI)}.</p>
      <p>Small χ² means the counts sit close to the claim; large χ² means they don’t. This chapter asks how large is too large: for one variable against a claimed distribution (<b>goodness of fit</b>), and for two-way tables (<b>homogeneity</b> and <b>independence</b>).</p>`,
    cam: { target: [ST.gof - 0.8, 3.0, 0], az: 8, el: 6, dist: 44 }, lit: 'gaps', look: {}, scene: 'gof',
    fig: 'A bag of candies against the claim',
  },
  {
    kicker: '8.1', title: 'Are my results unexpected?', sub: 'what chance alone would produce',
    body: `
      <p class="lede">Random samples vary. To judge a result, compare it with the results chance alone produces when the claim is true.</p>
      <p>The figure fills ${M.SIM.n} bags of ${G.n} at random from exactly the claimed mix. Each simulated bag (left) misses the expected counts a little, and its χ² lands as one dot in the dot plot.</p>
      <p>Even with the claim true, χ² is never 0, and it is usually a few units. These ${M.SIM.n} values average ${f2(M.SIM_MEAN)}. Only ${M.SIM_BEYOND} of the ${M.SIM.n} (red) reach the real bag’s ${f2(M.CHI)}: a proportion of ${f3(simP)}.</p>
      <p>That is the logic of every test: <b>if the claim were true, how often would we see a result at least this extreme?</b> If rarely, the result is <b>statistically significant</b> evidence against the claim. If often, the data give no reason to doubt it, which is not proof that it is true.</p>
      <p>The grey curve is the χ² distribution the dots pile up toward. It lets us find the probability without simulating (8.3).</p>`,
    cam: { target: [ST.sim - 1.8, 2.6, 0], az: 0, el: 4, dist: 54 }, lit: 'simDots', look: {}, scene: 'sim',
    fig: 'χ² from bags drawn under the claim',
  },
  {
    kicker: '8.2', title: 'Setting up a goodness-of-fit test', sub: 'hypotheses, expected counts, conditions',
    body: `
      <p class="lede">A <b>chi-square test for goodness of fit</b> tests whether the distribution of one categorical variable matches a claimed distribution.</p>
      <p><b>Hypotheses</b> are about the population proportions, never the sample counts:</p>
      <p>H<sub>0</sub>: <i>p</i><sub>blue</sub> = ${G.claim[0]}, <i>p</i><sub>orange</sub> = ${G.claim[1]}, … , <i>p</i><sub>brown</sub> = ${G.claim[5]} (the claimed distribution is correct).<br>H<sub>a</sub>: at least one of the proportions differs from the claim.</p>
      <p>H<sub>a</sub> is not “all of them differ”, and it names no direction.</p>
      <p><b>Expected counts</b> are <i>n</i> × <i>p</i><sub><i>i</i></sub>, worked out from H<sub>0</sub>:</p>
      <table class="data"><tr><th>colour</th>${cats.map(c => `<td>${c}</td>`).join('')}</tr><tr><th>claimed <i>p</i></th>${G.claim.map(p => `<td>${p}</td>`).join('')}</tr><tr><th>expected</th>${M.EXP.map(e => `<td>${e1(e)}</td>`).join('')}</tr></table>
      <p>They add up to <i>n</i> = ${G.n}, and they need not be whole numbers: don’t round them.</p>
      <p><b>Conditions.</b> <b>Random:</b> a random sample (or randomized experiment). <b>10%:</b> sampling without replacement, <i>n</i> ≤ 10% of the population (${G.n} candies is far less than 10% of all the maker’s candies). <b>Large counts:</b> every <i>expected</i> count is at least 5; here the smallest is ${e1(Math.min(...M.EXP))}. Check the expected counts, not the observed ones.</p>`,
    cam: { target: [ST.gof - 3.4, 3.1, 0], az: 4, el: 4, dist: 34 }, lit: 'expected', look: {}, scene: 'gof',
    fig: 'What the claim predicts',
  },
  {
    kicker: '8.3', title: 'The chi-square statistic', sub: 'squared gaps, scaled by what was expected',
    body: `
      <p class="lede">The χ² statistic adds up, over every category, the squared gap between observed and expected, divided by the expected count.</p>
      <div class="eq">${tex(String.raw`\chi^2 = \sum \frac{(\text{observed} - \text{expected})^2}{\text{expected}}`)}</div>
      <table class="data"><tr><th>colour</th><th>O</th><th>E</th><th>O − E</th><th>(O − E)²/E</th></tr>
        ${cats.map((c, i) => `<tr><td>${c}</td><td>${M.OBS[i]}</td><td>${e1(M.EXP[i])}</td><td>${sgn(M.OBS[i] - M.EXP[i])}</td><td>${f2(M.CON[i])}</td></tr>`).join('')}
        <tr><th>total</th><td>${G.n}</td><td>${G.n}</td><td>0</td><td>${f2(M.CHI)}</td></tr></table>
      <p>The gaps always add up to 0, so they can’t be summed as they are: squaring makes every one count. Dividing by E makes a gap count for more when little was expected: missing by 10 out of an expected 20 matters more than missing by 10 out of 200.</p>
      <p>The <b>degrees of freedom</b> are the number of categories minus one: df = ${M.K} − 1 = ${M.DF}. Once five counts are known, the sixth is fixed by the total.</p>
      <p>The <b>largest contribution</b> says where the data and the claim disagree most: ${big}, ${f2(M.CON[M.BIG])} of the ${f2(M.CHI)}, with ${M.OBS[M.BIG]} observed against ${e1(M.EXP[M.BIG])} expected: fewer ${big} candies than claimed.</p>`,
    cam: { target: [ST.gof + 0.6, 3.0, 0], az: -6, el: 4, dist: 38 }, lit: 'stack', look: {}, scene: 'gof',
    fig: 'The pieces of χ²',
  },
  {
    kicker: '8.3', title: 'The p-value and the conclusion', sub: 'how far into the tail',
    body: `
      <p class="lede">The p-value is the area under the χ² curve with the test’s df, at and beyond the observed χ²: large values are the evidence against H<sub>0</sub>, so the test always looks at the right tail.</p>
      <div class="eq">${tex(String.raw`p = P(\chi^2_{${M.DF}} \ge ${f2(M.CHI)}) = ${f3(M.P)}`)}</div>
      <p>The simulation in 8.1 gave ${f3(simP)}, close to the same answer.</p>
      <p><b>Interpretation.</b> Assuming the maker’s claimed distribution is correct, there is a ${f3(M.P)} probability of getting a χ² of ${f2(M.CHI)} or larger by chance alone in a random sample of ${G.n} candies.</p>
      <p><b>Conclusion.</b> Since <i>p</i> = ${f3(M.P)} &lt; α = ${G.alpha}, reject H<sub>0</sub>. There is convincing evidence that the colour distribution of this maker’s candies differs from the claim.</p>
      <p>With a table instead of technology: the critical value for df = ${M.DF} and a tail of ${G.alpha} is χ²* = ${f2(M.CRIT)} (blue). ${f2(M.CHI)} &gt; ${f2(M.CRIT)}, so <i>p</i> &lt; ${G.alpha}.</p>
      <p>Had <i>p</i> been above α, the conclusion would be “not convincing evidence that the distribution differs”: never “the claim is correct”, and never “accept H<sub>0</sub>”. A χ² test also can’t say which way the distribution is off; for that, look at the largest contributions.</p>`,
    cam: { target: [ST.curve, 2.8, 0], az: -3, el: 3, dist: 40 }, lit: 'tail', look: {}, scene: 'curve',
    fig: 'The tail beyond χ²',
  },
  {
    kicker: '8.3', title: 'The chi-square distributions', sub: 'a family, one for each df',
    body: `
      <p class="lede">The χ² distributions are a family of density curves, one for each number of degrees of freedom.</p>
      <p>Each takes only values of 0 or more, since χ² is a sum of squares. Each is <b>skewed right</b>. Its <b>mean is df</b>, and for df ≥ 2 its peak is at df − 2.</p>
      <p>As df grows the curve moves right, spreads out and becomes less skewed (the red curve steps through df = ${M.FAM.lo} to ${M.FAM.hi}). More categories mean more pieces in the sum, so a larger χ² is expected even when H<sub>0</sub> is true.</p>
      <p>So the same χ² can be strong evidence at one df and none at another. The upper critical values:</p>
      <table class="data"><tr><th>df</th>${CRITS.map(([d]) => `<td>${d}</td>`).join('')}</tr>
        <tr><th>tail 0.05</th>${CRITS.map(([, a]) => `<td>${f2(a)}</td>`).join('')}</tr>
        <tr><th>tail 0.01</th>${CRITS.map(([, , b]) => `<td>${f2(b)}</td>`).join('')}</tr></table>
      <p>A rough check: a χ² near its df is ordinary. The candies’ ${f2(M.CHI)} is more than twice its df of ${M.DF}.</p>
      <p>The χ² distribution is only an approximation to the true sampling distribution of the statistic. It is good when every expected count is at least 5: that is why the condition matters.</p>`,
    cam: { target: [ST.family, 2.7, 0], az: -3, el: 3, dist: 40 }, lit: 'famLive', look: {}, scene: 'family',
    fig: 'Right-skewed, centred at df',
  },
  {
    kicker: '8.4', title: 'Expected counts in two-way tables', sub: 'from the margins',
    body: `
      <p class="lede">For a two-way table, each expected count is the row total times the column total, divided by the table total.</p>
      <div class="eq">${tex(String.raw`\text{expected count} = \frac{\text{row total} \times \text{column total}}{\text{table total}}`)}</div>
      <p>A random sample of ${M.NT} adults, each classified by age group and main news source. Observed counts, with expected counts in brackets:</p>
      ${twoWay()}
      <p><b>Why it works.</b> Overall, ${M.COLT[w1]} of ${M.NT} adults (${pct(M.COLT[w1] / M.NT)}) get their news ${T.cols[w1]}. If age group made no difference, the same share of the ${M.ROWT[w0]} adults aged ${T.rows[w0]} would: ${M.ROWT[w0]} × ${M.COLT[w1]}/${M.NT} = ${M.TE[w0][w1].toFixed(2)}.</p>
      <p>The expected counts have the same margins as the observed ones. The figure works out one cell at a time: the red lid is the expected count, the blue tiles the two totals it comes from.</p>
      <p>Keep the decimals. Expected counts are averages over many samples, not counts that could be observed.</p>`,
    cam: { target: [ST.table - 4.6, 0.3, 1.0], az: -8, el: 44, dist: 42 }, lit: 'tExp', look: {}, scene: 'table',
    fig: 'Each cell from its row and column',
  },
  {
    kicker: '8.5', title: 'Homogeneity or independence?', sub: 'the design decides',
    body: `
      <p class="lede">The same two-way table can come from two designs, and the design decides which test it is.</p>
      <p><b>Homogeneity</b> (left): <i>separate</i> random samples from several populations (or groups in an experiment), with one categorical variable recorded. Here, a sample from each age group, each person asked their news source. The row totals were chosen by the design.</p>
      <p>H<sub>0</sub>: the distribution of news source is the same for all three age groups. H<sub>a</sub>: the distribution of news source is not the same for all three.</p>
      <p><b>Independence</b> (right): <i>one</i> random sample from one population, with two categorical variables recorded for each individual. Only the table total was fixed; how many fall in each age group is up to chance.</p>
      <p>H<sub>0</sub>: there is no association between age group and news source among adults (they are independent). H<sub>a</sub>: there is an association (they are not independent).</p>
      <table class="data"><tr><th></th><th>homogeneity</th><th>independence</th></tr>
        <tr><td>samples</td><td>one per population or group</td><td>one</td></tr><tr><td>variables</td><td>one</td><td>two</td></tr>
        <tr><td>question</td><td>same distribution in each?</td><td>an association?</td></tr></table>
      <p>The arithmetic is the same: expected counts, χ², df and p-value. <b>Conditions</b>, for both: random samples (or random assignment); each sample at most 10% of its population; every expected count at least 5.</p>`,
    cam: { target: [ST.designs - 2.0, 2.7, 0], az: 0, el: 4, dist: 44 }, lit: 'homog', look: {}, scene: 'designs',
    fig: 'Three samples, or one',
  },
  {
    kicker: '8.6', title: 'Carrying out a test for a two-way table', sub: 'χ² and df = (r − 1)(c − 1)',
    body: `
      <p class="lede">For a two-way table, χ² adds (O − E)²/E over every cell, and df = (rows − 1)(columns − 1).</p>
      <p>The news-source sample is one sample with two variables: a test for independence, at α = ${T.alpha}.</p>
      <p>H<sub>0</sub>: age group and main news source are independent among adults. H<sub>a</sub>: they are associated.</p>
      <p><b>Conditions.</b> A random sample; ${M.NT} is less than 10% of all adults; the smallest expected count is ${M.MIN_TE.toFixed(1)}, at least 5.</p>
      <p>Each cell’s contribution (red columns):</p>
      <table class="data"><tr><th></th>${T.cols.map(c => `<th>${c}</th>`).join('')}</tr>
        ${M.TC.map((r, i) => `<tr><th>${T.rows[i]}</th>${r.map(c => `<td>${f2(c)}</td>`).join('')}</tr>`).join('')}</table>
      <div class="eq">${tex(String.raw`\chi^2 = ${f2(M.CHI_T)} \qquad \text{df} = (${M.R}-1)(${M.C}-1) = ${M.DF_T}`)}</div>
      <p>Why (<i>r</i> − 1)(<i>c</i> − 1): with the margins fixed, once a 2 × 2 corner of the table is filled in, every other cell follows from the totals.</p>
      <p>The largest contributions: ${bigT} (${f2(M.TC[M.BIG_T[0]][M.BIG_T[1]])}: ${M.TO[M.BIG_T[0]][M.BIG_T[1]]} observed, ${M.TE[M.BIG_T[0]][M.BIG_T[1]].toFixed(1)} expected) and ${T.rows[sec[0]]}, ${T.cols[sec[1]]} (${f2(M.TC[sec[0]][sec[1]])}: ${M.TO[sec[0]][sec[1]]} observed, ${M.TE[sec[0]][sec[1]].toFixed(1)} expected). Younger adults lean online and away from print.</p>`,
    cam: { target: [ST.table + 6.8, 0.6, 1.0], az: -8, el: 38, dist: 38 }, lit: 'tContrib', look: {}, scene: 'table',
    fig: 'Nine contributions',
  },
  {
    kicker: '8.6', title: 'The conclusion, in context', sub: 'evidence of an association, not a cause',
    body: `
      <p class="lede">The p-value is the area beyond χ² under the curve with df = (<i>r</i> − 1)(<i>c</i> − 1), and the conclusion is about the populations, in context.</p>
      <div class="eq">${tex(String.raw`p = P(\chi^2_{${M.DF_T}} \ge ${f2(M.CHI_T)}) = ${M.P_T.toFixed(4)}`)}</div>
      <p><b>Conclusion.</b> Since <i>p</i> = ${M.P_T.toFixed(4)} &lt; α = ${T.alpha}, reject H<sub>0</sub>. There is convincing evidence of an association between age group and main news source among adults.</p>
      <p>By the critical value: χ²* = ${f2(M.CRIT_T)} for df = ${M.DF_T}, and ${f2(M.CHI_T)} &gt; ${f2(M.CRIT_T)}.</p>
      <p><b>Not a cause.</b> This is an observational study: the test finds an association, and says nothing about age causing a choice of news source. Only a randomized experiment, tested for homogeneity across its treatment groups, can show cause.</p>
      <p>Had the same counts come from three separate samples, the conclusion would read: convincing evidence that the distribution of news source differs among the three age groups.</p>
      <p><b>Common mistakes.</b> Writing hypotheses about the sample; using percentages in place of counts; checking the observed rather than the expected counts; df = <i>rc</i> − 1; concluding H<sub>0</sub> is true when <i>p</i> is large.</p>`,
    cam: { target: [ST.tcurve, 2.8, 0], az: -3, el: 3, dist: 40 }, lit: 'tTail', look: {}, scene: 'tcurve',
    fig: 'df = 4, and the tail',
  },
  {
    kicker: '8.7', title: 'Selecting a procedure', sub: 'z for proportions, or χ²',
    body: `
      <p class="lede">For categorical data, the choice turns on how many samples there are, how many variables, and how many categories.</p>
      <table class="data"><tr><th>the data</th><th>procedure</th></tr>
        <tr><td>one sample, a two-category variable, a claim about <i>p</i></td><td>one-sample <i>z</i> test (or interval) for <i>p</i></td></tr>
        <tr><td>two samples or groups, a two-category variable</td><td>two-sample <i>z</i> for <i>p</i><sub>1</sub> − <i>p</i><sub>2</sub></td></tr>
        <tr><td>one sample, one variable with several categories, against a claim</td><td>χ² goodness of fit, df = <i>k</i> − 1</td></tr>
        <tr><td>several samples or groups, one variable</td><td>χ² homogeneity, df = (<i>r</i> − 1)(<i>c</i> − 1)</td></tr>
        <tr><td>one sample, two variables</td><td>χ² independence, df = (<i>r</i> − 1)(<i>c</i> − 1)</td></tr></table>
      <p>The z procedures estimate: they give a confidence interval and allow a one-sided H<sub>a</sub> (“greater than”). χ² tests only test, and their H<sub>a</sub> has no direction.</p>
      <p>With two groups and two categories, the two-sample <i>z</i> test with a two-sided H<sub>a</sub> and the χ² test for homogeneity give the same p-value (χ² = <i>z</i><sup>2</sup>).</p>
      <p>Read the design first: how was the sample taken, and what was recorded about each individual? The figure shows the shape each design leaves in the data, and picks one for each question.</p>`,
    cam: { target: [ST.choose, 2.0, 0], az: 0, el: 4, dist: 46 }, lit: 'cHom', look: {}, scene: 'choose',
    fig: 'Which test?',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const gof = s => M.gofAt(M.clk(s, 'gof'));
const at = (i, j) => `${T.rows[i]}, ${T.cols[j]}`;
export const PLATES = {
  observed: { text: `The bag, counted candy by candy. These are the observed counts: they must add up to ${G.n}.`,
    facts: s => { const g = gof(s); return [['counted', `${g.m} of ${G.n}`], ...cats.map((c, i) => [c, `${g.counts[i]}`])]; } },
  expected: { text: 'What the claim predicts: n times each claimed proportion. Worked out from H₀ alone, before the bag is opened.', facts: () => cats.map((c, i) => [c, `${G.n} × ${G.claim[i]} = ${e1(M.EXP[i])}`]) },
  gaps: { text: 'Observed minus expected for each colour. Some are positive and some negative, and together they add up to 0: so each is squared before it is added.', facts: () => cats.map((c, i) => [c, sgn(M.OBS[i] - M.EXP[i])]) },
  stack: { text: `The contributions (O − E)²/E, one block per colour, stacked: the stack’s height is χ². The dashed line is the critical value for df = ${M.DF} at α = ${G.alpha}.`,
    facts: () => [...cats.map((c, i) => [c, f2(M.CON[i])]), ['χ²', f2(M.CHI)], ['χ²*', f2(M.CRIT)]] },
  simSample: { text: `One bag of ${G.n} drawn at random from exactly the claimed mix (black), against the expected counts (blue). Even with H₀ true, the counts miss.`,
    facts: s => { const k = M.simShown(M.clk(s, 'sim')); return k ? [['bag', `${k}`], ['χ²', f2(M.SIM_CHI[k - 1])]] : [['bag', 'none yet']]; } },
  simDots: { text: `Each dot is one simulated bag’s χ². Red dots are at least as large as the real bag’s ${f2(M.CHI)}: their share estimates the p-value.`,
    facts: s => { const k = M.simShown(M.clk(s, 'sim')), b = M.SIM_CHI.slice(0, k).filter(x => x >= M.CHI).length; return [['bags', `${k}`], ['χ² ≥ observed', `${b}`], ['proportion', k ? f3(b / k) : '–']]; } },
  simCurve: { text: `The χ² density with df = ${M.DF}, scaled to ${M.SIM.n} bags. The dots fill in under it.`, facts: () => [['mean of the curve', `${M.DF}`], ['mean of the dots', f2(M.SIM_MEAN)]] },
  simObs: { text: 'The real bag’s χ². The question is how often chance alone gets this far right.', facts: () => [['χ²', f2(M.CHI)], ['simulated p', f3(simP)]] },
  pdf: { text: `The χ² distribution with df = ${M.DF}: how the statistic would vary from bag to bag if the claim were true.`, facts: () => [['df', `${M.DF}`], ['mean', `${M.DF}`]] },
  tail: { text: 'The p-value: the area at and beyond the observed χ². Only the right tail counts: large χ² is evidence against H₀, small χ² is not.', facts: () => [['χ²', f2(M.CHI)], ['p', f3(M.P)], ['α', `${G.alpha}`]] },
  stat: { text: 'The observed χ², from the bag.', facts: () => [['χ²', f2(M.CHI)]] },
  crit: { text: `The critical value: 5% of the area lies beyond it. A χ² past it has p < ${G.alpha}.`, facts: () => [['χ²*', f2(M.CRIT)], ['df', `${M.DF}`]] },
  fam: { text: 'Four members of the χ² family. Each is right-skewed and never negative; larger df moves the curve right and makes it more symmetric.', facts: () => M.FAM.dfs.map(d => [`df = ${d}`, `mean ${d}`]) },
  famLive: { text: 'One χ² curve and its mean, which equals its df. The curve starts at 0 and is pulled right by the tail.',
    facts: s => { const d = M.famDf(M.clk(s, 'family')); return [['df', `${d}`], ['mean', `${d}`], ['peak', `${M.mode(d)}`], ['χ²* (0.05)', f2(M.chiStar(0.05, d))]]; } },
  tObs: { text: `The observed counts, one block per cell. One random sample of ${M.NT} adults.`, facts: () => M.TO.flatMap((r, i) => r.map((o, j) => [at(i, j), `${o}`])) },
  tExp: { text: 'The expected counts if the two variables were independent (blue ghosts): row total × column total / table total. The red lid is the cell being worked out.',
    facts: s => { const [i, j] = M.cellAt(M.clk(s, 'table')); return [['cell', at(i, j)], ['row total', `${M.ROWT[i]}`], ['column total', `${M.COLT[j]}`], ['expected', `${M.ROWT[i]} × ${M.COLT[j]} / ${M.NT} = ${M.TE[i][j].toFixed(2)}`], ['observed', `${M.TO[i][j]}`]]; } },
  margins: { text: 'The totals of each row and column. The expected counts are built from them alone.', facts: () => [...T.rows.map((r, i) => [r, `${M.ROWT[i]}`]), ...T.cols.map((c, j) => [c, `${M.COLT[j]}`]), ['table', `${M.NT}`]] },
  tContrib: { text: 'Each cell’s (O − E)²/E. The tallest show where the table departs most from independence.', facts: () => M.TC.flatMap((r, i) => r.map((c, j) => [at(i, j), f2(c)])) },
  tStack: { text: 'The nine contributions stacked: χ² for the table.', facts: () => [['χ²', f2(M.CHI_T)], ['df', `(${M.R} − 1)(${M.C} − 1) = ${M.DF_T}`]] },
  tPdf: { text: `The χ² distribution with df = ${M.DF_T}.`, facts: () => [['df', `${M.DF_T}`], ['mean', `${M.DF_T}`]] },
  tTail: { text: 'The p-value for the table: the area beyond its χ².', facts: () => [['χ²', f2(M.CHI_T)], ['p', M.P_T.toFixed(4)]] },
  tStat: { text: 'The table’s χ².', facts: () => [['χ²', f2(M.CHI_T)]] },
  tCrit: { text: `The critical value for df = ${M.DF_T} at α = ${T.alpha}.`, facts: () => [['χ²*', f2(M.CRIT_T)]] },
  homog: { text: 'Three populations, a separate random sample from each, one variable recorded. How many land in each row is fixed in advance. Test: are the distributions the same?', facts: () => [['samples', '3'], ['variables', '1 (news source)'], ['test', 'χ² homogeneity']] },
  indep: { text: 'One population, one random sample, two variables recorded for each person. Only the total is fixed. Test: are the variables associated?', facts: () => [['samples', '1'], ['variables', '2 (age, news source)'], ['test', 'χ² independence']] },
  c1p: { text: 'One sample, one variable with two outcomes, compared with a claimed p.', facts: () => [['procedure', 'one-sample z for p']] },
  c2p: { text: 'Two independent samples (or two treatment groups), one two-outcome variable.', facts: () => [['procedure', 'two-sample z for p₁ − p₂']] },
  cGof: { text: 'One sample, one variable with several categories, against a claimed distribution.', facts: () => [['procedure', 'χ² goodness of fit'], ['df', 'k − 1']] },
  cHom: { text: 'Several samples or groups, one categorical variable: do the distributions match?', facts: () => [['procedure', 'χ² homogeneity'], ['df', '(r − 1)(c − 1)']] },
  cInd: { text: 'One sample, two categorical variables: are they associated?', facts: () => [['procedure', 'χ² independence'], ['df', '(r − 1)(c − 1)']] },
};
