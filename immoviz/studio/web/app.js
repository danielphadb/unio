/* immoviz Studio: Bildschirme Projekte, Übersicht, Intake, Shotlist, Queue, Galerie. Hash-Routing, kein Build-Schritt.
   Kamera- und Licht-Editor stehen in editor.js, Fassaden, Dach, Abgleich und Neues Objekt in fassade.js,
   Higgsfield-Dialoge in veredeln.js. */
const view = $("#view");
const pnav = $("#pnav");
let timers = [];
const state = { info: null, gallery: null, slug: null };

function clearTimers() { timers.forEach(clearInterval); timers = []; }
function getPref(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (_) { return d; } }
function setPref(k, v) { try { localStorage.setItem(k, v); } catch (_) {} }

const TABS = [
  ["", "Übersicht"], ["intake", "Intake"], ["fassaden", "Fassaden"], ["dach", "Dach"], ["abgleich", "Abgleich"],
  ["shotlist", "Shotlist"], ["kameras", "Kameras"], ["licht", "Licht"], ["queue", "Queue"], ["galerie", "Galerie"],
];
const STEP_LINK = { 1: "intake", 3: "fassaden", 4: "dach", 5: "abgleich", 7: "shotlist", 8: "queue", 9: "galerie", 10: "galerie" };

function renderNav(slug, active) {
  if (!slug) { pnav.hidden = true; return; }
  pnav.hidden = false;
  pnav.innerHTML = TABS.map(([k, l], i) =>
    `<a href="#/p/${esc(slug)}${k ? "/" + k : ""}" ${k === active ? 'aria-current="page"' : ""}><span class="n">${pad(i + 1)}</span>${esc(l)}</a>`
  ).join("") + `<a href="/kunde?p=${encodeURIComponent(slug)}" target="_blank" rel="noopener"><span class="n">${pad(TABS.length + 1)}</span>Kundenansicht ↗</a>`;
  const cur = pnav.querySelector('[aria-current="page"]');
  if (cur) pnav.scrollLeft = Math.max(0, cur.offsetLeft - 16);
}

function sechead(num, label, title, text, act = "") {
  return `<div class="sechead"><div class="marg"><span class="num">${esc(num)}</span><span class="label">${esc(label)}</span></div>
    <h2>${esc(title)}</h2>${text ? `<p class="muted">${text}</p>` : ""}${act ? `<div class="act">${act}</div>` : ""}</div>`;
}

function errorView(e) {
  view.innerHTML = `<div class="empty-state"><span class="label">Fehler</span><h2>Das hat nicht geklappt.</h2><p class="muted">${esc(e.message || e)}</p><a href="#/">Zur Projektliste</a></div>`;
}

/* ------------------------------------------------------------ 01 Projekte */
async function viewProjects() {
  renderNav(null);
  const ps = await api("/api/projects");
  document.title = "Projekte · immoviz Studio";
  view.innerHTML = `
    <div class="head" style="margin-bottom:var(--sp-7)">
      <div class="intro"><h1>Projekte</h1>
        <div class="marg label"><span class="dot" aria-hidden="true"></span>Visualisierung · Vertrieb</div>
        <p class="muted">Jedes Objekt durchläuft zehn Schritte von den Plänen bis zur Freigabe. Blender liefert die Wahrheit, die Bild-KI das Finish.</p></div>
      <dl class="stamp"><div><dt>Projekte</dt><dd>${ps.length}</dd></div>
        <div><dt>Bilder gesamt</dt><dd>${ps.reduce((a, p) => a + (p.bilder || 0), 0)}</dd></div>
        <div><dt>Freigegeben</dt><dd>${ps.reduce((a, p) => a + (p.freigegeben || 0), 0)}</dd></div></dl>
    </div>
    <section>${sechead("01", "Objekte", "Alle Objekte", "Ein neues Objekt bekommt einen Ordner unter <span class=\"mono\">projects/</span> mit <span class=\"mono\">project.yaml</span> aus der Vorlage.", `<a class="btn primary" href="#/neu">Neues Objekt</a>`)}
    <div class="projects">${ps.map(p => p.fehler ? `<div class="pcard"><h3>${esc(p.name)}</h3><p class="muted">${esc(p.fehler)}</p></div>` : `
      <a class="pcard" href="#/p/${esc(p.slug)}">
        <div class="thumbs">${(p.letzte.length ? p.letzte.slice(0, 3) : [{}]).map(m => m.thumb ? `<img src="${esc(m.thumb)}" alt="" loading="lazy">` : `<img alt="">`).join("")}</div>
        <div style="display:grid;gap:6px"><div class="row" style="display:flex;justify-content:space-between;gap:12px;align-items:baseline"><h3>${esc(p.name)}</h3><span class="mono muted">${p.fortschritt}/10</span></div>
          <span class="muted" style="font-size:14px">${esc(p.adresse)}</span></div>
        <div class="progress" aria-label="Fortschritt ${p.fortschritt} von 10">${p.schritte.map(s => `<i class="${s.status}" title="${pad(s.nr)} ${esc(s.name)}: ${esc(s.status)}"></i>`).join("")}</div>
        <div class="kv"><span class="tag plain">${p.bilder} Bilder</span><span class="tag plain">${p.videos} Videos</span>${tag(p.freigegeben ? "freigegeben" : "offen", p.freigegeben + " freigegeben")}${p.offene_punkte.length ? tag("annahme", p.offene_punkte.length + " Intake offen") : ""}</div>
      </a>`).join("")}</div></section>`;
}

