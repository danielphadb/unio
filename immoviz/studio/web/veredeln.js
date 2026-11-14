/* immoviz Studio: Higgsfield-Veredelung (Bild mit Referenzen, Bild-zu-Video). Prompt aus Bausteinen in
   projects/<p>/prompts.yaml, vor dem Absenden editierbar. Aufträge laufen über die Queue; ohne Schlüssel oder mit
   --dry-run nur als Trockenlauf (Ergebnis = Eingangsbild). */
const hfState = { info: null, prompts: {} };
const fmtCr = v => Number(v).toLocaleString("de-AT", { maximumFractionDigits: 1 });

async function hfInfo(force) {
  if (!hfState.info || force) {
    try { hfState.info = await api("/api/higgsfield"); } catch (_) { hfState.info = null; }
  }
  const el = $("#hfstat");
  if (el && hfState.info) {
    const i = hfState.info;
    el.hidden = false;
    el.className = "tag " + (i.modus === "live" ? "ok" : "warn");
    el.textContent = i.modus === "live" ? `Higgsfield · ${i.guthaben == null ? "Guthaben unbekannt" : fmtCr(i.guthaben) + " Credits"}`
      : `Higgsfield · Trockenlauf${i.guthaben != null ? " · " + fmtCr(i.guthaben) + " Credits simuliert" : ""}`;
    el.title = i.modus === "live" ? "Schlüssel aus HIGGSFIELD_API_KEY" : `Trockenlauf: ${i.grund || ""}. Es werden keine Credits verbraucht.`;
  }
  return hfState.info;
}

async function hfPrompts(slug) {
  if (!hfState.prompts[slug]) hfState.prompts[slug] = await api(`/api/projects/${slug}/prompts`);
  return hfState.prompts[slug];
}

const SEASON_BAUSTEIN = { fruehling: "fruehling", sommer: "bedeckt", spaetsommer: "golden_hour", herbst: "herbst", winter: "winter" };
const txt = b => (b && typeof b === "object" ? b.text : b) || "";
const titel = (k, b) => (b && typeof b === "object" && b.titel) || k;

function guessLight(rel, lichter) {
  const t = rel.toLowerCase().split("/").pop().replace(/\.[a-z0-9]+$/, "").split("_");
  const keys = Object.keys(lichter || {}).sort((a, b) => b.length - a.length);
  for (const k of keys) { const s = k.split("_"); for (let i = 0; i + s.length <= t.length; i++) if (s.every((x, j) => t[i + j] === x)) return k; }
  return null;
}

function hfSummaryBar(info, credits) {
  if (!info) return `<div class="notice"><span class="dot"></span>Higgsfield-Status nicht abrufbar.</div>`;
  if (info.modus !== "live") return `<div class="notice"><span class="dot"></span>Trockenlauf (${esc(info.grund || "ohne Schlüssel")}): es wird nichts an Higgsfield gesendet, das Ergebnis ist das Eingangsbild. Geschätzt ${fmtCr(credits)} Credits.</div>`;
  return `<div class="notice"><span class="dot"></span>Live: geschätzt <b>${fmtCr(credits)} Credits</b>${info.guthaben != null ? `, Guthaben ${fmtCr(info.guthaben)}` : ", Guthaben per API nicht abrufbar"}.${info.bild_endpunkt ? "" : " Bild-Endpunkt noch nicht konfiguriert (siehe higgsfield/API.md)."}</div>`;
}

