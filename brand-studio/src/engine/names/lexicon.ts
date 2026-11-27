/**
 * Lexikon echter Woerter aus der Wortdatenbank (nameFinder-Chunk: `ms`, `qn`, `Ma`, `ps`,
 * `zn`, `Ra`, `Sn`, `ks`, `Sr`).
 *
 * Aufgenommen werden deutsche Woerter mit 5 bis 10 Buchstaben und 2 bis 3 Silben aus den
 * Feldern Material, Bau, Raum, Licht, Landschaft und Wohnen, die weder gesperrt noch
 * ausgeschlossen noch zu alltaeglich sind.
 */
import { WORDS_DB } from "./wordsDb";
import { FLAG, isKeywordOnly, type WordsDbRow } from "./wordsDbFormat";
import type { NameFocus, StyleKey } from "../../types";

/** Sprachnamen fuer Begruendungen (`ms`). */
export const LANG_NAMES: Readonly<Record<string, string>> = {
  de: "Deutsch",
  la: "Latein",
  it: "Italienisch",
  fr: "Französisch",
};

/** Wortfeld und die Stile, zu denen es passt (`qn`). */
export const FIELD_STYLES: Readonly<Record<string, StyleKey[]>> = {
  material: ["luxus", "elegant", "warm"],
  bau: ["elegant", "luxus", "modern"],
  raum: ["modern", "mutig", "elegant"],
  licht: ["elegant", "warm", "natur"],
  landschaft: ["natur", "warm"],
  wohnen: ["warm", "elegant", "luxus"],
};

/** Alltagswoerter, die als Name zu gewoehnlich sind (`Ma`). */
export const COMMON_WORDS: ReadonlySet<string> = new Set(
  `
  apsis empore fenster fundament gasse gefach geschoss halle pfeiler rahmen riegel sockel sparren traufe viertel zeile zimmer gartenhaus
  acker ebene himmel nebel regen wolke brise thymian rosmarin salbei marille holunder quelle insel
  dämmerung flamme frühling funke jahreszeit kamin lampe laterne leuchter nordlicht polarstern schimmer sommer sonne sonnenuhr spiegel
  sternbild wärme winter zwielicht morgenrot
  eisen estrich fliese furnier kiefer kirsche klinker leder leinen mörtel seide wolle kristall silber serpentin achat flechtwerk
  achse balance bogenmaß ebenmaß entwurf figur fläche fülle gleichmaß hülle klafter klarheit linie modul nische ordnung proportion raster
  rhythmus spanne symmetrie tiefe umriss volumen winkel
  colonne donjon escalier pilier portail venelle garrigue nature vague racine romarin lavande automne chaleur hiver lanterne matin miroir
  mistral printemps saison soleil argile cristal laque osier sapin tissu velours dessin esquisse module niveau mesure profondeur falaise
  androne bastione camera capanna colmo colonna finestra fregio gradino paese pilastro portone quartiere scala torre vicolo volta scuderia
  arancio edera fiore foglia natura oliva salvia sasso terra lavanda autunno bagliore calore camino candela chiaro cielo fiamma giorno
  inverno lanterna lucerna maestrale mattina mattino meriggio nuvola riflesso scintilla specchio stagione vento argilla cristallo feltro
  ferro gesso tessuto velluto vetro vimini mattone angolo cerchio compasso disegno forma linea livella misura modulo nicchia ordine pieno
  regolo ritmo sezione trama brughiera pianura
  aedes arcus castellum columna conclave culmen delubrum fastigium fenestra fornix ianua insula locus murus nymphaeum paries regio
  sacellum situs spatium tablinum templum theatrum tholus turris vicus arena cacumen cupressus fagus folium fraxinus horizon humus lilium
  myrtus natura planities pruina rupes salix saxum viola aestas annus autumnus boreas caelum calor claritas clarus flamma focus fulgor
  ignis imago lanterna lucerna meridies nitor nubes radius scintilla septentrio serenus sidus solstitium speculum splendor stella ventus
  zephyrus argentum caementum charta corium electrum ferrum lapis later linum materia murra papyrus plumbum sericum silex stannum vitrum
  amussis angulus centrum circinus circulus figura harmonia latus libra limes linea medium mensura modulus norma profundum ratio regula
  sphaera summa symmetria
  diele säule tenne gemach lichte fichte söller zeile riegel allee glashaus galerie halle passage quartier terrasse salon schwelle
  firmitas venustas clivus porfido marmo logis faubourg forum colle monte valle fiume fonte isola paese camera rione viale colmo
  sandstein
  aufriss laibung firstfeier richtfest tischrunde vergolder maßarbeit beton besitz bestand brücke durchgang etage gerüst gestalt grundbuch
  kante kassette kataster kerze kontur körper mittag mitte papier pergament pfette podest rückzug sattel skizze steppe stockwerk struktur
  stunde träger treppe werkbank zirkel abend balken bogen architekt garten hütte obstbaum obstgarten quitte speckstein kalkstein perlmutt
  basalt gefüge gaupe balkon obdach durchblick lichtblick werkstatt raumfolge quellgrund ankunft eigentum gewissen handschlag morgen
  realität residenz siegel signatur sorgfalt urkunde vertrauen waage zeichen anker hafen leuchtturm präzision monogramm kanzlei parzelle
  feder tafel tusche stempel bauherr baumeister meister elternhaus grundstein eckstein herberge
  `
    .trim()
    .split(/\s+/),
);

