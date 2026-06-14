import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { TextureLoader, BackSide } from 'three'

export default function Starfield() {
  const skyRef = useRef()
  const milkyway = useLoader(TextureLoader, '/textures/2k_stars_milky_way.jpg')

  useFrame((_, delta) => {
    // very slow drift so the sky feels alive
    if (skyRef.current) skyRef.current.rotation.y += delta * 0.003
  })

  return (
    <group ref={skyRef}>
      {/* distant milky-way backdrop */}
      <mesh scale={-1}>
        <sphereGeometry args={[90, 64, 64]} />
        <meshBasicMaterial map={milkyway} side={BackSide} />
      </mesh>
      {/* crisp foreground starfield for depth */}
      <Stars radius={60} depth={40} count={6000} factor={3} saturation={0} fade speed={0.3} />
    </group>
  )
}
