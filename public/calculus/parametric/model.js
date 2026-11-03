// Parametric, polar and vector model. Three curves carry the chapter:
//   the loop     x = t², y = t³ − 3t, −2 ≤ t ≤ 2      (9.1–9.5: slope, concavity, length, velocity)
//   the cycloid  r(t) = ⟨t − sin t, 1 − cos t⟩         (9.6–9.7: a rim point of a rolling wheel of radius 1)
//   the cardioid r = 2 + 2 cos θ, with the circle r = 3 (9.8–9.11: polar slope and area)
// Pure functions. Every number on the pages and in the figure comes from here.

// ---------- the loop ----------
export const T0 = -2, T1 = 2;                         // the parameter interval drawn
export const X = t => t * t, Y = t => t ** 3 - 3 * t;
export const DX = t => 2 * t, DY = t => 3 * t * t - 3;            // dx/dt, dy/dt
export const D2X = () => 2, D2Y = t => 6 * t;                      // d²x/dt², d²y/dt²
export const slope = t => DY(t) / DX(t);                            // dy/dx = (dy/dt)/(dx/dt)
export const d2 = t => 3 * (t * t + 1) / (4 * t ** 3);              // d²y/dx² = [d/dt (dy/dx)] / (dx/dt)
export const speed = t => Math.hypot(DX(t), DY(t));
export const TS = 2;                                                // the worked instant
export const TH = 1;                                                // horizontal tangents at t = ±1
export const TC = Math.sqrt(3);                                     // the loop closes: (3, 0) at t = ±√3
// Simpson's rule, for the integrals a calculator would do
export function simpson(f, a, b, n = 2000) {
  const h = (b - a) / n; let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
}
export const LOOP_L = simpson(speed, -TC, TC);                     // length of the loop
// n straight chords inscribed in the loop
export const chords = n => Array.from({ length: n + 1 }, (_, i) => -TC + 2 * TC * i / n);
export const chordLen = n => { const ts = chords(n); let s = 0; for (let i = 0; i < n; i++) s += Math.hypot(X(ts[i + 1]) - X(ts[i]), Y(ts[i + 1]) - Y(ts[i])); return s; };
export const CHORD_NS = [2, 3, 4, 6, 8, 12, 24];

// ---------- the cycloid: a point on the rim of a wheel (radius 1) rolling right at one radian per second ----------
export const CT1 = 2 * Math.PI;                                     // one arch
export const CX = t => t - Math.sin(t), CY = t => 1 - Math.cos(t);
export const CVX = t => 1 - Math.cos(t), CVY = t => Math.sin(t);    // v(t)
export const CAX = t => Math.sin(t), CAY = t => Math.cos(t);        // a(t), length 1, toward the hub
export const cspeed = t => 2 * Math.abs(Math.sin(t / 2));           // √((1 − cos t)² + sin² t)
export const cdist = t => 4 - 4 * Math.cos(t / 2);                  // ∫₀ᵗ speed, for 0 ≤ t ≤ 2π
export const ARCH = cdist(CT1);                                     // 8: one arch
export const CTM = Math.PI;                                         // the worked instant: the top of the arch
// 9.6: the path rebuilt from the velocity, v(tₖ)·Δt laid tip to tail (midpoint times)
export const STEPS = 12;
export function sumPath(k, n = STEPS) {
  const dt = CT1 / n, pts = [[0, 0]];
  for (let i = 0; i < k; i++) { const tm = (i + 0.5) * dt, [x, y] = pts[i]; pts.push([x + CVX(tm) * dt, y + CVY(tm) * dt]); }
  return pts;
}

// ---------- the cardioid r = 2 + 2 cos θ and the circle r = 3 ----------
export const A = 2, RC = 3;
export const R = th => A + A * Math.cos(th);
export const DR = th => -A * Math.sin(th);
export const PX = th => R(th) * Math.cos(th), PY = th => R(th) * Math.sin(th);
export const DXT = th => DR(th) * Math.cos(th) - R(th) * Math.sin(th);    // dx/dθ
export const DYT = th => DR(th) * Math.sin(th) + R(th) * Math.cos(th);    // dy/dθ
export const pslope = th => DYT(th) / DXT(th);
export const THS = Math.PI / 2;                                     // worked instant: (0, 2), slope 1
export const THT = Math.PI / 3;                                     // the top: horizontal tangent; also where it meets r = 3
// area: ½∫ r² dθ. First quadrant 3π/2 + 4; the whole cardioid 6π
export const AQ = 3 * Math.PI / 2 + 4, AFULL = 6 * Math.PI;
export const sector = (r, a, b) => 0.5 * r * r * (b - a);
export const WEDGE_NS = [2, 4, 8, 16, 32];
export function wedges(n, a = 0, b = Math.PI / 2) { const h = (b - a) / n; return Array.from({ length: n }, (_, i) => [a + i * h, a + (i + 1) * h, R(a + (i + 0.5) * h)]); }
export const wedgeSum = n => wedges(n).reduce((s, [a, b, r]) => s + sector(r, a, b), 0);
// inside the cardioid, outside the circle: ½∫ from −π/3 to π/3 of (R² − 3²) = (9√3 − 2π)/2
export const AB = (9 * Math.sqrt(3) - 2 * Math.PI) / 2;
export const abSoFar = th => 0.5 * ((6 - 9) * (th + THT) + 8 * (Math.sin(th) + Math.sin(THT)) + (Math.sin(2 * th) + Math.sin(2 * THT)));   // ½∫ from −π/3 to θ

// ---------- the clock ----------
export function loop(time, run, rest = 0.8) { const c = time % (run + rest); return { u: Math.min(c, run) / run, resting: c > run }; }
// each scene's own run: seconds of motion, then a rest at the end
export const RUNS = { lift: 8, slope: 8, concave: 8, arc: 10.5, vec: 8, integ: 7, wheel: 9, polar: 9, pslope: 9, parea: 10, between: 7 };
