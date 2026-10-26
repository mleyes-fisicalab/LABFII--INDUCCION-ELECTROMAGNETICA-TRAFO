/* ==========================================================================
   Motor de cuadernos interactivos · Laboratorio de Física II · UTP
   BOOK_DATA + goToPage, plano cartesiano tipo GeoGebra, tablas, regresión,
   preguntas, autoevaluación y persistencia local.
   ========================================================================== */
"use strict";
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- números en formato colombiano (coma decimal) ---------- */
function fmt(x, d = 2) { return (x == null || !isFinite(x)) ? "—" : Number(x).toFixed(d).replace(".", ","); }
function fmtS(x, s = 3) {
  if (x == null || !isFinite(x)) return "—";
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  if (e < -3 || e > 5) return sciT(x, s);
  const d = Math.max(0, s - 1 - e);
  return Number(x).toFixed(d).replace(".", ",");
}
const SUP = { "-": "⁻", 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷", 8: "⁸", 9: "⁹" };
function sciT(x, s = 3) {
  if (x == null || !isFinite(x)) return "—";
  if (x === 0) return "0";
  const e = Math.floor(Math.log10(Math.abs(x)));
  const m = x / Math.pow(10, e);
  return m.toFixed(s - 1).replace(".", ",") + " × 10" + String(e).split("").map(c => SUP[c]).join("");
}
function num(v) { if (typeof v === "number") return v; if (v == null) return NaN; const t = String(v).trim().replace(/\s/g, "").replace(",", "."); return t === "" ? NaN : Number(t); }
function gauss() { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function mean(a) { const b = a.filter(isFinite); return b.length ? b.reduce((s, x) => s + x, 0) / b.length : NaN; }

/* ---------- regresión lineal por mínimos cuadrados ---------- */
function linreg(pts) {
  const p = pts.filter(q => isFinite(q[0]) && isFinite(q[1]));
  const n = p.length; if (n < 2) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of p) { sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }
  const den = n * sxx - sx * sx; if (Math.abs(den) < 1e-300) return null;
  const m = (n * sxy - sx * sy) / den, b = (sy - m * sx) / n;
  const ssr = p.reduce((s, [x, y]) => s + (y - (m * x + b)) ** 2, 0);
  const sst = syy - sy * sy / n;
  const r2 = sst > 0 ? 1 - ssr / sst : 1;
  const sm = n > 2 ? Math.sqrt(ssr / (n - 2) / (sxx - sx * sx / n)) : NaN;
  return { m, b, r2, n, sm };
}
function eqStr(r, x = "x", y = "y", d = 4) {
  if (!r) return "—";
  const sgn = r.b < 0 ? " − " : " + ";
  return `${y} = ${fmtS(r.m, d)}${x}${sgn}${fmtS(Math.abs(r.b), d)}`;
}

/* ---------- persistencia ---------- */
const Store = {
  key: "nb", data: {},
  load(key) { this.key = key; try { this.data = JSON.parse(localStorage.getItem(key) || "{}") || {}; } catch (e) { this.data = {}; } return this.data; },
  save() { clearTimeout(this._t); this._t = setTimeout(() => { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { } }, 250); },
  get(path, def) { const v = path.split(".").reduce((o, k) => (o && k in o) ? o[k] : undefined, this.data); return v === undefined ? def : v; },
  set(path, val) { const ks = path.split("."); let o = this.data; ks.slice(0, -1).forEach(k => { if (typeof o[k] !== "object" || o[k] === null) o[k] = {}; o = o[k]; }); o[ks.at(-1)] = val; this.save(); }
};

function toast(msg) {
  let t = $(".toast"); if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("on"); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("on"), 2200);
}
function cssVar(name, el = document.documentElement) { return getComputedStyle(el).getPropertyValue(name).trim(); }

/* ---------- iconos ---------- */
const ICON = {
  select: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 3l14 8-6 1.6L10 19z"/></svg>',
  pan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M2 12h20M12 2l-3 3M12 2l3 3M12 22l-3-3M12 22l3-3M2 12l3-3M2 12l3 3M22 12l-3-3M22 12l-3 3"/></svg>',
  zin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M10.5 7.5v6M7.5 10.5h6"/></svg>',
  zout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21M7.5 10.5h6"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7M5 10v10h14V10"/></svg>',
  palette: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3a9 9 0 100 18c1.2 0 1.7-.8 1.7-1.6 0-1.2-1-1.6-1-2.6 0-.9.7-1.6 1.6-1.6H17a4 4 0 004-4c0-4.5-4-8.2-9-8.2z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10.5" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/></svg>',
  fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/></svg>'
};

/* ==========================================================================
   Plano cartesiano estilo GeoGebra
   ========================================================================== */
