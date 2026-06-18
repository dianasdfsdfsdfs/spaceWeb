import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils } from 'three'
import Planet from './Planet.jsx'
import { BODIES } from '../data/planets.js'

const RADIUS = 5
const STEP = (Math.PI * 2) / BODIES.length

// --- sizing model ---
// Focused (front/active) body: ONE big size for every body, so a small planet
// like Mercury fills the centre just like Jupiter when it's in focus.
const FOCUS = 1.05 // size while just browsing between planets
const CLICK_BOOST = 1.3 // extra growth once the info panel is open (focus mode)
// Background bodies: small, with only a SUBTLE real-size difference, shrinking
// with depth so the far side of the orbit recedes. Always smaller than FOCUS,
// so the centred body is never smaller than a big planet in the background.
const BG_BASE = 0.42
const BG_EXP = 0.28
const BG_DEPTH_MIN = 0.45

// Normalize an angle to [-PI, PI]
function wrap(a) {
  while (a > Math.PI) a -= Math.PI * 2
  while (a < -Math.PI) a += Math.PI * 2
  return a
}

export default function Carousel({ activeIndex, focusMode, onSelect }) {
  const groupRef = useRef()
  const planetRefs = useRef([])
  // start already rotated to the active planet (no scroll-to-Earth on load)
  const rot = useRef(-activeIndex * STEP)

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
      const targetX = focusMode ? -1.2 : 0
      // and lift it up a bit so the (now larger) focused planet isn't cut off
      // at the bottom of the screen
      const targetY = focusMode ? 0.3 : 0
      groupRef.current.position.x = MathUtils.lerp(
        groupRef.current.position.x,
        targetX,
        0.1,
      )
      groupRef.current.position.y = MathUtils.lerp(
        groupRef.current.position.y,
        targetY,
        0.1,
      )
    }

    // Per-body APPARENT size is normalized: whichever body is in focus is shown
    // at the same on-screen size regardless of its real size; the others shrink
    // into the background. We convert a target apparent radius into a scale by
    // dividing out each body's own visualRadius.
    planetRefs.current.forEach((g, i) => {
      if (!g) return
      const vr = BODIES[i].visualRadius
      const worldAngle = wrap(i * STEP + rot.current)
      const frontness = Math.cos(worldAngle) // 1 at front, -1 at back
      const depth = (frontness + 1) / 2 // 1 near the front, 0 at the back of the orbit
      const focusBlend = Math.max(0, frontness) ** 4 // big only very near the front
      const isActive = i === activeIndex

      // background bodies: subtle real-size difference, shrinking with depth
      const bgApparent =
        BG_BASE * Math.pow(vr, BG_EXP) * (BG_DEPTH_MIN + (1 - BG_DEPTH_MIN) * depth)
      // the front/focused body reaches one big uniform size for all planets
      let apparent = bgApparent + (FOCUS - bgApparent) * focusBlend

      if (focusMode && isActive) apparent *= CLICK_BOOST // grow a bit when opened
      if (focusMode && !isActive) apparent *= 0.9 // keep neighbours clearly visible

      const targetScale = apparent / vr
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
