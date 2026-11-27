/**
 * Wortfeld- und Lautregeln (nameFinder-Chunk: `du`, `ye`, `sn`, `pa`, `lu`, `cn`, `hu`, `ou`,
 * `cu`, `gu`, `bu`, `In`, `Zn`, `Js`, `Qs`, `_n`, `Ys`, `Da`, `Xs`, `ei`, `Vr`, `ri`, `ni`,
 * `ai`, `Wr`, `Un`, `Na`, `Ve`, `si`, `Bn`, `Le`, `di`, `lr`, `Or`, `hi`).
 *
 * Wortfelder: Zu welcher Ortslage passt ein Wort (Palais in die Innenstadt, Weinhof aufs
 * Land)? Lautregeln: Silben, Mitlaut- und Vokalfolgen, Aussprechbarkeit, Weichheit.
 * Sperren: Maengel- und Verwaltungswoerter (Befund, Gutachten, Pfand), die -werck-Regel,
 * Gattungswoerter (Haus, Villa) und Kunstwoerter, die schon echte Woerter sind.
 */
import { WORDS_DB } from "./wordsDb";
import { KEYWORD_FIELDS } from "./kwFields";
import { flat, fold, memo } from "./fold";
import { hardCount, TECH_RULES } from "./tech";
import type { PlaceClass } from "../orte";

// ---------------------------------------------------------------------------
// Wortfelder und Ortslage

/** Wortfeld fuer die Passung zur Lage. */
export type PlaceField =
  | "grand"
  | "urban"
  | "modern"
  | "land"
  | "zinshaus"
  | "ortskern"
  | "wein"
  | "garten"
  | "wasser"
  | "berg"
  | "neutral";

