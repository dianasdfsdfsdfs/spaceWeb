import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import AccretionDisk from './AccretionDisk.jsx'
import { Glow, hdr } from './shared.jsx'

const R = 0.7 // event-horizon radius
const PHOTON = hdr(3.0, 2.2, 1.5)

export default function BlackHole() {
  const diskA = useRef()

  useFrame((_, dt) => {
    // slow spin of the edge-on disk for life
    if (diskA.current) diskA.current.rotation.z += dt * 0.05
  })

  return (
    <group rotation={[0.18, 0, 0.05]}>
      {/* event horizon — pure black, occludes the disk behind it */}
      <mesh>
        <sphereGeometry args={[R, 64, 64]} />
        <meshBasicMaterial color="#000000" toneMapped={false} />
      </mesh>

      {/* bright photon ring hugging the horizon (faces the camera) */}
      <mesh>
        <ringGeometry args={[R * 1.02, R * 1.14, 96]} />
        <meshBasicMaterial color={PHOTON} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>

      {/* face-on halo (the over/under lensed arcs) */}
      <AccretionDisk inner={R * 1.15} outer={R * 3.4} intensity={1.8} doppler={0.3} speed={0.6} />

      {/* near edge-on disk — the bright band crossing the hole */}
      <group ref={diskA} rotation={[1.46, 0, 0]}>
        <AccretionDisk inner={R * 1.1} outer={R * 4.0} intensity={2.4} doppler={0.6} speed={1.0} />
      </group>

      <Glow color="#ff8a3a" scale={9} opacity={0.18} />
    </group>
  )
}
