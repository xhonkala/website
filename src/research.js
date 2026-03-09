import './style.css'
import './night-mode.js'
import { marked } from 'marked'

// Skip fetch if content was prerendered at build time
const content = document.getElementById('content');
if (!content.children.length) {
    fetch('/research/content.md')
        .then(response => response.text())
        .then(markdown => {
            const html = marked.parse(markdown);
            content.innerHTML = html;

            const h1 = content.querySelector('h1');
            if (h1) h1.style.display = 'none';
        })
        .catch(err => {
            console.error(err);
            content.innerHTML = '<p>Could not load content.</p>';
        });
}