/** Gueltige Schwerpunkte in der Spalte Fokus (`ps`). */
const FOCI: ReadonlySet<string> = new Set([
  "wohnen",
  "luxus",
  "anleger",
  "gewerbe",
  "neubau",
  "haeuser",
  "land",
]);

/** Vergleichsschluessel: Akzente weg, klein, ß als ss (`zn`). */
const tabuKey = (word: string): string =>
  word.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("de-AT").replace(/ß/g, "ss");

/** Gesperrte Woerter (Flag TABU) (`Ra`). */
const TABU: ReadonlySet<string> = new Set(
  WORDS_DB.filter((row) => row[8] & FLAG.TABU).map((row) => tabuKey(row[0])),
);

export interface LexiconWord {
  /** Wort mit grossem Anfangsbuchstaben */
  w: string;
  lang: string;
  /** Bedeutung */
  m: string;
  /** Stile des Wortfelds */
  s: StyleKey[];
  /** Schwerpunkte */
  f: NameFocus[];
  /** Wortfeld */
  feld: string;
  /** evokativ (bildhaft) */
  evo?: true;
  /** nur mit passendem Stichwort */
  kwOnly?: true;
}

/** Zeile gehoert nicht ins Lexikon (Filter von `Sn`). */
export function lexSkip(row: WordsDbRow): boolean {
  const [word, lang, , field, syllables, length, , , flags] = row;
  return !(
    !(flags & (FLAG.AUS_B | FLAG.TABU | FLAG.AUS_A)) &&
    lang === "de" &&
    /^[a-zäöüß]+$/i.test(word) &&
    length >= 5 &&
    length <= 10 &&
    syllables >= 2 &&
    syllables <= 3 &&
    !!FIELD_STYLES[field] &&
    !TABU.has(tabuKey(word)) &&
    !COMMON_WORDS.has(word.toLocaleLowerCase("de-AT"))
  );
}

/** Lexikon (`Sn`). */
export const LEXICON: readonly LexiconWord[] = WORDS_DB.filter((row) => !lexSkip(row)).map(
  ([word, lang, meaning, field, , , , focus, flags]) => ({
    w: word.charAt(0).toLocaleUpperCase("de-AT") + word.slice(1),
    lang,
    m: meaning,
    s: FIELD_STYLES[field]!,
    f: focus.split(",").filter((f) => FOCI.has(f)) as NameFocus[],
    feld: field,
    ...(flags & FLAG.EVO ? { evo: true as const } : {}),
    ...(isKeywordOnly(flags, meaning) ? { kwOnly: true as const } : {}),
  }),
);

/** Alltagswort (`ks`). */
export function isCommonWord(word: string): boolean {
  return COMMON_WORDS.has(word.toLocaleLowerCase("de-AT"));
}

/** Gesperrtes Wort der Wortdatenbank (`Sr`). */
export function isTabu(word: string): boolean {
  return TABU.has(tabuKey(word));
}
