import { Mail, MapPin, Phone } from 'lucide-react'
import { profile } from '../data/profile'
import { Reveal } from './Reveal'
import { ResumeActions } from './ResumeActions'
import { SocialLinks } from './SocialLinks'

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 py-20 sm:py-28">
      <div className="relative mx-auto max-w-6xl overflow-hidden px-5 sm:px-8">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(15,122,114,0.14),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(20,168,150,0.16),transparent_55%)]"
        />

        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase dark:text-accent-bright">
            Contact
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl dark:text-mist">
            Let&apos;s build something useful together.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft/80 sm:text-lg dark:text-fog">
            Open to roles, freelance collaborations, and product conversations
            around React, React Native, and TypeScript.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <Reveal delay={100}>
            <a
              href={`mailto:${profile.email}`}
              className="group block border-t border-ink/10 pt-5 transition-colors dark:border-mist/10"
            >
              <Mail
                size={18}
                className="text-accent dark:text-accent-bright"
              />
              <p className="mt-3 text-sm tracking-wide text-ink/50 uppercase dark:text-mist/45">
                Email
              </p>
              <p className="mt-1 break-all font-medium text-ink transition-colors group-hover:text-accent dark:text-mist dark:group-hover:text-accent-bright">
                {profile.email}
              </p>
            </a>
          </Reveal>

          <Reveal delay={180}>
            <a
              href={`tel:${profile.phone.replace(/\s/g, '')}`}
              className="group block border-t border-ink/10 pt-5 transition-colors dark:border-mist/10"
            >
              <Phone
                size={18}
                className="text-accent dark:text-accent-bright"
              />
              <p className="mt-3 text-sm tracking-wide text-ink/50 uppercase dark:text-mist/45">
                Phone
              </p>
              <p className="mt-1 font-medium text-ink transition-colors group-hover:text-accent dark:text-mist dark:group-hover:text-accent-bright">
                {profile.phone}
              </p>
            </a>
          </Reveal>

          <Reveal delay={260}>
            <div className="border-t border-ink/10 pt-5 dark:border-mist/10">
              <MapPin
                size={18}
                className="text-accent dark:text-accent-bright"
              />
              <p className="mt-3 text-sm tracking-wide text-ink/50 uppercase dark:text-mist/45">
                Location
              </p>
              <p className="mt-1 font-medium text-ink dark:text-mist">
                {profile.location}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={320}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
            <ResumeActions />
            <SocialLinks variant="buttons" />
          </div>
        </Reveal>
      </div>
    </section>
  )
}