/** Woerter je Wortfeld (`du`). */
const PLACE_FIELD_WORDS: Readonly<Record<Exclude<PlaceField, "neutral">, string[]>> = {
  grand: [
    "Risalit",
    "Supraporte",
    "Lünette",
    "Pilaster",
    "Balustrade",
    "Salettl",
    "Biedermeier",
    "Stuckdecke",
    "Kaminzimmer",
    "Turmzimmer",
    "Gartensalon",
    "Kranzgesims",
    "Rustika",
    "Palais",
    "Gartensaal",
    "Vestibül",
    "Rotunde",
    "Mezzanin",
    "Portikus",
    "Beletage",
    "Piano Nobile",
    "Palazzina",
    "Luster",
    "Flügeltür",
    "Kabinett",
    "Lisene",
    "Domizil",
    "Gründerzeit",
    "Pied-à-Terre",
    "Hohe Räume",
    "Dimora",
    "Travertin",
    "Marmor",
    "Bronze",
    "Pavillon",
    "Salon",
    "Enfilade",
    "Entresol",
    "Rotonde",
    "Salone",
    "Palatium",
    "Demeure",
    "Jugendstil",
    "Corniche",
    "Moulure",
    "Lambris",
    "Boiserie",
    "Marmo",
    "Porfido",
    "Chiostro",
    "Atrio",
    "Gemach",
    "Söller",
    "Altan",
    "Galerie",
    "Empore",
  ],
  urban: [
    "Torbogen",
    "Hoftor",
    "Eckerker",
    "Erker",
    "Lichthof",
    "Attika",
    "Gesims",
    "Mansarde",
    "Hofseite",
    "Cortile",
    "Arkade",
    "Loggia",
    "Atrium",
    "Kontor",
    "Fassade",
    "Lichte Höhe",
    "Alte Mauern",
    "Stiller Hof",
    "Kurze Wege",
    "Neue Mitte",
    "Civitas",
    "Patina",
    "Messing",
    "Kupfer",
    "Officina",
    "Fondaco",
    "Terrazzo",
    "Tessera",
    "Abitare",
    "Altana",
    "Patio",
    "Bauhütte",
    "Innenhof",
    "Passage",
    "Quartier",
    "Faubourg",
    "Rione",
    "Viale",
    "Promenade",
    "Gewölbe",
    "Oberlicht",
    "Terrasse",
    "Balcone",
    "Soglia",
    "Laiton",
    "Mosaik",
    "Mosaico",
    "Maiolica",
    "Keramik",
    "Schwelle",
    "Logis",
    "Forum",
    "Impluvium",
    "Solarium",
  ],
  modern: [
    "Raumplan",
    "Grundriss",
    "Lichtmaß",
    "Kubatur",
    "Baulinie",
    "Quader",
    "Fluchtpunkt",
    "Bauplatz",
    "Lichtband",
    "Kubus",
    "Monolith",
    "Tektonik",
    "Sichtachse",
    "Werkhof",
    "Ziegel",
    "Klare Linie",
    "Kluge Räume",
    "Fundament",
    "Achsmaß",
    "Opus",
    "Tectum",
    "Solum",
    "Terra Firma",
    "Domus Nova",
    "Raum & Zeit",
    "Ort & Wert",
    "Licht & Luft",
    "Glashaus",
  ],
  land: [
    "Dreiseithof",
    "Streckhof",
    "Troadkasten",
    "Zirbenstube",
    "Bauernstube",
    "Anwesen",
    "Landsitz",
    "Giebel",
    "Zirbe",
    "Lärche",
    "Hofstelle",
    "Vierkanter",
    "Domaine",
    "Casale",
    "Weiter Grund",
    "Wurzelwerk",
    "Haus & Hof",
    "Grund & Boden",
    "Casa Serena",
    "Stadel",
    "Gehöft",
    "Gutshof",
    "Pietra",
    "Landhaus",
    "Fachwerk",
    "Scheune",
    "Tenne",
    "Schindel",
    "Mühle",
    "Manoir",
    "Moulin",
    "Mulino",
    "Fattoria",
    "Cascina",
    "Masseria",
    "Rustico",
    "Fienile",
    "Limonaia",
    "Serra",
    "Verger",
    "Prairie",
    "Anger",
    "Heide",
    "Tanne",
    "Fichte",
    "Larice",
    "Rovere",
    "Legno",
    "Lignum",
    "Silva",
    "Selva",
    "Nemus",
    "Lucus",
    "Cipresso",
    "Weide",
    "Arbor",
    "Schiefer",
    "Kiesel",
    "Ardoise",
    "Ardesia",
  ],
  zinshaus: [
    "Hofstiege",
    "Blockrand",
    "Zinshaus",
    "Grätzl",
    "Pawlatsche",
    "Stiege",
    "Durchhaus",
    "Stadthaus",
    "Hochparterre",
    "Kastenfenster",
    "Freihaus",
  ],
  ortskern: ["Stadtkern", "Ortskern", "Stadtmitte", "Marktplatz", "Hauptplatz"],
  wein: [
    "Weinhof",
    "Lesehof",
    "Weinberg",
    "Weinlaub",
    "Vigna",
    "Vigneto",
    "Vignoble",
    "Terroir",
    "Vinea",
    "Rebhang",
    "Kellergasse",
    "Presshaus",
  ],
  garten: [
    "Laube",
    "Veranda",
    "Pergola",
    "Remise",
    "Linde",
    "Kastanie",
    "Nussbaum",
    "Flieder",
    "Glycine",
    "Glicine",
    "Tonnelle",
    "Jardin",
    "Giardino",
    "Hortus",
    "Hortulus",
    "Pergula",
    "Ahorn",
    "Birke",
    "Buche",
    "Eiche",
    "Esche",
    "Tilia",
    "Tilleul",
    "Platane",
    "Lichtung",
    "Grüne Mitte",
    "Locus Amoenus",
    "Mandorlo",
    "Alloro",
    "Laurus",
    "Ginestra",
    "Waldrand",
    "Wiese",
  ],
  wasser: [
    "Uferweg",
    "Weiher",
    "Insel",
    "Ruisseau",
    "Fontaine",
    "Fiume",
    "Fonte",
    "Sorgente",
    "Torrente",
    "Ruscello",
    "Isola",
    "Darsena",
    "Litus",
    "Rivus",
    "Fluvius",
    "Flumen",
    "Lacus",
    "Fontana",
    "Seeufer",
    "Bootshaus",
    "Seeblick",
    "Uferhaus",
    "Seegrund",
    "Steg",
    "Lände",
    "Badehaus",
  ],
  berg: [
    "Fernsicht",
    "Bühel",
    "Hügel",
    "Leite",
    "Hochland",
    "Voralpen",
    "Colline",
    "Sommet",
    "Colle",
    "Collina",
    "Crinale",
    "Monte",
    "Valle",
    "Clivus",
    "Collis",
    "Vallis",
    "Chalet",
    "Rifugio",
    "Refuge",
    "Hochalm",
    "Almblick",
    "Bergblick",
    "Gipfel",
    "Alm",
    "Hangseite",
  ],
};

