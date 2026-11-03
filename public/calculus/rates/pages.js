// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const T10 = M.COFFEE.at, TAB = M.TAB;
const vAt = [0, 1, 2, 3, 4];

export const PAGES = [
  {
    kicker: 'Chapter 4', title: 'Derivatives in context', sub: 'rates that mean something',
    body: `
      <p class="lede">A derivative is a rate: how fast one quantity changes as another one does. In a real setting it has units and a sign, and it answers questions.</p>
      <p>Water pours into this cone at a steady ${f(M.CONE.q, 1)} m³ per minute, yet the level climbs more and more slowly. At a depth of ${M.CONE.at} m it rises ${f(M.CONE_DH, 3)} m per minute; the derivative says exactly how fast, and why it slows.</p>
      <p>This chapter reads derivatives as the velocity of a moving particle and as rates of cooling, growing and filling. It links rates that change together (<b>related rates</b>), uses the tangent line to estimate values (<b>linearization</b>), and uses derivatives to find limits of the forms 0/0 and ∞/∞ (<b>L’Hôpital’s rule</b>).</p>`,
    cam: { target: [180, 3.2, 0], az: 24, el: 18, dist: 25 }, lit: 'water', look: {}, scene: 'cone',
    fig: 'Filling a conical tank',
  },
  {
    kicker: '4.1', title: 'The derivative in context', sub: 'units and sign',
    body: `
      <p class="lede">If <i>y</i> = <i>f</i>(<i>x</i>), then <i>f</i> ′(<i>x</i>) is the rate of change of <i>y</i> with respect to <i>x</i>. Its units are units of <i>y</i> per unit of <i>x</i>; its sign says whether <i>y</i> is rising or falling.</p>
      <p>Coffee poured at ${M.COFFEE.T0} °C cools in a ${M.COFFEE.room} °C room: ${tex.inline(String.raw`T(t) = 20 + 70e^{-0.08t}`)}, <i>t</i> in minutes. The slope of the red tangent line is</p>
      <div class="eq">${tex(String.raw`T'(t) = -5.6e^{-0.08t}`)}</div>
      <div class="eq">${tex(String.raw`T'(${T10}) = ${f(M.DT_AT)}\ {}^\circ\text{C/min}`)}</div>
      <p><b>Meaning:</b> at <i>t</i> = ${T10} minutes, the temperature of the coffee is <i>decreasing</i> at ${f(-M.DT_AT)} °C per minute. A full answer names the quantity, the moment, the direction and the units.</p>
      <p>It does not say the coffee lost ${f(-M.DT_AT)} °C over the first ${T10} minutes: that average rate is (${f(M.T_AT)} − ${M.COFFEE.T0})/${T10} = ${f(M.AVG10)} °C/min. And since ${tex.inline(String.raw`T''(${T10}) = ${f(M.d2temp(T10), 3)}\ {}^\circ\text{C/min}^2 > 0`)}, the cooling itself is slowing.</p>`,
    cam: { target: [0.4, 3.1, 0], az: -8, el: 6, dist: 27 }, lit: 'tangent', look: {}, scene: 'coffee',
    fig: 'A cup of coffee cooling',
  },
  {
    kicker: '4.2', title: 'Position, velocity, acceleration', sub: 'motion along a line',
    body: `
      <p class="lede">For a particle moving along a line with position <i>x</i>(<i>t</i>), the velocity is <i>v</i> = <i>x</i>′ and the acceleration is <i>a</i> = <i>v</i>′ = <i>x</i>″.</p>
      <div class="eq">${tex(String.raw`x(t) = t^3 - 6t^2 + 9t`)}</div>
      <p>so <i>v</i> = 3<i>t</i>² − 12<i>t</i> + 9 = 3(<i>t</i> − 1)(<i>t</i> − 3) and <i>a</i> = 6<i>t</i> − 12. The particle is <b>at rest</b> when <i>v</i> = 0: at <i>t</i> = 1 and <i>t</i> = 3. It <b>changes direction</b> only where <i>v</i> changes sign, which happens at both. It moves right (<i>v</i> &gt; 0) on 0 &lt; <i>t</i> &lt; 1 and <i>t</i> &gt; 3, and left on 1 &lt; <i>t</i> &lt; 3. The trail beside the line shows each leg in its own lane.</p>
      <table class="data">
        <tr><th><i>t</i> (s)</th>${vAt.map(t => `<td>${t}</td>`).join('')}</tr>
        <tr><th><i>x</i> (m)</th>${vAt.map(t => `<td>${f(M.px(t), 0)}</td>`).join('')}</tr>
        <tr><th><i>v</i> (m/s)</th>${vAt.map(t => `<td>${f(M.pv(t), 0)}</td>`).join('')}</tr>
        <tr><th><i>a</i> (m/s²)</th>${vAt.map(t => `<td>${f(M.pa(t), 0)}</td>`).join('')}</tr>
      </table>
      <p>From 0 to 4 s its displacement is ${f(M.px(4), 0)} m, but it travels ${f(M.pdist(4), 0)} m: out, back, out again.</p>`,
    cam: { target: [28.2, 3.5, 0], az: -4, el: 11, dist: 29 }, lit: 'vGraph', look: { rest: 1 }, scene: 'part',
    fig: 'A particle and its graphs',
  },
  {
    kicker: '4.3', title: 'Speeding up or slowing down', sub: 'compare the signs of v and a',
    body: `
      <p class="lede">Speed is |<i>v</i>|. A particle is <b>speeding up</b> when <i>v</i> and <i>a</i> have the same sign, and <b>slowing down</b> when their signs are opposite.</p>
      <p>A negative acceleration alone doesn’t mean slowing down: on 1 &lt; <i>t</i> &lt; 2 both are negative, so the particle moves left faster and faster. The shaded bands mark where it speeds up.</p>
      <table class="data">
        <tr><th>interval</th><th><i>v</i></th><th><i>a</i></th><th>speed</th></tr>
        <tr><td>0 &lt; <i>t</i> &lt; 1</td><td>+</td><td>−</td><td>slowing down</td></tr>
        <tr><td>1 &lt; <i>t</i> &lt; 2</td><td>−</td><td>−</td><td>speeding up</td></tr>
        <tr><td>2 &lt; <i>t</i> &lt; 3</td><td>−</td><td>+</td><td>slowing down</td></tr>
        <tr><td>3 &lt; <i>t</i> &lt; 4</td><td>+</td><td>+</td><td>speeding up</td></tr>
      </table>
      <p>At <i>t</i> = 2, <i>a</i> = 0 and the leftward speed peaks at ${f(-M.pv(2), 0)} m/s. On a velocity graph the rule reads at a glance: the particle speeds up wherever the graph moves away from the <i>t</i>-axis.</p>`,
    cam: { target: [34, 3.5, 0], az: 4, el: 11, dist: 30 }, lit: 'aGraph', look: { speed: 1 }, scene: 'part',
    fig: 'Same signs, or opposite',
  },
  {
    kicker: '4.4', title: 'Rates in other contexts', sub: 'with respect to anything',
    body: `
      <p class="lede">A rate of change need not be with respect to time. The derivative of any quantity with respect to another has the units of the first per unit of the second.</p>
      <p>A balloon’s volume depends on its radius: ${tex.inline(String.raw`V = \tfrac43\pi r^3`)}, in cm³ with <i>r</i> in cm.</p>
      <div class="eq">${tex(String.raw`\frac{dV}{dr} = 4\pi r^2 = 4\pi(${M.BAL.at})^2 = 36\pi \approx ${f(M.DV_AT, 1)}`)}</div>
      <p><b>Meaning:</b> when the radius is ${M.BAL.at} cm, the volume is increasing at about ${f(M.DV_AT, 1)} cm³ per centimetre of radius.</p>
      <p>4π<i>r</i>² is the balloon’s surface area, and the red shell shows why: a thin layer of thickness Δ<i>r</i> holds about (area)·Δ<i>r</i>. For Δ<i>r</i> = ${M.BAL.dr} that is ${f(M.bdvol(3) * M.BAL.dr)} cm³; the true gain is ${f(M.SHELL)} cm³.</p>
      <p>Economics reads the same way: if <i>C</i>(<i>x</i>) is the cost in dollars of making <i>x</i> items, <i>C</i>′(<i>x</i>) in dollars per item is about the cost of one more.</p>`,
    cam: { target: [61.4, 3.0, 0], az: -6, el: 7, dist: 29 }, lit: 'volTangent', look: {}, scene: 'balloon',
    fig: 'A balloon’s volume and radius',
  },
  {
    kicker: '4.5', title: 'Rates from a table', sub: 'estimating a derivative from data',
    body: `
      <p class="lede">When a quantity is known only at a few times, estimate its derivative with a difference quotient over the closest interval that contains the point.</p>
      <table class="data">
        <tr><th><i>t</i> (hours)</th>${TAB.t.map(t => `<td>${t}</td>`).join('')}</tr>
        <tr><th><i>W</i>(<i>t</i>) (gallons)</th>${TAB.W.map(w => `<td>${w}</td>`).join('')}</tr>
      </table>
      <p>To estimate <i>W</i> ′(${TAB.at}), use <i>t</i> = 5 and <i>t</i> = 9, which bracket it:</p>
      <div class="eq">${tex(String.raw`W'(${TAB.at}) \approx \frac{W(9) - W(5)}{9 - 5} = \frac{31}{4}`)}</div>
      <p>that is, ${f(M.TAB_EST)} gal/h.</p>
      <p><b>Meaning:</b> at <i>t</i> = ${TAB.at} hours the amount of water is increasing at about ${f(M.TAB_EST)} gallons per hour. The secant’s slope is the <b>average</b> rate over [5, 9], our best stand-in for the instantaneous one.</p>
      <p>Over all 12 hours the average rate is (248 − 120)/12 = ${f(M.TAB_AVG)} gal/h. The slopes fall interval by interval (20, 15, 7.75, 4), so the tank is filling ever more slowly.</p>`,
    cam: { target: [90.3, 3.1, 0], az: -6, el: 6, dist: 30 }, lit: 'secant', look: {}, scene: 'table',
    fig: 'Secants through the data',
  },
  {
    kicker: '4.6', title: 'Related rates', sub: 'quantities that change together',
    body: `
      <p class="lede">When two quantities are tied by an equation and both change with time, differentiating the equation with respect to <i>t</i> ties their rates together.</p>
      <p>A stone drops into a pond and the ripple’s radius grows at ${M.POND.drdt} m/s. The area inside is <i>A</i> = π<i>r</i>². Both <i>A</i> and <i>r</i> are functions of <i>t</i>, so the chain rule gives</p>
      <div class="eq">${tex(String.raw`\frac{dA}{dt} = 2\pi r\,\frac{dr}{dt}`)}</div>
      <p>When <i>r</i> = ${M.POND.at} m, ${tex.inline(String.raw`\frac{dA}{dt} = 2\pi(${M.POND.at})(${M.POND.drdt}) = 4\pi \approx ${f(M.DA_AT)}\ \text{m}^2/\text{s}`)}.</p>
      <p>The radius grows steadily, but the area grows faster and faster: each moment it gains a strip as long as the circumference, 2π<i>r</i> (the dark red ring).</p>
      <p>Substitute <i>r</i> = ${M.POND.at} only <b>after</b> differentiating. Put it in first and <i>A</i> = 16π is a constant, whose derivative is 0.</p>`,
    cam: { target: [120.3, 0, 0.4], az: 0, el: 42, dist: 31 }, lit: 'ripple', look: {}, scene: 'pond',
    fig: 'A ripple spreading',
  },
  {
    kicker: '4.7', title: 'The sliding ladder', sub: 'solving a related-rates problem',
    body: `
      <p class="lede">The method: draw it, name the changing quantities, write the equation that links them, differentiate with respect to <i>t</i>, and only then substitute the moment’s values.</p>
      <p>A ${M.LAD.L} m ladder leans on a wall. Its foot is pulled out at ${M.LAD.dxdt} m/s. How fast is the top sliding down when the foot is ${M.LAD.at} m from the wall?</p>
      <div class="eq">${tex(String.raw`x^2 + y^2 = 25`)}</div>
      <div class="eq">${tex(String.raw`2x\frac{dx}{dt} + 2y\frac{dy}{dt} = 0`)}</div>
      <p>so d<i>y</i>/d<i>t</i> = −(<i>x</i>/<i>y</i>)(d<i>x</i>/d<i>t</i>). At <i>x</i> = ${M.LAD.at}, <i>y</i> = √(25 − 9) = ${f(M.LAD_Y, 0)}:</p>
      <div class="eq">${tex(String.raw`\frac{dy}{dt} = -\frac{3}{4}(${M.LAD.dxdt}) = ${f(M.LAD_DY, 1)}\ \text{m/s}`)}</div>
      <p>The top is sliding down at ${f(-M.LAD_DY, 1)} m/s; the minus sign is the “down”. The foot moves steadily, yet the top speeds up as it falls, because <i>x</i>/<i>y</i> grows: at <i>x</i> = ${M.LAD.x1} it is already ${f(-M.ladDY(M.LAD.x1))} m/s.</p>`,
    cam: { target: [150.2, 2.7, 0], az: 28, el: 12, dist: 25 }, lit: 'topRate', look: {}, scene: 'ladder',
    fig: 'A ladder sliding down a wall',
  },
  {
    kicker: '4.8', title: 'The filling cone', sub: 'eliminate the extra variable',
    body: `
      <p class="lede">When the equation has one variable too many, find another relation (often similar triangles) and use it to remove the variable whose rate you don’t know.</p>
      <p>An inverted cone ${M.CONE.R} m in radius and ${M.CONE.H} m deep fills at ${M.CONE.q} m³/min. How fast does the level rise when the water is ${M.CONE.at} m deep?</p>
      <p>The water is a cone too: ${tex.inline(String.raw`V = \tfrac13\pi r^2h`)}. By similar triangles <i>r</i>/<i>h</i> = 2/4, so <i>r</i> = <i>h</i>/2 and</p>
      <div class="eq">${tex(String.raw`V = \frac{\pi h^3}{12} \;\Rightarrow\; \frac{dV}{dt} = \frac{\pi h^2}{4}\frac{dh}{dt}`)}</div>
      <p>At <i>h</i> = ${M.CONE.at}: ${tex.inline(String.raw`${M.CONE.q} = \frac{9\pi}{4}\frac{dh}{dt}`)}, so</p>
      <div class="eq">${tex(String.raw`\frac{dh}{dt} = \frac{6}{9\pi} \approx ${f(M.CONE_DH, 3)}\ \text{m/min}`)}</div>
      <p>π<i>h</i>²/4 is the area of the water’s surface, π<i>r</i>². The same inflow spreads over a wider and wider surface, so the level rises ever more slowly.</p>`,
    cam: { target: [180, 3.0, 0], az: 14, el: 12, dist: 23 }, lit: 'rise', look: {}, scene: 'cone',
    fig: 'An inverted cone filling',
  },
  {
    kicker: '4.9', title: 'The lengthening shadow', sub: 'similar triangles again',
    body: `
      <p class="lede">Light travels in straight lines, so a lamp, a person and the tip of their shadow make similar triangles.</p>
      <p>A ${M.SHA.tall} m person walks away from a ${M.SHA.lamp} m street lamp at ${M.SHA.v} m/s. Let <i>x</i> be their distance from the post and <i>s</i> the length of their shadow. The big triangle (lamp) and the small one (person) share the angle at the tip:</p>
      <div class="eq">${tex(String.raw`\frac{s}{1.8} = \frac{x+s}{6}`)}</div>
      <p>so 6<i>s</i> = 1.8<i>x</i> + 1.8<i>s</i>, 4.2<i>s</i> = 1.8<i>x</i> and <i>s</i> = (3/7)<i>x</i>. Differentiate:</p>
      <div class="eq">${tex(String.raw`\frac{ds}{dt} = \tfrac37\frac{dx}{dt} = \tfrac37(${M.SHA.v}) \approx ${f(M.SHA_DS, 3)}\ \text{m/s}`)}</div>
      <p>The shadow lengthens at ${f(M.SHA_DS, 3)} m/s, wherever the walker is: the rate doesn’t depend on <i>x</i>. The tip moves at ${tex.inline(String.raw`\frac{d(x+s)}{dt} = \tfrac{10}{7}(${M.SHA.v}) \approx ${f(M.SHA_TIP, 3)}`)} m/s, faster than the walker. Read the question carefully: “the shadow’s length” and “the shadow’s tip” are different rates.</p>`,
    cam: { target: [208.6, 2.8, 0], az: 12, el: 9, dist: 31 }, lit: 'shadowLen', look: {}, scene: 'shadow',
    fig: 'Walking away from a lamp',
  },
  {
    kicker: '4.10', title: 'Local linearity', sub: 'the tangent line as an estimate',
    body: `
      <p class="lede">Zoom in far enough on a differentiable function and its graph looks straight: it is nearly its own tangent line.</p>
      <p>So near <i>x</i> = <i>a</i>, the tangent line, or <b>linearization</b>, approximates the function:</p>
      <div class="eq">${tex(String.raw`L(x) = f(a) + f'(a)(x - a)`)}</div>
      <p>For ${tex.inline(String.raw`f(x) = \sqrt{x}`)} at <i>a</i> = 4: <i>f</i>(4) = 2 and ${tex.inline(String.raw`f'(x) = \frac{1}{2\sqrt x}`)}, so <i>f</i> ′(4) = 1/4 and</p>
      <div class="eq">${tex(String.raw`\sqrt{${M.LIN.x}} \approx L(${M.LIN.x}) = 2 + \tfrac14(0.2) = ${f(M.LIN_EST)}`)}</div>
      <p>The true value is ${f(M.LIN_TRUE, 5)}: off by ${f(M.LIN_EST - M.LIN_TRUE, 5)}. The figure magnifies the window around (4, 2) a hundredfold; the curve straightens onto the red line. Far from <i>a</i> the estimate gets worse, so use a point you know close to the one you want.</p>`,
    cam: { target: [240, 3.8, 0], az: -5, el: 4, dist: 25 }, lit: 'zoom', look: {}, scene: 'lin',
    fig: 'Zooming in on √x',
  },
  {
    kicker: '4.11', title: 'Over or under?', sub: 'concavity decides',
    body: `
      <p class="lede">Whether a tangent-line estimate is too big or too small depends on which side of the curve the tangent line lies, and that is concavity.</p>
      <p>If <i>f</i> ″ &lt; 0 near <i>a</i> (concave down), the curve bends below its tangent: <i>L</i>(<i>x</i>) is an <b>overestimate</b>. If <i>f</i> ″ &gt; 0 (concave up), it bends above: an <b>underestimate</b>.</p>
      <p>For √<i>x</i>, ${tex.inline(String.raw`f''(x) = -\tfrac14 x^{-3/2} < 0`)}, so ${tex.inline(String.raw`\sqrt{${M.LIN.x}} \approx ${f(M.LIN_EST)}`)} is an overestimate (the red gap).</p>
      <p>For e<sup><i>x</i></sup> at 0 the tangent line is <i>L</i>(<i>x</i>) = 1 + <i>x</i>, and ${tex.inline(String.raw`(e^x)'' = e^x > 0`)}, so</p>
      <div class="eq">${tex(String.raw`e^{${M.EX_AT}} \approx 1 + (${M.EX_AT}) = ${f(M.EX_EST, 1)}`)}</div>
      <p>is an underestimate: the true value is ${f(M.EX_TRUE, 4)} (the blue gap). On the AP exam, justify with the sign of <i>f</i> ″ on the interval between <i>a</i> and <i>x</i>.</p>`,
    cam: { target: [272, 3.9, 0], az: -5, el: 4, dist: 25 }, lit: 'gapDown', look: {}, scene: 'over',
    fig: 'Tangent above, tangent below',
  },
  {
    kicker: '4.12', title: 'L’Hôpital’s rule', sub: 'the form 0/0',
    body: `
      <p class="lede">If <i>f</i>(<i>x</i>) and <i>g</i>(<i>x</i>) both approach 0 (or both approach ±∞) as <i>x</i> → <i>a</i>, then the limit of <i>f</i>/<i>g</i> equals the limit of <i>f</i> ′/<i>g</i> ′, if that exists.</p>
      <div class="eq">${tex(String.raw`\lim_{x\to a}\frac{f(x)}{g(x)} = \lim_{x\to a}\frac{f'(x)}{g'(x)}`)}</div>
      <p>At <i>x</i> = 1, ln <i>x</i>/(<i>x</i>² − 1) is 0/0. Differentiate top and bottom <b>separately</b> (this is not the quotient rule):</p>
      <div class="eq">${tex(String.raw`\lim_{x\to1}\frac{\ln x}{x^2-1} = \lim_{x\to1}\frac{1/x}{2x} = \frac12`)}</div>
      <p>Why it works: near <i>a</i> both functions are nearly their tangent lines, <i>f</i> ≈ <i>f</i> ′(<i>a</i>)(<i>x</i> − <i>a</i>) and <i>g</i> ≈ <i>g</i> ′(<i>a</i>)(<i>x</i> − <i>a</i>), and the (<i>x</i> − <i>a</i>) cancels. In the figure both heights shrink to 0 while their ratio settles at the ratio of the slopes, 1 to 2.</p>
      <p>Check the form first: if it is not 0/0 or ∞/∞, the rule does not apply.</p>`,
    cam: { target: [303.6, 3.3, 0], az: -6, el: 4, dist: 25 }, lit: 'heights', look: {}, scene: 'lh',
    fig: 'Two functions vanishing together',
  },
  {
    kicker: '4.13', title: 'L’Hôpital at infinity', sub: 'the form ∞/∞, used twice',
    body: `
      <p class="lede">The rule works the same for ∞/∞, and it may be used again as long as the result is still indeterminate.</p>
      <div class="eq">${tex(String.raw`\begin{aligned}\lim_{x\to\infty}\frac{x^2}{e^x} &= \lim_{x\to\infty}\frac{2x}{e^x} \\ &= \lim_{x\to\infty}\frac{2}{e^x} = 0\end{aligned}`)}</div>
      <p>Both steps start from ∞/∞. Each changes the function but not the limit: the three curves differ, yet all fall to 0 together.</p>
      <table class="data">
        <tr><th><i>x</i></th><th><i>x</i>²/e<sup><i>x</i></sup></th><th>2<i>x</i>/e<sup><i>x</i></sup></th><th>2/e<sup><i>x</i></sup></th></tr>
        ${[5, 10].map(x => `<tr><td>${x}</td><td>${M.r0(x).toPrecision(3)}</td><td>${M.r1(x).toPrecision(3)}</td><td>${M.r2(x).toPrecision(3)}</td></tr>`).join('')}
      </table>
      <p>Stop once the form is no longer indeterminate: 2/e<sup><i>x</i></sup> is 2/∞, plainly 0. Repeated, the same steps show e<sup><i>x</i></sup> outgrows every power of <i>x</i>.</p>`,
    cam: { target: [334, 3.2, 0], az: -6, el: 4, dist: 23 }, lit: 'ratio0', look: {}, scene: 'inf',
    fig: 'Three ratios, one limit',
  },
];

const r = (x, n = 2) => f(x, n);
export const PLATES = {
  // 4.1
  tempGraph: { text: 'The temperature of the coffee, T(t) = 20 + 70e^(−0.08t). It falls fast at first, then levels off toward the room’s 20 °C.', facts: s => [['t', `${r(s.coffee.t, 1)} min`], ['T(t)', `${r(M.temp(s.coffee.t))} °C`]] },
  tangent: { text: 'The slope of the tangent line is the instantaneous rate of change, T′(t). Its units are the graph’s rise units over its run units: °C per minute.', facts: s => [['T′(t)', `${r(M.dtemp(s.coffee.t))} °C/min`], ['T″(t)', `${r(M.d2temp(s.coffee.t), 3)} °C/min²`], ['meaning', M.dtemp(s.coffee.t) < 0 ? 'cooling' : 'warming']] },
  cup: { text: 'The thermometer is drawn to the graph’s height scale: its red column stands level with the moving point.', facts: s => [['temperature', `${r(M.temp(s.coffee.t), 1)} °C`], ['room', `${M.COFFEE.room} °C`]] },
  // 4.2–4.3
  xGraph: { text: 'Position against time. Its slope is the velocity: where the tangent is flat (t = 1 and t = 3) the particle is momentarily at rest.', facts: s => [['x(t)', `${r(M.px(s.part.t))} m`], ['slope = v', `${r(M.pv(s.part.t))} m/s`]] },
  vGraph: { text: 'Velocity against time. Its sign is the direction; its slope is the acceleration; its distance from the axis is the speed.', facts: s => [['v(t)', `${r(M.pv(s.part.t))} m/s`], ['speed', `${r(Math.abs(M.pv(s.part.t)))} m/s`], ['slope = a', `${r(M.pa(s.part.t))} m/s²`]] },
  aGraph: { text: 'Acceleration against time: a = 6t − 12, zero at t = 2. Compare its sign with the velocity’s to tell speeding up from slowing down.', facts: s => [['a(t)', `${r(M.pa(s.part.t))} m/s²`], ['v·a', M.speedingUp(s.part.t) ? '> 0: speeding up' : '< 0: slowing down']] },
  line: { text: 'The number line the particle moves on. The trail is split into lanes, one per leg: right until t = 1, left until t = 3, then right again.', facts: s => [['position', `${r(M.px(s.part.t))} m`], ['distance so far', `${r(M.pdist(s.part.t))} m`]] },
  particle: { text: 'The black arrow is the velocity, the red one the acceleration. When they point the same way, the particle speeds up.', facts: s => [['t', `${r(s.part.t)} s`], ['v', `${r(M.pv(s.part.t))} m/s`], ['a', `${r(M.pa(s.part.t))} m/s²`]] },
  // 4.4
  volGraph: { text: 'Volume against radius, V = (4/3)πr³. Neither axis is time: the slope is a rate of volume per unit of radius.', facts: s => [['r', `${r(M.balR(s.balloon.t))} cm`], ['V', `${r(M.bvol(M.balR(s.balloon.t)), 1)} cm³`]] },
  volTangent: { text: 'The slope dV/dr = 4πr², the surface area. It grows with r: each extra centimetre of radius adds more volume than the last.', facts: s => [['dV/dr', `${r(M.bdvol(M.balR(s.balloon.t)), 1)} cm³/cm`]] },
  balloon: { text: 'A sphere of radius r, growing.', facts: s => [['r', `${r(M.balR(s.balloon.t))} cm`], ['V', `${r(M.bvol(M.balR(s.balloon.t)), 1)} cm³`]] },
  shell: { text: `A shell ${M.BAL.dr} cm thick. Its volume is about the surface area times the thickness: ΔV ≈ 4πr²·Δr.`, facts: s => { const q = M.balR(s.balloon.t); return [['estimate', `${r(M.bdvol(q) * M.BAL.dr, 1)} cm³`], ['exact', `${r(M.bvol(q + M.BAL.dr) - M.bvol(q), 1)} cm³`]]; } },
  // 4.5
  data: { text: 'Five readings of W(t). Between readings we know nothing for sure; the grey segments only join the dots.', facts: () => M.TAB.t.map((t, i) => [`W(${t})`, `${M.TAB.W[i]} gal`]) },
  secant: { text: 'The secant through two neighbouring readings. Its slope, ΔW/Δt, is the average rate over that interval and estimates W′ inside it.', facts: s => { let i = 0; while (i < 3 && s.table.t > M.TAB.t[i + 1]) i++; return [['interval', `[${M.TAB.t[i]}, ${M.TAB.t[i + 1]}] h`], ['slope', `${r(M.tabSlope(i))} gal/h`]]; } },
  waterTank: { text: 'The tank the readings come from, filling more slowly as time goes on.', facts: s => [['t', `${r(s.table.t, 1)} h`], ['W (joined up)', `${r(M.tabW(s.table.t), 0)} gal`]] },
  // 4.6
  pond: { text: 'Still water. The stone has just dropped in at the centre.', facts: () => [['dr/dt', `${M.POND.drdt} m/s`]] },
  ripple: { text: 'The ripple and the area inside it. The dark ring is the area it gains in the next quarter second: about the circumference times the growth in radius.', facts: s => { const q = M.pondR(s.pond.t); return [['r', `${r(q)} m`], ['A', `${r(M.pondA(q))} m²`], ['dA/dt = 2πr·dr/dt', `${r(M.pondDA(q))} m²/s`]]; } },
  radius: { text: 'The radius grows at a constant 0.5 m/s. Its rate is given; the area’s rate is what we find.', facts: s => [['r', `${r(M.pondR(s.pond.t))} m`], ['dr/dt', `${M.POND.drdt} m/s`]] },
  // 4.7
  wall: { text: 'The wall meets the floor at a right angle, so x² + y² = 5² at every instant.', facts: () => [['ladder', `${M.LAD.L} m`]] },
  ladder: { text: 'Both ends move; the length doesn’t. That fixed length is what ties dx/dt to dy/dt.', facts: s => { const x = M.ladX(s.ladder.t); return [['x', `${r(x)} m`], ['y', `${r(M.ladY(x))} m`], ['x² + y²', `${r(x * x + M.ladY(x) ** 2)} m²`]]; } },
  footRate: { text: 'The foot is pulled out at a constant rate.', facts: () => [['dx/dt', `+${r(M.LAD.dxdt)} m/s`]] },
  topRate: { text: 'The top’s velocity, dy/dt = −(x/y)·dx/dt. As the ladder flattens, x/y grows and the top falls faster.', facts: s => { const x = M.ladX(s.ladder.t); return [['x/y', `${r(x / M.ladY(x))}`], ['dy/dt', `${r(M.ladDY(x))} m/s`], ['dθ/dt', `${r(M.ladDTH(x), 3)} rad/s`]]; } },
  // 4.8
  tank: { text: `An inverted cone, ${M.CONE.R} m across the top (radius) and ${M.CONE.H} m deep. Every horizontal slice is a circle whose radius is half its height above the tip.`, facts: () => [['volume when full', `${r(M.coneV(M.CONE.H))} m³`]] },
  water: { text: 'The water is a cone similar to the tank: r = h/2, so V = πh³/12 depends on h alone.', facts: s => { const h = M.coneHt(s.cone.t); return [['h', `${r(h)} m`], ['r', `${r(h / 2)} m`], ['V', `${r(M.coneV(h))} m³`]]; } },
  rise: { text: 'The level’s rate, dh/dt = 1.5 / (πr²): the inflow divided by the area of the surface.', facts: s => { const h = M.coneHt(s.cone.t); return [['surface area', `${r(Math.PI * (h / 2) ** 2)} m²`], ['dh/dt', `${r(M.coneDH(h), 3)} m/min`]]; } },
  // 4.9
  lamp: { text: 'The light, 6 m up. The red ray from it grazes the walker’s head and lands at the shadow’s tip.', facts: () => [['height', `${M.SHA.lamp} m`]] },
  person: { text: 'The walker, moving away from the post at a steady pace.', facts: s => [['x', `${r(M.shaX(s.shadow.t))} m`], ['dx/dt', `${r(M.SHA.v, 1)} m/s`]] },
  shadowLen: { text: 'The shadow, s = (3/7)x. Its length grows at (3/7)(1.2) m/s, a constant; its tip moves at (10/7)(1.2) m/s.', facts: s => { const x = M.shaX(s.shadow.t); return [['s', `${r(M.shaS(x))} m`], ['ds/dt', `${r(M.SHA_DS, 3)} m/s`], ['tip speed', `${r(M.SHA_TIP, 3)} m/s`]]; } },
  // 4.10
  overview: { text: 'The whole graph of √x. The red frame is the window shown magnified on the right, closing in on (4, 2).', facts: s => { const k = M.zoomK(s.lin.t); return [['window', `${r(4 - 2 * k)} ≤ x ≤ ${r(4 + 2 * k)}`]]; } },
  zoom: { text: 'The window around (4, 2), magnified so it always fills the same square. As it shrinks, the curve becomes indistinguishable from its tangent line.', facts: s => { const k = M.zoomK(s.lin.t); return [['magnification', `×${Math.round(M.ZOOM0 / k)}`], ['√x at the window’s edge', `${r(M.sq(4 + 2 * k), 4)}`], ['L(x) there', `${r(M.sqL(4 + 2 * k), 4)}`]]; } },
  tangentLine: { text: 'The tangent line at x = 4, L(x) = 2 + (x − 4)/4.', facts: () => [['L(4.2)', r(M.LIN_EST, 4)], ['√4.2', r(M.LIN_TRUE, 4)]] },
  // 4.11
  concDown: { text: '√x is concave down: f″(x) = −x^(−3/2)/4 < 0. It bends away below its tangent line.', facts: s => [['x', r(M.ovrX(s.over.t))], ['f″(x)', r(-0.25 * M.ovrX(s.over.t) ** -1.5, 4)]] },
  concUp: { text: 'eˣ is concave up: its second derivative is eˣ > 0. It bends away above its tangent line.', facts: s => [['x', r(M.ovrU(s.over.t))], ['f″(x)', r(Math.exp(M.ovrU(s.over.t)), 4)]] },
  gapDown: { text: 'The error L(x) − √x, positive: the tangent-line estimate is too big.', facts: s => { const x = M.ovrX(s.over.t); return [['L(x)', r(M.sqL(x), 4)], ['√x', r(M.sq(x), 4)], ['L − f', r(M.sqL(x) - M.sq(x), 4)]]; } },
  gapUp: { text: 'The error L(x) − eˣ, negative: the tangent-line estimate is too small.', facts: s => { const u = M.ovrU(s.over.t); return [['L(x)', r(M.exL(u), 4)], ['eˣ', r(Math.exp(u), 4)], ['L − f', r(M.exL(u) - Math.exp(u), 4)]]; } },
  // 4.12
  numer: { text: 'The top, ln x. It passes through (1, 0) with slope 1.', facts: s => [['f(x)', r(M.lhF(M.lhX(s.lh.t)), 4)], ['f′(x) = 1/x', r(M.lhDF(M.lhX(s.lh.t)), 4)]] },
  denom: { text: 'The bottom, x² − 1. It passes through (1, 0) with slope 2.', facts: s => [['g(x)', r(M.lhG(M.lhX(s.lh.t)), 4)], ['g′(x) = 2x', r(M.lhDG(M.lhX(s.lh.t)), 4)]] },
  tangents: { text: 'The two tangent lines at x = 1, y = x − 1 and y = 2(x − 1). Near 1 the curves hug them, so f/g ≈ (x − 1)/(2(x − 1)) = 1/2.', facts: () => [['f′(1)/g′(1)', '1/2']] },
  heights: { text: 'f(x) and g(x) at the moving x, drawn as heights. Both go to 0, but one stays about half the other.', facts: s => { const x = M.lhX(s.lh.t); return [['x', r(x, 4)], ['f/g', r(M.lhF(x) / M.lhG(x), 4)], ['f′/g′', r(M.lhDF(x) / M.lhDG(x), 4)]]; } },
  // 4.13
  ratio0: { text: 'x²/eˣ: both top and bottom grow without bound, the form ∞/∞.', facts: s => { const x = M.infX(s.inf.t); return [['x', r(x)], ['x²/eˣ', M.r0(x).toPrecision(3)]]; } },
  ratio1: { text: 'After one step, 2x/eˣ. Still ∞/∞, so apply the rule again.', facts: s => { const x = M.infX(s.inf.t); return [['x', r(x)], ['2x/eˣ', M.r1(x).toPrecision(3)]]; } },
  ratio2: { text: 'After two steps, 2/eˣ: the top is a constant, the bottom grows without bound, so the limit is 0.', facts: s => { const x = M.infX(s.inf.t); return [['x', r(x)], ['2/eˣ', M.r2(x).toPrecision(3)]]; } },
};
