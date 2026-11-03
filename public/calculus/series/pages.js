// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js. The whole unit is AP Calculus BC only.
import * as M from './model.js';
import { SC } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(n);
const T = s => tex(s), ti = s => tex.inline(s);
let HARM10 = 1; for (let s = 1; s <= 10; s += 1 / ++HARM10);   // the first n with Hₙ > 10

export const PAGES = [
  {
    kicker: 'Chapter 10', title: 'Infinite series', sub: 'adding forever, and arriving',
    body: `
      <p class="lede">An infinite series adds infinitely many numbers. It can still have a finite sum: when the running totals settle on one number, that number is the sum.</p>
      <p>The tower stacks slabs ${M.GA}, 2, 4/3, 8/9, …, each two-thirds as tall as the one below. There is no last slab, yet the stack never reaches ${M.GSUM}, and gets as close to ${M.GSUM} as you like.</p>
      <p>This chapter asks when an infinite sum exists (a set of tests for convergence), how far a partial sum can be from it (error bounds), and then turns the idea around: functions such as e<sup><i>x</i></sup> and sin <i>x</i> written as power series, polynomials that never end.</p>
      <p>The whole unit is AP Calculus BC only.</p>`,
    cam: { target: [-0.2, 2.45, 0], az: 24, el: 12, dist: 25 }, lit: 'tower', look: { full: 1 }, scene: 'tower',
    fig: 'A tower of terms, under its sum',
  },
  {
    kicker: '10.1', title: 'Convergent and divergent series', sub: 'the sum is a limit',
    body: `
      <p class="lede">The <i>n</i>th <b>partial sum</b> <i>S<sub>n</sub></i> = <i>a</i><sub>1</sub> + <i>a</i><sub>2</sub> + ⋯ + <i>a<sub>n</sub></i> is an ordinary sum. The series ${ti(String.raw`\sum a_n`)} <b>converges</b> to <i>S</i> if ${ti(String.raw`\lim_{n\to\infty} S_n = S`)}; if the partial sums have no finite limit, it <b>diverges</b>.</p>
      <p>Take ${ti(String.raw`\sum_{n=1}^{\infty} \frac{1}{n(n+1)}`)}. Each term splits as ${ti(String.raw`\frac1n - \frac1{n+1}`)}, so the middle of every partial sum cancels:</p>
      <div class="eq">${T(String.raw`\begin{aligned} S_n &= \left(1 - \tfrac12\right) + \left(\tfrac12 - \tfrac13\right) + \cdots \\ &\quad + \left(\tfrac1n - \tfrac1{n+1}\right) \\ &= 1 - \frac{1}{n+1} \end{aligned}`)}</div>
      <p>So <i>S</i><sub>4</sub> = ${f(M.teleS(4))}, <i>S</i><sub>99</sub> = ${f(M.teleS(99))}, and <i>S<sub>n</sub></i> → ${M.TELE_SUM}: the series converges to ${M.TELE_SUM}.</p>
      <p>${ti(String.raw`\sum_{n=0}^{\infty} (-1)^n`)} has partial sums 1, 0, 1, 0, …, which never settle: it diverges. So does ${ti(String.raw`\sum n`)}, whose partial sums grow without bound.</p>`,
    cam: { target: [SC.tele, 2.1, 0], az: -8, el: 6, dist: 25 }, lit: 'teleSums', look: {}, scene: 'tele',
    fig: 'Partial sums climbing to 1',
  },
  {
    kicker: '10.2', title: 'Geometric series', sub: 'the same ratio every time',
    body: `
      <p class="lede">A <b>geometric series</b> multiplies by the same ratio <i>r</i> from each term to the next: <i>a</i> + <i>ar</i> + <i>ar</i>² + ⋯. It converges exactly when |<i>r</i>| &lt; 1, and then</p>
      <div class="eq">${T(String.raw`\sum_{n=0}^{\infty} a r^n = \frac{a}{1-r}, \qquad |r| < 1`)}</div>
      <p>The reason: ${ti(String.raw`S_N = a\,\frac{1-r^N}{1-r}`)}, and <i>r<sup>N</sup></i> → 0 only when |<i>r</i>| &lt; 1. When |<i>r</i>| ≥ 1 the terms don’t shrink to 0, and the series diverges.</p>
      <p>The tower is ${ti(String.raw`\sum_{n=0}^{\infty} 3\left(\tfrac23\right)^n`)}: <i>a</i> = ${M.GA}, <i>r</i> = 2/3, so the sum is ${ti(String.raw`\frac{3}{1 - 2/3} = ${M.GSUM}`)}.</p>
      <table class="data">
        <tr><th><i>N</i> slabs</th><td>1</td><td>2</td><td>3</td><td>5</td><td>10</td></tr>
        <tr><th><i>S<sub>N</sub></i></th>${[1, 2, 3, 5, 10].map(N => `<td>${f(M.geoS(N))}</td>`).join('')}</tr>
      </table>
      <p><i>a</i> is always the <b>first</b> term. ${ti(String.raw`\sum_{n=1}^{\infty} 3\left(\tfrac23\right)^n`)} starts at 2, so its sum is ${ti(String.raw`\frac{2}{1-2/3} = ${M.GSUM1}`)}.</p>`,
    cam: { target: [-0.4, 2.45, 0], az: -6, el: 5, dist: 24 }, lit: 'ceiling', look: {}, scene: 'tower',
    fig: 'Σ 3(2/3)ⁿ = 9',
  },
  {
    kicker: '10.3', title: 'The nth term test', sub: 'terms that don’t shrink',
    body: `
      <p class="lede">If the terms of a series don’t approach 0, the series diverges: if ${ti(String.raw`\lim_{n\to\infty} a_n \ne 0`)} or the limit doesn’t exist, then ${ti(String.raw`\sum a_n`)} diverges.</p>
      <p>The reason: if the partial sums converge to <i>S</i>, then ${ti(String.raw`a_n = S_n - S_{n-1} \to S - S = 0`)}.</p>
      <p>Take ${ti(String.raw`\sum_{n=1}^{\infty} \frac{n}{2n+1}`)}. Its terms head to ${ti(String.raw`\lim \frac{n}{2n+1} = \frac12 \ne 0`)}, so it diverges. In the figure each new term adds almost ½ (the blue bars level off), and the partial sums climb a straight ramp: <i>S</i><sub>16</sub> = ${f(M.sum(M.nth, 16))}, with no ceiling.</p>
      <p>The test only ever proves <b>divergence</b>. If <i>a<sub>n</sub></i> → 0 it says nothing: 1/<i>n</i> → 0, yet ${ti(String.raw`\sum \frac1n`)} diverges (10.5), while 1/<i>n</i>² → 0 and ${ti(String.raw`\sum \frac1{n^2}`)} converges. Use it first, as a quick check, then reach for another test.</p>`,
    cam: { target: [SC.nth, 2.15, 0], az: -8, el: 6, dist: 25 }, lit: 'nthTerms', look: {}, scene: 'nth',
    fig: 'Terms that level off at ½',
  },
  {
    kicker: '10.4', title: 'The integral test', sub: 'a series and an area',
    body: `
      <p class="lede">If <i>f</i> is positive, continuous and decreasing for <i>x</i> ≥ 1, and <i>a<sub>n</sub></i> = <i>f</i>(<i>n</i>), then ${ti(String.raw`\sum_{n=1}^{\infty} a_n`)} and ${ti(String.raw`\int_1^{\infty} f(x)\,dx`)} both converge or both diverge.</p>
      <p>Draw term <i>n</i> as a bar of width 1 on [<i>n</i> − 1, <i>n</i>]. Because <i>f</i> is decreasing, bars 2, 3, 4, … fit under the curve from 1 on, so a finite area holds them all; and an infinite area is too big for them.</p>
      <p>Take ${ti(String.raw`\sum_{n=1}^{\infty}\frac{1}{n^2+1}`)}. On [1, ∞), <i>f</i>(<i>x</i>) = 1/(<i>x</i>² + 1) is positive, continuous and decreasing, and</p>
      <div class="eq">${T(String.raw`\begin{aligned} \int_1^{\infty}\frac{dx}{x^2+1} &= \lim_{b\to\infty}\Big[\arctan x\Big]_1^b \\ &= \frac{\pi}{2} - \frac{\pi}{4} = \frac{\pi}{4} \end{aligned}`)}</div>
      <p>The integral is finite, so the series converges. The integral is <b>not</b> the sum: the bars only pin it between ${ti(String.raw`\frac{\pi}{4}`)} and ${ti(String.raw`\frac12 + \frac{\pi}{4}`)}, that is ${f(M.IT_LO, 3)} &lt; <i>S</i> &lt; ${f(M.IT_HI, 3)}. (In fact <i>S</i> ≈ ${f(M.IT_SUM, 3)}.)</p>`,
    cam: { target: [SC.integral, 2.1, 0], az: -8, el: 6, dist: 24 }, lit: 'itBars', look: {}, scene: 'integral',
    fig: 'Bars under y = 1/(x² + 1)',
  },
  {
    kicker: '10.5', title: 'Harmonic series and p-series', sub: 'converges when p > 1',
    body: `
      <p class="lede">A <b><i>p</i>-series</b> ${ti(String.raw`\sum_{n=1}^{\infty} \frac{1}{n^p}`)} converges if <i>p</i> &gt; 1 and diverges if <i>p</i> ≤ 1.</p>
      <p>It follows from the integral test: ${ti(String.raw`\int_1^{\infty} x^{-p}\,dx`)} is finite exactly when <i>p</i> &gt; 1.</p>
      <p>The <b>harmonic series</b> is <i>p</i> = 1: ${ti(String.raw`\sum \frac1n = 1 + \frac12 + \frac13 + \cdots`)} diverges, though its terms go to 0. Its partial sums (red) grow like ln <i>n</i>, so slowly that <i>H</i><sub>40</sub> = ${f(M.harmS(40))} and passing 10 takes ${HARM10.toLocaleString('en-US')} terms. But they never stop.</p>
      <p><i>p</i> = 2 converges (blue): <i>S</i><sub>40</sub> = ${f(M.baselS(40), 3)}, and the sum is ${ti(String.raw`\frac{\pi^2}{6}`)} = ${f(M.ZETA2, 3)}.</p>
      <table class="data">
        <tr><th>series</th><th><i>p</i></th><th></th></tr>
        <tr><td>${ti(String.raw`\sum 1/\sqrt n`)}</td><td>1/2</td><td>diverges</td></tr>
        <tr><td>${ti(String.raw`\sum 1/n^{1.01}`)}</td><td>1.01</td><td>converges</td></tr>
        <tr><td>${ti(String.raw`\sum 1/(n\sqrt n)`)}</td><td>3/2</td><td>converges</td></tr>
      </table>`,
    cam: { target: [SC.pser, 2.15, 0], az: -8, el: 6, dist: 25 }, lit: 'harm', look: {}, scene: 'pser',
    fig: 'p = 1 and p = 2, forty terms',
  },
  {
    kicker: '10.6', title: 'Comparison tests', sub: 'against a series you know',
    body: `
      <p class="lede"><b>Direct comparison.</b> If 0 ≤ <i>a<sub>n</sub></i> ≤ <i>b<sub>n</sub></i>: when ${ti(String.raw`\sum b_n`)} converges, so does ${ti(String.raw`\sum a_n`)}; when ${ti(String.raw`\sum a_n`)} diverges, so does ${ti(String.raw`\sum b_n`)}.</p>
      <p>${ti(String.raw`\frac{1}{n^2+3} < \frac{1}{n^2}`)}, and ${ti(String.raw`\sum \frac{1}{n^2}`)} converges (a <i>p</i>-series), so ${ti(String.raw`\sum \frac{1}{n^2+3}`)} converges: every red bar stands inside a blue one.</p>
      <p><b>Limit comparison.</b> If <i>a<sub>n</sub></i>, <i>b<sub>n</sub></i> &gt; 0 and ${ti(String.raw`\lim \frac{a_n}{b_n} = L`)} with 0 &lt; <i>L</i> &lt; ∞, the two series both converge or both diverge.</p>
      <p>${ti(String.raw`\frac{1}{2^n - 1}`)} is <b>larger</b> than ${ti(String.raw`\frac1{2^n}`)}, so direct comparison with the convergent ${ti(String.raw`\sum \frac{1}{2^n}`)} proves nothing. But</p>
      <div class="eq">${T(String.raw`\lim_{n\to\infty} \frac{1/(2^n-1)}{1/2^n} = \lim_{n\to\infty} \frac{2^n}{2^n - 1} = 1`)}</div>
      <p>is positive and finite, so ${ti(String.raw`\sum \frac{1}{2^n-1}`)} converges too. Compare with the terms’ dominant parts: a geometric series or a <i>p</i>-series.</p>`,
    cam: { target: [SC.cmp, 2.1, 0], az: -10, el: 7, dist: 24 }, lit: 'cmpA', look: {}, scene: 'cmp',
    fig: '1/(n² + 3) inside 1/n²',
  },
  {
    kicker: '10.7', title: 'The alternating series test', sub: 'signs that take turns',
    body: `
      <p class="lede">An alternating series ${ti(String.raw`\sum (-1)^{n+1} b_n`)} with <i>b<sub>n</sub></i> &gt; 0 converges if the <i>b<sub>n</sub></i> are decreasing and ${ti(String.raw`\lim_{n\to\infty} b_n = 0`)}.</p>
      <p>Each step goes the opposite way to the last and is shorter, so the partial sums zigzag in narrowing swings around one number, and close in on it.</p>
      <p>Take the alternating harmonic series 1 − ½ + ⅓ − ¼ + ⋯. Here <i>b<sub>n</sub></i> = 1/<i>n</i> decreases to 0, so it converges. (Its sum is ln 2 ≈ ${f(M.LN2, 4)}, from the series for ln(1 + <i>x</i>).)</p>
      <table class="data">
        <tr><th><i>n</i></th>${[1, 2, 3, 4, 5, 6].map(n => `<td>${n}</td>`).join('')}</tr>
        <tr><th><i>S<sub>n</sub></i></th>${[1, 2, 3, 4, 5, 6].map(n => `<td>${f(M.altS(n), 3)}</td>`).join('')}</tr>
      </table>
      <p>Check all three conditions: alternating signs, decreasing size (from some <i>n</i> on is enough), limit 0. If <i>b<sub>n</sub></i> does not go to 0, don’t use this test: the <i>n</i>th term test says the series diverges.</p>`,
    cam: { target: [SC.alt, 2.1, 0], az: -8, el: 6, dist: 24 }, lit: 'altSums', look: {}, scene: 'alt',
    fig: 'Zigzagging onto ln 2',
  },
  {
    kicker: '10.8', title: 'The ratio test', sub: 'each term against the last',
    body: `
      <p class="lede">Let ${ti(String.raw`L = \lim_{n\to\infty} \left|\frac{a_{n+1}}{a_n}\right|`)}. If <i>L</i> &lt; 1 the series converges (absolutely); if <i>L</i> &gt; 1 or <i>L</i> = ∞ it diverges; if <i>L</i> = 1 the test is inconclusive.</p>
      <p>When <i>L</i> &lt; 1, the terms eventually shrink at least as fast as a geometric series with a ratio below 1.</p>
      <p>Take ${ti(String.raw`\sum_{n=1}^{\infty} \frac{n}{3^n}`)}:</p>
      <div class="eq">${T(String.raw`\left|\frac{a_{n+1}}{a_n}\right| = \frac{n+1}{3^{n+1}}\cdot\frac{3^n}{n} = \frac{n+1}{3n} \to \frac13`)}</div>
      <p><i>L</i> = ⅓ &lt; 1, so the series converges (its sum is ${f(M.RAT_SUM)}). The red dots are the ratios, ${f(M.ratQ(1), 3)}, ${f(M.ratQ(2), 3)}, ${f(M.ratQ(3), 3)}, …, settling on ⅓, well under the grey line at 1.</p>
      <p>The ratio test suits factorials and powers such as <i>n</i>! and 3<sup><i>n</i></sup>. It fails on <i>p</i>-series: ${ti(String.raw`\sum\frac1n`)} and ${ti(String.raw`\sum\frac1{n^2}`)} both give <i>L</i> = 1, yet one diverges and the other converges.</p>`,
    cam: { target: [SC.ratio, 2.1, 0], az: -8, el: 6, dist: 24 }, lit: 'ratQ', look: {}, scene: 'ratio',
    fig: 'Ratios settling on ⅓',
  },
  {
    kicker: '10.9', title: 'Absolute or conditional convergence', sub: 'with the signs, and without',
    body: `
      <p class="lede">${ti(String.raw`\sum a_n`)} <b>converges absolutely</b> if ${ti(String.raw`\sum |a_n|`)} converges. Absolute convergence implies convergence. A series that converges while ${ti(String.raw`\sum |a_n|`)} diverges <b>converges conditionally</b>.</p>
      <p>The alternating harmonic series converges (alternating series test), but its sizes form the harmonic series, which diverges: it converges conditionally.</p>
      <table class="data">
        <tr><th>after 30 terms</th><th></th></tr>
        <tr><td>${ti(String.raw`\sum (-1)^{n+1}/n`)} (blue)</td><td>${f(M.altS(30), 3)} → ln 2</td></tr>
        <tr><td>${ti(String.raw`\sum 1/n`)} (red)</td><td>${f(M.harmS(30), 3)} → ∞</td></tr>
      </table>
      <p>${ti(String.raw`\sum (-1)^{n+1}/n^2`)} converges absolutely, since ${ti(String.raw`\sum 1/n^2`)} converges.</p>
      <p>So test ${ti(String.raw`\sum |a_n|`)} first. If it converges: absolute. If not, test the signed series; if that converges: conditional.</p>`,
    cam: { target: [SC.abs, 2.1, 0], az: -8, el: 6, dist: 24 }, lit: 'condSums', look: {}, scene: 'abs',
    fig: 'With signs and without',
  },
  {
    kicker: '10.10', title: 'Alternating series error bound', sub: 'no further off than the next term',
    body: `
      <p class="lede">If an alternating series meets the conditions of the alternating series test, stopping after <i>n</i> terms is off by at most the first term left out:</p>
      <div class="eq">${T(String.raw`|S - S_n| \le b_{n+1}`)}</div>
      <p>The sum always lies between two consecutive partial sums <i>S<sub>n</sub></i> and <i>S</i><sub><i>n</i>+1</sub> (the blue band), and they are exactly <i>b</i><sub><i>n</i>+1</sub> apart.</p>
      <p>For 1 − ½ + ⅓ − ¼ + ⋯:</p>
      <div class="eq">${T(String.raw`\begin{aligned} S_4 &= 1 - \tfrac12 + \tfrac13 - \tfrac14 = \tfrac{7}{12} \\ |S - S_4| &\le b_5 = \tfrac15 \end{aligned}`)}</div>
      <p><i>S</i><sub>4</sub> ≈ ${f(M.ERR_S, 4)}, and the true error is ln 2 − 7/12 = ${f(M.ERR_TRUE, 4)}, within ${f(M.ERR_BOUND, 1)}. The next term, +⅕, is positive, so <i>S</i><sub>4</sub> is an underestimate.</p>
      <p>To be within ${M.ERR_TOL} you need ${ti(String.raw`\frac{1}{n+1} \le ${M.ERR_TOL}`)}, so <i>n</i> = ${M.ERR_NEED} terms.</p>`,
    cam: { target: [SC.alt, 2.2, 0], az: -6, el: 5, dist: 24 }, lit: 'altBand', look: { err: 1 }, scene: 'alt',
    fig: 'S lies between S₄ and S₅',
  },
  {
    kicker: '10.11', title: 'Taylor polynomials', sub: 'matching derivatives at a point',
    body: `
      <p class="lede">The Taylor polynomial of degree <i>n</i> for <i>f</i> about <i>x</i> = <i>a</i> matches <i>f</i> and its first <i>n</i> derivatives at <i>a</i>:</p>
      <div class="eq">${T(String.raw`P_n(x) = \sum_{k=0}^{n} \frac{f^{(k)}(a)}{k!}(x-a)^k`)}</div>
      <p>that is, ${ti(String.raw`f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \cdots`)}: the coefficient of (<i>x</i> − <i>a</i>)<sup><i>k</i></sup> is the <i>k</i>th derivative over <i>k</i>!. About <i>a</i> = 0 it is also called a Maclaurin polynomial.</p>
      <p>Take <i>f</i>(<i>x</i>) = e<sup><i>x</i></sup> about 0. Every derivative is e<sup><i>x</i></sup>, so every <i>f</i><sup>(<i>k</i>)</sup>(0) = 1:</p>
      <div class="eq">${T(String.raw`P_3(x) = 1 + x + \frac{x^2}{2} + \frac{x^3}{6}`)}</div>
      <p>At <i>x</i> = 1: <i>P</i><sub>3</sub>(1) = 8/3 ≈ ${f(M.TP, 4)}, against e ≈ ${f(M.TE, 4)}. In the figure each new degree (red) hugs e<sup><i>x</i></sup> over a wider stretch around 0, and is worst far from it.</p>`,
    cam: { target: [SC.taylor, 2.5, 0], az: -8, el: 6, dist: 25 }, lit: 'taylorP', look: {}, scene: 'taylor',
    fig: 'Taylor polynomials of eˣ',
  },
  {
    kicker: '10.12', title: 'Lagrange error bound', sub: 'how far off Pₙ can be',
    body: `
      <p class="lede">If |<i>f</i><sup>(<i>n</i>+1)</sup>(<i>z</i>)| ≤ <i>M</i> for every <i>z</i> between <i>a</i> and <i>x</i>, then</p>
      <div class="eq">${T(String.raw`|f(x) - P_n(x)| \le \frac{M\,|x-a|^{n+1}}{(n+1)!}`)}</div>
      <p>Bound the error of <i>P</i><sub>3</sub>(1) = 8/3 for e. The fourth derivative is e<sup><i>z</i></sup>, at most e &lt; ${M.LAG_M} on [0, 1], so take <i>M</i> = ${M.LAG_M}:</p>
      <div class="eq">${T(String.raw`|e - P_3(1)| \le \frac{${M.LAG_M}\cdot 1^4}{4!} = ${f(M.LAG_B, 3)}`)}</div>
      <p>The true error, e − 8/3 = ${f(M.TE - M.TP, 4)}, is under the bound. The figure magnifies both on [0, 1]: the true error e<sup><i>x</i></sup> − <i>P</i><sub>3</sub>(<i>x</i>) (red) stays under ${M.LAG_M}<i>x</i>⁴/4! (blue) all the way.</p>
      <p>Use the (<i>n</i> + 1)th derivative and (<i>n</i> + 1)!, never the <i>n</i>th; <i>M</i> must cover the whole interval from <i>a</i> to <i>x</i>.</p>`,
    cam: { target: [SC.lagrange, 2.1, 0], az: -8, el: 6, dist: 24 }, lit: 'lagErr', look: {}, scene: 'lagrange',
    fig: 'The error, under its bound',
  },
  {
    kicker: '10.13', title: 'Radius and interval of convergence', sub: 'where a power series converges',
    body: `
      <p class="lede">A power series ${ti(String.raw`\sum c_n (x-a)^n`)} converges for |<i>x</i> − <i>a</i>| &lt; <i>R</i>, the <b>radius of convergence</b>, and diverges for |<i>x</i> − <i>a</i>| &gt; <i>R</i>. Each endpoint must be checked on its own.</p>
      <p>Take ${ti(String.raw`\sum_{n=1}^{\infty} \frac{(x-2)^n}{n\cdot 3^n}`)}. The ratio test:</p>
      <div class="eq">${T(String.raw`\left|\frac{a_{n+1}}{a_n}\right| = \frac{|x-2|}{3}\cdot\frac{n}{n+1} \to \frac{|x-2|}{3}`)}</div>
      <p>This is less than 1 when |<i>x</i> − 2| &lt; 3, so <i>R</i> = ${M.IR}: the series converges on (${M.IA}, ${M.IB}). Now the endpoints:</p>
      <table class="data">
        <tr><td><i>x</i> = ${M.IB}</td><td>${ti(String.raw`\sum \frac{1}{n}`)}, harmonic</td><td>diverges</td></tr>
        <tr><td><i>x</i> = ${M.IA}</td><td>${ti(String.raw`\sum \frac{(-1)^n}{n}`)}, alternating</td><td>converges</td></tr>
      </table>
      <p>The interval of convergence is [${M.IA}, ${M.IB}). Inside it the partial sums settle onto the sum; outside, they run away.</p>`,
    cam: { target: [SC.interval, 0.55, 0], az: -8, el: 6, dist: 22 }, lit: 'intInterval', look: {}, scene: 'interval',
    fig: 'Converging on [−1, 5)',
  },
  {
    kicker: '10.14', title: 'Taylor and Maclaurin series', sub: 'the polynomial that never ends',
    body: `
      <p class="lede">The <b>Taylor series</b> of <i>f</i> about <i>a</i> keeps every term: ${ti(String.raw`\sum \frac{f^{(n)}(a)}{n!}(x-a)^n`)}. About 0 it is the <b>Maclaurin series</b>.</p>
      <p>For sin <i>x</i> the derivatives at 0 repeat 0, 1, 0, −1, so only odd powers survive:</p>
      <div class="eq">${T(String.raw`\begin{aligned} \sin x &= x - \frac{x^3}{3!} + \frac{x^5}{5!} - \cdots \\ &= \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{(2n+1)!} \end{aligned}`)}</div>
      <p>It converges for every <i>x</i>. Two terms give sin ${M.SIN_X} ≈ ${f(M.SIN_P2, 6)}, against ${f(Math.sin(M.SIN_X), 6)}.</p>
      <table class="data">
        <tr><td>e<sup><i>x</i></sup></td><td>${ti(String.raw`1 + x + \frac{x^2}{2!} + \frac{x^3}{3!} + \cdots`)}</td><td>all <i>x</i></td></tr>
        <tr><td>cos <i>x</i></td><td>${ti(String.raw`1 - \frac{x^2}{2!} + \frac{x^4}{4!} - \cdots`)}</td><td>all <i>x</i></td></tr>
        <tr><td>${ti(String.raw`\frac{1}{1-x}`)}</td><td>${ti(String.raw`1 + x + x^2 + x^3 + \cdots`)}</td><td>|<i>x</i>| &lt; 1</td></tr>
      </table>`,
    cam: { target: [SC.maclaurin, 0.1, 0], az: -6, el: 5, dist: 25 }, lit: 'sinP', look: {}, scene: 'maclaurin',
    fig: 'The Maclaurin series of sin x',
  },
  {
    kicker: '10.15', title: 'Representing functions as power series', sub: 'new series from old',
    body: `
      <p class="lede">Known series make new ones: substitute, multiply by powers of <i>x</i>, or differentiate or integrate term by term. The radius stays; endpoints can change.</p>
      <p>With <i>u</i> = −<i>x</i>² in ${ti(String.raw`\frac{1}{1-u} = \sum u^n`)}:</p>
      <div class="eq">${T(String.raw`\frac{1}{1+x^2} = \sum_{n=0}^{\infty} (-1)^n x^{2n}, \quad |x| < 1`)}</div>
      <p>Integrate from 0 (arctan 0 = 0, so the constant is 0):</p>
      <div class="eq">${T(String.raw`\arctan x = \sum_{n=0}^{\infty} \frac{(-1)^n x^{2n+1}}{2n+1}`)}</div>
      <p>At <i>x</i> = ½, three terms give ½ − 1/24 + 1/160 = ${f(M.AT_P3, 4)} (arctan ½ = ${f(M.AT_TRUE, 4)}). Differentiating ${ti(String.raw`\frac1{1-x}`)} gives ${ti(String.raw`\frac{1}{(1-x)^2} = \sum_{n=1}^{\infty} n x^{n-1}`)}.</p>`,
    cam: { target: [SC.atan, 0.2, 0], az: -8, el: 6, dist: 18 }, lit: 'atanP', look: {}, scene: 'atan',
    fig: 'arctan x from a geometric series',
  },
];

