// electrostatics/practice.js — AP Physics C style practice, one or two questions per page (keys are page indices, as in PAGES).
// Every number is computed here; a quantitative item keeps its choices' numbers in `nums` (in the units shown),
// and checks.mjs recomputes the keyed one by another route.
import * as M from './model.js';
import { tex } from '../engine/tex.js';

const p = (x, d) => x.toFixed(d);
const g = (x, n = 3) => x.toPrecision(n);
const sci = (x, n = 2) => { const e = Math.floor(Math.log10(Math.abs(x))), m = x / 10 ** e; return `${m.toFixed(n)} × 10<sup>${e < 0 ? '−' + -e : e}</sup>`; };
const sciT = (x, n = 2) => { const e = Math.floor(Math.log10(Math.abs(x))), m = x / 10 ** e; return `${m.toFixed(n)} \\times 10^{${e < 0 ? '−' + -e : e}}`; };   // sci() as LaTeX
const K = M.K, nC = M.nC, uC = M.uC;

// ---- page 0: two metal spheres touched; a rod with λ = cx ----
const P0 = { q1: 6, q2: -2 };                                   // nC
P0.each = (P0.q1 + P0.q2) / 2;
P0.nums = [(Math.abs(P0.q1) + Math.abs(P0.q2)) / 2, P0.each, NaN, 0];   // added sizes · right · no flow · cancelled
const P0b = { c: 40 * nC, L: 0.50 };                           // λ = c x (C/m², m)
P0b.Q = P0b.c * P0b.L ** 2 / 2;
P0b.nums = [P0b.c * P0b.L ** 3 / 3, P0b.c * P0b.L ** 2, P0b.Q, P0b.c * P0b.L].map(q => q / M.QE);   // ∫x² · forgot ½ · right · λ(L)·1 m
// ---- page 1: the grounding current ----
const P1 = { I0: 2.4e-3, tau: 1.5e-6 };
P1.n = P1.I0 * P1.tau / M.QE;
P1.nums = [P1.n * (1 - 1 / Math.E), P1.n / 2, P1.n / Math.E, P1.n];   // stopped at τ · triangle · I(τ)·τ · right
// ---- page 2: the page's pair at 20 cm; work as a like pair flies apart ----
const P2 = { r: 0.20 };
P2.F = M.coulomb(M.PAIR.q1, M.PAIR.q2, P2.r);
P2.nums = [K * M.PAIR.q1 * -M.PAIR.q2 / P2.r, M.coulomb(M.PAIR.q1, M.PAIR.q1, P2.r), P2.F, P2.F / 2];   // 1/r · q1² · right · "smaller charge, smaller force"
const P2b = { q1: M.PAIR.q1, q2: M.PAIR.like, r1: 0.20, r2: 0.40 };
P2b.W = K * P2b.q1 * P2b.q2 * (1 / P2b.r1 - 1 / P2b.r2);
{ const F = r => M.coulomb(P2b.q1, P2b.q2, r), dr = P2b.r2 - P2b.r1;
  P2b.nums = [F(P2b.r1) * dr, F(P2b.r2) * dr, (F(P2b.r1) + F(P2b.r2)) / 2 * dr, P2b.W]; }   // start force · end force · mean force · right
