// One-off: download 8K planet textures and downscale to 4K (sharper than the
// 2K set, but a fraction of the VRAM of full 8K). Run: node scripts/make-textures.mjs
import sharp from 'sharp'
import https from 'https'
import path from 'path'

const base = 'https://www.solarsystemscope.com/textures/download'
const outDir = 'public/textures'
const WIDTH = 4096

const targets = [
  ['8k_earth_daymap.jpg', '4k_earth_daymap.jpg'],
  ['8k_earth_clouds.jpg', '4k_earth_clouds.jpg'],
  ['8k_jupiter.jpg', '4k_jupiter.jpg'],
  ['8k_mars.jpg', '4k_mars.jpg'],
  ['8k_mercury.jpg', '4k_mercury.jpg'],
  ['8k_venus_atmosphere.jpg', '4k_venus_atmosphere.jpg'],
  ['8k_saturn.jpg', '4k_saturn.jpg'],
  ['8k_sun.jpg', '4k_sun.jpg'],
  ['8k_neptune.jpg', '4k_neptune.jpg'],
  ['8k_uranus.jpg', '4k_uranus.jpg'],
]

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume()
          reject(new Error('HTTP ' + res.statusCode))
          return
        }
        const chunks = []
        res.on('data', (c) => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
      })
      .on('error', reject)
  })
}

for (const [src, out] of targets) {
  try {
    const buf = await download(`${base}/${src}`)
    const info = await sharp(buf)
      .resize({ width: WIDTH })
      .jpeg({ quality: 88, mozjpeg: true })
      .toFile(path.join(outDir, out))
    console.log('OK  ', out, `${info.width}x${info.height}`, `${(info.size / 1e6).toFixed(2)}MB`)
  } catch (e) {
    console.log('FAIL', src, e.message)
  }
}
