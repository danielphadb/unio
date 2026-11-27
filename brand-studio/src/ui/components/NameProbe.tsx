/**
 * "Namen auf die Probe stellen": Prüfung des eigenen Namens und Alternativen.
 * Gesicherte Fassung: Gallery-Chunk (tt, st).
 */
import { useCallback, useMemo, useState } from "react";
import { fallbackCard, nameCards } from "../../engine/nameCardSet";
import { alternativenFuer, pruefeEigenenNamen } from "../../engine/names";
import { inputNameKind, kindLabel } from "../../engine/names/finder";
import { hash } from "../../engine/rng";
import { createProject, nameFieldsOf, suffixChoiceOf, withChosenName } from "../logic/project";
import { useStudio } from "../store";
import { Button, GhostButton } from "./Buttons";
import { Dialog } from "./Dialog";
import { NameCard, WordmarkCaption } from "./NameCard";

const STATUS_LABELS: Record<string, any> = { gut: "Gut", hinweis: "Hinweis", kritisch: "Kritisch" };

const VERDICT_LABELS: Record<string, any> = {
  stark: "Starker Name",
  solide: "Solider Name",
  schwach: "Mit Schwächen",
};

function probeContext(e: any) {
  const n = e.nameContext?.person ?? (e.input.nameKind !== "company" ? e.rawName : undefined);
  const t = e.nameContext?.company ?? (e.input.nameKind === "company" ? e.rawName : undefined);
  const r: any = {
    ...(n ? { person: n } : {}),
    ...(t ? { company: t } : {}),
    ...(e.input.place ? { region: e.input.place } : {}),
    focus: e.nameContext?.focus ?? [],
    styles: e.input.styles,
    keywords: e.nameContext?.keywords ?? [],
  };
  if (e.route) {
    r.route = e.route.params;
  }
  return r;
}

export function NameProbeFold({ project }: any) {
  const [n, t] = useState(false);
  return (
    <details className="disclosure name-probe" onToggle={(r) => t(r.currentTarget.open)}>
      <summary>Namen auf die Probe stellen</summary>
      {n && (
        <div className="disclosure-body">
          <NameProbe project={project} />
        </div>
      )}
    </details>
  );
}

