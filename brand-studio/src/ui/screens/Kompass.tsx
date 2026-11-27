/**
 * Markenkompass in sechs Schritten mit Vorschauleiste.
 * Gesicherte Fassung: Kompass-Chunk (Ye).
 */
import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  allowedMoods,
  cardFace,
  cleanText,
  finishConcept,
  fontBlocked,
  generateConcepts,
  initials,
  monogramLetters,
  paletteBlocked,
  routedInput,
  withCardBackground,
} from "../../engine";
import { fontCovers } from "../../engine/charset";
import { FONTS, isSelectableVariant } from "../../engine/fonts";
import { COLOR_MOODS, moodsFor, paletteForMood } from "../../engine/palettes";
import { hash, rng } from "../../engine/rng";
import { briefPreviewParams } from "../../strategy/axes";
import {
  FARB_PAARE,
  FARB_WELTEN,
  KLISCHEES,
  KOMPASS,
  KOMPASS_INTRO,
  LOGO_PAARE,
  REFERENZ_WELTEN,
  STIMM_PAARE,
  antwortLesen,
  antwortSetzen,
  frageSichtbar,
  kompassFortschritt,
} from "../../strategy/catalog";
import { Button, TextButton } from "../components/Buttons";
import { ActionBar, ChipToggles, Field, Segmented, radioKeyNav } from "../components/Controls";
import { ClicheArt, ReferenceArt } from "../components/KompassArt";
import { LogoView } from "../components/LogoView";
import { PlaceField } from "../components/PlaceField";
import { previewInput, previewInputFor } from "../logic/kompass";
import { loadKompass, saveKompass } from "../logic/kompassDraft";
import { KOMPASS_STEPS } from "../logic/route";
import { plainDashes } from "../logic/text";
import { useStudio } from "../store";

const fontRef = (s: any, t: any) => ({ key: s, weight: t });

const PAIR_FONTS = {
  grotesk: [
    fontRef("hanken", 400),
    fontRef("instrumentsans", 400),
    fontRef("geist", 300),
    fontRef("albertsans", 400),
  ],
  antiqua: [
    fontRef("ebgaramond", 400),
    fontRef("newsreader", 400),
    fontRef("crimson", 400),
    fontRef("cormorant", 500),
  ],
  ruhig: [
    fontRef("lora", 400),
    fontRef("brygada", 400),
    fontRef("castoro", 400),
    fontRef("bonanova", 400),
  ],
  didone: [
    fontRef("bodoni", 500),
    fontRef("playfair", 400),
    fontRef("notoserifdisplay", 400),
    fontRef("gilda", 400),
  ],
  schmal: [
    fontRef("archivonarrow", 400),
    fontRef("barlowcondensed", 500),
    fontRef("oswald", 500),
    fontRef("antonio", 400),
  ],
  breit: [
    fontRef("montserrat", 400),
    fontRef("sora", 400),
    fontRef("mona", 400),
    fontRef("epilogue", 300),
  ],
  neutral: [
    fontRef("ebgaramond", 400),
    fontRef("jost", 300),
    fontRef("cormorant", 500),
    fontRef("hanken", 400),
  ],
};

const SAMPLE_FONTS = [
  fontRef("albertsans", 400),
  fontRef("jost", 300),
  fontRef("hanken", 400),
  fontRef("manrope", 400),
];

const PAIR_STYLES: Record<string, any> = {
  serif: "modern",
  contrast: "elegant",
  caps: "elegant",
  width: "modern",
  symbol: "elegant",
  dark: "elegant",
};

const fontAllowed = (s: any, t: any, c: any) =>
  FONTS.some((o) => o.key === s.key) &&
  isSelectableVariant(s) &&
  fontCovers(s.key, ...c) &&
  !fontBlocked(s, t);

function pairConcept(s: any, t: any, c: any, o: any, n: any) {
  const p = Math.min(s.length, t.length);
  for (let i = 0; i < p; i++) {
    const m = (c + i) % p;
    if (fontAllowed(s[m], o, n) && fontAllowed(t[m], o, n)) return [s[m], t[m]];
  }
  const l = s.find((i: any) => fontAllowed(i, o, n)) ?? s.find((i: any) => fontCovers(i.key, ...n)) ?? s[0];
  const d = t.find((i: any) => fontAllowed(i, o, n)) ?? t.find((i: any) => fontCovers(i.key, ...n)) ?? t[0];
  return [l, d];
}

