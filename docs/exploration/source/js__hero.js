// The landing page's figure: a revolving carousel of live figures from the subjects. Each is one page of a chapter, drawn
// by the chapter's own code: the page's import map points the chapters' ../engine/book.js here, so a chapter's main.js
// hands its startBook() config (pages, world, clock, readout) to this module instead of opening a book. Only the slide's
// own scene is drawn (a chapter's world holds every page's scene, side by side), and the turn is limited to keep it in
// view. The figure in the middle can be turned (drag), lit (point) and broken down (click); its neighbours play, faded,
// at the sides, and a click on one brings it to the middle.
import { createEngine } from '/physics/engine/render.js';

// the slides: a chapter, and which of its pages (by scene; '' is a page with none)
const SLIDES = [
  ['physics', 'kinematics', ''],
  ['physics', 'rotation', 'race'],
  ['calculus', 'applications', 'washo'],
  ['physics', 'magnetism', 'cyclo'],
  ['calculus', 'parametric', 'wheel'],
  ['physics', 'circular', 'loop'],
];
const NAMES = { physics: 'Physics', calculus: 'Calculus', biology: 'Biology', chemistry: 'Chemistry', statistics: 'Statistics', history: 'US History', macroeconomics: 'Macroeconomics', government: 'Government' };
const EVERY = 7000;                // ms on each slide; it holds while the pointer is on the carousel
const AZ = 50, EL = [-4, 60];      // how far the visitor may turn the figure from its page's view

// ---------- the chapters' hand-off ----------
let loading = null;
const configs = {};
export function startBook(chapter) { configs[loading] = chapter; }
// one at a time, so each startBook() call is known to be the chapter just imported
let pending = Promise.resolve();
const base = document.documentElement.dataset.base ?? '';
const load = key => pending = pending.then(async () => {
  if (!configs[key]) { loading = key; await import(`${base}/${key}/main.js`); }
  return configs[key];
});

const fig = document.getElementById('hero'), track = fig.querySelector('.track'), $ = s => fig.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, touch = matchMedia('(pointer: coarse)').matches;
const HINT = touch ? 'Drag sideways to turn · tap a thing to break it down' : 'Drag to turn · click a thing to break it down';
const CLOSE = touch ? 'Tap empty space to close' : 'Click empty space to close';
const N = SLIDES.length, H = Math.floor(N / 2);
let at = 0, inside = false, shownAt = performance.now();
const off = n => ((n - at) % N + N + H) % N - H;   // a slide's place from the middle, going round: −H … N−H−1

// ---------- the panels: one per slide, each its own engine once it comes near the middle ----------
const fallback = track.querySelector('img');
track.replaceChildren();
const panels = SLIDES.map((slide, n) => {
  const el = document.createElement('div');
  el.className = 'panel';
  el.innerHTML = `<canvas></canvas><div class="labels" aria-hidden="true"></div><div class="hint">${HINT}</div>
    <div class="readout" aria-hidden="true"></div><div class="card" aria-live="polite" hidden><b></b><span></span></div>`;
  if (!n) el.prepend(fallback);   // the picture stands in until the first figure is drawn
  track.append(el);
  const P = { n, slide, el, canvas: el.querySelector('canvas'), E: null, S: null, w: 1, h: 1, clock: 0, rate: 1,
    hovered: null, selected: null, drag: null, orbit: { az: 0, el: 0 }, focus: 0, lastFocus: null };
  listen(P);
  return P;
});

let box;   // a Box3, made with the first engine
const shown = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
async function build(P) {
  P.E = 'loading';
  const [subj, ch, scene] = P.slide, chapter = await load(`${subj}/${ch}`);
  const E = P.E = createEngine(P.canvas, { fov: 18, near: 0.2, far: 300 });
  box ??= new E.THREE.Box3();
  const fit = () => { P.w = P.canvas.clientWidth; P.h = P.canvas.clientHeight; E.resize(P.w, P.h); };
  new ResizeObserver(fit).observe(P.canvas); fit();
  E.setDprCap(off(P.n) ? 1 : touch ? 1.5 : 2);
  const i = Math.max(0, chapter.PAGES.findIndex(p => (p.scene ?? '') === scene)), page = chapter.PAGES[i];
  const W = chapter.buildWorld(E);
  const labels = (W.labels || []).map(L => { const el = document.createElement('div'); el.className = 'lbl ' + L.cls; el.innerHTML = L.html; P.el.querySelector('.labels').append(el); return { el, at: L.at }; });
  const look = Object.fromEntries(chapter.lookKeys.map(key => [key, page.look[key] || 0]));
  P.clock = chapter.clock0 || 0;
  const reach = page.cam.dist * 0.6 * Math.max(1, 1.25 / E.camera.aspect), target = new E.THREE.Vector3(...page.cam.target);
  // the other pages' scenes: whatever lies out of reach of this page's view, once an update has put things in place.
  // Things hidden now (a breakdown's arrows, placed only once it opens) are measured when they first show ('later')
  W.update(chapter.state(P.clock, reduced), look);
  E.scene.updateMatrixWorld(true);
  const far = [], later = [];
  E.scene.traverse(o => { if (!(o.isMesh || o.isLine || o.isPoints)) return; if (!shown(o)) later.push(o); else if (box.setFromObject(o).distanceToPoint(target) > reach) far.push(o); });
  P.S = { chapter, page, i, W, labels, look, far, later, reach, target };
  relight(P);
  if (P.n === at) caption();
}

