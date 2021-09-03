import Path from 'path'
import {defineConfig} from 'vite'
import VuePlugin from '@vitejs/plugin-vue'

export default defineConfig({
    root: Path.resolve('src'),
    publicDir: 'assets',

    resolve: {
        alias: {
            ':': Path.resolve('src'),
        },
    },

    plugins: [VuePlugin()],

    build: {
        outDir: Path.resolve('build'),
        emptyOutDir: true,
        brotliSize: false,
    },

    server: {
        port: 8000,
        fs: {
            strict: true,
        },
    },
})
