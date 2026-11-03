// Derivatives in context: one model per scene. Pure functions; every number on the pages comes from here.
// Each scene loops on its own clock: loop(time, run) gives { t, resting } (t holds at the end for a moment).
export function loop(time, run, rest = 0.8) { const c = time % (run + rest); return { t: Math.min(c, run), resting: c > run }; }
export const SLOW = 1;

// ---------- 4.1 a cup of coffee cooling: T(t) = room + (T0 − room) e^(−kt), °C, t in minutes ----------
export const COFFEE = { room: 20, T0: 90, k: 0.08, run: 30, at: 10, rate: 3 };   // shown at 3 minutes per second
export const temp = t => COFFEE.room + (COFFEE.T0 - COFFEE.room) * Math.exp(-COFFEE.k * t);
export const dtemp = t => -COFFEE.k * (COFFEE.T0 - COFFEE.room) * Math.exp(-COFFEE.k * t);
export const d2temp = t => COFFEE.k * COFFEE.k * (COFFEE.T0 - COFFEE.room) * Math.exp(-COFFEE.k * t);
export const T_AT = temp(COFFEE.at), DT_AT = dtemp(COFFEE.at);                    // 51.45 °C, −2.52 °C/min
export const AVG10 = (temp(COFFEE.at) - temp(0)) / COFFEE.at;                       // −3.86 °C/min over the first 10 min

// ---------- 4.2 a particle on a line: x(t) = t³ − 6t² + 9t, metres, seconds ----------
export const PART = { run: 4, rate: 0.6 };
export const px = t => t ** 3 - 6 * t * t + 9 * t;
export const pv = t => 3 * t * t - 12 * t + 9;          // 3(t − 1)(t − 3)
export const pa = t => 6 * t - 12;
export const REST = [1, 3];                              // v = 0, and v changes sign: it turns round
export const A_ZERO = 2;                                 // a = 0
export const speedingUp = t => pv(t) * pa(t) > 0;
export const pdist = t => {                              // path length from 0 to t
  const legs = [0, ...REST.filter(r => r < t), t];
  let s = 0; for (let i = 1; i < legs.length; i++) s += Math.abs(px(legs[i]) - px(legs[i - 1]));
  return s;
};

// ---------- 4.3 a balloon: V = (4/3)πr³, r in cm ----------
export const BAL = { r0: 1, r1: 4, at: 3, dr: 0.25, run: 6, rate: 0.6 };
export const bvol = r => 4 / 3 * Math.PI * r ** 3;
export const bdvol = r => 4 * Math.PI * r * r;           // the surface area
export const balR = t => BAL.r0 + (BAL.r1 - BAL.r0) * t / BAL.run;
export const DV_AT = bdvol(BAL.at);                      // 36π ≈ 113.1 cm³ per cm
export const SHELL = bvol(BAL.at + BAL.dr) - bvol(BAL.at);   // the real ΔV for Δr = 0.25

// ---------- 4.3 rates from a table: water W(t) in a tank, gallons, t in hours ----------
export const TAB = { t: [0, 2, 5, 9, 12], W: [120, 160, 205, 236, 248], at: 7, rate: 0.5 };
export const tabSlope = i => (TAB.W[i + 1] - TAB.W[i]) / (TAB.t[i + 1] - TAB.t[i]);
export const TAB_EST = tabSlope(2);                      // W′(7) ≈ (236 − 205)/(9 − 5) = 7.75 gal/h
export const TAB_AVG = (TAB.W[4] - TAB.W[0]) / (TAB.t[4] - TAB.t[0]);   // 10.67 gal/h over the 12 hours
export const tabW = t => { let i = 0; while (i < TAB.t.length - 2 && t > TAB.t[i + 1]) i++; return TAB.W[i] + tabSlope(i) * (t - TAB.t[i]); };

// ---------- 4.4 a ripple on a pond: r grows at 0.5 m/s; A = πr² ----------
export const POND = { drdt: 0.5, R: 5.2, at: 4, run: 10, rate: 1 };
export const pondR = t => POND.drdt * t;
export const pondA = r => Math.PI * r * r;
export const pondDA = r => 2 * Math.PI * r * POND.drdt;  // dA/dt = 2πr dr/dt
export const DA_AT = pondDA(POND.at);                    // 4π ≈ 12.57 m²/s

