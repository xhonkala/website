---
description: Deploy the website to GitHub Pages
---

# Deployment

This site deploys automatically via GitHub. Just push to the repo.

## Workflow

1.  **Local preview** (optional but recommended):
    ```bash
    npm run dev
    ```
    Check your changes at http://localhost:5173

2.  **Deploy**:
    ```bash
    git add .
    git commit -m "Your commit message"
    git push
    ```
    GitHub Actions handles the build and deploy automatically.
