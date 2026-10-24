import type { APIRoute } from 'astro';
import { readFileSync } from 'node:fs';
import imageService from 'astro/assets/services/sharp';
import { pages, coverSlug, escapeXml } from '../../lib/pages';

export const getStaticPaths = () => pages.map(page => ({ params: { slug: coverSlug(page.path) }, props: { page } }));
const logo = readFileSync(new URL('../../../public/assets/logo.svg', import.meta.url), 'utf8')
  .replace('<svg ', '<svg x="834" y="155" ')
  .replace('width="1135" height="1108"', 'width="300" height="300"');
const wordmark = readFileSync(new URL('../../../public/assets/Frame 7.svg', import.meta.url), 'utf8')
  .replace('<svg ', '<svg x="64" y="53" ')
  .replace('width="89" height="41"', 'width="160" height="74"');

export const GET: APIRoute = async ({ props }) => {
  const { page } = props;
  const lines: string[] = [];
  for (const word of page.title.split(/\s+/)) {
    const last = lines.length - 1;
    if (last < 0 || `${lines[last]} ${word}`.length > 20) lines.push(word);
    else lines[last] += ` ${word}`;
  }
  const fontSize = lines.length > 3 ? 52 : 64;
  const baseline = lines.length > 2 ? 300 : 330;
  const title = lines.map((line, index) => `<tspan x="64" y="${baseline + index * (fontSize + 10)}">${escapeXml(line)}</tspan>`).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><linearGradient id="background" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#f8e7ec"/><stop offset="1" stop-color="#efe6ed"/></linearGradient></defs>
    <rect width="1200" height="630" fill="url(#background)"/>
    <path d="M800 0H1200V630H1040L800 0Z" fill="#ce0049" opacity=".04"/>
    <path d="M1010 0L1200 500" stroke="#ce0049" stroke-width="2" opacity=".13"/>
    ${wordmark}${logo}
    <g font-family="DejaVu Sans, sans-serif">
      <text x="66" y="220" font-size="21" font-weight="bold" letter-spacing="3" fill="#a1003a">${escapeXml(page.section.toUpperCase())}</text>
      <text font-size="${fontSize}" font-weight="bold" letter-spacing="-2" fill="#171317">${title}</text>
      <path d="M64 527H1136" stroke="#b97e9e" stroke-opacity=".5"/>
      <text x="64" y="575" font-size="22" fill="#534c50">${escapeXml(page.path)}</text>
      <text x="1136" y="575" font-size="19" text-anchor="end" fill="#a1003a">RAVEN</text>
    </g>
  </svg>`;
  const result = await imageService.transform!(Buffer.from(svg), { src: 'cover.svg', format: 'png', width: 1200, height: 630 }, {
    service: { entrypoint: 'astro/assets/services/sharp', config: {} }, dangerouslyProcessSVG: true,
  } as Parameters<NonNullable<typeof imageService.transform>>[2], console);
  return new Response(result.data as Uint8Array<ArrayBuffer>, { headers: { 'Content-Type': 'image/png' } });
};
