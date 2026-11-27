/**
 * Galerie der Logo-Vorschläge mit Filtern, Gemerkt, Ähnlichen und KI-Rangfolge.
 * Gesicherte Fassung: Gallery-Chunk (kt).
 */
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PAGE_SIZE,
  cardFace,
  curateConcepts,
  curatedPackage,
  curationCandidates,
  editorVariants,
  enqueueRender,
  fontStore,
  fontsNeeded,
  inputSeed,
  perfMark,
  perfMeasure,
  renderLogoSvg,
  useFontsReady,
  useLogoSvg,
} from "../../engine";
import { COLOR_MOODS, COLOR_MOOD_KEYS } from "../../engine/palettes";
import { Button, GhostButton, TextButton } from "../components/Buttons";
import { Switch } from "../components/Controls";
import { Dialog } from "../components/Dialog";
import { KiConsent } from "../components/KiConsent";
import { HeartIcon } from "../components/NameCard";
import { NameProbeFold } from "../components/NameProbe";
import {
  applyRanking,
  buildRequest,
  cachedRanking,
  mergeCards,
  rankOnce,
  rankingKey,
} from "../logic/artDirector";
import {
  ABSTRACT_THEMES,
  HOUSE_THEMES,
  NAME_FORMAT_LABELS,
  STYLE_OPTIONS,
  THEME_LABELS,
  describeConcept,
} from "../logic/describe";
import { applyFilters, isFavorite, startEditing, toggleFavorite } from "../logic/project";
import { updateSettings, useSettings } from "../logic/settings";
import { padNumber } from "../logic/text";
import { useStudio } from "../store";

const DEFAULT_PAGE_SIZE = PAGE_SIZE;

const nameFormatOf = (e: any) => e.nameFormat ?? "full";

const NAME_FORMATS = ["full", "upper", "surname", "stacked", "initial", "monogram", "district"];

function asWordmark(e: any) {
  return e.layout === "wordmark" && !e.symbol
    ? e
    : { ...e, id: `${e.id}w`, layout: "wordmark", symbol: null };
}

const poolCache = new Map<any, any>();

function poolFor(e: any, n: any, t: any, r: any, i: any, o: any = false) {
  const u = JSON.stringify([
    e.name,
    e.suffix,
    e.place ?? "",
    e.nameKind ?? "",
    e.ort2 ?? "",
    e.jahr ?? "",
    e.route ? `${e.route.territory}|${e.route.seed}|${JSON.stringify(e.route.axes)}` : "",
    e.styles,
    e.colorMoods,
    e.themes,
    n,
    t,
    r,
    i,
    o,
  ]);
  let a = poolCache.get(u);
  if (!a) {
    const d = (n ^ inputSeed(e)) >>> 0;
    let l = curationCandidates(e, { page: t <= 0 ? 0 : t + 1, seed: d, signatureEntwuerfe: o });
    if (r) {
      const c = new Set<any>();
      l = l.map(asWordmark).filter((k) => (c.has(k.id) ? false : (c.add(k.id), true)));
    }
    if (i.length) {
      l = l.filter((c) => i.includes(nameFormatOf(c)));
    }
    a = l;
    poolCache.set(u, a);
  }
  return a;
}

