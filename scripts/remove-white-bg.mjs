import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

const jobs = [
  { input: 'Vofox_logo.jpg', output: 'Vofox_logo.png', mode: 'white', threshold: 245 },
  { input: 'ionaught_logo.jpg', output: 'ionaught_logo.png', mode: 'white', threshold: 245 },
  { input: 'CiscoLogo.png', output: 'CiscoLogo.png', mode: 'white', threshold: 245 },
  { input: 'StandbyLogo.png', output: 'StandbyLogo.png', mode: 'black', threshold: 18 },
]

async function removeBackground(buffer, { mode = 'white', threshold }) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    const transparent =
      mode === 'white'
        ? r >= threshold && g >= threshold && b >= threshold
        : r <= threshold && g <= threshold && b <= threshold

    if (transparent) data[i + 3] = 0
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer()
}

for (const job of jobs) {
  const input = await sharp(path.join(publicDir, job.input)).toBuffer()
  const output = await removeBackground(input, job)
  await sharp(output).toFile(path.join(publicDir, job.output))
  console.log(`Processed ${job.input} -> ${job.output}`)
}
