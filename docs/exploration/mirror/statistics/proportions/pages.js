// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f2 = x => x.toFixed(2), f3 = x => x.toFixed(3), f4 = x => x.toFixed(4), pc = (x, d = 1) => `${(100 * x).toFixed(d)}%`;
const big = n => n.toLocaleString('en-US');
const ph = '<i>p̂</i>', p0 = '<i>p</i><sub>0</sub>', H0 = 'H<sub>0</sub>', Ha = 'H<sub>a</sub>';
const S = M.SIM, W = M.WHY, Bk = M.BIKE, T = M.TEST, Z = M.SIZE, P = M.POWER, D = M.DIFF, F = M.FLU;
const BI = M.BIG_CI, SM = M.SMALL_CI;
const zs = f3(M.ZS), zs90 = f3(M.zStar(0.90)), zs99 = f3(M.zStar(0.99));
const ci = (lo, hi) => `(${f3(lo)}, ${f3(hi)})`;
const NBIG = Bk.n * M.WIDTH.big, ME4 = M.meAt(0.95, NBIG);
const PW = P.ns.map(n => M.powerOf(n)), PW10 = M.powerOf(P.n0, P.alpha2), PWN = M.powerOf(P.n0);
const zLow = M.zCrit(T.alphaLow), zA = M.zCrit(T.alpha);

