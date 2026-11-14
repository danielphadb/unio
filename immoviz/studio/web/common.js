/* immoviz Studio: gemeinsame Hilfsfunktionen (Logo, Thema, API, Formatierung). */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function esc(v) {
  return String(v ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function api(path, opts = {}) {
  const o = { ...opts, headers: { "Content-Type": "application/json", ...(opts.headers || {}) } };
  if (o.body && typeof o.body !== "string") o.body = JSON.stringify(o.body);
  const r = await fetch(path, o);
  if (!r.ok) {
    let msg = r.statusText;
    try { const j = await r.json(); msg = j.detail || msg; } catch (_) {}
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }
  return r.json();
}

function toast(text) {
  const t = document.createElement("div");
  t.className = "toast";
  t.setAttribute("role", "status");
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

async function injectLogo() {
  try {
    const svg = await (await fetch("/brand/logo.svg")).text();
    $$(".logo").forEach(el => { el.innerHTML = svg; const s = el.querySelector("svg"); if (s) { s.setAttribute("role", "img"); s.setAttribute("aria-label", "UNIO"); } });
  } catch (_) {}
}

/* Thema: automatisch, hell, dunkel. Merkt sich die Wahl je Browser. */
const THEMES = [["auto", "Auto"], ["light", "Hell"], ["dark", "Dunkel"]];
function getTheme() { try { return localStorage.getItem("immoviz-theme") || "auto"; } catch (_) { return "auto"; } }
function applyTheme(t) {
  if (t === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", t);
  const b = $("#theme");
  if (b) b.innerHTML = `<span class="label">Thema</span> ${esc(THEMES.find(x => x[0] === t)[1])}`;
}
function initTheme() {
  applyTheme(getTheme());
  const b = $("#theme");
  if (b) b.addEventListener("click", () => {
    const i = THEMES.findIndex(x => x[0] === getTheme());
    const n = THEMES[(i + 1) % THEMES.length][0];
    try { localStorage.setItem("immoviz-theme", n); } catch (_) {}
    applyTheme(n);
  });
}

const STATUS = {
  offen: ["todo", "offen"], laeuft: ["run", "läuft"], annahme: ["warn", "Annahme"], fertig: ["ok", "fertig"],
  wartet: ["todo", "wartet"], fehler: ["bad", "Fehler"], abgebrochen: ["todo", "abgebrochen"],
  freigegeben: ["ok", "freigegeben"], abgelehnt: ["bad", "abgelehnt"],
  teilweise: ["run", "teilweise"], vollstaendig: ["ok", "vollständig"],
};
function tag(st, text) {
  const [cls, lbl] = STATUS[st] || ["todo", st];
  return `<span class="tag ${cls}">${esc(text || lbl)}</span>`;
}
function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString("de-AT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}
function pad(n) { return String(n).padStart(2, "0"); }

document.addEventListener("DOMContentLoaded", () => { injectLogo(); initTheme(); });
