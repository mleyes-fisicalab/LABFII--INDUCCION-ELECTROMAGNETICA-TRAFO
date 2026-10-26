/* ==========================================================================
   Ilustraciones de portada (estilo grabado a color sobre papel milimetrado)
   ========================================================================== */
const INK = "#2b2620";
function proj(x0, y0, W, H, sk) { return (u, v) => [x0 + u + sk * (1 - v / H), y0 + v]; }
function boardSVG(x0, y0, W, H, sk, d) {
  const top = `M${x0 + sk},${y0} L${x0 + W + sk},${y0} L${x0 + W},${y0 + H} L${x0},${y0 + H} Z`;
  return `<g filter="url(#drop)"><path d="${top}" fill="url(#woodTop)" stroke="${INK}" stroke-width="1.5"/><path d="${top}" fill="url(#grain)"/>
  <path d="M${x0},${y0 + H} H${x0 + W} V${y0 + H + d} H${x0} Z" fill="url(#wood)" stroke="${INK}" stroke-width="1.5"/>
  <path d="M${x0 + W + sk},${y0} L${x0 + W},${y0 + H} V${y0 + H + d} L${x0 + W + sk},${y0 + d} Z" fill="#4a250f" stroke="${INK}" stroke-width="1.5"/>
  <path d="M${x0},${y0 + H + 4} H${x0 + W}" stroke="#c98a5a" stroke-width="1" opacity=".5"/>
  ${[x0 + 26, x0 + W - 26].map(x => `<ellipse cx="${x}" cy="${y0 + H + d + 5}" rx="16" ry="6" fill="url(#brass)" stroke="${INK}"/>`).join("")}</g>`;
}
function post(x, y, s = 1) {
  return `<g><ellipse cx="${x}" cy="${y}" rx="${9 * s}" ry="${4 * s}" fill="#5a3d12" stroke="${INK}"/><rect x="${x - 6 * s}" y="${y - 16 * s}" width="${12 * s}" height="${16 * s}" fill="url(#brass)" stroke="${INK}"/>
  <ellipse cx="${x}" cy="${y - 16 * s}" rx="${6 * s}" ry="${2.6 * s}" fill="#f3d995" stroke="${INK}"/><rect x="${x - 7.5 * s}" y="${y - 11 * s}" width="${15 * s}" height="${4 * s}" rx="1.5" fill="#a17a2c" stroke="${INK}" stroke-width=".8"/></g>`;
}
function resistorSVG(x1, y1, x2, y2, bands, hl) {
  const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, a = .26, b = .74;
  const A = [x1 + dx * a, y1 + dy * a], B = [x1 + dx * b, y1 + dy * b];
  const bd = bands.map((c, i) => { const t = .36 + i * .08; const p = [x1 + dx * t, y1 + dy * t]; return `<line x1="${p[0] - uy * 7}" y1="${p[1] + ux * 7}" x2="${p[0] + uy * 7}" y2="${p[1] - ux * 7}" stroke="${c}" stroke-width="4"/>`; }).join("");
  return `<g><path d="M${x1},${y1 - 14} L${A[0]},${A[1] - 14} M${B[0]},${B[1] - 14} L${x2},${y2 - 14}" stroke="#7d7d7d" stroke-width="2.2" fill="none"/>
  <g transform="translate(0,-14)"><line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${INK}" stroke-width="17" stroke-linecap="round"/>
  <line x1="${A[0]}" y1="${A[1]}" x2="${B[0]}" y2="${B[1]}" stroke="${hl ? "#e8c9a0" : "url(#ivory)"}" stroke-width="14" stroke-linecap="round"/>
  <line x1="${A[0] - uy * 3}" y1="${A[1] + ux * 3 - 2}" x2="${B[0] - uy * 3}" y2="${B[1] + ux * 3 - 2}" stroke="#fff" stroke-width="2" opacity=".6" stroke-linecap="round"/>${bd}</g></g>`;
}
function dialSVG(cx, cy, r, unit, ang = 20) {
  const tk = []; for (let k = -10; k <= 10; k++) { const a = k * 5 * Math.PI / 180; tk.push(`<line x1="${cx + (r - 6) * Math.sin(a)}" y1="${cy + 4 - (r - 6) * Math.cos(a)}" x2="${cx + (r - (k % 5 ? 11 : 15)) * Math.sin(a)}" y2="${cy + 4 - (r - (k % 5 ? 11 : 15)) * Math.cos(a)}" stroke="${INK}" stroke-width=".9"/>`); }
  const a = ang * Math.PI / 180;
  return `<g><circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="url(#brass)" stroke="${INK}" stroke-width="1.4"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#dial)" stroke="${INK}"/>
  ${tk.join("")}<text x="${cx}" y="${cy + r * .5}" text-anchor="middle" font-size="${Math.max(9, r * .28)}" style="font-family:Georgia,serif;text-transform:none">${unit}</text>
  <line x1="${cx}" y1="${cy + 4}" x2="${cx + (r - 9) * Math.sin(a)}" y2="${cy + 4 - (r - 9) * Math.cos(a)}" stroke="#9b1c14" stroke-width="1.8"/><circle cx="${cx}" cy="${cy + 4}" r="3" fill="${INK}"/>
  <path d="M${cx - r * .7},${cy - r * .55} A${r},${r} 0 0 1 ${cx + r * .2},${cy - r * .92}" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/></g>`;
}
function boxSVG(x, y, w, h, dz, front, top, side) {
  const k = dz * .6;
  return `<g filter="url(#drop)"><path d="M${x},${y} L${x + dz},${y - k} H${x + w + dz} L${x + w},${y} Z" fill="${top}" stroke="${INK}" stroke-width="1.3"/>
  <path d="M${x + w},${y} L${x + w + dz},${y - k} V${y + h - k} L${x + w},${y + h} Z" fill="${side}" stroke="${INK}" stroke-width="1.3"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${front}" stroke="${INK}" stroke-width="1.3"/></g>`;
}
function knob(x, y, r = 9) { return `<g><circle cx="${x}" cy="${y}" r="${r + 2}" fill="#3a2a18" stroke="${INK}"/><circle cx="${x}" cy="${y}" r="${r}" fill="url(#brass)" stroke="${INK}"/><line x1="${x}" y1="${y}" x2="${x + r * .6}" y2="${y - r * .7}" stroke="${INK}" stroke-width="1.6"/></g>`; }
function cable(d, col) { return `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4.6" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`; }
function svgWrap(inner) { return `<svg viewBox="0 0 820 470" xmlns="http://www.w3.org/2000/svg">${illDefs()}${inner}</svg>`; }

