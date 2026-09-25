import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'

type Shard = {
  size: number
  tall: number
  spin: string
  drift: string
  delay: string
  rx: string
  rz: string
  style: CSSProperties
}

const shards: Shard[] = [
  {
    size: 28,
    tall: 92,
    spin: '22s',
    drift: '9s',
    delay: '-4s',
    rx: '28deg',
    rz: '18deg',
    style: { top: '10%', left: '7%' },
  },
  {
    size: 22,
    tall: 70,
    spin: '16s',
    drift: '7s',
    delay: '-1s',
    rx: '52deg',
    rz: '-22deg',
    style: { top: '16%', right: '8%' },
  },
  {
    size: 24,
    tall: 78,
    spin: '26s',
    drift: '11s',
    delay: '-12s',
    rx: '18deg',
    rz: '30deg',
    style: { bottom: '10%', left: '8%' },
  },
  {
    size: 32,
    tall: 104,
    spin: '32s',
    drift: '13s',
    delay: '-8s',
    rx: '36deg',
    rz: '-10deg',
    style: { bottom: '8%', right: '6%' },
  },
]

const stars = [
  { size: 3, delay: '0s', style: { top: '20%', left: '26%' } },
  { size: 2, delay: '-3s', style: { top: '28%', right: '24%' } },
  { size: 4, delay: '-6s', style: { top: '56%', left: '20%' } },
  { size: 2, delay: '-1s', style: { top: '62%', right: '22%' } },
  { size: 3, delay: '-8s', style: { top: '14%', left: '52%' } },
  { size: 2, delay: '-4s', style: { bottom: '26%', left: '40%' } },
  { size: 3, delay: '-7s', style: { bottom: '20%', right: '38%' } },
]

function Crystal({ shard }: { shard: Shard }) {
  return (
    <div
      className="orbit-shard"
      style={
        {
          ...shard.style,
          '--size': `${shard.size}px`,
          '--tall': `${shard.tall}px`,
          '--spin': shard.spin,
          '--drift': shard.drift,
          '--delay': shard.delay,
          '--rx': shard.rx,
          '--rz': shard.rz,
        } as CSSProperties
      }
    >
      <div className="orbit-shard-spin">
        <span className="orbit-shard-face" />
        <span className="orbit-shard-face" />
        <span className="orbit-shard-face" />
        <span className="orbit-shard-face" />
        <span className="orbit-shard-face" />
        <span className="orbit-shard-face" />
      </div>
    </div>
  )
}

export function WorkStage({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(pointer: fine)')

    const observer = new IntersectionObserver(([entry]) => {
      stage.dataset.live = entry?.isIntersecting ? 'true' : 'false'
    })
    observer.observe(stage)

    if (reduced.matches || !fine.matches) {
      return () => observer.disconnect()
    }

    let frame = 0

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      const x = event.clientX / window.innerWidth - 0.5
      const y = event.clientY / window.innerHeight - 0.5
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        stage.style.setProperty('--tilt-x', `${(-y * 8).toFixed(2)}deg`)
        stage.style.setProperty('--tilt-y', `${(x * 10).toFixed(2)}deg`)
      })
    }

    const resetTilt = () => {
      cancelAnimationFrame(frame)
      stage.style.setProperty('--tilt-x', '0deg')
      stage.style.setProperty('--tilt-y', '0deg')
    }

    stage.addEventListener('pointermove', onMove)
    stage.addEventListener('pointerleave', resetTilt)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      stage.removeEventListener('pointermove', onMove)
      stage.removeEventListener('pointerleave', resetTilt)
    }
  }, [])

  return (
    <div ref={stageRef} className="work-stage relative">
      <div className="work-stage-scene" aria-hidden>
        <div className="orbit-scene">
          <div className="orbit-glow orbit-glow-a" />
          <div className="orbit-glow orbit-glow-b" />
          <div className="orbit-tilt">
            <div className="orbit-core" />
            <div className="orbit-halo" />
            <div className="orbit-ring orbit-ring-a">
              <span className="orbit-bead" />
            </div>
            <div className="orbit-ring orbit-ring-b">
              <span className="orbit-bead" />
            </div>
            <div className="orbit-ring orbit-ring-c">
              <span className="orbit-bead" />
            </div>
            <div className="orbit-ribbon orbit-ribbon-a" />
            <div className="orbit-ribbon orbit-ribbon-b" />
            {shards.map((shard) => (
              <Crystal key={`${shard.size}-${shard.delay}`} shard={shard} />
            ))}
            {stars.map((star) => (
              <span
                key={`${star.delay}-${star.size}-${String(star.style.top)}`}
                className="orbit-star"
                style={
                  {
                    ...star.style,
                    '--size': `${star.size}px`,
                    '--delay': star.delay,
                  } as unknown as CSSProperties
                }
              />
            ))}
          </div>
          <div className="orbit-vignette" />
        </div>
      </div>
      <div className="work-stage-content">{children}</div>
    </div>
  )
}
