// potential/practice.js — AP Physics C style practice, one or two questions per page (keys are page indices, as in PAGES).
// Every number is computed here; a quantitative item keeps its choices' numbers in `nums` (in the units shown),
// and checks.mjs recomputes the keyed one by another route.
import * as M from './model.js';
import { tex } from '../engine/tex.js';
const sci = x => x.toExponential(2).replace(/e-(\d+)/, ' \\times 10^{-$1}');   // 1.60e-19 in LaTeX: 1.60 \times 10^{-19}

const p = (x, d) => x.toFixed(d);
const g = (x, n = 3) => x.toPrecision(n);
const s = x => (x < 0 ? '−' : x > 0 ? '+' : '') + Math.abs(x);   // signed, with a real minus
const K = M.K, nC = M.nC;

// ---- page 0: the page's pair brought from 40 cm to 10 cm ----
const { q1, q2, r0, r1 } = M.PAIR;
const P0 = { W: K * q1 * q2 * (1 / r1 - 1 / r0) };
P0.nums = [K * q1 * q2 / r1, P0.W, K * q1 * q2 / r1 ** 2 * (r0 - r1), K * q1 * q2 / (r0 - r1)].map(x => x * 1e6);   // from ∞ · right · F(r₁)Δr · 1/Δr
// ---- page 1: the page's square; charging a sphere ----
const P1 = { U: M.SQ.U, a: M.SQ.a, q: M.SQ.q };
P1.nums = [4 * K * P1.q ** 2 / P1.a, 2 * P1.U, P1.U, (4 + 2 * Math.SQRT2) * K * P1.q ** 2 / P1.a].map(x => x * 1e6);   // sides only · every pair twice · right · diagonal a/√2
const P1b = { Q: 2 * nC, R: 0.15 };
P1b.U = K * P1b.Q ** 2 / (2 * P1b.R);
P1b.nums = [2 * P1b.U, P1b.U / 2, P1b.U, P1b.U / P1b.R].map(x => x * 1e6);   // Q × final V · ¼ · right · extra 1/R
// ---- page 2: the page's A → C; E = 3x² ----
const P2 = { W: -M.UNI.q * (M.Vuni(M.UNI.C) - M.Vuni(M.UNI.A)) };
P2.L = Math.hypot(M.UNI.C[0] - M.UNI.A[0], M.UNI.C[2] - M.UNI.A[2]);
P2.nums = [-P2.W, 0, M.UNI.q * M.UNI.E * P2.L, P2.W].map(x => x * 1e9);   // sign · "path ⟂ somewhere" · full length · right
const P2b = { c: 3, x: 2 };
P2b.dV = -P2b.c * P2b.x ** 3 / 3;
P2b.nums = [-P2b.dV, -P2b.c * P2b.x ** 2 * P2b.x, P2b.dV, -P2b.c * P2b.x ** 2 * P2b.x / 2];   // sign · E(x)·x · right · mean of end fields
// ---- page 3: the page's hill where V = 90 V; V = 3x²y − y³ ----
const P3 = { V: 90 };
P3.r = K * M.HILL.Q / P3.V;
P3.E = P3.V / P3.r;
P3.nums = [P3.V, P3.E, P3.E / 2, 2 * P3.E];
const P3b = { x: 1, y: 2 };
P3b.Ex = -6 * P3b.x * P3b.y; P3b.Ey = -(3 * P3b.x ** 2 - 3 * P3b.y ** 2);
P3b.E = Math.hypot(P3b.Ex, P3b.Ey);
P3b.nums = [Math.abs(P3b.Ex) + Math.abs(P3b.Ey), Math.abs(P3b.Ex), P3b.E, Math.abs(P3b.Ey)];
// ---- page 4: the page's dipole at P ----
const P4 = { V: M.VdipAxis(M.DIP.axisX) };
P4.nums = [-P4.V, 0, P4.V, -2 * M.DIP.a * K * M.DIP.q / M.DIP.axisX ** 2];   // sign · bisector habit · right · far-field
// ---- page 5: the page's rod at a = 10 cm ----
const { L: rL, Q: rQ, lam: rlam } = M.ROD;
const P5 = { a: 0.10 };
P5.V = M.VrodAxis(P5.a);
P5.nums = [K * rQ / P5.a, K * rQ / (P5.a + rL / 2), K * rlam * Math.log10((P5.a + rL) / P5.a), P5.V];   // all at the end · all at the middle · log₁₀ · right
P5.E = K * rQ / (P5.a * (P5.a + rL));
P5.nums2 = [P5.E, P5.V / P5.a, K * rQ / P5.a ** 2, K * rlam / P5.a];   // right · V/a · point at the end · kλ/a
// ---- page 6: the page's ring at z = 20 cm; the half-ring's field at its centre ----
const P6 = { z: 0.20 };
P6.V = M.Vring(P6.z);
P6.nums = [K * M.RING.Q / P6.z, P6.V, K * M.RING.Q * P6.z / (M.RING.R ** 2 + P6.z ** 2) ** 1.5, K * M.RING.Q / M.RING.R];   // point · right · that's E · centre
const P6b = { E: 2 * K * M.ARC.Q / (Math.PI * M.ARC.R ** 2) };
P6b.nums = [K * M.ARC.Q / M.ARC.R ** 2, P6b.E / 2, P6b.E, 0];   // as a point · lost 2 · right · ring symmetry
// ---- page 7: the page's insulating sphere at R/2; two connected spheres ----
const P7 = { r: M.SPH.R / 2 };
P7.V = M.Vins(P7.r);
P7.nums = [K * M.SPH.Q / P7.r, P7.V, M.Vcond(P7.r), M.Vins(0)];   // point · right · conductor · centre
const P7b = { nums: [1 / 3, 3, 1, 1 / 9] };
// ---- page 8: the page's proton; an electron falling toward +1 nC ----
const P8 = { v: M.ACC.vp };
P8.nums = [Math.sqrt(M.E_CH * M.ACC.dV / M.M_P), M.speed(M.E_CH, M.ACC.Vhi, M.M_P), P8.v, M.speed(M.E_CH, M.ACC.dV, M.M_E)].map(v => v / 1e3);   // lost 2 · used 7 V · right · electron
const P8b = { Q: 1 * nC, ra: 0.10, rb: 0.05 };
P8b.dV = K * P8b.Q * (1 / P8b.rb - 1 / P8b.ra);
P8b.v = M.speed(M.E_CH, P8b.dV, M.M_E);
P8b.nums = [M.speed(M.E_CH, K * P8b.Q / P8b.rb, M.M_E), P8b.v, P8b.v / Math.SQRT2, M.speed(M.E_CH, P8b.dV, M.M_P)].map(v => v / 1e6);   // V at the end only · right · lost 2 · proton mass