const plainKey = (text: string): string =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("de-AT");

const FIELD_OF_WORD = new Map<string, PlaceField>();
for (const [field, words] of Object.entries(PLACE_FIELD_WORDS))
  for (const w of words)
    if (!FIELD_OF_WORD.has(plainKey(w))) FIELD_OF_WORD.set(plainKey(w), field as PlaceField);

/**
 * Wortfeld eines Worts (`pa`): aus der Liste, sonst aus Wortanfang, Wortfeld der
 * Wortdatenbank (`dbField`) und Bedeutung (`meaning`).
 */
export function placeFieldOf(word: string, dbField?: string, meaning = ""): PlaceField {
  const known = FIELD_OF_WORD.get(plainKey(word));
  if (known) return known;
  const key = plainKey(word);
  if (/stadt|palais|salon/.test(key)) return key.startsWith("stadt") ? "urban" : "grand";
  if (/^see|ufer/.test(key)) return "wasser";
  if (/^berg|^alm|^hang/.test(key)) return "berg";
  if (/^(linden|garten)|garten$/.test(key)) return "garten";
  if (/^(land|wald|wiesen|hof)|(gut|wald|wiese)$/.test(key)) return "land";
  if (
    /see|ufer|bach|fluss|quelle|teich|weiher|strand|insel|hafen|brunnen|wasser|bucht/i.test(meaning)
  )
    return "wasser";
  if (/berg|gipfel|hang|hügel|alm|grat|fels|anhöhe|tal\b|höhe/i.test(meaning)) return "berg";
  if (/baum|garten|blüte|strauch/i.test(meaning)) return "garten";
  if (dbField === "landschaft" || /wald|wiese|hof\b|gut\b|mühle|bauernhaus|landhaus/i.test(meaning))
    return "land";
  return dbField === "bau" ? "urban" : dbField === "raum" ? "modern" : "neutral";
}

/** Passung Wortfeld zu Lageklasse: 1 passt, 0 neutral, -1 passt nicht (`lu`). */
const FIELD_FIT: Readonly<Record<PlaceClass, Record<string, number>>> = {
  innenstadt: {
    grand: 1,
    urban: 1,
    zinshaus: 0,
    ortskern: -1,
    modern: 0,
    garten: -1,
    land: -1,
    wein: 0,
    wasser: -1,
    berg: -1,
    neutral: 0,
  },
  altbau: {
    grand: 0,
    urban: 1,
    zinshaus: 1,
    ortskern: -1,
    modern: 0,
    garten: 0,
    land: -1,
    wein: 0,
    wasser: -1,
    berg: -1,
    neutral: 0,
  },
  villa: {
    grand: 1,
    urban: 1,
    zinshaus: -1,
    ortskern: -1,
    modern: -1,
    garten: 1,
    land: -1,
    wein: 0,
    wasser: -1,
    berg: -1,
    neutral: 0,
  },
  arbeiter: {
    grand: -1,
    urban: 1,
    zinshaus: 1,
    ortskern: -1,
    modern: 1,
    garten: -1,
    land: -1,
    wein: 0,
    wasser: -1,
    berg: -1,
    neutral: 0,
  },
  stadt: {
    grand: 1,
    urban: 1,
    zinshaus: 1,
    ortskern: -1,
    modern: 1,
    garten: 0,
    land: -1,
    wein: 0,
    wasser: -1,
    berg: -1,
    neutral: 0,
  },
  kleinstadt: {
    grand: -1,
    urban: 1,
    zinshaus: -1,
    ortskern: 1,
    modern: 0,
    garten: 1,
    land: 1,
    wein: 0,
    wasser: 0,
    berg: 0,
    neutral: 0,
  },
  land: {
    grand: -1,
    urban: -1,
    zinshaus: -1,
    ortskern: -1,
    modern: -1,
    garten: 1,
    land: 1,
    wein: 0,
    wasser: 0,
    berg: 0,
    neutral: 0,
  },
};

/**
 * Passung eines Wortfelds zur Lage (`cn`). Wasser nur mit Gewaesser, Wein nur in
 * Weinregionen, Berg auf dem Land nur mit Huegeln.
 */
