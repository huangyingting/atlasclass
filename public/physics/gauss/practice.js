// gauss/practice.js — AP Physics C style practice, one or two questions per page (keys are page indices, as in PAGES).
// Every number is computed here; a quantitative item keeps its choices' numbers in `nums` (in the units shown),
// and checks.mjs recomputes the keyed one by another route.
import * as M from './model.js';
import { tex } from '../engine/tex.js';

const p = (x, d) => x.toFixed(d);
const g = (x, n = 3) => x.toPrecision(n);
const K = M.K, E0 = M.EPS0, PI = Math.PI;

// ---- page 0: the page's square at 60°; a field that grows across a square ----
const P0 = { th: 60 };
P0.F = M.flux(P0.th);
P0.nums = [M.FLUX.E * M.FLUX.A * Math.sin(P0.th * PI / 180), P0.F, M.FLUX.max, M.FLUX.E * M.FLUX.side * Math.cos(P0.th * PI / 180)];   // sin · right · face on · side not area
const P0b = { b: 3.0e4, s: 0.20 };
P0b.F = P0b.b * P0b.s ** 3 / 2;
P0b.nums = [P0b.b * P0b.s ** 3, P0b.b * P0b.s ** 3 / 3, P0b.b * P0b.s ** 2 / 2, P0b.F];   // E at the far edge × A · ∫y² · lost an s · right
// ---- page 1: a cube around the page's charge; E = c r inside a sphere ----
const P1 = { q: M.POINT.q };
P1.nums = [P1.q / (6 * E0), P1.q / E0, K * P1.q, P1.q / (2 * E0)];
const P1b = { c: 5.0e4, R: 0.10 };
P1b.q = 4 * PI * E0 * P1b.c * P1b.R ** 3;
P1b.nums = [E0 * P1b.c * P1b.R ** 3, 4 * PI * E0 * P1b.c * P1b.R ** 2, 4 / 3 * PI * E0 * P1b.c * P1b.R ** 3, P1b.q].map(q => q * 1e9);   // no 4π · lost an R · volume, not area · right
// ---- page 2: the page's line, at 5 cm; potential difference out to 20 cm ----
const lam = M.LINE.lam;
const P2 = { r: 0.05 };
P2.nums = [K * lam / P2.r, M.lineE(P2.r), 2 * K * lam / P2.r ** 2, lam / (2 * E0 * P2.r)];   // lost 2 · right · 1/r² · lost π
const P2b = { r1: 0.05, r2: 0.20 };
P2b.dV = 2 * K * lam * Math.log(P2b.r2 / P2b.r1);
P2b.nums = [2 * K * lam * (1 / P2b.r1 - 1 / P2b.r2), M.lineE(P2b.r1) * (P2b.r2 - P2b.r1), P2b.dV, M.lineE(P2b.r2) * (P2b.r2 - P2b.r1)];
// ---- page 3: two sheets ±σ; a slab with ρ = ρ₀|x|/d ----
const sg = M.SHEET.sigma;
const P3 = { nums: [sg / E0, sg / (2 * E0), 0, 2 * sg / E0] };      // field between the sheets, per choice
const P3b = { rho0: 4.0e-7, d: 0.05, x: 0.02 };
P3b.E = P3b.rho0 * P3b.x ** 2 / (2 * E0 * P3b.d);
P3b.nums = [2 * P3b.E, P3b.E, P3b.rho0 * P3b.x / (2 * E0), P3b.E / 2];   // one cap · right · ρ₀ uniform · lost a 2
// ---- page 4: field energy outside the page's metal sphere ----
const { Q, R } = M.SPH;
const P4 = { U: K * Q * Q / (2 * R) };
P4.nums = [2 * P4.U, P4.U / 2, P4.U / 3, P4.U].map(u => u * 1e6);   // kQ²/R · only out to 2R · surface density × sphere's volume · right
// ---- page 5: the page's insulating sphere at R/2 ----
const P5 = { r: R / 2 };
P5.E = M.iSphere.E(P5.r);
P5.nums = [K * Q / P5.r ** 2, P5.E, 0, 3 * P5.E];
// ---- page 6: the page's insulating rod at R/2 ----
const P6 = { r: M.ROD.R / 2 };
P6.E = M.iRod.E(P6.r);
P6.nums = [0, 2 * K * M.ROD.lam / P6.r, P6.E, M.ROD.lam * P6.r / (2 * E0 * M.ROD.R ** 2)];   // metal · outside formula · right · lost π
// ---- page 7: the page's ρ = br sphere at R/2; ρ = br² ----
const P7 = { r: R / 2 };
P7.E = M.nSphere.E(P7.r);
P7.nums = [M.nSphere.rho(P7.r) * P7.r / (3 * E0), M.iSphere.E(P7.r), P7.E, 4 * P7.E];   // local ρ as if uniform · uniform sphere · right · lost the 4
const P7b = { nums: [1 / 8, 1 / 32, 1 / 16, 1 / 4] };
// ---- page 8: the induced charge on the cage's right half ----
const P8 = { q: 3 * E0 * M.CAGE.E0 * PI * M.CAGE.R ** 2 };
P8.nums = [0, P8.q, 2 * P8.q, P8.q / 3].map(q => q * 1e9);   // net zero · right · σ_max × area · lost the 3

