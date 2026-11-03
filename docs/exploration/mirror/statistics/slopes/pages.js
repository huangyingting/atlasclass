// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const P = M.POP, O = M.OUT, I95 = M.CI95, I99 = M.CI99;
const ts = I95.ts.toFixed(3), ts99 = I99.ts.toFixed(3);
const R = Math.sqrt(O.r2 / 100);
const iv = I => `(${f(I.lo, 3)}, ${f(I.hi, 3)})`;
const maxRes = Math.max(...M.RES.map(Math.abs));

export const PAGES = [
  {
    kicker: 'Chapter 9', title: 'Inference for slopes', sub: 'is the trend real?',
    body: `
      <p class="lede">A least-squares line describes one sample. Inference asks what that line says about the line for the whole population.</p>
      <p>A teacher picks ${P.n} students at random and records how many hours each studied for a test and the score each got. The more hours, the higher the score, on the whole. But is the trend real, or could a sample this small show it by chance?</p>
      <p>The figure builds a population where the answer is known. The black line is its <b>population regression line</b>: the mean score at each number of hours. At each <i>x</i> the scores are spread normally about the line (the blue curves). Each student’s score is drawn from the curve at their hours.</p>
      <p>The red line is fitted to the sample: slope <i>b</i> = ${f(O.b, 3)}, while the population’s slope is β = ${P.beta}. In practice β is never known, and <i>b</i> is all we have.</p>
      <p>This chapter states the model, shows how <i>b</i> varies from sample to sample, checks the conditions, builds a <b>confidence interval</b> for β, <b>tests</b> whether β = 0, reads it all off computer output, and ends with choosing the right procedure among all of the course’s.</p>`,
    cam: { target: [ST.model + 0.4, 2.7, 0.6], az: 30, el: 13, dist: 33 }, lit: 'sample', look: {}, scene: 'model',
    fig: 'A population line, and one sample',
  },
  {
    kicker: '9.1', title: 'The population regression model', sub: 'a normal distribution of y at every x',
    body: `
      <p class="lede">Inference for a slope assumes a model: at each value of <i>x</i>, the responses <i>y</i> are normal, centred on a straight line, with the same spread.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\mu_y &= \alpha + \beta x \\ y &= \alpha + \beta x + \varepsilon,\quad \varepsilon \sim N(0,\ \sigma)\end{aligned}`)}</div>
      <p><b>α</b>, <b>β</b> and <b>σ</b> are parameters: the intercept and slope of the population regression line, and the standard deviation of <i>y</i> about it, the same for every <i>x</i>. A sample estimates each with a statistic:</p>
      <table class="data">
        <tr><th>parameter</th><th>statistic</th><th>in the figure</th></tr>
        <tr><td>α (intercept)</td><td><i>a</i></td><td>${P.alpha} → ${f(O.a, 3)}</td></tr>
        <tr><td>β (slope)</td><td><i>b</i></td><td>${P.beta} → ${f(O.b, 3)}</td></tr>
        <tr><td>σ (SD about the line)</td><td><i>s</i></td><td>${P.sigma} → ${f(O.s, 3)}</td></tr>
        <tr><td>μ<sub><i>y</i></sub> (mean <i>y</i> at <i>x</i>)</td><td><i>ŷ</i></td><td>α + β<i>x</i> → <i>a</i> + <i>bx</i></td></tr>
      </table>
      <p>β is the change in the <b>mean</b> score for each extra hour, across all the school’s students. Here β = ${P.beta}: at ${M.BELLS[1]} hours the mean is ${M.mu(M.BELLS[1])}, at ${M.BELLS[2]} hours ${M.mu(M.BELLS[2])}.</p>
      <p><i>s</i> estimates σ from the residuals, dividing by <i>n</i> − 2 because two numbers (<i>a</i> and <i>b</i>) were estimated first:</p>
      <div class="eq">${tex(String.raw`s = \sqrt{\frac{\sum (y_i - \hat y_i)^2}{n-2}} = ${f(O.s, 3)}`)}</div>
      <p>The question behind every test in this chapter: do the points truly align, or would a slope like <i>b</i> turn up by chance even if β were 0?</p>`,
    cam: { target: [ST.model + 0.6, 2.8, 0.7], az: 42, el: 11, dist: 30 }, lit: 'bells', look: {}, scene: 'model',
    fig: 'Normal at every x, the same σ',
  },
  {
    kicker: '9.1', title: 'Sample slopes vary', sub: 'the sampling distribution of b',
    body: `
      <p class="lede">Another sample of the same population gives another line, and another slope. The slopes from all possible samples form the <b>sampling distribution of <i>b</i></b>.</p>
      <p>In the figure the same ${P.n} hours are kept and new scores drawn, ${M.NFAN} times. Each fitted line (red, then grey) tilts a little differently about the true line, and each slope drops into the dotplot.</p>
      <p>When the model holds, the sampling distribution of <i>b</i> is normal, centred at β (<i>b</i> is an <b>unbiased</b> estimator), with standard deviation</p>
      <div class="eq">${tex(String.raw`\sigma_b = \frac{\sigma}{\sigma_x\sqrt n} = \frac{${P.sigma}}{${f(M.SIGMA_X, 3)}\sqrt{${P.n}}} = ${f(M.SIGMA_B, 3)}`)}</div>
      <p>where σ<sub><i>x</i></sub> is the standard deviation of the <i>x</i> values (dividing by <i>n</i>). The ${M.NFAN} slopes have mean ${f(M.FAN_MEAN, 2)} and standard deviation ${f(M.FAN_SD, 2)}, close to ${P.beta} and ${f(M.SIGMA_B, 2)}.</p>
      <p><b>What makes <i>b</i> less variable:</b> less scatter about the line (smaller σ), more spread in <i>x</i> (larger σ<sub><i>x</i></sub>), and a larger sample. Spreading the <i>x</i> values out pins a line down better than bunching them.</p>
      <p>σ is unknown, so it is replaced by <i>s</i>, and σ<sub><i>x</i></sub>√<i>n</i> by <i>s<sub>x</sub></i>√(<i>n</i> − 1). That gives the <b>standard error</b> of the slope, and standardizing with it gives a <i>t</i> distribution with <i>n</i> − 2 degrees of freedom:</p>
      <div class="eq">${tex(String.raw`SE_b = \frac{s}{s_x\sqrt{n-1}} = \frac{${f(O.s, 3)}}{${f(M.FIT.sx, 3)}\sqrt{${P.n - 1}}} = ${f(O.seB, 3)}`)}</div>
      <div class="eq">${tex(String.raw`t = \frac{b-\beta}{SE_b},\qquad df = n-2`)}</div>`,
    cam: { target: [ST.fan - 0.6, 2.7, 0], az: 0, el: 4, dist: 50 }, lit: 'dotplot', look: {}, scene: 'fan',
    fig: 'A slope for every sample',
  },
  {
    kicker: '9.2', title: 'Conditions for inference', sub: 'LINER: linear, independent, normal, equal SD, random',
    body: `
      <p class="lede">The interval and the test are only trustworthy when the model fits. Check five conditions, each with the data, before any arithmetic.</p>
      <table class="data">
        <tr><th>condition</th><th>how to check</th></tr>
        <tr><td><b>L</b>inear</td><td>scatterplot roughly straight; residual plot shows no curve</td></tr>
        <tr><td><b>I</b>ndependent</td><td>sampling without replacement: <i>n</i> ≤ 10% of the population</td></tr>
        <tr><td><b>N</b>ormal</td><td>histogram or dotplot of the residuals: no strong skew or outliers</td></tr>
        <tr><td><b>E</b>qual SD</td><td>residual plot: no fan, the same scatter at every <i>x</i></td></tr>
        <tr><td><b>R</b>andom</td><td>a random sample or a randomized experiment</td></tr>
      </table>
      <p>For the ${P.n} students: the residual plot (centre) is a patternless band about 0, with no curve and no fan, so the linear and equal-SD conditions are met. The histogram of residuals (right) has one peak and no strong skew; the largest residual is ${f(maxRes, 1)}, about ${f(maxRes / O.s, 1)} <i>s</i>, not an extreme outlier. The students were a random sample, and ${P.n} ≤ 10% of the ${M.SCHOOL} students at the school.</p>
      <p><b>Common mistakes.</b> Check normality on the <b>residuals</b>, not on <i>x</i> or <i>y</i>. There is no “<i>n</i> ≥ 30” rule that excuses a skewed residual plot here. A curved residual plot means the slope is the wrong summary: no interval can fix that.</p>`,
    cam: { target: [ST.resid + 3.4, 2.5, 0], az: 0, el: 4, dist: 40 }, lit: 'residplot', look: {}, scene: 'resid',
    fig: 'Residuals: no curve, no fan',
  },
  {
    kicker: '9.2', title: 'Reading regression output', sub: 'Coef, SE Coef, T, P, S and R-Sq',
    body: `
      <p class="lede">Software prints the regression in a standard table. Every number this chapter needs is in it.</p>
      ${M.OUTPUT}
      <p><b>Coef.</b> The Constant row gives the intercept <i>a</i>; the row named for the explanatory variable gives the slope <i>b</i>:</p>
      <div class="eq">${tex(String.raw`\widehat{\text{score}} = ${f(O.a, 3)} + ${f(O.b, 3)}\,(\text{hours})`)}</div>
      <p><b>SE Coef</b> of Hours is <i>SE<sub>b</sub></i> = ${f(O.seB, 3)}. <b>T</b> = Coef/SE Coef = ${O.t}: the test statistic for H<sub>0</sub>: β = 0. <b>P</b> = ${O.p.toFixed(3)} is its two-sided P-value.</p>
      <p><b>S</b> = <i>s</i> = ${f(O.s, 3)}: actual scores typically differ from the predicted score by about ${f(O.s, 1)} points. <b>R-Sq</b> = <i>r</i><sup>2</sup>: ${O.r2}% of the variation in score is accounted for by the linear model on hours. Then <i>r</i> = +√${(O.r2 / 100).toFixed(3)} = ${R.toFixed(3)}, positive like the slope.</p>
      <p><b>Interpreting the slope:</b> for each additional hour studied, the predicted score increases by about ${f(O.b, 3)} points.</p>
      <p><b>Common mistakes.</b> The Constant row’s T and P test α = 0, rarely a question worth asking. S is not <i>SE<sub>b</sub></i>. R-Sq(adj) is not needed in this course.</p>`,
    cam: { target: [ST.resid - 9.8, 2.8, 0], az: -6, el: 4, dist: 31 }, lit: 'fit', look: {}, scene: 'resid',
    fig: 'The fitted line, from the printout',
  },
  {
    kicker: '9.2', title: 'A confidence interval for the slope', sub: '<i>b</i> ± <i>t</i>*·<i>SE<sub>b</sub></i>, with <i>n</i> − 2 degrees of freedom',
    body: `
      <p class="lede">A confidence interval for β is the sample slope, plus or minus a margin of error.</p>
      <div class="eq">${tex(String.raw`b \pm t^*\,SE_b, \qquad df = n - 2`)}</div>
      <p><b>Do.</b> With <i>n</i> = ${P.n}, df = ${M.DF} and for 95% confidence <i>t</i>* = ${ts}. From the output:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}${f(O.b, 3)} &\pm ${ts}\,(${f(O.seB, 3)}) \\ = ${f(O.b, 3)} &\pm ${f(I95.me, 3)} = (${f(I95.lo, 3)},\ ${f(I95.hi, 3)})\end{aligned}`)}</div>
      <p><b>Conclude.</b> We are 95% confident that the interval from ${f(I95.lo, 3)} to ${f(I95.hi, 3)} captures the slope of the population regression line relating test score to hours studied for students at this school. That is, the mean score rises by between ${f(I95.lo, 2)} and ${f(I95.hi, 2)} points for each extra hour.</p>
      <p><b>The confidence level</b> is about the method: in repeated samples, about 95% of intervals made this way capture β. On the right, ${M.NSTACK - M.MISSES} of ${M.NSTACK} intervals from ${M.NSTACK} samples do. One particular interval either captures β or does not.</p>
      <p>The figure sweeps the level from 80% to 99%: a higher level needs a larger <i>t</i>* and gives a wider interval. At 99%, <i>t</i>* = ${ts99} and the interval is ${iv(I99)}.</p>
      <p>A full answer names the procedure (a <i>t</i> interval for the slope), checks the conditions, does the arithmetic, and concludes in context.</p>`,
    cam: { target: [ST.ci - 1.7, 2.6, 0], az: 0, el: 4, dist: 46 }, lit: 'interval', look: {}, scene: 'ci',
    fig: 'An interval for β',
  },
  {
    kicker: '9.3', title: 'Justifying a claim with an interval', sub: 'is the claimed slope among the plausible values?',
    body: `
      <p class="lede">The values inside a confidence interval are the plausible values of β. A claimed value outside it is evidence against the claim.</p>
      <p><b>Is there a relationship?</b> If β = 0, the mean score does not change with hours: no linear relationship. 0 is not in the 95% interval ${iv(I95)}, and every value in it is positive. So the data give convincing evidence that β > 0: in the population, more hours go with higher mean scores.</p>
      <p>At 99% the interval is ${iv(I99)}. It contains 0, so at that level 0 is plausible: the evidence is not strong enough to rule out no relationship.</p>
      <p><b>A claim.</b> A tutoring company says each extra hour of study is worth ${M.CLAIM} points on average. ${M.CLAIM} lies above both intervals, so the data give convincing evidence against the claim: the true slope appears to be smaller.</p>
      <p>A <i>C</i>% interval and a two-sided test at α = 1 − <i>C</i> agree: the test rejects β = β<sub>0</sub> exactly when β<sub>0</sub> is outside the interval. The interval says more: how big the slope plausibly is.</p>
      <p><b>Common mistakes.</b> A value inside the interval is plausible, not proven: “0 is in the interval, so there is no relationship” is wrong. And “there is a 95% probability that β is in the interval” is wrong: β is fixed; the 95% is the method’s capture rate.</p>`,
    cam: { target: [ST.ci - 5.4, 2.3, 0], az: 0, el: 4, dist: 28 }, lit: 'claims', look: {}, scene: 'ci',
    fig: 'Is 0 plausible? Is the claim?',
  },
  {
    kicker: '9.4', title: 'Setting up a test for the slope', sub: 'H<sub>0</sub>: β = 0, against the alternative you set out to show',
    body: `
      <p class="lede">A significance test for the slope asks whether the sample slope is too far from a hypothesized value, usually 0, to be put down to chance.</p>
      <p><b>The hypotheses</b> are about the population slope β, never about <i>b</i>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}H_0\!&: \beta = 0 \\ H_a\!&: \beta > 0,\ \ \beta < 0\ \ \text{or}\ \ \beta \neq 0\end{aligned}`)}</div>
      <p>H<sub>0</sub>: β = 0 says there is no linear relationship: the mean of <i>y</i> is the same at every <i>x</i>. Define β in context: “the slope of the population regression line relating test score to hours studied for all students at the school”. Choose H<sub>a</sub> from the question, before seeing the data.</p>
      <p>The teacher asks whether score and hours are linearly related at all, so H<sub>a</sub>: β ≠ 0, at α = 0.05. The procedure is a <b><i>t</i> test for the slope</b>, with the same LINER conditions, checked in 9.2.</p>
      <p><b>Why a test is needed.</b> On the right is the world of H<sub>0</sub>: the true line is flat, and samples are drawn from it with the same hours and the same scatter as ours. Their fitted lines still tilt, by chance. Of ${M.NNULL} such samples, ${M.NULL_STEEP} had a slope as steep as ours, ${f(O.b, 3)}, in either direction. Our slope would be unusual if H<sub>0</sub> were true.</p>
      <p>H<sub>0</sub> may name another value, β = β<sub>0</sub>, such as a claimed slope; the test is the same with β<sub>0</sub> in place of 0.</p>`,
    cam: { target: [ST.nul + 0.4, 2.8, 0], az: 4, el: 5, dist: 30 }, lit: 'nullfan', look: {}, scene: 'nul',
    fig: 'The world where β = 0',
  },
  {
    kicker: '9.5', title: 'Carrying out a test for the slope', sub: '<i>t</i> = (<i>b</i> − β<sub>0</sub>)/<i>SE<sub>b</sub></i>, and <i>P</i> from the <i>t</i> distribution',
    body: `
      <p class="lede">The test statistic counts how many standard errors the sample slope lies from the hypothesized slope.</p>
      <div class="eq">${tex(String.raw`t = \frac{b - \beta_0}{SE_b} = \frac{${f(O.b, 3)} - 0}{${f(O.seB, 3)}} = ${f(M.T_OBS, 2)}`)}</div>
      <p>with df = <i>n</i> − 2 = ${M.DF}. The output prints T = ${O.t}, from the unrounded <i>b</i> and <i>SE<sub>b</sub></i>; either is fine.</p>
      <p><b>The P-value</b> is the probability, if H<sub>0</sub> is true, of a <i>t</i> at least this far out. H<sub>a</sub> is two-sided, so both tails count: <i>P</i> = 2<i>P</i>(<i>t</i> ≥ ${O.t}) = ${O.p.toFixed(3)}, as the output prints. In the figure the null samples of 9.4 drop their <i>t</i> values onto the <i>t</i> curve; ${M.NULL_EXTREME} of ${M.NNULL}, ${(M.NULL_EXTREME / M.NNULL).toFixed(3)}, land in the red tails.</p>
      <p><b>Interpreting it.</b> Assuming there is no linear relationship between hours and score in the population, there is a ${O.p.toFixed(3)} probability of getting a sample slope at least as far from 0 as ${f(O.b, 3)} by chance alone.</p>
      <p><b>Conclude.</b> Because <i>P</i> = ${O.p.toFixed(3)} < α = 0.05, reject H<sub>0</sub>. There is convincing evidence of a linear relationship between hours studied and test score for students at this school.</p>
      <p><b>Common mistakes.</b> Never “accept H<sub>0</sub>”: fail to reject it. The P-value is not the probability that H<sub>0</sub> is true. And these students chose their own study time: this was an observational study, so it shows an association, not that studying more <i>causes</i> higher scores. Only a randomized experiment supports cause.</p>`,
    cam: { target: [ST.tdist, 2.4, 0], az: 0, el: 4, dist: 35 }, lit: 'pvalue', look: {}, scene: 'tdist',
    fig: 'How far out is our t?',
  },
  {
    kicker: '9.5', title: 'One-sided tests, other claims, errors', sub: 'when the printed P is not the answer',
    body: `
      <p class="lede">The output’s T and P answer one question: a two-sided test of β = 0. Other questions need a small step more.</p>
      <p><b>One-sided.</b> For H<sub>a</sub>: β > 0, the P-value is one tail. When <i>b</i> is on the side H<sub>a</sub> predicts, halve the printed P: ${O.p.toFixed(3)}/2 = ${M.P_ONE.toFixed(4)}. When <i>b</i> is on the other side, the P-value is 1 minus that, and there is no evidence for H<sub>a</sub>.</p>
      <p><b>Another β<sub>0</sub>.</b> To test the tutoring company’s claim, H<sub>0</sub>: β = ${M.CLAIM} against H<sub>a</sub>: β < ${M.CLAIM}, compute <i>t</i> by hand:</p>
      <div class="eq">${tex(String.raw`t = \frac{${f(O.b, 3)} - ${M.CLAIM}}{${f(O.seB, 3)}} = ${f(M.T_CLAIM, 2)}`)}</div>
      <div class="eq">${tex(String.raw`P = P(t \le ${f(M.T_CLAIM, 2)}) = ${(M.P_CLAIM / 2).toFixed(4)}`)}</div>
      <p>With df = ${M.DF}: strong evidence that the true slope is less than ${M.CLAIM}, as the interval in 9.3 showed.</p>
      <p><b>Test and interval agree.</b> <i>P</i> = ${O.p.toFixed(3)} < 0.05, and the 95% interval leaves out 0. <i>P</i> = ${O.p.toFixed(3)} > 0.01, and the 99% interval takes 0 in.</p>
      <p><b>Errors.</b> A <b>Type I error</b> here would be concluding that hours and score are linearly related when in the population they are not; its probability is α. A <b>Type II error</b> would be missing a relationship that is there. Larger samples, more spread in <i>x</i>, and a larger α all make a Type II error less likely.</p>`,
    cam: { target: [ST.tdist + 0.6, 2.0, 0], az: 0, el: 4, dist: 34 }, lit: 'tstat', look: {}, scene: 'tdist',
    fig: 'The tail beyond t',
  },
  {
    kicker: '9.6', title: 'Selecting an inference procedure', sub: 'match the procedure to the question',
    body: `
      <p class="lede">Every procedure in the course answers one kind of question. Three questions about the data pick it out.</p>
      <p><b>1. What was measured?</b> A category for each individual (proportions, counts), a number (means), or two numbers for each individual (a slope). <b>2. How many samples or groups,</b> and are they paired? <b>3. Estimate or test?</b> “How large…” or “estimate…” asks for an interval; “is there convincing evidence…” for a test.</p>
      <table class="data">
        <tr><th>procedure</th><th>when</th></tr>
        <tr><td>1-prop <i>z</i></td><td>one categorical variable, one sample: <i>p</i></td></tr>
        <tr><td>2-prop <i>z</i></td><td>one categorical variable, two groups: <i>p</i><sub>1</sub> − <i>p</i><sub>2</sub></td></tr>
        <tr><td>χ² goodness of fit</td><td>one categorical variable, its whole distribution against a claim</td></tr>
        <tr><td>1-sample <i>t</i></td><td>one quantitative variable, one sample: μ</td></tr>
        <tr><td>paired <i>t</i></td><td>two measurements on each individual: μ<sub>diff</sub></td></tr>
        <tr><td>2-sample <i>t</i></td><td>one quantitative variable, two independent groups: μ<sub>1</sub> − μ<sub>2</sub></td></tr>
        <tr><td>χ² homogeneity</td><td>one categorical variable, several separate samples or treatments</td></tr>
        <tr><td>χ² independence</td><td>two categorical variables in one sample</td></tr>
        <tr><td><i>t</i> for slope</td><td>two quantitative variables, a linear relationship: β</td></tr>
      </table>
      <p><b>Clues in the wording:</b> “proportion”, “percent” → <i>z</i>; “mean”, “average” → <i>t</i>; “relationship” between categorical variables → χ²; between quantitative variables → the slope.</p>
      <p><b>Common mistakes.</b> Paired data analysed as two samples (the same people measured twice are paired). Homogeneity and independence confused: it depends on the design, several samples or one. A correlation question needs the slope test, not a χ² test.</p>`,
    cam: { target: [ST.choose + 1.1, 3.2, 0], az: 0, el: 6, dist: 39 }, lit: 'pick', look: {}, scene: 'choose',
    fig: 'Which procedure?',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const n = s => M.fanCount(M.fanT(M.clk(s, 'fan')));
export const PLATES = {
  popline: { text: 'The population regression line, μ<sub>y</sub> = α + βx: the mean score of all the school’s students who study x hours. Built here so it can be seen; in practice it is unknown.', facts: () => [['α', `${P.alpha}`], ['β', `${P.beta} points per hour`]] },
  bells: { text: 'The distribution of scores at each number of hours: normal, centred on the line, with the same standard deviation σ at every x. That is the model inference for slopes assumes.', facts: () => [['σ', `${P.sigma}`], ...M.BELLS.slice(1, 4).map(x => [`mean at ${x} h`, `${M.mu(x)}`])] },
  sample: { text: `One random sample of ${P.n} students. Each point appears on the line and slides to its score: a draw from the normal curve at its hours.`,
    facts: s => { const t = M.modelT(M.clk(s, 'model')); return [['drawn', `${M.DATA.x.filter((_, i) => M.drawn(i, t) > 0).length} of ${P.n}`], ['x̄ (hours)', f(M.FIT.mx, 2)], ['ȳ (score)', f(M.FIT.my, 2)]]; } },
  fit0: { text: 'The least-squares line of this sample. Its slope b estimates β; a different sample would give a different line.', facts: () => [['b', f(O.b, 3)], ['β', `${P.beta}`], ['a', f(O.a, 3)]] },
  fan: { text: `New samples of ${P.n} scores at the same hours, each with its own fitted line (red), the last few in grey. They tilt about the true line.`,
    facts: s => { const k = n(s), c = M.FAN[Math.max(k - 1, 0)]; return [['sample', `${k}`], ['its slope b', f(c.b, 3)], ['its SE_b', f(c.se, 3)]]; } },
  dotplot: { text: 'Each ball is one sample’s slope. Together they show the sampling distribution of b: centred at β, normal, with SD σ_b = σ/(σ_x√n).',
    facts: s => { const k = n(s), bs = M.FAN.slice(0, k).map(q => q.b), m = bs.reduce((a, b) => a + b, 0) / Math.max(k, 1); return [['samples', `${k}`], ['mean of b so far', k ? f(m, 3) : '–'], ['β', `${P.beta}`], ['σ_b', f(M.SIGMA_B, 3)]]; } },
  data: { text: `The ${P.n} students: hours studied and test score.`, facts: () => [['n', `${P.n}`], ['r', R.toFixed(3)]] },
  fit: { text: 'The least-squares line, as the output prints it: score-hat = a + b(hours).', facts: () => [['a (Constant Coef)', f(O.a, 3)], ['b (Hours Coef)', f(O.b, 3)], ['S', f(O.s, 3)], ['R-Sq', `${O.r2}%`]] },
  resids: { text: 'Each blue stick is a residual, y − ŷ: how far the point is above (+) or below (−) the line.', facts: s => { const t = M.residT(M.clk(s, 'resid')), i = Math.min(Math.floor(t / M.RES_RUN.each), P.n - 1); return [['student', `${i + 1}`], ['hours', `${M.DATA.x[i]}`], ['residual', f(M.RES[i], 2)]]; } },
  residplot: { text: 'Residual against x. A patternless band about 0 means a straight line fits (linear) and the scatter is the same at every x (equal SD). A curve or a fan would break a condition.', facts: () => [['largest |residual|', f(maxRes, 2)], ['s', f(O.s, 3)]] },
  hist: { text: 'The residuals’ histogram: one peak, roughly symmetric, no strong outliers. So the normal condition is reasonable.', facts: () => M.HIST.filter(h => h[2]).map(([a, b, c]) => [`${a} to ${b}`, `${c}`]) },
  sampdist: { text: 'A t curve centred at b with spread SE_b, df = n − 2: where β could be, given this sample. The red middle area is the confidence level.', facts: s => { const I = M.interval(M.ciC(s)); return [['C', `${(100 * I.C).toFixed(1)}%`], ['t*', I.ts.toFixed(3)]]; } },
  interval: { text: 'b ± t*·SE_b. A higher confidence level needs a larger t* and makes the interval wider.', facts: s => { const I = M.interval(M.ciC(s)); return [['C', `${(100 * I.C).toFixed(1)}%`], ['t*', I.ts.toFixed(3)], ['interval', `${f(I.lo, 3)} to ${f(I.hi, 3)}`]]; } },
  claims: { text: `Two values of β to judge: 0 (no linear relationship) and ${M.CLAIM} (the tutoring company’s claim). Each is plausible only while the interval covers it.`,
    facts: s => { const I = M.interval(M.ciC(s)), inn = v => v >= I.lo && v <= I.hi ? 'inside: plausible' : 'outside'; return [['C', `${(100 * I.C).toFixed(1)}%`], ['0', inn(0)], [`${M.CLAIM}`, inn(M.CLAIM)]]; } },
  stack: { text: `Intervals from ${M.NSTACK} different samples of the same population. About 95% of such intervals capture β; red ones miss.`, facts: () => [['capture β', `${M.NSTACK - M.MISSES} of ${M.NSTACK}`], ['β', `${P.beta}`]] },
  nullfan: { text: `A population with β = 0: a flat line at ȳ, with scatter s. Samples from it, at the same hours, still give tilted lines by chance.`, facts: () => [['null samples', `${M.NNULL}`], ['slopes as steep as ours', `${M.NULL_STEEP}`]] },
  ours: { text: 'Our sample and its fitted line. Its slope would be unusual if H₀: β = 0 were true.', facts: () => [['b', f(O.b, 3)], ['SE_b', f(O.seB, 3)]] },
  tcurve: { text: `The t distribution with df = n − 2 = ${M.DF}: the sampling distribution of t = b/SE_b when β = 0. Scaled here to the ${M.NNULL} null samples.`, facts: () => [['df', `${M.DF}`], ['t* for 95%', ts]] },
  pvalue: { text: 'The P-value: both tails beyond ±t, since Hₐ is β ≠ 0. Small: data like ours would rarely happen if β were 0.', facts: () => [['t', `${O.t}`], ['P (two-sided)', O.p.toFixed(3)], ['P (one-sided)', M.P_ONE.toFixed(4)]] },
  tstat: { text: 'Our t statistic: the sample slope is this many standard errors above 0.', facts: () => [['b', f(O.b, 3)], ['SE_b', f(O.seB, 3)], ['t = b/SE_b', f(M.T_OBS, 3)], ['T (output)', `${O.t}`]] },
  nullts: { text: 'The t value of each null sample from 9.4, dropped onto the t curve. The red ones are at least as far out as ours: their share estimates the P-value.', facts: s => { const t = M.nullT(M.clk(s, 'tdist')), k = Math.min(Math.floor(t / M.NULL_RUN.each) + 1, M.NNULL); return [['null samples', `${k}`], ['as extreme', `${M.NULLS.slice(0, k).filter(q => Math.abs(q.t) >= M.T_OBS).length}`]]; } },
  question: { text: 'A question, as an exam might ask it. Read what was measured, how many groups, and whether it asks for an estimate or a test.', facts: s => [['now', M.CASES[M.caseAt(M.clk(s, 'choose'))][0]]] },
  pick: { text: 'The nine procedures of the course: proportions and χ² for categorical data, t for means, the slope test for two quantitative variables.', facts: s => [['fits', M.PROCS[M.CASES[M.caseAt(M.clk(s, 'choose'))][1]][0]]] },
};