function pairConcepts(s: any, t: any, c: any, o: any) {
  const n = routedInput({ ...s, name: cleanText(s.name) || "Marke" });
  const p = rng((o ^ hash(`kompass|${t}`)) >>> 0);
  const l = n.styles[0] ?? PAIR_STYLES[t];
  const d = [n.name, cleanText(n.suffix)];
  const i = p.int(0, 3);
  const m = allowedMoods(moodsFor(n, l), n);
  let b = paletteForMood(p.pick(m), l, p);
  for (let u = 0; u < 8 && paletteBlocked(b, n); u++) b = paletteForMood(p.pick(m), l, p);
  const f =
    SAMPLE_FONTS.find((u) => fontAllowed(u, n, [cleanText(n.suffix), n.name])) ?? SAMPLE_FONTS[0]!;
  let g: any;
  let k: any = "title";
  let A = 0;
  if (t === "serif") {
    const [u, C] = pairConcept(PAIR_FONTS.grotesk, PAIR_FONTS.antiqua, i, n, d);
    g = c === "a" ? u : C;
  } else if (t === "contrast") {
    const [u, C] = pairConcept(PAIR_FONTS.ruhig, PAIR_FONTS.didone, i, n, d);
    g = c === "a" ? u : C;
  } else if (t === "width") {
    const [u, C] = pairConcept(PAIR_FONTS.schmal, PAIR_FONTS.breit, i, n, d);
    g = c === "a" ? u : C;
    k = "upper";
    A = 0.06;
  } else {
    const [u] = pairConcept(PAIR_FONTS.neutral, PAIR_FONTS.neutral, i, n, d);
    g = u;
    if (t === "caps" && c === "b") {
      k = "upper";
      A = 0.16;
    }
  }
  const E = t === "symbol" && c === "b";
  const x = monogramLetters(n) ?? initials(n.name, 1);
  const M = finishConcept(
    {
      seed: o,
      style: l,
      layout: E ? "stacked" : "wordmark",
      symbol: E ? { kind: "monogram", letters: x, container: "none", font: g } : null,
      name: { font: g, case: k, tracking: A },
      suffix: { font: f, case: "upper", tracking: 0.2 },
      tagline: { font: f, case: "asis", tracking: 0 },
      body: f,
      palette: b,
      colors: { symbol: "primary", name: "ink", suffix: "ink" },
      divider: "none",
      cardBackground: "paper",
      ...(E ? { symbolSize: "small" } : {}),
    } as any,
    n,
  );
  return t === "dark" && c === "b" ? withCardBackground(M, "ink") : M;
}

function ChoiceCards({ choices, value, onChange, labelledBy, className = "" }: any) {
  const p = useRef<any>(null);
  const l = choices.map((m: any) => m.id);
  const d = value && l.includes(value) ? value : l[0];
  const i = (m: any) => {
    return p.current?.querySelectorAll('[role="radio"]')[m]?.focus();
  };
  return (
    <div ref={p} className={`kp-cards ${className}`} role="radiogroup" aria-labelledby={labelledBy}>
      {choices.map((m: any) => (
        <button
          key={m.id}
          type="button"
          role="radio"
          className="kp-card"
          aria-checked={m.id === value}
          aria-label={m.label}
          tabIndex={m.id === d ? 0 : -1}
          onClick={() => onChange(m.id)}
          onKeyDown={(b) => radioKeyNav(b, l, d, onChange, 1, i)}
        >
          {m.content}
        </button>
      ))}
    </div>
  );
}

function MultiChoiceCards({ choices, values, max, onToggle, labelledBy, className = "" }: any) {
  const l = !!max && values.length >= max;
  return (
    <div className={`kp-cards ${className}`} role="group" aria-labelledby={labelledBy}>
      {choices.map((d: any) => {
        const i = values.includes(d.id);
        return (
          <button
            key={d.id}
            type="button"
            className="kp-card"
            aria-pressed={i}
            aria-label={d.label}
            aria-disabled={!i && l ? true : undefined}
            onClick={() => (!i && l ? undefined : onToggle(d.id))}
          >
            {d.content}
          </button>
        );
      })}
    </div>
  );
}

const Option = (s: any) => (
  <>
    <span className="kp-opt">{s.label}</span>
    {s.hint && <span className="small kp-hint">{s.hint}</span>}
  </>
);

