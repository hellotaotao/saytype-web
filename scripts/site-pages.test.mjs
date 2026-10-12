import test from 'node:test';
import assert from 'node:assert/strict';
import { landingPages, pageMetadata, renderDocument, renderSitemap, sitePages, structuredData } from './site-pages.mjs';
const template = '<!doctype html><html lang="en"><head><title>Home</title><meta name="description" content="Home copy"/><meta property="og:title" content="Home"/><meta property="og:description" content="Home"/><link rel="canonical" href="https://typealoud.app/"/><script type="module" src="/assets/index.js"></script><link rel="stylesheet" href="/assets/index.css"></head><body><div id="root"></div></body></html>';
test('renders unique self-canonical documents with complete server HTML and reusable assets', () => {
  for(const page of ['updates','changelog']) {
    const html = renderDocument(template, '<main><h1>Real content</h1></main>', page);
    assert.ok(html.includes(`<link rel="canonical" href="https://typealoud.app/${page}"`));
    assert.ok(html.includes('data-prerendered="true"'));
    assert.ok(html.includes('<main><h1>Real content</h1></main>'));
    assert.ok(html.includes('/assets/index.css'));
    assert.ok(html.includes('/assets/index.js'));
    assert.ok(html.includes(`<meta property="og:url" content="https://typealoud.app/${page}"`));
    assert.equal((html.match(/rel="canonical"/g)||[]).length,1);
    assert.ok(!html.includes('Home copy'));
  }
  assert.notEqual(pageMetadata('updates').title,pageMetadata('changelog').title);
});
test('rejects unknown routes and missing root rather than silently producing empty pages', () => {
  assert.throws(()=>pageMetadata('unknown'));
  assert.throws(()=>renderDocument('<html></html>', '<main/>', 'updates'));
});
test('sitemap exposes homepage and both independent views without artificial dates', () => {
  const xml = renderSitemap();
  for(const url of ['https://typealoud.app/','https://typealoud.app/updates','https://typealoud.app/changelog']) assert.ok(xml.includes(`<loc>${url}</loc>`));
  assert.ok(!xml.includes('<lastmod>'));
});

test('serves six language-specific metadata documents with reciprocal alternatives', () => {
  for (const page of ['home','updates','changelog']) {
    for (const locale of ['en','zh']) {
      const meta = pageMetadata(page,locale);
      const path = `${locale === 'zh' ? '/zh' : ''}${page === 'home' ? '' : `/${page}`}` || '/';
      assert.equal(meta.url, `https://typealoud.app${path}`);
      const html = renderDocument(template,'<main>Localized content</main>',page,locale);
      assert.ok(html.includes(`<html lang="${locale === 'zh' ? 'zh-CN' : 'en'}"`));
      assert.ok(html.includes(`rel="canonical" href="${meta.url}"`));
      for (const language of ['en','zh-CN','x-default']) assert.ok(html.includes(`hreflang="${language}"`));
      assert.equal((html.match(/hreflang=/g)||[]).length,3);
      assert.ok(html.includes(locale === 'zh' ? 'og:locale" content="zh_CN' : 'og:locale" content="en_US'));
      assert.equal((html.match(/<title>/g)||[]).length,1);
    }
    assert.notEqual(pageMetadata(page,'zh').title,pageMetadata(page,'en').title);
  }
  assert.throws(()=>pageMetadata('home','fr'));
});
test('sitemap includes both languages for every page', () => {
  const sitemap = renderSitemap();
  assert.equal((sitemap.match(/<loc>/g)||[]).length,6 + landingPages.length * 2);
  for (const path of ['/zh','/zh/updates','/zh/changelog']) assert.ok(sitemap.includes(`<loc>https://typealoud.app${path}</loc>`));
});
test('landing pages have unique localized metadata and FAQ structured data that survives embedding', () => {
  assert.equal(new Set(sitePages.map(({title}) => title)).size, sitePages.length);
  assert.equal(new Set(sitePages.map(({description}) => description)).size, sitePages.length);
  for (const {id} of landingPages) {
    for (const locale of ['en','zh']) {
      const meta = pageMetadata(id,locale);
      assert.equal(meta.url, `https://typealoud.app${locale === 'zh' ? '/zh' : ''}/${id}`);
      const data = structuredData(id,locale);
      assert.equal(data['@type'],'FAQPage');
      assert.ok(data.mainEntity.length >= 3);
      const html = renderDocument(template,'<main>Landing</main>',id,locale);
      const embedded = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1];
      assert.deepEqual(JSON.parse(embedded),data);
    }
  }
  assert.equal(structuredData('home')['@type'],'SoftwareApplication');
  assert.equal(structuredData('updates'),null);
});
