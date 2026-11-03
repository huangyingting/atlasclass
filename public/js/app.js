// Shared across all pages: the local Next.js + Auth.js + Prisma client, caller status, edge function bridge, and top bar.
import { CONTACT_EMAIL } from './config.js';

const STORAGE_KEY = 'sb-atlas-auth-token';

function getStoredToken() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

function setStoredSession(sess) {
  try {
    if (sess && sess.access_token) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sess));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('premium');
    }
  } catch {}
  syncTopNav(sess?.user ?? null);
}

function syncTopNav(user) {
  if (typeof document === 'undefined') return;
  const a = document.getElementById('nav-auth');
  if (a) {
    const p = location.pathname;
    if (user) {
      a.textContent = 'Account';
      a.href = '/account/';
      if (p.startsWith('/account')) a.setAttribute('aria-current', 'page');
    } else {
      a.textContent = 'Log in';
      if (!p.startsWith('/login')) {
        a.href = '/login/?next=' + encodeURIComponent(p + location.search);
      } else {
        a.href = '/login/';
      }
    }
  }
  const menu = document.getElementById('site-menu');
  if (menu) {
    let adminLink = document.getElementById('nav-admin');
    if (user?.role === 'ADMIN') {
      if (!adminLink) {
        adminLink = document.createElement('a');
        adminLink.id = 'nav-admin';
        adminLink.href = '/admin/';
        adminLink.textContent = 'Admin';
        if (location.pathname.startsWith('/admin')) {
          adminLink.setAttribute('aria-current', 'page');
        }
        menu.appendChild(adminLink);
      }
    } else if (adminLink) {
      adminLink.remove();
    }
  }
}

function authHeaders() {
  const token = getStoredToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

function createQueryBuilder(table) {
  const params = new URLSearchParams();
  const builder = {
    select(cols = '*') {
      params.set('select', cols);
      return builder;
    },
    eq(col, val) {
      params.set(col, String(val));
      return builder;
    },
    like(col, val) {
      if (col === 'problem_id') params.set('like', String(val));
      else params.set(`like_${col}`, String(val));
      return builder;
    },
    in(col, arr) {
      if (col === 'problem_id' && Array.isArray(arr)) {
        params.set('in', arr.join(','));
      }
      return builder;
    },
    order(col) {
      const prev = params.get('order');
      params.set('order', prev ? `${prev},${col}` : col);
      return builder;
    },
    async execute() {
      const qs = params.toString();
      const res = await fetch(`/api/${table}/${qs ? `?${qs}` : ''}`, {
        method: 'GET',
        headers: authHeaders(),
        credentials: 'same-origin',
      });
      const json = await res.json().catch(() => ({ data: null, error: { message: 'Request failed' } }));
      return { data: json.data ?? null, error: json.error ?? null };
    },
    then(onFulfilled, onRejected) {
      return builder.execute().then(onFulfilled, onRejected);
    },
  };
  return builder;
}

export const sb = {
  auth: {
    async getSession() {
      try {
        const res = await fetch('/api/auth/session/', {
          method: 'GET',
          headers: authHeaders(),
          credentials: 'same-origin',
        });
        const json = await res.json().catch(() => ({ session: null }));
        setStoredSession(json.session ?? null);
        return { data: { session: json.session ?? null }, error: null };
      } catch (e) {
        return { data: { session: null }, error: e };
      }
    },
    async getUser() {
      const { data } = await sb.auth.getSession();
      return { data: { user: data.session?.user ?? null }, error: null };
    },
    async signOut() {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'same-origin',
      }).catch(() => {});
      setStoredSession(null);
      return { error: null };
    },
    async signInWithOtp({ email, options, inviteCode }) {
      const res = await fetch('/api/auth/otp/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          inviteCode,
          redirectTo: options?.emailRedirectTo || `${location.origin}/login/`,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { data: null, error: { message: json.error || 'Failed to send sign-in link.', code: json.code } };
      }
      return { data: json, error: null };
    },
    async verifyOtp({ token_hash, type = 'email' }) {
      const res = await fetch('/api/auth/otp/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ token_hash, type }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { data: null, error: { message: json.error || 'Invalid or expired link.' } };
      }
      setStoredSession(json.session ?? null);
      return { data: { user: json.user, session: json.session }, error: null };
    },
    async signInWithOAuth() {
      return {
        data: null,
        error: {
          message: 'Registration on this Atlas instance is invite-only. Please use your invitation code or password below.',
        },
      };
    },
  },
  from(table) {
    return createQueryBuilder(table);
  },
  async rpc(name, args = {}) {
    const res = await fetch(`/api/rpc/${name}/`, {
      method: 'POST',
      headers: authHeaders(),
      credentials: 'same-origin',
      body: JSON.stringify(args),
    });
    const json = await res.json().catch(() => ({ data: null, error: { message: 'RPC failed' } }));
    return { data: json.data ?? null, error: json.error ?? null };
  },
  functions: {
    async invoke(name, { body = {} } = {}) {
      const res = await fetch(`/api/fn/${name}/`, {
        method: 'POST',
        headers: authHeaders(),
        credentials: 'same-origin',
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return { data, error: null };
      }
      const errBody = await res.json().catch(() => ({ error: res.statusText }));
      return {
        data: null,
        error: {
          message: errBody.error || 'Request failed',
          context: {
            status: res.status,
            json: async () => errBody,
          },
        },
      };
    },
  },
};

