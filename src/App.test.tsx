import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'

describe('TypeAloud launch page', () => {
  it('links to product updates from the header and mobile-visible footer', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html.match(/href="\/updates"/g)).toHaveLength(2)
    expect(html.match(/<footer[\s\S]*?<\/footer>/)?.[0]).toContain('href="/updates"')
  })

  it('renders the local-first hero and primary path', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('Local transcription.')
    expect(html).toContain('No account · No subscription · Works offline after model download')
    expect(html).toContain('No subscription.')
    expect(html).toContain('Optional cloud transcription · Bring your own API key.')
    expect(html).toContain('Hold. Speak. Release.')
    expect(html).toContain('Download for Mac')
    expect(html).toContain('href="#workflow"')
  })

  it('uses the real brand, product, and waveform assets', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('src="/saytype-icon.png"')
    expect(html).toContain('src="/saytype-waveform.webp"')
  })

  it('uses full-scene artwork with product detail in the hero', () => {
    const html = renderToStaticMarkup(<App />)
    const hero = html.match(/<section class="hero-section illustrated-hero"[\s\S]*?<\/section>/)?.[0] ?? ''
    expect(hero).toContain('src="/saytype-home-hero.webp"')
    expect(hero).toContain('width="1904" height="826"')
    expect(hero).toContain('class="hero-product-peek"')
    expect(hero).toContain('class="dictation-demo"')
  })

  it('shows the any-app illustration before capabilities', () => {
    const html = renderToStaticMarkup(<App />)
    const product = html.match(/<section class="product-section"[\s\S]*?<\/section>/)?.[0] ?? ''
    const scenePosition = product.indexOf('class="ill apps-scene"')
    expect(scenePosition).toBeGreaterThan(-1)
    expect(product.indexOf('class="capability-list"')).toBeGreaterThan(scenePosition)
    expect(product).not.toContain('saytype-app-settings.png')
  })

  it('has no layout preview controls', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).not.toContain('preview-toolbar')
    expect(html).not.toContain('?preview=')
  })

  it('keeps navigation and download actions accessible', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('aria-label="Primary navigation"')
    expect(html).toContain('aria-label="Download TypeAloud for Mac"')
    expect(html).toContain(
      'href="https://github.com/hellotaotao/typealoud/releases/latest"',
    )
    expect(html).toContain('aria-labelledby="workflow-title"')
    expect(html).toContain('aria-labelledby="privacy-title"')
  })

  it('explains recovery and practical desktop controls', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain(
      'Copy saved transcripts from History. If transcription fails and audio was saved, retry it with your current engine.',
    )
    expect(html).toContain('Uses your system’s default microphone')
    expect(html).toContain('Press Escape to cancel')
    expect(html).toContain('Runs quietly from the menu bar')
  })

  it('makes the cloud privacy boundary explicit', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain(
      'Optional cloud transcription sends audio to Groq or OpenAI using your own API key. Provider charges may apply.',
    )
  })

  it('leads with local ownership rather than cloud engine selection', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('Your words stay on your device.')
    expect(html).toContain('In local mode')
    expect(html).toContain('Works offline')
    expect(html).toContain('No subscription or word limits')
    expect(html).toContain('Local transcription. No signup.')
    expect(html).not.toContain('Available transcription engines')
  })

  it('explains experimental models and no longer advertises translation', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).not.toContain('Shift+Alt')
    expect(html).toContain('Nemotron')
    expect(html).toContain('experimental')
    expect(html).not.toContain('Local by default')
  })

  it('states local transcription requirements before download', () => {
    const html = renderToStaticMarkup(<App />)

    expect(html).toContain('macOS primary')
    expect(html).toContain('Apple Silicon recommended for local dictation')
    expect(html).toContain('~1 GB download for Qwen3-ASR 0.6B')
    expect(html).toContain('Microphone required · Accessibility permission on macOS')
  })
})


describe('localized launch page', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('translates every section and navigation into Chinese', () => {
    const html = renderToStaticMarkup(<App locale="zh" />)
    for (const text of ['跳到正文', '按住，说话，松开。', '随时待命，不打扰工作。', '你的话，留在你的设备上。', '适配你的桌面平台。', '主要测试平台', 'Windows', 'Linux', '本地转写，无需云端。', '产品更新', '本地模式无需注册或 API key', '重构这个函数，保留原来的 error handling。']) {
      expect(html).toContain(text)
    }
    expect(html).toContain('href="/zh/updates"')
    expect(html).toContain('href="#workflow"')
    expect(html).toContain('aria-label="主要导航"')
    expect(html).toContain('aria-label="下载 Mac 版 TypeAloud"')
    expect(html).toContain('音频发送给 Groq 或 OpenAI')
    expect(html).toContain('Qwen3-ASR 1.7B 和 Nemotron 实时转写属于实验性选项')
    expect(html).not.toContain('Your voice.')
    expect(html).not.toMatch(/(?:src|href)="\.\//)
  })

  it('localizes the drawn illustrations', () => {
    const html = renderToStaticMarkup(<App locale="zh" />)
    expect(html).toContain('马上到，十分钟！')
  })

  it('keeps the initial download markup deterministic across visitor platforms', () => {
    const baseline = renderToStaticMarkup(<App />)
    for (const platform of ['Win32', 'Linux x86_64']) {
      vi.stubGlobal('navigator', { platform, userAgent: platform })
      expect(renderToStaticMarkup(<App />)).toBe(baseline)
    }
  })
})
