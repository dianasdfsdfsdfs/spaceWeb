import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, TubeGeometry, CatmullRomCurve3, Vector3 } from 'three'
import { Glow, hdr, NOISE_GLSL } from './shared.jsx'

const FIELD = hdr(1.5, 2.3, 3.7)
const COMPANION = hdr(2.0, 2.4, 3.2)

// bright, mottled blue-white star surface with a glowing limb
const vert = /* glsl */ `
  varying vec3 vp;
  varying vec3 vn;
  varying vec3 vview;
  void main() {
    vp = position;
    vn = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vview = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const frag = /* glsl */ `
  uniform float uTime;
  varying vec3 vp;
  varying vec3 vn;
  varying vec3 vview;
  ${NOISE_GLSL}
  void main() {
    vec3 p = normalize(vp);
    float n = fbm(p.xy * 4.0 + uTime * 0.25) * 0.6 + fbm(p.zy * 5.0 - uTime * 0.2) * 0.4;
    float rim = pow(1.0 - max(dot(vn, vview), 0.0), 2.0);
    vec3 col = mix(vec3(0.4, 0.85, 1.7), vec3(1.7, 2.1, 2.9), n);
    float b = 0.7 + 0.7 * n + rim * 1.3;
    gl_FragColor = vec4(col * b, 1.0);
  }
`

export default function Magnetar() {
  const mat = useRef()
  const cage = useRef()
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), [])

  // one dipole field-line loop (pinched at the poles, bulging at the equator)
  const loop = useMemo(() => {
    const pts = []
    const h = 0.74 // pole reach (just outside the star)
    const w = 1.2 // equator bulge
    for (let i = 0; i <= 72; i++) {
      const t = (i / 72) * Math.PI * 2
      pts.push(new Vector3(Math.sin(t) * w, Math.cos(t) * h, 0))
    }
    return new TubeGeometry(new CatmullRomCurve3(pts, true), 90, 0.012, 6, true)
  }, [])

  useFrame((_, dt) => {
    if (mat.current) mat.current.uniforms.uTime.value += dt
    if (cage.current) cage.current.rotation.y += dt * 0.15
  })

  return (
    <group rotation={[0.2, 0, 0.12]}>
      {/* star */}
      <mesh>
        <sphereGeometry args={[0.6, 96, 96]} />
        <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} toneMapped={false} />
      </mesh>

      {/* magnetic field-line cage */}
      <group ref={cage}>
        {Array.from({ length: 7 }).map((_, k) => (
          <mesh key={k} geometry={loop} rotation={[0, (k * Math.PI) / 7, 0]}>
            <meshBasicMaterial color={FIELD} transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* small companion (as in the reference photo) */}
      <group position={[1.7, 0.95, 0.4]}>
        <mesh>
          <sphereGeometry args={[0.09, 24, 24]} />
          <meshBasicMaterial color={COMPANION} toneMapped={false} />
        </mesh>
        <Glow color="#bcd8ff" scale={0.7} opacity={0.8} />
      </group>

      <Glow color="#7fb6ff" scale={3} opacity={0.7} />
    </group>
  )
}
