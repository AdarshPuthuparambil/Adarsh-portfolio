import { certifications, education } from '../data/profile'
import { certificateIcon, skillIcons } from '../data/skillIcons'
import { Reveal } from './Reveal'

export function Education() {
  return (
    <section id="education" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase dark:text-accent-bright">
            Education & training
          </p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl dark:text-mist">
            Foundations and focused learning.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-2">
          <Reveal delay={100}>
            <h3 className="text-sm font-semibold tracking-[0.16em] text-ink/50 uppercase dark:text-mist/45">
              Education
            </h3>
            <ul className="mt-6 space-y-6">
              {education.map((item) => (
                <li key={item.degree}>
                  <p className="font-display text-xl font-bold text-ink dark:text-mist">
                    {item.degree}
                  </p>
                  <p className="mt-1 text-accent dark:text-accent-bright">
                    {item.school}
                  </p>
                  <p className="mt-1 text-sm text-ink/55 dark:text-mist/50">
                    {item.detail}
                  </p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={180}>
            <h3 className="text-sm font-semibold tracking-[0.16em] text-ink/50 uppercase dark:text-mist/45">
              Certifications
            </h3>
            <ul className="mt-6 space-y-8">
              {certifications.map((cert, index) => {
                const CertIcon = certificateIcon

                return (
                  <Reveal key={cert.title} delay={220 + index * 80} as="li">
                    <div className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center border border-ink/10 text-accent dark:border-mist/15 dark:text-accent-bright">
                        <CertIcon aria-hidden className="size-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <p className="font-display text-xl font-bold text-ink dark:text-mist">
                            {cert.title}
                          </p>
                          <span className="text-sm text-ink/50 dark:text-mist/45">
                            {cert.year}
                          </span>
                        </div>
                        <p className="mt-1 text-accent dark:text-accent-bright">
                          {cert.org}
                        </p>
                        <ul className="mt-3 flex flex-wrap gap-2">
                          {cert.focus.map((item) => {
                            const Icon = skillIcons[item]

                            return (
                              <li
                                key={item}
                                className="inline-flex items-center gap-1.5 border border-ink/10 px-2.5 py-1 text-xs text-ink-soft transition-colors hover:border-accent/50 hover:text-accent dark:border-mist/15 dark:text-fog dark:hover:border-accent-bright/50 dark:hover:text-accent-bright"
                              >
                                {Icon ? (
                                  <Icon
                                    aria-hidden
                                    className="size-3.5 shrink-0 opacity-80"
                                  />
                                ) : null}
                                <span>{item}</span>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
