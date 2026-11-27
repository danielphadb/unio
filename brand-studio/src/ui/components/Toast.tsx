import { useEffect, useState } from "react";

export function Toast({ msg, onDone }: any) {
  const [n, r] = useState(false);
  useEffect(() => {
    if (!msg || n) return;
    const s = window.setTimeout(onDone, msg.action ? 1e4 : 6e3);
    return () => window.clearTimeout(s);
  }, [msg, n, onDone]);
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {msg && (
        <div
          key={msg.id}
          className={`toast${msg.action && msg.action2 ? " has-two" : ""}`}
          onMouseEnter={() => r(true)}
          onMouseLeave={() => r(false)}
          onFocus={() => r(true)}
          onBlur={() => r(false)}
        >
          <span className="toast-text">{msg.text}</span>
          {[msg.action, msg.action2].map(
            (s) =>
              s && (
                <button
                  key={s.label}
                  type="button"
                  className="btn btn-text on-dark"
                  onClick={() => {
                    s.run();
                    onDone();
                  }}
                >
                  {s.label}
                </button>
              ),
          )}
          <button
            type="button"
            className="btn btn-text on-dark toast-close"
            aria-label="Hinweis schließen"
            onClick={onDone}
          >
            <span className="glyph" aria-hidden="true">
              ×
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
