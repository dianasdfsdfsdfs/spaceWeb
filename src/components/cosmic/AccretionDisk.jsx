import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, DoubleSide, RingGeometry } from 'three'
import { NOISE_GLSL } from './shared.jsx'

const vert = /* glsl */ `
  varying float vR;
  varying float vAng;
  void main() {
    vR = length(position.xy);
    vAng = atan(position.y, position.x);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const frag = /* glsl */ `
  uniform float uInner, uOuter, uTime, uIntensity, uDoppler;
  uniform vec3 uColA, uColB, uColC;
  varying float vR;
  varying float vAng;
  ${NOISE_GLSL}
  void main() {
    float t = clamp((vR - uInner) / (uOuter - uInner), 0.0, 1.0);
    float radial = smoothstep(1.0, 0.05, t) * smoothstep(0.0, 0.07, t);
    float swirl = fbm(vec2(vAng * 3.0 + uTime * 1.4 - t * 7.0, t * 6.0));
    float bright = radial * (0.45 + 0.8 * swirl);
    bright *= (1.0 + uDoppler * cos(vAng));        // one side brighter (Doppler)
    vec3 col = mix(uColA, uColB, smoothstep(0.0, 0.4, t));
    col = mix(col, uColC, smoothstep(0.4, 1.0, t));
    gl_FragColor = vec4(col * uIntensity, clamp(bright, 0.0, 1.0));
  }
`

/** A glowing, turbulent, rotating accretion disk (in its local XY plane). */
export default function AccretionDisk({
  inner,
  outer,
  colA = '#fff6e6',
  colB = '#ff8a2a',
  colC = '#5a1200',
  intensity = 2.0,
  doppler = 0.45,
  speed = 1.0,
  segments = 160,
  ...props
}) {
  const matRef = useRef()
  const geo = useMemo(() => new RingGeometry(inner, outer, segments, 1), [inner, outer, segments])
  const uniforms = useMemo(
    () => ({
      uInner: { value: inner },
      uOuter: { value: outer },
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uDoppler: { value: doppler },
      uColA: { value: new Color(colA) },
      uColB: { value: new Color(colB) },
      uColC: { value: new Color(colC) },
    }),
    [inner, outer, intensity, doppler, colA, colB, colC],
  )

  useFrame((_, dt) => {
    if (matRef.current) matRef.current.uniforms.uTime.value += dt * speed
  })

  return (
    <mesh geometry={geo} {...props}>
      <shaderMaterial
        ref={matRef}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        blending={AdditiveBlending}
        side={DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}
