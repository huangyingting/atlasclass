// Circuits model: current in a wire, resistance, and DC and RC circuits. Pure functions, SI units.
// Every dot speed, arrow length, height and number on the page comes from here.
// Premium: a question can set its own numbers with setParams(); setParams({}) puts the lesson's back.
// The inputs live in the scene objects below (OHM.R, CELL.RL, …), so every importer reads the current values.

export const E_CH = 1.60e-19;          // C
export const SLOW = 1;                 // the clock runs at life speed unless a scene says otherwise

// ---------- current in a copper wire ----------
// 1.0 A in a 1.0 mm² copper wire (set by setParams: I, A, and the derived values)
export const CU = { n: 8.5e28, sigma: 5.96e7, A: 1.0e-6, I: 1.0, m: 9.11e-31, wave: null };
// a question's changing current: wave [a, b, T] is I = a t − b t² from 0 to T (then CU.I is its peak, for the drawing)
export const wireI = t => { if (!CU.wave) return CU.I; const [a, b, T] = CU.wave, u = Math.min(Math.max(t, 0), T); return a * u - b * u * u; };
export const wireQ = t => { if (!CU.wave) return CU.I * t; const [a, b, T] = CU.wave, u = Math.min(Math.max(t, 0), T); return a * u * u / 2 - b * u ** 3 / 3; };
// Drude: each electron speeds up from rest, hits an ion, stops, and starts again. A sawtooth whose
// average is the drift speed: v = 2 v_d (t mod T)/T, so x = v_d T per collision.
export const drudeV = (t, T, vd) => { const r = ((t % T) + T) % T; return 2 * vd * r / T; };
export const drudeX = (t, T, vd) => { const n = Math.floor(t / T), r = t - n * T; return n * vd * T + vd * r * r / T; };

// ---------- resistance of a wire: R = ρL/A ----------
export const RHO = { copper: 1.68e-8, aluminium: 2.65e-8, tungsten: 5.6e-8, nichrome: 1.10e-6 };
export const area = d => Math.PI * d * d / 4;
export const resistance = (rho, L, A) => rho * L / A;
// L: a question's fixed length (null: it breathes between Lmin and Lmax)
export const RES = { rho: RHO.nichrome, V: 1.5, dThin: 0.5e-3, dThick: 1.0e-3, Lmin: 0.5, Lmax: 2.0, T: 12, L: null };
export const resLength = t => RES.L ?? (RES.Lmin + RES.Lmax) / 2 - (RES.Lmax - RES.Lmin) / 2 * Math.cos(2 * Math.PI * t / RES.T);
export const rThin = L => resistance(RES.rho, L, area(RES.dThin));
export const rThick = L => resistance(RES.rho, L, area(RES.dThick));

// ---------- circuits: modified nodal analysis ----------
// edge: { n, a, b, R } a resistor (current a→b = (Va − Vb)/R)
//       { n, a, b, E } an ideal battery, b is its + end: Vb − Va = E (current a→b through it)
//       { a, b }       an ideal wire: a 0 V source, so its current comes out of the solve too
// Returns V (by point) and I (by edge index, a→b).
export function solve(edges, ground) {
  const pts = [...new Set(edges.flatMap(e => [e.a, e.b]))].filter(p => p !== ground);
  const idx = new Map(pts.map((p, i) => [p, i]));
  const src = edges.map((e, i) => (e.R === undefined ? i : -1)).filter(i => i >= 0);
  const n = pts.length, N = n + src.length;
  const A = Array.from({ length: N }, () => new Array(N).fill(0)), z = new Array(N).fill(0);
  const at = p => (p === ground ? -1 : idx.get(p));
  edges.forEach(e => {
    if (e.R === undefined) return;
    const g = 1 / e.R, i = at(e.a), j = at(e.b);
    if (i >= 0) A[i][i] += g; if (j >= 0) A[j][j] += g;
    if (i >= 0 && j >= 0) { A[i][j] -= g; A[j][i] -= g; }
  });
  src.forEach((ei, k) => {
    const e = edges[ei], i = at(e.a), j = at(e.b), r = n + k;
    if (i >= 0) { A[i][r] += 1; A[r][i] -= 1; }
    if (j >= 0) { A[j][r] -= 1; A[r][j] += 1; }
    z[r] = e.E || 0;
  });
  const x = gauss(A, z);
  const V = { [ground]: 0 }; pts.forEach((p, i) => { V[p] = x[i]; });
  const I = edges.map((e, i) => (e.R === undefined ? x[n + src.indexOf(i)] : (V[e.a] - V[e.b]) / e.R));
  return { V, I };
}
function gauss(A, b) {
  const N = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < N; c++) {
    let p = c; for (let r = c + 1; r < N; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = 0; r < N; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= N; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[N] / r[i]);
}
export const edgeI = (C, sol, name) => sol.I[C.edges.findIndex(e => e.n === name)];
const W = (a, b) => ({ a, b });

