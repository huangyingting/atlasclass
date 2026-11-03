// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// which scene's readout shows. Every number comes from model.js.
import * as M from './model.js';
import { SPOT } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => { const a = Math.abs(x).toFixed(n); return (x < 0 && +a ? '−' : '') + a; };
const T = tex, t = tex.inline;
// the camera: aimed at a page's sheet (dx, dy from its centre), from az/el degrees, dist metres
const cam = (k, dist, { dx = 0, dy = 0, az = 0, el = 3 } = {}) => ({ target: [SPOT[k][0] + dx, SPOT[k][1] + dy, 0], az, el, dist: dist * 1.38 });
const row = (xs, fn, n = 4) => xs.map(x => `<td>${f(fn(x), n)}</td>`).join('');
const xrow = xs => xs.map(x => `<td>${f(x, Math.max(1, -Math.floor(Math.log10(Math.abs(x)) + 1e-9)))}</td>`).join('');

export const PAGES = [
  {
    kicker: 'Chapter 1', title: 'Limits and continuity', sub: 'approaching, without arriving',
    body: `
      <p class="lede">Every idea in calculus rests on one question: as the input heads toward a point, what value does the output head toward? That value is a <b>limit</b>.</p>
      <p>The graph is ${t(String.raw`y = \dfrac{\sin x}{x}`)}. At <i>x</i> = 0 the formula reads 0/0, which is no number at all, so the graph has a hole there. Yet the two points sliding in from either side rise toward the same height, 1:</p>
      <div class="eq">${T(String.raw`\lim_{x \to 0} \frac{\sin x}{x} = 1`)}</div>
      <p>The function never takes the value 1; it only gets as close to it as you like. A limit is about the approach, never the arrival.</p>
      <p>This chapter shows how to find limits (from graphs, tables, algebra and squeezing), what it means for a function to be <b>continuous</b>, and the first theorem continuity buys.</p>`,
    cam: cam('open', 16.5, { az: -12, el: 6, dy: 0.2 }), lit: 'sincPts', look: {}, scene: 'open',
    fig: 'sin x / x near 0',
  },
  {
    kicker: '1.1', title: 'Change at an instant', sub: 'can a rate exist at a single moment?',
    body: `
      <p class="lede">A rate of change compares two moments: how much the output changed over how much the input changed. At a single instant nothing has changed yet. A limit resolves this.</p>
      <p>On ${t('y = x^2')}, the <b>average rate of change</b> from <i>x</i> = ${M.P1} to <i>x</i> = ${M.P1} + <i>h</i> is the slope of the red secant:</p>
      <div class="eq">${T(String.raw`\frac{(1+h)^2 - 1^2}{h} = \frac{2h + h^2}{h} = 2 + h`)}</div>
      <table class="data">
        <tr><th><i>h</i></th>${M.SEC_H.map(h => `<td>${h}</td>`).join('')}</tr>
        <tr><th>slope</th>${row(M.SEC_H, M.secant, 3)}</tr>
      </table>
      <p>Setting <i>h</i> = 0 gives 0/0, which says nothing. But as <i>h</i> → 0 the slopes close in on ${M.TAN1}, and the secant turns into the dashed tangent line. That limit, ${M.TAN1}, is the <b>instantaneous rate of change</b> at <i>x</i> = ${M.P1}: the slope of the curve at that one point. Chapter 2 calls it the derivative.</p>`,
    cam: cam('sec', 16.5, { az: -8 }), lit: 'secLine', look: {}, scene: 'sec',
    fig: 'Secants closing in on a tangent',
  },
  {
    kicker: '1.2', title: 'The limit', sub: 'what f(x) approaches, not what f(c) is',
    body: `
      <p class="lede">${t(String.raw`\lim_{x\to c} f(x) = L`)} means that <i>f</i>(<i>x</i>) stays as close to <i>L</i> as you like once <i>x</i> is close enough to <i>c</i>, with <i>x</i> ≠ <i>c</i>.</p>
      <p>Read it “the limit of <i>f</i>(<i>x</i>) as <i>x</i> approaches <i>c</i> is <i>L</i>.” The input approaches from both sides, and the limit, if it exists, is one finite number.</p>
      <p>Here ${t(String.raw`f(x) = \dfrac{x^2 - 1}{x - 1}`)} for <i>x</i> ≠ ${M.A2}, and <i>f</i>(${M.A2}) has been assigned the value ${M.F2_AT}. Away from ${M.A2}, <i>f</i>(<i>x</i>) = <i>x</i> + 1, so the sliding points both head to ${M.L2}:</p>
      <div class="eq">${T(String.raw`\lim_{x \to ${M.A2}} f(x) = ${M.L2}, \qquad f(${M.A2}) = ${M.F2_AT}`)}</div>
      <p>The limit never looks at <i>x</i> = ${M.A2} itself. Change <i>f</i>(${M.A2}) to 100, or leave it undefined, and the limit is still ${M.L2}. The value at a point and the limit at that point are separate questions; when they agree, the function is <b>continuous</b> there (1.11).</p>`,
    cam: cam('lim', 13.5, { az: 8 }), lit: 'limPts', look: {}, scene: 'lim',
    fig: 'A limit that ignores f(1)',
  },
  {
    kicker: '1.3', title: 'Limits from graphs', sub: 'one side at a time',
    body: `
      <p class="lede">A <b>one-sided limit</b> lets <i>x</i> approach from one side only: ${t(String.raw`x \to c^-`)} from the left (<i>x</i> &lt; <i>c</i>), ${t(String.raw`x \to c^+`)} from the right.</p>
      <p>The graph is ${t(String.raw`g(x) = x^2/2 + 1`)} for <i>x</i> &lt; ${M.A3} and ${t('g(x) = x - 1')} for <i>x</i> ≥ ${M.A3}. Follow the curve toward <i>x</i> = ${M.A3} from each side and read the height it heads for:</p>
      <div class="eq">${T(String.raw`\begin{aligned} \lim_{x \to ${M.A3}^-} g(x) &= ${M.LEFT3} \\ \lim_{x \to ${M.A3}^+} g(x) &= ${M.RIGHT3} = g(${M.A3}) \end{aligned}`)}</div>
      <p>The two-sided limit exists only when both one-sided limits exist and are equal. Here ${M.LEFT3} ≠ ${M.RIGHT3}, so ${t(String.raw`\lim_{x \to ${M.A3}} g(x)`)} does not exist.</p>
      <p>Reading a graph: the open circle marks a height the curve approaches but does not take; the filled dot gives only the value <i>g</i>(${M.A3}). A limit can also fail to exist when the graph grows without bound (1.14) or oscillates faster and faster, like ${t(String.raw`\sin(1/x)`)} near 0.</p>`,
    cam: cam('one', 15, { az: -8 }), lit: 'fromLeft', look: {}, scene: 'one',
    fig: 'Left and right limits that disagree',
  },
  {
    kicker: '1.4', title: 'Limits from tables', sub: 'evidence, not proof',
    body: `
      <p class="lede">A table estimates a limit: take <i>x</i> closer and closer to <i>c</i> from both sides and watch where <i>f</i>(<i>x</i>) settles.</p>
      <p>${t(String.raw`f(x) = (1 + x)^{1/x}`)} is undefined at <i>x</i> = 0. Near it:</p>
      <table class="data">
        <tr><th><i>x</i></th>${xrow(M.TABLE4)}</tr>
        <tr><th><i>f</i>(<i>x</i>)</th>${row(M.TABLE4, M.e4)}</tr>
      </table>
      <p>From the left the values fall, from the right they rise, and both sides squeeze toward 2.718…, the number <i>e</i>:</p>
      <div class="eq">${T(String.raw`\lim_{x \to 0} (1 + x)^{1/x} = e \approx ${Math.E.toFixed(4)}`)}</div>
      <p>A table is evidence, not proof. Badly chosen inputs can mislead: ${t(String.raw`\sin(\pi/x)`)} is exactly 0 at <i>x</i> = 0.1, 0.01, 0.001, …, yet it swings between −1 and 1 all the way in, and has no limit at 0. Use both sides, and inputs that aren’t special.</p>`,
    cam: cam('tab', 15, { az: 8 }), lit: 'tabPts', look: {}, scene: 'tab',
    fig: 'Rows of the table, closing in',
  },
  {
    kicker: '1.5', title: 'Limit properties', sub: 'limits respect arithmetic',
    body: `
      <p class="lede">If ${t(String.raw`\lim_{x\to c} f(x) = L`)} and ${t(String.raw`\lim_{x\to c} g(x) = M`)}, both finite, then limits pass straight through the arithmetic.</p>
      <p>With ${t('f(x) = x^2/2')} and ${t('g(x) = 3 - x')} at <i>c</i> = ${M.C5}: <i>L</i> = ${M.LF5}, <i>M</i> = ${M.LG5}.</p>
      <table class="data">
        <tr><th>rule</th><th>limit</th><th>here</th></tr>
        <tr><td>sum, difference</td><td><i>L</i> ± <i>M</i></td><td>${M.LF5 + M.LG5}, ${M.LF5 - M.LG5}</td></tr>
        <tr><td>constant multiple</td><td><i>kL</i></td><td>5<i>f</i> → ${5 * M.LF5}</td></tr>
        <tr><td>product</td><td><i>LM</i></td><td>${M.LF5 * M.LG5}</td></tr>
        <tr><td>quotient (<i>M</i> ≠ 0)</td><td><i>L</i>/<i>M</i></td><td>${M.LF5 / M.LG5}</td></tr>
        <tr><td>power</td><td><i>L</i><sup><i>n</i></sup></td><td><i>f</i>³ → ${M.LF5 ** 3}</td></tr>
        <tr><td>composite, <i>h</i> continuous at <i>M</i></td><td><i>h</i>(<i>M</i>)</td><td>√(<i>g</i> + 3) → ${Math.sqrt(M.LG5 + 3)}</td></tr>
      </table>
      <p>Since ${t('x')} and constants have obvious limits, these rules give every polynomial its limit by <b>direct substitution</b>, and every rational function too wherever its denominator isn’t 0: ${t(String.raw`\lim_{x\to 2}\,(x^2/2 + 3 - x) = ${M.LF5 + M.LG5}`)}, the red curve.</p>`,
    cam: cam('prop', 14.5, { az: -8 }), lit: 'propSum', look: {}, scene: 'prop',
    fig: 'f, g and f + g near x = 2',
  },
  {
    kicker: '1.6', title: 'Algebraic manipulation', sub: 'factor, cancel, rationalize',
    body: `
      <p class="lede">When substitution gives 0/0, the expression is hiding a common factor. Rewrite it as a function that agrees with it everywhere except at <i>c</i>, then substitute.</p>
      <p><b>Factor and cancel.</b></p>
      <div class="eq">${T(String.raw`\begin{aligned} &\lim_{x \to 2} \frac{x^2 + x - 6}{x - 2} \\ &= \lim_{x \to 2} \frac{(x - 2)(x + 3)}{x - 2} \\ &= \lim_{x \to 2} (x + 3) = ${M.L6F} \end{aligned}`)}</div>
      <p><b>Rationalize</b>: multiply top and bottom by the conjugate.</p>
      <div class="eq">${T(String.raw`\begin{aligned} &\lim_{x \to 4} \frac{x - 4}{\sqrt{x} - 2} \cdot \frac{\sqrt{x} + 2}{\sqrt{x} + 2} \\ &= \lim_{x \to 4} \frac{(x - 4)(\sqrt{x} + 2)}{x - 4} = ${M.L6R} \end{aligned}`)}</div>
      <p>Cancelling is allowed because a limit at <i>c</i> only uses <i>x</i> ≠ <i>c</i>, where <i>x</i> − <i>c</i> ≠ 0. The graphs show the cost: the simplified function is the same line or curve, but the original has a hole at <i>c</i>.</p>
      <p>Other rewrites follow the same idea: combine a compound fraction over a common denominator, or use a trig identity such as ${t(String.raw`\sin^2 x = 1 - \cos^2 x`)}.</p>`,
    cam: cam('alg', 24, { az: 6, dy: 0.3, dx: 0.6 }), lit: 'facCurve', look: {}, scene: 'alg',
    fig: 'Two 0/0 limits, rewritten',
  },
  {
    kicker: '1.7', title: 'Selecting procedures', sub: 'substitute first, then read the result',
    body: `
      <p class="lede">Always try direct substitution first. What it gives decides the next step.</p>
      <table class="data">
        <tr><th>substitution gives</th><th>what to do</th></tr>
        <tr><td>a number</td><td>that is the limit (the function is continuous there): ${t(String.raw`\lim_{x\to1} (x^2 + 1) = ${M.sub7(1)}`)}</td></tr>
        <tr><td>0/0</td><td>indeterminate: factor, rationalize, use an identity, or squeeze. ${t(String.raw`\frac{x^2 - 1}{x - 1} = x + 1 \to 2`)}</td></tr>
        <tr><td><i>b</i>/0, <i>b</i> ≠ 0</td><td>no finite limit: a vertical asymptote. Check the sign on each side for ±∞. ${t(String.raw`\frac{1}{(x - 1)^2} \to \infty`)}</td></tr>
        <tr><td>a piecewise break</td><td>take each one-sided limit from its own formula, then compare</td></tr>
      </table>
      <p>All three graphs ask about <i>x</i> → 1, and all three start the same way. The difference is only what substitution returns. Note that 0/0 is never an answer: it means the work isn’t finished. A number over 0 is a different signal entirely: the output is blowing up.</p>`,
    cam: cam('pick', 20, { az: -6, dy: 0.2 }), lit: 'pickZero', look: {}, scene: 'pick',
    fig: 'Number, 0/0, b/0',
  },
  {
    kicker: '1.8', title: 'The squeeze theorem', sub: 'trapped between two that agree',
    body: `
      <p class="lede">If ${t(String.raw`g(x) \le f(x) \le h(x)`)} near <i>c</i>, and ${t(String.raw`\lim_{x\to c} g(x) = \lim_{x\to c} h(x) = L`)}, then ${t(String.raw`\lim_{x\to c} f(x) = L`)} too.</p>
      <p><b>Top:</b> ${t(String.raw`\sin(1/x)`)} has no limit at 0, but it never leaves [−1, 1], so</p>
      <div class="eq">${T(String.raw`\begin{gathered} -x^2 \le x^2 \sin\tfrac{1}{x} \le x^2 \\ \lim_{x \to 0} x^2 \sin\tfrac{1}{x} = 0 \end{gathered}`)}</div>
      <p><b>Bottom:</b> a picture of the unit circle shows ${t(String.raw`\cos x \le \frac{\sin x}{x} \le 1`)} for 0 &lt; |<i>x</i>| &lt; π/2. Both bounds tend to 1, so</p>
      <div class="eq">${T(String.raw`\lim_{x \to 0} \frac{\sin x}{x} = 1, \quad \lim_{x \to 0} \frac{1 - \cos x}{x} = 0`)}</div>
      <table class="data">
        <tr><th><i>x</i></th>${M.SQ8.map(x => `<td>${x}</td>`).join('')}</tr>
        <tr><th>sin <i>x</i> / <i>x</i></th>${row(M.SQ8, M.sinc8, 5)}</tr>
      </table>
      <p>With <i>x</i> in radians. The vertical slices show the squeeze: the three heights on each slice close up as it moves in.</p>`,
    cam: cam('sqz', 21, { az: 6, dy: 0.05 }), lit: 'sqzWig', look: {}, scene: 'sqz',
    fig: 'Squeezed to a limit',
  },
  {
    kicker: '1.9', title: 'Multiple representations', sub: 'graph, table and formula agree',
    body: `
      <p class="lede">A limit can be read from a graph, estimated from a table, or found from a formula. All three must give the same answer.</p>
      <p>Take ${t(String.raw`f(x) = \dfrac{\sin 3x}{x}`)} as <i>x</i> → 0.</p>
      <p><b>Graph:</b> the curve heads into a hole at height ${M.K9}.</p>
      <p><b>Table:</b></p>
      <table class="data">
        <tr><th><i>x</i></th>${M.TABLE9.map(x => `<td>${f(x, x === 0.1 || x === -0.1 ? 1 : 2)}</td>`).join('')}</tr>
        <tr><th><i>f</i>(<i>x</i>)</th>${row(M.TABLE9, M.s9)}</tr>
      </table>
      <p><b>Formula:</b> make the angle and the denominator match, then use 1.8 with <i>u</i> = 3<i>x</i> → 0:</p>
      <div class="eq">${T(String.raw`\begin{aligned} \lim_{x \to 0} \frac{\sin 3x}{x} &= \lim_{x\to 0} 3 \cdot \frac{\sin 3x}{3x} \\ &= 3 \cdot 1 = ${M.K9} \end{aligned}`)}</div>
      <p>If the views disagree, suspect the view: a table with too few rows, a graph window too coarse to show a hole. The algebra is the proof; the graph and table are how you check it.</p>`,
    cam: cam('rep', 17.5, { az: -6 }), lit: 'repTable', look: {}, scene: 'rep',
    fig: 'sin 3x / x three ways',
  },
  {
    kicker: '1.10', title: 'Types of discontinuities', sub: 'removable, jump, infinite',
    body: `
      <p class="lede">A function is <b>discontinuous</b> at <i>c</i> when its graph breaks there. The kind of break is named by what the limits do.</p>
      <p><b>Removable:</b> the limit exists, but <i>f</i>(<i>c</i>) is undefined or different. ${t(String.raw`\frac{x^2 - x - 2}{x - 2}`)} → ${M.L10R} as <i>x</i> → ${M.A10R}, and the formula is undefined at ${M.A10R}: a hole.</p>
      <p><b>Jump:</b> both one-sided limits exist but differ. <i>x</i> + 1 for <i>x</i> &lt; 1 and <i>x</i> − 2 for <i>x</i> ≥ 1: from the left 2, from the right −1.</p>
      <p><b>Infinite:</b> at least one one-sided limit is ±∞. ${t(String.raw`\frac{1}{x - 1}`)} → −∞ from the left and +∞ from the right: a vertical asymptote.</p>
      <p>Only a removable discontinuity can be fixed by changing a single value (1.13). A jump or an asymptote is a real break in the graph, whatever <i>f</i>(<i>c</i>) is.</p>`,
    cam: cam('disc', 20.5, { az: 6 }), lit: 'discJump', look: {}, scene: 'disc',
    fig: 'Three ways to break',
  },
  {
    kicker: '1.11', title: 'Continuity at a point', sub: 'three conditions, one equation',
    body: `
      <p class="lede"><i>f</i> is <b>continuous at</b> <i>x</i> = <i>c</i> when ${t(String.raw`\lim_{x\to c} f(x) = f(c)`)}. That one equation holds three conditions, each of which can fail:</p>
      <ol class="rules">
        <li><i>f</i>(<i>c</i>) is defined;</li>
        <li>${t(String.raw`\lim_{x\to c} f(x)`)} exists (both one-sided limits agree);</li>
        <li>the two are equal.</li>
      </ol>
      <p>Here <i>f</i>(<i>x</i>) = <i>x</i> + 1 for <i>x</i> ≤ ${M.A11} and 3 − <i>x</i>² for <i>x</i> &gt; ${M.A11}. Check each at <i>c</i> = ${M.A11}:</p>
      <div class="eq">${T(String.raw`\begin{aligned} f(1) &= 2 \\ \lim_{x\to 1^-} (x + 1) &= 2 \\ \lim_{x\to 1^+} (3 - x^2) &= 2 \end{aligned}`)}</div>
      <p>All three hold, so <i>f</i> is continuous at ${M.A11}, even with a corner there. Continuity means no break, not smoothness.</p>
      <p>Earlier graphs each fail one condition: 1.6’s holes fail (1), 1.3’s jump fails (2), and 1.2’s misplaced dot fails (3).</p>`,
    cam: cam('cont', 15.5, { az: 8 }), lit: 'contPoint', look: {}, scene: 'cont',
    fig: 'Continuous at a corner',
  },
  {
    kicker: '1.12', title: 'Continuity over an interval', sub: 'no breaks from end to end',
    body: `
      <p class="lede"><i>f</i> is continuous on an open interval when it is continuous at every point of it. On a closed interval [<i>a</i>, <i>b</i>] the endpoints need only one side: ${t(String.raw`\lim_{x\to a^+} f(x) = f(a)`)} and ${t(String.raw`\lim_{x\to b^-} f(x) = f(b)`)}.</p>
      <p>Whole families are continuous at every point of their domains: polynomials, rational functions, roots and powers, sine and cosine, exponentials and logarithms. So are their sums, differences, products, quotients (where the bottom isn’t 0) and compositions.</p>
      <p>${t(String.raw`\sqrt{9 - x^2}`)} has domain [−3, 3] and is continuous on all of it; at ±3 only the inside limit exists, and it equals the value 0. The pen draws it in one stroke.</p>
      <p>${t(String.raw`r(x) = \dfrac{x + 1}{x^2 - 4}`)} is rational, so it is continuous everywhere except where it is undefined: on (−∞, −2), (−2, 2) and (2, ∞).</p>`,
    cam: cam('ival', 17, { az: -6 }), lit: 'ivalPen', look: {}, scene: 'ival',
    fig: 'One stroke from −3 to 3',
  },
  {
    kicker: '1.13', title: 'Removing discontinuities', sub: 'choosing the value that closes the gap',
    body: `
      <p class="lede">A removable discontinuity is repaired by defining <i>f</i>(<i>c</i>) to be the limit. A piecewise function is made continuous by choosing its constants so the pieces meet.</p>
      <p><b>A hole.</b> ${t(String.raw`\frac{x^2 - x - 2}{x - 2}`)} becomes continuous at 2 when its value there is defined as ${M.L10R}, the limit.</p>
      <p><b>A constant.</b> Let <i>f</i>(<i>x</i>) = <i>kx</i> + 1 for <i>x</i> &lt; ${M.A13} and <i>x</i>² − 1 for <i>x</i> ≥ ${M.A13}. The value and right-hand limit are ${M.right13(M.A13)}; the left-hand limit is 2<i>k</i> + 1. Continuity at ${M.A13} needs them equal:</p>
      <div class="eq">${T(String.raw`\begin{gathered} \lim_{x\to 2^-} (kx + 1) = f(2) \\ 2k + 1 = ${M.right13(M.A13)} \;\Rightarrow\; k = ${M.K13} \end{gathered}`)}</div>
      <p>The figure turns the red line through (0, 1) as <i>k</i> changes. Only at <i>k</i> = ${M.K13} does its open end land on the filled dot. Every other <i>k</i> leaves a jump.</p>
      <p>With two unknown constants and two break points, write one such equation at each break and solve them together.</p>`,
    cam: cam('fix', 15.5, { az: 8 }), lit: 'fixLeft', look: {}, scene: 'fix',
    fig: 'Turning k until the pieces meet',
  },
  {
    kicker: '1.14', title: 'Infinite limits', sub: 'vertical asymptotes',
    body: `
      <p class="lede">${t(String.raw`\lim_{x\to c} f(x) = \infty`)} means <i>f</i>(<i>x</i>) grows past every bound as <i>x</i> → <i>c</i>. The limit still does not exist as a number; the ∞ says how it fails.</p>
      <p>The line <i>x</i> = <i>c</i> is a <b>vertical asymptote</b> when either one-sided limit at <i>c</i> is ∞ or −∞.</p>
      <p>For ${t(String.raw`\dfrac{x + 1}{x - 2}`)} at <i>x</i> = ${M.A14}, substitution gives 3/0: the top heads to 3, the bottom to 0. The sign of the bottom decides the direction:</p>
      <table class="data">
        <tr><th><i>x</i></th><td>1.99</td><td>1.999</td><td>2.001</td><td>2.01</td></tr>
        <tr><th><i>f</i>(<i>x</i>)</th>${row([1.99, 1.999, 2.001, 2.01], M.r14, 0)}</tr>
      </table>
      <div class="eq">${T(String.raw`\begin{aligned} \lim_{x \to 2^-} \frac{x + 1}{x - 2} &= -\infty \\ \lim_{x \to 2^+} \frac{x + 1}{x - 2} &= \infty \end{aligned}`)}</div>
      <p>For a rational function, a zero of the denominator that does not cancel gives a vertical asymptote; one that cancels with the top gives a hole (1.10).</p>`,
    cam: cam('vert', 19.5, { az: -6 }), lit: 'vertAsym', look: {}, scene: 'vert',
    fig: 'A vertical asymptote at x = 2',
  },
  {
    kicker: '1.15', title: 'Limits at infinity', sub: 'horizontal asymptotes and growth rates',
    body: `
      <p class="lede">${t(String.raw`\lim_{x\to\infty} f(x) = L`)} means <i>f</i>(<i>x</i>) gets as close to <i>L</i> as you like once <i>x</i> is large enough. Then <i>y</i> = <i>L</i> is a <b>horizontal asymptote</b>. The same goes for <i>x</i> → −∞.</p>
      <p>For a rational function, divide top and bottom by the highest power of <i>x</i> in the denominator:</p>
      <div class="eq">${T(String.raw`\begin{aligned} \lim_{x\to\pm\infty} \frac{3x^2 + 4x}{x^2 + 1} &= \lim_{x\to\pm\infty} \frac{3 + 4/x}{1 + 1/x^2} \\ &= ${M.HA15} \end{aligned}`)}</div>
      <p>Top degree lower: the limit is 0. Equal: the ratio of leading coefficients. Higher: no horizontal asymptote. The graph may cross its asymptote (this one does, at <i>x</i> = ${M.CROSS15}); an asymptote describes only the far ends: <i>f</i>(20) = ${f(M.f15(20), 3)}, <i>f</i>(−20) = ${f(M.f15(-20), 3)}.</p>
      <p><b>Growth rates.</b> As <i>x</i> → ∞, every exponential <i>b</i><sup><i>x</i></sup> (<i>b</i> &gt; 1) outgrows every power <i>x</i><sup><i>p</i></sup>, which outgrows ln <i>x</i>. So ${t(String.raw`\lim_{x\to\infty} x^3/e^x = 0`)} and ${t(String.raw`\lim_{x\to\infty} \ln x / \sqrt{x} = 0`)}.</p>`,
    cam: cam('horiz', 25, { az: 6 }), lit: 'horizAsym', look: {}, scene: 'horiz',
    fig: 'Levelling off at y = 3',
  },
  {
    kicker: '1.16', title: 'The Intermediate Value Theorem', sub: 'a continuous graph can’t skip a value',
    body: `
      <p class="lede">If <i>f</i> is continuous on [<i>a</i>, <i>b</i>] and <i>N</i> is any number between <i>f</i>(<i>a</i>) and <i>f</i>(<i>b</i>), then <i>f</i>(<i>c</i>) = <i>N</i> for at least one <i>c</i> in (<i>a</i>, <i>b</i>).</p>
      <p>A continuous graph can’t get from one height to another without passing every height between. The red level <i>N</i> sweeps between ${M.FA16} and ${M.FB16}; wherever it is, the curve crosses it.</p>
      <p><b>Example.</b> Does ${t('x^3 - x - 1 = 0')} have a solution in (1, 2)? Let ${t('f(x) = x^3 - x - 1')}.</p>
      <ul class="rules">
        <li><i>f</i> is a polynomial, so it is continuous on [1, 2].</li>
        <li><i>f</i>(1) = ${M.FA16} &lt; 0 and <i>f</i>(2) = ${M.FB16} &gt; 0.</li>
        <li>0 is between them, so by the IVT there is a <i>c</i> in (1, 2) with <i>f</i>(<i>c</i>) = 0.</li>
      </ul>
      <p>(It is <i>c</i> ≈ ${f(M.ROOT16, 4)}.) The theorem says a solution exists, not where it is or how many there are. And continuity is essential: 1/<i>x</i> goes from −1 at <i>x</i> = −1 to 1 at <i>x</i> = 1 but is never 0.</p>`,
    cam: cam('ivt', 15.5, { az: -8 }), lit: 'ivtLevel', look: {}, scene: 'ivt',
    fig: 'Every level between is crossed',
  },
];

