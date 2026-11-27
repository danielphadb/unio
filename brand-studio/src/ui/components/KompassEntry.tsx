export function KompassEntry({ onStart }: any) {
  return (
    <a
      className="kp-entry"
      href="#/kompass"
      onClick={(t) => {
        t.preventDefault();
        onStart();
      }}
    >
      <span className="kp-entry-dot" aria-hidden="true" />
      <span>
        <strong>Markenkompass:</strong>
        {" in 8 Minuten zu deiner Personal Brand"}
      </span>
    </a>
  );
}