// Ohm's law: 6 V across 3 Ω
export const OHM = { E: 6, R: 3, ground: 'bl' };
// power: a 24 Ω bulb on 12 V (a question may put n = 2 in series, or ramp the voltage up from 0 over `ramp` s)
export const BULB = { E: 12, R: 24, ground: 'bl', run: 10, n: 1, ramp: null };
export const bulbE = t => (BULB.ramp ? BULB.E * Math.min(Math.max(t, 0), BULB.ramp) / BULB.ramp : BULB.E);
export const bulbP = t => bulbE(t) ** 2 / (BULB.n * BULB.R);                      // all the bulbs together
export const bulbEnergy = t => (BULB.ramp ? BULB.E ** 2 / (BULB.n * BULB.R) * Math.min(t, BULB.ramp) ** 3 / (3 * BULB.ramp ** 2) : bulbP(t) * t);
// a real battery: emf 12 V with 2 Ω inside, driving a bulb whose resistance sweeps 0.5–8 Ω (RL: a question's fixed bulb)
export const CELL = { E: 12, r: 2, ground: 'n0', Rmin: 0.5, Rmax: 8, T: 14, RL: null };
export const cellLoad = t => CELL.RL ?? CELL.Rmin * (CELL.Rmax / CELL.Rmin) ** (0.5 - 0.5 * Math.cos(2 * Math.PI * t / CELL.T));
export const cellEdges = RL => [{ n: 'emf', a: 'n0', b: 'm', E: CELL.E }, { n: 'r', a: 'm', b: 'p', R: CELL.r, small: true }, W('p', 'tr'), { n: 'load', a: 'tr', b: 'br', R: RL, kind: 'bulb' }, W('br', 'n0')];
export const cellI = RL => CELL.E / (RL + CELL.r);
export const terminalV = I => CELL.E - I * CELL.r;
export const loadP = RL => cellI(RL) ** 2 * RL;
// series: 2 Ω and 4 Ω on 9 V (the organizer's)
export const SERIES = { E: 9, R1: 2, R2: 4, ground: 'br' };
// parallel: 2, 4 and 6 Ω on 9 V (a question may have more branches: ground is the last right-rail point)
export const PARALLEL = { E: 9, R: [2, 4, 6], ground: 'r3' };
export const seriesR = rs => rs.reduce((s, r) => s + r, 0);
export const parallelR = rs => 1 / rs.reduce((s, r) => s + 1 / r, 0);
// a combination circuit, reduced in three steps (the organizer's, with 2 + 4 + 2... = 8 Ω).
// A question may short R1 (R1 = 0, drawn as a wire) or break R3 (R3 = Infinity: no current).
export const COMBO = { E: 9, R1: 2, R2: 4, R3: 2, R4: 2, R5: 2, ground: 'b' };
export let COMBO_STAGES;
// Kirchhoff: two batteries, five resistors (the organizer's). Its answers I1 0.52, I2 0.33, I3 0.19 A
// hold with the 6 V battery's + end at the bottom (flip = true); drawn + at the top, I3 comes out negative.
// E2 is signed: negative turns it over (+ end on top); 0 is a plain wire.
export const KIRCH = { E1: 12, E2: 6, R1: 10, R2: 10, R3: 20, R4: 20, R5: 5, ground: 'bl' };
export const kirchEdges = (flip = true) => {
  const K = KIRCH, up = (K.E2 < 0) !== !!flip;
  return [
    { n: 'E1', a: 'bl', b: 'z', E: K.E1 }, { n: 'R1', a: 'z', b: 'a', R: K.R1 }, { n: 'R3', a: 'a', b: 'tr', R: K.R3 },
    K.E2 === 0 ? { n: 'E2', ...W('tr', 'br') } : up ? { n: 'E2', a: 'tr', b: 'br', E: Math.abs(K.E2) } : { n: 'E2', a: 'br', b: 'tr', E: Math.abs(K.E2) },
    { n: 'R4', a: 'br', b: 'b', R: K.R4 }, { n: 'R5', a: 'a', b: 'b', R: K.R5 }, { n: 'R2', a: 'b', b: 'bl', R: K.R2 }];
};
KIRCH.loops = [['z', 'a', 'b', 'bl', 'z'], ['a', 'tr', 'br', 'b', 'a']];

