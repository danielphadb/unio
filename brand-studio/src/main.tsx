import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./ui/styles.css";
import { App } from "./ui/App";
import { initBridge } from "./ui/bridge";
import { installUiFonts } from "./ui/uiFonts";

// Start wie in der gesicherten Fassung: Sprache, UI-Schriften, Favicon, Brücke zur UNIO-Plattform.
document.documentElement.lang = "de-AT";
installUiFonts();
if (!document.querySelector('link[rel="icon"]')) {
  const icon = document.createElement("link");
  icon.rel = "icon";
  icon.href =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0B0A09"/><circle cx="16" cy="16" r="5" fill="#FFAA09"/></svg>',
    );
  document.head.appendChild(icon);
}
initBridge();

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
