// Chapter pages (injected by tools/build.mjs): practice in a drawer beside the figure, a bottom sheet on phones.
// A question that comes with a scene plays on the figure (window.__atlas.question): its own numbers, its moment,
// and, once answered, its worked steps, each moving the figure. A wrong number is drawn where it would put things.
// The book's own page text stays as it is; turning the page puts the lesson's figure back.
const CH = location.pathname.split('/').filter(Boolean).at(-1), HOME = location.pathname.replace(/[^/]*\/?$/, '');   // /physics/kinematics/ → kinematics, /physics/
const Q0 = new URLSearchParams(location.search);   // read now: the book drops the query on its first page
const WANT = Q0.get('set'), SAMPLES = Q0.has('samples');
const $ = id => document.getElementById(id);
const page = () => { const m = /^#(\d+)$/.exec(location.hash); return m ? +m[1] : 0; };
const atlas = () => window.__atlas ? Promise.resolve(window.__atlas)
  : new Promise(r => addEventListener('atlasready', () => r(window.__atlas), { once: true }));
let app = null;   // /js/app.js (Supabase), loaded the first time the drawer opens
const fmt = x => (x < 0 ? '−' : '') + (Math.abs(x) >= 1000 || (Math.abs(x) < 0.01 && x !== 0) ? Math.abs(x).toExponential(2) : +Math.abs(x).toPrecision(3));
// the page's language (tools/build.mjs: /ja/… pages have data-base="/ja"); where a comma is the decimal point, 4,9 is 4.9
const PATH_LOCALE = /^\/(id|ms|vi|zh|zh-tw|ja|ko|hi|es|pt)(?=\/|$)/.exec(location.pathname)?.[1];
if (PATH_LOCALE && !document.documentElement.dataset.base) {
  document.documentElement.dataset.base = '/' + PATH_LOCALE;
  document.documentElement.lang = PATH_LOCALE;
}
const LANG = document.documentElement.dataset.base?.slice(1) || PATH_LOCALE || 'en', COMMA = ['id', 'vi', 'tr', 'ru', 'es', 'pt', 'fr', 'de'].includes(LANG);
const readNum = s => { const v = Number(String(s).trim().replace(/[−–]/g, '-').replace(/,/g, COMMA ? '.' : '').replace(/\s+/g, '')); return s.trim() && Number.isFinite(v) ? v : null; };
const named = set => ({ ...set, title: set.i18n?.[LANG]?.title ?? set.title });   // a set's title in the page's language
// skeletons, the shape of what's loading in its own place: a line of text, the sets, a question
const sk = (w, h = '') => `<span class="sk"${w || h ? ` style="${w ? `width:${w};` : ''}${h ? `height:${h}` : ''}"` : ''}>&nbsp;</span>`;
const SK_SETS = n => `<ul class="pd-sets" aria-busy="true">${`<li><button type="button" disabled><span class="pg">${sk('3em')}</span><span class="t">${sk('70%')}</span><span class="tag">${sk('3em')}</span></button></li>`.repeat(n)}</ul>`;
const SK_QUESTION = `<section class="practice pd-q" aria-busy="true"><p class="qtext">${sk('100%')}<br>${sk('92%')}<br>${sk('55%')}</p>
  <ol class="choices">${`<li><button type="button" disabled><span class="letter">${sk('1em')}</span><span>${sk('60%')}</span></button></li>`.repeat(4)}</ol></section>`;


document.body.insertAdjacentHTML('beforeend', `
  <button type="button" class="pd-open" id="pd-open" aria-controls="pd" aria-expanded="false">Practice</button>
  <aside class="pd" id="pd" role="dialog" aria-label="Practice" aria-hidden="true" inert>
    <header class="pd-head"><div><div class="kicker" id="pd-kicker">Practice</div><div class="pd-title" id="pd-title"></div></div>
      <button type="button" class="pd-x" id="pd-x" aria-label="Close practice">×</button></header>
    <div class="pd-body" id="pd-body" aria-live="polite"></div>
  </aside>`);
const drawer = $('pd'), btn = $('pd-open'), body = $('pd-body');
const isOpen = () => drawer.classList.contains('open');

// ---------- open / close ----------
async function setOpen(open) {
  drawer.classList.toggle('open', open);
  drawer.toggleAttribute('inert', !open);
  drawer.setAttribute('aria-hidden', String(!open));
  btn.setAttribute('aria-expanded', String(open));
  document.documentElement.classList.toggle('pd-on', open);
  if (open) {
    window.__atlas?.explore(false);   // phones: out of the full-screen figure, back to the book the sheet sits in
    $('pd-x').focus({ preventScroll: true });
    if (S.set) showQuestion(); else await home();
  } else {
    (await atlas()).question.end();
    btn.focus({ preventScroll: true });
  }
}
btn.onclick = () => setOpen(!isOpen());
$('pd-x').onclick = () => setOpen(false);
addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { e.stopImmediatePropagation(); setOpen(false); } }, true);

