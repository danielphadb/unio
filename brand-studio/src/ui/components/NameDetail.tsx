/**
 * Detailansicht eines Namens: Prüfpunkte, Logoformen, Domains, Übernahme.
 * Gesicherte Fassung: NameCard-Chunk (re).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { cardForms } from "../../engine/nameCardSet";
import { domainKey, kindLabel, naeheHint, umlautDomain } from "../../engine/names/finder";
import { Button, GhostButton, TextButton } from "./Buttons";
import { Dialog } from "./Dialog";
import { SaveButton, Sentinel, SmallNameCard, WordmarkCaption } from "./NameCard";

function Fold({ title, children: a }: any) {
  const [s, l] = useState(false);
  return (
    <details className="disclosure nd-fold" onToggle={(d) => l(d.currentTarget.open)}>
      <summary>{title}</summary>
      {s && <div className="disclosure-body">{a}</div>}
    </details>
  );
}

function NameForms({ s: n, concept, styles, onTake }: any) {
  const d = useMemo(() => cardForms(n, concept, styles), [n, concept, styles]);
  return (
    <div className="nd-forms">
      {d.map((i) => (
        <button
          key={i.key}
          type="button"
          className="nd-form"
          aria-label={`Logos für diesen Namen, Form ${i.label}`}
          onClick={() => onTake(n, i.concept)}
        >
          <WordmarkCaption
            s={n}
            concept={i.concept}
            styles={styles}
            part={i.part}
            className={i.key === "profil" ? "is-round" : ""}
          />
          <span className="tile-name">{i.label}</span>
        </button>
      ))}
    </div>
  );
}

function CheckRow({ label, ok, text }: any) {
  return (
    <li className="nd-check">
      <span className="nd-check-label">{label}</span>
      <span className="nd-check-state">{ok ? "Passt" : "Hinweis"}</span>
      {text && <span className="small nd-check-text">{text}</span>}
    </li>
  );
}

const DetailLink = ({ href, children: a }: any) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="nd-link">
    {a} <span aria-hidden="true">↗</span>
    <span className="sr-only">{" (öffnet ein neues Fenster)"}</span>
  </a>
);

export function NameDetail(n: any) {
  const { s: a, concept, styles } = n;
  const d = [a.name, a.suffix].filter(Boolean).join(" ");
  const i = a.name.replace(/[^\p{L}]/gu, "").length;
  const o = a.domains;
  const t = o ? umlautDomain(a.name) : null;
  const c = useRef<any>(null);
  const x = useRef<any>(null);
  const [f, m] = useState(n.mehr ? "more" : "none");
  useEffect(() => {
    if (f === "more" && n.mehr) {
      requestAnimationFrame(() => {
        return c.current?.focus();
      });
    }
    if (f === "back" && !n.mehr) {
      requestAnimationFrame(() => {
        return document.querySelector<HTMLElement>(".nd-more-link")?.focus();
      });
    }
    if (f !== "none") {
      m("none");
    }
  }, [n.mehr, f]);
  const w = (r: any) => {
    r.target.closest("input, textarea, summary") ||
      r.altKey ||
      r.ctrlKey ||
      r.metaKey ||
      n.mehr ||
      (r.key === "ArrowLeft" && n.hasPrev
        ? (r.preventDefault(), n.onPrev())
        : r.key === "ArrowRight" && n.hasNext && (r.preventDefault(), n.onNext()));
  };
  const u = (
    <div className="nd-details">
      <div className="nd-hero">
        <WordmarkCaption s={a} concept={concept} styles={styles} className="nd-mark" />
        <div className="nd-hero-row">
          <span className="small nd-kind">{kindLabel(a)}</span>
          <span className="spacer" />
          <SaveButton
            saved={n.saved}
            onSave={() => n.onSave(a)}
            onHide={() => n.onHide(a)}
            name={d}
          />
        </div>
      </div>
      <p className="nd-reason">
        {a.reason || "Ein eigenständiger Name, der zu deinen Angaben passt."}
      </p>
      {naeheHint(a) && <p className="small nd-naehe">{naeheHint(a)}</p>}
      {concept?.legalNaehe && (
        <p className="small nd-naehe">{`Logo ähnlich zu ${concept.legalNaehe.marke}, vor Nutzung prüfen`}</p>
      )}
      <div className="row nd-actions">
        <TextButton
          className="nd-more-link"
          onClick={() => {
            m("more");
            n.onArea(true);
          }}
        >
          Mehr wie dieser
        </TextButton>
        {(n.hasPrev || n.hasNext) && (
          <span className="nd-nav">
            <TextButton onClick={n.onPrev} disabled={!n.hasPrev} aria-label="Vorheriger Name">
              ←
            </TextButton>
            <TextButton onClick={n.onNext} disabled={!n.hasNext} aria-label="Nächster Name">
              →
            </TextButton>
          </span>
        )}
      </div>
      <div className="nd-folds">
        <Fold title="Domain und Marke prüfen">
          {o && (
            <>
              <ul className="nd-domains">
                {[
                  o.at,
                  ...o.alt.filter((r: any) => r.endsWith(".at")),
                  o.com,
                  ...o.alt.filter((r: any) => r.endsWith(".com")),
                ].map((r) => (
                  <li key={r}>
                    <span className="data">{r}</span>
                    <TextButton onClick={() => n.onDomain(r, r.endsWith(".com") ? "com" : "at")}>
                      {"Prüfen "}
                      <span aria-hidden="true">↗</span>
                      <span className="sr-only">
                        {" (kopiert die Adresse und öffnet ein neues Fenster)"}
                      </span>
                    </TextButton>
                  </li>
                ))}
              </ul>
              {t && (
                <p className="small">
                  {t}
                  {": möglich, wird aber oft falsch getippt. Empfohlen: "}
                  {o.at}
                </p>
              )}
              <p className="small nd-insta">
                Instagram: @{domainKey(o.at)}
                {" · "}
                <DetailLink href={`https://www.instagram.com/${domainKey(o.at)}/`}>
                  Ansehen
                </DetailLink>
              </p>
            </>
          )}
          <p className="small">
            {"Marke: "}
            <DetailLink href="https://seeip.patentamt.at">see.ip</DetailLink>
            {" · "}
            <DetailLink href="https://www.tmdn.org/tmview/">TMview</DetailLink>
            {" · "}
            <DetailLink href="https://firmen.wko.at">WKO Firmen A-Z</DetailLink>
          </p>
          <p className="small">
            Wir können das nicht für dich prüfen und geben keine Rechtsberatung.
          </p>
        </Fold>
        <Fold title="Kurz-Check">
          <ul className="nd-checks">
            <CheckRow
              label="Länge"
              ok={i <= 16}
              text={`${i} Buchstaben${i > 16 ? ". Eher lang für Schild und Domain." : ""}`}
            />
            <CheckRow label="Gut auszusprechen" ok={a.checks.pronounceable} />
            <CheckRow label="Ohne abgegriffene Begriffe" ok={a.checks.clicheFree} />
            <CheckRow
              label="Abstand zu bekannten Marken"
              ok={!a.checks.conflict}
              text={a.checks.conflict}
            />
          </ul>
        </Fold>
        <Fold title="So könnte dein Logo aussehen">
          {concept && <NameForms s={a} concept={concept} styles={styles} onTake={n.onTake} />}
        </Fold>
      </div>
    </div>
  );
  const F = (
    <section className="nd-variants" aria-labelledby="nd-more-h">
      <TextButton
        ref={x}
        onClick={() => {
          m("back");
          n.onArea(false);
        }}
      >
        {"← Zurück zu "}
        {a.name}
      </TextButton>
      <h3 className="h2" id="nd-more-h" ref={c} tabIndex={-1}>
        Ähnlich wie „{a.name}“
      </h3>
      {n.path.length > 1 && (
        <nav className="nd-path small" aria-label="Pfad">
          {n.path.map((r: any, j: any) => (
            <span key={r.id}>
              {j > 0 && <span aria-hidden="true">{" → "}</span>}
              {j < n.path.length - 1 ? (
                <button type="button" className="btn-link" onClick={() => n.onPath(r)}>
                  {r.name}
                </button>
              ) : (
                <span aria-current="true">{r.name}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="wm-grid nd-grid">
        {n.variants.items.map((r: any, j: any) => (
          <SmallNameCard
            key={r.id}
            s={r}
            concept={n.variants.conceptOf(r, j)}
            styles={styles}
            saved={n.savedIds.has(r.id)}
            onOpen={() => n.onAnchor(r)}
            onSave={() => n.onSave(r)}
            onHide={() => n.onHide(r)}
          />
        ))}
      </div>
      {n.variants.canMore &&
        (n.variants.auto ? (
          <Sentinel key={n.variants.items.length} onHit={n.variants.onMore} />
        ) : (
          <div className="gallery-more">
            <GhostButton onClick={n.variants.onMore}>24 weitere Varianten</GhostButton>
          </div>
        ))}
    </section>
  );
  return (
    <Dialog
      open
      onClose={n.onClose}
      title={d}
      size="mid"
      className="nd-dialog"
      footer={<Button onClick={() => n.onTake(a, concept)}>Logos für diesen Namen</Button>}
    >
      <div className="nd-body" onKeyDown={w}>
        {n.mehr ? F : u}
      </div>
    </Dialog>
  );
}
