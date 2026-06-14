const TABS = [
  { id: 'solar', label: 'Solar System', enabled: true },
  { id: 'blackholes', label: 'Black Holes', enabled: false },
  { id: 'nebulae', label: 'Nebulae', enabled: false },
  { id: 'exotic', label: 'Exotic Objects', enabled: false },
]

export default function Navbar({ active = 'solar' }) {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-mark">◍</span>
        <span className="brand-name">COSMOS<span>EXPLORER</span></span>
      </div>
      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab ${t.id === active ? 'is-active' : ''} ${
              t.enabled ? '' : 'is-disabled'
            }`}
            disabled={!t.enabled}
            title={t.enabled ? t.label : 'Coming soon'}
          >
            {t.label}
            {!t.enabled && <span className="soon">soon</span>}
          </button>
        ))}
      </nav>
    </header>
  )
}