export const PAGES = [
  {
    kicker: 'Chapter 6', title: 'Inference for proportions', sub: 'intervals and tests for p',
    body: `
      <p class="lede">A sample proportion estimates a population proportion. Inference says how far to trust it.</p>
      <p>In the figure, ${S.reps} random samples of ${S.n} adults are taken from one city, where a proportion <i>p</i> = ${f2(S.p)} support a new bike lane. The figure knows <i>p</i>; a real survey never does.</p>
      <p>Each sample gives its own ${ph} (a dot) and a 95% <b>confidence interval</b> around it (a rod). The vertical line is <i>p</i>. ${S.reps - M.MISSES} of the ${S.reps} intervals reach over it; ${M.MISSES}, in red, miss.</p>
      <p>This chapter builds those intervals and says what “95% confident” does and does not mean. Then it turns the question round: a <b>significance test</b> asks whether a sample would be surprising if a claimed value of <i>p</i> were true, and what errors that decision can make. Last, the same two tools for the difference between two proportions.</p>`,
    cam: { target: [ST.rods + 0.2, 3.6, 0], az: 14, el: 8, dist: 31 }, lit: 'misses', look: {}, scene: 'rods',
    fig: 'Fifty samples, fifty intervals',
  },
  {
    kicker: '6.1', title: 'Why be normal?', sub: 'the sampling distribution of p̂',
    body: `
      <p class="lede">Sample proportions vary from sample to sample. When the sample is large enough, their distribution is approximately normal, so a normal model says which results are unusual.</p>
      <p>In the figure, random samples are drawn from a population with <i>p</i> = ${W.p}, and each sample’s ${ph} drops into a histogram: samples of ${W.ns[0]} on the left, of ${W.ns[1]} on the right. The red curve is the normal model.</p>
      <div class="eq">${tex(String.raw`\mu_{\hat p} = p \qquad \sigma_{\hat p} = \sqrt{\frac{p(1-p)}{n}}`)}</div>
      <p>${ph} is centred on <i>p</i>: it is an <b>unbiased</b> estimator. Its spread shrinks as <i>n</i> grows: σ is ${f3(M.whySd[0])} for <i>n</i> = ${W.ns[0]} and ${f3(M.whySd[1])} for <i>n</i> = ${W.ns[1]}. ${W.ns[1] / W.ns[0]} times the sample, √${W.ns[1] / W.ns[0]} times less spread.</p>
      <p><b>Large counts.</b> The shape is approximately normal when <i>np</i> ≥ 10 and <i>n</i>(1 − <i>p</i>) ≥ 10. With <i>n</i> = ${W.ns[0]}, <i>np</i> = ${M.whyCounts[0][0].toFixed(0)}: the histogram is skewed right and piled against 0, and the normal curve puts ${pc(M.whyBelow0[0])} of its area below 0, where ${ph} cannot go. With <i>n</i> = ${W.ns[1]}, <i>np</i> = ${M.whyCounts[1][0].toFixed(0)} and <i>n</i>(1 − <i>p</i>) = ${M.whyCounts[1][1].toFixed(0)}: the curve fits.</p>
      <p><b>The 10% condition.</b> The formula for σ assumes independent observations. Sampling without replacement, that holds closely enough when the sample is at most 10% of the population.</p>
      <p><b>Example.</b> With <i>n</i> = ${W.ns[1]}, how likely is ${ph} ≥ ${M.FAR.at}? <i>z</i> = (${M.FAR.at} − ${W.p})/${f4(M.whySd[1])} = ${f2(M.farZ)}, and P(<i>Z</i> ≥ ${f2(M.farZ)}) = ${f4(M.farP)}. A sample that far above ${W.p} would be very unusual by chance alone.</p>`,
    cam: { target: [ST.why, 2.4, 0], az: -4, el: 4, dist: 36 }, lit: 'big', look: {}, scene: 'why',
    fig: 'Samples of 20, samples of 200',
  },
  {
    kicker: '6.2', title: 'Constructing a confidence interval', sub: 'statistic ± (critical value)(standard error)',
    body: `
      <p class="lede">A <b>confidence interval</b> gives a range of plausible values for <i>p</i>: the sample’s ${ph}, plus and minus a <b>margin of error</b>.</p>
      <p>A random sample of ${Bk.n} adults in a city: ${Bk.x} support a new bike lane, so ${ph} = ${Bk.x}/${Bk.n} = ${f3(M.bikeP)}. A one-sample <i>z</i> interval for <i>p</i>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\hat p &\pm z^*\sqrt{\frac{\hat p(1-\hat p)}{n}} \\ &= ${f3(M.bikeP)} \pm ${zs}\sqrt{\frac{(${f2(M.bikeP)})(${f2(1 - M.bikeP)})}{${Bk.n}}} \\ &= ${f3(M.bikeP)} \pm ${f3(M.bikeME)} = (${f3(M.BIKE_CI[0])},\ ${f3(M.BIKE_CI[1])})\end{aligned}`)}</div>
      <p><i>z</i>* = ${zs} for 95%: the middle 95% of a standard normal lies between −${zs} and ${zs}. The <b>standard error</b> uses ${ph} in place of the unknown <i>p</i>. The margin of error is <i>z</i>* × SE = ${f3(M.bikeME)}.</p>
      <table class="data">
        <tr><th>condition</th><th>check</th></tr>
        <tr><td>Random</td><td>a random sample of adults</td></tr>
        <tr><td>10%</td><td>${Bk.n} ≤ 10% of the city’s ${big(Bk.N)} adults</td></tr>
        <tr><td>Large counts</td><td><i>n</i>${ph} = ${Bk.x} and <i>n</i>(1 − ${ph}) = ${Bk.n - Bk.x}, both ≥ 10</td></tr>
      </table>
      <p><b>Why it works.</b> In 95% of samples ${ph} lands within ${f2(M.ZS)}σ of <i>p</i> (the blue band). Whenever it does, the interval reaching ${f2(M.ZS)} SE either side of ${ph} reaches back over <i>p</i>. In the figure, sample ${M.SAMPLES.findIndex(s => !s.hit) + 1} lands outside the band, and its interval misses.</p>
      <p>On the exam, name the procedure, check the conditions, do the arithmetic, and state the interval in context.</p>`,
    cam: { target: [ST.build, 1.9, 0], az: -3, el: 3, dist: 28 }, lit: 'interval', look: {}, scene: 'build',
    fig: 'One sample, one interval',
  },
  {
    kicker: '6.2', title: 'Margin of error and sample size', sub: 'choosing n before sampling',
    body: `
      <p class="lede">The margin of error shrinks as <i>n</i> grows, but slowly: like 1/√<i>n</i>. To plan a survey, choose the margin first, then solve for <i>n</i>.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}&z^*\sqrt{\frac{p^*(1-p^*)}{n}} \le \text{ME} \\ &n \ge \Big(\frac{z^*}{\text{ME}}\Big)^2 p^*(1-p^*)\end{aligned}`)}</div>
      <p><i>p</i>* is a guess at <i>p</i>. With none, use <i>p</i>* = 0.5: it makes <i>p</i>*(1 − <i>p</i>*) = 0.25, its largest value, so the <i>n</i> found is enough whatever <i>p</i> turns out to be.</p>
      <p><b>Example.</b> A margin of at most ${Z.ME} at 95% confidence:</p>
      <div class="eq">${tex(String.raw`n \ge \Big(\frac{${zs}}{${Z.ME}}\Big)^2(0.5)(0.5) = ${(M.ZS ** 2 * 0.25 / Z.ME ** 2).toFixed(1)}`)}</div>
      <p>so <i>n</i> = ${M.N_NEED}. Always round <b>up</b>: ${M.N_NEED - 1} would give a margin a little over ${Z.ME}. With a pilot study’s estimate <i>p</i>* = ${Z.pilot}, ${M.N_PILOT} are enough (the blue curve).</p>
      <p>Halving the margin takes four times the sample: <i>n</i> is under a square root.</p>
      <p>The margin of error covers only the chance variation of random sampling. It says nothing about bias from undercoverage, nonresponse or a leading question.</p>`,
    cam: { target: [ST.size, 2.3, 0], az: -3, el: 3, dist: 28 }, lit: 'need', look: {}, scene: 'size',
    fig: 'How many to sample',
  },
  {
    kicker: '6.3', title: 'Interpreting a confidence interval', sub: 'what 95% confident means, and what it doesn’t',
    body: `
      <p class="lede">The interval is a claim about <i>p</i>. The confidence level is a claim about the method that made it.</p>
      <p><b>The interval.</b> “We are 95% confident that the interval from ${f3(M.BIKE_CI[0])} to ${f3(M.BIKE_CI[1])} captures the true proportion of all adults in the city who support the bike lane.” Name the parameter, in context.</p>
      <p><b>The confidence level.</b> “If we took many random samples of ${Bk.n} and built a 95% interval from each, about 95% of the intervals would capture the true proportion.” In the figure, ${S.reps - M.MISSES} of ${S.reps} do; the ${M.MISSES} red ones miss, and nothing about them warned us.</p>
      <p><b>Not:</b> “there is a 95% probability that <i>p</i> is between ${f3(M.BIKE_CI[0])} and ${f3(M.BIKE_CI[1])}.” <i>p</i> is fixed; this interval either captures it or it doesn’t. Nor is it about 95% of adults, or 95% of sample proportions.</p>
      <p><b>Justifying a claim.</b> Every value inside the interval is a <b>plausible</b> value of <i>p</i>.</p>
      <table class="data">
        <tr><th>claim</th><th>from ${ci(...M.BIKE_CI)}</th></tr>
        <tr><td>a majority support it, <i>p</i> &gt; ${Bk.claim}</td><td>convincing: every plausible value is above ${Bk.claim}</td></tr>
        <tr><td><i>p</i> = ${f2(Bk.guess)}</td><td>plausible: it is inside the interval</td></tr>
        <tr><td><i>p</i> ≥ ${f2(Bk.high)}</td><td>not plausible: the interval is below it</td></tr>
      </table>
      <p>Plausible is not proven: the interval does not show that <i>p</i> = ${f2(Bk.guess)}, only that ${f2(Bk.guess)} can’t be ruled out.</p>`,
    cam: { target: [ST.rods, 3.4, 0], az: -3, el: 3, dist: 29 }, lit: 'misses', look: {}, scene: 'rods',
    fig: 'Most intervals catch p',
  },
  {
    kicker: '6.3', title: 'Confidence level and width', sub: 'more confidence costs width; more data buys it back',
    body: `
      <p class="lede">A higher confidence level needs a larger <i>z</i>*, and so a wider interval. A larger sample shrinks the standard error, and so the interval.</p>
      <table class="data">
        <tr><th>level</th><th><i>z</i>*</th><th>margin of error</th><th>interval</th></tr>
        ${M.WIDTH.levels.map(C => { const me = M.meAt(C); return `<tr><td>${C * 100}%</td><td>${f3(M.zStar(C))}</td><td>${f3(me)}</td><td>${ci(M.bikeP - me, M.bikeP + me)}</td></tr>`; }).join('')}
        <tr><td>95%, <i>n</i> = ${big(NBIG)}</td><td>${zs}</td><td>${f3(ME4)}</td><td>${ci(M.bikeP - ME4, M.bikeP + ME4)}</td></tr>
      </table>
      <p>All from the same ${ph} = ${f2(M.bikeP)}. In the figure the red interval sweeps through levels from ${pc(M.WIDTH.lo)} to ${pc(M.WIDTH.hi)}; the blue one has four times the sample, and half the margin of error.</p>
      <p>A 99% interval catches <i>p</i> more often, but says less. Wanting both high confidence and a narrow interval means a larger sample.</p>
      <p>The confidence level is chosen before the data; it is not the probability that one particular interval is right. Neither level nor <i>n</i> changes where the interval is centred: ${ph}.</p>`,
    cam: { target: [ST.width - 0.5, 2.4, 0], az: -3, el: 3, dist: 26 }, lit: 'live', look: {}, scene: 'width',
    fig: 'Wider for more confidence',
  },
  {
    kicker: '6.4', title: 'Setting up a test', sub: 'hypotheses and conditions, with <i>p</i><sub>0</sub>',
    body: `
      <p class="lede">A <b>significance test</b> asks whether a sample gives convincing evidence against a claim about <i>p</i>.</p>
      <p>A phone maker says ${pc(T.p0, 0)} of its phones need a repair within two years. A consumer group suspects more. In a random sample of ${T.n} of the maker’s phones, ${T.x} needed a repair: ${ph} = ${f3(M.testP)}.</p>
      <div class="eq">${tex(String.raw`H_0\!: p = ${T.p0} \qquad H_a\!: p > ${T.p0}`)}</div>
      <p>where <i>p</i> is the proportion of <b>all</b> the maker’s phones that need a repair within two years. The <b>null hypothesis</b> ${H0} is the claim, “no difference from ${T.p0}”; the <b>alternative</b> ${Ha} is what the group hopes to find evidence for. Hypotheses are about the parameter <i>p</i>, never about ${ph}, and are set before the data are seen.</p>
      <p>${Ha} is <b>one-sided</b> (&gt; or &lt;) when the question has a direction, <b>two-sided</b> (≠) when any difference matters.</p>
      <table class="data">
        <tr><th>condition</th><th>check</th></tr>
        <tr><td>Random</td><td>a random sample of the maker’s phones</td></tr>
        <tr><td>10%</td><td>${T.n} ≤ 10% of all its phones</td></tr>
        <tr><td>Large counts</td><td><i>n</i>${p0} = ${M.testCounts[0]} and <i>n</i>(1 − ${p0}) = ${M.testCounts[1]}, both ≥ 10</td></tr>
      </table>
      <p>Large counts uses ${p0}, not ${ph}: the test works out what would happen if ${H0} were true. The figure draws ${T.sims} samples of ${T.n} from <i>p</i> = ${T.p0}; they pile up around the normal curve with centre ${T.p0} and standard deviation ${f4(M.sd0)}.</p>
      <div class="eq">${tex(String.raw`z = \frac{\hat p - p_0}{\sqrt{\frac{p_0(1-p_0)}{n}}} = \frac{${f3(M.testP)} - ${T.p0}}{${f4(M.sd0)}} = ${f2(M.testZ)}`)}</div>`,
    cam: { target: [ST.nul, 3.2, 0], az: -3, el: 3, dist: 29 }, lit: 'sims', look: {}, scene: 'nul',
    fig: 'What chance alone gives',
  },
  {
    kicker: '6.5', title: 'Interpreting p-values', sub: 'how surprising, if H<sub>0</sub> were true',
    body: `
      <p class="lede">The <b>p-value</b> is the probability, assuming ${H0} is true, of a statistic at least as extreme as the one observed, in the direction of ${Ha}.</p>
      <div class="eq">${tex(String.raw`\text{p-value} = P(Z \ge ${f2(M.testZ)}) = ${f3(M.testPV)}`)}</div>
      <p>In the figure, ${M.NULL_BEYOND} of the ${T.sims} samples drawn with <i>p</i> = ${T.p0} reached ${f3(M.testP)} or more: a fraction ${f3(M.NULL_BEYOND / T.sims)}, close to the normal model’s ${f3(M.testPV)}.</p>
      <p><b>In context:</b> “Assuming ${pc(T.p0, 0)} of all the maker’s phones need a repair, there is a ${f3(M.testPV)} probability of getting a sample proportion of ${f3(M.testP)} or higher in a random sample of ${T.n} phones, by chance alone.”</p>
      <p>A small p-value means the data would be rare if ${H0} were true: evidence against ${H0}. A large one means the data are the kind ${H0} often produces: no evidence against it.</p>
      <p><b>Not:</b> the probability that ${H0} is true, nor the probability that the result happened by chance. The p-value is computed <i>assuming</i> ${H0}.</p>
      <p>For a two-sided ${Ha}, count both tails: the p-value is twice the area beyond |<i>z</i>|.</p>`,
    cam: { target: [ST.nul + 0.8, 3.0, 0], az: -3, el: 3, dist: 26 }, lit: 'tail', look: {}, scene: 'nul',
    fig: 'The p-value is a tail',
  },
  {
    kicker: '6.6', title: 'Concluding a test', sub: 'compare the p-value with α',
    body: `
      <p class="lede">Before the data, choose a <b>significance level</b> α. If the p-value is less than α, reject ${H0}; if not, fail to reject ${H0}.</p>
      <p><b>At α = ${T.alpha}:</b> ${f3(M.testPV)} &lt; ${T.alpha}, so reject ${H0}. “Because the p-value of ${f3(M.testPV)} is less than α = ${T.alpha}, we reject ${H0}. We have convincing evidence that more than ${pc(T.p0, 0)} of all the maker’s phones need a repair within two years.”</p>
      <p><b>At α = ${T.alphaLow}:</b> ${f3(M.testPV)} &gt; ${T.alphaLow}, so fail to reject ${H0}. “We do not have convincing evidence that more than ${pc(T.p0, 0)} need a repair.”</p>
      <p>Never “accept ${H0}”: failing to find evidence against a claim does not show it is true.</p>
      <p>The same decision with the test statistic: reject when <i>z</i> is beyond the critical value, <i>z</i>* = ${f3(zA)} for α = ${T.alpha} one-sided, ${f3(zLow)} for ${T.alphaLow}. In the figure α sweeps from ${M.DECIDE.amin} to ${M.DECIDE.amax}; the blue region is beyond <i>z</i>*, and the decision flips as it passes <i>z</i> = ${f2(M.testZ)}.</p>
      <p>A result with p-value below α is called <b>statistically significant</b> at that level. Significant is not the same as large or important.</p>`,
    cam: { target: [ST.decide, 2.3, 0], az: -3, el: 3, dist: 27 }, lit: 'alpha', look: {}, scene: 'decide',
    fig: 'Reject, or not',
  },
  {
    kicker: '6.7', title: 'Errors and power', sub: 'Type I, Type II, and the power to detect',
    body: `
      <p class="lede">A test can be wrong two ways. Its <b>power</b> is the chance it gets a false ${H0} right.</p>
      <table class="data">
        <tr><th></th><th>${H0} true</th><th>${H0} false</th></tr>
        <tr><td>reject ${H0}</td><td><b>Type I error</b>, probability α</td><td>correct: power</td></tr>
        <tr><td>fail to reject</td><td>correct</td><td><b>Type II error</b>, probability β</td></tr>
      </table>
      <p>In context: a Type I error would be concluding that more than ${pc(T.p0, 0)} of phones need repair when really ${pc(T.p0, 0)} do; the maker is wrongly accused. A Type II error would be missing a real excess; owners go on paying for repairs.</p>
      <p>Suppose the truth is <i>p</i> = ${P.pa}. At α = ${T.alpha} the test rejects when ${ph} &gt; ${f4(PWN.crit)}. With <i>n</i> = ${P.n0}:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\text{power} &= P(\hat p > ${f4(PWN.crit)} \mid p = ${f2(P.pa)}) \\ &= ${f3(PWN.power)} \\ \beta &= 1 - \text{power} = ${f3(PWN.beta)}\end{aligned}`)}</div>
      <table class="data">
        <tr><th><i>n</i></th>${P.ns.map(n => `<td>${n}</td>`).join('')}</tr>
        <tr><th>power</th>${PW.map(r => `<td>${f3(r.power)}</td>`).join('')}</tr>
      </table>
      <p><b>Power rises</b> with a larger sample (the curves narrow, as in the figure), a larger α (at α = ${P.alpha2} and <i>n</i> = ${P.n0}, ${f3(PW10.power)}), and a true <i>p</i> farther from ${p0}. Lowering α cuts Type I errors but raises β: the two trade off at a fixed <i>n</i>.</p>`,
    cam: { target: [ST.power, 2.4, 0], az: -3, el: 3, dist: 28 }, lit: 'power', look: {}, scene: 'power',
    fig: 'α, β and power',
  },
  {
    kicker: '6.8', title: 'An interval for a difference', sub: 'p̂<sub>1</sub> − p̂<sub>2</sub>, from two independent samples',
    body: `
      <p class="lede">To compare two proportions, estimate their difference: (${ph}<sub>1</sub> − ${ph}<sub>2</sub>) ± <i>z</i>* × SE.</p>
      <p>Independent random samples of ${D.n1} teens and ${D.n2} adults: ${D.x1} teens and ${D.x2} adults say they get their news mainly from social media. ${ph}<sub>1</sub> = ${f2(BI.p1)}, ${ph}<sub>2</sub> = ${f2(BI.p2)}, a difference of ${f2(BI.d)}.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\text{SE} &= \sqrt{\frac{\hat p_1(1-\hat p_1)}{n_1} + \frac{\hat p_2(1-\hat p_2)}{n_2}} \\ &= \sqrt{${(BI.p1 * (1 - BI.p1) / D.n1).toFixed(6)} + ${(BI.p2 * (1 - BI.p2) / D.n2).toFixed(6)}} \\ &= ${f4(BI.se)}\end{aligned}`)}</div>
      <div class="eq">${tex(String.raw`\begin{aligned}(\hat p_1 - \hat p_2) &\pm z^*\,\text{SE} \\ &= ${f2(BI.d)} \pm ${zs}(${f4(BI.se)}) \\ &= ${f2(BI.d)} \pm ${f3(BI.me)} \\ &= (${f3(BI.lo)},\ ${f3(BI.hi)})\end{aligned}`)}</div>
      <p>The variances add, not the standard errors: the difference of two independent estimates varies more than either.</p>
      <table class="data">
        <tr><th>condition</th><th>check</th></tr>
        <tr><td>Random</td><td>two independent random samples (or two groups from a randomized experiment)</td></tr>
        <tr><td>10%</td><td>each sample ≤ 10% of its population</td></tr>
        <tr><td>Large counts</td><td>${D.x1}, ${D.n1 - D.x1}, ${D.x2}, ${D.n2 - D.x2}: all four ≥ 10</td></tr>
      </table>
      <p>Say which is group 1. The order sets the sign: adults minus teens would give ${ci(-BI.hi, -BI.lo)}.</p>`,
    cam: { target: [ST.diff - 1.8, 2.0, 0], az: -3, el: 3, dist: 34 }, lit: 'bigci', look: {}, scene: 'diff',
    fig: 'The difference, with a margin',
  },
  {
    kicker: '6.9', title: 'Justifying a claim about a difference', sub: 'is 0 a plausible value of p<sub>1</sub> − p<sub>2</sub>?',
    body: `
      <p class="lede">If 0 is outside the interval, the data give convincing evidence that the two proportions differ. If 0 is inside, they do not.</p>
      <p><b>In context:</b> “We are 95% confident that the interval from ${f3(BI.lo)} to ${f3(BI.hi)} captures the true difference (teens minus adults) in the proportions who get their news mainly from social media.”</p>
      <p>Every value is above 0, so there is convincing evidence that a larger proportion of teens than of adults do: by somewhere between ${(100 * BI.lo).toFixed(1)} and ${(100 * BI.hi).toFixed(1)} percentage points.</p>
      <p><b>A smaller study.</b> The same ${ph}s from ${M.SMALL.n1} teens and ${M.SMALL.n2} adults give ${ci(SM.lo, SM.hi)} (blue). 0 is inside: a difference of 0 is plausible, so these data do not give convincing evidence of a difference.</p>
      <p>That is not evidence that there is <i>no</i> difference: the interval also allows a difference as large as ${f2(SM.hi)}. A larger sample narrows it.</p>
      <p>An interval that is entirely negative would be evidence that <i>p</i><sub>1</sub> &lt; <i>p</i><sub>2</sub>. An interval that contains 0 is the same verdict as a two-sided test at α = 1 − <i>C</i> failing to reject.</p>`,
    cam: { target: [ST.diff + 1.2, 1.7, 0], az: -3, el: 3, dist: 25 }, lit: 'zero', look: {}, scene: 'diff',
    fig: 'Is 0 in the interval?',
  },
  {
    kicker: '6.10', title: 'Setting up a two-sample test', sub: 'H<sub>0</sub>: no difference, and the pooled proportion',
    body: `
      <p class="lede">A two-sample <i>z</i> test asks whether a difference between two sample proportions is larger than chance would give.</p>
      <p>In an experiment, ${F.n1 + F.n2} volunteers were randomly assigned: ${F.n1} got a text reminder, ${F.n2} did not. ${F.x1} of the reminded group got a flu shot (${f2(M.fluP1)}) and ${F.x2} of the others (${f2(M.fluP2)}).</p>
      <div class="eq">${tex(String.raw`\begin{aligned}H_0\!&: p_1 - p_2 = 0 \\ H_a\!&: p_1 - p_2 > 0\end{aligned}`)}</div>
      <p>where <i>p</i><sub>1</sub> and <i>p</i><sub>2</sub> are the true proportions who would get a flu shot with and without a reminder.</p>
      <p><b>Pooling.</b> ${H0} says the two proportions are the same, so the test estimates that one common value from both groups together, the <b>pooled</b> (combined) proportion. In the figure the two groups merge and the shots level out across them:</p>
      <div class="eq">${tex(String.raw`\hat p_c = \frac{X_1 + X_2}{n_1 + n_2} = \frac{${F.x1} + ${F.x2}}{${F.n1} + ${F.n2}} = ${f3(M.fluPc)}`)}</div>
      <table class="data">
        <tr><th>condition</th><th>check</th></tr>
        <tr><td>Random</td><td>random assignment to the two treatments</td></tr>
        <tr><td>10%</td><td>not needed: no sampling from a population</td></tr>
        <tr><td>Large counts</td><td>with ${ph}<sub>c</sub>: ${M.fluCounts.map(v => v.toFixed(1)).join(', ')}, all ≥ 10</td></tr>
      </table>`,
    cam: { target: [ST.two, -0.5, 0], az: -3, el: 4, dist: 30 }, lit: 'groups', look: {}, scene: 'two',
    fig: 'Under the null, one pool',
  },
  {
    kicker: '6.11', title: 'Carrying out a two-sample test', sub: 'z, the p-value, and a conclusion in context',
    body: `
      <p class="lede">The test statistic measures the observed difference in standard errors, with the standard error computed from ${ph}<sub>c</sub>.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\text{SE} &= \sqrt{\hat p_c(1-\hat p_c)\Big(\frac{1}{n_1} + \frac{1}{n_2}\Big)} \\ &= \sqrt{(${f2(M.fluPc)})(${f2(1 - M.fluPc)})\Big(\frac{1}{${F.n1}} + \frac{1}{${F.n2}}\Big)} \\ &= ${f4(M.fluSE)}\end{aligned}`)}</div>
      <div class="eq">${tex(String.raw`\begin{aligned}z &= \frac{(\hat p_1 - \hat p_2) - 0}{\text{SE}} \\ &= \frac{${f2(M.fluP1)} - ${f2(M.fluP2)}}{${f4(M.fluSE)}} = ${f2(M.fluZ)}\end{aligned}`)}</div>
      <p>p-value = P(<i>Z</i> ≥ ${f2(M.fluZ)}) = ${f4(M.fluPV)}, the red tail in the figure.</p>
      <p><b>Conclusion.</b> “Because the p-value of ${f4(M.fluPV)} is less than α = ${F.alpha}, we reject ${H0}. We have convincing evidence that a text reminder increases the proportion of people like these volunteers who get a flu shot.”</p>
      <p>Random assignment lets the conclusion be about cause. The volunteers were not a random sample, so it reaches only people like them.</p>
      <p>Pool for the test, because ${H0} says <i>p</i><sub>1</sub> = <i>p</i><sub>2</sub>. Don’t pool for the interval, which makes no such assumption.</p>`,
    cam: { target: [ST.two + 0.3, -1.0, 0], az: -3, el: 3, dist: 29 }, lit: 'tail2', look: {}, scene: 'two',
    fig: 'How far out is 0.14?',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const shownRods = s => M.rodsShown(M.clk(s, 'rods'));
const build = s => M.SAMPLES[M.buildAt(M.clk(s, 'build')).i];
export const PLATES = {
  rods: { text: `Each grey rod is one sample’s 95% interval, ${ph} ± ${f2(M.ZS)}√(${ph}(1 − ${ph})/<i>n</i>), with its ${ph} as the dot. Each reaches over the line at <i>p</i>.`,
    facts: s => { const m = shownRods(s); return [['samples so far', `${m}`], ['capturing p', `${M.caught(m)}`], ['rate', pc(M.caught(m) / m)]]; } },
  misses: { text: `The intervals that miss <i>p</i>: their ${ph} landed more than ${f2(M.ZS)} standard errors from <i>p</i>. About 5% of 95% intervals do, and from one sample alone you can’t tell whether yours is one of them.`,
    facts: () => M.SAMPLES.map((s, i) => [s, i]).filter(([s]) => !s.hit).map(([s, i]) => [`sample ${i + 1}`, `${ci(s.lo, s.hi)}`]) },
  truth: { text: 'The population proportion, a fixed number. Intervals vary from sample to sample; p does not.', facts: () => [['p', f2(S.p)], ['n per sample', `${S.n}`]] },
  small: { text: `${ph} from samples of ${W.ns[0]}, as they come in. The possible values are 0, 0.05, 0.10, …; with <i>np</i> = ${M.whyCounts[0][0]} the histogram is skewed right.`,
    facts: s => [['samples so far', `${M.whyDrawn(M.clk(s, 'why'))}`], ['np', `${M.whyCounts[0][0]}`], ['σ', f3(M.whySd[0])]] },
  big: { text: `${ph} from samples of ${W.ns[1]}. With <i>np</i> = ${M.whyCounts[1][0]} and <i>n</i>(1 − <i>p</i>) = ${M.whyCounts[1][1]}, both at least 10, the histogram takes the normal shape.`,
    facts: s => [['samples so far', `${M.whyDrawn(M.clk(s, 'why'))}`], ['np, n(1 − p)', `${M.whyCounts[1][0]}, ${M.whyCounts[1][1]}`], ['σ', f3(M.whySd[1])]] },
  fit20: { text: `The normal curve with mean ${W.p} and σ = ${f3(M.whySd[0])}. It does not fit: it puts area below 0 and misses the skew.`, facts: () => [['area below 0', pc(M.whyBelow0[0])]] },
  fit200: { text: `The normal curve with mean ${W.p} and σ = ${f3(M.whySd[1])}: a good model for ${ph} here.`, facts: () => [['P(p̂ ≥ 0.15)', f4(M.farP)]] },
  sdist: { text: `Where ${ph} lands, over all samples of ${S.n}: centred on <i>p</i>, standard deviation √(<i>p</i>(1 − <i>p</i>)/<i>n</i>).`, facts: () => [['centre', f2(S.p)], ['σ', f4(M.simSd)]] },
  band: { text: `The middle 95% of the sampling distribution, within ${f2(M.ZS)}σ of <i>p</i>. A ${ph} that lands here has an interval that captures <i>p</i>.`, facts: () => [['from', f3(S.p - M.ZS * M.simSd)], ['to', f3(S.p + M.ZS * M.simSd)]] },
  phat: { text: 'One random sample’s proportion, landing somewhere in the sampling distribution.', facts: s => [['p̂', f3(build(s).ph)]] },
  interval: { text: `${ph} ± <i>z</i>*·SE for the current sample. Red when it misses <i>p</i>.`, facts: s => { const b = build(s); return [['p̂', f3(b.ph)], ['interval', ci(b.lo, b.hi)], ['captures p', b.hit ? 'yes' : 'no']]; } },
  mecurve: { text: 'The margin of error at 95% for each n, with p* = ${Z.pstar}: the largest it can be. It falls like 1/√n.', facts: s => { const n = M.sizeN(M.clk(s, 'size')); return [['n', `${Math.round(n)}`], ['ME', f3(M.meOf(n))]]; } },
  pilot: { text: `With a guess p* = ${Z.pilot}, p*(1 − p*) is smaller, so fewer are needed for the same margin.`, facts: () => [['n for ME ' + Z.ME, `${M.N_PILOT}`]] },
  need: { text: `The target margin and the sample size that meets it: (z*/ME)² × p*(1 − p*), rounded up.`, facts: () => [['ME', `${Z.ME}`], ['n', `${M.N_NEED}`]] },
  now: { text: 'A sample size moving along the curve, and the margin of error it gives.', facts: s => { const n = M.sizeN(M.clk(s, 'size')); return [['n', `${Math.round(n)}`], ['ME', f3(M.meOf(n))]]; } },
  levels: { text: `The same sample at three confidence levels: the higher the level, the wider the interval.`, facts: () => M.WIDTH.levels.map(C => [`${C * 100}%`, ci(M.bikeP - M.meAt(C), M.bikeP + M.meAt(C))]) },
  bign: { text: `95% again, with ${big(NBIG)} adults instead of ${Bk.n}: the standard error is halved, and so is the margin.`, facts: () => [['margin of error', f3(ME4)]] },
  live: { text: 'A confidence level moving from ${pc(M.WIDTH.lo)} to ${pc(M.WIDTH.hi)}, and the interval it gives.', facts: s => { const C = M.widthC(M.clk(s, 'width')); return [['C', pc(C)], ['z*', f3(M.zStar(C))], ['width', f3(2 * M.meAt(C))]]; } },
  nullcurve: { text: `The sampling distribution of ${ph} if ${H0} is true: centre ${T.p0}, standard deviation √(${T.p0} × ${1 - T.p0}/${T.n}).`, facts: () => [['centre', `${T.p0}`], ['σ', f4(M.sd0)]] },
  sims: { text: `Samples of ${T.n} drawn with <i>p</i> = ${T.p0}: what chance alone produces. Red ones reach ${f3(M.testP)} or more.`,
    facts: s => { const m = M.nulShown(M.clk(s, 'nul')), k = M.NULL_SIMS.slice(0, m).filter(v => v >= M.testP - 1e-12).length; return [['samples', `${m}`], ['at or above 0.295', `${k}`], ['fraction', f3(k / m)]]; } },
  tail: { text: `The p-value: the area at or beyond the observed ${f3(M.testP)}, under the distribution that assumes ${H0}.`, facts: () => [['z', f2(M.testZ)], ['p-value', f4(M.testPV)]] },
  zcurve: { text: 'The standard normal: the distribution of the test statistic z when H₀ is true.', facts: () => [['mean', '0'], ['SD', '1']] },
  alpha: { text: 'The rejection region: z beyond z*, area α. A z here means reject H₀. α is chosen before the data.', facts: s => { const a = M.decideA(M.clk(s, 'decide')); return [['α', f3(a)], ['z*', f3(M.zCrit(a))], ['decision', M.testPV < a ? 'reject H₀' : 'fail to reject H₀']]; } },
  zstat: { text: `The observed z, and its p-value, the area beyond it.`, facts: () => [['z', f2(M.testZ)], ['p-value', f4(M.testPV)]] },
  h0: { text: `The distribution of ${ph} if ${H0} is true. It narrows as n grows.`, facts: s => { const n = M.powerN(M.clk(s, 'power')); return [['n', `${n}`], ['σ', f4(M.se1(T.p0, n))]]; } },
  ha: { text: `The distribution of ${ph} if the truth is p = ${P.pa}.`, facts: s => { const n = M.powerN(M.clk(s, 'power')); return [['n', `${n}`], ['σ', f4(M.se1(P.pa, n))]]; } },
  alphaR: { text: 'Beyond the cut-off under H₀: the samples that would wrongly reject a true H₀. Its area is α.', facts: s => [['cut-off', f4(M.powerOf(M.powerN(M.clk(s, 'power'))).crit)], ['α', `${T.alpha}`]] },
  beta: { text: `Short of the cut-off under p = ${P.pa}: the samples that would wrongly keep H₀. Its area is β.`, facts: s => [['β', f3(M.powerOf(M.powerN(M.clk(s, 'power'))).beta)]] },
  power: { text: `Beyond the cut-off under p = ${P.pa}: the samples that rightly reject H₀. Its area is the power, 1 − β.`, facts: s => { const n = M.powerN(M.clk(s, 'power')); return [['n', `${n}`], ['power', f3(M.powerOf(n).power)]]; } },
  props: { text: 'The two sample proportions, and their difference (red).', facts: () => [['teens', f2(BI.p1)], ['adults', f2(BI.p2)], ['difference', f2(BI.d)]] },
  bigci: { text: `(${ph}₁ − ${ph}₂) ± ${f2(M.ZS)} SE, with the standard errors of the two samples combined. 0 is outside it.`, facts: () => [['SE', f4(BI.se)], ['interval', ci(BI.lo, BI.hi)]] },
  smallci: { text: 'The same proportions from samples of 100: a larger standard error, a wider interval, and 0 inside it.', facts: () => [['SE', f4(SM.se)], ['interval', ci(SM.lo, SM.hi)]] },
  zero: { text: 'A difference of 0: the two population proportions equal. Inside an interval, it is plausible; outside, it is not.', facts: () => [['red interval', BI.lo > 0 ? '0 outside' : '0 inside'], ['blue interval', SM.lo > 0 ? '0 outside' : '0 inside']] },
  groups: { text: `Each ball is a volunteer; dark ones got a flu shot. Under ${H0} the two groups share one proportion, so they are pooled: ${F.x1 + F.x2} of ${F.n1 + F.n2}.`, facts: () => [['reminder', f3(M.fluP1)], ['no reminder', f3(M.fluP2)], ['pooled p̂c', f3(M.fluPc)]] },
  nul2: { text: `The distribution of ${ph}₁ − ${ph}₂ if ${H0} is true: centre 0, standard error from ${ph}c.`, facts: () => [['SE', f4(M.fluSE)]] },
  tail2: { text: `The p-value: the area beyond the observed difference ${f2(M.fluD)}.`, facts: () => [['z', f2(M.fluZ)], ['p-value', f4(M.fluPV)]] },
};
