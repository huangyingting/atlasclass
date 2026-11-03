// induction/practice.js — AP Physics C style practice, one or two questions per page (keys are page indices, as in PAGES).
// Every number is computed here; a quantitative item keeps its choices' numbers in `nums` (in the units shown),
// and checks.mjs recomputes the keyed one by another route.
import * as M from './model.js';
import { tex } from '../engine/tex.js';

const p = (x, d) => x.toFixed(d);
const MU0 = M.MU0;

// ---- page 0: average emf of a coil in a growing field; when a polynomial flux has zero emf ----
const P0 = { N: 200, A: 0.0050, B1: 0.10, B2: 0.50, dt: 0.20 };
P0.emf = P0.N * P0.A * (P0.B2 - P0.B1) / P0.dt;
P0.nums = [P0.A * (P0.B2 - P0.B1) / P0.dt, P0.emf, P0.N * P0.A * P0.B2 / P0.dt, P0.N * P0.A * (P0.B2 - P0.B1) * P0.dt];   // forgot N · right · used B₂ not ΔB · ×Δt
const P0b = { a: 4.0, b: 6.0 };                      // Φ = a t³ − b t (mWb)
P0b.t = Math.sqrt(P0b.b / (3 * P0b.a));
P0b.nums = [Math.sqrt(P0b.b / P0b.a), P0b.b / (3 * P0b.a), Math.sqrt(3 * P0b.a / P0b.b), P0b.t];   // where Φ = 0 · forgot the root · upside down · right

// ---- page 1: charge through the loop as the N pole comes in (page's magnet and loop) ----
const L1 = (() => { const c = M.CASES[0], a = M.lenzCase(c, 0), b = M.lenzCase(c, M.LENZ.run), dPhi = b.Phi - a.Phi;
  return { dPhi, Q: dPhi / M.LENZ.R, nums: [dPhi / M.LENZ.R / 2, dPhi / (M.LENZ.R * M.LENZ.run), dPhi * M.LENZ.run / M.LENZ.R, dPhi / M.LENZ.R].map(x => x * 1e3) }; })();
// ---- page 2: the iron core, I₁ = c t² ----
const P2 = { c: 2.0, t: 0.50 };
P2.dI = 2 * P2.c * P2.t;
P2.nums = [M.CORE.M * P2.c * P2.t ** 2, M.CORE.M * P2.dI, M.CORE.L1 * P2.dI, M.CORE.M * P2.c * P2.t].map(x => x * 1e3);   // M·I · right · L₁ · lost the 2
// ---- page 3: the page's loop leaving the wire, at r = 2 cm ----
const P3 = (() => { const { I, a, b, r0: r, v } = M.WIRE, k = MU0 * I / (2 * Math.PI);
  return { emf: k * a * b * v / (r * (r + a)), nums: [k / r * b * v, k * (1 / r + 1 / (r + a)) * b * v, k * (1 / r - 1 / (r + a)) * a * v, k * (1 / r - 1 / (r + a)) * b * v].map(x => x * 1e6) }; })();
// ---- page 4: a rod turning about one end ----
const P4 = { l: 0.50, w: 20, B: 0.40 };
P4.emf = 0.5 * P4.B * P4.w * P4.l ** 2;
P4.nums = [P4.B * P4.w * P4.l ** 2, P4.emf, P4.B * P4.w * P4.l, P4.emf / 2];   // tip speed for the whole rod · right · dropped an ℓ · ¼
// ---- page 5: pulling the page's loop into the field at constant speed ----
const P5 = (() => { const { B, h, w, v, R } = M.CROSS, F = B * B * h * h * v / R;
  return { F, nums: [B * B * h * w * v / R, 2 * F, F, B * h * h * v / R].map(x => x * 1e3) }; })();   // used w · both sides · right · one B only
