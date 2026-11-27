const ExternalLink = ({ href, children: t, long }: any) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={long ? "bd-long" : undefined}>
    {t} <span aria-hidden="true">↗</span>
    <span className="sr-only">{" (öffnet ein neues Fenster)"}</span>
  </a>
);

export function BeforeYouDecide({ open }: any) {
  return (
    <details className="disclosure before-decide" open={open}>
      <summary>
        <span>
          <span className="bd-title">Bevor du dich festlegst</span>
          <span className="small bd-lead">Prüf kurz, ob es deinen Wunschnamen schon gibt.</span>
        </span>
      </summary>
      <div className="disclosure-body">
        <p>
          Prüf kurz, ob es deinen Wunschnamen schon gibt. Das dauert zehn Minuten und kann dir viel
          Ärger ersparen. Wir können das nicht für dich prüfen und geben keine Rechtsberatung.
        </p>
        <ol className="steps-list">
          <li>
            <span className="label" aria-hidden="true">
              01
            </span>
            <span>
              Marken: Such den Namen im österreichischen Markenregister des Patentamts (
              <ExternalLink href="https://seeip.patentamt.at">see.ip</ExternalLink>
              {") und EU-weit in "}
              <ExternalLink href="https://www.tmdn.org/tmview/">TMview</ExternalLink>.
            </span>
          </li>
          <li>
            <span className="label" aria-hidden="true">
              02
            </span>
            <span>
              {"Firmen: Schau im "}
              <ExternalLink href="https://firmen.wko.at" long>
                Firmen A-Z der Wirtschaftskammer
              </ExternalLink>
              , ob ein Makler in deiner Nähe ähnlich heißt.
            </span>
          </li>
          <li>
            <span className="label" aria-hidden="true">
              03
            </span>
            <span>
              {"Domain: Prüf bei "}
              <ExternalLink href="https://www.nic.at">nic.at</ExternalLink>, ob deine .at-Adresse
              noch frei ist.
            </span>
          </li>
          <li>
            <span className="label" aria-hidden="true">
              04
            </span>
            <span>
              Dein eigener Name: Auch mit einem Fantasienamen steht dein eigener Name in der Regel
              im Impressum und auf deinem Geschäftspapier.
            </span>
          </li>
          <li>
            <span className="label" aria-hidden="true">
              05
            </span>
            <span>
              Im Zweifel: Frag eine Anwältin oder einen Anwalt für Markenrecht. Die
              Wirtschaftskammer hilft beim ersten Schritt.
            </span>
          </li>
        </ol>
      </div>
    </details>
  );
}

export function TrademarkCheck() {
  return (
    <details className="disclosure before-decide mark-legal">
      <summary>
        <span>
          <span className="bd-title">Vor der Nutzung als Marke</span>
          <span className="small bd-lead">
            Logo und Name rechtlich prüfen lassen (Marken- und Designrecht).
          </span>
        </span>
      </summary>
      <div className="disclosure-body">
        <p>
          Vor der Nutzung als Marke: Logo und Name rechtlich prüfen lassen (Marken- und
          Designrecht).
        </p>
        <p>
          Dein Logo beruht auf einer Gestaltungsvorlage des Studios. Andere können dieselbe Vorlage
          mit ihrem Namen nutzen, ein exklusives Zeichen ist es deshalb nicht. Wir geben keine
          Rechtsberatung; frag im Zweifel eine Anwältin oder einen Anwalt für Marken- und
          Designrecht.
        </p>
      </div>
    </details>
  );
}
