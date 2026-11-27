/**
 * "Ich habe schon einen Namen": Name, Zusatz, Art und Region mit Live-Vorschau.
 * Gesicherte Fassung: index-Chunk (Ah, TC).
 */
import { type CSSProperties, useEffect, useMemo, useRef, useState } from "react";
import { missingChars } from "../../engine/charset";
import { looksLikeCompany, looksLikePerson } from "../../engine/personName";
import { Button, TextButton } from "../components/Buttons";
import { ActionBar, ChipGroup, Field } from "../components/Controls";
import { KompassEntry } from "../components/KompassEntry";
import { PlaceField } from "../components/PlaceField";
import { nameProblem, nameProblemText, suffixProblem } from "../logic/glyphs";
import { rememberStart } from "../logic/kompassDraft";
import { loadFinderState, saveFinderState } from "../logic/nameDraft";
import { applyNameForm, createProject, splitLegalForm, suffixChoiceOf } from "../logic/project";
import { plainDashes } from "../logic/text";
import { useStudio } from "../store";

const FONT_BASE = "./";

const PREVIEW_FONTS = [
  {
    family: "BS Playfair",
    file: "playfair-display-latin-400-normal.woff",
    weight: 400,
    color: "var(--lp-elegant)",
    upper: false,
    track: "-0.01em",
  },
  {
    family: "BS Manrope",
    file: "manrope-latin-700-normal.woff",
    weight: 700,
    color: "var(--lp-modern)",
    upper: false,
    track: "-0.02em",
  },
  {
    family: "BS Cormorant",
    file: "cormorant-garamond-latin-500-normal.woff",
    weight: 500,
    color: "var(--lp-luxus)",
    upper: true,
    track: "0.14em",
  },
  {
    family: "BS Fraunces",
    file: "fraunces-latin-600-normal.woff",
    weight: 600,
    color: "var(--lp-warm)",
    upper: false,
    track: "-0.01em",
  },
];

let previewFontsLoaded = false;

function loadPreviewFonts() {
  if (!(previewFontsLoaded || typeof FontFace > "u")) {
    previewFontsLoaded = true;
    for (const e of PREVIEW_FONTS)
      new FontFace(e.family, `url(${FONT_BASE}fonts/brand/${e.file})`, { weight: String(e.weight) })
        .load()
        .then((n) => document.fonts.add(n))
        .catch(() => {});
  }
}

const NAME_EXAMPLES = [
  { value: "Immobilien", label: "Immobilien" },
  { value: "Real Estate", label: "Real Estate", lang: "en" },
  { value: "none", label: "Ohne Zusatz" },
];

const SUFFIX_EXAMPLES = ["Immobilienberatung", "Realitäten", "Immobilienkanzlei", "Wohnen & Leben"];

const prefersReducedMotion = () =>
  typeof matchMedia < "u" && matchMedia("(prefers-reduced-motion: reduce)").matches;

const isNarrow = () => typeof matchMedia < "u" && matchMedia("(min-width: 760px)").matches;

