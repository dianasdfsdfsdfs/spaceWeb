import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Beam from './Beam.jsx'
import StarSurface from './StarSurface.jsx'
import { Glow, hdr } from './shared.jsx'

const BEAM_CORE = hdr(1.9, 2.3, 3.2)
const BEAM_GLOW = hdr(1.0, 1.6, 3.0)

export default function Pulsar() {
  const spin = useRef()
  // rotation about the (near-vertical) spin axis -> the tilted beams sweep
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 1.2
  })

  return (
    <group rotation={[0.2, 0, 0.12]}>
      <group ref={spin}>
        {/* bright blue neutron star with a visible mottled surface */}
        <StarSurface
          radius={0.45}
          low={[0.3, 0.6, 1.4]}
          high={[1.1, 1.6, 2.6]}
          base={0.65}
          amp={0.6}
          rim={0.9}
          turb={4.4}
        />

        {/* magnetic axis tilted slightly off the vertical spin axis so the two
            near-vertical beams sweep like a lighthouse */}
        <group rotation={[0, 0, 0.28]}>
          <Beam length={4.2} radius={0.03} core={BEAM_CORE} glow={BEAM_GLOW} />
          <group rotation={[Math.PI, 0, 0]}>
            <Beam length={4.2} radius={0.03} core={BEAM_CORE} glow={BEAM_GLOW} />
          </group>
        </group>
      </group>

      {/* tight glow hugging the star (not a wide halo) */}
      <Glow color="#8fc8ff" scale={1.4} opacity={0.7} />
    </group>
  )
}
