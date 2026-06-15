import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Beam from './Beam.jsx'
import { Glow, hdr } from './shared.jsx'

const CORE = hdr(2.0, 2.6, 3.6)
const BEAM_CORE = hdr(2.6, 3.0, 3.9)
const BEAM_GLOW = hdr(1.2, 2.0, 3.6)

export default function Pulsar() {
  const spin = useRef()
  // fast rotation — the tilted beams sweep like a lighthouse
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 2.0
  })

  return (
    <group rotation={[0.45, 0, 0.1]}>
      <group ref={spin}>
        <mesh>
          <sphereGeometry args={[0.3, 48, 48]} />
          <meshBasicMaterial color={CORE} toneMapped={false} />
        </mesh>

        {/* magnetic axis tilted from the spin (Y) axis so the beams visibly sweep */}
        <group rotation={[0, 0, 0.6]}>
          <Beam length={4.6} radius={0.085} core={BEAM_CORE} glow={BEAM_GLOW} />
          <group rotation={[Math.PI, 0, 0]}>
            <Beam length={4.6} radius={0.085} core={BEAM_CORE} glow={BEAM_GLOW} />
          </group>
        </group>
      </group>

      <Glow color="#86c9ff" scale={2.6} opacity={0.75} />
    </group>
  )
}
