import { profile } from '../data/profile'
import { SocialLinks } from './SocialLinks'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-ink/10 py-8 dark:border-mist/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm text-ink/55 dark:text-mist/45">
          © {year} {profile.name}
        </p>
        <SocialLinks iconSize={18} />
      </div>
    </footer>
  )
}
