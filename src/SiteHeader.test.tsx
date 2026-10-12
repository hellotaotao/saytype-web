import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import App from './App'
import UpdatesPage from './updates/UpdatesPage'

const header = (html: string) => html.match(/<header\b[\s\S]*?<\/header>/)?.[0] ?? ''
const withoutCurrent = (html: string) => html.replace(/ aria-current="(?:page|true)"/g, '')

describe('shared site navigation', () => {
  for (const locale of ['en', 'zh'] as const) {
    it(`keeps the same header, navigation and action order on every ${locale} page`, () => {
      const home = header(renderToStaticMarkup(<App locale={locale} />))
      const updates = header(renderToStaticMarkup(<UpdatesPage locale={locale} page="updates" />))
      const changelog = header(renderToStaticMarkup(<UpdatesPage locale={locale} page="changelog" />))
      const normalize = (html: string) => withoutCurrent(html).replace(/href="\/(?:zh\/?)?(?:updates|changelog)?" hrefLang=/g, 'href="locale-page" hrefLang=')
      expect(home).toContain('class="site-header"')
      expect(normalize(updates)).toBe(normalize(home))
      expect(normalize(changelog)).toBe(normalize(home))
      expect(home.indexOf('site-nav')).toBeLessThan(home.indexOf('language-switcher'))
      expect(home.indexOf('language-switcher')).toBeLessThan(home.indexOf('download-button'))
      for (const section of ['workflow', 'product', 'privacy']) {
        expect(updates).toContain(`href="${locale === 'zh' ? '/zh' : '/'}#${section}"`)
      }
      expect(home).not.toContain('<span aria-hidden="true">/</span>')
    })
  }
})
