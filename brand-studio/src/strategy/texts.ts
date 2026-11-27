/**
 * Regeltexte der Routen (texts-Chunk: `xe`, `ve`, `Ee`, `We`, `Se`, `Pe`, `ye`, `Te`, `Ke`,
 * `Ie`, `ze`, `z`, `W`, `M`, `S`) und die Pruefungen fuer Texte (`ce` Klischee, `A` Woerter,
 * `v` glaetten, `ge` Claim-Regel, `de` Gedankenstrich).
 *
 * Ohne KI greifen Textbausteine je Territorium; die KI (kiTexte.ts) formuliert nur innerhalb
 * dieser Regeln. Grundsaetze fuer jeden Text: keine Gedankenstriche, keine Ausrufezeichen,
 * keine Makler-Klischees, Claim hoechstens 5 Woerter ohne Ziffern und ohne Gegenueberstellung.
 *
 * Daten: texts.snapshot.json (W1 aus dem Bundle gezogen, Satzbausteine und Muster).
 */
import snapshot from "./texts.snapshot.json";
import { PERSOENLICHKEIT, WERTE, WUNSCHKUNDEN, ONLYNESS_KARTEN, FORMATE } from "./catalog";
import { hash, rng } from "../engine/rng";
import type { AxisKey, BrandBrief, RouteArt, RouteParams, RouteTexts, Territory } from "./types";

interface Snapshot {
  klischeeMuster: { $regexp: string; flags: string }[];
  alternativeText: Record<string, { nominativ: string; von: string }>;
  referenzGenitiv: Record<string, string>;
  achsenText: Record<string, { a: string; b: string }>;
  onlynessSatz: Record<string, string>;
  onlynessNutzen: Record<string, string>;
  nichtIchText: Record<string, string>;
  themen: Record<"persoenlich" | "lokal" | "immobilien", string[]>;
  formate: Record<string, Record<string, string>>;
}

const DATA = snapshot as unknown as Snapshot;

/** Gedankenstriche (Halbgeviert- und Geviertstrich) sind in keinem Text erlaubt (`de`). */
export const GEDANKENSTRICH = new RegExp("[\u2013\u2014]");
const GEDANKENSTRICH_MIT_RAUM = new RegExp("\\s*[\u2013\u2014]\\s*", "g");

/** Makler-Klischees, die kein Text enthalten darf (`he`). */
export const KLISCHEE_MUSTER: readonly RegExp[] = DATA.klischeeMuster.map((m) => new RegExp(m.$regexp, m.flags));

/** Gegenueberstellungen, die im Claim nicht vorkommen ("statt", ", nicht", "erst ... dann"; `ue`). */
const CLAIM_GEGENSATZ: readonly RegExp[] = [/\bstatt\b/i, /,\s*nicht\b/i, /^erst\b.*\bdann\b/i];

/** Erstes Klischee im Text oder `null` (`ce`). */
export function findCliche(text: string): string | null {
  for (const muster of KLISCHEE_MUSTER) {
    const treffer = text.match(muster);
    if (treffer) return treffer[0];
  }
  return null;
}

/** Woerter mit mindestens einem Buchstaben oder einer Ziffer (`A`). */
export function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\d]/u.test(w)).length;
}

/**
 * Text glaetten (`v`): Gedankenstriche werden zu Kommas, Ausrufezeichen zu Punkten,
 * Leerraum vereinheitlicht, doppelte Kommas entfernt.
 */
export function cleanText(text: string): string {
  return text
    .replace(GEDANKENSTRICH_MIT_RAUM, ", ")
    .replace(/!+/g, ".")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/,\s*,/g, ",")
    .trim();
}

/** Claim-Regel (`ge`): 1 bis 5 Woerter, kein Klischee, kein Gegensatz, keine Satzzeichen ! ?, keine Ziffern. */
export function isValidClaim(text: string): boolean {
  return (
    countWords(text) >= 1 &&
    countWords(text) <= 5 &&
    !findCliche(text) &&
    !CLAIM_GEGENSATZ.some((r) => r.test(text)) &&
    !/[!?]/.test(text) &&
    !GEDANKENSTRICH.test(text) &&
    !/\d/.test(text)
  );
}

