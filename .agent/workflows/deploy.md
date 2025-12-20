---
description: Deploy the website to Vercel or GitHub Pages
---

# Deployment Options

Since this is a static site built with Vite, you have several easy options for deployment.

## Option 1: Vercel (Recommended)
Vercel is optimized for frontend frameworks and requires zero configuration for Vite.

1.  **Install Vercel CLI** (optional, or use the web dashboard):
    ```bash
    npm i -g vercel
    ```

2.  **Deploy**:
    Run the following command in your project root:
    ```bash
    vercel
    ```
    Follow the prompts (accept defaults).

3.  **Production Deployment**:
    ```bash
    vercel --prod
    ```

## Option 2: GitHub Pages

1.  **Update `vite.config.js`**:
    If you are deploying to `https://<USERNAME>.github.io/<REPO>/`, set the base in `vite.config.js`:
    ```javascript
    export default {
      base: '/<REPO>/'
    }
    ```

2.  **Build the project**:
    ```bash
    npm run build
    ```

3.  **Deploy the `dist` folder**:
    You can use a GitHub Action or manually push the `dist` folder to a `gh-pages` branch.