const SERIES_COLORS = ["--c1", "--c2", "--c3", "--c4", "--c5", "--c6"];
class CartesianPlane {
  constructor(host, o = {}) {
    this.o = Object.assign({ height: 380, xLabel: "x", yLabel: "y", view: null, includeOrigin: true, id: null, pad: 0.12 }, o);
    this.series = []; this.mode = "pan"; this.sel = null;
    host.innerHTML = "";
    const w = document.createElement("div"); w.className = "plane"; w.style.height = this.o.height + "px";
    w.innerHTML = `<canvas></canvas>
      <div class="ptools" role="toolbar" aria-label="Herramientas del plano">
        <button data-t="select" title="Seleccionar objetos" aria-label="Seleccionar objetos" aria-pressed="false">${ICON.select}</button>
        <button data-t="pan" title="Arrastrar el lienzo" aria-label="Arrastrar el lienzo" aria-pressed="true">${ICON.pan}</button>
        <button data-t="zin" title="Acercar" aria-label="Acercar">${ICON.zin}</button>
        <button data-t="zout" title="Alejar" aria-label="Alejar">${ICON.zout}</button>
        <button data-t="fit" title="Ajustar a los datos" aria-label="Ajustar a los datos">${ICON.fit}</button>
        <button data-t="home" title="Restablecer vista" aria-label="Restablecer vista">${ICON.home}</button>
        <button data-t="pal" title="Estilos gráficos" aria-label="Estilos gráficos">${ICON.palette}</button>
      </div>
      <div class="plegend" hidden></div><div class="ptip" hidden></div><div class="ppal" hidden></div>
`;
    host.appendChild(w);
    const hint = document.createElement("div"); hint.className = "phint"; hint.textContent = "Arrastra un eje para reescalarlo · rueda del ratón o pellizco para zoom · paleta para cambiar estilos"; host.appendChild(hint);
    this.wrap = w; this.cv = $("canvas", w); this.ctx = this.cv.getContext("2d");
    this.leg = $(".plegend", w); this.tip = $(".ptip", w); this.pal = $(".ppal", w);
    this.view = this.o.view ? { ...this.o.view } : { xmin: -1, xmax: 10, ymin: -1, ymax: 10 };
    this.home = { ...this.view }; this._autoHome = !this.o.view;
    this.styles = this.o.id ? Store.get("planes." + this.o.id, {}) : {};
    this._bind();
    this.ro = new ResizeObserver(() => this.draw()); this.ro.observe(w);
    this._onTheme = () => this.draw(); document.addEventListener("nb-theme", this._onTheme);
  }
  /* --- datos --- */
  setSeries(arr, refit = false) {
    this.series = arr.map((s, i) => Object.assign({ id: "s" + i, width: 2, size: 4.5 }, s, this.styles[s.id || ("s" + i)] || {}));
    if (refit || this._autoHome) { const b = this.bounds(); if (b) { this.home = b; if (refit || this._first !== true) { this.view = { ...b }; this._first = true; } } }
    this.draw(); this._legend();
  }
  bounds() {
    let xs = [], ys = [];
    for (const s of this.series) {
      if (s.data && s.type !== "fn") for (const [x, y] of s.data) { if (isFinite(x) && isFinite(y)) { xs.push(x); ys.push(y); } }
      if (s.type === "vline" && isFinite(s.x)) xs.push(s.x);
    }
    if (this.o.extraBounds) { xs.push(...this.o.extraBounds.x || []); ys.push(...this.o.extraBounds.y || []); }
    if (!xs.length) return this.o.view ? { ...this.o.view } : null;
    if (this.o.includeOrigin) { xs.push(0); ys.push(0); }
    let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    if (x1 - x0 < 1e-12) { x0 -= 1; x1 += 1; } if (y1 - y0 < 1e-12) { y0 -= 1; y1 += 1; }
    const px = (x1 - x0) * this.o.pad, py = (y1 - y0) * this.o.pad;
    return { xmin: x0 - px, xmax: x1 + px, ymin: y0 - py, ymax: y1 + py * 2.6 };
  }
  setView(v, asHome = true) { this.view = { ...v }; if (asHome) { this.home = { ...v }; this._autoHome = false; } this.draw(); }
  /* --- coordenadas --- */
  get W() { return this.cv.clientWidth; } get H() { return this.cv.clientHeight; }
  X(x) { const v = this.view; return (x - v.xmin) / (v.xmax - v.xmin) * this.W; }
  Y(y) { const v = this.view; return this.H - (y - v.ymin) / (v.ymax - v.ymin) * this.H; }
  wx(px) { const v = this.view; return v.xmin + px / this.W * (v.xmax - v.xmin); }
  wy(py) { const v = this.view; return v.ymin + (this.H - py) / this.H * (v.ymax - v.ymin); }
  color(s, i) { if (s.color && !s.color.startsWith("--")) return s.color; return cssVar(s.color || SERIES_COLORS[i % 6]) || "#e8b84b"; }
  axisPos() { // posición en píxeles del eje x (horizontal) y del eje y (vertical)
    const ay = clamp(this.Y(0), 0, this.H), ax = clamp(this.X(0), 0, this.W);
    return { ay, ax, yIn: this.Y(0) >= 0 && this.Y(0) <= this.H, xIn: this.X(0) >= 0 && this.X(0) <= this.W };
  }
  static nice(raw) { const e = Math.floor(Math.log10(raw)), f = raw / 10 ** e; const m = f < 1.5 ? 1 : f < 3.5 ? 2 : f < 7.5 ? 5 : 10; return { step: m * 10 ** e, sub: m === 2 ? 4 : 5 }; }
  static lbl(v, step) {
    if (Math.abs(v) < step * 1e-6) return "0";
    const a = Math.abs(step);
    if (a < 1e-3 || a >= 1e6) { const e = Math.floor(Math.log10(Math.abs(v)) + 1e-9); const m = v / 10 ** e; return (Math.round(m * 100) / 100).toString().replace(".", ",") + "×10" + String(e).split("").map(c => SUP[c]).join(""); }
    const d = Math.max(0, -Math.floor(Math.log10(a) + 1e-9));
    return v.toFixed(d).replace(".", ",");
  }
  /* --- dibujo --- */
  draw() {
    const dpr = window.devicePixelRatio || 1, W = this.W, H = this.H; if (!W || !H) return;
    if (this.cv.width !== Math.round(W * dpr) || this.cv.height !== Math.round(H * dpr)) { this.cv.width = Math.round(W * dpr); this.cv.height = Math.round(H * dpr); }
    const c = this.ctx; c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    const g1 = cssVar("--grid1"), g2 = cssVar("--grid2"), ax = cssVar("--axis"), fg3 = cssVar("--fg3"), fg = cssVar("--fg"), mono = cssVar("--f-mono") || "monospace";
    this.leg.style.top = W < 600 ? "52px" : "8px";
    const v = this.view;
    const tx = CartesianPlane.nice((v.xmax - v.xmin) / Math.max(2, W / 90)), ty = CartesianPlane.nice((v.ymax - v.ymin) / Math.max(2, H / 70));
    // cuadrícula menor y mayor (papel milimetrado)
    const grid = (t, isX) => {
      const lo = isX ? v.xmin : v.ymin, hi = isX ? v.xmax : v.ymax;
      for (const [st, col] of [[t.step / t.sub, g1], [t.step, g2]]) {
        c.strokeStyle = col; c.lineWidth = 1; c.beginPath();
        for (let k = Math.ceil(lo / st); k * st <= hi; k++) { const p = isX ? Math.round(this.X(k * st)) + .5 : Math.round(this.Y(k * st)) + .5; if (isX) { c.moveTo(p, 0); c.lineTo(p, H); } else { c.moveTo(0, p); c.lineTo(W, p); } }
        c.stroke();
      }
    };
    grid(tx, true); grid(ty, false);
    // ejes
    const A = this.axisPos(); c.strokeStyle = ax; c.lineWidth = 1.4; c.beginPath();
    c.moveTo(0, Math.round(A.ay) + .5); c.lineTo(W, Math.round(A.ay) + .5); c.moveTo(Math.round(A.ax) + .5, 0); c.lineTo(Math.round(A.ax) + .5, H); c.stroke();
    // flechas
    c.fillStyle = ax; c.beginPath(); c.moveTo(W, A.ay); c.lineTo(W - 9, A.ay - 4); c.lineTo(W - 9, A.ay + 4); c.fill();
    c.beginPath(); c.moveTo(A.ax, 0); c.lineTo(A.ax - 4, 9); c.lineTo(A.ax + 4, 9); c.fill();
    // ticks y números
    c.font = `500 11px ${mono}`; c.fillStyle = fg3; c.strokeStyle = ax; c.lineWidth = 1;
    const below = A.ay < H - 20; c.textAlign = "center"; c.textBaseline = below ? "top" : "bottom";
    for (let k = Math.ceil(v.xmin / (tx.step / tx.sub)); k * tx.step / tx.sub <= v.xmax; k++) {
      const x = k * tx.step / tx.sub, p = this.X(x), major = Math.abs(k % tx.sub) === 0;
      c.beginPath(); c.moveTo(p, A.ay - (major ? 4 : 2)); c.lineTo(p, A.ay + (major ? 4 : 2)); c.stroke();
      if (major && Math.abs(x) > tx.step * 1e-6 && p > 14 && p < W - 14) c.fillText(CartesianPlane.lbl(x, tx.step), p, below ? A.ay + 6 : A.ay - 6);
    }
    const right = A.ax < 40; c.textAlign = right ? "left" : "right"; c.textBaseline = "middle";
    for (let k = Math.ceil(v.ymin / (ty.step / ty.sub)); k * ty.step / ty.sub <= v.ymax; k++) {
      const y = k * ty.step / ty.sub, p = this.Y(y), major = Math.abs(k % ty.sub) === 0;
      c.beginPath(); c.moveTo(A.ax - (major ? 4 : 2), p); c.lineTo(A.ax + (major ? 4 : 2), p); c.stroke();
      if (major && Math.abs(y) > ty.step * 1e-6 && p > 12 && p < H - 10) c.fillText(CartesianPlane.lbl(y, ty.step), right ? A.ax + 7 : A.ax - 7, p);
    }
    if (A.xIn && A.yIn) { c.textAlign = "right"; c.textBaseline = "top"; c.fillText("0", A.ax - 5, A.ay + 4); }
    // series
    c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip();
    this.series.forEach((s, i) => { if (!s.hidden) this._drawSeries(s, i); });
    c.restore();
    // títulos de ejes
    c.font = `600 12px ${cssVar("--f-body") || "sans-serif"}`; c.fillStyle = fg;
    c.textAlign = "right"; c.textBaseline = below ? "bottom" : "top"; c.fillText(this.o.xLabel, W - 12, below ? A.ay - 8 : A.ay + 8);
    c.textAlign = right ? "left" : "right"; c.textBaseline = "top"; c.fillText(this.o.yLabel, right ? A.ax + 10 : A.ax - 10, A.ax < 300 ? 56 : 12);
  }
  _drawSeries(s, i) {
    const c = this.ctx, col = this.color(s, i), W = this.W;
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = s.width; c.setLineDash(s.dash === "dash" ? [8, 5] : s.dash === "dot" ? [2, 4] : []);
    if (s.type === "fn") {
      c.beginPath(); let pen = false;
      for (let px = 0; px <= W; px += 2) { const y = s.f(this.wx(px)); const py = this.Y(y); if (!isFinite(y) || Math.abs(py) > 1e5) { pen = false; continue; } pen ? c.lineTo(px, py) : c.moveTo(px, py); pen = true; }
      c.stroke();
    } else if (s.type === "line") {
      c.beginPath(); s.data.forEach(([x, y], k) => { const p = [this.X(x), this.Y(y)]; k ? c.lineTo(...p) : c.moveTo(...p); }); c.stroke();
    } else if (s.type === "vline") {
      const p = this.X(s.x); c.beginPath(); c.moveTo(p, 0); c.lineTo(p, this.H); c.stroke();
      if (s.label) { c.setLineDash([]); c.font = `600 11px ${cssVar("--f-mono")}`; c.textAlign = "left"; c.textBaseline = "top"; c.fillText(s.label, p + 5, 46); }
    } else if (s.type === "points") {
      c.setLineDash([]);
      s.data.forEach(([x, y], k) => {
        if (!isFinite(x) || !isFinite(y)) return;
        const px = this.X(x), py = this.Y(y), r = s.size;
        c.beginPath();
        if (s.shape === "square") c.rect(px - r, py - r, 2 * r, 2 * r);
        else if (s.shape === "diamond") { c.moveTo(px, py - r * 1.3); c.lineTo(px + r * 1.3, py); c.lineTo(px, py + r * 1.3); c.lineTo(px - r * 1.3, py); c.closePath(); }
        else c.arc(px, py, r, 0, 7);
        c.fill();
        if (this.sel && this.sel.s === s && this.sel.k === k) { c.lineWidth = 2; c.strokeStyle = cssVar("--fg"); c.beginPath(); c.arc(px, py, r + 4, 0, 7); c.stroke(); c.strokeStyle = col; }
      });
    }
    c.setLineDash([]);
  }
  _legend() {
    const items = this.series.filter(s => s.label && !s.hidden && !s.noLegend);
    this.leg.hidden = !items.length;
    this.leg.innerHTML = items.map(s => { const i = this.series.indexOf(s); const col = this.color(s, i); const st = s.type === "points" ? `height:8px;width:8px;border-radius:50%;background:${col}` : `background:${s.dash ? "transparent" : col};border-top:${s.dash ? `2px ${s.dash === "dot" ? "dotted" : "dashed"} ${col}` : "0"}`; return `<span><i style="${st}"></i>${esc(s.label)}</span>`; }).join("");
  }
  zoom(f, cx = this.W / 2, cy = this.H / 2) {
    const x = this.wx(cx), y = this.wy(cy), v = this.view;
    this.view = { xmin: x - (x - v.xmin) * f, xmax: x + (v.xmax - x) * f, ymin: y - (y - v.ymin) * f, ymax: y + (v.ymax - y) * f }; this.draw();
  }
  _palette() {
    if (!this.pal.hidden) { this.pal.hidden = true; return; }
    const items = this.series.filter(s => s.label || s.type !== "vline");
    const toHex = c => { if (/^#[0-9a-f]{6}$/i.test(c)) return c; const d = document.createElement("canvas").getContext("2d"); d.fillStyle = c; return d.fillStyle.startsWith("#") ? d.fillStyle : "#e8b84b"; };
    this.pal.innerHTML = `<b style="font-family:var(--f-body)">Estilos gráficos</b>` + items.map(s => {
      const i = this.series.indexOf(s);
      return `<div class="it" data-i="${i}"><b>${esc(s.label || s.id)}</b>
      <span class="row" style="gap:8px"><input type="color" value="${toHex(this.color(s, i))}" aria-label="Color">
      <select data-k="width" aria-label="Grosor">${[1, 1.5, 2, 3, 4, 5].map(w => `<option ${w == s.width ? "selected" : ""} value="${w}">${String(w).replace(".", ",")} px</option>`).join("")}</select>
      ${s.type === "points" ? `<select data-k="shape" aria-label="Marcador">${[["circle", "Círculo"], ["square", "Cuadrado"], ["diamond", "Rombo"]].map(([k, t]) => `<option ${k === (s.shape || "circle") ? "selected" : ""} value="${k}">${t}</option>`).join("")}</select>`
          : `<select data-k="dash" aria-label="Tipo de línea">${[["", "Continua"], ["dash", "Discontinua"], ["dot", "Punteada"]].map(([k, t]) => `<option ${k === (s.dash || "") ? "selected" : ""} value="${k}">${t}</option>`).join("")}</select>`}</span>
      <label class="small" style="display:flex;gap:6px;align-items:center"><input type="checkbox" ${s.hidden ? "" : "checked"}> visible</label></div>`;
    }).join("");
    this.pal.hidden = false;
    $$(".it", this.pal).forEach(it => {
      const s = this.series[+it.dataset.i];
      const put = (k, v) => { s[k] = v; const id = s.id; this.styles[id] = Object.assign(this.styles[id] || {}, { [k]: v }); if (this.o.id) Store.set("planes." + this.o.id, this.styles); this.draw(); this._legend(); };
      $("input[type=color]", it).oninput = e => put("color", e.target.value);
      $$("select", it).forEach(sl => sl.onchange = e => put(sl.dataset.k, sl.dataset.k === "width" ? +e.target.value : e.target.value));
      $("input[type=checkbox]", it).onchange = e => put("hidden", !e.target.checked);
    });
  }
  _bind() {
    const w = this.wrap, cv = this.cv, ptr = new Map(); let drag = null, pinch = null;
    $$(".ptools button", w).forEach(b => b.onclick = () => {
      const t = b.dataset.t;
      if (t === "select" || t === "pan") { this.mode = t; $$('.ptools [data-t="select"],.ptools [data-t="pan"]', w).forEach(x => x.setAttribute("aria-pressed", String(x.dataset.t === t))); cv.style.cursor = t === "pan" ? "grab" : "default"; }
      if (t === "zin") this.zoom(1 / 1.35); if (t === "zout") this.zoom(1.35);
      if (t === "home") { this.view = { ...this.home }; this.draw(); }
      if (t === "fit") { const b2 = this.bounds(); if (b2) { this.view = b2; this.draw(); } }
      if (t === "pal") this._palette();
    });
    cv.style.cursor = "grab";
    const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    const nearAxis = (x, y) => { const A = this.axisPos(); if (Math.abs(y - A.ay) < 12 && Math.abs(x - A.ax) > 18) return "x"; if (Math.abs(x - A.ax) < 12 && Math.abs(y - A.ay) > 18) return "y"; return null; };
    cv.addEventListener("pointerdown", e => {
      cv.setPointerCapture(e.pointerId); const p = pos(e); ptr.set(e.pointerId, p); this.pal.hidden = true;
      if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), v: { ...this.view }, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; drag = null; return; }
      const ax = e.shiftKey ? "xy" : nearAxis(...p);
      if (ax) { const A = this.axisPos(); drag = { kind: "scale", ax, p0: p, w0: [this.wx(p[0]), this.wy(p[1])], a: [this.wx(A.ax), this.wy(A.ay)], pa: [A.ax, A.ay], v: { ...this.view } }; return; }
      if (this.mode === "select") { this._pick(p, true); return; }
      drag = { kind: "pan", p0: p, v: { ...this.view } }; cv.style.cursor = "grabbing";
    });
    cv.addEventListener("pointermove", e => {
      const p = pos(e); if (ptr.has(e.pointerId)) ptr.set(e.pointerId, p);
      if (pinch && ptr.size === 2) {
        const [a, b] = [...ptr.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]), f = pinch.d / Math.max(d, 1), v = pinch.v;
        const mx = v.xmin + pinch.m[0] / this.W * (v.xmax - v.xmin), my = v.ymin + (this.H - pinch.m[1]) / this.H * (v.ymax - v.ymin);
        this.view = { xmin: mx - (mx - v.xmin) * f, xmax: mx + (v.xmax - mx) * f, ymin: my - (my - v.ymin) * f, ymax: my + (v.ymax - my) * f }; this.draw(); return;
      }
      if (drag && drag.kind === "pan") {
        const v = drag.v, dx = (p[0] - drag.p0[0]) / this.W * (v.xmax - v.xmin), dy = (p[1] - drag.p0[1]) / this.H * (v.ymax - v.ymin);
        this.view = { xmin: v.xmin - dx, xmax: v.xmax - dx, ymin: v.ymin + dy, ymax: v.ymax + dy }; this.draw(); return;
      }
      if (drag && drag.kind === "scale") {
        const v = drag.v, nv = { ...v };
        if (drag.ax.includes("x")) { const dp = p[0] - drag.pa[0], dw = drag.w0[0] - drag.a[0]; if (Math.abs(dp) > 6 && dw / dp > 0) { const s = dw / dp; nv.xmin = drag.a[0] - drag.pa[0] * s; nv.xmax = drag.a[0] + (this.W - drag.pa[0]) * s; } }
        if (drag.ax.includes("y")) { const dp = drag.pa[1] - p[1], dw = drag.w0[1] - drag.a[1]; if (Math.abs(dp) > 6 && dw / dp > 0) { const s = dw / dp; nv.ymin = drag.a[1] - (this.H - drag.pa[1]) * s; nv.ymax = drag.a[1] + drag.pa[1] * s; } }
        this.view = nv; this.draw(); return;
      }
      const ax = nearAxis(...p); cv.style.cursor = ax === "x" ? "ew-resize" : ax === "y" ? "ns-resize" : this.mode === "pan" ? "grab" : "default";
      this._pick(p, false);
    });
    const up = e => { ptr.delete(e.pointerId); if (ptr.size < 2) pinch = null; drag = null; if (this.mode === "pan") cv.style.cursor = "grab"; };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("pointerleave", () => { if (!this.sel) this.tip.hidden = true; });
    cv.addEventListener("wheel", e => { e.preventDefault(); const p = pos(e); this.zoom(e.deltaY > 0 ? 1.12 : 1 / 1.12, ...p); }, { passive: false });
  }
  _pick(p, click) {
    let best = null, bd = 13;
    this.series.forEach(s => { if (s.type !== "points" || s.hidden) return; s.data.forEach(([x, y], k) => { const d = Math.hypot(this.X(x) - p[0], this.Y(y) - p[1]); if (d < bd) { bd = d; best = { s, k, x, y }; } }); });
    if (click) { this.sel = best; this.draw(); }
    const show = best || this.sel;
    if (show) {
      const fx = show.s.fmtX || (v => fmtS(v, 4)), fy = show.s.fmtY || (v => fmtS(v, 4));
      this.tip.textContent = `${show.s.label ? show.s.label + ": " : ""}(${fx(show.x)} ; ${fy(show.y)})`;
      this.tip.hidden = false; const tw = this.tip.offsetWidth;
      this.tip.style.left = clamp(this.X(show.x) + 10, 4, this.W - tw - 4) + "px"; this.tip.style.top = clamp(this.Y(show.y) - 30, 4, this.H - 26) + "px";
    } else this.tip.hidden = true;
  }
}

