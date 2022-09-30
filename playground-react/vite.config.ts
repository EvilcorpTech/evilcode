import {asBooleanLike} from '@eviljs/std/type.js'
import VitePluginReact from '@vitejs/plugin-react'
import Fs from 'node:fs'
import Path from 'node:path'
import {visualizer as RollupPluginVisualizer} from 'rollup-plugin-visualizer'
import {defineConfig} from 'vite'
import VitePluginChecker from 'vite-plugin-checker'

// Needed when 'node_modules' is a symbolic link.
const PackagesAbsolutePath = Fs.realpathSync(Path.join('..', 'packages'))
const PnpmAbsolutePath = Fs.realpathSync(Path.join('node_modules', '.pnpm'))

export default defineConfig(async ctx => ({
    // assetsInclude: [],
    base: process.env.BASE_URL ?? '/',
    envPrefix: 'APP_',
    publicDir: 'pub',
    root: Path.resolve('src'),

    resolve: {
        alias: {
            '~': Path.resolve('src'),
            'react-redux': ctx.mode !== 'production'
                ? 'react-redux/dist/react-redux.js'
                : 'react-redux/lib'
            ,
        },
    },

    plugins: [
        VitePluginReact({
            babel: {
                parserOpts: {
                    plugins: ['decorators-legacy'],
                },
            },
        }),
        ctx.mode !== 'production' &&
            VitePluginChecker({
                typescript: true,
                terminal: false,
                overlay: {
                    position: 'tl',
                    initialIsOpen: false,
                },
            })
        ,
    ],

    build: {
        outDir: Path.resolve('build'),
        emptyOutDir: true,
        reportCompressedSize: false,
        target: 'esnext',
        rollupOptions: {
            output: {
                entryFileNames: 'bundle/entry-[name].js',
                chunkFileNames: 'bundle/chunk-[name].js',
                assetFileNames: 'bundle/asset-[name][extname]',
            },
            plugins: [
                RollupPluginVisualizer({
                    filename: 'build/report.html',
                }),
            ],
        },
    },

    server: {
        host: process.env.DEV_ADDR || 'localhost',
        port: parseInt(process.env.DEV_PORT || '8000'),
        https: asBooleanLike(process.env.DEV_HTTPS),
        fs: {
            allow: ['.', PnpmAbsolutePath, PackagesAbsolutePath],
        },
    },
}))
