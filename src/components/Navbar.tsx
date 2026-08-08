import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { navLinks, profile } from '../data/profile'
import { useTheme } from '../hooks/useTheme'
import { ThemeToggle } from './ThemeToggle'

export function Navbar() {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const overHero = !scrolled && !open
  const onDarkHero = overHero && theme === 'dark'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
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
          onClick={() => setOpen(false)}
        >
          {profile.brand}
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

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle onDarkSurface={onDarkHero} />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${
              onDarkHero
                ? 'border-mist/30 text-mist'
                : 'border-ink/10 text-ink dark:border-mist/15 dark:text-mist'
            }`}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-paper px-5 py-6 dark:border-mist/10 dark:bg-night md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-2xl font-semibold text-ink dark:text-mist"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
