import { useEffect, useState, type CSSProperties } from 'react'
import { Menu, X } from 'lucide-react'
import { navLinks, profile } from '../data/profile'
import { useTheme } from '../hooks/useTheme'
import { ThemeToggle } from './ThemeToggle'

const MENU_EXIT_MS = 320

export function Navbar() {
  const { theme } = useTheme()
  const [open, setOpen] = useState(false)
  const [menuMounted, setMenuMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (open || !menuMounted) return

    const timeoutId = window.setTimeout(() => setMenuMounted(false), MENU_EXIT_MS)
    return () => window.clearTimeout(timeoutId)
  }, [open, menuMounted])

  useEffect(() => {
    document.body.style.overflow = menuMounted ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuMounted])

  const closeMenu = () => setOpen(false)
  const toggleMenu = () => {
    if (open) {
      setOpen(false)
      return
    }
    setMenuMounted(true)
    setOpen(true)
  }

  const menuActive = open || menuMounted
  const overHero = !scrolled && !menuActive
  const onDarkHero = overHero && theme === 'dark'

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || menuActive
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
          onClick={closeMenu}
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
            onClick={toggleMenu}
            aria-expanded={open}
            aria-controls="mobile-nav"
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

      {menuMounted && (
        <div
          id="mobile-nav"
          className={`mobile-nav-panel md:hidden ${open ? 'is-open' : 'is-closing'}`}
        >
          <div className="mobile-nav-liquid" aria-hidden="true">
            <span className="mobile-nav-blob mobile-nav-blob-a" />
            <span className="mobile-nav-blob mobile-nav-blob-b" />
            <span className="mobile-nav-blob mobile-nav-blob-c" />
          </div>
          <nav className="relative z-10 flex flex-col gap-1 px-5 py-6">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                style={{ '--nav-i': index } as CSSProperties}
                className="mobile-nav-link font-display text-2xl font-semibold text-ink dark:text-mist"
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