export function fieldFit(
  cls: PlaceClass | null,
  field: PlaceField,
  water = false,
  hills = false,
  wine = false,
): number {
  if (field === "wasser" && !water) return -1;
  if (field === "wein") return wine ? 1 : -1;
  if (!cls) return 0;
  if (cls === "land" && field === "wasser") return 1;
  if (cls === "land" && field === "berg") return hills ? 1 : 0;
  if (field === "wasser" && water && cls !== "innenstadt" && cls !== "arbeiter") return 0;
  return FIELD_FIT[cls][field]!;
}

/** Materialwoerter (`hu`). */
const MATERIAL_WORDS: ReadonlySet<string> = new Set(
  [
    "Kupfer",
    "Messing",
    "Marmor",
    "Bronze",
    "Keramik",
    "Mosaik",
    "Ziegel",
    "Travertin",
    "Terrazzo",
    "Granit",
    "Porphyr",
    "Bernstein",
    "Parkett",
    "Schiefer",
    "Kiesel",
    "Mosaico",
    "Marmo",
    "Ambra",
    "Granito",
    "Pietra",
    "Tessera",
    "Luster",
  ].map(plainKey),
);
/** Abstrakte Raum- und Lichtwoerter (`ou`). */
const ABSTRACT_WORDS: ReadonlySet<string> = new Set(
  [
    "Weite",
    "Stille",
    "Horizont",
    "Aussicht",
    "Ausblick",
    "Lichtband",
    "Lichtmaß",
    "Grundriss",
    "Tektonik",
    "Sichtachse",
    "Kubatur",
    "Kubus",
    "Quader",
    "Fluchtpunkt",
    "Baulinie",
    "Bauplatz",
    "Helle",
    "Sonnwende",
    "Abendstern",
    "Abendrot",
    "Tageslicht",
    "Waldlicht",
    "Weitblick",
    "Morgenlicht",
    "Abendlicht",
    "Monolith",
  ].map(plainKey),
);
/** Heim-Woerter (`cu`). */
const HOME_WORDS: ReadonlySet<string> = new Set(
  [
    "Daheim",
    "Bleibe",
    "Heimweg",
    "Domizil",
    "Heimstatt",
    "Wohnsitz",
    "Herrenhaus",
    "Stammhaus",
    "Refugium",
    "Wohnkultur",
    "Dach & Fach",
    "Offenes Haus",
    "Gute Nachbarn",
    "Tür an Tür",
    "Haus & Hof",
    "Grund & Boden",
  ].map(plainKey),
);
/** Bau-Woerter (`gu`). */
const BUILDING_WORDS: ReadonlySet<string> = new Set(
  [
    "Zirbenstube",
    "Bauernstube",
    "Lände",
    "Badehaus",
    "Uferhaus",
    "Weinhof",
    "Lesehof",
    "Dreiseithof",
    "Streckhof",
    "Troadkasten",
    "Presshaus",
    "Kogel",
    "Schindel",
    "Vierkanter",
    "Hofstelle",
    "Hochalm",
    "Leite",
    "Uferweg",
    "Voralpen",
    "Zirbe",
    "Giebel",
    "Landgut",
    "Hofgut",
    "Gutshof",
    "Seeufer",
    "Bootshaus",
  ].map(plainKey),
);

/** Klasse eines Namensworts fuer die Wertung. */
export type WordClass = "heim" | "material" | "garten" | "abstrakt" | "bau";

/** Klasse eines Worts (`bu`): Heim, Material, Garten, Abstrakt, Bau oder keine. */
export function wordClassOf(word: string, dbField?: string, meaning = ""): WordClass | null {
  const key = plainKey(word);
  if (HOME_WORDS.has(key) || dbField === "wohnen") return "heim";
  const field = placeFieldOf(word, dbField, meaning);
  if (MATERIAL_WORDS.has(key)) return "material";
  if (field === "garten") return "garten";
  if (dbField === "material") return "material";
  if (ABSTRACT_WORDS.has(key) || dbField === "raum" || dbField === "licht") return "abstrakt";
  if (
    BUILDING_WORDS.has(key) ||
    dbField === "bau" ||
    field === "urban" ||
    field === "grand" ||
    field === "zinshaus"
  )
    return "bau";
  return null;
}

