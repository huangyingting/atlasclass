// The figure: one scene per idea, spread along +x, the camera flying between them page by page.
// One school of 200 students (a ball each, dark: has a driver's licence) is sampled four ways and badly; one group of
// volunteers is split into treatments three ways; dot plots on graph paper collect what the samples and the
// re-randomizations give. Red marks the thing that matters on the page; blue the second thing.
import * as THREE from 'three';
import { graphBoard, dot, putAt, rod, setRod, V } from '../kit.js';
import { part, box, lines, shadeMat, arrow, setArrow } from '../engine/parts.js';
import * as M from './model.js';

// where each scene sits along x; the four sampling-method boards stack at the y values in MY
export const ST = { pop: 0, obs: 34, methods: 64, bias: 96, exp: 128, block: 158, pairs: 186, rand: 214, scope: 244 };
export const MY = { srs: 14, strat: 2.8, cluster: -2.8, sys: -8.4 };   // the SRS board stands apart, so its page frames it alone
const SP = 0.46;                                   // spacing of the students on a school board
const RED = '#e5484d', BLUE = '#5b86d6', GREY = '#6e6e74';

const mark = (html, at, cls = 'mark') => ({ cls, html, at });
const live = (at, text, cls = 'mark') => ({ cls, html: '', at, text });
const geos = new Map();
const sphere = r => geos.get(r) ?? geos.set(r, new THREE.SphereGeometry(r, 14, 10)).get(r);
const ball = (parent, pal, name, r = 0.15) => { const m = part(parent, sphere(r), { pal, tone: 'mid', name }); m.userData.home = null; return m; };
const setMat = (m, pal) => { const mat = shadeMat(pal); if (m.material !== mat) m.material = mat; };
const licPal = i => M.LIC[i] ? 'ink' : 'paper';
const f2 = x => x.toFixed(2), f1 = x => x.toFixed(1);
// a faint board behind a group of things
const backing = (parent, cx, cy, w, h) => part(parent, box(w, h, 0.04, 0.01), { pal: 'board', tone: 'faint', pos: [cx, cy, -0.03], name: 'Board' });
// an outlined tray: a rectangle of lines on a faint floor
function tray(parent, cx, cy, w, h, color = GREY, floor = true) {
  const z = 0.02;
  lines(parent, [cx - w / 2, cy - h / 2, z, cx + w / 2, cy - h / 2, z, cx + w / 2, cy - h / 2, z, cx + w / 2, cy + h / 2, z,
    cx + w / 2, cy + h / 2, z, cx - w / 2, cy + h / 2, z, cx - w / 2, cy + h / 2, z, cx - w / 2, cy - h / 2, z], color);
  if (floor) backing(parent, cx, cy, w, h);
}
// eased move between two world points
const lerpV = (out, a, b, u) => out.copy(a).lerp(b, M.smooth(u));

// the school as a board of 200 balls: 25 advisory groups (columns), two rows per grade, a gap between grades
function school(parent, cx, cy) {
  const pos = M.ALL.map(i => { const c = i % M.POP.cols, r = Math.floor(i / M.POP.cols); return V(cx + (c - 12) * SP, cy + 1.85 - r * SP - Math.floor(r / 2) * 0.16, 0.2); });
  backing(parent, cx, cy, M.POP.cols * SP + 0.3, 4.4);
  const balls = pos.map((p, i) => { const m = ball(parent, licPal(i), 'Student'); m.position.copy(p); return m; });
  return { pos, balls };
}
const gradeY = (cy, g) => cy + 1.85 - (2 * g + 0.5) * SP - g * 0.16;
const gradeLabels = (cx, cy) => M.POP.grades.map((gr, g) => mark(`grade ${gr}`, () => V(cx - 6.15, gradeY(cy, g), 0), 'axis'));