// ---- page 3: the page's balance point and its stiffness ----
const { qA, qB, D, q0 } = M.LINE;
const P3 = { x: M.LINE.xEq };
P3.nums = [D * Math.sqrt(qB) / (Math.sqrt(qA) + Math.sqrt(qB)), D * qA / (qA + qB), D / 2, P3.x].map(x => x * 100);   // nearer A · no root · midpoint · right
P3.k = 2 * K * q0 * (qA / P3.x ** 3 + qB / (D - P3.x) ** 3);
P3.nums2 = [P3.k, P3.k / 2, 2 * K * q0 * Math.abs(qA / P3.x ** 3 - qB / (D - P3.x) ** 3), K * q0 * (qA / P3.x ** 2 + qB / (D - P3.x) ** 2)];   // right · lost the 2 · subtracted · not differentiated
// ---- page 4: a −1 nC charge; a test charge moving out ----
const P4 = { Q: M.POINT.Q, r: 0.20 };
P4.E = M.pointMag(P4.Q, P4.r);
P4.nums = [P4.E, NaN, K * P4.Q / P4.r, K * P4.Q / (P4.r * 100) ** 2];
const P4b = { r: 0.20, v: 0.050 };
P4b.rate = 2 * K * M.POINT.Q * P4b.v / P4b.r ** 3;
P4b.nums = [P4b.rate / 2, P4b.rate, 2 * K * M.POINT.Q * P4b.v / P4b.r ** 2, 2 * K * M.POINT.Q * P4b.v / P4b.r ** 4];   // lost the 2 · right · one r short · one r too many
// ---- page 5: the page's dipole on its bisector ----
const P5 = { y: 0.10 }, dq = M.DIPOLE.q, da = M.DIPOLE.a;
P5.E = M.dipoleBisector(P5.y);
P5.nums = [2 * K * dq * da / P5.y ** 3, P5.E, 2 * K * dq / (da * da + P5.y * P5.y), P5.E / 2];   // far-field · right · no cos θ · one charge only
// ---- page 6: the page's rod, on its axis ----
const P6 = { a: 0.10 };
P6.E = M.rodAxis(P6.a);
P6.nums = [K * M.RODE.Q / P6.a ** 2, K * M.RODE.Q / (P6.a + M.RODE.L / 2) ** 2, P6.E, K * M.RODE.lambda / P6.a];   // all at the end · all at the middle · right · kλ/a
// ---- page 7: the page's ring at z = 15 cm; where it peaks ----
const P7 = { z: 0.15 }, RR = M.RING.R, RQ = M.RING.Q;
P7.E = M.ringAxis(P7.z);
P7.nums = [K * RQ / (P7.z ** 2 + RR ** 2), P7.E, K * RQ / P7.z ** 2, K * RQ * RR / (P7.z ** 2 + RR ** 2) ** 1.5];   // no cos φ · right · point charge · sin φ
P7.nums2 = [RR, RR / 2, RR * Math.SQRT2, RR / Math.SQRT2].map(x => x * 100);
// ---- page 8: the page's electron; a field that grows along the plates ----
const PL = M.PLATES;
const P8 = { nums: [2 * PL.yExit, 4 * PL.yExit, PL.yProton, PL.yExit].map(y => y * 1000) };     // forgot ½ · t = 2L/v₀ · proton · right
const P8b = { vy: PL.vyExit / 2 };
P8b.nums = [PL.vyExit, P8b.vy, PL.vyExit / 3, PL.vyExit / 4].map(v => v / 1e6);

const mm = x => x < 0.01 ? p(x, 5) : g(x);

