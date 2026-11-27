/**
 * Deine Marken: Projektliste mit Vorschau, Menü, Sicherung laden.
 * Gesicherte Fassung: index-Chunk (dS, fS, cS).
 */
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Button, GhostButton, TextButton } from "../components/Buttons";
import { ActionBar } from "../components/Controls";
import { Dialog } from "../components/Dialog";
import { BACKUP_ERRORS, BackupError, downloadBackup } from "../logic/persist";
import { duplicateProject, projectName, projectStatus } from "../logic/project";
import { parseRoute, routeHash } from "../logic/route";
import { formatSavedAt } from "../logic/text";
import { useStudio } from "../store";

const ProjectPreview = lazy(() => import("../components/ProjectPreview"));

function ProjectMenu({ project, onDelete }: any) {
  const { put, toast, navigate } = useStudio();
  const [i, a] = useState(false);
  const o = useRef<any>(null);
  const l = useRef<any>(null);
  useEffect(() => {
    if (!i) return;
    l.current?.querySelector("button")?.focus();
    const f = (m: any) => {
      var x;
      if (!((x = l.current) != null && x.contains(m.target)) && m.target !== o.current) {
        a(false);
      }
    };
    document.addEventListener("mousedown", f);
    return () => document.removeEventListener("mousedown", f);
  }, [i]);
  const u = () => {
    var f;
    a(false);
    if (!((f = o.current) == null)) {
      f.focus();
    }
  };
  const c = [
    {
      label: "Duplizieren",
      run: () => {
        const f = duplicateProject(project);
        put(f);
        toast(`Kopie angelegt: „${projectName(f)}“`);
      },
    },
    { label: "Sicherung herunterladen", run: () => downloadBackup(project) },
    ...(project.selected
      ? [{ label: "Postings erstellen", run: () => navigate({ name: "postings", id: project.id }) }]
      : []),
    { label: "Löschen", run: onDelete },
  ];
  return (
    <>
      <TextButton
        ref={o}
        aria-haspopup="menu"
        aria-expanded={i}
        aria-label={`Mehr zu ${projectName(project)}`}
        onClick={() => a((f) => !f)}
      >
        Mehr
      </TextButton>
      {i && (
        <div
          ref={l}
          className="menu"
          role="menu"
          aria-label={`Mehr zu ${projectName(project)}`}
          onKeyDown={(f) => {
            const d: HTMLButtonElement[] = Array.from(l.current?.querySelectorAll("button") ?? []);
            const h = d.indexOf(document.activeElement as HTMLButtonElement);
            if (f.key === "ArrowDown") d[(h + 1) % d.length]?.focus();
            else if (f.key === "ArrowUp") d[(h - 1 + d.length) % d.length]?.focus();
            else return f.key === "Escape" || f.key === "Tab" ? u() : undefined;
            f.preventDefault();
          }}
        >
          {c.map((f) => (
            <button
              key={f.label}
              type="button"
              role="menuitem"
              onClick={() => {
                u();
                f.run();
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function ProjectCard({ project, onDelete }: any) {
  const { navigate } = useStudio();
  const r = projectName(project);
  const s = parseRoute(project.ui.route);
  return (
    <article className="project-card" aria-label={r}>
      <Suspense fallback={<div className="preview riffel" />}>
        <ProjectPreview project={project} />
      </Suspense>
      <div className="meta">
        <h2 className="name">
          <a
            className="pc-link"
            href={routeHash(s)}
            onClick={(i) => {
              i.preventDefault();
              navigate(s);
            }}
            aria-label={`Weiterarbeiten an ${r}`}
          >
            {r}
          </a>
        </h2>
        <p className="small" style={{ marginTop: 4 }}>
          {projectStatus(project)}
          {" · zuletzt "}
          {formatSavedAt(project.updatedAt).toLocaleLowerCase("de-AT")}
        </p>
      </div>
      <div className="pc-more">
        <ProjectMenu project={project} onDelete={onDelete} />
      </div>
    </article>
  );
}

export function Home() {
  const { state, navigate, remove, put } = useStudio();
  const [s, i] = useState<any>(null);
  const [a, o] = useState<any>(null);
  const l = useRef<any>(null);
  const u = Object.values(state.projects).sort((d, h) => (h as any).updatedAt - (d as any).updatedAt);
  const c = () => {
    var d;
    o(null);
    if (!((d = l.current) == null)) {
      d.click();
    }
  };
  const f = async (d: any) => {
    if (d)
      try {
        const h = await d.text();
        const { readBackup } = await import("../logic/migrate");
        const x = readBackup(h, Object.keys(state.projects));
        put(x);
        navigate(parseRoute(x.ui.route));
      } catch (h) {
        o(
          h instanceof BackupError && h.message === "invalid"
            ? BACKUP_ERRORS.invalid
            : BACKUP_ERRORS.foreign,
        );
      } finally {
        if (l.current) {
          l.current.value = "";
        }
      }
  };
  return (
    <div className="container screen">
      <div className="home-head">
        <h1 className="h1" data-title="Deine Marken">
          Deine Marken
        </h1>
        <div className="desk-flex">
          <Button onClick={() => navigate({ name: "names", gemerkt: false, kinds: [] })}>
            Neue Marke beginnen
          </Button>
        </div>
      </div>
      {state.loadError ? (
        <div className="empty-state">
          <p>
            Deine Marken konnten nicht geladen werden. Lade die Seite neu. Wenn das nicht hilft,
            öffne eine Sicherungsdatei.
          </p>
          <div className="row">
            <GhostButton onClick={() => location.reload()}>Neu laden</GhostButton>
            <GhostButton onClick={c}>Sicherung öffnen</GhostButton>
          </div>
        </div>
      ) : (
        <div className="project-grid">
          {u.map((d) => (
            <ProjectCard key={(d as any).id} project={d} onDelete={() => i(d)} />
          ))}
        </div>
      )}
      <div className="storage-note">
        <p className="small">
          Deine Marken sind nur in diesem Browser auf diesem Gerät gespeichert. Tipp: Lade dein
          Brand Kit herunter oder sichere deine Marke als Datei.
        </p>
        <div>
          <TextButton onClick={c}>Sicherung öffnen</TextButton>
          <input
            ref={l}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(d) => {
              return f(d.target.files?.[0]);
            }}
            aria-label="Sicherungsdatei wählen"
          />
        </div>
      </div>
      {a && (
        <p className="field-error" role="alert" style={{ marginTop: 12 }}>
          {a}
        </p>
      )}
      <Dialog
        open={!!s}
        onClose={() => i(null)}
        title={s ? `„${projectName(s)}“ löschen?` : ""}
        footer={
          <>
            <GhostButton onClick={() => i(null)}>Abbrechen</GhostButton>
            <Button
              knob="×"
              onClick={() => {
                if (s) {
                  remove(s.id);
                }
                i(null);
              }}
            >
              Endgültig löschen
            </Button>
          </>
        }
      >
        <p>
          Die Marke und alle Entwürfe werden aus diesem Browser entfernt. Dateien, die du schon
          heruntergeladen hast, bleiben erhalten.
        </p>
      </Dialog>
      <ActionBar>
        <Button onClick={() => navigate({ name: "names", gemerkt: false, kinds: [] })}>
          Neue Marke beginnen
        </Button>
      </ActionBar>
    </div>
  );
}