const PairLogo = memo(function ({ concept, input, className = "" }: any) {
  const n = cardFace(concept);
  return (
    <div className={`kp-logo ${className}`} style={{ background: n.background }}>
      <LogoView
        concept={concept}
        input={input}
        variant={n.variant}
        ground={n.ground}
        fallbackText
      />
    </div>
  );
});

function Question({ f: s, brief, setAnswer }: any) {
  var P;
  const o = useId();
  const n = useId();
  const p = antwortLesen(brief, s.id);
  const l = typeof p == "string" ? p : undefined;
  const d = Array.isArray(p) ? p : [];
  const i = (a: any) => setAnswer(s.id, a);
  const m = (a: any) => i(d.includes(a) ? d.filter((j) => j !== a) : [...d, a]);
  const [b, f] = (s.pfad ?? s.feld).split(".");
  const g = s.optionen ?? [];
  let k: any = null;
  if (s.typ === "paar" && b === "logoPairs") {
    const a = LOGO_PAARE.find((se) => se.id === f);
    const j = previewInput(brief);
    const w = hash(`kompass|${j.name}`);
    const F = a ? { a: pairConcepts(j, a.id, "a", w), b: pairConcepts(j, a.id, "b", w) } : null;
    k = a && F && (
      <ChoiceCards
        labelledBy={o}
        className="kp-pair"
        value={l}
        onChange={i}
        choices={[
          {
            id: "a",
            label: a.a,
            content: (
              <>
                <PairLogo concept={F.a} input={j} />
                <span className="kp-opt">{a.a}</span>
              </>
            ),
          },
          {
            id: "b",
            label: a.b,
            content: (
              <>
                <PairLogo concept={F.b} input={j} />
                <span className="kp-opt">{a.b}</span>
              </>
            ),
          },
          { id: "egal", label: "Egal", content: <span className="kp-opt">Egal</span> },
        ]}
      />
    );
  } else if (s.typ === "paar" && b === "colorPairs") {
    const a = FARB_PAARE.find((w) => w.id === f);
    const j = (w: any) => (
      <span className="kp-palette" aria-hidden="true">
        {w.map((F: any) => (
          <i key={F} style={{ background: F }} />
        ))}
      </span>
    );
    k = a && (
      <ChoiceCards
        labelledBy={o}
        className="kp-pair"
        value={l}
        onChange={i}
        choices={[
          {
            id: "a",
            label: a.a,
            content: (
              <>
                {j(a.farben.a)}
                <span className="kp-opt">{a.a}</span>
              </>
            ),
          },
          {
            id: "b",
            label: a.b,
            content: (
              <>
                {j(a.farben.b)}
                <span className="kp-opt">{a.b}</span>
              </>
            ),
          },
          { id: "egal", label: "Egal", content: <span className="kp-opt">Egal</span> },
        ]}
      />
    );
  } else if (s.typ === "paar") {
    const a = STIMM_PAARE.find((F) => F.pol === f);
    const j = a?.a ?? g[0]?.label ?? "";
    const w = a?.b ?? g[1]?.label ?? "";
    k = (
      <ChoiceCards
        labelledBy={o}
        className="kp-pair kp-voice"
        value={l}
        onChange={i}
        choices={[
          { id: "a", label: j, content: <span className="kp-quote">„{j}“</span> },
          { id: "b", label: w, content: <span className="kp-quote">„{w}“</span> },
          {
            id: "egal",
            label: g[2]?.label ?? "Beides",
            content: <span className="kp-opt">{g[2]?.label ?? "Beides"}</span>,
          },
        ]}
      />
    );
  } else if (s.typ === "wahl" && s.feld === "reference")
    k = (
      <ChoiceCards
        labelledBy={o}
        className="kp-worlds"
        value={l}
        onChange={i}
        choices={REFERENZ_WELTEN.map((a) => ({
          id: a.id,
          label: `${a.label}: ${a.hint ?? ""}`,
          content: (
            <>
              <ReferenceArt id={a.id} />
              <span className="kp-opt">{a.label}</span>
              <span className="small kp-hint">{a.hint}</span>
            </>
          ),
        }))}
      />
    );
  else if (s.typ === "wahl")
    k = (
      <ChoiceCards
        labelledBy={o}
        className={g.length > 4 ? "kp-list" : "kp-list kp-few"}
        value={l}
        onChange={i}
        choices={g.map((a: any) => ({ id: a.id, label: a.label, content: Option(a) }))}
      />
    );
  else if (s.typ === "mehrfach" && s.feld === "avoidCliches")
    k = (
      <MultiChoiceCards
        labelledBy={o}
        className="kp-cliches"
        values={d}
        max={s.max}
        onToggle={m}
        choices={KLISCHEES.map((a) => ({
          id: a.id,
          label: a.label,
          content: (
            <>
              <ClicheArt id={a.id} />
              <span className="kp-opt">{a.label}</span>
            </>
          ),
        }))}
      />
    );
  else if (s.typ === "mehrfach" && s.feld === "avoidColors")
    k = (
      <ChipToggles
        label={s.titel}
        values={d}
        onToggle={(a: any) => (!d.includes(a) && s.max && d.length >= s.max ? undefined : m(a))}
        options={FARB_WELTEN.map((a) => {
          return {
            value: a.id,
            ariaLabel: a.label,
            label: (
              <>
                <span className="swatches" aria-hidden="true">
                  <i style={{ background: (COLOR_MOODS as Record<string, any>)[a.id]?.swatch }} />
                </span>
                {a.label}
              </>
            ),
          };
        })}
      />
    );
  else if (s.typ === "mehrfach") {
    const a = s.feld === "fremdbild" || s.feld === "wirkung";
    k = (
      <MultiChoiceCards
        labelledBy={o}
        className={a ? "kp-list kp-quotes" : "kp-list"}
        values={d}
        max={s.max}
        onToggle={m}
        choices={g.map((j: any) => ({ id: j.id, label: j.label, content: Option(j) }))}
      />
    );
  } else
    s.typ === "chips"
      ? (k = (
          <ChipToggles
            label={s.titel}
            values={d}
            onToggle={(a: any) => (!d.includes(a) && s.max && d.length >= s.max ? undefined : m(a))}
            options={g.map((a: any) => ({ value: a.id, label: a.label }))}
          />
        ))
      : s.typ === "skala"
        ? (k = (
            <Segmented
              labelledBy={o}
              options={g.map((a: any) => ({ value: a.id, label: a.label }))}
              value={l ?? ""}
              onChange={i}
              scroll
            />
          ))
        : s.typ === "text" && s.feld === "place"
          ? (k = (
              <PlaceField
                label="BEZIRK, ORT ODER REGION"
                placeholder={s.platzhalter ? `z. B. ${s.platzhalter}` : undefined}
                value={l ?? ""}
                onChange={(a: any) => i(a)}
              />
            ))
          : s.typ === "text" &&
            (k = (
              <Field
                label={s.optional ? "DEINE ANTWORT (OPTIONAL)" : "DEINE ANTWORT"}
                placeholder={s.platzhalter ? `z. B. ${s.platzhalter}` : undefined}
                maxLength={s.feld === "person" ? 80 : 300}
                value={l ?? ""}
                onChange={(a: any) => i(plainDashes(a.target.value))}
              />
            ));
  const A = s.max && (s.typ === "mehrfach" || s.typ === "chips") ? `Höchstens ${s.max}.` : "";
  const E = [s.hilfe, (P = s.hilfe) != null && P.includes("öchstens") ? "" : A]
    .filter(Boolean)
    .join(" ");
  return (
    <section className="kp-q" aria-labelledby={o}>
      <h2 className="kp-q-title" id={o}>
        {s.titel}
        {s.optional && <span className="small kp-optional">{" (optional)"}</span>}
      </h2>
      {E && (
        <p className="small kp-q-help" id={n}>
          {E}
        </p>
      )}
      {k}
    </section>
  );
}