export function buildWorld(E) {
  const { scene, asm } = E;
  const root = new THREE.Group(); scene.add(root);
  const labels = [];
  const ups = [];          // per-frame updates, each (state) => void
  const tmp = V();

  // ---------- opener, 3.1, 3.2: the school, one SRS of 20 after another, and the dot plot of their p̂ ----------
  {
    const cx = ST.pop, PY = 4.4, TY = 0.8, DY = -5.0, n = M.POP.n;
    const pg = asm('population', root, { title: 'The population', sub: 'all 200 students of the school; dark: has a driver’s licence' });
    const { pos, balls } = school(pg, cx, PY);
    [['ink', cx + 0.2, 'licence'], ['paper', cx + 2.0, 'none']].forEach(([pal, x, w]) => { ball(pg, pal, 'Key').position.set(x, PY + 2.6, 0.2); labels.push(mark(w, () => V(x + 0.3, PY + 2.6, 0), 'board')); });
    labels.push(...gradeLabels(cx, PY), mark('the population: 200 students', () => V(cx - 5.9, PY + 2.6, 0), 'board'));

    const sg = asm('sample', root, { title: 'A simple random sample', sub: `${n} students, every set of ${n} equally likely to be the one chosen` });
    backing(sg, cx, TY, n * 0.55 + 0.4, 0.75);
    const slot = j => V(cx + (j - (n - 1) / 2) * 0.55, TY, 0.2);
    const trayBalls = Array.from({ length: n }, () => ball(sg, 'paper', 'Sampled student'));
    // each sample in the tray: licence holders first, so the count reads off
    const TRAY = M.SAMPLES.map(s => [...s].sort((a, b) => M.LIC[b] - M.LIC[a] || a - b));

    const B = graphBoard(root, { at: [cx - 0.45 * 15, DY, 0], x: [0.1, 0.8], y: [0, 8], unit: [15, 0.26], grid: [0.05, 0], ticks: [0.1, 0] });
    const dg = asm('dotplot', root, { title: 'The sample proportions', sub: 'one dot per sample: p̂, the share of its 20 with a licence' });
    const dots = M.PHATS.map((_, k) => { const d = dot(dg, { pal: 'ink', r: 0.11, name: `Sample ${k + 1}` }); d.userData.home = null; return d; });
    const prg = asm('param', root, { title: 'The parameter, p', sub: `${M.COUNT} of ${M.N} students: p = ${M.P}` });
    setRod(rod(prg, { pal: 'blue', r: 0.03, name: 'p' }), B.P(M.P, 0, 0.05), B.P(M.P, 8, 0.05));
    let cur = 0, showP = false, done = 0;
    labels.push(...B.tickLabels({ xName: '<i>p̂</i>', yName: '' }),
      mark(`<i>p</i> = ${M.P}`, () => B.P(M.P, 8.9)),
      mark(`a sample of ${n}`, () => V(cx - 5.75, TY + 0.75, 0), 'board'),
      live(() => V(cx + 2.4, TY + 0.75, 0), () => showP ? `<i>p̂</i> = ${Math.round(M.PHATS[cur] * n)}/${n} = ${f2(M.PHATS[cur])}` : '', 'board'),
      live(() => B.P(0.1, 8).add(V(0, 0.55, 0)), () => `${done} sample${done === 1 ? '' : 's'} so far`, 'board'));
    ups.push(s => {
      const st = M.popAt(M.clk(s, 'pop'));
      cur = Math.min(st.k, M.KPOP - 1);
      const u = st.held ? 1 : st.u, slow = st.slow, smp = M.SAMPLES[cur];
      const at = i => smp.indexOf(i);                      // its place in the draw, or −1
      balls.forEach((m, i) => { const j = at(i), on = j >= 0 && (!slow || u >= 0.3 * j / n); setMat(m, on ? 'red' : licPal(i)); m.scale.setScalar(on ? 1.25 : 1); });
      TRAY[cur].forEach((i, j) => {
        const m = trayBalls[j], drawn = !slow || u >= 0.3 * at(i) / n;
        m.visible = drawn; if (!drawn) return;
        setMat(m, licPal(i));
        if (slow) lerpV(m.position, pos[i], slot(j), (u - 0.3 - 0.006 * j) / 0.2); else m.position.copy(slot(j));
      });
      showP = !slow || u > 0.55;
      done = st.held ? M.KPOP : cur + (slow ? (u > 0.75 ? 1 : 0) : (u > 0.3 ? 1 : 0));
      dots.forEach((d, k) => {
        d.visible = k < done; if (!d.visible) return;
        const live = k === cur && !st.held;
        setMat(d, live ? 'red' : 'ink');
        const y = 0.5 + M.PSTACK[k];
        putAt(B, d, M.PHATS[k], live && slow ? y + 9 * (1 - M.smooth((u - 0.75) / 0.15)) : y, 0.1);
      });
    });
  }

  // ---------- 3.2 observational study or experiment: the same 24 students, grouped two ways ----------
  {
    const cx = ST.obs, n = M.OBS.n;
    const pool = p => V(cx + (p - (n - 1) / 2) * SP, 0, 0.2);
    [['obsStudy', 3.3, M.OBS_COFFEE, 'An observational study', 'the students chose for themselves: coffee or none', 'an observational study: they choose', 'obs'],
      ['expStudy', -3.3, M.EXP_COFFEE, 'An experiment', 'a random shuffle assigned coffee or none', 'an experiment: a random shuffle decides', 'exp']].forEach(([key, cy, grp, title, sub, head, ck]) => {
      const g = asm(key, root, { title, sub });
      backing(g, cx, cy + 0.2, 12.4, 5.4);
      const crates = [[cx - 2.6, 'coffee', RED, true], [cx + 2.6, 'no coffee', GREY, false]];
      const CY = cy - 0.75;
      crates.forEach(([x, w, col]) => { tray(g, x, CY, 2.5, 1.9, col, false); labels.push(mark(w, () => V(x, CY + 1.25, 0))); });
      const slotOf = {};
      crates.forEach(([x, , , on]) => M.POOL_ORDER.filter(i => grp[i] === on).forEach((i, q) => { slotOf[i] = V(x + (q % 4 - 1.5) * 0.52, CY + (1 - Math.floor(q / 4)) * 0.52, 0.2); }));
      const from = M.ALL.slice(0, n).map(i => pool(M.POOL_ORDER.indexOf(i)).add(V(0, cy + 1.75, 0)));
      const bs = M.ALL.slice(0, n).map(i => ball(g, M.RESTED[i] ? 'ink' : 'paper', 'Student'));
      let u = 0;
      labels.push(mark(head, () => V(cx - 6.0, cy + 2.55, 0), 'board'),
        ...crates.map(([x], c) => live(() => V(x, CY - 1.3, 0), () => u >= 1 ? `well rested: ${M.OBS_COUNTS[ck][c]} of ${n / 2}` : '')));
      if (ck === 'obs') { ball(g, 'ink', 'Key').position.set(cx + 1.4, cy + 2.55, 0.2); labels.push(mark('slept 8 h or more', () => V(cx + 1.7, cy + 2.55, 0), 'board')); }
      ups.push(s => {
        u = M.obsT(M.clk(s, 'obs'));
        bs.forEach((m, i) => { const a = M.POOL_ORDER.indexOf(i) / n * 0.55; lerpV(m.position, from[i], slotOf[i], (u - a) / 0.45); });
      });
    });
  }

  // ---------- 3.3 four ways to draw a sample from the school, one board each ----------
  {
    const cx = ST.methods, one = i => [i];
    const meth = [
      ['srs', 'Simple random sample', 'every set of 20 students equally likely: labels 001–200 read from random digits', M.SRS_IDX.map(one), 'simple random sample'],
      ['strat', 'Stratified random sample', `an SRS of ${M.STRAT_N} within each grade (the strata)`, M.STRAT, `stratified: ${M.STRAT_N} from each grade`],
      ['cluster', 'Cluster sample', `${M.CLUSTER.take} advisory groups (clusters) chosen at random, every student in them taken`, M.CL_GROUPS.map(gp => M.ALL.filter(i => M.groupOf(i) === gp)), `cluster: ${M.CLUSTER.take} whole advisory groups`],
      ['sys', 'Systematic random sample', `every ${M.SYS.k}th student on the list, from a random start (${M.SYS.start})`, M.SYS_IDX.map(one), `systematic: every ${M.SYS.k}th from student ${M.SYS.start}`],
    ];
    for (const [key, title, sub, stepsOf, head] of meth) {
      const cy = MY[key];
      const g = asm(key, root, { title, sub });
      const { balls } = school(g, cx, cy);
      let shown = 0;
      // a cluster is outlined as it is taken
      const boxes = key === 'cluster' ? M.CL_GROUPS.map(gp => { const x = cx + (gp - 12) * SP, l = new THREE.Group(); g.add(l); tray(l, x, cy, SP * 0.92, 4.25, RED, false); return l; }) : [];
      if (key === 'srs') labels.push(mark('random digits, three at a time: ' + M.TRIPLES.slice(0, M.DIG.show).map(x => x.why === 'use' ? `<b style="color:${RED}">${x.t}</b>` : x.why === 'repeat' ? `<s>${x.t}</s>` : `<span style="opacity:.5">${x.t}</span>`).join(' ') + ' …', () => V(cx, cy + 3.4, 0)));
      labels.push(...gradeLabels(cx, cy), mark(head, () => V(cx - 5.9, cy + 2.6, 0), 'board'),
        live(() => V(cx + 2.9, cy + 2.6, 0), () => { const m = stepsOf.slice(0, shown).flat(); return shown >= stepsOf.length ? `<i>p̂</i> = ${M.phatOf(m).toFixed(3).replace(/0$/, '')}` : `chosen: ${m.length}`; }, 'board'));
      ups.push(s => {
        shown = M.shownOf(key, M.clk(s, key));
        const on = new Set(stepsOf.slice(0, shown).flat());
        balls.forEach((m, i) => { const c = on.has(i); setMat(m, c ? 'red' : licPal(i)); m.scale.setScalar(c ? 1.3 : 1); });
        boxes.forEach((b, k) => { b.visible = k < shown; });
      });
    }
  }

  // ---------- 3.4 a frame that leaves out grade 9, and three ways of sampling, 40 samples each ----------
  {
    const cx = ST.bias, PY = 7.0;
    const fg = asm('frame', root, { title: 'The sampling frame', sub: 'the list sampled from: the school portal, which has no grade 9 students yet' });
    school(fg, cx, PY);
    const wash = part(fg, box(M.POP.cols * SP + 0.2, 2 * SP + 0.14, 0.05, 0.01), { pal: 'dark', name: 'Not on the list', pos: [cx, gradeY(PY, 0) + 0.23 - SP / 2, 0.42], mat: shadeMat('dark', { opacity: 0.62 }) });
    wash.userData.noEdge = true;
    labels.push(...gradeLabels(cx, PY), mark('the portal list (sampling frame)', () => V(cx - 5.9, PY + 2.6, 0), 'board'),
      mark('grey: grade 9, not on the list', () => V(cx + 0.6, PY + 2.6, 0), 'board'));
    const base = [-3.4, -7.1, -10.8];
    const Bs = M.STRIPS.map((S, si) => {
      const B = graphBoard(root, { at: [cx - 0.5 * 12, base[si], 0], x: [0.1, 0.9], y: [0, 14], unit: [12, 0.2], grid: [0.05, 0], ticks: [0.1, 0] });
      const g = asm(S.key, root, { title: S.name, sub: si === 1 ? 'biased: grade 9 can never be chosen' : si === 0 ? 'unbiased, but variable' : 'unbiased, and less variable' });
      const ds = S.ph.map((p, k) => { const d = dot(g, { pal: si === 1 ? 'red' : 'ink', r: 0.085, name: `Sample ${k + 1}` }); d.userData.home = null; putAt(B, d, Math.round(p / 0.025) * 0.025, 0.5 + S.lv[k], 0.1); return d; });
      let shown = 0;
      labels.push(...B.tickLabels({ xName: si === 2 ? '<i>p̂</i>' : '', yName: '' }), mark(S.name, () => B.P(0.1, 14).add(V(0, 0.35, 0)), 'board'),
        live(() => B.P(0.68, 14).add(V(0, 0.35, 0)), () => shown >= 40 ? `mean ${S.m.toFixed(3)} · SD ${S.s.toFixed(3)}` : `${shown} sample${shown === 1 ? '' : 's'}`, 'board'));
      ups.push(s => { shown = M.biasShown(M.clk(s, 'bias')); ds.forEach((d, k) => { d.visible = k < shown; }); });
      return B;
    });
    const pg = asm('biasParam', root, { title: 'The parameter, p', sub: `${M.P} for the whole school; ${M.P_FRAME.toFixed(3)} for the portal list` });
    setRod(rod(pg, { pal: 'blue', r: 0.03, name: 'p' }), Bs[2].P(M.P, 0, 0.05), Bs[0].P(M.P, 14, 0.05));
    labels.push(mark(`<i>p</i> = ${M.P}`, () => Bs[0].P(M.P, 12.5).add(V(0.2, 0, 0)), 'board'));
  }

  // ---------- 3.5 the caffeine experiment: 24 volunteers, randomly assigned; their reaction times ----------
  {
    const cx = ST.exp, n = M.EXP.n, PY = 5.7, CY = 3.0;
    const ug = asm('units', root, { title: 'The experimental units', sub: '24 volunteers: the subjects of the experiment' });
    const gg = asm('groups', root, { title: 'The treatment groups', sub: 'caffeine or a placebo pill, 12 each, by a random shuffle' });
    const crates = [[cx - 2.8, 'caffeine', RED, true], [cx + 2.8, 'placebo', BLUE, false]];
    crates.forEach(([x, w, col]) => { tray(gg, x, CY, 2.5, 1.9, col); labels.push(mark(w, () => V(x, CY + 1.25, 0))); });
    const slotOf = M.ALL.slice(0, n).map(i => { const grp = M.CAF[i], q = M.ALL.slice(0, i).filter(j => M.CAF[j] === grp).length, x = grp ? cx - 2.8 : cx + 2.8; return V(x + (q % 4 - 1.5) * 0.52, CY + (1 - Math.floor(q / 4)) * 0.52, 0.2); });
    const from = M.ALL.slice(0, n).map(i => V(cx + (i - (n - 1) / 2) * SP, PY, 0.2));
    const bs = from.map(p => { const m = ball(ug, 'paper', 'Volunteer'); m.position.copy(p); return m; });
    backing(ug, cx, PY, n * SP + 0.3, 0.7);
    const B = graphBoard(root, { at: [cx - 255 * 0.11, -2.3, 0], x: [205, 305], y: [0, 6.6], unit: [0.11, 0.36], grid: [5, 0], ticks: [20, 0] });
    const rg = asm('responses', root, { title: 'The response variable', sub: 'reaction time (ms), measured on every volunteer' });
    const rows = i => (M.CAF[i] ? 4.2 : 0.5) + M.RSTACK[i];
    const ds = M.RESP.map((_, i) => { const d = dot(rg, { pal: M.CAF[i] ? 'red' : 'blue', r: 0.13, name: 'Reaction time' }); d.userData.home = null; return d; });
    const mr = [rod(rg, { pal: 'red', r: 0.035, name: 'Caffeine mean' }), rod(rg, { pal: 'blue', r: 0.035, name: 'Placebo mean' })];
    setRod(mr[0], B.P(M.MCAF, 3.7, 0.06), B.P(M.MCAF, 6.2, 0.06)); setRod(mr[1], B.P(M.MPLA, 0, 0.06), B.P(M.MPLA, 2.5, 0.06));
    let t = 0;
    labels.push(...B.tickLabels({ xName: '', yName: '' }), mark('reaction time (ms)', () => B.P(255, 0).add(V(0, -0.75, 0))),
      mark('24 volunteers', () => V(cx - 5.6, PY + 0.75, 0), 'board'),
      mark('caffeine', () => B.P(205, 4.6).add(V(-0.1, 0, 0)), 'axis'), mark('placebo', () => B.P(205, 1).add(V(-0.1, 0, 0)), 'axis'),
      live(() => B.P(M.MCAF, 6.5), () => t > 6.6 ? `<i>x̄</i> = ${f1(M.MCAF)}` : ''),
      live(() => B.P(M.MPLA, 2.95), () => t > 6.6 ? `<i>x̄</i> = ${f1(M.MPLA)}` : ''));
    ups.push(s => {
      t = M.expT(M.clk(s, 'exp'));
      bs.forEach((m, i) => { const a = 0.3 + i * 0.12; lerpV(m.position, from[i], slotOf[i], (t - a) / 0.8); setMat(m, t < a ? 'paper' : M.CAF[i] ? 'red' : 'blue'); });
      ds.forEach((d, i) => { const a = 4.2 + i * 0.1; d.visible = t >= a; if (d.visible) putAt(B, d, Math.round(M.RESP[i] / 4) * 4, rows(i) + 3 * (1 - M.smooth((t - a) / 0.4)), 0.1); });
      mr.forEach(r => { r.visible = t > 6.6; });
    });
  }

  // ---------- 3.6 a randomized block design: block on coffee habit first, then randomize within each block ----------
  {
    const cx = ST.block, n = M.BLOCK.n, PY = 4.9;
    const g = asm('blocks', root, { title: 'Two blocks', sub: 'regular coffee drinkers and non-drinkers, each split at random' });
    const bks = [{ cy: 2.2, h: 1.6, on: true, name: 'block 1: coffee drinkers' }, { cy: -1.0, h: 2.1, on: false, name: 'block 2: non-drinkers' }];
    for (const b of bks) {
      tray(g, cx - 1.6, b.cy, 3.2, b.h, RED); tray(g, cx + 1.6, b.cy, 3.2, b.h, BLUE, false);
      labels.push(mark(b.name, () => V(cx - 3.2, b.cy + b.h / 2 + 0.35, 0), 'board'));
    }
    labels.push(mark('caffeine', () => V(cx - 1.6, -2.45, 0)), mark('placebo', () => V(cx + 1.6, -2.45, 0)),
      mark('24 volunteers', () => V(cx - 5.6, PY + 0.75, 0), 'board'));
    backing(g, cx, PY, n * SP + 0.3, 0.7);
    const from = [], mid = [], end = [];
    for (let i = 0; i < n; i++) {
      const b = bks[M.DRINKER[i] ? 0 : 1], mates = M.ALL.slice(0, n).filter(j => M.DRINKER[j] === M.DRINKER[i]);
      const q = mates.indexOf(i), perRow = 8, rowsN = Math.ceil(mates.length / perRow);
      from.push(V(cx + (M.BL_POOL.indexOf(i) - (n - 1) / 2) * SP, PY, 0.2));
      mid.push(V(cx + (q % perRow - 3.5) * 0.5, b.cy + ((rowsN - 1) / 2 - Math.floor(q / perRow)) * 0.5, 0.2));
      const side = mates.filter(j => M.BL_CAF[j] === M.BL_CAF[i]), r = side.indexOf(i), cols = 4, rr = Math.ceil(side.length / cols);
      end.push(V(cx + (M.BL_CAF[i] ? -1.6 : 1.6) + (r % cols - 1.5) * 0.5, b.cy + ((rr - 1) / 2 - Math.floor(r / cols)) * 0.5, 0.2));
    }
    const bs = from.map((p, i) => ball(g, M.DRINKER[i] ? 'ink' : 'paper', M.DRINKER[i] ? 'Coffee drinker' : 'Non-drinker'));
    ups.push(s => {
      const t = M.blockT(M.clk(s, 'block'));
      bs.forEach((m, i) => {
        const a = 0.2 + M.BL_POOL.indexOf(i) * 0.06, b = 3.2 + i * 0.05;
        if (t < b) lerpV(m.position, from[i], mid[i], (t - a) / 0.8); else lerpV(m.position, mid[i], end[i], (t - b) / 0.9);
      });
    });
  }

  // ---------- 3.6 matched pairs: each volunteer tested twice, the order by a coin flip; the differences ----------
  {
    const cx = ST.pairs, np = M.PAIRS.n, TY = 4.6, BY = 3.2;
    const sg = asm('subjects', root, { title: 'Twelve volunteers, each their own pair', sub: 'both treatments, in an order set by a coin flip' });
    backing(sg, cx, (TY + BY) / 2, np * 0.85 + 0.4, 2.2);
    const x = j => cx + (j - (np - 1) / 2) * 0.85;
    const tops = [], bots = [];
    for (let j = 0; j < np; j++) {
      tops.push(ball(sg, 'paper', 'Session 1', 0.18)); bots.push(ball(sg, 'paper', 'Session 2', 0.18));
      tops[j].position.set(x(j), TY, 0.2); bots[j].position.set(x(j), BY, 0.2);
      setRod(rod(sg, { pal: 'dark', r: 0.03, name: 'Same volunteer' }), V(x(j), TY - 0.18, 0.2), V(x(j), BY + 0.18, 0.2));
    }
    const B = graphBoard(root, { at: [cx - 10 * 0.18, -0.6, 0], x: [-20, 40], y: [0, 4], unit: [0.18, 0.32], grid: [5, 0], ticks: [10, 0] });
    const dg = asm('pdiffs', root, { title: 'The differences', sub: 'placebo time minus caffeine time, one per volunteer' });
    const ds = M.PDIFFS.map((d, k) => { const m = dot(dg, { pal: 'ink', r: 0.12, name: `Volunteer ${k + 1}` }); m.userData.home = null; putAt(B, m, Math.round(d / 2) * 2, 0.5 + M.PD_LEVEL[k], 0.1); return m; });
    const mean = rod(dg, { pal: 'red', r: 0.035, name: 'Mean difference' }); setRod(mean, B.P(M.PD_MEAN, 0, 0.06), B.P(M.PD_MEAN, 4, 0.06));
    let k = 0;
    labels.push(mark('1st', () => V(x(0) - 0.75, TY, 0), 'axis'), mark('2nd', () => V(x(0) - 0.75, BY, 0), 'axis'),
      ...B.tickLabels({ xName: '', yName: '' }), mark('placebo − caffeine (ms)', () => B.P(10, 0).add(V(0, -0.75, 0))),
      live(() => B.P(M.PD_MEAN, 4).add(V(0, 0.35, 0)), () => k >= 2 * np ? `<i>x̄</i><sub>diff</sub> = ${f1(M.PD_MEAN)}` : ''));
    ups.push(s => {
      k = M.pairsShown(M.clk(s, 'pairs'));
      M.PAIR_DATA.forEach((p, j) => { const on = j < k; setMat(tops[j], on ? (p.cafFirst ? 'red' : 'blue') : 'paper'); setMat(bots[j], on ? (p.cafFirst ? 'blue' : 'red') : 'paper'); });
      ds.forEach((d, j) => { d.visible = j < k - np; });
      mean.visible = k >= 2 * np;
    });
  }

  // ---------- 3.7 re-randomizing the 24 reaction times: the differences chance alone makes ----------
  {
    const cx = ST.rand, n = M.EXP.n;
    const T = graphBoard(root, { at: [cx - 255 * 0.11, 2.6, 0], x: [205, 305], y: [0, 4], unit: [0.11, 0.34], grid: [5, 0], ticks: [20, 0] });
    const sg = asm('shuffle', root, { title: 'The 24 reaction times, reshuffled', sub: 'the same numbers, dealt again at random into two groups of 12' });
    const lv = M.stack(M.RESP, 4);
    const bs = M.RESP.map((v, i) => { const m = ball(sg, 'paper', 'Reaction time', 0.14); putAt(T, m, Math.round(v / 4) * 4, 0.5 + lv[i], 0.12); return m; });
    const means = [rod(sg, { pal: 'red', r: 0.035, name: 'Group 1 mean' }), rod(sg, { pal: 'blue', r: 0.035, name: 'Group 2 mean' })];
    const D = graphBoard(root, { at: [cx, -3.4, 0], x: [-30, 30], y: [0, 11], unit: [0.2, 0.24], grid: [5, 0], ticks: [10, 0] });
    const dg = asm('randDist', root, { title: 'The randomization distribution', sub: `${M.RAND.R} differences in means, made by chance alone` });
    const ds = M.RDIFFS.map((d, k) => { const m = dot(dg, { pal: 'ink', r: 0.1, name: `Reshuffle ${k + 1}` }); m.userData.home = null; return m; });
    const og = asm('observed', root, { title: 'The observed difference', sub: `${f1(M.DIFF)} ms: placebo mean minus caffeine mean, as assigned` });
    setRod(rod(og, { pal: 'red', r: 0.04, name: 'Observed' }), D.P(M.DIFF, 0, 0.06), D.P(M.DIFF, 11, 0.06));
    let cur = 0, done = 0, held = false;
    labels.push(...T.tickLabels({ xName: '', yName: '' }), ...D.tickLabels({ xName: '', yName: '' }),
      mark('reaction time (ms)', () => T.P(255, 0).add(V(0, -0.75, 0))), mark('difference in means (ms)', () => D.P(0, 0).add(V(0, -0.75, 0))),
      mark(`observed ${f1(M.DIFF)}`, () => D.P(M.DIFF, 11).add(V(0, 0.35, 0))),
      live(() => T.P(205, 4).add(V(0, 0.4, 0)), () => held ? 'as actually assigned' : `reshuffle ${cur + 1}`, 'board'),
      live(() => D.P(-30, 11).add(V(0, 0.4, 0)), () => `${done} reshuffles · as large as observed: ${M.RDIFFS.slice(0, done).filter(d => d >= M.DIFF).length}`, 'board'));
    ups.push(s => {
      const st = M.randAt(M.clk(s, 'rand'));
      held = !!st.held; cur = Math.min(st.k, M.RAND.R - 1);
      const swapped = !st.slow || st.u >= 0.15;
      const caf = held ? M.CAF : swapped ? M.REDRAWS[cur] : cur ? M.REDRAWS[cur - 1] : M.CAF;
      bs.forEach((m, i) => setMat(m, caf[i] ? 'red' : 'blue'));
      const g1 = M.RESP.filter((_, i) => caf[i]), g2 = M.RESP.filter((_, i) => !caf[i]), m1 = g1.reduce((a, b) => a + b) / g1.length, m2 = g2.reduce((a, b) => a + b) / g2.length;
      setRod(means[0], T.P(m1, 0, 0.06), T.P(m1, 4, 0.06)); setRod(means[1], T.P(m2, 0, 0.06), T.P(m2, 4, 0.06));
      done = held ? M.RAND.R : cur + (st.slow ? (st.u > 0.5 ? 1 : 0) : (st.u > 0.3 ? 1 : 0));
      ds.forEach((d, k) => {
        d.visible = k < done; if (!d.visible) return;
        const now = k === cur && !held, y = 0.5 + M.RLEVEL[k];
        setMat(d, now ? 'blue' : 'ink');
        putAt(D, d, Math.round(M.RDIFFS[k] / M.RAND.bin) * M.RAND.bin, now && st.slow ? y + 6 * (1 - M.smooth((st.u - 0.5) / 0.25)) : y, 0.1);
      });
    });
  }

  // ---------- 3.7 the scope of inference: four panels, random selection × random assignment ----------
  {
    const cx = ST.scope + 1.2, W = 5.6, H = 3.7;
    const colX = [cx - 2.95, cx + 2.95], rowY = [2.05, -2.05];
    labels.push(mark('random assignment', () => V(colX[0], 4.3, 0)), mark('no random assignment', () => V(colX[1], 4.3, 0)),
      mark('random<br>selection', () => V(cx - 5.9, rowY[0], 0), 'axis'), mark('no random<br>selection', () => V(cx - 5.9, rowY[1], 0), 'axis'));
    const SEL = M.shuffled(M.ALL.slice(0, 32), 909).slice(0, 6), CLUMP = [23, 22, 31, 30, 15, 14];
    for (const c of M.SCOPE) {
      const px = colX[c.asg ? 0 : 1], py = rowY[c.sel ? 0 : 1];
      const title = `${c.sel ? 'Random' : 'No random'} selection, ${c.asg ? 'random' : 'no random'} assignment`;
      const sub = `${c.sel ? 'generalize to the population' : 'only to units like these'}; ${c.asg ? 'cause and effect' : 'association only'}`;
      const g = asm(c.key, root, { title, sub });
      backing(g, px, py, W, H);
      const picks = c.sel ? SEL : CLUMP;
      for (let i = 0; i < 32; i++) { const m = ball(g, picks.includes(i) ? 'red' : 'paper', picks.includes(i) ? 'Chosen' : 'Population', 0.11); m.position.set(px - 2.25 + (i % 8) * 0.3, py + 1.0 - Math.floor(i / 8) * 0.3, 0.15); }
      setArrow(arrow(g, 'dark', { r: 0.025, head: 0.2, headR: 0.08, name: c.asg ? 'Random assignment' : 'Groups as found' }), V(px + 0.25, py + 0.55, 0.15), V(0.75, 0, 0));
      // the 6 chosen, split into two groups of 3: by a shuffle, or as they came (here: self-sorted by colour)
      [[px + 1.85, py + 1.0, RED], [px + 1.85, py + 0.1, BLUE]].forEach(([x, y, col], gi) => {
        tray(g, x, y, 1.25, 0.5, col, false);
        for (let q = 0; q < 3; q++) ball(g, c.asg ? (q + gi) % 2 ? 'ink' : 'paper' : gi ? 'paper' : 'ink', 'Group member', 0.11).position.set(x + (q - 1) * 0.34, y, 0.15);
      });
      labels.push(mark(`${c.sel ? 'random sample' : 'volunteers'} · ${c.asg ? 'assigned at random' : 'groups as found'}`, () => V(px, py - 0.75, 0)),
        mark(`population: <b>${c.sel ? 'yes' : 'no'}</b> · cause: <b>${c.asg ? 'yes' : 'no'}</b>`, () => V(px, py - 1.3, 0)));
    }
  }

  return { labels, update: s => { for (const f of ups) f(s); } };
}
