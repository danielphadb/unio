/* immoviz Studio: Kamera-Editor und Licht-Editor. Schreiben nur einzelne Einträge unter cameras bzw. lights in project.yaml. */
const SENSOR_MM = 36;
const fovDeg = lens => 2 * Math.atan(SENSOR_MM / (2 * lens)) * 180 / Math.PI;
const fmtNum = (v, d = 1) => Number(v).toLocaleString("de-AT", { minimumFractionDigits: d, maximumFractionDigits: d });
const planCache = {};
async function loadPlan(slug) {
  if (!planCache[slug]) planCache[slug] = await api(`/api/projects/${slug}/lageplan`).catch(e => ({ fehler: e.message }));
  return planCache[slug];
}
/* Lokales System: x nach rechts, y nach oben. SVG: y nach unten, daher -y. */
const svgPts = poly => poly.map(([x, y]) => `${+x.toFixed(2)},${+(-y).toFixed(2)}`).join(" ");

function planLayers(plan, filter) {
  const keep = filter || (() => true);
  return `<g class="pl-geh">${plan.gehsteige.filter(keep).map(p => `<polygon points="${svgPts(p)}"/>`).join("")}</g>
    <g class="pl-bau">${plan.gebaeude.filter(keep).map(p => `<polygon points="${svgPts(p)}"/>`).join("")}</g>
    <g class="pl-hero">${plan.hero.map(p => `<polygon points="${svgPts(p)}"/>`).join("")}</g>`;
}

function heroCenter(plan) {
  const pts = (plan.hero || []).flat();
  if (!pts.length) return [0, 0];
  const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
}

/* Nordpfeil: Norden liegt im lokalen System bei (sin r, cos r), r = x_axis_deg */
function northArrow(plan, x, y, s) {
  const r = (plan.x_axis_deg || 0) * Math.PI / 180, nx = Math.sin(r), ny = Math.cos(r);
  const tip = [x + nx * s, y + ny * s], tail = [x - nx * s * 0.6, y - ny * s * 0.6];
  const px = -ny * s * 0.28, py = nx * s * 0.28;
  return `<g class="pl-north"><polygon points="${svgPts([tip, [tail[0] + px, tail[1] + py], [x, y], [tail[0] - px, tail[1] - py]])}"/>
    <text x="${tip[0] + nx * s * 0.45}" y="${-(tip[1] + ny * s * 0.45)}" font-size="${s * 0.55}" text-anchor="middle" dominant-baseline="middle">N</text></g>`;
}

function svgPoint(svg, ev) {
  const pt = svg.createSVGPoint();
  pt.x = ev.clientX; pt.y = ev.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  return [p.x, -p.y];
}

/* ------------------------------------------------------------ Kamera-Editor */
const ZOOMS = [["70", "Nah"], ["140", "Mittel"], ["260", "Weit"]];

