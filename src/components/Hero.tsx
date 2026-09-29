import { ArrowDownRight, Mail } from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { profile } from '../data/profile'
import { useTheme } from '../hooks/useTheme'
import { ResumeActions } from './ResumeActions'
import { SocialLinks } from './SocialLinks'

const HEADLINE_START_MS = 450
const HEADLINE_CHAR_MS = 38
const BRAND_LETTER_MS = 900
const BRAND_STAGGER_MS = 80

export function Hero() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [typedHeadline, setTypedHeadline] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [isBrandSettled, setIsBrandSettled] = useState(false)

  // The shine clips a gradient to the heading's glyphs, which only renders
  // correctly once the per-letter entrance transforms have finished.
  useEffect(() => {
    const settleId = window.setTimeout(
      () => setIsBrandSettled(true),
      BRAND_LETTER_MS + (profile.brand.length - 1) * BRAND_STAGGER_MS,
    )

    return () => window.clearTimeout(settleId)
  }, [])

  useEffect(() => {
    const full = profile.headline
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      setTypedHeadline(full)
      setIsTyping(false)
      return
    }

    let index = 0
    let intervalId = 0
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        index += 1
        setTypedHeadline(full.slice(0, index))
        if (index >= full.length) {
          window.clearInterval(intervalId)
          setIsTyping(false)
        }
      }, HEADLINE_CHAR_MS)
    }, HEADLINE_START_MS)

    return () => {
      window.clearTimeout(startId)
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <section
      id="top"
      className="relative flex min-h-svh items-end overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          src="/adarsh.jpeg"
          alt={`${profile.name}, Software Engineer`}
          className="animate-fade h-full w-full object-cover object-[42%_18%] sm:object-[45%_20%]"
        />
        <div
          aria-hidden
          className={`absolute inset-0 transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-t from-night via-night/70 to-night/25'
              : 'bg-gradient-to-t from-paper via-paper/80 to-paper/30'
          }`}
        />
        <div
          aria-hidden
          className={`absolute inset-0 transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-night/55 via-transparent to-transparent'
              : 'bg-gradient-to-r from-paper/60 via-transparent to-transparent'
          }`}
        />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pb-20">
        <h1
          aria-label={profile.brand}
          style={{ '--brand-chars': profile.brand.length } as CSSProperties}
          className={`brand-fit font-display leading-[0.88] font-extrabold tracking-[-0.04em] whitespace-nowrap transition-colors duration-300 ${
            isBrandSettled ? 'brand-shine' : ''
          } ${isDark ? 'text-mist' : 'text-ink'}`}
        >
          {[...profile.brand].map((char, index) => (
            <span
              key={`${char}-${index}`}
              aria-hidden
              className="brand-letter"
              style={{ '--i': index } as CSSProperties}
            >
              {char === ' ' ? '\u00a0' : char}
            </span>
          ))}
        </h1>

        <p
          className={`mt-6 max-w-xl font-display text-2xl leading-snug font-semibold transition-colors duration-300 sm:mt-8 sm:text-3xl ${
            isDark ? 'text-mist/95' : 'text-ink-soft'
          }`}
          aria-label={profile.headline}
        >
          <span aria-hidden>{typedHeadline}</span>
          {isTyping ? (
            <span
              aria-hidden
              className={`ml-0.5 inline-block h-[0.9em] w-[0.08em] translate-y-[0.08em] animate-pulse align-baseline ${
                isDark ? 'bg-mist/90' : 'bg-ink-soft'
              }`}
            />
          ) : null}
        </p>

        <p
          className={`animate-rise delay-300 mt-4 max-w-lg text-base leading-relaxed sm:text-lg ${
            isDark ? 'text-mist/75' : 'text-ink-soft/75'
          }`}
        >
          <span className="animate-title-blink font-semibold tracking-wide">
            {profile.title}
          </span>
        </p>

        <div className="animate-rise delay-400 mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
          <a
            href="#experience"
            className={`group inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
              isDark
                ? 'bg-mist text-night'
                : 'bg-ink text-paper'
            }`}
          >
            View projects
            <ArrowDownRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </a>
          <a
            href="#contact-form"
            className={`inline-flex items-center gap-2 border px-5 py-3 text-sm font-semibold transition-colors duration-300 ${
              isDark
                ? 'border-mist/35 text-mist hover:border-accent-bright hover:text-accent-bright'
                : 'border-ink/20 text-ink hover:border-accent hover:text-accent'
            }`}
          >
            <Mail size={16} />
            Contact me
          </a>
          <ResumeActions
            tone={isDark ? 'onMedia' : 'default'}
            className="w-full sm:w-auto"
          />
          <SocialLinks
            tone={isDark ? 'onMedia' : 'default'}
            className="ml-1 sm:ml-3"
          />
        </div>
      </div>
    </section>
  )
}
