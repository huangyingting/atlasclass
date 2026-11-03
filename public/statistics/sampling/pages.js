// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const pct = x => `${+(100 * x).toFixed(1)}%`;
const D = M.DRAW, S = M.SIM, A = M.APPLE, P = M.PROP, PD = M.PD, X = M.XB, MD = M.MD;
const xbar = '<i>x̄</i>', phat = '<i>p̂</i>';
const lastSum = M.CLT_SUM[2], firstSum = M.CLT_SUM[0];

export const PAGES = [
  {
    kicker: 'Chapter 5', title: 'Sampling distributions', sub: 'how a statistic varies',
    body: `
      <p class="lede">A statistic computed from a random sample changes from sample to sample. Its <b>sampling distribution</b> says by how much, and in what pattern.</p>
      <p>The top board is a population: the number of books every student at a large school read last summer. It is skewed right, with mean μ = ${M.MU.toFixed(2)} books and standard deviation σ = ${M.SIGMA.toFixed(2)} books.</p>
      <p>Ten students at a time are chosen at random (red). Their mean, ${xbar}, is where the cone balances them, and it drops into the dotplot below. After ${D.k} samples the means have a centre of ${M.DRAW_SUM.mean.toFixed(2)}, close to μ, and a standard deviation of only ${M.DRAW_SUM.sd.toFixed(2)}. Their pile is far more symmetric than the population.</p>
      <p>This chapter is about that pile: why samples differ, what the normal model says about them, and the centre, spread and shape of the sampling distributions of ${phat} and ${xbar}, alone and as differences. They are the base for every confidence interval and test in the units ahead.</p>`,
    cam: { target: [ST.draw, -1.5, 0], az: 6, el: 6, dist: 38 }, lit: 'xbars', look: {}, scene: 'draw',
    fig: 'Sample after sample',
  },
  {
    kicker: '5.1', title: 'Why is my sample not like yours?', sub: 'sampling variability',
    body: `
      <p class="lede">Different random samples from the same population give different values of a statistic. This is <b>sampling variability</b>, and it is not a mistake.</p>
      <p>The first ${M.FIRST} samples of ${D.n} students from the opener, and their means:</p>
      <div class="eq">${tex(String.raw`\bar{x} = \frac{\sum x_i}{n}`)}</div>
      <table class="data">
        <tr><th>sample</th><th>books read</th><th>${xbar}</th></tr>
        ${M.FIRST_S.map((r, i) => `<tr><td>${i + 1}</td><td>${r.s.join(', ')}</td><td>${r.m.toFixed(1)}</td></tr>`).join('')}
      </table>
      <p>No sample matches the population mean, μ = ${M.MU.toFixed(2)}, exactly; each is off by chance alone. Which students are picked is random, so the statistic is too.</p>
      <p>The variation has a pattern. Across many samples, the values of ${xbar} cluster around μ, and larger samples cluster more tightly. Knowing that pattern lets us say how far from the truth a sample result is likely to be, and so whether a result is surprising.</p>
      <p>Random selection is what makes the pattern predictable. A convenience sample, such as the students in one class, can be off in the same direction every time, and no formula can say by how much.</p>`,
    cam: { target: [ST.draw, -1.3, 0], az: 3, el: 5, dist: 36 }, lit: 'tray', look: {}, scene: 'draw',
    fig: 'Ten students at a time',
  },
  {
    kicker: '5.1', title: 'Is it just chance?', sub: 'estimating a probability by simulation',
    body: `
      <p class="lede">A <b>simulation</b> imitates a chance process many times. The fraction of repetitions in which something happens estimates its probability.</p>
      <p>A town council claims that half its voters, <i>p</i> = ${S.p}, support a new park. In a random sample of ${S.n} voters, ${S.obs} said yes: ${phat} = ${M.SIM_OBS.toFixed(3)}. Is that more than chance could easily produce, if the claim is true?</p>
      <p><b>The model.</b> Each voter says yes with probability ${S.p} (a coin flip, or a random digit: 0–4 yes, 5–9 no). One trial is ${S.n} voters; record ${phat}. Repeat it ${S.k} times. The figure runs it: red balls are yes.</p>
      <p><b>The result.</b> ${M.SIM_TAIL} of the ${S.k} simulated samples gave ${phat} ≥ ${M.SIM_OBS.toFixed(3)}, so the estimated probability is ${M.SIM_TAIL}/${S.k} = ${M.SIM_EST.toFixed(2)}. (The exact binomial value is ${M.SIM_EXACT.toFixed(3)}.)</p>
      <p><b>The conclusion.</b> If half the voters support the park, a result at least this high happens only about ${Math.round(100 * M.SIM_EST)}% of the time. That is unusual, so the sample gives some evidence that more than half support it. It does not prove the claim wrong: unlikely results do happen.</p>
      <p>A second run of ${S.k} would give a slightly different count. More repetitions give a better estimate of the probability.</p>`,
    cam: { target: [ST.sim, -1.5, 0], az: -4, el: 4, dist: 37 }, lit: 'simTail', look: {}, scene: 'sim',
    fig: 'If the claim were true',
  },
  {
    kicker: '5.2', title: 'The normal distribution, revisited', sub: 'areas and cut-offs',
    body: `
      <p class="lede">For a normal distribution, a probability is an area under the curve. Standardize, then find the area.</p>
      <p>The weights of apples from an orchard are approximately normal, with μ = ${A.mu} g and σ = ${A.sigma} g. A <b>z-score</b> says how many standard deviations a value is from the mean:</p>
      <div class="eq">${tex(String.raw`z = \frac{x - \mu}{\sigma}`)}</div>
      <p><b>An area.</b> What proportion of apples weigh between ${A.a} g and ${A.b} g?</p>
      <div class="eq">${tex(String.raw`\begin{aligned} z_1 &= \frac{${A.a} - ${A.mu}}{${A.sigma}} = ${f(M.Z_A)} \\ z_2 &= \frac{${A.b} - ${A.mu}}{${A.sigma}} = ${f(M.Z_B)} \\ P(${A.a} < X < ${A.b}) &= P(${f(M.Z_A)} < Z < ${f(M.Z_B)}) \\ &= ${M.P_AB.toFixed(3)} \end{aligned}`)}</div>
      <p>About ${pct(M.P_AB)} of apples (red). Above ${A.b} g lie ${M.P_OVER_B.toFixed(3)} of them.</p>
      <p><b>A cut-off.</b> How heavy must an apple be to be in the heaviest 10%? The z with area 0.90 below it is ${f(M.Z_TOP)}, so <i>x</i> = ${A.mu} + ${f(M.Z_TOP)} × ${A.sigma} = ${M.CUT.toFixed(1)} g (blue).</p>
      <p>On the exam, show the work: name the distribution and its parameters, the boundary and the area wanted, or a labelled sketch. Calculator syntax alone, such as normalcdf(…), earns no credit.</p>`,
    cam: { target: [ST.normal, -0.3, 0], az: -3, el: 3, dist: 31 }, lit: 'area', look: { calc: 1 }, scene: 'normal',
    fig: 'Probability as area',
  },
  {
    kicker: '5.2', title: 'Parameters and statistics', sub: 'a fixed number and a random one',
    body: `
      <p class="lede">A <b>parameter</b> describes a population; a <b>statistic</b> describes a sample. A statistic is used to estimate a parameter.</p>
      <table class="data">
        <tr><th></th><th>parameter</th><th>statistic</th></tr>
        <tr><td>mean</td><td>μ</td><td>${xbar}</td></tr>
        <tr><td>standard deviation</td><td>σ</td><td><i>s</i></td></tr>
        <tr><td>proportion</td><td><i>p</i></td><td>${phat}</td></tr>
      </table>
      <p>The mean weight of all the orchard’s apples, μ = ${A.mu} g (blue), is a parameter: one fixed number, usually unknown. A random sample of ${M.APS.n} apples gave ${xbar} = ${M.APS_M[0].toFixed(1)} g and <i>s</i> = ${M.APS_S[0].toFixed(1)} g: statistics. The next sample gave ${xbar} = ${M.APS_M[1].toFixed(1)} g.</p>
      <p>Because the sample is random, a statistic is a random variable. Its probability distribution, the values it takes over all possible samples of the same size, is its <b>sampling distribution</b>.</p>
      <p>Telling them apart: ask whether the number came from the whole population (parameter) or from the data in hand (statistic). Parameters use Greek letters, or <i>p</i>; statistics use Roman letters, or a hat.</p>`,
    cam: { target: [ST.normal, -0.6, 0], az: 3, el: 3, dist: 31 }, lit: 'xbarMark', look: { sample: 1 }, scene: 'normal',
    fig: 'μ stays, x̄ moves',
  },
  {
    kicker: '5.3', title: 'The central limit theorem', sub: 'means become normal',
    body: `
      <p class="lede">The <b>central limit theorem</b> (CLT): when <i>n</i> is large enough, the sampling distribution of ${xbar} is approximately normal, whatever the shape of the population.</p>
      <p>The figure takes ${M.CLT.k} random samples of each size from the skewed population of the opener and plots their means:</p>
      <table class="data">
        <tr><th><i>n</i></th><th>mean of the ${xbar}’s</th><th>SD of the ${xbar}’s</th><th>σ/√<i>n</i></th></tr>
        ${M.CLT_SUM.map(c => `<tr><td>${c.n}</td><td>${c.mean.toFixed(2)}</td><td>${c.sd.toFixed(2)}</td><td>${c.se.toFixed(2)}</td></tr>`).join('')}
      </table>
      <p>Three things hold at once. The centre stays at μ = ${M.MU.toFixed(2)}. The spread shrinks like σ/√<i>n</i>. And the shape changes: at <i>n</i> = ${firstSum.n} the means are still skewed right, at <i>n</i> = ${lastSum.n} the red normal curve fits them closely.</p>
      <div class="eq">${tex(String.raw`\mu_{\bar{x}} = \mu \qquad \sigma_{\bar{x}} = \frac{\sigma}{\sqrt{n}}`)}</div>
      <p>How large is large enough depends on the population: the more skewed it is, the larger <i>n</i> must be. The AP rule of thumb is <i>n</i> ≥ 30.</p>
      <p>A common mistake: the CLT is about the distribution of ${xbar}, not of the data. A large sample from a skewed population looks skewed too; it is the means of many such samples that pile up in a normal shape.</p>`,
    cam: { target: [ST.clt, 0.4, 0], az: -3, el: 3, dist: 41 }, lit: 'n30', look: {}, scene: 'clt',
    fig: 'From skewed to normal',
  },
  {
    kicker: '5.4', title: 'Biased and unbiased point estimates', sub: 'aim and precision',
    body: `
      <p class="lede">A statistic used to estimate a parameter is a <b>point estimator</b>. It is <b>unbiased</b> when the mean of its sampling distribution equals the parameter.</p>
      <p>Each target is one estimator. The blue bullseye is the parameter; each dart is the estimate from one random sample.</p>
      <p><b>Bias</b> is about the centre. The top two estimators centre on the bullseye: unbiased. The bottom two land off to one side, sample after sample: biased.</p>
      <p><b>Variability</b> is about the spread: how far the estimates scatter from sample to sample. The left two vary little, the right two a lot. The best estimator (red) has low bias and low variability.</p>
      <p>${xbar} is an unbiased estimator of μ and ${phat} of <i>p</i>: in 5.3 the ${xbar}’s centred on μ at every <i>n</i>. The sample maximum is biased for the population maximum: it can never be larger, and is usually smaller.</p>
      <p><b>Larger samples reduce variability, not bias.</b> From 5.3, the SD of ${xbar} fell from ${M.N_SMALL.sd.toFixed(2)} at <i>n</i> = ${M.N_SMALL.n} to ${M.N_LARGE.sd.toFixed(2)} at <i>n</i> = ${M.N_LARGE.n}. But a biased method, such as a voluntary-response survey, stays biased however many answer it: it just misses more precisely.</p>`,
    cam: { target: [ST.targets, -0.2, 0], az: 0, el: 3, dist: 30 }, lit: 'tA', look: {}, scene: 'targets',
    fig: 'Aim and spread',
  },
  {
    kicker: '5.5', title: 'The sampling distribution of p̂', sub: 'centre p, spread √(p(1 − p)/n)',
    body: `
      <p class="lede">The sample proportion ${phat} has a sampling distribution with mean <i>p</i> and a standard deviation that shrinks as <i>n</i> grows.</p>
      <p>In a school district of ${P.N.toLocaleString('en-US')} students, ${P.p * 100}% walk to school (red beads). The figure takes random samples of ${P.n} students and drops each sample’s ${phat} into the dotplot.</p>
      <div class="eq">${tex(String.raw`\begin{aligned} \mu_{\hat{p}} &= p = ${P.p} \\ \sigma_{\hat{p}} &= \sqrt{\frac{p(1-p)}{n}} \\ &= \sqrt{\frac{${P.p}(${f(1 - P.p)})}{${P.n}}} = ${M.PROP_SD.toFixed(4)} \end{aligned}`)}</div>
      <table class="data">
        <tr><th></th><th>mean of ${phat}</th><th>SD of ${phat}</th></tr>
        <tr><td>${P.k} simulated samples</td><td>${M.PROP_SUM.mean.toFixed(3)}</td><td>${M.PROP_SUM.sd.toFixed(4)}</td></tr>
        <tr><td>the formulas</td><td>${P.p}</td><td>${M.PROP_SD.toFixed(4)}</td></tr>
      </table>
      <p><b>Interpreting the SD.</b> In random samples of ${P.n} students from this district, the sample proportion who walk typically varies by about ${M.PROP_SD.toFixed(3)} from the true proportion, ${P.p}.</p>
      <p>Because <i>n</i> is under the square root, four times the sample size halves the SD: samples of ${4 * P.n} would give ${(M.PROP_SD / 2).toFixed(4)}.</p>`,
    cam: { target: [ST.prop, -0.5, 0], az: 3, el: 4, dist: 35 }, lit: 'phats', look: {}, scene: 'prop',
    fig: 'Scoop after scoop',
  },
  {
    kicker: '5.5', title: 'When p̂ is approximately normal', sub: 'the 10% and large counts conditions',
    body: `
      <p class="lede">Two conditions let us use the formulas and a normal model for ${phat}. Check both, in context, before any calculation.</p>
      <p><b>10% condition.</b> Sampling without replacement, the draws are close enough to independent when <i>n</i> ≤ 10% of the population. Here ${P.n} ≤ 0.10(${P.N.toLocaleString('en-US')}) = ${0.1 * P.N}, so σ<sub>${phat}</sub> = ${M.PROP_SD.toFixed(4)} can be used.</p>
      <p><b>Large counts condition.</b> The sampling distribution is approximately normal when <i>np</i> ≥ 10 and <i>n</i>(1 − <i>p</i>) ≥ 10. Here ${P.n}(${P.p}) = ${M.PROP_NP} and ${P.n}(${f(1 - P.p)}) = ${M.PROP_NQ}: both at least 10. With smaller counts the distribution is skewed, away from the nearer end, 0 or 1.</p>
      <p><b>A probability.</b> How likely is a sample of ${P.n} with at least ${P.cut * 100}% walkers?</p>
      <div class="eq">${tex(String.raw`\begin{aligned} z &= \frac{${P.cut} - ${P.p}}{${M.PROP_SD.toFixed(4)}} = ${f(M.PROP_Z)} \\ P(\hat{p} \ge ${P.cut}) &= P(Z \ge ${f(M.PROP_Z)}) = ${M.PROP_TAIL.toFixed(3)} \end{aligned}`)}</div>
      <p>The shaded tail. In the ${P.k} simulated samples, ${Math.round(M.PROP_SIMTAIL * P.k)} had ${phat} ≥ ${P.cut}: ${M.PROP_SIMTAIL.toFixed(2)}, close to the model.</p>
      <p>In these conditions use <i>p</i>, the parameter, not ${phat}: the sampling distribution belongs to the true proportion.</p>`,
    cam: { target: [ST.prop, -0.8, 0], az: -3, el: 3, dist: 35 }, lit: 'phatCurve', look: { curve: 1 }, scene: 'prop',
    fig: 'The normal model for p̂',
  },
  {
    kicker: '5.6', title: 'Differences in sample proportions', sub: 'comparing two groups by proportion',
    body: `
      <p class="lede">For two independent random samples, the difference ${phat}<sub>1</sub> − ${phat}<sub>2</sub> has its own sampling distribution, centred on <i>p</i><sub>1</sub> − <i>p</i><sub>2</sub>.</p>
      <p>District 1 is the district of 5.5: ${P.p * 100}% walk; samples of ${PD.n1}. In district 2, ${PD.p2 * 100}% walk; samples of ${PD.n2}. Each pair of samples gives a difference (the red bar), which drops into the dotplot.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\mu_{\hat{p}_1 - \hat{p}_2} &= p_1 - p_2 = ${f(M.PD_MU)} \\ \sigma_{\hat{p}_1 - \hat{p}_2} &= \sqrt{\frac{p_1(1-p_1)}{n_1} + \frac{p_2(1-p_2)}{n_2}} \\ &= \sqrt{\frac{${PD.p1}(${f(1 - PD.p1)})}{${PD.n1}} + \frac{${PD.p2}(${f(1 - PD.p2)})}{${PD.n2}}} = ${M.PD_SD.toFixed(4)}\end{aligned}`)}</div>
      <p>The variances add, even for a difference: two independent sources of chance make the difference vary more than either alone. Standard deviations do not add; variances do.</p>
      <p><b>Conditions.</b> Independent random samples; each less than 10% of its population; and all four counts at least 10: ${M.PD_COUNTS.map(c => +c.toFixed(1)).join(', ')}. Then the sampling distribution is approximately normal.</p>
      <p><b>A probability.</b> How often would district 2’s sample show the higher proportion?</p>
      <div class="eq">${tex(String.raw`\begin{aligned} z &= \frac{0 - ${f(M.PD_MU)}}{${M.PD_SD.toFixed(4)}} = ${f(M.PD_Z)} \\ P(\hat{p}_1 - \hat{p}_2 < 0) &= P(Z < ${f(M.PD_Z)}) = ${M.PD_LESS0.toFixed(3)} \end{aligned}`)}</div>
      <p>About ${Math.round(100 * M.PD_LESS0)}% of the time, even though district 1 truly has more walkers. In the figure, ${Math.round(M.PD_SIMLESS * PD.k)} of ${PD.k} differences fell below 0.</p>`,
    cam: { target: [ST.pdiff, -0.9, 0], az: 3, el: 4, dist: 35 }, lit: 'diffs', look: {}, scene: 'pdiff',
    fig: 'Two samples, one difference',
  },
  {
    kicker: '5.7', title: 'The sampling distribution of x̄', sub: 'centre μ, spread σ/√n',
    body: `
      <p class="lede">The sample mean ${xbar} has a sampling distribution with mean μ and standard deviation σ/√<i>n</i>.</p>
      <div class="eq">${tex(String.raw`\mu_{\bar{x}} = \mu \qquad \sigma_{\bar{x}} = \frac{\sigma}{\sqrt{n}} = \frac{${X.sigma}}{\sqrt{${X.n}}} = ${M.XB_SE}\ \text{g}`)}</div>
      <p>For the orchard’s apples, N(${X.mu}, ${X.sigma}), the mean weight of a random sample of ${X.n} has a standard deviation of ${M.XB_SE} g: the red curve, a third as wide as the population’s.</p>
      <p><b>Shape.</b> If the population is normal, ${xbar} is normal for any <i>n</i>. If it is not, the CLT makes ${xbar} approximately normal when <i>n</i> ≥ 30. With a small sample from a skewed or unknown population, neither holds, and a normal calculation is not justified. The SD formula also needs the 10% condition.</p>
      <p><b>A probability.</b> One apple over ${X.cut} g has <i>z</i> = (${X.cut} − ${X.mu})/${X.sigma} = ${f(M.XB_Z1)}. The mean of ${X.n} over ${X.cut} g has <i>z</i> = (${X.cut} − ${X.mu})/${M.XB_SE} = ${f(M.XB_Z)}:</p>
      <div class="eq">${tex(String.raw`\begin{aligned} P(X > ${X.cut}) &= P(Z > ${f(M.XB_Z1)}) = ${M.XB_P1.toFixed(3)} \\ P(\bar{x} > ${X.cut}) &= P(Z > ${f(M.XB_Z)}) = ${M.XB_P.toFixed(3)} \end{aligned}`)}</div>
      <p>A heavy apple is common; a heavy average of ${X.n} is not, because light and heavy apples in a sample offset each other. The most common mistake is to divide by σ when the question is about ${xbar}.</p>`,
    cam: { target: [ST.xbar, -0.4, 0], az: -3, el: 3, dist: 31 }, lit: 'xbarX', look: {}, scene: 'xbar',
    fig: 'Narrower by √n',
  },
  {
    kicker: '5.8', title: 'Differences in sample means', sub: 'comparing two groups by mean',
    body: `
      <p class="lede">For independent random samples from two populations, ${xbar}<sub>1</sub> − ${xbar}<sub>2</sub> has mean μ<sub>1</sub> − μ<sub>2</sub>, and its variance is the sum of the two variances.</p>
      <p>Apples of variety A weigh N(${MD.A.mu}, ${MD.A.sigma}) grams and of variety B N(${MD.B.mu}, ${MD.B.sigma}). Take ${MD.A.n} A’s and ${MD.B.n} B’s at random and compare their means (the red bar on the top board).</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\mu_{\bar{x}_1 - \bar{x}_2} &= \mu_1 - \mu_2 = ${MD.A.mu} - ${MD.B.mu} = ${M.MD_MU}\ \text{g} \\ \sigma_{\bar{x}_1 - \bar{x}_2} &= \sqrt{\frac{\sigma_1^2}{n_1} + \frac{\sigma_2^2}{n_2}} \\ &= \sqrt{\frac{${MD.A.sigma}^2}{${MD.A.n}} + \frac{${MD.B.sigma}^2}{${MD.B.n}}} = ${M.MD_SD.toFixed(2)}\ \text{g}\end{aligned}`)}</div>
      <p><b>Shape.</b> Both populations are normal, so the difference is normal. Otherwise each sample needs <i>n</i> ≥ 30 for the CLT. Each sample must also be under 10% of its population, and the samples independent of each other.</p>
      <p><b>A probability.</b> How likely is the B sample to come out heavier on average?</p>
      <div class="eq">${tex(String.raw`\begin{aligned} z &= \frac{0 - ${M.MD_MU}}{${M.MD_SD.toFixed(2)}} = ${f(M.MD_Z)} \\ P(\bar{x}_A - \bar{x}_B < 0) &= P(Z < ${f(M.MD_Z)}) = ${M.MD_LESS0.toFixed(3)} \end{aligned}`)}</div>
      <p>Rare: with these sample sizes, the heavier variety almost always shows the heavier mean. Smaller samples would make the red curve wider and the shaded area larger.</p>`,
    cam: { target: [ST.mdiff, -0.4, 0], az: 3, el: 3, dist: 33 }, lit: 'mdiff', look: {}, scene: 'mdiff',
    fig: 'Two means, one difference',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const drawNow = s => M.drawAt(M.clk(s, 'draw'));