/* ------------------------------------------------------------ 02 Übersicht */
async function viewOverview(slug) {
  renderNav(slug, "");
  const p = await api(`/api/projects/${slug}`);
  document.title = `${p.name} · immoviz Studio`;
  const opts = (cur) => [["automatisch", "auto"], ["offen", "offen"], ["laeuft", "läuft"], ["annahme", "Annahme"], ["fertig", "fertig"]]
    .map(([v, l]) => `<option value="${v}" ${v === cur ? "selected" : ""}>${l}</option>`).join("");
  view.innerHTML = `
    <div class="head" style="margin-bottom:var(--sp-7)">
      <div class="intro"><h1>${esc(p.name)}</h1>
        <div class="marg label"><span class="dot" aria-hidden="true"></span>${esc(p.adresse)}</div>
        <p class="muted">Stand der zehn Schritte, abgeleitet aus den Dateien im Projektordner. Ein Status lässt sich je Schritt von Hand setzen und gilt dann vor der Ableitung.</p></div>
      <dl class="stamp">
        <div><dt>Auftraggeber</dt><dd>${esc(p.kunde)}</dd></div>
        <div><dt>Fortschritt</dt><dd>${p.fortschritt} von 10</dd></div>
        <div><dt>Motive × Licht</dt><dd>${p.kameras} × ${p.lichter}</dd></div>
        <div><dt>Bilder / Videos</dt><dd>${p.bilder} / ${p.videos}</dd></div>
        <div><dt>Freigegeben / abgelehnt</dt><dd>${p.freigegeben} / ${p.abgelehnt}</dd></div>
      </dl>
    </div>
    <section>${sechead("01", "Ablauf", "Stand der zehn Schritte")}
      <ol class="steps">${p.schritte.map(s => `
        <li><div class="row"><span class="n">${pad(s.nr)}</span>${tag(s.status)}</div>
          <h3>${esc(s.name)}</h3><small>${esc(s.hinweis)}</small>
          <div class="row"><span class="src">${s.quelle === "automatisch" ? "abgeleitet" : esc(s.quelle)}</span>
            <label><span class="sr" hidden>Status Schritt ${s.nr}</span><select class="tag plain" data-step="${s.nr}" aria-label="Status Schritt ${s.nr} setzen">${opts(s.quelle === "manuell" ? s.status : "automatisch")}</select></label></div>
          ${STEP_LINK[s.nr] ? `<a class="go" href="#/p/${esc(slug)}/${STEP_LINK[s.nr]}">Öffnen</a>` : ""}
        </li>`).join("")}</ol></section>
    ${p.offene_punkte.length ? `<section>${sechead("02", "Offen", "Offene Punkte im Intake")}
      <ul class="rows">${p.offene_punkte.map((t, i) => `<li><span class="n">${pad(i + 1)}</span><span class="main">${esc(t)}</span><a href="#/p/${esc(slug)}/intake">Intake</a></li>`).join("")}</ul></section>` : ""}
    <section>${sechead(p.offene_punkte.length ? "03" : "02", "Zuletzt", "Neueste Bilder", "", `<a class="btn" href="#/p/${esc(slug)}/galerie">Zur Galerie</a>`)}
      <div class="grid">${p.letzte.map(m => `<figure><a class="media" href="#/p/${esc(slug)}/galerie"><img src="${esc(m.thumb)}" alt="${esc(m.rel)}" loading="lazy"></a><figcaption><b>${esc(m.rel.split("/").pop())}</b></figcaption></figure>`).join("")}</div></section>`;
  $$("select[data-step]").forEach(sel => sel.addEventListener("change", async () => {
    try { await api(`/api/projects/${slug}/steps/${sel.dataset.step}`, { method: "PUT", body: { status: sel.value } }); toast("Status gespeichert"); viewOverview(slug); }
    catch (e) { toast(e.message); }
  }));
}