// ---------- state ----------
// S.set: { meta, problems, i, results: { id: result }, step: { id: k }, sample? }
const S = { sets: null, samples: [], status: null, done: {}, set: null, paused: false };

async function load() {
  app ??= await import('/js/app.js');
  const [st, { data: sets }, { data: samples }] = await Promise.all([app.status(),
    app.sb.from('problem_sets').select('*').eq('chapter', CH).order('position'), app.sb.rpc('open_samples', { p_chapter: CH, p_lang: LANG })]);
  S.status = st; S.sets = (sets ?? []).map(named); S.samples = samples ?? []; S.done = {};
  if (st) {
    const { data: att } = await app.sb.from('attempts').select('problem_id').like('problem_id', `${CH}-%`);
    for (const id of new Set((att ?? []).map(a => a.problem_id))) { const s = id.slice(0, id.lastIndexOf('-')); S.done[s] = (S.done[s] ?? 0) + 1; }
  }
}

// ---------- the chapter's sets ----------
async function home(note = '') {
  S.set = null;
  (await atlas()).question.end();
  $('pd-kicker').textContent = 'Practice';
  if (app) $('pd-title').textContent = app.CHAPTERS[CH] ?? CH; else $('pd-title').innerHTML = sk('8em');
  // the samples' card, the line under it and the sets, as skeletons (as many sets as last time, before the first load)
  body.innerHTML = `<div class="pd-cta" aria-hidden="true"><p>${sk('14em')}</p>${sk('7em', '38px')}</div><p class="note pd-pad">${sk('80%')}</p>${SK_SETS(S.sets?.length || 5)}`;
  await load();
  $('pd-title').textContent = app.CHAPTERS[CH] ?? CH;
  const st = S.status, free = new Set(st?.free_sets ?? []), left = st ? st.free_limit - free.size : 3, i = page();
  const tag = s => {
    if (S.done[s.id]) return `<span class="tag done">${S.done[s.id]} / ${s.n_problems}</span>`;
    if (st?.premium) return `<span class="tag">${s.n_problems} q</span>`;
    if (free.has(s.id)) return '<span class="tag free">your free set</span>';
    return left > 0 ? '<span class="tag">free</span>' : '<span class="tag lock">Premium</span>';
  };
  const n = S.samples.length;
  body.innerHTML = `${note}
    ${n ? `<div class="pd-cta"><p><b>Try ${n === 1 ? 'a sample question' : `${n} sample questions`}</b>${st ? '' : ', no account needed'}.</p>
      <button type="button" class="pd-btn${st ? ' ghost' : ''}" data-act="samples">Try ${n === 1 ? 'it' : 'them'}</button></div>` : ''}
    ${!st ? `<p class="note pd-pad">Make a free account for more: any 3 sets are free. <a href="${app.loginUrl(`${HOME}${CH}/#${i}`)}">Sign up</a></p>`
    : st.premium ? '' : `<p class="note pd-pad">${left > 0 ? `${left} of ${st.free_limit} free sets left.` : 'Free sets used.'} <a href="/pricing/">Premium</a> opens every set.</p>`}
    <ul class="pd-sets">${S.sets.map(s => `<li><button type="button" data-set="${s.id}" class="${s.page_from <= i && i <= s.page_to ? 'here' : ''}">
      <span class="pg">${s.pages}</span><span class="t">${s.title}</span>${tag(s)}</button></li>`).join('')}</ul>`;
}

body.addEventListener('click', async e => {
  const b = e.target.closest('button'); if (!b) return;
  if (b.dataset.set) return openSet(b.dataset.set);
  if (b.dataset.act) return ACT[b.dataset.act](b);
});

