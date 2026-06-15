import { AdditiveBlending, DoubleSide } from 'three'

/**
 * A bright, sharp beam/jet pointing +Y from the origin. It tapers to a point at
 * the tip (like a real pulsar beam / jet) with only a thin glow — not a big
 * fuzzy cone.
 */
export default function Beam({ length = 3, radius = 0.06, core, glow, opacity = 0.95 }) {
  return (
    <group>
      {/* tight bright core, tapering to a point at the tip */}
      <mesh position={[0, length / 2, 0]}>
        <coneGeometry args={[radius, length, 18, 1, true]} />
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
      {/* thin restrained glow */}
      <mesh position={[0, length / 2, 0]}>
        <coneGeometry args={[radius * 2.4, length, 22, 1, true]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.08}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