function LivePreview({ name, suffix }: any) {
  const [n, r] = useState(0);
  const [s, i] = useState(false);
  const [a, o] = useState(prefersReducedMotion());
  const l = useRef(0);
  useEffect(() => {
    loadPreviewFonts();
  }, []);
  useEffect(() => {
    if (a) return;
    const f = window.setInterval(() => {
      if (l.current >= 5) {
        o(true);
        return;
      }
      i(true);
      window.setTimeout(() => {
        l.current += 1;
        r((d) => (d + 1) % PREVIEW_FONTS.length);
        i(false);
      }, 400);
    }, 2400);
    return () => window.clearInterval(f);
  }, [a]);
  const u = PREVIEW_FONTS[n];
  const c = !name.trim();
  return (
    <div className="live-preview" aria-hidden="true" onClick={() => o(true)}>
      <div
        className={`lp-inner${s ? " lp-fade-out" : ""}${c ? " lp-empty" : ""}`}
        style={{ "--lp-color": u!.color } as CSSProperties}
      >
        <div
          className="lp-name"
          style={{
            fontFamily: `"${u!.family}", Georgia, serif`,
            fontWeight: u!.weight,
            letterSpacing: u!.track,
            textTransform: u!.upper ? "uppercase" : "none",
          }}
        >
          {c ? "Dein Name" : name}
        </div>
        {suffix && (
          <>
            <div className="lp-rule" style={{ color: u!.color }} />
            <div className="lp-suffix" style={{ fontFamily: "var(--font-mono)" }}>
              {suffix}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function NameScreen({ projectId }: any) {
  const { state, put, update, navigate, announce } = useStudio();
  const a = projectId ? state.projects[projectId] : undefined;
  const o = useMemo(() => {
    if (!a) return { rawName: "", choice: "Immobilien", custom: "", keep: false, place: "" };
    const R = suffixChoiceOf(a.input.suffix);
    const A = R.choice === "Immobilienberatung" ? "custom" : R.choice;
    const H = R.choice === "Immobilienberatung" ? "Immobilienberatung" : R.custom;
    return {
      rawName: a.rawName,
      choice: A,
      custom: H,
      keep: a.legalFormInLogo,
      place: a.input.place ?? "",
    };
  }, []);
  const [l, u] = useState(o.rawName);
  const [c, f] = useState(o.choice);
  const [d, h] = useState(o.custom);
  const [m, x] = useState(o.keep);
  const [k, p] = useState(o.place);
  const [g, v] = useState(!!o.place);
  const [S, b] = useState<any>(null);
  const [L, T] = useState<any>(null);
  const E = useRef<any>(null);
  const I = useRef<any>(null);
  useEffect(() => {
    if (!isNarrow()) return;
    const R = () => {
      const De = I.current;
      if (De && (document.activeElement === document.body || document.activeElement === null)) {
        De.focus();
      }
    };
    I.current?.focus();
    const A = requestAnimationFrame(R);
    const H = window.setTimeout(R, 300);
    return () => {
      cancelAnimationFrame(A);
      window.clearTimeout(H);
    };
  }, []);
  const [P, q] = useState(!!a);
  const Q =
    l.match(
      /\b(immobilien|realitäten|realitaeten|real estate|immobilienberatung|immobilientreuhand|properties|estates?)\b/i,
    )?.[0] ?? null;
  const te = !!Q;
  useEffect(() => {
    if (!P) {
      f(te ? "none" : "Immobilien");
    }
  }, [te, P]);
  const ee = splitLegalForm(l);
  const ae = c === "none" ? "" : c === "custom" ? d.trim() : c;
  const oe = ee && !m ? ee.stripped : l.trim();
  const le = (R: any) => {
    var Z;
    var fe;
    R?.preventDefault();
    const A = l.trim() ? l : plainDashes(I.current?.value ?? "");
    if (A !== l) {
      u(A);
    }
    const H = nameProblem(A);
    if ((b(H), H)) {
      if (!((Z = I.current) == null)) {
        Z.focus();
      }
      announce(nameProblemText(H, A), true);
      return;
    }
    if ((c === "custom" ? missingChars(d) : []).length) {
      const ke = suffixProblem(d) ?? "";
      T(ke);
      if (!((fe = E.current) == null)) {
        fe.focus();
      }
      announce(ke, true);
      return;
    }
    const De = looksLikeCompany(A)
      ? "company"
      : a && a.rawName === A.trim()
        ? a.input.nameKind
        : undefined;
    const _t = {
      rawName: A,
      suffixChoice: c,
      customSuffix: d,
      keepLegalForm: m,
      place: k,
      nameKind: De,
    };
    if (a) (update(a.id, (ke: any) => applyNameForm(ke, _t)), navigate({ name: "stil", id: a.id }));
    else {
      const ke = createProject(_t);
      put(ke);
      navigate({ name: "name", id: ke.id }, { replace: true });
      navigate({ name: "stil", id: ke.id });
    }
  };
  const O = a ? "Speichern und weiter" : "Logos entwerfen";
  return (
    <div className="container screen">
      <div className="name-grid">
        <div>
          <h1 className="display" data-title="Name">
            Dein Logo und alles, was dazugehört.
          </h1>
          <p className="lead s1-lead">Gib deinen Namen ein. Wir entwerfen sofort Logos für dich.</p>
          <form id="name-form" className="name-form" onSubmit={le} noValidate>
            <Field
              ref={I}
              label="DEIN NAME ODER FIRMENNAME"
              placeholder="z. B. Anna Berger"
              autoComplete="name"
              autoCapitalize="words"
              enterKeyHint="go"
              spellCheck={false}
              large
              value={l}
              onChange={(R: any) => {
                u(plainDashes(R.target.value));
                if (S) {
                  b(null);
                }
              }}
              onFocus={(R: any) => {
                if (!isNarrow()) {
                  R.currentTarget.scrollIntoView({ block: "center", behavior: "smooth" });
                }
              }}
              error={S ? nameProblemText(S, l) : null}
              help="Meist Vor- und Nachname. Du kannst ihn später ändern."
            />
            {!a && (
              <a
                className="text-link s1-finder-link"
                href="#/neu/namen"
                onClick={(R) => {
                  R.preventDefault();
                  const A = loadFinderState();
                  const H = l.trim();
                  if (H) {
                    saveFinderState(
                      looksLikePerson(H) || !Q ? { ...A, person: H } : { ...A, company: H },
                    );
                  }
                  navigate({ name: "names", gemerkt: false, kinds: [] });
                }}
              >
                Noch keinen Namen? Wir helfen dir beim Finden →
              </a>
            )}
            {!a && (
              <KompassEntry
                onStart={() => {
                  const R = (l.trim() ? l : (I.current?.value ?? "")).trim();
                  rememberStart({ name: R, place: k }, true);
                  navigate({ name: "kompass", step: 1 });
                }}
              />
            )}
            {ee && (
              <div className="legal-hint" role="group" aria-label="Rechtsform im Logo">
                <p>
                  Tipp: „{ee.form}“ lassen wir im Logo weg, so wirkt es ruhiger. In Briefpapier und
                  Signatur steht es trotzdem.
                </p>
                <div className="row">
                  <button type="button" className="chip" aria-pressed={!m} onClick={() => x(false)}>
                    Weglassen
                  </button>
                  <button type="button" className="chip" aria-pressed={m} onClick={() => x(true)}>
                    Im Logo behalten
                  </button>
                </div>
              </div>
            )}
            <fieldset className="field" style={{ marginTop: 24 }}>
              <legend className="label field-label">ZUSATZ IM LOGO</legend>
              <div className="row suffix-row">
                <ChipGroup
                  options={NAME_EXAMPLES}
                  value={c === "custom" || c === "Immobilienberatung" ? null : c}
                  onChange={(R: any) => {
                    q(true);
                    f(R);
                  }}
                  label="Zusatz im Logo"
                />
                {c !== "custom" && (
                  <TextButton
                    onClick={() => {
                      q(true);
                      f("custom");
                      setTimeout(() => {
                        return E.current?.focus();
                      }, 30);
                    }}
                  >
                    Anderer Zusatz
                  </TextButton>
                )}
              </div>
            </fieldset>
            {Q && c === "none" && !P && (
              <p className="small suffix-hint" role="status">
                „{Q}“ steht schon in deinem Namen, deshalb ohne Zusatz.
              </p>
            )}
            {c === "custom" && (
              <Field
                label="ANDERER ZUSATZ"
                placeholder="z. B. Immobilienberatung"
                list="suffix-suggestions"
                maxLength={30}
                value={d}
                onChange={(R: any) => {
                  h(plainDashes(R.target.value));
                  T(null);
                }}
                error={L}
                ref={E}
              />
            )}
            <datalist id="suffix-suggestions">
              {SUFFIX_EXAMPLES.map((R) => (
                <option key={R} value={R} />
              ))}
            </datalist>
            <div className="submit-row desk-flex">
              <Button type="submit" reveal={!a}>
                {O}
              </Button>
            </div>
            <details
              className="disclosure name-more"
              open={g}
              onToggle={(R) => v(R.currentTarget.open)}
            >
              <summary>Mehr Angaben (optional)</summary>
              {g && (
                <div className="disclosure-body">
                  <PlaceField
                    label="DEIN BEZIRK ODER ORT"
                    placeholder="z. B. Döbling oder Wien 18"
                    value={k}
                    onChange={p}
                    help="Dann zeigen wir dir auch Logos mit deinem Bezirk."
                  />
                </div>
              )}
            </details>
            <p className="small s1-note">Kein Konto nötig. Alles bleibt in deinem Browser.</p>
          </form>
        </div>
        <LivePreview name={oe} suffix={ae} />
      </div>
      <ActionBar>
        <Button type="submit" form="name-form">
          {O}
        </Button>
      </ActionBar>
    </div>
  );
}
