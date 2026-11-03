// Analyzing functions: what f′ and f″ say about f. Pure functions; every number on the pages comes from here.

// ---------- the chapter's function: f(x) = x³ − 6x² + 9x + 1 ----------
export const FA = -6, FB = 9, FD = 1;
export const f = x => x ** 3 + FA * x * x + FB * x + FD;
export const df = x => 3 * x * x + 2 * FA * x + FB;          // 3(x − 1)(x − 3)
export const d2f = x => 6 * x + 2 * FA;                       // 6x − 12
const root = (a, b, c, s) => (-b + s * Math.sqrt(b * b - 4 * a * c)) / (2 * a);
export const C1 = root(3, 2 * FA, FB, -1), C2 = root(3, 2 * FA, FB, 1);   // critical points: 1 and 3
export const XI = -FA / 3;                                    // inflection point: 2
export const MAX = [C1, f(C1)], MIN = [C2, f(C2)], INFL = [XI, f(XI)];   // (1, 5), (3, 1), (2, 3)

// ---------- 5.1 the Mean Value Theorem on [0, 4]; Rolle's theorem on [0, 3] ----------
export const MA = 0, MB = 4;
export const MS = (f(MB) - f(MA)) / (MB - MA);                // secant slope: 1
export const MC = [root(3, 2 * FA, FB - MS, -1), root(3, 2 * FA, FB - MS, 1)];   // f′(c) = 1: 2 ∓ 2/√3
export const RA = 0, RB = 3;                                  // f(0) = f(3) = 1

// ---------- 5.2 the Extreme Value Theorem on [0.5, 3.5] ----------
export const EA = 0.5, EB = 3.5;
export const ECAND = [EA, C1, C2, EB].map(x => [x, f(x)]);   // 4.125, 5, 1, 1.875

// ---------- 5.4 the first derivative test: g(x) = (x⁴ − 4x³)/9 ----------
export const GK = 9;
export const g = x => (x ** 4 - 4 * x ** 3) / GK;
export const dg = x => 4 * x * x * (x - 3) / GK;              // zero at 0 (double) and 3
export const d2g = x => (12 * x * x - 24 * x) / GK;
export const G0 = 0, G3 = 3;

// ---------- 5.5 the candidates test: h(x) = x − 2 sin x on [0, π] ----------
export const h = x => x - 2 * Math.sin(x);
export const dh = x => 1 - 2 * Math.cos(x);
export const HA = 0, HB = Math.PI, HC = Math.acos(0.5);       // h′ = 0 at π/3
export const HCAND = [HA, HC, HB].map(x => [x, h(x)]);         // 0, π/3 − √3, π

// ---------- 5.9 a function known only through its derivative: p′(x) = x(x − 3)²/4, p(0) = 1 ----------
export const P0 = 1;
export const dp = x => x * (x - 3) ** 2 / 4;
export const d2p = x => 3 * (x - 1) * (x - 3) / 4;
export const p = x => x ** 4 / 16 - x ** 3 / 2 + 9 * x * x / 8 + P0;
export const PX0 = -0.75, PX1 = 4.5;

// ---------- 5.10 a field fenced on three sides along a river: 120 m of fence ----------
export const FENCE = 120;
export const area = x => x * (FENCE - 2 * x);                 // x: the two sides that meet the river
export const darea = x => FENCE - 4 * x;
export const FX = FENCE / 4, FAREA = area(FX);                 // 30 m, 1800 m²

// ---------- 5.11 an open box from a 30 cm square sheet ----------
export const SHEET = 30;
export const vol = x => x * (SHEET - 2 * x) ** 2;
export const dvol = x => (SHEET - 2 * x) * (SHEET - 6 * x);
export const BX = SHEET / 6, BVOL = vol(BX);                   // 5 cm, 2000 cm³

// ---------- 5.12 an implicit curve: x² − xy + y² = 3 ----------
export const K = 3;
export const F = (x, y) => x * x - x * y + y * y;
export const slope = (x, y) => (y - 2 * x) / (2 * y - x);      // dy/dx; horizontal where y = 2x, vertical where x = 2y
export const ICURVE = th => { const r = Math.sqrt(K / (1 - Math.sin(th) * Math.cos(th))); return [r * Math.cos(th), r * Math.sin(th)]; };
export const HTOP = [1, 2], HBOT = [-1, -2], VR = [2, 1], VL = [-2, -1];
export const d2yTop = (() => { const [x, y] = HTOP, yp = slope(x, y); return ((yp - 2) * (2 * y - x) - (y - 2 * x) * (2 * yp - 1)) / (2 * y - x) ** 2; })();   // −2/3

// ---------- motion: one clock, a gentle sweep per scene ----------
export const SLOW = 0.5;
// between a and b and back, period T seconds of clock
export const sweep = (c, a, b, T = 12, ph = 0) => a + (b - a) * (0.5 - 0.5 * Math.cos(2 * Math.PI * c / T + ph));
export const stackX = c => sweep(c, -0.1, 4.1, 14);
export const mvtX = c => sweep(c, MA, MB, 12);
export const evtY = c => 6.4 - 6 * ((c / 10) % 1);             // a level line falling from y = 6.4 to 0.4
export const incX = c => sweep(c, -0.1, 4.1, 14);
export const fdtX = c => sweep(c, -1, 4.2, 14);
export const candX = c => sweep(c, HA, HB, 10);
export const concX = c => sweep(c, 0.4, 3.7, 12);
export const sdtX = c => sweep(c, 0.3, 3.7, 12);
export const readX = c => PX0 + (PX1 - PX0) * Math.min(((c / 10) % 1) * 1.15, 1);   // trace, then hold a moment
export const fenceX = c => sweep(c, 8, 52, 12);
export const boxX = c => sweep(c, 1.2, 12, 12, 1.27);
export const implTh = c => (c / 14) * 2 * Math.PI;