/* ==========================================================================
   Componentes de página
   ========================================================================== */
function tableHTML({ id = "", caption = "", head = [], rows = [], cls = "" }) {
  return `<div class="tblwrap"><table class="dt ${cls}" ${id ? `id="${id}"` : ""}>
    ${caption ? `<caption>${caption}</caption>` : ""}
    <thead><tr>${head.map(hh => `<th>${hh}</th>`).join("")}</tr></thead>
    <tbody>${rows.length ? rows.map(r => `<tr${r.cls ? ` class="${r.cls}"` : ""}>${(r.cells || r).map(c => typeof c === "object" && c !== null ? `<td class="${c.cls || ""}">${c.v}</td>` : `<td>${c}</td>`).join("")}</tr>`).join("") : `<tr><td class="empty" colspan="${head.length}">Sin datos todavía</td></tr>`}</tbody></table></div>`;
}
function copyTable(tbl) {
  const lines = $$("tr", tbl).map(tr => $$("th,td", tr).map(c => { const i = $("input,select", c); return (i ? i.value : c.innerText).replace(/\s+/g, " ").trim(); }).join("\t"));
  const cap = $("caption", tbl); const txt = (cap ? cap.innerText + "\n" : "") + lines.join("\n");
  return copyText(txt, "Tabla copiada. Pégala en Excel.");
}
function copyText(txt, ok = "Copiado") {
  const fallback = () => { const ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); let r = false; try { r = document.execCommand("copy"); } catch (e) { } ta.remove(); toast(r ? ok : "Selecciona el texto y cópialo con Ctrl+C"); };
  try { navigator.clipboard.writeText(txt).then(() => toast(ok), fallback); } catch (e) { fallback(); }
}
function copyBtn(target, label = "Copiar para Excel") { return `<button class="btn sm" data-copy="${target}">${ICON.copy.replace("<svg", '<svg width="15" height="15"')}${label}</button>`; }

