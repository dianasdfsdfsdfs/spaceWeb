import { useMemo, useRef } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { TextureLoader, AdditiveBlending, SRGBColorSpace, Vector2 } from 'three'
import { hdr } from './shared.jsx'

const BOOST = hdr(1.25, 1.25, 1.25)

const keyVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
// Keys out the photo background (luminance + radial edge mask). Optionally
// swirls an annulus around a point to fake a rotating accretion disk, and adds
// a gentle brightness pulse.
const keyFrag = /* glsl */ `
  uniform sampler2D map;
  uniform float uLo, uHi, uInner, uOuter, uBoost;
  uniform float uTime, uSwirl, uR1, uR2, uPulse;
  uniform vec2 uCore;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv;
    if (uSwirl != 0.0) {
      vec2 rel = uv - uCore;
      float d = length(rel);
      float m = smoothstep(uR2, uR1, d) * smoothstep(0.0, uR1, d); // 0 at core & beyond disk
      if (m > 0.0) {
        float ang = atan(rel.y, rel.x) + uTime * uSwirl * m; // inner spins faster
        uv = uCore + vec2(cos(ang), sin(ang)) * d;
      }
    }
    vec4 t = texture2D(map, uv);
    float lum = dot(t.rgb, vec3(0.299, 0.587, 0.114));
    float a = smoothstep(uLo, uHi, lum) * smoothstep(uOuter, uInner, distance(vUv, vec2(0.5)));
    if (a < 0.01) discard;
    float pulse = 1.0 + uPulse * sin(uTime * 2.0);
    gl_FragColor = vec4(t.rgb * uBoost * pulse, a);
  }
`

/**
 * A real deep-space photo as a camera-facing billboard. With `photoKey` it keys
 * out the photo background and gently wobbles. With `swirl` it also fakes a
 * rotating accretion disk (annulus swirl) + a subtle pulse, on the photo itself.
 */
export default function PhotoObject({ src, size = 4, spin = 0, photoKey, swirl }) {
  const tex = useLoader(TextureLoader, src)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8

  const keyed = !!photoKey
  const mesh = useRef()
  const mat = useRef()
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
      uTime: { value: 0 },
      uSwirl: { value: swirl?.speed ?? 0 },
      uR1: { value: swirl?.r1 ?? 0.05 },
      uR2: { value: swirl?.r2 ?? 0.25 },
      uPulse: { value: swirl?.pulse ?? 0 },
      uCore: { value: new Vector2(swirl?.cx ?? 0.5, swirl?.cy ?? 0.5) },
    }
  }, [keyed, tex, photoKey, swirl])

  useFrame((state, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value = state.clock.elapsedTime
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
            ref={mat}
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
