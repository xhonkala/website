# Alexander Honkala Personal Website

A personal website featuring a generative starling murmuration background, built with Vite and Vanilla JS.

## Features
- **Generative Art**: Interactive Boids algorithm simulation using a spatial grid for high performance.
- **Client-Side Blog**: Markdown-based blog system that renders posts dynamically.
- **Responsive Design**: Minimalist and mobile-friendly UI.

## Local Development

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the dev server**:
    ```bash
    npm run dev
    ```

## Deployment

This site is configured to deploy to **GitHub Pages** using **GitHub Actions**.

### How to Fork & Deploy (For New Owners)

If you are forking this repository to your own account, follow these steps to get your site live:

1.  **Fork the Repository**: Click the "Fork" button in the top right of the GitHub page.
2.  **Enable GitHub Pages**:
    *   Go to **Settings** > **Pages**.
    *   Under **Build and deployment** > **Source**, select **GitHub Actions**.
3.  **Update Configuration** (Important!):
    *   Open `vite.config.js`.
    *   Look for the line: `base: '/alexander-honkala-site/'`.
    *   If your repository is named something else (e.g., `my-website`), change this to match: `base: '/my-website/'`.
    *   If you are using a custom domain (e.g., `alexanderhonkala.com`), remove the `base` line entirely or set it to `'/'`.
4.  **Push Changes**: Once you commit and push a change (like updating the content or the config), the "Deploy static content to Pages" action will run automatically.

## Content Management

- **Blog Posts**: Add new `.md` files to the `public/posts/` directory.
- **Linking Posts**: In `writing.html`, link to posts using `post.html?slug=filename` (without the .md extension).
