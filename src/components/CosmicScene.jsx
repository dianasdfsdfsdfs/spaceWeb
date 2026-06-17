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

const OVERVIEW_POS = new Vector3(0, 1.8, 11)
const OVERVIEW_LOOK = new Vector3(0, 1.8, -4)

// Smoothly flies the camera between the scattered overview and a focused object.
function Rig({ focus }) {
  const cam = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const look = useRef(OVERVIEW_LOOK.clone())
  const dPos = useRef(new Vector3())
  const dLook = useRef(new Vector3())

  useFrame(() => {
    if (focus == null) {
      dPos.current.copy(OVERVIEW_POS)
      dLook.current.copy(OVERVIEW_LOOK)
    } else {
      const o = COSMIC[focus]
      // Aim the camera right of the object by exactly half the info-panel's
      // angular width, so the object sits centred in the screen area NOT covered
      // by the panel — at any window size.
      const panelW = Math.min(410, size.width * 0.92)
      const tanHalfFov = Math.tan((cam.fov * Math.PI) / 360)
      const offX = (o.focusDist * tanHalfFov * panelW) / size.height
      const lift = o.focusLift || 0
      dPos.current.set(o.position[0], o.position[1], o.position[2] + o.focusDist)
      dLook.current.set(o.position[0] + offX, o.position[1] - lift, o.position[2])
    }
    // ease in a touch faster than we ease back out (smoother, less abrupt return)
    const k = focus == null ? 0.025 : 0.05
    cam.position.lerp(dPos.current, k)
    look.current.lerp(dLook.current, k)
    cam.lookAt(look.current)
  })

  return null
}

export default function CosmicScene({ focus, onSelect, onHover }) {
  return (
    <>
      <PerspectiveCamera makeDefault fov={50} position={[0, 1, 13]} near={0.1} far={300} />
      <Rig focus={focus} />

      {COSMIC.map((o, i) => {
        const C = COMPONENTS[o.type]
        return (
          <group key={o.id} position={o.position} scale={o.scale || 1}>
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
