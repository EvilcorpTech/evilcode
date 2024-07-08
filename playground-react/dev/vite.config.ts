import VitePluginReact from '@vitejs/plugin-react'
import Fs from 'node:fs'
import Path from 'node:path'
import Url from 'node:url'
import {visualizer as RollupPluginVisualizer} from 'rollup-plugin-visualizer'
import {defineConfig, type UserConfig} from 'vite'
import VitePluginChecker from 'vite-plugin-checker'
import {ViteEjsPlugin as VitePluginEjs} from 'vite-plugin-ejs'

const __filename = Url.fileURLToPath(import.meta.url)
const __dirname = Path.dirname(__filename)

const PackagesAbsolutePath = Fs.realpathSync(Path.resolve('..', '..', 'packages'))
const PnpmAbsolutePath = Fs.realpathSync(Path.resolve('node_modules', '.pnpm')) // Needed when 'node_modules' is a symbolic link.

export default defineConfig(async (ctx): Promise<UserConfig> => {
    const viteDir = Path.resolve(__dirname)
    const rootDir = Path.resolve(__dirname, '..')
    const srcDir = Path.resolve(rootDir, 'src')
    const buildDir = Path.resolve(rootDir, 'build')

    return {
        // assetsInclude: [],
        base: process.env.APP_BASE_PATH || '/',
        envPrefix: 'APP_',
        root: srcDir,
        publicDir: Path.resolve(srcDir, 'public'),

        resolve: {
            alias: {
                '~': srcDir,
            },
        },

        plugins: [
            VitePluginReact({
                // babel: {
                //     parserOpts: {
                //         plugins: ['decorators-legacy'],
                //     },
                // },
            }),

            VitePluginEjs({
                env: process.env,
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

        css: {
            postcss: Path.resolve(viteDir, 'postcss.config.js'),
        },

        build: {
            outDir: buildDir,
            emptyOutDir: true,
            reportCompressedSize: false,
            target: ['es2020', 'chrome97', 'edge97', 'firefox96', 'safari14'],
            rollupOptions: {
                input: {
                    main: Path.resolve(srcDir, 'index.html'),
                },
                output: {
                    entryFileNames: 'entry-[name].js',
                    chunkFileNames: 'script-[name].js',
                    assetFileNames: 'asset-[name][extname]',
                },
                plugins: [
                    RollupPluginVisualizer({
                        filename: Path.resolve(buildDir, 'meta', 'report.html'),
                    }),
                ],
            },
        },

        server: {
            host: process.env.DEV_ADDR || 'localhost',
            port: parseInt(process.env.DEV_PORT || '8000'),
            fs: {
                allow: ['.', PnpmAbsolutePath, PackagesAbsolutePath],
            },
        },
    }
})