export const CHAPTERS = { kinematics: 'Kinematics', newton: 'Newton’s laws', circular: 'Circular motion', energy: 'Work and energy',
  momentum: 'Momentum', oscillations: 'Oscillations', rotation: 'Rotation', fluids: 'Fluids', electrostatics: 'Electrostatics',
  gauss: 'Gauss’s law', potential: 'Electric potential', capacitors: 'Capacitors', circuits: 'Circuits',
  magnetism: 'Magnetic fields', induction: 'Induction',
  limits: 'Limits and continuity', derivatives: 'Derivatives', composite: 'Composite, implicit and inverse functions',
  rates: 'Derivatives in context', extrema: 'Analyzing functions', integrals: 'Integration and accumulation',
  diffeq: 'Differential equations', applications: 'Applications of integration', parametric: 'Parametric, polar and vector functions',
  series: 'Infinite series',
  biochem: 'Chemistry of life', cells: 'Cell structure and function', energetics: 'Cellular energetics',
  signaling: 'Cell communication and the cell cycle', heredity: 'Heredity', genes: 'Gene expression and regulation',
  evolution: 'Natural selection', ecology: 'Ecology',
  atoms: 'Atomic structure and properties', bonding: 'Compound structure and properties', substances: 'Properties of substances and mixtures',
  reactions: 'Chemical reactions', kinetics: 'Kinetics', thermochem: 'Thermochemistry', equilibrium: 'Equilibrium',
  acids: 'Acids and bases', electrochem: 'Thermodynamics and electrochemistry',
  onevar: 'Exploring one-variable data', twovar: 'Exploring two-variable data', collecting: 'Collecting data',
  probability: 'Probability and random variables', sampling: 'Sampling distributions', proportions: 'Inference for proportions',
  means: 'Inference for means', chisquare: 'Chi-square tests', slopes: 'Inference for slopes',
  contact: 'Contact and conquest', colonial: 'Colonial America', revolution: 'Revolution and the Constitution', republic: 'The early republic',
  civilwar: 'Civil War and Reconstruction', gilded: 'The Gilded Age', worldwars: 'Empire, war and depression', coldwar: 'Cold War and civil rights',
  present: 'Conservatism and a global age',
  scarcity: 'Basic economic concepts', indicators: 'Economic indicators and the business cycle', adas: 'National income and price determination',
  money: 'The financial sector', stabilization: 'Long-run consequences of stabilization policies', trade: 'Open economy: international trade and finance',
  foundations: 'Foundations of American democracy', branches: 'Interactions among branches of government', liberties: 'Civil liberties and civil rights',
  ideologies: 'American political ideologies and beliefs', participation: 'Political participation' };
