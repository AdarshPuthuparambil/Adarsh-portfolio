import { profile } from '../data/profile'
import { Reveal } from './Reveal'

export function About() {
  return (
    <section id="about" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase dark:text-accent-bright">
            About
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl dark:text-mist">
            Building products people can ship and use.
          </h2>
        </Reveal>

        <Reveal delay={120} className="space-y-6 text-base leading-relaxed text-ink-soft/85 sm:text-lg dark:text-fog">
          <p>
            I&apos;m {profile.name}, a {profile.shortTitle.toLowerCase()} based
            in {profile.location}. My work spans production React Native apps
            on Android and iOS, TypeScript-heavy React web clients, and
            client collaboration from discovery through delivery.
          </p>
          <p>
            Recently at VOFOX Solutions I&apos;ve shipped map-based navigation,
            airline employee travel booking, and AI-assisted Cisco insight
            tooling — always with an eye on performance, clarity, and
            maintainable architecture.
          </p>
          <p className="text-sm tracking-wide text-ink/60 uppercase dark:text-mist/50">
            Spoken languages · {profile.languages.join(' · ')}
          </p>
        </Reveal>
      </div>
    </section>
  )
}
