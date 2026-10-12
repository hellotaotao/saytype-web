import { useEffect } from 'react'
import { getMilestones, getReleaseTranslation, releases, releaseAnchor, releaseHref, type Release } from './data'
import { localizedPath, type Locale } from '../i18n'
import SiteHeader from '../SiteHeader'
import ReleaseNotes from './ReleaseNotes'
import GuideLinks from '../landing/GuideLinks'
import './UpdatesPage.css'

function dateLabel(value: string, locale: Locale) {
  const date = new Date(value)
  if (locale === 'zh') return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`
}

function VersionLink({ version, locale }: { version: string; locale: Locale }) {
  return <a href={releaseHref(version, locale)}>v{version.replace(/^v/, '')}</a>
}

function ReleaseEntry({ release, latest, locale }: { release: Release; latest: boolean; locale: Locale }) {
  return (
    <details className="release-entry" id={releaseAnchor(release.version)} open={latest || undefined}>
      <summary>
        <span className="release-version">v{release.version.replace(/^v/, '')}{latest && <span className="latest-label">{locale === 'zh' ? '最新版本' : 'Latest'}</span>}</span>
        <time dateTime={release.publishedAt}>{dateLabel(release.publishedAt, locale)}</time>
        <span className="release-expand" aria-hidden="true">+</span>
      </summary>
      <div className="release-body">
        {release.notesStatus === 'missing' ? <p className="missing-notes">{locale === 'zh' ? '此版本暂无发布说明。原始发布记录和安装包仍可在 GitHub 查看。' : 'Release notes are unavailable for this version. The original release and its downloads are still available on GitHub.'}</p> : <ReleaseNotes body={release.body} locale={locale} translation={getReleaseTranslation(release.version)} />}
        <a className="release-source" href={release.url}>{locale === 'zh' ? 'GitHub 原始发布记录' : 'Original release on GitHub'} <span aria-hidden="true">↗</span></a>
      </div>
    </details>
  )
}

function Changelog({ locale }: { locale: Locale }) {
  const years = [...new Set(releases.map((release) => release.publishedAt.slice(0, 4)))]
  return (
    <div className="updates-layout">
      <aside className="updates-aside">
        <p className="updates-eyebrow">{locale === 'zh' ? '浏览历史版本' : 'Browse the archive'}</p>
        <nav aria-label={locale === 'zh' ? '发布年份' : 'Release years'}>{years.map((year) => <a key={year} href={`#year-${year}`}>{year}<span>{releases.filter((release) => release.publishedAt.startsWith(year)).length}{locale === 'zh' ? ' 个版本' : ' releases'}</span></a>)}</nav>
        <p>{locale === 'zh' ? '每个正式版本及其原始发布说明。想了解产品的重要变化？' : 'Every published version, with its original release notes. Looking for the bigger picture? '}<a href={localizedPath('updates', locale)}>{locale === 'zh' ? '查看重要更新。' : 'Read the highlights.'}</a></p>
      </aside>
      <div className="release-archive">
        {years.map((year) => {
          const yearReleases = releases.filter((release) => release.publishedAt.startsWith(year))
          const minors = [...new Set(yearReleases.map((release) => release.version.replace(/^v/, '').split('.').slice(0, 2).join('.')))]
          return (
            <section className="release-year" key={year} id={`year-${year}`} aria-labelledby={`year-title-${year}`}>
              <h2 id={`year-title-${year}`}>{year}</h2>
              {Number(year) < 2026 && <p className="legacy-notice"><strong>{locale === 'zh' ? '历史版本。' : 'Historical releases.'}</strong>{locale === 'zh' ? '这些说明描述的是早期 TypeAloud，可能与当前应用不同。' : ' These notes describe earlier versions of TypeAloud and may not reflect the current app.'}</p>}
              {minors.map((minor) => (
                <section className="release-series" key={minor} aria-labelledby={`series-${year}-${minor}`}>
                  <h3 id={`series-${year}-${minor}`}>{minor}{locale === 'zh' ? ' 系列' : ' series'}</h3>
                  {yearReleases.filter((release) => release.version.replace(/^v/, '').split('.').slice(0, 2).join('.') === minor).map((release) => <ReleaseEntry key={release.version} release={release} latest={release === releases[0]} locale={locale} />)}
                </section>
              ))}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Milestones({ locale }: { locale: Locale }) {
  const milestones = getMilestones(locale)
  return (
    <div className="updates-layout">
      <aside className="updates-aside">
        <p className="updates-eyebrow">{locale === 'zh' ? '产品的每一步进展' : 'The bigger picture'}</p>
        <p>{locale === 'zh' ? '了解 TypeAloud 新增了哪些能力，以及它们从哪个版本开始提供。所有小改进和修复都记录在' : 'New capabilities and the releases that brought them to TypeAloud. Small fixes and every patch live in the '}<a href={localizedPath('changelog', locale)}>{locale === 'zh' ? '完整更新日志中。' : 'complete changelog.'}</a></p>
        <nav className="milestone-index" aria-label={locale === 'zh' ? '产品里程碑' : 'Product milestones'}>{milestones.map((milestone) => <a key={milestone.id} href={`#${milestone.id}`}>{milestone.category}</a>)}</nav>
      </aside>
      <div className="milestone-list">
        {milestones.map((milestone) => {
          const introduced = releases.find((release) => release.version === milestone.introducedVersion)
          return (
            <article className="milestone" id={milestone.id} key={milestone.id} aria-labelledby={`${milestone.id}-title`}>
              <div className="milestone-meta"><span>{milestone.category}</span>{introduced && <time dateTime={introduced.publishedAt}>{dateLabel(introduced.publishedAt, locale)}</time>}</div>
              <h2 id={`${milestone.id}-title`}>{milestone.title}</h2>
              <p className="milestone-summary">{milestone.summary}</p>
              <ul className="milestone-details">{milestone.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
              <p className="milestone-scope">{milestone.scope}</p>
              <div className="milestone-history">
                <p><span className="history-label">{locale === 'zh' ? '首次推出' : 'First introduced'}</span><VersionLink version={milestone.introducedVersion} locale={locale} /></p>
                {milestone.evolution.length > 0 && <div className="milestone-evolution"><h3>{locale === 'zh' ? '后续改进' : 'Since then'}</h3><ul>{milestone.evolution.map((change) => <li key={`${change.version}-${change.description}`}><VersionLink version={change.version} locale={locale} /><span>{change.description}</span></li>)}</ul></div>}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}

export default function UpdatesPage({ page, locale = 'en' }: { page: 'updates' | 'changelog'; locale?: Locale }) {
  useEffect(() => {
    const revealRelease = () => {
      let id: string
      try { id = decodeURIComponent(window.location.hash.slice(1)) } catch { return }
      const target = document.getElementById(id)
      if (target instanceof HTMLDetailsElement) target.open = true
    }
    revealRelease()
    window.addEventListener('hashchange', revealRelease)
    return () => window.removeEventListener('hashchange', revealRelease)
  }, [])

  return (
    <div className="updates-shell" lang={locale === 'zh' ? 'zh-CN' : 'en'}>
      <a className="updates-skip" href="#main">{locale === 'zh' ? '跳至正文' : 'Skip to content'}</a>
      <SiteHeader locale={locale} page={page} />
      <main id="main" tabIndex={-1}>
        <section className="updates-hero" aria-labelledby="updates-title">
          <p className="updates-eyebrow">{locale === 'zh' ? 'TypeAloud 的成长记录' : 'TypeAloud, over time'}</p>
          <h1 id="updates-title">{locale === 'zh' ? (page === 'updates' ? <>每次更新，<br /><span>让表达更轻松。</span></> : <>每个版本，<br /><span>每一处变化。</span></>) : (page === 'updates' ? <>A little closer to<br /><span>effortless.</span></> : <>Every release.<br /><span>Every detail.</span></>)}</h1>
          <p>{locale === 'zh' ? (page === 'updates' ? '从语音到文字，记录让表达更顺畅、让内容留在身边的重要变化。' : '按版本完整记录 TypeAloud 的新增功能、改进与修复。') : (page === 'updates' ? 'The meaningful changes to how you speak, write, and keep your words close.' : 'A complete record of what changed in TypeAloud, one version at a time.')}</p>
          <nav className="updates-tabs" aria-label={locale === 'zh' ? '更新栏目' : 'Updates navigation'}><a href={localizedPath('updates', locale)} aria-current={page === 'updates' ? 'page' : undefined}>{locale === 'zh' ? '重要更新' : 'Product highlights'}</a><a href={localizedPath('changelog', locale)} aria-current={page === 'changelog' ? 'page' : undefined}>{locale === 'zh' ? '完整日志' : 'Full changelog'} <span>{releases.length}</span></a></nav>
        </section>
        {page === 'updates' ? <Milestones locale={locale} /> : <Changelog locale={locale} />}
      </main>
      <GuideLinks locale={locale} />
      <footer className="updates-footer"><a href={localizedPath('home', locale)} className="updates-brand">TypeAloud</a><p>{locale === 'zh' ? '你的声音，留在你的设备上。' : 'Your voice. On your device.'}</p><a href={`${localizedPath('home', locale)}#download`}>{locale === 'zh' ? '下载 TypeAloud' : 'Get TypeAloud'} <span aria-hidden="true">↗</span></a></footer>
    </div>
  )
}
