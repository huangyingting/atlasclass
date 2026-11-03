// Differential equations model: every equation, solution and number on the pages comes from here.
// One clock (seconds) drives every scene; each scene reads its own moment from it with the functions below.

export function loop(time, run, rest = 1) { const c = ((time % (run + rest)) + run + rest) % (run + rest); return { t: Math.min(c, run), resting: c > run }; }

// ---------- 7.1 and 7.8 · a cup of coffee cooling: dT/dt = −k(T − ROOM) ----------
export const ROOM = 20, T0 = 90, KC = 0.1;                       // °C, °C, per minute
export const coffeeRate = T => -KC * (T - ROOM);                 // the model: °C per minute
export const coffee = t => ROOM + (T0 - ROOM) * Math.exp(-KC * t);   // its solution (found in 7.8)
export const COFFEE_RUN = 30;                                    // minutes shown
export const coffeeT = c => loop(c * 3, COFFEE_RUN, 3).t;        // 10 s for the half hour

// ---------- 7.2 – 7.5 · one equation throughout: dy/dx = x − y ----------
export const F = (x, y) => x - y;
export const X0 = 0, Y0 = 1;                                     // the initial condition y(0) = 1
export const solC = C => x => x - 1 + C * Math.exp(-x);          // the general solution
export const sol = solC(2);                                      // through (0, 1): C = 2
export const dsol = x => 1 - 2 * Math.exp(-x);
export const d2sol = x => 2 * Math.exp(-x);
export const wrong = x => x + 2 * Math.exp(-x);                  // a candidate that is not a solution
export const XMIN = Math.LN2, YMIN = sol(Math.LN2);              // the lowest point: on the line y = x
// 7.2: the point slides back and forth along both candidates
export const verifyX = c => 1.5 - 1.75 * Math.cos(c * 0.45);
// 7.3: segments are drawn one by one at the integer points, row by row from the top
export const GRID = [-3, -2, -1, 0, 1, 2, 3];
export const SKETCH_N = GRID.length ** 2;
export const sketchCount = c => Math.min(SKETCH_N, Math.floor(loop(c * 6, SKETCH_N + 1, 18).t));
// 7.4: the solution through (0, 1) is traced from x = 0 to 3, and the others with it
export const TRACE_C = [4, 2, 0, -1];                            // C = 0 is the straight solution y = x − 1
export const traceX = c => loop(c * 0.55, 3, 1.2).t;
// 7.5 · BC: Euler's method from (0, 1) to x = 2
export const XE = 2, H = 0.5, HS = [0.5, 0.25, 0.125];
export function euler(h, x0 = X0, y0 = Y0, xe = XE, f = F) {
  const pts = [[x0, y0]];
  for (let k = 0, x = x0, y = y0; k < Math.round((xe - x0) / h); k++) { y += h * f(x, y); x += h; pts.push([x, y]); }
  return pts;
}
export const EULER = euler(H);                                   // [[0,1],[0.5,0.5],[1,0.5],[1.5,0.75],[2,1.125]]
export const EXACT_E = sol(XE);
// one cycle per step size: draw it over 3 s, hold 2 s
export function eulerPhase(c) {
  const u = ((c % 15) + 15) % 15, k = Math.floor(u / 5), w = u - 5 * k, h = HS[k], n = Math.round(XE / h);
  return { k, h, n, shown: Math.min(n, w / 3 * n) };             // shown: segments drawn so far (fractional)
}

// ---------- 7.6 · separation of variables: dy/dx = y cos x → y = C e^(sin x) ----------
export const SEP = (x, y) => y * Math.cos(x);
export const sepSol = C => x => C * Math.exp(Math.sin(x));
export const SEP_FAMILY = [-1.5, -1, -0.5, 0.5, 1, 1.5];
export const sepC = c => 1.45 * Math.sin(c * 0.6);

// ---------- 7.7 · a particular solution and its domain: dy/dx = 2xy², y(0) = 1 → y = 1/(1 − x²) ----------
export const DOM = (x, y) => 2 * x * y * y;
export const domSol = x => 1 / (1 - x * x);
export const DOM_C = -1;                                         // −1/y = x² + C, and y(0) = 1 gives C = −1
export const domX = c => 0.87 * Math.sin(c * 0.7);

// ---------- 7.8 · exponential growth: dP/dt = kP, doubling every TD hours ----------
export const P0 = 500, TD = 4, KG = Math.LN2 / TD;
export const grow = t => P0 * Math.exp(KG * t);
export const GROW_RUN = 12;
export const growT = c => loop(c * 1.5, GROW_RUN, 1.5).t;

// ---------- 7.9 · BC · logistic growth: dP/dt = kP(1 − P/L) ----------
export const L = 1200, PL0 = 100, KL = 0.6;                      // fish, fish, per year
export const AL = (L - PL0) / PL0;                               // P = L/(1 + A e^(−kt)), A = 11
export const logi = (t, p0 = PL0) => L / (1 + (L - p0) / p0 * Math.exp(-KL * t));
export const logiRate = P => KL * P * (1 - P / L);
export const TH = Math.log(AL) / KL;                             // when P = L/2: the fastest growth
export const RMAX = KL * L / 4;                                  // the fastest rate, fish per year
export const LOGI_RUN = 12;
export const logiT = c => loop(c * 1.2, LOGI_RUN, 1.5).t;
// the opener: the same field, with solutions from several starting sizes drawn as time runs
export const COVER_P0 = [40, 150, 450, 1550];
export const coverT = c => loop(c * 1.1, 10, 2).t;
