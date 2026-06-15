// Download free-licensed (ESO CC BY 4.0 / NASA-ESA Hubble) deep-space images and
// downscale them for use as photo billboards. Run: node scripts/make-cosmic.mjs
import sharp from 'sharp'
import https from 'https'
import path from 'path'
import fs from 'fs'

const out = 'public/textures/cosmic'
fs.mkdirSync(out, { recursive: true })

const items = [
  ['https://cdn.eso.org/images/large/eso2105a.jpg', 'quasar.jpg'], // quasar P172+18
  ['https://cdn.eso.org/images/large/eso1733s.jpg', 'kilonova.jpg'], // GW170817 kilonova
  ['https://cdn.eso.org/images/large/eso1415a.jpg', 'magnetar.jpg'], // magnetar in Westerlund 1
  ['https://commons.wikimedia.org/wiki/Special:FilePath/M57_The_Ring_Nebula.JPG', 'nebula.jpg'],
  ['https://commons.wikimedia.org/wiki/Special:FilePath/Pulsar.jpg', 'pulsar.jpg'],
]

function dl(url, depth = 0) {
  return new Promise((res, rej) => {
    if (depth > 5) return rej(new Error('too many redirects'))
    https
      .get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (texture fetch)' } }, (r) => {
        if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
          r.resume()
          return dl(r.headers.location, depth + 1).then(res, rej)
        }
        if (r.statusCode !== 200) {
          r.resume()
          return rej(new Error('HTTP ' + r.statusCode))
        }
        const c = []
        r.on('data', (d) => c.push(d))
        r.on('end', () => res(Buffer.concat(c)))
      })
      .on('error', rej)
  })
}

for (const [url, name] of items) {
  try {
    const buf = await dl(url)
    const info = await sharp(buf)
      .resize({ width: 1280, withoutEnlargement: true })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(path.join(out, name))
    console.log('OK  ', name, `${info.width}x${info.height}`, `${(info.size / 1e6).toFixed(2)}MB`)
  } catch (e) {
    console.log('FAIL', name, e.message)
  }
}
