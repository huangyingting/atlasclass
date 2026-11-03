// The footer's plate (tools/build.mjs writes the footer): a coast engraved in fine lines, drawn on a canvas from a fixed
// seed, so it is the same every time, sharp at any size and nothing to download. By day a ball thrown from the cliff
// arcs over the sea, leaving strobe marks; in dark mode the same coast lies under a night sky, and a shooting star
// crosses it. Ink and paper are the page's own tokens (--strong, --page), so the plate follows the theme, the
// visitor's choice (the light/dark button) or else the device's.
// The plate is engraved once per size and theme; each frame copies it and draws only the moving things over it: the
// boat (engraved once on its own sheet, which bobs), the globe's lines (drag the globe any way to turn it; it coasts to
// a stop), the cypresses (each on its own sprite: click one and it jumps, swells and sheds leaves), the ripples round a
// clicked rock, and the ball or the star.
const foot = document.getElementById('foot'), cv = foot?.querySelector('canvas');
if (cv) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, darkQ = matchMedia('(prefers-color-scheme: dark)');
  const ctx = cv.getContext('2d'), base = document.createElement('canvas'), bctx = base.getContext('2d');
  const boat = document.createElement('canvas'), boatCtx = boat.getContext('2d');
  // the globe's handle: a circle laid over it (paint() places it), above the footer's text, so a touch there turns the
  // globe instead of scrolling the page
  const spin = Object.assign(document.createElement('div'), { className: 'spin' }); spin.setAttribute('aria-hidden', 'true'); foot.append(spin);
  // the globe's lines on the unit sphere (8 meridians, 7 parallels, a point every 5°), and its turn M (3×3, row-major):
  // tipped 0.16 rad toward the viewer, as the plate always showed it
  const C = 72, GRID = [];
  for (let k = 0; k < 8; k++) { const l = k * Math.PI / 8; GRID.push([...Array(C + 1)].map((_, i) => { const f = i / C * 2 * Math.PI; return [Math.cos(f) * Math.sin(l), Math.sin(f), Math.cos(f) * Math.cos(l)]; })); }
  for (let k = -3; k <= 3; k++) { const la = k * Math.PI / 8; GRID.push([...Array(C + 1)].map((_, i) => { const f = i / C * 2 * Math.PI; return [Math.cos(la) * Math.cos(f), Math.sin(la), Math.cos(la) * Math.sin(f)]; })); }
  let M = [1, 0, 0, 0, Math.cos(0.16), -Math.sin(0.16), 0, Math.sin(0.16), Math.cos(0.16)], vx = 0, vy = 0, drag = null;
  const rockPath = (c, cx, cy, a) => { c.moveTo(cx - a, cy + a * 0.2); c.quadraticCurveTo(cx - a * 0.6, cy - a * 0.7, cx, cy - a * 0.6); c.quadraticCurveTo(cx + a * 0.8, cy - a * 0.5, cx + a, cy + a * 0.2); c.closePath(); };
  let leaves = [], ripples = [];
  // turn the globe as a drag of (dx, dy) px moves its near side: about the screen axis square to the drag, by dx,dy ÷ radius
  const turn = (dx, dy) => {
    const L = Math.hypot(dx, dy); if (!L || !scene) return;
    const a = L / scene.R0, ux = dy / L, uy = dx / L, co = Math.cos(a), si = Math.sin(a), q = 1 - co;
    const T = [co + q * ux * ux, q * ux * uy, si * uy, q * ux * uy, co + q * uy * uy, -si * ux, -si * uy, si * ux, co];
    M = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => { const r = i / 3 | 0, k = i % 3; return T[r * 3] * M[k] + T[r * 3 + 1] * M[3 + k] + T[r * 3 + 2] * M[6 + k]; });
  };
  const RED = '#e5484d';
  let W = 0, H = 0, dpr = 1, scene = null, on = false;

  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

  function plate(c, ink, paper, night, bc) {
    const r = rng(11), wide = W >= 760, S = wide ? 1 : 0.62, hz = wide ? H * 0.7 : H * 0.85;
    const line = (a, w = 1) => { c.strokeStyle = ink; c.globalAlpha = a; c.lineWidth = w; };
    const fill = p => { c.globalAlpha = 1; c.fillStyle = paper; c.beginPath(); p(); c.fill(); };
    const hatch = (clip, ang, gap, a, w = 0.7, breaks = 0) => {
      c.save(); c.beginPath(); clip(); c.clip();
      const co = Math.cos(ang), si = Math.sin(ang), D = Math.hypot(W, H);
      line(a, w); c.beginPath();
      for (let d = -D; d < D; d += gap) {
        const x0 = W / 2 - si * d, y0 = H / 2 + co * d;
        if (!breaks) { c.moveTo(x0 - co * D, y0 - si * D); c.lineTo(x0 + co * D, y0 + si * D); continue; }
        for (let u = -D; u < D; u += 18 + r() * 40) { const v = u + (r() < breaks ? 0 : 14 + r() * 40); c.moveTo(x0 + co * u, y0 + si * u); c.lineTo(x0 + co * v, y0 + si * v); }
      }
      c.stroke(); c.restore();
    };
    c.globalAlpha = 1; c.fillStyle = paper; c.fillRect(0, 0, W, H);

    // the sky: fine lines by day, lightest where the links sit; by night faint lines and the stars
    for (let y = 6; y < hz - 4; y += wide ? 3.4 : 3.2) {
      c.beginPath();
      for (let x = -10; x < W;) { const len = 30 + r() * 120; c.moveTo(x, y); c.lineTo(x + len, y); x += len + 4 + r() * 22; }
      const calm = Math.max(0, 1 - y / (hz * 0.55));
      line(night ? 0.03 + 0.1 * (y / hz) ** 2 : 0.1 + 0.2 * (y / hz) - 0.06 * calm, 0.6); c.stroke();
    }
    if (night) {
      for (let k = 0; k < (wide ? 240 : 110); k++) {
        const x = r() * W, y = r() * hz * 0.92, s = 0.4 + r() ** 3 * 1.5;
        c.globalAlpha = 0.5 + r() * 0.5; c.fillStyle = ink; c.beginPath(); c.arc(x, y, s, 0, 7); c.fill();
        if (s > 1.5) { line(0.7, 0.7); c.beginPath(); c.moveTo(x - 5, y); c.lineTo(x + 5, y); c.moveTo(x, y - 5); c.lineTo(x, y + 5); c.stroke(); }
      }
    } else {
      const cloud = (cx, cy, w) => {
        const puffs = [...Array(9)].map((_, k) => { const t = k / 8; return [cx + (t - 0.5) * w, cy - Math.sin(t * Math.PI) * w * 0.13 * (0.7 + r() * 0.6), w * (0.07 + r() * 0.07) * (0.6 + Math.sin(t * Math.PI))]; });
        const path = () => puffs.forEach(([x, y, rr]) => { c.moveTo(x + rr, y); c.arc(x, y, rr, 0, 7); });
        fill(path); hatch(path, 0, 2.4, 0.38, 0.6, 0.2);
        c.save(); c.beginPath(); c.rect(0, 0, W, cy - w * 0.02); c.clip(); fill(path); c.restore();
        line(0.42, 0.8); puffs.forEach(([x, y, rr]) => { c.beginPath(); c.arc(x, y, rr, Math.PI * 1.08, Math.PI * 1.92); c.stroke(); });
      };
      if (wide) { cloud(W * 0.16, hz * 0.42, W * 0.3); cloud(W * 0.62, hz * 0.58, W * 0.34); cloud(W * 0.46, hz * 0.3, W * 0.16); }
      else { cloud(W * 0.3, hz * 0.62, W * 0.62); cloud(W * 0.8, hz * 0.48, W * 0.4); }
    }

    // the far range
    const bump = (x, cx, w) => Math.exp(-(((x - cx) / w) ** 2));
    const far = x => hz - H * (0.17 * bump(x, W * 0.42, W * 0.16) + 0.1 * bump(x, W * 0.24, W * 0.09) + 0.08 * bump(x, W * 0.66, W * 0.12)) * S - Math.sin(x * 0.05) * 1.6 - Math.sin(x * 0.013 + 1) * 3;
    const range = () => { c.moveTo(W * 0.06, hz); for (let x = W * 0.06; x <= W * 0.86; x += 3) c.lineTo(x, far(x)); c.lineTo(W * 0.86, hz); c.closePath(); };
    fill(range); hatch(range, 0.02, 3.2, 0.32, 0.55);
    line(0.3, 0.55); c.beginPath();
    for (let x = W * 0.06; x < W * 0.86; x += 2.6) { const y = far(x), dy = far(x + 3) - y; if (dy > 0.05) { const L = (hz - y) * (0.35 + Math.min(dy, 2) * 0.25); c.moveTo(x, y + 1); c.lineTo(x + L * 0.28, y + L); } }
    c.stroke();
    line(0.7, 0.9); c.beginPath(); for (let x = W * 0.06; x <= W * 0.86; x += 3) c.lineTo(x, far(x)); c.stroke();

    // the sea: broken lines that open out toward the viewer
    for (let i = 0, y = hz + 2; y < H + 4; i++, y = hz + 2 + Math.pow(i, 1.55) * (wide ? 0.95 : 0.8)) {
      c.beginPath();
      for (let x = -10; x < W;) { const len = 20 + r() * 90, wob = Math.sin(x * 0.02 + i) * 0.6; c.moveTo(x, y + wob); c.lineTo(x + len, y + wob); x += len + 3 + r() * 16; }
      line(0.35 + Math.min(0.4, (y - hz) / H), 0.5 + (y - hz) / H * 1.2); c.stroke();
    }

    // a boat on the left, with its reflection, engraved on its own sheet (bc) so it can bob
    { const main = c; c = bc; const bx = W * (wide ? 0.08 : 0.12), by = hz + H * 0.07, s = 26 * S;
      const hull = () => { c.moveTo(bx - s, by); c.lineTo(bx + s * 1.1, by); c.lineTo(bx + s * 0.8, by + s * 0.32); c.lineTo(bx - s * 0.8, by + s * 0.32); c.closePath(); };
      fill(hull); hatch(hull, 0, 1.6, 0.85, 0.7); line(0.9, 1); c.beginPath(); hull(); c.stroke();
      const sail = () => { c.moveTo(bx - s * 0.1, by - 2); c.lineTo(bx - s * 0.1, by - s * 1.7); c.lineTo(bx + s * 0.9, by - 2); c.closePath(); };
      fill(sail); hatch(sail, 1.2, 2.6, 0.45, 0.6); line(0.9, 0.9); c.beginPath(); sail(); c.stroke();
      line(0.5, 0.7); c.beginPath(); for (let k = 1; k < 6; k++) { c.moveTo(bx - s * 0.7 + r() * 6, by + s * 0.4 + k * 3); c.lineTo(bx + s * 0.6 - r() * 6, by + s * 0.4 + k * 3); } c.stroke(); c = main; }

    // the cliff on the right: its outline worked out once, so its fill, shading and strata follow the same edge
    const top = wide ? H * 0.56 : H * 0.74, x0 = wide ? W * 0.6 : W * 0.44;
    const cpts = []; { let x = x0 - 30, y = H; while (x < x0 + W * 0.08) { x += 6 + r() * 10; y = Math.max(top + 8, y - (H - top) * (0.07 + r() * 0.08)); cpts.push([x, y]); }
      cpts.push([x + 20, top], [W + 4, top - 6], [W + 4, H + 4]); }
    const cliff = () => { c.moveTo(x0 - 30, H + 4); cpts.forEach(p => c.lineTo(...p)); c.closePath(); };
    fill(cliff); hatch(cliff, Math.PI / 2 - 0.12, 2.1, 0.62, 0.6, 0.15);
    c.save(); c.beginPath(); cliff(); c.clip(); hatch(() => c.rect(x0 - 40, top + (H - top) * 0.45, W, H), Math.PI / 3, 3.4, 0.38, 0.55); c.restore();
    line(0.9, 1); c.beginPath(); c.moveTo(x0 - 30, H + 4); cpts.slice(0, -2).forEach(p => c.lineTo(...p)); c.stroke();
    line(0.85, 1.1); c.beginPath(); c.moveTo(x0 + W * 0.08, top); c.lineTo(W, top - 6); c.stroke();
    c.save(); c.beginPath(); cliff(); c.clip();
    line(0.6, 0.8); for (let k = 1; k < 7; k++) { const y = top + (H - top) * k / 7; c.beginPath(); for (let x = x0 - 40; x < W; x += 8) c.lineTo(x, y + Math.sin(x * 0.04 + k) * 3 + r() * 1.5); c.stroke(); }
    c.restore();
    const rocks = [];
    for (let k = 0; k < (wide ? 9 : 5); k++) { const cx = x0 - 60 * S - r() * 160 * S, cy = hz + (H - hz) * (0.35 + r() * 0.5), a = (10 + r() * 22) * S;
      const rock = () => rockPath(c, cx, cy, a); rocks.push({ cx, cy, a });
      fill(rock); hatch(rock, 0.5, 1.8, 0.7, 0.6); line(0.9, 0.9); c.beginPath(); rock(); c.stroke(); }

    // the globe on its plinth: meridians, parallels, a shaded crescent, and its ring
    const gx = wide ? W * 0.8 : W * 0.7, R0 = wide ? Math.min(W * 0.075, H * 0.14) : W * 0.15, ph = R0 * 0.9, gy = top - ph - R0 * 1.1;
    const plinth = () => c.rect(gx - R0 * 0.32, top - ph, R0 * 0.64, ph);
    fill(plinth); hatch(() => c.rect(gx + R0 * 0.04, top - ph, R0 * 0.28, ph), Math.PI / 2, 1.8, 0.75, 0.6); line(0.95, 1); c.beginPath(); plinth(); c.stroke();
    c.beginPath(); c.rect(gx - R0 * 0.44, top - ph - 6, R0 * 0.88, 6); c.globalAlpha = 1; c.fillStyle = paper; c.fill(); line(0.95, 1); c.stroke();
    c.beginPath(); c.moveTo(gx, top - ph - 6); c.lineTo(gx, gy + R0); c.stroke();
    const ring = (from, to) => { line(0.9, 1.3); c.beginPath(); c.ellipse(gx, gy, R0 * 1.38, R0 * 0.34, -0.32, from, to); c.stroke(); line(0.6, 0.7); c.beginPath(); c.ellipse(gx, gy, R0 * 1.3, R0 * 0.29, -0.32, from, to); c.stroke(); };
    ring(Math.PI, Math.PI * 2);
    fill(() => c.arc(gx, gy, R0, 0, 7));
    // (its meridians and parallels turn, so overlay() draws them)
    hatch(() => { c.arc(gx, gy, R0, 0, 7); c.moveTo(gx - R0 * 0.3 + R0 * 1.06, gy - R0 * 0.32); c.arc(gx - R0 * 0.3, gy - R0 * 0.32, R0 * 1.06, 0, 7, true); }, Math.PI / 4, 2.1, 0.7, 0.6);
    line(0.95, 1.3); c.beginPath(); c.arc(gx, gy, R0, 0, 7); c.stroke();
    ring(0, Math.PI);

    // cypresses along the cliff top, each engraved on its own sprite (img, its top-left at ox, oy) so it can be poked
    const trees = [];
    const cypress = (x, h, w) => { const main = c, ox = x - w * 1.3 - 3, oy = top - h - 3, img = document.createElement('canvas');
      img.width = Math.ceil((w * 2.6 + 6) * dpr); img.height = Math.ceil((h + 6) * dpr); c = img.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, -ox * dpr, -oy * dpr);
      const p = () => { c.moveTo(x - w, top - 2); c.bezierCurveTo(x - w * 1.25, top - h * 0.5, x - w * 0.4, top - h * 0.9, x, top - h); c.bezierCurveTo(x + w * 0.4, top - h * 0.9, x + w * 1.25, top - h * 0.5, x + w, top - 2); c.closePath(); };
      fill(p); hatch(p, 1.25, 1.5, 0.85, 0.6); hatch(p, -0.4, 3, 0.5, 0.5); line(0.95, 0.9); c.beginPath(); p(); c.stroke();
      c = main; trees.push({ x, h, w, img, ox, oy, t0: -9 }); };
    if (wide) { cypress(W * 0.7, H * 0.2, 9); cypress(W * 0.725, H * 0.26, 11); cypress(W * 0.93, H * 0.22, 10); cypress(W * 0.955, H * 0.17, 8); }
    else { cypress(W * 0.92, H * 0.15, 8); cypress(W * 0.52, H * 0.11, 6); }
    c.globalAlpha = 1;

    // by day: the throw from the cliff's edge over the sea, a parabola through launch and landing with its apex given
    const lx = x0 + W * 0.04, ly = top - 4, land = [wide ? W * 0.22 : W * 0.06, hz + (H - hz) * 0.25], apex = wide ? H * 0.4 : H * 0.5;
    const k = (ly + land[1]) / 2 - apex;
    const at = u => [lx + (land[0] - lx) * u, (1 - u) * ly + u * land[1] - 4 * k * u * (1 - u)];
    return { ink, paper, night, at, hz, wide, gx, gy, R0, top, trees, rocks };
  }

  // the moving thing: by day the thrown ball with its strobe marks, by night a shooting star every few seconds
  function overlay(t) {
    const s = scene, c = ctx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.drawImage(base, 0, 0);
    c.drawImage(boat, 0, (reduced ? 0 : Math.sin(t * Math.PI / 2) * 2) * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0);   // sub-pixel, so the bob glides
    // the globe's lines at its turn: only their near side
    c.save(); c.beginPath(); c.arc(s.gx, s.gy, s.R0, 0, 7); c.clip();
    c.strokeStyle = s.ink; c.globalAlpha = 0.55; c.lineWidth = 0.7; c.beginPath();
    for (const ring of GRID) { let pen = false;
      for (const [x, y, z] of ring) {
        if (M[6] * x + M[7] * y + M[8] * z < 0) { pen = false; continue; }
        const X = s.gx + (M[0] * x + M[1] * y + M[2] * z) * s.R0, Y = s.gy - (M[3] * x + M[4] * y + M[5] * z) * s.R0;
        pen ? c.lineTo(X, Y) : c.moveTo(X, Y); pen = true;
      } }
    c.stroke(); c.restore();
    // ripples round a clicked rock: three dashed rings spreading over the water, kept off the rock itself
    ripples = ripples.filter(p => t - p.t0 < 2.2);
    for (const p of ripples) {
      c.save(); c.beginPath(); c.rect(0, 0, W, H); rockPath(c, p.cx, p.cy, p.a); c.clip('evenodd');
      c.strokeStyle = s.ink; c.lineWidth = 0.9; c.setLineDash([7, 4]);
      for (let k = 0; k < 3; k++) { const u = (t - p.t0 - k * 0.35) / 1.5; if (u < 0 || u > 1) continue;
        const r = p.a * (1.1 + u * 2.4); c.globalAlpha = 0.75 * (1 - u); c.beginPath(); c.ellipse(p.cx, p.cy + p.a * 0.2, r, r * 0.26, 0, 0, 7); c.stroke(); }
      c.restore();
    }
    // the cypresses: a poke makes one hop and swell, then wobble back, rooted at its foot
    for (const tr of s.trees) {
      const u = (t - tr.t0) / 0.9, on = u >= 0 && u < 1;
      const sy = on ? 1 + 0.13 * Math.sin(u * Math.PI * 2.5) * (1 - u) ** 1.5 : 1, sx = 1 + (sy - 1) * 0.6;
      const dy = on && u < 0.35 ? -7 * Math.sin(Math.PI * u / 0.35) : 0;
      c.save(); c.translate(tr.x, s.top + dy); c.scale(sx, sy);
      c.drawImage(tr.img, tr.ox - tr.x, tr.oy - s.top, tr.img.width / dpr, tr.img.height / dpr); c.restore();
    }
    // the leaves it shed: thrown out, then drifting down, turning and fading
    leaves = leaves.filter(l => t - l.t0 < l.life);
    c.fillStyle = s.ink;
    for (const l of leaves) {
      const τ = t - l.t0, x = l.x + l.vx * τ + Math.sin(τ * 3 + l.ph) * 8 * τ, y = l.y + l.vy * τ + 45 * τ * τ;
      c.save(); c.translate(x, y); c.rotate(l.ph + τ * l.spin); c.globalAlpha = 0.85 * (1 - τ / l.life);
      c.beginPath(); c.ellipse(0, 0, 3.4, 1.4, 0, 0, 7); c.fill(); c.restore();
    }
    c.globalAlpha = 1;
    if (!s.night) {
      const u = reduced ? 0.62 : Math.min((t % 6.5) / 5, 1);
      c.strokeStyle = s.ink; c.lineWidth = 1;
      for (let q = 0.05; q < 1; q += 0.075) { const [x, y] = s.at(q); c.globalAlpha = q <= u ? 0.85 : 0.35; c.fillStyle = s.paper; c.beginPath(); c.arc(x, y, 3.6, 0, 7); c.fill(); c.stroke(); }
      c.globalAlpha = 0.5; c.setLineDash([2, 4]); c.beginPath(); for (let q = 0; q <= u; q += 0.01) c.lineTo(...s.at(q)); c.stroke(); c.setLineDash([]);
      const [x, y] = s.at(u); c.globalAlpha = 1; c.fillStyle = RED; c.strokeStyle = s.ink; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, 5.5, 0, 7); c.fill(); c.stroke();
      return;
    }
    // a streak across the upper right of the sky, down and to the left, each one from a new place
    const P = 5.5, n = Math.floor(t / P), u = reduced ? 0.6 : (t % P) / 1.1;
    if (u > 1) return;
    const rr = rng(n + 3), x0 = W * (0.55 + rr() * 0.4), y0 = s.hz * (0.04 + rr() * 0.22), len = (s.wide ? 260 : 150) * (0.8 + rr() * 0.4), ang = Math.PI * (0.78 + rr() * 0.08);
    const hx = x0 + Math.cos(ang) * len * u, hy = y0 + Math.sin(ang) * len * u, tail = len * 0.45 * Math.min(1, u * 2.2), fade = 1 - Math.max(0, u - 0.75) / 0.25;
    const g = c.createLinearGradient(hx, hy, hx - Math.cos(ang) * tail, hy - Math.sin(ang) * tail);
    g.addColorStop(0, s.ink); g.addColorStop(1, 'transparent');
    c.globalAlpha = 0.9 * fade; c.strokeStyle = g; c.lineWidth = 1.6; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx - Math.cos(ang) * tail, hy - Math.sin(ang) * tail); c.stroke();
    c.globalAlpha = fade; c.fillStyle = RED; c.beginPath(); c.arc(hx, hy, 2.6, 0, 7); c.fill();
  }

  function paint() {
    dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; if (!W || !H) return;
    for (const k of [cv, base, boat]) { k.width = W * dpr; k.height = H * dpr; }
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0); boatCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(foot);
    const t = document.documentElement.dataset.theme, night = t ? t === 'dark' : darkQ.matches;   // the visitor's choice, else the device's
    scene = plate(bctx, css.getPropertyValue('--strong').trim() || '#18181a', css.getPropertyValue('--page').trim() || '#f2f2ef', night, boatCtx);
    Object.assign(spin.style, { left: `${scene.gx - scene.R0}px`, top: `${scene.gy - scene.R0}px`, width: `${scene.R0 * 2}px`, height: `${scene.R0 * 2}px` });
    overlay(performance.now() / 1000);
  }
  new ResizeObserver(paint).observe(cv);
  // a click on a cypress pokes it, on a rock sends ripples out (not on the footer's own links and controls)
  const hit = e => {
    if (!scene || e.target.closest('a, button, select, input')) return null;
    const b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    return scene.trees.find(tr => Math.abs(x - tr.x) < tr.w * 1.3 && y > scene.top - tr.h && y < scene.top)
      ?? scene.rocks.find(r => Math.abs(x - r.cx) < r.a && y > r.cy - r.a * 0.7 && y < r.cy + r.a * 0.3);
  };
  foot.addEventListener('pointermove', e => { foot.style.cursor = hit(e) ? 'pointer' : ''; });
  foot.addEventListener('click', e => {
    const h = hit(e), t = performance.now() / 1000; if (!h || reduced) return;
    if (h.img) {
      h.t0 = t;
      for (let k = 0; k < 12; k++) { const v = 0.15 + Math.random() * 0.8, side = Math.random() < 0.5 ? -1 : 1;
        leaves.push({ x: h.x + side * h.w * (1.1 - v * 0.7) * Math.random(), y: scene.top - h.h * v, vx: side * (25 + Math.random() * 50), vy: -30 - Math.random() * 60,
          ph: Math.random() * 6, spin: (Math.random() - 0.5) * 8, life: 1.4 + Math.random() * 0.8, t0: t }); }
    } else ripples.push({ ...h, t0: t });
  });
  addEventListener('themechange', paint);   // the head script's: the device's setting or the button changed it
  // a drag turns the globe with it, any way; let go and it coasts on, slowing
  spin.addEventListener('pointerdown', e => { spin.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, t: e.timeStamp }; vx = vy = 0; });
  spin.addEventListener('pointermove', e => {
    if (!drag || !scene) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y, dt = Math.max(0.008, (e.timeStamp - drag.t) / 1000);
    turn(dx, dy); vx = dx / dt; vy = dy / dt; drag = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    if (reduced) overlay(performance.now() / 1000);
  });
  const release = e => { if (drag && (reduced || e.timeStamp - drag.t > 80)) vx = vy = 0; drag = null; };
  spin.addEventListener('pointerup', release); spin.addEventListener('pointercancel', release);
  if (!reduced) {
    let last = 0;
    new IntersectionObserver(es => { on = es[0].isIntersecting; if (on) requestAnimationFrame(loop); }).observe(foot);
    const loop = now => {
      if (!on || !scene) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!drag && (vx || vy)) { turn(vx * dt, vy * dt); const f = Math.exp(-2.2 * dt); vx *= f; vy *= f; if (Math.hypot(vx, vy) < 2) vx = vy = 0; }
      overlay(now / 1000); requestAnimationFrame(loop);
    };
  }
}
