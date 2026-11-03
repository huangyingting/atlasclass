// Composite, implicit and inverse functions: the model. Pure functions; every number on the pages and in the figure
// comes from here. Each scene runs on its own loop of the one clock.

export const SLOW = 1;
// a back-and-forth sweep between a and b, period T seconds, eased at the ends
export const sweep = (time, a, b, T) => a + (b - a) * (0.5 - 0.5 * Math.cos(2 * Math.PI * time / T));
export function loop(time, run, rest = 0.8) { const c = time % (run + rest); return { t: Math.min(c, run), resting: c > run }; }

// ---------- 3.1 gears: rates multiply ----------
// a compound gear train. The x gear drives a small u gear (du/dx = Nx/Nu); the u shaft carries a big gear that drives
// a small y gear (dy/du = Nu2/Ny). All teeth are the same size (module MOD), so a gear's radius is MOD·N/2.
export const GEAR = { Nx: 30, Nu: 10, Nu2: 20, Ny: 10, MOD: 0.1, rate: 0.06 };   // the x gear turns 0.06 turns a second
export const DU_DX = GEAR.Nx / GEAR.Nu;          // 3
export const DY_DU = GEAR.Nu2 / GEAR.Ny;         // 2
export const DY_DX = DU_DX * DY_DU;              // 6
export const turns = time => time * GEAR.rate;   // turns of the x gear so far

// ---------- 3.2 the chain rule on a graph: h(x) = sin(x²) ----------
export const g = x => x * x, gp = x => 2 * x;    // inner
export const f = u => Math.sin(u), fp = u => Math.cos(u);   // outer
export const h = x => f(g(x)), hp = x => fp(g(x)) * gp(x);
export const X0 = 1;                              // the worked example
export const CHAIN = { a: 0.25, b: 1.9, T: 14 };  // the sweep of x
export const chainX = time => sweep(time, CHAIN.a, CHAIN.b, CHAIN.T);

// ---------- 3.3 implicit: the circle x² + y² = R² ----------
export const R = 5;
export const P0 = [3, 4];                          // the worked point
export const circSlope = (x, y) => -x / y;         // dy/dx = −x/y
export const circY2 = (x, y) => -(R * R) / y ** 3; // d²y/dx² = −(x² + y²)/y³ = −R²/y³
export const CIRC = { T: 22 };                     // one lap, seconds
export const circAngle = time => Math.PI / 2 - 2 * Math.PI * time / CIRC.T + 0.35;   // clockwise from near the top

// ---------- 3.4 the folium x³ + y³ = 6xy ----------
export const FOL = { k: 6, T: 16 };                // x³ + y³ = k·xy
export const folF = (x, y) => x ** 3 + y ** 3 - FOL.k * x * y;
export const folAt = t => [FOL.k * t / (1 + t ** 3), FOL.k * t * t / (1 + t ** 3)];   // the loop, t = y/x ≥ 0
export const folSlope = (x, y) => (FOL.k * y - 3 * x * x) / (3 * y * y - FOL.k * x);   // (2y − x²)/(y² − 2x)
export const FOL_P = [3, 3];                       // on it: 27 + 27 = 54 = 6·9
export const FOL_H = [Math.cbrt(2 * FOL.k ** 3 / 27), Math.cbrt(2 * FOL.k ** 3 / 27) ** 2 / (FOL.k / 3)];   // horizontal tangent: 2y = x² there
export const FOL_V = [FOL_H[1], FOL_H[0]];         // vertical tangent: the mirror image
export const folTheta = time => sweep(time, 0.3, Math.PI / 2 - 0.3, FOL.T);         // the point's direction from the origin

// ---------- 3.5 inverse functions: f(x) = x³ + x ----------
export const inv = x => x ** 3 + x, invp = x => 3 * x * x + 1;
export const finv = y => { let x = Math.cbrt(y); for (let i = 0; i < 40; i++) x -= (inv(x) - y) / invp(x); return x; };   // Newton
export const IA = 1, IB = inv(IA);                 // (1, 2) on f, so (2, 1) on f⁻¹
export const INV = { run: 6, rest: 1.6 };          // the flip over y = x: run seconds out, run back
// the flip angle: rests on f, swings over to f⁻¹, rests, swings back
export function flip(time) {
  const P = 2 * (INV.run + INV.rest), c = time % P, e = u => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(Math.max(u, 0), 1));
  return Math.PI * (c < INV.run + INV.rest ? e((c - INV.rest) / INV.run) : 1 - e((c - INV.run - 2 * INV.rest) / INV.run));
}

// ---------- 3.6 inverse trig ----------
export const asin = Math.asin, asinp = x => 1 / Math.sqrt(1 - x * x);
export const atan = Math.atan, atanp = x => 1 / (1 + x * x);
export const TRIG = { a: 0.12, b: 0.94, T: 14 };
export const trigX = time => sweep(time, TRIG.b, TRIG.a, TRIG.T);   // starts at the right
export const TX = 0.6;                             // the worked example: arcsin, arctan at x = 0.6

// ---------- 3.7 selecting a procedure: q(x) = x/(x² + 1) ----------
export const q = x => x / (x * x + 1);
export const qp = x => (1 - x * x) / (x * x + 1) ** 2;
export const SEL = { a: -2.6, b: 2.6, T: 18 };
export const selX = time => sweep(time, SEL.a, SEL.b, SEL.T);
export const SX = 2;                               // the worked example

// ---------- 3.8 higher-order derivatives: s(x) = sin 2x ----------
export const W = 2;
export const sd = (n, x) => W ** n * Math.sin(W * x + n * Math.PI / 2);   // the nth derivative
export const HIGH = { a: 0.05, b: Math.PI - 0.05, T: 16 };
export const highX = time => sweep(time, HIGH.a, HIGH.b, HIGH.T);
export const HX = Math.PI / 12;                    // the worked example: 2x = π/6
