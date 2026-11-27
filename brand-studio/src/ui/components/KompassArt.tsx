const INK = "var(--ink)";

const INK_3 = "var(--ink-3)";

const SIGNAL = "var(--signal)";

const PAPER = "var(--paper)";

const STROKE: Record<string, any> = {
  fill: "none",
  stroke: INK,
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const REFERENCE_ART: Record<string, any> = {
  verlag: (
    <>
      <path d="M20 18h38v46H20zM62 18h38v46H62z" {...STROKE} />
      <path d="M26 28h24M26 34h20M68 28h26" {...STROKE} strokeWidth={3} />
      <path d="M26 42h26M26 47h26M26 52h18" {...STROKE} stroke={INK_3} strokeWidth={1} />
      <rect x="68" y="36" width="26" height="20" fill={INK_3} opacity="0.35" />
      <circle cx="94" cy="24" r="2.4" fill={SIGNAL} />
    </>
  ),
  uhrmacher: (
    <>
      <circle cx="60" cy="40" r="24" {...STROKE} />
      <circle cx="60" cy="40" r="19" {...STROKE} stroke={INK_3} strokeWidth={1} />
      {Array.from({ length: 12 }, (s, t) => {
        const c = (t / 12) * Math.PI * 2;
        return (
          <path
            key={t}
            d={`M${60 + Math.sin(c) * 16} ${40 - Math.cos(c) * 16}L${60 + Math.sin(c) * 19} ${40 - Math.cos(c) * 19}`}
            {...STROKE}
            strokeWidth={1}
          />
        );
      })}
      <path d="M60 40V27M60 40l9 6" {...STROKE} />
      <circle cx="60" cy="40" r="2.4" fill={SIGNAL} />
    </>
  ),
  architektur: (
    <>
      <path d="M18 62V20h84v42z" {...STROKE} stroke={INK_3} strokeWidth={1} />
      <path
        d="M18 34h84M18 48h84M46 20v42M74 20v42"
        {...STROKE}
        stroke={INK_3}
        strokeWidth={0.75}
      />
      <path d="M30 56V30h32v12h22v14z" {...STROKE} />
      <circle cx="84" cy="30" r="2.4" fill={SIGNAL} />
    </>
  ),
  privatbank: (
    <>
      <path d="M24 64h72M30 58h60M60 16 28 30h64z" {...STROKE} />
      <path d="M38 34v22M50 34v22M70 34v22M82 34v22" {...STROKE} />
      <circle cx="60" cy="25" r="2.4" fill={SIGNAL} />
    </>
  ),
  hotel: (
    <>
      <path d="M36 52a24 24 0 0 1 48 0z" {...STROKE} />
      <path d="M28 56h64M60 28v-6M56 22h8" {...STROKE} />
      <circle cx="60" cy="40" r="2.4" fill={SIGNAL} />
    </>
  ),
  cafe: (
    <>
      <path d="M38 32h36v14a18 18 0 0 1-36 0z" {...STROKE} />
      <path d="M74 36h6a6 6 0 0 1 0 12h-7M30 66h52" {...STROKE} />
      <path d="M48 24c0-4 4-4 4-8M58 24c0-4 4-4 4-8" {...STROKE} stroke={INK_3} strokeWidth={1} />
      <circle cx="56" cy="44" r="2.4" fill={SIGNAL} />
    </>
  ),
  galerie: (
    <>
      <path d="M14 66h92" {...STROKE} stroke={INK_3} strokeWidth={1} />
      <rect x="44" y="20" width="32" height="26" {...STROKE} />
      <rect x="50" y="26" width="20" height="14" fill={INK_3} opacity="0.35" />
      <path d="M80 52h8" {...STROKE} strokeWidth={1} />
      <circle cx="60" cy="33" r="2.4" fill={SIGNAL} />
    </>
  ),
  tech: (
    <>
      <rect x="26" y="16" width="68" height="44" rx="6" {...STROKE} />
      <path d="M34 28h24M34 36h40M34 44h16" {...STROKE} stroke={INK_3} strokeWidth={1.5} />
      <path d="M50 66h20" {...STROKE} />
      <circle cx="82" cy="28" r="2.4" fill={SIGNAL} />
    </>
  ),
  manufaktur: (
    <>
      <path d="M30 60 58 32M54 28l10 10-6 6-10-10z" {...STROKE} />
      <path d="M70 60h26M74 52h18M78 44h10" {...STROKE} stroke={INK_3} strokeWidth={1} />
      <circle cx="36" cy="54" r="2.4" fill={SIGNAL} />
    </>
  ),
  weingut: (
    <>
      <path d="M14 62c20-14 40-14 46-24s26-12 46-14" {...STROKE} stroke={INK_3} strokeWidth={1} />
      <path d="M22 66v-8M34 64v-10M46 60v-12M58 54v-12M70 48v-12M82 44v-12M94 42v-12" {...STROKE} />
      <circle cx="96" cy="20" r="2.4" fill={SIGNAL} />
    </>
  ),
  sport: (
    <>
      <path d="M14 62c24-30 68-30 92 0M26 62c18-20 50-20 68 0" {...STROKE} />
      <path d="M38 62c12-10 32-10 44 0" {...STROKE} stroke={INK_3} strokeWidth={1} />
      <circle cx="60" cy="38" r="2.4" fill={SIGNAL} />
    </>
  ),
  mode: (
    <>
      <path d="M48 18h24l6 12-8 4v30H50V34l-8-4z" {...STROKE} />
      <path d="M60 18v46" {...STROKE} stroke={INK_3} strokeWidth={1} strokeDasharray="2 3" />
      <circle cx="66" cy="26" r="2.4" fill={SIGNAL} />
    </>
  ),
};

export function ReferenceArt({ id }: any) {
  return (
    <svg className="kp-art" viewBox="0 0 120 80" aria-hidden="true" focusable="false">
      <rect width="120" height="80" fill={PAPER} />
      {REFERENCE_ART[id]}
    </svg>
  );
}

const CLICHE_ART: Record<string, any> = {
  "gold-schwarz": (
    <>
      <rect width="80" height="48" fill={INK} />
      <path d="M24 26h32" stroke="#C9A55A" strokeWidth={3} strokeLinecap="round" />
      <path d="M30 33h20" stroke="#C9A55A" strokeWidth={1.2} strokeLinecap="round" />
    </>
  ),
  "haus-icon": <path d="M26 36V24l14-11 14 11v12zM36 36v-7h8v7" {...STROKE} />,
  skyline: <path d="M12 38V26h8v-6h6v18h6V14h6v24h6V22h8v8h6v8h6" {...STROKE} />,
  schluessel: (
    <>
      <circle cx="28" cy="24" r="7" {...STROKE} />
      <path d="M35 24h22M51 24v6M45 24v4" {...STROKE} />
    </>
  ),
  schreibschrift: (
    <path d="M18 30c6-14 10-14 8 0s6-10 10-6-2 8 4 6 6-10 10-6 0 8 6 6 6-6 8-4" {...STROKE} />
  ),
  "monogramm-kreis": (
    <>
      <circle cx="40" cy="24" r="14" {...STROKE} />
      <path d="M33 30V18l7 8 7-8v12" {...STROKE} />
    </>
  ),
};

export function ClicheArt({ id }: any) {
  return (
    <svg className="kp-cliche-art" viewBox="0 0 80 48" aria-hidden="true" focusable="false">
      {CLICHE_ART[id]}
    </svg>
  );
}