// ---------- RC: charge through R, then flip the switch and discharge ----------
export const RC = { E: 12, R: 20e3, C: 100e-6 };
export const qCharge = t => RC.Qmax * (1 - Math.exp(-t / RC.tau));
export const iCharge = t => RC.Imax * Math.exp(-t / RC.tau);
export let Q0;                        // what the capacitor holds when the switch flips
export const qDischarge = t => Q0 * Math.exp(-t / RC.tau);
export const iDischarge = t => -Q0 / (RC.R * RC.C) * Math.exp(-t / RC.tau);   // reversed
// the circuit (switch drawn separately): bat bl→sa (+ at sa), blade sa|sb → pv, R pv→ct, C ct→cb, wires
export let RC_EDGES;
export function rc(t) {
  const c = ((t % RC.cycle) + RC.cycle) % RC.cycle, charging = c < RC.Tch, s = charging ? c : c - RC.Tch;
  const Q = charging ? qCharge(s) : qDischarge(s), I = charging ? iCharge(s) : iDischarge(s);   // I: pv → ct
  const Vc = Q / RC.C, VR = I * RC.R;
  // potentials, bottom wire = 0
  const V = { bl: 0, cb: 0, pm: 0, sb: 0, sa: RC.E, ct: Vc, pv: charging ? RC.E : 0 };
  // currents a→b for each edge: the loop is bat-R-C-bottom while charging, R-C-rung while discharging
  const Ie = charging ? [I, I, I, I, I, 0] : [0, I, I, I, 0, I];
  return { c, s, charging, Q, I, Vc, VR, V, I_e: Ie };
}

// ---------- the numbers in force ----------
export const DEFAULTS = { WIRE_I: 1.0, WIRE_A: 1.0e-6, WAVE: null, RES_L: null, OHM_E: 6, OHM_R: 3, BULB_E: 12, BULB_R: 24, BULB_N: 1, BULB_RAMP: null,
  CELL_E: 12, CELL_r: 2, CELL_R: null, SER_E: 9, SER_R: [2, 4], PAR_E: 9, PAR_R: [2, 4, 6], COMBO_R1: 2, COMBO_R3: 2, KIRCH_E2: 6,
  RC_E: 12, RC_R: 20e3, RC_C: 100e-6 };
