import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { landingPages, renderDocument, renderSitemap, siteUrl, sitePages } from './site-pages.mjs';

const template = await readFile('dist/index.html', 'utf8');
const server = await createServer({server:{middlewareMode:true, hmr:false, ws:false}, appType:'custom', optimizeDeps:{noDiscovery:true, include:[]}});
try {
  const {default: App} = await server.ssrLoadModule('/src/App.tsx');
  const {default: UpdatesPage} = await server.ssrLoadModule('/src/updates/UpdatesPage.tsx');
  const {default: LandingPage} = await server.ssrLoadModule('/src/landing/LandingPage.tsx');
  const landingIds = new Set(landingPages.map(({id}) => id));
  for (const {page,locale,path} of sitePages) {
    const element = page === 'home' ? createElement(App,{locale,preview:null}) : createElement(landingIds.has(page) ? LandingPage : UpdatesPage,{page,locale});
    const markup = renderToString(element);
    const html = renderDocument(template,markup,page,locale);
    if (path === '/') {
      await writeFile('dist/index.html', html);
    } else {
      await mkdir(`dist${path}`, {recursive:true});
      await writeFile(`dist${path}/index.html`, html);
      await writeFile(`dist${path}.html`, html);
    }
    console.log(`Pre-rendered ${path} (${Buffer.byteLength(markup)} bytes of HTML)`);
  }
  await writeFile('dist/sitemap.xml',renderSitemap());
  await writeFile('dist/robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
} finally {
  await server.close();
}
