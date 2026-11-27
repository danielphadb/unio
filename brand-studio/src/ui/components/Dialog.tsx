import { useEffect, useId, useRef } from "react";

export function Dialog({
  open,
  onClose,
  title,
  children: r,
  footer,
  size = "default",
  sub,
  closeLabel = "Schließen",
  className = "",
}: any) {
  const u = useRef<any>(null);
  const c = useId();
  const f = useRef<any>(null);
  const d = useRef(onClose);
  d.current = onClose;
  useEffect(() => {
    const m = u.current;
    m &&
      (open && !m.open
        ? ((f.current = document.activeElement),
          m.showModal(),
          requestAnimationFrame(() => {
            return m.querySelector(".dlg-title")?.focus();
          }))
        : !open && m.open && m.close());
  }, [open]);
  useEffect(() => {
    const m = u.current;
    if (!m) return;
    const x = (p: any) => {
      p.preventDefault();
      d.current();
    };
    const k = () => {
      const p = f.current;
      if (p && document.contains(p)) {
        p.focus();
      }
    };
    m.addEventListener("cancel", x);
    m.addEventListener("close", k);
    return () => {
      m.removeEventListener("cancel", x);
      m.removeEventListener("close", k);
    };
  }, []);
  const h = size === "default" ? "" : ` is-${size}`;
  return (
    <dialog
      ref={u}
      className={`dlg${h} ${className}`}
      aria-labelledby={c}
      onClick={(m) => {
        if (m.target === u.current) {
          onClose();
        }
      }}
    >
      <div className="dlg-grip" aria-hidden="true" />
      <div className="dlg-head">
        <h2 className="h2 dlg-title" id={c} tabIndex={-1}>
          {title}
        </h2>
        <button type="button" className="btn btn-text" onClick={onClose}>
          <span className="glyph" aria-hidden="true">
            ×
          </span>{" "}
          {closeLabel}
        </button>
      </div>
      {sub && <p className="small dlg-sub">{sub}</p>}
      <div className="dlg-body">{open && r}</div>
      {footer && open && <div className="dlg-foot">{footer}</div>}
    </dialog>
  );
}
