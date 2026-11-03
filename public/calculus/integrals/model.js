// Integration model: every function drawn, every area and every number on the pages comes from here.
// Time is one clock c (seconds); each scene reads its own phase from it.

// ---------- clock helpers ----------
// a run of `run` seconds, then a rest of `rest`: u climbs 0 → 1 and holds
export function sweep(c, run, rest = 1) { const k = c % (run + rest); return Math.min(k / run, 1); }
const ease = u => u * u * (3 - 2 * u);
// a smooth there-and-back over `period` seconds: 0 → 1 → 0
export const bob = (c, period) => 0.5 - 0.5 * Math.cos(2 * Math.PI * c / period);

// Simpson's rule, for the readouts of things with no tidy antiderivative
export function simpson(f, a, b, n = 400) {
  const h = (b - a) / n; let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}

// ---------- 6.1 a velocity that changes sign: v(t) = t(4 − t) m/s for 0 ≤ t ≤ 5 ----------
export const V1 = { T: 5, root: 4 };
export const v1 = t => t * (4 - t);
export const X1 = t => 2 * t * t - t ** 3 / 3;            // its antiderivative: position from 0
export const FWD1 = X1(4) - X1(0), BACK1 = X1(4) - X1(5);  // 32/3 forward, 7/3 back
export const DISP1 = X1(5), DIST1 = FWD1 + BACK1;           // 25/3 and 13
export const flowT = c => V1.T * ease(sweep(c, 6, 1.2));    // the sweep through 0 ≤ t ≤ 5

// ---------- 6.2–6.3 Riemann sums under f(x) = 1 + x²/4 on [0, 4] ----------
export const R = { a: 0, b: 4 };
export const fR = x => 1 + x * x / 4;
export const FR = x => x + x ** 3 / 12;
export const EXACT = FR(R.b) - FR(R.a);                     // 28/3
export const KINDS = ['left', 'right', 'midpoint', 'trapezoid'];
// the pieces of a sum with n equal widths: [xa, xb, height at xa, height at xb] (rectangles have the two equal)
export function pieces(kind, n, f = fR, a = R.a, b = R.b) {
  const dx = (b - a) / n;
  return Array.from({ length: n }, (_, i) => {
    const xa = a + i * dx, xb = xa + dx;
    const h = kind === 'left' ? f(xa) : kind === 'right' ? f(xb) : kind === 'midpoint' ? f((xa + xb) / 2) : null;
    return h === null ? [xa, xb, f(xa), f(xb)] : [xa, xb, h, h];
  });
}
export const sum = (kind, n, f, a, b) => pieces(kind, n, f, a, b).reduce((s, [xa, xb, ha, hb]) => s + (xb - xa) * (ha + hb) / 2, 0);
// 6.2: the four kinds in turn with n = 4; 6.3 and the opener: right sums, n = 2, 4, …, 64
export const N2 = 4, CYC = 2.4;
export const kindAt = c => KINDS[Math.floor(c / CYC) % 4];
export const NS = [2, 4, 8, 16, 32, 64], REF = 1.4;
export const N0 = 8;                                        // the opener holds one picture
export const nAt = c => NS[Math.floor(c / REF) % NS.length];
// a table with unequal widths: water flowing in, R(t) litres per minute
export const TABLE = { t: [0, 2, 5, 9, 10], r: [4, 7, 9, 6, 5] };
export const tableSum = kind => TABLE.t.slice(1).reduce((s, tb, i) => {
  const w = tb - TABLE.t[i], [ra, rb] = [TABLE.r[i], TABLE.r[i + 1]];
  return s + w * (kind === 'left' ? ra : kind === 'right' ? rb : (ra + rb) / 2);
}, 0);

// ---------- 6.4–6.6 a graph of f made of a semicircle and two segments, on [−2, 6] ----------
// f = √(4 − x²) on [−2, 2]; the segment (2, 0) to (4, −2); the segment (4, −2) to (6, 0)
export const S = { a: -2, b: 6 };
export const fS = x => x <= 2 ? Math.sqrt(Math.max(4 - x * x, 0)) : x <= 4 ? -(x - 2) : x - 6;
// g(x) = ∫ from −2 to x of f(t) dt, by geometry: a slice of the disc, then triangles
export const gS = x => x <= 2 ? x * Math.sqrt(Math.max(4 - x * x, 0)) / 2 + 2 * Math.asin(Math.max(-1, Math.min(1, x / 2))) + Math.PI
  : x <= 4 ? 2 * Math.PI - (x - 2) ** 2 / 2 : 2 * Math.PI - 4 + (x - 6) ** 2 / 2;
export const intS = (a, b) => gS(b) - gS(a);
export const accX = c => S.a + (S.b - S.a) * ease(sweep(c, 7, 1.2));
// the chain-rule example: h(x) = ∫ from −2 to x² of f, so h′(1) = f(1)·2
export const H1 = fS(1) * 2;
// 6.6: c slides across [−2, 6] and back
export const propC = c => S.a + 0.2 + (S.b - S.a - 0.4) * ease(bob(c, 9));
export const SCALED = 3 * intS(S.a, S.b) + (S.b - S.a);    // ∫(3f + 1)

// ---------- 6.7 FTC: f(x) = x², F(x) = x³/3 + C, from a = 1 to b ----------
export const T7 = { a: 1, b: 2, F1: 5 };
export const f7 = x => x * x, F7 = x => x ** 3 / 3;
export const FTC7 = F7(T7.b) - F7(T7.a);                     // 7/3
export const ftcB = c => T7.a + (T7.b - T7.a) * ease(sweep(c, 4, 1.4));
export const ftcC = c => 1.2 * Math.sin(2 * Math.PI * c / 7);  // the constant bobs; the rise does not change

