const TABS = [
  { id: 'solar', label: 'Solar System' },
  { id: 'cosmic', label: 'Cosmic Objects' },
]

export default function Navbar({ active = 'solar', onSelect }) {
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
            className={`tab ${t.id === active ? 'is-active' : ''}`}
            onClick={() => onSelect?.(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  )
}
