import { useMemo } from 'react'
import { CanvasTexture, AdditiveBlending, Color } from 'three'

// Build an HDR colour (values may exceed 1) so emissive parts pass the bloom
// threshold and glow. Use for cores, jets, photon rings, etc.
export function hdr(r, g, b) {
  const c = new Color()
  c.setRGB(r, g, b)
  return c
}

// Shared value-noise GLSL used by the procedural object shaders.
export const NOISE_GLSL = /* glsl */ `
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
               mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
  float fbm(vec2 p){
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++){ v += a * vnoise(p); p *= 2.0; a *= 0.5; }
    return v;
  }
`

// One cached white radial-gradient sprite, tinted per use for soft glows.
let _glow
export function glowTexture() {
  if (_glow) return _glow
  const s = 128
  const c = document.createElement('canvas')
  c.width = c.height = s
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0.0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.4)')
  g.addColorStop(1.0, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  _glow = new CanvasTexture(c)
  return _glow
}

/** Soft additive glow that always faces the camera. */
export function Glow({ color = '#ffffff', scale = 2, opacity = 1 }) {
  const tex = useMemo(glowTexture, [])
  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial
        map={tex}
        color={color}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  )
}
