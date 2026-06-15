import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, TubeGeometry, CatmullRomCurve3, Vector3 } from 'three'
import StarSurface from './StarSurface.jsx'
import { Glow, hdr } from './shared.jsx'

const FIELD = hdr(1.5, 2.3, 3.7)
const COMPANION = hdr(2.0, 2.4, 3.2)

export default function Magnetar() {
  const cage = useRef()

  // one dipole field-line loop (pinched at the poles, bulging at the equator)
  const loop = useMemo(() => {
    const pts = []
    const h = 0.74 // pole reach (just outside the star)
    const w = 1.2 // equator bulge
    for (let i = 0; i <= 72; i++) {
      const t = (i / 72) * Math.PI * 2
      pts.push(new Vector3(Math.sin(t) * w, Math.cos(t) * h, 0))
    }
    return new TubeGeometry(new CatmullRomCurve3(pts, true), 90, 0.012, 6, true)
  }, [])

  useFrame((_, dt) => {
    if (cage.current) cage.current.rotation.y += dt * 0.15
  })

  return (
    <group rotation={[0.2, 0, 0.12]}>
      {/* bright blue-white star */}
      <StarSurface radius={0.6} low={[0.4, 0.85, 1.7]} high={[1.7, 2.1, 2.9]} base={0.7} amp={0.65} rim={1.3} turb={4.0} />

      {/* magnetic field-line cage */}
      <group ref={cage}>
        {Array.from({ length: 7 }).map((_, k) => (
          <mesh key={k} geometry={loop} rotation={[0, (k * Math.PI) / 7, 0]}>
            <meshBasicMaterial color={FIELD} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* small companion (as in the reference photo) */}
      <group position={[1.7, 0.95, 0.4]}>
        <mesh>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshBasicMaterial color={COMPANION} toneMapped={false} />
        </mesh>
        <Glow color="#bcd8ff" scale={0.7} opacity={0.8} />
      </group>

      <Glow color="#7fb6ff" scale={3} opacity={0.7} />
    </group>
  )
}
