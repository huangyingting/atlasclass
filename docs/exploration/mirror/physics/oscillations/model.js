// Oscillations model: simple harmonic motion of a block on a spring, a block hanging from a
// spring, and pendulums. Pure functions, SI units, y up. No friction, no air resistance.
// Every motion, arrow length and number on the page comes from here.
// Premium: a question can set its own numbers with setParams(); setParams({}) puts the lesson's back.
// The exports are live bindings (and the scene objects are updated in place), so every importer reads the current values.

export const SLOW = 0.5;        // everything is shown at half speed
const TAU = 2 * Math.PI;
export const DEG = Math.PI / 180;
export const DEFAULTS = { G: 9.80, M1: 1.0, K: 16, A: 0.50, PEND_L: 1.5, PEND_TH0: 8 * DEG, L4: 3.0, M2: 4.0, PUSH_V0: -1.6,
  ROD_L: 1.5, HOOP_R: 0.40, TORS_R: 0.30, TORS_TH0: 60 * DEG, CAR_M: 1200, SWING_L: 2.4 };
export let G;                   // m/s² (a question may take the pendulum to the Moon)

// ---------- the general results ----------
export const periodSpring = (m, k) => TAU * Math.sqrt(m / k);       // T = 2π√(m/k)
export const periodPendulum = L => TAU * Math.sqrt(L / G);         // T = 2π√(L/g), small angles
// x = A cos(ωt), v = −Aω sin(ωt), a = −Aω² cos(ωt): released from rest at x = +A
export const shm = (A, w, t) => ({ x: A * Math.cos(w * t), v: -A * w * Math.sin(w * t), a: -A * w * w * Math.cos(w * t) });

// ---------- the block on a horizontal spring (frictionless floor) ----------
export let M1, K, A;            // kg; N/m; amplitude, m
export let W, T0, F0;           // ω = 4.0 rad/s; 1.571 s; 0.637 Hz
export let VMAX, AMAX, FMAX;    // 2.00 m/s at x = 0; 8.00 m/s² and 8.00 N at x = ±A
export let E, WEIGHT;           // 2.00 J, all of it, always; mg
export function spring(t, amp = A, m = M1, k = K) {
  const s = shm(amp, Math.sqrt(k / m), t);
  return { ...s, F: -k * s.x, KE: 0.5 * m * s.v * s.v, U: 0.5 * k * s.x * s.x };
}
export let X_HALF;              // where K = U: x = A√2/2

// ---------- the same block hanging from a vertical spring ----------
// It stretches d = mg/k to a new equilibrium, then oscillates about it at the same period.
export const HANG = { L0: 0.80, A: 0.30 };
export let D;                   // 0.6125 m
export function hang(t) {
  const s = shm(HANG.A, W, t), y = -s.x;     // y up, measured from equilibrium; starts at the bottom
  const stretch = D - y;
  return { y, v: -s.v, a: -s.a, stretch, Fs: K * stretch, net: K * stretch - WEIGHT };
}

