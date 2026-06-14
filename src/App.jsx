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
        <Canvas
          dpr={[1, 1.25]}
          gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
          performance={{ min: 0.5 }}
          onCreated={({ gl }) => {
            // keep the page alive if the GPU drops the context instead of going black
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
          }}
        >
          <color attach="background" args={['#070b22']} />
          <PerspectiveCamera makeDefault position={[0, 0.6, 8.5]} fov={42} />

          {/* A strong key light gives a realistic day/night terminator (like the
              reference photos); ambient + a soft fill keep the night side visible
              rather than pitch black. */}
          <ambientLight intensity={0.55} />
          <hemisphereLight args={['#9fb4ff', '#1a2038', 0.4]} />
          <directionalLight position={[5, 2.5, 6]} intensity={2.6} />
          <directionalLight position={[-6, -1, 2]} intensity={0.35} color="#7d93ff" />

          <Suspense fallback={null}>
            <Starfield />
            <Carousel
              activeIndex={activeIndex}
              focusMode={focusMode}
              onSelect={handleSelect}
            />
          </Suspense>

          {/* multisampling 0 = far cheaper on weak/integrated GPUs (no MSAA buffer) */}
          <EffectComposer multisampling={0}>
            {/* threshold 1.0 -> only the HDR Sun blooms; planets stay crisp/realistic */}
            <Bloom
              mipmapBlur
              intensity={0.85}
              luminanceThreshold={1.0}
              luminanceSmoothing={0.15}
            />
            <Vignette eskil={false} offset={0.25} darkness={0.55} />
          </EffectComposer>
        </Canvas>

        <Loader />

        {/* HUD */}
        <button className="nav-arrow left" onClick={() => change(-1)} aria-label="Previous">
          ‹
        </button>
        <button
          className={`nav-arrow right ${focusMode ? 'shifted' : ''}`}
          onClick={() => change(1)}
          aria-label="Next"
        >
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
