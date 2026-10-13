import './App.css'
import './updates/UpdatesPage.css'
import { useEffect, useRef } from 'react'
import { setupPageMotion } from './motion'
import { homeCopy } from './content/homeCopy'
import { localizedPath, type Locale } from './i18n'
import SiteHeader from './SiteHeader'
import DownloadButton from './DownloadButton'
import DictationDemo from './DictationDemo'
import { AppsScene, BenefitIcon, StepScene } from './Illustrations'
import { releasePageUrl, sourceRepoUrl } from './downloads'
import { useDownload } from './useDownload'
import GuideLinks from './landing/GuideLinks'
const workflowSteps = [
  {
    number: '01',
    title: 'Hold',
    detail: 'Press Ctrl+Shift in the app where you want to write.',
  },
  {
    number: '02',
    title: 'Speak',
    detail: 'TypeAloud listens while a compact prompt keeps you oriented.',
  },
  {
    number: '03',
    title: 'Release',
    detail: 'Your transcript returns to the text field that already has focus.',
  },
] as const

const featuredCapabilities = [
  { id: 'global-hotkey', title: 'Global hold-to-record hotkey', description: 'Hold Ctrl+Shift to record, release to stop, and keep your hands near the keyboard.' },
  { id: 'active-app-insertion', title: 'Active-app text insertion', description: 'Transcribed text is sent back to the app and text field that already has your cursor.' },
] as const

const practicalDetails = [
  { label: 'Input', detail: 'Uses your system’s default microphone' },
  { label: 'Control', detail: 'Press Escape to cancel' },
  { label: 'Presence', detail: 'Runs quietly from the menu bar' },
] as const

const downloadRequirements = [
  'macOS primary',
  'Apple Silicon recommended for local dictation',
  '~1 GB download for Qwen3-ASR 0.6B',
  'Microphone required · Accessibility permission on macOS',
] as const

function App({ locale = 'en' }: { locale?: Locale }) {
  const t = homeCopy(locale)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (root.current) return setupPageMotion(root.current)
  }, [])

  return (
    <div className="site-shell" data-layout="editorial" lang={locale === 'zh' ? 'zh-CN' : 'en'} ref={root}>
      <a className="skip-link" href="#main">{t('Skip to content')}</a>
      <SiteHeader locale={locale} page="home" />
      <main id="main" tabIndex={-1}>
        <HeroSection locale={locale} />
        <PrivacySection locale={locale} />
        <WorkflowSection locale={locale} />
        <ProductSection locale={locale} />
        <PlatformSection locale={locale} />
        <DownloadSection locale={locale} />
      </main>
      <GuideLinks locale={locale} />
      <SiteFooter locale={locale} />
    </div>
  )
}

function HeroSection({ locale }: { locale: Locale }) {
  const t = homeCopy(locale)

  return (
    <section className="hero-section illustrated-hero" id="top" aria-labelledby="hero-title">
      <div className="hero-content">
        <div className="hero-copy">
          <p className="hero-eyebrow">{t('Voice to text, right where you work.')}</p>
          <h1 id="hero-title">
            <span>{t('Local transcription.')}</span>
            <span>{t('Speak naturally.')}</span>
            <span>{t('Mix languages.')}</span>
          </h1>
          <p className="hero-description">{t('Turn your voice into text on your device, right in the app you’re using—even when you mix languages.')}</p>
          <div className="hero-actions">
            <DownloadButton locale={locale} label="Download for free" />
            <a className="text-link" href="#workflow">{t('See how it works')}</a>
          </div>
          <p className="hero-tagline">{t('No account · No subscription · Works offline after model download')}</p>
          <p className="hero-tagline">{t('Optional cloud transcription · Bring your own API key.')}</p>
        </div>
        <div className="hero-illustration-wrap" aria-hidden="true">
          <img className="hero-illustration" src="/saytype-home-hero.webp" alt="" width="1904" height="826" />
        </div>
        <figure className="hero-product-peek">
          <DictationDemo locale={locale} />
        </figure>
      </div>
      <div className="hero-color-band" aria-hidden="true"><span /><span /><span /></div>
    </section>
  )
}

function StepIllustration({ number, locale }: { number: string; locale: Locale }) {
  if (number === '01') return <div className="step-illustration step-keyboard" aria-hidden="true"><StepScene step="hold" locale={locale} /></div>
  if (number === '02') return <div className="step-illustration step-wave" aria-hidden="true"><StepScene step="speak" locale={locale} /></div>
  return <div className="step-illustration step-text" aria-hidden="true"><StepScene step="release" locale={locale} /></div>
}

