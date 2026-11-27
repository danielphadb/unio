/**
 * Logo als SVG mit Platzhalter, solange Schriften laden.
 * Gesicherte Fassung: LogoView-Chunk.
 */
import { memo } from "react";
import { useFontsReady, useLogoSvg } from "../../engine";

export const LogoView = memo(function ({
  concept,
  input,
  className = "",
  label,
  fallbackText,
  animate,
  priority = "normal",
  ...props
}: any) {
  const { ready, error } = useFontsReady([concept], input);
  const { svg, fresh } = useLogoSvg(concept, input, props, ready, priority);
  const n = label ? { role: "img", "aria-label": label } : { "aria-hidden": true };
  if (!svg) {
    if (fallbackText || error) {
      const u =
        props.variant === "reverse" || props.variant === "mono-light"
          ? concept.palette.paper
          : concept.palette.ink;
      return (
        <div className={`logo-svg ${className}`} {...n}>
          <span className="fallback-name" style={{ color: u }}>
            {input.name}
          </span>
        </div>
      );
    }
    return <div className={`logo-svg ${className}`} {...n} />;
  }
  return (
    <div
      className={`logo-svg${fresh && animate ? " is-fresh" : ""} ${className}`}
      {...n}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});
