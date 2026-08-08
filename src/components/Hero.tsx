import { ArrowDownRight, Mail } from 'lucide-react'
import { profile } from '../data/profile'
import { useTheme } from '../hooks/useTheme'
import { SocialLinks } from './SocialLinks'

export function Hero() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
          className={`animate-rise font-display text-[clamp(3.4rem,14vw,8.5rem)] leading-[0.88] font-extrabold tracking-[-0.04em] transition-colors duration-300 ${
            isDark ? 'text-mist' : 'text-ink'
          }`}
        >
          {profile.brand}
        </h1>

        <p
          className={`animate-rise delay-200 mt-6 max-w-xl font-display text-2xl leading-snug font-semibold transition-colors duration-300 sm:mt-8 sm:text-3xl ${
            isDark ? 'text-mist/95' : 'text-ink-soft'
          }`}
        >
          {profile.headline}
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
            href="#projects"
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
            href={`mailto:${profile.email}`}
            className={`inline-flex items-center gap-2 border px-5 py-3 text-sm font-semibold transition-colors duration-300 ${
              isDark
                ? 'border-mist/35 text-mist hover:border-accent-bright hover:text-accent-bright'
                : 'border-ink/20 text-ink hover:border-accent hover:text-accent'
            }`}
          >
            <Mail size={16} />
            Contact me
          </a>
          <SocialLinks
            tone={isDark ? 'onMedia' : 'default'}
            className="ml-1 sm:ml-3"
          />
        </div>
      </div>
    </section>
  )
}