/* ------------------------------------------------------------ 03 Intake */
async function viewIntake(slug) {
  renderNav(slug, "intake");
  const d = await api(`/api/projects/${slug}/intake`);
  document.title = `Intake · immoviz Studio`;
  const done = d.punkte.filter(x => x.status === "vollstaendig").length;
  const vals = [["offen", "offen"], ["teilweise", "teilweise"], ["vollstaendig", "vollständig"]];
  view.innerHTML = `
    <section>${sechead("01", "Checkliste", "Intake-Checkliste", `${done} von ${d.punkte.length} Punkten vollständig. Ampel je Punkt, Notiz für Stand und Lücken. Quelle der Punkte: README, Abschnitt Intake-Checkliste.`,
      `<button type="button" id="mail">Anfrage an Bauträger</button>`)}
      <ul class="rows">${d.punkte.map((x, i) => `
        <li data-id="${esc(x.id)}"><span class="n">${pad(i + 1)}</span>
          <div class="main"><span>${esc(x.text)}</span>
            <input type="text" value="${esc(x.notiz)}" placeholder="Notiz, z. B. Datei, Stand, fehlt noch" aria-label="Notiz zu Punkt ${i + 1}">
            ${x.dateien.length ? `<span class="files">${x.dateien.map(n => `<span class="tag plain">${esc(n)}</span>`).join("")}</span>` : ""}
            ${x.aktualisiert ? `<span class="label">aktualisiert ${esc(fmtTime(x.aktualisiert))}</span>` : ""}</div>
          <div class="aside"><div class="seg" role="group" aria-label="Status Punkt ${i + 1}">${vals.map(([v, l]) => `<button type="button" class="v-${v}" data-v="${v}" aria-pressed="${x.status === v}">${l}</button>`).join("")}</div></div>
        </li>`).join("")}</ul>
      <div id="mailbox" hidden><textarea id="mailtext" rows="10" aria-label="Anfrage-Text"></textarea><p class="muted" style="margin-top:8px">Text in die Zwischenablage kopiert, falls der Browser das erlaubt.</p></div>
    </section>
    <section>${sechead("02", "Quellen", "Dateien in quellen/", "Originale bleiben im Kundenordner (Drive). Hier liegt, was lokal für Planabgleich und Modell gebraucht wird. PDF-Dateien in quellen/ werden nicht eingecheckt.")}
      <div class="upload">
        <label class="drop" id="drop" tabindex="0"><input type="file" id="file" multiple accept="${esc(d.upload.endungen.join(","))}" hidden>
          <span class="dot" aria-hidden="true"></span><b>Dateien hierher ziehen oder auswählen</b>
          <span class="muted">${esc(d.upload.endungen.map(e => e.slice(1).toUpperCase()).join(", "))} · bis ${d.upload.max_mb} MB je Datei</span></label>
        <label class="fl"><span class="label">Zuordnen zu</span><select class="field" id="upunkt"><option value="">ohne Zuordnung</option>${d.punkte.map((x, i) => `<option value="${esc(x.id)}">${pad(i + 1)} ${esc(x.text.length > 60 ? x.text.slice(0, 58) + "…" : x.text)}</option>`).join("")}</select></label>
        <ul class="uplist" id="uplist" aria-live="polite"></ul>
      </div>
      <ul class="rows quellen">${d.quellen.length ? d.quellen.map((q, i) => `<li data-file="${esc(q.name)}"><span class="n">${pad(i + 1)}</span>
        <span class="main"><span style="word-break:break-all">${esc(q.name)}</span><span class="mono muted">${esc(q.datum)} · ${(q.bytes / 1e6).toFixed(1)} MB</span></span>
        <select class="field aside" aria-label="Intake-Punkt für ${esc(q.name)}"><option value="">ohne Zuordnung</option>${d.punkte.map((x, k) => `<option value="${esc(x.id)}" ${q.punkt === x.id ? "selected" : ""}>${pad(k + 1)} ${esc(x.text.length > 40 ? x.text.slice(0, 38) + "…" : x.text)}</option>`).join("")}</select></li>`).join("") : `<li><span class="n">00</span><span class="main muted">Noch keine Dateien.</span></li>`}</ul>
    </section>`;
  const save = async (li, status) => {
    const notiz = $("input", li).value;
    try { await api(`/api/projects/${slug}/intake/${li.dataset.id}`, { method: "PUT", body: { status, notiz } }); toast("Gespeichert"); }
    catch (e) { toast(e.message); }
  };
  $$(".rows li[data-id]").forEach(li => {
    $$(".seg button", li).forEach(b => b.addEventListener("click", async () => {
      $$(".seg button", li).forEach(x => x.setAttribute("aria-pressed", x === b));
      await save(li, b.dataset.v);
    }));
    $("input", li).addEventListener("change", () => save(li, $('.seg [aria-pressed="true"]', li)?.dataset.v || "offen"));
  });
  $$(".quellen li[data-file] select").forEach(sel => sel.addEventListener("change", async () => {
    try { await api(`/api/projects/${slug}/quellen/${encodeURIComponent(sel.closest("li").dataset.file)}`, { method: "PUT", body: { punkt: sel.value } }); toast("Zuordnung gespeichert"); viewIntake(slug); }
    catch (e) { toast(e.message); }
  }));
  const maxB = d.upload.max_mb * 1e6, okExt = new Set(d.upload.endungen);
  const sendFiles = async files => {
    const punkt = $("#upunkt").value, list = $("#uplist");
    let ok = 0;
    for (const f of files) {
      const li = document.createElement("li");
      li.innerHTML = `<span class="name">${esc(f.name)}</span><span class="mono muted st">wartet</span><span class="bar"><i></i></span>`;
      list.appendChild(li);
      const ext = "." + (f.name.split(".").pop() || "").toLowerCase();
      if (!okExt.has(ext)) { $(".st", li).textContent = "Dateityp nicht erlaubt"; li.classList.add("bad"); continue; }
      if (f.size > maxB) { $(".st", li).textContent = `größer als ${d.upload.max_mb} MB`; li.classList.add("bad"); continue; }
      try {
        const r = await uploadFile(slug, f, punkt, p => { $(".st", li).textContent = Math.round(p * 100) + " %"; $(".bar i", li).style.width = (p * 100) + "%"; });
        $(".bar i", li).style.width = "100%";
        $(".st", li).textContent = r.datei !== f.name ? `gespeichert als ${r.datei}` : "gespeichert"; li.classList.add("ok"); ok++;
      } catch (e) { $(".st", li).textContent = e.message; li.classList.add("bad"); }
    }
    if (ok) { toast(`${ok} Datei${ok > 1 ? "en" : ""} hochgeladen`); setTimeout(() => { if (location.hash.endsWith("/intake")) viewIntake(slug); }, 2500); }
  };
  const drop = $("#drop");
  drop.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#file").click(); } });
  $("#file").addEventListener("change", e => sendFiles([...e.target.files]));
  ["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", e => sendFiles([...(e.dataTransfer?.files || [])]));
  $("#mail").addEventListener("click", async () => {
    const offen = d.punkte.filter(x => x.status !== "vollstaendig");
    const p = await api(`/api/projects/${slug}`);
    const txt = `Betreff: Unterlagen für die Visualisierung ${p.name}\n\nGuten Tag,\n\nfür die maßhaltigen Visualisierungen von ${p.name} (${p.adresse}) fehlen uns noch folgende Unterlagen:\n\n${offen.map(x => "- " + x.text + (x.notiz ? " (" + x.notiz + ")" : "")).join("\n") || "- nichts, alles vollständig"}\n\nAm besten als Vektor-PDF oder DWG. Vielen Dank!\n\nBeste Grüße`;
    $("#mailbox").hidden = false; $("#mailtext").value = txt;
    try { await navigator.clipboard.writeText(txt); toast("Anfrage kopiert"); } catch (_) {}
  });
}

