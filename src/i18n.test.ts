import { describe, expect, it } from 'vitest'
import landingPages from './content/landingPages.json'
import { landingPageIds, localizedPath, parseRoute, switchLocaleHref } from './i18n'

describe('locale routes', () => {
  it.each([
    ['/', 'home', 'en'], ['/updates','updates','en'], ['/changelog','changelog','en'],
    ['/zh','home','zh'], ['/zh/updates','updates','zh'], ['/zh/changelog','changelog','zh'],
  ] as const)('recognizes %s and recreates its canonical URL', (path,page,locale) => {
    expect(parseRoute(path)).toEqual({page,locale})
    expect(localizedPath(page,locale)).toBe(path)
  })
  it.each(['/zh/', '/zh.html', '/zh/index.html'])('normalizes static homepage aliases: %s', path => {
    expect(parseRoute(path)).toEqual({page:'home',locale:'zh'})
  })
  it.each(['/zh/updates/', '/zh/updates.html', '/zh/updates/index.html'])('normalizes static page aliases: %s', path => {
    expect(parseRoute(path)).toEqual({page:'updates',locale:'zh'})
  })
  it.each(['/zh-extra', '/zh/updates-extra', '/changelog/unknown', '//evil.example', '/ZH'])('does not guess locales from prefixes: %s', path => {
    expect(parseRoute(path)).toBeNull()
  })
  it('routes every landing page in both languages and keeps the route list in sync with its content', () => {
    expect(landingPages.pages.map(({ id }) => id)).toEqual([...landingPageIds])
    for (const id of landingPageIds) {
      expect(parseRoute(`/${id}`)).toEqual({ page: id, locale: 'en' })
      expect(parseRoute(`/zh/${id}/`)).toEqual({ page: id, locale: 'zh' })
      expect(switchLocaleHref(`/${id}`, 'zh')).toBe(`/zh/${id}`)
    }
  })
  it('preserves the same logical page, query and release fragment when changing language', () => {
    expect(switchLocaleHref('/changelog','zh','?ref=home','#release-v1-15-3')).toBe('/zh/changelog?ref=home#release-v1-15-3')
    expect(switchLocaleHref('/zh/','en','?preview=stage','#privacy')).toBe('/?preview=stage#privacy')
    expect(switchLocaleHref('/zh/updates','en')).toBe('/updates')
  })
})
