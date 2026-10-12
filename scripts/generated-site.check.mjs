import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { landingPages, sitePages, pageMetadata } from './site-pages.mjs';
const releases = JSON.parse(await readFile('src/content/releases.json', 'utf8'));
const milestones = JSON.parse(await readFile('src/content/milestones.json', 'utf8'));

test('built pages contain localized HTML, reciprocal metadata and working local assets', async () => {
  for(const {page,locale,path,url,lang,title} of sitePages) {
    const html = await readFile(path === '/' ? 'dist/index.html' : `dist${path}.html`, 'utf8');
    if(path !== '/') assert.equal(html, await readFile(`dist${path}/index.html`, 'utf8'));
    assert.ok(html.includes(`rel="canonical" href="${url}"`));
    assert.ok(html.includes(`<title>${title}</title>`));
    assert.ok(html.includes(`<html lang="${lang}">`));
    assert.equal((html.match(/<h1(?:\s|>)/g)||[]).length,1);
    assert.ok(html.includes('data-prerendered="true"'));
    assert.equal((html.match(/hreflang=/g)||[]).length,3);
    for (const targetLocale of ['en','zh']) {
      const alternate = pageMetadata(page,targetLocale);
      assert.ok(html.includes(`hreflang="${alternate.lang}" href="${alternate.url}"`));
      assert.ok(html.includes(`href="${alternate.path}" hrefLang="${alternate.lang}"`));
    }
    for (const match of html.matchAll(/(?:src|href)="(\/(?:assets\/[^"#]+|[^"#]+\.(?:png|webp|svg)))"/g)) assert.ok((await stat(`dist${match[1]}`)).isFile(),`${path}: ${match[1]}`);
    assert.ok(!/(?:src|href)="\.\//.test(html),`${path}: nested routes must not have relative asset paths`);
    if(page === 'changelog') {
      for(const release of releases) {
        assert.ok(html.includes(`id="release-${release.version.replaceAll('.', '-')}"`),release.version);
        assert.ok(html.includes(release.url));
      }
    } else if(page === 'updates') {
      for(const milestone of milestones) assert.ok(html.includes(`id="${milestone.id}"`),milestone.id);
      assert.ok(html.includes(locale === 'zh' ? '首次' : 'First introduced'));
    } else if(landingPages.some(({id}) => id === page)) {
      const copy = landingPages.find(({id}) => id === page)[locale];
      assert.ok(html.includes('application/ld+json'));
      for(const {q} of copy.faq) assert.ok(html.includes(`<dt>${q}</dt>`),`${path}: ${q}`);
      for(const {id} of landingPages) assert.ok(html.includes(`href="${pageMetadata(id,locale).path}"`),`${path} links to ${id}`);
    } else {
      for(const {id} of landingPages) assert.ok(html.includes(`href="${pageMetadata(id,locale).path}"`),`${path} links to ${id}`);
      for(const section of ['workflow','product','privacy','download']) assert.ok(html.includes(`id="${section}"`));
      assert.ok(html.includes(locale === 'zh' ? '/zh/updates' : '/updates'));
    }
    if(locale === 'zh') {
      const body = html.split('<body>')[1];
      assert.ok(/[\u4e00-\u9fff]/.test(body),`${path} must contain Chinese before hydration`);
    }
  }
  const sitemap = await readFile('dist/sitemap.xml','utf8');
  for(const {url} of sitePages) assert.ok(sitemap.includes(`<loc>${url}</loc>`));
  assert.ok((await readFile('dist/robots.txt','utf8')).includes('Sitemap: https://typealoud.app/sitemap.xml'));
});
