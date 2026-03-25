import fs from 'fs';
import path from 'path';

// Define all public pages for sitemap
const publicPages = [
  {
    url: '/',
    priority: '1.0',
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/login',
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/register',
    priority: '0.8',
    changefreq: 'monthly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/privacy-policy',
    priority: '0.6',
    changefreq: 'yearly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/terms-of-service',
    priority: '0.6',
    changefreq: 'yearly',
    lastmod: new Date().toISOString().split('T')[0]
  }
];

const baseUrl = 'https://bill-vault-sts.vercel.app';

function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const publicDir = path.join(process.cwd(), 'public');

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Write sitemap to public directory
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

  console.log('✅ Sitemap generated successfully at public/sitemap.xml');
  console.log(`📄 Generated sitemap with ${publicPages.length} pages`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}

export { generateSitemap, publicPages, baseUrl };