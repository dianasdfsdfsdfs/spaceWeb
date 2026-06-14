import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import {
  BackSide,
  Color,
  AdditiveBlending,
  CanvasTexture,
  BufferGeometry,
  Float32BufferAttribute,
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

// Soft round glow sprite so stars look like glowing points, not hard pixels.
function makeStarTexture() {
  const size = 64
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0.0, 'rgba(255,255,255,1)')
  g.addColorStop(0.25, 'rgba(255,255,255,0.7)')
  g.addColorStop(0.55, 'rgba(180,205,255,0.18)')
  g.addColorStop(1.0, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  return new CanvasTexture(c)
}

// Realistic stellar colours: mostly white, a few warm and a few blue.
const STAR_COLORS = ['#ffffff', '#ffffff', '#fff3e2', '#ffe6c9', '#ffd7a8', '#dfe9ff', '#c8d9ff']

// A layer of larger, brighter "hero" stars spread through a depth range so the
// nearer ones look bigger — that depth + the parallax between layers reads as 3D.
function BrightStars({ count = 700, rMin = 18, rMax = 70, size = 0.65 }) {
  const tex = useMemo(makeStarTexture, [])
  const geometry = useMemo(() => {
    const positions = []
    const colors = []
    const col = new Color()
    for (let i = 0; i < count; i++) {
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = rMin + Math.random() * (rMax - rMin)
      positions.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.sin(phi) * Math.sin(theta),
        radius * Math.cos(phi),
      )
      col.set(STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0])
      const b = 0.55 + Math.random() * 0.45 // brightness variation
      colors.push(col.r * b, col.g * b, col.b * b)
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new Float32BufferAttribute(colors, 3))
    return geo
  }, [count, rMin, rMax])

  return (
    <points geometry={geometry}>
      <pointsMaterial
        map={tex}
        size={size}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
        toneMapped={false}
      />
    </points>
  )
}

export default function Starfield() {
  const farRef = useRef()
  const nearRef = useRef()

  const skyUniforms = useMemo(
    () => ({
      uTop: { value: new Color('#0a1a44') },
      uBottom: { value: new Color('#070b22') },
    }),
    [],
  )

  // Two layers drifting at slightly different speeds -> parallax -> depth.
  useFrame((_, delta) => {
    if (farRef.current) farRef.current.rotation.y += delta * 0.0035
    if (nearRef.current) nearRef.current.rotation.y += delta * 0.0075
  })

  return (
    <group>
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

      {/* far, dense, faint field */}
      <group ref={farRef}>
        <Stars radius={120} depth={70} count={9000} factor={3.2} saturation={0.18} fade speed={0.15} />
        <Stars radius={90} depth={50} count={5000} factor={4} saturation={0.32} fade speed={0.3} />
      </group>

      {/* nearer, brighter, colourful stars (parallax layer) */}
      <group ref={nearRef}>
        <Stars radius={70} depth={40} count={2600} factor={5.5} saturation={0.45} fade speed={0.6} />
        <BrightStars count={700} />
      </group>
    </group>
  )
}
