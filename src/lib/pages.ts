import { parseFrontmatter } from 'astro/markdown';

export type PageInfo = {
  path: string;
  title: string;
  description: string;
  section: string;
  lang: string;
  date?: string;
  updated?: string;
};

type Frontmatter = Omit<PageInfo, 'path' | 'section'>;
const markdown = import.meta.glob<string>('../pages/{docs,news}/**/*.md', { eager: true, query: '?raw', import: 'default' });

export const pages: PageInfo[] = [
  { path: '/', title: 'A Windows your apps recognize.', description: 'Install and run Windows applications on Linux with their own installers. No Windows virtual machine. Compatibility is still in development.', section: 'Raven', lang: 'en' },
  { path: '/news/', title: 'News', description: 'Development notes and announcements from the Raven project.', section: 'News', lang: 'en' },
  { path: '/sponsor/', title: 'Sponsor', description: 'Help fund Raven development, application testing, and documentation.', section: 'Sponsor', lang: 'en' },
  ...Object.entries(markdown).map(([file, source]) => {
    const frontmatter = parseFrontmatter(source).frontmatter as Frontmatter;
    return {
      ...frontmatter,
      path: `/${file.replace('../pages/', '').replace(/(?:\/index)?\.md$/, '')}/`,
      section: file.includes('/docs/') ? 'Documentation' : 'News',
      lang: frontmatter.lang ?? 'en',
    };
  }),
];

export const pagePath = (path: string) => path === '/' ? '/' : `${path.replace(/\/+$/, '')}/`;
export const coverSlug = (path: string) => path === '/' ? 'home' : path.replace(/^\/|\/$/g, '');
export const coverPath = (path: string) => `/covers/${coverSlug(path)}.png`;
export const escapeXml = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
