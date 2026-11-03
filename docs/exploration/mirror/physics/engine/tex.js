// Math, typeset with KaTeX. tex(String.raw`t = \frac{2v_{0y}}{g} = ${f(T)}\,\text{s}`) returns finished HTML; numbers are
// interpolated as usual. In the browser 'katex' is the site's own copy (the chapter's import map); in node (the seed,
// which renders questions into the bank) it is the npm package. Display style by default; tex.inline() for in-text math.
import katex from 'katex';

// globalThis.__TEX_SOURCE (tools/math-snapshot.mjs): return the LaTeX itself, so a check can read its numbers
const render = (s, displayMode) => globalThis.__TEX_SOURCE ? ` ${s} ` : katex.renderToString(s.replace(/−/g, '-'), { displayMode, throwOnError: true, strict: 'ignore' });
export const tex = s => render(s, true);
tex.inline = s => render(s, false);