function useGalleryPool(e: any, n: any, t: any, r: any, i: any, o: any, u: any, a: any) {
  const [d, l] = useState<any>({ key: "", list: [], pools: [], loading: true, error: false });
  const c = JSON.stringify([
    e.name,
    e.suffix,
    e.place ?? "",
    e.nameKind ?? "",
    e.ort2 ?? "",
    e.jahr ?? "",
    e.route ? `${e.route.territory}|${e.route.seed}|${JSON.stringify(e.route.axes)}` : "",
    e.styles,
    e.colorMoods,
    e.themes,
    n,
    t,
    r,
    i,
    o?.id ?? "",
    u,
    a,
  ]);
  useEffect(() => {
    let k = true;
    l((C: any) => ({ ...C, key: c, loading: true, error: false }));
    (async () => {
      const C: any[] = [];
      const m: any[] = [];
      for (let T = 0; T < t; T++) {
        const { pkg } = curatedPackage(T);
        let O = poolFor(e, n, pkg, r, i, a);
        for (let M = 1; i.length && O.length < DEFAULT_PAGE_SIZE * 2 && M <= 6; M++)
          O = [...O, ...poolFor(e, n, pkg + 100 + M, r, i, a)];
        const F = T === 0 && o ? o : null;
        const I = F ? [F, ...O.filter((M: any) => M.id !== F.id)] : O;
        if ((await fontStore.ensure(fontsNeeded(I, "logo", e)), !k)) return;
        C.push(
          ...curateConcepts(I, e, fontStore, DEFAULT_PAGE_SIZE, {
            exclude: C.map((M) => M.id),
            pinFirst: !!F,
          }),
        );
        m.push(I);
      }
      if (k) {
        l({ key: c, list: C, pools: m, loading: false, error: false });
      }
    })().catch((C) => {
      console.error(C);
      if (k) {
        l((m: any) => ({ ...m, key: c, loading: false, error: true }));
      }
    });
    return () => {
      k = false;
    };
  }, [c]);
  return { list: d.list, pools: d.pools, loading: d.loading || d.key !== c, error: d.error };
}

const idsKey = (e: any) => e.map((n: any) => n.id).join(",");

function thumbSvg(e: any, n: any) {
  return new Promise((t) => {
    enqueueRender(() => {
      try {
        t(renderLogoSvg(e, n, { variant: "color" }));
      } catch {
        t("");
      }
    });
  });
}

function useRanking(e: any, n: any, t: any, r: any, i: any, o: any) {
  const [u, a] = useState<any>(() => new Map<any, any>());
  const [d, l] = useState<any>(() => new Set<any>());
  const [, c] = useState(0);
  const k = useRef(0);
  const C = useRef(new Map<any, any>());
  const m = useRef(true);
  const T = useRef(new Set<any>());
  useEffect(
    () => (
      (m.current = true),
      () => {
        m.current = false;
      }
    ),
    [],
  );
  const $ = useMemo(
    () =>
      Array.from({ length: Math.ceil(t.length / DEFAULT_PAGE_SIZE) }, (w, y) =>
        t.slice(y * DEFAULT_PAGE_SIZE, (y + 1) * DEFAULT_PAGE_SIZE),
      ),
    [t],
  );
  useEffect(() => {
    const w = o.current;
    if (!w) return;
    const y = () => (k.current = performance.now());
    const A = ["pointerdown", "keydown", "wheel", "touchstart"];
    for (const S of A) w.addEventListener(S, y, { passive: true });
    return () => {
      for (const S of A) w.removeEventListener(S, y);
    };
  });
  useEffect(() => {
    const w = performance.now();
    for (const y of $) C.current.has(idsKey(y)) || C.current.set(idsKey(y), w);
  }, [$]);
  useEffect(() => {
    if (!e || !i) return;
    const w = t.map((y: any) => y.id);
    $.forEach((y, A) => {
      const S = idsKey(y);
      const j = r[A];
      if (!(!j || T.current.has(S) || y.length < DEFAULT_PAGE_SIZE)) {
        T.current.add(S);
        enqueueRender(() => {
          if (!m.current) return T.current.delete(S);
          let g: any[] = [];
          try {
            g = curateConcepts(j, n, fontStore, 18, { exclude: w });
          } catch {
            g = j.filter((P: any) => !w.includes(P.id));
          }
          const p = mergeCards(y, g);
          if (!p.length) return;
          const R = { sent: p, key: rankingKey(n, p) };
          a((P: any) => new Map(P).set(S, R));
          const K = n.styles[0] ?? y[0].style;
          perfMark(`ai:start:${R.key}`);
          rankOnce(R.key, () => buildRequest(n, K, p, (P: any) => thumbSvg(P, n))).then((P: any) => {
            perfMeasure("ai:ranking", `ai:start:${R.key}`);
            m.current &&
              (P && k.current <= (C.current.get(S) ?? 0) && l((G: any) => new Set(G).add(R.key)),
              c((G) => G + 1));
          });
        });
      }
    });
  }, [e, i, $, r]);
  const O: any[] = [];
  const F = new Map<any, any>();
  const I = new Set<any>();
  const M: any[] = [];
  let B = false;
  const _ = new Set<any>();
  $.forEach((w) => {
    const y = e ? u.get(idsKey(w)) : undefined;
    const A = y ? cachedRanking(y.key) : undefined;
    if (y && A === null) {
      B = true;
    }
    let S = w.filter((j: any) => !_.has(j.id));
    if (y && A && d.has(y.key)) {
      const j = applyRanking(y.sent, A, w.length, _);
      S = j.page;
      j.reasons.forEach((g, p) => F.set(p, g));
      for (const g of S) I.add(g.id);
    } else y && A && M.push(y.key);
    if (y && S.length < w.length)
      for (const j of y.sent) S.length < w.length && !_.has(j.id) && !S.includes(j) && S.push(j);
    for (const j of S) _.add(j.id);
    O.push(...S);
  });
  const N = () => l((w: any) => new Set([...w, ...M]));
  return {
    list: e ? O : t,
    reasons: F,
    aiIds: I,
    pending: e ? M.length : 0,
    unavailable: e && B,
    showAll: N,
  };
}

