import { Download, Eye } from 'lucide-react'
import { profile } from '../data/profile'

type ResumeActionsProps = {
  tone?: 'default' | 'onMedia'
  className?: string
}

export function ResumeActions({
  tone = 'default',
  className = '',
}: ResumeActionsProps) {
  const resumeHref = encodeURI(profile.resume)
  const isOnMedia = tone === 'onMedia'

  const secondaryClass = isOnMedia
    ? 'inline-flex items-center gap-2 border border-mist/35 px-5 py-3 text-sm font-semibold text-mist transition-colors hover:border-accent-bright hover:text-accent-bright'
    : 'inline-flex items-center gap-2 border border-ink/15 px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent dark:border-mist/20 dark:text-mist dark:hover:border-accent-bright dark:hover:text-accent-bright'

  const primaryClass = isOnMedia
    ? 'inline-flex items-center gap-2 bg-mist px-5 py-3 text-sm font-semibold text-night transition-transform hover:-translate-y-0.5'
    : 'inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 dark:bg-mist dark:text-night'

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <a
        href={resumeHref}
        target="_blank"
        rel="noreferrer"
        className={secondaryClass}
      >
        <Eye size={16} />
        View resume
      </a>
      <a
        href={resumeHref}
        download={profile.resumeFileName}
        className={primaryClass}
      >
        <Download size={16} />
        Download Resume
      </a>
    </div>
  )
}
