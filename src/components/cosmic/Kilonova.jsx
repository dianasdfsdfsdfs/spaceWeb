import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import StarSurface from './StarSurface.jsx'
import { glowTexture, hdr } from './shared.jsx'

const RING = hdr(1.2, 2.0, 3.2)
const FLASH = hdr(2.6, 2.9, 3.7) // bright white-blue burst

// blue-white neutron-star look (textured, like the photo)
const STAR = {
  low: [0.4, 0.72, 1.5],
  high: [1.7, 2.05, 2.7],
  base: 0.8,
  amp: 0.5,
  rim: 1.0,
  turb: 4.2,
}

const CYCLE = 7.0
const T_INSPIRAL = 5.0
const T_COLLAPSE = 0.4 // squeeze into a point
const T_EXPLODE = CYCLE - T_INSPIRAL - T_COLLAPSE

export default function Kilonova() {
  const a = useRef()
  const b = useRef()
  const burst = useRef()
  const burstMat = useRef()
  const ring = useRef()
  const tex = useMemo(glowTexture, [])
  const t = useRef(Math.random() * CYCLE)

  useFrame((_, dt) => {
    t.current += dt
    const ct = t.current % CYCLE

    if (ct < T_INSPIRAL) {
      // two stars orbit and spiral inward, speeding up as they approach
      const p = ct / T_INSPIRAL
      const r = 0.6 * Math.pow(1 - p, 0.85) + 0.02
      const ang = ct * 1.1 + p * p * 11
      const sIn = Math.min(1, ct / 0.5)
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
      if (burst.current) burst.current.scale.setScalar(0.001)
      if (burstMat.current) burstMat.current.opacity = 0
      if (ring.current) ring.current.material.opacity = 0
    } else if (ct < T_INSPIRAL + T_COLLAPSE) {
      // collapse: the merged mass squeezes into a tiny, intense point
      const cp = (ct - T_INSPIRAL) / T_COLLAPSE
      if (a.current) a.current.visible = false
      if (b.current) b.current.visible = false
      if (burst.current) burst.current.scale.setScalar(0.8 - cp * 0.64)
      if (burstMat.current) burstMat.current.opacity = 0.75 + cp * 0.25
      if (ring.current) ring.current.material.opacity = 0
    } else {
      // sharp explosion: the point bursts outward into a flash + shockwave shell
      const ep = (ct - T_INSPIRAL - T_COLLAPSE) / T_EXPLODE
      const e = 1 - Math.pow(1 - ep, 3) // ease-out -> fast start, sharp burst
      if (a.current) a.current.visible = false
      if (b.current) b.current.visible = false
      if (burst.current) burst.current.scale.setScalar(0.16 + e * 3.2)
      if (burstMat.current) burstMat.current.opacity = Math.max(0, 1 - ep * 1.2)
      if (ring.current) {
        ring.current.scale.setScalar(0.16 + e * 4.2)
        ring.current.material.opacity = 0.7 * (1 - ep)
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

      {/* merged point that collapses, then bursts into the explosion flash */}
      <sprite ref={burst} scale={[0.001, 0.001, 0.001]}>
        <spriteMaterial
          ref={burstMat}
          map={tex}
          color={FLASH}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* expanding ejecta shockwave shell */}
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
