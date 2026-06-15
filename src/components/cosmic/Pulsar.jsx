import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import { Glow, hdr } from './shared.jsx'

const CORE = hdr(1.7, 2.5, 3.6)
const BEAM = hdr(1.2, 2.2, 3.8)

export default function Pulsar() {
  const spin = useRef()
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 1.4
  })

  return (
    <group rotation={[0.4, 0, 0.5]}>
      {/* spinning neutron star + its beams */}
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[0.3, 48, 48]} />
          <meshBasicMaterial color={CORE} toneMapped={false} />
        </mesh>
        {[1, -1].map((s) => (
          <mesh key={s} position={[0, s * 2.4, 0]} rotation={[s < 0 ? Math.PI : 0, 0, 0]}>
            <coneGeometry args={[0.5, 4.4, 24, 1, true]} />
            <meshBasicMaterial color={BEAM} transparent opacity={0.38} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} />
          </mesh>
        ))}
      </group>

      <Glow color="#86c9ff" scale={2.8} opacity={0.7} />
    </group>
  )
}
