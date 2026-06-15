import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Beam from './Beam.jsx'
import StarSurface from './StarSurface.jsx'
import { Glow, hdr } from './shared.jsx'

const BEAM_CORE = hdr(2.4, 2.9, 3.9)
const BEAM_GLOW = hdr(1.2, 1.9, 3.4)

export default function Pulsar() {
  const spin = useRef()
  // fast rotation — the tilted beams sweep like a lighthouse
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 1.8
  })

  return (
    <group rotation={[0.45, 0, 0.1]}>
      <group ref={spin}>
        <StarSurface radius={0.34} low={[0.6, 0.95, 1.7]} high={[1.9, 2.2, 2.9]} base={0.95} amp={0.4} rim={1.6} turb={3.2} />

        {/* magnetic axis tilted from the spin (Y) axis -> the beams sweep */}
        <group rotation={[0, 0, 0.55]}>
          <Beam length={5.2} radius={0.05} core={BEAM_CORE} glow={BEAM_GLOW} />
          <group rotation={[Math.PI, 0, 0]}>
            <Beam length={5.2} radius={0.05} core={BEAM_CORE} glow={BEAM_GLOW} />
          </group>
        </group>
      </group>

      <Glow color="#8fcaff" scale={2.4} opacity={0.6} />
    </group>
  )
}