/* preguntas con respuesta del estudiante */
function answerBox(key, ph = "Escribe aquí tu respuesta…") {
  return `<textarea data-ans="${key}" placeholder="${esc(ph)}" aria-label="Respuesta">${esc(Store.get("ans." + key, ""))}</textarea><div class="saved" data-saved="${key}"></div>`;
}
function bindAnswers(root) {
  $$("textarea[data-ans]", root).forEach(t => t.addEventListener("input", () => {
    Store.set("ans." + t.dataset.ans, t.value); const s = $(`[data-saved="${t.dataset.ans}"]`, root); if (s) s.textContent = "Guardado en este navegador";
  }));
}
/* autoevaluación */
function quiz(el, id, items) {
  const st = Store.get("quiz." + id, {});
  el.innerHTML = items.map((it, i) => `<div class="card q" data-i="${i}"><div class="row" style="gap:8px"><span class="qnum">P${i + 1}</span><b style="font-weight:600">${it.q}</b></div>
    <div class="opts">${it.o.map((op, j) => `<button data-j="${j}">${op}</button>`).join("")}</div><div class="fb" aria-live="polite"></div></div>`).join("")
    + `<div class="row"><span class="pill" data-score></span><button class="btn sm" data-reset-quiz>Reiniciar autoevaluación</button></div>`;
  const paint = () => {
    let ok = 0, done = 0;
    items.forEach((it, i) => {
      const card = $(`.q[data-i="${i}"]`, el), a = st[i];
      $$("button", card).forEach(b => { b.classList.remove("right", "wrong"); if (a != null) { if (+b.dataset.j === it.a) b.classList.add("right"); else if (+b.dataset.j === a) b.classList.add("wrong"); } });
      $(".fb", card).innerHTML = a == null ? "" : (a === it.a ? "<b style='color:var(--ok)'>Correcto.</b> " : "<b style='color:var(--bad)'>No es correcto.</b> ") + it.why;
      if (a != null) { done++; if (a === it.a) ok++; }
    });
    const sc = $("[data-score]", el); sc.textContent = `${ok} de ${items.length} correctas` + (done < items.length ? ` · ${items.length - done} sin responder` : "");
    sc.className = "pill " + (done === items.length ? (ok / items.length >= .7 ? "ok" : "warn") : "");
    if (window.MathJax?.typesetPromise) MathJax.typesetPromise([el]).catch(() => { });
  };
  $$(".q", el).forEach(card => $$("button", card).forEach(b => b.onclick = () => { const i = +card.dataset.i; if (st[i] != null) return; st[i] = +b.dataset.j; Store.set("quiz." + id, st); paint(); }));
  $("[data-reset-quiz]", el).onclick = () => { for (const k in st) delete st[k]; Store.set("quiz." + id, st); paint(); };
  paint();
}

