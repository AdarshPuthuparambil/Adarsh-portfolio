import { useEffect, useState } from 'react'
import { navLinks, profile } from '../data/profile'
import { useTheme } from '../hooks/useTheme'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const { theme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const overHero = !scrolled
  const onDarkHero = overHero && theme === 'dark'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-ink/10 bg-paper/85 backdrop-blur-md dark:border-mist/10 dark:bg-night/85'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#top"
          className={`font-display text-lg font-bold tracking-tight transition-colors ${
            onDarkHero
              ? 'text-mist hover:text-accent-bright'
              : 'text-ink hover:text-accent dark:text-mist dark:hover:text-accent-bright'
          }`}
        >
          {profile.name.toUpperCase()}
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                onDarkHero
                  ? 'text-mist/80 hover:text-accent-bright'
                  : 'text-ink-soft/80 hover:text-accent dark:text-mist/70 dark:hover:text-accent-bright'
              }`}
            >
              {link.label}
            </a>
          ))}
          <ThemeToggle onDarkSurface={onDarkHero} />
        </nav>

        <div className="md:hidden">
          <ThemeToggle onDarkSurface={onDarkHero} />
        </div>
      </div>
    </header>
  )
}
