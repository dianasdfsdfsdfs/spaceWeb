import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { TextureLoader, AdditiveBlending, SRGBColorSpace } from 'three'
import { hdr } from './shared.jsx'

const BOOST = hdr(1.25, 1.25, 1.25)

// Keys out the photo's own background: dark pixels -> transparent (luminance),
// and a radial mask fades the outer edges (stray stars / clouds / galaxies).
// Additive blend uses the alpha, so the object glows in OUR starfield.
const keyVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const keyFrag = /* glsl */ `
  uniform sampler2D map;
  uniform float uLo, uHi, uInner, uOuter, uBoost;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(map, vUv);
    float lum = dot(t.rgb, vec3(0.299, 0.587, 0.114));
    float a = smoothstep(uLo, uHi, lum);
    float d = distance(vUv, vec2(0.5));
    a *= smoothstep(uOuter, uInner, d);
    if (a < 0.01) discard;
    gl_FragColor = vec4(t.rgb * uBoost, a);
  }
`

/**
 * A real deep-space photo as a camera-facing billboard. With `photoKey` it keys
 * out the photo's background and gently wobbles for a 3D, alive feel.
 */
export default function PhotoObject({ src, size = 4, spin = 0, photoKey }) {
  const tex = useLoader(TextureLoader, src)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8

  const keyed = !!photoKey
  const mesh = useRef()
  const phase = useRef(Math.random() * 10)

  const uniforms = useMemo(() => {
    if (!keyed) return null
    return {
      map: { value: tex },
      uLo: { value: photoKey.lo ?? 0.06 },
      uHi: { value: photoKey.hi ?? 0.26 },
      uInner: { value: photoKey.inner ?? 0.36 },
      uOuter: { value: photoKey.outer ?? 0.56 },
      uBoost: { value: photoKey.boost ?? 1.6 },
    }
  }, [keyed, tex, photoKey])

  useFrame((state, dt) => {
    if (!mesh.current) return
    if (spin) mesh.current.rotation.z += dt * spin
    if (keyed) {
      const t = state.clock.elapsedTime + phase.current
      mesh.current.rotation.x = Math.sin(t * 0.5) * 0.07
      mesh.current.rotation.y = Math.cos(t * 0.4) * 0.09
    }
  })

  const aspect = tex.image ? tex.image.width / tex.image.height : 1.4

  return (
    <Billboard>
      <mesh ref={mesh}>
        <planeGeometry args={[size * aspect, size]} />
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