/* Dialog: Bild veredeln */
async function openVeredeln(slug, item, gallery) {
  const [info, P] = await Promise.all([hfInfo(true), hfPrompts(slug)]);
  const B = P.bausteine || {};
  const innen = /^(innen|walkthrough)\//.test(item.rel);
  const light = guessLight(item.rel, P.lichter);
  const zu = (B.zuordnung || {})[light] || SEASON_BAUSTEIN[(P.lichter || {})[light]] || Object.keys(B.aussen || {})[0] || "";
  const imgs = (gallery?.medien || []).filter(m => m.typ === "bild" && m.rel !== item.rel && !m.rel.startsWith("check/"));
  const dlg = $("#dlg");
  let edited = false;
  const st = { licht: zu, objekt: true, umgebung: true, negativ: true, typ: item.rel.includes("top35") || item.rel.includes("dg") ? "dachgeschoss" : "altbau", raum: "", refs: [], aspect: "3:2", res: "2k" };
  const compose = () => innen
    ? [txt(B.geometrie?.innen), txt((B.innen || {})[st.typ]), st.raum ? txt((B.innen || {})[st.raum]) : "", txt((B.innen || {}).licht), st.negativ ? txt(B.negativ?.innen) : ""]
    : [txt(B.geometrie?.aussen), st.objekt ? txt(B.objekt) : "", txt((B.aussen || {})[st.licht]), st.umgebung ? txt(B.umgebung) : "", st.negativ ? txt(B.negativ?.aussen) : ""];
  const promptText = () => compose().filter(Boolean).map(s => s.replace(/\s+/g, " ").trim()).join("\n\n");
  const credits = () => (info?.credits || {})[st.res === "4k" ? "bild_4k" : "bild_2k"] ?? 1.5;
  const innenOpts = Object.entries(B.innen || {}).filter(([k]) => k !== "licht");
  dlg.innerHTML = `<div class="hfdlg"><button type="button" class="close small" data-close aria-label="Schließen">Schließen</button>
    <div class="hfgrid"><div class="hfsrc"><img src="${esc(item.thumb || item.url)}" alt="${esc(item.rel)}"><span class="label">Bild 1 · Geometrie</span><span class="mono muted" style="word-break:break-all">${esc(item.rel)}</span></div>
    <form id="hff" class="hfform">
      <div style="display:grid;gap:6px"><span class="label">Higgsfield · Nano Banana Pro</span><h3>Bild veredeln</h3></div>
      <fieldset class="fl"><legend class="label">Bausteine aus ${esc(P.datei)}</legend><div class="hfbs">
        ${innen ? `<label class="fl"><span class="label">Wohnungstyp</span><select class="field" name="typ">${innenOpts.filter(([k]) => ["altbau", "dachgeschoss"].includes(k)).map(([k, b]) => `<option value="${esc(k)}" ${k === st.typ ? "selected" : ""}>${esc(titel(k, b))}</option>`).join("")}</select></label>
          <label class="fl"><span class="label">Raum</span><select class="field" name="raum"><option value="">kein Raum-Baustein</option>${innenOpts.filter(([k]) => !["altbau", "dachgeschoss"].includes(k)).map(([k, b]) => `<option value="${esc(k)}">${esc(titel(k, b))}</option>`).join("")}</select></label>`
        : `<label class="fl"><span class="label">Licht und Jahreszeit${light ? ` (Bild: ${esc(light)})` : ""}</span><select class="field" name="licht">${Object.entries(B.aussen || {}).map(([k, b]) => `<option value="${esc(k)}" ${k === st.licht ? "selected" : ""}>${esc(titel(k, b))}</option>`).join("")}</select></label>
          <label class="check"><input type="checkbox" name="objekt" checked> Objekt</label><label class="check"><input type="checkbox" name="umgebung" checked> Umgebung</label>`}
        <label class="check"><input type="checkbox" checked disabled> Geometrie-Sperre</label><label class="check"><input type="checkbox" name="negativ" checked> Negativ</label></div></fieldset>
      <label class="fl"><span class="label">Prompt (editierbar)</span><textarea class="field" name="prompt" rows="9" required minlength="20" maxlength="6000">${esc(promptText())}</textarea><small class="muted" id="hfedit"></small></label>
      <fieldset class="fl"><legend class="label">Zusätzliche Referenzbilder (Bild 2 bis 4, aus der Galerie)</legend>
        <div class="refgrid">${imgs.slice(0, 60).map(m => `<button type="button" class="ref" data-ref="${esc(m.rel)}" aria-pressed="false" title="${esc(m.rel)}"><img src="${esc(m.thumb)}" alt="${esc(m.rel)}" loading="lazy"></button>`).join("") || `<span class="muted">Keine weiteren Bilder.</span>`}</div></fieldset>
      <div class="duo"><label class="fl"><span class="label">Format</span><select class="field" name="aspect">${(info?.aspekte || ["3:2"]).map(a => `<option ${a === "3:2" ? "selected" : ""}>${a}</option>`).join("")}</select></label>
        <label class="fl"><span class="label">Auflösung</span><select class="field" name="res">${(info?.aufloesungen || ["2k"]).map(a => `<option value="${a}">${a.toUpperCase()}</option>`).join("")}</select></label></div>
      <div id="hfcost"></div>
      <label class="check"><input type="checkbox" name="ok" required> Kosten bestätigt, Auftrag absenden</label>
      <div class="acts"><button type="submit" class="primary">Veredeln</button><button type="button" data-close>Abbrechen</button></div>
      <p class="muted small">Ergebnis: <span class="mono">renders/higgsfield/&lt;motiv&gt;_&lt;licht&gt;_&lt;zeit&gt;.jpg</span>, Prompt und Original in <span class="mono">index.json</span>. Geometrie danach gegen das Blender-Bild prüfen.</p>
    </form></div></div>`;
  const f = $("#hff", dlg);
  const cost = () => { $("#hfcost", dlg).innerHTML = hfSummaryBar(info, credits()); };
  cost();
  f.addEventListener("input", e => {
    const n = e.target.name;
    if (n === "prompt") { edited = true; $("#hfedit", dlg).innerHTML = `Von Hand geändert. <button type="button" class="small ghost" data-recompose>Neu zusammensetzen</button>`; $("[data-recompose]", dlg).addEventListener("click", () => { edited = false; f.prompt.value = promptText(); $("#hfedit", dlg).textContent = ""; }); return; }
    if (["licht", "typ", "raum"].includes(n)) st[n] = e.target.value;
    if (["objekt", "umgebung", "negativ"].includes(n)) st[n] = e.target.checked;
    if (n === "aspect") st.aspect = e.target.value;
    if (n === "res") { st.res = e.target.value; cost(); }
    if (!edited && ["licht", "typ", "raum", "objekt", "umgebung", "negativ"].includes(n)) f.prompt.value = promptText();
  });
  $$("[data-ref]", dlg).forEach(b => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") === "true";
    if (!on && st.refs.length >= 3) { toast("Höchstens 3 zusätzliche Referenzen"); return; }
    b.setAttribute("aria-pressed", String(!on));
    st.refs = on ? st.refs.filter(r => r !== b.dataset.ref) : [...st.refs, b.dataset.ref];
  }));
  $$("[data-close]", dlg).forEach(b => b.addEventListener("click", () => dlg.close()));
  f.addEventListener("submit", async e => {
    e.preventDefault();
    try {
      const j = await api(`/api/projects/${slug}/veredeln`, { method: "POST", body: { rel: item.rel, prompt: f.prompt.value, refs: st.refs, aspect: f.aspect.value, resolution: f.res.value } });
      dlg.close(); toast(j.trockenlauf ? "Trockenlauf in der Queue" : "Veredelung in der Queue"); hfInfo(true);
    } catch (err) { toast(err.message); }
  });
  dlg.onclose = () => { dlg.innerHTML = ""; };
  if (!dlg.open) dlg.showModal();
}

