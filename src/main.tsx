import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import UpdatesPage from './updates/UpdatesPage.tsx'
import LandingPage from './landing/LandingPage.tsx'
import { isLandingPage, parseRoute } from './i18n'

const route = parseRoute(window.location.pathname) ?? { locale: 'en', page: 'home' }
const page = route.page === 'home'
  ? <App locale={route.locale} />
  : isLandingPage(route.page)
    ? <LandingPage page={route.page} locale={route.locale} />
    : <UpdatesPage page={route.page} locale={route.locale} />
const root = document.getElementById('root')!
const app = <StrictMode>{page}</StrictMode>
document.documentElement.lang = route.locale === 'zh' ? 'zh-CN' : 'en'

if (root.hasAttribute('data-prerendered')) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
