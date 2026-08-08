import { ExternalLink } from 'lucide-react'
import { experience } from '../data/profile'
import { Reveal } from './Reveal'

export function Experience() {
  return (
    <section id="experience" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase dark:text-accent-bright">
            Experience
          </p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl dark:text-mist">
            Roles where the work shipped.
          </h2>
        </Reveal>

        <div className="mt-14 space-y-14">
          {experience.map((job, jobIndex) => (
            <Reveal key={job.company} delay={jobIndex * 80} as="article">
              <div className="border-t border-ink/10 pt-10 dark:border-mist/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-center gap-4">
                    <a
                      href={job.companyUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Visit ${job.company} website`}
                      className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden p-0.5 transition-opacity hover:opacity-80 sm:h-16 sm:w-16"
                    >
                      <img
                        src={job.logo}
                        alt={`${job.company} logo`}
                        className="h-full w-full object-contain"
                      />
                    </a>
                    <div>
                      <h3 className="font-display text-2xl font-bold text-ink dark:text-mist">
                        {job.role}
                      </h3>
                      <a
                        href={job.companyUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-lg text-accent transition-colors hover:text-ink dark:text-accent-bright dark:hover:text-mist"
                      >
                        {job.company}
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  <p className="text-sm font-medium tracking-wide text-ink/55 dark:text-mist/50">
                    {job.period}
                  </p>
                </div>

                <ul className="mt-8 space-y-8">
                  {job.projects.map((project, projectIndex) => (
                    <Reveal
                      key={`${job.company}-${project.name}`}
                      delay={120 + projectIndex * 90}
                      as="li"
                      className="grid gap-3 sm:grid-cols-[minmax(0,260px)_1fr] sm:gap-8"
                    >
                      <div className="flex items-start gap-3">
                        {project.logo ? (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden p-0.5">
                            <img
                              src={project.logo}
                              alt={`${project.name} logo`}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        ) : null}
                        <div>
                          <p className="font-display text-lg font-semibold text-ink dark:text-mist">
                            {project.name}
                          </p>
                          <p className="mt-1 text-sm text-ink/55 dark:text-mist/50">
                            {project.stack}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="leading-relaxed text-ink-soft/85 dark:text-fog">
                          {project.description}
                        </p>
                        {project.link ? (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-ink dark:text-accent-bright dark:hover:text-mist"
                          >
                            {project.linkLabel ?? project.link}
                            <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </div>
                    </Reveal>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
