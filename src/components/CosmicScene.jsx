import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import { Vector3 } from 'three'
import { COSMIC } from '../data/cosmicObjects.js'
import BlackHole from './cosmic/BlackHole.jsx'
import Pulsar from './cosmic/Pulsar.jsx'
import PhotoObject from './cosmic/PhotoObject.jsx'

// Procedural objects (the rest use real photos via PhotoObject).
const COMPONENTS = {
  blackhole: BlackHole,
  pulsar: Pulsar,
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
      // Camera straight in front of the object; we AIM a little to the right of
      // it so the object shifts left on screen and sits centred in the area NOT
      // covered by the info panel (rather than dead-centre under the panel).
      dPos.current.set(o.position[0], o.position[1], o.position[2] + o.focusDist)
      dLook.current.set(o.position[0] + o.focusDist * 0.085, o.position[1], o.position[2])
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
            {o.image ? (
              <PhotoObject src={o.image} size={o.photoSize} spin={o.spin || 0} />
            ) : (
              <C />
            )}
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
