import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { COSMIC } from '../data/cosmicObjects.js'
import BlackHole from './cosmic/BlackHole.jsx'
import Quasar from './cosmic/Quasar.jsx'
import Pulsar from './cosmic/Pulsar.jsx'
import Kilonova from './cosmic/Kilonova.jsx'
import Magnetar from './cosmic/Magnetar.jsx'
import Nebula from './cosmic/Nebula.jsx'

const COMPONENTS = {
  blackhole: BlackHole,
  quasar: Quasar,
  pulsar: Pulsar,
  kilonova: Kilonova,
  magnetar: Magnetar,
  nebula: Nebula,
}

const OVERVIEW_POS = new Vector3(0, 0.5, 15)
const OVERVIEW_LOOK = new Vector3(0, -0.5, -12)

// Smoothly flies the camera between the scattered overview and a focused object.
function Rig({ focus }) {
  const cam = useThree((s) => s.camera)
  const look = useRef(OVERVIEW_LOOK.clone())
  const dPos = useRef(new Vector3())
  const dLook = useRef(new Vector3())

  useFrame(() => {
    if (focus == null) {
      dPos.current.copy(OVERVIEW_POS)
      dLook.current.copy(OVERVIEW_LOOK)
    } else {
      const o = COSMIC[focus]
      // sit slightly to the right of the object so it reads left-of-centre
      // (leaving room for the info panel), and `focusDist` in front of it.
      // Offsets scale with focusDist to keep consistent framing.
      dPos.current.set(
        o.position[0] + o.focusDist * 0.2,
        o.position[1] + o.focusDist * 0.06,
        o.position[2] + o.focusDist,
      )
      dLook.current.set(o.position[0], o.position[1], o.position[2])
    }
    cam.position.lerp(dPos.current, 0.045)
    look.current.lerp(dLook.current, 0.045)
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
          <group
            key={o.id}
            position={o.position}
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
            <C />
            {/* invisible, raycastable hit area for reliable clicking */}
            <mesh>
              <sphereGeometry args={[2.2, 16, 16]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        )
      })}
    </>
  )
}