// ---------------------------------------------------------------------------
// Maengelwoerter und -werck-Regel

const wordSet = (text: string): ReadonlySet<string> => new Set(text.trim().split(/\s+/).map(flat));

/** Gesperrt: Verwaltung, Maengel, Recht, Finanzen, schwere Woerter (`In`). */
export const SPERRWOERTER: ReadonlySet<string> = wordSet(`
  ruhestand fassade stuck zinnober leuchten lucrum badehaus einfahrt glaserei kornfeld cornfeld mohnfeld rapsfeld
  wollsack scheune bauernhof weingut zinshaus altbau buero bürohaus ankerplatz abendrot morgentau almrausch raureif
  steppensee canneto fructus tectum cimasa salice immeuble charpente auvent grenier fronton bona color lino silvo
  arcor montan ripen alten solen colar cantar montar praten lagel pratar trata curel lumet veris forton solon
  ausbau pforte vordach turmzimmer seeland palea fieno fienile heuriger opes umbra stilaltbau mietzins hausherr heimkehr
  seegrund seilbahn granaio pascolo proventus cornice lucura vero colo laco laro orno merco werck ertragswert gewerbe
  kapital portero anger findling oelfarbe altea sachwerth seenplatte weinort zisterne pawlatsche gewaehr rente hummel
  tektonik genius prova merca zuflucht bleibe anker halt
  befund befunde mangel maengel schaden bauschaden sanierungsfall gutachten pruefung bewertung schaetzung perizia stima
  aestimatio estimation hypothek pignus pegno gage pfand anleihe zinsfuss zinseszins cedola kupon abrechnung nachlass
  trennung auktion kaufvertrag rogito bail pactum vectigal sanierung bausubstanz revitalisierung abriss altlast leerstand
  verfall ruine riss setzriss schimmel feuchte moor custodia interesse interet rapport mietertrag zinsertrag zinshausmarkt
  gewerbegebiet gastgewerbe hotellerie hausautomation diagnose defekt mahnung kuendigung raeumung insolvenz pfaendung
  versteigerung haftung erbe erede secession verbena modestia
  wohnrecht mietrecht baurecht edelstahl sonntag garantie reserve nutzwert nutzwerth besitztum leumund
`);
/** Schwach: nur als Notnagel (`Zn`). */
export const SCHWACHE_WOERTER: ReadonlySet<string> = wordSet(`
  messing bronze kupfer kuppel kastanie loden azurblau sepia tageslicht roehricht weiher seerose wildrose weinlese
  baumkrone turmalin schindel walmdach flachdach glasdach dachfirst luster kranzgesims gesims pilaster lisene
  fluegeltuer hoftor stuckdecke eckturm eckerker eckbau torbogen kopfbau fundament mansarde kubatur wohnform
  mosaik gewoelbe stille bergsee seeufer seerand auwald hofstelle landhaus gutshof ruhepunkt birke esche foehre weide
  ahorn muehle laube stube steg welle zins wert werk licht forum solum portal tessera civitas cortile mercato
  bottega terrazzo silven valen noven selvan aurel sternlicht weinlaube gewerbehof halle bleiglas porphyr funkeln
  wurzelwerk hanglage kiesel sparren traufe ziegel stiege anwesen glasur lasur hartholz malachit parkett hinterhof
  hochwald bootshaus alpe duene kogel tenne bauplatz bueroraum hausportal heide urwald gusseisen
  emaille bergahorn bachlauf muehlrad herdfeuer weinrebe weinberg gipfel pinie duna riede leite huegel travertin
  stiegenhaus flussufer altena klarwerck fruehnebel holler porzellan quellbach rebzeile sachwert stadel zirbe kuppe buehel
  flaechenwerck stabena obhut basis besitz vermoegen vorsorge ruecklage keramik rosshaar holzbohle baulinie felsen voralpen
  raumkern gehoeft riparo ripola fundola fundano albola larano altarm hochmoor schutz sicherheit securitas sicurezza
  surete garanzia jahresring wohnturm stadtpark bastei zentrum entree walzer regen rute urbs robur libra vitis abies ombra
  carte cielo luces calmo coteau vespro noctes nummus holzbau
  fruehlicht morgenlicht mondlicht leitstern thermae progenies autunno rempart ombrage mensura racine hobel leder klafter
  plan modul motiv maserung mauerwerk raumzeit ausflug wohnhaus
  blancheur vendange viridis reditus kanon taktgeber aether
  ansitz wohnsitz rustika stahlbeton spannbeton altenteil natalis futuro stellato pervenche parvis korso
  kelle silence contrada mansio lucidum
  kernoel erdkeller esse elle chronik filare modulo modulus numerus partenza penombra virens lucens autumnus schatten sonnenuhr
`);
/** Bedeutungen, die ein Wort sperren (Maengel, Gutachten, Pfand ...) (`Js`). */
const MANGEL_BEDEUTUNG =
  /(\bmangel|\bmängel|schaden|gutachten|\bprüfung\b|\bkontrolle\b|\bbefund|ergebnis einer|\bpfand\b|grundpfand|schuldverschreibung|versteigerung|hinterlassenschaft|auseinandergehen|kostenabrechnung|zinsschein|\bvertrag\b|vertrag über|mietvertrag|krankheit|feuchtgebiet|instandsetzung|zustand der|zins auf zinsen)/i;
