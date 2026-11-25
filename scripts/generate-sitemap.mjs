import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function readSiteUrl() {
  const brandPath = path.join(rootDir, 'src', 'config', 'brand.ts');
  if (fs.existsSync(brandPath)) {
    const content = fs.readFileSync(brandPath, 'utf8');
    const match = content.match(/SITE_URL\s*=\s*['"`]([^'"`]+)['"`]/);
    if (match && match[1]) {
      return match[1].replace(/\/+$/, '');
    }
  }
  return 'https://free-pdf-studio.netlify.app';
}

const ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/tools', priority: '0.9', changefreq: 'weekly' },
  { path: '/reader', priority: '0.8', changefreq: 'monthly' },
  { path: '/organize', priority: '0.8', changefreq: 'monthly' },
  { path: '/merge', priority: '0.9', changefreq: 'monthly' },
  { path: '/split', priority: '0.9', changefreq: 'monthly' },
  { path: '/compress', priority: '0.9', changefreq: 'monthly' },
  { path: '/pdf-to-word', priority: '0.9', changefreq: 'monthly' },
  { path: '/protect', priority: '0.8', changefreq: 'monthly' },
  { path: '/unlock', priority: '0.8', changefreq: 'monthly' },
  { path: '/annotate', priority: '0.8', changefreq: 'monthly' },
  { path: '/redact', priority: '0.8', changefreq: 'monthly' },
  { path: '/form-filler', priority: '0.7', changefreq: 'monthly' },
  { path: '/flatten', priority: '0.7', changefreq: 'monthly' },
  { path: '/compare', priority: '0.7', changefreq: 'monthly' },
  { path: '/page-numbers', priority: '0.7', changefreq: 'monthly' },
  { path: '/watermark', priority: '0.7', changefreq: 'monthly' },
  { path: '/header-footer', priority: '0.7', changefreq: 'monthly' },
  { path: '/crop', priority: '0.7', changefreq: 'monthly' },
  { path: '/images-to-pdf', priority: '0.8', changefreq: 'monthly' },
  { path: '/convert', priority: '0.8', changefreq: 'monthly' },
  { path: '/extract-images', priority: '0.7', changefreq: 'monthly' },
  { path: '/ocr', priority: '0.8', changefreq: 'monthly' },
  { path: '/security', priority: '0.7', changefreq: 'monthly' },
  { path: '/privacy', priority: '0.6', changefreq: 'yearly' },
  { path: '/about', priority: '0.6', changefreq: 'yearly' },
];

const siteUrl = readSiteUrl();
const today = new Date().toISOString().split('T')[0];

const urlsXml = ROUTES.map(
  (r) => `  <url>
    <loc>${siteUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
).join('\n');

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>
`;

const publicDir = path.join(rootDir, 'public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');
console.log(`Generated sitemap.xml (${ROUTES.length} routes) and robots.txt for ${siteUrl}`);