function useColumns() {
  const e = () => (innerWidth >= 1280 ? 3 : innerWidth >= 760 ? 2 : 1);
  const [n, t] = useState(e);
  useEffect(() => {
    const r = () => t(e());
    window.addEventListener("resize", r);
    return () => window.removeEventListener("resize", r);
  }, []);
  return n;
}

const ConceptCard = memo(function ({
  concept,
  no,
  input,
  dark,
  fav,
  focusable,
  tag,
  note,
  reason,
  aiIn,
  onOpen,
  onFav,
  onSimilar,
  onFocusCard,
  onKeyDown,
  index,
  onReady,
}: any) {
  const { ready } = useFontsReady([concept], input);
  const M = useMemo(
    () =>
      concept.cardBackground
        ? cardFace(concept)
        : dark
          ? { background: concept.palette.ink, variant: "reverse", ground: concept.palette.ink }
          : { background: concept.palette.paper, variant: "color" },
    [concept, dark],
  );
  const B = M.variant === "reverse";
  const _ = useMemo(() => ({ variant: M.variant, ground: M.ground }) as any, [M]);
  const { svg, error, fresh, retry } = useLogoSvg(concept, input, _, ready, "high");
  useEffect(() => {
    if (svg && onReady) {
      onReady(index);
    }
  }, [svg, onReady, index]);
  const S = padNumber(no);
  return (
    <article
      className={`logo-card${B ? " is-dark" : ""}${fav ? " is-fav" : ""}${aiIn ? " ai-in" : ""}`}
      style={{ background: M.background }}
      aria-label={`Konzept ${S}`}
      data-index={index}
      data-id={concept.id}
      data-signature={concept.signature ? "" : undefined}
      title={reason}
    >
      {!svg && !error && <div className="skeleton-fill riffel" aria-hidden="true" />}
      {error ? (
        <div className="card-error">
          <p>Konnte nicht gezeichnet werden.</p>
          <GhostButton onClick={retry}>Neu laden</GhostButton>
        </div>
      ) : (
        <button
          type="button"
          className={`open${B ? " on-dark" : ""}`}
          tabIndex={focusable ? 0 : -1}
          aria-label={`Konzept ${S} öffnen. ${describeConcept(concept, no)}`}
          onClick={() => onOpen(concept, no)}
          onFocus={onFocusCard}
          onKeyDown={onKeyDown}
          data-card
        >
          {svg ? (
            <div
              className={`logo-svg${fresh ? " is-fresh" : ""}`}
              role="img"
              aria-label={describeConcept(concept, no)}
              dangerouslySetInnerHTML={{ __html: svg }}
              style={
                fresh ? { animationDelay: `${(index % DEFAULT_PAGE_SIZE) * 40}ms` } : undefined
              }
            />
          ) : (
            <div className="logo-svg" aria-hidden="true" />
          )}
        </button>
      )}
      {tag && (
        <span className="chip-tag example-tag" aria-hidden="true">
          {tag}
        </span>
      )}
      {note && <span className="chip-tag example-tag sig-note">{note}</span>}
      <div className="card-actions">
        {onSimilar && (
          <button
            type="button"
            className="btn card-similar"
            tabIndex={focusable ? 0 : -1}
            onClick={() => onSimilar(concept, no)}
            aria-label={`Ähnliche wie Konzept ${S}`}
          >
            Ähnliche
          </button>
        )}
        <button
          type="button"
          className="icon-btn heart-btn"
          aria-pressed={fav}
          tabIndex={focusable ? 0 : -1}
          aria-label={fav ? `Konzept ${S} gemerkt` : `Konzept ${S} merken`}
          title={fav ? "Gemerkt" : "Merken"}
          onClick={() => onFav(concept, no)}
        >
          <HeartIcon on={fav} />
        </button>
      </div>
    </article>
  );
});

