import { homeCopy } from './content/homeCopy'
import { localizedPath, type Locale, type Page } from './i18n'
import LanguageSwitcher from './LanguageSwitcher'
import DownloadButton from './DownloadButton'
import './SiteHeader.css'

export default function SiteHeader({ locale, page }: { locale: Locale; page: Page }) {
  const t = homeCopy(locale)
  const home = localizedPath('home', locale)
  return (
    <header className="site-header" aria-label={t('Primary navigation')}>
      <a className="site-brand" href={home} aria-label={t('TypeAloud home')}>
        <img src="/saytype-icon.png" alt="" width="42" height="42" />
        <span>TypeAloud</span>
      </a>
      <nav className="site-nav" aria-label={t('Page sections')}>
        <a href={`${home}#privacy`}>{t('Privacy')}</a>
        <a href={`${home}#workflow`}>{t('How it works')}</a>
        <a href={`${home}#product`}>{t('Product')}</a>
        <a href={localizedPath('updates', locale)} aria-current={page === 'updates' ? 'page' : page === 'changelog' ? 'true' : undefined}>{t('Updates')}</a>
      </nav>
      <LanguageSwitcher locale={locale} page={page} />
      <DownloadButton locale={locale} />
    </header>
  )
}