/* ==========================================================================
   Motor del cuaderno: BOOK_DATA + goToPage
   ========================================================================== */
/* ---------- identidad gráfica UTP ---------- */
const LOGO_UTP = "img/logo-utp.png";
function roseSVG(cls) {
  const pts = [], tk = [];
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, L = i % 2 ? 62 : 96, w = i % 2 ? 9 : 13;
    const x = Math.sin(a), y = -Math.cos(a), px = Math.cos(a), py = Math.sin(a);
    pts.push(`<path d="M100,100 L${100 + px * w},${100 + py * w} L${100 + x * L},${100 + y * L} Z" fill="currentColor" opacity=".55"/><path d="M100,100 L${100 - px * w},${100 - py * w} L${100 + x * L},${100 + y * L} Z" fill="none" stroke="currentColor" stroke-width=".8"/>`); }
  for (let i = 0; i < 72; i++) { const a = i * Math.PI / 36, r1 = i % 9 ? 84 : 80; tk.push(`<line x1="${100 + r1 * Math.sin(a)}" y1="${100 - r1 * Math.cos(a)}" x2="${100 + 88 * Math.sin(a)}" y2="${100 - 88 * Math.cos(a)}" stroke="currentColor" stroke-width=".7"/>`); }
  return `<svg class="rose ${cls}" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" stroke-width="1.2"/><circle cx="100" cy="100" r="78" fill="none" stroke="currentColor" stroke-width=".6"/><circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" stroke-width=".8" stroke-dasharray="2 3"/>${tk.join("")}${pts.join("")}<circle cx="100" cy="100" r="6" fill="none" stroke="currentColor"/></svg>`;
}
/* defs comunes para las ilustraciones de portada (grabado a color) */
function illDefs() {
  return `<defs>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a4f2a"/><stop offset=".5" stop-color="#6e3a1d"/><stop offset="1" stop-color="#4f2812"/></linearGradient>
  <linearGradient id="woodTop" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9c5c33"/><stop offset=".5" stop-color="#b06c3d"/><stop offset="1" stop-color="#8a4f2a"/></linearGradient>
  <linearGradient id="brass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3d995"/><stop offset=".45" stop-color="#c79a3e"/><stop offset="1" stop-color="#7d5a1c"/></linearGradient>
  <linearGradient id="copper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a3a14"/><stop offset=".35" stop-color="#d98a4e"/><stop offset=".6" stop-color="#f0b07a"/><stop offset="1" stop-color="#8c4519"/></linearGradient>
  <linearGradient id="iron" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8d949c"/><stop offset=".5" stop-color="#5d6570"/><stop offset="1" stop-color="#3a4048"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f1f2" stop-opacity=".75"/><stop offset=".5" stop-color="#bcd3d6" stop-opacity=".35"/><stop offset="1" stop-color="#e8f1f2" stop-opacity=".7"/></linearGradient>
  <linearGradient id="ivory" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf5e3"/><stop offset="1" stop-color="#d9ccaa"/></linearGradient>
  <radialGradient id="dial"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#e7dcc0"/></radialGradient>
  <pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#2b2620" stroke-width=".6" opacity=".35"/></pattern>
  <pattern id="grain" width="60" height="10" patternUnits="userSpaceOnUse"><path d="M0,3 C15,1 30,6 60,3 M0,8 C20,6 40,10 60,7" stroke="#3a1c0b" stroke-width=".6" fill="none" opacity=".35"/></pattern>
  <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,1 L10,5 L0,9 z" fill="#2b2620"/></marker>
  <filter id="drop" x="-10%" y="-10%" width="130%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#3a2a10" flood-opacity=".35"/></filter></defs>`;
}
/* rótulo con línea guía: texto en (tx,ty), flecha hacia (px,py); la línea sale del borde más cercano */
function callout(tx, ty, lines, px, py, anchor = "start") {
  const tl = lines.map((l, i) => `<tspan x="${tx}" dy="${i ? 17 : 0}">${l}</tspan>`).join("");
  const w = Math.max(...lines.map(l => l.length)) * 8.2, x0 = anchor === "end" ? tx - w : anchor === "middle" ? tx - w / 2 : tx, x1 = x0 + w;
  const yTop = ty - 13, yBot = ty + (lines.length - 1) * 17 + 4, yMid = (yTop + yBot) / 2;
  let sx, sy;
  if (py > yBot + 4 && px > x0 - 10 && px < x1 + 10) { sx = clamp(px, x0 + 10, x1 - 10); sy = yBot + 3; }
  else if (py < yTop - 4 && px > x0 - 10 && px < x1 + 10) { sx = clamp(px, x0 + 10, x1 - 10); sy = yTop - 3; }
  else { sx = px < x0 ? x0 - 5 : x1 + 5; sy = yMid; }
  return `<text x="${tx}" y="${ty}" text-anchor="${anchor}" font-size="15">${tl}</text><path class="lead-line" d="M${sx},${sy} L${px},${py}" marker-end="url(#arw)"/>`;
}
function coverHTML() {
  const c = NB.cfg, d = Store.get("cover", {});
  return `<div class="cover">
    <div class="ill" role="img" aria-label="Ilustración del montaje de la práctica">${c.illustration || ""}</div>
    <h1 class="ctitle">Cuaderno interactivo – ${esc(c.practica)}</h1>
    <div class="pills">
      <div class="pillf"><b>Facultad:</b><span>Facultad de Ciencias Básicas</span></div>
      <label class="pillf"><b>Docente:</b><input id="cvDoc" value="${esc(d.docente || "")}" placeholder="Nombre del docente" autocomplete="off"></label>
      <label class="pillf"><b>Estudiante:</b><input id="cvEst" value="${esc(d.estudiante || "")}" placeholder="Nombre del estudiante" autocomplete="off"></label>
    </div>
    <button class="btn pri" data-goto="introduccion">Abrir el cuaderno →</button></div>`;
}
function bindCover(el) {
  const put = (k, v) => { const d = Store.get("cover", {}); d[k] = v; Store.set("cover", d); NB.paintFoot(); };
  $("#cvDoc", el).oninput = e => put("docente", e.target.value);
  $("#cvEst", el).oninput = e => put("estudiante", e.target.value);
}
const NB = {
  cfg: null, cur: 0, leave: [],
  init(cfg) {
    this.cfg = cfg; Store.load(cfg.storeKey);
    const groups = []; cfg.pages.forEach((p, i) => { let g = groups.find(x => x.name === p.group); if (!g) groups.push(g = { name: p.group, items: [] }); g.items.push(i); });
    document.getElementById("app").innerHTML = `<div class="app">
      <aside class="side" id="side" aria-label="Contenido del cuaderno">
        <div class="brand"><span class="uni">Universidad Tecnológica de Pereira</span><span class="course">Laboratorio de Física II</span><span class="badge">Cuaderno interactivo · Práctica ${cfg.numero}</span></div>
        <nav class="nav">${groups.map(g => `<div class="grp">${esc(g.name)}</div>` + g.items.map(i => `<button data-p="${i}"><span class="n">${String(i + 1).padStart(2, "0")}</span><span>${esc(cfg.pages[i].nav)}</span></button>`).join("")).join("")}</nav>
      </aside>
      <div class="main">
        <header class="topbar"><button class="iconbtn menubtn" id="menu" aria-label="Abrir índice">${ICON.menu}</button>
          <div class="ttl" id="ttl"></div><span class="small mono" id="pnum"></span><div class="prog" id="prog"></div></header>
        <div class="shell"><article class="sheet">${roseSVG("tr")}${roseSVG("br")}
          <header class="sheethead"><div class="logos"><img src="${LOGO_UTP}" alt="Universidad Tecnológica de Pereira"><div class="facbox">Facultad de Ciencias Básicas</div></div>
            <div class="asig">Asignatura: Laboratorio de Física II</div><div class="hrule"></div></header>
          <main class="page" id="page" tabindex="-1"></main>
          <footer class="sheetfoot" id="foot"><div class="pillf"><b>Docente:</b><span id="footDoc"></span></div></footer>
        </article></div>
        <div class="pagerwrap"><div class="pager"><button class="btn" id="prev">← Anterior</button><button class="btn pri" id="next">Siguiente →</button></div></div>
      </div></div>`;
    $$(".nav button").forEach(b => b.onclick = () => { this.go(+b.dataset.p); this.drawer(false); });
    $("#prev").onclick = () => this.go(this.cur - 1); $("#next").onclick = () => this.go(this.cur + 1);
    $("#menu").onclick = () => this.drawer(true);
    document.addEventListener("keydown", e => { if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName)) return; if (e.key === "ArrowRight") this.go(this.cur + 1); if (e.key === "ArrowLeft") this.go(this.cur - 1); });
    document.addEventListener("click", e => { const b = e.target.closest("[data-copy]"); if (b) { const t = document.querySelector(b.dataset.copy); if (t) copyTable(t); } const g = e.target.closest("[data-goto]"); if (g) { const i = cfg.pages.findIndex(p => p.id === g.dataset.goto); if (i >= 0) this.go(i); } });
    this.paintFoot();
    const h = location.hash.slice(1); const hi = cfg.pages.findIndex(p => p.id === h);
    this.go(hi >= 0 ? hi : Store.get("_page", 0), true);
  },
  paintFoot() { const d = Store.get("cover", {}); const f = $("#footDoc"); if (f) f.textContent = d.docente || ""; },
  drawer(open) {
    $("#side").classList.toggle("open", open);
    let s = $(".scrim"); if (open && !s) { s = document.createElement("div"); s.className = "scrim"; s.onclick = () => this.drawer(false); document.body.appendChild(s); } if (!open && s) s.remove();
  },
  onLeave(fn) { this.leave.push(fn); },
  raf(fn) { let on = true, id; const loop = t => { if (!on) return; fn(t); id = requestAnimationFrame(loop); }; id = requestAnimationFrame(loop); this.onLeave(() => { on = false; cancelAnimationFrame(id); }); },
  typeset(el) { if (window.MathJax?.typesetPromise) { MathJax.typesetClear?.([el]); return MathJax.typesetPromise([el]).catch(() => { }); } },
  go(i, first = false) {
    const P = this.cfg.pages; i = clamp(i | 0, 0, P.length - 1);
    this.leave.forEach(f => { try { f(); } catch (e) { } }); this.leave = [];
    const el = $("#page"); if (window.MathJax?.typesetClear) MathJax.typesetClear([el]);
    const p = P[i]; this.cur = i; Store.set("_page", i);
    el.innerHTML = (p.eyebrow ? `<div><div class="eyebrow">${p.eyebrow}</div><h1>${p.title}</h1></div>` : "") + (typeof p.html === "function" ? p.html() : p.html);
    try { p.mount && p.mount(el); } catch (e) { console.error(e); }
    bindAnswers(el);
    if (window.MathJax?.startup?.promise) MathJax.startup.promise.then(() => this.typeset(el));
    $$(".nav button").forEach(b => { const k = +b.dataset.p; b.toggleAttribute("aria-current", k === i); if (k === i) b.setAttribute("aria-current", "page"); });
    const vis = Store.get("_visited", {}); vis[i] = 1; Store.set("_visited", vis); $$(".nav button").forEach(b => b.classList.toggle("done", !!vis[b.dataset.p] && +b.dataset.p !== i));
    $("#foot").hidden = !!p.cover;
    $("#ttl").textContent = p.nav; $("#pnum").textContent = `${i + 1}/${P.length}`; $("#prog").style.width = ((i + 1) / P.length * 100) + "%";
    $("#prev").disabled = i === 0; $("#next").disabled = i === P.length - 1;
    $("#next").textContent = i < P.length - 1 ? `${P[i + 1].nav} →` : "Fin del cuaderno";
    try { history.replaceState(null, "", "#" + p.id); } catch (e) { }
    if (!first) { window.scrollTo({ top: 0 }); el.focus({ preventScroll: true }); }
    if (p.cover) bindCover(el);
  }
};