function WorkflowSection({ locale }: { locale: Locale }) {
  const t = homeCopy(locale)
  return (
    <section className="workflow-section" id="workflow" aria-labelledby="workflow-title">
      <div className="section-kicker">
        <span>{t('How it works')}</span>
      </div>
      <div className="workflow-heading reveal-target">
        <h2 id="workflow-title">{t('Hold. Speak. Release.')}</h2>
        <p>{t('One physical gesture carries a thought all the way back to your cursor.')}</p>
      </div>
      <div className="workflow-demo">
        <DictationDemo locale={locale} />
      </div>
      <ol className="workflow-list reveal-target">
        {workflowSteps.map((step) => (
          <li key={step.number}>
            <StepIllustration number={step.number} locale={locale} />
            <span className="step-number">{step.number}</span>
            <h3>{t(step.title)}</h3>
            <p>{t(step.detail)}</p>
          </li>
        ))}
      </ol>
      <p className="workflow-footnote">{t('On-device transcription')} <span>{t('Optional cloud transcription')}</span> {t('Local History & retry')}</p>
    </section>
  )
}

function ProductSection({ locale }: { locale: Locale }) {
  const t = homeCopy(locale)
  return (
    <section className="product-section" id="product" aria-labelledby="product-title">
      <div className="section-kicker">
        <span>{t('The product')}</span>
      </div>
      <div className="product-layout">
        <div className="product-copy reveal-target">
          <h2 id="product-title">{t('Ready when you are. Invisible when you’re not.')}</h2>
          <p>{t('In local mode, TypeAloud turns speech into text on your computer and inserts it at your cursor. Choose your engine once, then keep working where you are.')}</p>
        </div>
        <figure className="settings-figure reveal-target" data-reveal-delay="120">
          <AppsScene locale={locale} />
        </figure>
        <div className="capability-list">
          {featuredCapabilities.map((feature, index) => (
            <article key={feature.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{t(feature.title)}</h3>
                <p>{t(feature.description)}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
      <details className="model-details cloud-options">
        <summary>{t('Optional cloud features')}</summary>
        <p className="cloud-disclosure">{t('Optional cloud transcription sends audio to Groq or OpenAI using your own API key. Provider charges may apply.')}</p>
      </details>
      <div className="product-reassurance reveal-target">
        <div className="history-reassurance">
          <span>{t('Your transcript, saved locally')}</span>
          <p>{t('Copy saved transcripts from History. If transcription fails and audio was saved, retry it with your current engine.')}</p>
        </div>
        <ul className="practical-details" aria-label={t('Practical desktop controls')}>
          {practicalDetails.map((detail) => (
            <li key={t(detail.label)}>
              <span>{t(detail.label)}</span>
              <strong>{t(detail.detail)}</strong>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function PrivacySection({ locale }: { locale: Locale }) {
  const t = homeCopy(locale)
  const localBenefits = [
    { title: 'Works offline', detail: 'Download once. Transcribe anywhere, even offline.', mark: 'offline' },
    { title: 'Local transcription. No signup.', detail: 'No signup or API key in local mode. Cloud is optional with your own API key.', mark: 'local' },
    { title: 'No subscription or word limits', detail: 'No monthly bill or transcription quota with a local model.', mark: 'unlimited' },
  ] as const

  return (
    <section className="privacy-section" id="privacy" aria-labelledby="privacy-title">
      <div className="section-kicker">
        <span>{t('Why local matters')}</span>
      </div>
      <div className="privacy-layout reveal-target">
        <div className="privacy-copy">
          <p className="privacy-label">{t('In local mode · on-device transcription')}</p>
          <h2 id="privacy-title">{t('Your words stay on your device.')}</h2>
          <p>{t('In local mode, audio is processed on your device and transcripts are saved there. Neither is uploaded for transcription. Your everyday thoughts stay yours.')}</p>
        </div>
        <div className="engine-panel">
          <div className="engine-list" aria-label={t('Benefits of local transcription')}>
            {localBenefits.map((benefit) => (
              <article key={t(benefit.title)} className={`benefit-card benefit-${benefit.mark}`}>
                <span className="benefit-mark" aria-hidden="true"><BenefitIcon mark={benefit.mark} /></span>
                <div>
                  <h3>{t(benefit.title)}</h3>
                </div>
                <p>{t(benefit.detail)}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
      <div className="privacy-bottomline"><span>{t('Private by default')}</span><span>{t('Offline when you need it')}</span><span>{t('Cloud is always optional')}</span></div>
    </section>
  )
}

const platforms = [
  { id: 'macos', name: 'macOS', status: 'Primary tested platform', icon: 'apple', downloadLabel: 'Download TypeAloud for Mac' },
  { id: 'windows', name: 'Windows', status: 'Experimental', icon: 'windows', downloadLabel: 'Download TypeAloud for Windows' },
  { id: 'linux', name: 'Linux', status: 'Experimental', icon: 'linux', downloadLabel: 'Download TypeAloud for Linux' },
] as const

function PlatformCard({ platform, locale }: { platform: (typeof platforms)[number]; locale: Locale }) {
  const t = homeCopy(locale)
  const { href, onClick, isResolving } = useDownload(platform.id)

  return (
    <li className={`platform-card platform-${platform.id}`}>
      <span className="platform-glyph" aria-hidden="true">
        {platform.icon === 'apple' ? <svg viewBox="0 0 48 48"><path d="M33 25c0-5 4-7.5 4.2-7.7-2.3-3.4-5.9-3.9-7.2-4-3-.3-5.8 1.8-7.3 1.8-1.6 0-4-1.7-6.6-1.6-3.4.1-6.5 2-8.2 5-3.5 6-.9 14.8 2.5 19.7 1.6 2.4 3.5 5 6.1 4.9 2.4-.1 3.3-1.6 6.3-1.6s3.8 1.6 6.4 1.5c2.7-.1 4.4-2.4 5.9-4.8 1.9-2.8 2.6-5.6 2.6-5.7-.1 0-4.7-1.8-4.7-7.5ZM28.2 10.2c1.3-1.6 2.2-3.9 1.9-6.2-1.9.1-4.3 1.3-5.6 2.9-1.2 1.4-2.3 3.8-2 6 2.1.2 4.3-1.1 5.7-2.7Z" /></svg> : platform.icon === 'windows' ? <svg viewBox="0 0 48 48"><path d="M4 9 21 6v17H4V9Zm20-3 20-3v20H24V6ZM4 25h17v17L4 39V25Zm20 0h20v20l-20-3V25Z" /></svg> : <svg viewBox="0 0 48 48"><path d="M24 5c-8 0-13 7-13 17v8c-3 2-4 6-2 9 2 3 8 2 10-1 3 2 7 2 10 0 2 3 8 4 10 1 2-3 1-7-2-9v-8C37 12 32 5 24 5Zm-6 17a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm12 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM18 29h12l-2 5h-8l-2-5Z" /></svg>}
      </span>
      <h3>{platform.name}</h3>
      <span className="platform-status">{t(platform.status)}</span>
      <a className="platform-download" href={href} onClick={onClick} aria-busy={isResolving || undefined} aria-label={t(platform.downloadLabel)}>
        {isResolving ? t('Preparing download…') : t('Download')}
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v12m0 0 5-5m-5 5-5-5M5 20h14" /></svg>
      </a>
    </li>
  )
}

function PlatformSection({ locale }: { locale: Locale }) {
  const t = homeCopy(locale)

  return (
    <section className="platform-section" id="platforms" aria-labelledby="platform-title">
      <div className="platform-heading">
        <p className="platform-kicker">{t('Made for desktop')}</p>
        <h2 id="platform-title">{t('Available on your platform.')}</h2>
        <p>{t('One local-first idea. Support varies by platform.')}</p>
      </div>
      <ul className="platform-grid">
        {platforms.map((platform) => (
          <PlatformCard key={platform.id} platform={platform} locale={locale} />
        ))}
      </ul>
    </section>
  )
}

function DownloadSection({ locale }: { locale: Locale }) {
  const t = homeCopy(locale)
  return (
    <section className="download-section" id="download" aria-labelledby="download-title">
      <img className="download-waveform" src="/saytype-waveform.webp" loading="lazy" decoding="async" alt="" aria-hidden="true" />
      <div className="download-copy reveal-target">
        <p>{t('Offline dictation. No account. No subscription.')}</p>
        <h2 id="download-title">{t('Local transcription. No cloud needed.')}</h2>
        <ul className="download-requirements" aria-label={t('Download requirements')}>
          {downloadRequirements.map((requirement) => (
            <li key={t(requirement)}>{t(requirement)}</li>
          ))}
        </ul>
        <details className="model-details">
          <summary>{t('Which local engine should I choose?')}</summary>
          <p>{t('Qwen3-ASR 0.6B is the recommended local model, with a ~1 GB one-time download. Qwen3-ASR 1.7B and Nemotron live transcription are experimental options. The larger Qwen model needs a ~2.52 GB download; performance varies with your hardware.')}</p>
        </details>
        <DownloadButton locale={locale} />
        <a className="download-other" href="#platforms">{t('On Windows or Linux? See all platforms')}</a>
      </div>
    </section>
  )
}

function SiteFooter({ locale }: { locale: Locale }) {
  const t = homeCopy(locale)
  return (
    <footer className="site-footer">
      <a className="brand-lockup" href="#top" aria-label={t('Back to top')}>
        <img src="/saytype-icon.png" alt="" width="42" height="42" />
        <span>TypeAloud</span>
      </a>
      <p>{t('Voice to text. On your device.')}</p>
      <a href={localizedPath('updates', locale)}>{t('Updates')}</a>
      <a href={releasePageUrl}>{t('GitHub releases ↗')}</a>
      <a href={sourceRepoUrl}>{t('Open source on GitHub ↗')}</a>
    </footer>
  )
}

export default App
