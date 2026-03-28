import fs from 'fs';
import path from 'path';

// Define all public pages for sitemap with enhanced SEO settings
const publicPages = [
  {
    url: '/',
    priority: '1.0',
    changefreq: 'weekly',
    lastmod: new Date().toISOString().split('T')[0],
    image: {
      loc: '/og-image.png',
      title: 'Bill Vault - Warranty Tracker and Bill Scanner App',
      caption: 'Digital bill storage and warranty tracking dashboard'
    }
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
    priority: '0.5',
    changefreq: 'quarterly',
    lastmod: new Date().toISOString().split('T')[0]
  },
  {
    url: '/terms-of-service',
    priority: '0.5',
    changefreq: 'quarterly',
    lastmod: new Date().toISOString().split('T')[0]
  }
];

const baseUrl = 'https://billvault.silentthundersquad.in';

function generateSitemap() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${publicPages.map(page => {
  const imageTag = page.image 
    ? `    <image:image>
      <image:loc>${baseUrl}${page.image.loc}</image:loc>
      <image:title>${page.image.title}</image:title>
      <image:caption>${page.image.caption}</image:caption>
    </image:image>`
    : '';
  
  return `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>${imageTag ? '\n' + imageTag : ''}
  </url>`;
}).join('\n')}
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
  console.log(`🌐 Base URL: ${baseUrl}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}

export { generateSitemap, publicPages, baseUrl };