async function viewKameras(slug) {
  renderNav(slug, "kameras");
  document.title = "Kameras · immoviz Studio";
  let [d, plan] = await Promise.all([api(`/api/projects/${slug}/kameras`), loadPlan(slug)]);
  const hasPlan = !plan.fehler;
  let cams = d.kameras;
  let cur = null, dirty = false, step = "pos";
  const hc = hasPlan ? heroCenter(plan) : [0, 0];
  const allPts = [hc, ...cams.map(c => c.pos)];
  const center = [(Math.min(...allPts.map(p => p[0])) + Math.max(...allPts.map(p => p[0]))) / 2,
    (Math.min(...allPts.map(p => p[1])) + Math.max(...allPts.map(p => p[1]))) / 2];
  const want = new URLSearchParams(location.hash.split("?")[1] || "").get("k");

  view.innerHTML = `<section>${sechead("01", "Kameras", "Kamera-Editor", `${cams.length} Motive aus <span class="mono">project.yaml</span>. Klick in den Plan setzt die Position, der zweite Klick das Ziel. Höhe und Brennweite in den Feldern. Speichern ändert nur diesen Eintrag, vorher wird eine Sicherung angelegt.`,
      `<button type="button" id="newcam" class="primary">Neue Kamera</button><a class="btn" href="#/p/${esc(slug)}/shotlist">Zur Shotlist</a>`)}
    <div class="editor">
      <div class="planbox">
        <div class="plantools">
          <div class="seg" role="group" aria-label="Klick setzt">${[["pos", "Position"], ["target", "Ziel"]].map(([k, l]) => `<button type="button" data-step="${k}" aria-pressed="${k === step}">Klick: ${l}</button>`).join("")}</div>
          <div class="seg" role="group" aria-label="Ausschnitt">${ZOOMS.map(([k, l]) => `<button type="button" data-zoom="${k}" aria-pressed="${k === getPref("immoviz-zoom", "140")}">${l}</button>`).join("")}</div>
        </div>
        <div class="plan">${hasPlan ? `<svg id="plan" role="img" aria-label="Lageplan mit Kameras"></svg>`
          : `<div class="empty-state" style="padding:var(--sp-5)"><span class="label">Kein Lageplan</span><p class="muted">${esc(plan.fehler)}</p></div>`}</div>
        <div class="legend label"><span><i class="sw hero"></i>Objekt</span><span><i class="sw bau"></i>Gebäude</span><span><i class="sw geh"></i>Gehsteig</span><span><i class="sw cam"></i>Kamera mit Blickkegel (Sensor 36 mm)</span></div>
      </div>
      <div class="side">
        <form id="camform" class="edform" autocomplete="off" hidden></form>
        <ul class="rows camlist" id="camlist"></ul>
      </div>
    </div></section>`;

  const svg = $("#plan");
  const zoomW = () => +getPref("immoviz-zoom", "140");
  const unit = () => zoomW() / 140;

  function drawBase() {
    if (!svg) return;
    const W = zoomW(), H = W * 0.75;
    svg.setAttribute("viewBox", `${center[0] - W / 2} ${-center[1] - H / 2} ${W} ${H}`);
    const u = unit();
    svg.innerHTML = `<rect class="pl-bg" x="${center[0] - W}" y="${-center[1] - H}" width="${W * 2}" height="${H * 2}"/>
      ${planLayers(plan)}${northArrow(plan, center[0] + W / 2 - 7 * u, center[1] + H / 2 - 9 * u, 4.5 * u)}
      <g class="pl-scale" transform="translate(${center[0] - W / 2 + 5 * u},${-center[1] + H / 2 - 5 * u})"><line x1="0" y1="0" x2="${10 * Math.round(W / 70)}" y2="0"/><text x="0" y="${-1.6 * u}" font-size="${2.6 * u}">${10 * Math.round(W / 70)} m</text></g>
      <g id="dyn"></g>`;
    drawCams();
  }

  function camShape(c, sel) {
    const u = unit();
    const [px, py] = c.pos, [tx, ty] = c.target;
    const dist = Math.hypot(tx - px, ty - py);
    const half = fovDeg(c.lens || 24) / 2 * Math.PI / 180;
    const L = Math.min(Math.max(dist, 6 * u), 34 * u);
    const a0 = Math.atan2(ty - py, tx - px);
    const arc = [[px, py]];
    for (let i = 0; i <= 14; i++) { const a = a0 - half + 2 * half * i / 14; arc.push([px + L * Math.cos(a), py + L * Math.sin(a)]); }
    const lbl = c.key || c.name || "neu";
    return `<g class="cam${sel ? " sel" : ""}" ${sel ? "" : `data-cam="${esc(c.key)}"`}><title>${esc(lbl)} · ${esc(c.lens)} mm</title>
      ${dist > 0.01 ? `<polygon class="cone" points="${svgPts(arc)}"/>` : ""}
      ${sel ? `<line class="aim" x1="${px}" y1="${-py}" x2="${tx}" y2="${-ty}"/>
        <g class="tgt"><circle cx="${tx}" cy="${-ty}" r="${1.4 * u}"/><line x1="${tx - 2.2 * u}" y1="${-ty}" x2="${tx + 2.2 * u}" y2="${-ty}"/><line x1="${tx}" y1="${-ty - 2.2 * u}" x2="${tx}" y2="${-ty + 2.2 * u}"/></g>` : ""}
      <circle class="dot" cx="${px}" cy="${-py}" r="${(sel ? 1.5 : 1.05) * u}"/>
      ${sel ? `<text x="${px + 2.4 * u}" y="${-py + 2.4 * u}" font-size="${2.8 * u}">${esc(lbl)}</text>` : ""}</g>`;
  }

  function drawCams() {
    const g = $("#dyn");
    if (!g) return;
    const others = cams.filter(c => !cur || c.key !== cur.key);
    g.innerHTML = others.map(c => camShape(c, false)).join("") + (cur ? camShape(cur, true) : "");
    $$("[data-cam]", g).forEach(el => el.addEventListener("click", ev => { ev.stopPropagation(); select(el.dataset.cam); }));
  }

  function drawList() {
    $("#camlist").innerHTML = cams.map((c, i) => `<li class="${cur && cur.key === c.key ? "sel" : ""}"><span class="n">${pad(i + 1)}</span>
      <span class="main"><b>${esc(c.key)}</b><span class="mono muted">${esc(c.lens)} mm · Höhe ${fmtNum(c.pos[2], 2)} m${c.vertical === false ? "" : " · vertikal"}</span></span>
      <button type="button" class="small aside" data-edit="${esc(c.key)}" ${cur && cur.key === c.key ? 'aria-current="true"' : ""}>${cur && cur.key === c.key ? "Ausgewählt" : "Bearbeiten"}</button></li>`).join("")
      || `<li><span class="n">00</span><span class="main muted">Noch keine Kameras.</span></li>`;
    $$("[data-edit]").forEach(b => b.addEventListener("click", () => select(b.dataset.edit)));
  }

  const num = (n, v, step = "0.01") => `<input class="field" type="number" step="${step}" name="${n}" value="${esc(v)}" inputmode="decimal" aria-label="${esc(n)}">`;
  function drawForm() {
    const f = $("#camform");
    if (!cur) { f.hidden = true; return; }
    f.hidden = false;
    f.innerHTML = `<div class="edhead"><span class="label">${cur.key ? "Kamera bearbeiten" : "Neue Kamera"}</span><span id="dirty" class="tag warn" ${dirty ? "" : "hidden"}>ungespeichert</span></div>
      <label class="fl"><span class="label">Name</span><input class="field" type="text" name="name" value="${esc(cur.name)}" pattern="[a-z0-9_]+" maxlength="40" required placeholder="z. B. hof_blick" aria-describedby="namehint"><small id="namehint" class="muted">nur a bis z, 0 bis 9 und _</small></label>
      <fieldset class="fl"><legend class="label">Position x · y · z (m)</legend><div class="trip">${num("px", cur.pos[0])}${num("py", cur.pos[1])}${num("pz", cur.pos[2])}</div></fieldset>
      <fieldset class="fl"><legend class="label">Ziel x · y · z (m)</legend><div class="trip">${num("tx", cur.target[0])}${num("ty", cur.target[1])}${num("tz", cur.target[2])}</div></fieldset>
      <div class="duo"><label class="fl"><span class="label">Brennweite (mm)</span>${num("lens", cur.lens, "1")}</label>
        <label class="check"><input type="checkbox" name="vertical" ${cur.vertical !== false ? "checked" : ""}> Senkrechte gerade (vertical)</label></div>
      <p class="mono muted" id="caminfo"></p>
      <div class="acts"><button type="submit" class="primary">${cur.key ? "Speichern" : "Anlegen"}</button>
        <button type="button" data-reset>Verwerfen</button>${cur.key ? `<button type="button" class="ghost danger" data-del>Löschen</button>` : ""}</div>`;
    info();
    f.oninput = () => { readForm(); setDirty(true); drawCams(); info(); };
    f.onsubmit = save;
    $("[data-reset]", f).addEventListener("click", () => { if (cur.key) { dirty = false; select(cur.key, true); } else { cur = null; dirty = false; drawForm(); drawCams(); } });
    $("[data-del]", f)?.addEventListener("click", del);
  }

  function info() {
    const el = $("#caminfo");
    if (!el || !cur) return;
    const dx = cur.target[0] - cur.pos[0], dy = cur.target[1] - cur.pos[1], dz = cur.target[2] - cur.pos[2];
    const dist = Math.hypot(dx, dy), tilt = Math.atan2(dz, dist) * 180 / Math.PI;
    el.textContent = `Öffnungswinkel ${fmtNum(fovDeg(cur.lens || 24))}° · Abstand ${fmtNum(Math.hypot(dist, dz))} m · Neigung ${tilt >= 0 ? "+" : ""}${fmtNum(tilt)}°`;
  }

  function readForm() {
    const f = new FormData($("#camform"));
    const n = k => { const v = parseFloat(String(f.get(k)).replace(",", ".")); return Number.isFinite(v) ? v : 0; };
    cur.name = String(f.get("name") || "").trim();
    cur.pos = [n("px"), n("py"), n("pz")];
    cur.target = [n("tx"), n("ty"), n("tz")];
    cur.lens = n("lens") || 24;
    cur.vertical = !!f.get("vertical");
  }

  function setDirty(v) { dirty = v; const t = $("#dirty"); if (t) t.hidden = !v; }

  function setStep(s) { step = s; $$("[data-step]").forEach(b => b.setAttribute("aria-pressed", b.dataset.step === s)); }

  function select(key, force) {
    if (dirty && !force && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const c = cams.find(x => x.key === key);
    if (!c) return;
    cur = { key: c.key, name: c.key, pos: [...c.pos], target: [...c.target], lens: c.lens, vertical: c.vertical !== false };
    dirty = false; setStep("pos");
    drawForm(); drawList(); drawCams();
    if (matchMedia("(max-width:1000px)").matches) $("#camform").scrollIntoView({ block: "nearest" });
  }

  function newCam() {
    if (dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    cur = { key: null, name: "", pos: [+(hc[0] - 20).toFixed(1), +(hc[1] - 20).toFixed(1), 1.65], target: [+hc[0].toFixed(1), +hc[1].toFixed(1), 10.0], lens: 24, vertical: true };
    dirty = true; setStep("pos");
    drawForm(); drawList(); drawCams();
    $('#camform [name="name"]').focus();
    toast("Name eingeben, dann in den Plan klicken: erst Position, dann Ziel");
  }

  async function save(e) {
    e.preventDefault();
    readForm();
    if (!/^[a-z0-9_]{1,40}$/.test(cur.name)) { toast("Name: nur a bis z, 0 bis 9 und _"); return; }
    const body = { name: cur.name, pos: cur.pos, target: cur.target, lens: cur.lens, vertical: cur.vertical };
    try {
      const r = cur.key ? await api(`/api/projects/${slug}/kameras/${encodeURIComponent(cur.key)}`, { method: "PUT", body })
        : await api(`/api/projects/${slug}/kameras`, { method: "POST", body });
      cams = r.kameras; toast("Gespeichert, Sicherung in .history angelegt");
      select(cur.name, true);
    } catch (err) { toast(err.message); }
  }

  async function del() {
    if (!confirm(`Kamera „${cur.key}“ aus project.yaml löschen? Vorhandene Bilder bleiben erhalten.`)) return;
    try {
      const r = await api(`/api/projects/${slug}/kameras/${encodeURIComponent(cur.key)}`, { method: "DELETE" });
      cams = r.kameras; cur = null; dirty = false; toast("Gelöscht, Sicherung in .history angelegt");
      drawForm(); drawList(); drawCams();
    } catch (err) { toast(err.message); }
  }

  svg?.addEventListener("click", ev => {
    if (!cur) { toast("Erst eine Kamera wählen oder neu anlegen"); return; }
    const [x, y] = svgPoint(svg, ev).map(v => Math.round(v * 10) / 10);
    if (step === "pos") { cur.pos = [x, y, cur.pos[2]]; setStep("target"); }
    else { cur.target = [x, y, cur.target[2]]; setStep("pos"); }
    setDirty(true); drawForm(); drawCams();
  });
  $$("[data-step]").forEach(b => b.addEventListener("click", () => setStep(b.dataset.step)));
  $$("[data-zoom]").forEach(b => b.addEventListener("click", () => {
    setPref("immoviz-zoom", b.dataset.zoom); $$("[data-zoom]").forEach(x => x.setAttribute("aria-pressed", x === b)); drawBase();
  }));
  $("#newcam").addEventListener("click", newCam);
  drawBase(); drawList();
  if (want && cams.some(c => c.key === want)) select(want, true);
  else if (cams.length) select(cams[0].key, true);
}

/* ------------------------------------------------------------ Licht-Editor */
const SEASON_LABEL = { fruehling: "Frühling", sommer: "Sommer", spaetsommer: "Spätsommer", herbst: "Herbst", winter: "Winter" };
const LIGHT_FIELDS = [
  ["exposure", "Belichtung (EV)", "0.05", "Helligkeit des Bildes, 0 = neutral"],
  ["interior", "Innenlicht", "0.05", "Licht hinter den Fenstern, 0 bis 1"],
  ["aerosol", "Dunst (aerosol)", "0.1", "Trübung der Luft, 1 klar bis 4 diesig"],
  ["sky_strength", "Himmelsstärke", "0.05", "leer = Standard"],
];

async function viewLicht(slug) {
  renderNav(slug, "licht");
  document.title = "Licht · immoviz Studio";
  let [d, plan] = await Promise.all([api(`/api/projects/${slug}/lichter`), loadPlan(slug)]);
  const hasPlan = !plan.fehler;
  let lights = d.lichter, cur = null, dirty = false, sun = null, seq = 0;
  const hc = hasPlan ? heroCenter(plan) : [0, 0];

  view.innerHTML = `<section>${sechead("01", "Licht", "Licht-Editor", `${lights.length} Lichtstimmungen aus <span class="mono">project.yaml</span>. Der Sonnenstand wird aus Datum, Uhrzeit und Lage (data/context.json) berechnet. Speichern ändert nur diesen Eintrag, vorher wird eine Sicherung angelegt.`,
      `<button type="button" id="newlight" class="primary">Neue Lichtstimmung</button><a class="btn" href="#/p/${esc(slug)}/shotlist">Zur Shotlist</a>`)}
    <div class="editor">
      <div class="planbox">
        <div class="sunbox">
          <dl class="stamp sunstamp"><div><dt>Sonnenhöhe</dt><dd id="s-h">-</dd></div><div><dt>Azimut</dt><dd id="s-a">-</dd></div><div><dt>Schatten je Meter Höhe</dt><dd id="s-l">-</dd></div></dl>
          <div class="plan">${hasPlan ? `<svg id="sunplan" role="img" aria-label="Sonnenrichtung über dem Lageplan"></svg>` : `<div class="empty-state" style="padding:var(--sp-5)"><span class="label">Kein Lageplan</span><p class="muted">${esc(plan.fehler)}</p></div>`}</div>
          <label class="fl"><span class="label">Uhrzeit verschieben</span><input type="range" id="tslider" min="0" max="1435" step="5" aria-label="Uhrzeit"></label>
        </div>
      </div>
      <div class="side">
        <form id="lform" class="edform" autocomplete="off" hidden></form>
        <ul class="rows camlist" id="llist"></ul>
      </div>
    </div></section>`;

  const svg = $("#sunplan");
  const W = 110, H = 110 * 0.75;
  const near = p => p.some(([x, y]) => Math.hypot(x - hc[0], y - hc[1]) < 75);

  function drawSun() {
    const h = $("#s-h"), a = $("#s-a"), l = $("#s-l");
    if (!sun) { h.textContent = a.textContent = l.textContent = "-"; }
    else {
      h.textContent = `${fmtNum(sun.hoehe)}°${sun.ueber_horizont ? "" : " (unter Horizont)"}`;
      a.textContent = `${fmtNum(sun.azimut)}° ${sun.himmelsrichtung}`;
      l.textContent = sun.hoehe > 0.5 ? `${fmtNum(1 / Math.tan(sun.hoehe * Math.PI / 180))} m` : "-";
    }
    if (!svg) return;
    svg.setAttribute("viewBox", `${hc[0] - W / 2} ${-hc[1] - H / 2} ${W} ${H}`);
    let ray = "";
    if (sun) {
      const [dx, dy] = sun.lokal, n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n;
      const R = 34, r0 = 15;
      const s = [hc[0] + ux * R, hc[1] + uy * R], e = [hc[0] + ux * r0, hc[1] + uy * r0];
      const px = -uy * 2.2, py = ux * 2.2;
      const ah = [e, [e[0] + ux * 4 + px, e[1] + uy * 4 + py], [e[0] + ux * 4 - px, e[1] + uy * 4 - py]];
      ray = `<g class="sunray${sun.ueber_horizont ? "" : " down"}"><line x1="${s[0]}" y1="${-s[1]}" x2="${e[0] + ux * 3}" y2="${-(e[1] + uy * 3)}"/>
        <polygon points="${svgPts(ah)}"/><circle cx="${s[0]}" cy="${-s[1]}" r="3.4"/></g>`;
    }
    svg.innerHTML = `<rect class="pl-bg" x="${hc[0] - W}" y="${-hc[1] - H}" width="${W * 2}" height="${H * 2}"/>
      ${planLayers(plan, near)}<circle class="pl-ring" cx="${hc[0]}" cy="${-hc[1]}" r="34"/>${ray}
      ${northArrow(plan, hc[0] + W / 2 - 7, hc[1] + H / 2 - 9, 4.5)}`;
  }

  async function updateSun() {
    if (!cur || !cur.date || !cur.time) { sun = null; drawSun(); return; }
    const my = ++seq;
    try {
      const r = await api(`/api/projects/${slug}/sonne?date=${encodeURIComponent(cur.date)}&time=${encodeURIComponent(cur.time)}&tz=${encodeURIComponent(cur.tz)}`);
      if (my === seq) { sun = r; drawSun(); }
    } catch (_) { if (my === seq) { sun = null; drawSun(); } }
  }
  let deb = null;
  const sunSoon = () => { clearTimeout(deb); deb = setTimeout(updateSun, 120); };

  function drawList() {
    $("#llist").innerHTML = lights.map((l, i) => `<li class="${cur && cur.key === l.key ? "sel" : ""}"><span class="n">${pad(i + 1)}</span>
      <span class="main"><b>${esc(l.key)}</b><span class="mono muted">${esc((l.date || "").split("-").reverse().join("."))} · ${esc(l.time || "")}${l.season ? " · " + esc(SEASON_LABEL[l.season] || l.season) : ""}${l.sonne ? ` · Sonne ${fmtNum(l.sonne.hoehe)}° ${esc(l.sonne.himmelsrichtung)}` : ""}</span></span>
      <button type="button" class="small aside" data-edit="${esc(l.key)}">${cur && cur.key === l.key ? "Ausgewählt" : "Bearbeiten"}</button></li>`).join("")
      || `<li><span class="n">00</span><span class="main muted">Noch keine Lichtstimmungen.</span></li>`;
    $$("#llist [data-edit]").forEach(b => b.addEventListener("click", () => select(b.dataset.edit)));
  }

  function drawForm() {
    const f = $("#lform");
    if (!cur) { f.hidden = true; return; }
    f.hidden = false;
    f.innerHTML = `<div class="edhead"><span class="label">${cur.key ? "Lichtstimmung bearbeiten" : "Neue Lichtstimmung"}</span><span id="dirty" class="tag warn" ${dirty ? "" : "hidden"}>ungespeichert</span></div>
      <label class="fl"><span class="label">Name</span><input class="field" type="text" name="name" value="${esc(cur.name)}" pattern="[a-z0-9_]+" maxlength="40" required placeholder="z. B. abendrot"><small class="muted">nur a bis z, 0 bis 9 und _</small></label>
      <div class="trip"><label class="fl"><span class="label">Datum</span><input class="field" type="date" name="date" value="${esc(cur.date)}" required></label>
        <label class="fl"><span class="label">Uhrzeit</span><input class="field" type="time" name="time" value="${esc(cur.time)}" required></label>
        <label class="fl"><span class="label">UTC +</span><input class="field" type="number" name="tz" step="1" min="-12" max="14" value="${esc(cur.tz)}" required></label></div>
      <label class="fl"><span class="label">Jahreszeit (Vegetation)</span><select class="field" name="season"><option value="">keine Angabe</option>${Object.entries(SEASON_LABEL).map(([k, l]) => `<option value="${k}" ${cur.season === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <div class="duo">${LIGHT_FIELDS.map(([k, l, st, hint]) => `<label class="fl"><span class="label">${l}</span><input class="field" type="number" step="${st}" name="${k}" value="${cur[k] ?? ""}" placeholder="leer" inputmode="decimal"><small class="muted">${hint}</small></label>`).join("")}</div>
      <div class="acts"><button type="submit" class="primary">${cur.key ? "Speichern" : "Anlegen"}</button>
        <button type="button" data-reset>Verwerfen</button>${cur.key ? `<button type="button" class="ghost danger" data-del>Löschen</button>` : ""}</div>`;
    f.oninput = () => { readForm(); setDirty(true); syncSlider(); sunSoon(); };
    f.onsubmit = save;
    $("[data-reset]", f).addEventListener("click", () => { if (cur.key) { dirty = false; select(cur.key, true); } else { cur = null; dirty = false; drawForm(); updateSun(); } });
    $("[data-del]", f)?.addEventListener("click", del);
    syncSlider();
  }

  function readForm() {
    const f = new FormData($("#lform"));
    cur.name = String(f.get("name") || "").trim();
    cur.date = String(f.get("date") || ""); cur.time = String(f.get("time") || ""); cur.tz = String(f.get("tz") || "");
    cur.season = String(f.get("season") || "");
    LIGHT_FIELDS.forEach(([k]) => { cur[k] = String(f.get(k) ?? "").trim(); });
  }
  function setDirty(v) { dirty = v; const t = $("#dirty"); if (t) t.hidden = !v; }
  function syncSlider() {
    const s = $("#tslider"), m = /^(\d\d):(\d\d)$/.exec(cur?.time || "");
    s.disabled = !cur;
    if (m) s.value = +m[1] * 60 + +m[2];
  }

  function select(key, force) {
    if (dirty && !force && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    const l = lights.find(x => x.key === key);
    if (!l) return;
    cur = { key: l.key, name: l.key, date: l.date || "", time: l.time || "", tz: l.tz ?? 2, season: l.season || "" };
    LIGHT_FIELDS.forEach(([k]) => { cur[k] = l[k] ?? ""; });
    dirty = false;
    drawForm(); drawList(); sun = l.sonne || null; drawSun(); updateSun();
  }

  function newLight() {
    if (dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    cur = { key: null, name: "", date: "2026-06-21", time: "17:00", tz: 2, season: "sommer", exposure: "0", interior: "0", aerosol: "2", sky_strength: "" };
    dirty = true; drawForm(); drawList(); updateSun();
    $('#lform [name="name"]').focus();
  }

  async function save(e) {
    e.preventDefault();
    readForm();
    if (!/^[a-z0-9_]{1,40}$/.test(cur.name)) { toast("Name: nur a bis z, 0 bis 9 und _"); return; }
    const body = { name: cur.name, date: cur.date, time: cur.time, tz: cur.tz, season: cur.season || null };
    LIGHT_FIELDS.forEach(([k]) => { body[k] = cur[k] === "" ? null : cur[k]; });
    try {
      const r = cur.key ? await api(`/api/projects/${slug}/lichter/${encodeURIComponent(cur.key)}`, { method: "PUT", body })
        : await api(`/api/projects/${slug}/lichter`, { method: "POST", body });
      lights = r.lichter; toast("Gespeichert, Sicherung in .history angelegt");
      select(cur.name, true);
    } catch (err) { toast(err.message); }
  }

  async function del() {
    if (!confirm(`Lichtstimmung „${cur.key}“ aus project.yaml löschen? Vorhandene Bilder bleiben erhalten.`)) return;
    try {
      const r = await api(`/api/projects/${slug}/lichter/${encodeURIComponent(cur.key)}`, { method: "DELETE" });
      lights = r.lichter; cur = null; dirty = false; sun = null; toast("Gelöscht, Sicherung in .history angelegt");
      drawForm(); drawList(); drawSun();
    } catch (err) { toast(err.message); }
  }

  $("#tslider").addEventListener("input", e => {
    if (!cur) return;
    const v = +e.target.value, t = `${pad(Math.floor(v / 60))}:${pad(v % 60)}`;
    cur.time = t; const inp = $('#lform [name="time"]'); if (inp) inp.value = t;
    setDirty(true); sunSoon();
  });
  $("#newlight").addEventListener("click", newLight);
  drawSun(); drawList();
  if (lights.length) select(lights[0].key, true);
}
