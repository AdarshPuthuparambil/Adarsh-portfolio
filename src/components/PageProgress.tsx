import { useEffect, useState } from 'react'

const sections = [
  { id: 'top', label: '01', name: 'Home' },
  { id: 'about', label: '02', name: 'About' },
  { id: 'experience', label: '03', name: 'Experience' },
  { id: 'projects', label: '04', name: 'Projects' },
  { id: 'skills', label: '05', name: 'Skills' },
  { id: 'education', label: '06', name: 'Education' },
  { id: 'contact', label: '07', name: 'Contact' },
]

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

      for (const section of sections) {
        const el = document.getElementById(section.id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= offset) {
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
        <div className="flex flex-col items-end gap-1">
          <span className="font-display text-[10px] tracking-[0.22em] text-ink/45 uppercase transition-colors duration-300 dark:text-mist/40">
            {active.name}
          </span>
          <span className="font-display text-sm font-semibold tabular-nums text-accent transition-colors duration-300 dark:text-accent-bright">
            {String(Math.round(progress)).padStart(2, '0')}%
          </span>
        </div>

        <div className="relative flex flex-col items-center">
          <div
            aria-hidden
            className="absolute top-2 bottom-2 w-px bg-ink/10 dark:bg-mist/15"
          />
          <div
            aria-hidden
            className="absolute top-2 w-px origin-top bg-accent transition-[height] duration-150 ease-out dark:bg-accent-bright"
            style={{ height: `calc((100% - 1rem) * ${progress / 100})` }}
          />

          <nav className="relative z-10 flex flex-col items-center gap-3.5 py-1">
            {sections.map((section) => {
              const isActive = section.id === activeId

              return (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  aria-label={section.name}
                  aria-current={isActive ? 'true' : undefined}
                  className="group relative flex h-4 w-4 items-center justify-center"
                >
                  <span
                    className={`block rounded-full transition-all duration-300 ${
                      isActive
                        ? 'h-2.5 w-2.5 bg-accent shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-accent)_22%,transparent)] dark:bg-accent-bright dark:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-accent-bright)_22%,transparent)]'
                        : 'h-1.5 w-1.5 bg-ink/30 group-hover:scale-125 group-hover:bg-accent dark:bg-mist/35 dark:group-hover:bg-accent-bright'
                    }`}
                  />
                  <span className="pointer-events-none absolute right-6 rounded bg-ink px-2 py-1 font-display text-[10px] tracking-wide whitespace-nowrap text-paper opacity-0 transition-opacity duration-200 group-hover:opacity-100 dark:bg-mist dark:text-night">
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