function uploadFile(slug, file, punkt, onProgress) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open("PUT", `/api/projects/${slug}/quellen?name=${encodeURIComponent(file.name)}&punkt=${encodeURIComponent(punkt || "")}`);
    x.setRequestHeader("Content-Type", "application/octet-stream");
    x.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
    x.onload = () => {
      let j = {};
      try { j = JSON.parse(x.responseText); } catch (_) {}
      if (x.status < 300) resolve(j); else reject(new Error(j.detail || x.statusText || "Upload fehlgeschlagen"));
    };
    x.onerror = () => reject(new Error("Netzwerkfehler"));
    x.send(file);
  });
}

/* ------------------------------------------------------------ 04 Shotlist */
async function addJob(slug, cam, light) {
  const dry = getPref("immoviz-dry", "0") === "1";
  return api("/api/queue", { method: "POST", body: { projekt: slug, cam, light, dry_run: dry } });
}

async function viewShotlist(slug) {
  renderNav(slug, "shotlist");
  const [s, q, g] = await Promise.all([api(`/api/projects/${slug}/shotlist`), api(`/api/queue?projekt=${slug}`), loadGallery(slug)]);
  document.title = `Shotlist · immoviz Studio`;
  const active = {};
  q.jobs.filter(j => j.status === "wartet" || j.status === "laeuft").forEach(j => active[j.cam + "|" + j.light] = j.status);
  const cell = {};
  s.cells.forEach(c => cell[c.cam + "|" + c.light] = c);
  const filled = s.cells.filter(c => c.renders.length || c.higgsfield.length).length;
  const dry = q.trockenlauf_erzwungen || getPref("immoviz-dry", "0") === "1";
  view.innerHTML = `<section>${sechead("01", "Shotlist", "Motiv und Licht", `${s.cameras.length} Motive, ${s.lights.length} Lichtstimmungen, ${filled} von ${s.cells.length} Zellen mit Bild. Vorschau-Renderings laufen einzeln über die Queue.`,
      `<label class="check"><input type="checkbox" id="dry" ${dry ? "checked" : ""} ${q.trockenlauf_erzwungen ? "disabled" : ""}> Trockenlauf</label><a class="btn" href="#/p/${esc(slug)}/kameras">Kameras</a><a class="btn" href="#/p/${esc(slug)}/licht">Licht</a><a class="btn" href="#/p/${esc(slug)}/queue">Zur Queue</a>`)}
    ${q.trockenlauf_erzwungen ? `<div class="notice"><span class="dot"></span>Studio läuft im Trockenlauf-Modus: Jobs starten kein Blender.</div>` : ""}
    <div class="legend label"><span><span class="tag plain">V</span> Vorschau</span><span><span class="tag plain">F</span> Final</span><span><span class="tag run">HF</span> Higgsfield</span><span>${tag("freigegeben", "frei")}</span></div>
    <div class="matrix-wrap"><table class="matrix"><thead><tr><th scope="col">Motiv</th>${s.lights.map(l => `<th scope="col">${esc(l.label)}<small>${esc([l.date && l.date.slice(5).split("-").reverse().join("."), l.time].filter(Boolean).join(" · "))}</small></th>`).join("")}</tr></thead>
    <tbody>${s.cameras.map(c => `<tr><th scope="row"><a href="#/p/${esc(slug)}/kameras?k=${encodeURIComponent(c.key)}" title="Kamera bearbeiten">${esc(c.label)}</a><small>${c.lens ? c.lens + " mm" : ""}</small></th>${s.lights.map(l => {
      const k = c.key + "|" + l.key, x = cell[k];
      const first = x.higgsfield[0] || x.renders[0];
      const fin = x.renders.some(r => r.art === "final"), vor = x.renders.some(r => r.art === "vorschau");
      const frei = [...x.renders, ...x.higgsfield].some(r => r.freigabe === "freigegeben");
      const badges = [vor ? `<span class="b">V</span>` : "", fin ? `<span class="b">F</span>` : "", x.higgsfield.length ? `<span class="b hf">HF ${x.higgsfield.length}</span>` : "", frei ? `<span class="b ok">frei</span>` : ""].join("");
      return `<td><div class="cell">${first ? `<button type="button" class="ph media" data-rel="${esc(first.rel)}" aria-label="${esc(c.label + ", " + l.label)} ansehen"><img src="${esc(first.thumb)}" alt="" loading="lazy"><span class="badges">${badges}</span></button>`
        : `<span class="ph empty"><span class="label">leer</span></span>`}
        ${active[k] ? `<span class="q">${active[k] === "laeuft" ? "rendert" : "in Queue"}</span>` : `<button type="button" class="small" data-cam="${esc(c.key)}" data-light="${esc(l.key)}">Vorschau rendern</button>`}
        ${x.renders.length ? `<button type="button" class="small" data-ver="${esc(x.renders[0].rel)}">Veredeln</button>` : ""}</div></td>`;
    }).join("")}</tr>`).join("")}</tbody></table></div>
    ${s.unzugeordnet.length ? `<p class="muted">Nicht zugeordnete Higgsfield-Bilder: ${s.unzugeordnet.map(u => `<span class="mono">${esc(u.rel)}</span>`).join(", ")}</p>` : ""}
    <p class="muted" style="font-size:14px">Zuordnung: Blender-Bilder nach dem Muster <span class="mono">${esc(slug)}_&lt;motiv&gt;_&lt;licht&gt;_(vorschau|final)</span>, Higgsfield-Bilder zusätzlich nach Motiv- und Lichtnamen im Dateinamen.</p></section>`;
  $("#dry")?.addEventListener("change", e => setPref("immoviz-dry", e.target.checked ? "1" : "0"));
  $$("button[data-cam]").forEach(b => b.addEventListener("click", async () => {
    b.disabled = true;
    try { const j = await addJob(slug, b.dataset.cam, b.dataset.light); toast(j.trockenlauf ? "Trockenlauf eingereiht" : "Vorschau eingereiht"); b.outerHTML = `<span class="q">in Queue</span>`; }
    catch (e) { toast(e.message); b.disabled = false; }
  }));
  $$("button[data-rel]").forEach(b => b.addEventListener("click", () => {
    const it = g.medien.find(m => m.rel === b.dataset.rel);
    if (it) openDetail(slug, it, () => viewShotlist(slug));
  }));
  $$("button[data-ver]").forEach(b => b.addEventListener("click", () => {
    const it = g.medien.find(m => m.rel === b.dataset.ver);
    if (it) openVeredeln(slug, it, g);
  }));
}

