import { useEffect, useRef, useState } from "react";
import { downloadBackup } from "../logic/persist";
import { projectName } from "../logic/project";
import { STEP_CAPS, STEP_LABELS, routeHash, stepOf, stepRoute } from "../logic/route";
import { useStudio } from "../store";
import { Button } from "./Buttons";
import { Menu } from "./Controls";
import { Dialog } from "./Dialog";

const BASE = "./";

function Steps({ route, project, mobileOnly }: any) {
  const r = stepOf(route);
  if (!r) return null;
  if (mobileOnly) {
    const s = route.name === "names" ? "Name finden" : STEP_LABELS[r - 1];
    return (
      <span className="steps-compact label" aria-label={`Schritt ${r} von 5: ${s}`}>
        {r}
        {" / 5 · "}
        {s}
      </span>
    );
  }
  return (
    <nav className="steps" aria-label="Fortschritt">
      <ol>
        {STEP_CAPS.map((s, i) => {
          const a = i + 1;
          const o = `${String(a).padStart(2, "0")} ${a === 1 && route.name === "names" ? "NAME FINDEN" : s}`;
          if (a === r)
            return (
              <li key={s}>
                <span className="step" aria-current="step">
                  <span className="dot" aria-hidden="true" />
                  {o}
                </span>
              </li>
            );
          const l = project && a < r ? stepRoute(project, a) : null;
          return (
            <li key={s}>
              {l ? (
                <a className="step" href={routeHash(l)}>
                  {o}
                </a>
              ) : (
                <span className="step">{o}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function SaveError({ changedAt }: any) {
  const { save, storageOk, navigate } = useStudio();
  const [s, i] = useState(false);
  return storageOk ? (
    save === "error" ? (
      <>
        <button type="button" className="btn btn-text save-status is-error" onClick={() => i(true)}>
          <span className="dot" aria-hidden="true" />
          NICHT GESPEICHERT
        </button>
        <Dialog
          open={s}
          onClose={() => i(false)}
          title="Nicht gespeichert"
          footer={
            <Button
              onClick={() => {
                i(false);
                navigate({ name: "home" });
              }}
            >
              Zu deinen Marken
            </Button>
          }
        >
          <p>Dein Browser-Speicher ist voll. Lösche alte Marken oder entferne eingesetzte Fotos.</p>
        </Dialog>
      </>
    ) : (
      <SaveStatus save={save} changedAt={changedAt} />
    )
  ) : null;
}

function SaveStatus({ save, changedAt }: any) {
  const [n, r] = useState(false);
  const s = useRef(Date.now() + 1500);
  useEffect(() => {
    const a = () => (s.current = Date.now() + 1500);
    window.addEventListener("hashchange", a);
    return () => window.removeEventListener("hashchange", a);
  }, []);
  const i = useRef(changedAt);
  useEffect(() => {
    if (Date.now() < s.current || changedAt === i.current) {
      i.current = changedAt;
      if (save !== "saving") {
        r(false);
      }
      return;
    }
    if (save === "saving") {
      r(true);
      return;
    }
    if (save !== "saved") {
      r(false);
      return;
    }
    i.current = changedAt;
    const a = window.setTimeout(() => r(false), 1500);
    return () => window.clearTimeout(a);
  }, [save]);
  return (
    <span className="save-status" role="status">
      {n ? (save === "saving" ? "Speichert ..." : "Gespeichert") : ""}
    </span>
  );
}

export function Header({ route, project, sticky }: any) {
  const { setHelpOpen, navigate } = useStudio();
  const i = stepOf(route) >= 2;
  const a = stepOf(route);
  return (
    <>
      <header className={`app-header${sticky ? " is-sticky" : ""}`}>
        <div className="container">
          <a className="brandlink" href="#/" aria-label="Brand Studio, zu deinen Marken">
            <img src={`${BASE}unio-logo-black.svg`} alt="" width={72} height={18} />
            <span className="label" aria-hidden="true">
              BRAND STUDIO
            </span>
          </a>
          {project && (
            <span className="project-switch desk-only">
              <Menu
                label={projectName(project)}
                menuLabel="Marke wechseln"
                placement="below-start"
                items={[
                  { label: "Deine Marken", run: () => navigate({ name: "home" }) },
                  {
                    label: "Neue Marke beginnen",
                    run: () => navigate({ name: "names", gemerkt: false, kinds: [] }),
                  },
                  { label: "Sicherung herunterladen", run: () => downloadBackup(project) },
                ]}
              />
            </span>
          )}
          <Steps route={route} project={project} />
          <Steps route={route} project={project} mobileOnly />
          <div className="header-right">
            {i && <SaveError changedAt={project?.updatedAt} />}
            <button
              type="button"
              className="btn btn-text help-btn"
              onClick={() => setHelpOpen(true)}
            >
              Hilfe
            </button>
          </div>
        </div>
        {a > 0 && (
          <div className="header-progress" aria-hidden="true">
            <span style={{ width: `${(a / 5) * 100}%` }} />
          </div>
        )}
      </header>
    </>
  );
}
