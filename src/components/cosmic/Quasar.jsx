import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import AccretionDisk from './AccretionDisk.jsx'
import Beam from './Beam.jsx'
import { Glow, hdr } from './shared.jsx'

const CORE = hdr(2.9, 2.2, 1.5)
const JET_CORE = hdr(2.4, 2.8, 3.8)
const JET_GLOW = hdr(1.1, 1.7, 3.0)

export default function Quasar() {
  const disk = useRef()
  useFrame((_, dt) => {
    if (disk.current) disk.current.rotation.z += dt * 0.45
  })

  return (
    <group rotation={[0.35, 0.2, 0.32]}>
      {/* blazing core */}
      <mesh>
        <sphereGeometry args={[0.4, 48, 48]} />
        <meshBasicMaterial color={CORE} toneMapped={false} />
      </mesh>

      {/* glowing accretion disk */}
      <group ref={disk} rotation={[1.32, 0, 0]}>
        <AccretionDisk inner={0.46} outer={1.8} intensity={2.2} doppler={0.5} speed={1.3}
          colA="#fff0d8" colB="#ff9a3a" colC="#5a1500" />
      </group>

      {/* twin relativistic jets (thin & bright) */}
      <Beam length={3.6} radius={0.07} core={JET_CORE} glow={JET_GLOW} />
      <group rotation={[Math.PI, 0, 0]}>
        <Beam length={3.6} radius={0.07} core={JET_CORE} glow={JET_GLOW} />
      </group>

      <Glow color="#ffb060" scale={4} opacity={0.4} />
    </group>
  )
}