export const PRACTICE = {
  0: [
    { q: `Two identical metal spheres carry +${P0.q1} nC and −${-P0.q2} nC. They are touched together, then pulled apart. Each now carries`,
      choices: [`+${p(P0.nums[0], 0)} nC`, `+${p(P0.each, 0)} nC`, `+${P0.q1 / 2} nC and −${-P0.q2 / 2} nC`, '0'], answer: 1, nums: P0.nums,
      why: `<p>Charge is conserved: the total, ${P0.q1} + (−${-P0.q2}) = +${P0.q1 + P0.q2} nC, is shared equally by identical spheres.</p><div class="eq">${tex(String.raw`q = \frac{${P0.q1} - ${-P0.q2}}{2} = +${p(P0.each, 0)}\ \text{nC each}`)}</div><p>Adding the sizes (+${p(P0.nums[0], 0)} nC) ignores the signs; electrons from the negative sphere cancel part of the positive one’s charge.</p>` },
    { q: `A thin plastic rod lies along the <i>x</i> axis from 0 to ${p(P0b.L, 2)} m with charge per length λ = <i>cx</i>, <i>c</i> = +${p(P0b.c / nC, 0)} nC/m². How many electrons has it lost?`,
      choices: P0b.nums.map(n => sci(n)), answer: 2, nums: P0b.nums,
      why: `<p>λ changes along the rod, so add slices d<i>q</i> = λ d<i>x</i>:</p><div class="eq">${tex(String.raw`Q = \int_0^L cx\,dx = \frac{cL^2}{2} = \frac{${p(P0b.c / nC, 0)} \times ${p(P0b.L, 2)}^2}{2} = ${p(P0b.Q / nC, 2)}\ \text{nC}`)}</div><div class="eq">${tex(String.raw`n = \frac{Q}{e} = \frac{${p(P0b.Q / nC, 2)} \times 10^{-9}}{${sciT(M.QE)}} = ${sciT(P0b.nums[2])}`)}</div><p>Leaving out the ½ (λ at the far end times the length) gives twice too many.</p>` },
  ],
  1: [
    { q: 'The page’s neutral metal sphere: the negative rod is brought near, the sphere is grounded, the ground wire is cut, and then the rod is taken away. The sphere ends up',
      choices: ['neutral', 'negative, spread evenly over its surface', 'positive, spread evenly over its surface', 'positive, crowded on the side where the rod was'], answer: 2,
      why: `<p>The rod pushes the sphere’s free electrons to the far side, and grounding lets some of them leave. Cutting the ground first traps the deficit: the sphere is positive (+${p(M.QG / nC, 2)} nC here), opposite to the rod. Once the rod is gone nothing holds the charge to one side, so it spreads evenly over the surface.</p>` },
    { q: `In another induction set-up, while a sphere is grounded the current in the ground wire is <i>I</i>(<i>t</i>) = <i>I</i><sub>0</sub><i>e</i><sup>−<i>t</i>/τ</sup>, with <i>I</i><sub>0</sub> = ${p(P1.I0 * 1e3, 1)} mA and τ = ${p(P1.tau * 1e6, 1)} μs. How many electrons leave in all?`,
      choices: P1.nums.map(n => sci(n)), answer: 3, nums: P1.nums,
      why: `<p>Charge is the integral of current:</p><div class="eq">${tex(String.raw`Q = \int_0^\infty I_0 e^{-t/\tau}\,dt = I_0\tau = ${p(P1.I0 * P1.tau / nC, 2)}\ \text{nC}, \quad n = \frac{Q}{e} = ${sciT(P1.n)}`)}</div><p>Stopping at <i>t</i> = τ counts only 63% of them, ${sci(P1.nums[0])}.</p>` },
  ],
  2: [
    { q: `The page’s +${M.PAIR.q1 / uC} μC and −${-M.PAIR.q2 / uC} μC charges are ${p(P2.r * 100, 0)} cm apart. The size of the force on the −${-M.PAIR.q2 / uC} μC charge is`,
      choices: P2.nums.map(x => `${g(x)} N`), answer: 2, nums: P2.nums,
      why: `<div class="eq">${tex(String.raw`F = \frac{k|q_1 q_2|}{r^2} = \frac{${sciT(K)} \times (${M.PAIR.q1 / uC} \times 10^{-6})(${-M.PAIR.q2 / uC} \times 10^{-6})}{(${p(P2.r, 2)})^2} = ${g(P2.F)}\ \text{N}`)}</div><p>Both charges feel the same ${g(P2.F)} N, a third-law pair; the smaller charge does not feel half as much (${g(P2.nums[3])} N).</p>` },
    { q: `The page’s like pair, +${P2b.q1 / uC} μC and +${P2b.q2 / uC} μC, is held ${p(P2b.r1 * 100, 0)} cm apart. The +${P2b.q2 / uC} μC charge is released (the other stays fixed). How much work does the electric force do on it by the time they are ${p(P2b.r2 * 100, 0)} cm apart?`,
      choices: P2b.nums.map(x => `${g(x)} J`), answer: 3, nums: P2b.nums,
      why: `<p>The force changes as it moves, so integrate:</p><div class="eq">${tex(String.raw`W = \int_{r_1}^{r_2} \frac{kq_1 q_2}{r^2}\,dr = kq_1 q_2\left(\frac{1}{r_1} - \frac{1}{r_2}\right) = ${g(K * P2b.q1 * P2b.q2)} \times (${p(1 / P2b.r1, 1)} - ${p(1 / P2b.r2, 1)}) = ${g(P2b.W)}\ \text{J}`)}</div><p>Force × distance with the starting force (${g(P2b.nums[0])} J) is too big: the push weakens as ${tex.inline(String.raw`1/r^2`)}. Averaging the end forces (${g(P2b.nums[2])} J) is also wrong, since <i>F</i> is not linear in <i>r</i>.</p>` },
  ],
  3: [
    { q: `On the page, A (+${qA / uC} μC) and B (+${qB / uC} μC) are ${p(D * 100, 0)} cm apart. How far from A is the net force on a test charge between them zero?`,
      choices: P3.nums.map(x => `${p(x, 1)} cm`), answer: 3, nums: P3.nums,
      why: `<div class="eq">${tex(String.raw`\frac{kq_A}{x^2} = \frac{kq_B}{(d - x)^2} \quad\Rightarrow\quad \frac{d - x}{x} = \sqrt{\frac{q_B}{q_A}} = ${p(Math.sqrt(qB / qA), 2)} \quad\Rightarrow\quad x = ${p(P3.x * 100, 1)}\ \text{cm}`)}</div><p>It sits nearer the <b>smaller</b> charge, B. Splitting <i>d</i> in the ratio of the charges (${p(P3.nums[1], 1)} cm) forgets that force goes as ${tex.inline(String.raw`1/r^2`)}, so the distances go as the square roots.</p>` },
    { q: `The +${p(q0 / uC, 1)} μC test charge is nudged a small distance <i>s</i> along the line from that balance point. The net force is then <i>F</i> ≈ −κ<i>s</i>. κ is`,
      choices: P3.nums2.map(x => `${g(x)} N/m`), answer: 0, nums: P3.nums2,
      why: `<p>${tex.inline(String.raw`\kappa = -dF/dx`)} at <i>x</i><sub>eq</sub>, with ${tex.inline(String.raw`F(x) = \frac{kq_0 q_A}{x^2} - \frac{kq_0 q_B}{(d - x)^2}`)}:</p><div class="eq">${tex(String.raw`\kappa = 2kq_0\left[\frac{q_A}{x^3} + \frac{q_B}{(d - x)^3}\right] = ${g(P3.k)}\ \text{N/m}`)}</div><p>Both terms add: moving toward B, A’s push weakens <i>and</i> B’s push grows, both sending the charge back. Subtracting them gives ${g(P3.nums2[2])} N/m.</p>` },
  ],
  4: [
    { q: `A −${M.POINT.Q / nC}.0 nC point charge sits at the origin. The electric field ${p(P4.r * 100, 0)} cm east of it is`,
      choices: [`${p(P4.E, 0)} N/C, west`, `${p(P4.E, 0)} N/C, east`, `${p(P4.nums[2], 1)} N/C, west`, `${p(P4.nums[3], 4)} N/C, west`], answer: 0, nums: P4.nums,
      why: `<div class="eq">${tex(String.raw`E = \frac{k|Q|}{r^2} = \frac{${sciT(K)} \times 1.0 \times 10^{-9}}{(${p(P4.r, 2)})^2} = ${p(P4.E, 0)}\ \text{N/C}`)}</div><p>The field of a negative charge points <b>toward</b> it: a positive test charge east of it is pulled west. Using <i>r</i> in cm gives ${p(P4.nums[3], 4)} N/C; ${tex.inline(String.raw`kQ/r`)} is a potential, not a field.</p>` },
    { q: `A test charge moves straight away from the page’s +${M.POINT.Q / nC} nC charge at ${p(P4b.v * 100, 1)} cm/s. When it is ${p(P4b.r * 100, 0)} cm away, how fast is the field at its position decreasing?`,
      choices: P4b.nums.map(x => `${g(x)} N/C per s`), answer: 1, nums: P4b.nums,
      why: `<p>Chain rule: ${tex.inline(String.raw`E(r) = kQ/r^2`)}, and <i>r</i> grows at <i>v</i>:</p><div class="eq">${tex(String.raw`\frac{dE}{dt} = \frac{dE}{dr}\frac{dr}{dt} = -\frac{2kQ}{r^3}v = -\frac{2 \times ${p(K * M.POINT.Q, 2)} \times ${p(P4b.v, 3)}}{${p(P4b.r, 2)}^3} = -${g(P4b.rate)}\ \text{N/C per s}`)}</div><p>Dropping the 2 from the power rule gives ${g(P4b.nums[0])}.</p>` },
  ],
  5: [
    { q: `For the page’s dipole (±${dq / nC} nC, ${p(2 * da * 100, 0)} cm apart), the field on the perpendicular bisector ${p(P5.y * 100, 0)} cm from the centre has magnitude`,
      choices: P5.nums.map(x => `${p(x, 0)} N/C`), answer: 1, nums: P5.nums,
      why: `<p>Each charge is ${tex.inline(String.raw`\sqrt{a^2 + y^2}`)} = ${p(Math.hypot(da, P5.y) * 100, 1)} cm away and gives ${tex.inline(String.raw`kq/(a^2 + y^2)`)} = ${p(K * dq / (da * da + P5.y * P5.y), 0)} N/C. The <i>y</i> parts cancel; the <i>x</i> parts, each × ${tex.inline(String.raw`\cos\theta = a/\sqrt{a^2 + y^2}`)}, add:</p><div class="eq">${tex(String.raw`E = \frac{2kqa}{(a^2 + y^2)^{3/2}} = ${p(P5.E, 0)}\ \text{N/C, parallel to the axis, from + toward −}`)}</div><p>The far-field ${tex.inline(String.raw`2kqa/y^3`)} (${p(P5.nums[0], 0)} N/C) is only good for <i>y</i> ≫ <i>a</i>; here <i>y</i> = <i>a</i>.</p>` },
    { q: 'A dipole has +<i>q</i> at <i>x</i> = +<i>a</i> and −<i>q</i> at <i>x</i> = −<i>a</i>. Find the field on the axis at <i>x</i> ≫ <i>a</i>, and show it falls as 1/<i>x</i>³.',
      solution: `<p>Both fields lie along the axis; the nearer +<i>q</i> wins:</p><div class="eq">${tex(String.raw`E = \frac{kq}{(x - a)^2} - \frac{kq}{(x + a)^2} = kq \cdot \frac{4ax}{(x^2 - a^2)^2}`)}</div><p>For <i>x</i> ≫ <i>a</i>, (<i>x</i>² − <i>a</i>²)² → <i>x</i>⁴, so ${tex.inline(String.raw`E \to 4kqa/x^3 = 2kp/x^3`)} with <i>p</i> = 2<i>qa</i>, pointing +<i>x</i>. Another way: ${tex.inline(String.raw`f(x) = kq/x^2`)} changes by about <i>f</i>′(<i>x</i>) · (−2<i>a</i>) between the two charges, so ${tex.inline(String.raw`E \approx -2a \cdot (-2kq/x^3) = 4kqa/x^3`)}. The two fields nearly cancel, leaving a difference that falls one power faster than either.</p>` },
  ],
  6: [
    { q: `The page’s rod (+${M.RODE.Q / nC} nC over ${p(M.RODE.L * 100, 0)} cm). The field on its axis ${p(P6.a * 100, 0)} cm past one end is`,
      choices: P6.nums.map(x => `${p(x, 0)} N/C`), answer: 2, nums: P6.nums,
      why: `<div class="eq">${tex(String.raw`E = \int_a^{a+L} \frac{k\lambda\,dx}{x^2} = \frac{kQ}{a(a + L)} = \frac{${p(K * M.RODE.Q, 2)}}{${p(P6.a, 2)} \times ${p(P6.a + M.RODE.L, 2)}} = ${p(P6.E, 0)}\ \text{N/C}`)}</div><p>Treating all the charge as if at the near end (${p(P6.nums[0], 0)} N/C) or at the middle (${p(P6.nums[1], 0)} N/C) fails: the slices are at different distances and the ${tex.inline(String.raw`1/x^2`)} weighting is not linear.</p>` },
    { q: 'The rod (λ, length <i>L</i>) lies on the <i>x</i> axis from −<i>L</i>/2 to <i>L</i>/2. Which integral gives the field at a point a distance <i>a</i> above its middle?',
      choices: [tex.inline(String.raw`\int k\lambda\,dx/(x^2 + a^2)`), tex.inline(String.raw`\int k\lambda x\,dx/(x^2 + a^2)^{3/2}`), tex.inline(String.raw`\int k\lambda\,dx/(x^2 + a^2)^{1/2}`), tex.inline(String.raw`\int k\lambda a\,dx/(x^2 + a^2)^{3/2}`)], answer: 3,
      why: `<p>Each slice gives ${tex.inline(String.raw`dE = k\lambda\,dx/(x^2 + a^2)`)}. The sideways parts cancel in pairs, so keep only the part along <i>a</i>, × ${tex.inline(String.raw`\cos\theta = a/\sqrt{x^2 + a^2}`)}:</p><div class="eq">${tex(String.raw`E = \int_{-L/2}^{L/2} \frac{k\lambda a\,dx}{(x^2 + a^2)^{3/2}} = \frac{kQ}{a\sqrt{L^2/4 + a^2}}`)}</div><p>The first adds magnitudes without cancelling; the <i>x</i> d<i>x</i> integral is the sideways part, which is zero; the 1/2 power is the potential.</p>` },
  ],
  7: [
    { q: `The page’s ring (+${p(RQ / nC, 0)} nC, <i>R</i> = ${p(RR * 100, 0)} cm). The field on its axis ${p(P7.z * 100, 0)} cm from the centre is`,
      choices: P7.nums.map(x => `${p(x, 0)} N/C`), answer: 1, nums: P7.nums,
      why: `<p>Every piece is ${tex.inline(String.raw`\sqrt{z^2 + R^2}`)} = ${p(Math.hypot(P7.z, RR) * 100, 0)} cm away; only the axial part, ${tex.inline(String.raw`\cos\varphi = z/\sqrt{z^2 + R^2}`)} = ${p(P7.z / Math.hypot(P7.z, RR), 2)}, survives:</p><div class="eq">${tex(String.raw`E = \frac{kQz}{(z^2 + R^2)^{3/2}} = ${p(P7.E, 0)}\ \text{N/C}`)}</div><p>Without the cos φ it is ${p(P7.nums[0], 0)} N/C; the ring is not a point charge at this distance (${p(P7.nums[2], 0)} N/C).</p>` },
    { q: `How far from the centre of that ring is the field on its axis strongest?`,
      choices: P7.nums2.map(x => `${p(x, 1)} cm`), answer: 3, nums: P7.nums2,
      why: `<p>Set ${tex.inline(String.raw`dE/dz = 0`)} for ${tex.inline(String.raw`E = kQz(z^2 + R^2)^{-3/2}`)}:</p><div class="eq">${tex(String.raw`\frac{kQ[(z^2 + R^2) - 3z^2]}{(z^2 + R^2)^{5/2}} = 0 \quad\Rightarrow\quad z = \frac{R}{\sqrt{2}} = ${p(P7.nums2[3], 1)}\ \text{cm}`)}</div><p><i>E</i> is zero at the centre and falls as ${tex.inline(String.raw`1/z^2`)} far away, so the peak lies between them.</p>` },
  ],
  8: [
    { q: `The page’s electron enters the ${M.PLATES.E} N/C field at ${p(PL.v0 / 1e7, 1)} × 10<sup>7</sup> m/s, moving parallel to the ${p(PL.L * 100, 0)} cm plates. How far sideways has it moved when it leaves them?`,
      choices: P8.nums.map(x => `${mm(x)} mm`), answer: 3, nums: P8.nums,
      why: `<p>Constant force across, none along: a projectile.</p><div class="eq">${tex(String.raw`a = \frac{eE}{m_e} = ${sciT(PL.a)}\ \text{m/s}^2, \quad t = \frac{L}{v_0} = ${p(PL.tCross * 1e9, 1)}\ \text{ns}, \quad y = \tfrac12 at^2 = ${mm(P8.nums[3])}\ \text{mm}`)}</div><p>Forgetting the ½ doubles it. A proton’s mass gives ${mm(P8.nums[2])} mm, ${p(M.MP / M.ME, 0)}× less.</p>` },
    { q: `Suppose instead the field between the plates grew along them, <i>E</i> = <i>E</i><sub>0</sub><i>x</i>/<i>L</i> (<i>E</i><sub>0</sub> = ${M.PLATES.E} N/C at the far end). The electron’s sideways speed as it leaves is`,
      choices: P8b.nums.map(x => `${p(x, 2)} × 10<sup>6</sup> m/s`), answer: 1, nums: P8b.nums,
      why: `<p><i>x</i> = <i>v</i><sub>0</sub><i>t</i>, so the sideways acceleration grows with time, ${tex.inline(String.raw`a(t) = (eE_0/m)(v_0 t/L)`)}:</p><div class="eq">${tex(String.raw`v_y = \int_0^{L/v_0} \frac{eE_0 v_0}{mL}\,t\,dt = \frac12\,\frac{eE_0}{m}\,\frac{L}{v_0} = ${p(P8b.vy / 1e6, 2)} \times 10^{6}\ \text{m/s}`)}</div>
<p>Half the uniform-field value (${p(PL.vyExit / 1e6, 2)} × 10<sup>6</sup> m/s): on average the field is half as strong.</p>` },
  ],
};
