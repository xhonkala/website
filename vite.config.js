import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/alexander-honkala-site/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                research: resolve(__dirname, 'research.html'),
                likes: resolve(__dirname, 'likes.html'),
                writing: resolve(__dirname, 'writing.html'),
                post: resolve(__dirname, 'post.html'),
            },
        },
    },
})
