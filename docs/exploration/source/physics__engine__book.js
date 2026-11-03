// The book: scroll turns the pages and moves the camera; hover lights a thing; click breaks
// it down. A chapter supplies its pages, breakdowns, world and clock; this does the rest.
import { createEngine } from './render.js';
import { XREFS } from './xrefs.js';

const $ = id => document.getElementById(id);
const clamp01 = x => Math.min(Math.max(x, 0), 1);
const smooth = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
const ease = u => (u = clamp01(u), u < 0.5 ? 4 * u ** 3 : 1 - (-2 * u + 2) ** 3 / 2);
const lerp = (a, b, u) => a + (b - a) * u;
const touch = matchMedia('(pointer: coarse)').matches;
const CLOSE_HINT = touch ? 'Tap empty space to close' : 'Click empty space or press Esc to close';
const DEFAULT_HINT = touch ? 'Drag sideways to turn · tap to break it down' : 'Drag to turn · shift-drag to pan · click to break it down';
// this chapter's directory, as cross-references and deep links name it: kinematics/#3
const DIR = location.pathname.split('/').filter(s => s && s !== 'index.html').pop();
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// chapter: { no, PAGES, PLATES, buildWorld(E), lookKeys, state(clock, reduced), readout(state),
//            forceLook?(selected, look), onFrame?(state, sheetEls), clock0?, equations? (false: the subject has no equation sheet) }
// Premium: a chapter that also has setParams(p), stateAt(t), rate(scene) and runOf(scene) can be driven
// by a question (window.__atlas.question): its own numbers, its page, its moment in time, and its marks.
// Turning to another page ends the question and puts the lesson back (a 'questionend' event says so).
export function startBook(chapter) {
  const { PAGES, PLATES } = chapter;
  const N = PAGES.length;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const narrowQ = matchMedia('(max-width: 900px), (max-height: 520px)'), narrow = () => narrowQ.matches;
  // one page of scroll; held steady while a phone's toolbar slides in and out (only a width change resizes it)
  let pageH = innerHeight, lastW = innerWidth;
  // one block per page, so touch scrolling can snap to whole pages (book.css)
  $('space').innerHTML = '<div></div>'.repeat(N);
  const sizeSpace = () => { for (const d of $('space').children) d.style.height = `${pageH}px`; };
  addEventListener('resize', () => { if (innerWidth !== lastW || !touch) { lastW = innerWidth; pageH = innerHeight; sizeSpace(); } });

  // ---------- pages ----------
  sizeSpace();
  let PRACTICE = {};
  // practice questions live beside the chapter (practice.js: { pageIndex: [question, ...] }); a chapter may have none
  import(new URL('practice.js', location.href).href).then(m => { PRACTICE = m.PRACTICE || {}; shown = leafFor = -1; }, () => {});
  const practiceHtml = i => {
    const qs = PRACTICE[i] || [];
    if (!qs.length) return '';
    return `<section class="practice"><div class="kicker">Practice</div>${qs.map((q, n) => `<div class="q" data-q="${n}">
      <p class="qtext"><span class="qn">${n + 1}</span>${q.q}</p>
      ${q.choices ? `<ol class="choices">${q.choices.map((c, k) => `<li><button type="button" data-c="${k}"><span class="letter">${'ABCDE'[k]}</span><span>${c}</span></button></li>`).join('')}</ol>`
        : '<button type="button" class="reveal">Show the solution</button>'}
      <div class="why" hidden>${q.why || q.solution}</div></div>`).join('')}</section>`;
  };
  const xrefHtml = i => {
    const here = `${DIR}/${i}`, links = XREFS.flatMap(([a, al, b, bl, note]) => a === here ? [[b, bl, note]] : b === here ? [[a, al, note]] : []);
    if (!links.length) return '';
    return `<aside class="xref"><div class="kicker">Compare</div>${links.map(([to, label, note]) => {
      const [d, k] = to.split('/');
      return `<p><a href="${d === DIR ? '' : `../${d}/`}#${k}">${label} →</a> ${note}</p>`; }).join('')}</aside>`;
  };
  // small screens: the page ends with a way on to the next (book.css shows it there)
  const turnHtml = i => i < N - 1 ? `<button type="button" class="turn" data-turn="${i + 1}"><span class="kicker">Next page</span>${PAGES[i + 1].title} →</button>` : '';
  const sheetHtml = i => { const p = PAGES[i]; return `<div class="kicker">${p.kicker}</div><h1>${p.title}</h1><div class="sub">${p.sub}</div>${p.body}${xrefHtml(i)}${practiceHtml(i)}${turnHtml(i)}`; };
  // answering: click a choice to mark it and show the worked solution
  $('sheet').addEventListener('click', e => {
    const b = e.target.closest('button'), q = b && b.closest('.q');
    if (b?.dataset.turn) return goto(+b.dataset.turn);
    if (!q) return;
    const item = PRACTICE[shown][+q.dataset.q];
    if (b.dataset.c !== undefined) {
      if (q.classList.contains('done')) return;
      q.classList.add('done');
      q.querySelectorAll('[data-c]').forEach(c => { c.disabled = true; c.classList.toggle('right', +c.dataset.c === item.answer); });
      if (+b.dataset.c !== item.answer) b.classList.add('wrong');
    } else if (b.classList.contains('reveal')) b.hidden = true;
    q.querySelector('.why').hidden = false;
  });
  let shown = -1, leafFor = -1;
  // the leaf's back is the next left page: the same folio at its foot
  const leafFolio = $('folio').parentNode.cloneNode(true); leafFolio.lastElementChild.removeAttribute('id');
  document.querySelector('.leaf-back').append(leafFolio);
  function showPage(i) {
    if (i === shown) return;
    shown = i;
    $('sheet').innerHTML = sheetHtml(i);
    $('left').scrollTop = 0;
    $('pagenum').textContent = `${i + 1} / ${N}`;
    $('pagenum').setAttribute('aria-label', `Page ${i + 1} of ${N}: contents`);
    toc.querySelectorAll('button').forEach((b, k) => b.setAttribute('aria-current', k === i));
    chips();
    // the address names the page, so it can be bookmarked or linked: kinematics/#3
    history.replaceState(null, '', i ? `#${i}` : location.pathname);
    $('folio').textContent = i + 1;
    $('figno').textContent = `Fig. ${chapter.no}${i ? '.' + i : ''}`;
    $('figtitle').textContent = PAGES[i].fig;
    [...$('dots').children].forEach((b, k) => b.setAttribute('aria-current', k === i));
  }
  const goto = (i, now) => scrollTo({ top: Math.max(0, Math.min(N - 1, i)) * pageH, behavior: reduced || now ? 'auto' : 'smooth' });
  const fromHash = () => { const m = /^#(\d+)$/.exec(location.hash); return m && +m[1] < N ? +m[1] : null; };
  history.scrollRestoration = 'manual';
  addEventListener('hashchange', () => { const k = fromHash(); if (k !== null) goto(k); });
  // a compact pager for small screens, where a row of dots would not fit
  $('dots').insertAdjacentHTML('afterend', '<span class="pager"><button type="button" id="pgprev" aria-label="Previous page">‹</button><button type="button" id="pagenum" popovertarget="toc" aria-label="Contents"></button><button type="button" id="pgnext" aria-label="Next page">›</button></span><nav class="sitelinks" aria-label="Site"><a class="eqlink mid" href="/subjects/">Subjects</a>' + (chapter.equations === false ? '' : '<a class="eqlink" href="../equations/">Equations</a>') + '<a class="eqlink mid" href="/practice/">Practice</a><a class="eqlink wide" href="/pricing/">Premium</a><a class="eqlink wide" href="/teachers/">Teachers</a><a class="eqlink mid" id="nav-auth" href="/login/">Log in</a><button type="button" class="menu" popovertarget="sitemenu" aria-label="Menu"><i></i><i></i><i></i></button><button type="button" class="theme" aria-label="Switch to dark mode" aria-pressed="false"><svg class="moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg><svg class="sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></button></nav>');
  document.querySelector('.sitelinks .theme').setAttribute('aria-pressed', String(document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches));
  { const a = $('nav-auth'); let on = false;
    try { on = Object.keys(localStorage).some(k => /^sb-.+-auth-token$/.test(k)); } catch {}
    if (on) { a.textContent = 'Account'; a.href = '/account/'; } else a.href = '/login/?next=' + encodeURIComponent(location.pathname);
    // narrower windows hide some of the links; the menu (a native popover) has the hidden ones (drawer.css, by the same classes)
    const m = document.createElement('nav');
    m.id = 'sitemenu'; m.popover = 'auto'; m.setAttribute('aria-label', 'Site');
    m.innerHTML = [...document.querySelectorAll('.sitelinks a.wide, .sitelinks a.mid')].map(x => `<a class="${x.classList.contains('wide') ? 'wide' : 'mid'}" href="${x.getAttribute('href')}">${x.textContent}</a>`).join('');
    document.body.append(m); }
  $('pgprev').onclick = () => goto(Math.round(scrollY / pageH) - 1); $('pgnext').onclick = () => goto(Math.round(scrollY / pageH) + 1);
  // small screens: the page number opens the chapter's contents (a native popover, drawer.css styles it as a sheet)
  const toc = document.createElement('div');
  toc.id = 'toc'; toc.className = 'toc'; toc.popover = 'auto';
  toc.innerHTML = PAGES.map((p, i) => `<button type="button" data-p="${i}"><span class="kicker">${p.kicker}</span>${p.title}</button>`).join('');
  toc.onclick = e => { const b = e.target.closest('button'); if (b) { toc.hidePopover(); goto(+b.dataset.p); } };
  document.body.append(toc);
  PAGES.forEach((p, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Page ${i + 1}: ${p.title}`);
    b.onclick = () => goto(i);
    $('dots').appendChild(b);
  });

  // ---------- scene ----------
  const E = createEngine($('gl'), { fov: 18, near: 0.2, far: 300 });
  const bare = new Set(E.scene.children);        // what the engine owns; the rest is the world
  let W = chapter.buildWorld(E);
  // the figure's box, read once per resize: reading it every frame forced a layout after each DOM write.
  // Its size is the layout size, so the book zooming open (cover.js) cannot shrink the canvas; cover.js refits after.
  let rect;
  // Resizing clears the canvas, and a ResizeObserver runs after the frame has drawn, so it draws again at once: else
  // the cleared canvas is painted and the figure flickers while the window is resized
  let drawn = false;
  const fit = () => { const c = $('gl'), b = c.getBoundingClientRect(); rect = { left: b.left, top: b.top, width: c.clientWidth, height: c.clientHeight }; E.resize(rect.width, rect.height); if (drawn) E.render(); };
  addEventListener('resize', fit);
  new ResizeObserver(fit).observe($('gl')); fit();

  // ---------- phones upright: the figure docks, and opens full screen ----------
  const root = document.documentElement;
  const dockQ = matchMedia('(max-width: 900px) and (min-height: 521px)');
  // the figure gives up to half its height as the text scrolls, pixel for pixel, like a collapsing header: the text page
  // runs the book's full height under it (drawer.css), so nothing resizes under the finger and nothing snaps. The
  // figure is cropped, not resized, so the canvas keeps its size; only where it sits moves, which picking reads
  let shrinking = 0;
  function shrink() {
    shrinking = 0;
    const on = dockQ.matches && !root.matches('.pd-on, .explore'), max = $('gl').clientHeight / 2;
    const s = on ? Math.min($('left').scrollTop, max) : 0;
    $('book').style.setProperty('--shrink', `${s}px`);
    root.classList.toggle('docked', on && s >= max - 1);
    const b = $('gl').getBoundingClientRect(); rect.left = b.left; rect.top = b.top;
  }
  $('left').addEventListener('scroll', () => { shrinking ||= requestAnimationFrame(shrink); }, { passive: true });
  const docked = () => root.matches('.docked:not(.pd-on):not(.explore)');   // as drawer.css shows it

  // explore: the figure takes the book, with a pause and a button for each thing that breaks down (no hover on a phone)
  let held = false;
  $('gl').parentElement.insertAdjacentHTML('beforeend', `<button type="button" class="xopen" id="xopen" aria-pressed="false" aria-label="Open the figure full screen">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></button>
    <div class="xbar"><button type="button" class="xhold" id="xhold" aria-pressed="false" aria-label="Pause"></button><div class="xchips" id="xchips"></div></div>`);
  function explore(on) {
    root.classList.toggle('explore', on);
    if (on) root.classList.remove('docked');
    held = false; $('xhold').setAttribute('aria-pressed', 'false');
    $('xopen').setAttribute('aria-pressed', String(on));
    $('xopen').setAttribute('aria-label', on ? 'Close the full-screen figure' : 'Open the figure full screen');
    chips(); shrink();
  }
  $('xopen').onclick = () => explore(!root.classList.contains('explore'));
  $('xhold').onclick = () => { held = !held; $('xhold').setAttribute('aria-pressed', String(held)); };
  $('xchips').onclick = e => { const b = e.target.closest('button'); if (b) select(b.dataset.k === selected ? null : b.dataset.k); };
  // the things on screen now that have a breakdown
  const box3 = new E.THREE.Box3(), mid = new E.THREE.Vector3();
  const visible = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
  function chips() {
    if (!root.classList.contains('explore')) return;
    const ks = Object.keys(PLATES).filter(k => {
      const g = E.ASM[k];
      if (!g || g.userData.noPick || !visible(g)) return false;
      const [x, y, front] = E.toScreen(box3.setFromObject(g).getCenter(mid), rect.width, rect.height);
      return front && x > 0 && x < rect.width && y > 0 && y < rect.height;
    });
    $('xchips').innerHTML = ks.map(k => `<button type="button" data-k="${k}" aria-pressed="${k === selected}">${E.ASM[k].userData.title}</button>`).join('');
  }

  // ---------- labels anchored to the scene ----------
  const makeLabels = list => (list || []).map(L => {
    const el = document.createElement('div'); el.className = 'lbl ' + L.cls; el.innerHTML = L.html; $('labels').appendChild(el);
    return { el, at: L.at, text: L.text, last: L.html };   // text: optional () => html for live values
  });
  let labels = makeLabels(W.labels), marks = [];
  function placeLabels(w, h) {
    for (const L of [...labels, ...marks]) {
      const p = L.at();
      if (!p) { L.el.style.opacity = 0; continue; }
      const [x, y, front] = E.toScreen(p, w, h);
      L.el.style.opacity = front && x > 8 && x < w - 8 && y > 8 && y < h - 8 ? 1 : 0;
      L.el.style.left = `${x}px`; L.el.style.top = `${y}px`;
      if (L.text) { const h = L.text(); if (h !== L.last) { L.el.innerHTML = h; L.last = h; } }
    }
  }

  // ---------- hover / click ----------
  let hovered = null, selected = null, pageLit = PAGES[0].lit;
  const relight = () => E.setLit(hovered || selected || (Q && Q.lit) || pageLit);
  // hover is re-checked every frame at the pointer's last spot, so moving things light up as they
  // pass under a still cursor and a click lands on whatever is lit at that moment
  // Hover is latched: once something lights up it stays lit (and time stays stopped) until the
  // pointer moves LATCH px from where it caught it, so a moving thing can't slip out from under it.
  let pointer = null, anchor = null;
  const LATCH = 40;
  function hoverAt(fromMove) {
    if (!pointer || (drag && drag.moved)) return;
    if (hovered && anchor && Math.hypot(pointer.x - anchor.x, pointer.y - anchor.y) < LATCH) return;
    if (!fromMove && hovered) return;            // per-frame checks only catch new things passing under
    const r = rect;
    const k = E.pick(pointer.x - r.left, pointer.y - r.top, r.width, r.height);
    if (k) anchor = { ...pointer };
    if (k !== hovered) {
      hovered = k; relight();
      if (k) timeRate = 0;                       // stop at once, so it stays where it was caught
      $('gl').classList.toggle('pointing', !!k);
      $('hint').textContent = k ? `${E.ASM[k].userData.title} — click to break it down` : selected ? CLOSE_HINT : DEFAULT_HINT;
    }
  }
  // drag turns the camera around the subject; shift- or right-drag pans; a still click selects
  const orbit = { az: 0, el: 0, pan: new E.THREE.Vector3() };
  let drag = null;
  $('gl').addEventListener('contextmenu', e => e.preventDefault());
  $('gl').addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, pan: e.shiftKey || e.button === 2, moved: false };
    $('gl').setPointerCapture(e.pointerId);
  });
  $('gl').addEventListener('pointerup', e => {
    // a docked figure: a tap brings it back (the text to its top) rather than picking
    if (drag && !drag.moved && docked()) { $('left').scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); drag = null; return; }
    if (drag && !drag.moved && e.button === 0) {
      // a finger has no hover: a tap picks whatever is under it
      const k = e.pointerType === 'mouse' ? hovered : E.pick(e.clientX - rect.left, e.clientY - rect.top, rect.width, rect.height);
      select(k && k !== selected ? k : null);
    }
    drag = null; $('gl').classList.remove('dragging');
  });
  $('gl').addEventListener('dblclick', () => { orbit.az = 0; orbit.el = 0; orbit.pan.set(0, 0, 0); });
  $('gl').addEventListener('pointermove', e => {
    if (drag) {
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.moved && Math.hypot(dx, dy) < 4) return;
      drag.moved = true; drag.x = e.clientX; drag.y = e.clientY;
      $('gl').classList.add('dragging');
      if (drag.pan) {
        // world units per screen pixel at the target's depth, so the scene follows the cursor
        const cam = E.camera, k = 2 * Math.tan(E.THREE.MathUtils.degToRad(cam.fov / 2)) * cam.position.distanceTo(lookAt) / rect.height;
        const right = new E.THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new E.THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
        orbit.pan.addScaledVector(right, -dx * k).addScaledVector(up, dy * k);
      } else { orbit.az -= dx * 0.35; orbit.el += dy * 0.25; }
      return;
    }
    pointer = { x: e.clientX, y: e.clientY };
    hoverAt(true);
  });
  $('gl').addEventListener('pointerleave', () => { pointer = null; anchor = null; hovered = null; relight(); $('gl').classList.remove('pointing'); });
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!selected && root.classList.contains('explore')) explore(false); else select(null); }
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goto(Math.round(scrollY / pageH) + 1); }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goto(Math.round(scrollY / pageH) - 1); }
  });

  let selectScroll = 0, focusAmt = 0, lastFocus = null;
  function focusOf(k) {
    const g0 = E.ASM[k];
    // an assembly may name its own breakdown view: userData.focus = () => ({ target: [x, y, z], radius })
    if (g0.userData.focus) { const f = g0.userData.focus(); return { target: f.target, dist: Math.max(E.distFor(f.radius), g0.userData.minDist ?? 2) }; }
    const g = g0, box = new E.THREE.Box3();
    g.updateMatrixWorld(true);
    const shown = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };   // hidden parents too
    g.traverse(o => { if (o.isMesh && o.userData.part !== undefined && shown(o)) box.expandByObject(o); });
    const s = box.getBoundingSphere(new E.THREE.Sphere());
    return { target: s.center.toArray(), dist: Math.max(E.distFor(Math.max(s.radius, g.userData.minRadius ?? 1.2)), g.userData.minDist ?? 8) };   // a scene may allow a closer zoom
  }
  function select(k) {
    selected = k;
    for (const [key, g] of Object.entries(E.ASM)) g.userData.target = key === k ? 1 : 0;
    selectScroll = scrollY; relight(); chips();
    const plate = $('plate');
    if (!k) { plate.hidden = true; $('hint').textContent = DEFAULT_HINT; return; }
    const u = E.ASM[k].userData;
    plate.innerHTML = `
      <button class="close" type="button">${touch ? 'Close' : 'Close · Esc'}</button>
      <div class="kicker">Breakdown</div>
      <h1>${u.title}</h1>
      <div class="sub">${u.sub}</div>
      <p>${PLATES[k].text}</p>
      <table class="data" id="facts"></table>`;
    plate.hidden = false;
    plate.querySelector('.close').onclick = () => select(null);
    $('hint').textContent = CLOSE_HINT;
  }

  // a small badge says when motion is stopped (pointing at something, or a breakdown open)
  const paused = document.createElement('div');
  paused.className = 'paused'; paused.setAttribute('aria-hidden', 'true');
  paused.innerHTML = '<span class="bars"></span>paused';
  $('gl').parentElement.appendChild(paused);

  // ---------- frame ----------
  // resolution follows the device: if frames run slow for two seconds running, draw fewer pixels
  // ponytail: only ever steps down (to 1 px per CSS px); stepping back up would need hysteresis
  let last0 = performance.now(), slow = 0, win = [], dprCap = touch ? 1.25 : 2;
  E.setDprCap(dprCap);
  function adapt(ms) {
    win.push(ms);
    if (win.length < 120) return;
    const hitch = Math.max(...win) > 250, avg = win.reduce((a, b) => a + b) / win.length;
    win = [];
    if (hitch) return;
    slow = avg > 1000 / 45 ? slow + 1 : 0;
    if (slow >= 2 && dprCap > 1) { dprCap = Math.max(1, dprCap - 0.25); E.setDprCap(dprCap); slow = 0; }
  }
  let timeRate = 1, last = performance.now(), clock = chapter.clock0 || 0, orbitPage = 0, orbitHome = false;

  // ---------- questions ----------
  // Q: { page, scene, cam, t (frozen physics time) | play [from, to] (looped), look, lit, open, clock }
  let Q = null, built = '{}';
  function rebuild(params = {}) {
    const key = JSON.stringify(params);
    if (key === built) return;
    built = key;
    select(null); hovered = null;
    chapter.setParams(params);
    for (const o of [...E.scene.children]) if (!bare.has(o)) { E.scene.remove(o); o.traverse(m => m.geometry?.dispose()); }
    for (const k of Object.keys(E.ASM)) delete E.ASM[k];
    for (const L of [...labels, ...marks]) L.el.remove();
    marks = [];
    W = chapter.buildWorld(E);
    labels = makeLabels(W.labels);
    relight();
  }
  function setMarks(list) {
    for (const L of marks) L.el.remove();
    marks = makeLabels(W.setMarks ? W.setMarks(list) : []);
  }
  const question = {
    on: !!chapter.setParams,
    // a question opens: its numbers, its page, then the figure plays its run
    start({ page, params = {}, ...view }) {
      if (!chapter.setParams) return;
      rebuild(params);
      Q = { page, scene: PAGES[page].scene, cam: view.cam, clock: 0 };
      question.step(view);
      goto(page);
    },
    // a step of the working: a moment (t) or a stretch (play), and what to show
    step({ t, play, look, lit, open, marks: mk } = {}) {
      if (!Q) return;
      Object.assign(Q, { t, play, look, lit, open: open || null, clock: 0 });
      for (const [k, g] of Object.entries(E.ASM)) g.userData.target = k === Q.open ? 1 : 0;
      setMarks(mk || []); relight();
    },
    end() {
      if (!Q) return;
      Q = null; setMarks([]);
      for (const g of Object.values(E.ASM)) g.userData.target = 0;
      rebuild({}); relight();
    },
  };
  // the physics time a question shows now
  function questionTime(dt) {
    Q.clock += dt;
    if (Q.t !== undefined && Q.t !== null) return Q.t;
    const [a, b] = Q.play || [0, chapter.runOf(Q.scene)];
    const c = (Q.clock * chapter.rate(Q.scene)) % (b - a + 0.8);   // hold the end a moment, then again
    return a + Math.min(c, b - a);
  }
  const lookAt = new E.THREE.Vector3();
  // phones: 30 frames a second while nobody is touching the figure or turning the page, to spare the battery and the scroll
  let scrolled = 0, settle = 0;
  // explore's buttons are for what's on screen once a page turn has settled
  addEventListener('scroll', () => { scrolled = performance.now(); clearTimeout(settle); settle = setTimeout(chips, 450); }, { passive: true });
  let readout = '', facts = '';
  function frame(now) {
    const capped = touch && !drag && now - scrolled > 400;
    if (capped && now - last0 < 1000 / 30 - 4) { requestAnimationFrame(frame); return; }
    const dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20); last = now;   // a frame stamp can predate setup
    const s = Math.min(Math.max(scrollY / pageH, 0), N - 1);
    const i = Math.min(Math.floor(s), N - 1), f = s - i, j = Math.min(i + 1, N - 1);
    if (selected && Math.abs(scrollY - selectScroll) > pageH * 0.25) select(null);
    if (!capped) adapt(now - last0);
    last0 = now;

    // text: the leaf turns over the second half of each page's scroll
    const flip = narrow() || i === j ? 0 : smooth(0.5, 1, f);
    showPage(flip > 0.999 ? j : (narrow() ? Math.round(s) : i));
    // a page turned away from the question puts the lesson back
    if (Q && Math.abs(s - Q.page) < 0.05) Q.arrived = true;   // start() scrolls there first
    if (Q && Q.arrived && Math.abs(s - Q.page) > 0.6) { question.end(); dispatchEvent(new Event('questionend')); }
    if (PAGES[shown].lit !== pageLit) { pageLit = PAGES[shown].lit; relight(); }
    const leaf = $('leaf');
    if (flip > 0.001 && flip < 0.999) {
      if (leafFor !== j) { leafFor = j; $('leafsheet').innerHTML = sheetHtml(j); $('leafnext').textContent = PAGES[j].fig; leafFolio.lastElementChild.textContent = j + 1; }
      leaf.style.visibility = 'visible';
      leaf.style.transform = `rotateY(${-180 * flip}deg)`;
      leaf.querySelector('.leaf-front').style.opacity = 0.25 + 0.6 * smooth(0.15, 0.5, flip);
      leaf.style.setProperty('--shade', (0.10 * Math.sin(flip * Math.PI)).toFixed(3));
    } else leaf.style.visibility = 'hidden';
    $('cue').style.opacity = s < 0.05 ? 1 : 0;

    // camera: the scroll path, blended toward the opened thing
    const u = ease(smooth(0.3, 1, f));
    // a question may frame its own view of its page (scene.cam: any of target, az, el, dist)
    const camOf = k => Q && Q.cam && k === Q.page ? { ...PAGES[k].cam, ...Q.cam } : PAGES[k].cam;
    const A = camOf(i), B = camOf(j);
    let cam = { target: A.target.map((v, k) => lerp(v, B.target[k], u)), az: lerp(A.az, B.az, u), el: lerp(A.el, B.el, u), dist: lerp(A.dist, B.dist, u) };
    cam.dist *= Math.max(1, 1.25 / E.camera.aspect);
    if (!reduced && !drag) cam.az += Math.sin(now / 5200) * 1.2;
    const page = Math.round(s);
    if (page !== orbitPage) { orbitPage = page; orbitHome = true; }
    if (drag && drag.moved) orbitHome = false;
    if (orbitHome) { const k = Math.exp(-dt * 3); orbit.az *= k; orbit.el *= k; orbit.pan.multiplyScalar(k); }
    focusAmt += ((selected ? 1 : 0) - focusAmt) * (1 - Math.exp(-dt * 4));
    if (selected) lastFocus = focusOf(selected);
    if (focusAmt > 0.001 && lastFocus) {
      const F = lastFocus;
      cam = { target: cam.target.map((v, k) => lerp(v, F.target[k], focusAmt)), az: cam.az, el: lerp(cam.el, Math.max(cam.el, 6), focusAmt), dist: lerp(cam.dist, F.dist, focusAmt) };
    }
    cam.az += orbit.az;
    cam.el = Math.min(Math.max(cam.el + orbit.el, -4), 85);
    cam.target = cam.target.map((v, k) => v + orbit.pan.getComponent(k));
    lookAt.fromArray(cam.target);
    E.placeCamera(cam);

    // physics: time pauses while something is open, so it can be read
    // time eases to a stop while something is pointed at or open, so moving things can be caught and read
    timeRate = selected || hovered || held ? 0 : timeRate + (1 - timeRate) * (1 - Math.exp(-dt * 4));
    if (!reduced) clock += dt * timeRate;
    paused.classList.toggle('on', !reduced && !!(selected || hovered || held));
    const state = Q ? chapter.stateAt(questionTime(dt * timeRate)) : chapter.state(clock, reduced);
    const LA = PAGES[i].look, LB = PAGES[j].look, look = {};
    for (const key of chapter.lookKeys) look[key] = lerp(LA[key] || 0, LB[key] || 0, u);
    if (Q && Q.look) Object.assign(look, Q.look);
    if (chapter.forceLook) chapter.forceLook(selected, look);
    W.update(state, look);
    E.stepExplode(dt);

    // the DOM only when its text changes: rewriting it every frame forced a layout each time
    const ro = chapter.readout(state, PAGES[shown]);
    if (ro !== readout) $('readout').textContent = readout = ro;
    if (chapter.onFrame) chapter.onFrame(state, [$('sheet'), $('leafsheet')]);
    if (selected && $('facts')) {
      const fx = PLATES[selected].facts(state).map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('');
      if (fx !== facts || !$('facts').firstChild) $('facts').innerHTML = facts = fx;
    }

    hoverAt(false);
    E.render(); drawn = true;
    placeLabels(rect.width, rect.height);
    requestAnimationFrame(frame);
  }
  relight();
  { const k = fromHash(); if (k !== null) goto(k, true); }
  // the first frame drawn: the book can open now (cover.js)
  document.fonts.ready.then(() => requestAnimationFrame(t => { frame(t); dispatchEvent(new Event('bookready')); }));
  window.__atlas = { E, select, goto, question, explore };
  dispatchEvent(new Event('atlasready'));
}