/* ---------- 1. Puente de Wheatstone ---------- */
function illWheatstone() {
  const P = proj(150, 190, 520, 170, 70), T = P(270, 18), Lf = P(130, 88), R = P(410, 88), B = P(270, 158);
  const band = c => c.map(i => ["#1b1b1b", "#7a4a22", "#d23b2b", "#f08a1c", "#f2d02a", "#2f9e4a", "#2f62d0", "#8a4ad0", "#8a8a8a", "#f4f4f4"][i]);
  const G = [(Lf[0] + R[0]) / 2, (Lf[1] + R[1]) / 2 - 64];
  return svgWrap(`${boardSVG(150, 190, 520, 170, 70, 28)}
  ${cable(`M${Lf[0]},${Lf[1] - 16} C${Lf[0] + 40},${Lf[1] - 30} ${G[0] - 70},${G[1] + 40} ${G[0] - 30},${G[1] + 34}`, "#c7302a")}
  ${cable(`M${R[0]},${R[1] - 16} C${R[0] - 40},${R[1] - 30} ${G[0] + 70},${G[1] + 40} ${G[0] + 30},${G[1] + 34}`, "#2a2a2a")}
  ${resistorSVG(...T, ...Lf, band([0, 0, 0]), false)}${resistorSVG(...T, ...R, band([1, 0, 2]), false)}
  ${resistorSVG(...Lf, ...B, band([8, 2, 2]), true)}${resistorSVG(...R, ...B, band([1, 0, 2]), false)}
  ${[T, Lf, R, B].map(p => post(...p)).join("")}
  <rect x="${G[0] - 9}" y="${G[1] + 20}" width="18" height="44" fill="url(#brass)" stroke="${INK}"/><ellipse cx="${G[0]}" cy="${G[1] + 64}" rx="26" ry="8" fill="url(#brass)" stroke="${INK}"/>
  ${dialSVG(G[0], G[1], 40, "µA", 18)}
  ${boxSVG(48, 128, 66, 92, 22, "#2d3a33", "#4b5a52", "#1f2924")}
  <rect x="62" y="150" width="38" height="30" rx="3" fill="#d8cfb4" stroke="${INK}"/><text x="81" y="171" text-anchor="middle" font-size="13">6 V</text>
  ${post(66, 210, .7)}${post(96, 210, .7)}
  ${cable(`M96,200 C150,130 ${T[0] - 70},${T[1] - 70} ${T[0]},${T[1] - 16}`, "#c7302a")}
  ${cable(`M66,200 C70,330 ${B[0] - 160},${B[1] + 30} ${B[0]},${B[1] - 16}`, "#2a2a2a")}
  ${boxSVG(560, 368, 190, 60, 26, "url(#wood)", "url(#woodTop)", "#4a250f")}
  ${[0, 1, 2, 3].map(i => knob(588 + i * 45, 398, 10)).join("")}${[0, 1, 2, 3].map(i => `<text x="${588 + i * 45}" y="381" text-anchor="middle" font-size="10">×${[1000, 100, 10, 1][i]}</text>`).join("")}
  ${cable(`M600,370 C580,330 ${Lf[0] + 60},${Lf[1] + 70} ${(T[0] + Lf[0]) / 2 + 10},${(T[1] + Lf[1]) / 2 - 2}`, "#c9a03a")}
  ${callout(20, 64, ["Fuente DC (6 V)"], 70, 120, "start")}
  ${callout(G[0] + 120, 52, ["Galvanómetro"], G[0] + 44, G[1] - 6, "start")}
  ${callout(20, 420, ["Resistencia", "problema Rₓ"], (Lf[0] + B[0]) / 2 - 10, (Lf[1] + B[1]) / 2 - 6, "start")}
  ${callout(790, 160, ["Brazos de razón", "R₁ y R₂"], (T[0] + R[0]) / 2 + 12, (T[1] + R[1]) / 2 - 14, "end")}
  ${callout(790, 452, ["Caja de décadas R₃"], 720, 420, "end")}`);
}

