/**
 * Stilwahl (Schritt 2) mit einem Beispiel-Logo je Stil.
 * Gesicherte Fassung: StyleScreen-Chunk (W).
 */
import { useMemo } from "react";
import { cancelLowPriority, generateConcepts, perfMark } from "../../engine";
import { getFont } from "../../engine/fonts";
import { LogoView } from "../components/LogoView";
import { STYLE_OPTIONS, SURPRISE_OPTION } from "../logic/describe";
import { chooseStyle } from "../logic/project";
import { routeHash } from "../logic/route";
import { useStudio } from "../store";

const STYLE_TESTS: Record<string, any> = {
  elegant: (e: any) => getFont(e.name.font.key).cat === "serif" && e.name.case !== "upper",
  modern: (e: any) =>
    getFont(e.name.font.key).cat === "sans" && e.name.case !== "upper" && e.name.case !== "lower",
  luxus: (e: any) => e.name.case === "upper" && e.name.tracking >= 0.12,
  warm: (e: any) =>
    e.name.case !== "upper" &&
    (getFont(e.name.font.key).cat === "sans" || getFont(e.name.font.key).cat === "script"),
  mutig: (e: any) => e.name.font.weight >= 700 && getFont(e.name.font.key).cat !== "serif",
  natur: (e: any) =>
    e.name.case === "lower" || (getFont(e.name.font.key).cat === "sans" && e.name.case !== "upper"),
};

function StyleScreen({ projectId }: any) {
  const { state, update, navigate, announce } = useStudio();
  const r = state.projects[projectId];
  const l = r.input;
  const o = useMemo(() => {
    const a = { ...l, colorMoods: [], themes: [] };
    const n: any = {};
    for (const t of STYLE_OPTIONS) {
      const d = generateConcepts({ ...a, styles: [t.key] }, { count: 12, page: 0, seed: r.seed });
      n[t.key] = d.find(STYLE_TESTS[t.key]) ?? d[0];
    }
    return n;
  }, [l.name, l.suffix, r.seed]);
  const p = (a: any, n: any) => {
    cancelLowPriority();
    perfMark("style:tap");
    update(projectId, (t: any) => chooseStyle(t, a));
    announce(`Stil ${n} gewählt. Logos werden entworfen.`);
    navigate({ name: "auswahl", id: projectId, gemerkt: false });
  };
  const m = r.styleChoice;
  const g = [o.elegant, o.mutig, o.natur];
  return (
    <div className="container screen">
      <a className="back-link mobile-only-inline" href={routeHash({ name: "name", id: projectId })}>
        ← Name ändern
      </a>
      <h1 className="h1" data-title="Stil">
        Welche Wirkung passt zu dir?
      </h1>
      <p className="lead" style={{ marginTop: 16 }}>
        Tippe auf einen Stil. Du kannst ihn später jederzeit wechseln.
      </p>
      <div className="style-grid">
        {STYLE_OPTIONS.map((a) => {
          const n = o[a.key];
          const t = m === a.key;
          return (
            <button
              key={a.key}
              type="button"
              className={`style-card${t ? " is-chosen" : ""}`}
              aria-label={`${a.title}: ${a.desc}${t ? " (gewählt)" : ""}`}
              onClick={() => p(a.key, a.title)}
            >
              <span className="sc-preview" style={{ background: n.palette.paper }}>
                <LogoView concept={n} input={l} fallbackText priority="low" />
              </span>
              <span className="sc-text">
                <span className="sc-title">{a.title}</span>
                <span className="sc-desc">{a.desc}</span>
                {t && (
                  <span className="sc-chosen label label-strong">
                    <span className="dot" aria-hidden="true" />
                    GEWÄHLT
                  </span>
                )}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          className={`style-card is-mix${m === "mix" ? " is-chosen" : ""}`}
          aria-label={`${SURPRISE_OPTION.title}: ${SURPRISE_OPTION.desc}${m === "mix" ? " (gewählt)" : ""}`}
          onClick={() => p("mix", SURPRISE_OPTION.title)}
        >
          <span className="sc-preview">
            <span className="mix-strip">
              {g.map((a) => (
                <span
                  key={a.id}
                  style={{
                    background: a.palette.paper,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 10,
                  }}
                >
                  <LogoView concept={a} input={l} priority="low" />
                </span>
              ))}
            </span>
          </span>
          <span className="sc-text">
            <span className="sc-title">{SURPRISE_OPTION.title}</span>
            <span className="sc-desc">{SURPRISE_OPTION.desc}</span>
            {m === "mix" && (
              <span className="sc-chosen label label-strong">
                <span className="dot" aria-hidden="true" />
                GEWÄHLT
              </span>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

export default StyleScreen;
