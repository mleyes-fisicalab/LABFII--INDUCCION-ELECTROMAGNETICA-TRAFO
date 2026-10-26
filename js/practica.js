/* ==========================================================================
   Cuaderno interactivo · Informe 8 · Inducción electromagnética: transformadores
   ========================================================================== */
const COILS = [200, 400, 600, 800, 1200, 1600];
const CORE = {
  cerrado: { k: 0.975, name: "Núcleo en U con yugo (cerrado)" },
  abierto: { k: 0.42, name: "Núcleo en U sin yugo" },
  aire: { k: 0.035, name: "Sin núcleo (bobinas en aire)" }
};
const TABS = [{ id: "t1", n: 1, Np: 600, Ns: 1200 }, { id: "t2", n: 2, Np: 800, Ns: 200 }];

function sim() { return Object.assign({ V: 6, Np: 600, Ns: 1200, core: "cerrado", ac: true }, Store.get("sim", {})); }
function trafo(s) {
  const Vp = s.V * 0.995;
  if (!s.ac) return { Vp, Vs: 0 };
  const keff = CORE[s.core].k * (1 - 0.012 * (400 / s.Np)) * (s.Ns > s.Np ? 0.985 : 1);
  return { Vp, Vs: keff * s.Ns / s.Np * Vp, keff };
}
const r2 = (v) => v < 2 ? Math.round(v * 1000) / 1000 : Math.round(v * 100) / 100;
function reading(s) { const t = trafo(s); return { Vp: r2(t.Vp * (1 + 0.002 * gauss())), Vs: r2(t.Vs * (1 + 0.003 * gauss())) }; }
function rows(id) { return Store.get("rows." + id, []); }
function tabOf(s) { return TABS.find(t => t.Np === s.Np && t.Ns === s.Ns)?.id || "tx"; }
function fitOf(id) { return linreg(rows(id).map(r => [r.Vs, r.Vp])); }

/* ---------- tablas ---------- */
function dataTableHTML(id, editable = true) {
  const t = TABS.find(x => x.id === id), rs = rows(id);
  const cols = [{ k: "V", h: "V (V)", edit: editable, d: 2 }, { k: "Np", h: "N<sub>p</sub>", d: 0 }, { k: "Ns", h: "N<sub>s</sub>", d: 0 }, { k: "Vp", h: "V<sub>p</sub> (V)", edit: editable, d: 3 }, { k: "Vs", h: "V<sub>s</sub> (V)", edit: editable, d: 3 }];
  const html = editTableHTML({ id: "tab-" + id, caption: t ? `Tabla ${t.n}. Transformador N<sub>p</sub> = ${t.Np}, N<sub>s</sub> = ${t.Ns}` : "Tabla de exploración (otras combinaciones de bobinas)", cols, rows: rs });
  return html;
}
function t4HTML() {
  return tableHTML({ id: "t4", caption: "Tabla 4. Relación de transformación", head: ["Tabla", "N<sub>p</sub>", "N<sub>s</sub>", "a = N<sub>p</sub>/N<sub>s</sub>", "V<sub>p</sub>/V<sub>s</sub> medido (promedio)"],
    rows: TABS.map(t => { const rs = rows(t.id).filter(r => r.Vs > 0); return [t.n, t.Np, t.Ns, fmt(t.Np / t.Ns, 2), rs.length ? fmt(mean(rs.map(r => r.Vp / r.Vs)), 3) : "—"]; }) });
}
function t5HTML() {
  return tableHTML({ id: "t5", caption: "Tabla 5. Ecuaciones de V<sub>p</sub> en función de V<sub>s</sub>", head: ["Tabla", "Ecuación", "R²", "Pendiente vs. N<sub>p</sub>/N<sub>s</sub>"],
    rows: TABS.map(t => { const f = fitOf(t.id); return [t.n, f ? eqStr(f, "·Vs", "Vp", 4) : "—", f ? fmt(f.r2, 4) : "—", f ? `${fmt(Math.abs(f.m - t.Np / t.Ns) / (t.Np / t.Ns) * 100, 2)} %` : "—"]; }) });
}
function t6HTML(editable = true) {
  const sel = Store.get("tipo", {});
  return tableHTML({ id: "t6", caption: "Tabla 6. Tipo de transformador", head: ["Tabla", "Tipo de transformador"],
    rows: TABS.map(t => [t.n, editable ? { v: `<select data-tipo="${t.id}" aria-label="Tipo de transformador de la tabla ${t.n}"><option value="">Selecciona…</option><option ${sel[t.id] === "Elevador" ? "selected" : ""}>Elevador</option><option ${sel[t.id] === "Reductor" ? "selected" : ""}>Reductor</option></select>` } : (sel[t.id] || "—")]) });
}

