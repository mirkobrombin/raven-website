import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../dist/', import.meta.url);
const origin = new URL(process.env.SITE_URL ?? 'https://useraven.org').origin;
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : [join(directory, entry.name)]);
const files = walk(root.pathname).filter(file => file.endsWith('.html'));
const titles = new Set();
const descriptions = new Set();
const covers = new Set();
const decode = value => value.replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const path = `/${relative(root.pathname, file).replace(/index\.html$/, '')}`;
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const meta = (attribute, name) => html.match(new RegExp(`<meta ${attribute}="${name}" content="([^"]*)"`))?.[1];
  const description = meta('name', 'description');
  assert(title && !titles.has(title), `Missing or duplicate title: ${path}`);
  assert(description && !descriptions.has(description), `Missing or duplicate description: ${path}`);
  titles.add(title);
  descriptions.add(description);
  assert.equal(html.match(/<link rel="canonical" href="([^"]+)"/)?.[1], `${origin}${path}`, path);
  assert.equal(meta('property', 'og:url'), `${origin}${path}`, path);
  assert.equal(meta('name', 'twitter:card'), 'summary_large_image', path);
  assert(meta('name', 'robots')?.startsWith('index, follow'), `Production indexing disabled: ${path}`);
  const cover = decode(meta('property', 'og:image') ?? '');
  assert(cover.startsWith(`${origin}/covers/`) && !covers.has(cover), `Missing or duplicate cover: ${path}`);
  covers.add(cover);
  assert.equal(meta('name', 'twitter:image'), meta('property', 'og:image'), path);
  const png = readFileSync(new URL(new URL(cover).pathname.slice(1), root));
  assert.equal(png.subarray(1, 4).toString(), 'PNG', path);
  assert.equal(png.readUInt32BE(16), 1200, path);
  assert.equal(png.readUInt32BE(20), 630, path);
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">([^]*?)<\/script>/)?.[1] ?? 'null');
  assert.equal(graph?.['@context'], 'https://schema.org', path);
  assert(graph['@graph'].some(node => node.url === `${origin}${path}`), path);
  assert(!/localhost|127\.0\.0\.1|seo-validation\.invalid|\/var\/home\/|\/run\/user\//.test(html), `Private or preview URL: ${path}`);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
    const target = new URL(decodeURIComponent(decode(match[1])).slice(1), root);
    assert(existsSync(target) || existsSync(new URL(`${target.href.replace(/\/$/, '')}/index.html`)), `Missing local target ${match[1]} on ${path}`);
  }
}
const sitemap = readFileSync(new URL('sitemap.xml', root), 'utf8');
assert.equal([...sitemap.matchAll(/<loc>/g)].length, files.length, 'Sitemap coverage');
assert(sitemap.includes(`${origin}/`), 'Sitemap origin');
assert(readFileSync(new URL('robots.txt', root), 'utf8').includes(`Sitemap: ${origin}/sitemap.xml`), 'Robots sitemap');
JSON.parse(readFileSync(new URL('assets/benchmarks/benchmarks.json', root), 'utf8'));
assert(readFileSync(new URL('news/feed.xml', root), 'utf8').includes('<item>'), 'News feed');
console.log(`Validated ${files.length} pages: unique metadata and covers, production URLs, JSON-LD, internal links, sitemap and feed.`);