/** Bedeutungen, die ein Wort schwach machen (Pflanzen, Tiere, Farbtoene ...) (`Qs`). */
const SCHWACH_BEDEUTUNG =
  /(legierung|metall\b|laubbaum|nadelbaum|\bbaum\b|baumart|strauch|pflanze|blume|blüte|\brose\b|kraut|frucht|beere|getreide|gemüse|pilz|\braps|\bmohn|vogel|\btier\b|insekt|fisch|rotton|braunton|blauton|grünton|farbton|himmelblau|schmuckstein|edelstein|wollstoff|\bstoff\b|gewebe|\btau\b|frost|gefroren|schilf|ernte|landwirtschaft|mahlwerk|betrieb des|dachdeckung|\bdach\b|des daches|formmasse|steinchen|granitblock|zeit nach dem beruf|eisen\b|grasland|gestein|glasur|anstrich|\bheu\b|spreu|weidefläche)/i;
/** Wortformen, die schwach sind (`_n`). */
const SCHWACH_FORM =
  /(dach|feld|erei|gesims|zimmer|decke|tuer|blau|gruen|gelb|stall|sack|rausch|reif|mehl|acker|stadl|schober|rand|weg|wand|land|reich|reihe|weide|platz|wiese|wald|platte|holz|.hain|wasser|lauf)$|^(eck|heu|feld|acker)|guth$/;

/** Bedeutung je Wort aus Wortdatenbank und Stichwort-Feldern (`Ys`). */
const MEANINGS: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>();
  for (const row of WORDS_DB) if (!map.has(flat(row[0]))) map.set(flat(row[0]), row[2]);
  for (const field of KEYWORD_FIELDS)
    for (const w of field.words)
      if (w.art !== "wurzel" && !map.has(flat(w.w))) map.set(flat(w.w), w.m);
  return map;
})();

export type WordWeakness = "sperre" | "schwach" | null;
const WEAKNESS_CACHE = new Map<string, WordWeakness>();

/** Sperre oder Schwaeche eines Namens (`Da`), mit Zwischenspeicher. */
export function wordWeakness(name: string): WordWeakness {
  const key = flat(name);
  let out = WEAKNESS_CACHE.get(key);
  if (out === undefined) {
    out = wordWeaknessUncached(name);
    if (WEAKNESS_CACHE.size > 20000) WEAKNESS_CACHE.clear();
    WEAKNESS_CACHE.set(key, out);
  }
  return out;
}

/**
 * `Xs`: Sperrwort, "-guth", verdoppeltes Grundwort ("Hofhof") und die -werck-Regel:
 * "werck" nur hinter einem kurzen Wort mit einer Silbe und ohne Fugen-s ("Klarwerck" ja,
 * "Flaechenwerck" nein).
 */