/* ------------------------------------------------------------ 05 Queue */
const JOB_ART = { check: "Planabgleich", geo: "Umgebung", higgsfield: "Veredelung", video: "Video" };
async function viewQueue(slug) {
  renderNav(slug, "queue");
  const [s, q] = await Promise.all([api(`/api/projects/${slug}/shotlist`), api(`/api/queue?projekt=${slug}`)]);
  document.title = `Queue · immoviz Studio`;
  const dry = q.trockenlauf_erzwungen || getPref("immoviz-dry", "0") === "1";
  view.innerHTML = `<section>${sechead("01", "Render-Queue", "Warteschlange", "Ein Job gleichzeitig: Vorschau-Renderings (ohne .blend-Datei), Planabgleich, Umgebung laden und Higgsfield-Aufträge mit geschätzten Credits. Ergebnisse erscheinen danach automatisch in Shotlist und Galerie.")}
    ${q.trockenlauf_erzwungen ? `<div class="notice"><span class="dot"></span>Studio läuft im Trockenlauf-Modus: Jobs starten kein Blender.</div>` : ""}
    <form class="qform" id="qf">
      <label><span class="label">Motiv</span><select class="field" name="cam">${s.cameras.map(c => `<option value="${esc(c.key)}">${esc(c.label)}</option>`).join("")}</select></label>
      <label><span class="label">Licht</span><select class="field" name="light">${s.lights.map(l => `<option value="${esc(l.key)}">${esc(l.label)}</option>`).join("")}</select></label>
      <label class="check"><input type="checkbox" name="dry" ${dry ? "checked" : ""} ${q.trockenlauf_erzwungen ? "disabled" : ""}> Trockenlauf ohne Blender</label>
      <button class="primary" type="submit">Vorschau rendern</button>
    </form></section>
    <section>${sechead("02", "Jobs", "Verlauf", "", `<button type="button" id="reload" class="small">Aktualisieren</button>`)}<ul class="rows jobs" id="jobs"></ul></section>`;
  const open = new Set();
  const draw = async () => {
    const d = await api(`/api/queue?projekt=${slug}`);
    const el = $("#jobs");
    if (!el) return;
    el.innerHTML = d.jobs.length ? d.jobs.map(j => `
      <li data-id="${esc(j.id)}">${tag(j.status)}
        <div class="main"><span>${JOB_ART[j.art] ? `<span class="label">${JOB_ART[j.art]}</span> ` : ""}<b style="color:var(--text-strong);font-weight:500">${esc(j.cam)}</b>${j.light ? " · " + esc(j.light) : ""}${j.trockenlauf ? ` <span class="tag plain">Trockenlauf</span>` : ""}${j.credits ? ` <span class="tag plain">ca. ${esc(String(j.credits).replace(".", ","))} Credits</span>` : ""}${j.ergebnis && j.ergebnis.rel ? ` <a href="/files/${esc(slug)}/${esc(j.ergebnis.rel)}" target="_blank" rel="noopener">Ergebnis</a>` : ""}</span>
          <span class="mono muted">${esc(j.befehl)}</span>
          <span class="label">erstellt ${esc(fmtTime(j.erstellt))}${j.sekunden != null ? ` · ${j.sekunden} s` : ""}${j.fehler ? ` · ${esc(j.fehler)}` : ""}</span>
          <pre class="log" ${open.has(j.id) ? "" : "hidden"}></pre></div>
        <div class="aside" style="display:flex;gap:6px;flex-wrap:wrap"><button type="button" class="small" data-log>Log</button>${["wartet", "laeuft"].includes(j.status) ? `<button type="button" class="small" data-cancel>Abbrechen</button>` : ""}</div>
      </li>`).join("") : `<li><span class="n">00</span><span class="main muted">Noch keine Jobs.</span></li>`;
    for (const id of open) await fillLog(id);
    $$("#jobs li[data-id]").forEach(li => {
      $("[data-log]", li).addEventListener("click", async () => {
        const pre = $("pre", li); pre.hidden = !pre.hidden;
        if (pre.hidden) open.delete(li.dataset.id); else { open.add(li.dataset.id); await fillLog(li.dataset.id); }
      });
      $("[data-cancel]", li)?.addEventListener("click", async () => { await api(`/api/queue/${li.dataset.id}/abbrechen`, { method: "POST" }); draw(); });
    });
    return d.jobs.some(j => ["wartet", "laeuft"].includes(j.status));
  };
  const fillLog = async id => {
    const pre = $(`#jobs li[data-id="${id}"] pre`);
    if (!pre) return;
    const j = await api(`/api/queue/${id}`);
    pre.textContent = j.log || "(noch keine Ausgabe)";
    pre.scrollTop = pre.scrollHeight;
  };
  $("#qf").addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    setPref("immoviz-dry", f.get("dry") ? "1" : "0");
    try { const j = await addJob(slug, f.get("cam"), f.get("light")); open.add(j.id); toast(j.trockenlauf ? "Trockenlauf eingereiht" : "Vorschau eingereiht"); draw(); }
    catch (err) { toast(err.message); }
  });
  $("#reload").addEventListener("click", draw);
  await draw();
  timers.push(setInterval(() => { if (!document.hidden) draw(); }, 2000));
}

