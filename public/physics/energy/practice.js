// energy/practice.js — AP-style practice, one or two questions per page (keys are page indices, as in PAGES).
// Every number is computed here from the model or from the givens; checks.mjs recomputes each answer another way.
import * as M from './model.js';
import { tex } from '../engine/tex.js';

const G = M.G, D2R = Math.PI / 180;
const f = (x, n = 2) => (x < -1e-12 ? '−' : '') + Math.abs(x).toFixed(n);

// 0 · work: the page's pull, 20 N at 30°, over 3.0 m
const P = M.PULL, d0 = 3.0, W0 = P.F * d0 * Math.cos(P.th);
// 1 · the toss
const T = M.TOSS, Wup = -0.5 * T.m * T.v0 ** 2;
// 2 · the whirl, half a lap
const Wh = M.WHIRL, halfArc = Math.PI * Wh.r;
// 3 · the car over 12 m from rest
const C = M.CAR, d3 = 12, v3 = Math.sqrt(2 * C.F * d3 / C.m);
// 4 · the drop, zero on the 1.0 m tabletop; speed 1.0 m above the ground
const Dr = M.DROP, y4 = 1.0, U4 = Dr.m * G * (Dr.h - Dr.ref2), v4 = Math.sqrt(2 * G * (Dr.h - y4));
// 5 · the spring, compression when the block has slowed to 1.0 m/s
const S = M.SPRING, v5 = 1.0, x5 = Math.sqrt(S.m * (S.v0 ** 2 - v5 ** 2) / S.k);
// 6 · the changing push (Physics C)
const Pu = M.PUSH, v6 = Math.sqrt(2 * Pu.W / Pu.m), Whalf = Pu.F0 * Pu.L * 13 / 24;
// 7 · the pendulum at 20°
const Pd = M.PEND, th7 = 20 * D2R, v7 = Math.sqrt(2 * G * Pd.L * (Math.cos(th7) - Math.cos(Pd.th0)));
const vb = Math.sqrt(2 * G * Pd.L * (1 - Math.cos(Pd.th0))), Tb = Pd.m * G + Pd.m * vb ** 2 / Pd.L;
// 8 · U(x) = 3x² − 2x³ (Physics C)
const U8 = x => 3 * x * x - 2 * x ** 3, F8 = x => -(6 * x - 6 * x * x), x8 = 2.0;
// 9 · the bond (Physics C)
const B = M.BOND, kB = 72 * B.eps / B.r0 ** 2, TB = 2 * Math.PI * Math.sqrt(B.m / kB);
// 10 · the slide, from 8.0 m/s; heat after 1.0 m from 4.0 m/s
const Sl = M.SLIDE, v10 = 8.0, d10 = v10 ** 2 / (2 * Sl.mu * G), x10 = 1.0, Q10 = Sl.mu * Sl.m * G * x10;
// 11 · a student on the stairs
const m11 = 70, h11 = 3.0, t11 = 4.2, P11 = m11 * G * h11 / t11;