/* ---------- 2. Resistividad ---------- */
function illResistividad() {
  const P = proj(70, 150, 640, 150, 60), vs = [22, 48, 74, 100, 126], cols = ["#b9c2cc", "#b9c2cc", "#b9c2cc", "#b9c2cc", "#d6b24a"], th = [4, 2.6, 3.2, 1.8, 2.6];
  const wires = vs.map((v, i) => { const a = P(40, v), b = P(600, v); return `<line x1="${a[0]}" y1="${a[1] - 6}" x2="${b[0]}" y2="${b[1] - 6}" stroke="${INK}" stroke-width="${th[i] + 1.6}" stroke-linecap="round"/><line x1="${a[0]}" y1="${a[1] - 6}" x2="${b[0]}" y2="${b[1] - 6}" stroke="${cols[i]}" stroke-width="${th[i]}" stroke-linecap="round"/>${post(a[0] - 12, a[1], .75)}${post(b[0] + 12, b[1], .75)}`; }).join("");
  const h1 = P(300, 6), h2 = P(350, 6), h3 = P(350, 144), h4 = P(300, 144);
  return svgWrap(`${boardSVG(70, 150, 640, 150, 60, 24)}${wires}
  <path d="M${h1[0]},${h1[1] - 14} L${h2[0]},${h2[1] - 14} L${h3[0]},${h3[1] - 14} L${h4[0]},${h4[1] - 14} Z" fill="#2a5db0" stroke="${INK}" stroke-width="1.3"/>
  <path d="M${h4[0]},${h4[1] - 14} L${h3[0]},${h3[1] - 14} V${h3[1]} H${h4[0]} Z" fill="#1d4386" stroke="${INK}"/>
  ${boxSVG(30, 52, 120, 66, 24, "#d9d4c4", "#ebe6d6", "#b5ae99")}<rect x="44" y="64" width="62" height="26" fill="#1c2a24" stroke="${INK}"/><text x="75" y="83" text-anchor="middle" font-size="13" style="fill:#9fe0b5">1,50 V</text>${knob(126, 78, 8)}
  ${boxSVG(280, 352, 110, 80, 20, "#e7e1cd", "#f3eedd", "#bdb59e")}${dialSVG(335, 392, 30, "A", -10)}
  ${boxSVG(470, 360, 74, 74, 16, "#e8c33a", "#f2d867", "#b8961d")}<rect x="482" y="370" width="50" height="22" fill="#1c2a24" stroke="${INK}"/><text x="507" y="386" text-anchor="middle" font-size="11" style="fill:#9fe0b5">1,162</text>${knob(507, 414, 9)}
  ${cable(`M150,90 C260,70 ${P(40, 22)[0] - 40},${P(40, 22)[1] - 40} ${P(40, 22)[0] - 12},${P(40, 22)[1] - 14}`, "#c7302a")}
  ${cable(`M${P(600, 22)[0] + 12},${P(600, 22)[1] - 14} C780,140 760,330 ${390 + 20},${392}`, "#c7302a")}
  ${cable(`M290,400 C200,420 120,300 60,118`, "#2a2a2a")}
  ${cable(`M${P(40, 22)[0] - 12},${P(40, 22)[1] - 6} C120,330 420,450 478,420`, "#2a5db0")}
  ${cable(`M${P(600, 22)[0] + 12},${P(600, 22)[1] - 6} C700,330 600,430 536,420`, "#2a5db0")}
  ${callout(330, 60, ["Hilos de Konstantan", "∅ 1 · 0,7 · 0,5 · 0,35 mm"], P(470, 74)[0], P(470, 74)[1] - 10, "start")}
  ${callout(20, 400, ["Hilo de Messing", "(latón) ∅ 0,5 mm"], P(110, 126)[0], P(110, 126)[1] - 4, "start")}
  ${callout(150, 456, ["Amperímetro"], 296, 420, "start")}
  ${callout(640, 456, ["Voltímetro"], 548, 420, "start")}
  ${callout(220, 30, ["Fuente DC"], 152, 60, "start")}
  ${callout(790, 120, ["Bornes de conexión"], P(612, 48)[0] + 8, P(612, 48)[1] - 16, "end")}`);
}

