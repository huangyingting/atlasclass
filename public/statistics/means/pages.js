// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const p3 = x => x < 0.01 ? x.toFixed(4) : x.toFixed(3);
const O = M.ONE, F = M.FILL, PD = M.PD, W = M.WRONG, TT = M.TT, A = TT.A, B = TT.B;
const xb = String.raw`\bar{x}`;
const row = (vals, n = 1) => vals.map(v => `<td>${f(v, n)}</td>`).join('');
const FILL_ROWS = [M.FILLD.slice(0, 8), M.FILLD.slice(8)];
const nOut = M.COND_OUT.length;

export const PAGES = [
  {
    kicker: 'Chapter 7', title: 'Inference for means', sub: 't procedures for μ',
    body: `
      <p class="lede">A sample mean is a good estimate of a population mean, but only an estimate. Inference for means says how good, using nothing but the sample.</p>
      <p>The figure is a simulation, so for once the truth is known: a population with mean <i>μ</i> = ${M.CAP.mu} and standard deviation ${M.CAP.sigma}. Again and again a random sample of ${M.CAP.n} is drawn, and from each sample alone an interval is built, <i>x̄</i> ± <i>t</i>*·<i>s</i>/√<i>n</i>.</p>
      <p>The intervals move about with their samples. ${M.CAP_HITS} of these ${M.CAP.reps} capture <i>μ</i>; the one that misses is red. In the long run ${M.CAP.C * 100}% of them capture it, and that is what “95% confident” means.</p>
      <p>This chapter: why <i>t</i> and not <i>z</i> (7.1); confidence intervals and significance tests for one mean (7.2–7.5), including paired data; the same for the difference of two means (7.6–7.9); and how to choose a procedure (7.10).</p>`,
    cam: { target: [ST.cap + 0.3, 0.1, 0], az: 0, el: 3, dist: 34 }, lit: 'intervals', look: {}, scene: 'cap',
    fig: 'Twenty samples, twenty intervals',
  },
  {
    kicker: '7.1', title: 'The t distributions', sub: 'should I worry about error?',
    body: `
      <p class="lede">To standardize <i>x̄</i> we need <i>σ</i>, which we almost never know. Putting the sample’s <i>s</i> in its place gives a statistic that varies more than <i>z</i>: it has a <b><i>t</i> distribution</b>.</p>
      <p>For a random sample, <i>x̄</i> has mean <i>μ</i> and standard deviation <i>σ</i>/√<i>n</i>. With <i>s</i> for <i>σ</i>, the <b>standard error</b> of <i>x̄</i> is <i>s</i>/√<i>n</i>, and</p>
      <div class="eq">${tex(String.raw`t = \frac{${xb} - \mu}{s/\sqrt{n}}, \qquad df = n - 1`)}</div>
      <p><i>s</i> changes from sample to sample too, and in a small sample it is often too small, so <i>t</i> lands far from 0 more often than <i>z</i> would. A <i>t</i> distribution is centred at 0, symmetric and bell-shaped, with <b>heavier tails</b> than the standard normal. Its <b>degrees of freedom</b> set its shape: as <i>df</i> grows, <i>s</i> pins down <i>σ</i> better and the curve approaches the normal.</p>
      <table class="data">
        <tr><th><i>df</i></th>${M.TTABLE.map(([d]) => `<td>${d}</td>`).join('')}<td>∞ (<i>z</i>)</td></tr>
        <tr><th><i>t</i>* for 95%</th>${M.TTABLE.map(([, t]) => `<td>${t.toFixed(3)}</td>`).join('')}<td>${M.Z95.toFixed(3)}</td></tr>
      </table>
      <p>In the figure: with <i>df</i> = 4, P(|<i>t</i>| > ${M.TD.beyond}) = ${M.tailBeyond(M.TD.beyond, 4).toFixed(3)}, against ${M.normBeyond(M.TD.beyond).toFixed(3)} for <i>z</i>. Use <i>z</i>* = ${M.Z95.toFixed(2)} with a small sample and the intervals come out too narrow: they capture <i>μ</i> less often than they claim. <i>t</i>* corrects that.</p>
      <p><b>Error is always possible.</b> An interval may miss <i>μ</i>; a test may reject a true null hypothesis (a Type I error) or fail to reject a false one (Type II). The methods say how often, never whether this time.</p>`,
    cam: { target: [ST.tdist, 0.1, 0], az: 0, el: 3, dist: 34 }, lit: 'tails', look: {}, scene: 'tdist',
    fig: 'Heavier tails than the normal',
  },
  {
    kicker: '7.2', title: 'A confidence interval for μ', sub: 'statistic ± (critical value)(standard error)',
    body: `
      <p class="lede">A <b>one-sample <i>t</i> interval</b> estimates a population mean <i>μ</i> from one random sample.</p>
      <p>A coffee machine is set to pour ${F.mu0} mL. A random sample of ${F.n} cups (mL):</p>
      <table class="data">${FILL_ROWS.map(r => `<tr>${row(r)}</tr>`).join('')}</table>
      <p><i>x̄</i> = ${f(O.xbar)} mL, <i>s</i> = ${f(O.s)} mL. With <i>df</i> = ${O.df}, <i>t</i>* = ${O.ts.toFixed(3)} for 95% confidence.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}${xb} \pm t^*\frac{s}{\sqrt{n}} &= ${f(O.xbar)} \pm ${O.ts.toFixed(3)}\cdot\frac{${f(O.s)}}{\sqrt{${F.n}}} \\ &= ${f(O.xbar)} \pm ${f(O.me)} \\ &= (${f(O.lo)},\ ${f(O.hi)})\ \text{mL}\end{aligned}`)}</div>
      <p>In the figure the blue ball is <i>x̄</i>, the dark rod one standard error each way, the red rod the whole interval: <i>t</i>* standard errors each way.</p>
      <p><b>Interpret it in context:</b> we are 95% confident that the interval from ${f(O.lo)} to ${f(O.hi)} mL captures the true mean volume of all cups this machine pours.</p>
      <p>The <b>margin of error</b>, <i>t</i>*·<i>s</i>/√<i>n</i>, grows with the confidence level (90%: ±${f(M.ONE90.me)}; 99%: ±${f(M.ONE99.me)}) and shrinks as <i>n</i> grows, like 1/√<i>n</i>: four times the sample, half the margin.</p>`,
    cam: { target: [ST.one - 5, 0.4, 0], az: 0, el: 3, dist: 30 }, lit: 'ci1', look: {}, scene: 'one',
    fig: 'x̄ ± t* standard errors',
  },
  {
    kicker: '7.2', title: 'Checking the conditions', sub: 'random, 10%, and normal or large sample',
    body: `
      <p class="lede">A <i>t</i> interval or test is only trustworthy when three conditions hold. State each, in context, before computing.</p>
      <p><b>Random.</b> The data come from a random sample or a randomized experiment.</p>
      <p><b>10%.</b> When sampling without replacement, <i>n</i> ≤ 10% of the population, so the observations are close to independent.</p>
      <p><b>Normal/Large sample.</b> The population is approximately normal, or <i>n</i> ≥ 30. If <i>n</i> < 30 and the population’s shape is unknown, graph the sample: there must be no strong skew and no outliers.</p>
      <p>The figure has three samples on one scale.</p>
      <table class="data">
        <tr><th></th><th><i>n</i></th><th>the sample</th><th>Normal/Large?</th></tr>
        <tr><td>A</td><td>${M.COND.A.length}</td><td>roughly symmetric, no outliers</td><td>yes</td></tr>
        <tr><td>B</td><td>${M.COND.B.length}</td><td>strongly skewed right, ${nOut} outlier</td><td>no</td></tr>
        <tr><td>C</td><td>${M.COND.C.length}</td><td>skewed right</td><td>yes, <i>n</i> ≥ 30</td></tr>
      </table>
      <p>In B, <i>Q</i><sub>1</sub> = ${f(M.COND_5.q1)} and <i>Q</i><sub>3</sub> = ${f(M.COND_5.q3)}, so anything above ${f(M.COND_5.q3)} + 1.5(${f(M.COND_F.iqr)}) = ${f(M.COND_F.hi)} is an outlier: ${M.COND_OUT.map(v => f(v, 1)).join(', ')} is. With only ${M.COND.B.length} values, <i>x̄</i> and <i>s</i> are pulled by it, and the <i>t</i> procedure is not safe. C is skewed too, but with ${M.COND.C.length} values the central limit theorem makes the sampling distribution of <i>x̄</i> close to normal.</p>
      <p>For the coffee cups, ${F.n} < 30, but their dotplot shows no strong skew or outliers, so the interval of 7.2 stands.</p>`,
    cam: { target: [ST.cond, 0.5, 0], az: 0, el: 3, dist: 32 }, lit: 'skewed', look: {}, scene: 'cond',
    fig: 'Which sample can t handle?',
  },
  {
    kicker: '7.3', title: 'Justifying a claim with an interval', sub: 'the plausible values of μ',
    body: `
      <p class="lede">A confidence interval gives the plausible values of <i>μ</i>. A claimed value outside it is not plausible; one inside it is plausible, but not proven.</p>
      <p>The machine’s maker claims it pours ${F.mu0} mL on average. The 95% interval, ${f(O.lo)} to ${f(O.hi)} mL, does not contain ${F.mu0} (the blue line). Every plausible value is below it: the interval gives convincing evidence that the machine pours less than ${F.mu0} mL on average.</p>
      <p>At 99% confidence the interval is ${f(M.ONE99.lo)} to ${f(M.ONE99.hi)} mL. That does contain ${F.mu0}, so at this level the claim is plausible. More confidence means a wider interval, and fewer values ruled out.</p>
      <p><b>What “95% confident” means.</b> The method captures <i>μ</i> in 95% of all possible random samples, as in the opening figure. This one interval either captures <i>μ</i> or not; we don’t know which.</p>
      <p><b>Common mistakes.</b></p>
      <ul>
        <li>“There is a 95% probability that <i>μ</i> is between ${f(O.lo)} and ${f(O.hi)}.” No: <i>μ</i> is fixed; the probability belongs to the method.</li>
        <li>“95% of cups hold between ${f(O.lo)} and ${f(O.hi)} mL.” No: the interval is for the <i>mean</i>, not for single cups, which vary far more.</li>
        <li>“250 is in the 99% interval, so the mean is 250.” No: it is only one of many plausible values.</li>
      </ul>`,
    cam: { target: [ST.one - 5, 0.4, 0], az: 0, el: 3, dist: 30 }, lit: 'mu0', look: {}, scene: 'one',
    fig: 'Is 250 a plausible mean?',
  },
  {
    kicker: '7.4', title: 'Setting up a test for μ', sub: 'hypotheses about a population mean',
    body: `
      <p class="lede">A <b>one-sample <i>t</i> test</b> asks whether a sample gives convincing evidence against a claimed value <i>μ</i><sub>0</sub> of a population mean.</p>
      <p>A quality inspector checks whether the machine is off target, in either direction:</p>
      <div class="eq">${tex(String.raw`H_0\!: \mu = ${F.mu0} \qquad H_a\!: \mu \ne ${F.mu0}`)}</div>
      <p>where <i>μ</i> is the true mean volume, in mL, of all cups the machine pours. Hypotheses are about the parameter <i>μ</i>, never about <i>x̄</i>, and they are chosen before looking at the data. If only underfilling mattered, <i>H</i><sub>a</sub>: <i>μ</i> < ${F.mu0} would be one-sided.</p>
      <p>The significance level, <i>α</i> = 0.05, is chosen in advance too: it is the probability of a Type I error, rejecting <i>H</i><sub>0</sub> when it is true.</p>
      <p>The conditions are those for an interval: a random sample; ${F.n} cups less than 10% of all cups poured; no strong skew or outliers in the sample, since ${F.n} < 30.</p>
      <p>The question the test answers: the sample mean, ${f(O.xbar)} mL (blue), is below ${F.mu0}. Is it far enough below, counted in standard errors, that chance alone is an unlikely explanation?</p>`,
    cam: { target: [ST.one - 5, 0.4, 0], az: 0, el: 3, dist: 30 }, lit: 'xbar1', look: {}, scene: 'one',
    fig: 'How far is x̄ from 250?',
  },
  {
    kicker: '7.5', title: 'Carrying out a test for μ', sub: 'the t statistic and its p-value',
    body: `
      <p class="lede">The test statistic counts how many standard errors <i>x̄</i> is from <i>μ</i><sub>0</sub>. The <b>p-value</b> is the chance of a result at least that extreme if <i>H</i><sub>0</sub> were true.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}t &= \frac{${xb} - \mu_0}{s/\sqrt{n}} = \frac{${f(O.xbar)} - ${F.mu0}}{${f(O.s)}/\sqrt{${F.n}}} \\ &= ${f(M.T1)}, \quad df = ${O.df}\end{aligned}`)}</div>
      <p>For <i>H</i><sub>a</sub>: <i>μ</i> ≠ ${F.mu0} both tails count (red): p-value = 2P(<i>t</i> ≤ ${f(M.T1)}) = ${p3(M.P1)}.</p>
      <p><b>Conclude in context.</b> Because ${p3(M.P1)} < <i>α</i> = 0.05, we reject <i>H</i><sub>0</sub>. There is convincing evidence that the true mean volume of all cups this machine pours is not ${F.mu0} mL.</p>
      <p><b>Interpret the p-value:</b> assuming the true mean is ${F.mu0} mL, there is a ${p3(M.P1)} probability of getting a sample mean at least as far from ${F.mu0} as ${f(O.xbar)} mL, in either direction, by chance alone in a random sample of ${F.n} cups.</p>
      <p>The test agrees with the 95% interval of 7.3, which left ${F.mu0} out: a two-sided test at <i>α</i> = 0.05 rejects exactly the values a 95% interval leaves out. At <i>α</i> = 0.01 we would not reject, as ${F.mu0} sits in the 99% interval.</p>
      <p>Failing to reject never shows <i>H</i><sub>0</sub> is true; it only says the evidence is not convincing.</p>`,
    cam: { target: [ST.one + 5.5, 0.4, 0], az: 0, el: 3, dist: 30 }, lit: 'pval1', look: {}, scene: 'one',
    fig: 'The p-value: both tails',
  },
  {
    kicker: '7.5', title: 'Paired data', sub: 'one sample of differences',
    body: `
      <p class="lede">When each individual is measured twice, or the individuals come in matched pairs, analyse the <b>differences</b>: they are one sample, and the one-sample <i>t</i> procedures apply to them.</p>
      <p>${M.PAIR.n} randomly chosen students take a reading-speed test (words per minute) before and after a short course. In the figure each student is a rod joining before (grey) to after (black). The rods slide over to start at 0, and their lengths are the differences <i>d</i> = after − before:</p>
      <table class="data">
        <tr><th>before</th>${M.BEFORE.map(v => `<td>${v}</td>`).join('')}</tr>
        <tr><th>after</th>${M.AFTER.map(v => `<td>${v}</td>`).join('')}</tr>
        <tr><th><i>d</i></th>${M.DIFF.map(v => `<td>${f(v, 0)}</td>`).join('')}</tr>
      </table>
      <p><i>x̄</i><sub><i>d</i></sub> = ${f(PD.xbar)}, <i>s</i><sub><i>d</i></sub> = ${f(PD.s)}. Test <i>H</i><sub>0</sub>: <i>μ</i><sub><i>d</i></sub> = 0 against <i>H</i><sub>a</sub>: <i>μ</i><sub><i>d</i></sub> > 0, where <i>μ</i><sub><i>d</i></sub> is the true mean gain for students like these.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}t &= \frac{${xb}_d - 0}{s_d/\sqrt{n}} = \frac{${f(PD.xbar)}}{${f(PD.s)}/\sqrt{${PD.n}}} \\ &= ${f(M.T_PAIR)}, \quad df = ${PD.df}\end{aligned}`)}</div>
      <p>p-value = ${p3(M.P_PAIR)}: convincing evidence that the course raises mean reading speed. The 95% interval for <i>μ</i><sub><i>d</i></sub> is ${f(PD.lo)} to ${f(PD.hi)} words per minute (red).</p>
      <p>The conditions are checked on the differences: a random sample, ${PD.n} < 10% of all such students, and, as ${PD.n} < 30, a dotplot of the differences with no strong skew or outliers.</p>`,
    cam: { target: [ST.paired - 0.3, 0.7, 0], az: 0, el: 3, dist: 48 }, lit: 'diffs', look: {}, scene: 'paired',
    fig: 'Pairs become differences',
  },
  {
    kicker: '7.6', title: 'A confidence interval for μ₁ − μ₂', sub: 'two independent samples',
    body: `
      <p class="lede">To compare the means of two populations (or two treatments), use the <b>two-sample <i>t</i> interval</b> for <i>μ</i><sub>1</sub> − <i>μ</i><sub>2</sub>.</p>
      <p>A reviewer tests random samples of two brands of battery in the same torch (hours of light):</p>
      <table class="data">
        <tr><th></th><th><i>n</i></th><th><i>x̄</i> (h)</th><th><i>s</i> (h)</th></tr>
        <tr><td>brand A</td><td>${A.n}</td><td>${f(A.xbar)}</td><td>${f(A.s)}</td></tr>
        <tr><td>brand B</td><td>${B.n}</td><td>${f(B.xbar)}</td><td>${f(B.s)}</td></tr>
      </table>
      <div class="eq">${tex(String.raw`\begin{aligned}SE &= \sqrt{\frac{s_1^2}{n_1} + \frac{s_2^2}{n_2}} \\ &= \sqrt{\frac{${f(A.s)}^2}{${A.n}} + \frac{${f(B.s)}^2}{${B.n}}} = ${TT.se.toFixed(3)} \\[4pt] &(${xb}_1 - ${xb}_2) \pm t^*\,SE \\ &= ${f(TT.d)} \pm ${TT.ts.toFixed(3)}(${TT.se.toFixed(3)}) \\ &= (${f(TT.lo)},\ ${f(TT.hi)})\ \text{h}\end{aligned}`)}</div>
      <p><b>Degrees of freedom.</b> Technology uses a formula that gives here <i>df</i> = ${TT.df.toFixed(1)}, so <i>t</i>* = ${TT.ts.toFixed(3)}. Without it, the conservative choice is the smaller <i>n</i> − 1 = ${TT.dfc}, <i>t</i>* = ${TT.tsc.toFixed(3)}: a slightly wider interval, (${f(M.CI_C[0])}, ${f(M.CI_C[1])}). Say which one you used.</p>
      <p><b>Conditions:</b> two independent random samples (or two groups formed by random assignment); each <i>n</i> ≤ 10% of its population; each <i>n</i> ≥ 30, or neither sample shows strong skew or outliers.</p>
      <p><b>Interpret:</b> we are 95% confident that the interval from ${f(TT.lo)} to ${f(TT.hi)} hours captures the true difference in mean battery life, brand A minus brand B.</p>`,
    cam: { target: [ST.two - 4, 0.6, 0], az: 0, el: 3, dist: 31 }, lit: 'diffCI', look: {}, scene: 'two',
    fig: 'Two samples, one difference',
  },
  {
    kicker: '7.7', title: 'Justifying a claim about μ₁ − μ₂', sub: 'where does 0 fall?',
    body: `
      <p class="lede">For a difference of means, the value to look for is usually 0: no difference. If 0 is outside the interval, the interval gives convincing evidence of a difference.</p>
      <p><b>Claim 1: brand A lasts longer on average.</b> Every value in ${f(TT.lo)} to ${f(TT.hi)} hours is positive, so 0 is not plausible: there is convincing evidence that <i>μ</i><sub>A</sub> − <i>μ</i><sub>B</sub> > 0, that brand A lasts longer on average.</p>
      <p><b>Claim 2: brand A lasts at least ${M.TWO.claim} hours longer on average.</b> ${M.TWO.claim} is inside the interval, so it is plausible, but so are values well below it, down to ${f(TT.lo)}. The interval does not give convincing evidence for this claim (nor against it).</p>
      <p>Read the sign with the order of subtraction. A − B from ${f(TT.lo)} to ${f(TT.hi)} is the same statement as B − A from ${f(-TT.hi)} to ${f(-TT.lo)}.</p>
      <p>The conclusion is about the means of the populations sampled. Had the data come from a randomized experiment, it would also be about cause and effect; from random samples it is not.</p>`,
    cam: { target: [ST.two - 4, -0.8, 0], az: 0, el: 3, dist: 27 }, lit: 'claims2', look: {}, scene: 'two',
    fig: '0 is out; 2 is in',
  },
  {
    kicker: '7.8', title: 'Setting up a test for μ₁ − μ₂', sub: 'paired or two-sample?',
    body: `
      <p class="lede">First decide how the data were produced. Two measurements on each individual, or matched pairs, call for a <b>paired <i>t</i> test</b> on the differences; two independent groups call for a <b>two-sample <i>t</i> test</b>.</p>
      <p>For two independent groups:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}&H_0\!: \mu_1 - \mu_2 = 0 \\ &H_a\!: \mu_1 - \mu_2 > 0,\ < 0 \text{ or } \ne 0\end{aligned}`)}</div>
      <p>defining <i>μ</i><sub>1</sub> and <i>μ</i><sub>2</sub> in context and saying which is subtracted from which. For pairs, the parameter is the single mean difference <i>μ</i><sub><i>d</i></sub>.</p>
      <p><b>Why it matters.</b> The reading speeds of 7.5, wrongly treated as two independent samples:</p>
      <table class="data">
        <tr><th></th><th><i>SE</i></th><th><i>t</i></th><th>p-value</th></tr>
        <tr><td>paired (right)</td><td>${f(PD.se)}</td><td>${f(M.T_PAIR)}</td><td>${p3(M.P_PAIR)}</td></tr>
        <tr><td>two-sample (wrong)</td><td>${f(W.se)}</td><td>${f(M.T_WRONG)}</td><td>${p3(M.P_WRONG)}</td></tr>
      </table>
      <p>Same means, same difference ${f(W.d)}. But the students differ from one another far more (<i>s</i> ≈ ${f(W.B.s, 0)} words per minute) than any one student changes (<i>s</i><sub><i>d</i></sub> = ${f(PD.s)}). The two-sample analysis counts all that student-to-student spread as noise; pairing removes it. In the figure the blue interval is the wrong analysis, the red one the right.</p>
      <p>The two-sample procedure also needs the groups to be independent, and before and after scores of one student are not.</p>`,
    cam: { target: [ST.paired - 0.3, 0.7, 0], az: 0, el: 3, dist: 48 }, lit: 'twoCI', look: {}, scene: 'paired',
    fig: 'The same data, two analyses',
  },
  {
    kicker: '7.9', title: 'Carrying out a test for μ₁ − μ₂', sub: 'the two-sample t test',
    body: `
      <p class="lede">The test statistic is the difference of the sample means, less its value under <i>H</i><sub>0</sub>, counted in standard errors.</p>
      <p>The reviewer of 7.6 asked in advance whether brand A lasts longer. <i>H</i><sub>0</sub>: <i>μ</i><sub>A</sub> − <i>μ</i><sub>B</sub> = 0, <i>H</i><sub>a</sub>: <i>μ</i><sub>A</sub> − <i>μ</i><sub>B</sub> > 0, where each <i>μ</i> is the true mean life of that brand in this torch, at <i>α</i> = 0.05.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}t &= \frac{(${xb}_A - ${xb}_B) - 0}{\sqrt{\dfrac{s_A^2}{n_A} + \dfrac{s_B^2}{n_B}}} \\ &= \frac{${f(A.xbar)} - ${f(B.xbar)}}{${TT.se.toFixed(3)}} = ${f(M.T2)}\end{aligned}`)}</div>
      <p>With <i>df</i> = ${TT.df.toFixed(1)} (technology), the p-value is P(<i>t</i> ≥ ${f(M.T2)}) = ${p3(M.P2)}, the red tail (magnified in the corner); with the conservative <i>df</i> = ${TT.dfc} it is ${p3(M.P2C)}. Either way it is less than 0.05.</p>
      <p><b>Conclude:</b> reject <i>H</i><sub>0</sub>. There is convincing evidence that brand A batteries last longer on average than brand B in this torch.</p>
      <p>Don’t pool the two standard deviations: the AP course uses the unpooled standard error above. And don’t run two one-sample tests and compare them: the question is about the difference, so the procedure must be.</p>`,
    cam: { target: [ST.two + 7, 0.6, 0], az: 0, el: 3, dist: 28 }, lit: 'pval2', look: {}, scene: 'two',
    fig: 'Is A longer-lived?',
  },
  {
    kicker: '7.10', title: 'Choosing a procedure', sub: 'selecting, carrying out and communicating',
    body: `
      <p class="lede">Most of the work is in the choice. Ask, in order: what kind of parameter, how many samples, and estimate or test?</p>
      <p><b>Mean or proportion?</b> Quantitative data (a measurement for each individual) lead to a mean <i>μ</i> and <i>t</i>. Categorical data (yes or no) lead to a proportion <i>p</i> and <i>z</i> (Chapter 6). Means use <i>t</i> because <i>σ</i> is estimated by <i>s</i>.</p>
      <p><b>One sample, paired, or two samples?</b> Paired data are one sample of differences. Two independent samples, or two treatment groups, use the two-sample procedures.</p>
      <p><b>Interval or test?</b> “Estimate” or “how much” asks for an interval; “is there convincing evidence” asks for a test.</p>
      <table class="data">
        <tr><th>procedure</th><th>standard error</th><th><i>df</i></th></tr>
        <tr><td>one-sample <i>t</i></td><td><i>s</i>/√<i>n</i></td><td><i>n</i> − 1</td></tr>
        <tr><td>paired <i>t</i></td><td><i>s</i><sub><i>d</i></sub>/√<i>n</i></td><td><i>n</i> − 1 (pairs)</td></tr>
        <tr><td>two-sample <i>t</i></td><td>√(<i>s</i><sub>1</sub><sup>2</sup>/<i>n</i><sub>1</sub> + <i>s</i><sub>2</sub><sup>2</sup>/<i>n</i><sub>2</sub>)</td><td>technology, or smaller <i>n</i> − 1</td></tr>
      </table>
      <p><b>Then communicate</b>, in four steps: <b>State</b> the parameter and hypotheses (or confidence level) in context; <b>Plan</b>: name the procedure and check random, 10% and normal/large sample; <b>Do</b>: the statistic, <i>df</i> and p-value or interval; <b>Conclude</b> in context, linked to <i>α</i>, without claiming more than the design allows.</p>`,
    cam: { target: [ST.choose + 0.6, 1.6, 0], az: 0, el: 3, dist: 45 }, lit: 'path', look: {}, scene: 'choose',
    fig: 'Which procedure?',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const cap = s => M.capAt(M.clk(s, 'cap'));
const df = s => M.dfAt(M.clk(s, 'tdist'));
export const PLATES = {
  pop: { text: `The population, known only because this is a simulation: normal, mean ${M.CAP.mu}, standard deviation ${M.CAP.sigma}. In real life it is the thing we cannot see.`, facts: () => [['μ', `${M.CAP.mu}`], ['σ', `${M.CAP.sigma}`]] },
  sample0: { text: `A random sample of ${M.CAP.n} from the population, and its mean x̄ (blue). Each new sample has a different x̄ and a different s.`,
    facts: s => { const a = cap(s), c = M.CAPS[Math.min(a.k, M.CAP.reps - 1)]; return [['sample', `${Math.min(a.k, M.CAP.reps - 1) + 1}`], ['x̄', f(c.xbar)], ['s', f(c.s)]]; } },
  intervals: { text: `One 95% t interval per sample, x̄ ± t*·s/√n with t* = ${M.CAPS[0].ts.toFixed(3)} (df = ${M.CAP.n - 1}). Black ones capture μ, red ones miss. Over many samples, 95% capture it.`,
    facts: s => { const a = cap(s), hit = M.CAPS.slice(0, a.done).filter(c => c.hit).length; return [['intervals', `${a.done}`], ['capture μ', `${hit}`], ['miss', `${a.done - hit}`]]; } },
  mu: { text: 'The population mean μ, the parameter every interval is trying to capture. It does not move; the intervals do.', facts: () => [['μ', `${M.CAP.mu}`]] },
  normal: { text: 'The standard normal curve: the distribution of z = (x̄ − μ)/(σ/√n), when σ is known.', facts: () => [['P(|z| > 2)', M.normBeyond(2).toFixed(3)], ['z* (95%)', M.Z95.toFixed(3)]] },
  tcurve: { text: 'The t distribution with the current degrees of freedom: centred at 0, symmetric, heavier tails than the normal. As df grows it closes in on the normal.',
    facts: s => { const d = df(s); return [['df', d < 10 ? d.toFixed(1) : d.toFixed(0)], ['P(|t| > 2)', M.tailBeyond(2, d).toFixed(3)]]; } },
  tails: { text: 'The outer 5%: beyond ±t*. With few degrees of freedom t* is far out; as df grows it closes in on z* = 1.96.',
    facts: s => { const d = df(s); return [['df', d < 10 ? d.toFixed(1) : d.toFixed(0)], ['t* (95%)', M.tStarOf(d).toFixed(3)], ['z*', M.Z95.toFixed(3)]]; } },
  symm: { text: `Sample A: ${M.COND.A.length} values, roughly symmetric, no outliers. Small, but t procedures are safe.`, facts: () => [['n', `${M.COND.A.length}`], ['Normal/Large', 'met']] },
  skewed: { text: `Sample B: only ${M.COND.B.length} values, strongly skewed right, with an outlier (red) beyond Q₃ + 1.5·IQR. The Normal/Large Sample condition fails: don’t use t.`,
    facts: () => [['Q₁, Q₃', `${f(M.COND_5.q1)}, ${f(M.COND_5.q3)}`], ['upper fence', f(M.COND_F.hi)], ['outlier', M.COND_OUT.map(v => f(v, 1)).join(', ')]] },
  large: { text: `Sample C: skewed right too, but n = ${M.COND.C.length} ≥ 30, so the sampling distribution of x̄ is close to normal (the central limit theorem).`, facts: () => [['n', `${M.COND.C.length}`], ['Normal/Large', 'met']] },
  sample1: { text: `${F.n} cups from the machine, chosen at random: the volumes in mL.`, facts: () => [['n', `${F.n}`], ['x̄', `${f(O.xbar)} mL`], ['s', `${f(O.s)} mL`]] },
  xbar1: { text: 'The sample mean x̄: the point estimate of μ, and the centre of the interval.', facts: () => [['x̄', `${f(O.xbar)} mL`], ['SE = s/√n', `${O.se.toFixed(3)} mL`], ['x̄ − 250', `${f(O.xbar - F.mu0)} mL`]] },
  ci1: { text: `The 95% interval: x̄ ± t*·SE. The dark rod is one SE each way; the red rod is t* = ${O.ts.toFixed(3)} SEs each way.`, facts: () => [['SE', `${O.se.toFixed(3)} mL`], ['t*', O.ts.toFixed(3)], ['margin', `${f(O.me)} mL`], ['interval', `${f(O.lo)} to ${f(O.hi)}`]] },
  mu0: { text: `The claimed mean, ${F.mu0} mL. It lies outside the 95% interval, so it is not a plausible value of μ.`, facts: () => [['μ₀', `${F.mu0} mL`], ['95% CI', `${f(O.lo)} to ${f(O.hi)}`], ['99% CI', `${f(M.ONE99.lo)} to ${f(M.ONE99.hi)}`]] },
  tcurve1: { text: `The t distribution with df = ${O.df}: how t = (x̄ − ${F.mu0})/SE would vary from sample to sample if μ really were ${F.mu0}.`, facts: () => [['df', `${O.df}`]] },
  pval1: { text: 'Where this sample’s t landed, and the p-value: the area beyond it in both tails, since Hₐ is two-sided.', facts: () => [['t', f(M.T1)], ['p-value', p3(M.P1)], ['α', '0.05']] },
  pairs: { text: 'Each rod is one student: before (grey) and after (black). Students differ a lot from one another; each one changes a little.', facts: () => [['students', `${PD.n}`], ['SD before', f(W.B.s)], ['SD after', f(W.A.s)]] },
  diffs: { text: 'The same rods, each slid to start at 0: its length is that student’s difference, after − before. These differences are the one sample analysed.', facts: () => [['x̄_d', f(PD.xbar)], ['s_d', f(PD.s)], ['t', f(M.T_PAIR)], ['p-value', p3(M.P_PAIR)]] },
  pairedCI: { text: 'The paired 95% interval for the mean difference μ_d. 0 is far outside it.', facts: () => [['interval', `${f(PD.lo)} to ${f(PD.hi)}`], ['SE', f(PD.se)]] },
  twoCI: { text: 'The wrong analysis: the same data as two independent samples. Its standard error carries all the student-to-student spread, so the interval is wide and takes in 0.', facts: () => [['interval', `${f(W.lo)} to ${f(W.hi)}`], ['SE', f(W.se)], ['p-value', p3(M.P_WRONG)]] },
  brandA: { text: `Battery life of ${A.n} brand A batteries, and their mean (blue rod).`, facts: () => [['n', `${A.n}`], ['x̄', `${f(A.xbar)} h`], ['s', `${f(A.s)} h`]] },
  brandB: { text: `Battery life of ${B.n} brand B batteries, and their mean (blue rod).`, facts: () => [['n', `${B.n}`], ['x̄', `${f(B.xbar)} h`], ['s', `${f(B.s)} h`]] },
  diffCI: { text: 'The 95% two-sample t interval for μ_A − μ_B: the difference of the sample means ± t*·SE.', facts: () => [['x̄_A − x̄_B', `${f(TT.d)} h`], ['SE', TT.se.toFixed(3)], ['df', TT.df.toFixed(1)], ['interval', `${f(TT.lo)} to ${f(TT.hi)}`]] },
  claims2: { text: `Two claims against the interval: 0 (no difference) lies outside it, so it is not plausible; ${M.TWO.claim} hours lies inside, so it is plausible but not established.`, facts: () => [['0', 'outside'], [`${M.TWO.claim} h`, 'inside']] },
  tcurve2: { text: `The t distribution with df = ${TT.df.toFixed(1)}, from the two-sample formula.`, facts: () => [['df', TT.df.toFixed(1)], ['conservative df', `${TT.dfc}`]] },
  pval2: { text: 'Where the two-sample t landed, and the p-value: the area above it, since Hₐ is μ_A − μ_B > 0.', facts: () => [['t', f(M.T2)], ['p-value', p3(M.P2)], ['with df = ' + TT.dfc, p3(M.P2C)]] },
  tree: { text: 'The questions that pick a procedure: what kind of data (and so what parameter), then how the data were produced.', facts: () => [['quantitative', 'mean, t'], ['categorical', 'proportion, z']] },
  path: { text: 'The path this example takes through the questions, ending at its procedure.', facts: s => { const { k } = M.chooseAt(M.clk(s, 'choose')); return [['example', M.CHOOSE.ex[k][0]], ['procedure', M.NODE[M.CHOOSE.ex[k][1][2]]]]; } },
};
