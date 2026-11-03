// AP-style practice, one or two questions per page (keys are page indices, as in PAGES).
// Every number is computed here from model.js; checks.mjs recomputes each answer another way.
import * as M from './model.js';
import { tex } from '../engine/tex.js';

const p3 = x => (x < 0 ? '−' : '') + (Math.abs(x) >= 1000 ? Math.abs(x).toFixed(0) : Math.abs(x).toPrecision(3));   // 3 significant figures
const f = (x, n = 2) => (x < 0 ? '−' : '') + Math.abs(x).toFixed(n);
const G = M.G, RHO = M.RHO;
const AL = M.MATERIALS.find(m => m.key === 'al'), ICEM = M.MATERIALS.find(m => m.key === 'ice');
const BU = M.BUOY, PA = M.PASCAL, FL = M.FLOW, BE = M.BERN, TK = M.TANK;
const eq = s => `<div class="eq">${tex(s)}</div>`;

// 0 · a 5.0 cm ice cube
const S0 = 0.05, M0 = ICEM.rho * S0 ** 3;
// 1 · standing on one shoe
const A1 = M.SHOE.w * M.SHOE.l, P1 = M.PERSON.W / A1;
// 2 · the lake floor
const D2 = M.LAKE.depth, P2 = M.pAt(D2);
// 3 · a car lift: pistons of radius 2.0 cm and 10.0 cm, a 12 000 N car
const R3a = 0.020, R3b = 0.100, W3 = 12000, F3 = W3 * (R3a / R3b) ** 2;
const D3 = PA.stroke * PA.A1 / PA.A2;
// 4 · the cube all the way under
const T4 = BU.W - BU.Fb;
// 5 · wood in sea water; the steel ball on the floor
const FR5 = M.WOOD.rho / M.RHO_SEA, N5 = M.BALL.W - M.BALL.Fb;
// 6 · narrowing to 10 cm radius; filling a 1000 L tank from the wide part
const R6 = 0.10, V6 = FL.v1 * (FL.r1 / R6) ** 2, T6 = 1.0 / FL.Q;
// 7 · Bernoulli at the three points
const [B1, B2, B3] = BE.pts;
// 8 · the jet when the water is 0.60 m above the hole
const H8 = 0.60, X8 = 2 * Math.sqrt(H8 * TK.yh);
const kPa = (x, n = 1) => `${(x / 1000).toFixed(n)} kPa`;

