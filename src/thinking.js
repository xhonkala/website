import './style.css'
import './night-mode.js'

fetch('/posts/index.json')
    .then(response => response.json())
    .then(posts => {
        const container = document.getElementById('posts-list');
        const html = posts.map(post => `
            <article>
                <h2><a href="post.html?slug=${post.slug}">${post.title}</a></h2>
                <span class="date">${post.date}</span>
                <p>${post.description}</p>
            </article>
        `).join('');
        container.innerHTML = html;
    })
    .catch(err => {
        console.error(err);
        document.getElementById('posts-list').innerHTML = '<p>Could not load posts.</p>';
    });
