import { useEffect, useState } from 'react'
import {
  Briefcase,
  FolderKanban,
  Home,
  Mail,
  Sparkles,
  User,
} from 'lucide-react'

const items = [
  { id: 'top', href: '#top', label: 'Home', icon: Home },
  { id: 'about', href: '#about', label: 'About', icon: User },
  { id: 'experience', href: '#experience', label: 'Work', icon: Briefcase },
  { id: 'skills', href: '#skills', label: 'Skills', icon: Sparkles },
  { id: 'projects', href: '#projects', label: 'Projects', icon: FolderKanban },
  { id: 'contact', href: '#contact', label: 'Contact', icon: Mail },
] as const

function sectionIdAtOffset(ids: readonly string[], offset: number) {
  let current = ids[0]
  let closestTop = -Infinity

  for (const id of ids) {
    const el = document.getElementById(id)
    if (!el) continue
    const top = el.getBoundingClientRect().top
    if (top <= offset && top >= closestTop) {
      closestTop = top
      current = id
    }
  }

  return current
}

export function BottomNav() {
  const [activeId, setActiveId] = useState('top')

  useEffect(() => {
    const onScroll = () => {
      const offset = window.innerHeight * 0.38
      setActiveId(sectionIdAtOffset(
        items.map((item) => item.id),
        offset,
      ))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden"
    >
      <div className="pointer-events-auto mx-3 mb-[max(0.7rem,env(safe-area-inset-bottom))]">
        <div className="bottom-nav relative flex items-stretch overflow-hidden rounded-[1.35rem] px-1.5 py-1.5">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.id === activeId

            return (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setActiveId(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 transition-colors duration-200 ${
                  isActive
                    ? 'text-accent dark:text-accent-bright'
                    : 'text-ink/55 dark:text-mist/50'
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden
                    className="bottom-nav-active absolute inset-y-0.5 inset-x-0.5 rounded-xl"
                  />
                )}
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.4 : 1.9}
                  className="relative z-10"
                />
                <span className="relative z-10 max-w-full truncate font-display text-[10px] font-semibold tracking-wide">
                  {item.label}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
