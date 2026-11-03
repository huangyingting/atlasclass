// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { ST, live } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -5e-10 ? '−' : '') + Math.abs(x).toFixed(n);
const ti = s => tex.inline(s), td = s => `<div class="eq">${tex(s)}</div>`;
const al = (...rows) => td(String.raw`\begin{aligned}${rows.join(String.raw`\\`)}\end{aligned}`);   // a working, one step per line
const R = String.raw;
const sums = Object.fromEntries(M.KINDS.map(k => [k, M.sum(k, M.N2)]));
const legs = M.TABLE.t.slice(1).map((t, i) => (t - M.TABLE.t[i]) * (M.TABLE.r[i] + M.TABLE.r[i + 1]) / 2);

export const PAGES = [
  {
    kicker: 'Chapter 6', title: 'Integration', sub: 'adding up the pieces',
    body: `
      <p class="lede">A derivative takes a changing quantity apart into its rate. An integral puts it back together: it adds up rate × width, slice by slice, into a total.</p>
      <p>The figure stands rectangles under ${ti(R`y = 1 + \tfrac{x^2}{4}`)} from ${ti('x = 0')} to ${ti('4')}. Each is a height times a width; together they nearly fill the region. With ${M.N0} of them the sum is ${f(M.sum('right', M.N0), 3)}; with ${M.NS.at(-1)} it is ${f(M.sum('right', M.NS.at(-1)), 3)}; in the limit it is exactly the area, ${ti(R`\tfrac{28}{3}`)} ≈ ${f(M.EXACT, 3)}.</p>
      <p>This chapter: what the area under a rate graph means; estimating it with sums; the definite integral as the limit of those sums; the Fundamental Theorem, which turns areas into antiderivatives; and the ways to find antiderivatives: the basic rules, substitution and algebra, and for BC, parts, partial fractions and improper integrals.</p>`,
    cam: { target: [ST.riemann + 0.3, 0.2, 0], az: -34, el: 16, dist: 25 }, lit: 'slabsR', look: { open: 1 }, scene: 'open',
    fig: 'Rectangles filling an area',
  },
  {
    kicker: '6.1', title: 'Accumulating change', sub: 'rate × time, added up',
    body: `
      <p class="lede">When a rate is constant, the change is rate × time: the area of a rectangle under the rate graph. When the rate varies, the change is still the area under its graph.</p>
      <p>A particle moves along a line with velocity ${ti(R`v(t) = t(4 - t)`)} m/s for ${ti(R`0 \le t \le 5`)}. One axis is in m/s and the other in s, so area is in metres.</p>
      <table class="data">
        <tr><th>stretch</th><th>area</th><th>meaning</th></tr>
        <tr><td>0 to 4 s, above</td><td>${ti(R`\tfrac{32}{3}`)} ≈ ${f(M.FWD1)}</td><td>${f(M.FWD1)} m forward</td></tr>
        <tr><td>4 to 5 s, below</td><td>${ti(R`\tfrac{7}{3}`)} ≈ ${f(M.BACK1)}</td><td>${f(M.BACK1)} m back</td></tr>
      </table>
      <p>Area below the axis counts as negative change. The <b>displacement</b> is ${f(M.FWD1)} − ${f(M.BACK1)} = ${f(M.DISP1)} m; the <b>distance travelled</b> counts both as positive, ${f(M.FWD1)} + ${f(M.BACK1)} = ${f(M.DIST1)} m.</p>
      <p>The red dot on the number line is always at the signed area so far: it runs forward while the graph is above the axis and turns back at ${ti('t = 4')}, where ${ti('v')} changes sign.</p>`,
    cam: { target: [ST.flow + 0.5, -1.3, 0], az: -4, el: 4, dist: 33 }, lit: 'track', look: {}, scene: 'flow',
    fig: 'Velocity, and the distance it adds up to',
  },
  {
    kicker: '6.2', title: 'Riemann sums', sub: 'rectangles and trapezoids',
    body: `
      <p class="lede">To estimate an area, cut ${ti('[a, b]')} into pieces, put a rectangle or a trapezoid on each, and add their areas.</p>
      <p>Under ${ti(R`f(x) = 1 + \tfrac{x^2}{4}`)} on ${ti('[0, 4]')} with ${M.N2} pieces of width 1 (exact area ${f(M.EXACT, 3)}):</p>
      <table class="data">
        <tr><th>sum</th><th>height of each piece</th><th>value</th><th></th></tr>
        <tr><td>left</td><td>${ti('f')} at the left end</td><td>${f(sums.left)}</td><td>under</td></tr>
        <tr><td>right</td><td>${ti('f')} at the right end</td><td>${f(sums.right)}</td><td>over</td></tr>
        <tr><td>midpoint</td><td>${ti('f')} at the middle</td><td>${f(sums.midpoint)}</td><td>under</td></tr>
        <tr><td>trapezoid</td><td>the two ends, averaged</td><td>${f(sums.trapezoid)}</td><td>over</td></tr>
      </table>
      <p>${ti('f')} is <b>increasing</b>, so left sums fall short and right sums overshoot. It is <b>concave up</b>, so trapezoids sit above the curve and the midpoint sum is too small. (Decreasing, or concave down: the reverse.)</p>
      <p>A table may have unequal widths: use each one. Water flows in at ${ti('R(t)')} L/min:</p>
      <table class="data"><tr><th>${ti('t')} (min)</th>${M.TABLE.t.map(t => `<td>${t}</td>`).join('')}</tr><tr><th>${ti('R(t)')}</th>${M.TABLE.r.map(r => `<td>${r}</td>`).join('')}</tr></table>
      <p>Trapezoids of widths ${M.TABLE.t.slice(1).map((t, i) => t - M.TABLE.t[i]).join(', ')}: ${legs.join(' + ')} = ${f(M.tableSum('trapezoid'), 1)} litres.</p>`,
    cam: { target: [ST.riemann, 0.15, 0], az: -6, el: 4, dist: 22 }, lit: 'slabsR', look: { cyc: 1 }, scene: 'cycle',
    fig: 'Left, right, midpoint, trapezoid',
  },
  {
    kicker: '6.3', title: 'The definite integral', sub: 'the limit of the sums',
    body: `
      <p class="lede">More, thinner pieces give a better estimate. The definite integral is what the sums approach as the pieces shrink to nothing.</p>
      <p>As a right sum in sigma notation, with ${ti(R`\Delta x = \tfrac{b-a}{n}`)} and ${ti(R`x_i = a + i\,\Delta x`)}:</p>
      ${td(R`\int_a^b f(x)\,dx = \lim_{n\to\infty} \sum_{i=1}^{n} f(x_i)\,\Delta x`)}
      <p>For a continuous ${ti('f')} the limit exists, and left, right and midpoint sums all reach it. Under ${ti(R`1 + \tfrac{x^2}{4}`)} on ${ti('[0, 4]')}:</p>
      <table class="data"><tr><th>${ti('n')}</th>${[4, 16, 64].map(n => `<td>${n}</td>`).join('')}<td>→ ∞</td></tr>
        <tr><th>right sum</th>${[4, 16, 64].map(n => `<td>${f(M.sum('right', n), 3)}</td>`).join('')}<td>${f(M.EXACT, 3)}</td></tr></table>
      <p>Read a limit backward by matching its parts:</p>
      ${td(R`\lim_{n\to\infty} \sum_{i=1}^{n} \Big(1 + \frac14\Big(\frac{4i}{n}\Big)^2\Big)\frac{4}{n}`)}
      <p>${ti(R`\Delta x = \tfrac4n`)} says ${ti('b - a = 4')}, and ${ti(R`x_i = \tfrac{4i}{n}`)} says ${ti('a = 0')}: it is ${ti(R`\int_0^4 \big(1 + \tfrac{x^2}{4}\big)\,dx`)}. Starting at ${ti('a = 1')} instead, ${ti(R`x_i = 1 + \tfrac{4i}{n}`)}, the same sum is ${ti(R`\int_1^5 \big(1 + \tfrac{(x-1)^2}{4}\big)\,dx`)}.</p>`,
    cam: { target: [ST.riemann, 0.15, 0], az: 8, el: 6, dist: 22 }, lit: 'slabsR', look: {}, scene: 'refine',
    fig: 'Doubling the pieces',
  },
  {
    kicker: '6.4', title: 'Accumulation functions', sub: 'the Fundamental Theorem, part one',
    body: `
      <p class="lede">Let the upper limit move and the integral becomes a function: the area so far.</p>
      <p>The top graph is ${ti('f')}: a semicircle of radius 2 on ${ti('[-2, 2]')}, then segments to ${ti('(4, -2)')} and ${ti('(6, 0)')}. Below it is ${ti(R`g(x) = \int_{-2}^{x} f(t)\,dt`)}.</p>
      <p>A sliver ${ti('h')} further on, the area has grown by about ${ti(R`f(x)\,h`)}: ${ti('g')} rises at rate ${ti('f(x)')}. That is the <b>Fundamental Theorem of Calculus</b>:</p>
      ${td(R`\frac{d}{dx}\int_a^x f(t)\,dt = f(x)`)}
      <p>So ${ti(R`g(2) = 2\pi`)} (half the disc) and ${ti(R`g'(1) = f(1) = \sqrt3`)}; the blue tangent to ${ti('g')} has slope ${ti('f(x)')}.</p>
      <p>With a function ${ti('u(x)')} as the upper limit, the chain rule adds a factor ${ti(R`u'(x)`)}. For ${ti(R`h(x) = \int_{-2}^{x^2} f(t)\,dt`)}:</p>
      ${al(R`h'(x) &= f(x^2)\cdot 2x`, R`h'(1) &= 2f(1) = 2\sqrt3 \approx ${f(M.H1, 3)}`)}`,
    cam: { target: [ST.acc, 0.35, 0], az: -4, el: 3, dist: 35 }, lit: 'tangentG', look: {}, scene: 'acc',
    fig: 'Area so far, and its slope',
  },
  {
    kicker: '6.5', title: 'Reading an accumulation function', sub: 'what f says about g',
    body: `
      <p class="lede">Since ${ti(R`g' = f`)}, the graph of ${ti('f')} is the graph of ${ti('g')}’s slope, and everything from the derivative chapters can be read off it.</p>
      <table class="data">
        <tr><th>the graph of ${ti('f')} is</th><th>so ${ti('g')} is</th></tr>
        <tr><td>above the axis</td><td>increasing</td></tr>
        <tr><td>crossing from + to −</td><td>at a relative maximum</td></tr>
        <tr><td>increasing (${ti(R`g'' = f' > 0`)})</td><td>concave up</td></tr>
        <tr><td>turning (a max or min of ${ti('f')})</td><td>at an inflection point</td></tr>
      </table>
      <p>Here ${ti('g')} increases on ${ti('(-2, 2)')} and decreases on ${ti('(2, 6)')}: its maximum is ${ti(R`g(2) = 2\pi \approx ${f(2 * Math.PI)}`)}. For the absolute minimum compare the ends, ${ti('g(-2) = 0')} and ${ti(R`g(6) = 2\pi - 4 \approx ${f(M.gS(6))}`)}: it is 0, at ${ti('x = -2')}.</p>
      <p>${ti('f')} increases on ${ti('(-2, 0)')} and ${ti('(4, 6)')}, where ${ti('g')} is concave up, and decreases on ${ti('(0, 4)')}, where it is concave down. The turns of ${ti('f')} at ${ti('x = 0')} and ${ti('4')} are ${ti('g')}’s inflection points.</p>`,
    cam: { target: [ST.acc, 0.35, 0], az: 5, el: 3, dist: 35 }, lit: 'features', look: { feat: 1 }, scene: 'acc',
    fig: 'The maximum and the bends',
  },
  {
    kicker: '6.6', title: 'Properties of definite integrals', sub: 'splitting, flipping, scaling',
    body: `
      <p class="lede">Definite integrals add, scale and reverse the way signed areas should.</p>
      <table class="data">
        <tr><td>${ti(R`\int_a^a f = 0`)}</td><td>no width, no area</td></tr>
        <tr><td>${ti(R`\int_b^a f = -\int_a^b f`)}</td><td>reversed limits flip the sign</td></tr>
        <tr><td>${ti(R`\int_a^c f + \int_c^b f = \int_a^b f`)}</td><td>adjacent pieces add</td></tr>
        <tr><td>${ti(R`\int_a^b (kf \pm g) = k\!\int_a^b f \pm \int_a^b g`)}</td><td>constants and sums come out</td></tr>
      </table>
      <p>The split works for any ${ti('c')}: in the figure ${ti('c')} slides across, and the red and blue pieces always add to the same total.</p>
      <p>For this ${ti('f')}, the half disc gives ${ti(R`\int_{-2}^{2} f = 2\pi`)} and the triangle below gives ${ti(R`\int_{2}^{6} f = -\tfrac12(4)(2) = -4`)}, so ${ti(R`\int_{-2}^{6} f = 2\pi - 4 \approx ${f(M.intS(-2, 6))}`)} and ${ti(R`\int_{6}^{2} f = 4`)}. Scaling and adding:</p>
      ${al(R`\int_{-2}^{6} (3f + 1)\,dx &= 3(2\pi - 4) + 8`, R`&= 6\pi - 4 \approx ${f(M.SCALED)}`)}
      <p>The constant 1 integrates to the width of the interval, 8, not to 1.</p>`,
    cam: { target: [ST.prop + 0.1, -1, 0], az: -3, el: 3, dist: 25 }, lit: 'splitC', look: {}, scene: 'prop',
    fig: 'Split at any c',
  },
  {
    kicker: '6.7', title: 'The Fundamental Theorem, part two', sub: 'areas from antiderivatives',
    body: `
      <p class="lede">To find an area exactly you don’t need the limit of sums: any antiderivative will do. If ${ti(R`F' = f`)} and ${ti('f')} is continuous on ${ti('[a, b]')},</p>
      ${td(R`\int_a^b f(x)\,dx = F(b) - F(a)`)}
      <p>Why: ${ti(R`G(x) = \int_a^x f`)} is one antiderivative (part one), with ${ti('G(a) = 0')}; any other is ${ti('G + C')}, and ${ti('C')} cancels in the difference.</p>
      ${al(R`\int_1^2 x^2\,dx &= \Big[\frac{x^3}{3}\Big]_1^2`, R`&= \frac83 - \frac13 = \frac73 \approx ${f(M.FTC7, 3)}`)}
      <p>In the figure the red area under ${ti('x^2')} grows from ${ti('x = 1')}, and the red rise ${ti('F(b) - F(a)')} on the right grows with it. The curve ${ti(R`\tfrac{x^3}{3} + C`)} bobs up and down as ${ti('C')} changes; the rise never does.</p>
      <p>Read the other way, this is the <b>net change theorem</b>, ${ti(R`F(b) = F(a) + \int_a^b F'(x)\,dx`)}: if ${ti(`F(1) = ${M.T7.F1}`)} and ${ti(R`F'(x) = x^2`)}, then ${ti(R`F(2) = ${M.T7.F1} + \tfrac73 = \tfrac{22}{3}`)}.</p>`,
    cam: { target: [ST.ftc - 0.4, 0.3, 0], az: -3, el: 3, dist: 25 }, lit: 'rise', look: {}, scene: 'ftc',
    fig: 'The area is the rise',
  },
  {
    kicker: '6.8', title: 'Antiderivatives', sub: 'undoing the derivative',
    body: `
      <p class="lede">${ti(R`\int f(x)\,dx = F(x) + C`)} means ${ti(R`F' = f`)}. The ${ti('+ C')} matters: every vertical shift of ${ti('F')} has the same derivative.</p>
      <table class="data">
        <tr><td>${ti(R`\int x^n\,dx = \frac{x^{n+1}}{n+1} + C,\ n \ne -1`)}</td><td>${ti(R`\int \frac1x\,dx = \ln|x| + C`)}</td></tr>
        <tr><td>${ti(R`\int e^x\,dx = e^x + C`)}</td><td>${ti(R`\int a^x\,dx = \frac{a^x}{\ln a} + C`)}</td></tr>
        <tr><td>${ti(R`\int \cos x\,dx = \sin x + C`)}</td><td>${ti(R`\int \sin x\,dx = -\cos x + C`)}</td></tr>
        <tr><td>${ti(R`\int \sec^2 x\,dx = \tan x + C`)}</td><td>${ti(R`\int \sec x\tan x\,dx = \sec x + C`)}</td></tr>
        <tr><td>${ti(R`\int \frac{dx}{1+x^2} = \arctan x + C`)}</td><td>${ti(R`\int \frac{dx}{\sqrt{1-x^2}} = \arcsin x + C`)}</td></tr>
      </table>
      <p>Sums and constant multiples go term by term:</p>
      ${td(R`\int (x^2 - 1)\,dx = \frac{x^3}{3} - x + C`)}
      <p>The figure draws five members of that family. At every ${ti('x')} their tangents are parallel, all with slope ${ti('x^2 - 1')}: they differ only in height. One more fact picks out one curve: ${ti(`F(0) = ${M.C8}`)} gives ${ti(`C = ${M.C8}`)}, the red one.</p>`,
    cam: { target: [ST.family + 0.2, 0, 0], az: 3, el: 3, dist: 25 }, lit: 'family', look: {}, scene: 'family',
    fig: 'One slope, many heights',
  },
  {
    kicker: '6.9', title: 'Substitution', sub: 'the chain rule, run backward',
    body: `
      <p class="lede">The chain rule says ${ti(R`\frac{d}{dx}F(g(x)) = f(g(x))\,g'(x)`)}. So when an integrand has that shape, put ${ti('u = g(x)')} and ${ti(R`du = g'(x)\,dx`)}:</p>
      ${td(R`\int f(g(x))\,g'(x)\,dx = \int f(u)\,du`)}
      <p>Change the limits too, from values of ${ti('x')} to values of ${ti('u')}. With ${ti('u = x^2')}:</p>
      ${al(R`&\int_0^{\sqrt{\pi/2}} 2x\cos(x^2)\,dx`, R`&= \int_0^{\pi/2} \cos u\,du`, R`&= \sin\tfrac\pi2 - \sin 0 = 1`)}
      <p>Why: a strip of width ${ti('dx')} at ${ti('x')} lands at ${ti('u = x^2')} stretched to width ${ti(R`du = 2x\,dx`)}. The factor ${ti('2x')} is exactly that stretch, so the blue strips match in area and the red areas fill up together.</p>
      <p>A missing constant can be fixed, ${ti(R`\int x\cos(x^2)\,dx = \tfrac12\sin(x^2) + C`)}; a missing ${ti('x')} cannot.</p>`,
    cam: { target: [ST.sub + 0.25, -0.1, 0], az: -3, el: 3, dist: 25 }, lit: 'strips', look: {}, scene: 'sub',
    fig: 'The same area, in x and in u',
  },
  {
    kicker: '6.10', title: 'Division and completing the square', sub: 'rewrite, then integrate',
    body: `
      <p class="lede">Some rational functions match no rule as written; a little algebra first turns them into ones that do. <b>Long division</b>, when the top’s degree is at least the bottom’s:</p>
      ${td(R`\frac{x^2+2x+2}{x+1} = (x + 1) + \frac{1}{x+1}`)}
      ${al(R`&\int_0^2 \frac{x^2+2x+2}{x+1}\,dx`, R`&= \Big[\frac{x^2}{2} + x + \ln|x+1|\Big]_0^2`, R`&= 4 + \ln 3 \approx ${f(M.DIV10, 3)}`)}
      <p>Above, the red layer on top of ${ti('x + 1')} lifts off: it is ${ti(R`\tfrac{1}{x+1}`)} alone.</p>
      <p><b>Completing the square</b>, for a quadratic bottom with no real roots, then ${ti(R`\int \frac{du}{u^2 + a^2} = \frac1a\arctan\frac ua`)}:</p>
      ${al(R`\int_{-1}^{1} \frac{4\,dx}{(x+1)^2 + 4} &= \Big[2\arctan\frac{x+1}{2}\Big]_{-1}^{1}`, R`&= 2\cdot\frac\pi4 = \frac\pi2`)}
      <p>Below: ${ti(R`\tfrac{4}{x^2+4}`)} slides left by 1 onto ${ti(R`\tfrac{4}{x^2+2x+5}`)}. Completing the square is a shift.</p>`,
    cam: { target: [ST.div + 0.6, 0.55, 0], az: -3, el: 3, dist: 28 }, lit: 'quotient', look: {}, scene: 'div',
    fig: 'A quotient plus a remainder; a shift',
  },
  {
    kicker: '6.11 · BC', title: 'Integration by parts', sub: 'the product rule, run backward',
    body: `
      <p class="lede">The product rule ${ti(R`(uv)' = u'v + uv'`)}, integrated and rearranged, gives</p>
      ${td(R`\int u\,dv = uv - \int v\,du`)}
      <p>Choose ${ti('u')} to get simpler when differentiated and ${ti('dv')} easy to integrate. For ${ti(R`\int_0^1 xe^x\,dx`)} take ${ti('u = x')}, ${ti(R`dv = e^x dx`)}, so ${ti('du = dx')}, ${ti(R`v = e^x`)}:</p>
      ${al(R`\int_0^1 x e^x\,dx &= \big[x e^x\big]_0^1 - \int_0^1 e^x\,dx`, R`&= e - (e - 1) = 1`)}
      <p>The figure plots ${ti(R`(u, v) = (x, e^x)`)}. The curve splits the rectangle ${ti('uv')} into ${ti(R`\int v\,du`)} below (red) and ${ti(R`\int u\,dv`)} beside it (blue): at ${ti('x = 1')}, ${ti('(e - 1) + 1 = e')}.</p>
      <p>The same choice works for ${ti(R`\int x\cos x\,dx = x\sin x + \cos x + C`)}. For ${ti(R`\int \ln x\,dx`)}, take ${ti(R`u = \ln x`)}, ${ti('dv = dx')}.</p>`,
    cam: { target: [ST.parts + 0.15, 0.1, 0], az: -3, el: 3, dist: 22 }, lit: 'rectP', look: {}, scene: 'parts',
    fig: 'uv, split by the curve',
  },
  {
    kicker: '6.12 · BC', title: 'Partial fractions', sub: 'split, then take logs',
    body: `
      <p class="lede">If the bottom factors into distinct linear factors, the function splits into simple fractions, each integrating to a log.</p>
      ${al(R`\frac{3}{x(x+3)} &= \frac{A}{x} + \frac{B}{x+3}`, R`3 &= A(x+3) + Bx`)}
      <p>Choose ${ti('x')} to kill a term: ${ti('x = 0')} gives ${ti('3 = 3A')}, so ${ti('A = 1')}; ${ti('x = -3')} gives ${ti('3 = -3B')}, so ${ti('B = -1')}.</p>
      ${al(R`&\int_1^3 \Big(\frac1x - \frac{1}{x+3}\Big)dx`, R`&= \Big[\ln\frac{x}{x+3}\Big]_1^3 = \ln\frac12 - \ln\frac14`, R`&= \ln 2 \approx ${f(M.PF12, 3)}`)}
      <p>In the figure the red ${ti(R`\tfrac1x`)} and the blue ${ti(R`-\tfrac{1}{x+3}`)} add, height by height, to the black curve: the red bar rises, the blue bar comes back down, and they end on it. The grey area is ${ti(R`\ln 2`)}. (If the top’s degree is not less than the bottom’s, divide first.)</p>`,
    cam: { target: [ST.pf + 0.35, 0.3, 0], az: -3, el: 3, dist: 22 }, lit: 'pieceA', look: {}, scene: 'pf',
    fig: 'Two simple pieces, one curve',
  },
  {
    kicker: '6.13 · BC', title: 'Improper integrals', sub: 'an endless region, a finite area?',
    body: `
      <p class="lede">An integral over an infinite interval, or of a function that blows up, is defined as a limit. If the limit exists the integral <b>converges</b>; if not, it <b>diverges</b>.</p>
      ${al(R`\int_1^\infty \frac{dx}{x^2} &= \lim_{b\to\infty}\Big(1 - \frac1b\Big) = 1`, R`\int_1^\infty \frac{dx}{x} &= \lim_{b\to\infty} \ln b = \infty`)}
      <p>The two curves look alike, but in the lower figure the red area so far levels off at 1 while the blue keeps climbing. At ${ti(`b = ${M.B13}`)} they are ${f(M.area2(M.B13), 3)} and ${f(M.area1(M.B13), 3)}; ${ti(R`\ln b`)} passes any bound, just slowly. In general ${ti(R`\int_1^\infty x^{-p}\,dx`)} converges exactly when ${ti('p > 1')}.</p>
      <p>When the function is unbounded at an endpoint, take the limit there:</p>
      ${td(R`\int_0^1 \frac{dx}{\sqrt x} = \lim_{a\to 0^+}\big(2 - 2\sqrt a\big) = 2`)}`,
    cam: { target: [ST.improper + 0.3, -0.45, 0], az: -3, el: 3, dist: 27 }, lit: 'tally', look: {}, scene: 'improper',
    fig: 'One area settles, one does not',
  },
  {
    kicker: '6.14', title: 'Choosing a technique', sub: 'read the integrand first',
    body: `
      <p class="lede">Before integrating, look at the integrand’s form; it usually names the method.</p>
      <table class="data">
        <tr><th>integrand</th><th>method</th><th>antiderivative</th><th>${ti(R`\int_0^3`)}</th></tr>
        ${M.PICK.map(p => `<tr><td>${ti(p.tex)}</td><td>${p.how}</td><td>${ti(p.anti)}</td><td>${f(p.val, 3)}</td></tr>`).join('')}
      </table>
      <p>Check in this order: a basic rule (after expanding, if need be); a function times its inner derivative; a rational function, top degree ≥ bottom; a quadratic bottom with no real roots; in BC, a product of unlike types, or a bottom with distinct linear factors.</p>
      <p>Mind the near-misses: ${ti(R`\frac{2x}{x^2+1}`)} is a substitution (a log), but ${ti(R`\frac{1}{x^2+1}`)} is an arctan.</p>`,
    cam: { target: [ST.pick + 0.2, 0.4, 0], az: -3, el: 3, dist: 22 }, lit: 'integrand', look: {}, scene: 'pick',
    fig: 'Six integrands, six methods',
  },
];

const f3 = x => f(x, 3);
export const PLATES = {
  // opener, 6.2, 6.3
  curveR: { text: 'The function being integrated, f(x) = 1 + x²/4 on [0, 4]. It is increasing and concave up there, which decides which sums overshoot. The exact area under it is 28/3.', facts: () => [['f(0), f(4)', '1, 5'], ['antiderivative', 'x + x³/12'], ['exact area', f3(M.EXACT)]] },
  slabsR: { text: 'Each slab is one term of the sum: a height times a width Δx. Its height comes from the left end, the right end or the middle of its piece; a trapezoid uses both ends. More pieces, smaller error.', facts: s => {
    const k = live.cyc ? M.kindAt(s.c) : 'right', n = live.cyc ? M.N2 : live.open ? M.N0 : M.nAt(s.c), v = M.sum(k, n);
    return [['kind', k], ['n', `${n}`], ['Δx', f3(4 / n)], ['sum', f3(v)], ['exact', f3(M.EXACT)], ['error', f3(v - M.EXACT)]]; } },
  // 6.1
  rate: { text: 'The velocity v(t) = t(4 − t) m/s. Above the axis the particle moves forward; below, backward. The area under it, counting below-axis area as negative, is the displacement.', facts: () => [['area 0–4 s', `+${f3(M.FWD1)} m`], ['area 4–5 s', `−${f3(M.BACK1)} m`], ['displacement', `${f3(M.DISP1)} m`], ['distance', `${f3(M.DIST1)} m`]] },
  now: { text: 'The moment the area has been swept to. The rate here is how fast the area, and so the position, is changing.', facts: s => { const t = M.flowT(s.c); return [['t', `${f(t)} s`], ['v(t)', `${f(M.v1(t))} m/s`], ['area so far', `${f3(M.X1(t))} m`]]; } },
  track: { text: 'Where the particle is: the signed area from 0 to now. It moves forward while v > 0, stops at t = 4 and comes back.', facts: s => { const t = M.flowT(s.c), x = M.X1(t), d = t <= 4 ? x : M.FWD1 + (M.FWD1 - x); return [['t', `${f(t)} s`], ['position', `${f3(x)} m`], ['distance so far', `${f3(d)} m`]]; } },
  // 6.4–6.5
  fGraph: { text: 'f: a semicircle of radius 2 centred at the origin, then a segment from (2, 0) to (4, −2) and one back up to (6, 0). Area above the axis adds to g; area below takes away.', facts: s => { const x = M.accX(s.c); return [['x', f(x)], ['f(x)', f3(M.fS(x))], ['area above', '2π'], ['area below', '4']]; } },
  gGraph: { text: 'g(x) = ∫ f(t) dt from −2 to x, the signed area so far. Grey is the whole graph; red is what has been swept.', facts: s => { const x = M.accX(s.c); return [['x', f(x)], ['g(x)', f3(M.gS(x))], ['g(−2), g(2), g(6)', `0, ${f3(2 * Math.PI)}, ${f3(M.gS(6))}`]]; } },
  tangentG: { text: 'The tangent to g at x. Its slope is f(x), read straight off the graph above: the Fundamental Theorem of Calculus, d/dx ∫ f(t) dt = f(x).', facts: s => { const x = M.accX(s.c), h = 1e-4; return [['x', f(x)], ['slope of g (numerical)', f3((M.gS(x + h) - M.gS(x - h)) / (2 * h))], ['f(x)', f3(M.fS(x))]]; } },
  features: { text: 'g has its maximum where f crosses from positive to negative (x = 2), and inflection points where f turns (x = 0, its peak, and x = 4, its lowest point).', facts: () => [['max', `g(2) = 2π ≈ ${f3(2 * Math.PI)}`], ['inflection', `g(0) = π ≈ ${f3(Math.PI)}`], ['inflection', `g(4) = 2π − 2 ≈ ${f3(M.gS(4))}`], ['absolute min', 'g(−2) = 0']] },
  // 6.6
  fProp: { text: 'The same f: a semicircle, then a triangle below the axis.', facts: () => [['∫ from −2 to 2', `2π ≈ ${f3(2 * Math.PI)}`], ['∫ from 2 to 6', '−4'], ['∫ from −2 to 6', `2π − 4 ≈ ${f3(M.intS(-2, 6))}`]] },
  splitC: { text: 'Split [−2, 6] at c: the integral from −2 to c (red) plus the integral from c to 6 (blue) is the whole, wherever c is.', facts: s => { const c = M.propC(s.c), l = M.intS(-2, c), r = M.intS(c, 6); return [['c', f(c)], ['∫ from −2 to c', f3(l)], ['∫ from c to 6', f3(r)], ['sum', f3(l + r)]]; } },
  // 6.7
  fFtc: { text: 'f(x) = x². The red area runs from a = 1 to b.', facts: s => { const b = M.ftcB(s.c); return [['b', f(b)], ['area (Simpson)', f3(M.simpson(M.f7, 1, Math.max(b, 1)))]]; } },
  FFtc: { text: 'F(x) = x³/3 + C. Any C gives an antiderivative of x²; the figure keeps changing it.', facts: s => [['C now', f(M.ftcC(s.c))], ['F′(x)', 'x²']] },
  rise: { text: 'The rise of F from x = a to x = b. It equals the area under f, and C, which lifts both ends equally, cancels.', facts: s => { const b = M.ftcB(s.c), C = M.ftcC(s.c); return [['F(a)', f3(M.F7(1) + C)], ['F(b)', f3(M.F7(b) + C)], ['F(b) − F(a)', f3(M.F7(b) - M.F7(1))], ['at b = 2', `7/3 ≈ ${f3(M.FTC7)}`]]; } },
  // 6.8
  family: { text: 'Antiderivatives of x² − 1 differ by a constant: each is x³/3 − x shifted up or down. At any x their tangents are parallel.', facts: s => { const x = M.famX(s.c); return [['x', f(x)], ['slope of each', f3(M.f8(x))], ['C shown', '−2, −1, 0, 1, 2']] } },
  picked: { text: 'An initial condition chooses one member: F(0) = 1 gives 0 − 0 + C = 1, so F(x) = x³/3 − x + 1.', facts: s => { const x = M.famX(s.c); return [['F(x)', 'x³/3 − x + 1'], ['F(0)', '1'], [`F(${f(x)})`, f3(M.F8(x) + 1)]]; } },
  // 6.9
  xSide: { text: 'The integral as written, in x: 2x cos(x²) from 0 to √(π/2).', facts: s => { const x = M.subX(s.c); return [['x', f3(x)], ['area so far', f3(M.simpson(M.h9, 0, x))]]; } },
  uSide: { text: 'After u = x²: cos u from 0 to π/2. Its area so far is sin u.', facts: s => { const x = M.subX(s.c); return [['u = x²', f3(x * x)], ['area so far, sin u', f3(Math.sin(x * x))]]; } },
  strips: { text: 'A strip of width dx at x, and where it lands in u: at x², width (x + dx)² − x² ≈ 2x dx. Taller and thinner, or shorter and wider: the same area.', facts: s => { const x = M.subX(s.c), x2 = Math.min(x + M.DX9, M.XB9); return [['width in x', f3(x2 - x)], ['width in u', f3(x2 * x2 - x * x)], ['area in x', f3(M.simpson(M.h9, x, x2, 40))], ['area in u', f3(Math.sin(x2 * x2) - Math.sin(x * x))]]; } },
  // 6.10
  quotient: { text: 'Long division: (x² + 2x + 2) ÷ (x + 1) = x + 1, remainder 1. The blue line is the quotient x + 1; the red layer is 1/(x + 1).', facts: () => [['∫₀² (x + 1)', '4'], ['∫₀² 1/(x + 1)', `ln 3 ≈ ${f3(Math.log(3))}`], ['total', f3(M.DIV10)]] },
  square: { text: 'x² + 2x + 5 = (x + 1)² + 4, so the curve is 4/(u² + 4) moved left by 1, and integrates to an arctan.', facts: s => [['shift now', f(M.shift10(s.c))], ['∫ from −1 to 1', `π/2 ≈ ${f3(M.SQV10)}`]] },
  // 6.11
  curveP: { text: 'The curve traced by (u, v) = (x, eˣ) as x runs from 0 to 1.', facts: s => { const x = M.partsS(s.c); return [['x', f3(x)], ['u', f3(x)], ['v', f3(Math.exp(x))]]; } },
  rectP: { text: 'The rectangle with corner (u, v) has area uv. The curve cuts it into ∫ v du (red, under the curve) and ∫ u dv (blue, beside it). That is integration by parts, as a picture.', facts: s => { const x = M.partsS(s.c); return [['uv', f3(x * Math.exp(x))], ['∫ v du', f3(M.vdu(x))], ['∫ u dv', f3(M.udv(x))], ['sum', f3(M.vdu(x) + M.udv(x))]]; } },
  // 6.12
  fPf: { text: 'The integrand 3/(x(x + 3)), the sum of the two pieces. The grey area from 1 to 3 is ln 2.', facts: s => { const x = M.pfX(s.c); return [['x', f(x)], ['f(x)', f3(M.f12(x))], ['∫ from 1 to 3', `ln 2 ≈ ${f3(M.PF12)}`]]; } },
  pieceA: { text: '1/x: the piece A/x with A = 1, found by putting x = 0 in 3 = A(x + 3) + Bx.', facts: s => { const x = M.pfX(s.c); return [['x', f(x)], ['1/x', f3(M.pA12(x))], ['∫ from 1 to 3', `ln 3 ≈ ${f3(Math.log(3))}`]]; } },
  pieceB: { text: '−1/(x + 3): the piece B/(x + 3) with B = −1, found by putting x = −3.', facts: s => { const x = M.pfX(s.c); return [['x', f(x)], ['−1/(x + 3)', f3(M.pB12(x))], ['∫ from 1 to 3', `−ln (6/4) ≈ ${f3(-Math.log(1.5))}`]]; } },
  // 6.13
  inv1: { text: 'y = 1/x. The area from 1 to b is ln b, which grows without bound: ∫ from 1 to ∞ diverges.', facts: s => { const b = M.impB(s.c); return [['b', f(b)], ['area', f3(M.area1(b))], ['as b → ∞', '∞']]; } },
  inv2: { text: 'y = 1/x². The area from 1 to b is 1 − 1/b, which never passes 1: ∫ from 1 to ∞ converges to 1.', facts: s => { const b = M.impB(s.c); return [['b', f(b)], ['area', f3(M.area2(b))], ['as b → ∞', '1']]; } },
  tally: { text: 'The two areas as functions of b. 1 − 1/b approaches the red line at 1; ln b keeps rising.', facts: s => { const b = M.impB(s.c); return [['b', f(b)], ['1 − 1/b', f3(M.area2(b))], ['ln b', f3(M.area1(b))], ['at b = 1000', `${f3(M.area2(1000))}, ${f3(M.area1(1000))}`]]; } },
  // 6.14
  integrand: { text: 'One integrand at a time, each morphing into the next. The shaded area is its integral from 0 to 3.', facts: s => { const p = M.PICK[M.pickAt(s.c).i]; return [['method', p.how], ['∫ from 0 to 3', f3(p.val)]]; } },
};