// ---------- opening a set (the soft and hard paywall) ----------
async function openSet(id, confirmed = false) {
  if (!S.status) { location.assign(app.loginUrl(`${HOME}${CH}/?set=${id}#${page()}`)); return; }
  const st = S.status, mine = st.premium || st.free_sets.includes(id), left = st.free_limit - st.free_sets.length;
  const meta = S.sets.find(s => s.id === id);
  if (!mine && left <= 0) return paywall();
  if (!mine && !confirmed) {
    body.innerHTML = `<div class="pd-cta"><p><b>${meta.pages} · ${meta.title}</b></p><p>This will be free set ${st.free_sets.length + 1} of ${st.free_limit}. Free sets stay yours.</p>
      <span class="row"><button type="button" class="pd-btn" data-act="confirm" data-id="${id}">Start this set</button><a class="pd-btn ghost" href="/pricing/">See Premium</a></span></div>
      <p class="pd-pad"><button type="button" class="pd-link" data-act="home">← All sets</button></p>`;
    return;
  }
  $('pd-kicker').innerHTML = `${meta.pages} · ${sk('6em')}`; $('pd-title').textContent = meta.title;
  body.innerHTML = SK_QUESTION;
  const { data, error } = await app.sb.rpc('open_set', { p_set: id, p_lang: LANG });
  if (error?.hint === 'paywall') return paywall();
  if (error?.code === '28000') return signedOut(`${HOME}${CH}/?set=${id}#${page()}`);
  if (error) { body.innerHTML = `<p class="err pd-pad">${app.esc(error.message)}</p>`; return; }
  S.status = await app.status();
  const { data: att } = await app.sb.from('attempts').select('problem_id').in('problem_id', data.problems.map(p => p.id));
  const answered = new Set((att ?? []).map(a => a.problem_id));
  const first = data.problems.findIndex(p => !answered.has(p.id));
  S.set = { meta: named(data.set), problems: data.problems, i: first < 0 ? 0 : first, results: {}, step: {} };
  showQuestion();
}
// the server no longer knows this sign-in (the account was deleted): drop it and sign in again
async function signedOut(next) {
  await app.sb.auth.signOut({ scope: 'local' });
  location.assign(app.loginUrl(next));
}
function paywall() {
  body.innerHTML = `<div class="pd-cta"><p>You’ve used your free sets.</p><p>Premium opens every set in every chapter, with the working shown step by step.</p>
    <a class="pd-btn" href="/pricing/?locked=1">See Premium</a></div><p class="pd-pad"><button type="button" class="pd-link" data-act="home">← All sets</button></p>`;
}

// ---------- one question ----------
// a wrong answer can be tried again, with nothing given away; the answer and its working open once it is right,
// or when the student gives up (Show the answer: r.shown). Next is there throughout, answered or not.
const cur = () => S.set.problems[S.set.i];
const settled = r => !!r && (r.correct || r.shown);
async function play(q, view = q.scene) {
  const A = await atlas();
  if (q.scene) A.question.start({ ...q.scene, ...view, page: q.scene.page, params: q.scene.params });
  S.paused = false;
}

