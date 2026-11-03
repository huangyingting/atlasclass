// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -0.5 * 10 ** -n ? '−' : '') + Math.abs(x).toFixed(n);
const t = s => tex(s), ti = s => tex.inline(s);
const G = M.GEAR;
// worked numbers
const U0 = M.g(M.X0), GP0 = M.gp(M.X0), FP0 = M.fp(U0), HP0 = M.hp(M.X0);
const CS0 = M.circSlope(...M.P0), CY0 = M.circY2(...M.P0);
const FS0 = M.folSlope(...M.FOL_P);
const DINV = 1 / M.invp(M.IA);
const S06 = M.asinp(M.TX), T06 = M.atanp(M.TX);
const QP2 = M.qp(M.SX);
const sd = n => M.sd(n, M.HX);

export const PAGES = [
  {
    kicker: 'Chapter 3', title: 'Composite, implicit and inverse functions', sub: 'the chain rule and its kin',
    body: `
      <p class="lede">Most functions are built by feeding one function into another. Their derivatives come from one rule: rates of change multiply along the chain.</p>
      <p>Turn the big gear once and the small gear on the middle shaft turns ${M.DU_DX} times; that shaft turns the last gear ${M.DY_DU} times for each of its turns. So the last gear turns ${M.DU_DX} × ${M.DY_DU} = ${M.DY_DX} times as fast as the first.</p>
      <p>That is the <b>chain rule</b>. The rest of the chapter uses it to differentiate curves that aren’t functions at all (<b>implicit differentiation</b>), to find the slope of an <b>inverse</b> without a formula for it, and to take derivatives of derivatives.</p>`,
    cam: { target: [ST.gears - 0.95, -0.35, 0], az: 24, el: 16, dist: 19 }, lit: 'gearX', look: {}, scene: 'gears',
    fig: 'A gear train: rates multiply',
  },
  {
    kicker: '3.1', title: 'The chain rule', sub: 'rates multiply',
    body: `
      <p class="lede">If <i>y</i> depends on <i>u</i> and <i>u</i> depends on <i>x</i>, then <i>y</i> changes with <i>x</i> at the product of the two rates.</p>
      <p>Count teeth. The <i>x</i> gear’s ${G.Nx} teeth push ${G.Nx} teeth of the ${G.Nu}-tooth pinion, so <i>du</i>/<i>dx</i> = ${G.Nx}/${G.Nu} = ${M.DU_DX}. The <i>u</i> shaft’s ${G.Nu2}-tooth gear drives the ${G.Ny}-tooth <i>y</i> gear: <i>dy</i>/<i>du</i> = ${M.DY_DU}.</p>
      <div class="eq">${t(String.raw`\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx} = ${M.DY_DU}\cdot ${M.DU_DX} = ${M.DY_DX}`)}</div>
      <p>In function notation, for <i>y</i> = <i>f</i>(<i>g</i>(<i>x</i>)):</p>
      <div class="eq">${t(String.raw`\frac{d}{dx}\,f\big(g(x)\big) = f'\big(g(x)\big)\cdot g'(x)`)}</div>
      <p>The derivative of the outside, <b>evaluated at the inside</b>, times the derivative of the inside. For example ${ti(String.raw`\frac{d}{dx}(x^2+1)^{5} = 5(x^2+1)^4\cdot 2x`)}.</p>
      <p>Gears turn at constant rates; most chains don’t. The rule still holds at each instant, with each rate taken where the chain is at that moment.</p>`,
    cam: { target: [ST.gears - 0.95, -0.4, 0], az: -8, el: 6, dist: 20 }, lit: 'gearU', look: {}, scene: 'gears',
    fig: 'du/dx = 3, dy/du = 2, dy/dx = 6',
  },
  {
    kicker: '3.2', title: 'The chain rule on a graph', sub: 'one slope from two',
    body: `
      <p class="lede">For <i>h</i>(<i>x</i>) = sin(<i>x</i>²) the inside is <i>u</i> = <i>x</i>², the outside is sin <i>u</i>. The red point moves along all three graphs at once.</p>
      <div class="eq">${t(String.raw`h'(x) = \cos(x^2)\cdot 2x`)}</div>
      <p>At <i>x</i> = ${M.X0}:</p>
      <table class="data">
        <tr><td>inside, <i>u</i> = ${M.X0}² = ${U0}</td><td><i>g</i>′(${M.X0}) = 2(${M.X0}) = ${f(GP0)}</td></tr>
        <tr><td>outside, at <i>u</i> = ${U0}</td><td><i>f</i>′(${U0}) = cos ${U0} = ${f(FP0, 3)}</td></tr>
        <tr><td>composite</td><td><i>h</i>′(${M.X0}) = ${f(FP0, 3)} × ${f(GP0)} = ${f(HP0, 3)}</td></tr>
      </table>
      <p>Two mistakes to avoid: <i>f</i>′ must be taken at <i>g</i>(<i>x</i>), not at <i>x</i>; and forgetting the factor 2<i>x</i> gives cos(<i>x</i>²), the slope of the middle graph, not the right one.</p>
      <p>Where <i>x</i>² = π/2 the middle graph is flat, so the right one is too: <i>h</i> peaks at <i>x</i> = √(π/2) = ${f(Math.sqrt(Math.PI / 2), 3)}.</p>`,
    cam: { target: [ST.chain + 0.1, 0.25, 0], az: 0, el: 3, dist: 36 }, lit: 'comp', look: {}, scene: 'chain',
    fig: 'u = x², y = sin u, y = sin(x²)',
  },
  {
    kicker: '3.3', title: 'Implicit differentiation', sub: 'a slope without solving for y',
    body: `
      <p class="lede">The circle <i>x</i>² + <i>y</i>² = ${M.R * M.R} is not the graph of one function, but it has a tangent at every point. Differentiate both sides with respect to <i>x</i>, treating <i>y</i> as a function of <i>x</i>.</p>
      <div class="eq">${t(String.raw`2x + 2y\,\frac{dy}{dx} = 0 \quad\Rightarrow\quad \frac{dy}{dx} = -\frac{x}{y}`)}</div>
      <p>The term <i>y</i>² differentiates to 2<i>y</i> · <i>dy</i>/<i>dx</i>: the chain rule, with <i>y</i> as the inside function. Then solve for <i>dy</i>/<i>dx</i>.</p>
      <p>At (${M.P0[0]}, ${M.P0[1]}) the slope is −${M.P0[0]}/${M.P0[1]} = ${f(CS0)}, and the tangent line is</p>
      <div class="eq">${t(String.raw`y - ${M.P0[1]} = -\tfrac{${M.P0[0]}}{${M.P0[1]}}\,(x - ${M.P0[0]})`)}</div>
      <p>The radius to that point has slope ${M.P0[1]}/${M.P0[0]}: the tangent is perpendicular to it, as geometry says it must be. Where <i>y</i> = 0, at (±${M.R}, 0), the formula divides by zero: the tangents there are vertical.</p>`,
    cam: { target: [ST.circle, 0, 0], az: 0, el: 4, dist: 32 }, lit: 'circPt', look: {}, scene: 'circle',
    fig: 'x² + y² = 25',
  },
  {
    kicker: '3.4', title: 'A curve no formula can solve', sub: 'the folium of Descartes',
    body: `
      <p class="lede">The curve <i>x</i>³ + <i>y</i>³ = ${M.FOL.k}<i>xy</i> loops back on itself. Solving for <i>y</i> is hopeless; differentiating implicitly is routine.</p>
      <div class="eq">${t(String.raw`3x^2 + 3y^2\,y' = 6y + 6x\,y'`)}</div>
      <p>The product rule on 6<i>xy</i> gives two terms. Collect the <i>y</i>′ terms on one side and factor:</p>
      <div class="eq">${t(String.raw`y' = \frac{2y - x^2}{y^2 - 2x}`)}</div>
      <p>At (${M.FOL_P[0]}, ${M.FOL_P[1]}), on the curve since 27 + 27 = 54: <i>y</i>′ = (6 − 9)/(9 − 6) = ${f(FS0, 0)}, so the tangent is <i>y</i> = −<i>x</i> + 6.</p>
      <p>The tangent is <b>horizontal</b> where the top is zero and the bottom isn’t: 2<i>y</i> = <i>x</i>², at (${f(M.FOL_H[0])}, ${f(M.FOL_H[1])}). It is <b>vertical</b> where the bottom is zero: (${f(M.FOL_V[0])}, ${f(M.FOL_V[1])}). At the origin both are zero and the curve crosses itself.</p>`,
    cam: { target: [ST.folium + 0.25, 0.25, 0], az: 0, el: 4, dist: 27 }, lit: 'folPt', look: {}, scene: 'folium',
    fig: 'x³ + y³ = 6xy',
  },
  {
    kicker: '3.5', title: 'Derivatives of inverse functions', sub: 'rise and run trade places',
    body: `
      <p class="lede">The graph of <i>f</i>⁻¹ is the graph of <i>f</i> reflected in the line <i>y</i> = <i>x</i>. Reflecting swaps every rise with its run, so slopes turn into their reciprocals.</p>
      <p>If <i>f</i>(<i>a</i>) = <i>b</i>, then</p>
      <div class="eq">${t(String.raw`\big(f^{-1}\big)'(b) = \frac{1}{f'(a)} = \frac{1}{f'\big(f^{-1}(b)\big)}`)}</div>
      <p>For <i>f</i>(<i>x</i>) = <i>x</i>³ + <i>x</i>, find (<i>f</i>⁻¹)′(${M.IB}) with no formula for <i>f</i>⁻¹:</p>
      <table class="data">
        <tr><td>1. which <i>a</i> has <i>f</i>(<i>a</i>) = ${M.IB}?</td><td><i>a</i> = ${M.IA}</td></tr>
        <tr><td>2. slope of <i>f</i> there</td><td><i>f</i>′(${M.IA}) = 3(${M.IA})² + 1 = ${M.invp(M.IA)}</td></tr>
        <tr><td>3. take the reciprocal</td><td>(<i>f</i>⁻¹)′(${M.IB}) = 1/${M.invp(M.IA)} = ${f(DINV)}</td></tr>
      </table>
      <p>The trap is 1/<i>f</i>′(${M.IB}) = 1/${M.invp(M.IB)}: <i>f</i>′ belongs at ${M.IA}, the point that reflects onto (${M.IB}, ${M.IA}). Where <i>f</i>′(<i>a</i>) = 0, <i>f</i>⁻¹ has a vertical tangent.</p>`,
    cam: { target: [ST.inverse + 0.85, 0.85, 0.3], az: -24, el: 18, dist: 25 }, lit: 'flip', look: {}, scene: 'inverse',
    fig: 'f(x) = x³ + x, flipped over y = x',
  },
  {
    kicker: '3.6', title: 'Inverse trigonometric functions', sub: 'slopes from a triangle',
    body: `
      <p class="lede">Let <i>y</i> = arcsin <i>x</i>, so sin <i>y</i> = <i>x</i> with −π/2 ≤ <i>y</i> ≤ π/2. Differentiating implicitly, cos <i>y</i> · <i>dy</i>/<i>dx</i> = 1:</p>
      <div class="eq">${t(String.raw`\frac{dy}{dx} = \frac{1}{\cos y} = \frac{1}{\sqrt{1-x^2}}`)}</div>
      <p>The triangle turns cos <i>y</i> back into <i>x</i>: hypotenuse 1, opposite <i>x</i>, adjacent √(1 − <i>x</i>²), positive since |<i>y</i>| ≤ π/2. The same steps give the others:</p>
      <table class="data">
        <tr><th>function</th><th>derivative</th><th>at <i>x</i> = ${M.TX}</th></tr>
        <tr><td>arcsin <i>x</i></td><td>${ti(String.raw`\frac{1}{\sqrt{1-x^2}}`)}</td><td>1/${f(Math.sqrt(1 - M.TX ** 2), 1)} = ${f(S06)}</td></tr>
        <tr><td>arccos <i>x</i></td><td>${ti(String.raw`-\frac{1}{\sqrt{1-x^2}}`)}</td><td>${f(-S06)}</td></tr>
        <tr><td>arctan <i>x</i></td><td>${ti(String.raw`\frac{1}{1+x^2}`)}</td><td>1/${f(1 + M.TX ** 2)} = ${f(T06, 3)}</td></tr>
      </table>
      <p>With an inside function, add the chain rule: ${ti(String.raw`\frac{d}{dx}\arctan(3x) = \frac{3}{1+9x^2}`)}.</p>`,
    cam: { target: [ST.trig + 0.3, 0, 0], az: 0, el: 4, dist: 27 }, lit: 'arcsin', look: {}, scene: 'trig',
    fig: 'arcsin x and arctan x',
  },
  {
    kicker: '3.7', title: 'Selecting a procedure', sub: 'read the outermost operation',
    body: `
      <p class="lede">Before differentiating, ask what the <b>last</b> operation is when you evaluate the function. That names the rule to use first.</p>
      <table class="data">
        <tr><th>the function is</th><th>use</th></tr>
        <tr><td>a product <i>uv</i></td><td>product rule</td></tr>
        <tr><td>a quotient <i>u</i>/<i>v</i></td><td>quotient rule</td></tr>
        <tr><td>a function of a function</td><td>chain rule</td></tr>
      </table>
      <p>Often two routes work. For <i>q</i>(<i>x</i>) = <i>x</i>/(<i>x</i>² + 1): the quotient rule, or the product rule on <i>x</i>(<i>x</i>² + 1)<sup>−1</sup>:</p>
      <div class="eq">${t(String.raw`q'(x) = \frac{(x^2+1) - 2x^2}{(x^2+1)^2}`)}</div>
      <div class="eq">${t(String.raw`q'(x) = \frac{1}{x^2+1} - \frac{2x^2}{(x^2+1)^2}`)}</div>
      <p>Both simplify to (1 − <i>x</i>²)/(<i>x</i>² + 1)², so <i>q</i>′(${M.SX}) = −3/25 = ${f(QP2)}. Blue <i>q</i>′ is the red tangent’s slope: zero at ±1, where <i>q</i> turns.</p>`,
    cam: { target: [ST.select, 0, 0], az: 0, el: 4, dist: 25 }, lit: 'q', look: {}, scene: 'select',
    fig: 'q(x) = x/(x² + 1) and q′(x)',
  },
  {
    kicker: '3.8', title: 'Higher-order derivatives', sub: 'the derivative of the derivative',
    body: `
      <p class="lede">The derivative <i>f</i>′ has a derivative of its own: <i>f</i>″, the <b>second derivative</b>, or <i>d</i>²<i>y</i>/<i>dx</i>². It measures how fast the slope changes.</p>
      <p>For <i>f</i>(<i>x</i>) = sin 2<i>x</i>, each step is the chain rule and brings out another factor ${M.W}:</p>
      <div class="eq">${t(String.raw`f' = 2\cos 2x,\quad f'' = -4\sin 2x`)}</div>
      <div class="eq">${t(String.raw`f''' = -8\cos 2x,\quad f^{(4)} = 16\sin 2x`)}</div>
      <p>So <i>f</i>″ = −4<i>f</i>, and the pattern repeats every four steps. At <i>x</i> = π/12, where 2<i>x</i> = π/6:</p>
      <table class="data">
        <tr><td><i>f</i> = sin(π/6) = ${f(sd(0), 3)}</td><td><i>f</i>′ = 2 cos(π/6) = ${f(sd(1), 3)}</td></tr>
        <tr><td><i>f</i>″ = −4 sin(π/6) = ${f(sd(2), 3)}</td><td><i>f</i>‴ = −8 cos(π/6) = ${f(sd(3), 3)}</td></tr>
      </table>
      <p>On each sheet the tangent’s slope is the height on the next.</p>`,
    cam: { target: [ST.high + 0.3, 0.2, -0.9], az: -14, el: 7, dist: 35 }, lit: 'high1', look: {}, scene: 'high',
    fig: 'sin 2x, and two derivatives',
  },
  {
    kicker: '3.9', title: 'Second derivatives implicitly', sub: 'differentiate the slope again',
    body: `
      <p class="lede">For the circle, <i>dy</i>/<i>dx</i> = −<i>x</i>/<i>y</i>. Differentiate that with the quotient rule, remembering that <i>y</i> depends on <i>x</i>:</p>
      <div class="eq">${t(String.raw`\frac{d^2y}{dx^2} = -\frac{y - x\,y'}{y^2}`)}</div>
      <p>Substitute <i>y</i>′ = −<i>x</i>/<i>y</i>, multiply top and bottom by <i>y</i>, and use <i>x</i>² + <i>y</i>² = ${M.R * M.R}:</p>
      <div class="eq">${t(String.raw`\frac{d^2y}{dx^2} = -\frac{x^2+y^2}{y^3} = -\frac{${M.R * M.R}}{y^3}`)}</div>
      <p>At (${M.P0[0]}, ${M.P0[1]}): <i>d</i>²<i>y</i>/<i>dx</i>² = −${M.R * M.R}/${M.P0[1] ** 3} = ${f(CY0, 3)}. Negative: concave down.</p>
      <p>The sign depends only on <i>y</i>: the top half (red) is concave down, the bottom (blue) concave up. The black parabola shares the point’s value, slope and second derivative, so it hugs the circle there; near the sides, where <i>y</i> → 0, <i>y</i>″ grows without bound and it narrows.</p>`,
    cam: { target: [ST.circle, 0, 0], az: 0, el: 4, dist: 32 }, lit: 'fit', look: { conc: 1 }, scene: 'circle',
    fig: 'Concavity of x² + y² = 25',
  },
];

// ---------- click a thing: what it is, and its live numbers ----------
const gearState = s => { const n = M.turns(s.c); return [n, n * M.DU_DX, n * M.DY_DX]; };
const circ = s => { const a = M.circAngle(s.c); return [M.R * Math.cos(a), M.R * Math.sin(a)]; };
const run = 0.5, rise = run * M.invp(M.IA);   // the slope triangle drawn on f (world.js)
const slopeTxt = v => Math.abs(v) > 200 ? 'vertical' : f(v, 3);
export const PLATES = {
  gearX: { text: `The input. It has ${G.Nx} teeth; each turn it pushes ${G.Nx} teeth past the point where it meets the next gear.`,
    facts: s => [['turns so far, x', f(gearState(s)[0])], ['teeth', `${G.Nx}`]] },
  gearU: { text: `Two gears on one shaft, so they turn together. The ${G.Nu}-tooth pinion is driven ${G.Nx}/${G.Nu} = ${M.DU_DX} times as fast as the x gear; the ${G.Nu2}-tooth gear passes that on.`,
    facts: s => [['turns so far, u', f(gearState(s)[1])], ['du/dx', `${G.Nx}/${G.Nu} = ${M.DU_DX}`]] },
  gearY: { text: `The output. Each turn of the u shaft pushes ${G.Nu2} of its ${G.Ny} teeth: ${M.DY_DU} turns. Against the x gear: ${M.DY_DU} × ${M.DU_DX} = ${M.DY_DX}.`,
    facts: s => [['turns so far, y', f(gearState(s)[2])], ['dy/du', `${M.DY_DU}`], ['dy/dx = dy/du · du/dx', `${M.DY_DX}`]] },
  inner: { text: 'The inside function u = x². Its tangent’s slope, g′(x) = 2x, is how fast u changes as x moves.',
    facts: s => { const x = M.chainX(s.c); return [['x', f(x, 3)], ['u = x²', f(M.g(x), 3)], ['g′(x) = 2x', f(M.gp(x), 3)]]; } },
  outer: { text: 'The outside function y = sin u. Its slope is read at u = g(x), not at x: here the point sits at the current value of u.',
    facts: s => { const x = M.chainX(s.c), u = M.g(x); return [['u', f(u, 3)], ['y = sin u', f(M.f(u), 3)], ['f′(u) = cos u', f(M.fp(u), 3)]]; } },
  comp: { text: 'The composite h(x) = sin(x²). Its slope is the product of the other two slopes: outside’s at u, times inside’s at x.',
    facts: s => { const x = M.chainX(s.c), u = M.g(x); return [['x', f(x, 3)], ['f′(g(x)) · g′(x)', `${f(M.fp(u), 3)} × ${f(M.gp(x), 3)}`], ['h′(x)', f(M.hp(x), 3)]]; } },
  circle: { text: `x² + y² = ${M.R * M.R}: every point ${M.R} from the origin. It fails the vertical line test, so it is two functions, y = ±√(25 − x²), but implicit differentiation handles both at once.`,
    facts: () => [['radius', `${M.R}`], ['dy/dx', '−x/y'], ['d²y/dx²', '−25/y³']] },
  halves: { text: 'The sign of d²y/dx² = −25/y³ is the opposite of the sign of y: negative on top (concave down), positive below (concave up).',
    facts: s => { const [, y] = circ(s); return [['y now', f(y, 3)], ['d²y/dx²', Math.abs(y) < 0.05 ? 'undefined' : f(-25 / y ** 3, 3)], ['concave', y > 0 ? 'down' : 'up']]; } },
  circPt: { text: 'The point runs round the circle. Its tangent has slope −x/y, the negative reciprocal of the radius’s slope y/x: the tangent is perpendicular to the radius.',
    facts: s => { const [x, y] = circ(s); return [['(x, y)', `(${f(x)}, ${f(y)})`], ['radius slope y/x', slopeTxt(y / x)], ['dy/dx = −x/y', slopeTxt(-x / y)]]; } },
  fit: { text: 'A parabola with the same value, slope and second derivative as the circle at the point. Where y″ is large the parabola is narrow; it can’t follow the circle around the sides.',
    facts: s => { const [x, y] = circ(s); return [['(x, y)', `(${f(x)}, ${f(y)})`], ['y′', slopeTxt(-x / y)], ['y″ = −25/y³', Math.abs(y) < 0.05 ? 'undefined' : f(-25 / y ** 3, 3)]]; } },
  folium: { text: `x³ + y³ = 6xy. A loop in the first quadrant and two arms that approach the line x + y = −2. No vertical line test, and no tidy y = …; the implicit slope works everywhere except the origin.`,
    facts: () => [['dy/dx', '(2y − x²)/(y² − 2x)'], ['asymptote', 'x + y = −2']] },
  folFlat: { text: 'Horizontal tangent: the slope’s numerator 2y − x² is zero. Vertical tangent: its denominator y² − 2x is zero. Each also has to be on the curve.',
    facts: () => [['horizontal at', `(${f(M.FOL_H[0], 3)}, ${f(M.FOL_H[1], 3)})`], ['vertical at', `(${f(M.FOL_V[0], 3)}, ${f(M.FOL_V[1], 3)})`]] },
  folPt: { text: 'The point runs round the loop. Its tangent slope comes from the implicit formula at its x and y; no equation y = … was needed.',
    facts: s => { const [x, y] = M.folAt(Math.tan(M.folTheta(s.c))); return [['(x, y)', `(${f(x)}, ${f(y)})`], ['2y − x²', f(2 * y - x * x, 3)], ['y² − 2x', f(y * y - 2 * x, 3)], ['dy/dx', slopeTxt(M.folSlope(x, y))]]; } },
  fcurve: { text: `f(x) = x³ + x, always increasing (f′ = 3x² + 1 > 0), so it has an inverse. At (${M.IA}, ${M.IB}) its tangent has slope ${M.invp(M.IA)}.`,
    facts: () => [['f(1)', `${M.IB}`], ['f′(1)', `${M.invp(M.IA)}`]] },
  ginv: { text: `The inverse. It passes through (${M.IB}, ${M.IA}), and its tangent there has slope 1/${M.invp(M.IA)}.`,
    facts: () => [['f⁻¹(2)', `${M.IA}`], ['(f⁻¹)′(2)', `1/${M.invp(M.IA)} = ${f(DINV)}`], ['f⁻¹(0.5)', f(M.finv(0.5), 3)]] },
  mirror: { text: 'Reflecting in y = x sends every point (x, y) to (y, x). A turn of half a revolution about this line, out of the page and back, does exactly that.',
    facts: () => [['(a, b) goes to', '(b, a)'], ['slope m goes to', '1/m']] },
  flip: { text: `A copy of f with its slope triangle (run ${f(run)}, rise ${f(rise)}) turns about y = x and lands on f⁻¹. The run becomes the rise: the slope ${M.invp(M.IA)} becomes 1/${M.invp(M.IA)}.`,
    facts: s => [['turned', `${(M.flip(s.c) * 180 / Math.PI).toFixed(0)}°`], ['before: rise/run', `${f(rise)}/${f(run)} = ${M.invp(M.IA)}`], ['after: rise/run', `${f(run)}/${f(rise)} = ${f(DINV)}`]] },
  arcsin: { text: 'y = arcsin x, defined on [−1, 1], with values in [−π/2, π/2]. Its slope is never less than 1 and grows without bound at the ends, where the tangent is vertical.',
    facts: s => { const x = M.trigX(s.c); return [['x', f(x, 3)], ['arcsin x', f(M.asin(x), 3)], ['1/√(1 − x²)', f(M.asinp(x), 3)]]; } },
  arctan: { text: 'y = arctan x, defined for every x, with values between −π/2 and π/2. Its slope 1/(1 + x²) is largest, 1, at x = 0.',
    facts: s => { const x = M.trigX(s.c); return [['x', f(x, 3)], ['arctan x', f(M.atan(x), 3)], ['1/(1 + x²)', f(M.atanp(x), 3)]]; } },
  triangle: { text: 'The angle y has sin y = x: opposite x over hypotenuse 1. Pythagoras gives the third side, so cos y = √(1 − x²), and dy/dx = 1/cos y.',
    facts: s => { const x = M.trigX(s.c), y = M.asin(x); return [['y = arcsin x', `${f(y, 3)} rad`], ['opposite = x', f(x, 3)], ['adjacent = cos y', f(Math.cos(y), 3)]]; } },
  q: { text: 'q(x) = x/(x² + 1): a quotient. The quotient rule and the product rule with (x² + 1)⁻¹ give the same derivative.',
    facts: s => { const x = M.selX(s.c); return [['x', f(x, 3)], ['q(x)', f(M.q(x), 3)], ['slope of tangent', f(M.qp(x), 3)]]; } },
  qp: { text: 'q′(x) = (1 − x²)/(x² + 1)². Its height at each x equals the slope of q there: positive between −1 and 1, where q rises.',
    facts: s => { const x = M.selX(s.c); return [['x', f(x, 3)], ['q′(x)', f(M.qp(x), 3)], ['q is', M.qp(x) > 0 ? 'increasing' : 'decreasing']]; } },
  high0: { text: 'f(x) = sin 2x. Its tangent’s slope is the height of the middle sheet.',
    facts: s => { const x = M.highX(s.c); return [['x', f(x, 3)], ['f(x)', f(M.sd(0, x), 3)], ['slope', f(M.sd(1, x), 3)]]; } },
  high1: { text: 'f′(x) = 2 cos 2x: the chain rule brings out the 2. Its slope is the height of the back sheet.',
    facts: s => { const x = M.highX(s.c); return [['x', f(x, 3)], ['f′(x)', f(M.sd(1, x), 3)], ['slope = f″(x)', f(M.sd(2, x), 3)]]; } },
  high2: { text: 'f″(x) = −4 sin 2x = −4 f(x): where f is positive the slope is falling (concave down), and the reverse.',
    facts: s => { const x = M.highX(s.c); return [['x', f(x, 3)], ['f″(x)', f(M.sd(2, x), 3)], ['−4 f(x)', f(-4 * M.sd(0, x), 3)]]; } },
};
