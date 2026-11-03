// Applications of integration: one small, exact example per topic. Pure functions; every number on the page
// (and in the figure's motion) comes from here. Exact values are written out; simpson() is there to check them.
export const simpson = (f, a, b, n = 2000) => {
  const h = (b - a) / n; let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return s * h / 3;
};
// a repeating run: `run` seconds of motion, then `rest` seconds holding the end
export function loop(time, run, rest = 1) { const c = time % (run + rest); return { u: Math.min(c / run, 1), resting: c > run }; }
const PI = Math.PI;

// ---------- 8.1 average value: f(x) = x²/2 + 1 on [0, 3] ----------
export const AV = { a: 0, b: 3, f: x => x * x / 2 + 1 };
AV.int = 27 / 6 + 3;                        // ∫ = x³/6 + x = 7.5
AV.avg = AV.int / (AV.b - AV.a);            // 2.5
AV.c = Math.sqrt(2 * (AV.avg - 1));         // f(c) = 2.5 at c = √3
export const AV_NS = [1, 2, 4, 8, 16, 32];  // sample counts the figure steps through
export const sampleMean = n => { let s = 0; for (let i = 0; i < n; i++) s += AV.f(AV.a + (i + 0.5) * (AV.b - AV.a) / n); return s / n; };
export const AV_STEP = 1.6;                 // seconds per sample count
export const avgN = c => AV_NS[Math.min(Math.floor((c % (AV_STEP * (AV_NS.length + 2))) / AV_STEP), AV_NS.length - 1)];

// ---------- 8.2 a particle: v(t) = t² − 4t + 3 on [0, 4], x(0) = 0 ----------
export const PV = { T: 4, x0: 0, run: 8 };
export const pv = t => t * t - 4 * t + 3;            // zero at t = 1 and t = 3
export const pa = t => 2 * t - 4;
export const px = t => PV.x0 + t ** 3 / 3 - 2 * t * t + 3 * t;
export const PV_DISP = px(PV.T) - px(0);             // 4/3
const TURNS = [1, 3];
export const pdist = t => { let d = 0, prev = 0; for (const k of [...TURNS.filter(k => k < t), t]) { d += Math.abs(px(k) - px(prev)); prev = k; } return d; };
export const PV_DIST = pdist(PV.T);                  // 4
export const pvTime = c => loop(c, PV.run, 1.2).u * PV.T;

// ---------- 8.3 a tank: in at R(t) = 5 + 3 sin(πt/4), out at D(t) = 1 + t (litres per minute), 30 L at t = 0 ----------
export const TK = { A0: 30, T: 6, run: 9, cap: 60 };
export const tR = t => 5 + 3 * Math.sin(PI * t / 4);
export const tD = t => 1 + t;
export const tA = t => TK.A0 + 4 * t - t * t / 2 + 12 / PI * (1 - Math.cos(PI * t / 4));
export const TK_TMAX = 4;                            // R − D = 0 at t = 4, + before, − after
export const TK_MAX = tA(TK_TMAX);                   // 38 + 24/π
export const TK_END = tA(TK.T);                      // 36 + 12/π
export const tkTime = c => loop(c, TK.run, 1.2).u * TK.T;

// ---------- 8.4 area between y = 4x − x² (top) and y = x² (bottom), 0 ≤ x ≤ 2 ----------
export const AX = { a: 0, b: 2, f: x => 4 * x - x * x, g: x => x * x, run: 5 };
AX.area = 8 / 3;
export const axX = c => AX.a + loop(c, AX.run, 1.2).u * (AX.b - AX.a);

// ---------- 8.5 area between x = y² (left) and x = y + 2 (right), −1 ≤ y ≤ 2 ----------
export const AY = { c: -1, d: 2, left: y => y * y, right: y => y + 2, run: 5 };
AY.area = 4.5;
AY.xSplit = [4 / 3, 19 / 6];                         // the two dx integrals: 0 → 1 and 1 → 4
export const ayY = c => AY.c + loop(c, AY.run, 1.2).u * (AY.d - AY.c);

