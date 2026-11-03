// Fluids model: density, pressure, buoyancy and flow, in nine simple scenes. Pure functions, SI units.
// Every motion, arrow length and number on the page comes from here.
// Premium: a question can set its own numbers with setParams(); setParams({}) puts the lesson's back.
// The exports are live bindings (and the scene objects are refilled in place), so every importer reads the current values.

export const G = 9.80;           // m/s²
export const RHO = 1000;         // fresh water, kg/m³
export const RHO_SEA = 1025;     // sea water, kg/m³
export const P0 = 101300;        // atmospheric pressure at the surface, Pa
const clamp = (x, a, b) => Math.min(Math.max(x, a), b);
const smooth = (a, b, x) => { const u = clamp((x - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };

// the inputs a question may change (defaults: the lesson's). ASK names the one number on the figure the
// question asks for, drawn as ? until the working shows it (e.g. 'F1', 'mass.ice').
export const DEFAULTS = { CUBE: 0.10, PERSON_M: 70, FEET: 2, RHO_LAKE: RHO, PA_R1: 0.08, PA_R2: 0.32, PA_F1: 50, PA_STROKE: 0.32,
  BUOY_S: 0.30, BUOY_RHO: 2700, BUOY_FLUID: RHO, POOL_RHO: RHO, WOOD_RHO: 600, BALL_R: 0.15,
  FLOW_R1: 0.30, FLOW_R2: 0.15, FLOW_V1: 0.5, BERN_V1: 2.0, BERN_P1: 50000, BERN_H: 1.2, TANK_H0: 1.2, TANK_H1: 0.35, TANK_BASE: 1.0, ASK: '' };
export let ASK;
export const asked = (key, s) => ASK === key ? '?' : s;

// ---------- density: five cubes, each CUBE on a side (10 cm: 1.0 L) ----------
export let CUBE, CUBE_V, MATERIALS;
const STUFF = [
  { key: 'cork', name: 'cork', rho: 240 },
  { key: 'ice', name: 'ice', rho: 917 },
  { key: 'water', name: 'water', rho: 1000 },
  { key: 'al', name: 'aluminium', rho: 2700 },
  { key: 'iron', name: 'iron', rho: 7870 },
];
export const density = (m, V) => m / V;

// ---------- pressure: a 70 kg person on snow, in shoes and on snowshoes ----------
export const PERSON = {};
export const SHOE = { w: 0.10, l: 0.25 };                // each sole
export const SNOWSHOE = { w: 0.25, l: 0.80 };
export const pressure = (F, A) => F / A;
export let P_SHOE, P_SNOW, FEET;                         // FEET: how many feet are on the snow (1 or 2)
export const NAIL = { F: 50, head: 1.0e-4, tip: 5.0e-7 }; // a 50 N push: thumb on a 1 cm² head, 0.5 mm² tip
export const PATCH = 0.0125;                             // one pressure arrow per 125 cm² of contact

// ---------- pressure with depth: a diver in a lake ----------
export const LAKE = { depth: 12 };                       // rho: the lake's water
export const gauge = d => LAKE.rho * G * Math.max(d, 0); // ρgh
export const pAt = d => P0 + gauge(d);                   // absolute
export const DIVE_T = 18;                                // down to 10 m and back up
export const diveDepth = t => 5.5 - 4.5 * Math.cos(2 * Math.PI * t / DIVE_T);
export const diveTime = d => DIVE_T / (2 * Math.PI) * Math.acos(clamp((5.5 - d) / 4.5, -1, 1));   // first time at depth d
// the same pressure, summed as the weight of a column of water, slab by slab, over its area
export function columnSum(d, A = 1, n = 2000) {
  let W = 0; for (let i = 0; i < n; i++) W += LAKE.rho * G * A * (d / n);
  return P0 + W / A;
}

// ---------- Pascal's principle: two pistons on one sealed column of water ----------
export const PASCAL = { T: 8 };                          // stroke: how far the small piston goes down
// pushed down slowly by d1; the water can't be squeezed, so the big piston rises d2 = d1·A1/A2
export function pascal(t) {
  const d1 = PASCAL.stroke * (1 - Math.cos(2 * Math.PI * t / PASCAL.T)) / 2;
  return { d1, d2: d1 * PASCAL.A1 / PASCAL.A2 };
}

// ---------- buoyancy: a cube (aluminium) lowered on a string into a tank ----------
export const BUOY = { tankW: 1.2, tankD: 0.6, L0: 1.0, T: 14 };   // rhoF: the tank's liquid
// the cube's bottom face, slowly from 0.35 m above the still water level to 0.75 m below it and back
export const buoyBottom = t => BUOY.L0 + 0.35 - 1.1 * (1 - Math.cos(2 * Math.PI * t / BUOY.T)) / 2;
export const buoyTime = yb => BUOY.T / (2 * Math.PI) * Math.acos(clamp(1 - 2 * (BUOY.L0 + 0.35 - yb) / 1.1, -1, 1));   // on the way down
// at bottom height yb: how much is under, where the (slightly risen) surface is, and the forces
export function buoy(yb) {
  const s = BUOY.s, k = s * s / BUOY.Atank;
  const h = clamp((BUOY.L0 - yb) / (1 - k), 0, s);       // the level rises by V_sub / A_tank
  const L = BUOY.L0 + s * s * h / BUOY.Atank;
  const Vsub = s * s * h, Fb = BUOY.rhoF * Vsub * G;
  return { yb, h, L, Vsub, Fb, T: BUOY.W - Fb, dTop: L - (yb + s), dBot: L - yb };
}
export const bottomFor = h => BUOY.L0 - h * (1 - BUOY.s * BUOY.s / BUOY.Atank);   // where the bottom is with h under
export const gaugeAtY = (y, L) => BUOY.rhoF * G * Math.max(L - y, 0);

// ---------- floating and sinking: a pool of fresh water ----------
export const POOL = { L: 0.8 };                          // water surface height, floor at 0; rho: its water
export const WOOD = { s: 0.4 }, ICE = { s: 0.4, rho: 917 };
export const BALL = { rho: 7850 };
// a ship: an open steel box, 5 mm plate. Its average density (steel + air inside) is what floats it.
export const SHIP = { l: 1.4, w: 0.6, h: 0.4, t: 0.005, rho: 7850 };
export const fractionUnder = (rhoObj, rhoFluid = RHO) => Math.min(rhoObj / rhoFluid, 1);

// ---------- flow in pipes ----------
// A pipe is a centre line y(x) and a radius r(x) (measured across the pipe). Tabulated by arc length
// s, with V(s), the volume of pipe up to s, so an ideal (incompressible) fluid can be moved through it.
export function makePipe({ x0, x1, y, r, n = 1200 }) {
  const X = [], Y = [], S = [], R = [], VOL = [];
  let s = 0, vol = 0;
  for (let i = 0; i <= n; i++) {
    const x = x0 + (x1 - x0) * i / n, yy = y(x), rr = r(x);
    if (i) { const ds = Math.hypot(x - X[i - 1], yy - Y[i - 1]); s += ds; vol += Math.PI * (R[i - 1] ** 2 + rr * rr) / 2 * ds; }
    X.push(x); Y.push(yy); S.push(s); R.push(rr); VOL.push(vol);
  }
  const find = (arr, v) => { let a = 0, b = n; while (b - a > 1) { const m = (a + b) >> 1; if (arr[m] <= v) a = m; else b = m; } return a; };
  const lerpAt = (arr, key, v) => { const i = Math.min(find(key, v), n - 1), u = (v - key[i]) / (key[i + 1] - key[i] || 1); return arr[i] + (arr[i + 1] - arr[i]) * u; };
  const P = { len: s, vol, X, Y, S, R, VOL, n };
  P.atS = s => { s = clamp(s, 0, P.len); const i = Math.min(find(S, s), n - 1);
    return { x: lerpAt(X, S, s), y: lerpAt(Y, S, s), r: lerpAt(R, S, s), tx: (X[i + 1] - X[i]) / (S[i + 1] - S[i]), ty: (Y[i + 1] - Y[i]) / (S[i + 1] - S[i]) }; };
  P.sOfX = x => lerpAt(S, X, x);
  P.sOfVol = v => lerpAt(S, VOL, clamp(v, 0, vol));
  P.volOfS = s => lerpAt(VOL, S, clamp(s, 0, P.len));
  P.area = s => Math.PI * P.atS(s).r ** 2;
  return P;
}

// continuity: a horizontal pipe narrowing from 30 cm to 15 cm radius (a quarter of the area)
export const FLOW = {};
export let PIPE1;

// Bernoulli: wide and low → narrow and low → wide again, then up 1.2 m. Gauge pressures.
export const BERN = { r1: 0.30, r2: 0.15, slow: 0.5, xs: [-2.2, 0, 3.9] };
export let PIPE2;
// along the pipe: speed from continuity, pressure from Bernoulli
export function bern(s) {
  const p = PIPE2.atS(s), v = BERN.Q / (Math.PI * p.r * p.r);
  const K = 0.5 * RHO * v * v, U = RHO * G * p.y;
  return { ...p, v, K, U, P: BERN.E - K - U };
}

// Torricelli: a tank on a block, draining through a small hole near its bottom
export const TANK = { w: 1.0, d: 0.6, hole: 0.08, ratio: 1 / 60 };
export const torricelli = h => Math.sqrt(2 * G * Math.max(h, 0));
// A dh/dt = −a v  →  √h falls linearly
export const tankH = t => Math.max(Math.sqrt(TANK.h0) - TANK.ratio * Math.sqrt(G / 2) * t, 0) ** 2;
export const tankTime = h => (Math.sqrt(TANK.h0) - Math.sqrt(h)) / (TANK.ratio * Math.sqrt(G / 2));   // when the water is h above the hole
export const jetRange = h => torricelli(h) * Math.sqrt(2 * TANK.yh / G);   // = 2√(h·y_hole)
export let jetFlight;

// each looping scene: run, rest, start again
export const REST = 1.0;
export const loop = (clock, run) => { const c = clock % (run + REST); return { t: Math.min(c, run), resting: c > run }; };

// ---------- the numbers in force ----------
export function setParams(p = {}) {
  const q = { ...DEFAULTS, ...p };
  ASK = q.ASK;
  CUBE = q.CUBE; CUBE_V = CUBE ** 3;
  MATERIALS = STUFF.map(m => ({ ...m, mass: m.rho * CUBE_V, floats: m.rho < RHO }));

  PERSON.m = q.PERSON_M; PERSON.W = PERSON.m * G;        // 686 N
  FEET = q.FEET;
  SHOE.A = FEET * SHOE.w * SHOE.l;                       // both feet: 0.050 m²
  SNOWSHOE.A = FEET * SNOWSHOE.w * SNOWSHOE.l;           // 0.40 m²
  P_SHOE = pressure(PERSON.W, SHOE.A);                   // 13.7 kPa
  P_SNOW = pressure(PERSON.W, SNOWSHOE.A);               // 1.7 kPa

  LAKE.rho = q.RHO_LAKE;

  Object.assign(PASCAL, { r1: q.PA_R1, r2: q.PA_R2, F1: q.PA_F1, stroke: q.PA_STROKE });
  PASCAL.A1 = Math.PI * PASCAL.r1 ** 2;
  PASCAL.A2 = Math.PI * PASCAL.r2 ** 2;
  PASCAL.dP = PASCAL.F1 / PASCAL.A1;                     // the extra pressure, everywhere in the water
  PASCAL.F2 = PASCAL.dP * PASCAL.A2;                     // 16 × F1
  PASCAL.load = PASCAL.F2 / G;                           // the mass it holds up

  Object.assign(BUOY, { s: q.BUOY_S, rho: q.BUOY_RHO, rhoF: q.BUOY_FLUID });
  BUOY.V = BUOY.s ** 3;
  BUOY.m = BUOY.rho * BUOY.V;                            // 72.9 kg
  BUOY.W = BUOY.m * G;
  BUOY.Atank = BUOY.tankW * BUOY.tankD;
  BUOY.Fb = BUOY.rhoF * BUOY.V * G;                      // fully under: 264.6 N

  POOL.rho = q.POOL_RHO; WOOD.rho = q.WOOD_RHO; BALL.r = q.BALL_R;
  for (const c of [WOOD, ICE]) { c.m = c.rho * c.s ** 3; c.W = c.m * G; c.draft = c.s * c.rho / POOL.rho; c.Fb = POOL.rho * c.s * c.s * c.draft * G; }
  BALL.V = 4 / 3 * Math.PI * BALL.r ** 3; BALL.m = BALL.rho * BALL.V; BALL.W = BALL.m * G; BALL.Fb = POOL.rho * BALL.V * G; BALL.N = BALL.W - BALL.Fb;
  SHIP.Vsteel = SHIP.t * (SHIP.l * SHIP.w + 2 * SHIP.l * SHIP.h + 2 * SHIP.w * SHIP.h);
  SHIP.m = SHIP.rho * SHIP.Vsteel; SHIP.W = SHIP.m * G;
  SHIP.avg = SHIP.m / (SHIP.l * SHIP.w * SHIP.h);
  SHIP.draft = SHIP.m / (POOL.rho * SHIP.l * SHIP.w);
  SHIP.Fb = POOL.rho * SHIP.l * SHIP.w * SHIP.draft * G;

  Object.assign(FLOW, { r1: q.FLOW_R1, r2: q.FLOW_R2, v1: q.FLOW_V1 });
  FLOW.A1 = Math.PI * FLOW.r1 ** 2; FLOW.A2 = Math.PI * FLOW.r2 ** 2;
  FLOW.Q = FLOW.A1 * FLOW.v1;                            // volume flow rate, m³/s
  FLOW.v2 = FLOW.Q / FLOW.A2;
  PIPE1 = makePipe({ x0: -2.6, x1: 2.6, y: () => 0, r: x => FLOW.r1 + (FLOW.r2 - FLOW.r1) * smooth(-0.5, 0.5, x) });

  Object.assign(BERN, { v1: q.BERN_V1, H: q.BERN_H, P1: q.BERN_P1 });
  BERN.A1 = Math.PI * BERN.r1 ** 2; BERN.Q = BERN.A1 * BERN.v1;
  PIPE2 = makePipe({ x0: -3.2, x1: 4.8, y: x => BERN.H * smooth(1.7, 3.1, x),
    r: x => BERN.r1 + (BERN.r2 - BERN.r1) * (smooth(-1.2, -0.6, x) - smooth(0.6, 1.2, x)) });
  BERN.E = BERN.P1 + 0.5 * RHO * BERN.v1 ** 2;           // P + ½ρv² + ρgy at point 1 (y = 0)
  BERN.pts = BERN.xs.map(x => bern(PIPE2.sOfX(x)));

  Object.assign(TANK, { base: q.TANK_BASE, h0: q.TANK_H0, h1: q.TANK_H1 });
  TANK.A = TANK.w * TANK.d; TANK.a = TANK.A * TANK.ratio;
  TANK.yh = TANK.base + TANK.hole;                       // the hole's height above the floor
  TANK.Tdrain = (Math.sqrt(TANK.h0) - Math.sqrt(TANK.h1)) / (TANK.ratio * Math.sqrt(G / 2));
  jetFlight = Math.sqrt(2 * TANK.yh / G);
}
setParams();