const landedSd = (vals, k) => k > 1 ? Math.sqrt(vals.slice(0, k).reduce((a, v, _, arr) => a + (v - arr.reduce((p, q) => p + q, 0) / k) ** 2, 0) / (k - 1)) : 0;
const avg = (vals, k) => k ? vals.slice(0, k).reduce((a, b) => a + b, 0) / k : 0;
export const PLATES = {
  pop: { text: `Every student at the school, by how many books they read last summer. Most read few; a few read many: skewed right. Its mean, μ (blue), is pulled right of the peak by the long tail.`,
    facts: () => [['μ', `${M.MU.toFixed(2)} books`], ['σ', `${M.SIGMA.toFixed(2)} books`], ['read none', `${M.POP.pct[0]}%`]] },
  tray: { text: `${D.n} students chosen at random, each ball at the number of books that student read. The cone is the sample mean, x̄: where the sample would balance.`,
    facts: s => { const { i } = drawNow(s); return i < D.k ? [['sample', `${i + 1} of ${D.k}`], ['values', D.samples[i].join(', ')], ['x̄', M.DRAW_M[i].toFixed(1)]] : [['samples', `all ${D.k} taken`]]; } },
  xbars: { text: `One dot per sample: its mean. The dots centre on μ (blue) and spread far less than the population: this is the sampling distribution of x̄, built one sample at a time.`,
    facts: s => { const { i } = drawNow(s); return [['means so far', `${i}`], ['their mean', i ? avg(M.DRAW_M, i).toFixed(2) : '–'], ['their SD', i > 1 ? landedSd(M.DRAW_M, i).toFixed(2) : '–'], ['σ/√n', M.DRAW_SE.toFixed(2)]]; } },
  flips: { text: `One simulated sample of ${S.n} voters, made with the claim built in: each says yes (red) with probability ${S.p}.`,
    facts: s => { const { i } = M.simAt(M.clk(s, 'sim')); return i < S.k ? [['trial', `${i + 1}`], ['yes', `${M.SIM_X[i]} of ${S.n}`], ['p̂', M.SIM_PH[i].toFixed(3)]] : [['trials', `${S.k}`]]; } },
  simDots: { text: `The p̂ of each simulated sample. This is what chance alone produces when p = ${S.p}: the dots centre near ${S.p}.`,
    facts: s => { const { i } = M.simAt(M.clk(s, 'sim')); return [['trials so far', `${i}`], ['mean p̂', i ? avg(M.SIM_PH, i).toFixed(3) : '–']]; } },
  simTail: { text: `The simulated samples at least as extreme as the real one (p̂ ≥ ${M.SIM_OBS.toFixed(3)}). Their share estimates the probability of such a result if the claim is true.`,
    facts: s => { const { i } = M.simAt(M.clk(s, 'sim')), t = M.SIM_X.slice(0, i).filter(x => x >= S.obs).length; return [['at or beyond', `${t} of ${i}`], ['estimate', i ? (t / i).toFixed(3) : '–'], ['exact (binomial)', M.SIM_EXACT.toFixed(3)]]; } },
  apples: { text: `The weight of a randomly chosen apple: approximately normal. The total area under the curve is 1.`, facts: () => [['μ', `${A.mu} g`], ['σ', `${A.sigma} g`]] },
  area: { text: `The apples between ${A.a} g and ${A.b} g. Their share is this area: standardize both ends and find the area between.`, facts: () => [['z', `${f(M.Z_A)} to ${f(M.Z_B)}`], ['area', M.P_AB.toFixed(3)]] },
  cut: { text: `The heaviest 10% of apples lie beyond this line. Work backwards: the area 0.90 below gives z, then x = μ + zσ.`, facts: () => [['z', f(M.Z_TOP)], ['cut-off', `${M.CUT.toFixed(1)} g`]] },
  sampleN: { text: `${M.APS.n} apples picked at random, each ball at its weight. A new sample every few seconds.`,
    facts: s => { const { i } = M.apsAt(M.clk(s, 'normal')); return [['weights (g)', M.APS.samples[i].map(x => x.toFixed(1)).join(', ')]]; } },
  xbarMark: { text: `The sample mean: a statistic. It changes with every sample, and it estimates μ.`,
    facts: s => { const { i } = M.apsAt(M.clk(s, 'normal')); return [['x̄', `${M.APS_M[i].toFixed(1)} g`], ['s', `${M.APS_S[i].toFixed(1)} g`], ['x̄ − μ', `${f(M.APS_M[i] - A.mu, 1)} g`]]; } },
  muMark: { text: `The population mean: a parameter. One fixed number, the same whichever sample is taken.`, facts: () => [['μ', `${A.mu} g`]] },
  popC: { text: `The population of the opener: skewed right. Every histogram below is built from samples of it.`, facts: () => [['μ', M.MU.toFixed(2)], ['σ', M.SIGMA.toFixed(2)]] },
  ...Object.fromEntries(M.CLT_SUM.map((c, j) => [`n${c.n}`, {
    text: `${M.CLT.k} random samples of ${c.n}, their means as a histogram, with the normal curve of mean μ and SD σ/√${c.n}. ${j === 0 ? 'Still skewed: n is too small.' : j === 1 ? 'Nearly symmetric already.' : 'The normal curve fits: the CLT at work.'}`,
    facts: s => { const L = M.cltAt(M.clk(s, 'clt')); return [['samples so far', `${L}`], ['mean of x̄', L ? avg(M.CLT_M[j], L).toFixed(2) : '–'], ['SD of x̄', L > 1 ? landedSd(M.CLT_M[j], L).toFixed(2) : '–'], ['σ/√n', c.se.toFixed(2)]]; },
  }])),
  ...Object.fromEntries(M.TG.list.map(t => [t.key, {
    text: `${t.title}. ${t.bias ? 'The darts centre away from the parameter: every sample errs the same way.' : 'The darts centre on the parameter.'} ${t.sd > 0.4 ? 'They scatter widely: any one estimate may be far off.' : 'They cluster tightly.'}`,
    facts: s => [['samples', `${M.tgAt(M.clk(s, 'targets'))} of ${M.TG.darts}`], ['biased', t.bias ? 'yes' : 'no'], ['variability', t.sd > 0.4 ? 'high' : 'low']],
  }])),
  jar: { text: `The population, as a jar of beads: red for a student who walks to school. The jar stands for all ${P.N.toLocaleString('en-US')} students.`, facts: () => [['p', `${P.p}`], ['N', P.N.toLocaleString('en-US')]] },
  scoop: { text: `One random sample of ${P.n} students. Its proportion of red is p̂.`,
    facts: s => { const { i } = M.propAt(M.clk(s, 'prop')); return i < P.k ? [['sample', `${i + 1}`], ['walk', `${M.PROP_X[i]} of ${P.n}`], ['p̂', M.PROP_PH[i].toFixed(2)]] : [['samples', `${P.k}`]]; } },
  phats: { text: `The p̂ of every sample so far: centred at p (blue), with SD close to √(p(1 − p)/n).`,
    facts: s => { const { i } = M.propAt(M.clk(s, 'prop')); return [['samples so far', `${i}`], ['mean p̂', i ? avg(M.PROP_PH, i).toFixed(3) : '–'], ['SD p̂', i > 1 ? landedSd(M.PROP_PH, i).toFixed(4) : '–'], ['formula', M.PROP_SD.toFixed(4)]]; } },
  phatCurve: { text: `The normal model, N(p, √(p(1 − p)/n)), justified by the large counts condition. The shaded tail is P(p̂ ≥ ${P.cut}).`, facts: () => [['np, n(1 − p)', `${M.PROP_NP}, ${M.PROP_NQ}`], ['z', f(M.PROP_Z)], ['P(p̂ ≥ ' + P.cut + ')', M.PROP_TAIL.toFixed(3)]] },
  jars: { text: `Two districts, sampled independently. Their true proportions differ by ${f(M.PD_MU)}.`, facts: () => [['p₁', `${PD.p1}`], ['p₂', `${PD.p2}`]] },
  pstrip: { text: `One pair of samples: p̂₁ (ink) and p̂₂ (blue) on the same scale. The red bar between them is p̂₁ − p̂₂.`,
    facts: s => { const { i } = M.pdAt(M.clk(s, 'pdiff')); return i < PD.k ? [['p̂₁', f(PD.pairs[i][0])], ['p̂₂', f(PD.pairs[i][1])], ['p̂₁ − p̂₂', f(M.PD_D[i])]] : [['pairs', `${PD.k}`]]; } },
  diffs: { text: `The difference from every pair of samples so far: the sampling distribution of p̂₁ − p̂₂.`,
    facts: s => { const { i } = M.pdAt(M.clk(s, 'pdiff')); return [['pairs so far', `${i}`], ['mean', i ? f(avg(M.PD_D, i), 3) : '–'], ['SD', i > 1 ? landedSd(M.PD_D, i).toFixed(4) : '–'], ['formula SD', M.PD_SD.toFixed(4)]]; } },
  diffModel: { text: `The normal model for p̂₁ − p̂₂. The shaded area, left of 0, is the chance that district 2’s sample comes out higher.`, facts: () => [['mean', f(M.PD_MU)], ['SD', M.PD_SD.toFixed(4)], ['P(< 0)', M.PD_LESS0.toFixed(3)]] },
  popX: { text: `The weight of one apple. Shaded: the apples over ${X.cut} g.`, facts: () => [['σ', `${X.sigma} g`], [`P(X > ${X.cut})`, M.XB_P1.toFixed(3)]] },
  xbarX: { text: `The mean weight of ${X.n} apples: the same centre, a third of the spread. Shaded: samples whose mean is over ${X.cut} g.`, facts: () => [['σ/√n', `${M.XB_SE} g`], ['z', f(M.XB_Z)], [`P(x̄ > ${X.cut})`, M.XB_P.toFixed(3)]] },
  sampleX: { text: `One random sample of ${X.n} apples (ink) and its mean (red). The values spread like the population; the mean hardly moves.`,
    facts: s => { const { i } = M.xbAt(M.clk(s, 'xbar')); return [['x̄', `${M.XB_M[i].toFixed(1)} g`], ['lightest, heaviest', `${Math.min(...X.samples[i]).toFixed(1)}, ${Math.max(...X.samples[i]).toFixed(1)} g`]]; } },
  xbarA: { text: `Means of samples of ${MD.A.n} variety A apples.`, facts: s => { const { i } = M.mdAt(M.clk(s, 'mdiff')); return [['x̄ of this A sample', `${MD.pairs[i][0].toFixed(1)} g`], ['SD', `${MD.A.se} g`]]; } },
  xbarB: { text: `Means of samples of ${MD.B.n} variety B apples.`, facts: s => { const { i } = M.mdAt(M.clk(s, 'mdiff')); return [['x̄ of this B sample', `${MD.pairs[i][1].toFixed(1)} g`], ['SD', `${MD.B.se} g`]]; } },
  mdiff: { text: `x̄<sub>A</sub> − x̄<sub>B</sub>: normal, since both populations are. The dots are the differences seen so far; the shaded area is P(x̄<sub>A</sub> − x̄<sub>B</sub> &lt; 0).`,
    facts: s => { const { i } = M.mdAt(M.clk(s, 'mdiff')); return [['this difference', `${f(MD.pairs[i][0] - MD.pairs[i][1], 1)} g`], ['mean', `${M.MD_MU} g`], ['SD', `${M.MD_SD.toFixed(2)} g`], ['P(< 0)', M.MD_LESS0.toFixed(3)]]; } },
};
