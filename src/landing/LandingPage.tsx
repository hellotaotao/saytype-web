import landingPages from '../content/landingPages.json'
import { localizedPath, type LandingPageId, type Locale } from '../i18n'
import SiteHeader from '../SiteHeader'
import DownloadButton from '../DownloadButton'
import GuideLinks from './GuideLinks'
import '../updates/UpdatesPage.css'
import './LandingPage.css'

interface LandingCopy {
  eyebrow: string
  heading: string[]
  intro: string
  table?: { caption: string; columns: string[]; rows: string[][] }
  sections: { heading: string; body: string[] }[]
  faq: { q: string; a: string }[]
}
interface LandingEntry {
  id: string
  checked?: string
  sources?: { label: string; url: string }[]
  en: LandingCopy
  zh: LandingCopy
}

function checkedLabel(value: string, locale: Locale) {
  const [year, month, day] = value.split('-').map(Number)
  if (locale === 'zh') return `${year}年${month}月${day}日`
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day} ${months[month - 1]} ${year}`
}

export default function LandingPage({ page, locale = 'en' }: { page: LandingPageId; locale?: Locale }) {
  const entry = (landingPages.pages as LandingEntry[]).find(({ id }) => id === page)!
  const copy = entry[locale]
  const zh = locale === 'zh'
  const home = localizedPath('home', locale)

  return (
    <div className="updates-shell landing-shell" lang={zh ? 'zh-CN' : 'en'}>
      <a className="updates-skip" href="#main">{zh ? '跳至正文' : 'Skip to content'}</a>
      <SiteHeader locale={locale} page={page} />
      <main id="main" tabIndex={-1}>
        <section className="updates-hero landing-hero" aria-labelledby="landing-title">
          <p className="updates-eyebrow">{copy.eyebrow}</p>
          <h1 id="landing-title">{copy.heading[0]}<br /><span>{copy.heading[1]}</span></h1>
          <p>{copy.intro}</p>
          <div className="landing-actions">
            <DownloadButton locale={locale} />
            <a href={`${home}#workflow`}>{zh ? '看看它怎么工作' : 'See how it works'}</a>
          </div>
        </section>
        <div className="landing-body">
          {copy.table && (
            <section className="landing-compare" aria-labelledby="landing-compare-title">
              <h2 id="landing-compare-title">{copy.table.caption}</h2>
              <div className="landing-table-scroll" tabIndex={0} role="group" aria-labelledby="landing-compare-title">
                <table>
                  <thead>
                    <tr>{copy.table.columns.map((column, index) => index === 0 ? <td key="corner" /> : <th key={column} scope="col">{column}</th>)}</tr>
                  </thead>
                  <tbody>
                    {copy.table.rows.map(([label, ...cells]) => (
                      <tr key={label}><th scope="row">{label}</th>{cells.map((cell, index) => <td key={index}>{cell}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {entry.checked && entry.sources && (
                <p className="landing-sources">
                  {zh ? `竞品信息核对于 ${checkedLabel(entry.checked, locale)}，来源：` : `Competitor details checked on ${checkedLabel(entry.checked, locale)} against `}
                  {entry.sources.map((source, index) => <span key={source.url}>{index > 0 && (zh ? '、' : ', ')}<a href={source.url} rel="nofollow noopener">{source.label}</a></span>)}
                  {zh ? '。价格和额度可能变动，请以官方页面为准。' : '. Prices and limits change; the official pages are authoritative.'}
                </p>
              )}
            </section>
          )}
          {copy.sections.map((section) => (
            <section className="landing-section" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ))}
          <section className="landing-faq" aria-labelledby="landing-faq-title">
            <h2 id="landing-faq-title">{zh ? '常见问题' : 'Common questions'}</h2>
            <dl>
              {copy.faq.map(({ q, a }) => <div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}
            </dl>
          </section>
          <section className="landing-cta" aria-labelledby="landing-cta-title">
            <h2 id="landing-cta-title">{zh ? '本地转写，无需账号，无需订阅。' : 'Local transcription. No account. No subscription.'}</h2>
            <DownloadButton locale={locale} />
          </section>
        </div>
      </main>
      <GuideLinks locale={locale} current={page} />
      <footer className="updates-footer"><a href={home} className="updates-brand">TypeAloud</a><p>{zh ? '你的声音，留在你的设备上。' : 'Your voice. On your device.'}</p><a href={`${home}#download`}>{zh ? '下载 TypeAloud' : 'Get TypeAloud'} <span aria-hidden="true">↗</span></a></footer>
    </div>
  )
}
