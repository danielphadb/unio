/**
 * Zustand des Studios: Projekte im Browser-Speicher, Speichern mit Verzögerung, Navigation, Hilfe, Ansagen für Screenreader.
 * Gesicherte Fassung: index-Chunk (Qk, Zt, Xk).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { ScrollRestorer } from "./App";
import { Toast } from "./components/Toast";
import {
  PROJECT_KEY,
  deleteProject,
  isQuotaError,
  openStorage,
  readIndex,
  writeProject,
} from "./logic/persist";
import { lastNavTick, nextNavTick, useHashRoute } from "./logic/route";

function projectsReducer(state: any, action: any) {
  switch (action.type) {
    case "load":
      return {
        loaded: true,
        loadError: action.error,
        projects: Object.fromEntries(action.projects.map((n: any) => [n.id, n])),
      };
    case "upsert":
      return { ...state, projects: { ...state.projects, [action.project.id]: action.project } };
    case "remove": {
      const n: any = { ...state.projects };
      delete n[action.id];
      return { ...state, projects: n };
    }
  }
}

export const StudioContext = createContext<any>(null);

export function useStudio() {
  const e = useContext(StudioContext);
  if (!e) throw new Error("StudioProvider fehlt");
  return e;
}

export function StudioProvider({ children: e, store }: any) {
  const n = useRef(store === undefined ? openStorage() : store);
  const r = !!n.current;
  const [s, i] = useReducer(projectsReducer, { projects: {}, loaded: false, loadError: false });
  const [a, o] = useState("idle");
  const [l, u] = useState(false);
  const [c, f] = useState(false);
  const [d, h] = useState<any>(null);
  const [m, x] = useState(false);
  const k = useRef(new Set<any>());
  const p = useRef(new Set<any>());
  const g = useRef<any>(undefined);
  const v = useRef(s);
  v.current = s;
  const S = useRef(new Set<any>());
  const b = useRef(false);
  useEffect(() => {
    const j = n.current;
    if (!j) {
      i({ type: "load", projects: [], error: false });
      return;
    }
    let Z: any[] = [];
    try {
      Z = readIndex(j);
    } catch {
      i({ type: "load", projects: [], error: true });
      return;
    }
    if (!Z.length) {
      i({ type: "load", projects: [], error: false });
      return;
    }
    import("./logic/migrate")
      .then(({ loadAll }) => {
        const ke = loadAll(j);
        i({ type: "load", projects: ke.projects, error: false });
      })
      .catch(() => i({ type: "load", projects: [], error: true }));
  }, []);
  const L = useCallback(() => {
    window.clearTimeout(g.current);
    g.current = undefined;
    const j = n.current;
    if (!j || (!k.current.size && !p.current.size)) return;
    const Z = performance.now();
    o("saving");
    try {
      for (const ke of p.current) deleteProject(j, ke);
      p.current.clear();
      for (const ke of k.current) {
        const xr = v.current.projects[ke];
        if (xr) {
          S.current.add(PROJECT_KEY + ke);
          writeProject(j, xr);
        }
      }
      k.current.clear();
      const fe = Math.max(0, 400 - (performance.now() - Z));
      window.setTimeout(() => o((ke) => (ke === "saving" ? "saved" : ke)), fe);
    } catch (fe) {
      o("error");
      if (isQuotaError(fe) && !b.current) {
        b.current = true;
        u(true);
      }
    }
  }, []);
  const T = useRef(0);
  const E = useCallback(
    (j = false) => {
      window.clearTimeout(g.current);
      if (!T.current) {
        T.current = performance.now();
      }
      const Z = performance.now() - T.current;
      const fe = j ? 0 : Math.max(0, Math.min(500, 900 - Z));
      g.current = window.setTimeout(() => {
        T.current = 0;
        L();
      }, fe);
    },
    [L],
  );
  useEffect(() => {
    const j = () => {
      if (document.visibilityState === "hidden") {
        L();
      }
    };
    document.addEventListener("visibilitychange", j);
    window.addEventListener("pagehide", L);
    return () => {
      document.removeEventListener("visibilitychange", j);
      window.removeEventListener("pagehide", L);
    };
  }, [L]);
  const I = useHashRoute();
  const P = "id" in I.route ? I.route.id : undefined;
  useEffect(() => {
    const j = (Z: any) => {
      !Z.key || !P || (Z.key === PROJECT_KEY + P && x(true));
    };
    window.addEventListener("storage", j);
    return () => window.removeEventListener("storage", j);
  }, [P]);
  const q = useCallback(
    (j: any, Z: any, fe = true) => {
      const ke = v.current.projects[j];
      if (!ke) return;
      const xr = Z(ke);
      if (xr === ke) return;
      const Qc = fe ? { ...xr, updatedAt: Date.now() } : xr;
      v.current = { ...v.current, projects: { ...v.current.projects, [j]: Qc } };
      i({ type: "upsert", project: Qc });
      k.current.add(j);
      E();
    },
    [E],
  );
  const Q = useCallback(
    (j: any) => {
      v.current = { ...v.current, projects: { ...v.current.projects, [j.id]: j } };
      i({ type: "upsert", project: j });
      k.current.add(j.id);
      E(true);
    },
    [E],
  );
  const te = useCallback(
    (j: any) => {
      const Z: any = { ...v.current.projects };
      delete Z[j];
      v.current = { ...v.current, projects: Z };
      i({ type: "remove", id: j });
      k.current.delete(j);
      p.current.add(j);
      L();
    },
    [L],
  );
  const [ee, ae] = useState<any>(null);
  const oe = useRef(0);
  const le = useCallback((j: any, Z: any, fe: any) => {
    oe.current += 1;
    ae({ id: oe.current, text: j, action: Z, action2: fe, at: Date.now(), task: nextNavTick() });
  }, []);
  const O = I.route.name;
  useEffect(() => {
    const j = nextNavTick();
    ae((Z: any) => (Z && Z.task !== lastNavTick && Z.task !== j ? null : Z));
  }, [O]);
  const [B, R] = useState<any>({ polite: "", assertive: "" });
  const A = useCallback((j: any, Z = false) => {
    R((fe: any) => (Z ? { ...fe, assertive: "" } : { ...fe, polite: "" }));
    window.setTimeout(() => R((fe: any) => (Z ? { ...fe, assertive: j } : { ...fe, polite: j })), 60);
  }, []);
  const H = useRef(false);
  const He = useCallback(() => {
    var j;
    if (!H.current) {
      H.current = true;
      try {
        navigator.storage?.persist?.call(j).catch(() => {});
      } catch {}
    }
  }, []);
  const De = useCallback((j: any, Z: any) => {
    f(j);
    h(Z ?? null);
  }, []);
  const _t = useMemo(
    () => ({
      state: s,
      storageOk: r,
      save: a,
      quotaFull: l,
      dismissQuota: () => u(false),
      update: q,
      put: Q,
      remove: te,
      toast: le,
      announce: A,
      route: I.route,
      navigate: I.navigate,
      helpOpen: c,
      setHelpOpen: De,
      helpTopic: d,
      otherTabChanged: m,
      requestPersist: He,
    }),
    [s, r, a, l, q, Q, te, le, A, I.route, I.navigate, c, De, d, m, He],
  );
  return (
    <StudioContext.Provider value={_t}>
      <ScrollRestorer isBack={I.isBack} />
      {e}
      <Toast msg={ee} onDone={() => ae(null)} />
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {B.polite}
      </div>
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {B.assertive}
      </div>
    </StudioContext.Provider>
  );
}
