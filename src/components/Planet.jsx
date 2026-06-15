import { forwardRef, useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import {
  TextureLoader,
  DoubleSide,
  RingGeometry,
  Vector3,
  Color,
  ClampToEdgeWrapping,
  SRGBColorSpace,
} from 'three'
/**
 * A single celestial body. The OUTER group's transform (position + scale) is
 * driven imperatively by the Carousel each frame, so we just forward a ref to
 * it. Inside, a tilt group holds the spinning sphere (+ optional rings/clouds).
 */
const Planet = forwardRef(function Planet({ body, index, onSelect }, ref) {
  const spinRef = useRef()

  const map = useLoader(TextureLoader, body.texture)
  const cloudMap = useLoader(TextureLoader, body.clouds || body.texture)
  const ringMap = useLoader(TextureLoader, body.ring || body.texture)

  map.colorSpace = SRGBColorSpace
  // crisp textures at grazing angles
  if (map.anisotropy !== 16) {
    map.anisotropy = 16
    map.needsUpdate = true
  }

  const r = body.visualRadius

  // The cloud layer is a child of the spin group, so it rotates WITH the planet.
  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += body.rotationSpeed * delta * 1.3
  })

  // HDR warm colour pushes the Sun above the bloom threshold so it glows naturally.
  const sunColor = useMemo(() => new Color(2.6, 1.9, 1.25), [])

  // Saturn's ring needs custom UVs: the strip texture must map radially.
  const ringGeometry = useMemo(() => {
    if (!body.ring) return null
    const inner = r * 1.28
    const outer = r * 2.3
    const geo = new RingGeometry(inner, outer, 180, 1)
    const pos = geo.attributes.position
    const uv = geo.attributes.uv
    const v = new Vector3()
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i)
      const t = (v.length() - inner) / (outer - inner)
      uv.setXY(i, t, 0.5)
    }
    uv.needsUpdate = true
    return geo
  }, [body.ring, r])

  if (body.ring) {
    ringMap.colorSpace = SRGBColorSpace
    ringMap.wrapS = ClampToEdgeWrapping
    ringMap.wrapT = ClampToEdgeWrapping
  }

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
            {body.isStar ? (
              <meshBasicMaterial map={map} color={sunColor} toneMapped={false} />
            ) : (
              <meshStandardMaterial map={map} roughness={0.88} metalness={0} />
            )}
          </mesh>

          {/* Earth cloud layer (rotates with the planet) */}
          {body.clouds && (
            <mesh scale={1.012}>
              <sphereGeometry args={[r, 64, 64]} />
              <meshStandardMaterial
                map={cloudMap}
                transparent
                opacity={0.62}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Saturn's rings */}
          {ringGeometry && (
            <mesh geometry={ringGeometry} rotation={[Math.PI / 2.05, 0, 0]}>
              <meshStandardMaterial
                map={ringMap}
                side={DoubleSide}
                transparent
                alphaTest={0.02}
                roughness={1}
                depthWrite={false}
              />
            </mesh>
          )}
        </group>
      </group>
    </group>
  )
})

export default Planet