function showQuestion() {
  const { meta, problems, i } = S.set, q = cur(), r = S.set.results[q.id], end = settled(r), tries = r?.tries ?? [];
  $('pd-kicker').textContent = `${S.set.sample ? 'Sample' : meta.pages} · question ${i + 1} of ${problems.length}`;
  $('pd-title').textContent = meta.title;
  const answer = q.kind === 'num'
    ? `<form class="pd-num" data-form="num"><label class="kicker" for="pd-in">Your answer</label>
        <span class="row"><input id="pd-in" inputmode="decimal" autocomplete="off" spellcheck="false" ${end ? 'disabled' : ''} value="${r?.mine ?? ''}">
        <span class="unit">${q.unit ?? ''}</span><button class="pd-btn" ${end ? 'disabled' : ''}>Check</button></span><p class="err" id="pd-err"></p></form>`
    : q.kind === 'mcq'
      ? `<ol class="choices">${q.choices.map((c, k) => `<li><button type="button" data-act="pick" data-c="${k}" aria-pressed="false" ${end || tries.includes(k) ? 'disabled' : ''}
          class="${end && k === r.answer ? 'right' : tries.includes(k) ? 'wrong' : ''}"><span class="letter">${'ABCDE'[k]}</span><span>${c}</span></button></li>`).join('')}</ol>
        ${end ? '' : '<button type="button" class="pd-btn pd-check" data-act="choose" disabled>Check</button>'}`
      : r ? '' : '<button type="button" class="pd-btn ghost" data-act="reveal">Show the solution</button>';
  const giveUp = q.kind === 'num' || q.kind === 'mcq' ? (end ? '' : '<p class="pd-pad"><button type="button" class="pd-link" data-act="giveup">Show the answer</button></p>') : '';
  body.innerHTML = `<section class="practice pd-q">
      <p class="qtext">${q.prompt}</p>
      ${q.scene ? '<p class="note pd-hint">The figure is showing this question’s numbers.</p>' : ''}
      ${answer}
      <div id="pd-result"></div>
      ${giveUp}
      <div id="pd-steps"></div>
      <div id="pd-ask"></div>
    </section>
    <nav class="pd-nav">
      <button type="button" class="pd-link" data-act="home">← All sets</button>
      <span class="row">${end ? '<button type="button" class="pd-btn ghost" data-act="retry">Try again</button>' : ''}
        ${i > 0 ? '<button type="button" class="pd-btn ghost" data-act="prev">Previous</button>' : ''}
        ${i < problems.length - 1 ? `<button type="button" class="pd-btn ${end ? '' : 'ghost'}" data-act="next">${end ? 'Next question' : 'Skip'}</button>` : ''}</span>
    </nav>
    ${S.set.sample && !S.status && i === problems.length - 1 && end ? `<div class="pd-cta"><p>Make a free account to save your progress.</p>
      <a class="pd-btn" href="${app.loginUrl(`${HOME}${CH}/#${page()}`)}">Make a free account</a></div>` : ''}`;
  body.scrollTop = 0;
  const form = body.querySelector('[data-form="num"]');
  if (form) form.onsubmit = e => { e.preventDefault(); submitNum(); };
  showAsk(q);
  if (r) showResult(q, r);
  if (end) showStep(q, r, S.set.step[q.id] ?? (r.correct ? -1 : 0));
  else { play(q); const inp = body.querySelector('#pd-in'); inp?.focus({ preventScroll: true }); if (r) inp?.select(); }
}

async function submit(q, answer) {
  const { data, error } = await app.sb.rpc('submit_answer', { p_problem: q.id, p_answer: answer, p_lang: LANG });
  if (error?.hint === 'paywall') { paywall(); return null; }
  if (error?.code === '28000') { signedOut(`${HOME}${CH}/?set=${S.set.meta.id}#${page()}`); return null; }
  if (error) throw error;
  S.done[S.set.meta.id] = (S.done[S.set.meta.id] ?? 0) + (q.id in S.set.results ? 0 : 1);   // a retry isn't a new problem done
  return data;
}
async function submitNum() {
  const q = cur(), x = readNum($('pd-in').value);
  if (x === null) { $('pd-err').textContent = 'Enter a number, like 19.6 or −4.9.'; return; }
  answered(q, await submit(q, x), x);
}
// a go at the question: right ends it (the working a click away); wrong keeps it open for another go
function answered(q, r, mine) {
  if (!r) return;
  const tries = [...(S.set.results[q.id]?.tries ?? []), ...(r.correct ? [] : [mine])];
  S.set.results[q.id] = { ...r, mine, tries };
  delete S.set.step[q.id];
  showQuestion();
}

function showResult(q, r) {
  const unit = q.unit ? ` ${q.unit}` : '', num = q.kind === 'num', say = v => num ? `${fmt(v)}${unit}` : 'ABCDE'[v];
  let html = '';
  if (num || q.kind === 'mcq') {
    const slip = num && !r.correct && r.mine != null && (r.slips ?? []).find(([v]) => Math.abs(v - r.mine) <= Math.max(Math.abs(v) * 0.02, 1e-3));
    html = r.correct ? `<p class="pd-ok">Right${num ? `: ${say(r.value)}` : ''}.</p>`
      : r.shown ? `<p class="pd-no">The answer is ${say(num ? r.value : r.answer)}.</p>`
      : `<p class="pd-no">Not quite: ${say(r.mine)} isn’t it. Have another go.</p>`;
    if (slip) html += `<p class="pd-slip">${slip[1]}</p>`;
  }
  $('pd-result').innerHTML = html + (r.correct ? `<button type="button" class="pd-link" data-act="working">${r.steps ? 'See the working on the figure →' : 'See the solution →'}</button>` : '');
}

