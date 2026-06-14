import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import Planet from './Planet.jsx'
import { BODIES } from '../data/planets.js'

const RADIUS = 5
const STEP = (Math.PI * 2) / BODIES.length

// On-screen target radius (world units) for the focused body vs background bodies.
const FOCUS_APPARENT = 1.05
const BG_APPARENT = 0.42
const CLICK_BOOST = 1.12 // extra growth when a planet is opened (focus mode)

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
      // shift the ring left when the info panel is open so the NEXT planet
      // (which flies in from the right) clears the panel and stays visible
      const targetX = focusMode ? -1.5 : 0
      groupRef.current.position.x = MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.1,
      )
    }

    // Per-body APPARENT size is normalized: whichever body is in focus is shown
    // at the same on-screen size regardless of its real size; the others shrink
    // into the background. We convert a target apparent radius into a scale by
    // dividing out each body's own visualRadius.
    planetRefs.current.forEach((g, i) => {
      if (!g) return
      const worldAngle = wrap(i * STEP + rot.current)
      const frontness = Math.cos(worldAngle) // 1 at front, -1 at back
      const t = Math.max(0, frontness)
      const focusT = t * t * t // sharp falloff so only the front body is "big"
      const isActive = i === activeIndex

      let apparent = BG_APPARENT + (FOCUS_APPARENT - BG_APPARENT) * focusT
      if (focusMode && isActive) apparent *= CLICK_BOOST // grow a bit when opened
      if (focusMode && !isActive) apparent *= 0.85 // keep neighbours clearly visible

      const targetScale = apparent / BODIES[i].visualRadius
      g.scale.setScalar(MathUtils.lerp(g.scale.x, targetScale, 0.15))

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
