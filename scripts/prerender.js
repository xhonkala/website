import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const publicDir = join(rootDir, 'public');

const SITE_URL = 'https://alexanderhonkala.com';

marked.setOptions({ breaks: false, gfm: true });

// --- Helpers ---

function readDist(relPath) {
    return readFileSync(join(distDir, relPath), 'utf-8');
}

function writeDist(relPath, content) {
    const fullPath = join(distDir, relPath);
    mkdirSync(dirname(fullPath), { recursive: true });
    writeFileSync(fullPath, content, 'utf-8');
}

function injectIntoMain(html, renderedContent, selector = '#content') {
    // Replace the empty main/content element with one containing rendered HTML.
    // The elements have id="content" or id="posts-list" etc.
    const id = selector.replace('#', '');
    // Match the element with this id and inject content between its tags
    const pattern = new RegExp(
        `(<[^>]+id="${id}"[^>]*>)[\\s\\S]*?(<\\/(?:main|div)>)`,
        'i'
    );
    return html.replace(pattern, `$1\n${renderedContent}\n$2`);
}

function setMetaTag(html, property, content) {
    const escaped = content.replace(/"/g, '&quot;');
    // Handle both property= and name= attributes
    const propPattern = new RegExp(
        `(<meta\\s+(?:property|name)="${property}"\\s+content=")[^"]*(")`
    );
    return html.replace(propPattern, `$1${escaped}$2`);
}

function setTitle(html, title) {
    return html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
}

// --- 1. Prerender content pages (about, research, hyperfixations) ---

const contentPages = ['about', 'research', 'hyperfixations'];

for (const page of contentPages) {
    const mdPath = join(publicDir, page, 'content.md');
    if (!existsSync(mdPath)) {
        console.warn(`Skipping ${page}: no content.md found`);
        continue;
    }

    const markdown = readFileSync(mdPath, 'utf-8');
    const rendered = marked.parse(markdown);

    // Hide the H1 like the client JS does
    const withHiddenH1 = rendered.replace(/<h1[^>]*>/, '<h1 style="display:none">');

    let html = readDist(`${page}.html`);
    html = injectIntoMain(html, withHiddenH1, '#content');
    writeDist(`${page}.html`, html);
    console.log(`Prerendered: ${page}.html`);
}

// --- 2. Prerender individual post pages ---

const postsIndex = JSON.parse(readFileSync(join(publicDir, 'posts', 'index.json'), 'utf-8'));
const postTemplate = readDist('post.html');

for (const post of postsIndex) {
    const mdPath = join(publicDir, 'posts', `${post.slug}.md`);
    if (!existsSync(mdPath)) {
        console.warn(`Skipping post ${post.slug}: no markdown found`);
        continue;
    }

    const markdown = readFileSync(mdPath, 'utf-8');
    const rendered = marked.parse(markdown);

    // Extract title from first H1
    const h1Match = rendered.match(/<h1[^>]*>(.*?)<\/h1>/);
    const title = h1Match ? h1Match[1] : post.title;
    const withHiddenH1 = h1Match
        ? rendered.replace(/<h1[^>]*>/, '<h1 style="display:none">')
        : rendered;

    // Build tag HTML
    const tagsHtml = (post.tags || []).map(tag =>
        `<a href="/thinking.html?tag=${encodeURIComponent(tag)}" class="tag-label">${tag}</a>`
    ).join('');

    // Start from the post template
    let html = postTemplate;

    // Set title and meta tags
    html = setTitle(html, `${title} - Alexander Honkala`);
    html = setMetaTag(html, 'og:title', `${title} - Alexander Honkala`);
    html = setMetaTag(html, 'og:description', post.description || title);
    html = setMetaTag(html, 'description', post.description || title);
    html = setMetaTag(html, 'og:url', `${SITE_URL}/posts/${post.slug}/`);

    // Inject rendered content
    html = injectIntoMain(html, withHiddenH1, '#post-content');

    // Inject title into the h1#post-title
    html = html.replace(
        /<h1 id="post-title">[^<]*<\/h1>/,
        `<h1 id="post-title">${title}</h1>`
    );

    // Inject tags
    html = html.replace(
        /<div id="post-tags"[^>]*>[\s\S]*?<\/div>/,
        `<div id="post-tags" class="post-tags">${tagsHtml}</div>`
    );

    // Update back link to use clean URL for thinking
    html = html.replace('href="thinking.html"', 'href="/thinking.html"');

    writeDist(`posts/${post.slug}/index.html`, html);
    console.log(`Prerendered: posts/${post.slug}/index.html`);
}

// --- 3. Prerender thinking listing page ---

const sortedPosts = [...postsIndex].sort((a, b) => b.date.localeCompare(a.date));

function formatDate(dateStr) {
    const [year, month] = dateStr.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}

const postsListHtml = sortedPosts.map(post => {
    const tagsHtml = (post.tags || [])
        .map(t => `<span class="tag-label">${t}</span>`)
        .join('');
    return `
            <article>
                <h2><a href="/posts/${post.slug}/">${post.title}</a></h2>
                <span class="date">${formatDate(post.date)}</span>
                ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
                <p>${post.description}</p>
            </article>`;
}).join('\n');

let thinkingHtml = readDist('thinking.html');
thinkingHtml = injectIntoMain(thinkingHtml, postsListHtml, '#posts-list');
writeDist('thinking.html', thinkingHtml);
console.log('Prerendered: thinking.html');

// --- 4. Generate sitemap.xml ---

const now = new Date().toISOString().split('T')[0];

const urls = [
    { loc: '/', priority: '1.0' },
    { loc: '/about.html', priority: '0.8' },
    { loc: '/research.html', priority: '0.8' },
    { loc: '/hyperfixations.html', priority: '0.5' },
    { loc: '/thinking.html', priority: '0.8' },
    ...sortedPosts.map(post => ({
        loc: `/posts/${post.slug}/`,
        priority: '0.7',
    })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${SITE_URL}${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

writeDist('sitemap.xml', sitemap);
console.log('Generated: sitemap.xml');

// --- 5. Generate robots.txt ---

const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;

writeDist('robots.txt', robotsTxt);
console.log('Generated: robots.txt');

console.log('\nPrerender complete.');