// ---------- pointing, turning, breaking down: the middle figure only ----------
const relight = P => P.S && P.E.setLit(P.hovered || P.selected || P.S.page.lit);
const pickAt = (P, e) => { const r = P.canvas.getBoundingClientRect(); return P.E.pick(e.clientX - r.left, e.clientY - r.top, P.w, P.h); };
function select(P, k) {
  P.selected = k;
  if (P.S) for (const [key, g] of Object.entries(P.E.ASM)) g.userData.target = key === k ? 1 : 0;
  const card = P.el.querySelector('.card');
  card.hidden = !k;
  if (k) { const u = P.E.ASM[k].userData; card.querySelector('b').textContent = u.title; card.querySelector('span').textContent = u.sub; }
  P.el.querySelector('.hint').textContent = k ? CLOSE : HINT;
  relight(P);
}
function listen(P) {
  const c = P.canvas, mine = () => P.n === at && P.S;
  c.addEventListener('pointerdown', e => {
    if (P.n !== at) return go(P.n);   // a figure at the side: bring it to the middle
    P.drag = { x: e.clientX, y: e.clientY, moved: false }; c.setPointerCapture(e.pointerId);
  });
  c.addEventListener('pointermove', e => {
    if (!mine()) return;
    const d = P.drag;
    if (d) {
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      if (!d.moved && Math.hypot(dx, dy) < 4) return;
      d.moved = true; d.x = e.clientX; d.y = e.clientY;
      P.orbit.az = Math.min(Math.max(P.orbit.az - dx * 0.35, -AZ), AZ);
      if (!touch) P.orbit.el += dy * 0.25;
      return;
    }
    const k = pickAt(P, e);
    if (k !== P.hovered) {
      P.hovered = k; c.classList.toggle('pointing', !!k); relight(P);
      if (!P.selected) P.el.querySelector('.hint').textContent = k ? `${P.E.ASM[k].userData.title} — click to break it down` : HINT;
    }
  });
  c.addEventListener('pointerup', e => {
    if (P.drag && !P.drag.moved && mine()) { const k = e.pointerType === 'mouse' ? P.hovered : pickAt(P, e); select(P, k && k !== P.selected ? k : null); }
    P.drag = null;
  });
  c.addEventListener('pointerleave', () => { P.hovered = null; c.classList.remove('pointing'); relight(P); });
  c.addEventListener('dblclick', () => { P.orbit.az = P.orbit.el = 0; });
}

// ---------- going round ----------
function place() {
  for (const P of panels) {
    const d = off(P.n), wrap = P.d !== undefined && Math.abs(d - P.d) > 1 && Math.abs(P.d) > 1 && Math.abs(d) > 1;
    P.el.classList.toggle('jump', wrap);
    P.d = d;
    P.el.style.setProperty('--d', d);
    if (wrap) P.el.offsetWidth;   // the jump applies now, with no transition, before transitions come back on
    P.el.classList.toggle('on', !d);
    P.el.classList.toggle('far', Math.abs(d) > 1);
    P.el.setAttribute('aria-hidden', !!d);
    if (P.E && P.E !== 'loading') P.E.setDprCap(d ? 1 : touch ? 1.5 : 2);
  }
  requestAnimationFrame(() => panels.forEach(P => P.el.classList.remove('jump')));
  fig.querySelectorAll('.dots button').forEach((b, n) => b.setAttribute('aria-current', n === at));
}
function caption() {
  const P = panels[at], [subj, ch] = P.slide;
  $('.where').href = `${base}/${subj}/${ch}/${P.S?.i ? '#' + P.S.i : ''}`;
  if (!P.S) return;
  $('.where b').textContent = `${NAMES[subj]} · ${P.S.chapter.PAGES[0].title}`;
  $('.where span').textContent = P.S.page.fig;
}
function go(n) {
  const old = panels[at];
  old.hovered = null; old.drag = null; select(old, null); old.canvas.classList.remove('pointing');
  at = (n % N + N) % N; shownAt = performance.now();
  panels[at].orbit.az = panels[at].orbit.el = 0;
  place(); caption();
}
$('.prev').onclick = () => go(at - 1); $('.next').onclick = () => go(at + 1);
// the pointer on the carousel (the figures or their controls) holds it; its 7 s start again once the pointer leaves
fig.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') inside = true; });
fig.addEventListener('pointerleave', () => { inside = false; shownAt = performance.now(); });
$('.dots').innerHTML = SLIDES.map((s, n) => `<button type="button" aria-label="Figure ${n + 1} of ${N}"></button>`).join('');
fig.querySelectorAll('.dots button').forEach((b, n) => b.onclick = () => go(n));