// ---------- breakdowns: what each thing is, and its live numbers ----------
const n = (s, k) => k === 'tower' && s.full ? M.STEP.tower.max : M.count(s, k).n;
export const PLATES = {
  tower: { text: `Each slab is one term of Σ 3(2/3)ⁿ, two-thirds as tall as the slab below it. The stack’s height after N slabs is the partial sum S_N.`,
    facts: s => { const N = n(s, 'tower'); return [['slabs', `${N}`], ['newest slab', f(M.geo(N - 1), 3)], ['height S_N', f(M.geoS(N), 3)], ['left to fill', f(M.GSUM - M.geoS(N), 3)]]; } },
  ceiling: { text: `The limit of the partial sums: a/(1 − r) = 3/(1 − 2/3) = 9. Every slab covers a third of the gap still left, so the gap shrinks by 2/3 each time and never closes.`,
    facts: s => [['a', `${M.GA}`], ['r', '2/3'], ['sum', `${M.GSUM}`], ['gap now', f(M.GSUM - M.geoS(n(s, 'tower')), 3)]] },
  towerSums: { text: `The same partial sums drawn as a graph: S_n against n. They rise, each step two-thirds of the last, and level off at 9.`,
    facts: s => { const N = n(s, 'tower'); return [['n', `${N}`], ['S_n', f(M.geoS(N), 4)]]; } },
  teleTerms: { text: `The terms 1/(n(n + 1)) = 1/n − 1/(n + 1): 1/2, 1/6, 1/12, … They shrink to 0 fast enough for the sum to be finite.`,
    facts: s => { const N = n(s, 'tele'); return [['n', `${N}`], ['a_n', f(M.tele(N), 4)]]; } },
  teleSums: { text: `S_n = 1 − 1/(n + 1): the middle of every partial sum cancels. As n → ∞ they approach 1, so the series converges to 1.`,
    facts: s => { const N = n(s, 'tele'); return [['n', `${N}`], ['S_n', f(M.teleS(N), 4)], ['1 − S_n', f(1 - M.teleS(N), 4)]]; } },
  nthTerms: { text: `n/(2n + 1) → 1/2, not 0. A series whose terms don’t go to 0 can’t converge: the nth term test.`,
    facts: s => { const N = n(s, 'nth'); return [['n', `${N}`], ['a_n', f(M.nth(N), 4)], ['limit', '1/2 ≠ 0']]; } },
  nthSums: { text: `Each partial sum is nearly 1/2 more than the last, so they climb without bound. The series diverges.`,
    facts: s => { const N = n(s, 'nth'); return [['n', `${N}`], ['S_n', f(M.sum(M.nth, N), 3)]]; } },
  itCurve: { text: `The area under y = 1/(x² + 1) from 1 to b is arctan b − π/4, which tends to π/2 − π/4 = π/4 as b → ∞. A finite area: the series converges.`,
    facts: s => { const { n: N, f: fr } = M.count(s, 'integral'), b = Math.min(1 + (N - 1 + fr) * 9 / M.STEP.integral.max, 10); return [['b', f(b)], ['area 1 to b', f(M.itArea(b), 4)], ['area 1 to ∞', `π/4 = ${f(M.IT_INT, 4)}`]]; } },
  itBars: { text: `Bar n stands on [n − 1, n] with height 1/(n² + 1). The grey first bar is 1/2; the blue bars 2, 3, 4, … all fit under the curve from 1 on, so the sum is less than 1/2 + π/4.`,
    facts: s => { const N = Math.min(n(s, 'integral') + 1, 10); return [['bars 1 to ' + N, f(M.sum(M.itf, N), 4)], ['sum to ∞', f(M.IT_SUM, 4)], ['bound', `< ${f(M.IT_HI, 4)}`]]; } },
  harm: { text: `The harmonic series 1 + 1/2 + 1/3 + ⋯ (p = 1). Its partial sums follow ln n + 0.577 (the faint curve) and grow forever, just slowly.`,
    facts: s => { const N = n(s, 'pser'); return [['n', `${N}`], ['H_n', f(M.harmS(N), 3)], ['ln n + 0.577', f(Math.log(N) + M.EULER, 3)]]; } },
  basel: { text: `1 + 1/4 + 1/9 + ⋯ (p = 2). Its partial sums level off at π²/6.`,
    facts: s => { const N = n(s, 'pser'); return [['n', `${N}`], ['S_n', f(M.baselS(N), 4)], ['π²/6', f(M.ZETA2, 4)]]; } },
  cmpB: { text: `bₙ = 1/n²: a p-series with p = 2, so it converges. Anything positive that stays under it converges too.`,
    facts: s => { const N = n(s, 'cmp'); return [['n', `${N}`], ['b_n', f(M.cmpB(N), 4)]]; } },
  cmpA: { text: `aₙ = 1/(n² + 3) is always below 1/n². Its bars stand inside the blue ones, so its sum is less than π²/6: it converges.`,
    facts: s => { const N = n(s, 'cmp'); return [['n', `${N}`], ['a_n', f(M.cmpA(N), 4)], ['a_n / b_n', f(M.cmpA(N) / M.cmpB(N), 3)]]; } },
  altSums: { text: `Each step is the next term: down 1/2, up 1/3, down 1/4, … Each is shorter than the last and they shrink to 0, so the zigzag closes in on ln 2.`,
    facts: s => { const N = s.err ? M.ERR_N + 1 : n(s, 'alt'); return [['n', `${N}`], ['S_n', f(M.altS(N), 4)], ['ln 2', f(M.LN2, 4)]]; } },
  altBand: { text: `S₄ = 7/12 and S₅ = 47/60 are b₅ = 1/5 apart, and the sum ln 2 lies between them. So the error in S₄ is at most 1/5.`,
    facts: () => [['S₄', f(M.ERR_S, 4)], ['S₅', f(M.altS(M.ERR_N + 1), 4)], ['bound b₅', f(M.ERR_BOUND, 4)], ['true error', f(M.ERR_TRUE, 4)]] },
  ratTerms: { text: `aₙ = n/3ⁿ: 1/3, 2/9, 3/27, … The powers of 3 soon overwhelm the n on top.`,
    facts: s => { const N = n(s, 'ratio'); return [['n', `${N}`], ['a_n', f(M.rat(N), 4)]]; } },
  ratQ: { text: `Each dot is the ratio of a term to the one before, (n + 1)/(3n). They settle on 1/3, below the line at 1, so the series converges.`,
    facts: s => { const N = n(s, 'ratio'); return [['n', `${N}`], ['a_{n+1}/a_n', f(M.ratQ(N), 4)], ['limit L', '1/3 < 1']]; } },
  absSums: { text: `Drop the signs and the alternating harmonic series becomes the harmonic series, which diverges. So the convergence is not absolute.`,
    facts: s => { const N = n(s, 'abs'); return [['n', `${N}`], ['Σ |a_n|', f(M.harmS(N), 3)]]; } },
  condSums: { text: `With its signs, the series converges (to ln 2) by the alternating series test. It converges, but not absolutely: conditionally.`,
    facts: s => { const N = n(s, 'abs'); return [['n', `${N}`], ['Σ a_n', f(M.altS(N), 4)], ['ln 2', f(M.LN2, 4)]]; } },
  expCurve: { text: `y = eˣ. All its derivatives are eˣ, so at 0 every one equals 1, and the Taylor coefficients are 1/k!.`,
    facts: () => [['f(0)', '1'], ['f⁽ᵏ⁾(0)', '1'], ['e¹', f(M.TE, 4)]] },
  taylorP: { text: `The Taylor polynomial of eˣ about 0. Each degree adds xᵏ/k! and matches one more derivative at 0, so it fits over a wider stretch.`,
    facts: s => { const d = n(s, 'taylor') - 1; return [['degree', `${d}`], ['P(1)', f(M.expP(d, 1), 4)], ['e − P(1)', f(M.TE - M.expP(d, 1), 4)]]; } },
  lagBand: { text: `The Lagrange bound for P₃ on [0, 1]: M·x⁴/4! with M = 3, since the fourth derivative eˣ is at most e < 3 there. The true error can never rise above it.`,
    facts: s => { const x = n(s, 'lagrange') / M.STEP.lagrange.max; return [['x', f(x)], ['bound 3x⁴/24', f(M.lagBound(x), 4)], ['at x = 1', f(M.LAG_B, 4)]]; } },
  lagErr: { text: `The true error eˣ − P₃(x), magnified. It starts at 0, grows like x⁴/24 near 0, and at x = 1 is e − 8/3, well under the bound.`,
    facts: s => { const x = n(s, 'lagrange') / M.STEP.lagrange.max; return [['x', f(x)], ['eˣ − P₃(x)', f(M.lagErr(x), 4)], ['bound', f(M.lagBound(x), 4)]]; } },
  intF: { text: `Inside the interval the series adds up to −ln(1 − (x − 2)/3) = ln(3/(5 − x)). The faint part, left of −1, is the function where the series no longer reaches it.`,
    facts: () => [['at x = −1', f(M.intF(-1), 4)], ['at x = 2', '0'], ['at x = 5', 'undefined']] },
  intSums: { text: `The partial sums with N terms. Inside (−1, 5) adding terms brings them onto the sum; outside, |x − 2|/3 > 1 and the terms grow, so they swing ever further.`,
    facts: s => { const N = n(s, 'interval'); return [['N', `${N}`], ['at x = 4', f(M.intP(N, 4), 4)], ['sum at x = 4', f(M.intF(4), 4)], ['at x = 6', f(M.intP(N, 6), 1)]]; } },
  intInterval: { text: `Centre 2, radius 3, from the ratio test. Endpoint −1 gives the alternating harmonic series (converges, filled dot); endpoint 5 gives the harmonic series (diverges, open dot).`,
    facts: () => [['centre', `${M.IC}`], ['radius', `${M.IR}`], ['interval', `[${M.IA}, ${M.IB})`]] },
  sinCurve: { text: `y = sin x. Its derivatives cycle sin, cos, −sin, −cos, so at 0 they are 0, 1, 0, −1 over and over.`,
    facts: () => [['sin 0', '0'], ['derivatives at 0', '0, 1, 0, −1, …']] },
  sinP: { text: `The Maclaurin polynomial of sin x, odd powers only, with alternating signs. Each new term extends the fit; the full series equals sin x for every x.`,
    facts: s => { const k = n(s, 'maclaurin'); return [['terms', `${k}`], ['degree', `${2 * k - 1}`], ['P(3)', f(M.sinP(k, 3), 4)], ['sin 3', f(Math.sin(3), 4)]]; } },
  atanGeo: { text: `1 − x² + x⁴ − ⋯: the geometric series with ratio −x². It equals 1/(1 + x²) only for |x| < 1; outside, the terms grow.`,
    facts: s => { const k = n(s, 'atan'); return [['terms', `${k}`], ['at x = 0.5', f(M.geoP(k, 0.5), 4)], ['1/(1 + 0.25)', f(0.8, 4)]]; } },
  atanP: { text: `x − x³/3 + x⁵/5 − ⋯, the geometric series integrated term by term from 0. It equals arctan x for −1 ≤ x ≤ 1: integrating gained both endpoints.`,
    facts: s => { const k = n(s, 'atan'); return [['terms', `${k}`], ['at x = 0.5', f(M.atanP(k, 0.5), 4)], ['arctan 0.5', f(M.AT_TRUE, 4)]]; } },
};
