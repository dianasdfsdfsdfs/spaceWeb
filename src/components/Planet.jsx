import { forwardRef, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader, DoubleSide, AdditiveBlending, BackSide } from 'three'

/**
 * A single celestial body. The OUTER group's transform (position + scale) is
 * driven imperatively by the Carousel each frame, so we just forward a ref to
 * it. Inside, a tilt group holds the spinning sphere (+ optional rings/clouds).
 */
const Planet = forwardRef(function Planet({ body, index, onSelect }, ref) {
  const spinRef = useRef()
  const cloudRef = useRef()

  const map = useLoader(TextureLoader, body.texture)
  const cloudMap = body.clouds ? useLoader(TextureLoader, body.clouds) : null
  const ringMap = body.ring ? useLoader(TextureLoader, body.ring) : null

  const r = body.visualRadius

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += body.rotationSpeed * delta * 2
    if (cloudRef.current) cloudRef.current.rotation.y += body.rotationSpeed * delta * 2.6
  })

  const material = useMemo(() => {
    if (body.isStar) {
      // The Sun glows on its own — emissive so bloom picks it up.
      return <meshBasicMaterial map={map} toneMapped={false} />
    }
    return <meshStandardMaterial map={map} roughness={1} metalness={0} />
  }, [map, body.isStar])

  return (
    <group ref={ref}>
      {/* axial tilt */}
      <group rotation={[0, 0, body.axialTilt]}>
        <group ref={spinRef}>
          <mesh
            onClick={(e) => {
              e.stopPropagation()
              onSelect(index)
            }}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = 'default')}
          >
            <sphereGeometry args={[r, 64, 64]} />
            {material}
          </mesh>

          {/* Earth cloud layer */}
          {cloudMap && (
            <mesh ref={cloudRef} scale={1.012}>
              <sphereGeometry args={[r, 48, 48]} />
              <meshStandardMaterial
                map={cloudMap}
                transparent
                opacity={0.45}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Saturn's rings */}
          {ringMap && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r * 1.35, r * 2.3, 90]} />
              <meshBasicMaterial
                map={ringMap}
                side={DoubleSide}
                transparent
                opacity={0.95}
              />
            </mesh>
          )}
        </group>
      </group>

      {/* Soft glow halo for the Sun */}
      {body.isStar && (
        <mesh scale={1.35}>
          <sphereGeometry args={[r, 32, 32]} />
          <meshBasicMaterial
            color={body.color}
            transparent
            opacity={0.25}
            side={BackSide}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
})

export default Planet