// ---------- frame: the middle figure and its neighbours, while the carousel is on screen ----------
function draw(P, now, dt) {
  const { chapter, page, W, look, far, later, labels, reach, target } = P.S, E = P.E, mid = P.n === at;
  P.rate = mid && (P.selected || P.hovered) ? 0 : P.rate + (1 - P.rate) * (1 - Math.exp(-dt * 4));
  if (!reduced) P.clock += dt * P.rate;
  // camera: the page's view, eased toward the opened thing, plus the visitor's turn (the turn eases home at the sides)
  P.focus += ((P.selected ? 1 : 0) - P.focus) * (1 - Math.exp(-dt * 4));
  if (P.selected) {
    const s = new E.THREE.Box3().setFromObject(E.ASM[P.selected]).getBoundingSphere(new E.THREE.Sphere());
    P.lastFocus = { target: s.center.toArray(), dist: Math.max(E.distFor(Math.max(s.radius, 1.2)), 8) };
  }
  if (!mid) { const k = Math.exp(-dt * 3); P.orbit.az *= k; P.orbit.el *= k; }
  const C = page.cam, F = P.lastFocus ?? C, lerp = (a, b) => a + (b - a) * P.focus;
  E.placeCamera({
    target: C.target.map((v, i) => lerp(v, F.target[i])),
    az: C.az + P.orbit.az + (reduced || P.drag ? 0 : Math.sin(now / 5200) * 1.2),
    el: Math.min(Math.max(lerp(C.el, Math.max(C.el, 6)) + P.orbit.el, EL[0]), EL[1]),
    dist: lerp(C.dist * Math.max(1, 1.25 / E.camera.aspect), F.dist),
  });
  const state = chapter.state(P.clock, reduced), L = { ...look };
  if (chapter.forceLook) chapter.forceLook(P.selected, L);
  W.update(state, L);
  for (let k = later.length; k--;) {
    const o = later[k];
    if (!shown(o)) continue;
    later.splice(k, 1); o.updateWorldMatrix(true, false);
    if (box.setFromObject(o).distanceToPoint(target) > reach) far.push(o);
  }
  for (const o of far) o.visible = false;
  E.stepExplode(dt);
  E.render();
  if (mid && !P.el.classList.contains('live')) shownAt = now;   // its 7 s start once it is drawn
  P.el.classList.add('live');
  for (const lb of labels) {
    const p = lb.at(), [x, y, front] = p ? E.toScreen(p, P.w, P.h) : [0, 0, false];
    lb.el.style.opacity = p && front && p.distanceTo(target) < reach && x > 8 && x < P.w - 8 && y > 8 && y < P.h - 8 ? 1 : 0;
    lb.el.style.left = `${x}px`; lb.el.style.top = `${y}px`;
  }
  P.el.querySelector('.readout').textContent = chapter.readout ? chapter.readout(state, page) : '';
}
let last = performance.now(), on = true, queued = false;
function frame(now) {
  queued = false;
  const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20); last = now;
  if (on) queue();
  const mid = panels[at];
  // it moves on by itself, unless the pointer is on it or a breakdown is open
  if (!reduced && !inside && !mid.selected && !mid.drag && now - shownAt > EVERY) go(at + 1);
  for (const P of [mid, ...panels.filter(P => P !== mid)]) {   // the middle one first, so it loads first
    if (Math.abs(off(P.n)) > 1) continue;
    if (!P.E) build(P);
    else if (P.S) draw(P, now, dt);
  }
}
const queue = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
new IntersectionObserver(([e]) => { on = e.isIntersecting; if (on) { last = performance.now(); queue(); } }).observe(track);
place(); caption();