function NameProbe({ project }: any) {
  const { update, put, toast, announce, navigate } = useStudio();
  const u = project.rawName || project.input.name;
  const a = JSON.stringify(probeContext(project));
  const d = useMemo(() => JSON.parse(a), [a]);
  const l = useMemo(() => pruefeEigenenNamen(u, d), [u, d]);
  const c = useMemo(() => alternativenFuer(u, d, 12), [u, d]);
  const k = project.input.styles;
  const C = useMemo(() => hash(`${project.seed}|probe|${u}`), [project.seed, u]);
  const m = useMemo(() => {
    let g: any[] = [];
    try {
      g = nameCards(c, C, k, false, project.route?.params);
    } catch (R) {
      console.warn("Alternativen ohne finale Logos", R);
    }
    return c.map((R, K) => g[K] ?? fallbackCard(R, K, C, k));
  }, [c, C, k, project.route]);
  const [T, $] = useState<any>(() => new Set<any>());
  const [O, F] = useState<any>(null);
  const I = useMemo(
    () => new Set(project.nameCandidates.map((g: any) => g.name.toLocaleLowerCase("de-AT"))),
    [project.nameCandidates],
  );
  const M = useCallback(
    (g: any) => {
      const p = g.name.toLocaleLowerCase("de-AT");
      update(project.id, (R: any) => ({
        ...R,
        nameCandidates: R.nameCandidates.some((K: any) => K.name.toLocaleLowerCase("de-AT") === p)
          ? R.nameCandidates.filter((K: any) => K.name.toLocaleLowerCase("de-AT") !== p)
          : [...R.nameCandidates, { name: g.name, descriptor: g.suffix ?? "", kind: g.kind }],
      }));
      if (!I.has(p)) {
        announce(`„${g.name}“ gemerkt.`);
      }
    },
    [update, project.id, I, announce],
  );
  const B = useCallback((g: any) => $((p: any) => new Set(p).add(g.id)), []);
  const _ = useCallback((g: any) => F(c.findIndex((p) => p.id === g.id)), [c]);
  const N = O !== null ? c[O] : null;
  const w = O !== null ? (m[O] ?? null) : null;
  const y = () => {
    if (!N) return;
    const g = nameFieldsOf(project);
    update(project.id, (p: any) =>
      withChosenName(p, { name: N.name, suffix: N.suffix, kind: inputNameKind(N.kind) }, w),
    );
    F(null);
    toast(`Deine Marke heißt jetzt „${N.name}“.`, {
      label: "Rückgängig",
      run: () => update(project.id, (p: any) => ({ ...p, ...g })),
    });
  };
  const A = () => {
    if (!N) return;
    const g = suffixChoiceOf(N.suffix);
    let p = createProject({
      rawName: N.name,
      suffixChoice: g.choice,
      customSuffix: g.custom,
      keepLegalForm: true,
      nameKind: inputNameKind(N.kind),
      place: project.input.place,
    });
    p = {
      ...p,
      input: { ...p.input, styles: project.input.styles },
      styleChoice: project.styleChoice,
      pinned: w,
      favorites: w ? [w] : [],
      numbers: w ? { [w.id]: 1 } : {},
      ...(project.nameContext ? { nameContext: project.nameContext } : {}),
      ...(project.brief ? { brief: project.brief } : {}),
      ...(project.route ? { route: project.route } : {}),
      ui: { ...p.ui, route: `#/p/${p.id}/${project.styleChoice ? "auswahl" : "stil"}` },
    };
    put(p);
    F(null);
    toast(`Zweite Marke „${N.name}“ angelegt.`, {
      label: "Öffnen",
      run: () =>
        navigate(
          project.styleChoice
            ? { name: "auswahl", id: p.id, gemerkt: false }
            : { name: "stil", id: p.id },
        ),
    });
  };
  const S = c.filter((g) => !T.has(g.id));
  const j = typeof matchMedia < "u" && matchMedia("(min-width: 760px)").matches;
  return (
    <div className="probe">
      {l.punkte.length > 0 && (
        <>
          <p className="probe-sum">
            <span className="label probe-gesamt" data-gesamt={l.gesamt}>
              {VERDICT_LABELS[l.gesamt]}
            </span>{" "}
            {l.zusammenfassung}
          </p>
          <ul className="probe-list">
            {l.punkte.map((g) => (
              <li key={g.id} className="probe-item" data-status={g.status}>
                <span className="probe-dot" aria-hidden="true" />
                <span className="probe-title">{g.titel}</span>
                <span className="label probe-status">{STATUS_LABELS[g.status]}</span>
                <span className="small probe-text">{g.text}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {S.length > 0 && (
        <section aria-labelledby="probe-alt-h">
          <h3 className="h2 probe-alt-h" id="probe-alt-h">
            Alternativen zum Vergleich
          </h3>
          <p className="small">
            Tippe auf einen Namen, um mit ihm weiterzumachen oder ihn als zweite Marke anzulegen.
          </p>
          <div className="wm-grid nf-list probe-grid">
            {S.map((g) => {
              const p = c.indexOf(g);
              return (
                <NameCard
                  key={g.id}
                  s={g}
                  concept={m[p] ?? null}
                  styles={k}
                  saved={I.has(g.name.toLocaleLowerCase("de-AT"))}
                  desktop={j}
                  onOpen={_}
                  onSave={M}
                  onHide={B}
                />
              );
            })}
          </div>
        </section>
      )}
      {N && (
        <Dialog
          open
          onClose={() => F(null)}
          title={[N.name, N.suffix].filter(Boolean).join(" ")}
          size="mid"
          className="nd-dialog"
          footer={
            <>
              <GhostButton onClick={A}>Als zweite Marke anlegen</GhostButton>
              <Button onClick={y}>Mit diesem Namen weiter</Button>
            </>
          }
        >
          <div className="nd-details">
            <div className="nd-hero">
              <WordmarkCaption s={N} concept={w} styles={k} className="nd-mark" />
              <div className="nd-hero-row">
                <span className="small nd-kind">{kindLabel(N)}</span>
              </div>
            </div>
            <p className="nd-reason">{N.reason || "Eine Alternative zu deinem Namen."}</p>
            <p className="small">
              Logo, Stil und Filter bleiben. Du kannst den Tausch rückgängig machen.
            </p>
          </div>
        </Dialog>
      )}
    </div>
  );
}
