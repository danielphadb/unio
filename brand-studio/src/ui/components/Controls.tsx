import { forwardRef, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function radioKeyNav(e: any, t: any, n: any, r: any, s: any = 1, i: any) {
  const a = Math.max(0, t.indexOf(n));
  let o = a;
  switch (e.key) {
    case "ArrowRight":
      o = a + 1;
      break;
    case "ArrowLeft":
      o = a - 1;
      break;
    case "ArrowDown":
      o = a + (s > 1 ? s : 1);
      break;
    case "ArrowUp":
      o = a - (s > 1 ? s : 1);
      break;
    case "Home":
      o = 0;
      break;
    case "End":
      o = t.length - 1;
      break;
    default:
      return;
  }
  e.preventDefault();
  if (s > 1) {
    o = Math.min(t.length - 1, Math.max(0, o));
  } else {
    o = (o + t.length) % t.length;
  }
  r(t[o]);
  if (!(i == null)) {
    i(o);
  }
}

function useRadioFocus() {
  const e = useRef<any>(null);
  return {
    ref: e,
    focusAt: (n: any) => {
      const r = e.current?.querySelectorAll('[role="radio"]');
      r?.[n]?.focus();
    },
  };
}

export function ChipGroup({ options, value, onChange, label, labelledBy, scroll }: any) {
  const { ref: a, focusAt } = useRadioFocus();
  const l = options.map((c: any) => c.value);
  const u = value ?? l[0];
  return (
    <div
      ref={a}
      className={`chips${scroll ? " is-scroll" : ""}`}
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {options.map((c: any) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          className="chip"
          aria-checked={c.value === value}
          aria-label={c.ariaLabel}
          lang={c.lang}
          tabIndex={c.value === u ? 0 : -1}
          onClick={() => onChange(c.value)}
          onKeyDown={(f) => radioKeyNav(f, l, u, onChange, 1, focusAt)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function ChipToggles({ options, values, onToggle, label }: any) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((s: any) => (
        <button
          key={s.value}
          type="button"
          className="chip"
          aria-pressed={values.includes(s.value)}
          onClick={() => onToggle(s.value)}
          aria-label={s.ariaLabel}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

export function Segmented({ options, value, onChange, label, labelledBy, scroll }: any) {
  const { ref: a, focusAt } = useRadioFocus();
  const l = options.map((c: any) => c.value);
  const u = l.includes(value) ? value : l[0];
  return (
    <div
      ref={a}
      className={`seg${scroll ? " is-scroll" : ""}`}
      role="radiogroup"
      aria-label={label}
      aria-labelledby={labelledBy}
    >
      {options.map((c: any) => (
        <button
          key={c.value}
          type="button"
          role="radio"
          className="seg-opt"
          aria-checked={c.value === value}
          tabIndex={c.value === u ? 0 : -1}
          onClick={() => onChange(c.value)}
          onKeyDown={(f) => radioKeyNav(f, l, u, onChange, 1, focusAt)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

export function ToolSection(e: any) {
  const t = useId();
  return (
    <div className="tool-section">
      <span className="label" id={t}>
        {e.title}
      </span>
      <Segmented options={e.options} value={e.value} onChange={e.onChange} labelledBy={t} />
    </div>
  );
}

export function Switch({ checked, onChange, children: n, describedBy }: any) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="switch"
      onClick={() => onChange(!checked)}
      aria-describedby={describedBy}
    >
      <span className="track" aria-hidden="true" />
      <span>{n}</span>
    </button>
  );
}

export const Field = forwardRef(function (
  { label, help, error, large, id, className = "", ...props }: any,
  l: any,
) {
  const u = useId();
  const c = id ?? u;
  const f = help ? `${c}-help` : undefined;
  const d = error ? `${c}-err` : undefined;
  return (
    <div className="field">
      <label className="label field-label" htmlFor={c}>
        {label}
      </label>
      <input
        ref={l}
        id={c}
        className={`input${large ? " input-lg" : ""} ${className}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={[d, f].filter(Boolean).join(" ") || undefined}
        {...props}
      />
      {error && (
        <p className="field-error" id={d}>
          {error}
        </p>
      )}
      {help && (
        <p className="field-help" id={f}>
          {help}
        </p>
      )}
    </div>
  );
});

export function Menu({
  label,
  items,
  className = "btn btn-text",
  menuLabel,
  placement = "below-end",
  children: i,
}: any) {
  const [a, o] = useState(false);
  const l = useRef<any>(null);
  const u = useRef<any>(null);
  const c = items.filter((d: any) => d.show !== false);
  useEffect(() => {
    if (!a) return;
    u.current?.querySelector("button")?.focus();
    const d = (x: any) => {
      var k;
      var p;
      if (
        !((k = u.current) != null && k.contains(x.target)) &&
        !((p = l.current) != null && p.contains(x.target))
      ) {
        o(false);
      }
    };
    document.addEventListener("mousedown", d);
    return () => document.removeEventListener("mousedown", d);
  }, [a]);
  const f = (d: any = true) => {
    var h;
    o(false);
    d && ((h = l.current) == null || h.focus());
  };
  return (
    <span className="menu-wrap">
      <button
        ref={l}
        type="button"
        className={className}
        aria-haspopup="menu"
        aria-expanded={a}
        aria-label={i ? label : undefined}
        onClick={() => o((d) => !d)}
      >
        {i ?? label}
      </button>
      {a && (
        <div
          ref={u}
          className={`menu is-${placement}`}
          role="menu"
          aria-label={menuLabel ?? label}
          onKeyDown={(d) => {
            const h: HTMLButtonElement[] = Array.from(u.current?.querySelectorAll("button") ?? []);
            const m = h.indexOf(document.activeElement as HTMLButtonElement);
            if (d.key === "ArrowDown") h[(m + 1) % h.length]?.focus();
            else if (d.key === "ArrowUp") h[(m - 1 + h.length) % h.length]?.focus();
            else if (d.key === "Escape") f();
            else return d.key === "Tab" ? f(false) : undefined;
            d.preventDefault();
          }}
        >
          {c.map((d: any) => (
            <button
              key={d.label}
              type="button"
              role="menuitem"
              onClick={() => {
                f();
                d.run();
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
    </span>
  );
}

export function ActionBar({ children: e }: any) {
  const [t, n] = useState<any>(null);
  useEffect(() => n(document.getElementById("main") ?? document.body), []);
  return t ? createPortal(<div className="actionbar">{e}</div>, t) : null;
}