/** Objektarten im Dativ ("von Wohnungen"; `x`). */
const FOKUS_DATIV: Record<string, string> = {
  wohnen: "Wohnungen",
  haeuser: "Häusern",
  luxus: "Villen und Penthäusern",
  anleger: "Zinshäusern und Anlagewohnungen",
  gewerbe: "Gewerbeflächen",
  neubau: "Neubauprojekten",
  land: "Grund und Land",
};

/** Preisband als Ortsangabe ("in der soliden Mitte"; `ke`). */
const SEGMENT_TEXT: Record<string, string> = {
  einstieg: "bei ersten eigenen Wohnungen",
  mitte: "in der soliden Mitte",
  premium: "im gehobenen Preisband",
  luxus: "in der Spitze des Marktes",
};

/** Themen, die nie gezeigt werden, als Muster fuer Hooks (`Me`). */
const NIE_ZEIGEN: Record<string, RegExp> = {
  familie: /famili|kinder|generation/i,
  zuhause: /zuhause|privat|bei mir/i,
  kunden: /kund|eigentümer am|familien/i,
  preise: /preis|kosten|provision|€/i,
};

/** Formate, die zur Kamera-Antwort passen (`Be`). */
const KAMERA_FORMATE: Record<string, string[]> = {
  gesicht: ["reel", "story", "live"],
  stimme: ["reel", "karussell"],
  objekte: ["karussell", "foto"],
};

const FORMAT_LABEL: Record<string, string> = Object.fromEntries(FORMATE.map((f) => [f.id, f.label]));

/** Name der Marke fuer Texte: eigener Name, sonst Person (`M`). */
function markenName(brief: BrandBrief): string | undefined {
  const name = (brief.hasName ? brief.name : undefined) ?? brief.person ?? brief.name;
  const t = name?.trim();
  return t ? cleanText(t).slice(0, 60) : undefined;
}

/** Ort fuer Texte (`S`). */
function ortName(brief: BrandBrief): string | undefined {
  const t = brief.place?.trim();
  return t ? cleanText(t).slice(0, 40) : undefined;
}

/** Ort mit passender Praeposition: "im Weinviertel", "in der Wachau", "in Wien" (`W`). */
export function mitPraeposition(ort: string): string {
  if (
    /(gau|viertel|kammergut|tal|land|wald|feld|winkel|gebirge|gesäuse|marchfeld)$/i.test(ort) &&
    !/^(Deutschland|Österreich|Holland|Finnland|Griechenland|Russland|Lettland|Estland|Irland|Island|Thailand)$/i.test(ort)
  )
    return `im ${ort}`;
  if (
    /(mark|au|ebene|heide|pfalz|schweiz)$/i.test(ort) &&
    !/^(Pernau|Wels|Spittal|Gmunden|Brigittenau|Leopoldau|Stadlau|Aspern|Lobau|Donau|Hadersdorf|Ebreichsdorf)$/i.test(ort)
  )
    return `in der ${ort}`;
  return `in ${ort}`;
}

/** Steht der Ort mit einfachem "in" (`we`)? */
function einfachesIn(ort: string): boolean {
  return mitPraeposition(ort) === `in ${ort}`;
}

/**
 * Platzhalter fuellen (`z`): `{marke}` mit dem Namen (ohne Namen "Die Marke" oder "Ihr Makler"),
 * `in {ort}` mit der passenden Praeposition, ohne Ort "der Region".
 */