/* ---------- 3. Transformador ---------- */
function illTransformador() {
  const bx = 120, by = 300;
  const lam = (x, y, w, h) => { let s = ""; for (let i = 6; i < w; i += 6) s += `<line x1="${x + i}" y1="${y}" x2="${x + i}" y2="${y + h}" stroke="${INK}" stroke-width=".5" opacity=".45"/>`; return s; };
  const coil = (x, label) => `<g filter="url(#drop)"><rect x="${x}" y="150" width="100" height="120" rx="6" fill="url(#copper)" stroke="${INK}" stroke-width="1.4"/>
    ${Array.from({ length: 22 }, (_, i) => `<line x1="${x + 2}" y1="${156 + i * 5}" x2="${x + 98}" y2="${156 + i * 5}" stroke="#5a2a0c" stroke-width=".8" opacity=".55"/>`).join("")}
    <rect x="${x - 6}" y="142" width="112" height="12" rx="3" fill="#2d2a26" stroke="${INK}"/><rect x="${x - 6}" y="266" width="112" height="12" rx="3" fill="#2d2a26" stroke="${INK}"/>
    <rect x="${x + 30}" y="${190}" width="40" height="22" fill="#f1ead2" stroke="${INK}"/><text x="${x + 50}" y="${206}" text-anchor="middle" font-size="12">${label}</text>
    ${post(x + 20, 142, .7)}${post(x + 80, 142, .7)}</g>`;
  return svgWrap(`${boardSVG(bx, by, 520, 90, 40, 24)}
  <g filter="url(#drop)"><path d="M300,330 V120 H360 V270 H460 V120 H520 V330 Z" fill="url(#iron)" stroke="${INK}" stroke-width="1.5"/>${lam(300, 120, 60, 210)}${lam(460, 120, 60, 210)}
  <path d="M300,120 L318,108 H378 L360,120 Z M460,120 L478,108 H538 L520,120 Z" fill="#9aa1a9" stroke="${INK}"/><path d="M520,330 L538,318 V108 L520,120 Z" fill="#3a4048" stroke="${INK}"/></g>
  <g filter="url(#drop)"><rect x="288" y="78" width="244" height="44" fill="url(#iron)" stroke="${INK}" stroke-width="1.5"/>${lam(288, 78, 244, 44)}<path d="M288,78 L306,66 H550 L532,78 Z" fill="#9aa1a9" stroke="${INK}"/><path d="M532,78 L550,66 V110 L532,122 Z" fill="#3a4048" stroke="${INK}"/></g>
  ${coil(280, "Nₚ")}${coil(440, "Nₛ")}
  ${boxSVG(30, 190, 120, 80, 22, "#d9d4c4", "#ebe6d6", "#b5ae99")}<rect x="44" y="204" width="62" height="24" fill="#1c2a24" stroke="${INK}"/><text x="75" y="221" text-anchor="middle" font-size="12" style="fill:#9fe0b5">6,0 V~</text>${knob(124, 216, 8)}${post(60, 262, .7)}${post(90, 262, .7)}
  ${boxSVG(650, 170, 120, 100, 22, "#e7e1cd", "#f3eedd", "#bdb59e")}${dialSVG(710, 220, 34, "V~", 24)}
  ${cable(`M60,252 C120,90 250,90 300,128`, "#c7302a")}${cable(`M90,252 C160,140 330,90 360,128`, "#2a2a2a")}
  ${cable(`M460,128 C560,40 640,120 680,172`, "#c7302a")}${cable(`M520,128 C600,70 700,110 740,172`, "#2a2a2a")}
  ${callout(150, 40, ["Yugo"], 300, 82, "start")}
  ${callout(20, 380, ["Bobina primaria (Nₚ)"], 300, 266, "start")}
  ${callout(800, 330, ["Bobina secundaria (Nₛ)"], 520, 266, "end")}
  ${callout(800, 40, ["Núcleo laminado en U"], 540, 150, "end")}
  ${callout(20, 160, ["Fuente CA"], 60, 186, "start")}
  ${callout(800, 300, ["Voltímetro"], 730, 266, "end")}`);
}

