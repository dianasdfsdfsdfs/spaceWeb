import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3, MathUtils } from 'three'
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

// Phone: a swipe carousel — one object centred at a time (like the planets).
// Objects live in a straight row, but we place each at its nearest "copy"
// relative to the camera centre (period = whole row), so wrapping from the last
// object to the first happens OFF-SCREEN and always moves the short way → an
// endless loop in either direction.
const N = COSMIC.length
const MOBILE_GAP = 9 // spacing between objects in the row
const MOBILE_Z = -5
const PERIOD = N * MOBILE_GAP
const BROWSE_MULT = 2.8 // how far back we sit while browsing (comfortable frame)
const FOCUS_MULT = 2.1 // closer when focused (still small enough to fit the top half)

// nearest periodic copy of `home` to `ref`
const nearest = (home, ref) => home + Math.round((ref - home) / PERIOD) * PERIOD

// Smoothly flies the camera: phone = endless pan along the row / fly into focus;
// desktop = scattered overview / fly into focus.
function Rig({ focus, cosmicIndex, positions, groupRefs, isMobile }) {
  const cam = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const look = useRef((isMobile ? new Vector3(0, 0, MOBILE_Z) : OVERVIEW_LOOK).clone())
  const dPos = useRef(new Vector3())
  const dLook = useRef(new Vector3())
  // phone carousel: smoothed camera centre / distance / vertical aim
  const camX = useRef(cosmicIndex * MOBILE_GAP)
  const camZ = useRef(MOBILE_Z + COSMIC[cosmicIndex].focusDist * BROWSE_MULT)
  const lookY = useRef(0)

  useFrame(() => {
    const tanHalfFov = Math.tan((cam.fov * Math.PI) / 360)

    if (isMobile) {
      const o = COSMIC[cosmicIndex]
      // pan the short way to the current object (endless loop)
      const target = nearest(cosmicIndex * MOBILE_GAP, camX.current)
      camX.current = MathUtils.lerp(camX.current, target, focus != null ? 0.1 : 0.12)

      // place every object at its nearest copy to the camera (wrap off-screen)
      groupRefs.current.forEach((g, i) => {
        if (g) g.position.x = nearest(i * MOBILE_GAP, camX.current)
      })

      // distance + vertical aim: when focused, pull a little closer and aim
      // below the object so it sits in the top half, above the info sheet.
      const fd = o.focusDist * (focus != null ? FOCUS_MULT : BROWSE_MULT)
      const targetZ = MOBILE_Z + fd
      const targetLookY = focus != null ? -0.5 * tanHalfFov * fd : 0
      camZ.current = MathUtils.lerp(camZ.current, targetZ, focus != null ? 0.08 : 0.1)
      lookY.current = MathUtils.lerp(lookY.current, targetLookY, 0.12)

      cam.position.set(camX.current, 0, camZ.current)
      cam.lookAt(camX.current, lookY.current, MOBILE_Z)
      return
    }

    // ---- desktop ----
    if (focus == null) {
      dPos.current.copy(OVERVIEW_POS)
      dLook.current.copy(OVERVIEW_LOOK)
    } else {
      const o = COSMIC[focus]
      const p = positions[focus]
      // Aim right of the object by half the side-panel's angular width so it
      // sits centred in the screen area NOT covered by the panel.
      const panelW = Math.min(410, size.width * 0.92)
      const offX = (o.focusDist * tanHalfFov * panelW) / size.height
      const lift = o.focusLift || 0
      dPos.current.set(p[0], p[1], p[2] + o.focusDist)
      dLook.current.set(p[0] + offX, p[1] - lift, p[2])
    }
    const k = focus == null ? 0.025 : 0.05
    cam.position.lerp(dPos.current, k)
    look.current.lerp(dLook.current, k)
    cam.lookAt(look.current)
  })

  return null
}

export default function CosmicScene({ focus, cosmicIndex = 0, onSelect, onHover, onObjectHover, isMobile }) {
  const positions = COSMIC.map((o) => o.position)
  const groupRefs = useRef([])

  const startPos = isMobile
    ? [cosmicIndex * MOBILE_GAP, 0, MOBILE_Z + COSMIC[cosmicIndex].focusDist * BROWSE_MULT]
    : [0, 1, 13]

  return (
    <>
      <PerspectiveCamera makeDefault fov={50} position={startPos} near={0.1} far={300} />
      <Rig
        focus={focus}
        cosmicIndex={cosmicIndex}
        positions={positions}
        groupRefs={groupRefs}
        isMobile={isMobile}
      />

      {COSMIC.map((o, i) => {
        const C = COMPONENTS[o.type]
        return (
          <group
            key={o.id}
            // desktop: fixed scattered position. phone: the Rig positions it
            // imperatively each frame, so we seed the row position once on mount.
            ref={(el) => {
              groupRefs.current[i] = el
              if (el && isMobile && el.userData.seeded === undefined) {
                el.position.set(i * MOBILE_GAP, 0, MOBILE_Z)
                el.userData.seeded = true
              }
            }}
            position={isMobile ? undefined : positions[i]}
            scale={o.scale || 1}
          >
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