export function fillTemplate(text: string, marke: string | undefined, ort: string | undefined, ersatz = "Die Marke"): string {
  let t = text;
  if (marke) t = t.replace(/\{marke\}/g, marke);
  else {
    t = t.replace(/\bBei \{marke\}/g, ersatz === "Die Marke" ? "Bei der Marke" : "Bei Ihrem Makler");
    t = t.replace(/(^|[.:] )\{marke\}/g, (_m, vor: string) => vor + ersatz);
    t = t.replace(/\{marke\}/g, ersatz.charAt(0).toLowerCase() + ersatz.slice(1));
  }
  t = ort ? t.replace(/\bin \{ort\}/g, mitPraeposition(ort)).replace(/\{ort\}/g, ort) : t.replace(/\{ort\}/g, "der Region");
  return cleanText(t);
}

/** Satz mit Punkt abschliessen (`N`). */
const satz = (text: string): string => {
  const t = text.trim();
  return /[.?]$/.test(t) ? t : t + ".";
};

/** Fuer wen: Seite und die ersten zwei Objektarten (`ze`). */
function zielgruppe(brief: BrandBrief): string {
  const seite = brief.side;
  const fokus = brief.focus ?? [];
  let wer = "Eigentümer";
  if (typeof seite === "number")
    wer = seite <= -1 ? "Eigentümer" : seite >= 1 ? "Käufer" : "Eigentümer und Käufer";
  else if (fokus[0] === "anleger") wer = "Anleger und Eigentümer";
  else if (fokus[0] === "gewerbe") wer = "Unternehmen und Eigentümer";
  const arten = fokus
    .slice(0, 2)
    .map((f) => FOKUS_DATIV[f])
    .filter(Boolean);
  return arten.length ? `${wer} von ${arten.join(" und ")}` : wer;
}

type Rang = Record<RouteArt, number>;

/**
 * "Warum diese Route" (`ve`): die zwei staerksten Gruende aus den Antworten, je nach Art der
 * Route anders gewichtet. Ein Grund, der schon eine andere Route anfuehrt, rueckt nach hinten.
 */
