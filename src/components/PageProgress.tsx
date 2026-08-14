import { useEffect, useMemo, useState, type CSSProperties } from 'react'

const sections = [
  { id: 'top', label: '01', name: 'Home' },
  { id: 'about', label: '02', name: 'About' },
  { id: 'experience', label: '03', name: 'Experience' },
  { id: 'skills', label: '04', name: 'Skills' },
  { id: 'projects', label: '05', name: 'Projects' },
  { id: 'education', label: '06', name: 'Education' },
  { id: 'contact', label: '07', name: 'Contact' },
]

type Sticker = 'W' | 'Y' | 'R' | 'O' | 'G' | 'B'

const STICKER: Record<Sticker, string> = {
  W: '#f4f7f8',
  Y: '#f0d000',
  R: '#c62828',
  O: '#ef6c00',
  G: '#2e7d32',
  B: '#1565c0',
}

/** Solved layout for the three visible faces (U / R / F), row-major 3×3. */
const SOLVED = {
  U: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'] as Sticker[],
  R: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'] as Sticker[],
  F: ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'] as Sticker[],
}

/**
 * Keyframes from scrambled → solved. Each frame is one “move” closer to solved
 * so scroll progress maps cleanly onto a solving animation.
 */
const SOLVE_FRAMES: Array<{
  U: Sticker[]
  R: Sticker[]
  F: Sticker[]
}> = [
  {
    // Fully scrambled
    U: ['O', 'B', 'Y', 'R', 'W', 'G', 'B', 'O', 'R'],
    R: ['W', 'Y', 'G', 'B', 'R', 'W', 'O', 'G', 'Y'],
    F: ['R', 'W', 'B', 'Y', 'G', 'O', 'W', 'R', 'B'],
  },
  {
    U: ['O', 'B', 'Y', 'R', 'W', 'G', 'G', 'O', 'R'],
    R: ['W', 'Y', 'B', 'B', 'R', 'W', 'O', 'G', 'Y'],
    F: ['R', 'W', 'G', 'Y', 'G', 'O', 'W', 'R', 'B'],
  },
  {
    U: ['W', 'B', 'Y', 'R', 'W', 'G', 'G', 'O', 'R'],
    R: ['W', 'Y', 'B', 'B', 'R', 'O', 'O', 'G', 'Y'],
    F: ['R', 'W', 'G', 'Y', 'G', 'R', 'W', 'R', 'B'],
  },
  {
    U: ['W', 'W', 'Y', 'R', 'W', 'G', 'G', 'O', 'B'],
    R: ['R', 'Y', 'B', 'B', 'R', 'O', 'O', 'G', 'Y'],
    F: ['R', 'W', 'G', 'Y', 'G', 'R', 'W', 'B', 'B'],
  },
  {
    U: ['W', 'W', 'W', 'R', 'W', 'G', 'G', 'O', 'B'],
    R: ['R', 'Y', 'B', 'B', 'R', 'O', 'Y', 'G', 'Y'],
    F: ['R', 'W', 'G', 'O', 'G', 'R', 'W', 'B', 'B'],
  },
  {
    U: ['W', 'W', 'W', 'W', 'W', 'G', 'G', 'O', 'B'],
    R: ['R', 'R', 'B', 'B', 'R', 'O', 'Y', 'G', 'Y'],
    F: ['R', 'W', 'G', 'O', 'G', 'Y', 'W', 'B', 'B'],
  },
  {
    U: ['W', 'W', 'W', 'W', 'W', 'W', 'G', 'O', 'B'],
    R: ['R', 'R', 'R', 'B', 'R', 'O', 'Y', 'G', 'Y'],
    F: ['G', 'W', 'G', 'O', 'G', 'Y', 'W', 'B', 'B'],
  },
  {
    U: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'O', 'B'],
    R: ['R', 'R', 'R', 'R', 'R', 'O', 'Y', 'G', 'Y'],
    F: ['G', 'G', 'G', 'O', 'G', 'Y', 'W', 'B', 'B'],
  },
  {
    U: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'B'],
    R: ['R', 'R', 'R', 'R', 'R', 'R', 'Y', 'G', 'Y'],
    F: ['G', 'G', 'G', 'O', 'G', 'Y', 'B', 'B', 'B'],
  },
  {
    U: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    R: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'G', 'Y'],
    F: ['G', 'G', 'G', 'O', 'G', 'Y', 'B', 'B', 'B'],
  },
  {
    U: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    R: ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'Y'],
    F: ['G', 'G', 'G', 'G', 'G', 'Y', 'B', 'B', 'B'],
  },
  {
    U: SOLVED.U,
    R: SOLVED.R,
    F: SOLVED.F,
  },
]

function faceAtProgress(progress: number) {
  const max = SOLVE_FRAMES.length - 1
  const t = (Math.min(100, Math.max(0, progress)) / 100) * max
  const i = Math.min(max, Math.floor(t))
  const next = Math.min(max, i + 1)
  const blend = t - i

  // Snap stickers that have already “locked” in the next frame for a solving feel
  const mix = (a: Sticker[], b: Sticker[]) =>
    a.map((color, idx) => (blend >= 0.45 ? b[idx] : color))

  const current = SOLVE_FRAMES[i]
  const upcoming = SOLVE_FRAMES[next]

  return {
    U: mix(current.U, upcoming.U),
    R: mix(current.R, upcoming.R),
    F: mix(current.F, upcoming.F),
    turn: blend,
  }
}

