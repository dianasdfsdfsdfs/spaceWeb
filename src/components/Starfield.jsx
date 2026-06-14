import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { BackSide, Color } from 'three'

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

export default function Starfield() {
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
      <mesh>
        <sphereGeometry args={[100, 32, 32]} />
        <shaderMaterial
          vertexShader={skyVert}
          fragmentShader={skyFrag}
          uniforms={skyUniforms}
          side={BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* clean starfield */}
      <Stars radius={80} depth={50} count={2500} factor={4} saturation={0} fade speed={0.3} />
    </group>
  )
}
