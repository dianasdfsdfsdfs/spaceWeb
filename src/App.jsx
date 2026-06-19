import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import Carousel from './components/Carousel.jsx'
import CosmicScene from './components/CosmicScene.jsx'
import Starfield from './components/Starfield.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import Navbar from './components/Navbar.jsx'
import Loader from './components/Loader.jsx'
import { BODIES } from './data/planets.js'
import { COSMIC } from './data/cosmicObjects.js'

const STORE_KEY = 'cosmos-explorer-state'

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function App() {
  // restore where the user left off (persisted across refresh)
  const saved = useRef(loadState()).current

  const [section, setSection] = useState(saved.section || 'solar') // 'solar' | 'cosmic'

  // --- solar system state ---
  const [activeIndex, setActiveIndex] = useState(saved.activeIndex ?? 3) // start on Earth
  const [focusMode, setFocusMode] = useState(saved.focusMode ?? false)
  const [hintGone, setHintGone] = useState(saved.hintGone ?? false)

  // --- cosmic objects state ---
  const [cosmicFocus, setCosmicFocus] = useState(saved.cosmicFocus ?? null) // index | null
  const [hovered, setHovered] = useState(null)
  const [cosmicHintGone, setCosmicHintGone] = useState(saved.cosmicHintGone ?? false)

  // splash screen until the 3D scene + textures are ready
  const [ready, setReady] = useState(false)

  // pause 3D animation (to read the info) + auto-hiding controls
  const [paused, setPaused] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const hideTimer = useRef()

  // phone layout: smaller focused planets + bottom-sheet info panel
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(max-width: 720px)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 720px)')
    const onChange = (e) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const inFocus =
    (section === 'solar' && focusMode) || (section === 'cosmic' && cosmicFocus != null)

  const revealControls = () => {
    setShowControls(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setShowControls(false), 2600)
  }

  // resume animation whenever the focus target changes
  useEffect(() => {
    setPaused(false)
  }, [section, activeIndex, cosmicFocus, focusMode])

  // persist on every relevant change
  useEffect(() => {
    localStorage.setItem(
      STORE_KEY,
      JSON.stringify({ section, activeIndex, focusMode, hintGone, cosmicFocus, cosmicHintGone }),
    )
  }, [section, activeIndex, focusMode, hintGone, cosmicFocus, cosmicHintGone])

  const drag = useRef({ startX: 0, dragging: false, didDrag: false })

  const active = BODIES[activeIndex]

  const goSection = (id) => {
    setSection(id)
    setFocusMode(false)
    setCosmicFocus(null)
    setHovered(null)
  }

  // --- solar handlers ---
  const change = (dir) => {
    setFocusMode(false)
    setHintGone(true)
    setActiveIndex((i) => (i + dir + BODIES.length) % BODIES.length)
  }

  const handleSelect = (index) => {
    if (drag.current.didDrag) return
    setHintGone(true)
    if (index === activeIndex) setFocusMode(true)
    else {
      setFocusMode(false)
      setActiveIndex(index)
    }
  }

  // --- cosmic handlers ---
  const selectCosmic = (i) => {
    setCosmicHintGone(true)
    setCosmicFocus(i)
  }

  // keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setFocusMode(false)
        setCosmicFocus(null)
      } else if (section === 'solar') {
        if (e.key === 'ArrowRight') change(1)
        else if (e.key === 'ArrowLeft') change(-1)
        else if (e.key === 'Enter' || e.key === ' ') setFocusMode(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [section])

  // pointer drag = swipe (solar only)
  const onPointerDown = (e) => {
    if (section !== 'solar') return
    drag.current = { startX: e.clientX, dragging: true, didDrag: false }
  }
  const onPointerMove = (e) => {
    if (section !== 'solar') return
    const d = drag.current
    if (!d.dragging || d.didDrag) return
    const dx = e.clientX - d.startX
    if (Math.abs(dx) > 55) {
      d.didDrag = true
      change(dx > 0 ? 1 : -1)
    }
  }
  const onPointerUp = () => {
    drag.current.dragging = false
  }

  return (
    <div className="app">
      <Navbar active={section} onSelect={goSection} />

      <div
        className="stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <Canvas
          dpr={[1, 1.25]}
          frameloop={paused ? 'never' : 'always'}
          gl={{ antialias: true, powerPreference: 'high-performance', stencil: false }}
          performance={{ min: 0.5 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener('webglcontextlost', (e) => e.preventDefault())
          }}
          onPointerMissed={() => {
            // clicking empty space exits focus (cosmic object, or a focused planet)
            if (section === 'cosmic') setCosmicFocus(null)
            else if (section === 'solar' && focusMode) setFocusMode(false)
          }}
        >
          <color attach="background" args={['#070b22']} />

          {/* lighting (used by the lit planets; cosmic objects are self-emissive) */}
          <ambientLight intensity={0.5} />
          <hemisphereLight args={['#aab8e8', '#202840', 0.3]} />
          <directionalLight position={[-2.5, 2, 7]} intensity={1.7} />
          <directionalLight position={[3.5, -0.5, 6]} intensity={1.15} />

          <Suspense fallback={null}>
            <Starfield />

            {section === 'solar' ? (
              <>
                <PerspectiveCamera makeDefault position={[0, 0.6, 8.5]} fov={42} />
                <Carousel
                  activeIndex={activeIndex}
                  focusMode={focusMode}
                  onSelect={handleSelect}
                  onObjectHover={revealControls}
                  isMobile={isMobile}
                />
              </>
            ) : (
              <CosmicScene
                focus={cosmicFocus}
                onSelect={selectCosmic}
                onHover={setHovered}
                onObjectHover={revealControls}
              />
            )}
          </Suspense>

          <EffectComposer multisampling={0}>
            <Bloom mipmapBlur intensity={0.9} luminanceThreshold={1.0} luminanceSmoothing={0.15} />
            <Vignette eskil={false} offset={0.25} darkness={0.55} />
          </EffectComposer>
        </Canvas>

        {/* ---------- SOLAR HUD ---------- */}
        {section === 'solar' && (
          <>
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

            {!focusMode && (
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
            )}

            {!hintGone && (
              <div className="hint">
                Drag or use ← → to travel between worlds · Click a planet for details
              </div>
            )}

            {focusMode && <InfoPanel body={active} onClose={() => setFocusMode(false)} />}
          </>
        )}

        {/* ---------- COSMIC HUD ---------- */}
        {section === 'cosmic' && (
          <>
            {cosmicFocus == null && hovered != null && (
              <div className="hover-name">{COSMIC[hovered].name}</div>
            )}

            {cosmicFocus == null && !cosmicHintGone && (
              <div className="hint">Click an object to fly in and explore it · Esc to come back</div>
            )}

            {cosmicFocus != null && (
              <InfoPanel body={COSMIC[cosmicFocus]} onClose={() => setCosmicFocus(null)} />
            )}
          </>
        )}

        {/* pause-animation control — appears on mouse movement while focused */}
        {inFocus && showControls && (
          <button
            className="anim-toggle"
            onClick={() => setPaused((p) => !p)}
            onMouseEnter={() => clearTimeout(hideTimer.current)}
            onMouseLeave={revealControls}
          >
            {paused ? '▶  Resume animation' : '⏸  Pause animation'}
          </button>
        )}
      </div>

      {/* splash / loading screen on top of everything until the scene is ready */}
      {!ready && <Loader onDone={() => setReady(true)} />}
    </div>
  )
}
