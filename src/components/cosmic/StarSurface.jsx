import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import { NOISE_GLSL } from './shared.jsx'

const vert = /* glsl */ `
  varying vec3 vp;
  varying vec3 vn;
  varying vec3 vv;
  void main() {
    vp = position;
    vn = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vv = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const frag = /* glsl */ `
  uniform float uTime, uBase, uAmp, uRim, uTurb;
  uniform vec3 uLow, uHigh;
  varying vec3 vp;
  varying vec3 vn;
  varying vec3 vv;
  ${NOISE_GLSL}
  void main() {
    vec3 p = normalize(vp);
    float n = fbm(p.xy * uTurb + uTime * 0.2) * 0.6 + fbm(p.zy * (uTurb * 1.3) - uTime * 0.16) * 0.4;
    float rim = pow(1.0 - max(dot(vn, vv), 0.0), 2.0);
    vec3 col = mix(uLow, uHigh, n);
    float b = uBase + uAmp * n + rim * uRim;
    gl_FragColor = vec4(col * b, 1.0);
  }
`

/** A bright, gently mottled star surface with a glowing limb. */
export default function StarSurface({
  radius = 0.5,
  low,
  high,
  base = 0.85,
  amp = 0.55,
  rim = 1.4,
  turb = 4.0,
  segments = 96,
}) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBase: { value: base },
      uAmp: { value: amp },
      uRim: { value: rim },
      uTurb: { value: turb },
      uLow: { value: new Color(low[0], low[1], low[2]) },
      uHigh: { value: new Color(high[0], high[1], high[2]) },
    }),
    [base, amp, rim, turb, low, high],
  )
  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt
  })
  return (
    <mesh>
      <sphereGeometry args={[radius, segments, segments]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} toneMapped={false} />
    </mesh>
  )
}