/* ------------------------------------------------------------ 06 Galerie und Freigabe */
async function loadGallery(slug) { state.gallery = await api(`/api/projects/${slug}/gallery`); return state.gallery; }

async function viewGallery(slug) {
  renderNav(slug, "galerie");
  const [g, wt, kl] = await Promise.all([loadGallery(slug), api(`/api/projects/${slug}/walkthrough`), api(`/api/projects/${slug}/kundenlinks`)]);
  document.title = `Galerie · immoviz Studio`;
  const grp = getPref("immoviz-grp", "alle"), st = getPref("immoviz-st", "alle");
  const groups = [["alle", "Alle"], ...g.gruppen.map(x => [x.key, x.label])];
  const stats = [["alle", "Alle"], ["offen", "Offen"], ["freigegeben", "Freigegeben"], ["abgelehnt", "Abgelehnt"]];
  const count = k => k === "alle" ? g.medien.length : g.medien.filter(m => m.gruppe === k).length;
  const ok = g.medien.filter(m => m.status === "freigegeben").length;
  view.innerHTML = `<section>${sechead("01", "Galerie", "Bilder und Videos", `${g.medien.length} Medien, ${ok} freigegeben. Freigegebene Bilder erscheinen in der Kundenansicht.`,
      `<button type="button" class="btn" id="mkvideo">Video erzeugen</button><a class="btn" href="/kunde?p=${encodeURIComponent(slug)}" target="_blank" rel="noopener">Kundenansicht ↗</a>`)}
    <div class="filters"><div class="chips" role="group" aria-label="Bereich">${groups.map(([k, l]) => `<button type="button" data-grp="${k}" aria-pressed="${k === grp}">${esc(l)} <span class="muted">${count(k)}</span></button>`).join("")}</div>
      <div class="chips" role="group" aria-label="Freigabe">${stats.map(([k, l]) => `<button type="button" data-st="${k}" aria-pressed="${k === st}">${esc(l)}</button>`).join("")}</div></div>
    <div class="grid" id="grid"></div></section>
    ${motionSection(wt)}
    <section>${sechead("04", "Freigabe", "Kundenlinks", "Ein Kundenlink zeigt nur freigegebene Bilder und Videos. Das Token wird nur einmal angezeigt und gehasht gespeichert. Links laufen ab und lassen sich widerrufen.")}
      <form class="qform linkform" id="lf">
        <label><span class="label">Gültig</span><select class="field" name="tage">${[[7, "7 Tage"], [14, "14 Tage"], [30, "30 Tage"], [90, "90 Tage"]].map(([v, l]) => `<option value="${v}" ${v === 30 ? "selected" : ""}>${l}</option>`).join("")}</select></label>
        <label class="wide"><span class="label">Notiz</span><input class="field" type="text" name="notiz" maxlength="200" placeholder="z. B. Vertrieb VPH, Abstimmung Fassade"></label>
        <button class="primary" type="submit">Kundenlink erzeugen</button>
      </form>
      <div id="newlink" hidden></div>
      <ul class="rows links" id="links"></ul></section>`;
  const drawLinks = links => {
    $("#links").innerHTML = links.length ? links.map((l, i) => `<li><span class="n">${pad(i + 1)}</span>
      <span class="main"><span><b style="color:var(--text-strong);font-weight:500">${esc(l.notiz || "ohne Notiz")}</b></span>
        <span class="label">erstellt ${esc(fmtTime(l.erstellt))} · gültig bis ${esc(fmtTime(l.ablauf))}${l.zuletzt ? ` · zuletzt geöffnet ${esc(fmtTime(l.zuletzt))}` : ""}${l.widerrufen ? ` · widerrufen ${esc(fmtTime(l.widerrufen))}` : ""}</span></span>
      <span class="aside" style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">${tag(l.status === "gueltig" ? "fertig" : l.status === "abgelaufen" ? "abgebrochen" : "fehler", l.status === "gueltig" ? "gültig" : l.status)}
        ${l.status === "gueltig" ? `<button type="button" class="small" data-revoke="${esc(l.id)}">Widerrufen</button>` : ""}</span></li>`).join("")
      : `<li><span class="n">00</span><span class="main muted">Noch keine Kundenlinks.</span></li>`;
    $$("[data-revoke]").forEach(b => b.addEventListener("click", async () => {
      if (!confirm("Kundenlink widerrufen? Der Kunde sieht danach nichts mehr.")) return;
      try { await api(`/api/projects/${slug}/kundenlinks/${b.dataset.revoke}/widerrufen`, { method: "POST" }); drawLinks((await api(`/api/projects/${slug}/kundenlinks`)).links); toast("Widerrufen"); }
      catch (e) { toast(e.message); }
    }));
  };
  drawLinks(kl.links);
  $("#mkvideo").addEventListener("click", () => openVideo(slug, g));
  $("#lf").addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    try {
      const r = await api(`/api/projects/${slug}/kundenlinks`, { method: "POST", body: { tage: +f.get("tage"), notiz: f.get("notiz") } });
      const url = location.origin + r.pfad;
      const box = $("#newlink");
      box.hidden = false;
      box.innerHTML = `<div class="notice linkbox"><span class="dot"></span><div class="main"><b>Neuer Kundenlink, nur jetzt sichtbar</b>
        <input class="field mono" type="text" readonly value="${esc(url)}" aria-label="Kundenlink"><span class="muted">Für Kunden außerhalb dieses Rechners den Rechnernamen durch die öffentliche Adresse des Studios ersetzen.</span></div>
        <button type="button" class="small" id="copylink">Kopieren</button></div>`;
      $("#copylink").addEventListener("click", async () => { try { await navigator.clipboard.writeText(url); toast("Link kopiert"); } catch (_) { $("#newlink input").select(); } });
      e.target.reset();
      drawLinks((await api(`/api/projects/${slug}/kundenlinks`)).links);
    } catch (err) { toast(err.message); }
  });
  const draw = () => {
    const G = getPref("immoviz-grp", "alle"), S = getPref("immoviz-st", "alle");
    const list = g.medien.filter(m => (G === "alle" || m.gruppe === G) && (S === "alle" || m.status === S));
    $("#grid").innerHTML = list.length ? list.map((m, i) => `
      <figure><button type="button" class="media" data-i="${g.medien.indexOf(m)}" aria-label="${esc(m.name)} öffnen">
        ${m.typ === "video" ? `<video src="${esc(m.url)}#t=0.5" muted preload="metadata" playsinline></video>` : `<img src="${esc(m.thumb)}" alt="${esc(m.name)}" loading="lazy">`}
        ${m.status !== "offen" ? `<span class="tag st ${STATUS[m.status][0]}">${esc(STATUS[m.status][1])}</span>` : ""}</button>
        <figcaption><b title="${esc(m.rel)}">${esc(m.rel)}</b><span class="mono">${m.kommentare.filter(k => k.text).length ? "◦ " + m.kommentare.filter(k => k.text).length : ""}</span></figcaption>
        ${m.veredelbar ? `<button type="button" class="small ver" data-ver="${g.medien.indexOf(m)}">Veredeln</button>` : m.hf ? `<span class="label" style="overflow-wrap:anywhere">aus ${esc(m.hf.quelle || "")}</span>` : ""}</figure>`).join("")
      : `<div class="empty-state"><span class="label">Leer</span><p class="muted">Keine Medien für diesen Filter.</p></div>`;
    $$("#grid [data-i]").forEach(b => b.addEventListener("click", () => openDetail(slug, g.medien[+b.dataset.i], async () => { await loadGallery(slug); viewGallery(slug); })));
    $$("#grid [data-ver]").forEach(b => b.addEventListener("click", () => openVeredeln(slug, g.medien[+b.dataset.ver], g)));
  };
  $$("[data-grp]").forEach(b => b.addEventListener("click", () => { setPref("immoviz-grp", b.dataset.grp); $$("[data-grp]").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); }));
  $$("[data-st]").forEach(b => b.addEventListener("click", () => { setPref("immoviz-st", b.dataset.st); $$("[data-st]").forEach(x => x.setAttribute("aria-pressed", x === b)); draw(); }));
  draw();
}

