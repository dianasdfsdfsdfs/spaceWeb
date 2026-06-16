import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import StarSurface from './StarSurface.jsx'
import { Glow, hdr } from './shared.jsx'

const RING = hdr(1.2, 2.0, 3.2)

// blue-white neutron-star look (textured, like the photo)
const STAR = {
  low: [0.4, 0.72, 1.5],
  high: [1.7, 2.05, 2.7],
  base: 0.8,
  amp: 0.5,
  rim: 1.0,
  turb: 4.2,
}

const CYCLE = 7.0 // full loop seconds
const INSPIRAL = 5.2 // seconds spent spiralling in

export default function Kilonova() {
  const a = useRef()
  const b = useRef()
  const flash = useRef()
  const ring = useRef()
  const t = useRef(Math.random() * CYCLE)

  useFrame((_, dt) => {
    t.current += dt
    const ct = t.current % CYCLE

    if (ct < INSPIRAL) {
      // two stars orbit and spiral inward, speeding up as they approach
      const p = ct / INSPIRAL // 0..1
      const r = 0.6 * Math.pow(1 - p, 0.85) + 0.02
      const ang = ct * 1.1 + p * p * 11 // accelerating orbit
      const sIn = Math.min(1, ct / 0.5) // scale-in at cycle start
      if (a.current) {
        a.current.position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0)
        a.current.scale.setScalar(sIn)
        a.current.visible = true
      }
      if (b.current) {
        b.current.position.set(-Math.cos(ang) * r, -Math.sin(ang) * r, 0)
        b.current.scale.setScalar(sIn)
        b.current.visible = true
      }
      if (flash.current) flash.current.scale.setScalar(0.25 + p * 0.45)
      if (ring.current) ring.current.material.opacity = 0
    } else {
      // merged: bright flash + expanding ejecta shell, stars gone
      const mp = (ct - INSPIRAL) / (CYCLE - INSPIRAL) // 0..1
      if (a.current) a.current.visible = false
      if (b.current) b.current.visible = false
      if (flash.current) flash.current.scale.setScalar(1.9 * (1 - mp) + 0.15)
      if (ring.current) {
        ring.current.scale.setScalar(0.3 + mp * 3.4)
        ring.current.material.opacity = 0.6 * (1 - mp)
      }
    }
  })

  return (
    <group rotation={[0.5, 0, 0.2]}>
      <group ref={a}>
        <StarSurface radius={0.24} {...STAR} />
      </group>
      <group ref={b}>
        <StarSurface radius={0.24} {...STAR} />
      </group>

      {/* merge flash */}
      <group ref={flash}>
        <Glow color="#cfe6ff" scale={1} opacity={0.9} />
      </group>

      {/* expanding ejecta shell */}
      <mesh ref={ring} rotation={[1.35, 0, 0]}>
        <ringGeometry args={[0.5, 0.64, 72]} />
        <meshBasicMaterial
          color={RING}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          side={DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
