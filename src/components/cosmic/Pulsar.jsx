import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import Beam from './Beam.jsx'
import StarSurface from './StarSurface.jsx'
import { Glow, hdr } from './shared.jsx'

// same blue-white hue as before, just a touch less blown out so the beam stays thin
const BEAM_CORE = hdr(1.8, 2.2, 3.1)
const BEAM_GLOW = hdr(1.0, 1.6, 3.0)

export default function Pulsar() {
  const spin = useRef()
  // fast rotation — the tilted beams sweep like a lighthouse
  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.y += dt * 1.8
  })

  return (
    <group rotation={[0.45, 0, 0.1]}>
      <group ref={spin}>
        {/* colourful blue neutron star with a visible mottled surface */}
        <StarSurface
          radius={0.34}
          low={[0.22, 0.5, 1.3]}
          high={[0.9, 1.45, 2.4]}
          base={0.6}
          amp={0.65}
          rim={1.1}
          turb={4.6}
        />

        {/* magnetic axis tilted from the spin (Y) axis -> the beams sweep */}
        <group rotation={[0, 0, 0.55]}>
          <Beam length={5.0} radius={0.04} core={BEAM_CORE} glow={BEAM_GLOW} />
          <group rotation={[Math.PI, 0, 0]}>
            <Beam length={5.0} radius={0.04} core={BEAM_CORE} glow={BEAM_GLOW} />
          </group>
        </group>
      </group>

      <Glow color="#7fb8ff" scale={2.4} opacity={0.5} />
    </group>
  )
}