/* ---------- dibujo ---------- */
function coilSVG(x, N, id) {
  const n = Math.max(4, Math.min(22, Math.round(N / 75))), lines = [];
  for (let i = 0; i < n; i++) { const y = 124 + (i + .5) * (112 / n); lines.push(`<line class="turn" x1="${x + 2}" y1="${y}" x2="${x + 70}" y2="${y}"/>`); }
  return `<g id="${id}"><rect class="coil" x="${x}" y="120" width="72" height="120" rx="6"/>${lines.join("")}</g>`;
}
function stageSVG(s) {
  const yoke = s.core === "cerrado", core = s.core !== "aire";
  return `<svg viewBox="0 0 640 364" role="img" aria-label="Transformador con bobinas primaria y secundaria sobre núcleo de hierro">
  ${core ? `<path class="core" d="M230,90 H270 V270 H370 V90 H410 V310 H230 Z"/>` : ""}
  ${yoke ? `<rect class="core" x="226" y="50" width="188" height="40" rx="3"/>` : ""}
  <path id="flux" class="flux" d="${yoke ? "M250,70 H390 V290 H250 Z" : core ? "M250,112 C250,12 390,12 390,112 V290 H250 Z" : "M250,180 C250,40 390,40 390,180 C390,320 250,320 250,180"}" opacity="${core ? 1 : .5}"/>
  ${coilSVG(214, s.Np, "cp")}${coilSVG(354, s.Ns, "cs")}
  <text x="250" y="332" text-anchor="middle" class="lb">N<tspan dy="4" font-size="10">p</tspan><tspan dy="-4"> = ${s.Np}</tspan></text>
  <text x="390" y="332" text-anchor="middle" class="lb">N<tspan dy="4" font-size="10">s</tspan><tspan dy="-4"> = ${s.Ns}</tspan></text>
  <path class="wire" d="M214,130 H160 V150 M214,230 H160 V210"/><rect class="box" x="40" y="140" width="120" height="80" rx="8"/>
  <text x="100" y="164" text-anchor="middle" class="lb">Fuente ${s.ac ? "CA" : "CC"}</text><text x="100" y="196" text-anchor="middle" style="font-size:18px;fill:var(--gold)">${fmt(s.V, 1)} V</text>
  <path class="wire" d="M190,130 V286 H170 M190,230 H190"/><circle cx="190" cy="130" r="3" fill="var(--fg2)"/><circle cx="190" cy="230" r="3" fill="var(--fg2)"/>
  <rect class="box" x="60" y="262" width="110" height="56" rx="8"/><text x="115" y="282" text-anchor="middle" class="lb">V<tspan dy="4" font-size="10">p</tspan></text><text id="svp" x="115" y="306" text-anchor="middle" style="font-size:15px;fill:var(--gold)"></text>
  <path class="wire" d="M426,130 H520 V146 M426,230 H520 V214"/><rect class="box" x="470" y="146" width="110" height="68" rx="8"/>
  <text x="525" y="170" text-anchor="middle" class="lb">V<tspan dy="4" font-size="10">s</tspan></text><text id="svs" x="525" y="198" text-anchor="middle" style="font-size:15px;fill:var(--acc)"></text>
  <text x="320" y="354" text-anchor="middle" style="font-size:11px;fill:var(--fg3)">${CORE[s.core].name} · línea punteada: flujo magnético</text></svg>`;
}

