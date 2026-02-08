import './style.css'
import './night-mode.js'

function formatDate(dateStr) {
    const [year, month] = dateStr.split('-');
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}

fetch('/posts/index.json')
    .then(response => response.json())
    .then(posts => {
        posts.sort((a, b) => b.date.localeCompare(a.date));

        // Collect unique tags
        const allTags = new Set();
        for (const post of posts) {
            if (post.tags) post.tags.forEach(t => allTags.add(t));
        }
        const sortedTags = [...allTags].sort();

        // Check URL params for pre-selected tag
        const params = new URLSearchParams(window.location.search);
        const preselected = params.get('tag');
        let activeTags = new Set();
        if (preselected && allTags.has(preselected)) {
            activeTags.add(preselected);
        }

        // Render tag bar
        const tagBar = document.getElementById('tag-bar');

        function renderTagBar() {
            tagBar.innerHTML = sortedTags.map(tag => {
                const active = activeTags.has(tag) ? ' active' : '';
                return `<button class="tag-chip${active}" data-tag="${tag}">${tag}</button>`;
            }).join('');

            // Attach click handlers
            tagBar.querySelectorAll('.tag-chip').forEach(chip => {
                chip.addEventListener('click', () => {
                    const tag = chip.dataset.tag;
                    if (activeTags.has(tag)) {
                        activeTags.delete(tag);
                    } else {
                        activeTags.add(tag);
                    }
                    renderTagBar();
                    renderPosts();
                });
            });
        }

        function renderPosts() {
            const filtered = activeTags.size === 0
                ? posts
                : posts.filter(p => p.tags && p.tags.some(t => activeTags.has(t)));

            const container = document.getElementById('posts-list');
            if (filtered.length === 0) {
                container.innerHTML = '<p>No posts match the selected tags.</p>';
                return;
            }
            container.innerHTML = filtered.map(post => {
                const tagsHtml = post.tags
                    ? post.tags.map(t => `<span class="tag-label">${t}</span>`).join('')
                    : '';
                return `
                    <article>
                        <h2><a href="post.html?slug=${post.slug}">${post.title}</a></h2>
                        <span class="date">${formatDate(post.date)}</span>
                        ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
                        <p>${post.description}</p>
                    </article>
                `;
            }).join('');
        }

        renderTagBar();
        renderPosts();
    })
    .catch(err => {
        console.error(err);
        document.getElementById('posts-list').innerHTML = '<p>Could not load posts.</p>';
    });
