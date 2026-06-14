import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import Planet from './Planet.jsx'
import { BODIES } from '../data/planets.js'

const RADIUS = 5
const STEP = (Math.PI * 2) / BODIES.length

// Normalize an angle to [-PI, PI]
function wrap(a) {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

export default function Carousel({ activeIndex, focusMode, onSelect }) {
  const groupRef = useRef()
  const planetRefs = useRef([])
  const rot = useRef(0)

  useFrame(() => {
    // Target rotation brings the active body to the front (angle 0),
    // taking the shortest path around the circle.
    const desired = -activeIndex * STEP
    let target = rot.current + wrap(desired - rot.current)
    rot.current = MathUtils.lerp(rot.current, target, 0.12)

    if (groupRef.current) {
      groupRef.current.rotation.y = rot.current
      // slide the whole ring left when an info panel is open
      const targetX = focusMode ? -2.1 : 0
      groupRef.current.position.x = MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.1,
      )
    }

    // Per-body scale + fade based on how close it is to the front.
    planetRefs.current.forEach((g, i) => {
      if (!g) return
      const worldAngle = wrap(i * STEP + rot.current)
      const frontness = Math.cos(worldAngle) // 1 at front, -1 at back
      const t = Math.max(0, frontness)
      const isActive = i === activeIndex

      let mult = 0.32 + 0.68 * t * t
      if (focusMode && !isActive) mult *= 0.45
      g.scale.setScalar(MathUtils.lerp(g.scale.x, mult, 0.15))

      // place on the circle (in the group's local frame)
      g.position.set(Math.sin(i * STEP) * RADIUS, 0, Math.cos(i * STEP) * RADIUS)

      // hide bodies that have rotated to the far back
      g.visible = frontness > -0.55
    })
  })

  return (
    <group ref={groupRef}>
      {BODIES.map((body, i) => (
        <Planet
          key={body.id}
          body={body}
          index={i}
          onSelect={onSelect}
          ref={(el) => (planetRefs.current[i] = el)}
        />
      ))}
    </group>
  )
}
