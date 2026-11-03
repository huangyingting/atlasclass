// Statistics kit, numbers: the distributions every chapter of statistics computes with (the pages, the figures, the
// paid questions). Pure functions, no three.js, so model.js, problems/<chapter>.mjs and the checks share one source.
// Accuracy: better than 1e-7 on the values the AP tables print (z to 4 places, t* and χ²* to 3).

// ---------- describing data ----------
export const sum = a => a.reduce((s, v) => s + v, 0);
export const mean = a => sum(a) / a.length;
// sample standard deviation (n − 1); pop = true for the population one
export const sd = (a, pop = false) => { const m = mean(a); return Math.sqrt(sum(a.map(v => (v - m) ** 2)) / (a.length - (pop ? 0 : 1))); };
// the median of the sorted values; quartiles as the AP course takes them: medians of the lower and upper halves,
// the median itself left out of both when n is odd
const med = s => { const n = s.length, h = n >> 1; return n % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
export const median = a => med([...a].sort((x, y) => x - y));
export function fiveNum(a) {
  const s = [...a].sort((x, y) => x - y), n = s.length, h = n >> 1;
  return { min: s[0], q1: med(s.slice(0, h)), med: med(s), q3: med(s.slice(n % 2 ? h + 1 : h)), max: s[n - 1] };
}
// the 1.5 × IQR fences
export const fences = a => { const f = fiveNum(a), iqr = f.q3 - f.q1; return { lo: f.q1 - 1.5 * iqr, hi: f.q3 + 1.5 * iqr, iqr }; };

// ---------- two variables: least squares ----------
export function lsrl(x, y) {
  const mx = mean(x), my = mean(y), sx = sd(x), sy = sd(y), n = x.length;
  const r = sum(x.map((v, i) => (v - mx) / sx * (y[i] - my) / sy)) / (n - 1), b = r * sy / sx, a = my - b * mx;
  const res = y.map((v, i) => v - (a + b * x[i]));
  const s = n > 2 ? Math.sqrt(sum(res.map(e => e * e)) / (n - 2)) : NaN;   // the residuals' standard deviation
  return { a, b, r, r2: r * r, mx, my, sx, sy, res, s, seB: s / (sx * Math.sqrt(n - 1)) };
}

// ---------- seeded randomness: the same "random" sample on every visit and in every check ----------
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
// a standard normal draw from a uniform source (Box–Muller)
export const gauss = u => () => Math.sqrt(-2 * Math.log(1 - u())) * Math.cos(2 * Math.PI * u());

// ---------- special functions ----------
// ln Γ(x), Lanczos (g = 7, n = 9)
const LG = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
  12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
export function lnGamma(x) {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lnGamma(1 - x);
  x -= 1; let a = LG[0]; const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LG[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
// regularized lower incomplete gamma P(a, x)
function gammaP(a, x) {
  if (x <= 0) return 0;
  if (x < a + 1) { let s = 1 / a, t = s; for (let n = 1; n < 500; n++) { t *= x / (a + n); s += t; if (t < s * 1e-15) break; } return s * Math.exp(-x + a * Math.log(x) - lnGamma(a)); }
  // continued fraction for Q, Lentz
  let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
  for (let i = 1; i < 500; i++) { const an = -i * (i - a); b += 2; d = an * d + b; d = 1 / (Math.abs(d) < 1e-300 ? 1e-300 : d); c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break; }
  return 1 - Math.exp(-x + a * Math.log(x) - lnGamma(a)) * h;
}
// regularized incomplete beta I_x(a, b)
function betaCF(a, b, x) {
  let c = 1, d = 1 - (a + b) * x / (a + 1); d = 1 / (Math.abs(d) < 1e-300 ? 1e-300 : d); let h = d;
  for (let m = 1; m < 500; m++) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((a + m2 - 1) * (a + m2));
    d = 1 + aa * d; d = 1 / (Math.abs(d) < 1e-300 ? 1e-300 : d); c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300; h *= d * c;
    aa = -(a + m) * (a + b + m) * x / ((a + m2) * (a + m2 + 1));
    d = 1 + aa * d; d = 1 / (Math.abs(d) < 1e-300 ? 1e-300 : d); c = 1 + aa / c; if (Math.abs(c) < 1e-300) c = 1e-300;
    const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}
export function betaI(x, a, b) {
  if (x <= 0) return 0; if (x >= 1) return 1;
  const bt = Math.exp(lnGamma(a + b) - lnGamma(a) - lnGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betaCF(a, b, x) / a : 1 - bt * betaCF(b, a, 1 - x) / b;
}
// solve cdf(x) = p for increasing cdf on (lo, hi) by bisection
const invert = (cdf, p, lo, hi) => { for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (cdf(m) < p) lo = m; else hi = m; } return (lo + hi) / 2; };

// ---------- normal ----------
export const normPdf = (x, mu = 0, sigma = 1) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2) / (sigma * Math.sqrt(2 * Math.PI));
// Φ from the incomplete gamma: erf(z/√2) = P(½, z²/2)
export const normCdf = (x, mu = 0, sigma = 1) => { const z = (x - mu) / sigma; return z < 0 ? 0.5 * (1 - gammaP(0.5, z * z / 2)) : 0.5 * (1 + gammaP(0.5, z * z / 2)); };
export const normInv = (p, mu = 0, sigma = 1) => mu + sigma * invert(normCdf, p, -40, 40);

// ---------- t ----------
export const tPdf = (t, df) => Math.exp(lnGamma((df + 1) / 2) - lnGamma(df / 2) - 0.5 * Math.log(df * Math.PI) - (df + 1) / 2 * Math.log(1 + t * t / df));
export const tCdf = (t, df) => { const p = 0.5 * betaI(df / (df + t * t), df / 2, 0.5); return t > 0 ? 1 - p : p; };
export const tInv = (p, df) => invert(x => tCdf(x, df), p, -1e3, 1e3);

// ---------- chi-square ----------
export const chiPdf = (x, df) => x <= 0 ? 0 : Math.exp((df / 2 - 1) * Math.log(x) - x / 2 - df / 2 * Math.LN2 - lnGamma(df / 2));
export const chiCdf = (x, df) => gammaP(df / 2, x / 2);
export const chiInv = (p, df) => invert(x => chiCdf(x, df), p, 0, 1e4);

// ---------- discrete ----------
export const choose = (n, k) => k < 0 || k > n ? 0 : Math.round(Math.exp(lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1)));
export const binomPdf = (k, n, p) => k < 0 || k > n ? 0 : Math.exp(lnGamma(n + 1) - lnGamma(k + 1) - lnGamma(n - k + 1) + k * Math.log(p) + (n - k) * Math.log(1 - p));
export const binomCdf = (k, n, p) => { let s = 0; for (let i = 0; i <= Math.min(k, n); i++) s += binomPdf(i, n, p); return Math.min(s, 1); };
export const geomPdf = (k, p) => k < 1 ? 0 : (1 - p) ** (k - 1) * p;       // first success on trial k
export const geomCdf = (k, p) => k < 1 ? 0 : 1 - (1 - p) ** k;

// ---------- critical values, as the AP tables print them ----------
// z* and t* for a confidence level C (0.95), and the upper-tail χ²* for a tail area p
export const zStar = C => normInv(1 - (1 - C) / 2);
export const tStar = (C, df) => tInv(1 - (1 - C) / 2, df);
export const chiStar = (p, df) => chiInv(1 - p, df);