function PreviewStrip({ brief, seed }: any) {
  const c = useDeferredValue(brief);
  const { input, concepts } = useMemo(() => {
    try {
      const p = briefPreviewParams(c);
      const l = previewInputFor(c, p);
      return { input: l, concepts: generateConcepts(l, { count: 4, page: 0, seed }) };
    } catch (p) {
      console.warn("Vorschau ohne Logos", p);
      return { input: previewInput(c), concepts: [] };
    }
  }, [c, seed]);
  return (
    <aside className="kp-preview" aria-label="Vorschau deiner Richtung">
      <span className="label kp-preview-label">SO KÖNNTE ES AUSSEHEN</span>
      <div className="kp-preview-row" aria-hidden="true">
        {Array.from({ length: 4 }, (p, l) =>
          concepts[l] ? (
            <PairLogo
              key={concepts[l].id}
              concept={concepts[l]}
              input={input}
              className="kp-mini"
            />
          ) : (
            <div key={`s${l}`} className="kp-logo kp-mini riffel" />
          ),
        )}
      </div>
    </aside>
  );
}

const STEP_COUNT = 6;

function Kompass({ step }: any) {
  const { navigate, announce } = useStudio();
  const [o, n] = useState(loadKompass);
  const p = useCallback((x: any) => {
    n((M: any) => {
      const u = x(M);
      saveKompass(u);
      return u;
    });
  }, []);
  const l = o.brief;
  const d = KOMPASS[Math.max(0, Math.min(KOMPASS.length, step) - 1)];
  const i = d!.fragen.filter((x) => frageSichtbar(x, l));
  useEffect(() => {
    if (step > o.schritt) {
      p((x: any) => ({ ...x, schritt: step }));
    }
  }, [step]);
  const m = useCallback((x: any, M: any) => p((u: any) => ({ ...u, brief: antwortSetzen(u.brief, x, M) })), [p]);
  const b = (x: any) =>
    p((M: any) => ({ ...M, brief: { ...M.brief, hasName: true, name: plainDashes(x).slice(0, 80) } }));
  const f = () => {
    announce("Deine drei Richtungen werden zusammengestellt.");
    navigate({ name: "routen" });
  };
  const g = () => (step >= KOMPASS_STEPS ? f() : navigate({ name: "kompass", step: step + 1 }));
  const k = () =>
    step > 1
      ? navigate({ name: "kompass", step: step - 1 })
      : navigate(l.hasName ? { name: "new" } : { name: "names", gemerkt: false, kinds: [] });
  const A = Math.round(kompassFortschritt(l) * 100);
  const E = step >= KOMPASS_STEPS;
  return (
    <div className="container screen kp-screen">
      <div className="kp-top">
        <a
          className="back-link"
          href="#/"
          onClick={(x) => {
            x.preventDefault();
            k();
          }}
        >
          ← Zurück
        </a>
        <TextButton onClick={f}>Direkt zu den Richtungen</TextButton>
      </div>
      <p className="label kp-step">
        {"SCHRITT "}
        {step}
        {" VON "}
        {KOMPASS_STEPS}
        {" · "}
        {d!.dauer.toLocaleUpperCase("de-AT")}
        {d!.optional ? " · OPTIONAL" : ""}
      </p>
      <div
        className="kp-progress"
        role="progressbar"
        aria-label="Fortschritt im Markenkompass"
        aria-valuemin={0}
        aria-valuemax={KOMPASS_STEPS}
        aria-valuenow={step}
        aria-valuetext={`Schritt ${step} von ${KOMPASS_STEPS}, ${A} Prozent beantwortet`}
      >
        <span style={{ width: `${(step / KOMPASS_STEPS) * 100}%` }} />
      </div>
      <h1 className="h1 kp-title" data-title="Markenkompass">
        {d!.titel}
      </h1>
      {step === 1 && (
        <div className="kp-intro">
          <p className="lead kp-lead">{KOMPASS_INTRO.text}</p>
          <p className="small kp-hinweis">
            {KOMPASS_INTRO.dauer.replace(/^./, (x) => x.toLocaleUpperCase("de-AT"))}
            {". "}
            {KOMPASS_INTRO.hinweis}
          </p>
        </div>
      )}
      <div className={`kp-body${step >= STEP_COUNT ? " has-preview" : ""}`}>
        <div className="kp-questions">
          {step === 1 && l.hasName && (
            <section className="kp-q">
              <Field
                label="DEIN NAME ODER FIRMENNAME"
                autoComplete="organization"
                placeholder="z. B. Anna Berger"
                maxLength={80}
                value={l.name ?? ""}
                onChange={(x: any) => b(x.target.value)}
                help="Die Logo-Beispiele zeigen diesen Namen."
              />
            </section>
          )}
          {i.map((x) => (
            <Question key={x.id} f={x} brief={l} setAnswer={m} />
          ))}
        </div>
        {step >= STEP_COUNT && <PreviewStrip brief={l} seed={o.seed} />}
      </div>
      <div className="kp-nav desk-flex">
        <TextButton onClick={k}>Zurück</TextButton>
        <Button onClick={g}>{E ? "Zu deinen Richtungen" : "Weiter"}</Button>
      </div>
      <ActionBar>
        <Button onClick={g}>{E ? "Zu deinen Richtungen" : "Weiter"}</Button>
      </ActionBar>
    </div>
  );
}

export default Kompass;