function fmtMB(b) { return (b / 1e6).toLocaleString("de-AT", { maximumFractionDigits: 1 }) + " MB"; }
function fmtXY(p) { return (p || []).map(v => Number(v).toLocaleString("de-AT", { maximumFractionDigits: 2 })).join(" / "); }

function motionSection(wt) {
  const player = v => `<figure class="player"><video src="${esc(v.url)}" controls playsinline preload="metadata"></video><figcaption><b title="${esc(v.rel)}">${esc(v.name)}</b><span class="mono">${fmtMB(v.bytes)}</span></figcaption></figure>`;
  return `<section>${sechead("02", "Bewegtbild", "Videos", "Kamerafahrten außen aus renders/video und Walkthroughs je Wohnung aus renders/walkthrough.")}
      ${wt.videos.length ? `<div class="grid videos">${wt.videos.map(player).join("")}</div>` : `<p class="muted">Noch keine Videos in renders/video.</p>`}</section>
    <section>${sechead("03", "Walkthrough", "Kamerapfade je Wohnung", "Wegpunkte aus <span class=\"mono\">wohnungen.yaml</span> (walkthrough.punkte), Koordinaten in Metern im lokalen System, Höhe 1,5 m. Bearbeiten in der Datei.")}
      ${wt.wohnungen.length ? wt.wohnungen.map(w => `<div class="wt">
        <div class="wthead"><h3>${esc(w.titel)}</h3><span class="kv"><span class="tag plain">${esc(w.top)}</span>${w.sekunden ? `<span class="tag plain">${esc(w.sekunden)} s</span>` : ""}${w.licht ? `<span class="tag plain">${esc(w.licht)}</span>` : ""}</span></div>
        ${w.videos.length ? `<div class="grid videos">${w.videos.map(player).join("")}</div>` : `<p class="muted">Noch kein Video in renders/walkthrough/${esc(w.top)}.</p>`}
        <ol class="rows wtpts">${w.punkte.map(p => `<li><span class="n">${pad(p.nr)}</span>
          <span class="main"><span>${esc(p.notiz || "Wegpunkt " + p.nr)}</span><span class="mono muted">t ${esc(p.t)} s · Position ${fmtXY(p.pos)} · Ziel ${fmtXY(p.target)} · ${esc(p.lens)} mm</span></span>
          ${p.bild ? `<a class="aside thumbl" href="${esc(p.bild.url)}" target="_blank" rel="noopener"><img src="${esc(p.bild.thumb)}" alt="Standbild Wegpunkt ${p.nr}" loading="lazy"></a>` : `<span class="aside label">kein Standbild</span>`}</li>`).join("")}</ol></div>`).join("")
      : `<p class="muted">Keine Wohnung mit walkthrough in wohnungen.yaml.</p>`}</section>`;
}

