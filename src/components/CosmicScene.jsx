import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { COSMIC } from '../data/cosmicObjects.js'
import BlackHole from './cosmic/BlackHole.jsx'
import Pulsar from './cosmic/Pulsar.jsx'
import Kilonova from './cosmic/Kilonova.jsx'
import PhotoObject from './cosmic/PhotoObject.jsx'

// Procedural objects (the rest use real photos via PhotoObject).
const COMPONENTS = {
  blackhole: BlackHole,
  pulsar: Pulsar,
  kilonova: Kilonova,
}

// Desktop overview: wide 3-col grid (positions live in the data file).
const OVERVIEW_POS = new Vector3(0, 0, 15)
const OVERVIEW_LOOK = new Vector3(0, 0, -4)

// Phone: the scattered grid can't fit a portrait screen, so we lay the objects
// out in a straight horizontal row and turn it into a swipe carousel — the
// camera centres on one object at a time (like the planet carousel).
const MOBILE_GAP = 9 // spacing between objects in the row
const MOBILE_Z = -5
const mobilePos = (i) => [i * MOBILE_GAP, 0, MOBILE_Z]
const BROWSE_MULT = 2.8 // how far back we sit while browsing (comfortable frame)
const FOCUS_MULT = 2.1 // closer when focused (still small enough to fit the top half)

// Smoothly flies the camera: phone = pan along the row / fly into focus;
// desktop = scattered overview / fly into focus.
function Rig({ focus, cosmicIndex, positions, isMobile }) {
  const cam = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const look = useRef((isMobile ? new Vector3(0, 0, MOBILE_Z) : OVERVIEW_LOOK).clone())
  const dPos = useRef(new Vector3())
  const dLook = useRef(new Vector3())

  useFrame(() => {
    const tanHalfFov = Math.tan((cam.fov * Math.PI) / 360)

    if (focus != null) {
      const o = COSMIC[focus]
      const p = positions[focus]
      if (isMobile) {
        // object is centred horizontally; pull back a touch and aim below it so
        // it sits in the top half, above the info bottom-sheet.
        const fd = o.focusDist * FOCUS_MULT
        const offY = 0.5 * tanHalfFov * fd // centre the object ~quarter from the top
        dPos.current.set(p[0], p[1], p[2] + fd)
        dLook.current.set(p[0], p[1] - offY, p[2])
      } else {
        // Aim right of the object by half the side-panel's angular width so it
        // sits centred in the screen area NOT covered by the panel.
        const panelW = Math.min(410, size.width * 0.92)
        const offX = (o.focusDist * tanHalfFov * panelW) / size.height
        const lift = o.focusLift || 0
        dPos.current.set(p[0], p[1], p[2] + o.focusDist)
        dLook.current.set(p[0] + offX, p[1] - lift, p[2])
      }
    } else if (isMobile) {
      // browse: centre on the current object in the row
      const o = COSMIC[cosmicIndex]
      const p = positions[cosmicIndex]
      const bd = o.focusDist * BROWSE_MULT
      dPos.current.set(p[0], p[1], p[2] + bd)
      dLook.current.set(p[0], p[1], p[2])
    } else {
      dPos.current.copy(OVERVIEW_POS)
      dLook.current.copy(OVERVIEW_LOOK)
    }

    // snappier while browsing the phone carousel; gentle ease elsewhere
    const k = focus != null ? 0.05 : isMobile ? 0.1 : 0.025
    cam.position.lerp(dPos.current, k)
    look.current.lerp(dLook.current, k)
    cam.lookAt(look.current)
  })

  return null
}

export default function CosmicScene({ focus, cosmicIndex = 0, onSelect, onHover, onObjectHover, isMobile }) {
  const positions = isMobile ? COSMIC.map((_, i) => mobilePos(i)) : COSMIC.map((o) => o.position)

  const startPos = isMobile
    ? [cosmicIndex * MOBILE_GAP, 0, MOBILE_Z + COSMIC[cosmicIndex].focusDist * BROWSE_MULT]
    : [0, 1, 13]

  return (
    <>
      <PerspectiveCamera makeDefault fov={50} position={startPos} near={0.1} far={300} />
      <Rig focus={focus} cosmicIndex={cosmicIndex} positions={positions} isMobile={isMobile} />

      {COSMIC.map((o, i) => {
        const C = COMPONENTS[o.type]
        return (
          <group key={o.id} position={positions[i]} scale={o.scale || 1}>
            {/* Visuals carry NO event handlers, so clicks fall through to the
                canvas' onPointerMissed (which exits focus). */}
            {o.image ? (
              <PhotoObject src={o.image} size={o.photoSize} spin={o.spin || 0} pulse={o.pulse || 0} photoKey={o.photoKey} core={o.core} />
            ) : (
              <C />
            )}
            {/* The ONLY clickable target: a generous sphere (easy to select),
                shrunk to the centre when focused so clicking anywhere else exits. */}
            <mesh
              onClick={(e) => {
                e.stopPropagation()
                onSelect(i)
              }}
              onPointerOver={(e) => {
                e.stopPropagation()
                onHover(i)
                document.body.style.cursor = 'pointer'
              }}
              onPointerMove={() => onObjectHover?.()}
              onPointerOut={() => {
                onHover(null)
                document.body.style.cursor = 'default'
              }}
            >
              <sphereGeometry args={[focus === i ? 0.8 : 2.2, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
