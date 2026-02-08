import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const postsIndex = JSON.parse(readFileSync(join(rootDir, 'public', 'posts', 'index.json'), 'utf-8'));

const SITE_URL = 'https://alexanderhonkala.com';
const FEED_TITLE = 'Alexander Honkala';
const FEED_DESCRIPTION = 'Writing on pharmacology, computational biology, systems thinking, and whatever else catches fire.';

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Convert "YYYY-MM" to RFC 822 date (first of month)
function toRfc822(dateStr) {
  const [year, month] = dateStr.split('-');
  const date = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1, 12, 0, 0));
  return date.toUTCString();
}

// Sort newest first
const sorted = [...postsIndex].sort((a, b) => b.date.localeCompare(a.date));

const items = sorted.map(post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/post.html?slug=${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/post.html?slug=${post.slug}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${toRfc822(post.date)}</pubDate>
    </item>`).join('\n');

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

writeFileSync(join(rootDir, 'public', 'feed.xml'), feed, 'utf-8');
console.log(`Generated feed.xml with ${sorted.length} items`);