const WORDMARK_ONLY = "nur-schrift";

const FILTER_THEMES = [
  { value: WORDMARK_ONLY, label: "Nur Schrift" },
  ...[...ABSTRACT_THEMES, ...HOUSE_THEMES].map((e) => ({ value: e, label: (THEME_LABELS as Record<string, string>)[e] })),
];

function FilterChips({ label, options, values, onToggle }: any) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((i: any) => (
        <button
          key={i.value}
          type="button"
          className="chip"
          aria-pressed={values.includes(i.value)}
          aria-label={i.aria}
          onClick={() => onToggle(i.value)}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}

function FilterDialog({ open, project, formats, onClose, onApply }: any) {
  var C;
  const o = filtersOf(project);
  const u = (m: any, T: any) => (m.includes(T) ? m.filter(($: any) => $ !== T) : [...m, T]);
  const a = (m: any) => onApply({ ...o, ...m });
  const d = [...o.themes, ...(o.wordmarkOnly ? [WORDMARK_ONLY] : [])];
  const [l, c] = useState<any>(null);
  const k = useSettings();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Filter"
      size="mid"
      className="filter-dialog"
      footer={
        <>
          <TextButton
            onClick={() =>
              onApply({
                styles: [],
                colorMoods: [],
                themes: [],
                wordmarkOnly: false,
                nameFormats: [],
              })
            }
          >
            Alle zurücksetzen
          </TextButton>
          <Button onClick={onClose}>Fertig</Button>
        </>
      }
    >
      <FilterGroup
        id="stil"
        open={l}
        onOpen={c}
        title={`Stil${o.styles.length ? ` (${o.styles.length})` : ""}`}
      >
        <FilterChips
          label="Stil"
          options={STYLE_OPTIONS.map((m) => ({ value: m.key, label: m.title }))}
          values={o.styles}
          onToggle={(m: any) => a({ styles: u(o.styles, m) })}
        />
      </FilterGroup>
      <FilterGroup
        id="farbe"
        open={l}
        onOpen={c}
        title={`Farbe${o.colorMoods.length ? ` (${o.colorMoods.length})` : ""}`}
      >
        <FilterChips
          label="Farbe"
          options={COLOR_MOOD_KEYS.map((m) => ({
            value: m,
            aria: COLOR_MOODS[m].label,
            label: (
              <>
                <span className="swatches" aria-hidden="true">
                  <i style={{ background: COLOR_MOODS[m].swatch }} />
                </span>
                {COLOR_MOODS[m].label}
              </>
            ),
          }))}
          values={o.colorMoods}
          onToggle={(m: any) => a({ colorMoods: u(o.colorMoods, m) })}
        />
      </FilterGroup>
      <FilterGroup
        id="symbol"
        open={l}
        onOpen={c}
        title={`Symbol${d.length ? ` (${d.length})` : ""}`}
      >
        <FilterChips
          label="Symbol"
          options={FILTER_THEMES}
          values={d}
          onToggle={(m: any) =>
            a(m === WORDMARK_ONLY ? { wordmarkOnly: !o.wordmarkOnly } : { themes: u(o.themes, m) })
          }
        />
      </FilterGroup>
      {formats.length > 1 && (
        <FilterGroup
          id="namensform"
          open={l}
          onOpen={c}
          title={`Namensform${(C = o.nameFormats) != null && C.length ? ` (${o.nameFormats.length})` : ""}`}
        >
          <FilterChips
            label="Namensform"
            options={formats.map((m: any) => ({ value: m, label: NAME_FORMAT_LABELS[m] }))}
            values={o.nameFormats ?? []}
            onToggle={(m: any) => a({ nameFormats: u(o.nameFormats ?? [], m) })}
          />
        </FilterGroup>
      )}
      <FilterGroup
        id="ki"
        open={l}
        onOpen={c}
        title={`KI-Funktionen${k.kiFunktionen ? " (an)" : ""}`}
      >
        <KiConsent />
      </FilterGroup>
      {k.intern && (
        <FilterGroup id="intern" open={l} onOpen={c} title="Intern">
          <Switch
            checked={k.signatureEntwuerfe}
            onChange={(m: any) => updateSettings({ signatureEntwuerfe: m })}
          >
            Signature-Entwürfe zeigen (intern)
          </Switch>
        </FilterGroup>
      )}
    </Dialog>
  );
}

