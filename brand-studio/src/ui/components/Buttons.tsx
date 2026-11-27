import { forwardRef } from "react";

export const Button = forwardRef(function (
  { children: t, className = "", reveal, knob = "→", busy, ...props }: any,
  o: any,
) {
  return (
    <button
      ref={o}
      type="button"
      className={`btn btn-primary${reveal ? " btn-reveal" : ""}${busy ? " is-busy" : ""} ${className}`}
      {...props}
    >
      <span className="btn-label">{t}</span>
      <span className="knob" aria-hidden="true">
        {knob}
      </span>
    </button>
  );
});

export const GhostButton = forwardRef(function (
  { children: t, className = "", ...props }: any,
  s: any,
) {
  return (
    <button ref={s} type="button" className={`btn btn-ghost ${className}`} {...props}>
      {t}
    </button>
  );
});

export const TextButton = forwardRef(function (
  { children: t, className = "", ...props }: any,
  s: any,
) {
  return (
    <button ref={s} type="button" className={`btn btn-text ${className}`} {...props}>
      {t}
    </button>
  );
});