// the subject each chapter is under, as its address names it: /calculus/limits/ (physics: the rest)
const SUBJECTS = {
  calculus: ['limits', 'derivatives', 'composite', 'rates', 'extrema', 'integrals', 'diffeq', 'applications', 'parametric', 'series'],
  biology: ['biochem', 'cells', 'energetics', 'signaling', 'heredity', 'genes', 'evolution', 'ecology'],
  chemistry: ['atoms', 'bonding', 'substances', 'reactions', 'kinetics', 'thermochem', 'equilibrium', 'acids', 'electrochem'],
  statistics: ['onevar', 'twovar', 'collecting', 'probability', 'sampling', 'proportions', 'means', 'chisquare', 'slopes'],
  history: ['contact', 'colonial', 'revolution', 'republic', 'civilwar', 'gilded', 'worldwars', 'coldwar', 'present'],
  macroeconomics: ['scarcity', 'indicators', 'adas', 'money', 'stabilization', 'trade'],
  government: ['foundations', 'branches', 'liberties', 'ideologies', 'participation'],
};
const subjectOf = ch => Object.keys(SUBJECTS).find(s => SUBJECTS[s].includes(ch));
export const chapterPath = ch => `/${subjectOf(ch) ?? 'physics'}/${ch}/`;
// a chapter's number within its subject
export const chapterNo = ch => subjectOf(ch) ? SUBJECTS[subjectOf(ch)].indexOf(ch) + 1 : Object.keys(CHAPTERS).indexOf(ch) + 1;

// a friend's invite (/pricing/?ref=CODE) waits here until a sign-in, which claims it once (status() below)
if (typeof location !== 'undefined') {
  const ref = new URLSearchParams(location.search).get('ref');
  if (ref) try { localStorage.setItem('ref', ref); } catch {}
}

export const session = async () => (await sb.auth.getSession()).data.session;

// { premium, plan, status, period_end, free_limit, free_sets }, or null when signed out
// (including a sign-in left over from a deleted or revoked account, which is dropped here)
export async function status() {
  if (!(await session())) return null;
  let code = null;
  try { code = localStorage.getItem('ref'); } catch {}
  if (code) { await sb.rpc('claim_referral', { p_code: code }); try { localStorage.removeItem('ref'); } catch {} }
  const { data, error } = await sb.rpc('my_status');
  if (error) throw error;
  if (data === null) await sb.auth.signOut({ scope: 'local' });
  try { localStorage.premium = data?.premium ? '1' : ''; } catch {}
  syncTopNav(data ? { email: data.email, role: data.role } : null);
  return data;
}

// call an edge function; its { error } becomes the thrown message
export async function fn(name, body = {}) {
  const { data, error } = await sb.functions.invoke(name, { body });
  if (!error) return data;
  const detail = await error.context?.json?.().catch(() => null);
  throw Object.assign(new Error(detail?.error || error.message), { status: error.context?.status, detail });
}

// a same-site path to come back to after signing in (never another origin)
export const safeNext = (s, dflt = '/practice/') => (s && s.startsWith('/') && !s.startsWith('//') ? s : dflt);
// where a sign-in lands: a new account's first sign-in goes straight into a free set of the subject (or chapter) it came
// from, kinematics if none; a returning one, or one already headed to a set, to checkout or to the teachers' page, to next
export function landing(user, next) {
  const first = user && Math.abs(new Date(user.last_sign_in_at) - new Date(user.email_confirmed_at ?? user.created_at)) < 60_000;
  if (!first || /[?&]set=|^\/(?:[a-z-]+\/)?(?:pricing|teachers|admin|account)\//.test(next)) return next;
  const seg = next.split(/[?#]/)[0].split('/').filter(Boolean);
  const base = ['id', 'ms', 'vi', 'zh', 'zh-tw', 'ja', 'ko', 'hi', 'es', 'pt'].includes(seg[0]) ? `/${seg.shift()}` : '';
  const ch = chapterPath(seg[1] ?? '') === `/${seg[0]}/${seg[1]}/` && CHAPTERS[seg[1]] ? seg[1]
    : SUBJECTS[seg[0]]?.[0] ?? 'kinematics';
  return `${base}${chapterPath(ch)}?set=${ch}-1#0`;
}
export const loginUrl = next => `/login/?next=${encodeURIComponent(next ?? location.pathname + location.search)}`;

export const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
export { setStoredSession };
