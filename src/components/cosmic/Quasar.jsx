import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide } from 'three'
import AccretionDisk from './AccretionDisk.jsx'
import Beam from './Beam.jsx'
import { Glow, hdr } from './shared.jsx'

const CORE = hdr(3.0, 2.4, 1.6)
const JET_CORE = hdr(2.6, 3.0, 3.9)
const JET_GLOW = hdr(1.3, 1.9, 3.2)
const RAY = hdr(1.6, 2.0, 3.0)

export default function Quasar() {
  const disk = useRef()
  const rays = useRef()
  const jets = useRef()

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (disk.current) disk.current.rotation.z += dt * 0.5 // spinning disk, like the black hole
    if (rays.current) rays.current.rotation.z -= dt * 0.12 // slowly turning light rays
    if (jets.current) {
      // pulsing beams of light shooting out
      const p = 0.85 + 0.2 * Math.sin(t * 3.0)
      jets.current.scale.set(p, p, p)
    }
  })

  return (
    <group rotation={[0.42, 0.2, 0.3]}>
      {/* blazing core */}
      <mesh>
        <sphereGeometry args={[0.5, 48, 48]} />
        <meshBasicMaterial color={CORE} toneMapped={false} />
      </mesh>

      {/* rotating accretion disk */}
      <group ref={disk} rotation={[1.32, 0, 0]}>
        <AccretionDisk inner={0.55} outer={2.6} intensity={2.5} doppler={0.55} speed={1.4}
          colA="#fff1da" colB="#ff9838" colC="#5a1400" />
      </group>

      {/* slowly rotating rays of light from the core */}
      <group ref={rays}>
        {[0, 1, 2].map((k) => (
          <mesh key={k} rotation={[0, 0, (k * Math.PI) / 3]}>
            <planeGeometry args={[0.07, 8]} />
            <meshBasicMaterial color={RAY} transparent opacity={0.1} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* twin relativistic jets (pulsing) */}
      <group ref={jets}>
        <Beam length={4.6} radius={0.085} core={JET_CORE} glow={JET_GLOW} />
        <group rotation={[Math.PI, 0, 0]}>
          <Beam length={4.6} radius={0.085} core={JET_CORE} glow={JET_GLOW} />
        </group>
      </group>

      <Glow color="#ffb060" scale={5} opacity={0.45} />
    </group>
  )
}