const fr = x => ({ 0.125: '1/8', 0.03125: '1/32', 0.0625: '1/16', 0.25: '1/4' })[x];

export const PRACTICE = {
  0: [
    { q: `The page’s ${p(M.FLUX.side * 100, 0)} cm square sits in the uniform ${p(M.FLUX.E / 1000, 1)} kN/C field, its area vector at ${P0.th}° to <b>E</b>. The flux through it is`,
      choices: P0.nums.map(x => `${p(x, 1)} N·m²/C`), answer: 1, nums: P0.nums,
      why: `<div class="eq">${tex(String.raw`\Phi = EA\cos\theta = ${M.FLUX.E} \times ${p(M.FLUX.A, 3)}\ \text{m}^2 \times \cos ${P0.th}^\circ = ${p(P0.F, 1)}\ \text{N}\cdot\text{m}^2\text{/C}`)}</div><p>θ is measured from the <b>area vector</b> (the normal), so it is cos, not sin; sin would be right only if θ were the angle to the surface itself.</p>` },
    { q: `A field <b>E</b> = <i>by</i> <b>x̂</b>, <i>b</i> = ${p(P0b.b / 1e4, 1)} × 10<sup>4</sup> N/C per m, crosses a ${p(P0b.s * 100, 0)} cm square in the <i>yz</i> plane, 0 ≤ <i>y</i> ≤ ${p(P0b.s, 2)} m. The flux through the square (normal +<b>x̂</b>) is`,
      choices: P0b.nums.map(x => `${g(x)} N·m²/C`), answer: 3, nums: P0b.nums,
      why: `<p><i>E</i> changes across the square, so cut it into strips of width d<i>y</i> and length <i>s</i>, each with flux <i>E</i>(<i>y</i>) <i>s</i> d<i>y</i>:</p><div class="eq">${tex(String.raw`\Phi = \int_0^s by \cdot s\,dy = \frac{bs^3}{2} = ${g(P0b.F)}\ \text{N}\cdot\text{m}^2\text{/C}`)}</div><p>Using the field at the far edge for the whole square gives twice this, ${g(P0b.nums[0])}.</p>` },
  ],
  1: [
    { q: `The page’s ${p(P1.q * 1e9, 1)} nC charge sits at the centre of a cube. The flux through <b>one</b> face of the cube is`,
      choices: P1.nums.map(x => `${p(x, 1)} N·m²/C`), answer: 0, nums: P1.nums,
      why: `<p>Gauss: the whole cube carries ${tex.inline(String.raw`q/\varepsilon_0`)} = ${p(P1.nums[1], 0)} N·m²/C. By symmetry each of the six faces gets the same share:</p><div class="eq">${tex(String.raw`\Phi_\text{face} = \frac{q}{6\varepsilon_0} = ${p(P1.nums[0], 1)}\ \text{N}\cdot\text{m}^2\text{/C}`)}</div><p><i>kq</i> = ${p(P1.nums[2], 2)} has units of N·m²/C too, but it is ${tex.inline(String.raw`q/4\pi\varepsilon_0`)}, not a flux through anything.</p>` },
    { q: `In some region the field is radial with <i>E</i> = <i>cr</i>, <i>c</i> = ${p(P1b.c / 1e4, 1)} × 10<sup>4</sup> N/C per m. How much charge is inside a sphere of radius ${p(P1b.R * 100, 0)} cm centred on the origin?`,
      choices: P1b.nums.map(x => `${g(x)} nC`), answer: 3, nums: P1b.nums,
      why: `<p>On the sphere <b>E</b> ∥ d<b>A</b> and <i>E</i> = <i>cR</i> everywhere, so</p><div class="eq">${tex(String.raw`\oint \vec{E}\cdot d\vec{A} = cR \cdot 4\pi R^2 = \frac{q_\text{enc}}{\varepsilon_0} \quad\Rightarrow\quad q_\text{enc} = 4\pi\varepsilon_0 cR^3 = ${g(P1b.q * 1e9)}\ \text{nC}`)}</div><p>The surface is 4π<i>R</i>², not ⁴⁄₃π<i>R</i>³: the flux is an area integral.</p>` },
  ],
  2: [
    { q: `The page’s line carries λ = ${p(lam * 1e9, 1)} nC/m. The field ${p(P2.r * 100, 0)} cm from it is`,
      choices: P2.nums.map(x => `${p(x, 0)} N/C`), answer: 1, nums: P2.nums,
      why: `<p>A coaxial cylinder: no flux through the caps, ${tex.inline(String.raw`E \cdot 2\pi rL = \lambda L/\varepsilon_0`)}, so</p><div class="eq">${tex(String.raw`E = \frac{\lambda}{2\pi\varepsilon_0 r} = \frac{2k\lambda}{r} = ${p(P2.nums[1], 0)}\ \text{N/C}`)}</div><p>A line’s field falls as ${tex.inline(String.raw`1/r`)}, not ${tex.inline(String.raw`1/r^2`)} (${p(P2.nums[2], 0)} N/C).</p>` },
    { q: `How much higher is the potential ${p(P2b.r1 * 100, 0)} cm from that line than ${p(P2b.r2 * 100, 0)} cm from it?`,
      choices: P2b.nums.map(x => `${p(x, 1)} V`), answer: 2, nums: P2b.nums,
      why: `<div class="eq">${tex(String.raw`V(r_1) - V(r_2) = \int_{r_1}^{r_2} \frac{2k\lambda}{r}\,dr = 2k\lambda\ln\frac{r_2}{r_1} = ${p(2 * K * lam, 2)} \times \ln ${p(P2b.r2 / P2b.r1, 0)} = ${p(P2b.dV, 1)}\ \text{V}`)}</div><p>${tex.inline(String.raw`1/r`)} integrates to a logarithm. The point-charge habit, ${tex.inline(String.raw`1/r_1 - 1/r_2`)}, gives ${p(P2b.nums[0], 1)} V; <i>E</i> × distance with the near field, ${p(P2b.nums[1], 1)} V, ignores that <i>E</i> falls.</p>` },
  ],
  3: [
    { q: `Two large parallel non-conducting sheets carry +σ and −σ, σ = ${p(sg * 1e9, 1)} nC/m². The field is`,
      choices: [`${p(P3.nums[0], 0)} N/C between them, 0 outside`, `${p(P3.nums[1], 0)} N/C between them and outside`, `0 between them, ${p(P3.nums[0], 0)} N/C outside`, `${p(P3.nums[3], 0)} N/C between them, 0 outside`], answer: 0, nums: P3.nums,
      why: `<p>Each sheet alone gives ${tex.inline(String.raw`\sigma/2\varepsilon_0`)} = ${p(P3.nums[1], 0)} N/C on both sides, away from + and toward −. Between the sheets the two point the same way and add; outside they point opposite ways and cancel:</p><div class="eq">${tex(String.raw`E = \frac{\sigma}{2\varepsilon_0} + \frac{\sigma}{2\varepsilon_0} = \frac{\sigma}{\varepsilon_0} = ${p(P3.nums[0], 0)}\ \text{N/C between}`)}</div>` },
    { q: `A thick non-conducting slab fills −<i>d</i> ≤ <i>x</i> ≤ <i>d</i> (<i>d</i> = ${p(P3b.d * 100, 0)} cm) with ${tex.inline(String.raw`\rho = \rho_0|x|/d`)}, ρ<sub>0</sub> = ${p(P3b.rho0 * 1e7, 1)} × 10<sup>−7</sup> C/m³. The field at <i>x</i> = ${p(P3b.x * 100, 0)} cm is`,
      choices: P3b.nums.map(x => `${g(x)} N/C`), answer: 1, nums: P3b.nums,
      why: `<p>Use a pillbox of cap area <i>A</i> from −<i>x</i> to <i>x</i>. By symmetry the field leaves through <b>both</b> caps:</p><div class="eq">${tex(String.raw`2EA = \frac{1}{\varepsilon_0} \cdot 2A\int_0^x \frac{\rho_0 x'}{d}\,dx' = \frac{A\rho_0 x^2}{\varepsilon_0 d} \quad\Rightarrow\quad E = \frac{\rho_0 x^2}{2\varepsilon_0 d} = ${g(P3b.E)}\ \text{N/C}`)}</div><p>Counting only one cap doubles it (${g(P3b.nums[0])} N/C).</p>` },
  ],
  4: [
    { q: 'A metal sphere with charge +<i>Q</i> sits at the centre of a thick, concentric metal shell whose net charge is −3<i>Q</i>. The charge on the shell’s <b>outer</b> surface is',
      choices: ['−3<i>Q</i>', '−<i>Q</i>', '+<i>Q</i>', '−2<i>Q</i>'], answer: 3,
      why: '<p>A Gaussian sphere inside the shell’s metal has <i>E</i> = 0 on it, so it encloses zero charge: the inner surface must hold −<i>Q</i> to cancel the sphere’s +<i>Q</i>. The rest of the shell’s −3<i>Q</i> goes to the outer surface: −3<i>Q</i> − (−<i>Q</i>) = −2<i>Q</i>.</p>' },
    { q: `How much energy is stored in the field outside the page’s metal sphere (<i>Q</i> = ${p(Q * 1e9, 1)} nC, <i>R</i> = ${p(R * 100, 0)} cm)? (Energy density ${tex.inline(String.raw`\varepsilon_0E^2/2`)}.)`,
      choices: P4.nums.map(x => `${g(x)} μJ`), answer: 3, nums: P4.nums,
      why: `<p>Inside the metal <i>E</i> = 0. Outside, add shells of volume 4π<i>r</i>² d<i>r</i>:</p><div class="eq">${tex(String.raw`U = \int_R^\infty \frac{\varepsilon_0}{2}\left(\frac{kQ}{r^2}\right)^2 4\pi r^2\,dr = \frac{kQ^2}{2R} = ${g(P4.U * 1e6)}\ \mu\text{J}`)}</div><p>Stopping at 2<i>R</i> gives only half (${g(P4.nums[1])} μJ): the field far out still holds energy. The surface energy density times the sphere’s volume (${g(P4.nums[2])} μJ) puts the energy in the wrong place: there is none inside the metal.</p>` },
  ],
  5: [
    { q: `The page’s insulating sphere (<i>Q</i> = ${p(Q * 1e9, 1)} nC spread evenly, <i>R</i> = ${p(R * 100, 0)} cm). The field ${p(P5.r * 100, 0)} cm from its centre is`,
      choices: P5.nums.map(x => `${p(x, 0)} N/C`), answer: 1, nums: P5.nums,
      why: `<p>A Gaussian sphere of radius <i>r</i> holds ${tex.inline(String.raw`Q(r/R)^3 = Q/8`)}:</p><div class="eq">${tex(String.raw`E \cdot 4\pi r^2 = \frac{Q(r/R)^3}{\varepsilon_0} \quad\Rightarrow\quad E = \frac{kQr}{R^3} = ${p(P5.E, 0)}\ \text{N/C}`)}</div><p>Zero is the <i>metal</i> sphere; ${tex.inline(String.raw`kQ/r^2`)} counts charge that lies outside the Gaussian sphere.</p>` },
    { q: 'An insulating spherical shell has inner radius <i>a</i>, outer radius <i>b</i> and uniform charge density ρ. Find <i>E</i>(<i>r</i>) in all three regions.',
      solution: `<p>Spherical symmetry: on a Gaussian sphere of radius <i>r</i>, ${tex.inline(String.raw`E \cdot 4\pi r^2 = q_\text{enc}/\varepsilon_0`)}, with ${tex.inline(String.raw`q_\text{enc} = \int \rho\,4\pi r'^2\,dr'`)} over the charged part inside.</p><div class="eq">${tex(String.raw`r < a: \quad q_\text{enc} = 0, \quad E = 0`)}</div><div class="eq">${tex(String.raw`a < r < b: \quad q_\text{enc} = \int_a^r \rho\,4\pi r'^2\,dr' = \tfrac43\pi\rho(r^3 - a^3), \quad E = \frac{\rho(r^3 - a^3)}{3\varepsilon_0 r^2}`)}</div><div class="eq">${tex(String.raw`r > b: \quad E = \frac{\rho(b^3 - a^3)}{3\varepsilon_0 r^2} = \frac{kQ}{r^2}`)}</div><p>Check: at <i>r</i> = <i>a</i> the middle form is 0 and at <i>r</i> = <i>b</i> it meets the outside form, so <i>E</i> is continuous. With <i>a</i> = 0 it becomes the solid sphere’s ${tex.inline(String.raw`\rho r/3\varepsilon_0`)}.</p>` },
  ],
  6: [
    { q: `The page’s insulating rod (λ = ${p(M.ROD.lam * 1e9, 1)} nC/m spread evenly, <i>R</i> = ${p(M.ROD.R * 100, 0)} cm). The field ${p(P6.r * 100, 1)} cm from its axis is`,
      choices: P6.nums.map(x => `${p(x, 0)} N/C`), answer: 2, nums: P6.nums,
      why: `<p>A coaxial cylinder of radius <i>r</i>, length <i>L</i> holds ${tex.inline(String.raw`\lambda L(r/R)^2`)}:</p><div class="eq">${tex(String.raw`E \cdot 2\pi rL = \frac{\lambda L r^2}{R^2\varepsilon_0} \quad\Rightarrow\quad E = \frac{2k\lambda r}{R^2} = ${p(P6.E, 0)}\ \text{N/C}`)}</div><p>${tex.inline(String.raw`2k\lambda/r`)} (${p(P6.nums[1], 0)} N/C) holds only outside, where all of λ is enclosed; 0 is the metal rod.</p>` },
    { q: `A long insulating cylinder of radius <i>R</i> has ${tex.inline(String.raw`\rho = \rho_0r/R`)}. Inside it (<i>r</i> &lt; <i>R</i>) the field is`,
      choices: [tex.inline(String.raw`\rho_0r/2\varepsilon_0`), tex.inline(String.raw`\rho_0r^2/3\varepsilon_0R`), tex.inline(String.raw`\rho_0r^2/2\varepsilon_0R`), tex.inline(String.raw`\rho_0r^3/3\varepsilon_0R^2`)], answer: 1,
      why: `<p>Add thin cylindrical shells, each of volume 2π<i>r</i>′<i>L</i> d<i>r</i>′:</p><div class="eq">${tex(String.raw`q_\text{enc} = \int_0^r \frac{\rho_0 r'}{R}\,2\pi r' L\,dr' = \frac{2\pi\rho_0 L r^3}{3R}`)}</div><div class="eq">${tex(String.raw`E \cdot 2\pi rL = \frac{q_\text{enc}}{\varepsilon_0} \quad\Rightarrow\quad E = \frac{\rho_0 r^2}{3\varepsilon_0 R}`)}</div><p>${tex.inline(String.raw`\rho_0r^2/2\varepsilon_0R`)} puts the local ρ(<i>r</i>) into the uniform-rod result instead of integrating.</p>` },
  ],
  7: [
    { q: `The page’s sphere has ρ = <i>br</i> (<i>Q</i> = ${p(Q * 1e9, 1)} nC, <i>R</i> = ${p(R * 100, 0)} cm, <i>b</i> = ${p(M.SPH.b * 1e6, 2)} μC/m⁴). The field ${p(P7.r * 100, 0)} cm from the centre is`,
      choices: P7.nums.map(x => `${p(x, 0)} N/C`), answer: 2, nums: P7.nums,
      why: `<div class="eq">${tex(String.raw`q_\text{enc} = \int_0^r br'\,4\pi r'^2\,dr' = \pi b r^4, \quad E = \frac{\pi b r^4}{4\pi\varepsilon_0 r^2} = \frac{br^2}{4\varepsilon_0} = ${p(P7.E, 0)}\ \text{N/C}`)}</div><p>Only ${tex.inline(String.raw`Q/16`)} is inside ${tex.inline(String.raw`R/2`)}, since the charge crowds outward. The uniform sphere with the same <i>Q</i> gives ${p(P7.nums[1], 0)} N/C; plugging ρ(<i>r</i>) into ${tex.inline(String.raw`\rho r/3\varepsilon_0`)} gives ${p(P7.nums[0], 0)} N/C.</p>` },
    { q: `A sphere of radius <i>R</i> has ρ = <i>br</i>². What fraction of its total charge lies within ${tex.inline(String.raw`r = R/2`)}?`,
      choices: P7b.nums.map(fr), answer: 1, nums: P7b.nums,
      why: `<div class="eq">${tex(String.raw`q(r) = \int_0^r br'^2\,4\pi r'^2\,dr' = \tfrac45\pi b r^5 \quad\Rightarrow\quad \frac{q(R/2)}{q(R)} = \left(\tfrac12\right)^5 = \frac{1}{32}`)}</div><p>1/8 is the uniform sphere’s (½)³; 1/16 is ρ = <i>br</i>’s (½)⁴.</p>` },
  ],
  8: [
    { q: 'A point charge +<i>q</i> sits off-centre inside the hollow of a neutral, thick, spherical metal shell. Outside the shell, the field is',
      choices: ['zero', `${tex.inline(String.raw`kq/r^2`)}, with ${tex.inline(String.raw`r`)} measured from the charge`, `${tex.inline(String.raw`kq/r^2`)}, with ${tex.inline(String.raw`r`)} measured from the shell’s centre`, 'stronger on the side nearer the charge'], answer: 2,
      why: `<p>−<i>q</i> gathers on the inner surface, unevenly, so that the field in the metal is zero. That shields the outside from where the charge is. The +<i>q</i> left on the outer surface feels no field from inside, so it spreads evenly like charge on an isolated sphere. Outside, Gauss with a concentric sphere gives ${tex.inline(String.raw`kq/r^2`)} from the <b>shell’s</b> centre.</p>` },
    { q: `On the page’s uncharged shell (<i>R</i> = ${p(M.CAGE.R * 100, 0)} cm) in the ${p(M.CAGE.E0 / 1000, 1)} kN/C field, σ = 3ε<sub>0</sub><i>E</i><sub>0</sub> cos θ. The total charge on the downstream half (cos θ &gt; 0) is`,
      choices: P8.nums.map(x => `${x ? g(x) : '0'} nC`), answer: 1, nums: P8.nums,
      why: `<p>Rings of width <i>R</i> dθ have area 2π<i>R</i>² sin θ dθ:</p><div class="eq">${tex(String.raw`q = \int_0^{\pi/2} 3\varepsilon_0 E_0\cos\theta \cdot 2\pi R^2\sin\theta\,d\theta = 3\pi\varepsilon_0 E_0 R^2 = ${g(P8.q * 1e9)}\ \text{nC}`)}</div><p>The other half holds −${g(P8.q * 1e9)} nC, so the shell stays neutral; σ<sub>max</sub> × the half’s area (${g(P8.nums[2])} nC) ignores that σ falls to 0 at the rim.</p>` },
  ],
};
