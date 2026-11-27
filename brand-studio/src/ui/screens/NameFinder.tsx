/**
 * Startseite: Namensfinder mit Namenskarten als fertige Logos.
 * Gesicherte Fassung: NameFinder-Chunk (ds).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fallbackCard, nameCards } from "../../engine/nameCardSet";
import { similarNames } from "../../engine/names";
import {
  BATCH_SIZE,
  DISLIKE_REASONS,
  LEARN_AFTER,
  NAME_CHIPS,
  batchSeed,
  fromSaved,
  generateBatches,
  inputFromForm,
  splitList,
  toSaved,
} from "../../engine/names/finder";
import { kiNamen, requestFromForm } from "../../namen/kiNamen";
import { Button, GhostButton, TextButton } from "../components/Buttons";
import { ActionBar, ChipGroup, ChipToggles, Field, Segmented } from "../components/Controls";
import { Dialog } from "../components/Dialog";
import { KiConsent } from "../components/KiConsent";
import { KompassEntry } from "../components/KompassEntry";
import { NameCard, Sentinel } from "../components/NameCard";
import { NameDetail } from "../components/NameDetail";
import { PlaceField } from "../components/PlaceField";
import { STYLE_OPTIONS } from "../logic/describe";
import { rememberStart } from "../logic/kompassDraft";
import {
  clearFinderState,
  finderPrefs,
  isFinderComplete,
  loadFinderState,
  saveFinderState,
} from "../logic/nameDraft";
import {
  CREATIVITY_OPTIONS,
  FOCUS_OPTIONS,
  REGISTRY_KEY,
  formKey,
  readRegistry,
  useIsWide,
  writeRegistry,
} from "../logic/nameFinder";
import { chooseStyle, createProject, nameContextOf, suffixChoiceOf } from "../logic/project";
import { useSettings } from "../logic/settings";
import { plainDashes } from "../logic/text";
import { useStudio } from "../store";

function DislikeDialog({ name, onSend, onClose }: any) {
  const [k, b] = useState("");
  const [_, g] = useState("");
  return (
    <Dialog
      open
      onClose={onClose}
      title="Was passt nicht?"
      sub={`Zu „${name}“. Bleibt in deinem Browser. Damit lernen die nächsten Vorschläge.`}
      footer={
        <div className="row" style={{ justifyContent: "flex-end", gap: 12 }}>
          <TextButton onClick={onClose}>Überspringen</TextButton>
          <Button onClick={() => onSend(k || null, _.trim())}>Senden</Button>
        </div>
      }
    >
      <div className="reason-body">
        <ChipGroup
          options={DISLIKE_REASONS.map((p) => ({ value: p, label: p }))}
          value={k}
          onChange={b}
          label="Grund"
        />
        <Field
          label="EIGENE WORTE (OPTIONAL)"
          maxLength={120}
          value={_}
          onChange={(p: any) => g(plainDashes(p.target.value))}
        />
      </div>
    </Dialog>
  );
}

function NameFinder({ route }: any) {
  const { navigate, put, toast, announce, requestPersist } = useStudio();
  const { gemerkt } = route;
  const p = useIsWide();
  const [t, Je] = useState(loadFinderState);
  const [je, M] = useState(false);
  const [Ye, ie] = useState<any>(() => !loadFinderState().submitted);
  const [re, le] = useState<any>(null);
  const ye = useRef<any>(null);
  const Ce = useRef<any>(null);
  const c = useCallback((e: any) => {
    Je((n: any) => {
      const a = e(n);
      saveFinderState(a);
      return a;
    });
  }, []);
  const oe = useRef(t);
  oe.current = t;
  const [d, Q] = useState<any>(() => {
    const e = loadFinderState();
    return e.submitted && isFinderComplete(e) ? { key: formKey(e), d: e } : null;
  });
  const ce = useCallback(
    (e: any) => {
      c((n: any) => {
        const a: any = {
          ...n,
          seed: e ? (n.seed * 1103515245 + 12345) >>> 0 : n.seed,
          submitted: true,
        };
        a.batches = [finderPrefs(a)];
        Q({ key: formKey(a), d: a });
        return a;
      });
    },
    [c],
  );
  useEffect(() => {
    if (!p || !isFinderComplete(t) || (d && d.key === formKey(t))) return;
    const e = setTimeout(() => ce(false), 400);
    return () => clearTimeout(e);
  }, [p, formKey(t)]);
  const y = useMemo(() => (d && d.d.style !== "egal" ? [d.d.style] : []), [d]);
  const C = useMemo(() => (d ? inputFromForm(d.d) : null), [d]);
  const X = t.batches.length ? t.batches : d ? [finderPrefs(d.d)] : [];
  const Qe = JSON.stringify(X);
  const v = useMemo(
    () => (d && C ? generateBatches(C, { ...d.d, seed: t.seed }, X) : []),
    [d, C, t.seed, Qe],
  );
  const Se = useMemo(() => new Set(t.hidden.map((e: any) => e.id)), [t.hidden]);
  const we = useMemo(
    () => new Set(t.hidden.map((e: any) => e.name.toLocaleLowerCase("de-AT"))),
    [t.hidden],
  );
  const z = useCallback((e: any) => Se.has(e.id) || we.has(e.name.toLocaleLowerCase("de-AT")), [Se, we]);
  const N = useMemo(() => v.flat().filter((e) => !z(e)), [v, z]);
  const ee = v.reduce((e, n) => e + n.length, 0);
  const ne = useSettings();
  const D = ne.kiFunktionen && d && C ? JSON.stringify([d.key, t.seed]) : null;
  const [L, Xe] = useState<any>(null);
  useEffect(() => {
    if (!D || !d || !C) return;
    const e = requestFromForm(
      d.d,
      (v[0] ?? []).map((a) => a.name),
      t.saved.map((a: any) => a.name),
    );
    if (!e) return;
    let n = true;
    kiNamen(D, e, C).then((a) => n && Xe({ key: D, items: a }));
    return () => {
      n = false;
    };
  }, [D]);
  const O = useMemo(() => {
    if (!L || L.key !== D || !L.items) return [];
    const e = new Set(N.map((n) => n.name.toLocaleLowerCase("de-AT")));
    return L.items.filter((n: any) => !z(n) && !e.has(n.name.toLocaleLowerCase("de-AT"))).slice(0, 12);
  }, [L, D, N, z]);
  const en = !!L && L.key === D && L.items === null;
  const nn = v.length > 0 && v[v.length - 1]!.length < BATCH_SIZE;
  const de = useRef(0);
  useEffect(() => {
    if (ee > de.current) {
      announce(`${ee - de.current} Namensvorschläge geladen.`);
    }
    de.current = ee;
  }, [ee, announce]);
  const B = useRef(new Map<any, any>());
  const [, sn] = useState(0);
  const q = ne.intern && ne.signatureEntwuerfe;
  const F = d?.d.route?.params;
  const H = (e: any) =>
    `${e}|${y.join(",")}|${q ? "e" : ""}|${F ? `${F.territory}|${F.seed}` : ""}`;
  const ue = useCallback((e: any) => B.current.get(H(e.id)) ?? null, [y, q, F]);
  const se = useCallback(
    (e: any) => {
      const n = e.filter((l: any) => !B.current.has(H(l.s.id)));
      if (!n.length) return () => {};
      let a = 0;
      const m = requestAnimationFrame(() => {
        a = window.setTimeout(() => {
          const l = new Map<any, any>();
          for (const o of n)
            B.current.has(H(o.s.id)) || l.set(o.seed, [...(l.get(o.seed) ?? []), o.s]);
          for (const [o, T] of l) {
            let x: any[] = [];
            try {
              x = nameCards(T, o, y, q, F);
            } catch (j) {
              console.warn("Namenskarten ohne finale Logos", j);
            }
            T.forEach((j: any, Ke: any) => B.current.set(H(j.id), x[Ke] ?? fallbackCard(j, Ke, o, y)));
          }
          sn((o) => o + 1);
        }, 0);
      });
      return () => {
        cancelAnimationFrame(m);
        clearTimeout(a);
      };
    },
    [y, q, F],
  );
  const U = useMemo(() => t.saved.map(fromSaved), [t.saved]);
  const tn = gemerkt ? U : N;
  useEffect(() => {
    const e: any[] = [];
    v.forEach((n, a) => n.forEach((m, l) => e.push({ s: m, i: l, seed: batchSeed(t.seed, a) })));
    U.forEach((n: any, a: any) => e.push({ s: n, i: a, seed: batchSeed(t.seed, 99) }));
    O.forEach((n: any, a: any) => e.push({ s: n, i: a, seed: batchSeed(t.seed, 500) }));
    return se(e);
  }, [v, U, O, t.seed, se]);
  const A = useRef(readRegistry());
  for (const e of N) A.current.set(e.id, e);
  for (const e of O) A.current.set(e.id, e);
  for (const e of U) A.current.has(e.id) || A.current.set(e.id, e);
  const he = useMemo(() => new Set(t.saved.map((e: any) => e.id)), [t.saved]);
  const an = finderPrefs(t).liked.length;
  const Ee = () => {
    if (!isFinderComplete(t)) {
      M(true);
      ie(true);
      setTimeout(() => {
        return ye.current?.focus();
      }, 30);
      announce(
        "Gib mindestens deinen Namen, deine Region oder ein Stichwort ein. Dann passen die Vorschläge zu dir.",
        true,
      );
      return;
    }
    M(false);
    ce(t.submitted);
    if (!p) {
      ie(false);
      setTimeout(() => {
        return Ce.current?.focus();
      }, 60);
    }
  };
  const Le = useCallback(
    (e: any) => {
      const n = oe.current.saved.some((a: any) => a.id === e.id);
      c((a: any) => ({
        ...a,
        saved: n
          ? a.saved.filter((m: any) => m.id !== e.id)
          : [...a.saved.filter((m: any) => m.id !== e.id), toSaved(e)],
      }));
      if (!n) {
        announce(`„${e.name}“ gemerkt.`);
        requestPersist();
      }
    },
    [c, announce, requestPersist],
  );
  const rn = (e: any) => {
    const n = Array.from(document.querySelectorAll<HTMLElement>(".nf-main .wm-card"));
    const a = n.findIndex((l) => l.dataset.id === e);
    const m = n[a + 1] ?? n[a - 1];
    requestAnimationFrame(() => {
      return m?.querySelector<HTMLElement>(".wm-open")?.focus();
    });
  };
  const Ae = useCallback(
    (e: any) => {
      rn(e.id);
      c((n: any) => ({
        ...n,
        hidden: [...n.hidden.filter((a: any) => a.id !== e.id), { id: e.id, name: e.name }],
        saved: n.saved.filter((a: any) => a.id !== e.id),
      }));
      announce(`„${e.name}“ ausgeblendet.`);
      toast(
        "Ausgeblendet. Wir zeigen dir weniger davon.",
        {
          label: "Rückgängig",
          run: () => c((n: any) => ({ ...n, hidden: n.hidden.filter((a: any) => a.id !== e.id) })),
        },
        { label: "Grund angeben", run: () => le(e) },
      );
    },
    [c, announce, toast],
  );
  const ln = (e: any, n: any, a: any) => {
    c((m: any) => {
      const l: any = {
        ...m,
        hidden: m.hidden.map((x: any) =>
          x.id === e.id
            ? { ...x, reason: [n, a].filter(Boolean).join(": ").slice(0, 120) || undefined }
            : x,
        ),
      };
      const o = e.name.replace(/[^\p{L}]/gu, "").length;
      if (
        (n === "Zu lang" && (l.lenCap = Math.max(5, Math.min(l.lenCap ?? 25, o - 2))),
        n === "Zu verspielt" &&
          (l.damp = [...new Set([...l.damp, "markenfaehig", "abgewandelt", "satz"])]),
        n === "Gibt es schon")
      ) {
        const x = e.name
          .split(/[\s&-]+/)
          .find((j: any) => j.length >= 4)
          ?.toLocaleLowerCase("de-AT");
        if (x) {
          l.autoExclude = [...new Set([...l.autoExclude, x])].slice(0, 20);
        }
      }
      return l;
    });
    le(null);
    toast("Danke. Die nächsten Vorschläge berücksichtigen das.");
  };
  const on = () => {
    c((e: any) => {
      const n: any = {
        ...e,
        learnIgnore: e.saved.map((a: any) => a.id),
        lenCap: null,
        damp: [],
        autoExclude: [],
      };
      n.batches = [finderPrefs(n)];
      Q((a: any) => a && { ...a, d: { ...a.d } });
      return n;
    });
    announce("Gewichtung zurückgesetzt.");
  };
  const Ie = useCallback(() => {
    c((e: any) =>
      e.batches.length >= 50
        ? e
        : { ...e, batches: [...(e.batches.length ? e.batches : [finderPrefs(e)]), finderPrefs(e)] },
    );
  }, [c]);
  const cn = useCallback(
    (e: any, n = "at") => {
      try {
        navigator.clipboard?.writeText(e).catch(() => {});
      } catch {}
      window.open(
        n === "com" ? "https://lookup.icann.org" : "https://www.nic.at",
        "_blank",
        "noopener,noreferrer",
      );
      toast(
        n === "com"
          ? `„${e}“ kopiert. Füge die Adresse bei ICANN Lookup ins Suchfeld ein.`
          : `„${e}“ kopiert. Füge die Adresse bei nic.at ins Suchfeld ein.`,
      );
    },
    [toast],
  );
  const dn = (e: any, n: any) => {
    const a = suffixChoiceOf(e.suffix);
    const m = e.kind === "person" ? "person" : t.company.trim() ? "company" : undefined;
    const l = inputFromForm(t);
    let o = createProject({
      rawName: e.name,
      suffixChoice: a.choice,
      customSuffix: a.custom,
      keepLegalForm: true,
      nameKind: m,
      place: l.region,
    });
    const T = nameContextOf(l);
    o = {
      ...o,
      nameCandidates: t.saved.map((j: any) => ({ name: j.name, descriptor: j.suffix, kind: j.kind })),
      ...(T ? { nameContext: T } : {}),
      fromFinder: true,
    };
    if (t.route) {
      o = {
        ...o,
        route: t.route,
        input: { ...o.input, route: t.route.params },
        ...(t.brief ? { brief: t.brief } : {}),
      };
    }
    const x = n ? n.style : t.style === "egal" ? null : t.style;
    if (x) {
      o = chooseStyle(o, x);
    }
    if (n) {
      o = { ...o, pinned: n, favorites: [n], numbers: { [n.id]: 1 } };
    }
    put(o);
    clearFinderState();
    try {
      sessionStorage.removeItem(REGISTRY_KEY);
    } catch {}
    navigate({ name: "name", id: o.id }, { replace: true });
    navigate(x ? { name: "auswahl", id: o.id, gemerkt: false } : { name: "stil", id: o.id });
  };
  const S = { name: "names", gemerkt, kinds: route.kinds };
  const me = useCallback(
    (e: any, n: any) => navigate({ ...S, detail: e.id, mehr: n || undefined }),
    [navigate, gemerkt],
  );
  const un = useCallback((e: any) => me(e, true), [me]);
  const [hn, mn] = useState<any>([]);
  useEffect(() => {
    const e = route.detail;
    mn((n: any) => {
      if (!e) return [];
      const a = n.indexOf(e);
      return a >= 0 ? n.slice(0, a + 1) : route.mehr && n.length ? [...n, e] : [e];
    });
  }, [route.detail, route.mehr]);
  const u = route.detail ? A.current.get(route.detail) : undefined;
  const fe = useRef<any>(undefined);
  useEffect(() => {
    if (route.detail) {
      fe.current = route.detail;
      return;
    }
    const e = fe.current;
    if (e) {
      fe.current = undefined;
      requestAnimationFrame(() => {
        return document.querySelector<HTMLElement>(`.wm-card[data-id="${CSS.escape(e)}"] .wm-open`)?.focus();
      });
    }
  }, [route.detail]);
  useEffect(() => {
    if (route.detail && !u) {
      navigate(S, { replace: true });
    }
  }, [route.detail, u]);
  const [te, Te] = useState(1);
  useEffect(() => Te(1), [route.detail]);
  const w = useMemo(() => {
    if (!u || !C) return [];
    const e = finderPrefs(t);
    const n: any[] = [];
    for (let a = 0; a < te; a++)
      n.push(
        ...similarNames(u, C, BATCH_SIZE, {
          page: a,
          creativity: "direkt",
          exclude: [...splitList(t.exclude), ...e.autoExclude],
          disliked: e.disliked,
        }),
      );
    return n.filter((a) => !z(a));
  }, [u, C, te, z]);
  for (const e of w) A.current.set(e.id, e);
  useEffect(() => writeRegistry(A.current));
  const Re = u ? batchSeed(t.seed, 1e3 + (u.id.length % 7)) : 0;
  useEffect(() => se(w.map((e, n) => ({ s: e, i: n, seed: Re }))), [w, Re, se]);
  const Me = useRef(0);
  useEffect(() => {
    if (u && w.length && w.length !== Me.current) {
      announce(`Varianten von „${u.name}“ geladen.`);
    }
    Me.current = w.length;
  }, [w.length, u, announce]);
  if (u && !B.current.has(H(u.id))) {
    B.current.set(
      H(u.id),
      nameCards([u], batchSeed(t.seed, 0), y, q, F)[0] ??
        fallbackCard(u, 0, batchSeed(t.seed, 0), y),
    );
  }
  const Z = gemerkt ? U : N;
  const I = u ? Z.findIndex((e: any) => e.id === u.id) : -1;
  const fn = p || Ye;
  const gn = [t.person, t.region, t.keywords].filter((e) => e.trim()).join(" · ");
  const J = t.maxLength ?? 25;
  const ge = (e: any) => c((n: any) => ({ ...n, maxLength: e >= 25 ? null : Math.max(5, e) }));
  const De = CREATIVITY_OPTIONS.find((e) => e.key === t.creativity)?.hint;
  const [Fe, $] = useState<any>(null);
  const ze =
    (t.company.trim() ? 1 : 0) +
    t.focus.length +
    (t.style !== "egal" ? 1 : 0) +
    (t.creativity !== "ausgewogen" ? 1 : 0) +
    (t.exclude.trim() ? 1 : 0) +
    (t.maxLength ? 1 : 0) +
    (t.description.trim() ? 1 : 0);
  const pn = (
    <form
      className="nf-bar"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        Ee();
      }}
    >
      <Field
        ref={ye}
        label="DEIN NAME"
        autoComplete="name"
        autoCapitalize="words"
        placeholder="z. B. Anna Berger"
        value={t.person}
        onChange={(e: any) => {
          M(false);
          c((n: any) => ({ ...n, person: plainDashes(e.target.value) }));
        }}
        aria-describedby={je ? "nf-error" : undefined}
      />
      <PlaceField
        label="REGION"
        placeholder="z. B. Döbling"
        value={t.region}
        onChange={(e: any) => {
          M(false);
          c((n: any) => ({ ...n, region: e }));
        }}
      />
      <Field
        label="STICHWORTE"
        placeholder="z. B. Altbau, Familie"
        maxLength={60}
        value={t.keywords}
        onChange={(e: any) => {
          M(false);
          c((n: any) => ({ ...n, keywords: plainDashes(e.target.value) }));
        }}
      />
      {p && (
        <div className="nf-submit">
          <Button type="submit">Vorschlagen</Button>
        </div>
      )}
      <button type="submit" hidden />
    </form>
  );
  const bn = ["personenmarke", "ortsbezug", "zusammengesetzt"];
  const Oe = NAME_CHIPS.filter((e) =>
    e.needs === "person"
      ? !!t.person.trim()
      : e.needs === "region"
        ? !!(t.region.trim() || t.description.trim())
        : true,
  );
  const xn = Oe.filter((e) => bn.includes(e.slug));
  const pe = (e: any) =>
    c((n: any) => {
      const a: any = {
        ...n,
        chips:
          e === "alle"
            ? []
            : n.chips.includes(e)
              ? n.chips.filter((m: any) => m !== e)
              : [...n.chips, e],
      };
      if (!p && a.submitted && isFinderComplete(a)) {
        a.batches = [finderPrefs(a)];
        Q({ key: formKey(a), d: a });
      }
      return a;
    });
  const vn = t.chips.length
    ? t.chips.length === 1
      ? (NAME_CHIPS.find((e) => e.slug === t.chips[0])?.label ?? "1 gewählt")
      : `${t.chips.length} gewählt`
    : "Alle";
  const kn = (e: any) =>
    navigate({ name: "names", gemerkt: e, kinds: route.kinds }, { replace: true });
  const Nn = d && !gemerkt && N.length === 0 && splitList(t.exclude).length > 0;
  const ae = (e: any) => (
    <NameCard
      key={e.id}
      s={e}
      concept={ue(e)}
      intern={ne.intern}
      styles={y}
      saved={he.has(e.id)}
      desktop={p}
      onOpen={me}
      onSave={Le}
      onHide={Ae}
      onMore={un}
    />
  );
  const jn = (
    <div className="nf-tools">
      <div className="chips nf-quick" role="group" aria-label="Namensart, schnell">
        {xn.map((e) => (
          <button
            key={e.slug}
            type="button"
            className="chip"
            aria-pressed={t.chips.includes(e.slug)}
            onClick={() => pe(e.slug)}
          >
            {e.label}
          </button>
        ))}
      </div>
      <TextButton onClick={() => $("art")} aria-haspopup="dialog">
        {"Namensart: "}
        {vn}
      </TextButton>
      <TextButton onClick={() => $("fein")} aria-haspopup="dialog">
        Feiner einstellen{ze ? ` (${ze})` : ""}
      </TextButton>
    </div>
  );
  const yn = (
    <section className="nf-results" aria-labelledby="nf-results-h">
      <div className="nf-results-head">
        <h2 className="h2" id="nf-results-h" ref={Ce} tabIndex={-1}>
          {gemerkt ? "Gemerkte Namen" : "Deine Namensvorschläge"}
        </h2>
        {(gemerkt || t.saved.length > 0) && (
          <TextButton onClick={() => kn(!gemerkt)} aria-pressed={gemerkt}>
            {gemerkt ? "Alle Vorschläge" : `Gemerkt (${t.saved.length})`}
          </TextButton>
        )}
      </div>
      {!gemerkt && jn}
      {an >= 3 && !gemerkt && (
        <p className="small nf-learn">
          {"Vorschläge angepasst an deine Favoriten. "}
          <TextButton onClick={on}>Zurücksetzen</TextButton>
        </p>
      )}
      {gemerkt ? (
        t.saved.length ? (
          <div className="wm-grid nf-list">{tn.map(ae)}</div>
        ) : (
          <div className="empty-state">
            <p>Noch keinen Namen gemerkt. Tippe bei einem Vorschlag auf das Herz.</p>
          </div>
        )
      ) : d ? (
        Nn ? (
          <div className="empty-state">
            <p>
              Mit deiner Ausschlussliste bleibt kaum etwas übrig. Nimm ein Wort heraus oder stell
              die Kreativität auf „Frei“.
            </p>
          </div>
        ) : N.length === 0 ? (
          <div className="empty-state">
            <p>
              Mit deinen Angaben finden wir für diese Namensart nichts. Probier eine andere oder
              ergänze ein Stichwort.
            </p>
            <GhostButton onClick={() => pe("alle")}>Alle Namensarten zeigen</GhostButton>
          </div>
        ) : (
          <>
            <div className="wm-grid nf-list nf-main">
              {(v[0] && O.length ? N.slice(0, v[0].length) : N).map(ae)}
              {O.length > 0 && (
                <>
                  <h3 className="label nf-ki-head">IDEEN DER KI</h3>
                  {O.map(ae)}
                  {N.slice(v[0]!.length).map(ae)}
                </>
              )}
            </div>
            {en && (
              <p className="small muted ai-off" role="status">
                KI-Namensideen gerade nicht verfügbar.
              </p>
            )}
            {!nn &&
              (X.length < LEARN_AFTER ? (
                <Sentinel key={X.length} onHit={Ie} />
              ) : (
                <div className="gallery-more">
                  <GhostButton onClick={Ie}>24 weitere Namen</GhostButton>
                </div>
              ))}
          </>
        )
      ) : (
        <div className="nf-empty">
          <p className="small">
            Hier erscheinen deine Namen, jeder gleich als fertiger Schriftzug.
          </p>
        </div>
      )}
    </section>
  );
  return (
    <div className="container screen nf-screen">
      <div className="nf-entry">
        <a
          className="back-link"
          href="#/neu/name"
          onClick={(e) => {
            e.preventDefault();
            navigate({ name: "new" });
          }}
        >
          Ich habe schon einen Namen →
        </a>
        <KompassEntry
          onStart={() => {
            const e = oe.current;
            rememberStart({ person: e.person, place: e.region, focus: e.focus });
            navigate({ name: "kompass", step: 1 });
          }}
        />
      </div>
      <h1 className="h1" data-title="Namen finden">
        Finde deinen Markennamen.
      </h1>
      <p className="lead nf-lead">Wir schlagen Namen vor und zeigen jeden gleich als Logo.</p>
      {je && (
        <p className="field-error" role="alert" id="nf-error">
          Gib mindestens deinen Namen, deine Region oder ein Stichwort ein. Dann passen die
          Vorschläge zu dir.
        </p>
      )}
      {fn ? (
        pn
      ) : (
        <div className="nf-summary">
          <span>{gn || "Deine Angaben"}</span>
          <TextButton onClick={() => ie(true)}>Ändern</TextButton>
        </div>
      )}
      {t.route && (
        <div className="chips nf-route" role="group" aria-label="Vorgabe aus dem Markenkompass">
          <button
            type="button"
            className="chip is-on"
            aria-label={`Richtung ${t.route.titel} entfernen`}
            onClick={() => {
              c((e: any) => {
                const { route, brief, ...rest } = e;
                const l = { ...rest, batches: e.submitted ? [finderPrefs(rest)] : [] };
                if (l.submitted && isFinderComplete(l)) {
                  Q({ key: formKey(l), d: l });
                }
                return l;
              });
              announce("Richtung entfernt. Die Vorschläge sind wieder frei.");
            }}
          >
            {"Richtung: "}
            {t.route.titel}
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
        </div>
      )}
      {yn}
      <ActionBar>
        <Button onClick={Ee}>{t.submitted ? "Neue Vorschläge" : "Namen vorschlagen"}</Button>
      </ActionBar>
      <Dialog
        open={Fe === "art"}
        onClose={() => $(null)}
        title="Namensart"
        size="mid"
        footer={<Button onClick={() => $(null)}>Fertig</Button>}
      >
        <div className="option-list" role="group" aria-label="Namensart">
          {[
            { slug: "alle", label: "Alle", example: "Alle Stile gemischt", hint: undefined },
            ...Oe,
          ].map((e) => (
            <button
              key={e.slug}
              type="button"
              className="option-row"
              aria-pressed={e.slug === "alle" ? !t.chips.length : t.chips.includes(e.slug)}
              onClick={() => pe(e.slug)}
            >
              <span className="opt-main">{e.label}</span>
              <span className="small opt-ex">
                {e.hint ??
                  e.example
                    .replace(/^Z\. B\. /, "z. B. ")
                    .replace(
                      /^z\. B\. (.*)$/,
                      (n, a) => `z. B. ${a.charAt(0)}${a.slice(1).toLocaleLowerCase("de-AT")}`,
                    )}
              </span>
            </button>
          ))}
        </div>
      </Dialog>
      <Dialog
        open={Fe === "fein"}
        onClose={() => $(null)}
        title="Feiner einstellen"
        size="mid"
        footer={
          <Button
            onClick={() => {
              $(null);
              if (!p && t.submitted && isFinderComplete(t)) {
                ce(false);
              }
            }}
          >
            Übernehmen
          </Button>
        }
      >
        <div className="stack nf-fine">
          <Field
            label="FIRMA (OPTIONAL)"
            placeholder="z. B. Seeblick Realitäten"
            maxLength={80}
            autoComplete="organization"
            value={t.company}
            onChange={(e: any) => {
              M(false);
              c((n: any) => ({ ...n, company: plainDashes(e.target.value) }));
            }}
            help="Hast du schon eine Firma? Dann bauen wir Varianten davon."
          />
          <fieldset className="field">
            <legend className="label field-label">DEIN SCHWERPUNKT</legend>
            <ChipToggles
              options={FOCUS_OPTIONS}
              values={t.focus}
              onToggle={(e: any) =>
                c((n: any) => ({
                  ...n,
                  focus: n.focus.includes(e) ? n.focus.filter((a: any) => a !== e) : [...n.focus, e],
                }))
              }
              label="Dein Schwerpunkt"
            />
          </fieldset>
          <fieldset className="field">
            <legend className="label field-label">WELCHE WIRKUNG?</legend>
            <ChipGroup
              options={[
                { value: "egal", label: "Egal" },
                ...STYLE_OPTIONS.map((e) => ({ value: e.key, label: e.title })),
              ]}
              value={t.style}
              onChange={(e: any) => c((n: any) => ({ ...n, style: e }))}
              label="Welche Wirkung?"
            />
          </fieldset>
          <div className="field">
            <span className="label field-label" id="nf-creativity">
              WIE KREATIV?
            </span>
            <Segmented
              options={CREATIVITY_OPTIONS.map((e) => ({ value: e.key, label: e.label }))}
              value={t.creativity}
              onChange={(e: any) => c((n: any) => ({ ...n, creativity: e }))}
              labelledBy="nf-creativity"
            />
            {De && <p className="field-help">{De}</p>}
          </div>
          <Field
            label="WÖRTER, DIE NICHT VORKOMMEN SOLLEN"
            placeholder="z. B. Immo, Home, Haus"
            maxLength={300}
            value={t.exclude}
            onChange={(e: any) => c((n: any) => ({ ...n, exclude: plainDashes(e.target.value) }))}
          />
          <div className="field nf-length">
            <label className="label field-label" htmlFor="nf-len">
              {t.maxLength ? `HÖCHSTENS ${t.maxLength} BUCHSTABEN` : "LÄNGE: EGAL"}
            </label>
            <div className="nf-length-row">
              <TextButton onClick={() => ge(J - 1)} disabled={J <= 5}>
                Kürzer
              </TextButton>
              <input
                id="nf-len"
                type="range"
                min={5}
                max={25}
                step={1}
                value={J}
                aria-valuetext={t.maxLength ? `Höchstens ${t.maxLength} Buchstaben` : "Länge egal"}
                onChange={(e) => ge(Number(e.target.value))}
              />
              <TextButton onClick={() => ge(J + 1)} disabled={J >= 25}>
                Länger
              </TextButton>
            </div>
          </div>
          <Field
            label="BESCHREIBUNG (EIN SATZ)"
            placeholder="z. B. Ich verkaufe Altbauwohnungen in Währing."
            maxLength={200}
            value={t.description}
            onChange={(e: any) => {
              M(false);
              c((n: any) => ({ ...n, description: plainDashes(e.target.value) }));
            }}
            help="Wir holen die wichtigsten Begriffe heraus."
          />
          <KiConsent />
        </div>
      </Dialog>
      {u && (
        <NameDetail
          s={u}
          concept={ue(u)}
          styles={y}
          saved={he.has(u.id)}
          savedIds={he}
          mehr={!!route.mehr}
          desktop={p}
          path={hn.map((e: any) => A.current.get(e)).filter((e: any) => !!e)}
          variants={{
            items: w,
            conceptOf: (e: any) => ue(e),
            canMore: w.length >= te * BATCH_SIZE - 2,
            auto: te < LEARN_AFTER,
            onMore: () => Te((e) => e + 1),
          }}
          hasPrev={I > 0}
          hasNext={I >= 0 && I < Z.length - 1}
          onPrev={() => I > 0 && navigate({ ...S, detail: Z[I - 1].id }, { replace: true })}
          onNext={() =>
            I >= 0 && I < Z.length - 1 && navigate({ ...S, detail: Z[I + 1].id }, { replace: true })
          }
          onClose={() => navigate(S, { replace: true })}
          onSave={Le}
          onHide={(e: any) => {
            Ae(e);
            if (e.id === u.id) {
              navigate(S, { replace: true });
            }
          }}
          onTake={dn}
          onArea={(e: any) =>
            navigate({ ...S, detail: u.id, mehr: e || undefined }, { replace: true })
          }
          onAnchor={(e: any) => navigate({ ...S, detail: e.id, mehr: true })}
          onPath={(e: any) => navigate({ ...S, detail: e.id, mehr: true })}
          onDomain={cn}
        />
      )}
      {re && (
        <DislikeDialog
          name={re.name}
          onClose={() => le(null)}
          onSend={(e: any, n: any) => ln(re, e, n)}
        />
      )}
    </div>
  );
}

export default NameFinder;