const g = (x, n = 3) => f(x, n);
const h = (s, h0 = 1.5) => M.gap(s.t, h0);
export const PLATES = {
  // opener
  sincCurve: { text: 'The graph of sin x / x, with x in radians. It is even, so the two sides mirror each other, and its ripples shrink like 1/x away from the middle.', facts: () => [['at x = π', '0'], ['as x → ±∞', '→ 0']] },
  sincHole: { text: 'At x = 0 the formula is 0/0: no value. The hole sits at the height the graph approaches, 1.', facts: () => [['f(0)', 'undefined'], ['limit', '1']] },
  sincPts: { text: 'One point closes in from the left, one from the right. Their heights, carried across to the y-axis by the grey lines, close in on 1 together.', facts: s => [['x', `±${g(h(s, M.OPEN.h0), 4)}`], ['sin x / x', g(M.sinc(h(s, M.OPEN.h0)), 4)]] },
  // 1.1
  parab: { text: 'y = x². Its steepness changes from point to point, so no single slope describes it.', facts: () => [['at x = 1', 'y = 1']] },
  instant: { text: 'The point P = (1, 1). A rate needs a change, and one point alone shows none. The limit of the secant slopes gives it one.', facts: () => [['P', '(1, 1)'], ['slope there', `${M.TAN1}`]] },
  secLine: { text: 'The secant through P and Q = (1 + h, (1 + h)²). Its slope, 2 + h, is the average rate of change over [1, 1 + h]. As Q slides toward P, h → 0 and the slope → 2.', facts: s => [['h', g(h(s, M.H1))], ['slope', g(M.secant(h(s, M.H1)))]] },
  tanLine: { text: 'The tangent at P, y = 2x − 1: the line the secants turn into. Its slope is the instantaneous rate of change.', facts: () => [['slope', `${M.TAN1}`], ['equation', 'y = 2x − 1']] },
  // 1.2
  limCurve: { text: '(x² − 1)/(x − 1) = (x − 1)(x + 1)/(x − 1) = x + 1 for every x except 1.', facts: () => [['equals', 'x + 1, x ≠ 1']] },
  limHole: { text: 'The point (1, 2) is missing from the curve, but it is where the curve is heading from both sides. That height is the limit.', facts: () => [['limit', `${M.L2}`]] },
  limValue: { text: 'f(1) was assigned the value 3, off the curve. It does not change the limit at all: the limit only looks at x ≠ 1.', facts: () => [['f(1)', `${M.F2_AT}`], ['limit', `${M.L2}`]] },
  limPts: { text: 'Inputs on each side of 1, closing in. Their outputs close in on 2, never on f(1) = 3.', facts: s => [['left', `f(${g(1 - h(s))}) = ${g(M.f2(1 - h(s)))}`], ['right', `f(${g(1 + h(s))}) = ${g(M.f2(1 + h(s)))}`]] },
  // 1.3
  oneLeft: { text: 'For x < 2, g(x) = x²/2 + 1. It heads to 2²/2 + 1 = 3, shown by the open circle: 3 is approached, not taken.', facts: () => [['x → 2⁻', `${M.LEFT3}`]] },
  oneRight: { text: 'For x ≥ 2, g(x) = x − 1, which includes x = 2 itself: the filled dot, g(2) = 1.', facts: () => [['x → 2⁺', `${M.RIGHT3}`], ['g(2)', `${M.RIGHT3}`]] },
  fromLeft: { text: 'Coming from the left, the heights approach 3. That is the left-hand limit.', facts: s => [['x', g(M.A3 - h(s, 1.8))], ['g(x)', g(M.g3(M.A3 - h(s, 1.8)))]] },
  fromRight: { text: 'Coming from the right, the heights approach 1. The two sides disagree, so the two-sided limit does not exist.', facts: s => [['x', g(M.A3 + h(s, 1.8))], ['g(x)', g(M.g3(M.A3 + h(s, 1.8)))]] },
  // 1.4
  tabCurve: { text: '(1 + x)^(1/x), defined for x > −1 except at 0. Far left it shoots up; to the right it rises slowly.', facts: () => [['f(1)', '2'], ['f(−0.5)', '4']] },
  tabHole: { text: 'The missing point is at height e = 2.71828…, the base of the natural logarithm. This limit is one way to define e.', facts: () => [['limit', Math.E.toFixed(5)]] },
  tabPts: { text: 'Each position is a row of the table. From the left the values come down to e, from the right they climb up to it.', facts: s => [['left', `f(${g(-h(s, M.H4), 4)}) = ${g(M.e4(-h(s, M.H4)), 4)}`], ['right', `f(${g(h(s, M.H4), 4)}) = ${g(M.e4(h(s, M.H4)), 4)}`]] },
  // 1.5
  propF: { text: 'f(x) = x²/2, a polynomial: its limit at 2 is f(2) = 2.', facts: s => [['f(x)', g(M.f5(M.C5 - h(s, 1.8)))], ['limit', `${M.LF5}`]] },
  propG: { text: 'g(x) = 3 − x: its limit at 2 is g(2) = 1.', facts: s => [['g(x)', g(M.g5(M.C5 - h(s, 1.8)))], ['limit', `${M.LG5}`]] },
  propSum: { text: 'Add the two heights at each x and you get the red curve. Its limit is the sum of the limits, 2 + 1 = 3.', facts: s => { const x = M.C5 - h(s, 1.8); return [['f + g', g(M.f5(x) + M.g5(x))], ['f·g', g(M.f5(x) * M.g5(x))], ['f/g', g(M.f5(x) / M.g5(x))]]; } },
  // 1.6
  facCurve: { text: 'x² + x − 6 = (x − 2)(x + 3). Cancel the x − 2 (allowed, since x ≠ 2) and what is left is the line x + 3, with a hole at (2, 5).', facts: s => [['x', g(M.A6F - h(s))], ['value', g(M.fac6(M.A6F - h(s)))], ['limit', `${M.L6F}`]] },
  ratCurve: { text: 'Multiply by (√x + 2)/(√x + 2): the bottom becomes x − 4, which cancels. What is left is √x + 2, with a hole at (4, 4).', facts: s => [['x', g(M.A6R - h(s, 3))], ['value', g(M.rat6(M.A6R - h(s, 3)))], ['limit', `${M.L6R}`]] },
  // 1.7
  pickSub: { text: 'x² + 1 is a polynomial: substitute, 1² + 1 = 2, and you are done.', facts: () => [['substitution', '2'], ['limit', '2']] },
  pickZero: { text: '(x² − 1)/(x − 1) gives 0/0 at x = 1. Factor: (x − 1)(x + 1)/(x − 1) = x + 1 → 2.', facts: () => [['substitution', '0/0'], ['limit', '2']] },
  pickInf: { text: '1/(x − 1)² gives 1/0. The bottom is a square, positive on both sides, so the function grows to +∞ from both sides. No finite limit.', facts: s => [['f(1 ± h)', g(M.inf7(1 - h(s, 1.2)), 1)], ['limit', '∞ (does not exist)']] },
  // 1.8
  sqzWig: { text: 'x² sin(1/x) oscillates infinitely often near 0, but its swings are capped by x². Defined as 0 at x = 0 it is even continuous there.', facts: s => [['x', g(h(s, 0.9), 4)], ['x² sin(1/x)', g(M.wig8(h(s, 0.9)), 5)]] },
  sqzBounds: { text: 'y = x² and y = −x². Because −1 ≤ sin(1/x) ≤ 1, the wiggle stays between them, and both go to 0.', facts: s => [['±x²', `±${g(h(s, 0.9) ** 2, 5)}`]] },
  sqzSinc: { text: 'sin x / x, undefined at 0. Between cos x and 1 near 0, so its limit is 1.', facts: s => [['x', g(h(s, 2.8), 4)], ['sin x / x', g(M.sinc8(h(s, 2.8)), 5)]] },
  sqzCos: { text: 'The bounds cos x and 1. For 0 < |x| < π/2, the areas of two triangles and a sector of the unit circle give cos x ≤ sin x / x ≤ 1.', facts: s => [['cos x', g(Math.cos(h(s, 2.8)), 5)], ['upper', '1']] },
  sqzSlice: { text: 'A vertical slice at x. On it, the middle curve is caught between the two bounds. As the slice moves toward 0 the bounds close up, and the middle has nowhere else to go.', facts: s => [['top slice x', g(h(s, 0.9), 4)], ['bottom slice x', g(h(s, 2.8), 4)]] },
  // 1.9
  repCurve: { text: 'sin 3x / x. It is even, and heads to 3 at x = 0, where it is undefined.', facts: () => [['limit', `${M.K9}`]] },
  repTable: { text: 'The blue points are table rows. They approach the hole from both sides, the closer ones nearer to 3.', facts: () => [1, 0.5, 0.25].map(x => [`x = ±${x}`, g(M.s9(x), 4)]) },
  repPts: { text: 'Inputs closing in from both sides. Their outputs match the algebra: 3 · (sin 3x)/(3x) → 3.', facts: s => [['x', `±${g(h(s, 2.2), 4)}`], ['f(x)', g(M.s9(h(s, 2.2)), 4)]] },
  // 1.10
  discRem: { text: 'A hole at (2, 3): the limit exists (3) but the function is undefined there. Define f(2) = 3 and the break is gone.', facts: () => [['limit', `${M.L10R}`], ['f(2)', 'undefined']] },
  discJump: { text: 'From the left the graph heads to 2; from the right, and at x = 1, it is at −1. Both one-sided limits exist but differ.', facts: () => [['x → 1⁻', '2'], ['x → 1⁺', '−1'], ['f(1)', '−1']] },
  discInf: { text: '1/(x − 1): the bottom → 0 while the top stays 1. Negative on the left, positive on the right.', facts: s => [['x → 1⁻', '−∞'], ['x → 1⁺', '+∞'], ['f(1 + h)', g(M.inf10(1 + h(s, 1.4)), 1)]] },
  // 1.11
  contCurve: { text: 'Two formulas joined at x = 1. They meet at the same height, so the pen never lifts, though the direction changes sharply.', facts: () => [['left', 'x + 1'], ['right', '3 − x²']] },
  contPoint: { text: 'f(1) = 1 + 1 = 2, and both one-sided limits are 2. All three conditions hold.', facts: () => [['f(1)', '2'], ['limit', '2'], ['continuous', 'yes']] },
  contPts: { text: 'Points closing in from each side, on different formulas, reach the same height, 2.', facts: s => [['left', g(M.c11(M.A11 - h(s, 1.6)))], ['right', g(M.c11(M.A11 + h(s, 1.6)))]] },
  // 1.12
  ivalGraph: { text: 'The upper half of the circle x² + y² = 9. Its domain is [−3, 3]: outside it, 9 − x² is negative.', facts: () => [['domain', '[−3, 3]'], ['top', '(0, 3)']] },
  ivalPen: { text: 'The pen draws the whole graph from x = −3 to x = 3 without lifting: continuous on the closed interval.', facts: s => [['x', g(M.pen12(s.t))], ['y', g(M.semi(M.pen12(s.t)))]] },
  ivalEnds: { text: 'At x = −3 only the right-hand limit exists, and at x = 3 only the left-hand one. Each equals the value 0, which is all continuity on [−3, 3] asks there.', facts: () => [['f(±3)', '0']] },
  // 1.13
  fixLeft: { text: 'The line y = kx + 1 always passes through (0, 1); k turns it. Its open end at x = 2 sits at height 2k + 1.', facts: s => { const k = M.k13(s.clock); return [['k', g(k)], ['2k + 1', g(2 * k + 1)]]; } },
  fixRight: { text: 'x² − 1 from x = 2 on, including x = 2: f(2) = 3. The left piece must arrive at 3.', facts: () => [['f(2)', '3'], ['needs k', `${M.K13}`]] },
  // 1.14
  vertCurve: { text: '(x + 1)/(x − 2): two branches, split at x = 2.', facts: s => [['f(2 − h)', g(M.r14(2 - h(s, 2.5)), 1)], ['f(2 + h)', g(M.r14(2 + h(s, 2.5)), 1)]] },
  vertAsym: { text: 'The line x = 2. The top (3) stays put while the bottom shrinks to 0, so the output grows without bound: down on the left, up on the right.', facts: () => [['x → 2⁻', '−∞'], ['x → 2⁺', '+∞']] },
  vertHA: { text: 'The line y = 1: as x → ±∞ the ratio of leading terms is x/x = 1. Its story is on the next page.', facts: () => [['x → ±∞', '1']] },
  vertPts: { text: 'Points closing in on x = 2. The red one dives, the blue one climbs, both out of the frame.', facts: s => [['left', g(M.r14(2 - h(s, 2.5)), 1)], ['right', g(M.r14(2 + h(s, 2.5)), 1)]] },
  // 1.15
  horizCurve: { text: '(3x² + 4x)/(x² + 1). It peaks at (2, 4), dips to (−0.5, −1), crosses y = 3 at x = 0.75, and levels off toward 3 both ways.', facts: () => [['max', '(2, 4)'], ['min', '(−0.5, −1)']] },
  horizAsym: { text: 'The line y = 3, the ratio of the leading coefficients 3x²/x². The graph is above it far to the right and below it far to the left.', facts: s => { const x = M.far15(s.t); return [['f(x) − 3', g(M.f15(x) - 3, 4)], ['f(−x) − 3', g(M.f15(-x) - 3, 4)]]; } },
  horizPts: { text: 'Points running out to the left and right. The farther they go, the closer they sit to y = 3.', facts: s => { const x = Math.min(M.far15(s.t), 19.9); return [['x', `±${g(x, 2)}`], ['f(x)', g(M.f15(x))], ['f(−x)', g(M.f15(-x))]]; } },
  // 1.16
  ivtCurve: { text: 'x³ − x − 1, a polynomial, so continuous everywhere, and in particular on [1, 2].', facts: () => [['f(1)', `${M.FA16}`], ['f(2)', `${M.FB16}`]] },
  ivtEnds: { text: 'The values at the ends of [1, 2]: −1 and 5. Every N between them is reached somewhere in (1, 2).', facts: () => [['f(1)', `${M.FA16}`], ['f(2)', `${M.FB16}`]] },
  ivtLevel: { text: 'The red line y = N and the point where the curve crosses it, x = c. As N moves between −1 and 5, c moves through (1, 2), but it is always there.', facts: s => { const N = M.N16(s.clock), c = M.c16(N); return [['N', g(N)], ['c', g(c, 4)], ['f(c)', g(M.f16(c))]]; } },
};
