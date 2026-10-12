import { afterEach, describe, expect, it, vi } from 'vitest'

const { createRoot, hydrateRoot, render } = vi.hoisted(() => ({ createRoot: vi.fn(), hydrateRoot: vi.fn(), render: vi.fn() }))
vi.mock('react-dom/client', () => ({ createRoot, hydrateRoot }))
vi.mock('./App.tsx', () => ({ default: 'homepage' }))
vi.mock('./updates/UpdatesPage.tsx', () => ({ default: 'updates-page' }))
vi.mock('./landing/LandingPage.tsx', () => ({ default: 'landing-page' }))

afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks() })

async function mount(pathname: string, prerendered: boolean, search = '') {
  vi.resetModules()
  createRoot.mockReturnValue({ render })
  const root = { hasAttribute: (name: string) => prerendered && name === 'data-prerendered' }
  vi.stubGlobal('window', { location: { pathname, search } })
  vi.stubGlobal('document', { getElementById: () => root, documentElement: { lang: 'en' } })
  await import('./main')
  return root
}

describe('browser entry', () => {
  it.each(['/updates', '/updates/', '/updates.html', '/changelog', '/changelog/', '/changelog.html'])('hydrates the exact pre-rendered route %s', async (path) => {
    const root = await mount(path, true)
    expect(createRoot).not.toHaveBeenCalled()
    expect(hydrateRoot).toHaveBeenCalledOnce()
    expect(hydrateRoot.mock.calls[0][0]).toBe(root)
    const page = hydrateRoot.mock.calls[0][1].props.children
    expect(page.type).toBe('updates-page')
    expect(page.props.page).toBe(path.startsWith('/updates') ? 'updates' : 'changelog')
  })

  it('creates a client root in development without a prerender marker', async () => {
    await mount('/updates', false)
    expect(createRoot).toHaveBeenCalledOnce()
    expect(hydrateRoot).not.toHaveBeenCalled()
    expect(render.mock.calls[0][0].props.children.props.page).toBe('updates')
  })

  it.each(['/', '/updates-extra', '/changelog/archive'])('does not match prefixes as update routes: %s', async (path) => {
    await mount(path, false)
    expect(render.mock.calls[0][0].props.children.type).toBe('homepage')
  })
})


describe('bilingual browser entry', () => {
  it.each([
    ['/zh', 'homepage', undefined], ['/zh/', 'homepage', undefined],
    ['/zh/updates', 'updates-page', 'updates'], ['/zh/changelog', 'updates-page', 'changelog'],
  ])('hydrates the Chinese route %s using the route locale', async (path, type, logicalPage) => {
    await mount(path!, true)
    const page = hydrateRoot.mock.calls[0][1].props.children
    expect(page.type).toBe(type)
    expect(page.props.locale).toBe('zh')
    expect(page.props.page).toBe(logicalPage)
    expect(document.documentElement.lang).toBe('zh-CN')
  })
  it.each([['/typeless-alternative', 'en'], ['/zh/wispr-flow-alternative', 'zh']])('hydrates the landing page %s', async (path, locale) => {
    await mount(path, true)
    const page = hydrateRoot.mock.calls[0][1].props.children
    expect(page.type).toBe('landing-page')
    expect(page.props.locale).toBe(locale)
    expect(page.props.page).toBe(path.split('/').pop())
  })
  it('hydrates the normal English homepage', async () => {
    await mount('/', true)
    const page = hydrateRoot.mock.calls[0][1].props.children
    expect(page.props.locale).toBe('en')
  })
  it('hydrates the homepage even with an unknown query string', async () => {
    await mount('/zh', true, '?preview=stage')
    expect(hydrateRoot).toHaveBeenCalledOnce()
    expect(createRoot).not.toHaveBeenCalled()
  })
  it('ignores query strings on an update page', async () => {
    await mount('/zh/updates', true, '?preview=stage')
    expect(hydrateRoot).toHaveBeenCalledOnce()
  })
})