const frac = x => ({ [1 / 3]: '1/3', 3: '3', 1: '1', [1 / 9]: '1/9' })[x];

export const PRACTICE = {
  0: [
    { q: `How much work must you do to bring the page’s +${q2 / nC} nC charge from ${p(r0 * 100, 0)} cm to ${p(r1 * 100, 0)} cm from the fixed +${q1 / nC} nC charge (starting and ending at rest)?`,
      choices: P0.nums.map(x => `${p(x, 3)} μJ`), answer: 1, nums: P0.nums,
      why: `<p>You push against ${tex.inline(String.raw`F = kq_1q_2/r^2`)}, which grows as you go, so integrate:</p><div class="eq">${tex(String.raw`W = -\int_{r_0}^{r_1} \frac{kq_1q_2}{r^2}\,dr = kq_1q_2\left(\frac{1}{r_1} - \frac{1}{r_0}\right) = \Delta U = ${p(P0.W * 1e6, 3)}\ \mu\text{J}`)}</div><p>${tex.inline(String.raw`kq_1q_2/r_1`)} (${p(P0.nums[0], 3)} μJ) is the work from infinity, not from ${p(r0 * 100, 0)} cm.</p>` },
    { q: `Two particles interact with potential energy ${tex.inline(String.raw`U(r) = A/r^2 - B/r`)} (<i>A</i>, <i>B</i> &gt; 0). At what separation is the force between them zero?`,
      choices: [tex.inline(String.raw`A/B`), tex.inline(String.raw`\sqrt{A/B}`), tex.inline(String.raw`B/2A`), tex.inline(String.raw`2A/B`)], answer: 3,
      why: `<p><i>F</i> = ${tex.inline(String.raw`-dU/dr`)}, so set the slope to zero:</p><div class="eq">${tex(String.raw`\frac{dU}{dr} = -\frac{2A}{r^3} + \frac{B}{r^2} = 0 \quad\Rightarrow\quad r = \frac{2A}{B}`)}</div><p>${tex.inline(String.raw`A/B`)} is where <i>U</i> = 0, not where its slope is. At ${tex.inline(String.raw`2A/B`)} <i>U</i> has its minimum, so the separation is stable.</p>` },
  ],
  1: [
    { q: `The page’s four +${P1.q / nC} nC charges sit on the corners of a square of side ${p(P1.a * 100, 0)} cm. The electric potential energy of the group is`,
      choices: P1.nums.map(x => `${p(x, 3)} μJ`), answer: 2, nums: P1.nums,
      why: `<p>Six pairs: four sides at <i>a</i>, two diagonals at ${tex.inline(String.raw`\sqrt{2}\,a`)}.</p><div class="eq">${tex(String.raw`U = \frac{4kq^2}{a} + \frac{2kq^2}{\sqrt2\,a} = (4 + \sqrt2)\frac{kq^2}{a} = ${p(P1.U * 1e6, 3)}\ \mu\text{J}`)}</div><p>Summing <i>qV</i> over each charge counts every pair twice (${p(P1.nums[1], 3)} μJ); the diagonal is ${tex.inline(String.raw`\sqrt{2}\,a`)}, not ${tex.inline(String.raw`a/\sqrt{2}`)}.</p>` },
    { q: `A metal sphere of radius ${p(P1b.R * 100, 0)} cm is charged to ${p(P1b.Q / nC, 1)} nC by bringing tiny charges d<i>q</i> in from infinity. The total work needed is`,
      choices: P1b.nums.map(x => `${p(x, 3)} μJ`), answer: 2, nums: P1b.nums,
      why: `<p>When the sphere holds <i>q</i> its potential is ${tex.inline(String.raw`kq/R`)}, and bringing d<i>q</i> costs ${tex.inline(String.raw`(kq/R) \,dq`)}:</p><div class="eq">${tex(String.raw`W = \int_0^Q \frac{kq}{R}\,dq = \frac{kQ^2}{2R} = ${p(P1b.U * 1e6, 3)}\ \mu\text{J}`)}</div><p><i>Q</i> × the final potential (${p(P1b.nums[0], 3)} μJ) charges every d<i>q</i> the full price; early ones met almost no repulsion.</p>` },
  ],
  2: [
    { q: `On the page, a +${M.UNI.q / nC} nC charge moves from A to C in the uniform ${M.UNI.E} N/C field, where <i>V</i><sub>C</sub> − <i>V</i><sub>A</sub> = −10 V. The work done on it by the field is`,
      choices: P2.nums.map(x => `${s(+p(x, 1))} nJ`), answer: 3, nums: P2.nums,
      why: `<div class="eq">${tex(String.raw`W_\text{field} = -\Delta U = -q\,\Delta V = -(${M.UNI.q / nC}\ \text{nC})(-10\ \text{V}) = +${p(P2.W * 1e9, 1)}\ \text{nJ}`)}</div><p>Path doesn’t matter: only the ${p(M.UNI.C[0] * 100, 0)} cm along <b>E</b> counts, not the ${p(P2.L * 100, 1)} cm straight path (${p(P2.nums[2], 1)} nJ). A + charge moving with <b>E</b> loses <i>U</i>, so the field does positive work.</p>` },
    { q: `A field points along +<i>x</i> with <i>E</i> = ${P2b.c}<i>x</i>² (N/C, <i>x</i> in m). <i>V</i>(${P2b.x} m) − <i>V</i>(0) is`,
      choices: P2b.nums.map(x => `${s(x)} V`), answer: 2, nums: P2b.nums,
      why: `<div class="eq">${tex(String.raw`\Delta V = -\int_0^{${P2b.x}} ${P2b.c}x^2\,dx = -x^3\Big|_0^{${P2b.x}} = ${s(P2b.dV)}\ \text{V}`)}</div><p>Moving with <b>E</b>, <i>V</i> falls, so the answer is negative. <i>E</i>(${P2b.x}) × ${P2b.x} m = ${-P2b.nums[1]} V treats the largest field as if it held all the way.</p>` },
  ],
  3: [
    { q: `On the page’s hill (+${M.HILL.Q / nC} nC), at the point where <i>V</i> = ${P3.V} V, the field has magnitude`,
      choices: P3.nums.map(x => `${p(x, 0)} N/C`), answer: 1, nums: P3.nums,
      why: `<p>First the distance: ${tex.inline(String.raw`r = kQ/V`)} = ${p(K * M.HILL.Q, 2)}/${P3.V} = ${p(P3.r * 100, 2)} cm. Then the slope:</p><div class="eq">${tex(String.raw`E = -\frac{dV}{dr} = \frac{kQ}{r^2} = \frac{V}{r} = ${p(P3.E, 0)}\ \text{N/C}`)}</div><p><i>V</i> and <i>E</i> have different units and sizes: ${P3.V} V is the height of the hill, ${p(P3.E, 0)} N/C its steepness.</p>` },
    { q: 'In a region <i>V</i>(<i>x</i>, <i>y</i>) = 3<i>x</i>²<i>y</i> − <i>y</i>³ (volts, metres). The magnitude of <b>E</b> at (1 m, 2 m) is',
      choices: P3b.nums.map(x => `${p(x, 1)} N/C`), answer: 2, nums: P3b.nums,
      why: `<p><b>E</b> = −∇<i>V</i>, component by component:</p><div class="eq">${tex(String.raw`E_x = -\frac{\partial V}{\partial x} = -6xy = ${s(P3b.Ex)}\ \text{N/C}, \quad E_y = -(3x^2 - 3y^2) = ${s(P3b.Ey)}\ \text{N/C}`)}</div><div class="eq">${tex(String.raw`|\vec{E}| = \sqrt{${P3b.Ex ** 2} + ${P3b.Ey ** 2}} = ${p(P3b.E, 1)}\ \text{N/C}`)}</div><p>Components add as vectors, not as numbers (${p(P3b.nums[0], 1)}).</p>` },
  ],
  4: [
    { q: `For the page’s dipole (+${M.DIP.q / nC} nC at <i>x</i> = −${p(M.DIP.a * 100, 0)} cm, −${M.DIP.q / nC} nC at +${p(M.DIP.a * 100, 0)} cm), the potential at P, <i>x</i> = ${p(M.DIP.axisX * 100, 0)} cm on the axis, is`,
      choices: P4.nums.map(x => `${x === 0 ? '0' : s(+p(x, 1))} V`), answer: 2, nums: P4.nums,
      why: `<p>Add the two ${tex.inline(String.raw`kq/r`)} with their signs:</p><div class="eq">${tex(String.raw`V = \frac{kq}{${p((M.DIP.axisX + M.DIP.a), 2)}} - \frac{kq}{${p((M.DIP.axisX - M.DIP.a), 2)}} = ${p(K * M.DIP.q / (M.DIP.axisX + M.DIP.a), 1)} - ${p(K * M.DIP.q / (M.DIP.axisX - M.DIP.a), 1)} = ${s(+p(P4.V, 1))}\ \text{V}`)}</div><p>P is nearer the − charge, so <i>V</i> &lt; 0. <i>V</i> = 0 holds on the bisector, not here; the far-field ${tex.inline(String.raw`-2akq/x^2`)} (${p(P4.nums[3], 1)} V) needs <i>x</i> ≫ <i>a</i>.</p>` },
    { q: `Far out on that dipole’s axis, on the side of the −<i>q</i> charge, <i>V</i> ≈ ${tex.inline(String.raw`-2akq/x^2`)}. The field there is`,
      choices: [`${tex.inline(String.raw`4akq/x^3`)}, pointing away from the dipole`, `${tex.inline(String.raw`2akq/x^3`)}, pointing toward the dipole`, `${tex.inline(String.raw`4akq/x^3`)}, pointing toward the dipole`, `${tex.inline(String.raw`2akq/x^2`)}, pointing away from the dipole`], answer: 2,
      why: `<div class="eq">${tex(String.raw`E_x = -\frac{dV}{dx} = -\frac{d}{dx}\left(-2akq\,x^{-2}\right) = -\frac{4akq}{x^3}`)}</div><p>Negative: toward −<i>x</i>, back toward the dipole. That fits: the nearer −<i>q</i> pulls a positive test charge in harder than the farther +<i>q</i> pushes it out. <b>E</b> points from high to low <i>V</i>, and <i>V</i> is lower (more negative) closer in.</p>` },
  ],
  5: [
    { q: `The page’s rod (+${rQ / nC} nC over ${p(rL * 100, 0)} cm). The potential on its axis ${p(P5.a * 100, 0)} cm past one end is`,
      choices: P5.nums.map(x => `${p(x, 1)} V`), answer: 3, nums: P5.nums,
      why: `<div class="eq">${tex(String.raw`V = \int_a^{a+L} \frac{k\lambda\,dx}{x} = k\lambda\ln\frac{a + L}{a} = ${p(K * rlam, 1)} \times \ln ${p((P5.a + rL) / P5.a, 0)} = ${p(P5.V, 1)}\ \text{V}`)}</div><p>The integral of 1/<i>x</i> is the natural log; log₁₀ gives ${p(P5.nums[2], 1)} V. Putting all the charge at the middle (${p(P5.nums[1], 1)} V) only works far away.</p>` },
    { q: `From <i>V</i>(<i>a</i>) on that axis, the field ${p(P5.a * 100, 0)} cm past the end is`,
      choices: P5.nums2.map(x => `${p(x, 0)} N/C`), answer: 0, nums: P5.nums2,
      why: `<div class="eq">${tex(String.raw`E = -\frac{dV}{da} = -k\lambda\left[\frac{1}{a + L} - \frac{1}{a}\right] = \frac{kQ}{a(a + L)} = ${p(P5.E, 0)}\ \text{N/C}`)}</div><p>pointing away from the rod. ${tex.inline(String.raw`V/a`)} (${p(P5.nums2[1], 0)} N/C) would be right only for <i>V</i> ∝ ${tex.inline(String.raw`1/a`)}; take the derivative.</p>` },
  ],
  6: [
    { q: `The page’s ring (+${M.RING.Q / nC} nC, <i>R</i> = ${p(M.RING.R * 100, 0)} cm). The potential on its axis ${p(P6.z * 100, 0)} cm from the centre is`,
      choices: P6.nums.map(x => `${p(x, 1)} V`), answer: 1, nums: P6.nums,
      why: `<p>Every d<i>q</i> is ${tex.inline(String.raw`\sqrt{R^2 + z^2}`)} = ${p(Math.hypot(M.RING.R, P6.z) * 100, 0)} cm away, and <i>V</i> is a scalar, so no components:</p><div class="eq">${tex(String.raw`V = \frac{kQ}{\sqrt{R^2 + z^2}} = \frac{${p(K * M.RING.Q, 2)}}{${p(Math.hypot(M.RING.R, P6.z), 2)}} = ${p(P6.V, 1)}\ \text{V}`)}</div><p>${p(P6.nums[2], 1)} is the field ${tex.inline(String.raw`kQz/(R^2 + z^2)^{3/2}`)} in N/C; the cos factor belongs to <b>E</b>, not <i>V</i>.</p>` },
    { q: `The page’s half-ring (+${M.ARC.Q / nC} nC, <i>R</i> = ${p(M.ARC.R * 100, 0)} cm) has ${tex.inline(String.raw`V = kQ/R`)} at its centre. The <b>field</b> there has magnitude`,
      choices: P6b.nums.map(x => `${x ? p(x, 0) : '0'} N/C`), answer: 2, nums: P6b.nums,
      why: `<p>With ${tex.inline(String.raw`\lambda = Q/\pi R`)}, each d<i>q</i> = λ<i>R</i> dθ gives ${tex.inline(String.raw`k\lambda \,d\theta/R`)}. Measure θ from the line of symmetry; the sideways parts cancel and the rest add:</p><div class="eq">${tex(String.raw`E = \int_{-\pi/2}^{\pi/2} \frac{k\lambda}{R}\cos\theta\,d\theta = \frac{2k\lambda}{R} = \frac{2kQ}{\pi R^2} = ${p(P6b.E, 0)}\ \text{N/C}`)}</div><p>Unlike <i>V</i>, <b>E</b> is not just ${tex.inline(String.raw`kQ/R^2`)} (${p(P6b.nums[0], 0)} N/C): the pieces point different ways. It is zero only for a full ring.</p>` },
  ],
  7: [
    { q: `The page’s insulating sphere (+${M.SPH.Q / nC} nC spread evenly, <i>R</i> = ${p(M.SPH.R * 100, 0)} cm). The potential ${p(P7.r * 100, 0)} cm from its centre is`,
      choices: P7.nums.map(x => `${p(x, 1)} V`), answer: 1, nums: P7.nums,
      why: `<p>Walk in from infinity: ${tex.inline(String.raw`-\int E \,dr`)} outside gives ${tex.inline(String.raw`kQ/R`)}; inside, ${tex.inline(String.raw`E = kQr/R^3`)} adds more:</p><div class="eq">${tex(String.raw`V(r) = \frac{kQ}{R} + \int_r^R \frac{kQr'}{R^3}\,dr' = \frac{kQ}{R}\left(\frac32 - \frac{r^2}{2R^2}\right) = ${p(P7.V, 1)}\ \text{V}`)}</div><p>${tex.inline(String.raw`kQ/r`)} (${p(P7.nums[0], 1)} V) acts as if all the charge were inside <i>r</i>; ${p(P7.nums[2], 1)} V is the metal sphere, where <i>E</i> = 0 inside.</p>` },
    { q: `Two metal spheres, radii <i>R</i><sub>1</sub> = 3<i>R</i><sub>2</sub>, are far apart and joined by a thin wire, then charged. The ratio of surface charge densities ${tex.inline(String.raw`\sigma_1/\sigma_2`)} is`,
      choices: P7b.nums.map(frac), answer: 0, nums: P7b.nums,
      why: `<p>Joined, they are one conductor at one potential: ${tex.inline(String.raw`kQ_1/R_1 = kQ_2/R_2`)}, so ${tex.inline(String.raw`Q_1/Q_2 = R_1/R_2 = 3`)}. Then</p><div class="eq">${tex(String.raw`\frac{\sigma_1}{\sigma_2} = \frac{Q_1/R_1^2}{Q_2/R_2^2} = 3 \times \left(\tfrac13\right)^2 = \frac13`)}</div><p>The big sphere holds more charge but spreads it thinner: charge crowds where a conductor is sharply curved.</p>` },
  ],
  8: [
    { q: `The page’s proton starts from rest at the ${M.ACC.Vhi} V plate and crosses to the ${M.ACC.Vlo} V plate. It arrives at`,
      choices: P8.nums.map(x => `${p(x, 1)} km/s`), answer: 2, nums: P8.nums,
      why: `<div class="eq">${tex(String.raw`e\,\Delta V = \tfrac12 mv^2 \quad\Rightarrow\quad v = \sqrt{\frac{2e\,\Delta V}{m_\text{p}}} = \sqrt{\frac{2 \times ${sci(M.E_CH)} \times ${M.ACC.dV}}{${sci(M.M_P)}}} = ${p(P8.v / 1e3, 1)}\ \text{km/s}`)}</div><p>Only the <b>difference</b>, ${M.ACC.dV} V, counts, not the ${M.ACC.Vhi} V of the start plate. ${p(P8.nums[3], 0)} km/s is the electron’s speed for the same 6 eV.</p>` },
    { q: `An electron starts at rest ${p(P8b.ra * 100, 0)} cm from a fixed +${P8b.Q / nC} nC charge and is pulled in. Its speed when ${p(P8b.rb * 100, 0)} cm away is`,
      choices: P8b.nums.map(x => `${p(x, 2)} × 10<sup>6</sup> m/s`), answer: 1, nums: P8b.nums,
      why: `<p>The force grows as it falls in, so use energy, which already holds the integral ${tex.inline(String.raw`\int F \,dr`)}:</p><div class="eq">${tex(String.raw`\Delta V = kQ\left(\frac{1}{r_b} - \frac{1}{r_a}\right) = ${p(P8b.dV, 1)}\ \text{V}, \quad v = \sqrt{\frac{2e\,\Delta V}{m_\text{e}}} = ${p(P8b.v / 1e6, 2)} \times 10^6\ \text{m/s}`)}</div><p>Using <i>V</i> at ${p(P8b.rb * 100, 0)} cm alone (${p(K * P8b.Q / P8b.rb, 0)} V) forgets that it started at ${p(K * P8b.Q / P8b.ra, 0)} V, not 0.</p>` },
  ],
};