/* ---------- 4. Ley de Ampère (solenoide) ---------- */
function illAmpere() {
  const x1 = 240, x2 = 620, cy = 210, ry = 46, n = 26;
  let back = "", front = "";
  for (let i = 0; i < n; i++) {
    const x = x1 + 20 + i * (x2 - x1 - 40) / (n - 1), w = 7;
    back += `<path d="M${x},${cy - ry} C${x + w},${cy - ry / 2} ${x + w},${cy + ry / 2} ${x + w * .4},${cy + ry}" fill="none" stroke="#8c4519" stroke-width="2" opacity=".45"/>`;
    front += `<path d="M${x + w * .4},${cy + ry} C${x - w},${cy + ry / 2} ${x - w},${cy - ry / 2} ${x + w * 1.6},${cy - ry}" fill="none" stroke="${INK}" stroke-width="4"/><path d="M${x + w * .4},${cy + ry} C${x - w},${cy + ry / 2} ${x - w},${cy - ry / 2} ${x + w * 1.6},${cy - ry}" fill="none" stroke="url(#copper)" stroke-width="2.6"/>`;
  }
  return svgWrap(`${boardSVG(150, 300, 560, 80, 40, 22)}
  <path d="M290,330 L300,250 H340 L350,330 Z M520,330 L530,250 H570 L580,330 Z" fill="url(#glass)" stroke="${INK}" stroke-width="1.2"/>
  ${back}
  <rect x="${x1 - 10}" y="${cy - ry - 4}" width="${x2 - x1 + 30}" height="${2 * ry + 8}" rx="${ry}" fill="url(#glass)" stroke="${INK}" stroke-width="1.3"/>
  <ellipse cx="${x2 + 20}" cy="${cy}" rx="14" ry="${ry + 4}" fill="#dfeaeb" fill-opacity=".6" stroke="${INK}"/>
  <line x1="40" y1="${cy}" x2="${(x1 + x2) / 2}" y2="${cy}" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><line x1="40" y1="${cy}" x2="${(x1 + x2) / 2}" y2="${cy}" stroke="#cfd4d8" stroke-width="6.5" stroke-linecap="round"/>
  <rect x="${(x1 + x2) / 2 - 10}" y="${cy - 5}" width="14" height="10" fill="#2d2a26" stroke="${INK}"/>
  ${front}
  <path d="M110,${cy} V318 M80,318 H140" stroke="${INK}" stroke-width="5"/><path d="M110,${cy} V318" stroke="#b5bbc0" stroke-width="3"/><ellipse cx="110" cy="324" rx="40" ry="10" fill="#7d858d" stroke="${INK}"/>
  ${boxSVG(20, 60, 150, 64, 24, "#d9d4c4", "#ebe6d6", "#b5ae99")}<rect x="34" y="72" width="80" height="24" fill="#1c3a6e" stroke="${INK}"/><text x="74" y="89" text-anchor="middle" font-size="12" style="fill:#cfe6ff">0,198 mT</text>${knob(144, 84, 8)}
  ${boxSVG(640, 40, 140, 110, 22, "#e7e1cd", "#f3eedd", "#bdb59e")}${dialSVG(710, 96, 36, "A", -14)}
  ${boxSVG(560, 400, 130, 52, 20, "#d9d4c4", "#ebe6d6", "#b5ae99")}<rect x="574" y="412" width="60" height="22" fill="#1c2a24" stroke="${INK}"/><text x="604" y="428" text-anchor="middle" font-size="11" style="fill:#9fe0b5">2,00 A</text>${knob(664, 426, 8)}
  ${cable(`M${x1 + 14},${cy + ry} C220,330 380,420 570,420`, "#c7302a")}${cable(`M${x2 + 6},${cy + ry} C700,300 700,170 700,150`, "#2a5db0")}${cable(`M760,150 C800,300 720,400 690,420`, "#2a5db0")}
  ${cable(`M40,${cy} C20,${cy - 40} 40,140 70,124`, "#2a2a2a")}
  ${callout(330, 40, ["Solenoide (N espiras)"], 470, cy - ry + 2, "start")}
  ${callout(20, 440, ["Sonda Hall axial"], 180, cy + 8, "start")}
  ${callout(200, 40, ["Teslámetro"], 150, 70, "end")}
  ${callout(800, 230, ["Amperímetro"], 748, 130, "end")}
  ${callout(520, 430, ["Fuente de corriente"], 560, 426, "end")}
  ${callout(360, 290, ["Tubo acrílico"], 330, 262, "start")}`);
}
