import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, Color } from 'three'
import StarSurface from './StarSurface.jsx'
import { glowTexture, hdr } from './shared.jsx'

const FLASH = hdr(2.6, 2.9, 3.7) // bright white-blue burst

const STAR = {
  low: [0.4, 0.72, 1.5],
  high: [1.7, 2.05, 2.7],
  base: 0.8,
  amp: 0.5,
  rim: 1.0,
  turb: 4.2,
}

const CYCLE = 7.5
const T_INSPIRAL = 5.0
const T_COLLAPSE = 0.7 // stars converge + squeeze into one point
const T_EXPLODE = CYCLE - T_INSPIRAL - T_COLLAPSE

// 3D shockwave shell: a sphere bright at its limb (fresnel), so it reads as an
// expanding bubble rather than a flat oval.
const shockVert = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`
const shockFrag = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float d = max(dot(vN, vV), 0.0);
    // bright in a band just inside the limb, fading to 0 AT the silhouette so the
    // outer edge feathers out softly instead of cutting off hard
    float a = pow(1.0 - d, 1.7) * smoothstep(0.0, 0.22, d);
    gl_FragColor = vec4(uColor, a * uOpacity);
  }
`

export default function Kilonova() {
  const a = useRef()
  const b = useRef()
  const flash = useRef()
  const flashMat = useRef()
  const shock = useRef()
  const shockUniforms = useMemo(
    () => ({ uColor: { value: new Color(0.8, 1.4, 2.6) }, uOpacity: { value: 0 } }),
    [],
  )
  const tex = useMemo(glowTexture, [])
  const t = useRef(Math.random() * CYCLE)

  useFrame((_, dt) => {
    t.current += dt
    const ct = t.current % CYCLE

    if (ct < T_INSPIRAL) {
      // two stars orbit and spiral inward, accelerating
      const p = ct / T_INSPIRAL
      const r = 0.6 * Math.pow(1 - p, 0.9) + 0.04
      const ang = ct * 1.1 + p * p * 11
      const sIn = Math.min(1, ct / 0.5)
      if (a.current) {
        a.current.position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0)
        a.current.scale.setScalar(sIn)
        a.current.visible = true
      }
      if (b.current) {
        b.current.position.set(-Math.cos(ang) * r, -Math.sin(ang) * r, 0)
        b.current.scale.setScalar(sIn)
        b.current.visible = true
      }
      if (flash.current) flash.current.scale.setScalar(0.001)
      if (flashMat.current) flashMat.current.opacity = 0
      if (shock.current) shockUniforms.uOpacity.value = 0
    } else if (ct < T_INSPIRAL + T_COLLAPSE) {
      // collapse: stars keep coming together to the very centre AND shrink, so
      // they visibly fuse into one tiny intense point (no popping out)
      const cp = ct < T_INSPIRAL + T_COLLAPSE ? (ct - T_INSPIRAL) / T_COLLAPSE : 1
      const r = 0.04 * (1 - cp)
      const sc = 1 - cp * 0.7 // shrink the stars as they merge
      const ang = T_INSPIRAL * 1.1 + 11 + cp * 6
      if (a.current) {
        a.current.position.set(Math.cos(ang) * r, Math.sin(ang) * r, 0)
        a.current.scale.setScalar(sc)
        a.current.visible = true
      }
      if (b.current) {
        b.current.position.set(-Math.cos(ang) * r, -Math.sin(ang) * r, 0)
        b.current.scale.setScalar(sc)
        b.current.visible = true
      }
      // a bright point grows at the merge site to take over from the stars
      if (flash.current) flash.current.scale.setScalar(0.1 + cp * 0.35)
      if (flashMat.current) flashMat.current.opacity = cp * 0.9
      if (shock.current) shockUniforms.uOpacity.value = 0
    } else {
      // sharp explosion: flash bursts + 3D shockwave shell expands, then fades
      const ep = (ct - T_INSPIRAL - T_COLLAPSE) / T_EXPLODE
      const e = 1 - Math.pow(1 - ep, 3) // ease-out -> sharp burst
      if (a.current) a.current.visible = false
      if (b.current) b.current.visible = false
      if (flash.current) flash.current.scale.setScalar(0.45 + e * 3.0)
      if (flashMat.current) flashMat.current.opacity = Math.max(0, 1 - ep * 1.3)
      if (shock.current) {
        shock.current.scale.setScalar(0.25 + e * 3.6)
        shockUniforms.uOpacity.value = 0.9 * (1 - ep)
      }
    }
  })

  return (
    <group rotation={[0.5, 0, 0.2]}>
      <group ref={a}>
        <StarSurface radius={0.24} {...STAR} />
      </group>
      <group ref={b}>
        <StarSurface radius={0.24} {...STAR} />
      </group>

      {/* merge point -> explosion flash */}
      <sprite ref={flash} scale={[0.001, 0.001, 0.001]}>
        <spriteMaterial
          ref={flashMat}
          map={tex}
          color={FLASH}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>

      {/* 3D shockwave shell */}
      <mesh ref={shock}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          vertexShader={shockVert}
          fragmentShader={shockFrag}
          uniforms={shockUniforms}
          transparent
          blending={AdditiveBlending}
          side={BackSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}