function warumText(t: Territory, brief: BrandBrief, art: RouteArt, benutzt: Set<string>): string {
  const ort = ortName(brief);
  const gruende: { g: string; rang: number }[] = [];
  const nach = (r: Rang): number => r[art];

  if (typeof brief.side === "number") {
    const wen =
      brief.side <= -1
        ? "vor allem Eigentümer"
        : brief.side >= 1
          ? "vor allem Käufer"
          : "Eigentümer und Käufer gleichermaßen";
    gruende.push({
      g: `du ${wen}${ort ? ` ${mitPraeposition(ort)}` : ""} berätst`,
      rang: nach({ sicher: 3, mutig: 2, ueberraschend: 1 }),
    });
  } else if (ort) {
    gruende.push({ g: `dein Kerngebiet ${ort} ist`, rang: nach({ sicher: 1, mutig: 1, ueberraschend: 0.5 }) });
  }

  const staerke =
    (brief.onlyness ?? []).find((o) => t.onlyness.includes(o)) ??
    (art === "sicher" ? brief.onlyness?.[0] : undefined);
  const staerkeLabel = staerke ? ONLYNESS_KARTEN.find((k) => k.id === staerke)?.label : undefined;
  if (staerkeLabel)
    gruende.push({
      g: `\u201E${staerkeLabel}\u201C deine Stärke ist`,
      rang: nach({ sicher: 4, mutig: 2.5, ueberraschend: 1.5 }),
    });

  if (brief.reference) {
    const passt = t.referenzen.includes(brief.reference);
    gruende.push({
      g: `du die Welt ${DATA.referenzGenitiv[brief.reference]} gewählt hast`,
      rang: passt ? nach({ sicher: 2, mutig: 1.5, ueberraschend: 5 }) : 0.2,
    });
  }
  if (brief.alternative && t.alternativen.includes(brief.alternative))
    gruende.push({
      g: `du dich ${DATA.alternativeText[brief.alternative]?.von} abheben willst`,
      rang: nach({ sicher: 1.5, mutig: 4, ueberraschend: 1 }),
    });

  const achsenKeys = Object.keys(DATA.achsenText);
  for (const [paar, wahl] of Object.entries(brief.logoPairs ?? {})) {
    if (wahl !== "a" && wahl !== "b") continue;
    const wert = t.achsen[paar as AxisKey] ?? 0;
    if ((wahl === "b" ? 1 : -1) * wert >= 0.3)
      gruende.push({
        g: (DATA.achsenText[paar] as { a: string; b: string })[wahl],
        rang: nach({ sicher: 2.5, mutig: 1.2, ueberraschend: 1 }) - 0.01 * achsenKeys.indexOf(paar),
      });
  }

  const kunde = (brief.wunschkunde ?? [])
    .map((id) => WUNSCHKUNDEN.find((w) => w.id === id))
    .find((w) => w && w.territorien.includes(t.id));
  if (kunde)
    gruende.push({
      g: `du für ${(kunde.wer.split(",")[0] as string).replace(/^Menschen$/, "Menschen in dieser Lage")} arbeiten willst`,
      rang: nach({ sicher: 2.4, mutig: 2, ueberraschend: 1 }),
    });

  const fokus = (brief.focus ?? [])
    .filter((f) => t.fokus.includes(f))
    .slice(0, 2)
    .map((f) => FOKUS_DATIV[f]);
  if (fokus.length)
    gruende.push({
      g: `dein Schwerpunkt bei ${fokus.join(" und ")} liegt`,
      rang: nach({ sicher: 2.2, mutig: 2.2, ueberraschend: 1.2 }),
    });
  if (brief.segment && t.segmente.includes(brief.segment))
    gruende.push({
      g: `du ${SEGMENT_TEXT[brief.segment]} unterwegs bist`,
      rang: nach({ sicher: 1.8, mutig: 1.4, ueberraschend: 0.8 }),
    });

  const stark = gruende.sort((a, b) => b.rang - a.rang).filter((g) => g.rang >= 0.5);
  const neu = stark.filter((g) => !benutzt.has(g.g));
  const top = (neu.length ? [...neu, ...stark.filter((g) => benutzt.has(g.g))] : stark).slice(0, 2).map((g) => g.g);
  if (top[0]) benutzt.add(top[0]);
  if (!top.length)
    return art === "sicher"
      ? "Die ruhigste Ausgangsbasis, solange noch Antworten fehlen."
      : art === "mutig"
        ? "Ein deutlicher Gegenentwurf mit einer anderen Grundhaltung und mehr Abstand zum Markt."
        : "Die überraschende Richtung im Vergleich, weit weg vom Üblichen und trotzdem tragfähig.";
  const [erster, zweiter] = top as [string, string | undefined];
  const zweiterKurz = zweiter && erster.startsWith("du ") && zweiter.startsWith("du ") ? zweiter.slice(3) : zweiter;
  return cleanText(`Weil ${zweiterKurz ? `${erster} und ${zweiterKurz}` : erster}.`);
}

/** Claim aus den Bausteinen des Territoriums, gewaehlt mit dem Seed der Route (`Ee`). */
function claimText(t: Territory, brief: BrandBrief, seed: number): string {
  const marke = markenName(brief);
  const ort = ortName(brief);
  const claims = t.claims
    .filter(
      (c) =>
        !c.includes("{ort}") ||
        (ort && (einfachesIn(ort) || c.split("{ort}").length - 1 === c.split("in {ort}").length - 1)),
    )
    .map((c) => fillTemplate(c, marke, ort))
    .filter(isValidClaim);
  return claims.length ? (claims[rng(seed).int(0, claims.length - 1)] as string) : "Häuser, gut begleitet";
}

