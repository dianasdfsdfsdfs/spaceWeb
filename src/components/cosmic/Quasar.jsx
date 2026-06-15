import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import AccretionDisk from './AccretionDisk.jsx'
import { Glow, hdr } from './shared.jsx'

const CORE = hdr(2.6, 2.0, 1.4)
const JET = hdr(1.4, 2.0, 3.2)

export default function Quasar() {
  const disk = useRef()
  useFrame((_, dt) => {
    if (disk.current) disk.current.rotation.z += dt * 0.4
  })

  return (
    <group rotation={[0.3, 0.2, 0.35]}>
      {/* blazing core */}
      <mesh>
        <sphereGeometry args={[0.42, 48, 48]} />
        <meshBasicMaterial color={CORE} toneMapped={false} />
      </mesh>

      {/* accretion disk */}
      <group ref={disk} rotation={[1.3, 0, 0]}>
        <AccretionDisk inner={0.5} outer={1.9} intensity={2.0} doppler={0.5} speed={1.2}
          colA="#fff0d8" colB="#ff9a3a" colC="#5a1500" />
      </group>

      {/* twin relativistic jets */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, s * 1.7, 0]} rotation={[s < 0 ? Math.PI : 0, 0, 0]}>
          <coneGeometry args={[0.32, 3.0, 24, 1, true]} />
          <meshBasicMaterial color={JET} transparent opacity={0.45} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} />
        </mesh>
      ))}

      <Glow color="#ffb060" scale={5} opacity={0.4} />
    </group>
  )
}
