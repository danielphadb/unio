import { j as a } from "./index-BER2gtDe.js";
import { L as r } from "./LogoView-CG3DXWdO.js";
import "./engine-BhDRZEfO.js";
import "./svg-CrwnZnJY.js";
function c({ project: e }) {
  var n;
  const i = e.selected ?? ((n = e.editing) == null ? void 0 : n.concept) ?? e.favorites[0] ?? null;
  return i
    ? a.jsx("div", {
        className: "preview",
        style: { background: i.palette.paper },
        children: a.jsx(r, {
          concept: i,
          input: e.input,
          tagline: e.showTaglineInLogo,
          fallbackText: !0,
        }),
      })
    : a.jsx("div", {
        className: "preview",
        style: { background: "var(--paper-3)" },
        "aria-hidden": "true",
        children: a.jsx("span", {
          className: "fallback-name",
          style: { color: "var(--ink)", padding: 16 },
          children: e.input.name,
        }),
      });
}
export { c as default };
