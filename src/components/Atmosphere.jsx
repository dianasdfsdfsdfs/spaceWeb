import { useMemo } from 'react'
import { BackSide, AdditiveBlending, Color } from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    float rim = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), uPower);
    gl_FragColor = vec4(uColor, rim * uIntensity);
  }
`

/** A soft fresnel atmosphere shell rendered just outside a planet (e.g. Earth). */
export default function Atmosphere({
  radius,
  color = '#6db3ff',
  intensity = 0.8,
  power = 2.8,
  scale = 1.05,
}) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new Color(color) },
      uPower: { value: power },
      uIntensity: { value: intensity },
    }),
    [color, intensity, power],
  )

  return (
    <mesh scale={scale}>
      <sphereGeometry args={[radius, 48, 48]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={AdditiveBlending}
        side={BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}