function openDetail(slug, m, onChange) {
  const dlg = $("#dlg");
  let changed = false;
  const author = getPref("immoviz-autor", "");
  const render = (m) => {
    dlg.innerHTML = `<div style="position:relative"><button type="button" class="close small" data-close aria-label="Schließen">Schließen</button>
      <div class="dlg"><div class="view">${m.typ === "video" ? `<video src="${esc(m.url)}" controls playsinline></video>` : `<img src="${esc(m.url)}" alt="${esc(m.name)}">`}</div>
      <div class="side">
        <div style="display:grid;gap:6px"><span class="label">${esc(m.gruppe)} · ${esc(m.datum)}</span><h3 style="word-break:break-all">${esc(m.rel)}</h3>
          <div>${tag(m.status)}</div></div>
        ${m.hf ? `<div class="hfmeta"><span class="label">Higgsfield · ${esc(m.hf.modell || "")}${m.hf.trockenlauf ? " · Trockenlauf" : ""} · ca. ${esc(String(m.hf.credits_geschaetzt ?? "").replace(".", ","))} Credits</span>
          <span>Original: <a href="/files/${esc(slug)}/${esc(m.hf.quelle)}" target="_blank" rel="noopener">${esc(m.hf.quelle)}</a>${m.hf.refs && m.hf.refs.length ? ` · ${m.hf.refs.length} Referenzen` : ""}</span>
          <details><summary class="label">Prompt</summary><p class="small" style="white-space:pre-wrap">${esc(m.hf.prompt)}</p></details></div>` : ""}
        <div class="acts"><button type="button" class="${m.status === "freigegeben" ? "on" : ""}" data-set="freigegeben">Freigeben</button>${m.veredelbar ? `<button type="button" data-hfver>Veredeln</button>` : ""}${m.typ === "bild" ? `<button type="button" data-hfvid>Video</button>` : ""}
          <button type="button" class="${m.status === "abgelehnt" ? "on" : ""}" data-set="abgelehnt">Ablehnen</button>
          ${m.status !== "offen" ? `<button type="button" class="ghost" data-set="offen">Zurücksetzen</button>` : ""}</div>
        <form id="cf" style="display:grid;gap:8px">
          <label class="label" for="ctext">Kommentar</label>
          <textarea id="ctext" placeholder="z. B. Achse 3 prüfen, Himmel wärmer"></textarea>
          <input type="text" id="cauthor" class="field" value="${esc(author)}" placeholder="Name" aria-label="Name" style="font:400 14px var(--font-display);color:var(--text-body);background:transparent;border:0;box-shadow:inset 0 0 0 1px var(--hairline);border-radius:12px;padding:8px 12px">
          <button type="submit" class="primary" style="justify-self:start">Kommentar speichern</button></form>
        <ul class="comments">${m.kommentare.slice().reverse().map(k => `<li><span class="label">${esc(k.autor)} · ${esc(fmtTime(k.zeit))}${k.status ? " · " + esc(STATUS[k.status]?.[1] || k.status) : ""}</span>${k.text ? `<span>${esc(k.text)}</span>` : ""}</li>`).join("") || `<li class="muted">Noch keine Kommentare.</li>`}</ul>
        <div class="label">Dateien: ${m.varianten.map(v => `<a href="/files/${esc(slug)}/${esc(v)}" target="_blank" rel="noopener">${esc(v.split(".").pop())}</a>`).join(" · ")}</div>
      </div></div></div>`;
    $("[data-close]", dlg).addEventListener("click", () => dlg.close());
    $("[data-hfver]", dlg)?.addEventListener("click", () => { dlg.onclose = null; openVeredeln(slug, m, state.gallery); });
    $("[data-hfvid]", dlg)?.addEventListener("click", () => { dlg.onclose = null; openVideo(slug, state.gallery, m.rel); });
    $$("[data-set]", dlg).forEach(b => b.addEventListener("click", () => send({ status: b.dataset.set, kommentar: $("#ctext").value })));
    $("#cf", dlg).addEventListener("submit", e => { e.preventDefault(); if ($("#ctext").value.trim()) send({ kommentar: $("#ctext").value }); });
  };
  const send = async (body) => {
    const autor = $("#cauthor").value.trim() || "Team";
    setPref("immoviz-autor", autor);
    try {
      const r = await api(`/api/projects/${slug}/freigabe`, { method: "POST", body: { rel: m.rel, autor, ...body } });
      m = { ...m, status: r.status, kommentare: r.kommentare }; changed = true; render(m); toast("Gespeichert");
    } catch (e) { toast(e.message); }
  };
  dlg.onclose = () => { dlg.innerHTML = ""; if (changed && onChange) onChange(); };
  render(m);
  dlg.showModal();
}

/* ------------------------------------------------------------ Router */
async function route() {
  clearTimers();
  window.onbeforeunload = null;
  if ($("#dlg").open) $("#dlg").close();
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  try {
    if (parts[0] === "neu") return await viewNeu();
    if (parts[0] !== "p" || !parts[1]) return await viewProjects();
    const slug = decodeURIComponent(parts[1]);
    state.slug = slug;
    const page = (parts[2] || "").split("?")[0];
    if (page === "intake") return await viewIntake(slug);
    if (page === "fassaden") return await viewFassaden(slug);
    if (page === "dach") return await viewDach(slug);
    if (page === "abgleich") return await viewAbgleich(slug);
    if (page === "shotlist") return await viewShotlist(slug);
    if (page === "kameras") return await viewKameras(slug);
    if (page === "licht") return await viewLicht(slug);
    if (page === "queue") return await viewQueue(slug);
    if (page === "galerie") return await viewGallery(slug);
    return await viewOverview(slug);
  } catch (e) { errorView(e); }
  finally { window.scrollTo(0, 0); }
}
window.addEventListener("hashchange", route);
route();
