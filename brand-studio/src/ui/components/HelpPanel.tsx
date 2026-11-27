import { useEffect, useRef } from "react";
import { useStudio } from "../store";
import { BeforeYouDecide } from "./BeforeYouDecide";
import { Dialog } from "./Dialog";

const HELP_TOPICS = [
  {
    id: "daten",
    q: "Wo werden meine Daten gespeichert?",
    a: [
      "Nur in diesem Browser auf diesem Gerät. Wir haben keinen Server und kein Konto, niemand außer dir sieht deine Marke.",
      "Tipp: Lade dein Brand Kit herunter oder sichere deine Marke als Datei (unter „Deine Marken“, Menü „Mehr“).",
    ],
  },
  {
    id: "nutzung",
    q: "Darf ich das Logo überall verwenden?",
    a: [
      "Ja. Alle Schriften sind frei lizenziert und alle Symbole sind eigens gezeichnet. Du kannst dein Logo für Drucksachen, Website und Social Media nutzen.",
      "Prüf vor einem großen Druckauftrag kurz, ob es eine ähnliche Marke in deiner Region schon gibt.",
    ],
  },
  {
    id: "format",
    q: "Welches Format brauche ich?",
    a: [
      "PNG: für Word, PowerPoint, Social Media und WhatsApp. SVG: für deine Website und für Grafiker, bleibt in jeder Größe scharf. PDF: für die Druckerei.",
    ],
  },
  {
    id: "signatur",
    q: "Wie richte ich die E-Mail-Signatur ein?",
    a: [
      "Im Brand Kit bei „E-Mail-Signatur“ auf „Signatur einrichten“ tippen. Dort kopierst du die Signatur und findest eine Anleitung für Outlook, Apple Mail, Gmail und iPhone.",
    ],
  },
  {
    id: "kompass",
    q: "Was ist der Markenkompass?",
    a: [
      "Die Ausrichtung deiner Personal Brand in etwa 8 Minuten: wofür du stehst, wen du erreichst und wie du auftrittst. Danach zeigen wir dir drei Richtungen, eine sichere, eine mutige und eine überraschende, jeweils mit Versprechen, Themen für deine Inhalte und dem visuellen Auftritt.",
      "Er ist ein Angebot, kein Pflichtschritt. Du kannst jederzeit „Direkt zu den Richtungen“ springen. Mit „Diese Richtung vertiefen“ geht es in den Namensfinder bzw. zu deinen Logos, mit der Richtung als Vorgabe.",
    ],
  },
  {
    id: "probe",
    q: "Was bringt „Namen auf die Probe stellen“?",
    a: [
      "Unter deinen Logos prüfen wir deinen Namen in sieben Punkten, etwa Länge, Aussprache, Domain und ob ein Mitbewerber genauso heißen könnte. Dazu zeigen wir Alternativen als fertige Logos.",
      "Die Prüfung ersetzt keine Markenrecherche. Einen Tausch kannst du rückgängig machen.",
    ],
  },
  {
    id: "weg",
    q: "Ich sehe meine Marke nicht mehr.",
    a: [
      "Deine Marken liegen im Browser, in dem du sie erstellt hast. In einem anderen Browser, im privaten Fenster oder nach dem Löschen der Website-Daten sind sie nicht sichtbar.",
      "Hast du eine Sicherungsdatei (.unio-brand.json), öffne sie unter „Deine Marken“ mit „Sicherung öffnen“.",
    ],
  },
];

export function HelpPanel() {
  const { helpOpen, setHelpOpen, helpTopic } = useStudio();
  const r = useRef<any>(null);
  useEffect(() => {
    if (helpOpen && helpTopic && r.current) {
      r.current.open = true;
      setTimeout(() => {
        return r.current?.scrollIntoView({ block: "nearest" });
      }, 50);
    }
  }, [helpOpen, helpTopic]);
  useEffect(() => {
    const s = (i: any) => {
      if (
        !(
          i.key !== "?" ||
          i.ctrlKey ||
          i.metaKey ||
          i.altKey ||
          i.target.closest("input, textarea, select, [contenteditable]")
        )
      ) {
        i.preventDefault();
        setHelpOpen(true, "tasten");
      }
    };
    window.addEventListener("keydown", s);
    return () => window.removeEventListener("keydown", s);
  }, [setHelpOpen]);
  return (
    <Dialog open={helpOpen} onClose={() => setHelpOpen(false)} title="Hilfe" size="side">
      <div className="stack">
        <h3 className="label label-strong">SO FUNKTIONIERT'S</h3>
        <p>
          Du wählst ein Logo aus unseren Vorschlägen, passt es an und lädst alles herunter, was du
          brauchst.
        </p>
      </div>
      <div style={{ marginTop: 32 }}>
        <h3 className="label label-strong" style={{ marginBottom: 8 }}>
          HÄUFIGE FRAGEN
        </h3>
        {HELP_TOPICS.map((s) => (
          <details key={s.id} className="faq" ref={helpTopic === s.id ? r : undefined}>
            <summary>{s.q}</summary>
            <div className="faq-body stack">
              {s.a.map((i) => (
                <p key={i}>{i}</p>
              ))}
            </div>
          </details>
        ))}
      </div>
      <div style={{ marginTop: 32 }}>
        <BeforeYouDecide />
      </div>
      <div className="stack" style={{ marginTop: 32 }}>
        <h3 className="label label-strong">PERSÖNLICHE HILFE</h3>
        <p>Persönliche Hilfe vom UNIO CIRCLE Team</p>
        <p className="small">[PLATZHALTER: Support-Kontakt CIRCLE]</p>
      </div>
      <details
        className="faq desk-only"
        style={{ marginTop: 32 }}
        ref={helpTopic === "tasten" ? r : undefined}
      >
        <summary>Tastenkürzel</summary>
        <ul className="steps-list faq-body">
          {[
            ["?", "Hilfe öffnen"],
            ["Strg + Z", "Rückgängig im Editor"],
            ["Strg + Umschalt + Z", "Wiederholen im Editor"],
            ["Pfeiltasten", "Zwischen Logos und Optionen wechseln"],
            ["M", "Logo merken (Galerie, Fokus auf Karte)"],
            ["V", "Ähnliche Logos (Galerie, Fokus auf Karte)"],
            ["Esc", "Dialog schließen"],
          ].map(([s, i]) => (
            <li key={s} style={{ gridTemplateColumns: "180px 1fr" }}>
              <span className="label label-strong">{s}</span>
              <span>{i}</span>
            </li>
          ))}
        </ul>
      </details>
    </Dialog>
  );
}
