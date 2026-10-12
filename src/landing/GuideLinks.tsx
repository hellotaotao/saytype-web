import landingPages from '../content/landingPages.json'
import { localizedPath, type LandingPageId, type Locale, type Page } from '../i18n'
import './GuideLinks.css'

export default function GuideLinks({ locale, current }: { locale: Locale; current?: Page }) {
  return (
    <nav className="guide-links" aria-label={locale === 'zh' ? '对比与指南' : 'Comparisons and guides'}>
      <p>{locale === 'zh' ? '对比与指南' : 'Comparisons and guides'}</p>
      <ul>
        {landingPages.pages.map((page) => (
          <li key={page.id}>
            <a href={localizedPath(page.id as LandingPageId, locale)} aria-current={page.id === current ? 'page' : undefined}>{page[locale].nav}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