export const PRACTICE = {
  0: [
    { q: `A 10 cm aluminium cube (ρ = ${AL.rho} kg/m³) is cut into eight equal small cubes. The density of each small cube is`,
      choices: [`${AL.rho / 8} kg/m³`, `${AL.rho / 2} kg/m³`, `${AL.rho} kg/m³`, `${AL.rho * 8} kg/m³`], answer: 2,
      why: `<p>Each piece has ⅛ of the mass and ⅛ of the volume, so ρ = m/V is unchanged. Density belongs to the material, not to the object.</p>` },
    { q: `What is the mass of an ice cube ${f(S0 * 100, 1)} cm on a side? (ρ<sub>ice</sub> = ${ICEM.rho} kg/m³)`,
      choices: [`${p3(ICEM.mass / 2)} kg`, `${p3(M0)} kg`, `${p3(ICEM.mass / 4)} kg`, `${p3(ICEM.rho * (S0 * 10) ** 3)} kg`], answer: 1,
      why: `<p>Convert to metres first: V = (${f(S0, 2)} m)³ = ${f(S0 ** 3 * 1e4, 2)} × 10<sup>−4</sup> m³.</p>${eq(String.raw`m = \rho V = ${ICEM.rho} \times ${f(S0 ** 3 * 1e4, 2)} \times 10^{-4} = ${p3(M0)}\ \text{kg}`)}<p>Halving the side cuts the volume to ⅛, not ½: the 10 cm cube’s ${f(ICEM.mass, 3)} kg becomes ${p3(M0)} kg.</p>` },
  ],
  1: [
    { q: `The ${M.PERSON.m} kg person stands on <b>one</b> shoe (sole ${f(M.SHOE.w * 100, 0)} cm × ${f(M.SHOE.l * 100, 0)} cm). The pressure on the snow is`,
      choices: [`${kPa(M.P_SHOE)}`, `${kPa(M.PERSON.m / A1, 2)}`, `${kPa(2 * P1)}`, `${kPa(P1)}`], answer: 3,
      why: `${eq(String.raw`P = \frac{F}{A} = \frac{mg}{A} = \frac{${f(M.PERSON.W, 0)}\ \text{N}}{${f(A1, 3)}\ \text{m}^2} = \text{${kPa(P1)}}`)}<p>Half the area of two shoes, so twice their ${kPa(M.P_SHOE)}. ${kPa(M.PERSON.m / A1, 2)} divides the mass, not the weight, by the area.</p>` },
    { q: `You push a nail into wood with ${M.NAIL.F} N on its 1 cm² head; it does not accelerate. Compared with your thumb on the head, the tip on the wood exerts`,
      choices: ['the same force and the same pressure', 'a larger force and a larger pressure', 'the same force and a much larger pressure', 'a smaller force and a larger pressure'], answer: 2,
      why: `<p>The nail is in equilibrium (and nearly massless), so the wood pushes back with the same ${M.NAIL.F} N. The tip’s area is 200 times smaller, so the pressure is 200 times larger: ${f(M.NAIL.F / M.NAIL.tip / 1e6, 0)} MPa against ${f(M.NAIL.F / M.NAIL.head / 1e3, 0)} kPa.</p>` },
  ],
  2: [
    { q: `What is the absolute pressure on the floor of the lake, ${D2} m down? (<i>P</i><sub>0</sub> = ${kPa(M.P0)})`,
      choices: [`${kPa(M.gauge(D2))}`, `${kPa(P2)}`, `${kPa(M.P0)}`, `${kPa(2 * M.P0)}`], answer: 1,
      why: `${eq(String.raw`P = P_0 + \rho g h = \text{${kPa(M.P0)}} + ${RHO} \times ${f(G)} \times ${D2} = \text{${kPa(M.P0)}} + \text{${kPa(M.gauge(D2))}} = \text{${kPa(P2)}}`)}<p>${kPa(M.gauge(D2))} is the gauge pressure: it leaves out the atmosphere on the surface.</p>` },
    { q: 'A tall thin vase, a wide bowl and a cone narrowing upward are filled with water to the same depth. The pressure at the bottom is',
      choices: ['greatest in the wide bowl, which holds the most water', 'greatest in the cone, where water is squeezed in', 'greatest in the thin vase', 'the same in all three'], answer: 3,
      why: '<p><i>P</i> = <i>P</i><sub>0</sub> + ρ<i>gh</i> depends only on depth below the open surface, not on the shape or the amount of water. The walls carry the difference in weight.</p>' },
  ],
  3: [
    { q: `A car lift has pistons of radius ${f(R3a * 100, 1)} cm and ${f(R3b * 100, 1)} cm. What force on the small piston holds up a ${W3} N car on the large one?`,
      choices: [`${p3(W3 * R3a / R3b)} N`, `${p3(F3)} N`, `${p3(W3)} N`, `${p3(W3 * (R3b / R3a) ** 2)} N`], answer: 1,
      why: `<p>The same Δ<i>P</i> acts on both pistons, so ${tex.inline(String.raw`F_1/A_1 = F_2/A_2`)}, and area goes as r²:</p>${eq(String.raw`F_1 = ${W3} \times \left(\frac{${f(R3a * 100, 1)}}{${f(R3b * 100, 1)}}\right)^2 = ${p3(F3)}\ \text{N}`)}<p>${p3(W3 * R3a / R3b)} N uses the ratio of radii instead of areas.</p>` },
    { q: `On the page’s press the small piston (${f(PA.A1 * 1e4, 0)} cm²) is pushed down ${f(PA.stroke * 100, 0)} cm. How far does the large piston (${f(PA.A2 * 1e4, 0)} cm²) rise?`,
      choices: [`${p3(PA.stroke * 100 * PA.r1 / PA.r2)} cm`, `${p3(PA.stroke * 100)} cm`, `${p3(PA.stroke * 100 * PA.A2 / PA.A1)} cm`, `${p3(D3 * 100)} cm`], answer: 3,
      why: `<p>Water can’t be squeezed, so the volume pushed down comes up: <i>A</i><sub>1</sub><i>d</i><sub>1</sub> = <i>A</i><sub>2</sub><i>d</i><sub>2</sub>.</p>${eq(String.raw`d_2 = ${f(PA.stroke * 100, 0)}\ \text{cm} \times \frac{${f(PA.A1 * 1e4, 0)}}{${f(PA.A2 * 1e4, 0)}} = ${p3(D3 * 100)}\ \text{cm}`)}<p>Sixteen times the force through one sixteenth of the distance: the work in equals the work out.</p>` },
  ],
  4: [
    { q: `The ${f(BU.s * 100, 0)} cm aluminium cube (W = ${f(BU.W, 0)} N) hangs on the string, completely under water. The string tension is`,
      choices: [`${p3(BU.W)} N`, `${p3(BU.Fb)} N`, `${p3(BU.W + BU.Fb)} N`, `${p3(T4)} N`], answer: 3,
      why: `${eq(String.raw`F_b = \rho_\text{water} V g = ${RHO} \times ${f(BU.V, 3)} \times ${f(G)} = ${f(BU.Fb, 0)}\ \text{N}`)}${eq(String.raw`T = W - F_b = ${f(BU.W, 0)} - ${f(BU.Fb, 0)} = ${p3(T4)}\ \text{N}`)}<p>The buoyant force uses the <b>water’s</b> density, not aluminium’s; ${p3(BU.Fb)} N is the buoyant force, not the tension.</p>` },
    { q: 'Once it is completely under, the cube is lowered deeper. The buoyant force on it',
      choices: ['increases, because the pressure is greater deeper down', 'decreases, because there is more water above it', 'stays the same', 'increases until it equals the weight'], answer: 2,
      why: '<p>Deeper, the pressure on the top and the bottom face both rise by the same ρgΔh. Their difference, ρgs, and so <i>F</i><sub>b</sub> = ρ<i>Vg</i>, does not change. (Water is taken as incompressible.)</p>' },
  ],
  5: [
    { q: `The ${M.WOOD.rho} kg/m³ wooden block floats in sea water (${M.RHO_SEA} kg/m³) instead of fresh water. What fraction of it is under water?`,
      choices: [`${f(100 * M.WOOD.rho / RHO, 1)}%`, `${f(100 * (1 - FR5), 1)}%`, `${f(100 * FR5, 1)}%`, `${f(100 * (1 - M.WOOD.rho / RHO), 1)}%`], answer: 2,
      why: `<p>Floating, <i>F</i><sub>b</sub> = <i>W</i>: ρ<sub>sea</sub><i>V</i><sub>under</sub><i>g</i> = ρ<sub>wood</sub><i>Vg</i>.</p>${eq(String.raw`\frac{V_\text{under}}{V} = \frac{${M.WOOD.rho}}{${M.RHO_SEA}} = ${f(100 * FR5, 1)}\%`)}<p>Denser water holds it up with less volume, so a little less than the ${f(100 * M.WOOD.rho / RHO, 1)}% in fresh water. ${f(100 * (1 - FR5), 1)}% is the part above.</p>` },
    { q: `The steel ball (radius ${f(M.BALL.r, 2)} m, ρ = ${M.BALL.rho} kg/m³) rests on the bottom of the pool. The floor pushes up on it with`,
      choices: [`${p3(M.BALL.W)} N`, `${p3(N5)} N`, `${p3(M.BALL.Fb)} N`, `${p3(M.BALL.W + M.BALL.Fb)} N`], answer: 1,
      why: `${eq(String.raw`V = \tfrac43\pi r^3 = ${f(M.BALL.V, 4)}\ \text{m}^3,\quad W = \rho_\text{steel} V g = ${f(M.BALL.W, 0)}\ \text{N},\quad F_b = \rho_\text{water} V g = ${f(M.BALL.Fb, 0)}\ \text{N}`)}${eq(String.raw`F_N = W - F_b = ${p3(N5)}\ \text{N}`)}<p>The water still pushes up on a sunken ball; the floor only supplies the rest.</p>` },
  ],
  6: [
    { q: `Water at ${f(FL.v1, 1)} m/s in the ${f(FL.r1 * 100, 0)} cm radius pipe flows into a section of radius ${f(R6 * 100, 0)} cm. Its speed there is`,
      choices: [`${p3(FL.v1 * FL.r1 / R6)} m/s`, `${p3(V6)} m/s`, `${p3(FL.v1 * (R6 / FL.r1) ** 2)} m/s`, `${p3(FL.v1 * R6 / FL.r1)} m/s`], answer: 1,
      why: `${eq(String.raw`A_1 v_1 = A_2 v_2 \quad\Rightarrow\quad v_2 = v_1\left(\frac{r_1}{r_2}\right)^2 = ${f(FL.v1, 1)} \times 3^2 = ${p3(V6)}\ \text{m/s}`)}<p>Area goes as r², so a third of the radius is a ninth of the area. ${p3(FL.v1 * FL.r1 / R6)} m/s uses the radius ratio.</p>` },
    { q: `How long does the wide pipe (radius ${f(FL.r1 * 100, 0)} cm, ${f(FL.v1, 1)} m/s) take to fill a 1000 L tank?`,
      choices: [`${p3(1.0 / (Math.PI * (2 * FL.r1) ** 2 * FL.v1))} s`, `${p3(1.0 / (2 * Math.PI * FL.r1 * FL.v1))} s`, `${p3(T6)} s`, `${p3(1.0 / (FL.r1 ** 2 * FL.v1))} s`], answer: 2,
      why: `${eq(String.raw`Q = Av = \pi(${f(FL.r1, 2)})^2 \times ${f(FL.v1, 1)} = ${f(FL.Q, 4)}\ \text{m}^3\text{/s}`)}${eq(String.raw`t = \frac{V}{Q} = \frac{1.000\ \text{m}^3}{${f(FL.Q, 4)}\ \text{m}^3\text{/s}} = ${p3(T6)}\ \text{s}`)}<p>1000 L is 1 m³. Using the 60 cm diameter as the radius gives an area four times too big.</p>` },
  ],
  7: [
    { q: `In the page’s pipe the water moves at ${f(B1.v, 1)} m/s with gauge pressure ${kPa(B1.P, 0)} in the wide part and speeds up to ${f(B2.v, 1)} m/s in the narrow part at the same height. The gauge pressure there is`,
      choices: [`${kPa(B1.P + (B2.P - B1.P) * -1, 0)}`, `${kPa(B1.P, 0)}`, `${kPa(B1.P * B1.v / B2.v, 1)}`, `${kPa(B2.P, 0)}`], answer: 3,
      why: `${eq(String.raw`P_2 = P_1 + \tfrac12\rho(v_1^2 - v_2^2) = \text{${kPa(B1.P, 0)}} + \tfrac12 \times ${RHO} \times (${f(B1.v, 0)}^2 - ${f(B2.v, 0)}^2) = \text{${kPa(B2.P, 0)}}`)}<p>Fast flow, low pressure. ${kPa(B1.P + (B2.P - B1.P) * -1, 0)} has the sign flipped: the water speeds up because the pressure behind it is higher.</p>` },
    { q: `Back to ${f(B3.v, 1)} m/s, the pipe then climbs ${f(BE.H, 1)} m. The gauge pressure in the high, wide part is`,
      choices: [`${kPa(B1.P + RHO * G * BE.H)}`, `${kPa(B3.P)}`, `${kPa(B1.P)}`, `${kPa(B1.P - 2 * RHO * G * BE.H)}`], answer: 1,
      why: `<p>Same speed as point 1, so the ½ρv² terms cancel:</p>${eq(String.raw`P_3 = P_1 - \rho g\,\Delta y = \text{${kPa(B1.P, 0)}} - ${RHO} \times ${f(G)} \times ${f(BE.H, 1)} = \text{${kPa(B3.P)}}`)}<p>Raising the water costs pressure, just as diving deeper adds it.</p>` },
  ],
  8: [
    { q: 'The water level above the hole is raised to four times its height. The jet leaves the hole',
      choices: ['at the same speed', `√2 times as fast`, 'twice as fast', 'four times as fast'], answer: 2,
      why: `<p>${tex.inline(String.raw`v = \sqrt{2gh}`)}: four times <i>h</i> gives ${tex.inline(String.raw`\sqrt{4}`)} = 2 times the speed, the same as a stone dropped from four times the height.</p>` },
    { q: `The hole is ${f(TK.yh, 2)} m above the floor. When the water is ${f(H8, 2)} m above the hole, how far from the tank does the jet land?`,
      choices: [`${p3(Math.sqrt(H8 * TK.yh))} m`, `${p3(X8)} m`, `${p3(M.jetRange(TK.h0))} m`, `${p3(Math.sqrt(2 * H8 * TK.yh))} m`], answer: 1,
      why: `${eq(String.raw`v = \sqrt{2 \times ${f(G)} \times ${f(H8, 2)}} = ${f(M.torricelli(H8))}\ \text{m/s},\quad t = \sqrt{\frac{2 \times ${f(TK.yh, 2)}}{${f(G)}}} = ${f(M.jetFlight, 3)}\ \text{s}`)}${eq(String.raw`x = vt = 2\sqrt{h\,y_\text{hole}} = ${p3(X8)}\ \text{m}`)}<p>${p3(M.jetRange(TK.h0))} m is the range with the tank full (${f(TK.h0, 1)} m), not now.</p>` },
  ],
};
