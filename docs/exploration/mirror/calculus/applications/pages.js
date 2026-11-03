// The chapter, page by page (AP Calculus AB/BC Unit 8): text on the left; for the figure on the right the camera, the
// lit thing and the scene. Every number comes from model.js.
import * as M from './model.js';
import { tex } from '../engine/tex.js';
import { ST } from './world.js';

const f = (x, n = 3) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const g = (x, n = 3) => +x.toFixed(n);   // plain, for inside tex
const row = (...cells) => `<tr>${cells.map(c => `<td>${c}</td>`).join('')}</tr>`;

export const PAGES = [
  {
    kicker: 'Chapter 8', title: 'Applications of integration', sub: 'adding up slices',
    body: `
      <p class="lede">A definite integral adds up thin slices. Change what a slice is, and the same integral measures an average, a net change, an area, a volume or a length.</p>
      <p>The figure turns the region between ${tex.inline(String.raw`y = \sqrt{x}`)} and ${tex.inline(String.raw`y = x/2`)} about the line <i>y</i> = −1. Every slice of the solid is a <b>washer</b>, a disc with a hole, of thickness ${tex.inline('dx')}, with outer radius ${tex.inline(String.raw`R = \sqrt{x} + 1`)} and inner ${tex.inline(String.raw`r = \tfrac{x}{2} + 1`)}. Add them all:</p>
      <div class="eq">${tex(String.raw`V = \pi\int_0^4 (R^2 - r^2)\,dx = \frac{16\pi}{3}`)}</div>
      <p>Every page of this chapter runs the same three steps:</p>
      <ul class="rules">
        <li>draw one slice, and write its size in terms of <i>x</i> (or <i>y</i>)</li>
        <li>find where the slices start and stop</li>
        <li>integrate the size of a slice over that range</li>
      </ul>`,
    cam: { target: [ST.washo + 2, -0.9, 0], az: 26, el: 26, dist: 25 }, lit: 'woSolid', scene: 'washo', look: {},
    fig: 'A region turned into a solid',
  },
  {
    kicker: '8.1', title: 'Average value', sub: 'the height with the same area',
    body: `
      <p class="lede">The <b>average value</b> of <i>f</i> on [<i>a</i>, <i>b</i>] is the height of the rectangle on [<i>a</i>, <i>b</i>] with the same area as the region under <i>f</i>:</p>
      <div class="eq">${tex(String.raw`f_\text{avg} = \frac{1}{b - a}\int_a^b f(x)\,dx`)}</div>
      <p>For ${tex.inline(String.raw`f(x) = \tfrac{x^2}{2} + 1`)} on [0, 3]: ${tex.inline(String.raw`\int_0^3 f\,dx = \left[\tfrac{x^3}{6} + x\right]_0^3 = ${g(M.AV.int)}`)}, so ${tex.inline(String.raw`f_\text{avg} = ${g(M.AV.int)}/3 = ${g(M.AV.avg)}`)}.</p>
      <p>Why: sample <i>f</i> at the middle of <i>n</i> equal pieces and average. The mean is a Riemann sum divided by <i>b</i> − <i>a</i>, so it tends to the integral formula:</p>
      <table class="data"><tr><th><i>n</i></th>${[1, 4, 32].map(n => `<td>${n}</td>`).join('')}</tr><tr><th>mean</th>${[1, 4, 32].map(n => `<td>${f(M.sampleMean(n), 4)}</td>`).join('')}</tr></table>
      <p>Since <i>f</i> is continuous, it reaches its average somewhere (the Mean Value Theorem for integrals): ${tex.inline(String.raw`f(c) = ${g(M.AV.avg)}`)} at ${tex.inline(String.raw`c = \sqrt3 \approx ${g(M.AV.c)}`)}. Don’t confuse it with the average <i>rate of change</i>, ${tex.inline(String.raw`\frac{f(3) - f(0)}{3} = ${g((M.AV.f(3) - M.AV.f(0)) / 3)}`)}.</p>`,
    cam: { target: [ST.avg + 1.55, 2.75, 0], az: -10, el: 5, dist: 25 }, lit: 'avgLevel', scene: 'avg', look: {},
    fig: 'Averaging more and more samples',
  },
  {
    kicker: '8.2', title: 'Motion along a line', sub: 'displacement and total distance',
    body: `
      <p class="lede">Integrate velocity to get the change in position. Integrate speed, |<i>v</i>|, to get the distance travelled.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}x(t) &= x(0) + \int_0^t v(u)\,du \\ \text{distance} &= \int_a^b |v(t)|\,dt\end{aligned}`)}</div>
      <p>A particle has ${tex.inline(String.raw`v(t) = t^2 - 4t + 3`)} m/s on 0 ≤ <i>t</i> ≤ 4, starting at <i>x</i> = 0. It is zero at <i>t</i> = 1 and <i>t</i> = 3, where the particle turns round. Split there:</p>
      <table class="data">
        <tr><th>interval</th><th>${tex.inline(String.raw`\int v\,dt`)}</th><th>moving</th></tr>
        ${row('0 → 1', `+${f(M.px(1) - M.px(0))} m`, 'forward')}
        ${row('1 → 3', `${f(M.px(3) - M.px(1))} m`, 'backward')}
        ${row('3 → 4', `+${f(M.px(4) - M.px(3))} m`, 'forward')}
      </table>
      <p><b>Displacement</b> ${tex.inline(String.raw`\int_0^4 v\,dt = ${g(M.PV_DISP)}`)} m: the backward stretch cancels one forward one. <b>Distance</b> ${tex.inline(String.raw`\int_0^4 |v|\,dt = ${g(M.PV_DIST)}`)} m: every stretch counts. The particle ends at <i>x</i> = ${f(M.px(4))}.</p>
      <p>The same holds one level down: ${tex.inline(String.raw`v(t) = v(0) + \int_0^t a(u)\,du`)}.</p>`,
    cam: { target: [ST.pva + 2, 1.7, 0], az: 8, el: 5, dist: 24 }, lit: 'vArea', scene: 'pva', look: {},
    fig: 'Signed area under v(t)',
  },
  {
    kicker: '8.3', title: 'Accumulation in context', sub: 'rate in, rate out',
    body: `
      <p class="lede">An amount that starts at a known value and changes at a known rate: start plus the integral of the rate.</p>
      <p>A tank holds ${M.TK.A0} L at <i>t</i> = 0. Water flows in at ${tex.inline(String.raw`R(t) = 5 + 3\sin(\pi t/4)`)} and drains at ${tex.inline(String.raw`D(t) = 1 + t`)}, both in litres per minute, for 0 ≤ <i>t</i> ≤ ${M.TK.T}.</p>
      <div class="eq">${tex(String.raw`A(t) = ${M.TK.A0} + \int_0^t \big(R(s) - D(s)\big)\,ds`)}</div>
      <p>Units check: L/min × min = L. At <i>t</i> = ${M.TK.T}: ${tex.inline(String.raw`A(${M.TK.T}) = ${M.TK.A0} + 6 + \tfrac{12}{\pi} \approx ${g(M.TK_END, 2)}`)} L.</p>
      <p><b>When is the tank fullest?</b> ${tex.inline(String.raw`A'(t) = R(t) - D(t)`)}, which is zero at <i>t</i> = ${M.TK_TMAX} and changes from + to −. Compare with the ends:</p>
      <table class="data"><tr><th><i>t</i></th><td>0</td><td>${M.TK_TMAX}</td><td>${M.TK.T}</td></tr><tr><th><i>A</i> (L)</th><td>${f(M.tA(0), 2)}</td><td><b>${f(M.TK_MAX, 2)}</b></td><td>${f(M.TK_END, 2)}</td></tr></table>
      <p>Blue area (in beats out) adds water; red area takes it away.</p>`,
    cam: { target: [ST.tank + 3.0, 2.8, 0], az: -6, el: 6, dist: 24 }, lit: 'net', scene: 'tank', look: {},
    fig: 'A tank filling and draining',
  },
  {
    kicker: '8.4', title: 'Area between curves', sub: 'top minus bottom, in x',
    body: `
      <p class="lede">Slice the region into vertical strips. Each has height (top − bottom) and width ${tex.inline('dx')}; add them up.</p>
      <div class="eq">${tex(String.raw`A = \int_a^b \big(\text{top}(x) - \text{bottom}(x)\big)\,dx`)}</div>
      <p>${tex.inline(String.raw`y = 4x - x^2`)} and ${tex.inline(String.raw`y = x^2`)} meet where ${tex.inline(String.raw`4x - x^2 = x^2`)}: at <i>x</i> = 0 and <i>x</i> = 2. In between, test <i>x</i> = 1: 3 against 1, so ${tex.inline(String.raw`4x - x^2`)} is on top.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}A &= \int_0^2 \big[(4x - x^2) - x^2\big]\,dx \\ &= \Big[2x^2 - \tfrac{2}{3}x^3\Big]_0^2 = \frac{8}{3}\end{aligned}`)}</div>
      <p>Top minus bottom is never negative, so the area is too, even where the region dips below the <i>x</i>-axis. The limits come from where the curves meet, not from where they cross the axis.</p>`,
    cam: { target: [ST.areax + 1.0, 2.0, 0], az: -8, el: 5, dist: 21 }, lit: 'axStrip', scene: 'areax', look: {},
    fig: 'A strip sweeping across',
  },
  {
    kicker: '8.5', title: 'Area in y', sub: 'right minus left',
    body: `
      <p class="lede">When the curves are given as <i>x</i> in terms of <i>y</i>, slice horizontally: length (right − left), thickness ${tex.inline('dy')}.</p>
      <div class="eq">${tex(String.raw`A = \int_c^d \big(\text{right}(y) - \text{left}(y)\big)\,dy`)}</div>
      <p>${tex.inline(String.raw`x = y^2`)} and ${tex.inline(String.raw`x = y + 2`)} meet where ${tex.inline(String.raw`y^2 = y + 2`)}: <i>y</i> = −1 and <i>y</i> = 2. The line is on the right.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}A &= \int_{-1}^{2} (y + 2 - y^2)\,dy \\ &= \Big[\tfrac{y^2}{2} + 2y - \tfrac{y^3}{3}\Big]_{-1}^{2} = \frac{9}{2}\end{aligned}`)}</div>
      <p>In <i>x</i> this takes two integrals, because the bottom edge changes at <i>x</i> = 1 (from ${tex.inline(String.raw`-\sqrt{x}`)} to the line):</p>
      <div class="eq">${tex(String.raw`\begin{aligned}&\int_0^1 2\sqrt{x}\,dx + \int_1^4 \big(\sqrt{x} - x + 2\big)\,dx \\ &= \tfrac{4}{3} + \tfrac{19}{6} = \tfrac{9}{2}\end{aligned}`)}</div>
      <p>Pick the variable whose strips always run between the same two curves.</p>`,
    cam: { target: [ST.areay + 2.0, 0.5, 0], az: 8, el: 5, dist: 21 }, lit: 'ayStrip', scene: 'areay', look: {},
    fig: 'Strips in y',
  },
  {
    kicker: '8.6', title: 'More than two crossings', sub: 'split where the curves cross',
    body: `
      <p class="lede">If the curves cross inside the interval, top and bottom swap there. Split at every crossing, or integrate |<i>f</i> − <i>g</i>|.</p>
      <p>${tex.inline(String.raw`f(x) = x^3 - 3x`)} and ${tex.inline(String.raw`g(x) = x`)} meet where ${tex.inline(String.raw`x^3 - 4x = 0`)}: <i>x</i> = −2, 0, 2. On [−2, 0], <i>f</i> is on top (at <i>x</i> = −1: 2 against −1); on [0, 2], <i>g</i> is.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}A &= \int_{-2}^{0} (x^3 - 4x)\,dx \\ &\quad + \int_0^2 (4x - x^3)\,dx \\ &= ${M.MX.left} + ${M.MX.right} = ${M.MX.area}\end{aligned}`)}</div>
      <p>Without splitting, the two pieces cancel:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\int_{-2}^{2} \big(f - g\big)\,dx &= ${M.MX.signed} \\ \int_{-2}^{2} |f - g|\,dx &= ${M.MX.area}\end{aligned}`)}</div>
      <p>On a calculator, integrate the absolute value; by hand, find every crossing first.</p>`,
    cam: { target: [ST.multi, 0, 0], az: -6, el: 5, dist: 23 }, lit: 'mRegions', scene: 'multi', look: {},
    fig: 'Two pieces that cancel',
  },
  {
    kicker: '8.7', title: 'Cross sections: squares and rectangles', sub: 'slabs standing on a base',
    body: `
      <p class="lede">A solid whose slices have a known area <i>A</i>(<i>x</i>) has volume ${tex.inline(String.raw`V = \int_a^b A(x)\,dx`)}: each slab is area × thickness.</p>
      <p>The base is the region under ${tex.inline(String.raw`y = 2 - \tfrac{x^2}{2}`)}, above the <i>x</i>-axis. Slices perpendicular to the <i>x</i>-axis are <b>squares</b> standing on the base, so each side is the base’s width there, ${tex.inline(String.raw`s(x) = 2 - \tfrac{x^2}{2}`)}.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}V &= \int_{-2}^{2} \Big(2 - \frac{x^2}{2}\Big)^2 dx \\ &= \frac{128}{15} \approx ${g(M.CS.square)}\end{aligned}`)}</div>
      <p>For <b>rectangles</b> whose height is half the base, ${tex.inline(String.raw`A = s \cdot \tfrac{s}{2}`)} and ${tex.inline(String.raw`V = \tfrac{64}{15} \approx ${g(M.CS.rect)}`)}.</p>
      <p>The side is the distance across the base (top − bottom), never a height above the floor.</p>`,
    cam: { target: [ST.squares, 0.9, -1.0], az: 28, el: 26, dist: 21 }, lit: 'sqSlabs', scene: 'squares', look: {},
    fig: 'Square slabs on a base',
  },
  {
    kicker: '8.8', title: 'Cross sections: triangles and semicircles', sub: 'same base, other shapes',
    body: `
      <p class="lede">Only the area formula changes. Write it in terms of the side <i>s</i>(<i>x</i>) across the base, then integrate.</p>
      <table class="data">
        <tr><th>cross section</th><th>area</th><th><i>V</i> on this base</th></tr>
        ${row('square, side <i>s</i>', tex.inline('s^2'), f(M.CS.square))}
        ${row('equilateral triangle, side <i>s</i>', tex.inline(String.raw`\tfrac{\sqrt3}{4}s^2`), f(M.CS.tri))}
        ${row('isosceles right triangle, leg <i>s</i>', tex.inline(String.raw`\tfrac12 s^2`), f(M.CS.isoRight))}
        ${row('semicircle, diameter <i>s</i>', tex.inline(String.raw`\tfrac{\pi}{8}s^2`), f(M.CS.semi))}
      </table>
      <p>Same base as before, ${tex.inline(String.raw`s(x) = 2 - \tfrac{x^2}{2}`)}, so each volume is the factor times ${tex.inline(String.raw`\int_{-2}^{2} s^2\,dx = \tfrac{128}{15}`)}:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}V_\triangle &= \frac{\sqrt3}{4}\cdot\frac{128}{15} \approx ${g(M.CS.tri)} \\ V_\text{semi} &= \frac{\pi}{8}\cdot\frac{128}{15} = \frac{16\pi}{15} \approx ${g(M.CS.semi)}\end{aligned}`)}</div>
      <p>A semicircle on diameter <i>s</i> has radius <i>s</i>/2, so its area is ${tex.inline(String.raw`\tfrac12\pi(s/2)^2`)}. Using <i>s</i> as the radius is the usual slip.</p>`,
    cam: { target: [ST.tri, 0.7, -1.8], az: 70, el: 22, dist: 27 }, lit: 'triSlice', scene: 'tri', look: {},
    fig: 'Triangles and semicircles',
  },
  {
    kicker: '8.9', title: 'The disc method', sub: 'turning a region about an axis',
    body: `
      <p class="lede">Turn a region about an axis it touches along its whole length. Every slice perpendicular to the axis is a <b>disc</b> of area ${tex.inline(String.raw`\pi R^2`)}.</p>
      <div class="eq">${tex(String.raw`V = \pi\int_a^b R(x)^2\,dx`)}</div>
      <p>The region under ${tex.inline(String.raw`y = \sqrt{x}`)}, 0 ≤ <i>x</i> ≤ 4, turned about the <i>x</i>-axis: the radius at <i>x</i> is the curve’s height, ${tex.inline(String.raw`R = \sqrt{x}`)}.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}V &= \pi\int_0^4 (\sqrt{x})^2\,dx = \pi\int_0^4 x\,dx \\ &= 8\pi \approx ${g(M.DX.vol)}\end{aligned}`)}</div>
      <p><b>About the <i>y</i>-axis</b>, slice horizontally and integrate in <i>y</i>. The region between ${tex.inline(String.raw`x = y^2`)} and the <i>y</i>-axis, 0 ≤ <i>y</i> ≤ 2, gives discs of radius ${tex.inline('y^2')}: ${tex.inline(String.raw`\pi\int_0^2 y^4\,dy = \tfrac{32\pi}{5} \approx ${g(M.DX.yAxis)}`)}.</p>
      <p>The slices are always perpendicular to the axis, so you integrate along it.</p>`,
    cam: { target: [ST.discx + 2.0, 0, 0], az: 32, el: 18, dist: 22 }, lit: 'dxSolid', scene: 'discx', look: {},
    fig: 'Discs about the x-axis',
  },
  {
    kicker: '8.10', title: 'Discs about other axes', sub: 'radius is the distance to the axis',
    body: `
      <p class="lede">For any axis the radius is the distance from the axis to the curve: ${tex.inline(String.raw`|f(x) - k|`)} for the line <i>y</i> = <i>k</i>, ${tex.inline(String.raw`|h - x(y)|`)} for <i>x</i> = <i>h</i>.</p>
      <p>Turn the same region (under ${tex.inline(String.raw`y = \sqrt{x}`)}, 0 ≤ <i>x</i> ≤ 4) about the vertical line <i>x</i> = 4. The slices are horizontal, so integrate in <i>y</i> from 0 to 2. At height <i>y</i> the region runs from the curve, ${tex.inline(String.raw`x = y^2`)}, to the axis, <i>x</i> = 4:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}R(y) &= 4 - y^2 \\ V &= \pi\int_0^2 (4 - y^2)^2\,dy = \frac{256\pi}{15}\end{aligned}`)}</div>
      <p>The region touches the axis along its whole edge (<i>x</i> = 4, 0 ≤ <i>y</i> ≤ 2), so there is no hole: discs, not washers.</p>
      <p>Write the radius as (farther) − (nearer) so it comes out positive; squaring hides a sign slip, but not a wrong distance.</p>`,
    cam: { target: [ST.discv, 1.0, 0], az: 24, el: 22, dist: 24 }, lit: 'dvSolid', scene: 'discv', look: {},
    fig: 'Discs about x = 4',
  },
  {
    kicker: '8.11', title: 'The washer method', sub: 'a disc with a hole',
    body: `
      <p class="lede">When the region doesn’t touch the axis, each slice is a <b>washer</b>: an outer disc minus an inner one.</p>
      <div class="eq">${tex(String.raw`V = \pi\int_a^b \big(R(x)^2 - r(x)^2\big)\,dx`)}</div>
      <p>The region between ${tex.inline(String.raw`y = \sqrt{x}`)} and ${tex.inline(String.raw`y = x/2`)} (they meet at <i>x</i> = 0 and 4), about the <i>x</i>-axis. The outer radius is the farther curve, ${tex.inline(String.raw`R = \sqrt{x}`)}; the inner is the nearer, ${tex.inline(String.raw`r = x/2`)}.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}V &= \pi\int_0^4 \Big(x - \frac{x^2}{4}\Big)dx \\ &= \pi\Big(8 - \frac{16}{3}\Big) = \frac{8\pi}{3}\end{aligned}`)}</div>
      <p>Square each radius, then subtract. ${tex.inline(String.raw`\pi\int (R - r)^2\,dx`)} gives ${f(M.WX.minusSquared)}, the volume of a different solid.</p>`,
    cam: { target: [ST.washx + 2.0, 0, 0], az: 30, el: 16, dist: 22 }, lit: 'wxWasher', scene: 'washx', look: {},
    fig: 'Washers about the x-axis',
  },
  {
    kicker: '8.12', title: 'Washers about other axes', sub: 'measure every radius from the axis',
    body: `
      <p class="lede">Measure both radii from the axis, not from the <i>x</i>-axis.</p>
      <p>The same region, turned about <i>y</i> = −1. The line is below the region, so add 1 to each height:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}R &= \sqrt{x} - (-1) = \sqrt{x} + 1 \\ r &= \tfrac{x}{2} + 1\end{aligned}`)}</div>
      <div class="eq">${tex(String.raw`\begin{aligned}V &= \pi\int_0^4 \big[R^2 - r^2\big]\,dx \\ &= \pi\int_0^4 \Big(2\sqrt{x} - \frac{x^2}{4}\Big)dx = \frac{16\pi}{3}\end{aligned}`)}</div>
      <p>Twice the washer volume about the <i>x</i>-axis: the hole and the ring both grew.</p>
      <p>About <i>y</i> = 2, above the region, the roles swap. The line <i>y</i> = <i>x</i>/2 is now farther away: ${tex.inline(String.raw`R = 2 - \tfrac{x}{2}`)}, ${tex.inline(String.raw`r = 2 - \sqrt{x}`)}, and ${tex.inline(String.raw`V = \tfrac{8\pi}{3}`)}.</p>`,
    cam: { target: [ST.washo + 2.0, -1.0, 0], az: 30, el: 14, dist: 27 }, lit: 'woSolid', scene: 'washo', look: {},
    fig: 'Washers about y = −1',
  },
  {
    kicker: '8.13 · BC', title: 'Arc length', sub: 'and distance travelled',
    body: `
      <p class="lede">A short piece of a curve is almost straight: ${tex.inline(String.raw`\sqrt{dx^2 + dy^2} = \sqrt{1 + f'(x)^2}\,dx`)}. Add the pieces:</p>
      <div class="eq">${tex(String.raw`L = \int_a^b \sqrt{1 + \big(f'(x)\big)^2}\,dx`)}</div>
      <p>For ${tex.inline(String.raw`y = \tfrac23 x^{3/2}`)} on [0, 3], ${tex.inline(String.raw`f'(x) = \sqrt{x}`)}:</p>
      <div class="eq">${tex(String.raw`\begin{aligned}L &= \int_0^3 \sqrt{1 + x}\,dx \\ &= \tfrac23 (1 + x)^{3/2}\Big|_0^3 = \frac{14}{3} \approx ${g(M.AL.len)}\end{aligned}`)}</div>
      <p>Chords from below: every polygon is shorter than the curve, and closes in.</p>
      <table class="data"><tr><th>chords</th>${[1, 4, 16].map(n => `<td>${n}</td>`).join('')}</tr><tr><th>length</th>${[1, 4, 16].map(n => `<td>${f(M.chordLen(n))}</td>`).join('')}</tr></table>
      <p>A particle at ${tex.inline(String.raw`(x(t), y(t))`)} travels ${tex.inline(String.raw`\int_a^b \sqrt{x'(t)^2 + y'(t)^2}\,dt`)}, the integral of its speed. With <i>x</i> = <i>t</i>, ${tex.inline(String.raw`y = \tfrac23 t^{3/2}`)}, the speed is ${tex.inline(String.raw`\sqrt{1 + t}`)} and it travels the same ${g(M.AL.len)} by <i>t</i> = 3.</p>`,
    cam: { target: [ST.arc + 1.5, 1.8, 0], az: -8, el: 5, dist: 21 }, lit: 'arcChords', scene: 'arc', look: {},
    fig: 'Chords closing in on a curve',
  },
];

// ---------- breakdowns: the facts read the live clock (s.c) ----------
const p = M.revPhase;
const slideX = (c, a, b) => { const u = p(c).slide; return u < 0 ? null : a + u * (b - a); };
export const PLATES = {
  avgCurve: { text: 'The function being averaged, and the area under it on [0, 3], 7.5.', facts: () => [['f(x)', 'x²/2 + 1'], ['∫₀³ f dx', f(M.AV.int)], ['b − a', '3']] },
  avgSamples: { text: 'f sampled at the middle of n equal pieces. Their mean is (1/n)Σf(xᵢ) = (1/(b − a))Σf(xᵢ)Δx: a Riemann sum over the width.', facts: s => { const n = M.avgN(s.c); return [['n', `${n}`], ['Δx', f(3 / n, 4)], ['mean of samples', f(M.sampleMean(n), 4)]]; } },
  avgLevel: { text: 'The red line is the mean of the samples; it settles at the average value, 2.5. The dot is where f reaches it, x = c.', facts: s => [['mean now', f(M.sampleMean(M.avgN(s.c)), 4)], ['f_avg', f(M.AV.avg)], ['c', `√3 ≈ ${f(M.AV.c)}`]] },
  vGraph: { text: 'v(t) = t² − 4t + 3: positive (moving forward) before t = 1 and after t = 3, negative in between.', facts: s => { const t = M.pvTime(s.c); return [['t', f(t, 2)], ['v(t)', `${f(M.pv(t))} m/s`], ['a(t) = v′(t)', `${f(M.pa(t))} m/s²`]]; } },
  vArea: { text: 'Area above the axis counts forward motion, area below backward. Signed, they give displacement; all counted positive, distance.', facts: s => { const t = M.pvTime(s.c); return [['∫₀ᵗ v dt', `${f(M.px(t) - M.px(0))} m`], ['∫₀ᵗ |v| dt', `${f(M.pdist(t))} m`]]; } },
  particle: { text: 'The particle’s position is x(0) plus the signed area so far. It turns round where v = 0.', facts: s => { const t = M.pvTime(s.c); return [['x(t)', `${f(M.px(t))} m`], ['direction', M.pv(t) > 1e-9 ? 'forward' : M.pv(t) < -1e-9 ? 'backward' : 'turning']]; } },
  rates: { text: 'Two rates in litres per minute. Where they cross (t = 4) the amount stops rising and starts falling.', facts: s => { const t = M.tkTime(s.c); return [['t', `${f(t, 2)} min`], ['R(t)', `${f(M.tR(t))} L/min`], ['D(t)', `${f(M.tD(t))} L/min`]]; } },
  net: { text: 'The area between the curves is the net change in water: blue where R > D (gain), red where D > R (loss).', facts: s => { const t = M.tkTime(s.c); return [['∫₀ᵗ (R − D) ds', `${f(M.tA(t) - M.TK.A0)} L`]]; } },
  tank: { text: 'Amount = starting amount + net change. Fullest at t = 4, where R − D changes from positive to negative.', facts: s => { const t = M.tkTime(s.c); return [['A(t)', `${f(M.tA(t), 2)} L`], ['A′(t) = R − D', `${f(M.tR(t) - M.tD(t))} L/min`], ['max', `${f(M.TK_MAX, 2)} L at t = 4`]]; } },
  axCurves: { text: 'Top y = 4x − x², bottom y = x². They meet at x = 0 and x = 2, which are the limits.', facts: () => [['meet', 'x = 0, 2'], ['top − bottom', '4x − 2x²']] },
  axRegion: { text: 'The area so far is the integral of top − bottom from 0 to x.', facts: s => { const x = M.axX(s.c); return [['x', f(x)], ['area so far', f(2 * x * x - 2 / 3 * x ** 3)], ['whole', `8/3 ≈ ${f(M.AX.area)}`]]; } },
  axStrip: { text: 'One vertical strip: height top − bottom, width dx. Its area is (f − g) dx.', facts: s => { const x = M.axX(s.c); return [['x', f(x)], ['height', f(M.AX.f(x) - M.AX.g(x))]]; } },
  ayCurves: { text: 'x = y² opens to the right; the line x = y + 2 is on the right of it between y = −1 and y = 2.', facts: () => [['meet', '(1, −1), (4, 2)'], ['right − left', 'y + 2 − y²']] },
  ayRegion: { text: 'Added in y, one integral covers it. Added in x, it needs two, split at x = 1.', facts: s => { const y = M.ayY(s.c), F = u => u * u / 2 + 2 * u - u ** 3 / 3; return [['y', f(y)], ['area so far', f(F(y) - F(-1))], ['whole', '9/2']]; } },
  ayStrip: { text: 'One horizontal strip: length right − left, thickness dy.', facts: s => { const y = M.ayY(s.c); return [['y', f(y)], ['length', f(M.AY.right(y) - M.AY.left(y))]]; } },
  mCurves: { text: 'f(x) = x³ − 3x and g(x) = x cross three times: x = −2, 0, 2.', facts: () => [['f − g', 'x³ − 4x'], ['crossings', '−2, 0, 2']] },
  mRegions: { text: 'Red: f on top. Blue: g on top. The signed integral of f − g counts blue as negative, so the two cancel.', facts: s => { const x = M.mxX(s.c); return [['x', f(x)], ['∫(f − g) dx so far', f(M.mxSigned(x))], ['∫|f − g| dx so far', f(M.mxAbs(x))]]; } },
  mStrip: { text: 'A strip always runs from the lower curve to the upper one, whichever that is.', facts: s => { const x = M.mxX(s.c); return [['x', f(x)], ['on top', M.MX.f(x) > M.MX.g(x) ? 'f' : 'g'], ['|f − g|', f(Math.abs(M.MX.f(x) - M.MX.g(x)))]]; } },
  sqBase: { text: 'The base lies on the floor: the region between y = 2 − x²/2 and the x-axis. Its width at x is the side of the square there.', facts: () => [['s(x)', '2 − x²/2'], ['from', 'x = −2 to 2']] },
  sqSlabs: { text: 'Slabs of thickness dx and volume s² dx. In the limit their sum is the integral.', facts: () => [['slabs shown', `${M.CS.n}`], ['V = ∫ s² dx', `128/15 ≈ ${f(M.CS.square)}`]] },
  sqSlice: { text: 'The cross section at x: a square of side s(x).', facts: s => { const x = M.csX(s.c), q = M.CS.s(x); return [['x', f(x)], ['s(x)', f(q)], ['A(x) = s²', f(q * q)]]; } },
  triSolid: { text: 'Equilateral triangles standing on the base: area (√3/4)s².', facts: () => [['V', f(M.CS.tri)]] },
  semiSolid: { text: 'Semicircles standing on the base, diameter s: radius s/2, area (π/8)s².', facts: () => [['V', `16π/15 ≈ ${f(M.CS.semi)}`]] },
  triSlice: { text: 'The same width s(x) at the same x, with two different shapes on it.', facts: s => { const x = M.csX(s.c), q = M.CS.s(x); return [['s(x)', f(q)], ['triangle', f(Math.sqrt(3) / 4 * q * q)], ['semicircle', f(Math.PI / 8 * q * q)]]; } },
  dxSolid: { text: 'The region turned all the way round the x-axis. Its volume is π∫R² dx with R = √x.', facts: () => [['V', `8π ≈ ${f(M.DX.vol)}`]] },
  dxRegion: { text: 'The region under y = √x from 0 to 4. It touches the axis along its whole length, so the slices are full discs.', facts: () => [['area', `16/3 ≈ ${f(16 / 3)}`]] },
  dxDisc: { text: 'A disc at x: radius √x, area πx, volume πx dx.', facts: s => { const x = slideX(s.c, 0.06, 3.94); return x === null ? [['disc', 'waiting for the turn to finish']] : [['x', f(x)], ['R = √x', f(Math.sqrt(x))], ['πR²', f(Math.PI * x)]]; } },
  dvSolid: { text: 'The region turned about the line x = 4. Slices perpendicular to it are horizontal, so integrate in y.', facts: () => [['V', `256π/15 ≈ ${f(M.DV.vol)}`]] },
  dvRegion: { text: 'The same region, under y = √x. In terms of y it runs from x = y² to x = 4.', facts: () => [['y', '0 to 2']] },
  dvDisc: { text: 'A horizontal disc at height y: its radius is the distance from the axis x = 4 to the curve x = y².', facts: s => { const y = slideX(s.c, 0.05, 1.95); return y === null ? [['disc', 'waiting for the turn to finish']] : [['y', f(y)], ['R = 4 − y²', f(4 - y * y)], ['πR²', f(Math.PI * (4 - y * y) ** 2)]]; } },
  wxSolid: { text: 'The region between √x and x/2 turned about the x-axis: a bowl with a cone taken out.', facts: () => [['V', `8π/3 ≈ ${f(M.WX.vol)}`], ['not π∫(R − r)²', f(M.WX.minusSquared)]] },
  wxRegion: { text: 'Between y = √x (farther from the axis) and y = x/2 (nearer). They meet at x = 0 and x = 4.', facts: () => [['area', `4/3 ≈ ${f(4 / 3)}`]] },
  wxWasher: { text: 'A washer at x: outer radius √x, inner x/2. Area π(R² − r²).', facts: s => { const x = slideX(s.c, 0.15, 3.85); return x === null ? [['washer', 'waiting for the turn to finish']] : [['x', f(x)], ['R, r', `${f(Math.sqrt(x))}, ${f(x / 2)}`], ['π(R² − r²)', f(Math.PI * (x - x * x / 4))]]; } },
  woSolid: { text: 'The same region about y = −1 (the red line). Both radii are measured from that line.', facts: () => [['V', `16π/3 ≈ ${f(M.WO.vol)}`]] },
  woRegion: { text: 'The same region as on the last page; only the axis moved.', facts: () => [['axis', 'y = −1']] },
  woWasher: { text: 'A washer at x: outer radius √x + 1, inner x/2 + 1.', facts: s => { const x = slideX(s.c, 0.15, 3.85); return x === null ? [['washer', 'waiting for the turn to finish']] : [['x', f(x)], ['R, r', `${f(Math.sqrt(x) + 1)}, ${f(x / 2 + 1)}`], ['π(R² − r²)', f(Math.PI * ((Math.sqrt(x) + 1) ** 2 - (x / 2 + 1) ** 2))]]; } },
  arcCurve: { text: 'y = (2/3)x^(3/2), so dy/dx = √x and √(1 + (dy/dx)²) = √(1 + x).', facts: () => [['L', `14/3 ≈ ${f(M.AL.len)}`]] },
  arcChords: { text: 'n chords between equally spaced points. Each is shorter than its arc, so the total is too, and it rises toward 14/3.', facts: s => { const n = M.alN(s.c); return [['n', `${n}`], ['chords', f(M.chordLen(n), 4)], ['curve', f(M.AL.len, 4)]]; } },
  arcParticle: { text: 'x = t, y = (2/3)t^(3/2). Its speed is √(x′² + y′²) = √(1 + t); the distance so far is the integral of that.', facts: s => { const t = M.alT(s.c); return [['t', f(t, 2)], ['speed', f(Math.sqrt(1 + t))], ['distance', f(M.alDist(t))]]; } },
};
