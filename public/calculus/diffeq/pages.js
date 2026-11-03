// The chapter, page by page: text on the left, and for the figure on the right the camera, the one lit thing and
// what is shown. Every number comes from model.js.
import * as M from './model.js';
import { CENTER } from './world.js';
import { tex } from '../engine/tex.js';

const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);
const cam = (k, dist, { az = 0, el = 4, dx = 0, dy = 0 } = {}) => ({ target: [CENTER[k][0] + dx, CENTER[k][1] + dy, 0], az, el, dist });
const E5 = M.EULER, eu = h => M.euler(h).at(-1)[1];
const eRow = i => { const [x, y] = E5[i], s = M.F(x, y); return `<tr><td>${f(x, 1)}</td><td>${f(y, 3)}</td><td>${f(s, 3)}</td><td>${f(M.H * s, 3)}</td></tr>`; };

export const PAGES = [
  {
    kicker: 'Chapter 7', title: 'Differential equations', sub: 'how a rate decides a function',
    body: `
      <p class="lede">A differential equation states how fast a quantity changes in terms of the quantity itself. Solving it means finding the function that changes that way.</p>
      <p>The figure is the equation for a population of fish in a lake:</p>
      <div class="eq">${tex(String.raw`\frac{dP}{dt} = ${M.KL}\,P\left(1 - \frac{P}{${M.L}}\right)`)}</div>
      <p>At every point (<i>t</i>, <i>P</i>) it gives a slope, drawn as a short segment. Every solution follows the segments. Lakes stocked with ${M.COVER_P0.slice(0, 3).join(', ')} or ${M.COVER_P0[3]} fish all end at the same size, ${M.L}, without anyone solving anything.</p>
      <p>The chapter writes such equations from words (7.1), checks proposed solutions (7.2), pictures them (7.3, 7.4), steps along them (7.5), solves them exactly (7.6, 7.7), and studies the two most important models, exponential and logistic growth (7.8, 7.9).</p>`,
    cam: cam('cover', 19, { az: 24, el: 13, dx: 0.4 }), lit: 'coverSols', look: {}, scene: 'cover',
    fig: 'Solutions following a slope field',
  },
  {
    kicker: '7.1', title: 'Modeling with differential equations', sub: 'a sentence about a rate, as an equation',
    body: `
      <p class="lede">“The coffee cools at a rate proportional to how much hotter it is than the room.” That sentence is a differential equation.</p>
      <p>The rate is <i>dT</i>/<i>dt</i>; how much hotter is <i>T</i> − ${M.ROOM}; proportional means a constant multiple, negative because hot coffee cools:</p>
      <div class="eq">${tex(String.raw`\frac{dT}{dt} = -k\,(T - ${M.ROOM})`)}</div>
      <p>With <i>k</i> = ${M.KC} per minute it gives the rate at any temperature, without knowing <i>T</i>(<i>t</i>). The red tangent’s slope is always −${M.KC} times the blue gap.</p>
      <table class="data">
        <tr><th><i>T</i> (°C)</th>${[90, 55, 30, 20].map(T => `<td>${T}</td>`).join('')}</tr>
        <tr><th><i>dT</i>/<i>dt</i> (°C/min)</th>${[90, 55, 30, 20].map(T => `<td>${f(M.coffeeRate(T), 1)}</td>`).join('')}</tr>
      </table>
      <p>Likewise “proportional to √<i>y</i>” is <i>dy</i>/<i>dt</i> = <i>k</i>√<i>y</i>, and “jointly to <i>y</i> and 100 − <i>y</i>” is <i>ky</i>(100 − <i>y</i>).</p>`,
    cam: cam('coffee', 19, { az: -8 }), lit: 'tangent', look: {}, scene: 'coffee',
    fig: 'dT/dt = −0.1(T − 20)',
  },
  {
    kicker: '7.2', title: 'Verifying solutions', sub: 'substitute, and both sides must agree',
    body: `
      <p class="lede">A function is a solution if putting it into the equation makes the two sides equal for every <i>x</i> in an interval. One point is not enough.</p>
      <p>Test <i>y</i> = <i>x</i> − 1 + 2<i>e</i><sup>−<i>x</i></sup> in <i>dy</i>/<i>dx</i> = <i>x</i> − <i>y</i>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned} \frac{dy}{dx} &= 1 - 2e^{-x} \\ x - y &= x - (x - 1 + 2e^{-x}) \\ &= 1 - 2e^{-x} \end{aligned}`)}</div>
      <p>They match, so it is a solution, and <i>y</i>(0) = ${M.Y0} picks it out. Now <i>y</i> = <i>x</i> + 2<i>e</i><sup>−<i>x</i></sup>: its derivative is the same, 1 − 2<i>e</i><sup>−<i>x</i></sup>, but <i>x</i> − <i>y</i> = −2<i>e</i><sup>−<i>x</i></sup>. They differ by 1 everywhere: not a solution.</p>
      <p>In the figure each curve carries its tangent (red, the slope it has) and a segment of slope <i>x</i> − <i>y</i> (blue, the slope the equation demands). On the solution they lie on top of each other.</p>
      <p>Second derivatives work the same way: <i>y</i> = sin 2<i>x</i> gives <i>y</i>″ = −4 sin 2<i>x</i> = −4<i>y</i>, so it solves <i>y</i>″ = −4<i>y</i>.</p>`,
    cam: cam('verify', 17.5, { az: -6 }), lit: 'deSlopes', look: {}, scene: 'verify',
    fig: 'Does the slope match x − y?',
  },
  {
    kicker: '7.3', title: 'Sketching slope fields', sub: 'the equation, drawn point by point',
    body: `
      <p class="lede">A differential equation gives a slope at every point. Draw a short segment with that slope at each point of a grid: that is a slope field.</p>
      <p>For <i>dy</i>/<i>dx</i> = <i>x</i> − <i>y</i>, evaluate at each point:</p>
      <table class="data">
        <tr><th>(<i>x</i>, <i>y</i>)</th>${[[0, 0], [1, 0], [0, 1], [2, -1], [-1, 2]].map(([x, y]) => `<td>(${f(x, 0)}, ${f(y, 0)})</td>`).join('')}</tr>
        <tr><th>slope</th>${[[0, 0], [1, 0], [0, 1], [2, -1], [-1, 2]].map(([x, y]) => `<td>${f(M.F(x, y), 0)}</td>`).join('')}</tr>
      </table>
      <p>Shortcuts save work. The slope is the same all along any line <i>x</i> − <i>y</i> = <i>c</i>: on <i>y</i> = <i>x</i> every segment is flat (dashed line); one step to the right of it, on <i>y</i> = <i>x</i> − 1, every slope is 1. Moving right raises the slope, moving up lowers it, so the top left is steeply downhill and the bottom right steeply uphill.</p>
      <p>If the equation involves only <i>x</i>, every column of segments is parallel; if only <i>y</i>, every row is.</p>`,
    cam: cam('field', 17.5, { az: 8 }), lit: 'field', look: { trace: 0 }, scene: 'field',
    fig: 'The slope field of dy/dx = x − y',
  },
  {
    kicker: '7.4', title: 'Reasoning using slope fields', sub: 'following the segments',
    body: `
      <p class="lede">A solution curve is tangent to the field everywhere it goes. Start at a point and follow the segments.</p>
      <p>From (0, ${M.Y0}) the slope is −1, so the curve falls. It levels off where it meets <i>y</i> = <i>x</i>, at (ln 2, ln 2) ≈ (${f(M.XMIN)}, ${f(M.YMIN)}), its lowest point, then climbs.</p>
      <p>Concavity comes from the equation too. Differentiate both sides with respect to <i>x</i>, remembering that <i>y</i> depends on <i>x</i>:</p>
      <div class="eq">${tex(String.raw`\frac{d^2y}{dx^2} = 1 - \frac{dy}{dx} = 1 - x + y`)}</div>
      <p>At (0, ${M.Y0}) that is ${f(1 - 0 + M.Y0, 0)} &gt; 0: concave up. It is positive at every point above the line <i>y</i> = <i>x</i> − 1, so every solution above that line is concave up, and every one below it concave down.</p>
      <p>The line itself (blue) is a solution, and as <i>x</i> grows every other solution, <i>y</i> = <i>x</i> − 1 + <i>Ce</i><sup>−<i>x</i></sup>, closes in on it.</p>`,
    cam: cam('field', 17.5, { az: -8 }), lit: 'solution', look: { trace: 1 }, scene: 'trace',
    fig: 'Solutions traced through the field',
  },
  {
    kicker: '7.5 · BC', title: 'Euler’s method', sub: 'stepping along tangent lines',
    body: `
      <p class="lede">When a solution can’t be found exactly, step along it. From a known point, move a short distance <i>h</i> along the tangent, then work out the slope again where you land. With <i>x</i><sub><i>n</i>+1</sub> = <i>x</i><sub><i>n</i></sub> + <i>h</i>:</p>
      <div class="eq">${tex(String.raw`y_{n+1} = y_n + h \cdot f(x_n, y_n)`)}</div>
      <p>For <i>dy</i>/<i>dx</i> = <i>x</i> − <i>y</i> from (0, ${M.Y0}) with <i>h</i> = ${M.H}:</p>
      <table class="data">
        <tr><th><i>x</i></th><th><i>y</i></th><th>slope <i>x</i> − <i>y</i></th><th><i>h</i> · slope</th></tr>
        ${[0, 1, 2, 3].map(eRow).join('')}
        <tr><td>${f(E5[4][0], 1)}</td><td>${f(E5[4][1], 3)}</td><td></td><td></td></tr>
      </table>
      <p>So <i>y</i>(2) ≈ ${f(E5[4][1], 3)}. The true value is 1 + 2<i>e</i><sup>−2</sup> = ${f(M.EXACT_E, 3)}. The estimate is low because the solution is concave up (7.4): every tangent line lies below the curve.</p>
      <p>Halving the step to ${M.HS[1]} gives ${f(eu(M.HS[1]), 3)}; to ${M.HS[2]}, ${f(eu(M.HS[2]), 3)}. Each halving roughly halves the error (blue).</p>`,
    cam: cam('euler', 17, { az: 6 }), lit: 'euler', look: {}, scene: 'euler',
    fig: 'Euler’s method, h = 0.5, 0.25, 0.125',
  },
  {
    kicker: '7.6', title: 'Separation of variables', sub: 'the general solution',
    body: `
      <p class="lede">If <i>dy</i>/<i>dx</i> is a function of <i>x</i> times a function of <i>y</i>, gather every <i>y</i> with <i>dy</i> on one side, every <i>x</i> with <i>dx</i> on the other, and integrate both sides.</p>
      <p>Solve <i>dy</i>/<i>dx</i> = <i>y</i> cos <i>x</i>:</p>
      <div class="eq">${tex(String.raw`\begin{aligned} \int \frac{dy}{y} &= \int \cos x\,dx \\ \ln|y| &= \sin x + C \\ y &= Ae^{\sin x} \end{aligned}`)}</div>
      <p>Only one constant is needed: constants from both sides combine into one. Exponentiating gives |<i>y</i>| = <i>e</i><sup><i>C</i></sup><i>e</i><sup>sin <i>x</i></sup>, and the ± and <i>e</i><sup><i>C</i></sup> merge into one constant <i>A</i>.</p>
      <p>Dividing by <i>y</i> assumed <i>y</i> ≠ 0, so check <i>y</i> = 0 separately: it is a solution too (<i>A</i> = 0).</p>
      <p>Check by differentiating: <i>Ae</i><sup>sin <i>x</i></sup> · cos <i>x</i> = <i>y</i> cos <i>x</i>. This is the <b>general solution</b>: a family of curves, one for each <i>A</i>. Here <i>A</i> = <i>y</i>(0), because sin 0 = 0.</p>`,
    cam: cam('sep', 18, { az: -6 }), lit: 'sepLive', look: {}, scene: 'sep',
    fig: 'y = Ae^(sin x), for many A',
  },
  {
    kicker: '7.7', title: 'Particular solutions', sub: 'one curve, and where it lives',
    body: `
      <p class="lede">An initial condition picks one curve from the family. Find the constant as soon as you have integrated, before solving for <i>y</i>.</p>
      <p>Solve <i>dy</i>/<i>dx</i> = 2<i>xy</i>² with <i>y</i>(0) = 1:</p>
      <div class="eq">${tex(String.raw`\begin{aligned} \int y^{-2}\,dy &= \int 2x\,dx \\ -\frac{1}{y} &= x^2 + C \end{aligned}`)}</div>
      <p>At <i>x</i> = 0, <i>y</i> = 1: −1 = 0 + <i>C</i>, so <i>C</i> = ${M.DOM_C}. Then −1/<i>y</i> = <i>x</i>² − 1, and</p>
      <div class="eq">${tex(String.raw`y = \frac{1}{1 - x^2}, \qquad -1 < x < 1`)}</div>
      <p>The domain matters. A solution must be differentiable on an <b>interval</b> containing the initial point. The formula breaks at <i>x</i> = ±1, so the particular solution is only the middle piece. The grey pieces satisfy the equation too, but the asymptotes cut them off from (0, 1).</p>`,
    cam: cam('dom', 19.5, { az: 6 }), lit: 'domSol', look: {}, scene: 'dom',
    fig: 'y = 1/(1 − x²), on −1 < x < 1',
  },
  {
    kicker: '7.8', title: 'Exponential models', sub: 'dy/dt = ky',
    body: `
      <p class="lede">When a quantity changes at a rate proportional to itself, the solution is always exponential:</p>
      <div class="eq">${tex(String.raw`\frac{dy}{dt} = ky \quad\Rightarrow\quad y = y_0\,e^{kt}`)}</div>
      <p>(Separate: ∫ <i>dy</i>/<i>y</i> = ∫ <i>k dt</i>, so ln|<i>y</i>| = <i>kt</i> + <i>C</i>.) <i>k</i> &gt; 0 is growth, <i>k</i> &lt; 0 decay. A culture of ${M.P0} bacteria doubles every ${M.TD} hours:</p>
      <div class="eq">${tex(String.raw`e^{${M.TD}k} = 2 \;\Rightarrow\; k = \frac{\ln 2}{${M.TD}} \approx ${f(M.KG, 4)}`)}</div>
      <p>After 10 hours, <i>P</i> = ${M.P0}<i>e</i><sup>10<i>k</i></sup> = ${M.P0} · 2<sup>2.5</sup> ≈ ${Math.round(M.grow(10))}. When <i>P</i> = ${4 * M.P0}, it is growing at <i>kP</i> = ${f(M.KG * 4 * M.P0, 1)} bacteria per hour: the bigger it is, the faster it grows.</p>
      <p>The coffee of 7.1 fits too: its excess <i>D</i> = <i>T</i> − ${M.ROOM} obeys <i>dD</i>/<i>dt</i> = −${M.KC}<i>D</i>, so <i>T</i> = ${M.ROOM} + ${M.T0 - M.ROOM}<i>e</i><sup>−${M.KC}<i>t</i></sup>, ${f(M.coffee(10), 1)} °C after 10 minutes.</p>`,
    cam: cam('exp', 18.5, { az: -6 }), lit: 'growTangent', look: {}, scene: 'exp',
    fig: 'P = 500e^(kt), doubling every 4 h',
  },
  {
    kicker: '7.9 · BC', title: 'Logistic models', sub: 'growth with a ceiling',
    body: `
      <p class="lede">Real populations can’t grow exponentially forever. The logistic equation slows growth as <i>P</i> nears a carrying capacity <i>L</i>:</p>
      <div class="eq">${tex(String.raw`\frac{dP}{dt} = kP\left(1 - \frac{P}{L}\right)`)}</div>
      <p>Read it without solving. For small <i>P</i> it is nearly <i>kP</i>: exponential. As <i>P</i> → <i>L</i> the rate → 0. Above <i>L</i> the rate is negative, so <i>P</i> falls back. <i>P</i> = 0 and <i>P</i> = <i>L</i> are constant solutions, and for any <i>P</i>(0) &gt; 0, <i>P</i> → <i>L</i>.</p>
      <p>As a function of <i>P</i> the rate is a parabola (below), highest halfway between its zeros. So growth is fastest at <b><i>P</i> = <i>L</i>/2</b>, where <i>P</i>(<i>t</i>) has its inflection point.</p>
      <p>A lake holds at most <i>L</i> = ${M.L} fish; <i>k</i> = ${M.KL} per year; it is stocked with ${M.PL0}. The fastest growth is at ${M.L / 2} fish, at ${f(M.KL)} · ${M.L / 2}(1 − ½) = ${M.RMAX} fish per year. With the solution <i>P</i> = ${M.L}/(1 + ${M.AL}<i>e</i><sup>−${M.KL}<i>t</i></sup>), that happens at <i>t</i> = ln ${M.AL}/${M.KL} ≈ ${f(M.TH)} years.</p>`,
    cam: cam('logiP', 29, { az: -6, dy: -2.2 }), lit: 'rateNow', look: {}, scene: 'logi',
    fig: 'dP/dt = 0.6P(1 − P/1200)',
  },
];

const ff = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const at = s => {
  const ep = M.eulerPhase(s.c), pts = M.euler(ep.h);
  return { ep, pts, x: M.verifyX(s.c), xt: M.traceX(s.c), tc: M.coffeeT(s.c), tg: M.growT(s.c), tl: M.logiT(s.c) };
};
export const PLATES = {
  coverField: { text: `Each segment is the slope dP/dt at its point. It depends only on P, so every row of segments is parallel: flat at P = 0 and P = ${M.L}, steepest at P = ${M.L / 2}, and pointing down above ${M.L}.`,
    facts: () => [['equation', `dP/dt = ${M.KL}P(1 − P/${M.L})`], ['slope at P = 600', `${M.RMAX} per unit t`], ['slope at P = 1400', ff(M.logiRate(1400), 1)]] },
  coverSols: { text: 'Four solutions, one for each starting size. None crosses another: through each point passes exactly one solution. All of them level off at the carrying capacity.',
    facts: s => { const t = M.coverT(s.c); return [['t', ff(t)], ...M.COVER_P0.map(p => [`from P(0) = ${p}`, ff(M.logi(t, p), 0)])]; } },
  coverL: { text: `On the line P = ${M.L} the slope is zero, so a population of exactly ${M.L} stays there: an equilibrium solution. Populations below rise to it; above it, they fall to it.`,
    facts: () => [['dP/dt at P = L', '0']] },
  coffeeCurve: { text: `The coffee’s temperature over half an hour. Found in 7.8: T = ${M.ROOM} + ${M.T0 - M.ROOM}e^(−${M.KC}t). Fast cooling at first, slower as it nears the room’s temperature.`,
    facts: s => { const t = at(s).tc; return [['t', `${ff(t, 1)} min`], ['T', `${ff(M.coffee(t), 1)} °C`]]; } },
  room: { text: `At T = ${M.ROOM} the model gives dT/dt = 0: coffee at room temperature stays there. The curve approaches this line but never reaches it.`,
    facts: () => [['T', `${M.ROOM} °C`], ['dT/dt', '0']] },
  gap: { text: 'T − 20, how much hotter than the room. The model says the cooling rate is this times 0.1, so as the gap closes the cooling slows.',
    facts: s => { const T = M.coffee(at(s).tc); return [['T − 20', `${ff(T - M.ROOM, 1)} °C`], ['× −0.1 = dT/dt', `${ff(M.coffeeRate(T))} °C/min`]]; } },
  tangent: { text: 'The tangent line at the current moment. Its slope is dT/dt, and the differential equation gives it from the temperature alone.',
    facts: s => { const t = at(s).tc, T = M.coffee(t); return [['t', `${ff(t, 1)} min`], ['T', `${ff(T, 1)} °C`], ['dT/dt = −0.1(T − 20)', `${ff(M.coffeeRate(T))} °C/min`]]; } },
  good: { text: 'This curve’s slope equals x − y at every point on it, so it is a solution. It also passes through (0, 1).',
    facts: s => { const x = at(s).x, y = M.sol(x); return [['x', ff(x)], ['y', ff(y)], ['dy/dx', ff(M.dsol(x))], ['x − y', ff(M.F(x, y))]]; } },
  bad: { text: 'Same shape, one unit higher. Its slope is the same as the solution’s, but because y is 1 larger, x − y is 1 smaller. The two sides never agree.',
    facts: s => { const x = at(s).x, y = M.wrong(x); return [['x', ff(x)], ['y', ff(y)], ['dy/dx', ff(M.dsol(x))], ['x − y', ff(M.F(x, y))], ['difference', '1, always']]; } },
  tangents: { text: 'Red: the tangent to each curve, the slope it really has. The two curves are parallel, so both tangents have the same slope, 1 − 2e^(−x).',
    facts: s => { const x = at(s).x; return [['x', ff(x)], ['slope of both', ff(M.dsol(x))]]; } },
  deSlopes: { text: 'Blue: what the equation demands at the same points, a slope of x − y. On the solution it hides inside the red tangent; on the other curve it points the wrong way.',
    facts: s => { const x = at(s).x; return [['on the solution', ff(M.F(x, M.sol(x)))], ['on the candidate', ff(M.F(x, M.wrong(x)))], ['tangent slope', ff(M.dsol(x))]]; } },
  field: { text: 'Forty-nine segments, one at each integer point from −3 to 3. Each has slope x − y. Along any diagonal line x − y = c they are all parallel.',
    facts: s => { const n = M.sketchCount(s.c), i = Math.min(n, M.SKETCH_N - 1), x = M.GRID[i % 7], y = M.GRID[6 - Math.floor(i / 7)]; return [['drawn', `${n} of ${M.SKETCH_N}`], ['at', `(${ff(x, 0)}, ${ff(y, 0)})`], ['slope x − y', ff(M.F(x, y), 0)]]; } },
  isocline: { text: 'Every point with y = x has slope x − y = 0, so solutions cross this line only where they level off: their lowest points.',
    facts: () => [['slope on it', '0']] },
  straight: { text: 'On y = x − 1 the field’s slope is x − (x − 1) = 1, and the line itself has slope 1. So the line is a solution, the one with C = 0, and every other solution approaches it.',
    facts: () => [['C', '0'], ['slope', '1 everywhere'], ['d²y/dx²', '0']] },
  family: { text: 'Solutions from other starting points: y = x − 1 + Ce^(−x) for C = 4 and C = −1. The one above the blue line is concave up, the one below concave down.',
    facts: () => [['C = 4', 'y(0) = 3'], ['C = −1', 'y(0) = −2']] },
  solution: { text: 'The solution through (0, 1), traced: tangent to every segment it meets. It falls, levels off on y = x, and rises toward y = x − 1.',
    facts: s => { const x = at(s).xt, y = M.sol(x); return [['x', ff(x)], ['y', ff(y)], ['dy/dx = x − y', ff(M.F(x, y))], ['d²y/dx² = 1 − x + y', ff(1 - x + y)]]; } },
  lowest: { text: 'Where the solution meets y = x its slope is 0. Its second derivative there is 1 − 0 = 1 > 0, so this is a minimum.',
    facts: () => [['x = ln 2', ff(M.XMIN, 4)], ['y', ff(M.YMIN, 4)], ['dy/dx', '0'], ['d²y/dx²', '1']] },
  eField: { text: 'The same field as 7.3, faintly. Euler’s method reads one segment at each step, at the point it has reached.',
    facts: () => [['equation', 'dy/dx = x − y']] },
  exact: { text: `The true solution y = x − 1 + 2e^(−x). It is concave up on the whole interval, so every tangent step falls below it.`,
    facts: () => [['y(2)', ff(M.EXACT_E, 4)]] },
  euler: { text: 'Each red step runs along the tangent at its start for a run of h, then a new slope is read. Smaller steps follow the curve more closely.',
    facts: s => { const { ep, pts } = at(s), k = Math.min(Math.floor(ep.shown), ep.n), [x, y] = pts[k]; return [['h', `${ep.h}`], ['steps drawn', `${k} of ${ep.n}`], ['at', `(${ff(x, 3)}, ${ff(y, 3)})`], ['estimate of y(2)', ff(pts[ep.n][1], 4)]]; } },
  table: { text: 'The four steps of the table, h = 0.5, kept in grey. Its corners are the rows: (0, 1), (0.5, 0.5), (1, 0.5), (1.5, 0.75), (2, 1.125).',
    facts: () => M.EULER.map(([x, y]) => [`x = ${x}`, `y ≈ ${y}`]) },
  error: { text: 'The gap at x = 2 between the true value and the estimate. It roughly halves each time h is halved.',
    facts: s => { const { ep, pts } = at(s); return [['h', `${ep.h}`], ['estimate', ff(pts[ep.n][1], 4)], ['true', ff(M.EXACT_E, 4)], ['error', ff(M.EXACT_E - pts[ep.n][1], 4)]]; } },
  sepField: { text: 'The field of dy/dx = y cos x. Flat on the x-axis (y = 0) and wherever cos x = 0, at x = ±π/2, 3π/2, …',
    facts: () => [['flat at', 'y = 0, x = π/2 + nπ']] },
  sepFamily: { text: 'The general solution y = Ae^(sin x), drawn for A = ±0.5, ±1, ±1.5. Each is A times the same wave; they never cross.',
    facts: () => [['A', '±0.5, ±1, ±1.5'], ['period', '2π']] },
  sepLive: { text: 'One member of the family, with A sweeping through its values. Where it crosses the y-axis, y = A, because sin 0 = 0. A = 0 gives the solution y = 0.',
    facts: s => { const A = M.sepC(s.c); return [['A = y(0)', ff(A)], ['highest', `${ff(A * Math.E)} at x = π/2`], ['lowest', `${ff(A / Math.E)} at x = −π/2`]]; } },
  domSol: { text: 'The particular solution: the piece of y = 1/(1 − x²) through (0, 1). It rises without bound as x approaches ±1, so it cannot be continued past them.',
    facts: s => { const x = M.domX(s.c), y = M.domSol(x); return [['x', ff(x)], ['y', ff(y)], ['dy/dx = 2xy²', ff(2 * x * y * y)]]; } },
  outside: { text: 'For |x| > 1 the same formula satisfies dy/dx = 2xy², but these pieces are not connected to the initial point, so they are not part of this solution.',
    facts: () => [['y at x = 2', ff(M.domSol(2), 3)], ['part of the solution?', 'no']] },
  asymptotes: { text: 'Where 1 − x² = 0 the solution is undefined. The interval of the particular solution stops at the first break on each side of x = 0.',
    facts: () => [['at', 'x = −1 and x = 1'], ['domain', '−1 < x < 1']] },
  start: { text: 'The initial condition y(0) = 1 fixes the constant: −1/1 = 0² + C, so C = −1.',
    facts: () => [['x', '0'], ['y', '1'], ['C', `${M.DOM_C}`.replace('-', '−')]] },
  growCurve: { text: `P = ${M.P0}e^(kt) with k = ln 2/${M.TD}. Exponential: it grows by the same factor in equal times.`,
    facts: s => { const t = at(s).tg; return [['t', `${ff(t, 1)} h`], ['P', ff(M.grow(t), 0)]]; } },
  doubling: { text: `Every ${M.TD} hours P doubles, whatever its size: ${M.P0}, ${2 * M.P0}, ${4 * M.P0}, ${8 * M.P0}. The doubling time is ln 2/k.`,
    facts: () => [['doubling time', `${M.TD} h`], ['k = ln 2/4', ff(M.KG, 4)]] },
  growTangent: { text: 'The tangent’s slope is dP/dt = kP: proportional to the height of the point, so the curve steepens as it rises.',
    facts: s => { const t = at(s).tg, P = M.grow(t); return [['P', ff(P, 0)], ['dP/dt = kP', `${ff(M.KG * P, 1)} per hour`]]; } },
  logiCurve: { text: `The logistic curve: slow at first, fastest at P = ${M.L / 2}, then levelling off at ${M.L}. It is an S shape, with its inflection point halfway up.`,
    facts: s => { const t = at(s).tl; return [['t', `${ff(t)} years`], ['P', ff(M.logi(t), 0)]]; } },
  carrying: { text: `The carrying capacity. dP/dt = 0 when P = ${M.L}, so P approaches this line as t → ∞.`,
    facts: () => [['L', `${M.L}`], ['lim P(t)', `${M.L}`]] },
  half: { text: `Half the carrying capacity, ${M.L / 2} fish. The curve crosses it at its steepest point (blue), at t = ln ${M.AL}/${M.KL}.`,
    facts: () => [['P', `${M.L / 2}`], ['t', `${ff(M.TH, 3)} years`], ['dP/dt', `${M.RMAX} fish/year`]] },
  logiTangent: { text: 'The tangent at the current moment. Its slope is kP(1 − P/L): small at both ends, largest at L/2.',
    facts: s => { const P = M.logi(at(s).tl); return [['P', ff(P, 0)], ['dP/dt', `${ff(M.logiRate(P), 1)} fish/year`]]; } },
  rateCurve: { text: `dP/dt against P: the parabola 0.6P(1 − P/1200), zero at P = 0 and P = ${M.L}, highest at the midpoint, P = ${M.L / 2}.`,
    facts: () => [['zeros', `P = 0, ${M.L}`], ['max', `${M.RMAX} at P = ${M.L / 2}`]] },
  rateNow: { text: 'The red dot is the population now, read on the rate parabola. It moves right as P grows: up the parabola while P < 600, down it after.',
    facts: s => { const P = M.logi(at(s).tl); return [['P', ff(P, 0)], ['dP/dt', `${ff(M.logiRate(P), 1)} fish/year`], ['growth is', P < M.L / 2 ? 'speeding up' : 'slowing down']]; } },
};