// the working, one step at a time; each step moves the figure (and keeps a wrong number drawn on it)
async function showStep(q, r, k) {
  S.set.step[q.id] = k;
  const box = $('pd-steps');
  // a question without worked steps (not played on the figure) shows its written solution once answered
  if (!r.steps) { box.innerHTML = k < 0 || !r.solution ? '' : `<div class="why">${r.solution}</div>`; return; }
  if (k < 0) { box.innerHTML = ''; play(q); return; }
  const st = r.steps[k], n = r.steps.length;
  box.innerHTML = `<div class="pd-step"><div class="kicker">Working · step ${k + 1} of ${n}</div>
      ${st.say ? `<p>${st.say}</p>` : ''}${st.eq ? `<div class="eq">${st.eq}</div>` : ''}
      <span class="row">${k > 0 ? '<button type="button" class="pd-btn ghost" data-act="back">Back</button>' : ''}
        ${k < n - 1 ? '<button type="button" class="pd-btn" data-act="fwd">Next step</button>' : '<button type="button" class="pd-btn ghost" data-act="replay">Replay the question</button>'}</span>
    </div>`;
  if (!q.scene) return;
  const ghost = !r.correct && q.kind === 'num' && r.mine != null ? (r.ghost ?? []).map(m => Object.fromEntries(Object.entries(m).map(([key, v]) =>
    [key, v === '$' ? r.mine : typeof v === 'string' ? v.replace('$', fmt(r.mine)) : v]))) : [];
  const A = await atlas();
  if (S.paused) play(q);   // back on the question's page first
  A.question.step({ ...st, marks: [...(st.marks ?? []), ...ghost] });
}

