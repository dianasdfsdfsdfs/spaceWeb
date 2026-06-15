export default function InfoPanel({ body, onClose }) {
  return (
    <aside
      className="info-panel"
      key={body.id}
      // keep text selection inside the panel from being treated as a
      // swipe/click on the planet behind it
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      <button className="info-close" onClick={onClose} aria-label="Close">
        ×
      </button>

      <header className="info-header">
        <p className="info-eyebrow">{body.subtitle}</p>
        <h2>{body.name}</h2>
      </header>

      <section className="info-section">
        <h3>Quick facts</h3>
        <dl className="info-facts">
          {Object.entries(body.facts).map(([k, v]) => (
            <div className="fact-row" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="info-section">
        <h3>Did you know?</h3>
        <ul className="info-list">
          {body.funFacts.map((f, i) => (
            <li key={i}>{f}</li>
          ))}
        </ul>
      </section>

      <section className="info-section">
        <h3>Myth &amp; name</h3>
        <p>{body.mythology}</p>
      </section>

      <section className="info-section">
        <h3>Mystery &amp; theories</h3>
        <p>{body.mystery}</p>
      </section>

      <section className="info-section info-life">
        <h3>Chance of life</h3>
        <p>{body.life}</p>
      </section>
    </aside>
  )
}
