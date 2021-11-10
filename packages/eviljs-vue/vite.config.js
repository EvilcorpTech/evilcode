import VuePlugin from '@vitejs/plugin-vue'

export default {
    mode: 'production',

    plugins: [
        VuePlugin(),
    ],

    build: {
        target: ['modules', 'esnext'],

        outDir: '.',
        cssCodeSplit: true,
        minify: false,
        write: true,
        emptyOutDir: false,
    },

    logLevel: 'info',
    clearScreen: true,
}
