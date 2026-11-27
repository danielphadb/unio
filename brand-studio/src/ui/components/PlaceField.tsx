import { useId, useState } from "react";
import { PLACE_SUGGESTIONS } from "../../engine/orte";
import { plainDashes } from "../logic/text";

export function PlaceField({
  value,
  onChange,
  label = "WO BIST DU TÄTIG?",
  placeholder = "z. B. Döbling oder Wienerwald",
  help,
}: any) {
  const i = useId();
  const [a, o] = useState(false);
  const [l, u] = useState(-1);
  const c = value.trim().toLocaleLowerCase("de-AT");
  const f = (
    c
      ? PLACE_SUGGESTIONS.filter(
          (k) => k.toLocaleLowerCase("de-AT").includes(c) && k.toLocaleLowerCase("de-AT") !== c,
        )
      : PLACE_SUGGESTIONS
  ).slice(0, 8);
  const d = `${i}-list`;
  const h = `${i}-help`;
  const m = a && f.length > 0;
  const x = (k: any) => {
    onChange(k);
    o(false);
    u(-1);
  };
  return (
    <div className="field combo">
      <label className="label field-label" htmlFor={i}>
        {label}
      </label>
      <input
        id={i}
        className="input"
        role="combobox"
        aria-expanded={m}
        aria-controls={d}
        aria-autocomplete="list"
        aria-activedescendant={m && l >= 0 ? `${d}-${l}` : undefined}
        aria-describedby={help ? h : undefined}
        placeholder={placeholder}
        autoComplete="off"
        maxLength={60}
        value={value}
        onChange={(k) => {
          onChange(plainDashes(k.target.value));
          o(true);
          u(-1);
        }}
        onFocus={() => o(true)}
        onBlur={() => setTimeout(() => o(false), 120)}
        onKeyDown={(k) => {
          k.key === "ArrowDown"
            ? (k.preventDefault(), o(true), u((p) => Math.min(f.length - 1, p + 1)))
            : k.key === "ArrowUp"
              ? (k.preventDefault(), u((p) => Math.max(0, p - 1)))
              : k.key === "Enter" && m && l >= 0
                ? (k.preventDefault(), x(f[l]))
                : k.key === "Escape" && m && (k.preventDefault(), k.stopPropagation(), o(false));
        }}
      />
      {m && (
        <ul className="combo-list" id={d} role="listbox" aria-label="Vorschläge Region">
          {f.map((k, p) => (
            <li
              key={k}
              id={`${d}-${p}`}
              role="option"
              aria-selected={p === l}
              className={p === l ? "is-active" : undefined}
              onMouseDown={(g) => {
                g.preventDefault();
                x(k);
              }}
            >
              {k}
            </li>
          ))}
        </ul>
      )}
      {help && (
        <p className="field-help" id={h}>
          {help}
        </p>
      )}
    </div>
  );
}