/* osciloscopio */
function drawScope(cv, s, pulse) {
  const c = cv.getContext("2d"), dpr = devicePixelRatio || 1, W = cv.clientWidth, H = cv.clientHeight;
  if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  c.setTransform(dpr, 0, 0, dpr, 0, 0); c.fillStyle = "#06100c"; c.fillRect(0, 0, W, H);
  c.strokeStyle = "rgba(120,220,170,.13)"; c.lineWidth = 1;
  for (let i = 0; i <= 10; i++) { c.beginPath(); c.moveTo(i * W / 10, 0); c.lineTo(i * W / 10, H); c.stroke(); }
  for (let j = 0; j <= 8; j++) { c.beginPath(); c.moveTo(0, j * H / 8); c.lineTo(W, j * H / 8); c.stroke(); }
  c.strokeStyle = "rgba(120,220,170,.35)"; c.beginPath(); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.stroke();
  const t = trafo(s), divs = [0.2, 0.5, 1, 2, 5, 10, 20, 50], vdiv = pk => divs.find(d => pk <= 3.6 * d) || 50;
  const pkP = t.Vp * Math.SQRT2, pkS = Math.max(t.Vs * Math.SQRT2, s.ac ? 0 : pulse * s.V * s.Ns / s.Np * 0.6);
  const dP = vdiv(pkP), dS = vdiv(Math.max(pkS, 0.05));
  const tr = (col, f, d) => { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= W; x += 1.5) { const tt = x / W * 0.05, y = H / 2 - f(tt) / d * (H / 8); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); };
  if (s.ac) { tr("#f3d58c", tt => pkP * Math.sin(2 * Math.PI * 50 * tt), dP); tr("#5fd4c4", tt => pkS * Math.sin(2 * Math.PI * 50 * tt), dS); }
  else { tr("#f3d58c", () => t.Vp, dP); tr("#5fd4c4", tt => pulse * pkS * Math.exp(-Math.max(0, tt - 0.01) * 300) * (tt >= 0.01 ? 1 : 0), dS); }
  return { dP, dS };
}

