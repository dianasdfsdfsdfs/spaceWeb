import { useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { TextureLoader, AdditiveBlending, SRGBColorSpace } from 'three'
import { hdr } from './shared.jsx'

// slight boost so the brightest parts cross the bloom threshold and glow
const BOOST = hdr(1.25, 1.25, 1.25)

/**
 * A real (free-licensed) deep-space photo rendered as a camera-facing billboard.
 * Additive blending makes the black background vanish, so the object floats in
 * OUR starfield; the camera fly-in + the real stars behind it give a 3D feel.
 */
export default function PhotoObject({ src, size = 4, spin = 0 }) {
  const tex = useLoader(TextureLoader, src)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  const inner = useRef()

  useFrame((_, dt) => {
    if (inner.current && spin) inner.current.rotation.z += dt * spin
  })

  const aspect = tex.image ? tex.image.width / tex.image.height : 1.4

  return (
    <Billboard>
      <mesh ref={inner}>
        <planeGeometry args={[size * aspect, size]} />
        <meshBasicMaterial
          map={tex}
          color={BOOST}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </Billboard>
  )
}
