import { readFileSync } from 'node:fs';

export const siteUrl = 'https://typealoud.app';
export const landingPages = JSON.parse(readFileSync(new URL('../src/content/landingPages.json', import.meta.url), 'utf8')).pages;
const metadata = {
  en: {
    home: {
      title: 'TypeAloud — Local transcription. No account. No subscription.',
      description: 'Offline transcription on your Mac: local transcription needs no account, API key or subscription. Cloud transcription is optional with your own API key.',
    },
    updates: {
      title: 'TypeAloud product updates — Milestones in local transcription',
      description: 'Explore the important changes in TypeAloud: local transcription, live dictation, recording recovery and model choice, with the versions that introduced them.',
    },
    changelog: {
      title: 'TypeAloud changelog — Complete version history and release notes',
      description: 'Browse every published TypeAloud release by version and date, with original release notes, fixes, improvements and links to the source.',
    },
  },
  zh: {
    home: {
      title: 'TypeAloud — 本地语音转写，无需账号，无需订阅',
      description: 'TypeAloud 首推本地离线语音转写，无需账号、API key 或订阅，音频无需上传。也支持使用自己的 API key 选择云端转写。',
    },
    updates: {
      title: 'TypeAloud 产品更新 — 本地语音转写的重要进展',
      description: '了解 TypeAloud 的重要更新：本地转写、实时听写、录音恢复与模型选择，以及这些功能首次引入和后续完善的版本。',
    },
    changelog: {
      title: 'TypeAloud 更新日志 — 完整版本历史与发布说明',
      description: '按版本与日期查看 TypeAloud 的完整发布记录，了解新增功能、改进与修复，并追溯原始发布说明。',
    },
  },
};
for (const landing of landingPages) {
  for (const locale of ['en','zh']) metadata[locale][landing.id] = {title:landing[locale].title, description:landing[locale].description};
}
const pageIds = ['home','updates','changelog',...landingPages.map(({id}) => id)];

export function pageMetadata(page, locale = 'en') {
  if (!Object.hasOwn(metadata, locale) || !Object.hasOwn(metadata[locale], page)) throw new Error(`Unknown page or locale: ${page}/${locale}`);
  const path = `${locale === 'zh' ? '/zh' : ''}${page === 'home' ? '' : `/${page}`}` || '/';
  return {...metadata[locale][page], path, url:`${siteUrl}${path}`, lang:locale === 'zh' ? 'zh-CN' : 'en', ogLocale:locale === 'zh' ? 'zh_CN' : 'en_US'};
}
export const sitePages = ['en','zh'].flatMap(locale => pageIds.map(page => ({page,locale,...pageMetadata(page,locale)})));

const escape = value => value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
// Structured data mirrors visible page content: the app on the home page, the FAQ on landing pages.
export function structuredData(page, locale = 'en') {
  const meta = pageMetadata(page,locale);
  const landing = landingPages.find(({id}) => id === page);
  if (landing) return {'@context':'https://schema.org','@type':'FAQPage',inLanguage:meta.lang,mainEntity:landing[locale].faq.map(({q,a}) => ({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))};
  if (page === 'home') return {'@context':'https://schema.org','@type':'SoftwareApplication',name:'TypeAloud',url:meta.url,description:meta.description,inLanguage:meta.lang,applicationCategory:'UtilitiesApplication',operatingSystem:'macOS, Windows, Linux',offers:{'@type':'Offer',price:'0',priceCurrency:'USD'}};
  return null;
}
export function renderDocument(template, markup, page, locale = 'en') {
  if (!template.includes('<div id="root"></div>')) throw new Error('Missing empty root in Vite template');
  const meta = pageMetadata(page,locale);
  const alternate = ['en','zh'].map(language => {
    const target = pageMetadata(page,language);
    return `    <link rel="alternate" hreflang="${target.lang}" href="${target.url}" />`;
  }).join('\n');
  const data = structuredData(page,locale);
  const jsonLd = data ? `    <script type="application/ld+json">${JSON.stringify(data).replaceAll('<','\\u003c')}</script>\n` : '';
  return template
    .replace(/<html\b[^>]*>/, `<html lang="${meta.lang}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(meta.title)}</title>`)
    .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/, `<meta name="description" content="${escape(meta.description)}" />`)
    .replace(/<meta\s+name="keywords"[\s\S]*?\/?>/, '')
    .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escape(meta.title)}" />`)
    .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escape(meta.description)}" />`)
    .replace(/<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${meta.url}" />`)
    .replace('</head>', () => `    <meta property="og:url" content="${meta.url}" />\n    <meta property="og:locale" content="${meta.ogLocale}" />\n    <meta property="og:locale:alternate" content="${locale === 'zh' ? 'en_US' : 'zh_CN'}" />\n${alternate}\n    <link rel="alternate" hreflang="x-default" href="${pageMetadata(page,'en').url}" />\n${jsonLd}  </head>`)
    .replace('<div id="root"></div>', () => `<div id="root" data-prerendered="true">${markup}</div>`);
}
export function renderSitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitePages.map(({url}) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`;
}
