import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { TextureLoader, AdditiveBlending, SRGBColorSpace, PlaneGeometry, Vector2 } from 'three'
import { hdr } from './shared.jsx'

const BOOST = hdr(1.25, 1.25, 1.25)

const keyVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
// Keys out the photo's own background (luminance + radial edge mask). Additive
// blend uses the alpha so the object glows in OUR starfield. No distortion.
const keyFrag = /* glsl */ `
  uniform sampler2D map;
  uniform float uLo, uHi, uInner, uOuter, uBoost, uEdge;
  uniform vec2 uCore;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(map, vUv);
    float lum = dot(t.rgb, vec3(0.299, 0.587, 0.114));
    // radial fade measured from the object's core, so opposite jets are trimmed
    // to equal length before tapering off
    float a = smoothstep(uLo, uHi, lum) * smoothstep(uOuter, uInner, distance(vUv, uCore));
    // soft fade along the plane's rectangular border so e.g. jets that reach the
    // edge taper out instead of cutting off abruptly
    if (uEdge > 0.0) {
      a *= smoothstep(0.0, uEdge, vUv.x) * smoothstep(0.0, uEdge, 1.0 - vUv.x) *
           smoothstep(0.0, uEdge, vUv.y) * smoothstep(0.0, uEdge, 1.0 - vUv.y);
    }
    if (a < 0.01) discard;
    gl_FragColor = vec4(t.rgb * uBoost, a);
  }
`

/**
 * A real deep-space photo as a camera-facing billboard.
 * - `photoKey` keys out the photo background.
 * - `spin` rotates the whole image (rotation illusion). With `core` [u,v] the
 *   geometry is shifted so that point becomes the pivot AND the framing centre,
 *   so e.g. a quasar spins around its disk core instead of drifting.
 * - keyed objects without spin gently wobble.
 */
export default function PhotoObject({ src, size = 4, spin = 0, photoKey, core }) {
  const tex = useLoader(TextureLoader, src)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8

  const keyed = !!photoKey
  const mesh = useRef()
  const phase = useRef(Math.random() * 10)

  const aspect = tex.image ? tex.image.width / tex.image.height : 1.4

  // Plane geometry, shifted so the `core` point sits at the local origin (the
  // pivot of rotation and the object's anchor point).
  const geometry = useMemo(() => {
    const w = size * aspect
    const h = size
    const g = new PlaneGeometry(w, h)
    if (core) g.translate(-(core[0] - 0.5) * w, -(core[1] - 0.5) * h, 0)
    return g
  }, [size, aspect, core])

  const uniforms = useMemo(() => {
    if (!keyed) return null
    return {
      map: { value: tex },
      uLo: { value: photoKey.lo ?? 0.06 },
      uHi: { value: photoKey.hi ?? 0.26 },
      uInner: { value: photoKey.inner ?? 0.36 },
      uOuter: { value: photoKey.outer ?? 0.56 },
      uBoost: { value: photoKey.boost ?? 1.6 },
      uEdge: { value: photoKey.edge ?? 0 },
      uCore: { value: new Vector2(core ? core[0] : 0.5, core ? core[1] : 0.5) },
    }
  }, [keyed, tex, photoKey, core])

  useFrame((state, dt) => {
    if (!mesh.current) return
    if (spin) {
      mesh.current.rotation.z += dt * spin
    } else if (keyed) {
      const t = state.clock.elapsedTime + phase.current
      mesh.current.rotation.x = Math.sin(t * 0.5) * 0.07
      mesh.current.rotation.y = Math.cos(t * 0.4) * 0.09
    }
  })

  return (
    <Billboard>
      <mesh ref={mesh} geometry={geometry}>
        {keyed ? (
          <shaderMaterial
            vertexShader={keyVert}
            fragmentShader={keyFrag}
            uniforms={uniforms}
            transparent
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        ) : (
          <meshBasicMaterial
            map={tex}
            color={BOOST}
            transparent
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        )}
      </mesh>
    </Billboard>
  )
}