// ---------- follow-up questions (Premium): the tutor sees what the student sees ----------
// readable text of rendered HTML, with each KaTeX formula put back as its LaTeX
function textOf(src) {
  const d = typeof src === 'string' ? Object.assign(document.createElement('div'), { innerHTML: src }) : src.cloneNode(true);
  d.querySelectorAll('.practice, button').forEach(e => e.remove());
  d.querySelectorAll('div, p, h1, h2, h3, li, tr, td, section, aside, br').forEach(e => e.after(' '));   // blocks don't run together
  d.querySelectorAll('.katex').forEach(k => k.replaceWith(` $${k.querySelector('annotation')?.textContent ?? k.textContent}$ `));
  return d.textContent.replace(/\s+/g, ' ').trim();
}
function askContext(q) {
  const r = S.set.results[q.id], k = S.set.step[q.id] ?? -1, lines = [];
  lines.push(`Chapter: ${app.CHAPTERS[CH] ?? CH}. Practice set: ${S.set.meta.title} (${S.set.meta.pages}), question ${S.set.i + 1} of ${S.set.problems.length}.`);
  lines.push(`Question: ${textOf(q.prompt)}`);
  if (q.kind === 'mcq') lines.push(`Choices: ${q.choices.map((c, n) => `${'ABCDE'[n]}) ${textOf(c)}`).join('  ')}`);
  if (q.kind === 'num' && q.unit) lines.push(`Answer is a number in ${textOf(q.unit)}.`);
  if (!r) lines.push('The student has not answered yet.');
  else {
    const unit = q.unit ? ` ${textOf(q.unit)}` : '', say = v => q.kind === 'mcq' ? `${'ABCDE'[v]} (${textOf(q.choices[v])})` : `${fmt(v)}${unit}`;
    const scored = q.kind === 'num' || q.kind === 'mcq';
    if (scored && r.tries.length) lines.push(`Wrong tries so far: ${r.tries.map(say).join(', ')}.`);
    if (scored && r.correct) lines.push(`The student answered ${say(r.mine)}, which is CORRECT.`);
    else if (scored && r.shown) lines.push(`The student gave up and was shown the answer: ${say(q.kind === 'num' ? r.value : r.answer)}.`);
    else if (scored) lines.push('The student is still trying. Do NOT give them the answer or the full working; guide them with hints.');
    const slip = q.kind === 'num' && !r.correct && r.mine != null && (r.slips ?? []).find(([v]) => Math.abs(v - r.mine) <= Math.max(Math.abs(v) * 0.02, 1e-3));
    if (slip) lines.push(`Their number matches a known slip: ${textOf(slip[1])}`);
    if (!scored) lines.push(`The student revealed the solution${r.self === undefined ? '' : ` and marked themselves ${r.self ? 'as having got it right' : 'as not having got it'}`}.`);
    if (settled(r) && r.steps) lines.push('Worked solution:', ...r.steps.map((st, n) => `  Step ${n + 1}${n === k ? ' (on screen now)' : ''}: ${textOf(st.say ?? '')} ${st.eq ? textOf(st.eq) : ''}`));
    else if (settled(r) && r.solution) lines.push(`Solution: ${textOf(r.solution)}`);
  }
  const vis = [...document.querySelectorAll('#labels .lbl')].filter(l => l.style.opacity !== '0').map(l => textOf(l)).filter(Boolean);
  lines.push(`Figure: ${$('figtitle')?.textContent ?? ''}${q.scene ? ' (showing this question’s numbers)' : ''}. Readout: ${($('readout')?.textContent ?? '').replace(/\s+/g, ' ')}`);
  if (vis.length) lines.push(`Labels on the figure: ${vis.join(' · ')}`);
  if ($('plate') && !$('plate').hidden) lines.push(`Breakdown open on the figure: ${textOf($('plate'))}`);
  lines.push(`Textbook page ${page() + 1}: ${textOf($('sheet')).slice(0, 6000)}`);
  return lines.join('\n').slice(0, 15_000);
}
let katex = null;
async function rich(s) {
  katex ??= (await import('katex')).default;
  const tex = x => { const d = x.startsWith('$$'); return katex.renderToString(x.slice(d ? 2 : 1, d ? -2 : -1), { displayMode: d, throwOnError: false }); };
  return s.trim().split(/\n{2,}/).map(p => `<p>${p.split(/(\$\$[^$]+\$\$|\$[^$\n]+\$)/).map((x, k) => k % 2 ? tex(x)
    : app.esc(x).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')).join('')}</p>`).join('');
}
async function showAsk(q) {
  const box = $('pd-ask');
  // closed until asked for: a quiet link under the question; open once there is a conversation
  const fold = (open, inner) => `<details class="pd-ask"${open ? ' open' : ''}><summary>Ask a follow-up</summary>${inner}</details>`;
  if (!S.status?.premium) {
    box.innerHTML = fold(false, `<div class="pd-cta"><p>With Premium you can ask the tutor follow-up questions about this question and the figure.</p>
      <a class="pd-btn ghost" href="/pricing/">See Premium</a></div>`);
    return;
  }
  const chat = (S.set.chat ??= {})[q.id] ??= [];
  const msgs = await Promise.all(chat.map(async m => m.role === 'user' ? `<div class="pd-msg me">${app.esc(m.content)}</div>`
    : `<div class="pd-msg ai">${m.err ? `<p class="err">${app.esc(m.content)}</p>` : await rich(m.content)}</div>`));
  if (cur() !== q || $('pd-ask') !== box) return;   // moved on while the math loaded
  const busy = chat.at(-1)?.role === 'user';
  box.innerHTML = fold(chat.length, `
    <div class="pd-thread">${msgs.join('')}${busy ? `<div class="pd-msg ai" aria-busy="true" aria-label="Thinking">${sk('95%')}<br>${sk('80%')}<br>${sk('45%')}</div>` : ''}</div>
    <form class="pd-askf" data-form="ask"><label class="sr" for="pd-askin">Your question</label>
      <textarea id="pd-askin" rows="2" maxlength="2000" placeholder="${chat.length ? 'Ask another…' : 'e.g. Why is that the right equation to use here?'}" ${busy ? 'disabled' : ''}></textarea>
      <button class="pd-btn" ${busy ? 'disabled' : ''}>Ask</button></form>
    <p class="note pd-ask-note">The tutor is AI and can make mistakes.</p>`);
  const form = box.querySelector('form'), input = $('pd-askin');
  box.querySelector('details').ontoggle = e => { if (e.target.open) input.focus({ preventScroll: true }); };
  input.onkeydown = e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } };
  form.onsubmit = e => { e.preventDefault(); ask(q, input.value); };
}
async function ask(q, text) {
  text = text.trim(); if (!text) return;
  const chat = S.set.chat[q.id];
  chat.push({ role: 'user', content: text });
  showAsk(q);
  try {
    const { reply } = await app.fn('ask', { lang: document.documentElement.lang, context: askContext(q), messages: chat.filter((m, n) => !m.err && !chat[n + 1]?.err).slice(-19) });   // a failed turn isn't resent; odd, so it starts with the student
    chat.push({ role: 'assistant', content: reply });
  } catch (e) {
    if (e.status === 401) return signedOut(`${HOME}${CH}/?set=${S.set.meta.id}#${page()}`);
    chat.push({ role: 'assistant', content: e.message, err: true });
  }
  if (cur() === q) { await showAsk(q); $('pd-askin')?.focus({ preventScroll: true }); }
}

