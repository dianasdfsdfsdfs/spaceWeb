import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import { Glow, hdr, NOISE_GLSL } from './shared.jsx'

const RING = hdr(1.2, 1.8, 3.2)

const vert = /* glsl */ `
  varying vec3 vp;
  void main() {
    vp = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const frag = /* glsl */ `
  uniform float uTime;
  varying vec3 vp;
  ${NOISE_GLSL}
  void main() {
    vec3 p = normalize(vp);
    float n = fbm(p.xy * 3.2 + uTime * 0.35) * 0.6 + fbm(p.zy * 4.5 - uTime * 0.25) * 0.4;
    float b = 0.45 + 1.0 * n;
    vec3 col = mix(vec3(0.1, 0.45, 1.3), vec3(0.8, 1.5, 2.8), n);
    gl_FragColor = vec4(col * b, 1.0);
  }
`

export default function Magnetar() {
  const mat = useRef()
  const rings = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt
    if (rings.current) rings.current.rotation.y += dt * 0.25
  })

  return (
    <group rotation={[0.3, 0, 0.2]}>
      {/* turbulent plasma surface */}
      <mesh>
        <sphereGeometry args={[0.62, 96, 96]} />
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} toneMapped={false} />
      </mesh>

      {/* faint magnetic field rings */}
      <group ref={rings}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI) / 3]}>
            <torusGeometry args={[0.62 + 0.22 * (i + 1), 0.006, 8, 120]} />
            <meshBasicMaterial color={RING} transparent opacity={0.4} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>

      <Glow color="#4aa8ff" scale={3.4} opacity={0.6} />
    </group>
  )
}
