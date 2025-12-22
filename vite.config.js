import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
    base: '/',
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                about: resolve(__dirname, 'about.html'),
                research: resolve(__dirname, 'research.html'),
                hyperfixations: resolve(__dirname, 'hyperfixations.html'),
                thinking: resolve(__dirname, 'thinking.html'),
                post: resolve(__dirname, 'post.html'),
            },
        },
    },
})