// ---------- 6.8 the family x³/3 − x + C, antiderivatives of x² − 1 ----------
export const f8 = x => x * x - 1, F8 = x => x ** 3 / 3 - x;
export const CS8 = [-2, -1, 0, 1, 2], C8 = 1;                // F(0) = 1 picks C = 1
export const famX = c => -1.8 + 3.6 * bob(c, 8);

// ---------- 6.9 substitution: ∫ 2x cos(x²) dx from 0 to √(π/2), u = x² ----------
export const XB9 = Math.sqrt(Math.PI / 2), UB9 = Math.PI / 2;
export const h9 = x => 2 * x * Math.cos(x * x), g9 = Math.cos;
export const subX = c => XB9 * ease(sweep(c, 5, 1.4));
export const DX9 = 0.07;                                    // the strip drawn at x; its image at u is 2x·dx wide

// ---------- 6.10 long division and completing the square ----------
// (x² + 2x + 2)/(x + 1) = (x + 1) + 1/(x + 1) on [0, 2]
export const D10 = { a: 0, b: 2 };
export const q10 = x => x + 1, r10 = x => 1 / (x + 1), f10 = x => q10(x) + r10(x);
export const DIV10 = (D10.b ** 2 / 2 + D10.b) + Math.log(D10.b + 1);   // 4 + ln 3
// 4/(x² + 2x + 5) = 4/((x + 1)² + 4) on [−1, 1]: 2 arctan((x + 1)/2)
export const SQ10 = { a: -1, b: 1 };
export const s10 = x => 4 / (x * x + 2 * x + 5);
export const SQV10 = 2 * Math.atan((SQ10.b + 1) / 2) - 2 * Math.atan((SQ10.a + 1) / 2);   // π/2
export const lift10 = c => bob(c, 6);                       // the remainder layer lifts off and settles back
export const shift10 = c => ease(bob(c, 6));                // 4/(x² + 4) slides left by 1

// ---------- 6.11 parts: ∫ x eˣ dx from 0 to 1, drawn as u = x, v = eˣ ----------
export const partsS = c => ease(sweep(c, 5, 1.4));          // the upper limit, 0 → 1
export const vdu = s => Math.exp(s) - 1;                    // ∫ eˣ dx from 0 to s (under the curve)
export const udv = s => s * Math.exp(s) - Math.exp(s) + 1;  // ∫ x eˣ dx from 0 to s (beside it)

// ---------- 6.12 partial fractions: 3/(x(x + 3)) = 1/x − 1/(x + 3), from 1 to 3 ----------
export const P12 = { a: 1, b: 3 };
export const f12 = x => 3 / (x * (x + 3)), pA12 = x => 1 / x, pB12 = x => -1 / (x + 3);
export const PF12 = Math.log(P12.b / (P12.b + 3)) - Math.log(P12.a / (P12.a + 3));   // ln 2
export const pfX = c => 0.6 + 3.6 * bob(c, 8);

// ---------- 6.13 improper: 1/x² and 1/x from 1 to b ----------
export const B13 = 8;
export const area2 = b => 1 - 1 / b, area1 = b => Math.log(b);
export const impB = c => 1 + (B13 - 1) * ease(sweep(c, 6, 1.4));

// ---------- 6.14 choosing: six integrands on [0, 3], one at a time ----------
export const PICK = [
  { tex: String.raw`\sqrt{x}`, how: 'power rule', f: x => Math.sqrt(x), F: x => 2 / 3 * x ** 1.5, anti: String.raw`\tfrac23 x^{3/2}` },
  { tex: String.raw`\frac{2x}{x^2+1}`, how: 'substitution, u = x² + 1', f: x => 2 * x / (x * x + 1), F: x => Math.log(x * x + 1), anti: String.raw`\ln(x^2+1)` },
  { tex: String.raw`\frac{x^2+1}{x+1}`, how: 'long division', f: x => (x * x + 1) / (x + 1), F: x => x * x / 2 - x + 2 * Math.log(x + 1), anti: String.raw`\tfrac{x^2}{2} - x + 2\ln(x+1)` },
  { tex: String.raw`\frac{4}{x^2-2x+5}`, how: 'complete the square', f: x => 4 / (x * x - 2 * x + 5), F: x => 2 * Math.atan((x - 1) / 2), anti: String.raw`2\arctan\tfrac{x-1}{2}` },
  { tex: String.raw`x\sin x`, how: 'parts (BC)', f: x => x * Math.sin(x), F: x => Math.sin(x) - x * Math.cos(x), anti: String.raw`\sin x - x\cos x` },
  { tex: String.raw`\frac{3}{(x+1)(x+3)}`, how: 'partial fractions (BC)', f: x => 3 / ((x + 1) * (x + 3)), F: x => 1.5 * Math.log((x + 1) / (x + 3)), anti: String.raw`\tfrac32\ln\tfrac{x+1}{x+3}` },
].map(p => ({ ...p, val: p.F(3) - p.F(0) }));
export const PK = { a: 0, b: 3, hold: 2.6, morph: 0.9 };
// which integrand is shown, and how far into the morph to the next one
export function pickAt(c) {
  const per = PK.hold + PK.morph, k = Math.floor(c / per), u = (c % per) - PK.hold;
  return { i: k % PICK.length, j: (k + 1) % PICK.length, m: u > 0 ? ease(u / PK.morph) : 0 };
}