// ---------- 8.6 three crossings: f(x) = x³ − 3x and g(x) = x meet at x = −2, 0, 2 ----------
export const MX = { a: -2, m: 0, b: 2, f: x => x ** 3 - 3 * x, g: x => x, run: 6 };
MX.left = 4; MX.right = 4;                           // ∫(f − g) on [−2, 0] and ∫(g − f) on [0, 2]
MX.area = 8; MX.signed = 0;
export const mxX = c => MX.a + loop(c, MX.run, 1.2).u * (MX.b - MX.a);
export const mxSigned = x => { const F = u => u ** 4 / 4 - 2 * u * u; return F(x) - F(MX.a); };   // ∫(f − g) from −2
export const mxAbs = x => x <= 0 ? mxSigned(x) : 2 * MX.left - mxSigned(x);

// ---------- 8.7, 8.8 cross sections on the base under y = 2 − x²/2, −2 ≤ x ≤ 2 ----------
export const CS = { a: -2, b: 2, s: x => 2 - x * x / 2, n: 16, run: 6 };
CS.s2 = 128 / 15;                                    // ∫ s² dx
CS.square = CS.s2;                                   // A = s²
CS.rect = CS.s2 / 2;                                 // rectangles of height s/2: A = s²/2
CS.tri = Math.sqrt(3) / 4 * CS.s2;                   // equilateral triangles: A = (√3/4)s²
CS.semi = PI / 8 * CS.s2;                            // semicircles on diameter s: A = (π/8)s²
CS.isoRight = CS.s2 / 2;                             // isosceles right triangles, leg s: A = s²/2
export const csX = c => CS.a + loop(c, CS.run, 1.5).u * (CS.b - CS.a);

// ---------- 8.9 disc: y = √x, 0 ≤ x ≤ 4, about the x-axis ----------
export const DX = { a: 0, b: 4, r: x => Math.sqrt(x) };
DX.vol = 8 * PI;
DX.yAxis = 32 * PI / 5;                               // x = y², 0 ≤ y ≤ 2, about the y-axis (text)

// ---------- 8.10 disc about x = 4: the region under y = √x, 0 ≤ x ≤ 4 ----------
export const DV = { c: 0, d: 2, k: 4, r: y => 4 - y * y };
DV.vol = 256 * PI / 15;

// ---------- 8.11 washer: between y = √x (outer) and y = x/2 (inner), 0 ≤ x ≤ 4, about the x-axis ----------
export const WX = { a: 0, b: 4, R: x => Math.sqrt(x), r: x => x / 2 };
WX.vol = 8 * PI / 3;
WX.minusSquared = PI * simpson(x => (Math.sqrt(x) - x / 2) ** 2, 0, 4);   // π∫(R − r)²: the classic slip
// ---------- 8.12 the same region about y = −1 ----------
export const WO = { k: -1, R: x => Math.sqrt(x) + 1, r: x => x / 2 + 1 };
WO.vol = 16 * PI / 3;
WO.above = 8 * PI / 3;                               // about y = 2 instead: R = 2 − x/2, r = 2 − √x (text)

// disc and washer scenes: sweep the region round (0 → 1), then slide a slab along the axis
export const REV = { sweep: 4, slide: 4, rest: 1 };
export function revPhase(c) {
  const T = REV.sweep + REV.slide + REV.rest, k = c % T;
  return { sweep: Math.min(k / REV.sweep, 1), slide: k < REV.sweep ? -1 : Math.min((k - REV.sweep) / REV.slide, 1) };
}

// ---------- 8.13 arc length: y = (2/3)x^(3/2), 0 ≤ x ≤ 3; L = ∫√(1 + x) dx = 14/3 ----------
export const AL = { a: 0, b: 3, f: x => 2 / 3 * x ** 1.5, df: x => Math.sqrt(x) };
AL.len = 14 / 3;
export const AL_NS = [1, 2, 4, 8, 16];
export const chordLen = n => { let s = 0; for (let i = 0; i < n; i++) { const x0 = AL.b * i / n, x1 = AL.b * (i + 1) / n; s += Math.hypot(x1 - x0, AL.f(x1) - AL.f(x0)); } return s; };
export const AL_STEP = 1.8;
export const alN = c => AL_NS[Math.min(Math.floor((c % (AL_STEP * (AL_NS.length + 2))) / AL_STEP), AL_NS.length - 1)];
// the particle on the same path: x = t, y = (2/3)t^(3/2), speed √(1 + t); its distance so far
export const alDist = t => 2 / 3 * ((1 + t) ** 1.5 - 1);
export const alT = c => loop(c, 6, 1).u * AL.b;