function wordWeaknessUncached(name: string): WordWeakness {
  const key = flat(name);
  if (SPERRWOERTER.has(key) || /guth$/.test(key) || /(gut|hof|haus|werk|raum)\1$/.test(key))
    return "sperre";
  const werck = key.match(/^(.+)werck$/);
  if (
    werck &&
    (werck[1]!.length > 5 ||
      (werck[1]!.match(/[aeiouäöü]+/g) ?? []).length > 1 ||
      /s$/.test(werck[1]!))
  )
    return "sperre";
  const words = fold(name)
    .split(/[\s&-]+/)
    .filter((w) => w.length >= 3);
  let out: WordWeakness = null;
  for (const w of words.length ? words : [key]) {
    if (SPERRWOERTER.has(w)) return "sperre";
    const meaning = MEANINGS.get(w);
    if (meaning && MANGEL_BEDEUTUNG.test(meaning)) return "sperre";
    if (
      SCHWACHE_WOERTER.has(w) ||
      SCHWACH_FORM.test(w) ||
      (meaning && SCHWACH_BEDEUTUNG.test(meaning))
    )
      out = "schwach";
  }
  if (!out && (SCHWACHE_WOERTER.has(key) || SCHWACH_FORM.test(key))) out = "schwach";
  return out;
}

/** Gattungswoerter fuer Immobilien (Haus, Villa, Loft ...) (`ei`). */
const GATTUNG: ReadonlySet<string> = wordSet(`
  loft fachwerk penthouse altbau neubau wohnung haus villa bungalow reihenhaus stadthaus landhaus wohnhaus residenz wohnsitz
  domizil anwesen landsitz herrenhaus areal grundstueck halle chalet appartement apartment maisonette dachgeschoss
  garconniere seehaus uferhaus kontorhaus handelshaus speicher palais palazzo palazzina dimora casale cascina bastide
  domaine immeuble kubus atrium patio stammhaus gutshof hofgut landgut
`);

/** Name ist ein Gattungswort (`Vr`). */
export function isGenericWord(name: string): boolean {
  return GATTUNG.has(flat(name));
}

/** Echte Woerter und Vornamen auf -a oder -o (`ri`). */
const ROMANCE_WORDS: ReadonlySet<string> = wordSet(`
  cola coma lama lava mama nana pasta pizza salsa sola solo tempo veto vino zero mono polo radio piano auto logo ego
  alto cura nora laura flora mora sora tora dora cora lora vera sera opera lira mira tiara para cara clara sara lara
  kara tara mara vara nara cana rana lana sana pana cosa rosa mesa presa prosa causa pausa gusto resto testo posto
  costa pista lista festa testa cesta fiesta siesta lino silvo bona trata curo color mona lena tina nina gina lina
  marco mario carlo paolo pablo bruno franco fabio dario remo nero rocco lotto lotta bella bello dolce nonna nonno
  tonto loco loca porno pene pena cara caro nulla nada mala malo moda modo menta monta volta molto tanto canto conto
  forte fonte ponte monte lago largo lento lenta vento venta renta rento fondo fonda sala salo palo pala polo pola
  sole solea luna lunar solar sonar radar dona dono doro dora oro aroma arena area aria opera ola hola alba albo
  novo nova vista porta terra casa domus villa aura lumen valor fundus silva verde verena serena lorena elena helena
  milena selena rosana valeria aurelia altea
`);
/** Anstoessige Teilwoerter in romanischen Sprachen (`ni`). */
const ROMANCE_BAD =
  /(pene|troi|pute|bite|coglion|pedo|kacke|cul|merd|cazz|zocc|tetta|tette|culo|fesso|stronz|cagn|vacca|porca|putt|trat[ae]$)/;

/**
 * Kunstwort auf -a oder -o, das als Marke traegt (`ai`): ab 5 Buchstaben, keine
 * verbrauchten Endungen, keine Wiederholungen, kein echtes Wort, hoechstens ein harter Laut.
 */
export function isStrongCoinage(name: string): boolean {
  const key = flat(name).replace(/[^a-z]/g, "");
  return !(
    key.length < 5 ||
    !/(a|o)$/.test(key) ||
    /(ina|ino|ura|ero|aro)$/.test(key) ||
    /^(firm|fabr|col|pal)/.test(key) ||
    /r[aeiou]r|l[aeiou]l|n[aeiou]n/.test(key) ||
    /([aeiou])[^aeiou]+\1[^aeiou]+\1/.test(key) ||
    ROMANCE_WORDS.has(key) ||
    ROMANCE_BAD.test(key) ||
    hardCount(key) > TECH_RULES.hartMax
  );
}

// ---------------------------------------------------------------------------
// Lautregeln

