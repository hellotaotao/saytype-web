import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { releases, getReleaseTranslation } from './data'
import type { Locale } from '../i18n'
import ReleaseNotes from './ReleaseNotes'

const render = (body: string, locale: Locale = 'en', translation?: string) => renderToStaticMarkup(<ReleaseNotes body={body} locale={locale} translation={translation} />)

describe('ReleaseNotes', () => {
  it('renders headings, lists, emphasis, code and secure links', () => {
    const html = render('## Improvements\n- **Faster** `Qwen` startup\n- [Details](https://example.com/notes)')
    expect(html).toContain('<h4>Improvements</h4>')
    expect(html).toContain('<ul>')
    expect(html).toContain('<strong>Faster</strong>')
    expect(html).toContain('<code>Qwen</code>')
    expect(html).toContain('href="https://example.com/notes"')
  })

  it('shows the current product name in prose but keeps file names as published', () => {
    const html = render('- SayType now checks for updates. **SayType** `SayType_1.13.4_universal.dmg`')
    expect(html).toContain('TypeAloud now checks for updates.')
    expect(html).toContain('<strong>TypeAloud</strong>')
    expect(html).toContain('<code>SayType_1.13.4_universal.dmg</code>')
  })

  it('escapes source HTML and angle-bracket placeholders, and rejects unsafe links', () => {
    const html = render('<script>alert(1)</script>\n\nUse <model> now. [Bad](javascript:alert(1)) ![track](https://example.com/pixel)')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).not.toContain('href="javascript:')
    expect(html).toContain('&lt;model&gt;')
    expect(html).toContain('&lt;script&gt;')
  })

  it('keeps English visible and puts Chinese in native details without losing its content', () => {
    const html = render('## English\n### Added\n- Better capture.\n\n## 中文\n### 新增\n- 更好的录音。')
    expect(html).toContain('Better capture.')
    expect(html).toMatch(/<details[^>]*>[\s\S]*<summary>中文原文<\/summary>[\s\S]*更好的录音。/)
    expect(html).not.toContain('<h4>English</h4>')
  })

  it('recognizes the alternate Chinese heading used by the model release notes', () => {
    const html = render("## What's new\n- Two local models.\n\n## 更新内容\n- 两种本地模型。")
    expect(html).toMatch(/<details[^>]*>[\s\S]*两种本地模型。/)
    expect(html.indexOf('Two local models.')).toBeLessThan(html.indexOf('<details'))
  })

  it('removes repeated download boilerplate sections but keeps product release content', () => {
    const html = render('## English\n- Added **Download progress** in Settings.\n\n## Downloads\nDownload the installer for your platform below.\n\n## 中文\n- 新增下载进度。\n\n## 下载\n请下载对应平台的安装包。')
    expect(html).toContain('Download progress')
    expect(html).not.toContain('installer for your platform')
    expect(html).not.toContain('请下载对应平台')
    expect(html).toContain('新增下载进度')
  })
})

 describe('localized release notes', () => {
  it('shows original Chinese first on Chinese pages and folds the English original', () => {
    const html = render('## English\n- Better capture.\n## 中文\n- 更好的录音。', 'zh')
    expect(html.indexOf('更好的录音。')).toBeLessThan(html.indexOf('<details'))
    expect(html).toMatch(/<details[^>]*lang="en"[\s\S]*<summary[^>]*>英文原文<\/summary>[\s\S]*Better capture/)
  })
  it('labels website translations and preserves their source', () => {
    const html = render('- Older engine.', 'zh', '- 早期引擎。')
    expect(html).toContain('网站翻译')
    expect(html.indexOf('早期引擎。')).toBeLessThan(html.indexOf('<details'))
    expect(html).toContain('Older engine.')
  })
  it('explicitly falls back to English rather than fabricating Chinese', () => {
    const html = render('- Future release.', 'zh')
    expect(html).toContain('此版本暂无中文说明，以下为英文原文。')
    expect(html).toContain('Future release.')
  })
  it('prefers source Chinese over a website translation', () => {
    const html = render('## English\n- Source.\n## 中文\n- 原文。', 'zh', '- 译文。')
    expect(html).toContain('原文。')
    expect(html).not.toContain('译文。')
  })
})

describe('published Chinese release coverage', () => {
  it('has Chinese content for every currently available release without changing its source', () => {
    for (const release of releases.filter(record => record.notesStatus === 'available')) {
      const original = release.body
      const html = render(release.body, 'zh', getReleaseTranslation(release.version))
      expect(html, release.version).not.toContain('此版本暂无中文说明')
      expect(html.slice(0, html.indexOf('<details')), release.version).toMatch(/[\u4e00-\u9fff]/)
      expect(release.body).toBe(original)
      if (release.version === '1.0.66' || release.version === '1.0.67') expect(html).toContain('网站翻译')
      else expect(html).not.toContain('网站翻译')
    }
  })
  it('preserves download removal and HTML escaping on Chinese pages too', () => {
    const html = render('## English\n- Safe.\n## 中文\n- <script>危险</script>\n## 下载\n请下载对应平台的安装包。', 'zh')
    expect(html).toContain('&lt;script&gt;危险&lt;/script&gt;')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('请下载对应平台')
  })
})