export function setParams(p = {}) {
  const q = { ...DEFAULTS, ...p };
  CU.wave = q.WAVE;
  CU.I = CU.wave ? CU.wave[0] ** 2 / (4 * CU.wave[1]) : q.WIRE_I;   // a wave's peak, I = a²/4b at t = a/2b
  CU.A = q.WIRE_A;
  CU.vd = CU.I / (CU.n * E_CH * CU.A);               // 7.35e-5 m/s
  CU.J = CU.I / CU.A;                                // 1.0e6 A/m²
  CU.E = CU.J / CU.sigma;                            // 0.0168 V/m
  CU.r = Math.sqrt(CU.A / Math.PI);                  // 0.564 mm
  CU.tauC = CU.m * CU.sigma / (CU.n * E_CH * E_CH);  // Drude time between collisions, 2.5e-14 s
  CU.hours = 1 / CU.vd / 3600;                       // time to drift 1 m
  RES.L = q.RES_L;
  OHM.E = q.OHM_E; OHM.R = q.OHM_R;
  OHM.edges = [{ n: 'bat', a: 'bl', b: 'tl', E: OHM.E }, W('tl', 'tr'), { n: 'R', a: 'tr', b: 'br', R: OHM.R }, W('br', 'bl')];
  BULB.E = q.BULB_E; BULB.R = q.BULB_R; BULB.n = q.BULB_N; BULB.ramp = q.BULB_RAMP;
  BULB.edges = [{ n: 'bat', a: 'bl', b: 'tl', E: BULB.E }, { n: 'bulb', a: 'tl', b: 'tr', R: BULB.R, kind: 'bulb' },
    BULB.n > 1 ? { n: 'bulb2', a: 'tr', b: 'br', R: BULB.R, kind: 'bulb' } : W('tr', 'br'), W('br', 'bl')];
  CELL.E = q.CELL_E; CELL.r = q.CELL_r; CELL.RL = q.CELL_R;
  SERIES.E = q.SER_E; [SERIES.R1, SERIES.R2] = q.SER_R;
  SERIES.edges = [{ n: 'bat', a: 'br', b: 'bl', E: SERIES.E }, W('bl', 'tl'), { n: 'R1', a: 'tl', b: 'tm', R: SERIES.R1 }, { n: 'R2', a: 'tm', b: 'tr', R: SERIES.R2 }, W('tr', 'br')];
  // n branches R1…Rn between rails l and r; the battery on the last rung (r_n → l_n); then the rails
  const P = PARALLEL, nb = q.PAR_R.length, k = [...Array(nb).keys()];
  P.E = q.PAR_E; P.R = [...q.PAR_R]; P.ground = 'r' + nb;
  P.edges = [...k.map(i => ({ n: 'R' + (i + 1), a: 'l' + i, b: 'r' + i, R: P.R[i] })), { n: 'bat', a: 'r' + nb, b: 'l' + nb, E: P.E },
    ...k.map(i => W('l' + (nb - i), 'l' + (nb - i - 1))), ...k.map(i => W('r' + i, 'r' + (i + 1)))];
  const C = COMBO, short = q.COMBO_R1 === 'short';
  C.R1 = short ? 0 : q.COMBO_R1; C.R3 = q.COMBO_R3 === 'open' ? Infinity : q.COMBO_R3;
  C.R245 = seriesR([C.R2, C.R4, C.R5]);   // 8 Ω
  C.R2345 = parallelR([C.R3, C.R245]);     // 1.6 Ω
  C.Req = C.R1 + C.R2345;                  // 3.6 Ω
  const r1 = (a, b) => (short ? { n: 'R1', ...W(a, b) } : { n: 'R1', a, b, R: C.R1 });
  COMBO_STAGES = [
    [r1('tl', 'a'), { n: 'R2', a: 'a', b: 'tr', R: C.R2 }, { n: 'R4', a: 'tr', b: 'br', R: C.R4 }, { n: 'R5', a: 'br', b: 'b', R: C.R5 }, { n: 'R3', a: 'a', b: 'b', R: C.R3 }, { n: 'bat', a: 'b', b: 'bl', E: C.E }, W('bl', 'tl')],
    [r1('tl', 'a'), W('a', 'tr'), { n: 'R245', a: 'tr', b: 'br', R: C.R245 }, W('br', 'b'), { n: 'R3', a: 'a', b: 'b', R: C.R3 }, { n: 'bat', a: 'b', b: 'bl', E: C.E }, W('bl', 'tl')],
    [r1('tl', 'tr'), { n: 'R2345', a: 'tr', b: 'br', R: C.R2345 }, W('br', 'b'), { n: 'bat', a: 'b', b: 'bl', E: C.E }, W('bl', 'tl')],
    [{ n: 'Req', a: 'tl', b: 'tr', R: C.Req }, W('tr', 'br'), W('br', 'b'), { n: 'bat', a: 'b', b: 'bl', E: C.E }, W('bl', 'tl')],
  ];
  KIRCH.E2 = q.KIRCH_E2;
  KIRCH.edges = kirchEdges(true);
  RC.E = q.RC_E; RC.R = q.RC_R; RC.C = q.RC_C;
  RC.tau = RC.R * RC.C;                 // 2.0 s
  RC.Qmax = RC.E * RC.C;                // 1.2 mC
  RC.Imax = RC.E / RC.R;                // 0.6 mA
  RC.Tch = 5 * RC.tau;                  // charge for 5τ, then discharge for 5τ
  RC.cycle = 2 * RC.Tch;
  Q0 = qCharge(RC.Tch);
  RC_EDGES = [{ n: 'bat', a: 'bl', b: 'sa', E: RC.E }, { n: 'R', a: 'pv', b: 'ct', R: RC.R }, { n: 'C', a: 'ct', b: 'cb', kind: 'cap' }, W('cb', 'pm'), W('pm', 'bl'), W('pm', 'sb')];
}
setParams();
