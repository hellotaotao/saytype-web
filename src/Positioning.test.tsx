import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('local-first marketing hierarchy', () => {
  for (const locale of ['en', 'zh'] as const) {
    {
      it(`leads with local value before instructions: ${locale}`, () => {
        const html = renderToStaticMarkup(<App locale={locale} />)
        const hero = html.match(/<section class="hero-section illustrated-hero"[\s\S]*?<\/section>/)![0]
        const heading = hero.match(/<h1[\s\S]*?<\/h1>/)![0]
        for (const text of locale === 'zh' ? ['本地语音转写。', '自然说，', '混着说。'] : ['Local transcription.', 'Speak naturally.', 'Mix languages.']) expect(heading).toContain(text)
        expect(hero).not.toContain('Ctrl+Shift')
        expect(hero).toContain(locale === 'zh' ? '免费下载' : 'Download for free')
        expect(hero).toContain(locale === 'zh' ? '无需账号 · 无需订阅 · 下载模型后即可离线使用' : 'No account · No subscription · Works offline after model download')
        expect(hero).not.toMatch(/Chinese|中英/)
        expect(html.indexOf('id="privacy"')).toBeLessThan(html.indexOf('id="workflow"'))
        expect(html.indexOf('id="workflow"')).toBeLessThan(html.indexOf('id="product"'))
        const benefits = html.match(/<section class="privacy-section"[\s\S]*?<\/section>/)![0]
        expect(benefits).not.toContain('Shift+Alt')
        const download = html.match(/<section class="download-section"[\s\S]*?<\/section>/)![0]
        expect(download.indexOf('download-requirements')).toBeLessThan(download.indexOf('class="download-button"'))
      })
    }
  }
})

describe('local and cloud copy boundaries', () => {
  for (const locale of ['en', 'zh'] as const) {
    it(`explains optional cloud transcription without expanding details: ${locale}`, () => {
      const html = renderToStaticMarkup(<App locale={locale} />)
      const hero = html.match(/<section class="hero-section illustrated-hero"[\s\S]*?<\/section>/)![0]
      const benefits = html.match(/<section class="privacy-section"[\s\S]*?<\/section>/)![0]
      for (const section of [hero, benefits]) {
        expect(section).toContain(locale === 'zh' ? '自己的 API key' : 'your own API key')
        expect(section.toLowerCase()).toContain(locale === 'zh' ? '云端' : 'cloud')
        expect(section).not.toContain('<details')
      }
      expect(benefits).toContain(locale === 'zh' ? '本地转写，无需注册。' : 'Local transcription. No signup.')
    })
  }
})


describe('concise hero copy', () => {
  for (const locale of ['en', 'zh'] as const) {
    it(`uses one short supporting sentence in ${locale}`, () => {
      const html = renderToStaticMarkup(<App locale={locale} />)
      const description = html.match(/<p class="hero-description">([^<]+)<\/p>/)![1]
      expect(description).toBe(locale === 'zh' ? '在你的设备上，把语音转成当前应用里的文字。一句话里混用多种语言，也能按自己的习惯表达。' : 'Turn your voice into text on your device, right in the app you’re using—even when you mix languages.')
    })
  }
})

describe('illustrated cross-platform homepage', () => {
  for (const locale of ['en', 'zh'] as const) {
    it(`uses the visual-first illustration and explicit platform support in ${locale}`, () => {
      const html = renderToStaticMarkup(<App locale={locale} />)
      const hero = html.match(/<section class="hero-section illustrated-hero"[\s\S]*?<\/section>/)![0]
      const platforms = html.match(/<section class="platform-section"[\s\S]*?<\/section>/)![0]
      expect(hero).toContain('/typealoud-home-hero.webp')
      expect(platforms).toContain('macOS')
      expect(platforms).toContain('Windows')
      expect(platforms).toContain('Linux')
      expect(platforms).toContain(locale === 'zh' ? '主要测试平台' : 'Primary tested platform')
      expect(platforms.match(/Experimental|实验阶段/g)).toHaveLength(2)
      expect(platforms).not.toContain('Same experience')
    })
  }
})
