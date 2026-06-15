import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import Beam from './Beam.jsx'
import { Glow, hdr } from './shared.jsx'

const STAR = hdr(2.6, 3.0, 3.9)
const JET_CORE = hdr(2.2, 2.8, 3.8)
const JET_GLOW = hdr(1.2, 2.0, 3.4)

export default function Kilonova() {
  const a = useRef()
  const b = useRef()
  const glow = useRef()
  const ring = useRef()
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    const ang = t.current * 1.3
    const r = 0.3
    if (a.current) a.current.position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0)
    if (b.current) b.current.position.set(-Math.cos(ang) * r, -Math.sin(ang) * r, 0)
    if (glow.current) glow.current.scale.setScalar(0.85 + 0.25 * Math.sin(t.current * 2.5))
    if (ring.current) {
      const phase = (t.current % 3) / 3 // 0..1 loop
      ring.current.scale.setScalar(0.6 + phase * 3.0)
      ring.current.material.opacity = Math.max(0, 0.5 * (1 - phase))
    }
  })

  return (
    <group rotation={[0.25, 0, 0.2]}>
      <mesh ref={a}>
        <sphereGeometry args={[0.22, 40, 40]} />
        <meshBasicMaterial color={STAR} toneMapped={false} />
      </mesh>
      <mesh ref={b}>
        <sphereGeometry args={[0.22, 40, 40]} />
        <meshBasicMaterial color={STAR} toneMapped={false} />
      </mesh>

      {/* expanding shockwave ring */}
      <mesh ref={ring} rotation={[1.4, 0, 0]}>
        <ringGeometry args={[0.55, 0.62, 64]} />
        <meshBasicMaterial color={JET_GLOW} transparent opacity={0.5} blending={AdditiveBlending} side={DoubleSide} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* polar jets */}
      <Beam length={3.0} radius={0.06} core={JET_CORE} glow={JET_GLOW} />
      <group rotation={[Math.PI, 0, 0]}>
        <Beam length={3.0} radius={0.06} core={JET_CORE} glow={JET_GLOW} />
      </group>

      <group ref={glow}>
        <Glow color="#aee0ff" scale={3.6} opacity={0.85} />
      </group>
    </group>
  )
}