function FilterGroup({ id, title, open, onOpen, children: i }: any) {
  const o = open === id;
  return (
    <details
      className="disclosure filter-group"
      open={o}
      onToggle={(u) => {
        const a = u.currentTarget.open;
        if (a !== o) {
          onOpen(a ? id : null);
        }
      }}
    >
      <summary>{title}</summary>
      {o && <div className="disclosure-body">{i}</div>}
    </details>
  );
}

function filtersOf(e: any) {
  return {
    styles: e.input.styles,
    colorMoods: e.input.colorMoods,
    themes: e.input.themes,
    wordmarkOnly: e.wordmarkOnly,
    nameFormats: e.nameFormats,
  };
}

function activeFilters(e: any) {
  const n: any[] = [];
  const t = (i: any, o: any) => (i.length === 1 ? o(i[0]) : `${i.length} gewählt`);
  if (e.input.styles.length) {
    n.push({
      key: "stil",
      label: `Stil: ${t(e.input.styles, (i: any) => {
        return STYLE_OPTIONS.find((u) => u.key === i)?.title ?? i;
      })}`,
      clear: { styles: [] },
    });
  }
  if (e.input.colorMoods.length) {
    n.push({
      key: "farbe",
      label: `Farbe: ${t(e.input.colorMoods, (i: any) => {
        return (COLOR_MOODS as Record<string, any>)[i]?.label ?? i;
      })}`,
      clear: { colorMoods: [] },
    });
  }
  const r = [...e.input.themes, ...(e.wordmarkOnly ? [WORDMARK_ONLY] : [])];
  if (r.length) {
    n.push({
      key: "symbol",
      label: `Symbol: ${t(r, (i: any) => (i === WORDMARK_ONLY ? "Nur Schrift" : ((THEME_LABELS as Record<string, string>)[i] ?? i)))}`,
      clear: { themes: [], wordmarkOnly: false },
    });
  }
  if (e.nameFormats.length) {
    n.push({
      key: "form",
      label: `Namensform: ${t(e.nameFormats, (i: any) => NAME_FORMAT_LABELS[i] ?? i)}`,
      clear: { nameFormats: [] },
    });
  }
  return n;
}

