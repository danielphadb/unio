import { r as x, j as e } from "./index-BER2gtDe.js";
import { u as c, j as h } from "./engine-BhDRZEfO.js";
const $ = x.memo(function ({
  concept: r,
  input: s,
  className: o = "",
  label: t,
  fallbackText: l,
  animate: m,
  priority: g = "normal",
  ...a
}) {
  const { ready: v, error: d } = c([r], s),
    { svg: i, fresh: f } = h(r, s, a, v, g),
    n = t ? { role: "img", "aria-label": t } : { "aria-hidden": !0 };
  if (!i) {
    if (l || d) {
      const u =
        a.variant === "reverse" || a.variant === "mono-light" ? r.palette.paper : r.palette.ink;
      return e.jsx("div", {
        className: `logo-svg ${o}`,
        ...n,
        children: e.jsx("span", {
          className: "fallback-name",
          style: { color: u },
          children: s.name,
        }),
      });
    }
    return e.jsx("div", { className: `logo-svg ${o}`, ...n });
  }
  return e.jsx("div", {
    className: `logo-svg${f && m ? " is-fresh" : ""} ${o}`,
    ...n,
    dangerouslySetInnerHTML: { __html: i },
  });
});
export { $ as L };