const ACT = {
  home: () => home(),
  samples: () => { S.set = { meta: { id: 'samples', pages: 'Samples', title: `${app.CHAPTERS[CH] ?? CH}: samples` }, problems: S.samples, i: 0, results: {}, step: {}, sample: true }; showQuestion(); },
  confirm: b => openSet(b.dataset.id, true),
  prev: () => { S.set.i--; showQuestion(); },
  next: () => { S.set.i++; showQuestion(); },
  // a choice is only marked when Check is pressed, so a slip of the finger isn't an answer
  pick: b => {
    body.querySelectorAll('.choices button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    body.querySelector('.pd-check').disabled = false;
  },
  choose: async b => {
    const q = cur(), c = +body.querySelector('.choices [aria-pressed="true"]').dataset.c;
    body.querySelectorAll('.choices button').forEach(x => x.disabled = true); b.disabled = true;
    answered(q, await submit(q, c), c);
  },
  // giving up: the answer, and straight into its working on the figure (the last wrong go, if any, drawn on it)
  giveup: async b => {
    const q = cur(), prev = S.set.results[q.id]; b.disabled = true;
    const r = await submit(q, null); if (!r) return;
    S.set.results[q.id] = { ...r, mine: prev?.mine ?? null, tries: prev?.tries ?? [], shown: true };
    S.set.step[q.id] = 0;
    showQuestion();
  },
  reveal: async () => {
    const q = cur(), r = await submit(q, null); if (!r) return;
    S.set.results[q.id] = { ...r, mine: null, shown: true };
    S.set.step[q.id] = 0;
    showQuestion();
    $('pd-result').innerHTML = `<div class="mark"><span class="note">Did you get it?</span>
      <button type="button" class="pd-btn ghost" data-act="self" data-v="1">Yes</button><button type="button" class="pd-btn ghost" data-act="self" data-v="0">Not quite</button></div>`;
  },
  self: async b => { const q = cur(); S.set.results[q.id].self = b.dataset.v === '1'; await submit(q, { self: b.dataset.v === '1' }); $('pd-result').innerHTML = `<p class="note">Marked ${b.dataset.v === '1' ? 'right' : 'to revisit'}.</p>`; },
  working: () => { const q = cur(); showStep(q, S.set.results[q.id], 0); },
  back: () => { const q = cur(); showStep(q, S.set.results[q.id], S.set.step[q.id] - 1); },
  fwd: () => { const q = cur(); showStep(q, S.set.results[q.id], S.set.step[q.id] + 1); },
  replay: () => play(cur()),
  // a second go after seeing the solution: the question fresh, the figure back to its numbers (each go is its own attempt)
  retry: () => { const q = cur(); S.set.results[q.id] = undefined; delete S.set.step[q.id]; showQuestion(); },
  resume: () => { const q = cur(), r = S.set.results[q.id]; r ? showStep(q, r, Math.max(S.set.step[q.id], 0)) : play(q); $('pd-paused')?.remove(); },
};

// turning the page ends the question on the figure; offer the way back
addEventListener('questionend', () => {
  S.paused = true;
  if (!S.set || !isOpen() || $('pd-paused')) return;
  body.insertAdjacentHTML('afterbegin', `<p class="pd-paused" id="pd-paused">The figure is showing the lesson again.
    <button type="button" class="pd-link" data-act="resume">Back to this question on the figure</button></p>`);
});

// a link to a set (/kinematics/?set=kinematics-1) opens it here
if (WANT) atlas().then(async () => { await setOpen(true); if (S.sets.some(s => s.id === WANT)) openSet(WANT); });
else if (SAMPLES) atlas().then(async () => { await setOpen(true); if (S.samples.length) ACT.samples(); });
