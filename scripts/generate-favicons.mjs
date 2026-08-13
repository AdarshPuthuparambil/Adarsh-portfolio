import { writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svgPath = join(root, 'public', 'favicon.svg')
const outDir = join(root, 'public')

async function pngBuffer(size) {
  return sharp(svgPath, { density: 400 }).resize(size, size).png().toBuffer()
}

function icoFromPngs(pngs) {
  const count = pngs.length
  const headerSize = 6 + 16 * count
  let offset = headerSize
  const entries = pngs.map((buf) => {
    const width = buf.readUInt32BE(16)
    const height = buf.readUInt32BE(20)
    const entry = { width, height, buf, offset }
    offset += buf.length
    return entry
  })

  const ico = Buffer.alloc(offset)
  ico.writeUInt16LE(0, 0)
  ico.writeUInt16LE(1, 2)
  ico.writeUInt16LE(count, 4)

  entries.forEach((entry, i) => {
    const o = 6 + i * 16
    ico.writeUInt8(entry.width >= 256 ? 0 : entry.width, o)
    ico.writeUInt8(entry.height >= 256 ? 0 : entry.height, o + 1)
    ico.writeUInt8(0, o + 2)
    ico.writeUInt8(0, o + 3)
    ico.writeUInt16LE(1, o + 4)
    ico.writeUInt16LE(32, o + 6)
    ico.writeUInt32LE(entry.buf.length, o + 8)
    ico.writeUInt32LE(entry.offset, o + 12)
    entry.buf.copy(ico, entry.offset)
  })

  return ico
}

const sizes = {
  'favicon-48x48.png': 48,
  'favicon-96x96.png': 96,
  'favicon-192x192.png': 192,
  'apple-touch-icon.png': 180,
}

for (const [name, size] of Object.entries(sizes)) {
  await sharp(svgPath, { density: 400 }).resize(size, size).png().toFile(join(outDir, name))
}

const ico = icoFromPngs([
  await pngBuffer(16),
  await pngBuffer(32),
  await pngBuffer(48),
])
await writeFile(join(outDir, 'favicon.ico'), ico)

console.log('Generated favicon.ico, PNG sizes, and apple-touch-icon.png')
