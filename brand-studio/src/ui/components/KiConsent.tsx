/**
 * Einwilligung für die KI-Funktionen.
 * Gesicherte Fassung: NameCard-Chunk (te).
 */
import { useId } from "react";
import { updateSettings, useSettings } from "../logic/settings";
import { Switch } from "./Controls";

const PRIVACY_URL = "https://www.unio.at/datenschutz";

export function KiConsent() {
  const n = useSettings();
  const a = useId();
  return (
    <div className="stack ki-consent">
      <Switch
        checked={n.kiFunktionen}
        onChange={(s: any) => updateSettings({ kiFunktionen: s })}
        describedBy={a}
      >
        KI-Funktionen
      </Switch>
      <p className="small" id={a}>
        Schaltet die KI-Vorauswahl der Logos, KI-Namensideen und KI-Texte zu deinen Markenrouten
        frei. Name, Region, Stichworte, deine Antworten im Markenkompass und Logo-Bilder werden
        dafür an Anthropic übertragen, Kontaktdaten nicht.{" "}
        <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer">
          Datenschutz
        </a>
      </p>
    </div>
  );
}
