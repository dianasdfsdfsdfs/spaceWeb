import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import { Glow, hdr } from './shared.jsx'

const STAR = hdr(2.4, 2.9, 3.8)
const JET = hdr(1.6, 2.4, 3.4)

export default function Kilonova() {
  const a = useRef()
  const b = useRef()
  const glow = useRef()
  const t = useRef(0)

  useFrame((_, dt) => {
    t.current += dt
    // two stars whirl around their common centre
    const ang = t.current * 1.1
    const r = 0.32
    if (a.current) a.current.position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0)
    if (b.current) b.current.position.set(-Math.cos(ang) * r, -Math.sin(ang) * r, 0)
    if (glow.current) glow.current.scale.setScalar(0.85 + 0.25 * Math.sin(t.current * 2.4))
  })

  return (
    <group rotation={[0.25, 0, 0.3]}>
      <mesh ref={a}>
        <sphereGeometry args={[0.24, 40, 40]} />
        <meshBasicMaterial color={STAR} toneMapped={false} />
      </mesh>
      <mesh ref={b}>
        <sphereGeometry args={[0.24, 40, 40]} />
        <meshBasicMaterial color={STAR} toneMapped={false} />
      </mesh>

      {/* polar jets */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * 1.6, 0]} rotation={[s < 0 ? Math.PI : 0, 0, 0]}>
          <coneGeometry args={[0.3, 2.8, 24, 1, true]} />
          <meshBasicMaterial color={JET} transparent opacity={0.4} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} />
        </mesh>
      ))}

      <group ref={glow}>
        <Glow color="#aee0ff" scale={3.6} opacity={0.75} />
      </group>
    </group>
  )
}
