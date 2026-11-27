/**
 * Namenskarte mit fertigem Logo, Merken und Ausblenden.
 * Gesicherte Fassung: NameCard-Chunk (ie, V, D).
 */
import { memo, useEffect, useMemo, useRef } from "react";
import { cardFace } from "../../engine";
import { kindLabel, naeheHint, nameInput } from "../../engine/names/finder";
import { LogoView } from "./LogoView";

export function HeartIcon({ on }: any) {
  return (
    <svg
      className="heart"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10 17.2 3.4 10.8A4 4 0 0 1 10 5.1a4 4 0 0 1 6.6 5.7Z"
        fill={on ? "var(--signal)" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SaveButton({ saved, onSave, onHide, name }: any) {
  return (
    <>
      <button
        type="button"
        className="icon-btn heart-btn"
        aria-pressed={saved}
        aria-label={saved ? `Gemerkt: ${name}` : `Merken: ${name}`}
        title={saved ? "Gemerkt" : "Merken"}
        onClick={onSave}
      >
        <HeartIcon on={saved} />
      </button>
      {onHide && (
        <button
          type="button"
          className="icon-btn hide-btn"
          aria-label={`Weniger davon: ${name}`}
          title="Weniger davon"
          onClick={onHide}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" focusable="false">
            <path
              d="M4 4 14 14M14 4 4 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </>
  );
}

export function WordmarkCaption({ s: n, concept, styles, className = "", part, caption }: any) {
  const o = useMemo(() => nameInput(n, styles), [n, styles]);
  const t = concept ? cardFace(concept) : null;
  return (
    <div
      className={`wm-face${t?.variant === "reverse" ? " is-dark" : ""}${concept ? "" : " riffel"} ${className}`}
      style={t ? { background: t.background } : undefined}
    >
      {concept && (
        <LogoView
          concept={concept}
          input={o}
          variant={t?.variant}
          ground={t?.ground}
          part={part}
          animate
          priority="high"
        />
      )}
      {caption && (
        <span
          className="label wm-caption"
          style={t?.variant === "reverse" && concept ? { color: concept.palette.paper } : undefined}
        >
          {caption}
        </span>
      )}
    </div>
  );
}

export function SmallNameCard({ s: n, concept, styles, saved, onOpen, onSave, onHide }: any) {
  const t = [n.name, n.suffix].filter(Boolean).join(" ");
  return (
    <article
      className="wm-card is-small"
      onKeyDown={(c: any) => {
        c.target.closest("input") ||
          c.ctrlKey ||
          c.metaKey ||
          c.altKey ||
          (c.key === "m" || c.key === "M"
            ? (c.preventDefault(), onSave())
            : (c.key === "x" || c.key === "X") && (c.preventDefault(), onHide()));
      }}
    >
      <button
        type="button"
        className="wm-open"
        aria-label={`${t}. ${kindLabel(n)}. Als Ausgangspunkt nehmen`}
        onClick={onOpen}
      >
        <WordmarkCaption s={n} concept={concept} styles={styles} />
      </button>
      <div className="wm-actions">
        <SaveButton saved={saved} onSave={onSave} name={t} />
      </div>
    </article>
  );
}

export function Sentinel({ onHit }: any) {
  const a = useRef<any>(null);
  const s = useRef(onHit);
  s.current = onHit;
  useEffect(() => {
    const l = a.current;
    if (!l) return;
    const d = new IntersectionObserver((i) => i.some((o) => o.isIntersecting) && s.current(), {
      rootMargin: "600px",
    });
    d.observe(l);
    return () => d.disconnect();
  }, []);
  return <div ref={a} className="nf-sentinel" aria-hidden="true" />;
}

export const NameCard = memo(function ({
  s: a,
  concept,
  styles,
  saved,
  desktop,
  onOpen,
  onSave,
  onHide,
  onMore,
  intern,
}: any) {
  const m = [a.name, a.suffix].filter(Boolean).join(" ");
  const w = (u: any) => {
    u.target.closest("input, textarea") ||
      u.ctrlKey ||
      u.metaKey ||
      u.altKey ||
      (u.key === "m" || u.key === "M"
        ? (u.preventDefault(), onSave(a))
        : u.key === "x" || u.key === "X"
          ? (u.preventDefault(), onHide(a))
          : (u.key === "v" || u.key === "V") && onMore && (u.preventDefault(), onMore(a)));
  };
  return (
    <article
      className="wm-card name-card"
      aria-label={m}
      onKeyDown={w}
      data-name={a.name}
      data-kind={a.kind}
      data-id={a.id}
    >
      <h3 className="sr-only nc-name">{m}</h3>
      <button
        type="button"
        className="wm-open"
        aria-label={`${m}. ${kindLabel(a)}. Details öffnen`}
        onClick={() => onOpen(a, false)}
      >
        <WordmarkCaption s={a} concept={concept} styles={styles} />
      </button>
      <div className="wm-actions">
        <SaveButton
          saved={saved}
          onSave={() => onSave(a)}
          onHide={desktop ? () => onHide(a) : undefined}
          name={m}
        />
      </div>
      {naeheHint(a) && <p className="small nc-naehe">{naeheHint(a)}</p>}
      {concept?.legalNaehe && (
        <p className="small nc-naehe">{`ähnlich zu ${concept.legalNaehe.marke}`}</p>
      )}
      {intern && concept?.signature && (
        <span className="chip-tag example-tag nc-vorlage">{`Vorlage ${concept.signature.id}`}</span>
      )}
    </article>
  );
});
