import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import {
  BackSide,
  Color,
  AdditiveBlending,
  CanvasTexture,
} from 'three'

// Deep-blue gradient sky dome (brighter & bluer than a flat black background).
const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const skyFrag = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  varying vec3 vDir;
  void main() {
    float h = vDir.y * 0.5 + 0.5;
    vec3 col = mix(uBottom, uTop, pow(h, 0.8));
    gl_FragColor = vec4(col, 1.0);
  }
`

// Build a soft radial-gradient sprite for nebula clouds.
function makeNebulaTexture(hex) {
  const size = 256
  const cvs = document.createElement('canvas')
  cvs.width = cvs.height = size
  const ctx = cvs.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  const c = new Color(hex)
  const rgb = `${Math.round(c.r * 255)}, ${Math.round(c.g * 255)}, ${Math.round(c.b * 255)}`
  g.addColorStop(0, `rgba(${rgb}, 0.55)`)
  g.addColorStop(0.4, `rgba(${rgb}, 0.22)`)
  g.addColorStop(1, `rgba(${rgb}, 0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new CanvasTexture(cvs)
}

function Nebula({ position, scale, color }) {
  const tex = useMemo(() => makeNebulaTexture(color), [color])
  return (
    <sprite position={position} scale={scale}>
      <spriteMaterial
        map={tex}
        blending={AdditiveBlending}
        depthWrite={false}
        opacity={0.9}
      />
    </sprite>
  )
}

export default function Starfield() {
  const skyRef = useRef()
  const groupRef = useRef()

  const skyUniforms = useMemo(
    () => ({
      uTop: { value: new Color('#0a1a44') },
      uBottom: { value: new Color('#070b22') },
    }),
    [],
  )

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.004
  })

  return (
    <group ref={groupRef}>
      {/* gradient sky dome */}
      <mesh ref={skyRef}>
        <sphereGeometry args={[100, 32, 32]} />
        <shaderMaterial
          vertexShader={skyVert}
          fragmentShader={skyFrag}
          uniforms={skyUniforms}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* distant coloured nebulae for depth */}
      <Nebula position={[-40, 18, -60]} scale={[70, 70, 1]} color="#3b6bff" />
      <Nebula position={[45, -22, -55]} scale={[60, 60, 1]} color="#8a5bff" />
      <Nebula position={[20, 30, -70]} scale={[50, 50, 1]} color="#2aa9ff" />

      {/* layered starfields: bright near + soft far */}
      <Stars radius={80} depth={50} count={9000} factor={4.5} saturation={0} fade speed={0.4} />
      <Stars radius={50} depth={30} count={3500} factor={2.5} saturation={0} fade speed={0.2} />
    </group>
  )
}