export const PRACTICE = {
  0: [
    { q: `The rope pulls the ${f(P.m, 1)} kg box with ${f(P.F, 0)} N at ${P.deg}° above the horizontal while it slides ${f(d0, 1)} m along the frictionless floor. How much work does the rope do?`,
      choices: [`${f(P.F * d0 * Math.sin(P.th), 1)} J`, `${f(P.F * d0, 1)} J`, `${f(W0, 1)} J`, `${f(P.F * d0 / Math.cos(P.th), 1)} J`], answer: 2,
      why: `<p>Only the component along the displacement does work:</p><div class="eq">${tex(String.raw`W = F\Delta x\cos\theta = ${f(P.F, 0)} \times ${f(d0, 1)} \times \cos ${P.deg}^\circ = ${f(W0, 1)}\ \text{J}`)}</div><p>${f(P.F * d0 * Math.sin(P.th), 1)} J uses sin θ, the part across the motion; ${f(P.F * d0, 1)} J ignores the angle.</p>` },
    { q: 'During the same pull, how much work does the floor’s normal force do on the box?',
      choices: ['Negative, since the normal force is less than <i>mg</i>', 'Zero, since it is perpendicular to the displacement', 'Positive, since it points up', 'Equal and opposite to the work done by the rope'], answer: 1,
      why: '<p>The normal force is vertical and the box moves horizontally: θ = 90°, cos 90° = 0, so <i>W</i> = 0. Its size (smaller than <i>mg</i> because the rope lifts a little) does not matter.</p>' },
  ],
  1: [
    { q: `The ${f(T.m)} kg ball leaves the hand at ${f(T.v0, 1)} m/s straight up. How much work does gravity do on it from the hand to the top?`,
      choices: [`${f(-Wup)} J`, `${f(0)} J`, `${f(2 * Wup)} J`, `${f(Wup)} J`], answer: 3,
      why: `<p>Gravity points opposite the motion (θ = 180°), so its work is negative, and by the work–energy theorem it removes all the kinetic energy:</p><div class="eq">${tex(String.raw`W_g = \Delta K = 0 - \tfrac12 \times ${f(T.m)} \times ${f(T.v0, 1)}^2 = ${f(Wup)}\ \text{J}`)}</div><p>${f(2 * Wup)} J forgets the ½; +${f(-Wup)} J has the wrong sign.</p>` },
    { q: 'Over the whole trip, from leaving the hand until it is back at the same height, the total work done by gravity on the ball is',
      choices: ['positive', 'negative', 'zero', 'equal to <i>mgh</i>, with <i>h</i> the greatest height'], answer: 2,
      why: '<p>Negative work on the way up, the same amount of positive work on the way down: the total is zero. That is why the ball comes back to the hand at its launch speed (no air resistance).</p>' },
  ],
  2: [
    { q: `The string’s tension on the whirling ball is ${f(Wh.T, 1)} N, and the circle has radius ${f(Wh.r, 1)} m. How much work does the tension do during half a lap?`,
      choices: [`${f(Wh.T * halfArc, 1)} J`, `${f(Wh.T * 2 * Wh.r, 1)} J`, `${f(-Wh.T * halfArc, 1)} J`, '0 J'], answer: 3,
      why: `<p>At every instant the tension points at the centre and the velocity along the circle: they meet at 90°, so each small step contributes ${tex.inline(String.raw`T\,ds\cos 90^\circ = 0`)}. The total is 0 J, and the speed never changes.</p><p>${f(Wh.T * halfArc, 1)} J multiplies the force by the arc length as if they were parallel; ${f(Wh.T * 2 * Wh.r, 1)} J uses the diameter, the net displacement, which is still not along the force at each moment.</p>` },
    { q: 'The ball is now whirled at twice the speed on the same string. By what factors do the tension and the ball’s kinetic energy change?',
      choices: ['tension ×2, kinetic energy ×4', 'tension ×4, kinetic energy ×4', 'tension ×4, kinetic energy ×2', 'tension ×2, kinetic energy ×2'], answer: 1,
      why: `<p>${tex.inline(String.raw`T = \frac{mv^2}{r}`)} and ${tex.inline(String.raw`K = \tfrac12 mv^2`)} both go as <i>v</i>², so both grow 4×. The tension still does no work: the larger <i>K</i> came from whatever sped the ball up.</p>` },
  ],
  3: [
    { q: `A net force of ${f(C.F / 1000, 1)} kN pushes the ${C.m} kg car from rest through ${d3} m. What is its speed then?`,
      choices: [`${f(Math.sqrt(C.F * d3 / C.m))} m/s`, `${f(v3)} m/s`, `${f(C.F * d3 / C.m, 1)} m/s`, `${f(2 * C.F * d3 / C.m, 1)} m/s`], answer: 1,
      why: `<div class="eq">${tex(String.raw`W_\text{net} = F\Delta x = ${f(C.F * d3 / 1000, 1)}\ \text{kJ} = \tfrac12 mv^2 \quad\Rightarrow\quad v = \sqrt{\frac{2 \times ${f(C.F * d3, 0)}}{${C.m}}} = ${f(v3)}\ \text{m/s}`)}</div><p>${f(Math.sqrt(C.F * d3 / C.m))} m/s drops the ½; the other two forget the square root.</p>` },
    { q: 'The same net force takes the car from rest to speed <i>v</i>, then from <i>v</i> to 2<i>v</i>. The net work in the second stage is how many times that in the first?',
      choices: ['1', '2', '4', '3'], answer: 3,
      why: `<p>Δ<i>K</i> from 0 to <i>v</i> is ${tex.inline(String.raw`\tfrac12 mv^2`)}. From <i>v</i> to 2<i>v</i> it is ${tex.inline(String.raw`\tfrac12 m(4v^2 - v^2) = 3 \times \tfrac12 mv^2`)}. Kinetic energy grows with <i>v</i>², so equal steps in speed cost more and more work (and distance).</p>` },
  ],
  4: [
    { q: `Take <i>U</i><sub>g</sub> = 0 on a tabletop ${f(Dr.ref2, 1)} m above the ground. What is <i>U</i><sub>g</sub> of the ${f(Dr.m)} kg ball held ${f(Dr.h, 1)} m above the ground?`,
      choices: [`${f(Dr.m * G * Dr.h)} J`, `${f(Dr.m * G * Dr.ref2)} J`, `${f(U4)} J`, `${f(Dr.m * G * (Dr.h + Dr.ref2))} J`], answer: 2,
      why: `<p>Measure Δ<i>y</i> from the chosen zero: ${f(Dr.h, 1)} − ${f(Dr.ref2, 1)} = ${f(Dr.h - Dr.ref2, 1)} m.</p><div class="eq">${tex(String.raw`U_g = mg\Delta y = ${f(Dr.m)} \times ${f(G)} \times ${f(Dr.h - Dr.ref2, 1)} = ${f(U4)}\ \text{J}`)}</div><p>${f(Dr.m * G * Dr.h)} J is right only with the zero on the ground.</p>` },
    { q: `The ball is dropped from ${f(Dr.h, 1)} m. How fast is it moving when it is ${f(y4, 1)} m above the ground?`,
      choices: [`${f(Math.sqrt(2 * G * y4))} m/s`, `${f(Math.sqrt(2 * G * Dr.h))} m/s`, `${f(2 * G * (Dr.h - y4), 1)} m/s`, `${f(v4)} m/s`], answer: 3,
      why: `<p>It has fallen ${f(Dr.h - y4, 1)} m, and the lost <i>U</i><sub>g</sub> is now <i>K</i>:</p><div class="eq">${tex(String.raw`mg\Delta y = \tfrac12 mv^2 \quad\Rightarrow\quad v = \sqrt{2 \times ${f(G)} \times ${f(Dr.h - y4, 1)}} = ${f(v4)}\ \text{m/s}`)}</div><p>${f(Math.sqrt(2 * G * y4))} m/s uses its height above the ground instead of the distance fallen.</p>` },
  ],
  5: [
    { q: `The ${f(S.m, 1)} kg block hits the ${S.k} N/m spring at ${f(S.v0, 1)} m/s. How far is the spring compressed when the block has slowed to ${f(v5, 1)} m/s?`,
      choices: [`${f(x5, 3)} m`, `${f(S.xmax / 2, 3)} m`, `${f(S.m * (S.v0 ** 2 - v5 ** 2) / S.k, 3)} m`, `${f(Math.sqrt(S.m * (S.v0 ** 2 - v5 ** 2) / (2 * S.k)), 3)} m`], answer: 0,
      why: `<div class="eq">${tex(String.raw`\tfrac12 mv_0^2 = \tfrac12 mv^2 + \tfrac12 k\Delta x^2 \quad\Rightarrow\quad \Delta x = \sqrt{\frac{m(v_0^2 - v^2)}{k}} = \sqrt{\frac{${f(S.m, 1)} \times ${f(S.v0 ** 2 - v5 ** 2, 1)}}{${S.k}}} = ${f(x5, 3)}\ \text{m}`)}</div><p>Half the speed is not half the compression: three quarters of the kinetic energy is already stored, so Δ<i>x</i> is ${tex.inline(String.raw`\sqrt{\tfrac34}`)} of ${f(S.xmax)} m.</p>` },
    { q: 'If the block came in twice as fast, the greatest compression of the spring would be',
      choices: ['the same', '√2 times as large', 'twice as large', 'four times as large'], answer: 2,
      why: `<p>${tex.inline(String.raw`\tfrac12 kx_\text{max}^2 = \tfrac12 mv_0^2`)}, so ${tex.inline(String.raw`x_\text{max} = v_0\sqrt{\frac{m}{k}}`)}: proportional to <i>v</i><sub>0</sub>. Four times the energy, but energy goes as <i>x</i>², so twice the compression.</p>` },
  ],
  6: [
    { q: `The push ${tex.inline(String.raw`F(x) = F_0\left(1 - \frac{x}{L}\right)\left(1 + \frac{2x}{L}\right)`)}, <i>F</i><sub>0</sub> = ${Pu.F0} N, <i>L</i> = ${f(Pu.L, 1)} m, acts on the ${f(Pu.m, 1)} kg crate from rest. Its speed at <i>x</i> = <i>L</i>?`,
      choices: [`${f(Math.sqrt(2 * Pu.F0 * Pu.L / Pu.m))} m/s`, `${f(Math.sqrt(Pu.W / Pu.m))} m/s`, `${f(Math.sqrt(2 * (Pu.F0 / 2) * Pu.L / Pu.m))} m/s`, `${f(v6)} m/s`], answer: 3,
      why: `<p>Expand and integrate:</p><div class="eq">${tex(String.raw`W = \int_0^L F_0\left(1 + \frac{x}{L} - \frac{2x^2}{L^2}\right) dx = F_0 L\left(1 + \tfrac12 - \tfrac23\right) = \tfrac56 F_0 L = ${f(Pu.W, 1)}\ \text{J}`)}</div><div class="eq">${tex(String.raw`v = \sqrt{\frac{2W}{m}} = \sqrt{\frac{2 \times ${f(Pu.W, 1)}}{${f(Pu.m, 1)}}} = ${f(v6)}\ \text{m/s}`)}</div><p>${f(Math.sqrt(2 * Pu.F0 * Pu.L / Pu.m))} m/s treats the push as a steady ${Pu.F0} N; ${f(Math.sqrt(2 * (Pu.F0 / 2) * Pu.L / Pu.m))} m/s averages only the two end values, missing the bulge in the middle.</p>` },
    { q: `Free response. Find the work the same push does over the first half of its range, from <i>x</i> = 0 to ${tex.inline(String.raw`x = \frac{L}{2}`)}. Is it more or less than half of the ${f(Pu.W, 1)} J total? Why?`,
      solution: `<p>Expand: ${tex.inline(String.raw`F = F_0\left(1 + \frac{x}{L} - \frac{2x^2}{L^2}\right)`)}. Integrate term by term:</p><div class="eq">${tex(String.raw`W = F_0\left[x + \frac{x^2}{2L} - \frac{2x^3}{3L^2}\right]_0^{L/2} = F_0 L\left(\tfrac12 + \tfrac18 - \tfrac{1}{12}\right) = \frac{13}{24} F_0 L`)}</div><div class="eq">${tex(String.raw`W = \frac{13}{24} \times ${Pu.F0} \times ${f(Pu.L, 1)} = ${f(Whalf, 1)}\ \text{J}`)}</div><p>More than half of ${f(Pu.W, 1)} J: the push peaks at ${tex.inline(String.raw`x = \frac{L}{4}`)}, so the area under <i>F</i>(<i>x</i>) is bunched in the first half and the second half only gets the fading tail.</p>` },
  ],
  7: [
    { q: `The ${f(Pd.m, 1)} kg bob on the ${f(Pd.L, 1)} m string is released from rest at ${Pd.deg0}°. How fast is it moving when the string makes 20° with the vertical?`,
      choices: [`${f(v7)} m/s`, `${f(Math.sqrt(2 * G * Pd.L * (1 - Math.cos(th7))))} m/s`, `${f(vb)} m/s`, `${f(vb / Math.SQRT2)} m/s`], answer: 0,
      why: `<p>Only the height drop between the two angles counts: Δ<i>y</i> = <i>L</i>(cos 20° − cos ${Pd.deg0}°) = ${f(Pd.L * (Math.cos(th7) - Math.cos(Pd.th0)), 3)} m.</p><div class="eq">${tex(String.raw`v = \sqrt{2g\Delta y} = \sqrt{2 \times ${f(G)} \times ${f(Pd.L * (Math.cos(th7) - Math.cos(Pd.th0)), 3)}} = ${f(v7)}\ \text{m/s}`)}</div><p>${f(Math.sqrt(2 * G * Pd.L * (1 - Math.cos(th7))))} m/s uses the height above the bottom at 20°, not the drop from ${Pd.deg0}°. Half the angle is not half the energy.</p>` },
    { q: 'What is the tension in the string as the bob passes the lowest point?',
      choices: [`${f(Pd.m * G * Math.cos(Pd.th0))} N`, `${f(Pd.m * G)} N`, `${f(Tb)} N`, `${f(Pd.m * G - Pd.m * vb ** 2 / Pd.L)} N`], answer: 2,
      why: `<p>At the bottom the bob moves on a circle at <i>v</i> = ${f(vb)} m/s, so the net force points up, toward the pivot:</p><div class="eq">${tex(String.raw`T - mg = \frac{mv^2}{L} \quad\Rightarrow\quad T = ${f(Pd.m * G)} + ${f(Pd.m * vb ** 2 / Pd.L)} = ${f(Tb)}\ \text{N}`)}</div><p><i>T</i> = <i>mg</i> would be right only if the bob were at rest there.</p>` },
  ],
  8: [
    { q: 'A particle moves along <i>x</i> with potential energy <i>U</i>(<i>x</i>) = 3<i>x</i>² − 2<i>x</i>³ (<i>U</i> in J, <i>x</i> in m). What is the force on it at <i>x</i> = 2.0 m?',
      choices: [`${f(-U8(x8), 1)} N`, `${f(-F8(x8), 1)} N`, `${f(U8(x8), 1)} N`, `+${f(F8(x8), 1)} N`], answer: 3,
      why: `<div class="eq">${tex(String.raw`F_x = -\frac{dU}{dx} = -(6x - 6x^2) = -(12 - 24) = +${f(F8(x8), 1)}\ \text{N}`)}</div><p>The slope of <i>U</i> there is negative (<i>U</i> falls toward +<i>x</i>), so the force points in +<i>x</i>: downhill. −${f(F8(x8), 1)} N forgets the minus sign; ±${f(-U8(x8), 1)} N uses <i>U</i> itself, not its slope.</p>` },
    { q: 'For the same <i>U</i>(<i>x</i>) = 3<i>x</i>² − 2<i>x</i>³, the particle can be in equilibrium at <i>x</i> = 0 and at <i>x</i> = 1 m. Which is which?',
      choices: ['both stable', '<i>x</i> = 0 unstable, <i>x</i> = 1 m stable', '<i>x</i> = 0 stable, <i>x</i> = 1 m unstable', 'both unstable'], answer: 2,
      why: `<p>${tex.inline(String.raw`\frac{dU}{dx} = 6x - 6x^2 = 0`)} at <i>x</i> = 0 and 1. The second derivative decides: ${tex.inline(String.raw`U'' = 6 - 12x`)} is +6 at <i>x</i> = 0 (a valley, stable) and −6 at <i>x</i> = 1 m (a hump, unstable).</p>` },
  ],
  9: [
    { q: `Free response. For the bond, ${tex.inline(String.raw`U(r) = \varepsilon\left[\left(\frac{r_0}{r}\right)^{12} - 2\left(\frac{r_0}{r}\right)^6\right]`)} with ε = ${f(B.eps / M.EV, 1)} eV and <i>r</i><sub>0</sub> = ${f(B.r0 * 1e9)} nm. Show that <i>r</i><sub>0</sub> is an equilibrium, find the spring constant ${tex.inline(String.raw`k = U''(r_0)`)}, and the period of small vibrations of the ${f(B.m / M.AMU, 1)} u atom.`,
      solution: `<p>Differentiate:</p><div class="eq">${tex(String.raw`U' = \varepsilon\left[-\frac{12r_0^{12}}{r^{13}} + \frac{12r_0^6}{r^7}\right]`)}</div><p>At <i>r</i> = <i>r</i><sub>0</sub> the brackets give ${tex.inline(String.raw`-\frac{12}{r_0} + \frac{12}{r_0} = 0`)}: no force, equilibrium.</p><div class="eq">${tex(String.raw`U'' = \varepsilon\left[\frac{156r_0^{12}}{r^{14}} - \frac{84r_0^6}{r^8}\right] \quad\Rightarrow\quad U''(r_0) = \frac{72\varepsilon}{r_0^2}`)}</div><p>Positive, so it is a stable minimum. With ε = ${B.eps.toExponential(3).replace('e-', '×10<sup>−')}</sup> J and <i>r</i><sub>0</sub> = ${f(B.r0 * 1e9)}×10<sup>−9</sup> m:</p><div class="eq">${tex(String.raw`k = \frac{72 \times ${f(B.eps * 1e19, 3)}\times 10^{-19}}{(${f(B.r0 * 1e9)}\times 10^{-9})^2} = ${f(kB, 0)}\ \text{N/m}`)}</div><div class="eq">${tex(String.raw`T = 2\pi\sqrt{\frac{m}{k}} = 2\pi\sqrt{\frac{${f(B.m * 1e27, 3)}\times 10^{-27}}{${f(kB, 0)}}} = ${f(TB * 1e15, 1)}\ \text{fs}`)}</div>` },
    { q: 'A particle in a potential well has total energy <i>E</i> below the rim. At either turning point,',
      choices: ['its speed is zero and the force on it is zero', 'its speed is greatest and the force is zero', 'its potential energy is zero', 'its speed is zero and the force points back into the well'], answer: 3,
      why: `<p>At a turning point <i>U</i> = <i>E</i>, so <i>K</i> = 0 and the particle stops. But <i>U</i> is sloped there (it is a wall of the well, not the bottom), so ${tex.inline(String.raw`F = -\frac{dU}{dx} \neq 0`)} and points downhill, back toward the minimum. That is why it turns around.</p>` },
  ],
  10: [
    { q: `The block now slides onto the same floor (μ<sub>k</sub> = ${f(Sl.mu)}) at ${f(v10, 1)} m/s instead of ${f(Sl.v0, 1)} m/s. How far does it slide?`,
      choices: [`${f(2 * Sl.d)} m`, `${f(d10)} m`, `${f(Sl.d)} m`, `${f(v10 ** 2 / (Sl.mu * G), 1)} m`], answer: 1,
      why: `<div class="eq">${tex(String.raw`\tfrac12 mv_0^2 = \mu_k mgd \quad\Rightarrow\quad d = \frac{v_0^2}{2\mu_k g} = \frac{${f(v10, 1)}^2}{2 \times ${f(Sl.mu)} \times ${f(G)}} = ${f(d10)}\ \text{m}`)}</div><p>Twice the speed, four times the kinetic energy, four times the distance (it slid ${f(Sl.d)} m before). ${f(2 * Sl.d)} m doubles it as if <i>d</i> ∝ <i>v</i>.</p>` },
    { q: `Back at ${f(Sl.v0, 1)} m/s (${f(Sl.E, 1)} J of kinetic energy): how much thermal energy has friction made after the first ${f(x10, 1)} m of sliding?`,
      choices: [`${f(Sl.E / 2)} J`, `${f(Sl.mu * G * x10)} J`, `${f(Q10)} J`, `${f(Sl.E)} J`], answer: 2,
      why: `<div class="eq">${tex(String.raw`E_\text{th} = fd = \mu_k mg \times d = ${f(Sl.mu)} \times ${f(Sl.m, 1)} \times ${f(G)} \times ${f(x10, 1)} = ${f(Q10)}\ \text{J}`)}</div><p>The block still has ${f(Sl.E - Q10)} J of <i>K</i>. ${f(Sl.mu * G * x10)} J leaves out the mass.</p>` },
  ],
  11: [
    { q: `A ${m11} kg student runs up stairs ${f(h11, 1)} m high in ${f(t11, 1)} s at steady speed. What average power does she deliver to lifting herself?`,
      choices: [`${f(m11 * h11 / t11, 1)} W`, `${f(P11, 0)} W`, `${f(m11 * G * h11, 0)} W`, `${f(m11 * G * h11 * t11, 0)} W`], answer: 1,
      why: `<div class="eq">${tex(String.raw`P = \frac{W}{t} = \frac{mgh}{t} = \frac{${m11} \times ${f(G)} \times ${f(h11, 1)}}{${f(t11, 1)}} = ${f(P11, 0)}\ \text{W}`)}</div><p>${f(m11 * G * h11, 0)} is the work in joules, not a power; ${f(m11 * h11 / t11, 1)} W uses mass instead of weight.</p>` },
    { q: 'A crane lifts a crate a height <i>h</i> at a steady 0.5 m/s, then lifts an identical crate the same height at a steady 1.0 m/s. Compared with the slow lift, the fast lift needs',
      choices: ['twice the work and twice the power', 'the same work and the same power', 'the same work and twice the power', 'half the work and twice the power'], answer: 2,
      why: `<p>At steady speed the cable pulls with <i>mg</i> either way, so the work <i>mgh</i> is the same. The fast lift takes half the time, so ${tex.inline(String.raw`P = \frac{W}{t} = Fv`)} doubles.</p>` },
  ],
};
