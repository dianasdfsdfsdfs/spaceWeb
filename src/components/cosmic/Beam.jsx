import { AdditiveBlending, DoubleSide } from 'three'

/**
 * A single bright, collimated beam/jet pointing +Y from the origin:
 * a tight bright core inside a soft flaring glow sheath. Looks like a real
 * relativistic jet / pulsar beam rather than a flat cone.
 */
export default function Beam({ length = 3, radius = 0.06, core, glow, opacity = 0.92 }) {
  return (
    <group>
      {/* tight bright core */}
      <mesh position={[0, length / 2, 0]}>
        <cylinderGeometry args={[radius * 0.45, radius, length, 16, 1, true]} />
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
      {/* soft glow sheath flaring outward toward the tip */}
      <mesh position={[0, length / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[radius * 4.5, length, 24, 1, true]} />
        <meshBasicMaterial
          color={glow}
          transparent
          opacity={0.16}
          blending={AdditiveBlending}
          depthWrite={false}
          side={DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
