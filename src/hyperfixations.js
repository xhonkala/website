import './style.css'
import './night-mode.js'
import { marked } from 'marked'

fetch('/hyperfixations/content.md')
    .then(response => response.text())
    .then(markdown => {
        const html = marked.parse(markdown);
        document.getElementById('content').innerHTML = html;

        const h1 = document.querySelector('#content h1');
        if (h1) h1.style.display = 'none';
    })
    .catch(err => {
        console.error(err);
        document.getElementById('content').innerHTML = '<p>Could not load content.</p>';
    });
