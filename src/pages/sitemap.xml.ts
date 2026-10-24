import type { APIRoute } from 'astro';
import { pages, escapeXml, coverPath } from '../lib/pages';

export const GET: APIRoute = ({ site }) => {
  const urls = site ? pages.map(page => `<url><loc>${escapeXml(new URL(page.path, site).href)}</loc>${page.updated ? `<lastmod>${escapeXml(page.updated)}</lastmod>` : page.date ? `<lastmod>${escapeXml(page.date)}</lastmod>` : ''}<image:image><image:loc>${escapeXml(new URL(coverPath(page.path), site).href)}</image:loc><image:title>${escapeXml(page.title)}</image:title></image:image></url>`).join('') : '';
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
