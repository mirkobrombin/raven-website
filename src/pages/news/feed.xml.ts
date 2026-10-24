import type { APIRoute } from 'astro';
import { pages, escapeXml } from '../../lib/pages';

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('http://localhost:9284');
  const posts = pages.filter(page => page.date).sort((a, b) => b.date!.localeCompare(a.date!));
  const items = posts.map(page => `<item><title>${escapeXml(page.title)}</title><description>${escapeXml(page.description)}</description><link>${new URL(page.path, origin).href}</link><guid isPermaLink="true">${new URL(page.path, origin).href}</guid><pubDate>${new Date(`${page.date}T12:00:00Z`).toUTCString()}</pubDate><dc:creator>Mirko Brombin</dc:creator></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>Raven news</title><description>Development notes and announcements from the Raven project.</description><link>${origin.href}</link><atom:link href="${new URL('/news/feed.xml', origin).href}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