// ---- page 6: how far the page's bar coasts ----
const P6 = (() => { const { v0, tau } = M.RAIL; return { d: v0 * tau, nums: [v0 * tau / 2, v0 * tau * (1 - 1 / Math.E), v0 * tau] }; })();
// ---- page 7: a solenoid's inductance; the page's solenoid driven sinusoidally ----
const P7 = { N: 500, l: 0.25, r: 0.010 };
P7.L = MU0 * P7.N ** 2 * Math.PI * P7.r ** 2 / P7.l;
P7.nums = [P7.L, MU0 * P7.N ** 2 * Math.PI * (2 * P7.r) ** 2 / P7.l, MU0 * P7.N * Math.PI * P7.r ** 2 / P7.l, MU0 * P7.N ** 2 * P7.r ** 2 / P7.l].map(x => x * 1e3);   // right · diameter · N not N² · forgot π
const P7b = { I0: 2.0, w: 50 };
P7b.emf = M.SOL.L * P7b.I0 * P7b.w;
P7b.nums = [M.SOL.L * P7b.I0, M.SOL.L * P7b.I0 / P7b.w, P7b.emf, M.SOL.L * P7b.I0 * P7b.w ** 2].map(x => x * 1e3);
// ---- page 8: the page's RL circuit reaching 2.0 A ----
const P8 = { I: 2.0 };
P8.t = -M.RL.tau * Math.log(1 - P8.I / M.RL.Imax);
P8.nums = [M.RL.tau, P8.t, M.RL.tau * Math.log(M.RL.Imax / P8.I), M.RL.tau * P8.I / M.RL.Imax];   // assumed τ · right · ln upside down · linear
// ---- page 9: the page's LC circuit, first maximum of the current ----
const P9 = { t: M.LC.T / 4, I: M.LC.Imax };