/* ---------- páginas ---------- */
const PAGES = [
{
  id: "portada", cover: true, group: "Inicio", nav: "Portada", html: () => coverHTML()
},
{
  id: "introduccion", group: "Inicio", nav: "Objetivos y materiales",
  eyebrow: "Introducción", title: "Objetivos, materiales y ruta de trabajo",
  html: () => `<div class="grid2"><div class="card"><h3>Objetivos</h3><ul class="clean">
    <li>Montar transformadores con bobinas de distinto número de vueltas sobre un núcleo en U.</li>
    <li>Medir el voltaje del primario y del secundario para varios voltajes de la fuente.</li>
    <li>Calcular la relación de transformación y compararla con la pendiente de la gráfica V<sub>p</sub> contra V<sub>s</sub>.</li>
    <li>Clasificar cada transformador como elevador o reductor.</li></ul></div>
  <div class="card"><h3>Materiales</h3><ul class="clean"><li>Fuente de corriente alterna regulable</li><li>Núcleo de hierro en U con yugo</li>
    <li>Bobinas de 200, 400, 600, 800, 1 200 y 1 600 vueltas</li><li>Dos voltímetros de CA (multímetro y medidor analógico)</li><li>Cables de conexión</li></ul></div></div>
  <div class="stack"><h2>Ruta del cuaderno</h2><div class="steps">
    <div><b>Marco teórico</b><br><span class="small">Ley de Faraday, transformador ideal y real.</span></div>
    <div><b>Datos experimentales</b><br><span class="small">Tablas 1 y 2 con el transformador virtual.</span></div>
    <div><b>Análisis</b><br><span class="small">Tablas 4 y 5, gráfica V<sub>p</sub> = f(V<sub>s</sub>).</span></div>
    <div><b>Preguntas y conclusiones</b><br><span class="small">Tabla 6, respuestas e informe final.</span></div></div></div>
  <div class="callout acc"><b>Tus datos se quedan en este navegador.</b> Si trabajas con el montaje real, escribe tus mediciones en las Tablas 1 y 2: el análisis se recalcula solo.</div>`
},
{
  id: "teoria", group: "Marco teórico", nav: "Ley de Faraday y transformador ideal",
  eyebrow: "1 · Marco teórico", title: "Ley de Faraday y transformador ideal",
  html: () => `
  <p class="lead">Un transformador no crea energía: transfiere potencia de un circuito a otro a través de un flujo magnético que cambia con el tiempo.</p>
  <div class="grid2">
    <div class="card stack"><h3>Ley de Faraday</h3><p>La fem inducida en una bobina de N vueltas es proporcional a la rapidez de cambio del flujo magnético que la atraviesa:</p>
      <div class="eq">$$\\varepsilon=-N\\,\\frac{d\\Phi_B}{dt}$$</div><p>El signo menos expresa la ley de Lenz: la fem inducida se opone al cambio que la produce.</p></div>
    <div class="card stack"><h3>Mismo flujo en las dos bobinas</h3><p>Si el núcleo guía todo el flujo, cada vuelta del primario y del secundario ve el mismo $\\Phi_B(t)$:</p>
      <div class="eq">$$V_p=N_p\\frac{d\\Phi_B}{dt},\\qquad V_s=N_s\\frac{d\\Phi_B}{dt}\\quad\\Longrightarrow\\quad \\frac{V_p}{V_s}=\\frac{N_p}{N_s}=a$$</div>
      <p>$a$ es la <b>relación de transformación</b>.</p></div>
  </div>
  <div class="grid3">
    <div class="card"><h3>Elevador</h3><p>$N_s > N_p$, $a<1$: el voltaje del secundario es mayor que el del primario.</p></div>
    <div class="card"><h3>Reductor</h3><p>$N_s < N_p$, $a>1$: el voltaje del secundario es menor.</p></div>
    <div class="card"><h3>Potencia</h3><p>En el caso ideal $V_pI_p = V_sI_s$: si el voltaje sube, la corriente baja en la misma proporción.</p></div>
  </div>
  <div class="callout"><b>Con corriente continua no hay transformación.</b> Un flujo constante tiene $d\\Phi_B/dt=0$. Solo al conectar o desconectar aparece un pulso breve en el secundario.</div>`
},
{
  id: "real", group: "Marco teórico", nav: "Transformador real",
  eyebrow: "1 · Marco teórico", title: "Del transformador ideal al real",
  html: () => `
  <p class="lead">En el laboratorio la relación $V_p/V_s$ no coincide exactamente con $N_p/N_s$. Estas son las causas principales.</p>
  <div class="grid2">
    <div class="card stack"><h3>Flujo de dispersión</h3><p>Parte del flujo del primario se cierra por el aire y no atraviesa el secundario. Sin el yugo que cierra el núcleo, esa fracción es grande y el voltaje del secundario cae mucho.</p></div>
    <div class="card stack"><h3>Pérdidas en el cobre</h3><p>Los alambres de las bobinas tienen resistencia. La corriente del primario produce una caída $I_pR_p$ que reduce el voltaje disponible para crear flujo.</p></div>
    <div class="card stack"><h3>Pérdidas en el núcleo</h3><p>Corrientes de Foucault y ciclos de histéresis calientan el hierro. Por eso el núcleo es laminado: las láminas aisladas cortan los caminos de las corrientes parásitas.</p></div>
    <div class="card stack"><h3>Factor de acoplamiento</h3><p>Una forma simple de resumir todo es $V_s = k\\,\\dfrac{N_s}{N_p}V_p$, con $0<k\\le 1$. En el laboratorio virtual puedes ver cómo cambia k con el tipo de núcleo.</p></div>
  </div>
  ${tableHTML({ caption: "Acoplamiento aproximado del montaje virtual", head: ["Configuración del núcleo", "k aproximado", "V<sub>s</sub> con 600 → 1 200 y V<sub>p</sub> = 6 V"], rows: Object.entries(CORE).map(([k, c]) => [{ v: c.name, cls: "lbl" }, fmt(trafo({ V: 6, Np: 600, Ns: 1200, core: k, ac: true }).keff, 2), fmt(trafo({ V: 6 / .995, Np: 600, Ns: 1200, core: k, ac: true }).Vs, 2) + " V"]) })}`
},
{
  id: "laboratorio", group: "Datos experimentales", nav: "Laboratorio virtual",
  eyebrow: "2 · Datos experimentales", title: "Montaje de la Figura 1 y toma de datos",
  html: () => `<p class="lead">Escoge las bobinas de la Tabla 1 o de la Tabla 2, ajusta el voltaje de la fuente y registra V<sub>p</sub> y V<sub>s</sub>. Toma al menos cinco voltajes distintos para cada transformador.</p>
  <div class="bench"><div class="stage" id="stage"></div>
    <div class="ctrls">
      <div class="card tight stack"><div class="meterlbl">Montaje</div><div class="row"><button class="btn sm" data-pre="t1">Tabla 1 · 600 → 1 200</button><button class="btn sm" data-pre="t2">Tabla 2 · 800 → 200</button></div>
        <div class="coilsel"><label class="f"><span>N<sub>p</sub> (primario)</span><select id="np">${COILS.map(n => `<option>${n}</option>`).join("")}</select></label>
        <label class="f"><span>N<sub>s</sub> (secundario)</span><select id="ns">${COILS.map(n => `<option>${n}</option>`).join("")}</select></label></div>
        <label class="f">Núcleo<select id="core">${Object.entries(CORE).map(([k, c]) => `<option value="${k}">${c.name}</option>`).join("")}</select></label></div>
      <div class="card tight stack"><div class="row" style="justify-content:space-between"><div class="meterlbl" style="margin:0">Fuente</div><div class="seg" id="acdc"><button data-ac="1">CA</button><button data-ac="0">CC</button></div></div>
        <label class="f"><span>Voltaje de la fuente: <b class="mono" id="vval"></b></span><input type="range" id="vr" min="0" max="12" step="0.5"></label></div>
    </div></div>
  <div class="grid2">
    <div class="card tight stack"><div class="grid2" style="gap:10px"><div><div class="meterlbl">Voltímetro primario</div><div class="meter" id="mvp"></div></div>
      <div><div class="meterlbl">Voltímetro secundario</div><div class="meter" id="mvs"></div></div></div>
      <button class="btn pri" id="rec">Registrar medición</button><p class="small" id="dest"></p></div>
    <div class="stack"><div class="scope"><canvas id="sc"></canvas><div class="lbls"><span id="ch1"></span><span>5 ms/div</span><span id="ch2"></span></div></div>
      <button class="btn sm" id="pulse" hidden>Conectar y desconectar la fuente CC</button></div>
  </div>
  <div class="stack"><div class="row" style="justify-content:space-between"><h2>Tablas 1 y 2</h2><div class="row">${copyBtn("#tab-t1", "Copiar Tabla 1")}${copyBtn("#tab-t2", "Copiar Tabla 2")}</div></div><div id="tabs"></div></div>`,
  mount(el) {
    let s = sim(), pulse = 0;
    const tables = () => {
      $("#tabs", el).innerHTML = ["t1", "t2", ...(rows("tx").length ? ["tx"] : [])].map(id => dataTableHTML(id)).join("");
      $$("#tabs table", el).forEach(tb => {
        const id = tb.id.replace("tab-", "");
        $$("tbody tr", tb).forEach((tr, i) => { if (!rows(id)[i]) return; const td = document.createElement("td"); td.innerHTML = `<button class="del" aria-label="Borrar fila ${i + 1}">✕</button>`; tr.appendChild(td); $("button", td).onclick = () => { const r = rows(id); r.splice(i, 1); Store.set("rows." + id, r); tables(); }; });
        const th = document.createElement("th"); $("thead tr", tb).appendChild(th);
        $$("input", tb).forEach(inp => inp.onchange = () => { const r = rows(id), v = num(inp.value); if (isFinite(v)) { r[+inp.dataset.r][inp.dataset.k] = v; Store.set("rows." + id, r); } tables(); });
      });
    };
    const paint = () => {
      Store.set("sim", s); const t = trafo(s);
      $("#stage", el).innerHTML = stageSVG(s);
      $("#np", el).value = s.Np; $("#ns", el).value = s.Ns; $("#core", el).value = s.core; $("#vr", el).value = s.V; $("#vval", el).textContent = fmt(s.V, 1) + " V";
      $$("#acdc button", el).forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.ac === +s.ac)));
      const mv = v => (v < 2 ? fmt(v, 3) : fmt(v, 2)) + `<small>V${s.ac ? "~" : ""}</small>`;
      $("#mvp", el).innerHTML = mv(t.Vp); $("#mvs", el).innerHTML = mv(t.Vs);
      $("#svp", el).textContent = fmt(t.Vp, 2) + " V"; $("#svs", el).textContent = fmt(t.Vs, 2) + " V";
      const dst = tabOf(s); $("#dest", el).innerHTML = dst === "tx" ? "Esta combinación no es la de la Tabla 1 ni la de la Tabla 2: la medición irá a una tabla de exploración." : `La medición irá a la <b>Tabla ${dst === "t1" ? 1 : 2}</b>.`;
      $("#pulse", el).hidden = !!s.ac;
    };
    $$("[data-pre]", el).forEach(b => b.onclick = () => { const t = TABS.find(x => x.id === b.dataset.pre); s.Np = t.Np; s.Ns = t.Ns; s.core = "cerrado"; s.ac = true; paint(); });
    $("#np", el).onchange = e => { s.Np = +e.target.value; paint(); }; $("#ns", el).onchange = e => { s.Ns = +e.target.value; paint(); };
    $("#core", el).onchange = e => { s.core = e.target.value; paint(); };
    $("#vr", el).oninput = e => { s.V = +e.target.value; paint(); };
    $$("#acdc button", el).forEach(b => b.onclick = () => { s.ac = b.dataset.ac === "1"; if (!s.ac) pulse = 1; paint(); });
    $("#pulse", el).onclick = () => { pulse = 1; };
    $("#rec", el).onclick = () => {
      if (!s.V) { toast("Sube el voltaje de la fuente antes de medir"); return; }
      if (!s.ac) toast("Con corriente continua el secundario marca cero. Registrado igual.");
      const r = reading(s), id = tabOf(s), rs = rows(id); rs.push({ V: s.V, Np: s.Np, Ns: s.Ns, Vp: r.Vp, Vs: r.Vs }); Store.set("rows." + id, rs); tables();
      if (s.ac) toast(`Registrado en ${id === "tx" ? "la tabla de exploración" : "la Tabla " + (id === "t1" ? 1 : 2)}`);
    };
    paint(); tables();
    const cv = $("#sc", el); let ph = 0, last = performance.now();
    NB.raf(tm => {
      const dt = Math.min(.05, (tm - last) / 1000); last = tm; pulse *= Math.exp(-dt * 2.2);
      const d = drawScope(cv, s, pulse);
      $("#ch1", el).textContent = `CH1 Vₚ · ${fmt(d.dP, d.dP < 1 ? 1 : 0)} V/div`; $("#ch2", el).textContent = `CH2 Vₛ · ${fmt(d.dS, d.dS < 1 ? 1 : 0)} V/div`;
      const fx = $("#flux", el); if (fx) { const amp = s.ac ? s.V / 12 : pulse; ph += dt * 2 * Math.PI * 0.8; fx.style.strokeDashoffset = (Math.sin(ph) * 60 * amp).toFixed(1); fx.style.opacity = s.V ? (0.25 + 0.75 * Math.min(1, amp * 1.4)) * (s.core === "aire" ? .5 : 1) : 0; }
    });
  }
},
{
  id: "analisis", group: "Análisis", nav: "Relación de transformación y gráficas",
  eyebrow: "3 · Análisis", title: "Relación de transformación y gráficas",
  html: () => `
  <div class="stack"><div class="row" style="justify-content:space-between"><h2>Tabla 4</h2>${copyBtn("#t4")}</div>${t4HTML()}</div>
  <div class="card stack"><h3>Voltaje del primario en función del voltaje del secundario</h3><div id="pl"></div></div>
  <div class="stack"><div class="row" style="justify-content:space-between"><h2>Tabla 5</h2>${copyBtn("#t5")}</div>${t5HTML()}
    <p class="small">La última columna compara la pendiente obtenida con la relación de transformación N<sub>p</sub>/N<sub>s</sub>.</p></div>`,
  mount(el) {
    const P = new CartesianPlane($("#pl", el), { id: "vpvs", height: 400, xLabel: "Vₛ (V)", yLabel: "Vₚ (V)" });
    const ser = [];
    TABS.forEach((t, i) => { const rs = rows(t.id), f = fitOf(t.id);
      ser.push({ id: "p" + t.id, type: "points", data: rs.map(r => [r.Vs, r.Vp]), label: `Tabla ${t.n} (${t.Np} → ${t.Ns})`, color: i ? "--c2" : "--c1", fmtX: v => fmt(v, 3) + " V", fmtY: v => fmt(v, 3) + " V" });
      if (f) ser.push({ id: "f" + t.id, type: "fn", f: x => f.m * x + f.b, label: `Ajuste Tabla ${t.n}`, color: i ? "--c2" : "--c1", width: 1.5, noLegend: true }); });
    P.setSeries(ser, true); if (!ser.some(s => s.data?.length)) P.setView({ xmin: -1, xmax: 24, ymin: -1, ymax: 13 });
  }
},
{
  id: "preguntas", group: "Preguntas", nav: "Preguntas y Tabla 6",
  eyebrow: "4 · Preguntas", title: "Preguntas",
  html: () => questionsHTML([
    ["p1", "Explique cómo es la relación entre el Voltaje del Primario y el Voltaje del Secundario.", "Observa tus gráficas: si los puntos forman una recta que pasa cerca del origen, la relación es de proporcionalidad directa. Relaciónalo con $V_p/V_s = N_p/N_s$ y con el hecho de que el mismo flujo atraviesa las dos bobinas."],
    ["p2", "Explique qué representa la pendiente de las rectas obtenidas en el Análisis.", "Como graficaste V<sub>p</sub> en función de V<sub>s</sub>, la pendiente corresponde a la relación de transformación $a = N_p/N_s$. Compara su valor con la Tabla 4 y explica la diferencia con las pérdidas del transformador real."]]) +
    `<div class="card stack"><div class="row" style="gap:8px;align-items:baseline"><span class="qnum">3</span><b>De acuerdo con los datos obtenidos, determine el tipo de transformador (elevador o reductor) utilizado en cada uno de los casos y complete la Tabla 6.</b></div>
    <div id="t6w">${t6HTML()}</div><div id="t6fb" class="small"></div>${answerBox("p3", "Justifica tu respuesta con los datos…")}</div>`,
  mount(el) {
    const fb = () => { const sel = Store.get("tipo", {}); const ok = { t1: "Elevador", t2: "Reductor" }; const done = TABS.filter(t => sel[t.id]); $("#t6fb", el).innerHTML = done.length ? done.map(t => `Tabla ${t.n}: ${sel[t.id] === ok[t.id] ? '<span class="pill ok">correcto</span>' : '<span class="pill bad">revisa: compara N<sub>s</sub> con N<sub>p</sub></span>'}`).join(" · ") : ""; };
    $$("[data-tipo]", el).forEach(sl => sl.onchange = () => { const t = Store.get("tipo", {}); t[sl.dataset.tipo] = sl.value; Store.set("tipo", t); fb(); }); fb();
  }
},
{ id: "conclusiones", group: "Conclusiones", nav: "Conclusiones y autoevaluación", eyebrow: "5 · Conclusiones", title: "Conclusiones y autoevaluación",
  html: conclusionsHTML,
  mount(el) {
    quiz($("#quiz", el), "q8", [
      { q: "Un transformador con N<sub>p</sub> = 800 y N<sub>s</sub> = 200 se conecta a 12 V de CA. En el caso ideal, V<sub>s</sub> vale:", o: ["48 V", "3 V", "12 V", "0,75 V"], a: 1, why: "$V_s = V_p N_s/N_p = 12 \\times 200/800 = 3$ V." },
      { q: "Si se conecta el primario a una fuente de corriente continua, el voltaje en el secundario es:", o: ["Igual al del primario", "Proporcional a N<sub>s</sub>/N<sub>p</sub>", "Cero, salvo un pulso al conectar o desconectar", "Mayor que el del primario"], a: 2, why: "Un flujo constante no induce fem: $d\\Phi_B/dt = 0$." },
      { q: "Al retirar el yugo del núcleo en U, el voltaje del secundario:", o: ["Aumenta", "Disminuye mucho", "No cambia", "Se invierte"], a: 1, why: "Sin el yugo el circuito magnético queda abierto y gran parte del flujo se dispersa por el aire." },
      { q: "En un transformador elevador ideal, la corriente del secundario es:", o: ["Mayor que la del primario", "Igual a la del primario", "Menor que la del primario", "Cero"], a: 2, why: "Con $V_pI_p = V_sI_s$, si $V_s > V_p$ entonces $I_s < I_p$." },
      { q: "¿Por qué el núcleo de un transformador se fabrica con láminas aisladas?", o: ["Para aumentar el flujo de dispersión", "Para reducir las corrientes de Foucault", "Para que el núcleo pese menos", "Para aumentar la resistencia de las bobinas"], a: 1, why: "Las láminas cortan los lazos por donde circularían las corrientes parásitas y reducen el calentamiento del núcleo." }]);
  } },
{ id: "informe", group: "Cierre", nav: "Mi informe", eyebrow: "Cierre", title: "Mi informe",
  html: () => reportHTML(dataTableHTML("t1", false).replace(/<input[^>]*value="([^"]*)"[^>]*>/g, "$1") + dataTableHTML("t2", false).replace(/<input[^>]*value="([^"]*)"[^>]*>/g, "$1") + t4HTML() + t5HTML() + t6HTML(false), ["p1", "p2", "p3"]),
  mount(el) { bindReport(el, "INFORME 8 · INDUCCIÓN ELECTROMAGNÉTICA: FUNCIONAMIENTO DE TRANSFORMADORES", ["p1", "p2", "p3"]); } }
];
NB.init({ storeKey: "utp-lab2-transformadores", numero: 8, practica: "Inducción electromagnética: funcionamiento de transformadores", illustration: illTransformador(), pages: PAGES });
