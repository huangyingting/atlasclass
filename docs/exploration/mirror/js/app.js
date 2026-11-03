// Shared by the Premium pages: the Supabase client, the caller's status, function calls, and the top bar.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
const ref = new URLSearchParams(location.search).get('ref');
if (ref) try { localStorage.setItem('ref', ref); } catch {}

export const session = async () => (await sb.auth.getSession()).data.session;

// { premium, plan, status, period_end, free_limit, free_sets }, or null when signed out
// (including a sign-in left over from a deleted account, which is dropped here)
export async function status() {
  if (!(await session())) return null;
  let code = null;
  try { code = localStorage.getItem('ref'); } catch {}
  // claim_referral says no to your own code, a second code, or anyone who has bought before
  if (code) { await sb.rpc('claim_referral', { p_code: code }); try { localStorage.removeItem('ref'); } catch {} }
  const { data, error } = await sb.rpc('my_status');
  if (error) throw error;
  if (data === null) await sb.auth.signOut({ scope: 'local' });
  try { localStorage.premium = data?.premium ? '1' : ''; } catch {}   // pages draw their first paint from it (skeletons)
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
  if (!first || /[?&]set=|^\/(?:[a-z-]+\/)?(?:pricing|teachers)\//.test(next)) return next;
  const seg = next.split(/[?#]/)[0].split('/').filter(Boolean);
  const base = ['id', 'ms', 'vi', 'zh', 'zh-tw', 'ja', 'ko', 'hi', 'es', 'pt'].includes(seg[0]) ? `/${seg.shift()}` : '';
  const ch = chapterPath(seg[1] ?? '') === `/${seg[0]}/${seg[1]}/` && CHAPTERS[seg[1]] ? seg[1]
    : SUBJECTS[seg[0]]?.[0] ?? 'kinematics';
  return `${base}${chapterPath(ch)}?set=${ch}-1#0`;
}
export const loginUrl = next => `/login/?next=${encodeURIComponent(next ?? location.pathname + location.search)}`;

export const esc = s => String(s).replace(/[&<>"']/g, c => `&#${c.charCodeAt(0)};`);