// ---------- 4.5 a 5 m ladder whose foot is pulled out at 0.4 m/s ----------
export const LAD = { L: 5, dxdt: 0.4, x0: 1.4, x1: 4.6, at: 3, rate: 1.2 };
LAD.run = (LAD.x1 - LAD.x0) / LAD.dxdt;
export const ladX = t => LAD.x0 + LAD.dxdt * t;
export const ladY = x => Math.sqrt(LAD.L ** 2 - x * x);
export const ladDY = x => -x / ladY(x) * LAD.dxdt;         // dy/dt = −(x/y) dx/dt
export const ladDTH = x => -LAD.dxdt / ladY(x);            // θ from the floor: cos θ = x/L → dθ/dt = −(dx/dt)/(L sin θ) = −(dx/dt)/y
export const LAD_Y = ladY(LAD.at), LAD_DY = ladDY(LAD.at), LAD_DTH = ladDTH(LAD.at);   // 4 m, −0.3 m/s, −0.1 rad/s

// ---------- 4.5 an inverted cone filling: radius 2 m, depth 4 m; 1.5 m³/min in ----------
export const CONE = { R: 2, H: 4, q: 1.5, at: 3, top: 3.8, rate: 1.2 };
export const coneV = h => Math.PI / 3 * (h * CONE.R / CONE.H) ** 2 * h;   // r = h/2 → V = πh³/12
export const coneH = V => Math.cbrt(V * 3 * CONE.H * CONE.H / (Math.PI * CONE.R * CONE.R));
export const coneDH = h => CONE.q / (Math.PI * (h * CONE.R / CONE.H) ** 2);  // dV/dt = πr² dh/dt
CONE.run = coneV(CONE.top) / CONE.q;
export const coneHt = t => coneH(Math.max(CONE.q * t, 1e-9));
export const CONE_DH = coneDH(CONE.at);                    // 6/(9π) ≈ 0.212 m/min
export const CONE_DR = CONE_DH * CONE.R / CONE.H;          // the surface's radius grows at half that

// ---------- 4.5 a shadow: lamp 6 m high, person 1.8 m tall, walking away at 1.2 m/s ----------
export const SHA = { lamp: 6, tall: 1.8, v: 1.2, x0: 1, x1: 8, at: 5, rate: 1 };
SHA.run = (SHA.x1 - SHA.x0) / SHA.v;
export const shaX = t => SHA.x0 + SHA.v * t;
export const shaS = x => SHA.tall * x / (SHA.lamp - SHA.tall);    // similar triangles: s/1.8 = (x + s)/6
export const SHA_DS = SHA.tall / (SHA.lamp - SHA.tall) * SHA.v;    // ds/dt = 0.514 m/s, for every x
export const SHA_TIP = SHA.lamp / (SHA.lamp - SHA.tall) * SHA.v;   // the tip: d(x + s)/dt = 1.714 m/s

// ---------- 4.6 local linearity: f(x) = √x at a = 4 ----------
export const LIN = { a: 4, x: 4.2, run: 6, rate: 1 };
export const sq = x => Math.sqrt(x);
export const sqL = x => 2 + (x - LIN.a) / 4;               // L(x) = f(a) + f′(a)(x − a), f′(4) = 1/4
export const LIN_EST = sqL(LIN.x), LIN_TRUE = sq(LIN.x);   // 2.05 against 2.04939
// the zoom: the window around (4, 2) shrinks from ±2·ZOOM0 to ±2·ZOOM1 (math units per board unit)
export const ZOOM0 = 2, ZOOM1 = 0.02;
export const zoomK = t => ZOOM0 * Math.pow(ZOOM1 / ZOOM0, Math.min(t / LIN.run, 1));

// ---------- 4.6 over or under: √x at 4 (concave down) and eˣ at 0 (concave up) ----------
export const OVR = { run: 5, rate: 1 };
export const ovrX = t => LIN.a + 4 * t / OVR.run;          // √x: from 4 out to 8
export const ovrU = t => -1.4 * t / OVR.run;               // eˣ: from 0 back to −1.4
export const exL = x => 1 + x;                             // tangent to eˣ at 0
export const EX_AT = -0.2, EX_EST = exL(EX_AT), EX_TRUE = Math.exp(EX_AT);   // 0.8 against 0.8187

// ---------- 4.7 L'Hôpital, 0/0: ln x / (x² − 1) as x → 1 ----------
export const LH = { a: 1, run: 5, rate: 1, from: 2.4 };
export const lhF = x => Math.log(x), lhG = x => x * x - 1;
export const lhDF = x => 1 / x, lhDG = x => 2 * x;
export const LH_LIM = lhDF(1) / lhDG(1);                   // 1/2
export const lhX = t => LH.a + (LH.from - LH.a) * Math.exp(-1.1 * t);

// ---------- 4.7 L'Hôpital, ∞/∞: x²/eˣ as x → ∞ (twice) ----------
export const INF = { run: 6, rate: 1, x0: 0.5, x1: 10 };
export const r0 = x => x * x / Math.exp(x), r1 = x => 2 * x / Math.exp(x), r2 = x => 2 / Math.exp(x);
export const infX = t => INF.x0 + (INF.x1 - INF.x0) * t / INF.run;