/* ---------- bloques comunes de preguntas, conclusiones e informe ---------- */
function questionsHTML(list) {
  return list.map(([k, q, h], i) => `<div class="card stack"><div class="row" style="gap:8px;align-items:baseline;flex-wrap:nowrap"><span class="qnum">${i + 1}</span><b style="min-width:0">${q}</b></div>${answerBox(k)}${h ? `<details class="hint"><summary>Orientación</summary><p>${h}</p></details>` : ""}</div>`).join("");
}
function conclusionsHTML() {
  return `<div class="card stack"><h3>Escribe 3 conclusiones con respecto a la práctica</h3>
    ${[1, 2, 3].map(i => `<label class="f">Conclusión ${i}${answerBox("c" + i, "Una conclusión respaldada por tus datos…")}</label>`).join("")}</div>
    <h2>Autoevaluación</h2><div id="quiz" class="stack"></div>`;
}
function reportHTML(tablesHTML, qkeys) {
  const a = k => esc(Store.get("ans." + k, "")) || '<span class="small">Sin responder</span>';
  const cv = Store.get("cover", {});
  return `<div class="card stack"><div class="kvr"><span><b>Práctica:</b> ${esc(NB.cfg.practica)}</span><span><b>Docente:</b> ${esc(cv.docente || "—")}</span><span><b>Estudiante:</b> ${esc(cv.estudiante || "—")}</span></div><p class="small">Los nombres se escriben en la portada.</p></div>
    <div class="card stack"><h3>Resumen</h3>${answerBox("resumen", "Resume en un párrafo el objetivo, el método y el resultado principal de la práctica…")}</div>
    <h2>Datos y análisis</h2>${tablesHTML}
    <h2>Preguntas</h2><div class="card stack">${qkeys.map((k, i) => `<p><b class="qnum">${i + 1}.</b> ${a(k)}</p>`).join("")}</div>
    <h2>Conclusiones</h2><div class="card stack">${[1, 2, 3].map(i => `<p><b class="qnum">${i}.</b> ${a("c" + i)}</p>`).join("")}</div>
    <div class="row"><button class="btn pri" id="cpy">Copiar informe como texto</button><span class="small">Pégalo en Word o en la plantilla del informe.</span></div>`;
}
function bindReport(el, title, qkeys) {
  $("#cpy", el).onclick = () => {
    const A = k => Store.get("ans." + k, "");
    const tabs = $$("table.dt", el).map(t => { const cap = $("caption", t); return (cap ? cap.innerText + "\n" : "") + $$("tr", t).map(tr => $$("th,td", tr).map(c => c.innerText.trim()).join("\t")).join("\n"); }).join("\n\n");
    const cv = Store.get("cover", {});
    copyText(`${title}\nLaboratorio de Física II · Universidad Tecnológica de Pereira\nDocente: ${cv.docente || ""}\nEstudiante: ${cv.estudiante || ""}\n\nRESUMEN\n${A("resumen")}\n\n${tabs}\n\nPREGUNTAS\n${qkeys.map((k, i) => `${i + 1}. ${A(k)}`).join("\n")}\n\nCONCLUSIONES\n${[1, 2, 3].map(i => `${i}. ${A("c" + i)}`).join("\n")}`, "Informe copiado");
  };
}
/* tabla editable genérica: rows = arreglo de objetos, cols = [{k, h, d, edit}] */
function editTableHTML({ id, caption, cols, rows }) {
  return tableHTML({
    id, caption, head: cols.map(c => c.h),
    rows: rows.map((r, i) => cols.map(c => {
      const v = typeof c.v === "function" ? c.v(r, i) : r[c.k];
      if (c.edit) return { v: `<input data-r="${i}" data-k="${c.k}" value="${isFinite(v) ? fmt(v, c.d ?? 3) : ""}" inputmode="decimal" aria-label="${esc(c.h)} fila ${i + 1}">` };
      return c.lbl ? { v: v ?? "—", cls: "lbl" } : (typeof v === "number" ? (isFinite(v) ? fmt(v, c.d ?? 3) : "—") : (v ?? "—"));
    }))
  });
}