/* Dialog: Video (Kling, Bild zu Video) */
async function openVideo(slug, gallery, startRel) {
  const [info, P] = await Promise.all([hfInfo(true), hfPrompts(slug)]);
  const imgs = (gallery?.medien || []).filter(m => m.typ === "bild" && !m.rel.startsWith("check/"));
  if (!imgs.length) { toast("Keine Bilder in der Galerie"); return; }
  const start = startRel && imgs.some(m => m.rel === startRel) ? startRel : (imgs.find(m => m.gruppe === "higgsfield") || imgs[0]).rel;
  const dlg = $("#dlg");
  const opt = (sel, none) => (none ? `<option value="">${none}</option>` : "") + imgs.map(m => `<option value="${esc(m.rel)}" ${m.rel === sel ? "selected" : ""}>${esc(m.rel)}</option>`).join("");
  const thumbOf = rel => (imgs.find(m => m.rel === rel) || {}).thumb || "";
  dlg.innerHTML = `<div class="hfdlg"><button type="button" class="close small" data-close aria-label="Schließen">Schließen</button>
    <form id="hvf" class="hfform" style="padding:var(--sp-5)">
      <div style="display:grid;gap:6px"><span class="label">Higgsfield · Kling Bild zu Video</span><h3>Video erzeugen</h3></div>
      <div class="vpair"><figure><img id="vs" src="${esc(thumbOf(start))}" alt="Startbild"><figcaption class="label">Start</figcaption></figure><figure><img id="ve" alt="Endbild" hidden><figcaption class="label">Ende</figcaption></figure></div>
      <label class="fl"><span class="label">Startbild *</span><select class="field" name="start">${opt(start)}</select></label>
      <label class="fl"><span class="label">Endbild (optional)</span><select class="field" name="end">${opt("", "kein Endbild")}</select></label>
      <label class="fl"><span class="label">Zwischenbilder (optional, Strg/Cmd für mehrere)</span><select class="field" name="middle" multiple size="4">${opt("")}</select></label>
      <div class="duo"><label class="fl"><span class="label">Dauer</span><select class="field" name="dauer"><option value="5">5 s</option><option value="10">10 s</option></select></label><span></span></div>
      <label class="fl"><span class="label">Prompt (editierbar)</span><textarea class="field" name="prompt" rows="5" required minlength="10" maxlength="3000">${esc(String(P.bausteine?.video || "").replace(/\s+/g, " ").trim())}</textarea></label>
      <div id="hvcost"></div>
      <p class="muted small">Laut offizieller Doku nimmt das dokumentierte Kling-Modell nur ein Startbild; Endbild und Zwischenbilder werden im Live-Modus derzeit nicht gesendet (siehe higgsfield/API.md).</p>
      <label class="check"><input type="checkbox" name="ok" required> Kosten bestätigt, Auftrag absenden</label>
      <div class="acts"><button type="submit" class="primary">Video erzeugen</button><button type="button" data-close>Abbrechen</button></div>
    </form></div>`;
  const f = $("#hvf", dlg);
  const cost = () => { const c = (info?.credits || {})[+f.dauer.value > 5 ? "video_10" : "video_5"] ?? 16; $("#hvcost", dlg).innerHTML = hfSummaryBar(info, c); };
  cost();
  f.addEventListener("input", e => {
    if (e.target.name === "dauer") cost();
    if (e.target.name === "start") $("#vs", dlg).src = thumbOf(f.start.value);
    if (e.target.name === "end") { const im = $("#ve", dlg); im.hidden = !f.end.value; if (f.end.value) im.src = thumbOf(f.end.value); }
  });
  $$("[data-close]", dlg).forEach(b => b.addEventListener("click", () => dlg.close()));
  f.addEventListener("submit", async e => {
    e.preventDefault();
    const middle = [...f.middle.selectedOptions].map(o => o.value).filter(Boolean);
    try {
      const j = await api(`/api/projects/${slug}/video`, { method: "POST", body: { start: f.start.value, end: f.end.value || null, middle, dauer: +f.dauer.value, prompt: f.prompt.value } });
      dlg.close(); toast(j.trockenlauf ? "Video-Trockenlauf in der Queue" : "Video in der Queue"); hfInfo(true);
    } catch (err) { toast(err.message); }
  });
  dlg.onclose = () => { dlg.innerHTML = ""; };
  if (!dlg.open) dlg.showModal();
}

document.addEventListener("DOMContentLoaded", () => hfInfo());
