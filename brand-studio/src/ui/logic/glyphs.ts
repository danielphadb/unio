/**
 * Prüfung von Name und Zusatz auf Zeichen, die die Logo-Schriften nicht darstellen können.
 * Gesicherte Fassung: index-Chunk (Tk, ou, Mk, Ek).
 */
import { missingChars } from "../../engine/charset";

export const NAME_MAX = 40;

export const NAME_PROBLEMS: Record<string, any> = {
  empty: "Bitte gib einen Namen ein. Er kommt in dein Logo.",
  long: "Das sind mehr als 40 Zeichen. Kürzere Namen wirken im Logo stärker.",
  chars: "Bitte verwende Buchstaben. Zahlen und & sind auch erlaubt.",
  glyphs:
    "Diese Zeichen können unsere Logo-Schriften nicht darstellen. Bitte schreib den Namen mit lateinischen Buchstaben.",
};

export function describeChars(chars: any) {
  const t: any[] = [];
  let n = 0;
  let r = 0;
  for (const o of chars)
    new RegExp("\\p{M}", "u").test(o)
      ? n++
      : /[\p{Cc}\p{Cf}\p{Z}]/u.test(o) || !/[\p{L}\p{N}\p{P}\p{S}]/u.test(o)
        ? r++
        : t.push(`„${o}“`);
  const s = t.slice(0, 4);
  if (n) {
    s.push(
      n === 1
        ? "ein aufgesetztes Zeichen über oder unter einem Buchstaben"
        : "aufgesetzte Zeichen über oder unter Buchstaben",
    );
  }
  if (r) {
    s.push(r === 1 ? "ein unsichtbares Steuerzeichen" : "unsichtbare Steuerzeichen");
  }
  const i = t.length + n + r > 1;
  return {
    list: s.length > 1 ? `${s.slice(0, -1).join(", ")} und ${s[s.length - 1]}` : (s[0] ?? ""),
    plural: i,
  };
}

export function nameProblemText(problem: any, text: any, what: any = "den Namen") {
  if (problem !== "glyphs") return NAME_PROBLEMS[problem];
  const { list, plural } = describeChars(missingChars(text.trim()));
  return `Unsere Logo-Schriften können ${plural ? "diese Zeichen" : "dieses Zeichen"} nicht darstellen: ${list}. Bitte schreib ${what} mit lateinischen Buchstaben. Umlaute und Akzente wie ä, é oder č sind möglich.`;
}

export function nameProblem(name: any) {
  const t = name.trim();
  return t
    ? t.length > NAME_MAX
      ? "long"
      : /[\p{L}\p{N}]/u.test(t)
        ? missingChars(t).length
          ? "glyphs"
          : null
        : "chars"
    : "empty";
}

export function suffixProblem(suffix: any) {
  return missingChars(suffix.trim()).length
    ? nameProblemText("glyphs", suffix, "den Zusatz")
    : null;
}
