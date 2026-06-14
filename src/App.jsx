import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import Carousel from './components/Carousel.jsx'
import Starfield from './components/Starfield.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import Navbar from './components/Navbar.jsx'
import Loader from './components/Loader.jsx'
import { BODIES } from './data/planets.js'

export default function App() {
  const [activeIndex, setActiveIndex] = useState(3) // start on Earth
  const [focusMode, setFocusMode] = useState(false)
  const [hintGone, setHintGone] = useState(false)

  const drag = useRef({ startX: 0, dragging: false, didDrag: false })

  const active = BODIES[activeIndex]

  const change = (dir) => {
    setFocusMode(false)
    setHintGone(true)
    setActiveIndex((i) => (i + dir + BODIES.length) % BODIES.length)
  }

  const handleSelect = (index) => {
    if (drag.current.didDrag) return
    setHintGone(true)
    if (index === activeIndex) {
      setFocusMode(true)
    } else {
      setFocusMode(false)
      setActiveIndex(index)
    }
  }

  // keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') change(1)
      else if (e.key === 'ArrowLeft') change(-1)
      else if (e.key === 'Escape') setFocusMode(false)
      else if (e.key === 'Enter' || e.key === ' ') setFocusMode(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // pointer drag = swipe
  const onPointerDown = (e) => {
    drag.current = { startX: e.clientX, dragging: true, didDrag: false }
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d.dragging || d.didDrag) return
    const dx = e.clientX - d.startX
    if (Math.abs(dx) > 55) {
      d.didDrag = true
      change(dx > 0 ? 1 : -1) // swipe right -> next flies in from the right
    }
  }
  const onPointerUp = () => {
    drag.current.dragging = false
  }

  return (
    <div className="app">
      <Navbar active="solar" />

      <div
        className="stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
          <color attach="background" args={['#070b22']} />
          <PerspectiveCamera makeDefault position={[0, 0.6, 8.5]} fov={42} />

          {/* Bright, even lighting so every world is clearly visible, while a
              stronger key light from the side keeps a realistic day/night curve. */}
          <ambientLight intensity={0.85} />
          <hemisphereLight args={['#9fb4ff', '#202840', 0.6]} />
          <directionalLight position={[5, 3, 6]} intensity={2.0} />
          <directionalLight position={[-6, -1, 3]} intensity={0.5} color="#7d93ff" />

          <Suspense fallback={null}>
            <Starfield />
            <Carousel
              activeIndex={activeIndex}
              focusMode={focusMode}
              onSelect={handleSelect}
            />
          </Suspense>

          <EffectComposer>
            {/* threshold 1.0 -> only the HDR Sun blooms; planets stay crisp/realistic */}
            <Bloom
              mipmapBlur
              intensity={0.9}
              luminanceThreshold={1.0}
              luminanceSmoothing={0.15}
            />
            <Vignette eskil={false} offset={0.25} darkness={0.6} />
          </EffectComposer>
        </Canvas>

        <Loader />

        {/* HUD */}
        <button className="nav-arrow left" onClick={() => change(-1)} aria-label="Previous">
          ‹
        </button>
        <button className="nav-arrow right" onClick={() => change(1)} aria-label="Next">
          ›
        </button>

        <div className={`title-card ${focusMode ? 'is-hidden' : ''}`}>
          <p className="title-eyebrow">{active.subtitle}</p>
          <h1>{active.name}</h1>
          <button className="details-btn" onClick={() => setFocusMode(true)}>
            View details ▸
          </button>
        </div>

        <div className="dots">
          {BODIES.map((b, i) => (
            <button
              key={b.id}
              className={`dot ${i === activeIndex ? 'is-active' : ''}`}
              onClick={() => {
                setFocusMode(false)
                setActiveIndex(i)
              }}
              title={b.name}
            />
          ))}
        </div>

        {!hintGone && (
          <div className="hint">
            Drag or use ← → to travel between worlds · Click a planet for details
          </div>
        )}

        {focusMode && (
          <InfoPanel body={active} onClose={() => setFocusMode(false)} />
        )}
      </div>
    </div>
  )
}
