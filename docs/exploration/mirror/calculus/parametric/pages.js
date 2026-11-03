// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -0.5 * 10 ** -n ? '−' : '') + Math.abs(x).toFixed(n);
const g = (x, n = 3) => { const r = +x.toFixed(n); return (r < 0 ? '−' : '') + Math.abs(r); };   // trailing zeros dropped
const rows = (head, list) => `<table class="data"><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr>${list.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;
const ang = th => ({ 0: '0', [Math.PI / 2]: 'π/2', [2 * Math.PI / 3]: '2π/3', [Math.PI]: 'π', [3 * Math.PI / 2]: '3π/2' })[th];
const WRONG_SQ = M.simpson(th => 0.5 * (M.R(th) - M.RC) ** 2, -M.THT, M.THT);   // ½∫(R − r)², the mistake

export const PAGES = [
  {
    kicker: 'Chapter 9', title: 'Parametric, polar and vector', sub: 'curves traced in time',
    body: `
      <p class="lede">Until now a curve was a graph, <i>y</i> as a function of <i>x</i>. In this chapter a point moves, and its <i>x</i> and <i>y</i> are each a function of time.</p>
      <p>This whole unit is <b>BC only</b>: AP Calculus BC Unit 9.</p>
      <p>The figure lifts each point of the path <i>x</i> = <i>t</i>², <i>y</i> = <i>t</i>³ − 3<i>t</i> off the paper by its time <i>t</i>. The path on the paper is the shadow of a curve in space, and the height that the shadow forgets is the timing.</p>
      <p>Three languages run through the chapter: <b>parametric equations</b> (<i>x</i> and <i>y</i> in terms of <i>t</i>), <b>vectors</b> (position, velocity and acceleration as arrows) and <b>polar coordinates</b> (a distance <i>r</i> at an angle θ). The questions are the old ones (slope, concavity, length, area), asked in the new languages.</p>`,
    cam: { target: [2, 0, 1.3], az: -40, el: 24, dist: 25 }, lit: 'lifted', look: {}, scene: 'lift',
    fig: 'A path, and its timing',
  },
  {
    kicker: '9.1', title: 'Parametric equations', sub: 'x and y, each run by t',
    body: `
      <p class="lede">A pair of equations <i>x</i> = <i>f</i>(<i>t</i>), <i>y</i> = <i>g</i>(<i>t</i>) gives a point for every value of the parameter <i>t</i>. As <i>t</i> runs, the point traces a curve, in a direction. Here −2 ≤ <i>t</i> ≤ 2:</p>
      <div class="eq">${tex(String.raw`x = t^2,\quad y = t^3 - 3t`)}</div>
      ${rows(['<i>t</i>', '−2', '−1', '0', '1', '2'], [['<i>x</i>', ...[-2, -1, 0, 1, 2].map(t => g(M.X(t)))], ['<i>y</i>', ...[-2, -1, 0, 1, 2].map(t => g(M.Y(t)))]])}
      <p>The point starts at (4, −2), rises to (1, 2), passes the origin at <i>t</i> = 0, dips to (1, −2) and climbs back to (4, 2). It visits (3, 0) twice, at <i>t</i> = −√3 and <i>t</i> = √3: a parametric curve can cross itself, which no graph of a function can.</p>
      <p><b>Eliminating the parameter</b>: <i>y</i> = <i>t</i>(<i>t</i>² − 3), so <i>y</i>² = <i>t</i>²(<i>t</i>² − 3)² = <i>x</i>(<i>x</i> − 3)². That equation has the same points but has lost the direction and the timing; the cones on the paper keep the direction, and the lifted curve keeps the timing.</p>`,
    cam: { target: [2, 0, 1.1], az: -24, el: 14, dist: 22 }, lit: 'path', look: {}, scene: 'lift',
    fig: 'x = t², y = t³ − 3t',
  },
  {
    kicker: '9.2', title: 'The slope of a parametric curve', sub: 'dy/dx = (dy/dt)/(dx/dt)',
    body: `
      <p class="lede">In a short time <i>dt</i> the point moves <i>dx</i> across and <i>dy</i> up. The slope is their ratio, and the <i>dt</i> cancels:</p>
      <div class="eq">${tex(String.raw`\frac{dy}{dx} = \frac{dy/dt}{dx/dt}, \qquad \frac{dx}{dt} \ne 0`)}</div>
      <p>For the loop, <i>dx</i>/<i>dt</i> = 2<i>t</i> and <i>dy</i>/<i>dt</i> = 3<i>t</i>² − 3. At <i>t</i> = ${M.TS} the point is (${M.X(M.TS)}, ${M.Y(M.TS)}), with <i>dx</i>/<i>dt</i> = ${M.DX(M.TS)} and <i>dy</i>/<i>dt</i> = ${M.DY(M.TS)}:</p>
      <div class="eq">${tex(String.raw`\left.\frac{dy}{dx}\right|_{t=${M.TS}} = \frac{${M.DY(M.TS)}}{${M.DX(M.TS)}} = ${g(M.slope(M.TS))}`)}</div>
      <p>Tangent line: <i>y</i> − ${M.Y(M.TS)} = ${g(M.slope(M.TS))}(<i>x</i> − ${M.X(M.TS)}). The blue arrows are the run <i>dx</i>/<i>dt</i> and the rise <i>dy</i>/<i>dt</i> per unit of time.</p>
      <p><b>Horizontal tangent</b>: <i>dy</i>/<i>dt</i> = 0 with <i>dx</i>/<i>dt</i> ≠ 0, at <i>t</i> = ±${M.TH}, the points (1, −2) and (1, 2). <b>Vertical tangent</b>: <i>dx</i>/<i>dt</i> = 0 with <i>dy</i>/<i>dt</i> ≠ 0, at <i>t</i> = 0, the origin. At (3, 0) there are two tangents, slopes ±√3 ≈ ±${f(M.slope(M.TC))}, one for each pass.</p>`,
    cam: { target: [16.1, 0, 0], az: -8, el: 6, dist: 21 }, lit: 'sTangent', look: {}, scene: 'slope',
    fig: 'Rise over run, per unit of time',
  },
  {
    kicker: '9.3', title: 'The second derivative', sub: 'differentiate the slope, then divide by dx/dt again',
    body: `
      <p class="lede"><i>d</i>²<i>y</i>/<i>dx</i>² is how fast the slope changes per unit of <i>x</i>. Differentiate the slope in <i>t</i>, then divide by <i>dx</i>/<i>dt</i> once more:</p>
      <div class="eq">${tex(String.raw`\frac{d^2y}{dx^2} = \frac{\dfrac{d}{dt}\!\left(\dfrac{dy}{dx}\right)}{dx/dt}`)}</div>
      <p>For the loop, ${tex.inline(String.raw`\frac{dy}{dx} = \frac{3t^2 - 3}{2t} = \tfrac32 t - \tfrac32 t^{-1}`)}, with <i>t</i>-derivative ${tex.inline(String.raw`\tfrac32 + \tfrac{3}{2t^2}`)}; divide by 2<i>t</i>:</p>
      <div class="eq">${tex(String.raw`\frac{d^2y}{dx^2} = \frac{3(t^2+1)}{4t^3}`)}</div>
      <p>At <i>t</i> = ${M.TS} it is 15/32 ≈ ${f(M.d2(M.TS), 3)}, positive: concave up. Its sign is that of <i>t</i>: the red half (<i>t</i> &gt; 0) bends up, the blue half (<i>t</i> &lt; 0) bends down.</p>
      <p><b>The trap</b>: (<i>d</i>²<i>y</i>/<i>dt</i>²)/(<i>d</i>²<i>x</i>/<i>dt</i>²) = 6<i>t</i>/2 = ${g(M.D2Y(M.TS) / M.D2X())} at <i>t</i> = ${M.TS}. That is not <i>d</i>²<i>y</i>/<i>dx</i>².</p>`,
    cam: { target: [30.1, 0, 0], az: -8, el: 6, dist: 21 }, lit: 'cUp', look: {}, scene: 'concave',
    fig: 'Bending up, bending down',
  },
  {
    kicker: '9.4', title: 'Arc length', sub: 'adding up the speed',
    body: `
      <p class="lede">In a time <i>dt</i> the point moves a distance ${tex.inline(String.raw`\sqrt{dx^2 + dy^2} = \sqrt{(dx/dt)^2 + (dy/dt)^2}\,dt`)}. Add those up:</p>
      <div class="eq">${tex(String.raw`L = \int_a^b \sqrt{\left(\frac{dx}{dt}\right)^2 + \left(\frac{dy}{dt}\right)^2}\,dt`)}</div>
      <p>This counts the curve once only if it is traced once as <i>t</i> goes from <i>a</i> to <i>b</i>. The loop is traced once for −√3 ≤ <i>t</i> ≤ √3:</p>
      <div class="eq">${tex(String.raw`L = \int_{-\sqrt3}^{\sqrt3} \sqrt{4t^2 + (3t^2 - 3)^2}\,dt`)}</div>
      <p>which is ${f(M.LOOP_L, 3)}. No antiderivative is in sight: like most AP arc lengths, this is a calculator integral. The red chords show where the formula comes from: each is ${tex.inline(String.raw`\sqrt{\Delta x^2 + \Delta y^2}`)}, close to ${tex.inline(String.raw`\sqrt{x'^2 + y'^2}\,\Delta t`)}, and their total climbs to the length from below.</p>
      ${rows(['chords', ...[2, 4, 8, 24].map(String)], [['total', ...[2, 4, 8, 24].map(n => f(M.chordLen(n), 3))]])}`,
    cam: { target: [44.1, 0, 0], az: -8, el: 6, dist: 21 }, lit: 'aChords', look: {}, scene: 'arc',
    fig: 'Chords, closing in on the length',
  },
  {
    kicker: '9.5', title: 'Vector-valued functions', sub: 'position, velocity, acceleration',
    body: `
      <p class="lede">Write the moving point as one object, its position vector <b>r</b>(<i>t</i>) = ⟨<i>x</i>(<i>t</i>), <i>y</i>(<i>t</i>)⟩. Its derivatives are taken component by component:</p>
      <div class="eq">${tex(String.raw`\begin{aligned} \mathbf r(t) &= \langle t^2,\ t^3 - 3t\rangle \\ \mathbf v(t) = \mathbf r'(t) &= \langle 2t,\ 3t^2 - 3\rangle \\ \mathbf a(t) = \mathbf v'(t) &= \langle 2,\ 6t\rangle \end{aligned}`)}</div>
      <p>At <i>t</i> = ${M.TS}: <b>r</b> = ⟨${M.X(M.TS)}, ${M.Y(M.TS)}⟩, <b>v</b> = ⟨${M.DX(M.TS)}, ${M.DY(M.TS)}⟩, <b>a</b> = ⟨${M.D2X()}, ${M.D2Y(M.TS)}⟩. The <b>speed</b> is the length of the velocity:</p>
      <div class="eq">${tex(String.raw`|\mathbf v(${M.TS})| = \sqrt{${M.DX(M.TS)}^2 + ${M.DY(M.TS)}^2} = \sqrt{${M.DX(M.TS) ** 2 + M.DY(M.TS) ** 2}} \approx ${f(M.speed(M.TS), 3)}`)}</div>
      <p>The velocity is tangent to the path and points the way the particle is going; its slope ${M.DY(M.TS)}/${M.DX(M.TS)} is the <i>dy</i>/<i>dx</i> of 9.2. The acceleration points into the bend, toward the concave side; any part of it along <b>v</b> changes the speed.</p>`,
    cam: { target: [58.3, 0.3, 0], az: -8, el: 6, dist: 23 }, lit: 'vVel', look: {}, scene: 'vec',
    fig: 'r, v and a',
  },
  {
    kicker: '9.6', title: 'Integrating vector functions', sub: 'from velocity back to position',
    body: `
      <p class="lede">A vector function is integrated component by component. Going from velocity back to position also needs a starting point, which plays the part of +<i>C</i>:</p>
      <div class="eq">${tex(String.raw`\mathbf r(b) = \mathbf r(a) + \int_a^b \mathbf v(t)\,dt`)}</div>
      <p>A point on the rim of a rolling wheel has <b>v</b>(<i>t</i>) = ⟨1 − cos <i>t</i>, sin <i>t</i>⟩ and starts at <b>r</b>(0) = ⟨0, 0⟩. Where is it at <i>t</i> = π?</p>
      <div class="eq">${tex(String.raw`\begin{aligned} x(\pi) &= 0 + \int_0^\pi (1 - \cos t)\,dt = \pi \\ y(\pi) &= 0 + \int_0^\pi \sin t\,dt = 2 \end{aligned}`)}</div>
      <p>So <b>r</b>(π) = ⟨π, 2⟩, and for any <i>t</i>, <b>r</b>(<i>t</i>) = ⟨<i>t</i> − sin <i>t</i>, 1 − cos <i>t</i>⟩.</p>
      <p>The figure does the same integral as a sum: ${M.STEPS} short steps <b>v</b>(<i>t</i><sub><i>k</i></sub>)Δ<i>t</i> laid tip to tail. After ${M.STEPS / 2} steps the sum is ⟨${f(M.sumPath(M.STEPS / 2)[M.STEPS / 2][0], 3)}, ${f(M.sumPath(M.STEPS / 2)[M.STEPS / 2][1], 3)}⟩ against the exact ⟨π, 2⟩; after ${M.STEPS} it lands on ⟨2π, 0⟩. Another start would shift the whole path: the integral gives only the displacement.</p>`,
    cam: { target: [73.3, 1.0, 0], az: -6, el: 6, dist: 17 }, lit: 'iSteps', look: {}, scene: 'integ',
    fig: 'Velocity, added up',
  },
  {
    kicker: '9.7', title: 'Motion in the plane', sub: 'speed, distance and displacement',
    body: `
      <p class="lede">The rim point of 9.6 is a particle in motion: a wheel of radius 1 rolls right at one radian per second, and the point traces a cycloid.</p>
      <div class="eq">${tex(String.raw`\begin{aligned} |\mathbf v| &= \sqrt{(1 - \cos t)^2 + \sin^2 t} \\ &= \sqrt{2 - 2\cos t} = 2\left|\sin\tfrac t2\right| \end{aligned}`)}</div>
      <p>The speed is 0 at <i>t</i> = 0 and 2π, where the point touches the ground: it stops for an instant, then lifts straight up. It peaks at ${f(M.cspeed(M.CTM), 0)} at the top, <i>t</i> = π, twice the speed of the hub. It moves up while <i>dy</i>/<i>dt</i> = sin <i>t</i> &gt; 0, and never left: <i>dx</i>/<i>dt</i> = 1 − cos <i>t</i> ≥ 0.</p>
      ${rows(['one arch, 0 ≤ <i>t</i> ≤ 2π', 'integral of', 'value'], [['distance travelled', 'speed |<b>v</b>|', `∫ 2 sin(<i>t</i>/2) <i>dt</i> = ${f(M.ARCH, 0)}`], ['displacement', 'velocity <b>v</b>', `⟨2π, 0⟩, length ${f(M.CT1, 3)}`]])}
      <p>Distance integrates the speed; displacement integrates the velocity. The acceleration <b>a</b> = ⟨sin <i>t</i>, cos <i>t</i>⟩ has length 1 at every instant and points from the rim point to the hub.</p>`,
    cam: { target: [87.5, 1.0, 0.3], az: -10, el: 9, dist: 21 }, lit: 'wVel', look: {}, scene: 'wheel',
    fig: 'A rolling wheel’s rim point',
  },
  {
    kicker: '9.8', title: 'Polar coordinates', sub: 'a distance at an angle',
    body: `
      <p class="lede">A point can be named by its distance <i>r</i> from the pole (the origin) and the angle θ its ray makes with the positive <i>x</i>-axis.</p>
      <div class="eq">${tex(String.raw`\begin{gathered} x = r\cos\theta,\quad y = r\sin\theta \\ r^2 = x^2 + y^2,\quad \tan\theta = \tfrac yx \end{gathered}`)}</div>
      <p>A polar curve gives <i>r</i> as a function of θ. The cardioid <i>r</i> = 2 + 2 cos θ:</p>
      ${rows(['θ', ...[0, Math.PI / 2, 2 * Math.PI / 3, Math.PI, 3 * Math.PI / 2].map(ang)], [['<i>r</i>', ...[0, Math.PI / 2, 2 * Math.PI / 3, Math.PI, 3 * Math.PI / 2].map(th => g(M.R(th)))], ['(<i>x</i>, <i>y</i>)', ...[0, Math.PI / 2, 2 * Math.PI / 3, Math.PI, 3 * Math.PI / 2].map(th => `(${g(M.PX(th) + 0)}, ${g(M.PY(th) + 0)})`)]])}
      <p>Read the curve off the graph of <i>r</i> against θ below it: each height there is the length of the blue ray above. As θ goes from 0 to π, <i>r</i> falls from 4 to 0 and the point slides in to the pole; from π to 2π it grows back to 4, tracing the lower half.</p>
      <p>A negative <i>r</i> means stepping backward along the ray, into the opposite quadrant: (−2, π/3) is the point (−1, −√3). This cardioid never has one.</p>`,
    cam: { target: [101.4, -2.3, 0], az: -5, el: 5, dist: 33 }, lit: 'pRay', look: {}, scene: 'polar',
    fig: 'r = 2 + 2 cos θ',
  },
  {
    kicker: '9.9', title: 'Slopes of polar curves', sub: 'θ is the parameter',
    body: `
      <p class="lede">A polar curve is a parametric curve in θ: <i>x</i> = <i>r</i> cos θ, <i>y</i> = <i>r</i> sin θ. So <i>dy</i>/<i>dx</i> = (<i>dy</i>/<i>d</i>θ)/(<i>dx</i>/<i>d</i>θ), each by the product rule:</p>
      <div class="eq">${tex(String.raw`\frac{dy}{dx} = \frac{\dfrac{dr}{d\theta}\sin\theta + r\cos\theta}{\dfrac{dr}{d\theta}\cos\theta - r\sin\theta}`)}</div>
      <p>At θ = π/2 on the cardioid, <i>r</i> = ${f(M.R(M.THS), 0)} and <i>dr</i>/<i>d</i>θ = −2 sin θ = ${f(M.DR(M.THS), 0)}:</p>
      <div class="eq">${tex(String.raw`\frac{dy}{dx} = \frac{(-2)(1) + (2)(0)}{(-2)(0) - (2)(1)} = ${f(M.pslope(M.THS), 0)}`)}</div>
      <p><b><i>dr</i>/<i>d</i>θ is not the slope.</b> Its sign says whether the point is moving away from the pole (<i>dr</i>/<i>d</i>θ &gt; 0) or toward it (&lt; 0): the blue arrow on the ray. At θ = π/2 it is closing in at 2 units per radian.</p>
      <p>A horizontal tangent needs <i>dy</i>/<i>d</i>θ = 0. At θ = π/3, <i>r</i> = 3 and <i>dr</i>/<i>d</i>θ = −√3, so <i>dy</i>/<i>d</i>θ = −√3·(√3/2) + 3·(1/2) = 0: the top of the cardioid, (${f(M.PX(M.THT), 1)}, ${f(M.PY(M.THT), 3)}).</p>`,
    cam: { target: [117.4, 0, 0], az: -6, el: 6, dist: 22 }, lit: 'qRay', look: {}, scene: 'pslope',
    fig: 'Tangent, ray and dr/dθ',
  },
  {
    kicker: '9.10', title: 'Area in polar', sub: 'wedges, not rectangles',
    body: `
      <p class="lede">Polar area is cut into thin wedges from the pole. A wedge of radius <i>r</i> and angle Δθ is a sector of a circle, of area ½<i>r</i>²Δθ. Add them up:</p>
      <div class="eq">${tex(String.raw`A = \frac12\int_\alpha^\beta r^2\,d\theta`)}</div>
      <p>The cardioid’s first-quadrant region, 0 ≤ θ ≤ π/2, using (2 + 2 cos θ)² = 6 + 8 cos θ + 2 cos 2θ:</p>
      <div class="eq">${tex(String.raw`\begin{aligned} A &= \tfrac12\int_0^{\pi/2}(2 + 2\cos\theta)^2\,d\theta \\ &= \tfrac12\Big[6\theta + 8\sin\theta + \sin 2\theta\Big]_0^{\pi/2} \\ &= \tfrac{3\pi}{2} + 4 \approx ${f(M.AQ, 3)} \end{aligned}`)}</div>
      ${rows(['wedges', ...M.WEDGE_NS.filter(n => n !== 16).map(String)], [['½Σ<i>r</i>²Δθ', ...M.WEDGE_NS.filter(n => n !== 16).map(n => f(M.wedgeSum(n), 3))]])}
      <p>The whole cardioid, 0 to 2π, has area 6π ≈ ${f(M.AFULL)}. The limits are angles, and they must sweep the region exactly once: the circle <i>r</i> = 3 cos θ is traced once by 0 ≤ θ ≤ π, so 0 to 2π would count it twice.</p>`,
    cam: { target: [131.4, 0, 0], az: -6, el: 8, dist: 22 }, lit: 'rWedges', look: {}, scene: 'parea',
    fig: 'Wedges filling the quadrant',
  },
  {
    kicker: '9.11', title: 'Area between polar curves', sub: 'outer squared minus inner squared',
    body: `
      <p class="lede">Between two polar curves each wedge is a sector of the outer curve with a sector of the inner curve taken out:</p>
      <div class="eq">${tex(String.raw`A = \frac12\int_\alpha^\beta \left(R^2 - r^2\right)d\theta`)}</div>
      <p>Take the region inside the cardioid <i>R</i> = 2 + 2 cos θ and outside the circle <i>r</i> = 3. They meet where 2 + 2 cos θ = 3, so cos θ = ½ and θ = ±π/3:</p>
      <div class="eq">${tex(String.raw`\begin{aligned} A &= \tfrac12\int_{-\pi/3}^{\pi/3}\left[(2 + 2\cos\theta)^2 - 9\right]d\theta \\ &= \tfrac12\Big[-3\theta + 8\sin\theta + \sin 2\theta\Big]_{-\pi/3}^{\pi/3} \\ &= \tfrac{9\sqrt3 - 2\pi}{2} \approx ${f(M.AB, 3)} \end{aligned}`)}</div>
      <p>Square first, then subtract. ½∫(<i>R</i> − <i>r</i>)² <i>d</i>θ gives ${f(WRONG_SQ, 3)}, far too small: a wedge’s area grows with the square of its radius. Every time: sketch, solve for where the curves meet, decide which is outer, integrate.</p>`,
    cam: { target: [144.5, 0, 0], az: -6, el: 6, dist: 24 }, lit: 'bRegion', look: {}, scene: 'between',
    fig: 'Inside one, outside the other',
  },
];

const pt = (x, y) => `(${f(x)}, ${f(y)})`;
export const PLATES = {
  // lift
  path: { text: 'The path on the paper: every point (t², t³ − 3t) for −2 ≤ t ≤ 2. The cones show the direction of travel, which a Cartesian equation cannot.', facts: s => [['t', f(s.lift)], ['(x, y)', pt(M.X(s.lift), M.Y(s.lift))], ['Cartesian form', 'y² = x(x − 3)²']] },
  lifted: { text: 'Each point raised off the paper by a height proportional to its t. Seen from above, this space curve is the path; seen from the side, its height is the clock. The curtain joins the two.', facts: s => [['t', f(s.lift)], ['height', `${f((s.lift - M.T0) * 0.75)} (0.75 per unit of t)`]] },
  particle: { text: 'The moving point, on the paper and on the lifted curve. It passes (3, 0) twice, at t = ±√3, at different heights: the same place at two different times.', facts: s => [['t', f(s.lift)], ['x = t²', f(M.X(s.lift))], ['y = t³ − 3t', f(M.Y(s.lift))]] },
  // slope
  sCurve: { text: 'The loop again. Its slope at a point comes from how fast x and y change in time, not from a formula y = f(x), which this curve does not have.', facts: s => [['t', f(s.slope)], ['(x, y)', pt(M.X(s.slope), M.Y(s.slope))]] },
  sTangent: { text: 'The tangent line at the moving point. Its slope is (dy/dt)/(dx/dt); it lies flat where dy/dt = 0 and stands upright where dx/dt = 0.', facts: s => [['dy/dt', f(M.DY(s.slope))], ['dx/dt', f(M.DX(s.slope))], ['dy/dx', Math.abs(M.DX(s.slope)) < 1e-6 ? 'undefined (vertical)' : f(M.slope(s.slope))]] },
  sRates: { text: 'The run dx/dt and the rise dy/dt, both per unit of time, drawn to scale. Their ratio is the slope; the time unit cancels.', facts: s => [['dx/dt = 2t', f(M.DX(s.slope))], ['dy/dt = 3t² − 3', f(M.DY(s.slope))]] },
  sSpecial: { text: 'Horizontal tangents at (1, 2) and (1, −2), where dy/dt = 0 (t = ∓1) and dx/dt ≠ 0. A vertical tangent at the origin, where dx/dt = 0 (t = 0) and dy/dt = −3 ≠ 0.', facts: () => [['t = −1', 'dy/dt = 0, dx/dt = −2'], ['t = 1', 'dy/dt = 0, dx/dt = 2'], ['t = 0', 'dx/dt = 0, dy/dt = −3']] },
  // concave
  cUp: { text: 'The half traced for 0 < t ≤ 2. Here d²y/dx² = 3(t² + 1)/(4t³) > 0: the curve bends up, lying above its tangent lines.', facts: s => [['t', f(s.concave)], ['d²y/dx²', s.concave > 1e-3 ? f(M.d2(s.concave), 3) : '(point on the other half)']] },
  cDown: { text: 'The half traced for −2 ≤ t < 0, the mirror image of the red half in the x-axis. Here t³ < 0, so d²y/dx² < 0: concave down.', facts: s => [['t', f(s.concave)], ['d²y/dx²', s.concave < -1e-3 ? f(M.d2(s.concave), 3) : '(point on the other half)']] },
  cTangent: { text: 'The tangent turns as the point moves. d²y/dx² measures how fast its slope changes per unit of x: the t-rate of the slope, divided by dx/dt.', facts: s => [['t', f(s.concave)], ['dy/dx', Math.abs(s.concave) < 1e-6 ? 'undefined' : f(M.slope(s.concave))], ['d/dt (dy/dx)', f(1.5 + 1.5 / s.concave ** 2)], ['d²y/dx²', Math.abs(s.concave) < 1e-6 ? 'undefined' : f(M.d2(s.concave), 3)]] },
  // arc
  aLoop: { text: 'The loop from t = −√3 to t = √3: it starts and ends at (3, 0) and is traced exactly once in between. Its length is a calculator integral of the speed.', facts: () => [['length', f(M.LOOP_L, 4)], ['integrand', '√(4t² + (3t² − 3)²)']] },
  aChords: { text: 'Straight chords between points equally spaced in t. Each is √(Δx² + Δy²); a straight line is the shortest route, so the total is always a little under the length, and closes in as the chords get shorter.', facts: s => [['chords', `${s.arc}`], ['total', f(M.chordLen(s.arc), 4)], ['short by', f(M.LOOP_L - M.chordLen(s.arc), 4)]] },
  // vec
  vCurve: { text: 'The particle moving along r(t) = ⟨t², t³ − 3t⟩ for −2 ≤ t ≤ 2.', facts: s => [['t', f(s.vec)], ['r(t)', `⟨${f(M.X(s.vec))}, ${f(M.Y(s.vec))}⟩`]] },
  vPos: { text: 'The position vector, from the origin to the particle. Its components are x(t) and y(t).', facts: s => [['r', `⟨${f(M.X(s.vec))}, ${f(M.Y(s.vec))}⟩`], ['distance from origin', f(Math.hypot(M.X(s.vec), M.Y(s.vec)))]] },
  vVel: { text: 'The velocity r′(t), drawn from the particle. Always tangent to the path; its length is the speed.', facts: s => [['v', `⟨${f(M.DX(s.vec))}, ${f(M.DY(s.vec))}⟩`], ['speed |v|', f(M.speed(s.vec))], ['slope of v', Math.abs(M.DX(s.vec)) < 1e-6 ? 'vertical' : f(M.slope(s.vec))]] },
  vAcc: { text: 'The acceleration v′(t). It points into the bend of the path. Where it has a part along v (a · v > 0) the particle is speeding up; against v, slowing down.', facts: s => { const t = s.vec, dot = M.DX(t) * 2 + M.DY(t) * 6 * t; return [['a', `⟨2, ${f(M.D2Y(t))}⟩`], ['a · v', f(dot)], ['speed is', dot > 1e-6 ? 'increasing' : dot < -1e-6 ? 'decreasing' : 'momentarily steady']]; } },
  // integ
  iPath: { text: 'The exact position r(t) = ⟨t − sin t, 1 − cos t⟩ = r(0) + ∫₀ᵗ v dt, with r(0) = ⟨0, 0⟩.', facts: () => [['r(π)', '⟨π, 2⟩ = ⟨3.142, 2⟩'], ['r(2π)', '⟨2π, 0⟩ = ⟨6.283, 0⟩']] },
  iSteps: { text: `Each arrow is v(tₖ)·Δt: the velocity at the middle of a short time step times the step. Laid tip to tail they add up the displacement, a Riemann sum for each component at once.`, facts: s => { const k = Math.min(Math.floor(s.integ), M.STEPS), [x, y] = M.sumPath(k)[k]; return [['steps laid', `${k} of ${M.STEPS}`], ['sum', `⟨${f(x, 3)}, ${f(y, 3)}⟩`], ['exact r(t)', `⟨${f(M.CX(k * M.CT1 / M.STEPS), 3)}, ${f(M.CY(k * M.CT1 / M.STEPS), 3)}⟩`]]; } },
  iEnds: { text: 'The start r(0) is the initial condition: the integral of v gives only the change in position. The open circles mark r(π) = ⟨π, 2⟩ and r(2π) = ⟨2π, 0⟩.', facts: () => [['r(0)', '⟨0, 0⟩'], ['∫₀^π v dt', '⟨π, 2⟩'], ['∫₀^2π v dt', '⟨2π, 0⟩']] },
  // wheel
  wWheel: { text: 'A wheel of radius 1 rolling without slipping: its hub moves right at 1 unit per second while it turns 1 radian per second. The hub is at (t, 1).', facts: s => [['t', f(s.wheel)], ['hub', pt(s.wheel, 1)]] },
  wTrace: { text: 'The cycloid traced so far. One arch, 0 ≤ t ≤ 2π, is 8 long, while its ends are only 2π ≈ 6.283 apart.', facts: s => [['distance so far', f(M.cdist(s.wheel), 3)], ['displacement so far', f(Math.hypot(M.CX(s.wheel), M.CY(s.wheel)), 3)]] },
  wPoint: { text: 'The rim point. Where it touches the ground its velocity is zero: the bottom of a rolling wheel is momentarily at rest.', facts: s => [['r(t)', `⟨${f(M.CX(s.wheel))}, ${f(M.CY(s.wheel))}⟩`], ['speed', f(M.cspeed(s.wheel))]] },
  wVel: { text: 'The velocity ⟨1 − cos t, sin t⟩. Its length, 2|sin(t/2)|, is 0 at the ground and 2 at the top.', facts: s => [['v', `⟨${f(M.CVX(s.wheel))}, ${f(M.CVY(s.wheel))}⟩`], ['speed', f(M.cspeed(s.wheel))], ['moving', M.CVY(s.wheel) > 1e-3 ? 'up and right' : M.CVY(s.wheel) < -1e-3 ? 'down and right' : M.cspeed(s.wheel) > 1e-3 ? 'right, level' : 'at rest']] },
  wAcc: { text: 'The acceleration ⟨sin t, cos t⟩: always length 1, always pointing at the hub. Drawn at three-quarters of the velocity’s scale.', facts: s => [['a', `⟨${f(M.CAX(s.wheel))}, ${f(M.CAY(s.wheel))}⟩`], ['|a|', '1.00']] },
  // polar
  pCurve: { text: 'The cardioid r = 2 + 2 cos θ, being traced as θ runs from 0 to 2π. It touches the pole once, at θ = π, where r = 0.', facts: s => [['θ', f(s.polar)], ['r', f(M.R(s.polar))]] },
  pRay: { text: 'The ray at angle θ from the positive x-axis, with the point at distance r along it: x = r cos θ, y = r sin θ.', facts: s => [['θ', `${f(s.polar)} rad`], ['r', f(M.R(s.polar))], ['(x, y)', pt(M.PX(s.polar), M.PY(s.polar))]] },
  pGraph: { text: 'The same function r = 2 + 2 cos θ on ordinary axes: θ across, r up. Each height is the length of the ray in the polar picture.', facts: s => [['θ', f(s.polar)], ['r', f(M.R(s.polar))], ['dr/dθ', f(M.DR(s.polar))]] },
  // pslope
  qCurve: { text: 'The cardioid, with x = (2 + 2 cos θ) cos θ and y = (2 + 2 cos θ) sin θ: a parametric curve in θ.', facts: s => [['θ', f(s.pslope)], ['(x, y)', pt(M.PX(s.pslope), M.PY(s.pslope))]] },
  qTangent: { text: 'The tangent at the moving point, slope (dy/dθ)/(dx/dθ). At the pole (θ = π) both are 0: the cusp has no tangent slope from this formula.', facts: s => [['dx/dθ', f(M.DXT(s.pslope))], ['dy/dθ', f(M.DYT(s.pslope))], ['dy/dx', Math.abs(M.DXT(s.pslope)) < 1e-6 ? 'undefined' : f(M.pslope(s.pslope))]] },
  qRay: { text: 'The ray to the point, and dr/dθ as an arrow along it: outward when r is growing, inward when it is shrinking. It says nothing about which way the tangent points.', facts: s => [['r', f(M.R(s.pslope))], ['dr/dθ', f(M.DR(s.pslope))], ['so the point is', M.DR(s.pslope) > 1e-6 ? 'moving away from the pole' : M.DR(s.pslope) < -1e-6 ? 'moving toward the pole' : 'momentarily at a constant distance']] },
  qSpecial: { text: 'θ = π/3: r = 3, dy/dθ = 0, a horizontal tangent at the top. θ = π/2: r = 2, slope (−2)/(−2) = 1.', facts: () => [['θ = π/3', `(${f(M.PX(M.THT), 1)}, ${f(M.PY(M.THT), 3)}), slope 0`], ['θ = π/2', '(0, 2), slope 1']] },
  // parea
  rCurve: { text: 'The whole cardioid: ½∫₀^2π (2 + 2 cos θ)² dθ = 6π.', facts: () => [['area', `6π ≈ ${f(M.AFULL, 3)}`]] },
  rRegion: { text: 'The region swept by rays from θ = 0 to θ = π/2, out to the cardioid.', facts: () => [['area', `3π/2 + 4 ≈ ${f(M.AQ, 4)}`]] },
  rWedges: { text: 'Each wedge is a circular sector whose radius is r at the middle angle of its slice: area ½r²Δθ. The sum of the wedges is a Riemann sum for ½∫r² dθ.', facts: s => { const n = M.WEDGE_NS[s.parea]; return [['wedges', `${n}`], ['Δθ', f(Math.PI / 2 / n, 4)], ['sum', f(M.wedgeSum(n), 4)], ['exact', f(M.AQ, 4)]]; } },
  // between
  bOuter: { text: 'The cardioid is the outer curve for −π/3 < θ < π/3, where 2 + 2 cos θ > 3.', facts: s => [['θ', f(s.between)], ['R', f(M.R(s.between))]] },
  bInner: { text: 'The circle r = 3, the inner boundary of the region.', facts: () => [['r', '3']] },
  bMeet: { text: 'Set the two equal: 2 + 2 cos θ = 3, cos θ = ½, θ = ±π/3. These are the limits of the integral.', facts: () => [['θ = π/3', `(${f(M.PX(M.THT), 2)}, ${f(M.PY(M.THT), 3)})`], ['θ = −π/3', `(${f(M.PX(-M.THT), 2)}, ${f(M.PY(-M.THT), 3)})`]] },
  bRegion: { text: 'Swept by the ray from θ = −π/3: each thin wedge is ½(R² − r²)Δθ, the outer sector minus the inner one.', facts: s => [['θ', f(s.between)], ['R² − r²', f(M.R(s.between) ** 2 - 9)], ['area so far', f(M.abSoFar(s.between), 3)], ['total', `(9√3 − 2π)/2 ≈ ${f(M.AB, 3)}`]] },
};
