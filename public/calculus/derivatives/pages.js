// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const t = (x, n = 2) => (x < -1e-9 ? '-' : '') + Math.abs(x).toFixed(n);          // the same, for inside tex
const fr = x => { const [p, q] = M.fraction(x); return q === 1 ? `${p}` : `${p < 0 ? '-' : ''}\\tfrac{${Math.abs(p)}}{${q}}`; };
const num = x => +x.toFixed(4);                                                   // 2.5, 0.1: no trailing zeros
const { a: SA } = M.SEC, PA = M.PAIR.at, C = M.COOL;

export const PAGES = [
  {
    kicker: 'Chapter 2', title: 'Derivatives', sub: 'the slope at a point',
    body: `
      <p class="lede">A derivative measures how fast a function is changing at a single input: the slope of its graph at one point.</p>
      <p>The upper graph is <i>f</i>(<i>x</i>) = <i>x</i>³/3 − <i>x</i>. The red line touches it with the same steepness as the curve: the <b>tangent line</b>. The lower graph plots the tangent’s slope at every <i>x</i>. That is a new function, the <b>derivative</b>, <i>f</i> ′(<i>x</i>) = <i>x</i>² − 1.</p>
      <p>Where <i>f</i> rises, <i>f</i> ′ is positive. Where <i>f</i> falls, <i>f</i> ′ is negative. At the peak and the valley, <i>x</i> = ±1, the tangent is flat and <i>f</i> ′ = 0.</p>
      <p>This chapter defines the derivative as a limit, estimates it from data, finds where it fails to exist, and builds the rules that find it without a limit.</p>`,
    cam: { target: [ST.pair + 0.3, -2.4, 0], az: 20, el: 9, dist: 32 }, lit: 'ftangent', look: {}, scene: 'pair',
    fig: 'A function and its derivative',
  },
  {
    kicker: '2.1', title: 'Rates of change', sub: 'from secant to tangent',
    body: `
      <p class="lede">A cart is at <i>s</i>(<i>t</i>) = <i>t</i>² metres after <i>t</i> seconds. How fast is it going at <i>t</i> = ${SA} s?</p>
      <p>The <b>average rate of change</b> over [${SA}, ${SA} + <i>h</i>] is the slope of the <b>secant line</b> through <i>P</i> and <i>Q</i>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\frac{s(${SA}+h) - s(${SA})}{h} &= \frac{(${SA}+h)^2 - ${M.s(SA)}}{h} \\ &= ${M.ds(SA)} + h\end{aligned}`)}</div>
      <table class="data">
        <tr><th><i>h</i> (s)</th>${M.SEC.hs.map(h => `<td>${num(h)}</td>`).join('')}</tr>
        <tr><th>average velocity (m/s)</th>${M.SEC.hs.map(h => `<td>${num(M.secSlope(h))}</td>`).join('')}</tr>
      </table>
      <p>As <i>h</i> → 0, <i>Q</i> slides into <i>P</i>, the secant turns into the tangent, and the averages close in on ${M.ds(SA)}. The <b>instantaneous rate of change</b> at <i>t</i> = ${SA} is ${M.ds(SA)} m/s, the slope of the tangent at <i>P</i>.</p>
      <p>A rate’s units are output units per input unit: metres per second here.</p>`,
    cam: { target: [ST.sec + 1, 2.25, 0], az: -10, el: 4, dist: 19.5 }, lit: 'secant', look: {}, scene: 'sec',
    fig: 'The secant becomes the tangent',
  },
  {
    kicker: '2.2', title: 'The derivative', sub: 'a limit of difference quotients',
    body: `
      <p class="lede">The derivative of <i>f</i> at <i>x</i> = <i>a</i> is the limit of the secant slopes, if that limit exists:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}f'(a) &= \lim_{h\to0}\frac{f(a+h) - f(a)}{h} \\ &= \lim_{x\to a}\frac{f(x) - f(a)}{x - a}\end{aligned}`)}</div>
      <p>The two forms are the same limit, with <i>x</i> = <i>a</i> + <i>h</i>. When it exists, <i>f</i> is <b>differentiable</b> at <i>a</i>.</p>
      <p>Let <i>a</i> vary and <i>f</i> ′ is a function. For <i>f</i>(<i>x</i>) = <i>x</i>³/3 − <i>x</i>, expand and cancel the <i>h</i>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}&\frac{f(x+h) - f(x)}{h} \\ &= x^2 + xh + \tfrac13h^2 - 1 \;\to\; x^2 - 1\end{aligned}`)}</div>
      <p><i>f</i> ′(<i>x</i>), <i>y</i> ′, <i>dy</i>/<i>dx</i> and (<i>d</i>/<i>dx</i>) <i>f</i>(<i>x</i>) all name it. At <i>x</i> = ${PA}, <i>f</i> ′(${PA}) = ${M.dg(PA)}, so the tangent line there is ${tex.inline(String.raw`y = ${fr(M.g(PA))} + ${M.dg(PA)}(x - ${PA})`)}.</p>`,
    cam: { target: [ST.pair, -2.4, 0], az: -8, el: 3, dist: 30 }, lit: 'fderiv', look: {}, scene: 'pair',
    fig: 'f′ plots the slope of f',
  },
  {
    kicker: '2.3', title: 'Estimating derivatives', sub: 'from a table of values',
    body: `
      <p class="lede">From a table, a derivative can only be estimated, by the slope of a secant across the nearest readings. A cup of coffee cools; to estimate <i>T</i> ′(${C.at}), use the readings either side of <i>t</i> = ${C.at}:</p>
      <table class="data">
        <tr><th><i>t</i> (min)</th>${M.TABLE.map(([x]) => `<td>${x}</td>`).join('')}</tr>
        <tr><th><i>T</i>(<i>t</i>) (°C)</th>${M.TABLE.map(([, y]) => `<td>${y.toFixed(1)}</td>`).join('')}</tr>
      </table>
      <div class="eq">${tex(String.raw`\begin{aligned}T'(${C.at}) &\approx \frac{T(${C.hi}) - T(${C.lo})}{${C.hi} - ${C.lo}} \\ &= \frac{${M.Tread(C.hi).toFixed(1)} - ${M.Tread(C.lo).toFixed(1)}}{${C.hi - C.lo}} \\ &= ${t(M.ESTIMATE)}\ {}^\circ\text{C/min}\end{aligned}`)}</div>
      <p>In context: at <i>t</i> = ${C.at} min the temperature is falling at about ${f(-M.ESTIMATE, 1)} °C per minute. Units: <i>T</i>’s over <i>t</i>’s.</p>
      <p>In blue, the <b>symmetric difference quotient</b> [<i>T</i>(7 + <i>h</i>) − <i>T</i>(7 − <i>h</i>)]/2<i>h</i> shrinks onto the true tangent, slope ${f(M.dT(C.at))}.</p>`,
    cam: { target: [ST.cool + 3, 3.1, 0], az: -6, el: 3, dist: 23 }, lit: 'chord', look: {}, scene: 'cool',
    fig: 'Estimating T′(7)',
  },
  {
    kicker: '2.4', title: 'Differentiability and continuity', sub: 'where the derivative fails',
    body: `
      <p class="lede">If <i>f</i> is differentiable at <i>a</i>, then <i>f</i> is continuous at <i>a</i>. The converse is false.</p>
      <p>A derivative needs the secant slopes from the left (blue) and the right (red) to approach the <b>same finite</b> number. At <i>x</i> = 0:</p>
      <table class="data">
        <tr><th></th><th>left</th><th>right</th></tr>
        <tr><td>corner, |<i>x</i>|</td><td>−1</td><td>1</td></tr>
        <tr><td>cusp, <i>x</i><sup>2/3</sup></td><td>−∞</td><td>+∞</td></tr>
        <tr><td>vertical tangent, <i>x</i><sup>1/3</sup></td><td>+∞</td><td>+∞</td></tr>
        <tr><td>jump</td><td>−∞</td><td>${f(M.rightSlope(M.FAILS[3].f, 1), 1)}</td></tr>
      </table>
      <p>The first three are continuous at 0 but not differentiable there; the jump is not even continuous.</p>
      <p><b>A join.</b> <i>g</i>(<i>x</i>) = <i>x</i>² for <i>x</i> ≤ ${M.PIECE.at}, 2<i>x</i> − 1 for <i>x</i> > ${M.PIECE.at}. Both pieces give ${M.PIECE.left(M.PIECE.at)} at <i>x</i> = ${M.PIECE.at}, so <i>g</i> is continuous; the slopes ${M.PIECE.dleft(M.PIECE.at)} and ${M.PIECE.dright(M.PIECE.at)} agree, so <i>g</i> ′(${M.PIECE.at}) = ${M.PIECE.dright(M.PIECE.at)}. Check continuity first: without it, matching slopes mean nothing.</p>`,
    cam: { target: [ST.diff, 0.35, 0], az: -5, el: 3, dist: 25 }, lit: 'corner', look: {}, scene: 'diff',
    fig: 'Left and right secants at x = 0',
  },
  {
    kicker: '2.5', title: 'The power rule', sub: 'bring the power down, lower it by one',
    body: `
      <p class="lede">For any real number <i>n</i>, ${tex.inline(String.raw`\dfrac{d}{dx}\,x^n = n\,x^{n-1}`)}.</p>
      <p><b>Why, for <i>n</i> = 3.</b> Grow a cube of side <i>x</i> by Δ<i>x</i>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}&\frac{(x+\Delta x)^3 - x^3}{\Delta x} \\ &= 3x^2 + 3x\,\Delta x + (\Delta x)^2 \;\to\; 3x^2\end{aligned}`)}</div>
      <p>The three red slabs are the 3<i>x</i>²Δ<i>x</i>; the blue rods and the black corner shrink away faster than Δ<i>x</i>. At <i>x</i> = ${M.CUBE.x} the volume grows at ${M.cubeSlope} cubic units per unit of side.</p>
      <p>Rewrite roots and reciprocals as powers first:</p>
      <table class="data">
        <tr><th><i>f</i>(<i>x</i>)</th><th>as a power</th><th><i>f</i> ′(<i>x</i>)</th></tr>
        <tr><td><i>x</i><sup>5</sup></td><td><i>x</i><sup>5</sup></td><td>5<i>x</i><sup>4</sup></td></tr>
        <tr><td>1/<i>x</i><sup>2</sup></td><td><i>x</i><sup>−2</sup></td><td>−2<i>x</i><sup>−3</sup> = −2/<i>x</i><sup>3</sup></td></tr>
        <tr><td>√<i>x</i></td><td><i>x</i><sup>1/2</sup></td><td>½<i>x</i><sup>−1/2</sup> = 1/(2√<i>x</i>)</td></tr>
      </table>
      <p>The exponent must be a constant: 2<sup><i>x</i></sup> is not a power function.</p>`,
    cam: { target: [ST.cube + 0.5, 0.5, 0.5], az: 36, el: 24, dist: 21 }, lit: 'slabs', look: {}, scene: 'cube',
    fig: '(x + Δx)³, taken apart',
  },
  {
    kicker: '2.6', title: 'Sums and constant multiples', sub: 'differentiate term by term',
    body: `
      <p class="lede">Derivatives pass through sums, differences and constant factors, and a constant alone has derivative 0:</p>
      <div class="eq">${tex(String.raw`\begin{gathered}(c)' = 0 \qquad (c\,f)' = c\,f' \\ (f \pm g)' = f' \pm g'\end{gathered}`)}</div>
      <p>In the figure, <i>u</i> = <i>x</i>²/2 (blue) has slope <i>x</i> and <i>v</i> = 3 − <i>x</i> (grey) has slope −1. At every <i>x</i> the slope of <i>u</i> + <i>v</i> (black) is their sum, <i>x</i> − 1. The constant 3 lifts <i>v</i> without tilting it.</p>
      <p><b>Example.</b> Term by term:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}f(x) &= 4x^3 - 5x^2 + 7x - 2 \\ f'(x) &= 12x^2 - 10x + 7\end{aligned}`)}</div>
      <p>so <i>f</i> ′(${M.POLY.at}) = ${M.dpoly(M.POLY.at)}. The −2 contributes nothing.</p>
      <p>Split first: (<i>x</i>² + 3)/<i>x</i> = <i>x</i> + 3<i>x</i><sup>−1</sup> has derivative 1 − 3/<i>x</i>².</p>`,
    cam: { target: [ST.sum + 1.25, 2.75, 0], az: -8, el: 3, dist: 25.5 }, lit: 'uv', look: {}, scene: 'sum',
    fig: 'Slopes add',
  },
  {
    kicker: '2.7', title: 'Sine, cosine, eˣ and ln x', sub: 'four derivatives to know',
    body: `
      <p class="lede">With <i>x</i> in radians:</p>
      <table class="data">
        <tr><th><i>f</i>(<i>x</i>)</th><td>sin <i>x</i></td><td>cos <i>x</i></td><td><i>e</i><sup><i>x</i></sup></td><td>ln <i>x</i></td></tr>
        <tr><th><i>f</i> ′(<i>x</i>)</th><td>cos <i>x</i></td><td>−sin <i>x</i></td><td><i>e</i><sup><i>x</i></sup></td><td>1/<i>x</i></td></tr>
      </table>
      <p><b>Top.</b> The blue point plots the slope of sin <i>x</i>, and traces cos <i>x</i>: 1 at <i>x</i> = 0, 0 at the peaks, −1 at ±π.</p>
      <p><b>Bottom.</b> <i>e</i><sup><i>x</i></sup> is its own derivative: its slope equals its height (dashed). ln <i>x</i> is its mirror image in <i>y</i> = <i>x</i>, so the slopes are reciprocals: <i>e</i><sup><i>a</i></sup> at (<i>a</i>, <i>e</i><sup><i>a</i></sup>), 1/<i>e</i><sup><i>a</i></sup> at (<i>e</i><sup><i>a</i></sup>, <i>a</i>).</p>
      <p><b>Example.</b> With the rules of 2.6:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}&\tfrac{d}{dx}\big(3\sin x - 2e^x + 5\ln x\big) \\ &= 3\cos x - 2e^x + \tfrac5x\end{aligned}`)}</div>
      <p>At <i>x</i> = ${M.MIX.at}: 3 cos 1 − 2<i>e</i> + 5 = ${f(M.MIX.df(M.MIX.at), 3)}.</p>`,
    cam: { target: [ST.trig + 0.4, -0.75, 0], az: -6, el: 3, dist: 34 }, lit: 'cos', look: {}, scene: 'trig',
    fig: 'Slopes of sin x, eˣ and ln x',
  },
  {
    kicker: '2.8', title: 'The product rule', sub: 'not the product of the derivatives',
    body: `
      <div class="eq">${tex(String.raw`(f g)' = f'g + f g'`)}</div>
      <p class="lede">Think of <i>f</i>·<i>g</i> as the area of a rectangle with sides <i>f</i> and <i>g</i>.</p>
      <p>Nudge <i>x</i> by Δ<i>x</i>. The area gains a red strip <i>f</i>·Δ<i>g</i>, a blue strip <i>g</i>·Δ<i>f</i>, and a black corner Δ<i>f</i>·Δ<i>g</i>. Divide by Δ<i>x</i> and let it go to 0: the strips give <i>f g</i> ′ + <i>g f</i> ′, and the corner vanishes.</p>
      <p><b>From a table.</b> <i>f</i>(2) = ${M.PROD.f}, <i>f</i> ′(2) = ${M.PROD.df}, <i>g</i>(2) = ${M.PROD.g}, <i>g</i> ′(2) = ${M.PROD.dg}. For <i>h</i> = <i>f g</i>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}h'(2) &= f'(2)g(2) + f(2)g'(2) \\ &= ${M.PROD.df}\cdot${M.PROD.g} + ${M.PROD.f}\cdot${M.PROD.dg} = ${M.PROD_RATE}\end{aligned}`)}</div>
      <p>not <i>f</i> ′(2)<i>g</i> ′(2) = ${M.PROD.df * M.PROD.dg}. That is the figure: sides ${M.PROD.f} and ${M.PROD.g}, growing at ${M.PROD.df} and ${M.PROD.dg} per unit of <i>x</i>.</p>
      <p><b>From formulas.</b> (<i>x</i>²<i>e</i><sup><i>x</i></sup>)′ = 2<i>x</i> <i>e</i><sup><i>x</i></sup> + <i>x</i>²<i>e</i><sup><i>x</i></sup> = <i>x e</i><sup><i>x</i></sup>(<i>x</i> + 2).</p>`,
    cam: { target: [ST.prod + 2, 1.2, 0], az: -16, el: 24, dist: 16.5 }, lit: 'stripG', look: {}, scene: 'prod',
    fig: 'The area f·g, growing',
  },
  {
    kicker: '2.9', title: 'The quotient rule', sub: 'low d-high minus high d-low',
    body: `
      <div class="eq">${tex(String.raw`\left(\frac{f}{g}\right)' = \frac{f'g - f g'}{g^2}, \quad g \ne 0`)}</div>
      <p class="lede">Order matters: swapping the two terms on top flips the sign.</p>
      <p><b>Example.</b> <i>q</i>(<i>x</i>) = (3<i>x</i> + 1)/(<i>x</i>² + 1): <i>f</i> = 3<i>x</i> + 1, <i>f</i> ′ = 3, <i>g</i> = <i>x</i>² + 1, <i>g</i> ′ = 2<i>x</i>.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}q'(x) &= \frac{3(x^2+1) - (3x+1)(2x)}{(x^2+1)^2} \\ &= \frac{-3x^2 - 2x + 3}{(x^2+1)^2}\end{aligned}`)}</div>
      <p>At <i>x</i> = ${M.QUOT.at}: <i>q</i> ′(1) = (3·2 − 4·2)/2² = ${tex.inline(fr(M.dq(M.QUOT.at)))}. Dividing the derivatives, 3/(2·1) = 3/2, is wrong, even in sign.</p>
      <p>The blue curve is <i>q</i> ′. It crosses zero where the tangent is flat: at the top (<i>x</i> = ${f(M.QPEAK, 3)}) and the bottom (<i>x</i> = ${f(M.QLOW, 3)}).</p>`,
    cam: { target: [ST.quot, 1, 0], az: -6, el: 3, dist: 24 }, lit: 'dquot', look: {}, scene: 'quot',
    fig: 'q and its slope q′',
  },
  {
    kicker: '2.10', title: 'Tangent, cotangent, secant, cosecant', sub: 'from sine, cosine and the quotient rule',
    body: `
      <p class="lede">Write each as a quotient of sine and cosine and use 2.9. For tan <i>x</i> = sin <i>x</i>/cos <i>x</i>, the top is cos <i>x</i> · cos <i>x</i> − sin <i>x</i> · (−sin <i>x</i>):</p>
      <div class="eq">${tex(String.raw`\begin{aligned}(\tan x)' &= \frac{\cos^2 x + \sin^2 x}{\cos^2 x} \\ &= \frac{1}{\cos^2 x} = \sec^2 x\end{aligned}`)}</div>
      <table class="data">
        <tr><th><i>f</i>(<i>x</i>)</th><td>tan <i>x</i></td><td>cot <i>x</i></td><td>sec <i>x</i></td><td>csc <i>x</i></td></tr>
        <tr><th><i>f</i> ′(<i>x</i>)</th><td>sec² <i>x</i></td><td>−csc² <i>x</i></td><td>sec <i>x</i> tan <i>x</i></td><td>−csc <i>x</i> cot <i>x</i></td></tr>
      </table>
      <p>The “co-” functions take a minus sign.</p>
      <p>In the figure, tan <i>x</i> climbs between its asymptotes at ±π/2 and is never flat: its slope sec² <i>x</i> (blue) is never below 1, and is 1 only at <i>x</i> = 0. At <i>x</i> = π/4 the slope is sec²(π/4) = ${f(M.sec2(Math.PI / 4), 0)}.</p>
      <p><b>Example.</b> At <i>x</i> = π/3, (sec <i>x</i>)′ = sec(π/3) tan(π/3) = 2√3 ≈ ${f(Math.tan(Math.PI / 3) / Math.cos(Math.PI / 3), 3)}.</p>`,
    cam: { target: [ST.tan, 0.75, 0], az: -6, el: 3, dist: 25.5 }, lit: 'sec2', look: {}, scene: 'tan',
    fig: 'tan x and its slope sec² x',
  },
];

// ---------- click a thing: what it is, with its live numbers ----------
const F = (x, n = 3) => f(x, n);
const failFacts = k => s => {
  const h = M.diffH(s.c), fn = M.FAILS.find(x => x.key === k).f;
  return [['h', F(h)], ['left secant slope', F(M.leftSlope(fn, h), 2)], ['right secant slope', F(M.rightSlope(fn, h), 2)]];
};
export const PLATES = {
  fcurve: { text: 'f(x) = x³/3 − x rises, turns at x = −1, falls, turns at x = 1, and rises again.', facts: s => { const x = M.pairX(s.c); return [['x', F(x)], ['f(x)', F(M.g(x))]]; } },
  ftangent: { text: 'The tangent line touches the curve at one point and has the curve’s slope there. Its slope is the derivative at that x.', facts: s => { const x = M.pairX(s.c); return [['x', F(x)], ['slope f′(x) = x² − 1', F(M.dg(x))], ['so f is', Math.abs(M.dg(x)) < 0.02 ? 'turning' : M.dg(x) > 0 ? 'increasing' : 'decreasing']]; } },
  fderiv: { text: 'The derivative as a function: its height at each x is the slope of f at that x. It is zero at x = ±1, where f turns, and negative in between, where f falls.', facts: s => { const x = M.pairX(s.c); return [['x', F(x)], ['f′(x)', F(M.dg(x))]]; } },
  sgraph: { text: 'The cart’s position, s(t) = t² metres. Steeper means faster. P marks t = 1 s.', facts: () => [['P', '(1, 1)'], ['s′(t)', '2t'], ['s′(1)', '2 m/s']] },
  secant: { text: 'The secant joins P to Q, h seconds later. Its slope is the average velocity over that interval, 2 + h. As h shrinks it pivots onto the tangent.', facts: s => { const h = M.secH(s.c); return [['h', `${F(h)} s`], ['Δs', `${F(M.s(1 + h) - M.s(1))} m`], ['slope Δs/h', `${F(M.secSlope(h))} m/s`]]; } },
  stangent: { text: 'The tangent at P: the limit of the secants. Its slope, 2 m/s, is the cart’s velocity at the instant t = 1 s.', facts: () => [['slope', '2.000 m/s'], ['line', 's = 1 + 2(t − 1)']] },
  formula: { text: 'The table came from T = 22 + 68e^(−t/10), Newton cooling toward a 22 °C room. With only the table, this curve is unknown.', facts: () => [['T′(7) exactly', `${F(M.dT(M.COOL.at))} °C/min`]] },
  data: { text: 'The five readings. Between them nothing is measured, so slopes can only be estimated.', facts: () => M.TABLE.map(([x, y]) => [`T(${x})`, `${y.toFixed(1)} °C`]) },
  chord: { text: 'The secant across the readings at t = 5 and t = 9, the nearest either side of 7. Its slope is the estimate of T′(7).', facts: () => [['slope', `(${M.Tread(9).toFixed(1)} − ${M.Tread(5).toFixed(1)})/4`], ['T′(7) ≈', `${f(M.ESTIMATE)} °C/min`]] },
  symm: { text: 'A secant centred on t = 7, from 7 − h to 7 + h. At h = 2 it is the table’s secant; as h shrinks it becomes the tangent.', facts: s => { const h = M.coolH(s.c); return [['h', `${F(h)} min`], ['[T(7+h) − T(7−h)]/2h', `${F(M.symDiff(M.T, M.COOL.at, h))} °C/min`], ['T′(7)', `${F(M.dT(M.COOL.at))} °C/min`]]; } },
  corner: { text: 'y = |x|. Continuous, but the slope is −1 on the left and 1 on the right. The secants never agree, so there is no derivative at 0.', facts: failFacts('corner') },
  cusp: { text: 'y = x^(2/3). Continuous; the two sides come in vertically from opposite directions, slopes → −∞ and +∞.', facts: failFacts('cusp') },
  vert: { text: 'y = x^(1/3). Continuous; both secants become vertical. The tangent exists but its slope is infinite, so f′(0) does not.', facts: failFacts('vert') },
  jump: { text: 'A jump: f(0) = 0, but just left of 0 the graph is near 1. Not continuous, so not differentiable; the left secants grow without bound.', facts: failFacts('jump') },
  cube: { text: 'A cube of side x = 2: volume x³ = 8.', facts: () => [['x', '2'], ['x³', '8']] },
  slabs: { text: 'Three slabs, each x by x by Δx: together 3x²Δx, the part of the new volume that is proportional to Δx. Divide by Δx: 3x².', facts: s => { const dx = M.cubeDx(s.c); return [['Δx', F(dx)], ['3x²Δx', F(3 * 4 * dx)], ['ΔV/Δx', F(M.cubeRate(dx))], ['3x²', `${M.cubeSlope}`]]; } },
  rods: { text: 'Three rods, each x by Δx by Δx. Divided by Δx they still carry a Δx, so they vanish in the limit.', facts: s => { const dx = M.cubeDx(s.c); return [['3x(Δx)²', F(3 * 2 * dx * dx, 4)], ['÷ Δx', F(6 * dx, 4)]]; } },
  corner3: { text: 'The corner cube, Δx on every side: (Δx)³. Divided by Δx it is (Δx)², gone in the limit.', facts: s => { const dx = M.cubeDx(s.c); return [['(Δx)³', F(dx ** 3, 4)]]; } },
  u: { text: 'u(x) = x²/2: slope x.', facts: s => { const x = M.sumX(s.c); return [['x', F(x)], ['u′(x)', F(M.du(x))]]; } },
  v: { text: 'v(x) = 3 − x: a line of slope −1 everywhere. The 3 sets its height, not its slope.', facts: () => [['v′(x)', '−1']] },
  uv: { text: 'u + v = x²/2 − x + 3. At each x its tangent’s slope is the sum of the other two slopes.', facts: s => { const x = M.sumX(s.c); return [['u′', F(M.du(x))], ['v′', F(M.dv(x))], ['(u + v)′', F(M.du(x) + M.dv(x))]]; } },
  sin: { text: 'The tangent to y = sin x. Its slope is cos x.', facts: s => { const x = M.sinX(s.c); return [['x', F(x)], ['sin x', F(Math.sin(x))], ['slope', F(Math.cos(x))]]; } },
  cos: { text: 'The blue point’s height is the slope of sin x at the same x. Its path is y = cos x.', facts: s => { const x = M.sinX(s.c); return [['x', F(x)], ['cos x', F(Math.cos(x))]]; } },
  exp: { text: 'y = eˣ: the slope at every point equals the height. The grey upright is the height; the red tangent has that slope.', facts: s => { const a = M.expA(s.c); return [['x', F(a)], ['eˣ', F(Math.exp(a))], ['slope', F(Math.exp(a))]]; } },
  ln: { text: 'y = ln x reflects y = eˣ across y = x, which turns each slope m into 1/m. So the slope of ln x at x is 1/x.', facts: s => { const a = M.expA(s.c), x = Math.exp(a); return [['x', F(x)], ['ln x', F(a)], ['slope 1/x', F(1 / x)]]; } },
  area: { text: `A rectangle with sides f(2) = ${M.PROD.f} and g(2) = ${M.PROD.g}: its area is the product f·g = ${M.PROD.f * M.PROD.g}.`, facts: () => [['f·g', `${M.PROD.f * M.PROD.g}`]] },
  stripG: { text: 'f stays, g grows by Δg = g′Δx: a strip f·Δg. Per Δx: f·g′.', facts: s => { const dx = M.prodDx(s.c); return [['Δx', F(dx)], ['f·Δg', F(M.PROD.f * M.PROD.dg * dx)], ['f·g′', `${M.PROD.f * M.PROD.dg}`]]; } },
  stripF: { text: 'g stays, f grows by Δf = f′Δx: a strip g·Δf. Per Δx: g·f′.', facts: s => { const dx = M.prodDx(s.c); return [['Δx', F(dx)], ['g·Δf', F(M.PROD.g * M.PROD.df * dx)], ['g·f′', `${M.PROD.g * M.PROD.df}`]]; } },
  cornerFG: { text: 'The corner Δf·Δg = f′g′(Δx)². Divided by Δx it still carries a Δx, so it vanishes in the limit.', facts: s => { const dx = M.prodDx(s.c); return [['Δf·Δg', F(M.PROD.df * M.PROD.dg * dx * dx, 4)], ['ΔA/Δx', F(M.prodRate(dx))], ['limit', `${M.PROD_RATE}`]]; } },
  quot: { text: 'q = (3x + 1)/(x² + 1), with its tangent.', facts: s => { const x = M.quotX(s.c); return [['x', F(x)], ['q(x)', F(M.q(x))], ['q′(x)', F(M.dq(x))]]; } },
  dquot: { text: 'q′ by the quotient rule. Positive where q rises, zero at its top and bottom, negative where it falls.', facts: s => { const x = M.quotX(s.c); return [['x', F(x)], ['q′(x)', F(M.dq(x))]]; } },
  tan: { text: 'y = tan x = sin x / cos x, undefined where cos x = 0. Always increasing between asymptotes.', facts: s => { const x = M.tanX(s.c); return [['x', F(x)], ['tan x', F(Math.tan(x))], ['slope', F(M.sec2(x))]]; } },
  sec2: { text: 'sec² x = 1/cos² x, the slope of tan x. Never below 1.', facts: s => { const x = M.tanX(s.c); return [['x', F(x)], ['sec² x', F(M.sec2(x))]]; } },
};
