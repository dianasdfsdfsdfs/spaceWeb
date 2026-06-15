import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, Float32BufferAttribute, Color } from 'three'
import { Glow, glowTexture, hdr } from './shared.jsx'

const STAR = hdr(2.2, 2.4, 3.2)

export default function Nebula() {
  const spin = useRef()
  const tex = useMemo(glowTexture, [])

  const geom = useMemo(() => {
    const N = 1500
    const pos = []
    const col = []
    const teal = new Color('#3fd6e6')
    const orange = new Color('#ff7a2a')
    const c = new Color()
    const Rr = 1.7 // ring radius
    const tube = 0.6 // ring thickness
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2
      const rr = Rr + (Math.random() * 2 - 1) * tube
      const h = (Math.random() * 2 - 1) * tube * 0.45
      pos.push(Math.cos(a) * rr, Math.sin(a) * rr, h)
      // inner edge of the ring = teal, outer edge = orange
      const tt = Math.min(1, Math.max(0, (rr - (Rr - tube)) / (2 * tube)))
      c.copy(teal).lerp(orange, tt)
      const b = 0.55 + 0.55 * Math.random()
      col.push(c.r * b, c.g * b, c.b * b)
    }
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute(pos, 3))
    g.setAttribute('color', new Float32BufferAttribute(col, 3))
    return g
  }, [])

  useFrame((_, dt) => {
    if (spin.current) spin.current.rotation.z += dt * 0.05
  })

  return (
    <group rotation={[0.5, 0.2, 0]}>
      <group ref={spin}>
        <points geometry={geom}>
          <pointsMaterial
            map={tex}
            size={0.45}
            sizeAttenuation
            vertexColors
            transparent
            opacity={0.9}
            depthWrite={false}
            blending={AdditiveBlending}
            toneMapped={false}
          />
        </points>
      </group>

      {/* glowing interior + the exposed white-dwarf core */}
      <Glow color="#39a8d0" scale={2.6} opacity={0.4} />
      <mesh>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color={STAR} toneMapped={false} />
      </mesh>
    </group>
  )
}
