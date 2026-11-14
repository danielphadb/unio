/* immoviz Studio Phase C: Fassaden-Editor, Dach-Editor, Planabgleich, Neues Objekt.
   Koordinaten immer in Metern (u entlang der Fassade, z Höhe), Anzeige in Plan-Pixeln über dpi, scale und u0_px.
   Speichern ersetzt nur die betroffenen Blöcke in project.yaml (yamledit.replace_blocks, Sicherung in .history). */
const GRID = 0.05;                       /* Raster 5 cm */
const SNAP_PX = 8;                       /* Fangradius in Bildschirmpixeln */
const r2 = v => Math.round(v * 100) / 100;
const snapGrid = v => r2(Math.round(v / GRID) * GRID);
const fmt2 = v => Number(v).toLocaleString("de-AT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const clone = o => JSON.parse(JSON.stringify(o));
const ppmOf = c => (c.dpi || 130) / 0.0254 / (c.scale || 100);
const EG_LABEL = { haustor: "Haustor", schaufenster: "Schaufenster", kastenfenster: "Kastenfenster" };
const ROW_LABEL = { kastenfenster: "Kastenfenster", schaufenster: "Schaufenster", haustor: "Haustor" };
const SUR_LABEL = { "": "keine", fasche: "Fasche", fasche_verdachung: "Fasche mit Verdachung", aedikula: "Ädikula" };

function loadImg(src) {
  return new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
}

/* ------------------------------------------------------------ Fassaden-Editor */
async function viewFassaden(slug) {
  renderNav(slug, "fassaden");
  document.title = "Fassaden · immoviz Studio";
  let d = await api(`/api/projects/${slug}/fassaden`);
  if (!d.fassaden.length) {
    view.innerHTML = `<section>${sechead("01", "Fassaden", "Fassaden-Editor", "In <span class=\"mono\">project.yaml</span> ist unter <span class=\"mono\">facades</span> noch keine Fassade eingetragen.")}</section>`;
    return;
  }
  const want = new URLSearchParams(location.hash.split("?")[1] || "").get("f") || getPref(`immoviz-fassade-${slug}`, "");
  let F, dirty, mode = getPref("immoviz-fmode", "achsen"), sel = null, zoom = +getPref("immoviz-fzoom", "1"), planImg = null, opacity = +getPref("immoviz-fop", "0.9");

  function load(name) {
    const f = d.fassaden.find(x => x.name === name) || d.fassaden[0];
    const axes = f.axes.map(u => ({ u, eg: null }));
    f.eg.forEach(g => g.axes.forEach(i => { if (axes[i]) axes[i].eg = { type: g.type, u: g.u || null, z: g.z || null, keller: !!g.keller }; }));
    const L = f.laenge;
    const zTop = Math.max(d.height || 16, ...(d.dach_z || [0])) + 3;
    F = {
      name: f.name, L, axes, endcaps: f.endcaps, rows: clone(d.rows), cornices: clone(d.cornices),
      check: f.check ? clone(f.check) : { pdf: d.pdfs[0] || "", page: 1, dpi: 130, scale: 100, u0_px: [0, 0], span: [-2, r2(L + 2)], z: [-0.5, r2(zTop)], levels: [] },
      hasCheck: !!f.check,
    };
    dirty = { axes: false, rows: false, cornices: false, check: false };
    sel = null;
    setPref(`immoviz-fassade-${slug}`, f.name);
  }
  load(want);

  const MODES = [["achsen", "Achsen"], ["zeilen", "Geschosse"], ["gesimse", "Gesimse"], ["eg", "Erdgeschoss"], ["kalib", "Plan kalibrieren"]];
  view.innerHTML = `<section>${sechead("01", "Fassaden", "Fassaden-Editor", "Straßenansicht im Maßstab als Hintergrund, darüber Achsen, Geschosszeilen, Gesimse und Erdgeschoss. Werte in Metern, Raster 5 cm, Linien rasten an Höhenkoten und vorhandenen Linien ein. Speichern ändert nur die betroffenen Blöcke in <span class=\"mono\">project.yaml</span> (Sicherung in .history).",
      `<select class="field" id="fsel" aria-label="Fassade" style="width:auto">${d.fassaden.map(f => `<option value="${esc(f.name)}">${esc(f.name)} · ${fmtNum(f.laenge, 2)} m</option>`).join("")}</select>
       <button type="button" id="fsave" class="primary" disabled>Speichern</button><button type="button" id="freset" disabled>Verwerfen</button>`)}
    <div class="editor feditor">
      <div class="planbox">
        <div class="plantools">
          <div class="seg seg-wrap" role="group" aria-label="Werkzeug">${MODES.map(([k, l]) => `<button type="button" data-mode="${k}">${l}</button>`).join("")}</div>
          <div class="seg" role="group" aria-label="Zoom">${[["1", "1x"], ["2", "2x"], ["4", "4x"]].map(([k, l]) => `<button type="button" data-fzoom="${k}" aria-pressed="${+k === zoom}">${l}</button>`).join("")}</div>
        </div>
        <div class="fplan" id="fplan"><svg id="fsvg" role="img" aria-label="Fassade mit Plan"></svg></div>
        <div class="plantools"><span class="mono muted" id="fcursor">u -, z -</span>
          <label class="check"><span class="label">Plan</span><input type="range" id="fop" min="0" max="1" step="0.05" value="${opacity}" aria-label="Deckkraft Plan" style="width:120px"></label></div>
        <p class="muted small" id="fhint"></p>
      </div>
      <div class="side">
        <form class="edform" id="fform" autocomplete="off" onsubmit="return false"></form>
        <ul class="rows camlist" id="flist"></ul>
      </div>
    </div></section>`;
  $("#fsel").value = F.name;
  const svg = $("#fsvg"), box = $("#fplan");

  /* Abbildung Meter -> Plan-Pixel */
  const M = () => {
    const c = F.check, ppm = ppmOf(c);
    const calibrated = F.hasCheck && planImg && !(c.u0_px[0] === 0 && c.u0_px[1] === 0);
    const ux = calibrated ? c.u0_px[0] : -c.span[0] * ppm, uy = calibrated ? c.u0_px[1] : c.z[1] * ppm;
    return { ppm, calibrated, X: u => ux + u * ppm, Y: z => uy - z * ppm, U: x => (x - ux) / ppm, Z: y => (uy - y) / ppm };
  };
  const screenScale = () => { const m = svg.getScreenCTM(); return m ? m.a : 1; };
  const tolM = () => SNAP_PX / (screenScale() * M().ppm);

  function zLines(exclude) {
    const out = [0, d.height, d.sockel, ...(d.slabs || []), ...(F.check.levels || []), ...(d.dach_z || [])];
    Object.entries(F.rows).forEach(([k, r]) => { if (k !== exclude) out.push(r.z, r2(r.z + r.h)); });
    F.cornices.forEach((c, i) => { if (`c${i}` !== exclude) c.steps.forEach(s => out.push(s[0], s[1])); });
    return out.filter(v => typeof v === "number");
  }
  function snap(v, lines, free) {
    if (free) return r2(v);
    const t = tolM();
    let best = null;
    lines.forEach(l => { if (Math.abs(l - v) <= t && (best === null || Math.abs(l - v) < Math.abs(best - v))) best = l; });
    return best !== null ? r2(best) : snapGrid(v);
  }
  const uLines = ex => [0, F.L, ...F.endcaps, ...F.axes.filter(a => a !== ex).map(a => a.u)];

  function hint() {
    const H = {
      achsen: "Klick auf eine freie Stelle setzt eine Achse, Ziehen verschiebt sie, Entf löscht die gewählte. Pfeiltasten verschieben um 5 cm.",
      zeilen: "Band ziehen verschiebt die Geschosszeile, obere und untere Kante ziehen ändert die Höhe. Fenster werden je Achse gezeichnet.",
      gesimse: "Gesims ziehen verschiebt alle Stufen gemeinsam. Stufen und Konsolen im Formular.",
      eg: "Achse anklicken, rechts Typ und Bereich wählen. Ohne Eintrag gilt die Regelzeile eg.",
      kalib: "Plan wählen, dann im Plan auf den Punkt u = 0 und z = 0 klicken (Fassadenbeginn links auf Höhe der Kote z = 0). Ausschnitt und Höhen rechts.",
    };
    $("#fhint").textContent = (H[mode] || "") + (M().calibrated ? "" : " Der Plan ist für diese Fassade noch nicht kalibriert.");
  }

  async function loadPlan() {
    planImg = null;
    if (F.check.pdf) planImg = await loadImg(`/api/projects/${slug}/planbild?pdf=${encodeURIComponent(F.check.pdf)}&page=${F.check.page || 1}&dpi=${F.check.dpi || 130}`);
  }

  function draw() {
    const m = M(), c = F.check;
    let vx, vy, vw, vh;
    if (mode === "kalib" && planImg) { vx = 0; vy = 0; vw = planImg.naturalWidth; vh = planImg.naturalHeight; }
    else { vx = m.X(c.span[0]); vy = m.Y(c.z[1]); vw = (c.span[1] - c.span[0]) * m.ppm; vh = (c.z[1] - c.z[0]) * m.ppm; }
    svg.setAttribute("viewBox", `${vx} ${vy} ${vw} ${vh}`);
    svg.style.width = (zoom * 100) + "%";
    svg.style.aspectRatio = `${vw} / ${vh}`;
    const s = vw / 900;  /* Linienstärken und Schrift relativ zur Ansicht */
    const X = m.X, Y = m.Y, H = (z0, z1) => Math.abs(Y(z1) - Y(z0));
    const L = F.L, top = Math.max(d.height || 16, 1);
    let g = `<rect class="fp-bg" x="${vx}" y="${vy}" width="${vw}" height="${vh}"/>`;
    if (planImg && m.calibrated || planImg && mode === "kalib") g += `<image href="${esc(planImg.src)}" x="0" y="0" width="${planImg.naturalWidth}" height="${planImg.naturalHeight}" opacity="${opacity}" preserveAspectRatio="none"/>`;
    // Hilfslinien an Höhenkoten
    const guides = [...new Set([0, d.height, ...(d.slabs || []), ...(c.levels || []), ...(d.dach_z || [])].filter(v => typeof v === "number").map(r2))];
    g += `<g class="fp-guide">${guides.map(z => `<line x1="${X(c.span[0])}" x2="${X(c.span[1])}" y1="${Y(z)}" y2="${Y(z)}" stroke-width="${s}"/>
      <text x="${X(c.span[0]) + 4 * s}" y="${Y(z) - 3 * s}" font-size="${10 * s}">z ${fmt2(z)}${d.ground_wn != null ? ` · ${fmt2(z + d.ground_wn)} WrN` : ""}</text>`).join("")}</g>`;
    // Fassadenkanten
    g += `<g class="fp-edge"><line x1="${X(0)}" x2="${X(0)}" y1="${Y(-0.3)}" y2="${Y(top)}" stroke-width="${1.5 * s}"/><line x1="${X(L)}" x2="${X(L)}" y1="${Y(-0.3)}" y2="${Y(top)}" stroke-width="${1.5 * s}"/>
      <line x1="${X(0)}" x2="${X(L)}" y1="${Y(top)}" y2="${Y(top)}" stroke-width="${1.5 * s}"/></g>`;
    // Gesimse
    g += `<g class="fp-corn${mode === "gesimse" ? " act" : ""}">${F.cornices.map((cn, i) => {
      const z0 = Math.min(...cn.steps.map(t => t[0])), z1 = Math.max(...cn.steps.map(t => t[1]));
      const on = sel && sel.kind === "c" && sel.i === i;
      return `<rect data-k="c" data-i="${i}" data-part="move" class="${on ? "sel" : ""}" x="${X(0)}" y="${Y(z1)}" width="${L * m.ppm}" height="${Math.max(H(z0, z1), 2 * s)}" stroke-width="${(on ? 2 : 1) * s}"><title>${esc(cn.name)} z ${fmt2(z0)} bis ${fmt2(z1)}</title></rect>
        ${mode === "gesimse" ? `<text x="${X(L) - 4 * s}" y="${Y(z1) - 3 * s}" font-size="${10 * s}" text-anchor="end">${esc(cn.name)}</text>` : ""}`;
    }).join("")}</g>`;
    // Geschosszeilen und Fenster
    g += `<g class="fp-rows${mode === "zeilen" ? " act" : ""}">${Object.entries(F.rows).map(([k, r]) => {
      const on = sel && sel.kind === "r" && sel.key === k;
      const wins = F.axes.map((a, ai) => {
        let ua = a.u - r.w / 2, ub = a.u + r.w / 2, za = r.z, zb = r.z + r.h, cls = "win";
        if (k === "eg" && a.eg) {
          if (a.eg.z) { za = a.eg.z[0]; zb = a.eg.z[1]; }
          if (a.eg.type === "haustor" && a.eg.u) { ua = a.eg.u[0]; ub = a.eg.u[1]; }
          cls = "win eg-" + a.eg.type;
        }
        const egsel = mode === "eg" && sel && sel.kind === "e" && sel.i === ai;
        return `<rect class="${cls}${egsel ? " sel" : ""}" ${mode === "eg" ? `data-k="e" data-i="${ai}" data-part="pick"` : ""} x="${X(ua)}" y="${Y(zb)}" width="${(ub - ua) * m.ppm}" height="${H(za, zb)}" stroke-width="${(egsel ? 2.5 : 1.2) * s}"/>`;
      }).join("");
      const band = mode === "zeilen" ? `<rect data-k="r" data-key="${esc(k)}" data-part="move" class="band${on ? " sel" : ""}" x="${X(0)}" y="${Y(r.z + r.h)}" width="${L * m.ppm}" height="${H(r.z, r.z + r.h)}"/>
        <rect data-k="r" data-key="${esc(k)}" data-part="top" class="edge" x="${X(0)}" y="${Y(r.z + r.h) - 4 * s}" width="${L * m.ppm}" height="${8 * s}"/>
        <rect data-k="r" data-key="${esc(k)}" data-part="bottom" class="edge" x="${X(0)}" y="${Y(r.z) - 4 * s}" width="${L * m.ppm}" height="${8 * s}"/>
        <text x="${X(L) + 4 * s}" y="${Y(r.z + r.h / 2)}" font-size="${11 * s}" dominant-baseline="middle">${esc(k)}</text>` : "";
      return `<g>${wins}${band}</g>`;
    }).join("")}</g>`;
    // Achsen
    g += `<g class="fp-axes${mode === "achsen" ? " act" : ""}">${F.axes.map((a, i) => {
      const on = sel && sel.kind === "a" && sel.i === i;
      return `<g class="${on ? "sel" : ""}"><line class="hit" data-k="a" data-i="${i}" data-part="move" x1="${X(a.u)}" x2="${X(a.u)}" y1="${Y(-0.3)}" y2="${Y(top + 1.2)}" stroke-width="${12 * s}"/>
        <line class="ax" x1="${X(a.u)}" x2="${X(a.u)}" y1="${Y(-0.3)}" y2="${Y(top + 1.2)}" stroke-width="${(on ? 2.2 : 1.2) * s}"/>
        <circle data-k="a" data-i="${i}" data-part="move" cx="${X(a.u)}" cy="${Y(top + 1.2)}" r="${(on ? 7 : 5.5) * s}"/>
        <text x="${X(a.u)}" y="${Y(top + 1.2) - 9 * s}" font-size="${10 * s}" text-anchor="middle">${i + 1}</text></g>`;
    }).join("")}</g>`;
    // Kalibrierpunkt
    if (mode === "kalib" || !m.calibrated) {
      const px = F.hasCheck || c.u0_px[0] || c.u0_px[1] ? c.u0_px : null;
      if (px && planImg) g += `<g class="fp-cal"><circle cx="${px[0]}" cy="${px[1]}" r="${8 * s}" stroke-width="${2 * s}"/><line x1="${px[0] - 16 * s}" x2="${px[0] + 16 * s}" y1="${px[1]}" y2="${px[1]}" stroke-width="${1.5 * s}"/><line x1="${px[0]}" x2="${px[0]}" y1="${px[1] - 16 * s}" y2="${px[1] + 16 * s}" stroke-width="${1.5 * s}"/>
        <text x="${px[0] + 12 * s}" y="${px[1] - 10 * s}" font-size="${12 * s}">u 0 / z 0</text></g>`;
    }
    svg.innerHTML = g;
    hint();
  }

  /* -------- Formular rechts */
  const numIn = (n, v, step = "0.01", extra = "") => `<input class="field" type="number" step="${step}" name="${n}" value="${v ?? ""}" inputmode="decimal" aria-label="${esc(n)}" ${extra}>`;
  function form() {
    const f = $("#fform");
    const anyDirty = Object.values(dirty).some(Boolean);
    $("#fsave").disabled = !anyDirty; $("#freset").disabled = !anyDirty;
    const head = (t) => `<div class="edhead"><span class="label">${t}</span><span class="tag warn" ${anyDirty ? "" : "hidden"}>ungespeichert</span></div>`;
    if (mode === "kalib") {
      const c = F.check;
      f.innerHTML = `${head("Plan und Maßstab")}
        <label class="fl"><span class="label">Straßenansicht (PDF in quellen/)</span><select class="field" name="pdf">${d.pdfs.length ? d.pdfs.map(p => `<option ${p === c.pdf ? "selected" : ""}>${esc(p)}</option>`).join("") : `<option value="">keine PDF in quellen/, im Intake hochladen</option>`}</select></label>
        <div class="trip"><label class="fl"><span class="label">Seite</span>${numIn("page", c.page, "1")}</label><label class="fl"><span class="label">dpi</span>${numIn("dpi", c.dpi, "1")}</label><label class="fl"><span class="label">Maßstab 1:</span>${numIn("scale", c.scale, "1")}</label></div>
        <fieldset class="fl"><legend class="label">u0_px: Pixel von u = 0, z = 0</legend><div class="duo">${numIn("u0x", c.u0_px[0], "1")}${numIn("u0y", c.u0_px[1], "1")}</div></fieldset>
        <fieldset class="fl"><legend class="label">Ausschnitt u von, bis (m)</legend><div class="duo">${numIn("s0", c.span[0])}${numIn("s1", c.span[1])}</div></fieldset>
        <fieldset class="fl"><legend class="label">Ausschnitt z von, bis (m)</legend><div class="duo">${numIn("z0", c.z[0])}${numIn("z1", c.z[1])}</div></fieldset>
        <label class="fl"><span class="label">Höhenkoten für den Abgleich (m, mit Komma getrennt)</span><input class="field" type="text" name="levels" value="${esc((c.levels || []).join("; "))}" placeholder="z. B. 16,27; 21,07"></label>
        <p class="mono muted">${fmtNum(ppmOf(c), 2)} px je Meter${planImg ? ` · Plan ${planImg.naturalWidth} x ${planImg.naturalHeight} px` : " · Plan nicht geladen"}</p>`;
      f.oninput = async e => {
        const fd = new FormData(f), n = k => parseFloat(String(fd.get(k)).replace(",", "."));
        const before = [c.pdf, c.page, c.dpi].join("|");
        c.pdf = String(fd.get("pdf") || ""); c.page = n("page") || 1; c.dpi = n("dpi") || 130; c.scale = n("scale") || 100;
        c.u0_px = [Math.round(n("u0x") || 0), Math.round(n("u0y") || 0)];
        c.span = [n("s0"), n("s1")]; c.z = [n("z0"), n("z1")];
        c.levels = String(fd.get("levels") || "").split(/[;\s]+/).map(v => parseFloat(v.replace(",", "."))).filter(Number.isFinite);
        dirty.check = true; F.hasCheck = true;
        if (before !== [c.pdf, c.page, c.dpi].join("|") && e.type === "input" && e.target.tagName === "SELECT") { await loadPlan(); }
        draw(); markDirty();
      };
      f.onchange = async e => { if (["pdf", "page", "dpi"].includes(e.target.name)) { await loadPlan(); draw(); form(); } };
      return;
    }
    f.onchange = null;
    if (sel && sel.kind === "a") {
      const a = F.axes[sel.i], prev = F.axes[sel.i - 1], next = F.axes[sel.i + 1];
      f.innerHTML = `${head(`Achse ${sel.i + 1} von ${F.axes.length}`)}
        <label class="fl"><span class="label">u (m)</span>${numIn("u", a.u)}</label>
        <p class="mono muted">${prev ? `Abstand links ${fmt2(a.u - prev.u)} m` : `Abstand zum Fassadenbeginn ${fmt2(a.u)} m`} · ${next ? `rechts ${fmt2(next.u - a.u)} m` : `zum Ende ${fmt2(F.L - a.u)} m`}</p>
        <div class="acts"><button type="button" class="ghost danger" data-delax>Achse löschen</button></div>`;
      f.oninput = () => { const v = parseFloat(String(new FormData(f).get("u")).replace(",", ".")); if (Number.isFinite(v)) { a.u = r2(v); sortAxes(a); dirty.axes = true; draw(); markDirty(); } };
      $("[data-delax]", f).addEventListener("click", delAxis);
    } else if (sel && sel.kind === "r") {
      const r = F.rows[sel.key];
      f.innerHTML = `${head(`Geschosszeile ${esc(sel.key)}`)}
        <label class="fl"><span class="label">Name</span><input class="field" type="text" name="name" value="${esc(sel.key)}" pattern="[a-z0-9_]+" maxlength="40"></label>
        <div class="trip"><label class="fl"><span class="label">z Unterkante</span>${numIn("z", r.z)}</label><label class="fl"><span class="label">Höhe</span>${numIn("h", r.h)}</label><label class="fl"><span class="label">Breite</span>${numIn("w", r.w)}</label></div>
        <div class="duo"><label class="fl"><span class="label">Typ</span><select class="field" name="type">${d.row_types.map(t => `<option value="${t}" ${t === r.type ? "selected" : ""}>${ROW_LABEL[t] || t}</option>`).join("")}</select></label>
          <label class="fl"><span class="label">Umrahmung</span><select class="field" name="surround">${["", ...d.surrounds].map(t => `<option value="${t}" ${(r.surround || "") === t ? "selected" : ""}>${SUR_LABEL[t] || t}</option>`).join("")}</select></label></div>
        <p class="mono muted">Oberkante ${fmt2(r.z + r.h)} m · gilt für alle Fassaden</p>
        <div class="acts"><button type="button" class="ghost danger" data-delrow>Zeile löschen</button></div>`;
      f.oninput = e => {
        const fd = new FormData(f), n = k => parseFloat(String(fd.get(k)).replace(",", "."));
        if (e.target.name === "name") return;
        ["z", "h", "w"].forEach(k => { if (Number.isFinite(n(k))) r[k] = r2(n(k)); });
        r.type = fd.get("type"); r.surround = fd.get("surround") || null;
        dirty.rows = true; draw(); markDirty();
      };
      $('[name="name"]', f).addEventListener("change", e => {
        const nn = e.target.value.trim();
        if (!/^[a-z0-9_]{1,40}$/.test(nn) || F.rows[nn]) { toast("Name: a bis z, 0 bis 9, _ und noch nicht vergeben"); e.target.value = sel.key; return; }
        F.rows = Object.fromEntries(Object.entries(F.rows).map(([k, v]) => [k === sel.key ? nn : k, v]));
        sel.key = nn; dirty.rows = true; markDirty(); draw(); list();
      });
      $("[data-delrow]", f).addEventListener("click", () => { if (!confirm(`Geschosszeile ${sel.key} löschen? Gilt für alle Fassaden.`)) return; delete F.rows[sel.key]; sel = null; dirty.rows = true; markDirty(); draw(); form(); list(); });
    } else if (sel && sel.kind === "c") {
      const cn = F.cornices[sel.i];
      f.innerHTML = `${head(`Gesims ${esc(cn.name)}`)}
        <label class="fl"><span class="label">Name</span><input class="field" type="text" name="name" value="${esc(cn.name)}" pattern="[a-z0-9_]+" maxlength="40"></label>
        <label class="fl"><span class="label">Stufen: z von, z bis, Ausladung (je Zeile)</span><textarea class="field mono" name="steps" rows="${Math.max(2, cn.steps.length)}">${esc(cn.steps.map(t => t.join(", ")).join("\n"))}</textarea></label>
        ${cn.consoles ? `<fieldset class="fl"><legend class="label">Konsolen z von, bis · Breite · Ausladung</legend><div class="duo">${numIn("kz0", cn.consoles.z[0])}${numIn("kz1", cn.consoles.z[1])}${numIn("kw", cn.consoles.w)}${numIn("kp", cn.consoles.proj)}</div></fieldset>` : ""}
        <div class="acts"><button type="button" class="ghost danger" data-delc>Gesims löschen</button></div>`;
      f.oninput = () => {
        const fd = new FormData(f), n = k => parseFloat(String(fd.get(k)).replace(",", "."));
        const nm = String(fd.get("name") || "").trim(); if (/^[a-z0-9_]{1,40}$/.test(nm)) cn.name = nm;
        const st = String(fd.get("steps")).split("\n").map(l => l.split(/[,;\s]+/).filter(Boolean).map(v => parseFloat(v.replace(",", ".")))).filter(t => t.length === 3 && t.every(Number.isFinite));
        if (st.length) cn.steps = st.map(t => t.map(r2));
        if (cn.consoles && [n("kz0"), n("kz1"), n("kw"), n("kp")].every(Number.isFinite)) cn.consoles = { z: [r2(n("kz0")), r2(n("kz1"))], w: r2(n("kw")), proj: r2(n("kp")) };
        dirty.cornices = true; draw(); markDirty();
      };
      $("[data-delc]", f).addEventListener("click", () => { if (!confirm(`Gesims ${cn.name} löschen? Gilt für alle Fassaden.`)) return; F.cornices.splice(sel.i, 1); sel = null; dirty.cornices = true; markDirty(); draw(); form(); list(); });
    } else if (sel && sel.kind === "e") {
      const a = F.axes[sel.i], e = a.eg || {}, er = F.rows.eg || { z: 1.8, h: 1.9, w: 1 };
      f.innerHTML = `${head(`Erdgeschoss, Achse ${sel.i + 1}`)}
        <label class="fl"><span class="label">Typ</span><select class="field" name="type"><option value="">Regel (Zeile eg)</option>${d.eg_types.map(t => `<option value="${t}" ${e.type === t ? "selected" : ""}>${EG_LABEL[t]}</option>`).join("")}</select></label>
        <fieldset class="fl"><legend class="label">u von, bis (m), nur Haustor nötig</legend><div class="duo">${numIn("u0", e.u ? e.u[0] : "")}${numIn("u1", e.u ? e.u[1] : "")}</div></fieldset>
        <fieldset class="fl"><legend class="label">z von, bis (m), leer = wie Zeile eg</legend><div class="duo">${numIn("z0", e.z ? e.z[0] : "")}${numIn("z1", e.z ? e.z[1] : "")}</div></fieldset>
        <label class="check"><input type="checkbox" name="keller" ${e.keller ? "checked" : ""}> Kellerfenster darunter</label>
        <p class="mono muted">Regel: z ${fmt2(er.z)} bis ${fmt2(er.z + er.h)}, Breite ${fmt2(er.w)}</p>
        <div class="acts"><button type="button" class="small" data-copyeg>Auf alle Achsen ohne Eintrag übertragen</button></div>`;
      f.oninput = () => {
        const fd = new FormData(f), n = k => { const v = parseFloat(String(fd.get(k)).replace(",", ".")); return Number.isFinite(v) ? r2(v) : null; };
        const t = fd.get("type");
        if (!t) a.eg = null;
        else {
          const u = n("u0") !== null && n("u1") !== null ? [n("u0"), n("u1")] : (t === "haustor" ? [r2(a.u - 0.9), r2(a.u + 0.9)] : null);
          const z = n("z0") !== null && n("z1") !== null ? [n("z0"), n("z1")] : (t === "haustor" ? [0, r2(er.z + er.h)] : null);
          a.eg = { type: t, u, z, keller: !!fd.get("keller") };
        }
        dirty.axes = true; draw(); markDirty();
        if (t === "haustor" && (!fd.get("u0") || !fd.get("z0"))) form();
      };
      $("[data-copyeg]", f).addEventListener("click", () => { if (!a.eg) return; F.axes.forEach(x => { if (!x.eg && x !== a) x.eg = { ...clone(a.eg), u: a.eg.type === "haustor" ? null : a.eg.u }; }); F.axes.forEach(x => { if (x.eg && x.eg.type === "haustor" && !x.eg.u) x.eg = null; }); dirty.axes = true; draw(); markDirty(); toast("Übertragen"); });
    } else {
      const add = mode === "zeilen" ? `<button type="button" class="small" data-addrow>Neue Geschosszeile</button>` : mode === "gesimse" ? `<button type="button" class="small" data-addc>Neues Gesims</button>` : "";
      f.innerHTML = `${head(`Fassade ${esc(F.name)} · ${fmtNum(F.L, 2)} m`)}
        <p class="muted small">${mode === "achsen" ? `${F.axes.length} Achsen. In den Plan klicken setzt eine neue Achse.` : mode === "eg" ? "Eine Achse im Erdgeschoss anklicken." : "Element im Plan anklicken."}</p>
        ${add ? `<div class="acts">${add}</div>` : ""}`;
      f.oninput = null;
      $("[data-addrow]", f)?.addEventListener("click", () => {
        let n = 1; while (F.rows[`zeile${n}`]) n++;
        const zs = Object.values(F.rows).map(r => r.z + r.h);
        F.rows[`zeile${n}`] = { z: snapGrid((zs.length ? Math.max(...zs) : 0) + 1.6), h: 1.8, w: 1.05, type: "kastenfenster", surround: "fasche" };
        sel = { kind: "r", key: `zeile${n}` }; dirty.rows = true; markDirty(); draw(); form(); list();
      });
      $("[data-addc]", f)?.addEventListener("click", () => {
        let n = 1; while (F.cornices.some(c => c.name === `gesims_${n}`)) n++;
        F.cornices.push({ name: `gesims_${n}`, steps: [[8.0, 8.2, 0.1]] }); sel = { kind: "c", i: F.cornices.length - 1 };
        dirty.cornices = true; markDirty(); draw(); form(); list();
      });
    }
  }

  function list() {
    const el = $("#flist");
    let items = [];
    if (mode === "achsen" || mode === "eg") items = F.axes.map((a, i) => [`a${i}`, `Achse ${i + 1}`, `u ${fmt2(a.u)} m${a.eg ? " · EG " + EG_LABEL[a.eg.type] : ""}`, { kind: mode === "eg" ? "e" : "a", i }]);
    else if (mode === "zeilen") items = Object.entries(F.rows).sort((a, b) => a[1].z - b[1].z).map(([k, r]) => [k, k, `z ${fmt2(r.z)} · h ${fmt2(r.h)} · b ${fmt2(r.w)} · ${ROW_LABEL[r.type] || r.type}`, { kind: "r", key: k }]);
    else if (mode === "gesimse") items = F.cornices.map((c, i) => [`c${i}`, c.name, `z ${fmt2(Math.min(...c.steps.map(t => t[0])))} bis ${fmt2(Math.max(...c.steps.map(t => t[1])))} · ${c.steps.length} Stufen${c.consoles ? " · Konsolen" : ""}`, { kind: "c", i }]);
    el.innerHTML = items.map(([id, t, sub, s], i) => {
      const on = sel && sel.kind === s.kind && (s.i === undefined ? sel.key === s.key : sel.i === s.i);
      return `<li class="${on ? "sel" : ""}"><span class="n">${pad(i + 1)}</span><span class="main"><b>${esc(t)}</b><span class="mono muted">${esc(sub)}</span></span><button type="button" class="small aside" data-pick="${i}">${on ? "Ausgewählt" : "Wählen"}</button></li>`;
    }).join("");
    $$("[data-pick]", el).forEach(b => b.addEventListener("click", () => { sel = items[+b.dataset.pick][3]; draw(); form(); list(); }));
  }

  function markDirty() {
    const any = Object.values(dirty).some(Boolean);
    $("#fsave").disabled = !any; $("#freset").disabled = !any;
    $$("#fform .tag.warn").forEach(t => t.hidden = !any);
  }
  function sortAxes(keep) {
    F.axes.sort((a, b) => a.u - b.u);
    if (sel && sel.kind === "a" && keep) sel.i = F.axes.indexOf(keep);
  }
  function delAxis() {
    if (!sel || sel.kind !== "a") return;
    F.axes.splice(sel.i, 1); sel = null; dirty.axes = true; markDirty(); draw(); form(); list();
  }
  function setMode(m) {
    mode = m; setPref("immoviz-fmode", m); sel = null;
    $$("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m));
    draw(); form(); list();
  }

  /* -------- Zeigen, Ziehen, Klicken */
  const pt = ev => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  let drag = null;
  svg.addEventListener("pointerdown", ev => {
    if (ev.button !== 0) return;
    const t = ev.target.closest("[data-k]"), p = pt(ev), m = M();
    drag = { x0: ev.clientX, y0: ev.clientY, moved: false, t: t ? { k: t.dataset.k, i: +t.dataset.i, key: t.dataset.key, part: t.dataset.part } : null, u: m.U(p.x), z: m.Z(p.y) };
    if (drag.t) {
      if (drag.t.k === "a" && mode === "achsen") drag.orig = F.axes[drag.t.i].u;
      else if (drag.t.k === "r" && mode === "zeilen") drag.orig = clone(F.rows[drag.t.key]);
      else if (drag.t.k === "c" && mode === "gesimse") drag.orig = clone(F.cornices[drag.t.i]);
      else drag.orig = null;
    }
    svg.setPointerCapture(ev.pointerId);
  });
  svg.addEventListener("pointermove", ev => {
    const p = pt(ev), m = M(), u = m.U(p.x), z = m.Z(p.y);
    $("#fcursor").textContent = `u ${fmt2(u)} m · z ${fmt2(z)} m${d.ground_wn != null ? ` · ${fmt2(z + d.ground_wn)} WrN` : ""}`;
    if (!drag) return;
    if (Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) > 3) drag.moved = true;
    if (!drag.moved || !drag.t || drag.orig == null) return;
    const free = ev.altKey, du = u - drag.u, dz = z - drag.z;
    if (drag.t.k === "a") {
      const a = F.axes[drag.t.i];
      a.u = snap(drag.orig + du, uLines(a), free);
      sel = { kind: "a", i: drag.t.i }; dirty.axes = true;
    } else if (drag.t.k === "r") {
      const r = F.rows[drag.t.key], o = drag.orig, lines = zLines(drag.t.key);
      if (drag.t.part === "top") r.h = Math.max(0.2, r2(snap(o.z + o.h + dz, lines, free) - o.z));
      else if (drag.t.part === "bottom") { const nz = Math.min(snap(o.z + dz, lines, free), o.z + o.h - 0.2); r.z = r2(nz); r.h = r2(o.z + o.h - nz); }
      else { r.z = snap(o.z + dz, lines, free); }
      sel = { kind: "r", key: drag.t.key }; dirty.rows = true;
    } else if (drag.t.k === "c") {
      const c = F.cornices[drag.t.i], o = drag.orig, z0 = Math.min(...o.steps.map(t => t[0]));
      const nz = snap(z0 + dz, zLines(`c${drag.t.i}`), free), sh = nz - z0;
      c.steps = o.steps.map(t => [r2(t[0] + sh), r2(t[1] + sh), t[2]]);
      if (o.consoles) c.consoles = { ...o.consoles, z: o.consoles.z.map(v => r2(v + sh)) };
      sel = { kind: "c", i: drag.t.i }; dirty.cornices = true;
    }
    markDirty(); draw();
  });
  svg.addEventListener("pointerup", ev => {
    const dr = drag; drag = null;
    if (!dr) return;
    if (dr.moved && dr.t && dr.orig != null) { if (dr.t.k === "a") sortAxes(F.axes[dr.t.i]); form(); list(); draw(); return; }
    if (dr.moved) return;
    const p = pt(ev), m = M();
    if (mode === "kalib") {
      if (!planImg) { toast("Erst eine PDF wählen"); return; }
      F.check.u0_px = [Math.round(p.x), Math.round(p.y)]; F.hasCheck = true; dirty.check = true;
      markDirty(); form(); draw(); toast("u = 0 / z = 0 gesetzt. Zum Prüfen auf Achsen wechseln."); return;
    }
    if (dr.t) {
      const t = dr.t;
      if (t.k === "a" && mode === "achsen") sel = { kind: "a", i: t.i };
      else if (t.k === "r" && mode === "zeilen") sel = { kind: "r", key: t.key };
      else if (t.k === "c" && mode === "gesimse") sel = { kind: "c", i: t.i };
      else if (t.k === "e" && mode === "eg") sel = { kind: "e", i: t.i };
      draw(); form(); list(); return;
    }
    if (mode === "achsen") {
      const u = snap(m.U(p.x), uLines(null), ev.altKey);
      if (u < -0.5 || u > F.L + 0.5) { toast("Außerhalb der Fassade"); return; }
      if (F.axes.some(a => Math.abs(a.u - u) < 0.2)) { toast("Zu nah an einer vorhandenen Achse"); return; }
      const a = { u, eg: null }; F.axes.push(a); sortAxes(); sel = { kind: "a", i: F.axes.indexOf(a) };
      dirty.axes = true; markDirty(); draw(); form(); list();
    } else if (mode === "eg") {
      const u = m.U(p.x); let best = -1, bd = 1e9;
      F.axes.forEach((a, i) => { const dd = Math.abs(a.u - u); if (dd < bd) { bd = dd; best = i; } });
      if (best >= 0 && bd < 1.2) { sel = { kind: "e", i: best }; draw(); form(); list(); }
    } else { sel = null; draw(); form(); list(); }
  });
  svg.addEventListener("pointerleave", () => { $("#fcursor").textContent = "u -, z -"; });
  const onKey = ev => {
    if (!document.body.contains(svg)) { document.removeEventListener("keydown", onKey); return; }
    if (/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
    if ((ev.key === "Delete" || ev.key === "Backspace") && sel && sel.kind === "a") { ev.preventDefault(); delAxis(); }
    if ((ev.key === "ArrowLeft" || ev.key === "ArrowRight") && sel && sel.kind === "a") {
      ev.preventDefault(); const a = F.axes[sel.i]; a.u = r2(a.u + (ev.key === "ArrowLeft" ? -GRID : GRID)); sortAxes(a); dirty.axes = true; markDirty(); draw(); form(); list();
    }
  };
  document.addEventListener("keydown", onKey);

  /* -------- Speichern */
  function payload() {
    const b = {};
    if (dirty.axes) {
      b.axes = F.axes.map(a => a.u);
      const groups = [];
      F.axes.forEach((a, i) => {
        if (!a.eg) return;
        const e = { type: a.eg.type, ...(a.eg.u ? { u: a.eg.u } : {}), ...(a.eg.z ? { z: a.eg.z } : {}), ...(a.eg.keller ? { keller: true } : {}) };
        const key = JSON.stringify(e), g = a.eg.u ? null : groups.find(x => x.key === key);
        if (g) g.e.axes.push(i); else groups.push({ key, e: { axes: [i], ...e } });
      });
      b.eg = groups.map(g => g.e);
    }
    if (dirty.rows) b.rows = F.rows;
    if (dirty.cornices) b.cornices = F.cornices;
    if (dirty.check) b.check = F.check;
    return b;
  }
  $("#fsave").addEventListener("click", async () => {
    try {
      d = await api(`/api/projects/${slug}/fassaden/${encodeURIComponent(F.name)}`, { method: "PUT", body: payload() });
      const m0 = mode; load(F.name); mode = m0; await loadPlan(); draw(); form(); list(); markDirty();
      toast("Gespeichert, Sicherung in .history angelegt");
    } catch (e) { toast(e.message); }
  });
  $("#freset").addEventListener("click", async () => { if (!confirm("Änderungen verwerfen?")) return; load(F.name); await loadPlan(); draw(); form(); list(); markDirty(); });
  $("#fsel").addEventListener("change", async e => {
    if (Object.values(dirty).some(Boolean) && !confirm("Ungespeicherte Änderungen verwerfen?")) { e.target.value = F.name; return; }
    load(e.target.value); await loadPlan(); draw(); form(); list();
  });
  $$("[data-mode]").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $$("[data-fzoom]").forEach(b => b.addEventListener("click", () => { zoom = +b.dataset.fzoom; setPref("immoviz-fzoom", String(zoom)); $$("[data-fzoom]").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); }));
  $("#fop").addEventListener("input", e => { opacity = +e.target.value; setPref("immoviz-fop", String(opacity)); draw(); });
  window.onbeforeunload = () => Object.values(dirty).some(Boolean) ? true : undefined;
  await loadPlan();
  setMode(MODES.some(x => x[0] === mode) ? mode : "achsen");
  if (!M().calibrated && F.check.pdf && d.pdfs.includes(F.check.pdf) && !F.hasCheck) setMode("kalib");
  box.scrollLeft = 0;
}

/* ------------------------------------------------------------ Dach-Editor */
const DACH_TABS = [["walls", "Wände"], ["slopes", "Schrägen"], ["volumes", "Volumen"], ["railings", "Geländer"], ["slabs", "Decken"]];
const DACH_NEW = {
  walls: f => ({ facade: f, u: [1.0, 5.0], z: [16.0, 19.0], d: 0.7, windows: [] }),
  slopes: f => ({ facade: f, u: [1.0, 5.0], z: [19.0, 22.0], d: [0.7, 3.0], roof_windows: [] }),
  volumes: f => ({ z: [16.0, 19.0], clip: [[f, "d", ">=", 0.7]] }),
  railings: f => ({ facade: f, u: [1.0, 5.0], z: 19.0, d: 0.85, h: 1.1, type: "glas" }),
  slabs: f => ({ z: 19.0, t: 0.3, clip: [[f, "d", ">=", 0.7]] }),
};
const FIELD_LABEL = { facade: "Fassade", u: "u von, bis (m)", z: "z (m)", d: "Rücksprung d (m)", windows: "Fenster [{u, z}]", loggias: "Loggien", axes_from: "Achsen von", w: "Fensterbreite", rows: "Fensterreihen [[z von, z bis]]", roof_windows: "Dachfenster [{u, z}]", clip: "Clip-Regeln [Fassade, u|d, >=|<=, Wert]", h: "Höhe h (m)", type: "Typ", t: "Stärke t (m)" };

async function viewDach(slug) {
  renderNav(slug, "dach");
  document.title = "Dach · immoviz Studio";
  let d = await api(`/api/projects/${slug}/dach`);
  let tab = getPref("immoviz-dtab", "walls"), fac = getPref(`immoviz-dfac-${slug}`, d.fassaden[0]?.name || "");
  if (!d.fassaden.some(f => f.name === fac)) fac = d.fassaden[0]?.name || "";
  let items = clone(d.listen[tab] || []), sel = items.length ? 0 : null, dirty = false;
  view.innerHTML = `<section>${sechead("01", "Dach", "Dach-Editor", "Dachgeschosse als Listen aus <span class=\"mono\">dach</span> in project.yaml. Die Skizze zeigt je Fassade die Einträge in der Ansicht (u gegen z). Speichern ersetzt nur die gewählte Liste (Sicherung in .history).",
      `<button type="button" id="dsave" class="primary" disabled>Liste speichern</button><button type="button" id="dreset" disabled>Verwerfen</button>`)}
    <div class="plantools"><div class="seg seg-wrap" role="group" aria-label="Liste">${DACH_TABS.map(([k, l]) => `<button type="button" data-dtab="${k}" aria-pressed="${k === tab}">${l} <span class="muted">${(d.listen[k] || []).length}</span></button>`).join("")}</div>
      <div class="seg" role="group" aria-label="Fassade">${d.fassaden.map(f => `<button type="button" data-dfac="${esc(f.name)}" aria-pressed="${f.name === fac}">${esc(f.name)}</button>`).join("")}</div></div>
    <div class="editor">
      <div class="planbox"><div class="plan"><svg id="dsvg" role="img" aria-label="Schnittskizze der Dachgeschosse"></svg></div>
        <div class="legend label"><span><i class="sw dk-alt"></i>Altbau</span><span><i class="sw dk-wall"></i>Wand</span><span><i class="sw dk-slope"></i>Schräge</span><span><i class="sw dk-rail"></i>Geländer</span><span><i class="sw dk-vol"></i>Volumen, Decke</span></div></div>
      <div class="side"><div class="edform" id="dform"></div><ul class="rows camlist" id="dlist"></ul>
        <div class="acts"><button type="button" class="small" id="dadd">Neuer Eintrag</button><button type="button" class="small" id="ddup">Duplizieren</button></div></div>
    </div></section>`;
  const svg = $("#dsvg");

  function onFacade(it) {
    if (it.facade) return it.facade === fac;
    return true;
  }
  function uRangeFromClip(it, L) {
    let a = 0, b = L;
    (it.clip || []).forEach(c => { if (Array.isArray(c) && c[0] === fac && c[1] === "u") { if (c[2] === ">=") a = Math.max(a, +c[3]); else b = Math.min(b, +c[3]); } });
    return [a, b];
  }
  function draw() {
    const f = d.fassaden.find(x => x.name === fac) || { laenge: 20, axes: [] };
    const L = f.laenge || 20, H0 = d.height || 16;
    const all = DACH_TABS.flatMap(([k]) => (k === tab ? items : d.listen[k] || []).map(it => ({ k, it })));
    const zs = all.flatMap(({ it }) => [].concat(it.z || []).map(v => +v + (it.h || 0))).filter(Number.isFinite);
    const zMin = Math.max(0, H0 - 4), zMax = Math.max(H0 + 4, ...zs) + 1.5;
    const pad_ = 1.5, W = L + 2 * pad_, Hh = zMax - zMin;
    const X = u => u + pad_, Y = z => zMax - z;
    svg.setAttribute("viewBox", `0 0 ${W} ${Hh}`);
    svg.style.aspectRatio = `${W} / ${Hh}`;
    const s = W / 600;
    let g = `<rect class="pl-bg" x="0" y="0" width="${W}" height="${Hh}"/>`;
    g += `<rect class="dk-alt" x="${X(0)}" y="${Y(H0)}" width="${L}" height="${H0 - zMin + 1}"/>`;
    g += (f.axes || []).map(u => `<line class="dk-ax" x1="${X(u)}" x2="${X(u)}" y1="${Y(H0)}" y2="${Y(zMin)}" stroke-width="${s}"/>`).join("");
    [H0, ...(d.slabs || [])].filter(z => z >= zMin).forEach(z => { g += `<text class="dk-t" x="${0.2}" y="${Y(z) - 0.15}" font-size="${11 * s}">${fmt2(z)}</text>`; });
    all.forEach(({ k, it }, j) => {
      const isSel = k === tab && sel !== null && items[sel] === it;
      if (!onFacade(it)) return;
      const cls = (c) => `${c}${isSel ? " sel" : ""}`;
      const idx = k === tab ? `data-di="${items.indexOf(it)}"` : "";
      if (k === "walls" && Array.isArray(it.u) && Array.isArray(it.z)) {
        g += `<rect ${idx} class="${cls("dk-wall")}" x="${X(it.u[0])}" y="${Y(it.z[1])}" width="${it.u[1] - it.u[0]}" height="${it.z[1] - it.z[0]}" stroke-width="${(isSel ? 2.5 : 1) * s}"/>`;
        (it.windows || []).forEach(w => { if (w.u && w.z) g += `<rect class="dk-win" x="${X(w.u[0])}" y="${Y(w.z[1])}" width="${w.u[1] - w.u[0]}" height="${w.z[1] - w.z[0]}" stroke-width="${s}"/>`; });
        if (it.axes_from && it.rows) (f.axes || []).filter(u => u >= it.u[0] && u <= it.u[1]).forEach(u => it.rows.forEach(r => { g += `<rect class="dk-win" x="${X(u - (it.w || 1) / 2)}" y="${Y(r[1])}" width="${it.w || 1}" height="${r[1] - r[0]}" stroke-width="${s}"/>`; }));
        (it.loggias || []).forEach(l => { if (l.u && l.z) g += `<rect class="dk-log" x="${X(l.u[0])}" y="${Y(l.z[1])}" width="${l.u[1] - l.u[0]}" height="${l.z[1] - l.z[0]}" stroke-width="${s}"/>`; });
        g += `<text class="dk-t" x="${X(it.u[0]) + 0.15}" y="${Y(it.z[1]) + 0.6}" font-size="${10 * s}">d ${fmt2(it.d)}</text>`;
      } else if (k === "slopes" && Array.isArray(it.u) && Array.isArray(it.z)) {
        g += `<rect ${idx} class="${cls("dk-slope")}" x="${X(it.u[0])}" y="${Y(it.z[1])}" width="${it.u[1] - it.u[0]}" height="${it.z[1] - it.z[0]}" stroke-width="${(isSel ? 2.5 : 1) * s}"/>`;
        (it.roof_windows || []).forEach(w => { if (w.u && w.z) g += `<rect class="dk-win" x="${X(w.u[0])}" y="${Y(w.z[1])}" width="${w.u[1] - w.u[0]}" height="${w.z[1] - w.z[0]}" stroke-width="${s}"/>`; });
        g += `<text class="dk-t" x="${X(it.u[0]) + 0.15}" y="${Y(it.z[1]) + 0.6}" font-size="${10 * s}">d ${Array.isArray(it.d) ? it.d.map(fmt2).join(" bis ") : ""}</text>`;
      } else if (k === "railings" && Array.isArray(it.u)) {
        g += `<rect ${idx} class="${cls("dk-rail")}" x="${X(it.u[0])}" y="${Y(+it.z + (+it.h || 1))}" width="${it.u[1] - it.u[0]}" height="${+it.h || 1}" stroke-width="${(isSel ? 2.5 : 1.2) * s}"/>`;
      } else if (k === "volumes" && Array.isArray(it.z)) {
        const [a, b] = uRangeFromClip(it, L);
        g += `<rect ${idx} class="${cls("dk-vol")}" x="${X(a)}" y="${Y(it.z[1])}" width="${Math.max(0, b - a)}" height="${it.z[1] - it.z[0]}" stroke-width="${(isSel ? 2.5 : 1) * s}"/>`;
      } else if (k === "slabs" && typeof it.z === "number") {
        const [a, b] = uRangeFromClip(it, L);
        g += `<rect ${idx} class="${cls("dk-vol")}" x="${X(a)}" y="${Y(it.z)}" width="${Math.max(0, b - a)}" height="${it.t || 0.3}" stroke-width="${(isSel ? 2.5 : 1) * s}"/>`;
      }
    });
    g += `<g class="pl-scale"><line x1="${X(0)}" x2="${X(5)}" y1="${Hh - 0.4}" y2="${Hh - 0.4}"/><text x="${X(0)}" y="${Hh - 0.6}" font-size="${11 * s}">5 m</text></g>`;
    svg.innerHTML = g;
    $$("[data-di]", svg).forEach(el => el.addEventListener("click", () => { sel = +el.dataset.di; draw(); form(); list(); }));
  }

  function summary(it) {
    const p = v => Array.isArray(v) ? v.map(fmt2).join(" bis ") : v != null ? fmt2(v) : "";
    const parts = [];
    if (it.facade) parts.push(it.facade);
    if (it.u) parts.push("u " + p(it.u));
    if (it.z != null) parts.push("z " + p(it.z));
    if (it.d != null) parts.push("d " + p(it.d));
    if (it.h != null) parts.push("h " + p(it.h));
    if (it.windows) parts.push(`${it.windows.length} Fenster`);
    if (it.roof_windows) parts.push(`${it.roof_windows.length} Dachfenster`);
    if (it.clip) parts.push(`${it.clip.length} Clip`);
    return parts.join(" · ");
  }
  function list() {
    $("#dlist").innerHTML = items.map((it, i) => `<li class="${sel === i ? "sel" : ""}"><span class="n">${pad(i + 1)}</span><span class="main"><b>${esc(DACH_TABS.find(t => t[0] === tab)[1])} ${i + 1}</b><span class="mono muted">${esc(summary(it))}</span></span><button type="button" class="small aside" data-dpick="${i}">${sel === i ? "Ausgewählt" : "Wählen"}</button></li>`).join("")
      || `<li><span class="n">00</span><span class="main muted">Keine Einträge.</span></li>`;
    $$("[data-dpick]").forEach(b => b.addEventListener("click", () => { sel = +b.dataset.dpick; const it = items[sel]; if (it.facade && it.facade !== fac) setFac(it.facade); draw(); form(); list(); }));
  }
  function form() {
    const f = $("#dform");
    $("#dsave").disabled = !dirty; $("#dreset").disabled = !dirty;
    if (sel === null || !items[sel]) { f.innerHTML = `<div class="edhead"><span class="label">${esc(DACH_TABS.find(t => t[0] === tab)[1])}</span></div><p class="muted small">Eintrag in der Liste oder in der Skizze wählen, oder neu anlegen.</p>`; return; }
    const it = items[sel], schema = d.schema[tab], keys = [...new Set([...Object.keys(schema), ...Object.keys(it)])];
    const fld = k => {
      const kind = schema[k] || "list", v = it[k], lbl = esc(FIELD_LABEL[k] || k), req = (d.pflicht[tab] || []).includes(k) ? " *" : "";
      if (kind === "fassade") return `<label class="fl"><span class="label">${lbl}${req}</span><select class="field" name="${k}">${d.fassaden.map(x => `<option ${x.name === v ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</select></label>`;
      if (kind === "pair" || (k === "d" && Array.isArray(v))) return `<fieldset class="fl"><legend class="label">${lbl}${req}</legend><div class="duo"><input class="field" type="number" step="0.01" name="${k}.0" value="${Array.isArray(v) ? v[0] : ""}" aria-label="${k} von"><input class="field" type="number" step="0.01" name="${k}.1" value="${Array.isArray(v) ? v[1] : ""}" aria-label="${k} bis"></div></fieldset>`;
      if (kind === "num") return `<label class="fl"><span class="label">${lbl}${req}</span><input class="field" type="number" step="0.01" name="${k}" value="${v ?? ""}"></label>`;
      if (kind === "str") return `<label class="fl"><span class="label">${lbl}</span><input class="field" type="text" name="${k}" value="${esc(v ?? "")}" maxlength="40"></label>`;
      return `<label class="fl"><span class="label">${lbl} (JSON)</span><textarea class="field mono json" name="${k}" rows="${Math.min(8, Math.max(2, Math.ceil(JSON.stringify(v ?? []).length / 60)))}" spellcheck="false">${esc(JSON.stringify(v ?? []))}</textarea></label>`;
    };
    f.innerHTML = `<div class="edhead"><span class="label">${esc(DACH_TABS.find(t => t[0] === tab)[1])} ${sel + 1}</span><span class="tag warn" ${dirty ? "" : "hidden"}>ungespeichert</span></div>
      ${keys.map(fld).join("")}<p class="muted small" id="derr"></p>
      <div class="acts"><button type="button" class="ghost danger" data-ddel>Eintrag löschen</button></div>`;
    f.oninput = e => {
      const k = e.target.name, err = $("#derr");
      err.textContent = "";
      if (!k) return;
      if (k.includes(".")) {
        const [kk, i] = k.split("."), v = parseFloat(e.target.value);
        if (!Array.isArray(it[kk])) it[kk] = [0, 0];
        it[kk][+i] = Number.isFinite(v) ? v : it[kk][+i];
      } else if (e.target.classList.contains("json")) {
        try { it[k] = JSON.parse(e.target.value || "[]"); e.target.removeAttribute("aria-invalid"); }
        catch (_) { e.target.setAttribute("aria-invalid", "true"); err.textContent = `${k}: kein gültiges JSON`; return; }
      } else if (e.target.type === "number") {
        const v = parseFloat(e.target.value); if (Number.isFinite(v)) it[k] = v; else delete it[k];
      } else { it[k] = e.target.value; if (k === "facade") setFac(it.facade); }
      dirty = true; $("#dsave").disabled = false; $("#dreset").disabled = false; $$("#dform .tag.warn").forEach(t => t.hidden = false); draw(); list();
    };
    $("[data-ddel]", f).addEventListener("click", () => { items.splice(sel, 1); sel = items.length ? Math.min(sel, items.length - 1) : null; dirty = true; draw(); form(); list(); });
  }
  function setFac(n) { fac = n; setPref(`immoviz-dfac-${slug}`, n); $$("[data-dfac]").forEach(b => b.setAttribute("aria-pressed", b.dataset.dfac === n)); }
  $$("[data-dtab]").forEach(b => b.addEventListener("click", () => {
    if (dirty && !confirm("Ungespeicherte Änderungen verwerfen?")) return;
    tab = b.dataset.dtab; setPref("immoviz-dtab", tab); items = clone(d.listen[tab] || []); sel = items.length ? 0 : null; dirty = false;
    $$("[data-dtab]").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); form(); list();
  }));
  $$("[data-dfac]").forEach(b => b.addEventListener("click", () => { setFac(b.dataset.dfac); draw(); }));
  $("#dadd").addEventListener("click", () => { items.push(DACH_NEW[tab](fac)); sel = items.length - 1; dirty = true; draw(); form(); list(); });
  $("#ddup").addEventListener("click", () => { if (sel === null) return; items.splice(sel + 1, 0, clone(items[sel])); sel++; dirty = true; draw(); form(); list(); });
  $("#dreset").addEventListener("click", () => { items = clone(d.listen[tab] || []); sel = items.length ? 0 : null; dirty = false; draw(); form(); list(); });
  $("#dsave").addEventListener("click", async () => {
    try {
      d = await api(`/api/projects/${slug}/dach/${tab}`, { method: "PUT", body: { eintraege: items } });
      items = clone(d.listen[tab] || []); dirty = false; if (sel !== null && sel >= items.length) sel = items.length - 1;
      $$("[data-dtab]").forEach(b => { $(".muted", b).textContent = (d.listen[b.dataset.dtab] || []).length; });
      draw(); form(); list(); toast("Gespeichert, Sicherung in .history angelegt");
    } catch (e) { toast(e.message); }
  });
  draw(); form(); list();
}

/* ------------------------------------------------------------ Planabgleich */
async function viewAbgleich(slug) {
  renderNav(slug, "abgleich");
  document.title = "Planabgleich · immoviz Studio";
  const draw = async () => {
    const d = await api(`/api/projects/${slug}/abgleich`);
    if (!location.hash.includes("/abgleich")) return false;
    const active = d.jobs.filter(j => ["wartet", "laeuft"].includes(j.status));
    const dry = d.trockenlauf_erzwungen || getPref("immoviz-dry", "0") === "1";
    view.innerHTML = `<section>${sechead("01", "Planabgleich", "Modell gegen Straßenansicht", "Rendert das Modell orthogonal im Planmaßstab (<span class=\"mono\">immoviz.py check</span>) und legt es über die Ansicht. Der Schieberegler blendet zwischen Plan und Modell. Läuft über die Render-Queue.",
        `<label class="check"><input type="checkbox" id="adry" ${dry ? "checked" : ""} ${d.trockenlauf_erzwungen ? "disabled" : ""}> Trockenlauf</label><a class="btn" href="#/p/${esc(slug)}/fassaden">Fassaden-Editor</a>`)}
      ${d.trockenlauf_erzwungen ? `<div class="notice"><span class="dot"></span>Studio läuft im Trockenlauf-Modus: der Abgleich startet kein Blender, vorhandene Bilder bleiben.</div>` : ""}
      ${d.fassaden.length ? d.fassaden.map(f => {
        const job = d.jobs.find(j => j.light === f.fassade);
        const run = job && ["wartet", "laeuft"].includes(job.status);
        return `<div class="abg">
          <div class="wthead"><h3>${esc(f.fassade)}</h3><span class="kv">${job ? tag(job.status, job.status === "fertig" ? `zuletzt ${fmtTime(job.beendet)}` : null) : ""}${f.abgleich ? `<span class="tag plain">Bild ${esc(f.abgleich.datum)}</span>` : ""}
            <button type="button" class="primary small" data-run="${esc(f.fassade)}" ${run ? "disabled" : ""}>${run ? "läuft" : "Planabgleich prüfen"}</button></span></div>
          ${f.modell && f.groesse ? `<div class="cmp" style="aspect-ratio:${f.groesse[0]} / ${f.groesse[1]}" data-cmp>
              <img src="${esc(f.plan)}" alt="Plan ${esc(f.fassade)}" class="cmp-plan">
              <img src="${esc(f.modell.url)}" alt="Modell ${esc(f.fassade)}" class="cmp-model">
              <span class="cmp-line"></span><span class="tag plain cmp-l">Plan</span><span class="tag plain cmp-r">Modell</span></div>
            <label class="fl"><span class="label">Plan oder Modell</span><input type="range" min="0" max="100" value="50" data-slide aria-label="Schieberegler Plan oder Modell"></label>
            <div class="acts">${f.abgleich ? `<a class="btn small" href="${esc(f.abgleich.url)}" target="_blank" rel="noopener">Überlagerung rot/blau öffnen</a>` : ""}<a class="btn small" href="${esc(f.plan)}" target="_blank" rel="noopener">Planausschnitt</a></div>`
          : f.abgleich ? `<img class="abgimg" src="${esc(f.abgleich.url)}" alt="Abgleich ${esc(f.fassade)}">` : `<p class="muted">Noch kein Abgleich. Fassade im Fassaden-Editor kalibrieren, dann prüfen.</p>`}
        </div>`;
      }).join("") : `<div class="empty-state"><span class="label">Leer</span><p class="muted">Keine Fassade mit <span class="mono">checks</span> in project.yaml. Im Fassaden-Editor unter „Plan kalibrieren“ anlegen.</p></div>`}
      ${active.length ? `<p class="muted">${active.length} Abgleich-Job läuft, die Ansicht aktualisiert sich.</p>` : ""}</section>`;
    $("#adry")?.addEventListener("change", e => setPref("immoviz-dry", e.target.checked ? "1" : "0"));
    $$("[data-run]").forEach(b => b.addEventListener("click", async () => {
      b.disabled = true;
      try { const j = await api(`/api/projects/${slug}/abgleich`, { method: "POST", body: { fassade: b.dataset.run, dry_run: getPref("immoviz-dry", "0") === "1" } }); toast(j.trockenlauf ? "Trockenlauf eingereiht" : "Planabgleich eingereiht"); draw(); }
      catch (e) { toast(e.message); b.disabled = false; }
    }));
    $$("[data-slide]").forEach(r => {
      const cmp = r.closest(".abg").querySelector("[data-cmp]");
      const set = v => { cmp.style.setProperty("--cut", v + "%"); };
      r.addEventListener("input", () => set(r.value)); set(r.value);
    });
    return active.length > 0;
  };
  let busy = await draw();
  timers.push(setInterval(async () => { if (!document.hidden && busy) busy = await draw(); }, 2000));
}

/* ------------------------------------------------------------ Neues Objekt */
async function viewNeu() {
  renderNav(null);
  document.title = "Neues Objekt · immoviz Studio";
  const info = await api("/api/info");
  view.innerHTML = `<section>${sechead("01", "Neues Objekt", "Objekt anlegen", "Legt <span class=\"mono\">projects/&lt;slug&gt;/</span> mit <span class=\"mono\">project.yaml</span> aus der Vorlage (<span class=\"mono\">projects/_vorlage</span>) und den Ordnern quellen, data, renders an. Danach: Pläne im Intake hochladen, Fassaden und Dach im Editor aufnehmen.", `<a class="btn" href="#/">Abbrechen</a>`)}
    <div class="editor">
      <form id="nf" class="edform" autocomplete="off">
        <div class="duo"><label class="fl"><span class="label">Slug *</span><input class="field" type="text" name="slug" required pattern="[a-z0-9][a-z0-9-]{1,60}" placeholder="hauptstrasse-12"><small class="muted">Ordnername: a bis z, 0 bis 9, Bindestrich</small></label>
          <label class="fl"><span class="label">Name</span><input class="field" type="text" name="name" placeholder="z. B. Das Wimmer"></label></div>
        <label class="fl"><span class="label">Adresse *</span><input class="field" type="text" name="adresse" required placeholder="Straße Nr., PLZ Ort"></label>
        <label class="fl"><span class="label">Auftraggeber</span><input class="field" type="text" name="kunde" placeholder="z. B. UNIO / Bauträger"></label>
        <fieldset class="fl"><legend class="label">Ursprung: Gebäudeecke in GK Ost (EPSG:31256) *</legend><div class="duo"><input class="field" type="number" step="0.01" name="gx" required placeholder="x, z. B. 1955,97" aria-label="GK x"><input class="field" type="number" step="0.01" name="gy" required placeholder="y, z. B. 338546,50" aria-label="GK y"></div>
          <small class="muted">aus dem Baukörpermodell (Stadt Wien) oder ViennaGIS ablesen</small></fieldset>
        <label class="fl"><span class="label">Fassadenrichtung: Fassade A gegen Ost (Grad, gegen den Uhrzeigersinn) *</span><input class="field" type="number" step="0.01" name="deg" required value="0"></label>
        <fieldset class="fl"><legend class="label">Fassade A (vom Ursprung entlang +x) *</legend><div class="duo"><input class="field" type="text" name="fa" required pattern="[a-z0-9_]+" placeholder="name, z. B. hauptstrasse" aria-label="Name Fassade A"><input class="field" type="number" step="0.01" name="la" required placeholder="Länge m" aria-label="Länge Fassade A"></div></fieldset>
        <fieldset class="fl"><legend class="label">Fassade B an der Ecke (optional, entlang +y zum Ursprung)</legend><div class="duo"><input class="field" type="text" name="fb" pattern="[a-z0-9_]+" placeholder="name" aria-label="Name Fassade B"><input class="field" type="number" step="0.01" name="lb" placeholder="Länge m" aria-label="Länge Fassade B"></div></fieldset>
        <label class="check"><input type="checkbox" name="geo" checked> Umgebung laden (<span class="mono">immoviz.py geo</span> über die Queue)</label>
        <label class="check"><input type="checkbox" name="dry" ${info.trockenlauf_erzwungen ? "checked disabled" : ""}> Trockenlauf (keine Abfrage bei Stadt Wien)</label>
        <div class="acts"><button type="submit" class="primary">Objekt anlegen</button></div>
      </form>
      <div class="planbox"><div class="plan"><svg id="nsvg" viewBox="-30 -30 60 60" role="img" aria-label="Skizze Lage der Fassaden"></svg></div>
        <p class="muted small">Skizze im lokalen System: Ursprung an der Gebäudeecke, Fassade A entlang x, Fassade B entlang y. Norden zeigt der Pfeil. Das Gebäude liegt im Bereich x &gt; 0, y &gt; 0.</p></div>
    </div></section>`;
  const f = $("#nf"), svg = $("#nsvg");
  const sk = () => {
    const fd = new FormData(f), n = k => parseFloat(String(fd.get(k) || "").replace(",", "."));
    const la = n("la") || 20, lb = n("lb") || 0, r = (n("deg") || 0) * Math.PI / 180, S = Math.max(la, lb, 10) * 1.4;
    const nx = Math.sin(r), ny = Math.cos(r);
    svg.setAttribute("viewBox", `${-S * 0.35} ${-S * 0.9} ${S * 1.3} ${S * 1.2}`);
    svg.innerHTML = `<rect class="pl-bg" x="${-S}" y="${-S * 2}" width="${S * 4}" height="${S * 4}"/>
      <polygon class="nk-bld" points="0,0 ${la},0 ${la},${-Math.max(lb, 10)} 0,${-Math.max(lb, 10)}"/>
      <line class="nk-fa" x1="0" y1="0" x2="${la}" y2="0"/>${lb ? `<line class="nk-fb" x1="0" y1="${-lb}" x2="0" y2="0"/>` : ""}
      <text class="nk-t" x="${la / 2}" y="${S * 0.06}" font-size="${S * 0.045}" text-anchor="middle">${esc(fd.get("fa") || "Fassade A")} ${fmtNum(la, 2)} m</text>
      ${lb ? `<text class="nk-t" x="${-S * 0.03}" y="${-lb / 2}" font-size="${S * 0.045}" text-anchor="end">${esc(fd.get("fb") || "B")}</text>` : ""}
      <circle class="nk-o" cx="0" cy="0" r="${S * 0.012}"/>
      <g class="pl-north"><line x1="${S * 0.8}" y1="${-S * 0.65}" x2="${S * 0.8 + nx * S * 0.12}" y2="${-S * 0.65 - ny * S * 0.12}" stroke="currentColor" stroke-width="${S * 0.008}"/>
        <text x="${S * 0.8 + nx * S * 0.17}" y="${-S * 0.65 - ny * S * 0.17}" font-size="${S * 0.05}" text-anchor="middle" dominant-baseline="middle">N</text></g>`;
  };
  f.addEventListener("input", sk); sk();
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(f), n = k => parseFloat(String(fd.get(k) || "").replace(",", "."));
    const body = { slug: String(fd.get("slug")).trim(), name: fd.get("name") || "", adresse: fd.get("adresse"), kunde: fd.get("kunde") || "",
      origin_gk: [n("gx"), n("gy")], x_axis_deg: n("deg"), fassade_a: { name: fd.get("fa"), laenge: n("la") },
      fassade_b: fd.get("fb") ? { name: fd.get("fb"), laenge: n("lb") } : null, geo: !!fd.get("geo"), dry_run: !!fd.get("dry") || info.trockenlauf_erzwungen };
    try {
      const r = await api("/api/projects", { method: "POST", body });
      toast(r.job ? "Objekt angelegt, Umgebung in der Queue" : "Objekt angelegt");
      location.hash = `#/p/${encodeURIComponent(r.slug)}/fassaden`;
    } catch (err) { toast(err.message); }
  });
}
