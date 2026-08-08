import { skillGroups } from '../data/profile'
import { skillIcons } from '../data/skillIcons'
import { Reveal } from './Reveal'

export function Skills() {
  return (
    <section id="skills" className="scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <p className="text-sm font-medium tracking-[0.18em] text-accent uppercase dark:text-accent-bright">
            Skills
          </p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl dark:text-mist">
            The stack I reach for most.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          {skillGroups.map((group, groupIndex) => (
            <Reveal key={group.label} delay={groupIndex * 90}>
              <h3 className="font-display text-lg font-semibold text-ink dark:text-mist">
                {group.label}
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item, itemIndex) => {
                  const Icon = skillIcons[item]

                  return (
                    <Reveal
                      key={item}
                      delay={80 + itemIndex * 40}
                      as="li"
                      className="inline-flex items-center gap-2 border border-ink/10 px-3 py-1.5 text-sm text-ink-soft transition-colors hover:border-accent/50 hover:text-accent dark:border-mist/15 dark:text-fog dark:hover:border-accent-bright/50 dark:hover:text-accent-bright"
                    >
                      {Icon ? (
                        <Icon
                          aria-hidden
                          className="size-4 shrink-0 opacity-80"
                        />
                      ) : null}
                      <span>{item}</span>
                    </Reveal>
                  )
                })}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
