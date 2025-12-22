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
        // Sort by date descending (newest first)
        posts.sort((a, b) => b.date.localeCompare(a.date));

        const container = document.getElementById('posts-list');
        const html = posts.map(post => `
            <article>
                <h2><a href="post.html?slug=${post.slug}">${post.title}</a></h2>
                <span class="date">${formatDate(post.date)}</span>
                <p>${post.description}</p>
            </article>
        `).join('');
        container.innerHTML = html;
    })
    .catch(err => {
        console.error(err);
        document.getElementById('posts-list').innerHTML = '<p>Could not load posts.</p>';
    });
