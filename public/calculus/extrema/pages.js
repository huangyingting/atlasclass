// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { SC } from './world.js';
import { tex } from '../engine/tex.js';

const f2 = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const g = v => (v < 0 ? '−' : '') + +Math.abs(v).toFixed(3);      // short exact-looking numbers: 4.125, 5, 0.845
const sgn = v => v > 1e-9 ? '+' : v < -1e-9 ? '−' : '0';
const I = s => tex.inline(s);
const D = s => `<div class="eq">${tex(s)}</div>`;
const R = String.raw;
const [c1, c2] = M.MC;
const hmin = M.h(M.HC);

export const PAGES = [
  {
    kicker: 'Chapter 5', title: 'Analyzing functions', sub: 'what the derivatives say',
    body: `
      <p class="lede">A derivative is a function’s slope. Read its sign and you know where the function rises and falls; read the sign of the second derivative and you know which way it bends.</p>
      <p>Most of this chapter reads one function, stacked above its first and second derivatives:</p>
      ${D(R`\begin{aligned} f(x) &= x^3 - 6x^2 + 9x + 1 \\ f'(x) &= 3(x - 1)(x - 3) \\ f''(x) &= 6x - 12 \end{aligned}`)}
      <p>Where ${I(R`f'`)} is zero, ${I('f')} is flat: a peak at (${M.MAX[0]}, ${M.MAX[1]}) and a valley at (${M.MIN[0]}, ${M.MIN[1]}). Where ${I(R`f''`)} changes sign, ${I('f')} changes how it bends: at (${M.INFL[0]}, ${M.INFL[1]}). The vertical lines join each feature to its cause.</p>
      <p>The chapter ends with the payoff: the largest field a fence can hold, the largest box a sheet can fold into, and the highest point on a curve that isn’t a function.</p>`,
    cam: { target: [SC.stack + 0.3, 7.2, 0], az: -24, el: 8, dist: 46 }, lit: 'stackNow', look: {}, scene: 'stack',
    fig: 'A function above its derivatives',
  },
  {
    kicker: '5.1', title: 'The Mean Value Theorem', sub: 'somewhere, the instant matches the average',
    body: `
      <p class="lede">If ${I('f')} is continuous on ${I('[a, b]')} and differentiable on ${I('(a, b)')}, then at some ${I('c')} between, the tangent is parallel to the secant:</p>
      ${D(R`f'(c) = \frac{f(b) - f(a)}{b - a}`)}
      <p>On ${I(`[${M.MA}, ${M.MB}]`)} the blue secant runs from (${M.MA}, ${M.f(M.MA)}) to (${M.MB}, ${M.f(M.MB)}), slope ${I(R`\tfrac{${M.f(M.MB)} - ${M.f(M.MA)}}{${M.MB} - ${M.MA}} = ${M.MS}`)}. Setting ${I(R`3c^2 - 12c + 9 = ${M.MS}`)}:</p>
      ${D(R`c = 2 \pm \tfrac{2}{\sqrt3} \approx ${f2(c1, 3)},\ ${f2(c2, 3)}`)}
      <p>Both lie inside, so here there are two. The theorem promises at least one; it does not say where.</p>
      <p><b>Rolle’s theorem</b> is the level case: if also ${I('f(a) = f(b)')}, some ${I(R`f'(c) = 0`)}. Here ${I(`f(${M.RA}) = f(${M.RB}) = ${M.f(M.RA)}`)}, and ${I(R`f'(1) = 0`)}.</p>
      <p>The conditions matter: ${I('|x|')} on ${I('[-1, 1]')} has equal ends but a corner, and no flat tangent anywhere.</p>`,
    cam: { target: [SC.mvt, 3.1, 0], az: -8, el: 5, dist: 25 }, lit: 'mvtTan', look: {}, scene: 'mvt',
    fig: 'Secant and parallel tangents',
  },
  {
    kicker: '5.2', title: 'Extreme values', sub: 'global and local, and where to look',
    body: `
      <p class="lede">An <b>absolute</b> (global) maximum is the largest value on the whole domain in question. A <b>relative</b> (local) maximum is largest only among nearby values. Minimums alike.</p>
      <p><b>The Extreme Value Theorem.</b> A function continuous on a closed interval ${I('[a, b]')} has an absolute maximum and an absolute minimum there. Both conditions count: on all of the real line this ${I('f')} has neither, since it runs off to ${I(R`\pm\infty`)}.</p>
      <p>Extremes can only happen at a <b>critical point</b>, an interior ${I('x')} where ${I(R`f'(x) = 0`)} or ${I(R`f'(x)`)} doesn’t exist, or at an endpoint. For our ${I('f')}:</p>
      ${D(R`f'(x) = 3(x - 1)(x - 3)`)}
      <p>is zero at ${I('x = 1')} and ${I('x = 3')}, the critical points. On ${I(`[${M.EA}, ${M.EB}]`)} the falling blue line touches the graph first at height ${M.f(M.C1)} (the absolute max, at ${I('x = 1')}) and last at ${M.f(M.C2)} (the absolute min, at ${I('x = 3')}). Each is also a relative extreme.</p>
      <p>A critical point is only a candidate: ${I(R`f'`)} can be zero without an extreme (5.4).</p>`,
    cam: { target: [SC.evt, 3.1, 0], az: 7, el: 5, dist: 25 }, lit: 'interval', look: {}, scene: 'evt',
    fig: `f on [${M.EA}, ${M.EB}]`,
  },
  {
    kicker: '5.3', title: 'Increasing and decreasing', sub: 'the sign of f′',
    body: `
      <p class="lede">If ${I(R`f'(x) > 0`)} on an interval, ${I('f')} is increasing there; if ${I(R`f'(x) < 0`)}, decreasing. The tangent tilts up or down, and its slope is the height of ${I(R`f'`)}.</p>
      <p>To find the intervals, find where ${I(R`f'`)} is zero or undefined, then test one point in each piece. ${I(R`f'`)} can only change sign at those points.</p>
      <table class="data">
        <tr><th>interval</th><th>test</th><th>${I(R`f'`)}</th><th>${I('f')}</th></tr>
        <tr><td>${I('x < 1')}</td><td>${I(`f'(0) = ${M.df(0)}`)}</td><td>+</td><td>increasing</td></tr>
        <tr><td>${I('1 < x < 3')}</td><td>${I(`f'(2) = ${M.df(2)}`)}</td><td>−</td><td>decreasing</td></tr>
        <tr><td>${I('x > 3')}</td><td>${I(`f'(4) = ${M.df(4)}`)}</td><td>+</td><td>increasing</td></tr>
      </table>
      <p>So ${I('f')} increases on ${I(R`(-\infty, 1]`)} and ${I(R`[3, \infty)`)} and decreases on ${I('[1, 3]')}. Blue is up, red is down, above and below.</p>
      <p>On the AP exam, justify with the sign: “${I('f')} is decreasing on ${I('(1, 3)')} because ${I(R`f'(x) < 0`)} there.”</p>`,
    cam: { target: [SC.inc, 5.0, 0], az: -6, el: 4, dist: 35 }, lit: 'incNow', look: {}, scene: 'inc',
    fig: 'The sign of f′',
  },
  {
    kicker: '5.4', title: 'The first derivative test', sub: 'does the sign change?',
    body: `
      <p class="lede">At a critical point ${I('c')}, look at the sign of ${I(R`f'`)} on either side. From + to −, ${I('f')} has a relative maximum; from − to +, a relative minimum; no change, neither.</p>
      <p>Take ${I(R`g(x) = \tfrac{x^4 - 4x^3}{9}`)}, so</p>
      ${D(R`g'(x) = \frac{4x^2(x - 3)}{9}`)}
      <p>zero at ${I('x = 0')} and ${I('x = 3')}. Test each piece:</p>
      <table class="data">
        <tr><th></th><th>${I('x < 0')}</th><th>${I('0 < x < 3')}</th><th>${I('x > 3')}</th></tr>
        <tr><td>${I(R`g'`)}</td><td>${I(`g'(-1) = ${g(M.dg(-1))}`)}</td><td>${I(`g'(1) = ${g(M.dg(1))}`)}</td><td>${I(`g'(4) = ${g(M.dg(4))}`)}</td></tr>
        <tr><td>sign</td><td>−</td><td>−</td><td>+</td></tr>
      </table>
      <p>At ${I('x = 0')} the tangent is flat, but ${I('g')} falls before and after: no extremum. At ${I('x = 3')}, ${I(R`g'`)} goes from − to +, so ${I('g')} has a relative minimum, ${I(`g(3) = ${M.g(3)}`)}.</p>
      <p>Justify in those words: “${I('g')} has a relative minimum at ${I('x = 3')} because ${I(R`g'`)} changes from negative to positive there.” Saying “${I(R`g'(3) = 0`)}” is not enough.</p>`,
    cam: { target: [SC.fdt + 0.1, 4.9, 0], az: 6, el: 4, dist: 35 }, lit: 'fdtMin', look: {}, scene: 'fdt',
    fig: 'Sign changes of g′',
  },
  {
    kicker: '5.5', title: 'The candidates test', sub: 'absolute extremes on a closed interval',
    body: `
      <p class="lede">On a closed interval the Extreme Value Theorem promises an absolute max and min, and they can only be at critical points or endpoints. So list those candidates, evaluate, and compare.</p>
      <p>Take ${I(R`h(x) = x - 2\sin x`)} on ${I(R`[0, \pi]`)}. Then ${I(R`h'(x) = 1 - 2\cos x = 0`)} when ${I(R`\cos x = \tfrac12`)}, at ${I(R`x = \tfrac{\pi}{3}`)}.</p>
      <table class="data">
        <tr><th>candidate</th><th>${I('h(x)')}</th></tr>
        <tr><td>${I('x = 0')} (endpoint)</td><td>${I(`${g(M.h(0))}`)}</td></tr>
        <tr><td>${I(R`x = \tfrac{\pi}{3}`)} (critical)</td><td>${I(R`\tfrac{\pi}{3} - \sqrt3 \approx ${f2(hmin, 3)}`)}</td></tr>
        <tr><td>${I(R`x = \pi`)} (endpoint)</td><td>${I(R`\pi \approx ${f2(M.HB, 3)}`)}</td></tr>
      </table>
      <p>The absolute maximum is ${I(R`\pi`)}, at the endpoint ${I(R`x = \pi`)}, where ${I(R`h'`)} isn’t zero at all. The absolute minimum is ${I(R`\tfrac{\pi}{3} - \sqrt3`)}, at ${I(R`x = \tfrac{\pi}{3}`)}. The bars are the three heights.</p>
      <p>No sign chart is needed: only the values. Forgetting an endpoint is the classic mistake.</p>`,
    cam: { target: [SC.cand + 0.2, 1.5, 0], az: -10, el: 8, dist: 26 }, lit: 'candidates', look: {}, scene: 'cand',
    fig: 'Three candidates',
  },
  {
    kicker: '5.6', title: 'Concavity', sub: 'which way the graph bends',
    body: `
      <p class="lede">${I('f')} is <b>concave up</b> where ${I(R`f'`)} is increasing: the slopes climb, and the graph lies above its tangents. It is <b>concave down</b> where ${I(R`f'`)} is decreasing. So the sign of ${I(R`f''`)} decides it.</p>
      ${D(R`f''(x) = 6x - 12\ \begin{cases} < 0, & x < 2 \\ > 0, & x > 2 \end{cases}`)}
      <p>so ${I('f')} is concave down on ${I(R`(-\infty, 2)`)} and concave up on ${I(R`(2, \infty)`)}.</p>
      <p>A <b>point of inflection</b> is where ${I('f')} is continuous and the concavity changes: here ${I(`(${M.INFL[0]}, ${M.INFL[1]})`)}. The shaded gap between the curve and its tangent flips sides as the point passes it.</p>
      <p>${I(R`f''(c) = 0`)} alone is not enough. For ${I('y = x^4')}, ${I(R`y''(0) = 0`)}, yet ${I(R`y'' = 12x^2 \ge 0`)} on both sides: concave up throughout, no inflection point. As with extremes, look for a <b>sign change</b>.</p>`,
    cam: { target: [SC.conc, 5.0, 0], az: -6, el: 4, dist: 35 }, lit: 'concNow', look: {}, scene: 'conc',
    fig: 'Concave down, then up',
  },
  {
    kicker: '5.7', title: 'The second derivative test', sub: 'cap or cup',
    body: `
      <p class="lede">Where ${I(R`f'(c) = 0`)}, the bend decides: if ${I(R`f''(c) < 0`)} the graph is a cap and ${I('f(c)')} is a relative maximum; if ${I(R`f''(c) > 0`)}, a cup and a relative minimum.</p>
      ${D(R`\begin{aligned} f''(1) &= ${M.d2f(1)} < 0 &&\Rightarrow \text{max} \\ f''(3) &= ${M.d2f(3)} > 0 &&\Rightarrow \text{min} \end{aligned}`)}
      <p>so ${I(`f(1) = ${M.f(1)}`)} is a relative maximum and ${I(`f(3) = ${M.f(3)}`)} a relative minimum.</p>
      <p>The red parabola shares this point’s height, slope and second derivative. It opens down wherever ${I(R`f'' < 0`)}, up wherever ${I(R`f'' > 0`)}, and sits flat on top of the peak.</p>
      <p>If ${I(R`f''(c) = 0`)} the test says nothing. For ${I('g')} on page 5.4, ${I(R`g''(0) = 0`)} and ${I('x = 0')} was no extremum, but ${I('x^4')} has ${I(R`y''(0) = 0`)} and a minimum. Fall back on the first derivative test.</p>
      <p>If a continuous function has only one critical point on an interval, and it is a relative extreme, it is also the absolute one there. Optimization uses this.</p>`,
    cam: { target: [SC.sdt, 3.1, 0], az: 6, el: 5, dist: 25 }, lit: 'sdtNow', look: {}, scene: 'sdt',
    fig: 'The matching parabola',
  },
  {
    kicker: '5.8', title: 'Sketching f, f′ and f″', sub: 'one table, three graphs',
    body: `
      <p class="lede">Each graph is the slope of the one above it. Put their signs in one table and the shape of ${I('f')} follows.</p>
      <table class="data">
        <tr><th></th><th>${I(R`f'`)}</th><th>${I(R`f''`)}</th><th>${I('f')}</th></tr>
        <tr><td>${I('x < 1')}</td><td>+</td><td>−</td><td>rising, concave down</td></tr>
        <tr><td>${I('1 < x < 2')}</td><td>−</td><td>−</td><td>falling, concave down</td></tr>
        <tr><td>${I('2 < x < 3')}</td><td>−</td><td>+</td><td>falling, concave up</td></tr>
        <tr><td>${I('x > 3')}</td><td>+</td><td>+</td><td>rising, concave up</td></tr>
      </table>
      <p>Line up the features down the column:</p>
      <ul class="rules">
        <li>zero of ${I(R`f'`)} with a sign change ↔ extreme of ${I('f')}</li>
        <li>extreme of ${I(R`f'`)} (zero of ${I(R`f''`)} with a sign change) ↔ inflection point of ${I('f')}</li>
        <li>${I(R`f'`)} positive ↔ ${I('f')} rising; ${I(R`f'`)} rising ↔ ${I('f')} concave up</li>
      </ul>
      <p>Sketching ${I(R`f'`)} from ${I('f')}: mark where ${I('f')} is flat (zeros), then where it is steepest (peaks and troughs of ${I(R`f'`)}).</p>`,
    cam: { target: [SC.stack, 6.9, 0], az: 0, el: 3, dist: 48 }, lit: 'stackD', look: {}, scene: 'stack',
    fig: 'f, f′ and f″',
  },
  {
    kicker: '5.9', title: 'Reading f from f′', sub: 'when all you have is the derivative',
    body: `
      <p class="lede">AP questions often give only the graph of the derivative. Everything about where ${I('p')} rises and bends can be read from it; only ${I('p')}’s height needs one value, here ${I(`p(0) = ${M.P0}`)}.</p>
      ${D(R`p'(x) = \tfrac14\,x(x - 3)^2`)}
      <ul class="rules">
        <li>${I(R`p' < 0`)} for ${I('x < 0')} and ${I(R`p' > 0`)} after, except ${I(R`p'(3) = 0`)}: ${I('p')} decreases, then increases.</li>
        <li>At ${I('x = 0')}, ${I(R`p'`)} crosses from − to +: a relative minimum.</li>
        <li>At ${I('x = 3')}, ${I(R`p'`)} touches zero without crossing: no extremum.</li>
        <li>${I(R`p'`)} increases on ${I(R`(-\infty, 1)`)} and ${I(R`(3, \infty)`)}: ${I('p')} is concave up there, concave down on ${I('(1, 3)')}.</li>
        <li>${I(R`p'`)} has a max at ${I('x = 1')} and a min at ${I('x = 3')}: ${I('p')} has inflection points at both.</li>
      </ul>
      <p>So the flat point at ${I('x = 3')} is not a peak but an inflection point with a horizontal tangent. The red tangent on ${I('p')} always has the slope that the red dot on ${I(R`p'`)} shows.</p>`,
    cam: { target: [SC.read, 4.8, 0], az: 6, el: 4, dist: 34 }, lit: 'readKey', look: {}, scene: 'read',
    fig: 'Given p′, find p',
  },
  {
    kicker: '5.10', title: 'Introduction to optimization', sub: 'one quantity to make largest',
    body: `
      <p class="lede">An optimization problem asks for the largest or smallest value of a quantity. Write it as a function of one variable, find that variable’s domain, and use the candidates test.</p>
      <p>A farmer has ${M.FENCE} m of fence to enclose a rectangle along a river; the river side needs none. Call the two sides that meet the river ${I('x')}. The side opposite the river gets the rest, ${I(R`${M.FENCE} - 2x`)}:</p>
      ${D(R`A(x) = x(${M.FENCE} - 2x) = ${M.FENCE}x - 2x^2`)}
      <p>for ${I(R`0 \le x \le ${M.FENCE / 2}`)}. Then</p>
      ${D(R`A'(x) = ${M.FENCE} - 4x = 0 \implies x = ${M.FX}`)}
      <table class="data">
        <tr><th>${I('x')} (m)</th><td>0</td><td>${M.FX}</td><td>${M.FENCE / 2}</td></tr>
        <tr><th>${I('A')} (m²)</th><td>0</td><td>${M.FAREA}</td><td>0</td></tr>
      </table>
      <p>The largest field is ${M.FX} m by ${M.FENCE - 2 * M.FX} m, ${M.FAREA} m². Notice the side along the river is twice the others. The field and the dot on the graph move together.</p>`,
    cam: { target: [SC.fence, 1.4, 0.4], az: -6, el: 26, dist: 31 }, lit: 'field', look: {}, scene: 'fence',
    fig: `${M.FENCE} m of fence`,
  },
  {
    kicker: '5.11', title: 'Solving optimization problems', sub: 'the open box',
    body: `
      <p class="lede">A ${M.SHEET} cm square sheet has a square of side ${I('x')} cut from each corner, and the sides fold up into an open box. Which ${I('x')} holds the most?</p>
      <p>The base is ${I(R`${M.SHEET} - 2x`)} on a side and the height is ${I('x')}, so</p>
      ${D(R`V(x) = x(${M.SHEET} - 2x)^2, \quad 0 \le x \le ${M.SHEET / 2}`)}
      <p>By the product and chain rules,</p>
      ${D(R`\begin{aligned} V'(x) &= (${M.SHEET} - 2x)^2 - 4x(${M.SHEET} - 2x) \\ &= (${M.SHEET} - 2x)(${M.SHEET} - 6x) \end{aligned}`)}
      <p>${I(R`V' = 0`)} at ${I(`x = ${M.BX}`)} and ${I(`x = ${M.SHEET / 2}`)}, an endpoint. The candidates:</p>
      <table class="data">
        <tr><th>${I('x')} (cm)</th><td>0</td><td>${M.BX}</td><td>${M.SHEET / 2}</td></tr>
        <tr><th>${I('V')} (cm³)</th><td>0</td><td>${M.BVOL}</td><td>0</td></tr>
      </table>
      <p>The largest box: ${M.BX} cm deep on a ${M.SHEET - 2 * M.BX} cm square base, ${M.BVOL} cm³. As a check, ${I(R`V' > 0`)} before ${I(`x = ${M.BX}`)} and ${I(R`V' < 0`)} after, so it is the only relative maximum and therefore the absolute one.</p>
      <p>Too shallow and the box is a tray; too deep and the base vanishes.</p>`,
    cam: { target: [SC.box, 2.6, -0.8], az: -18, el: 20, dist: 31 }, lit: 'box', look: {}, scene: 'box',
    fig: 'The largest open box',
  },
  {
    kicker: '5.12', title: 'Implicit relations', sub: 'tangents and extremes without y = f(x)',
    body: `
      <p class="lede">A curve like ${I(R`x^2 - xy + y^2 = ${M.K}`)} is no function’s graph, but implicit differentiation still gives its slope, and the slope still finds its flat and vertical points.</p>
      ${D(R`2x - y - xy' + 2yy' = 0`)}
      ${D(R`\frac{dy}{dx} = \frac{y - 2x}{2y - x}`)}
      <p><b>Horizontal tangents</b>: the numerator is 0, so ${I('y = 2x')}. Substituting, ${I(R`x^2 - 2x^2 + 4x^2 = 3`)}, so ${I(R`x = \pm 1`)}: (1, 2) and (−1, −2).</p>
      <p><b>Vertical tangents</b>: the denominator is 0 (and the numerator isn’t), so ${I('x = 2y')}: ${I(R`y = \pm1`)}, at (2, 1) and (−2, −1).</p>
      <p>Is (1, 2) the highest point? Differentiate ${I(R`\frac{dy}{dx}`)} again by the quotient rule. At (1, 2) both ${I(R`y'`)} and ${I('y - 2x')} are 0, so one term survives:</p>
      ${D(R`\frac{d^2y}{dx^2} = \frac{(y' - 2)(2y - x)}{(2y - x)^2}`)}
      ${D(R`= \frac{(0 - 2)(4 - 1)}{(4 - 1)^2} = ${M.d2yTop < 0 ? '-' : ''}\tfrac{${Math.round(Math.abs(M.d2yTop) * 3)}}{3}`)}
      <p>A cap: ${I('y')} has a relative maximum of 2 there, the second derivative test, on a curve.</p>`,
    cam: { target: [SC.impl, 0, 0], az: -6, el: 5, dist: 27 }, lit: 'implNow', look: {}, scene: 'impl',
    fig: 'x² − xy + y² = 3',
  },
];

const at = (fn, x) => `${f2(fn(x))}`;
const now = (name, x, fn, dfn) => [[name, f2(x)], ['height', at(fn, x)], ['slope', at(dfn, x)]];
export const PLATES = {
  stackF: { text: `The function f(x) = x³ − 6x² + 9x + 1. It rises to a relative maximum (${M.MAX[0]}, ${M.MAX[1]}), falls to a relative minimum (${M.MIN[0]}, ${M.MIN[1]}), and changes concavity at (${M.INFL[0]}, ${M.INFL[1]}).`, facts: s => now('x', M.stackX(s.c), M.f, M.df) },
  stackD: { text: 'f′ is the slope of f. It is zero where f is flat (x = 1, 3), positive where f rises and negative where it falls. Its lowest point, at x = 2, is where f falls fastest: the inflection point.', facts: s => [['x', f2(M.stackX(s.c))], ['f′(x)', at(M.df, M.stackX(s.c))], ['so f is', M.df(M.stackX(s.c)) > 0 ? 'increasing' : 'decreasing']] },
  stackDD: { text: 'f″ is the slope of f′. Negative to the left of 2, where f is concave down; positive to the right, concave up.', facts: s => [['x', f2(M.stackX(s.c))], ['f″(x)', at(M.d2f, M.stackX(s.c))], ['so f is', M.d2f(M.stackX(s.c)) > 0 ? 'concave up' : 'concave down']] },
  stackNow: { text: 'The same x on all three graphs. The red tangent on f has slope equal to the height of the dot on f′; the blue tangent on f′ has slope equal to the height of the dot on f″.', facts: s => { const x = M.stackX(s.c); return [['x', f2(x)], ['f(x)', at(M.f, x)], ['f′(x)', at(M.df, x)], ['f″(x)', at(M.d2f, x)]]; } },
  mvtF: { text: 'f is a polynomial, so it is continuous on [0, 4] and differentiable on (0, 4): the Mean Value Theorem applies.', facts: () => [['f(0)', `${M.f(0)}`], ['f(4)', `${M.f(4)}`]] },
  secant: { text: `The secant joins the ends of the interval. Its slope is the average rate of change, (${M.f(M.MB)} − ${M.f(M.MA)})/(${M.MB} − ${M.MA}) = ${M.MS}.`, facts: () => [['average rate', `${M.MS}`]] },
  mvtC: { text: 'At these two points the instantaneous rate equals the average rate: f′(c) = 1. The theorem guarantees at least one; this f has two.', facts: () => M.MC.map((c, i) => [`c${i + 1}`, `${f2(c, 3)}: f′ = ${f2(M.df(c), 3)}`]) },
  rolle: { text: 'Rolle’s theorem: f(0) = f(3) = 1, so somewhere in (0, 3) the tangent is horizontal. It is at x = 1, the peak.', facts: () => [['f(0) = f(3)', `${M.f(0)}`], ['f′(1)', `${M.df(1)}`]] },
  mvtTan: { text: 'The tangent slides across the interval. Its slope rises and falls; twice it passes through the secant’s slope, and there it is parallel to the blue line.', facts: s => { const x = M.mvtX(s.c); return [['x', f2(x)], ['f′(x)', f2(M.df(x))], ['secant slope', `${M.MS}`]]; } },
  interval: { text: `On the closed interval [${M.EA}, ${M.EB}], f is continuous, so the Extreme Value Theorem guarantees an absolute max and min. They are among the endpoints and the critical points.`, facts: () => M.ECAND.map(([x, y]) => [`f(${x})`, g(y)]) },
  outside: { text: 'Beyond the interval f keeps going: it rises without bound to the right and falls without bound to the left, so on all reals it has no absolute max or min.', facts: () => [['f(−0.5)', g(M.f(-0.5))], ['f(4.5)', g(M.f(4.5))]] },
  crit: { text: 'Critical points: where f′ = 0 (or f′ is undefined) inside the domain. Here f′ = 3(x − 1)(x − 3), zero at 1 and 3. Both are relative extremes; on this interval they are also the absolute ones.', facts: () => [['f′(1)', `${M.df(1)}`], ['f(1)', `${M.f(1)}`], ['f′(3)', `${M.df(3)}`], ['f(3)', `${M.f(3)}`]] },
  level: { text: 'A horizontal line drops through the interval. The first height where it meets the graph is the absolute maximum; the last is the absolute minimum.', facts: s => { const y = M.evtY(s.c); return [['line at y', f2(y)], ['meets the graph', y <= M.f(M.C1) && y >= M.f(M.C2) ? 'yes' : 'no']]; } },
  incr: { text: 'Where f′ > 0 (blue region above the axis), f is increasing (blue curve).', facts: () => [['f′(0)', `${M.df(0)}`], ['f′(4)', `${M.df(4)}`]] },
  decr: { text: 'Where f′ < 0 (red region below the axis), f is decreasing (red curve).', facts: () => [['f′(2)', `${M.df(2)}`]] },
  incD: { text: 'f′(x) = 3(x − 1)(x − 3) is zero at 1 and 3, and can only change sign there. One test value per interval settles the sign.', facts: s => [['x', f2(M.incX(s.c))], ['f′(x)', at(M.df, M.incX(s.c))]] },
  incNow: { text: 'The tangent to f and the dot on f′ share an x. Tangent up, dot above the axis; tangent down, dot below.', facts: s => { const x = M.incX(s.c), d = M.df(x); return [['x', f2(x)], ['f′(x)', f2(d)], ['f is', d > 0 ? 'increasing' : 'decreasing']]; } },
  fdtG: { text: 'g(x) = (x⁴ − 4x³)/9. Red while it falls, blue once it rises. It has two flat points but only one extreme.', facts: s => now('x', M.fdtX(s.c), M.g, M.dg) },
  fdtD: { text: 'g′(x) = 4x²(x − 3)/9. The factor x² never changes sign, so g′ touches zero at 0 and stays negative; the factor (x − 3) flips the sign at 3.', facts: s => [['x', f2(M.fdtX(s.c))], ['g′(x)', at(M.dg, M.fdtX(s.c))]] },
  shelf: { text: 'At x = 0 the tangent is horizontal, but g′ is negative on both sides: g keeps falling through a flat step. A critical point, not an extremum.', facts: () => [['g′(−1)', g(M.dg(-1))], ['g′(0)', '0'], ['g′(1)', g(M.dg(1))]] },
  fdtMin: { text: 'At x = 3, g′ changes from negative to positive: g stops falling and starts rising. A relative minimum, g(3) = −3.', facts: () => [['g′(2)', g(M.dg(2))], ['g′(3)', '0'], ['g′(4)', g(M.dg(4))], ['g(3)', g(M.g(3))]] },
  fdtNow: { text: 'The tangent to g and the dot on g′ share an x.', facts: s => now('x', M.fdtX(s.c), M.g, M.dg) },
  candH: { text: 'h(x) = x − 2 sin x on [0, π]: it dips, then climbs. Continuous on a closed interval, so its absolute extremes exist.', facts: s => now('x', M.candX(s.c), M.h, M.dh) },
  candidates: { text: 'The three candidates: the endpoints 0 and π, and the critical point π/3 where h′ = 0. Compare the heights; the largest and smallest win.', facts: () => [['h(0)', f2(M.h(0), 3)], ['h(π/3)', f2(hmin, 3)], ['h(π)', f2(M.h(Math.PI), 3)]] },
  candNow: { text: 'The tangent is flat only at π/3. At the right endpoint it is still climbing steeply, yet that is where the maximum is.', facts: s => now('x', M.candX(s.c), M.h, M.dh) },
  concF: { text: 'Red where f is concave down (f″ < 0), blue where it is concave up (f″ > 0).', facts: s => { const x = M.concX(s.c); return [['x', f2(x)], ['f″(x)', at(M.d2f, x)], ['concave', M.d2f(x) > 0 ? 'up' : 'down']]; } },
  inflect: { text: `At (${M.INFL[0]}, ${M.INFL[1]}) f″ changes sign, so the concavity flips. It is also where f′ is smallest: f falls fastest here.`, facts: () => [['f″(2)', `${M.d2f(2)}`], ['f′(2)', `${M.df(2)}`]] },
  concD: { text: 'f″(x) = 6x − 12: negative left of 2, positive right of it.', facts: s => [['x', f2(M.concX(s.c))], ['f″(x)', at(M.d2f, M.concX(s.c))]] },
  concNow: { text: 'The shaded gap lies between the curve and its tangent. Concave up, the curve is above the tangent (blue); concave down, below it (red).', facts: s => { const x = M.concX(s.c); return [['x', f2(x)], ['f″(x)', at(M.d2f, x)], ['curve is', M.d2f(x) > 0 ? 'above its tangent' : 'below its tangent']]; } },
  sdtF: { text: 'f has critical points at 1 and 3, where f′ = 0. The second derivative test decides each one from the bend alone.', facts: () => [['f″(1)', `${M.d2f(1)}`], ['f″(3)', `${M.d2f(3)}`]] },
  sdtCrit: { text: 'At x = 1, f″ < 0: a cap, so a relative maximum. At x = 3, f″ > 0: a cup, a relative minimum.', facts: () => [['f(1)', `${M.f(1)} (max)`], ['f(3)', `${M.f(3)} (min)`]] },
  sdtNow: { text: 'The red parabola has the same height, slope and second derivative as f at the dot: q(x) = f(a) + f′(a)(x − a) + ½f″(a)(x − a)². Its opening is the sign of f″.', facts: s => { const x = M.sdtX(s.c); return [['a', f2(x)], ['f′(a)', at(M.df, x)], ['f″(a)', at(M.d2f, x)], ['opens', M.d2f(x) > 0 ? 'up' : 'down']]; } },
  readD: { text: 'The graph of p′(x) = x(x − 3)²/4. Below the axis p falls; above it p rises. Where it climbs, p is concave up; where it drops, concave down.', facts: s => [['x', f2(M.readX(s.c))], ['p′(x)', at(M.dp, M.readX(s.c))]] },
  readF: { text: 'p is drawn from left to right, always moving with the slope that p′ gives and starting from p(0) = 1. Every turn and bend is p′’s doing.', facts: s => now('x', M.readX(s.c), M.p, M.dp) },
  readKey: { text: 'x = 0: p′ crosses from − to +, a relative minimum of p. x = 1: p′ peaks, so p switches from concave up to down. x = 3: p′ dips to zero and turns up, so p has a flat inflection point, not an extreme.', facts: () => [['p′(0)', '0'], ['p′(1)', f2(M.dp(1))], ['p′(3)', '0'], ['p″(1), p″(3)', '0, 0']] },
  readNow: { text: 'The dot on p′ and the tangent to p share an x: the height of one is the slope of the other.', facts: s => now('x', M.readX(s.c), M.p, M.dp) },
  river: { text: 'The river bounds one side, so only three sides take fence.', facts: () => [['fence', `${M.FENCE} m`]] },
  field: { text: `Two sides of x and one of ${M.FENCE} − 2x. The area x(${M.FENCE} − 2x) is zero at both extremes of x and largest in between.`, facts: s => { const x = M.fenceX(s.c); return [['x', `${f2(x, 1)} m`], ['other side', `${f2(M.FENCE - 2 * x, 1)} m`], ['area', `${f2(M.area(x), 0)} m²`]]; } },
  fence: { text: `However the ${M.FENCE} m is split, 2x + (${M.FENCE} − 2x) = ${M.FENCE}. That constraint turns two unknowns into one.`, facts: s => { const x = M.fenceX(s.c); return [['sides', `2 × ${f2(x, 1)} m`], ['front', `${f2(M.FENCE - 2 * x, 1)} m`]]; } },
  areaGraph: { text: `A(x) = ${M.FENCE}x − 2x² is a downward parabola. Its tangent is flat at x = ${M.FX}, the top: ${M.FAREA} m².`, facts: s => { const x = M.fenceX(s.c); return [['x', `${f2(x, 1)} m`], ['A(x)', `${f2(M.area(x), 0)} m²`], ["A′(x)", `${f2(M.darea(x), 1)} m²/m`]]; } },
  sheet: { text: `The ${M.SHEET} cm sheet with a red square of side x cut from each corner. What is left folds up: x becomes the height, ${M.SHEET} − 2x the base.`, facts: s => [['x', `${f2(M.boxX(s.c), 2)} cm`]] },
  box: { text: 'The box: base (30 − 2x) by (30 − 2x), height x. A shallow box has a big base and little height; a deep one the reverse.', facts: s => { const x = M.boxX(s.c); return [['x', `${f2(x)} cm`], ['base', `${f2(M.SHEET - 2 * x)} cm`], ['volume', `${f2(M.vol(x), 0)} cm³`]]; } },
  volGraph: { text: `V(x) = x(30 − 2x)². Its tangent is flat at x = ${M.BX} (the maximum, ${M.BVOL} cm³) and again at x = 15, where the box has no base.`, facts: s => { const x = M.boxX(s.c); return [['x', `${f2(x)} cm`], ['V(x)', `${f2(M.vol(x), 0)} cm³`], ['V′(x)', `${f2(M.dvol(x), 1)} cm³/cm`]]; } },
  implC: { text: 'x² − xy + y² = 3, a tilted ellipse. No single y = f(x) draws it, but implicit differentiation gives its slope at every point.', facts: s => { const [x, y] = M.ICURVE(M.implTh(s.c)); return [['point', `(${f2(x)}, ${f2(y)})`], ['x² − xy + y²', f2(M.F(x, y))]]; } },
  implH: { text: 'Horizontal tangents where dy/dx = 0: y − 2x = 0. The line y = 2x meets the curve at (1, 2), the highest point, and (−1, −2), the lowest.', facts: () => [['at (1, 2)', 'dy/dx = 0'], ['d²y/dx²', '−2/3: a max']] },
  implV: { text: 'Vertical tangents where the denominator 2y − x = 0 (and the numerator isn’t): the line x = 2y meets the curve at (2, 1) and (−2, −1), the rightmost and leftmost points.', facts: () => [['at (2, 1)', 'dy/dx undefined'], ['numerator y − 2x', `${M.VR[1] - 2 * M.VR[0]}`]] },
  implNow: { text: 'A point travels round the curve with its tangent. The slope (y − 2x)/(2y − x) is 0 at the top and bottom, and blows up at the sides.', facts: s => { const [x, y] = M.ICURVE(M.implTh(s.c)), d = 2 * y - x; return [['point', `(${f2(x)}, ${f2(y)})`], ['dy/dx', Math.abs(d) < 0.02 ? 'vertical' : f2(M.slope(x, y))]]; } },
};
