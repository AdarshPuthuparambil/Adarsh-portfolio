import { socialLinks } from '../data/profile'
import {
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  WhatsappIcon,
} from './SocialIcons'

const icons = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  instagram: InstagramIcon,
  whatsapp: WhatsappIcon,
} as const

type SocialLinksProps = {
  variant?: 'icons' | 'buttons'
  tone?: 'default' | 'onMedia'
  className?: string
  iconSize?: number
}

export function SocialLinks({
  variant = 'icons',
  tone = 'default',
  className = '',
  iconSize = 20,
}: SocialLinksProps) {
  if (variant === 'buttons') {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {socialLinks.map((social, index) => {
          const Icon = icons[social.id]
          const isPrimary = index === 0

          return (
            <a
              key={social.id}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              className={
                isPrimary
                  ? 'inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 dark:bg-mist dark:text-night'
                  : 'inline-flex items-center gap-2 border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent dark:border-mist/20 dark:text-mist dark:hover:border-accent-bright dark:hover:text-accent-bright'
              }
            >
              <Icon size={16} />
              {social.label}
            </a>
          )
        })}
      </div>
    )
  }

  const iconClass =
    tone === 'onMedia'
      ? 'inline-flex h-11 w-11 items-center justify-center text-mist/85 transition-colors hover:text-accent-bright'
      : 'inline-flex h-11 w-11 items-center justify-center text-ink-soft transition-colors hover:text-accent dark:text-mist/80 dark:hover:text-accent-bright'

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {socialLinks.map((social) => {
        const Icon = icons[social.id]

        return (
          <a
            key={social.id}
            href={social.href}
            target="_blank"
            rel="noreferrer"
            aria-label={social.label}
            className={iconClass}
          >
            <Icon size={iconSize} />
          </a>
        )
      })}
    </div>
  )
}
