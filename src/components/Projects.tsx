import { projects } from '../data/profile'
import { Reveal } from './Reveal'

export function Projects() {
  return (
    <section id="projects" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase dark:text-accent-bright">
            Selected work
          </p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl dark:text-mist">
           Academic and Professional Projects.
          </h2>
        </Reveal>

        <div className="mt-14 divide-y divide-ink/10 border-y border-ink/10 dark:divide-mist/10 dark:border-mist/10">
          {projects.map((project, index) => (
            <Reveal
              key={project.title}
              delay={index * 100}
              as="article"
              className="group grid gap-5 py-10 transition-colors sm:grid-cols-[80px_1fr] sm:gap-10"
            >
              <span className="font-display text-sm font-semibold tracking-[0.2em] text-accent/80 uppercase dark:text-accent-bright/80">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="font-display text-2xl font-bold text-ink transition-colors group-hover:text-accent sm:text-3xl dark:text-mist dark:group-hover:text-accent-bright">
                  {project.title}
                </h3>
                <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft/85 dark:text-fog">
                  {project.description}
                </p>
                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
                  {project.stack.map((tech) => (
                    <li
                      key={tech}
                      className="text-sm font-medium text-ink/60 dark:text-mist/55"
                    >
                      {tech}
                    </li>
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