/** Selbstlaute aller gaengigen Akzente (`Wr`). */
export const VOWELS = /[aeiouyäöüàáâéèêíìîóòôúùû]/;
/** Doppellaute, die eine Silbe bilden (`Un`). */
const DIPHTHONGS = new Set(["ai", "au", "ei", "eu", "äu", "ie", "ou", "aa", "ee", "oo"]);

/** Woerter eines Namens mit mindestens einem Buchstaben (`Na`). */
export const nameWords = (name: string): string[] =>
  name.split(/[\s&./-]+/).filter((w) => /\p{L}/u.test(w));

/** Laengste Folge von Mitlauten (`Ve`). */
export function maxConsonantRun(text: string): number {
  let max = 0;
  let run = 0;
  for (const c of text.toLocaleLowerCase("de-AT"))
    if (!/\p{L}/u.test(c) || VOWELS.test(c)) run = 0;
    else max = Math.max(max, ++run);
  return max;
}

/** Laengste gesprochene Mitlautfolge: sch, ch, ck, ph, qu zaehlen einfach, Dehnungs-h nicht (`si`). */
export function spokenConsonantRun(word: string): number {
  return maxConsonantRun(
    word
      .toLocaleLowerCase("de-AT")
      .replace(/sch/g, "S")
      .replace(/ch/g, "C")
      .replace(/ck/g, "K")
      .replace(/ph/g, "F")
      .replace(/qu/g, "Q")
      .replace(/([aeiouäöü])h/g, "$1"),
  );
}

/** Laengste Folge von Selbstlauten (`Bn`). */
export function maxVowelRun(text: string): number {
  let max = 0;
  let run = 0;
  for (const c of text.toLocaleLowerCase("de-AT"))
    if (VOWELS.test(c)) max = Math.max(max, ++run);
    else run = 0;
  return max;
}

const SYLLABLE_CACHE = new Map<string, number>();

/** Silben eines Namens; Kuerzel aus bis zu drei Versalien zaehlen je Buchstabe (`Le`). */
export function syllables(name: string): number {
  return memo(SYLLABLE_CACHE, name, () => {
    let n = 0;
    for (const word of nameWords(name)) {
      if (/^\p{Lu}{1,3}$/u.test(word)) {
        n += word.length;
        continue;
      }
      let prev = "";
      for (const c of word.toLocaleLowerCase("de-AT"))
        if (VOWELS.test(c)) {
          if (!(prev && DIPHTHONGS.has(prev + c))) n++;
          prev = prev && DIPHTHONGS.has(prev + c) ? "" : c;
        } else prev = "";
    }
    return n;
  });
}

/**
 * Gut aussprechbar (`lr`): jedes Wort ist ein Kuerzel, ein bekanntes Wort (`known`) oder hat
 * einen Selbstlaut und hoechstens drei Mitlaute oder Selbstlaute in Folge.
 */
export function pronounceable(name: string, known?: ReadonlySet<string>): boolean {
  const words = nameWords(name);
  return words.length
    ? words.every(
        (w) =>
          /^\p{Lu}{1,3}$/u.test(w) ||
          known?.has(fold(w)) ||
          (VOWELS.test(w.toLocaleLowerCase("de-AT")) &&
            spokenConsonantRun(w) <= 3 &&
            maxVowelRun(w) <= 3),
      )
    : false;
}

const SOFTNESS_CACHE = new Map<string, number>();

/** Weichheit 0 bis 1: Anteil weicher Mitlaute und offener Vokale a, o (`Or`). */
export function softness(name: string): number {
  return memo(SOFTNESS_CACHE, name, () => {
    const key = fold(name)
      .replace(/[^a-z]/g, "")
      .replace(/sch/g, "s")
      .replace(/ch/g, "h")
      .replace(/ck/g, "k")
      .replace(/ph/g, "f")
      .replace(/qu/g, "k");
    let soft = 0;
    let hard = 0;
    for (const c of key)
      if ("lmnrswvjh".includes(c)) soft++;
      else if ("ktpgbdzxcf".includes(c)) hard++;
    const vowels = (key.match(/[aeiouy]/g) ?? []).length;
    const open = (key.match(/[ao]/g) ?? []).length;
    const ratio = soft + hard ? soft / (soft + hard) : 1;
    return Math.max(0, Math.min(1, ratio * 0.8 + (vowels ? open / vowels : 0) * 0.2));
  });
}
