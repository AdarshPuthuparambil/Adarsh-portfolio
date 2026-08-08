import { useTheme } from '../hooks/useTheme'

type ThemeToggleProps = {
  onDarkSurface?: boolean
  className?: string
}

export function ThemeToggle({
  onDarkSurface = false,
  className = '',
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={`theme-toggle group relative inline-flex h-10 w-[4.75rem] items-center rounded-full border p-1 transition-all duration-500 ${
        isDark
          ? 'border-mist/20 bg-[linear-gradient(135deg,#0b1220_0%,#152238_55%,#0f7a72_140%)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04),0_0_18px_rgba(20,168,150,0.18)]'
          : 'border-ink/10 bg-[linear-gradient(135deg,#f7efe2_0%,#e8f2f4_55%,#cfe8e4_100%)] shadow-[inset_0_0_0_1px_rgba(16,20,24,0.04)]'
      } ${
        onDarkSurface && !isDark ? 'border-mist/35' : ''
      } ${className}`}
    >
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-x-2 top-1.5 flex justify-between text-[9px] font-semibold tracking-[0.14em] uppercase transition-opacity duration-300 ${
          isDark ? 'text-mist/45' : 'text-ink/40'
        }`}
      >
        
      </span>

      <span
        className={`theme-toggle-thumb relative z-10 flex h-8 w-8 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isDark
            ? 'translate-x-[1.85rem] bg-night text-accent-bright shadow-[0_0_16px_rgba(20,168,150,0.45)]'
            : 'translate-x-0 bg-paper text-amber-600 shadow-[0_2px_10px_rgba(16,20,24,0.12)]'
        }`}
      >
        <span className="theme-toggle-icon relative h-4 w-4">
          <span
            className={`absolute inset-0 transition-all duration-500 ${
              isDark
                ? 'scale-50 rotate-90 opacity-0'
                : 'scale-100 rotate-0 opacity-100'
            }`}
          >
            <SunGlyph />
          </span>
          <span
            className={`absolute inset-0 transition-all duration-500 ${
              isDark
                ? 'scale-100 rotate-0 opacity-100'
                : 'scale-50 -rotate-90 opacity-0'
            }`}
          >
            <MoonGlyph />
          </span>
        </span>
      </span>

      {isDark ? <Stars /> : <Rays />}
    </button>
  )
}

function SunGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <g
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="theme-sun-rays origin-center"
      >
        <path d="M12 2.5v2.2" />
        <path d="M12 19.3v2.2" />
        <path d="M2.5 12h2.2" />
        <path d="M19.3 12h2.2" />
        <path d="M5.2 5.2l1.6 1.6" />
        <path d="M17.2 17.2l1.6 1.6" />
        <path d="M18.8 5.2l-1.6 1.6" />
        <path d="M6.8 17.2l-1.6 1.6" />
      </g>
    </svg>
  )
}

function MoonGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M16.5 2.8a8.8 8.8 0 11-10.8 13.5A7.2 7.2 0 1016.5 2.8z" />
    </svg>
  )
}

function Rays() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
    >
      <span className="theme-day-glow absolute -left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-amber-300/35 blur-md" />
    </span>
  )
}

function Stars() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
    >
      <span className="theme-star absolute top-2 left-3 h-1 w-1 rounded-full bg-mist/80" />
      <span className="theme-star theme-star-delay absolute top-4 left-5 h-0.5 w-0.5 rounded-full bg-accent-bright/90" />
      <span className="theme-star theme-star-delay-2 absolute right-3 bottom-2.5 h-1 w-1 rounded-full bg-mist/70" />
    </span>
  )
}
