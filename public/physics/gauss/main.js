// Chapter 10: Gauss's law, on the shared book.
import { startBook } from '../engine/book.js';
import { buildWorld } from './world.js';
import { PAGES, PLATES, CH, R } from './pages.js';
import * as M from './model.js';

const f = (x, n = 2) => (x < -1e-9 ? '−' : '') + Math.abs(x).toFixed(n);
const rOf = (c, sc) => M.breathe(c, sc.rMin, sc.rMax, sc.T);
// a question's own numbers: the readout gives them, not what follows from them (that is the answer)
let own = false;
function ownReadout(c, scene) {
  const nC = q => f(q * 1e9, 1), cm = r => f(r * 100, 1);
  switch (scene) {
    case 'flux': { const d = M.fluxAngle(c); return `θ ${f(d, 1)}°   cos θ ${f(Math.cos(d * Math.PI / 180))}`; }
    case 'gauss': return `r ${cm(rOf(c, M.POINT))} cm`;
    case 'line': return `λ ${nC(M.LINE.lam)} nC/m   r ${cm(rOf(c, M.LINE))} cm\ncaps: Φ = 0`;
    case 'sheet': return `sheet: σ ${nC(M.SHEET.sigma)} nC/m²\nplate: σ ${nC(M.PLATE.sigma)} nC/m² each face   metal: E = 0`;
    case 'csphere': case 'isphere': case 'nsphere': return `r ${cm(rOf(c, M.SPH))} cm   Q ${f(M.SPH.Q * 1e9)} nC${M.SPH.a ? `\nhollow out to ${cm(M.SPH.a)} cm` : ''}`;
    case 'cage': return M.CAGE.E0 ? `E₀ ${f(M.CAGE.E0, 0)} N/C` : 'E₀ = 0: no field applied\na neutral metal shell';
  }
  return '';
}

startBook({
  no: 10, PAGES, PLATES, clock0: 0,
  lookKeys: [],
  buildWorld(E) {
    const W = buildWorld(E);
    return { update: s => W.update(s), labels: W.labels, setMarks: W.setMarks };
  },
  state: (clock, reduced) => ({ clock: reduced ? 3 : clock * M.SLOW }),
  // ---------- questions (premium): the numbers, and the state at one time ----------
  // every scene runs off the one clock (a breathing radius, a turning square), so a moment t is that clock
  setParams: p => { own = Object.keys(p ?? {}).length > 0; M.setParams(p); },
  stateAt: t => ({ clock: t }),
  rate: () => M.SLOW,
  // one breath of the scene's radius (or one turn of the square there and back)
  runOf: scene => ({ flux: M.FLUX.T, gauss: M.POINT.T, line: M.LINE.T, csphere: M.SPH.T, isphere: M.SPH.T, nsphere: M.SPH.T, rods: M.ROD.T })[scene] ?? 10,
  readout(s, page) {
    const c = s.clock;
    if (own) return ownReadout(c, page.scene);
    switch (page.scene) {
      case 'flux': { const d = M.fluxAngle(c); return `θ ${f(d, 1)}°   cos θ ${f(Math.cos(d * Math.PI / 180))}\nΦ = EA cos θ = ${f(M.flux(d), 1)} N·m²/C`; }
      case 'gauss': { const r = rOf(c, M.POINT), E = M.pointE(r), A = 4 * Math.PI * r * r; return `r ${f(r * 100, 1)} cm   E ${f(E, 0)} N/C\nΦ = E · 4πr² = ${f(E * A, 1)} N·m²/C = q/ε₀`; }
      case 'line': { const r = rOf(c, M.LINE), E = M.lineE(r); return `r ${f(r * 100, 1)} cm   E ${f(E, 0)} N/C\nside: Φ = E · 2πrL = ${f(E * 2 * Math.PI * r * M.LINE.L, 2)} N·m²/C   caps: 0`; }
      case 'sheet': return `sheet: E = σ/2ε₀ = ${f(M.SHEET.E, 0)} N/C\nplate: E = σ/ε₀ = ${f(M.PLATE.E, 0)} N/C   in the metal 0`;
      case 'csphere': case 'isphere': case 'nsphere': {
        const m = { csphere: M.cSphere, isphere: M.iSphere, nsphere: M.nSphere }[page.scene], r = rOf(c, M.SPH);
        return `r ${f(r * 100, 1)} cm   q_enc ${f(m.qenc(r) * 1e9)} nC\nE ${f(m.E(r), 0)} N/C`;
      }
      case 'rods': { const r = rOf(c, M.ROD); return `r ${f(r * 100, 1)} cm\nmetal E ${f(M.cRod.E(r), 0)} N/C   insulator E ${f(M.iRod.E(r), 0)} N/C`; }
      case 'cage': return `E₀ ${f(M.CAGE.E0, 0)} N/C   E in the hollow 0\nσ at the poles ±${f(M.cageSigma(1) * 1e9)} nC/m²`;
    }
    return '';
  },
  onFrame(s, sheets) {
    const q = sel => sheets.flatMap(el => [...el.querySelectorAll(sel)]);
    const put = (key, r, x, y) => q(`circle[data-cursor="${key}"]`).forEach(el => { el.setAttribute('cx', CH.sx(x, r.x0, r.x1)); el.setAttribute('cy', CH.sy(Math.min(y, r.y1), r.y0, r.y1)); });
    const c = s.clock, d = M.fluxAngle(c);
    put('flux', R.flux, d, M.flux(d));
    const rp = rOf(c, M.POINT); put('point', R.point, rp * 100, M.pointE(rp) / 1000);
    const rl = rOf(c, M.LINE); put('line', R.line, rl * 100, M.lineE(rl) / 1000);
    const rs = rOf(c, M.SPH);
    put('csphere', R.sphere, rs * 100, M.cSphere.E(rs) / 1000); put('isphere', R.sphere, rs * 100, M.iSphere.E(rs) / 1000); put('nsphere', R.sphere, rs * 100, M.nSphere.E(rs) / 1000);
    const rr = rOf(c, M.ROD); put('crod', R.rod, rr * 100, M.cRod.E(rr) / 1000); put('irod', R.rod, rr * 100, M.iRod.E(rr) / 1000);
  },
});
