import { AdditiveBlending, DoubleSide } from 'three'

/**
 * A thin, near-straight beam/jet pointing +Y from the origin (like a quasar jet,
 * not a fat cone): a bright narrow core that tapers slightly to its tip, wrapped
 * in a restrained glow.
 */
export default function Beam({ length = 3, radius = 0.04, core, glow, opacity = 0.95 }) {
  return (
    <group>
      {/* bright narrow core (slightly tapered tip, mostly straight) */}
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[radius * 0.3, radius, length, 14, 1, true]} />
        <meshBasicMaterial
          color={core}
          transparent
          opacity={opacity}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* soft, narrow glow sheath */}
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[radius * 0.9, radius * 1.7, length, 16, 1, true]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.12}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