export const PRACTICE = {
  0: [
    { q: `A ${P0.N}-turn coil of area ${p(P0.A * 1e4, 0)} cm² lies flat in a uniform field perpendicular to it. The field grows steadily from ${p(P0.B1, 2)} T to ${p(P0.B2, 2)} T in ${p(P0.dt, 2)} s. The magnitude of the induced emf is`,
      choices: P0.nums.map(x => `${p(x, 3)} V`), answer: 1, nums: P0.nums,
      why: `<p>Each turn has Φ = <i>BA</i>, and all ${P0.N} turns add:</p><div class="eq">${tex(String.raw`|\mathcal{E}| = NA\frac{\Delta B}{\Delta t} = \frac{${P0.N} \times ${P0.A}\ \text{m}^2 \times ${p(P0.B2 - P0.B1, 2)}\ \text{T}}{${P0.dt}\ \text{s}} = ${p(P0.emf, 3)}\ \text{V}`)}</div><p>Only the <b>change</b> in <i>B</i> counts: using ${P0.B2} T alone gives ${p(P0.nums[2], 3)} V, and leaving out <i>N</i> gives one turn’s ${p(P0.nums[0], 3)} V.</p>` },
    { q: `The flux through a loop is Φ<sub><i>B</i></sub>(<i>t</i>) = ${p(P0b.a, 1)}<i>t</i><sup>3</sup> − ${p(P0b.b, 1)}<i>t</i> (mWb, <i>t</i> in s). At what time <i>t</i> > 0 is the induced emf zero?`,
      choices: P0b.nums.map(x => `${p(x, 2)} s`), answer: 3, nums: P0b.nums,
      why: `<p>The emf is minus the <b>slope</b> of Φ, not Φ itself:</p><div class="eq">${tex(String.raw`\mathcal{E} = -\frac{d\Phi}{dt} = -(${p(3 * P0b.a, 0)}t^2 - ${p(P0b.b, 0)}) = 0\quad\Rightarrow\quad t = \sqrt{\frac{${p(P0b.b, 0)}}{${p(3 * P0b.a, 0)}}} = ${p(P0b.t, 2)}\ \text{s}`)}</div><p>At ${p(P0b.nums[0], 2)} s the flux is zero but still changing, so the emf is not.</p>` },
  ],
  1: [
    { q: `A bar magnet’s N pole is pulled straight away from a loop along its axis. Seen from the magnet, the induced current in the loop is`,
      choices: ['counterclockwise, and the loop repels the magnet', 'clockwise, and the loop repels the magnet', 'counterclockwise, and the loop attracts the magnet', 'clockwise, and the loop attracts the magnet'], answer: 3,
      why: `<p>The N pole’s field runs through the loop away from the viewer, and it is shrinking. The induced field points the same way, away from the viewer, to make up the loss: by the right-hand rule that is a <b>clockwise</b> current as seen from the magnet. Field lines enter the loop’s near face, so that face is an S pole and pulls the N pole back: the loop opposes the motion.</p>` },
    { q: `In the page’s loop (<i>R</i> = ${p(M.LENZ.R * 1e3, 0)} mΩ) the flux grows from ${p(M.lenzCase(M.CASES[0], 0).Phi * 1e6, 2)} µWb to ${p(M.lenzCase(M.CASES[0], M.LENZ.run).Phi * 1e6, 2)} µWb as the N pole comes in over ${p(M.LENZ.run, 1)} s. The total charge that flows round the loop is`,
      choices: L1.nums.map(x => `${p(x, 2)} mC`), answer: 3, nums: L1.nums,
      why: `<p>Integrate the current; the time drops out:</p><div class="eq">${tex(String.raw`Q = \int I\,dt = \int \frac{\mathcal{E}}{R}\,dt = \frac{1}{R}\int |d\Phi| = \frac{\Delta\Phi}{R} = \frac{${p(L1.dPhi * 1e6, 2)}\ \mu\text{Wb}}{${M.LENZ.R}\ \Omega} = ${p(L1.Q * 1e3, 2)}\ \text{mC}`)}</div><p>It does not matter how fast the magnet moves. ${p(L1.nums[1], 2)} is the average current in mA, not a charge.</p>` },
  ],
  2: [
    { q: `Two coils share an iron core. If the number of turns on the <b>secondary</b> is doubled, the mutual inductance <i>M</i>`,
      choices: ['doubles', 'is unchanged', 'quadruples', 'halves'], answer: 0,
      why: `<p>${tex.inline(String.raw`M = \frac{N_2\Phi_2}{I_1}`)}. The flux per turn, set by the primary’s current and turns, is unchanged; twice as many secondary turns hold twice the flux linkage. ${tex.inline(String.raw`M = \frac{\mu_r\mu_0 N_1N_2A}{\ell}`)} is linear in each <i>N</i>; it is a self-inductance that goes as <i>N</i><sup>2</sup>.</p>` },
    { q: `On the page’s iron core (<i>M</i> = ${p(M.CORE.M * 1e3, 1)} mH, <i>L</i><sub>1</sub> = ${p(M.CORE.L1 * 1e3, 1)} mH) the primary carries <i>I</i><sub>1</sub> = ${p(P2.c, 1)}<i>t</i><sup>2</sup> (A, <i>t</i> in s). The magnitude of the secondary emf at <i>t</i> = ${p(P2.t, 2)} s is`,
      choices: P2.nums.map(x => `${p(x, 1)} mV`), answer: 1, nums: P2.nums,
      why: `<div class="eq">${tex(String.raw`\mathcal{E}_2 = -M\frac{dI_1}{dt} = -M(${p(2 * P2.c, 1)}t) = -${p(M.CORE.M * 1e3, 1)}\ \text{mH} \times ${p(P2.dI, 2)}\ \text{A/s} = -${p(P2.nums[1], 1)}\ \text{mV}`)}</div><p>It takes the rate of change, not <i>I</i><sub>1</sub> itself (${p(P2.nums[0], 1)} mV); and the secondary sees <i>M</i>, not the primary’s own <i>L</i><sub>1</sub>.</p>` },
  ],
  3: [
    { q: `A rectangular loop has sides <i>b</i> parallel to a long wire carrying <i>I</i>; its near side is at distance <i>r</i> and its far side at <i>r</i> + <i>a</i>. The flux through it is`,
      choices: [tex.inline(String.raw`\left(\frac{\mu_0 Ib}{2\pi r}\right)a`), tex.inline(String.raw`\left(\frac{\mu_0 Ib}{2\pi}\right)\ln\left(\frac{r + a}{r}\right)`), tex.inline(String.raw`\left(\frac{\mu_0 Ia}{2\pi}\right)\ln\left(\frac{r + b}{r}\right)`), tex.inline(String.raw`\left(\frac{\mu_0 Ib}{2\pi}\right)\left(\frac{1}{r} - \frac{1}{r + a}\right)`)], answer: 1,
      why: `<p>${tex.inline(String.raw`B = \frac{\mu_0 I}{2\pi s}`)} varies with distance <i>s</i>, so cut the loop into strips <i>b ds</i> parallel to the wire:</p><div class="eq">${tex(String.raw`\Phi = \int_r^{r+a} \frac{\mu_0 I}{2\pi s}\,b\,ds = \frac{\mu_0 Ib}{2\pi}\ln\left(\frac{r + a}{r}\right)`)}</div><p>Choice A treats <i>B</i> as uniform at its near-side value; choice D is the derivative’s shape, not the integral’s.</p>` },
    { q: `The page’s loop (<i>b</i> = ${p(M.WIRE.b * 100, 0)} cm along the wire, <i>a</i> = ${p(M.WIRE.a * 100, 0)} cm across) moves straight away from a ${M.WIRE.I} A wire at ${p(M.WIRE.v * 100, 0)} cm/s. When its near side is ${p(M.WIRE.r0 * 100, 0)} cm from the wire, |ε| is`,
      choices: P3.nums.map(x => `${p(x, 3)} µV`), answer: 3, nums: P3.nums,
      why: `<p>Only the two sides parallel to the wire cut field lines. Each has motional emf <i>Bbv</i>, and round the loop they oppose:</p><div class="eq">${tex(String.raw`\mathcal{E} = (B_\text{near} - B_\text{far})bv = \frac{\mu_0 Iabv}{2\pi r(r + a)} = ${p(P3.emf * 1e6, 3)}\ \mu\text{V}`)}</div><p>The same as ${tex.inline(String.raw`-\frac{d\Phi}{dt}`)} of the logarithm. The near side alone gives ${p(P3.nums[0], 3)} µV; adding the two sides, ${p(P3.nums[1], 3)} µV.</p>` },
  ],
  4: [
    { q: `A vertical metal bar moves to the right through a uniform field pointing into the page, on no circuit. After a moment,`,
      choices: ['the top end is at higher potential, and no current flows', 'the bottom end is at higher potential, and current flows', 'the bottom end is at higher potential, and no current flows', 'the top end is at higher potential, and current flows down the bar'], answer: 0,
      why: `<p><i>F</i> = <i>qv</i>×<i>B</i>: right × into the page = up, so positive charge collects at the top. Its field pushes back until <i>qE</i> = <i>qvB</i>; then nothing moves along the bar. With no closed path there is an emf <i>BLv</i> but no steady current.</p>` },
    { q: `A ${p(P4.l * 100, 0)} cm metal rod turns at ${P4.w} rad/s about one end, in a plane perpendicular to a uniform ${p(P4.B, 2)} T field. The emf between its ends is`,
      choices: P4.nums.map(x => `${p(x, 2)} V`), answer: 1, nums: P4.nums,
      why: `<p>Each piece <i>dr</i> moves at <i>v</i> = ω<i>r</i>, so its emf is <i>B</i>ω<i>r dr</i>. Add them along the rod:</p><div class="eq">${tex(String.raw`\mathcal{E} = \int_0^\ell B\omega r\,dr = \tfrac12 B\omega\ell^2 = \tfrac12 \times ${P4.B} \times ${P4.w} \times {${P4.l}}^2 = ${p(P4.emf, 2)}\ \text{V}`)}</div><p>Using the tip speed ωℓ for the whole rod gives ${p(P4.nums[0], 2)} V, twice too much: the average speed is half the tip’s.</p>` },
  ],
  5: [
    { q: `The loop (height <i>h</i> = ${p(M.CROSS.h * 100, 0)} cm, width ${p(M.CROSS.w * 100, 0)} cm, <i>R</i> = ${M.CROSS.R} Ω) is pulled into the ${M.CROSS.B} T field at a steady ${M.CROSS.v} m/s. While its leading side is in and its trailing side out, the pulling force needed is`,
      choices: P5.nums.map(x => `${p(x, 1)} mN`), answer: 2, nums: P5.nums,
      why: `<div class="eq">${tex(String.raw`I = \frac{Bhv}{R},\quad F = IhB = \frac{B^2h^2v}{R} = ${p(P5.F * 1e3, 1)}\ \text{mN}`)}</div><p>Only the leading side carries current in the field (the top and bottom forces cancel), and only the height <i>h</i> cuts field lines. Check: ${tex.inline(String.raw`Fv = ${p(P5.F * M.CROSS.v * 1e3, 1)}\ \text{mW} = \frac{\mathcal{E}^2}{R}`)}.</p>` },
    { q: `A loop of mass <i>m</i>, resistance <i>R</i> and height <i>h</i> slides <b>freely</b> (no pulling force) into a uniform field <i>B</i> at speed <i>v</i><sub>0</sub>. Find its speed as a function of the distance <i>x</i> its leading side has gone into the field, while the trailing side is still outside.`,
      solution: `<p>With only the leading side in the field, the current is ${tex.inline(String.raw`\frac{Bhv}{R}`)} and the field pushes back on it with <i>IhB</i>:</p><div class="eq">${tex(String.raw`m\frac{dv}{dt} = -\frac{B^2h^2v}{R}`)}</div><p>Write ${tex.inline(String.raw`\frac{dv}{dt} = v\frac{dv}{dx}`)} and cancel <i>v</i>:</p><div class="eq">${tex(String.raw`m\frac{dv}{dx} = -\frac{B^2h^2}{R}\quad\Rightarrow\quad v(x) = v_0 - \frac{B^2h^2x}{mR}`)}</div><p>Speed falls <b>linearly with distance</b> (exponentially with time). If <i>v</i> would reach 0 before <i>x</i> = the loop’s width, the loop stops part-way in.</p>` },
  ],
  6: [
    { q: `The page’s bar (${tex.inline(String.raw`\tau = \frac{mR}{B^2L^2} = ${p(M.RAIL.tau, 2)}\ \text{s}`)}) is let go at ${p(M.RAIL.v0, 2)} m/s with nothing pushing it. How far does it travel before stopping?`,
      choices: [`${p(P6.nums[0], 2)} m`, `${p(P6.nums[1], 2)} m`, 'it never stops, so the distance grows without limit', `${p(P6.nums[2], 2)} m`], answer: 3, nums: [P6.nums[0], P6.nums[1], NaN, P6.nums[2]],
      why: `<p>The speed decays exponentially, but its integral is finite:</p><div class="eq">${tex(String.raw`x = \int_0^\infty v_0e^{-t/\tau}\,dt = v_0\tau = ${p(P6.d, 2)}\ \text{m}`)}</div><p>${p(P6.nums[1], 2)} m is only how far it gets by <i>t</i> = τ; ${p(P6.nums[0], 2)} m assumes a constant deceleration.</p>` },
    { q: `The resistor joining the rails is replaced by one of twice the resistance, and the bar is launched at the same speed. The total heat produced as it comes to rest`,
      choices: ['doubles', 'halves', 'is unchanged', 'quadruples'], answer: 2,
      why: `<p>All the bar’s kinetic energy ${tex.inline(String.raw`\tfrac12 mv_0^2`)} ends as heat whatever <i>R</i> is. A larger <i>R</i> means a smaller current and weaker braking, so τ doubles and the bar coasts twice as far, but the total heat is the same.</p>` },
  ],
  7: [
    { q: `A solenoid has ${P7.N} turns on ${p(P7.l * 100, 0)} cm, with radius ${p(P7.r * 100, 1)} cm. Its inductance is about`,
      choices: P7.nums.map(x => x < 0.01 ? `${p(x * 1e3, 2)} µH` : `${p(x, 3)} mH`), answer: 0, nums: P7.nums,
      why: `<p><i>B</i> = μ<sub>0</sub><i>nI</i> through each turn, so ${tex.inline(String.raw`N\Phi = N\left(\frac{\mu_0 NI}{\ell}\right)\pi r^2`)} and</p><div class="eq">${tex(String.raw`L = \frac{\mu_0 N^2\pi r^2}{\ell} = ${p(P7.L * 1e3, 3)}\ \text{mH}`)}</div><p>Using the diameter for <i>r</i> gives 4× too much; <i>N</i> instead of <i>N</i><sup>2</sup> forgets that more turns both make more field and catch more of it.</p>` },
    { q: `The page’s solenoid (<i>L</i> = ${p(M.SOL.L * 1e3, 2)} mH) carries <i>I</i>(<i>t</i>) = (${p(P7b.I0, 1)} A) sin(${P7b.w}<i>t</i>). The largest magnitude of its back emf is`,
      choices: P7b.nums.map(x => x < 1 ? `${p(x, 3)} mV` : x < 10 ? `${p(x, 2)} mV` : x < 1000 ? `${p(x, 1)} mV` : `${p(x / 1e3, 1)} V`), answer: 2, nums: P7b.nums,
      why: `<div class="eq">${tex(String.raw`\mathcal{E}_L = -L\frac{dI}{dt} = -LI_0\omega\cos\omega t,\quad \text{max } LI_0\omega = ${p(M.SOL.L * 1e3, 2)}\ \text{mH} \times ${P7b.I0}\ \text{A} \times ${P7b.w}\ \text{s}^{-1} = ${p(P7b.emf * 1e3, 1)}\ \text{mV}`)}</div><p>The peak comes when <i>I</i> = 0 and changes fastest; <i>LI</i><sub>0</sub> = ${p(P7b.nums[0], 2)} mV is a flux linkage in mWb, not an emf.</p>` },
  ],
  8: [
    { q: `In the page’s circuit (ε = ${M.RL.E} V, <i>R</i> = ${M.RL.R} Ω, <i>L</i> = ${M.RL.L} H), starting from <i>I</i> = 0, how long until the current reaches ${p(P8.I, 1)} A?`,
      choices: P8.nums.map(x => `${p(x, 3)} s`), answer: 1, nums: P8.nums,
      why: `<p>Solve ${tex.inline(String.raw`L\frac{dI}{dt} = \mathcal{E} - IR`)} from <i>I</i> = 0: ${tex.inline(String.raw`I = \frac{\mathcal{E}}{R}\left(1 - e^{-t/\tau}\right)`)}, ${tex.inline(String.raw`\tau = \frac{L}{R} = ${p(M.RL.tau, 2)}\ \text{s}`)}.</p><div class="eq">${tex(String.raw`t = -\tau\ln\left(1 - \frac{IR}{\mathcal{E}}\right) = -${p(M.RL.tau, 2)}\ln\left(1 - \frac{${p(P8.I, 1)}}{${p(M.RL.Imax, 1)}}\right) = ${p(P8.t, 3)}\ \text{s}`)}</div><p>${p(P8.I, 1)} A is ${p(P8.I / M.RL.Imax * 100, 0)} % of ${p(M.RL.Imax, 0)} A, more than the 63 % reached at τ, so it takes longer than τ.</p>` },
    { q: `An RL circuit with a battery has been switched on for a long time when the battery is suddenly taken out of the loop (the loop stays closed through the resistor). Just afterwards,`,
      choices: [`the current is ${tex.inline(String.raw`\varepsilon/R`)}, falling, and the inductor acts as the source`, 'the current is zero', `the current is ${tex.inline(String.raw`\varepsilon/R`)} and steady`, 'the current reverses direction'], answer: 0,
      why: `<p>An inductor forbids a sudden jump in current, so <i>I</i> starts at ${tex.inline(String.raw`\frac{\mathcal{E}}{R}`)} in the same direction. With no battery, ${tex.inline(String.raw`L\frac{dI}{dt} = -IR`)}: the inductor’s emf now drives the current through <i>R</i> while it decays as <i>e</i><sup>−<i>t</i>/τ</sup>, turning ${tex.inline(String.raw`\tfrac12 LI^2`)} into heat.</p>` },
  ],
  9: [
    { q: `The page’s capacitor (${p(M.LC.C * 1e6, 0)} µF, ${p(M.LC.Q * 1e6, 0)} µC) is connected to the ${p(M.LC.L * 1e3, 0)} mH coil at <i>t</i> = 0. The current is first at its largest at`,
      choices: [`<i>t</i> = ${p(M.LC.T / 2 * 1e3, 2)} ms, ${p(P9.I * 1e3, 0)} mA`, `<i>t</i> = ${p(P9.t * 1e3, 2)} ms, ${p(M.LC.f * M.LC.Q * 1e3, 1)} mA`, `<i>t</i> = ${p(P9.t * 1e3, 2)} ms, ${p(P9.I * 1e3, 0)} mA`, `<i>t</i> = 0, ${p(P9.I * 1e3, 0)} mA`], answer: 2,
      nums: [M.LC.T / 2 * 1e3, P9.t * 1e3, P9.t * 1e3, 0], nums2: [P9.I * 1e3, M.LC.f * M.LC.Q * 1e3, P9.I * 1e3, P9.I * 1e3],
      why: `<p>${tex.inline(String.raw`\omega = \frac{1}{\sqrt{LC}} = ${p(M.LC.w, 0)}\ \text{rad/s}`)}, ${tex.inline(String.raw`T = \frac{2\pi}{\omega} = ${p(M.LC.T * 1e3, 2)}\ \text{ms}`)}. With <i>q</i> = <i>Q</i> cos ω<i>t</i>, <i>I</i> = −ω<i>Q</i> sin ω<i>t</i> is largest first at ${tex.inline(String.raw`\omega t = \frac{\pi}{2}`)}, a quarter period in, when the plates are empty:</p><div class="eq">${tex(String.raw`t = \frac{T}{4} = ${p(P9.t * 1e3, 2)}\ \text{ms},\quad |I| = \omega Q = ${p(P9.I * 1e3, 0)}\ \text{mA}`)}</div><p>At <i>t</i> = 0 the current is zero: the coil will not let it jump. ${p(M.LC.f * M.LC.Q * 1e3, 1)} mA uses <i>f</i> in place of ω.</p>` },
    { q: `For an LC circuit with no resistance, show that ${tex.inline(String.raw`U = \frac{q^2}{2C} + \tfrac12 LI^2`)} is constant, and use energy to find the current when the charge on the capacitor is ${tex.inline(String.raw`\frac{Q}{2}`)} (its largest charge is <i>Q</i>).`,
      solution: `<p>Differentiate, with ${tex.inline(String.raw`I = \frac{dq}{dt}`)}:</p><div class="eq">${tex(String.raw`\frac{dU}{dt} = \frac{q}{C}I + LI\frac{dI}{dt} = I\left(\frac{q}{C} + L\frac{dI}{dt}\right)`)}</div><p>The bracket is the loop rule, zero at every instant, so ${tex.inline(String.raw`U = \frac{Q^2}{2C}`)} throughout. At ${tex.inline(String.raw`q = \frac{Q}{2}`)}:</p><div class="eq">${tex(String.raw`\tfrac12 LI^2 = \frac{Q^2}{2C} - \frac{Q^2}{8C} = \frac{3Q^2}{8C}\quad\Rightarrow\quad |I| = \frac{\sqrt{3}}{2}\,\frac{Q}{\sqrt{LC}} = \frac{\sqrt{3}}{2}\,\omega Q`)}</div><p>For the page’s circuit that is ${p(Math.sqrt(3) / 2 * M.LC.Imax * 1e3, 1)} mA. Three quarters of the energy is in the coil when only half the charge has left.</p>` },
  ],
};