function Gallery({ projectId, gemerkt }: any) {
  const { state, update, navigate, announce, requestPersist } = useStudio();
  const a = state.projects[projectId];
  const d = a.input;
  const l = Math.max(1, Math.round(a.ui.galleryCount / DEFAULT_PAGE_SIZE));
  const c = useColumns();
  const [k, C] = useState(false);
  const [m, T] = useState<any>([]);
  const [$, O] = useState(0);
  const [F, I] = useState(0);
  const M = useRef<any>(null);
  const B = useRef(0);
  const _ = useRef(0);
  const N = a.wordmarkOnly && d.themes.length > 0;
  const w = a.nameFormats;
  const y =
    a.pinned &&
    !a.wordmarkOnly &&
    !d.themes.length &&
    !d.colorMoods.length &&
    (!w.length || w.includes(nameFormatOf(a.pinned)))
      ? a.pinned
      : null;
  const A = useSettings();
  const S = A.intern && A.signatureEntwuerfe;
  const j = useGalleryPool(d, a.seed, N ? 0 : l, a.wordmarkOnly, w, y, F, S);
  const g = useRanking(
    A.kiFunktionen && !gemerkt && !N,
    d,
    N ? [] : j.list,
    j.pools,
    !j.loading,
    M,
  );
  const p = N ? [] : g.list;
  const R = j.error;
  const K = j.loading && !p.length;
  const P = useMemo(() => {
    try {
      const h = new Set<any>();
      for (const x of poolFor(d, a.seed, 0, a.wordmarkOnly, [])) h.add(nameFormatOf(x));
      return NAME_FORMATS.filter((x) => h.has(x));
    } catch {
      return [];
    }
  }, [d.name, d.suffix, d.place, d.styles, d.colorMoods, d.themes, a.seed, a.wordmarkOnly]);
  const G = useRef(p.length);
  useEffect(() => {
    if (p.length > G.current) {
      announce(`${p.length - G.current} neue Vorschläge geladen.`);
    }
    G.current = p.length;
  }, [p.length, announce]);
  const re = useRef(new Set<any>());
  const De = useCallback((h: any) => {
    h >= DEFAULT_PAGE_SIZE ||
      re.current.size >= DEFAULT_PAGE_SIZE ||
      (re.current.add(h),
      re.current.size === DEFAULT_PAGE_SIZE && perfMeasure("gallery:first12", "style:tap"));
  }, []);
  const q = useCallback(
    (h: any, x: any) => {
      const v = isFavorite(a, h.id);
      update(projectId, (b: any) => toggleFavorite(b, h, x));
      if (!v) {
        announce(`Konzept ${x} gemerkt.`);
        requestPersist();
      }
    },
    [a, projectId, update, announce, requestPersist],
  );
  const oe = useCallback(
    (h: any, x: any) => {
      update(projectId, (v: any) => ({
        ...startEditing(v, h, x),
        ui: { ...v.ui, lastConceptIndex: x - 1 },
      }));
      navigate({ name: "logo", id: projectId, conceptId: h.id, tab: a.ui.editorTab ?? "symbol" });
    },
    [projectId, update, navigate, a.ui.editorTab],
  );
  const ye = useCallback(
    (h: any, x: any) => {
      const v = editorVariants(h, d, 6);
      const b = Math.max(
        p.length,
        ...(Object.values(a.numbers) as number[]),
        ...m.flatMap((L: any) => L.items.map((V: any) => V.no)),
      );
      const D = v.map((L, V) => ({ concept: L, no: b + V + 1 }));
      B.current += 1;
      const E = { sourceId: h.id, sourceNo: x, items: D, key: B.current };
      _.current = E.key;
      T((L: any) => [E, ...L]);
      announce("6 ähnliche Logos eingefügt.");
    },
    [d, p.length, a.numbers, m, announce],
  );
  const Pe = () =>
    update(
      projectId,
      (h: any) => ({
        ...h,
        ui: {
          ...h.ui,
          galleryCount:
            (Math.max(1, Math.round(h.ui.galleryCount / DEFAULT_PAGE_SIZE)) + 1) *
            DEFAULT_PAGE_SIZE,
        },
      }),
      false,
    );
  const U = gemerkt ? null : p;
  const Ve = (h: any) => {
    const x = M.current?.querySelector(`[data-index="${h}"] [data-card]`);
    x?.focus();
  };
  const Ge = (h: any, x: any, v: any) => (b: any) => {
    const D = U ?? [];
    let E = h;
    if (b.key === "ArrowRight") E = h + 1;
    else if (b.key === "ArrowLeft") E = h - 1;
    else if (b.key === "ArrowDown") E = h + c;
    else if (b.key === "ArrowUp") E = h - c;
    else if (b.key === "Home") E = 0;
    else if (b.key === "End") E = D.length - 1;
    else if (b.key === "m" || b.key === "M") {
      b.preventDefault();
      q(x, v);
      return;
    } else if ((b.key === "v" || b.key === "V") && !gemerkt) {
      b.preventDefault();
      ye(x, v);
      return;
    } else return;
    b.preventDefault();
    E = Math.max(0, Math.min(D.length - 1, E));
    O(E);
    Ve(E);
  };
  const xe = (h: any) => h % 5 === 1 || h % 5 === 3;
  const X = useMemo(() => {
    const h: any[] = [];
    if (
      a.selected &&
      !a.favorites.some((x: any) => {
        return x.id === a.selected?.id;
      })
    ) {
      h.push({ concept: a.selected, no: a.numbers[a.selected.id] ?? 0, tag: "DEIN LOGO" });
    }
    for (const x of a.favorites) h.push({ concept: x, no: a.numbers[x.id] ?? 0 });
    return h;
  }, [a.favorites, a.selected, a.numbers]);
  const ke = (h: any) =>
    navigate({ name: "auswahl", id: projectId, gemerkt: h }, { replace: true });
  const He = () => {
    if (!U) return null;
    const h = new Map<any, any>();
    for (const v of m) {
      const b = U.findIndex((E: any) => E.id === v.sourceId);
      if (b < 0) continue;
      const D = Math.min(U.length - 1, Math.floor(b / c) * c + c - 1);
      h.set(D, [...(h.get(D) ?? []), v]);
    }
    const x: any[] = [];
    U.forEach((v: any, b: any) => {
      x.push(
        <ConceptCard
          key={v.id + b}
          index={b}
          concept={v}
          no={b + 1}
          input={d}
          dark={xe(b)}
          fav={isFavorite(a, v.id)}
          focusable={b === $}
          note={A.intern && v.signature ? `Vorlage ${v.signature.id}` : undefined}
          reason={g.reasons.get(v.id)}
          aiIn={g.aiIds.has(v.id)}
          onOpen={oe}
          onFav={q}
          onSimilar={ye}
          onFocusCard={() => O(b)}
          onReady={De}
          onKeyDown={Ge(b, v, b + 1)}
        />,
      );
      const D = h.get(b);
      if (D)
        for (const E of D)
          x.push(
            <section
              key={`s${E.key}`}
              className="similar-block"
              aria-labelledby={`similar-${E.key}`}
            >
              <div className="head">
                <h2
                  className="h2"
                  id={`similar-${E.key}`}
                  tabIndex={-1}
                  ref={(L) => {
                    if (L && _.current === E.key) {
                      _.current = 0;
                      L.focus({ preventScroll: true });
                      L.scrollIntoView({ block: "start", behavior: "auto" });
                    }
                  }}
                >
                  {"Ähnlich wie Konzept "}
                  {padNumber(E.sourceNo)}
                </h2>
                <TextButton onClick={() => T((L: any) => L.filter((V: any) => V.key !== E.key))}>
                  <span className="glyph" aria-hidden="true">
                    ×
                  </span>{" "}
                  Schließen
                </TextButton>
              </div>
              <div className="similar-grid">
                {E.items.map((L: any, V: any) => (
                  <ConceptCard
                    key={L.concept.id}
                    index={V}
                    concept={L.concept}
                    no={L.no}
                    input={d}
                    dark={xe(V)}
                    fav={isFavorite(a, L.concept.id)}
                    focusable
                    onOpen={oe}
                    onFav={q}
                  />
                ))}
              </div>
            </section>,
          );
    });
    return x;
  };
  const Y = activeFilters(a);
  const ie = (h: any) => {
    update(projectId, (x: any) => applyFilters(x, h));
    T([]);
  };
  return (
    <div className="container screen gallery-screen">
      <div className="gallery-head">
        <h1 className="h1" data-title="Auswahl">
          {gemerkt ? "Gemerkte Logos" : "Deine Logos"}
        </h1>
        <div className="gallery-tools">
          {!gemerkt && (
            <TextButton onClick={() => C(true)} aria-haspopup="dialog" className="filter-btn">
              Filter{Y.length ? ` (${Y.length})` : ""}
            </TextButton>
          )}
          {(gemerkt || X.length > 0) && (
            <TextButton onClick={() => ke(!gemerkt)} aria-pressed={gemerkt}>
              {gemerkt ? "Alle Vorschläge" : `Gemerkt (${X.length})`}
            </TextButton>
          )}
        </div>
      </div>
      {!gemerkt && Y.length > 0 && (
        <div className="chips active-filters" role="group" aria-label="Gesetzte Filter">
          {Y.slice(0, 4).map((h) => (
            <button
              key={h.key}
              type="button"
              className="chip"
              onClick={() => ie({ ...filtersOf(a), ...h.clear })}
              aria-label={`${h.label} entfernen`}
            >
              {h.label}
              <svg
                width="14"
                height="14"
                viewBox="0 0 18 18"
                aria-hidden="true"
                focusable="false"
                className="chip-x"
              >
                <path
                  d="M4 4 14 14M14 4 4 14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ))}
        </div>
      )}
      {gemerkt ? (
        X.length ? (
          <div className="gallery-grid">
            {X.map((h, x) => (
              <ConceptCard
                key={h.concept.id}
                index={x}
                concept={h.concept}
                no={h.no}
                input={d}
                dark={false}
                fav={isFavorite(a, h.concept.id) || !!h.tag}
                focusable
                tag={h.tag}
                onOpen={(v: any, b: any) => {
                  if (h.tag && a.editing && a.selectedBaseId) {
                    navigate({
                      name: "logo",
                      id: projectId,
                      conceptId: a.selectedBaseId,
                      tab: a.ui.editorTab,
                    });
                    return;
                  }
                  oe(v, b);
                }}
                onFav={(v: any, b: any) => (h.tag ? undefined : q(v, b))}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h2 className="h2">Noch nichts gemerkt.</h2>
            <p>Tippe bei einem Logo auf das Herz. So findest du deine Favoriten hier wieder.</p>
            <GhostButton onClick={() => ke(false)}>Alle Vorschläge ansehen</GhostButton>
          </div>
        )
      ) : R ? (
        <div className="empty-state" role="alert">
          <p>
            Die Vorschläge konnten nicht geladen werden. Prüf deine Verbindung und versuch es noch
            einmal.
          </p>
          <GhostButton onClick={() => I((h) => h + 1)}>Erneut versuchen</GhostButton>
        </div>
      ) : K ? (
        <div
          className="gallery-grid"
          aria-busy="true"
          aria-label="Logo-Vorschläge werden entworfen"
        >
          {Array.from({ length: DEFAULT_PAGE_SIZE }, (h, x) => (
            <div key={x} className="logo-card riffel skeleton-card" aria-hidden="true" />
          ))}
        </div>
      ) : N || !p.length ? (
        <div className="empty-state">
          <p>Zu dieser Kombination finden wir keine Logos. Lockere einen Filter.</p>
          <GhostButton
            onClick={() =>
              ie({
                styles: a.input.styles,
                colorMoods: [],
                themes: [],
                wordmarkOnly: false,
                nameFormats: [],
              })
            }
          >
            Filter zurücksetzen
          </GhostButton>
        </div>
      ) : (
        <>
          {g.pending > 0 && (
            <div className="ai-ready row" role="status">
              <span className="small">KI-Vorauswahl bereit.</span>
              <TextButton onClick={g.showAll}>Anzeigen</TextButton>
            </div>
          )}
          {g.unavailable && (
            <p className="small muted ai-off" role="status">
              KI-Vorauswahl gerade nicht verfügbar.
            </p>
          )}
          <div
            ref={M}
            className="gallery-grid"
            aria-busy={j.loading}
            aria-label="Logo-Vorschläge"
            role="region"
          >
            {He()}
          </div>
          <div className="gallery-more">
            <Button onClick={Pe} aria-disabled={j.loading}>
              {j.loading ? "Wird entworfen ..." : "6 weitere Vorschläge"}
            </Button>
          </div>
        </>
      )}
      {!gemerkt && !a.fromFinder && <NameProbeFold project={a} />}
      <FilterDialog open={k} project={a} formats={P} onClose={() => C(false)} onApply={ie} />
    </div>
  );
}

export default Gallery;