function FaceGrid({
  stickers,
  className,
  style,
}: {
  stickers: Sticker[]
  className: string
  style: CSSProperties
}) {
  return (
    <div
      aria-hidden
      className={`absolute grid grid-cols-3 grid-rows-3 gap-[2px] rounded-[3px] bg-ink/80 p-[3px] dark:bg-mist/25 ${className}`}
      style={style}
    >
      {stickers.map((sticker, i) => (
        <span
          key={i}
          className="rounded-[2px] transition-[background-color] duration-200 ease-out"
          style={{ backgroundColor: STICKER[sticker] }}
        />
      ))}
    </div>
  )
}

function RubikProgress({ progress }: { progress: number }) {
  const { U, R, F } = useMemo(() => faceAtProgress(progress), [progress])
  const spin = -32 + (progress / 100) * 28
  const tilt = -28 + (progress / 100) * 6
  const solved = progress >= 99.5

  return (
    <div
      className="group/cube relative h-14 w-14 shrink-0 hidden sm:block"
      style={{ perspective: '420px' }}
    >
      <span className="pointer-events-none absolute top-1/2 right-[calc(100%+0.65rem)] z-20 -translate-y-1/2 rounded bg-ink px-2 py-1 font-display text-[10px] tracking-wide whitespace-nowrap text-paper opacity-0 transition-opacity duration-200 group-hover/cube:opacity-100 dark:bg-mist dark:text-night">
        {solved ? 'Cube solved' : 'Scroll for solution'}
      </span>

      <div
        className="absolute inset-0 transition-transform duration-150 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${tilt}deg) rotateY(${spin}deg)`,
        }}
      >
        <FaceGrid
          stickers={F}
          className="inset-[10px]"
          style={{ transform: 'translateZ(18px)' }}
        />
        <FaceGrid
          stickers={R}
          className="inset-[10px]"
          style={{ transform: 'rotateY(90deg) translateZ(18px)' }}
        />
        <FaceGrid
          stickers={U}
          className="inset-[10px]"
          style={{ transform: 'rotateX(90deg) translateZ(18px)' }}
        />
        {/* Hidden faces give the cube thickness while turning */}
        <div
          aria-hidden
          className="absolute inset-[10px] rounded-[3px] bg-ink/35 dark:bg-mist/10"
          style={{ transform: 'rotateY(180deg) translateZ(18px)' }}
        />
        <div
          aria-hidden
          className="absolute inset-[10px] rounded-[3px] bg-ink/35 dark:bg-mist/10"
          style={{ transform: 'rotateY(-90deg) translateZ(18px)' }}
        />
        <div
          aria-hidden
          className="absolute inset-[10px] rounded-[3px] bg-ink/35 dark:bg-mist/10"
          style={{ transform: 'rotateX(-90deg) translateZ(18px)' }}
        />
      </div>

      {solved && (
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-full bg-accent/15 blur-md dark:bg-accent-bright/20"
        />
      )}
    </div>
  )
}

export function PageProgress() {
  const [progress, setProgress] = useState(0)
  const [activeId, setActiveId] = useState('top')

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const nextProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, nextProgress)))

      const offset = window.innerHeight * 0.35
      let current = sections[0].id
      let closestTop = -Infinity

      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (!el) continue
        const top = el.getBoundingClientRect().top
        if (top <= offset && top >= closestTop) {
          closestTop = top
          current = section.id
        }
      }

      setActiveId(current)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  const active =
    sections.find((section) => section.id === activeId) ?? sections[0]

  return (
    <aside
      aria-label="Page position"
      className="pointer-events-none fixed top-1/2 right-3 z-50 hidden -translate-y-1/2 sm:right-5 md:block"
    >
      <div className="pointer-events-auto flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end gap-1">
          <span className="font-display text-[10px] tracking-[0.22em] text-ink/45 uppercase transition-colors duration-300 dark:text-mist/40 ">
            {active.name}
          </span>
          <span className="font-display text-sm font-semibold tabular-nums text-accent transition-colors duration-300 dark:text-accent-bright">
            {String(Math.round(progress)).padStart(2, '0')}%
          </span>
        </div>

        <div className="relative flex flex-col items-center gap-3">
          <RubikProgress progress={progress} />

          <nav className="flex flex-col items-center gap-2.5" aria-label="Sections">
            {sections.map((section) => {
              const isActive = section.id === activeId

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  aria-label={section.name}
                  aria-current={isActive ? 'true' : undefined}
                  className="group relative flex h-3 w-3 items-center justify-center"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      isActive
                        ? 'h-2 w-2 bg-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-accent)_22%,transparent)] dark:bg-accent-bright dark:shadow-[0_0_0_3px_color-mix(in_oklab,var(--color-accent-bright)_22%,transparent)]'
                        : 'h-1 w-1 bg-ink/30 group-hover:scale-125 group-hover:bg-accent dark:bg-mist/35 dark:group-hover:bg-accent-bright'
                    }`}
                  />
                  <span className="pointer-events-none absolute right-5 rounded bg-ink px-2 py-1 font-display text-[10px] tracking-wide whitespace-nowrap text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-mist dark:text-night">
                    {section.label} {section.name}
                  </span>
                </a>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
