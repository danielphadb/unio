/**
 * App-Rahmen: Store, Kopfzeile, Router-Ansicht je Route, Hinweis bei vollem Speicher, Scroll und Fokus nach Navigation.
 * Gesicherte Fassung: index-Chunk (BC, _C, jC, Lazy-Screens).
 */
import { Suspense, lazy, useContext, useEffect, useRef } from "react";
import { setExport } from "./bridge";
import { Header } from "./components/Header";
import { HelpPanel } from "./components/HelpPanel";
import { routeTitles, savedScroll } from "./logic/route";
import { Home } from "./screens/Home";
import { NameScreen } from "./screens/NameScreen";
import { StudioContext, StudioProvider, useStudio } from "./store";

export function ScrollRestorer({ isBack }: any) {
  const { route } = useContext(StudioContext);
  const n = useRef(true);
  const r = [
    route.name,
    "id" in route ? route.id : "",
    route.name === "logo" ? route.conceptId : "",
  ].join("|");
  useEffect(() => {
    const s = n.current;
    n.current = false;
    const i = location.hash || "#/";
    const a = isBack ? savedScroll(i) : 0;
    const o = routeTitles(route);
    let l = 0;
    let u = 0;
    const c = (d: any) => {
      return d.dataset.title ?? d.textContent?.trim() ?? "";
    };
    const f = () => {
      const d = Array.from(document.querySelectorAll("main h1"));
      const h = d.find((x) => o.includes(c(x)));
      if (!h && l++ < 120) {
        u = requestAnimationFrame(f);
        return;
      }
      const m = h ?? d[0];
      m &&
        ((document.title = `${c(m)} · Brand Studio`),
        (!s || document.activeElement === document.body) &&
          (s ||
            (m.hasAttribute("tabindex") || m.setAttribute("tabindex", "-1"),
            (m as HTMLElement).focus({ preventScroll: true }))));
      if (a !== undefined) {
        window.scrollTo(0, a);
      }
    };
    u = requestAnimationFrame(f);
    return () => cancelAnimationFrame(u);
  }, [r]);
  return null;
}

const StyleScreen = lazy(() => import("./screens/StyleScreen"));

const Gallery = lazy(() => import("./screens/Gallery"));

const Editor = lazy(() => import("./screens/Editor"));

const Kit = lazy(() => import("./screens/Kit"));

const NameFinder = lazy(() => import("./screens/NameFinder"));

const Kompass = lazy(() => import("./screens/Kompass"));

const Routes = lazy(() => import("./screens/Routes"));

const PostingsScreen = lazy(() => import("./postings/PostingsScreen"));

const ObjectsScreen = lazy(() => import("./postings/ObjectsScreen"));

const NAMES_ROUTE = { name: "names", gemerkt: false, kinds: [] };

export function App() {
  return (
    <StudioProvider>
      <Shell />
    </StudioProvider>
  );
}

function ScreenFallback() {
  return (
    <div className="container screen" aria-busy="true">
      <div className="riffel skeleton" style={{ height: 320 }} />
    </div>
  );
}

function Shell() {
  const { route, state, storageOk, otherTabChanged, navigate, update } = useStudio();
  const a = "id" in route ? route.id : undefined;
  const o = a ? state.projects[a] : undefined;
  if (
    (useEffect(() => {
      if (!o) return;
      const c = location.hash;
      if (o.ui.route !== c) {
        update(o.id, (f: any) => ({ ...f, ui: { ...f.ui, route: c } }), false);
      }
    }, [route, o?.id]),
    useEffect(() => {
      setExport(o?.input ?? null, o ? (o.selected ?? o.editing?.concept ?? null) : null);
    }, [o]),
    useEffect(() => {
      if (state.loaded && a && !o) {
        navigate({ name: "home" }, { replace: true });
      }
    }, [state.loaded, a, o, navigate]),
    !state.loaded)
  )
    return null;
  const l = route.name === "logo";
  const u = route.name === "auswahl" || route.name === "kit";
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(c) => {
          var f;
          c.preventDefault();
          if (!((f = document.getElementById("main")) == null)) {
            f.focus();
          }
        }}
      >
        Zum Inhalt springen
      </a>
      {!storageOk && (
        <div className="banner" role="note">
          <div className="container">
            In diesem Fenster kann nichts gespeichert werden (privates Surfen?). Du kannst trotzdem
            alles erstellen, lade dein Brand Kit am Ende herunter.
          </div>
        </div>
      )}
      {otherTabChanged && (
        <div className="banner" role="alert">
          <div className="container">
            <span>Diese Marke wurde in einem anderen Fenster geändert.</span>
            <button
              type="button"
              className="btn btn-ghost on-dark"
              onClick={() => location.reload()}
            >
              Neu laden
            </button>
          </div>
        </div>
      )}
      <QuotaBanner />
      {!l && <Header route={route} project={o} sticky={u} />}
      <main id="main" tabIndex={-1} className={l ? "editor-root" : undefined}>
        <Suspense fallback={<ScreenFallback />}>
          <Screen route={route} />
        </Suspense>
      </main>
      <HelpPanel />
    </>
  );
}

function QuotaBanner() {
  const { quotaFull, dismissQuota, navigate } = useStudio();
  return quotaFull ? (
    <div className="banner" role="alertdialog" aria-labelledby="quota-text">
      <div className="container">
        <span id="quota-text">
          Dein Browser-Speicher ist voll. Lösche alte Marken oder entferne eingesetzte Fotos.
        </span>
        <button
          type="button"
          className="btn btn-ghost on-dark"
          onClick={() => {
            dismissQuota();
            navigate({ name: "home" });
          }}
        >
          Zu deinen Marken
        </button>
        <button type="button" className="btn btn-text on-dark" onClick={dismissQuota}>
          Schließen
        </button>
      </div>
    </div>
  ) : null;
}

function Screen({ route }: any) {
  const { state } = useStudio();
  const n = Object.keys(state.projects).length > 0;
  switch (route.name) {
    case "home":
      return n || state.loadError ? <Home /> : <NameFinder route={NAMES_ROUTE} />;
    case "new":
      return <NameScreen key="new" />;
    case "names":
      return <NameFinder route={route} />;
    case "kompass":
      return <Kompass key={route.step} step={route.step} />;
    case "routen":
      return <Routes />;
    case "name":
      return state.projects[route.id] ? <NameScreen key={route.id} projectId={route.id} /> : null;
    case "stil":
      return state.projects[route.id] ? <StyleScreen key={route.id} projectId={route.id} /> : null;
    case "auswahl":
      return state.projects[route.id] ? (
        <Gallery key={route.id} projectId={route.id} gemerkt={route.gemerkt} />
      ) : null;
    case "logo":
      return state.projects[route.id] ? (
        <Editor
          key={`${route.id}/${route.conceptId}`}
          projectId={route.id}
          conceptId={route.conceptId}
          tab={route.tab}
          texte={route.texte}
          feinheiten={route.feinheiten}
        />
      ) : null;
    case "kit":
      return state.projects[route.id] ? <Kit key={route.id} projectId={route.id} /> : null;
    case "postings":
      return state.projects[route.id] ? (
        <PostingsScreen
          key={route.id}
          projectId={route.id}
          objekt={route.objekt}
          anlass={route.anlass}
        />
      ) : null;
    case "objekte":
      return state.projects[route.id] ? (
        <ObjectsScreen key={route.id} projectId={route.id} objekt={route.objekt} />
      ) : null;
  }
}
