import { useEffect, useId, useRef } from 'react'

const LERP = 0.1
const BANK_LERP = 0.12
const MAX_BANK = 38

function shortestAngle(from: number, to: number) {
  let diff = to - from
  while (diff > 180) diff -= 360
  while (diff < -180) diff += 360
  return from + diff
}

export function ButterflyFollower() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const uid = useId().replace(/:/g, '')

  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches
    if (prefersReducedMotion || !hasFinePointer) return

    wrap.dataset.active = 'true'

    let mouseX = window.innerWidth * 0.5
    let mouseY = window.innerHeight * 0.35
    let x = mouseX
    let y = mouseY
    let angle = 0
    let shown = false
    let raf = 0

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      mouseX = event.clientX
      mouseY = event.clientY
      if (!shown) {
        x = mouseX
        y = mouseY - 22
        shown = true
        wrap.style.opacity = '1'
      }
    }

    const tick = () => {
      const targetX = mouseX + 10
      const targetY = mouseY - 22
      const dx = targetX - x
      const dy = targetY - y

      x += dx * LERP
      y += dy * LERP

      const speed = Math.hypot(dx, dy)
      const targetAngle =
        speed < 1.4 ? 0 : Math.max(-MAX_BANK, Math.min(MAX_BANK, dx * 0.85))

      angle += (shortestAngle(angle, targetAngle) - angle) * BANK_LERP

      wrap.style.setProperty('--flap', speed > 8 ? '0.18s' : speed > 2.5 ? '0.26s' : '0.42s')
      wrap.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`

      raf = window.requestAnimationFrame(tick)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    raf = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="butterfly-follower pointer-events-none fixed top-0 left-0 z-[90] hidden opacity-0"
    >
      <svg
        className="butterfly-svg"
        width="38"
        height="38"
        viewBox="0 0 64 64"
        fill="none"
      >
        <defs>
          <linearGradient id={`${uid}-fore`} x1="8" y1="6" x2="32" y2="40">
            <stop offset="0%" stopColor="#7ef0dc" />
            <stop offset="45%" stopColor="#14a896" />
            <stop offset="100%" stopColor="#0b5f58" />
          </linearGradient>
          <linearGradient id={`${uid}-hind`} x1="16" y1="28" x2="34" y2="56">
            <stop offset="0%" stopColor="#9ff3e4" />
            <stop offset="55%" stopColor="#1bb8a4" />
            <stop offset="100%" stopColor="#0f7a72" />
          </linearGradient>
          <radialGradient id={`${uid}-spot`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#fff7c2" />
            <stop offset="40%" stopColor="#f4c15d" />
            <stop offset="100%" stopColor="#14a896" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className="bf-wing bf-wing-left">
          <path
            fill={`url(#${uid}-fore)`}
            d="M32 27C20 7 3 11 6.5 27c2 10 14 10.5 25.5 6.5Z"
          />
          <path
            fill={`url(#${uid}-hind)`}
            d="M32 33C18 36 8 46 14 54c7 4 13-6 18-16Z"
          />
          <circle cx="16" cy="22" r="3.4" fill={`url(#${uid}-spot)`} />
          <circle cx="20" cy="44" r="2.2" fill="#fff7c2" opacity="0.7" />
        </g>

        <g className="bf-wing bf-wing-right">
          <path
            fill={`url(#${uid}-fore)`}
            d="M32 27C44 7 61 11 57.5 27c-2 10-14 10.5-25.5 6.5Z"
          />
          <path
            fill={`url(#${uid}-hind)`}
            d="M32 33C46 36 56 46 50 54c-7 4-13-6-18-16Z"
          />
          <circle cx="48" cy="22" r="3.4" fill={`url(#${uid}-spot)`} />
          <circle cx="44" cy="44" r="2.2" fill="#fff7c2" opacity="0.7" />
        </g>

        <path
          className="bf-antenna"
          d="M30.4 20.5C27 12 23 8 19.5 6.5"
          stroke="#1a2a30"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          className="bf-antenna"
          d="M33.6 20.5C37 12 41 8 44.5 6.5"
          stroke="#1a2a30"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <circle cx="19.5" cy="6.5" r="1.2" fill="#14a896" />
        <circle cx="44.5" cy="6.5" r="1.2" fill="#14a896" />

        <ellipse cx="32" cy="34" rx="3.1" ry="13.5" fill="#142026" />
        <ellipse cx="32" cy="23.5" rx="2.4" ry="3.2" fill="#1c3338" />
        <circle cx="31.1" cy="22.4" r="0.7" fill="#e8eef1" />
        <circle cx="32.9" cy="22.4" r="0.7" fill="#e8eef1" />
      </svg>
    </div>
  )
}