/** Beleg aus der eigenen Antwort, hoechstens 24 Woerter (`Se`). */
function belegSatz(brief: BrandBrief): string | undefined {
  const proof = brief.proof?.trim();
  if (!proof) return undefined;
  const text = cleanText(proof).replace(/[\u201E\u201C"]/g, "");
  const woerter = text.split(/\s+/);
  const kurz = woerter.length > 24 ? woerter.slice(0, 24).join(" ").replace(/[,;:]$/, "") : text;
  return satz(`Ein Beispiel aus der Praxis: ${kurz}`);
}

/**
 * Story nach StoryBrand (`We`): kurz bis 35 Woerter, mittel 70 bis 100 Woerter. Fuer die
 * mittlere Fassung fallen Saetze mit dem hoechsten "weg"-Wert zuerst, bis sie passt.
 */
function storyTexte(t: Territory, brief: BrandBrief): { kurz: string; mittel: string } {
  const marke = markenName(brief);
  const ort = ortName(brief);
  const f = (s: string): string => satz(fillTemplate(s, marke, ort, "Ihr Makler"));
  const st = t.story;
  let kurz = [f(st.problem), f(st.plan), f(st.erfolg)].join(" ");
  if (countWords(kurz) > 35) kurz = [f(st.problem), f(st.plan)].join(" ");
  const beleg = belegSatz(brief);
  const teile = [
    { s: f(st.problem), weg: 0 },
    { s: f(st.gefahr), weg: 4 },
    { s: f(st.empathie), weg: 3 },
    { s: f(st.plan), weg: 0 },
    { s: f(st.schritte), weg: 2 },
    ...(beleg ? [{ s: beleg, weg: 0 }] : []),
    { s: f(st.aufruf), weg: 5 },
    { s: f(st.erfolg), weg: 0 },
  ];
  const laenge = (): number => countWords(teile.map((x) => x.s).join(" "));
  if (laenge() < 70) teile.splice(teile.length - 2, 0, { s: f(st.zusatz), weg: 1 });
  while (laenge() > 100) {
    const i = teile.reduce((best, x, idx) => (x.weg > (teile[best]?.weg ?? 0) ? idx : best), -1);
    if (i < 0 || (teile[i] as { weg: number }).weg === 0) break;
    teile.splice(i, 1);
  }
  return { kurz, mittel: teile.map((x) => x.s).join(" ") };
}

/**
 * Social-Kit (`Pe`): 3 Content-Saeulen mit Hooks (Territorium zuerst, dann allgemeine Themen),
 * ohne Themen, die nie gezeigt werden, und Profiltext bis 150 Zeichen. Wenig Zeit: 4 Hooks
 * statt 5; nur Bewegtbild: kuerzeste Hooks zuerst.
 */
export function socialKit(t: Territory, brief: BrandBrief): NonNullable<RouteTexts["socialKit"]> {
  const marke = markenName(brief);
  const ort = ortName(brief);
  const nie = (brief.social?.never ?? []).map((n) => NIE_ZEIGEN[n]).filter((r): r is RegExp => !!r);
  const gern = Object.entries(brief.social?.formats ?? {})
    .filter(([, s]) => s === "gern")
    .map(([f]) => f);
  const nurBewegt = gern.length > 0 && gern.every((f) => f === "reel" || f === "story" || f === "live");
  const anzahl = typeof brief.social?.hoursPerWeek === "number" && brief.social.hoursPerWeek < 1 ? 4 : 5;
  const erlaubt = (h: string): boolean =>
    !nie.some((r) => r.test(h)) && h.split("{ort}").length === h.split("in {ort}").length;
  const saeulen = t.social.saeulen.map((s) => {
    const eigene = s.hooks.filter(erlaubt);
    const allgemein = DATA.themen[s.art].filter(erlaubt);
    let hooks = [...eigene, ...allgemein].slice(0, anzahl).map((h) => fillTemplate(h, marke, ort));
    if (nurBewegt) hooks = [...hooks].sort((a, b) => a.length - b.length);
    return { titel: s.titel, hooks };
  });
  let profiltext = fillTemplate(t.social.profiltext, marke, ort);
  if (profiltext.length > 150) profiltext = profiltext.split(new RegExp("(?<=\\.)\\s"))[0] as string;
  if (profiltext.length > 150) profiltext = profiltext.slice(0, 147).replace(/\s+\S*$/, "") + ".";
  return { saeulen, profiltext };
}

/**
 * Drei Eigenschaften (`ye`): zuerst aus den Antworten (sicher: Fremdbild vor Wirkung, sonst
 * umgekehrt), dann aus dem Territorium, ohne doppelte Eigenschaft.
 */
export function persoenlichkeit(t: Territory, brief: BrandBrief, art: RouteArt): { eigenschaft: string; satz: string }[] {
  const ausAntwort = (ids: readonly string[] | undefined): { eigenschaft: string; satz: string }[] =>
    (ids ?? [])
      .map((id) => PERSOENLICHKEIT.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => ({ eigenschaft: p.eigenschaft, satz: p.satz }));
  const antworten =
    art === "sicher"
      ? [...ausAntwort(brief.fremdbild), ...ausAntwort(brief.wirkung)]
      : [...ausAntwort(brief.wirkung), ...ausAntwort(brief.fremdbild)];
  const out: { eigenschaft: string; satz: string }[] = [];
  for (const p of [...antworten.slice(0, 2), ...t.persoenlichkeit, ...antworten.slice(2)]) {
    if (out.length >= 3) break;
    if (!out.some((o) => o.eigenschaft === p.eigenschaft)) out.push(p);
  }
  return out;
}

const grossAnfang = (s: string): string => s.charAt(0).toLocaleUpperCase("de-AT") + s.slice(1);

/** Wunschkunde (`Te`): passende Antworten zuerst, hoechstens zwei, mit Ort davor. */
export function wunschkunde(t: Territory, brief: BrandBrief): string {
  const ort = ortName(brief);
  const gewaehlt = (brief.wunschkunde ?? [])
    .map((id) => WUNSCHKUNDEN.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => !!w);
  const wer = [
    ...gewaehlt.filter((w) => w.territorien.includes(t.id)),
    ...gewaehlt.filter((w) => !w.territorien.includes(t.id)),
  ]
    .map((w) => w.wer)
    .slice(0, 2);
  const liste = wer.length ? wer : [t.wunschkunde];
  const text =
    liste.length === 2
      ? `${liste[0]}${/, die /.test(liste[0] as string) ? "," : ""} und ${liste[1]}`
      : (liste[0] as string);
  return cleanText(ort ? `${grossAnfang(mitPraeposition(ort))}: ${text}.` : `${grossAnfang(text)}.`);
}

/** Versprechen (`Ke`): erster passender Wert, der noch keiner anderen Route gehoert. */
export function versprechen(t: Territory, brief: BrandBrief, benutzt: Set<string>): string {
  const wert = (brief.werte ?? [])
    .map((id) => WERTE.find((w) => w.id === id))
    .find((w) => w && w.territorien.includes(t.id) && !benutzt.has(`versprechen:${w.id}`));
  if (wert) benutzt.add(`versprechen:${wert.id}`);
  return cleanText(wert ? wert.versprechen : t.versprechen);
}

/** Rhythmus aus Posts je Woche (`Ge`). */
function rhythmus(proWoche: number): string {
  if (proWoche >= 1.5) {
    const n = Math.round(proWoche);
    return `${n === 2 ? "zweimal" : n === 3 ? "dreimal" : "einmal"} pro Woche`;
  }
  if (proWoche >= 0.75) return "einmal pro Woche";
  if (proWoche >= 0.4) return "alle zwei Wochen";
  return "einmal im Monat";
}

/** Posts je Woche aus der verfuegbaren Zeit (`He`). */
const postsJeWoche = (stunden: number | undefined): number =>
  stunden === undefined ? 2 : stunden < 1 ? 1 : stunden < 2 ? 2 : stunden < 4 ? 3 : 5;

/**
 * Formate (`Ie`): gern genannte, dann passend zur Kamera, zum Territorium und zu den Kanaelen,
 * nie genannte fallen weg. Wenig Zeit: 2 Formate, sonst 3, mit Rhythmus und einem Satz.
 */
export function formate(t: Territory, brief: BrandBrief): { format: string; rhythmus: string; satz: string }[] {
  const social = brief.social ?? {};
  const gern = Object.entries(social.formats ?? {})
    .filter(([, s]) => s === "gern")
    .map(([f]) => f);
  const nie = new Set(
    Object.entries(social.formats ?? {})
      .filter(([, s]) => s === "nie")
      .map(([f]) => f),
  );
  const kamera = social.camera;
  if (kamera === "objekte") nie.add("live");
  const ausKanaelen = (social.channels ?? []).flatMap((c) =>
    c === "linkedin" || c === "newsletter" ? ["text"] : c === "tiktok" || c === "youtube" ? ["reel"] : [],
  );
  const liste = [...gern, ...(kamera ? (KAMERA_FORMATE[kamera] ?? []) : []), ...t.formatVorliebe, ...ausKanaelen, "karussell", "foto"].filter(
    (f, i, all) => FORMAT_LABEL[f] && !nie.has(f) && all.indexOf(f) === i,
  );
  const stunden = social.hoursPerWeek;
  const anzahl = stunden !== undefined && stunden < 1 ? 2 : 3;
  const posts = postsJeWoche(stunden);
  const anteile = anzahl === 2 ? [0.6, 0.4] : [0.5, 0.3, 0.2];
  return liste.slice(0, anzahl).map((f, i) => {
    const saetze = DATA.formate[f] ?? {};
    return {
      format: FORMAT_LABEL[f] as string,
      rhythmus: rhythmus(posts * (anteile[i] as number)),
      satz: (kamera && saetze[kamera]) || saetze.standard || "",
    };
  });
}

/**
 * Alle Texte einer Route (`xe`). `benutzt` wird ueber die drei Routen geteilt, damit
 * "Warum" und "Versprechen" sich nicht wiederholen.
 */
export function routeTexts(
  t: Territory,
  brief: BrandBrief,
  art: RouteArt,
  params: Pick<RouteParams, "seed">,
  benutzt: Set<string> = new Set(),
): RouteTexts {
  const marke = markenName(brief);
  const ort = ortName(brief);
  const seed = hash(`${params.seed}:${t.id}:text`);
  const staerke = (brief.onlyness ?? [])[0];
  const kern = (staerke && DATA.onlynessSatz[staerke]) || t.onlynessKern;
  const onlyness = fillTemplate(`{marke} ist die einzige Adresse in {ort}, die ${kern}.`, marke, ort);
  const gegen = brief.alternative ? DATA.alternativeText[brief.alternative]?.nominativ : "der übliche Auftritt am Markt";
  const anders = fillTemplate(t.anders, marke, ort);
  const weil = (staerke && DATA.onlynessNutzen[staerke]) || t.weil;
  const positionierung = cleanText(
    `Für ${zielgruppe(brief)} ${ort ? mitPraeposition(ort) : "in der Region"}. Anders als ${gegen} ${anders}. Weil ${weil}`,
  );
  const story = storyTexte(t, brief);
  const leitplanken = [
    ...t.leitplanken,
    ...(brief.avoidCliches ?? []).map((k) => DATA.nichtIchText[k]).filter((s): s is string => !!s),
  ];
  return {
    kernidee: fillTemplate(t.kernidee, marke, ort),
    schluesselwoerter: [...t.schluesselwoerter],
    warum: warumText(t, brief, art, benutzt),
    onlyness,
    positionierung: satz(positionierung),
    claim: claimText(t, brief, seed),
    storyKurz: story.kurz,
    storyMittel: story.mittel,
    tonBeispiele: t.ton.beispiele.map((b) => fillTemplate(b, marke, ort)),
    sagen: [...t.ton.sagen],
    vermeiden: [...t.ton.vermeiden],
    leitplanken,
    passtFuer: t.passtFuer,
    risiko: t.risiko,
    socialKit: socialKit(t, brief),
    persoenlichkeit: persoenlichkeit(t, brief, art),
    wunschkunde: wunschkunde(t, brief),
    versprechen: versprechen(t, brief, benutzt),
    formate: formate(t, brief),
    quelle: "regel",
  };
}
