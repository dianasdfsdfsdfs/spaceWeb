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
import Atmosphere from './Atmosphere.jsx'

/**
 * A single celestial body. The OUTER group's transform (position + scale) is
 * driven imperatively by the Carousel each frame, so we just forward a ref to
 * it. Inside, a tilt group holds the spinning sphere (+ optional rings/clouds).
 */
const Planet = forwardRef(function Planet({ body, index, onSelect }, ref) {
  const spinRef = useRef()
  const cloudRef = useRef()

  const map = useLoader(TextureLoader, body.texture)
  const cloudMap = useLoader(TextureLoader, body.clouds || body.texture)
  const ringMap = useLoader(TextureLoader, body.ring || body.texture)

  map.colorSpace = SRGBColorSpace

  const r = body.visualRadius

  useFrame((_, delta) => {
    if (spinRef.current) spinRef.current.rotation.y += body.rotationSpeed * delta * 2
    if (cloudRef.current) cloudRef.current.rotation.y += body.rotationSpeed * delta * 2.6
  })

  // HDR warm colour pushes the Sun above the bloom threshold so it glows naturally.
  const sunColor = useMemo(() => new Color(2.6, 1.9, 1.25), [])

  // Saturn's ring needs custom UVs: the strip texture must map radially
  // (inner edge -> outer edge), not be planar-projected.
  const ringGeometry = useMemo(() => {
    if (!body.ring) return null
    const inner = r * 1.28
    const outer = r * 2.3
    const geo = new RingGeometry(inner, outer, 160, 1)
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
            <sphereGeometry args={[r, 96, 96]} />
            {body.isStar ? (
              <meshBasicMaterial map={map} color={sunColor} toneMapped={false} />
            ) : (
              <meshStandardMaterial map={map} roughness={0.92} metalness={0.02} />
            )}
          </mesh>

          {/* Earth cloud layer */}
          {body.clouds && (
            <mesh ref={cloudRef} scale={1.015}>
              <sphereGeometry args={[r, 64, 64]} />
              <meshStandardMaterial
                map={cloudMap}
                transparent
                opacity={0.5}
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

      {/* Atmospheric rim glow (not for the Sun) */}
      {!body.isStar && body.atmosphere && (
        <Atmosphere
          radius={r}
          color={body.atmosphere.color}
          intensity={body.atmosphere.intensity}
          power={body.atmosphere.power}
        />
      )}
    </group>
  )
})

export default Planet