// ---------- the pendulum ----------
// The restoring force is the part of the weight along the arc, −mg sin θ. For small θ,
// sin θ ≈ θ, so θ'' = −(g/L) θ: SHM, θ = θ0 cos(√(g/L) t). The motion drawn is that solution.
export const PEND = { L: 1.5, th0: 8 * DEG, m: 1.0 };
export function pendulum(t, L = PEND.L, th0 = PEND.th0, m = PEND.m) {
  const w = Math.sqrt(G / L), th = th0 * Math.cos(w * t), om = -th0 * w * Math.sin(w * t);
  const v = L * om;
  return { th, om, v, restoring: -m * G * Math.sin(th), along: m * G * Math.cos(th), tension: m * G * Math.cos(th) + m * v * v / L, h: L * (1 - Math.cos(th)) };
}
// the exact period at amplitude θ0 (no small-angle approximation): T = T_small / AGM(1, cos(θ0/2))
export function periodExact(L, th0) {
  let a = 1, b = Math.cos(th0 / 2);
  for (let i = 0; i < 30; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return periodPendulum(L) / a;
}
// fastest speed at the bottom from energy: ½mv² = mgL(1 − cos θ0)
export const vmaxPendulum = (L, th0) => Math.sqrt(2 * G * L * (1 - Math.cos(th0)));
export let P_T;                 // 2.458 s

// ---------- proportional reasoning: double the period ----------
export const DOUBLE = { m: 1.0, m4: 4.0, L: 0.75, L4: 3.0, th0: 9 * DEG };
// ---------- what the period ignores: amplitude (springs) and mass (pendulums) ----------
export const IGNORE = { A1: 0.25, A2: 0.50, m1: 1.0, m2: 4.0, L: 1.5, th0: 8 * DEG };

// ---------- everyday oscillators ----------
// a car bouncing on its four springs (shock absorbers removed, so nothing damps it)
export const CAR = { m: 1200, k: 60000, A: 0.08 };   // T 0.889 s; d: how far it sags under its own weight
// a child on a swing: a pendulum 2.4 m long
export const SWING = { L: 2.4, th0: 9 * DEG, m: 30 };   // T 3.11 s

// ================= AP Physics C: the equation of motion, physical and torsion pendulums =================

// ---------- numerical integration: q'' = acc(q), classic RK4 ----------
export function rk4Step(acc, q, v, dt) {
  const k1 = [v, acc(q)], k2 = [v + k1[1] * dt / 2, acc(q + k1[0] * dt / 2)];
  const k3 = [v + k2[1] * dt / 2, acc(q + k2[0] * dt / 2)], k4 = [v + k3[1] * dt, acc(q + k3[0] * dt)];
  return [q + dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), v + dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
}
// integrate to time t from (q0, v0)
export function integrate(acc, q0, v0, t, dt = 1e-4) {
  let q = q0, v = v0; const n = Math.round(t / dt);
  for (let i = 0; i < n; i++) [q, v] = rk4Step(acc, q, v, t / n);
  return { q, v };
}
// the period, measured: the time between two successive turning points at the + side (v goes + → −)
export function periodNumeric(acc, q0, v0 = 0, dt = 1e-4) {
  let q = q0, v = v0, t = 0; const turns = [];
  while (turns.length < 2 && t < 100) {
    const [q1, v1] = rk4Step(acc, q, v, dt);
    if (v > 0 && v1 <= 0) turns.push(t + dt * v / (v - v1));   // interpolate the crossing
    q = q1; v = v1; t += dt;
  }
  return turns[1] - turns[0];
}

// ---------- the SHM equation: m x'' = −kx, so x'' = −(k/m) x, solved by x = A cos(ωt + φ) ----------
// A and φ come from where it starts: x0 = A cos φ, v0 = −Aω sin φ.
export const amplitudePhase = (x0, v0, w) => ({ A: Math.hypot(x0, v0 / w), phi: Math.atan2(-v0 / w, x0) });
export const shmPhase = (A, w, phi, t) => ({ x: A * Math.cos(w * t + phi), v: -A * w * Math.sin(w * t + phi), a: -A * w * w * Math.cos(w * t + phi) });
// two copies of the chapter's block and spring (1.0 kg, 16 N/m), both starting at x = 0.30 m:
// one let go from rest, one given a push of 1.6 m/s toward the wall
export let STARTS;
export const start = (i, t) => shmPhase(STARTS[i].A, W, STARTS[i].phi, t);

// ---------- the physical pendulum: a rigid body swinging about a pivot ----------
// τ = −mgd sin θ ≈ −mgd θ, and Iα = τ, so θ'' = −(mgd/I) θ: ω = √(mgd/I), T = 2π√(I/mgd).
// d is the distance from the pivot to the centre of mass; I is about the pivot (parallel axis: I_cm + md²).
export const periodPhysical = (m, d, I) => TAU * Math.sqrt(I / (m * G * d));
export const parallelAxis = (Icm, m, d) => Icm + m * d * d;
// a rod swinging about one end, next to a simple pendulum of the same length (the chapter's 1.5 m)
// d, Icm, I (⅓mL²), T (2π√(2L/3g) = 2.007 s), Leq (the simple pendulum that keeps time with it: 2L/3)
export const ROD = { m: 1.0, L: 1.5, th0: 8 * DEG };
// a hoop hanging on a nail by its rim: I = 2mR², T = 2π√(2R/g), a simple pendulum as long as the hoop is wide
export const HOOP = { m: 0.5, R: 0.40, th0: 8 * DEG };
// small-angle swing of any physical pendulum, released from rest at θ0
export function physical(b, t) {
  const w = TAU / b.T, th = b.th0 * Math.cos(w * t), om = -b.th0 * w * Math.sin(w * t);
  return { th, om, alpha: -w * w * th, torque: -b.m * G * b.d * Math.sin(th) };
}

// ---------- the torsion pendulum: a disc hanging from a wire ----------
// Twist the wire by θ and it twists back, τ = −κθ, so Iα = −κθ: ω = √(κ/I), T = 2π√(I/κ).
// No small-angle condition: the torque is proportional to θ at any twist the wire can take.
export const TORS = { M: 2.0, R: 0.30, kappa: 0.25, th0: 60 * DEG };   // κ in N·m/rad; I = ½MR² = 0.090 kg·m², T = 3.770 s
export function torsion(t) {
  const w = TAU / TORS.T, s = shm(TORS.th0, w, t);
  return { th: s.x, om: s.v, alpha: s.a, torque: -TORS.kappa * s.x };
}

// ---------- the numbers in force ----------
export function setParams(p = {}) {
  const q = { ...DEFAULTS, ...p };
  ({ G, M1, K, A } = q);
  W = Math.sqrt(K / M1); T0 = periodSpring(M1, K); F0 = 1 / T0;
  VMAX = A * W; AMAX = A * W * W; FMAX = K * A;
  E = 0.5 * K * A * A; WEIGHT = M1 * G;
  X_HALF = A / Math.SQRT2;
  D = M1 * G / K;
  PEND.L = q.PEND_L; PEND.th0 = q.PEND_TH0;
  P_T = periodPendulum(PEND.L);
  DOUBLE.L4 = q.L4; IGNORE.m2 = q.M2;
  CAR.m = q.CAR_M; CAR.T = periodSpring(CAR.m, CAR.k); CAR.d = CAR.m * G / CAR.k;
  SWING.L = q.SWING_L; SWING.T = periodPendulum(SWING.L);
  STARTS = [{ x0: 0.30, v0: 0 }, { x0: 0.30, v0: q.PUSH_V0 }].map(s => ({ ...s, ...amplitudePhase(s.x0, s.v0, W) }));
  ROD.L = q.ROD_L; ROD.d = ROD.L / 2; ROD.Icm = ROD.m * ROD.L ** 2 / 12;
  ROD.I = parallelAxis(ROD.Icm, ROD.m, ROD.d); ROD.T = periodPhysical(ROD.m, ROD.d, ROD.I); ROD.Leq = ROD.I / (ROD.m * ROD.d);
  HOOP.R = q.HOOP_R; HOOP.d = HOOP.R; HOOP.Icm = HOOP.m * HOOP.R ** 2;
  HOOP.I = parallelAxis(HOOP.Icm, HOOP.m, HOOP.d); HOOP.T = periodPhysical(HOOP.m, HOOP.d, HOOP.I);
  TORS.R = q.TORS_R; TORS.th0 = q.TORS_TH0;
  TORS.I = TORS.M * TORS.R ** 2 / 2; TORS.T = TAU * Math.sqrt(TORS.I / TORS.kappa);
}
setParams();
