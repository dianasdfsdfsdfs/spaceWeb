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

// Phone overview: the wide grid won't fit a portrait screen, so re-arrange the
// six objects into a 2-column × 3-row grid (indexed by the COSMIC order) and
// pull the camera back so all of them are visible at once.
const OVERVIEW_POS_M = new Vector3(0, 0, 30)
const OVERVIEW_LOOK_M = new Vector3(0, 0, -5)
const MOBILE_POS = [
  [-4, 8.5, -5], // blackhole
  [4, 8.5, -5], // quasar
  [-4, 0, -5], // pulsar
  [4, 0, -5], // kilonova
  [-4, -8.5, -5], // magnetar
  [4, -8.5, -5], // nebula
]

// Smoothly flies the camera between the scattered overview and a focused object.
function Rig({ focus, positions, isMobile }) {
  const cam = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const look = useRef((isMobile ? OVERVIEW_LOOK_M : OVERVIEW_LOOK).clone())
  const dPos = useRef(new Vector3())
  const dLook = useRef(new Vector3())

  useFrame(() => {
    if (focus == null) {
      dPos.current.copy(isMobile ? OVERVIEW_POS_M : OVERVIEW_POS)
      dLook.current.copy(isMobile ? OVERVIEW_LOOK_M : OVERVIEW_LOOK)
    } else {
      const o = COSMIC[focus]
      const p = positions[focus]
      const tanHalfFov = Math.tan((cam.fov * Math.PI) / 360)
      if (isMobile) {
        // the info bottom-sheet covers the lower half: pull back a bit so the
        // object fits the top half, and aim below it so it sits centred there.
        const fd = o.focusDist * 1.8
        const offY = 0.45 * tanHalfFov * fd
        dPos.current.set(p[0], p[1], p[2] + fd)
        dLook.current.set(p[0], p[1] - offY, p[2])
      } else {
        // Aim the camera right of the object by exactly half the info-panel's
        // angular width, so the object sits centred in the screen area NOT
        // covered by the side panel — at any window size.
        const panelW = Math.min(410, size.width * 0.92)
        const offX = (o.focusDist * tanHalfFov * panelW) / size.height
        const lift = o.focusLift || 0
        dPos.current.set(p[0], p[1], p[2] + o.focusDist)
        dLook.current.set(p[0] + offX, p[1] - lift, p[2])
      }
    }
    // ease in a touch faster than we ease back out (smoother, less abrupt return)
    const k = focus == null ? 0.025 : 0.05
    cam.position.lerp(dPos.current, k)
    look.current.lerp(dLook.current, k)
    cam.lookAt(look.current)
  })

  return null
}

export default function CosmicScene({ focus, onSelect, onHover, onObjectHover, isMobile }) {
  const positions = isMobile ? MOBILE_POS : COSMIC.map((o) => o.position)

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        position={isMobile ? [0, 0, 30] : [0, 1, 13]}
        near={0.1}
        far={300}
      />
      <Rig focus={focus} positions={positions} isMobile={isMobile} />

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
            {/* The ONLY clickable target: a generous sphere in the overview (easy
                to select), shrunk to the centre when focused so clicking anywhere
                else exits focus. */}
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
