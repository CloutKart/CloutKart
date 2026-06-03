import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SITE_URL = 'https://clout-kart.com';

const sections = ['about', 'services', 'process', 'pricing', 'portfolio', 'contact'];

function sitemapPlugin(): Plugin {
  return {
    name: 'generate-sitemap',
    closeBundle() {
      const today = new Date().toISOString().split('T')[0];

      const urls = [
        { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
        ...sections.map(s => ({
          loc: `${SITE_URL}/#${s}`,
          priority: s === 'services' || s === 'pricing' ? '0.9' : '0.8',
          changefreq: s === 'pricing' || s === 'portfolio' ? 'weekly' : 'monthly',
        })),
      ];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
          http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      mkdirSync(resolve(__dirname, 'dist'), { recursive: true });
      writeFileSync(resolve(__dirname, 'dist/sitemap.xml'), xml, 'utf-8');
    },
  };
}

export default defineConfig({
  plugins: [react(), sitemapPlugin()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
