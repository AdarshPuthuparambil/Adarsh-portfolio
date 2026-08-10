import { useEffect, useState, type CSSProperties } from 'react'
import { useTheme } from '../hooks/useTheme'

type Burst = {
  id: number
  x: number
  y: number
}

const PARTICLE_COUNT = 8
const BURST_MS = 700

export function ClickBurst() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [bursts, setBursts] = useState<Burst[]>([])

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    if (prefersReducedMotion) return

    let nextId = 0
    const timers = new Set<number>()

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return

      const id = ++nextId
      const burst: Burst = { id, x: event.clientX, y: event.clientY }
      setBursts((prev) => [...prev.slice(-4), burst])

      const timer = window.setTimeout(() => {
        timers.delete(timer)
        setBursts((prev) => prev.filter((item) => item.id !== id))
      }, BURST_MS)
      timers.add(timer)
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  if (bursts.length === 0) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {bursts.map((burst) => (
        <span
          key={burst.id}
          className="absolute"
          style={{ left: burst.x, top: burst.y }}
        >
          <span
            className={`click-ring absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
              isDark
                ? 'border-accent-bright/80'
                : 'border-accent/80'
            }`}
          />
          <span
            className={`click-ring-delay absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border ${
              isDark
                ? 'border-mist/50'
                : 'border-ink/35'
            }`}
          />
          {Array.from({ length: PARTICLE_COUNT }, (_, index) => {
            const angle = (360 / PARTICLE_COUNT) * index - 90
            return (
              <span
                key={index}
                className={`click-particle absolute left-0 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  isDark ? 'bg-accent-bright' : 'bg-accent'
                }`}
                style={
                  {
                    '--burst-angle': `${angle}deg`,
                    animationDelay: `${index * 12}ms`,
                  } as CSSProperties
                }
              />
            )
          })}
        </span>
      ))}
    </div>
  )
}
