// The figure: one scene per idea, spread along +x, the camera flying between them page by page.
// Counts are bars and blocks on graph paper; expected counts are ghosts beside or around them; the gaps between the two
// are red, and so is what they add up to. Red marks the thing that matters on the page; blue the second thing.
import * as THREE from 'three';
import { graphBoard, curve, liveCurve, dot, putAt, rod, setRod, bars, region, V } from '../kit.js';
import { part, box, lines, shadeMat } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x
export const ST = { gof: 0, sim: 34, curve: 66, family: 96, table: 128, designs: 162, tcurve: 194, choose: 224 };

const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const f2 = x => x.toFixed(2);
const e1 = x => +x.toFixed(1);
// a thin dashed line between two world points
function dashed(parent, a, b, color = '#8a8a8f') {
  const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
  const l = new THREE.Line(geo, new THREE.LineDashedMaterial({ color, dashSize: 0.12, gapSize: 0.08 }));
  l.userData = { noEdge: true }; l.computeLineDistances(); parent.add(l);
  return l;
}
const unit = new THREE.BoxGeometry(1, 1, 1);
// a box placed and sized every frame (never moved by the explode springs)
const block = (parent, pal, name, opts = {}) => { const m = part(parent, unit, { pal, tone: 'mid', name, ...opts }); m.userData.home = null; return m; };
const ballGeo = new THREE.SphereGeometry(1, 16, 12);
const ball = (parent, r, pal, name) => { const m = part(parent, ballGeo, { pal, tone: 'mid', name }); m.scale.setScalar(r); m.userData.home = null; return m; };
// a box resting on (x, y0, z) with size (w, h, d)
const stand = (m, x, y0, z, w, h, d) => { m.visible = h > 1e-3; m.scale.set(w, Math.max(h, 1e-3), d); m.position.set(x, y0 + h / 2, z); };

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];

  // ---------- the opener, 8.2, 8.3: one bag of 200 candies against the maker's claim ----------
  {
    const B = graphBoard(root, { at: [ST.gof - 8, 0, 0], x: [0, M.K], y: [0, 60], unit: [1.5, 0.1], grid: [0, 10], ticks: [1, 20] });
    const S = graphBoard(root, { at: [ST.gof + 3.6, 0, 0], x: [0, 1], y: [0, 14], unit: [1.5, 0.42], grid: [0, 2], ticks: [1, 2] });
    const og = asm('observed', root, { title: 'Observed counts', sub: `the ${M.GOF.n} candies in the bag, by colour` });
    const ob = bars(B, og, M.K, { pal: 'ink', tone: 'mid', depth: 0.3, opacity: 1, name: 'Observed' });
    const eg = asm('expected', root, { title: 'Expected counts', sub: `n × p for each colour, if the claim is true` });
    const eb = bars(B, eg, M.K, { pal: 'blue', tone: 'lo', depth: 0.3, opacity: 0.4, name: 'Expected' });
    // expected levels as solid lids, so the ghosts read at a glance
    const lids = bars(B, eg, M.K, { pal: 'blue', tone: 'mid', depth: 0.32, opacity: 1, name: 'Expected count' });
    lids.set(M.EXP.map((e, i) => [i + 0.52, i + 0.9, 0]));
    lids.children.forEach((m, i) => { m.visible = true; m.scale.set(0.38 * B.ux - 0.01, 0.05, 0.32); m.position.copy(B.P(i + 0.71, M.EXP[i], 0.16)); });
    const gg = asm('gaps', root, { title: 'The gaps, O − E', sub: 'how far each colour’s count lands from what the claim predicts' });
    const gaps = M.OBS.map(() => rod(gg, { r: 0.06, name: 'O − E' }));
    const caps = M.OBS.map(() => [rod(gg, { r: 0.03, name: 'O − E' }), rod(gg, { r: 0.03, name: 'O − E' })]);
    const sg = asm('stack', root, { title: 'χ², built cell by cell', sub: 'each block is one colour’s (O − E)²/E' });
    const blocks = M.CON.map((_, i) => block(sg, 'red', M.GOF.cats[i], { tone: i % 2 ? 'mid' : 'hi' }));
    dashed(root, S.P(-0.05, M.CRIT, 0.02), S.P(1.05, M.CRIT, 0.02), '#3d63a8');
    eb.set(M.EXP.map((e, i) => [i + 0.52, i + 0.9, e]));
    let st = M.gofAt(0);
    const stackTop = () => { let y = 0; for (let i = 0; i < M.K; i++) if (st.cells > i) y += M.CON[i] * Math.min(st.cells - i, 1); return y; };
    labels.push(...B.tickLabels({ xTicks: false, xName: '', yName: 'count', skipY: [60] }), ...S.tickLabels({ xTicks: false, xName: '', yName: 'χ²', skipY: [14] }),
      ...M.GOF.cats.map((c, i) => mark(c, () => B.P(i + 0.5, 0).add(V(0, -0.35, 0)))),
      ...M.GOF.cats.map((c, i) => live(() => B.P(i + 0.29, st.counts[i]).add(V(0, 0.32, 0.3)), () => `${st.counts[i]}`)),
      ...M.EXP.map((e, i) => mark(`${e1(e)}`, () => B.P(i + 0.71, e).add(V(0, 0.32, 0.3)))),
      mark('observed', () => B.P(0.3, 60).add(V(0, 0.75, 0)), 'board'), mark('<span style="color:#3d63a8">expected</span>', () => B.P(1.5, 60).add(V(0, 0.75, 0)), 'board'),
      live(() => B.P(4.6, 60).add(V(0, 0.75, 0)), () => `${st.m} of ${M.GOF.n} counted`),
      mark(`<span style="color:#3d63a8">χ²* = ${f2(M.CRIT)}</span>`, () => S.P(0, M.CRIT).add(V(-1.25, 0, 0))),
      ...M.GOF.cats.map((c, i) => live(() => st.cells >= i + 1 && M.CON[i] > 0.3 ? S.P(1, M.CON.slice(0, i).reduce((a, b) => a + b, 0) + M.CON[i] / 2).add(V(0.85, 0, 0.2)) : null, () => `${c} ${f2(M.CON[i])}`)),
      live(() => S.P(0.5, stackTop()).add(V(0, 0.45, 0.2)), () => st.cells > 0 ? `<span style="color:#e5484d">χ² = ${f2(stackTop())}</span>` : ''));
    ups.push(s => {
      st = M.gofAt(M.clk(s, 'gof'));
      ob.set(st.counts.map((o, i) => [i + 0.1, i + 0.48, o]));
      let y = 0;
      M.CON.forEach((c, i) => {
        const u = Math.min(Math.max(st.cells - i, 0), 1), on = u > 0;
        const a = B.P(i + 0.5, M.EXP[i], 0.4), b = B.P(i + 0.5, M.EXP[i] + (M.OBS[i] - M.EXP[i]) * M.smooth(u * 2), 0.4);
        gaps[i].visible = on; caps[i][0].visible = caps[i][1].visible = on;
        if (on) { setRod(gaps[i], a, b); setRod(caps[i][0], a.clone().add(V(-0.12, 0, 0)), a.clone().add(V(0.12, 0, 0))); setRod(caps[i][1], b.clone().add(V(-0.12, 0, 0)), b.clone().add(V(0.12, 0, 0))); }
        const h = c * S.uy, drop = (1 - M.smooth(u)) * 3;
        blocks[i].visible = on;
        if (on) { const p = S.P(0.5, y + c / 2, 0.3); blocks[i].scale.set(0.8 * S.ux, Math.max(h - 0.03, 0.01), 0.6); blocks[i].position.set(p.x, p.y + drop, p.z); }
        if (st.cells >= i + 1) y += c;
      });
    });
  }

  // ---------- 8.1 samples drawn as if the claim were true: each one's χ² lands in a dot plot ----------
  {
    const L = graphBoard(root, { at: [ST.sim - 10.6, 0.8, 0], x: [0, M.K], y: [0, 60], unit: [0.8, 0.07], grid: [0, 10], ticks: [1, 20] });
    const D = graphBoard(root, { at: [ST.sim - 3.4, 0, 0], x: [0, 22], y: [0, 30], unit: [0.5, 0.17], grid: [2, 5], ticks: [4, 10] });
    const lg = asm('simSample', root, { title: 'One simulated bag', sub: `${M.GOF.n} candies drawn from the claimed mix` });
    const lb = bars(L, lg, M.K, { pal: 'ink', depth: 0.2, opacity: 1, name: 'Simulated count' });
    const le = bars(L, lg, M.K, { pal: 'blue', tone: 'lo', depth: 0.2, opacity: 0.4, name: 'Expected' });
    le.set(M.EXP.map((e, i) => [i + 0.52, i + 0.9, e]));
    const dg = asm('simDots', root, { title: 'The simulated χ² values', sub: 'one dot per bag; red: at least as large as the real bag’s' });
    const dots = M.SIM_CHI.map((x, i) => {
      const m = ball(dg, 0.08, x >= M.CHI ? 'red' : 'ink', x >= M.CHI ? 'At or beyond the observed χ²' : 'Simulated χ²');
      m.position.copy(D.P((M.SIM_BIN[i] + 0.5) * M.SIM.bin, M.SIM_LEVEL[i] + 0.5, 0.1));
      return m;
    });
    const cg = asm('simCurve', root, { title: 'The χ² distribution, df = 5', sub: 'what the dots pile up toward' });
    curve(D, cg, x => M.SIM.n * M.SIM.bin * M.chiPdf(x, M.DF), 0.05, 22, { pal: 'dark', r: 0.03 });
    const og = asm('simObs', root, { title: 'The real bag’s χ²', sub: `${f2(M.CHI)}: how often does chance alone reach it?` });
    setRod(rod(og, { r: 0.04, name: 'Observed χ²' }), D.P(M.CHI, 0, 0.12), D.P(M.CHI, 28, 0.12));
    let k = 0;
    labels.push(...L.tickLabels({ xTicks: false, xName: '', yName: 'count', skipY: [60] }), ...D.tickLabels({ xName: 'χ²', yName: 'bags', skipY: [30] }),
      mark('one simulated bag', () => L.P(0.3, 60).add(V(0, 0.55, 0)), 'board'),
      mark(`observed χ² = ${f2(M.CHI)}`, () => D.P(M.CHI, 28).add(V(0.15, 0.3, 0)), 'board'),
      live(() => D.P(17, 20), () => `bags: ${k}<br>χ² ≥ ${f2(M.CHI)}: ${M.SIM_CHI.slice(0, k).filter(x => x >= M.CHI).length}`),
      live(() => k ? L.P(3, 0).add(V(0, -0.45, 0)) : null, () => `χ² = ${f2(M.SIM_CHI[k - 1])}`));
    ups.push(s => {
      k = M.simShown(M.clk(s, 'sim'));
      dots.forEach((m, i) => { m.visible = i < k; });
      const o = M.SIM_COUNTS[Math.max(k - 1, 0)];
      lb.set(o.map((v, i) => [i + 0.1, i + 0.48, k ? v : 0]));
    });
  }

  // ---------- a χ² curve with the statistic, its tail (the p-value) and the critical value ----------
  function pvalue(x0, df, stat, crit, keys, what) {
    const B = graphBoard(root, { at: [x0 - 6, 0, 0], x: [0, 20], y: [0, 0.2], unit: [0.6, 28], grid: [2, 0.02], ticks: [4, 0.05] });
    const pg = asm(keys[0], root, { title: `The χ² distribution, df = ${df}`, sub: `how χ² varies from sample to sample when H₀ is true` });
    curve(B, pg, x => M.chiPdf(x, df), 0.02, 20, { r: 0.045, pal: 'ink', n: 300 });
    const tg = asm(keys[1], root, { title: 'The p-value', sub: `the area at or beyond χ² = ${f2(stat)}` });
    const rg = region(B, tg, { pal: 'red', opacity: 0.45 }); rg.set(() => 0, x => M.chiPdf(x, df), stat, 20);
    // a thin solid edge so the tail can be picked and lit
    curve(B, tg, x => M.chiPdf(x, df), stat, 20, { r: 0.05, pal: 'red', n: 120 });
    const sg = asm(keys[2], root, { title: `The ${what} χ²`, sub: f2(stat) });
    setRod(rod(sg, { r: 0.04, name: 'χ²' }), B.P(stat, 0, 0.08), B.P(stat, M.chiPdf(stat, df) + 0.03, 0.08));
    const cg = asm(keys[3], root, { title: 'The critical value χ²*', sub: `the top 5% of the distribution starts at ${f2(crit)}` });
    setRod(rod(cg, { r: 0.025, pal: 'blue', name: 'χ²*' }), B.P(crit, 0, 0.06), B.P(crit, 0.12, 0.06));
    labels.push(...B.tickLabels({ xName: 'χ²', yName: 'density', skipY: [B.y1] }),
      mark(`df = ${df}`, () => B.P(df, M.chiPdf(df, df) + 0.03).add(V(0.6, 0.2, 0)), 'board'),
      mark(`<span style="color:#e5484d">χ² = ${f2(stat)}</span>`, () => B.P(stat, M.chiPdf(stat, df) + 0.03).add(V(0, 0.3, 0))),
      mark(`<span style="color:#3d63a8">χ²* = ${f2(crit)}</span>`, () => B.P(crit, 0.12).add(V(0, 0.3, 0))),
      mark(`<span style="color:#e5484d">p = ${M.pUpper(stat, df).toFixed(stat > 14 ? 4 : 3)}</span>`, () => B.P(stat + 2.6, 0.035).add(V(0, 0, 0))));
    return B;
  }
  pvalue(ST.curve, M.DF, M.CHI, M.CRIT, ['pdf', 'tail', 'stat', 'crit'], 'observed');
  pvalue(ST.tcurve, M.DF_T, M.CHI_T, M.CRIT_T, ['tPdf', 'tTail', 'tStat', 'tCrit'], 'table’s');

  // ---------- 8.3 the χ² family: right-skewed, centred at df ----------
  {
    const B = graphBoard(root, { at: [ST.family - 6, 0, 0], x: [0, 24], y: [0, 0.3], unit: [0.5, 18], grid: [2, 0.05], ticks: [4, 0.1] });
    const fg = asm('fam', root, { title: 'Four χ² distributions', sub: `df = ${M.FAM.dfs.join(', ')}` });
    M.FAM.dfs.forEach(df => curve(B, fg, x => M.chiPdf(x, df), 0.02, 24, { r: 0.03, pal: 'dark', n: 300, name: `df = ${df}` }));
    const lg = asm('famLive', root, { title: 'One χ² distribution and its mean', sub: 'the mean is df: more categories, a curve further right' });
    const lc = liveCurve(B, lg, { pal: 'red', r: 0.05, n: 240 });
    const mean = rod(lg, { r: 0.03, name: 'Mean = df' }), md = dot(lg, { pal: 'red', r: 0.13, name: 'Mean = df' });
    let df = 1;
    labels.push(...B.tickLabels({ xName: 'χ²', yName: 'density', skipY: [B.y1] }),
      ...M.FAM.dfs.filter(d => d > 1).map(d => mark(`${d}`, () => B.P(M.mode(d), M.chiPdf(M.mode(d), d)).add(V(0.3, 0.25, 0)))),
      mark('1', () => B.P(1.2, 0.28)),
      live(() => B.P(df, 0).add(V(0, -0.65, 0)), () => `<span style="color:#e5484d">mean = ${df}</span>`),
      live(() => B.P(16, 0.24), () => `df = ${df}`, 'board'));
    ups.push(s => {
      df = M.famDf(M.clk(s, 'family'));
      lc.set(x => M.chiPdf(x, df), df === 1 ? 0.05 : 0.01, 24);
      const top = Math.min(M.chiPdf(df, df), 0.3);
      setRod(mean, B.P(df, 0, 0.06), B.P(df, top, 0.06)); putAt(B, md, df, 0, 0.1);
    });
  }

  // ---------- 8.4, 8.6 the two-way table as blocks: observed, expected from the margins, contributions ----------
  {
    const PITCH = 2.2, HS = 0.018, X0 = ST.table - 8.2, Z0 = -2.2;
    const cx = j => X0 + j * PITCH, cz = i => Z0 + i * PITCH;
    part(root, box(4 * PITCH + 0.4, 0.06, 4 * PITCH + 0.4, 0.01), { pal: 'board', tone: 'faint', pos: [cx(1.5), -0.04, cz(1.5)] });
    const og = asm('tObs', root, { title: 'Observed counts', sub: `${M.NT} adults, by age group and main news source` });
    const eg = asm('tExp', root, { title: 'Expected counts', sub: 'row total × column total / table total' });
    const mg = asm('margins', root, { title: 'The margins', sub: 'row totals, column totals, and the table total' });
    const ghostMat = shadeMat('blue', { opacity: 0.16 });
    const lidsN = [], lidsR = [];
    M.TO.forEach((row, i) => row.forEach((o, j) => {
      stand(block(og, 'ink', `${M.TAB.rows[i]}, ${M.TAB.cols[j]}`), cx(j), 0, cz(i), 0.8, o * HS, 0.8);
      const e = M.TE[i][j];
      stand(part(eg, unit, { pal: 'blue', tone: 'lo', name: 'Expected', mat: ghostMat }), cx(j), 0, cz(i), 1.0, e * HS, 1.0);
      const ln = block(eg, 'blue', 'Expected count'), lr = block(eg, 'red', 'Expected count, being worked out');
      stand(ln, cx(j), e * HS - 0.02, cz(i), 1.02, 0.04, 1.02); stand(lr, cx(j), e * HS - 0.03, cz(i), 1.1, 0.07, 1.1);
      lidsN.push(ln); lidsR.push(lr);
    }));
    const tile = (x, z, name) => [block(mg, 'dark', name), block(mg, 'blue', name)].map(m => (stand(m, x, 0, z, 1.2, 0.12, 1.2), m));
    const rowT = M.ROWT.map((_, i) => tile(cx(3), cz(i), 'Row total')), colT = M.COLT.map((_, j) => tile(cx(j), cz(3), 'Column total'));
    const grand = tile(cx(3), cz(3), 'Table total'); grand[1].visible = false;
    // contributions, to the right, and their stack
    const CX = X0 + 4 * PITCH + 1.8, cxc = j => CX + j * PITCH, CS = 0.42;
    part(root, box(3 * PITCH + 0.4, 0.06, 3 * PITCH + 0.4, 0.01), { pal: 'board', tone: 'faint', pos: [cxc(1), -0.04, cz(1)] });
    const kg = asm('tContrib', root, { title: 'Each cell’s contribution', sub: '(O − E)²/E; together they make χ²' });
    M.TC.forEach((row, i) => row.forEach((c, j) => stand(block(kg, 'red', `${M.TAB.rows[i]}, ${M.TAB.cols[j]}`, { tone: c === Math.max(...M.TC.flat()) ? 'hi' : 'mid' }), cxc(j), 0, cz(i), 0.8, c * CS, 0.8)));
    const sk = asm('tStack', root, { title: 'χ² for the table', sub: `the nine contributions stacked: ${f2(M.CHI_T)}` });
    let y = 0;
    M.TC.flat().forEach((c, k) => { stand(block(sk, 'red', 'Contribution', { tone: k % 2 ? 'mid' : 'hi' }), cxc(3.1), y * 0.25, cz(1), 0.8, c * 0.25 - 0.02, 0.8); y += c; });
    let cur = [0, 0];
    labels.push(
      live(() => V(cx(cur[1]), Math.max(M.TO[cur[0]][cur[1]], M.TE[cur[0]][cur[1]]) * HS + 0.5, cz(cur[0])), () => `O ${M.TO[cur[0]][cur[1]]} · <span style="color:#e5484d">E ${f2(M.TE[cur[0]][cur[1]])}</span>`, 'board'),
      ...M.TAB.rows.map((r, i) => mark(r, () => V(cx(0) - 1.45, 0.1, cz(i)))),
      ...M.TAB.cols.map((c, j) => mark(c, () => V(cx(j), 0.1, cz(0) - 1.35))),
      ...M.ROWT.map((t, i) => mark(`${t}`, () => V(cx(3), 0.45, cz(i)))), ...M.COLT.map((t, j) => mark(`${t}`, () => V(cx(j), 0.45, cz(3)))),
      mark(`${M.NT}`, () => V(cx(3), 0.45, cz(3))), mark('total', () => V(cx(3), 0.1, cz(0) - 1.35)), mark('total', () => V(cx(0) - 1.45, 0.1, cz(3))),
      ...M.TC.flatMap((row, i) => row.map((c, j) => mark(`<span style="color:#b8343a">${f2(c)}</span>`, () => V(cxc(j), c * CS + 0.4, cz(i))))),
      ...M.TAB.cols.map((c, j) => mark(c, () => V(cxc(j), 0.1, cz(2) + 1.35))), ...M.TAB.rows.map((r, i) => mark(r, () => V(cxc(0) - 1.45, 0.1, cz(i)))),
      mark(`<span style="color:#e5484d">χ² = ${f2(M.CHI_T)}</span>`, () => V(cxc(3.1), M.CHI_T * 0.25 + 0.45, cz(1))));
    ups.push(s => {
      cur = M.cellAt(M.clk(s, 'table'));
      const k = cur[0] * M.C + cur[1];
      lidsN.forEach((m, n) => { m.visible = n !== k; lidsR[n].visible = n === k; });
      rowT.forEach(([d, b], i) => { b.visible = i === cur[0]; d.visible = !b.visible; });
      colT.forEach(([d, b], j) => { b.visible = j === cur[1]; d.visible = !b.visible; });
    });
  }

  // ---------- 8.5 one table, two designs: three samples (homogeneity) or one sample (independence) ----------
  {
    const CW = 1.15, CH = 0.95, GAP = 0.4, br = 0.085;
    const design = (key, x0, sep, list, slots, title, sub, src) => {
      const g = asm(key, root, { title, sub });
      const top = 1.2 + 3 * CH + 2 * sep;
      const cell = (i, j) => V(x0 + (j + 0.5) * CW, top - (i + 0.5) * CH - i * sep, 0);
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) part(g, box(CW - 0.08, CH - 0.08, 0.06, 0.01), { pal: 'board', tone: 'lo', name: 'Cell', pos: cell(i, j).add(V(0, 0, -0.05)).toArray() });
      const balls = list.map(() => ball(g, br, 'ink', 'One person'));
      const slotAt = (i, j, s) => cell(i, j).add(V(-CW / 2 + 0.2 + (s % 5) * 0.19, -CH / 2 + 0.2 + Math.floor(s / 5) * 0.19, 0.08));
      const sources = src(cell, g);
      labels.push(mark(title.split(':')[0], () => V(x0 - 1.4, top + 1.25, 0), 'board'),
        ...M.TAB.cols.map((c, j) => mark(c, () => cell(0, j).add(V(0, CH / 2 + 0.25, 0)))));
      return { balls, at: (c, i) => { const [r, col] = list[i], u = M.flight(c, i), a = sources(r), b = slotAt(r, col, slots[i]); return [u, a.clone().lerp(b, u).add(V(0, Math.sin(Math.PI * u) * 0.8, Math.sin(Math.PI * u) * 0.6))]; } };
    };
    const hop = (g, p, name) => part(g, box(0.9, 0.7, 0.6, 0.06), { pal: 'dark', tone: 'mid', name, pos: p.toArray() });
    const H = design('homog', ST.designs - 7.2, GAP, M.HOMO, M.HOMO_SLOT, 'Homogeneity: three samples', 'a separate random sample from each age group, then each person’s news source',
      (cell, g) => { const ps = [0, 1, 2].map(i => cell(i, 0).add(V(-1.6, 0, 0))); ps.forEach((p, i) => { hop(g, p, `${M.TAB.rows[i]} population`); labels.push(mark(M.TAB.rows[i], () => p.clone().add(V(0, 0.6, 0)))); }); return r => ps[r]; });
    const I = design('indep', ST.designs + 1.4, 0, M.INDE, M.INDE_SLOT, 'Independence: one sample', 'one random sample of adults, each classified by age group and by news source',
      (cell, g) => { const p = cell(0, 1).add(V(0, 1.6, 0)); hop(g, p, 'All adults'); labels.push(mark('all adults', () => p.clone().add(V(1.1, 0, 0))), ...M.TAB.rows.map((r, i) => mark(r, () => cell(i, 0).add(V(-CW / 2 - 0.45, 0, 0))))); return () => p; });
    ups.push(s => {
      const c = M.clk(s, 'designs');
      for (const D of [H, I]) D.balls.forEach((m, i) => { const [u, p] = D.at(c, i); m.visible = u > 0; m.position.copy(p); });
    });
  }

  // ---------- 8.7 which procedure? five shapes of categorical data ----------
  {
    const S = 0.45, shapes = {
      c1p: { rows: 1, cols: 2, sep: 0 }, c2p: { rows: 2, cols: 2, sep: 0.22 }, cGof: { rows: 1, cols: 5, sep: 0 },
      cHom: { rows: 3, cols: 3, sep: 0.22 }, cInd: { rows: 3, cols: 3, sep: 0 },
    };
    const tiles = M.PROCS.map((p, k) => {
      const x = ST.choose - 6 + k * 3.0, sh = shapes[p.key];
      const g = asm(p.key, root, { title: p.name.replace(/<[^>]+>/g, ''), sub: { c1p: 'one sample, one variable with two categories', c2p: 'two samples (or groups), one two-category variable', cGof: 'one sample, one variable with several categories', cHom: 'several samples (or groups), one variable', cInd: 'one sample, two variables' }[p.key] });
      part(g, box(2.5, 2.5, 0.08, 0.02), { pal: 'board', tone: 'lo', name: 'Tile', pos: [x, 1.6, -0.06] });
      const h = sh.rows * S + (sh.rows - 1) * sh.sep, w = sh.cols * S;
      for (let i = 0; i < sh.rows; i++) for (let j = 0; j < sh.cols; j++)
        part(g, box(S - 0.05, S - 0.05, 0.2, 0.02), { pal: (i + j) % 2 ? 'dark' : 'ink', tone: 'mid', name: 'Cell', pos: [x - w / 2 + (j + 0.5) * S, 1.6 + h / 2 - (i + 0.5) * S - i * sh.sep, 0.1] });
      const bar = part(g, box(2.3, 0.12, 0.12, 0.02), { pal: 'red', tone: 'hi', name: 'The procedure that fits', pos: [x, 0.1, 0.1] });
      labels.push(mark(p.short, () => V(x, -0.35, 0)));
      return { g, bar };
    });
    let k = 0, show = false;
    labels.push(live(() => V(ST.choose - 7.2, 3.6, 0), () => `${M.SCEN[k].text}`, 'board'));
    ups.push(s => {
      const c = M.clk(s, 'choose'); k = M.scenAt(c); show = (c % M.SCEN_EACH) > M.SCEN_EACH * 0.4;
      tiles.forEach((t, n) => { const on = show && M.PROCS[n].key === M.SCEN[k].key; t.bar.visible = on; t.g.position.z = on ? 0.5 : 0; });
    });
  }

  return { labels, update: s => { for (const f of ups) f(s); } };
}
