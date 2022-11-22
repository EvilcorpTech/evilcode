import {BundleStatsWebpackPlugin as WebpackPluginBundleStats} from 'bundle-stats-webpack-plugin'
import WebpackPluginCaseSensitivePaths from 'case-sensitive-paths-webpack-plugin'
import WebpackPluginCopy from 'copy-webpack-plugin'
import WebpackPluginCssMinimizer from 'css-minimizer-webpack-plugin'
import WebpackPluginForkTsChecker from 'fork-ts-checker-webpack-plugin'
import WebpackPluginHtml from 'html-webpack-plugin'
import {DuplicatesPlugin as WebpackPluginDuplicates} from 'inspectpack/plugin/index.js'
import WebpackPluginMiniCssExtract from 'mini-css-extract-plugin'
import {createRequire} from 'module'
import Path from 'path' // @ts-ignore
// import WebpackPluginReactRefresh from '@pmmmwh/react-refresh-webpack-plugin'
import Webpack from 'webpack'
import {BundleAnalyzerPlugin as WebpackPluginBundleAnalyzer} from 'webpack-bundle-analyzer'
import {createBabelConfig} from './babel.config.js'
import {createPostcssConfig} from './postcss.config.js'

const {DefinePlugin: WebpackPluginDefine} = Webpack
const require = createRequire(import.meta.url)

export {asBooleanLike} from '@eviljs/std/type.js'

export const DefaultBasePath = '/'
export const DefaultBundleName = ''
export const DefaultServerAddress =  '0.0.0.0'
export const DefaultServerPort = 8000

export const WebpackPlugins = {
    Webpack,
    WebpackPluginBundleAnalyzer,
    WebpackPluginBundleStats,
    WebpackPluginCaseSensitivePaths,
    WebpackPluginCopy,
    WebpackPluginCssMinimizer,
    WebpackPluginDefine,
    WebpackPluginDuplicates,
    WebpackPluginForkTsChecker,
    WebpackPluginHtml,
    WebpackPluginMiniCssExtract,
    // WebpackPluginReactRefresh,
}

export default createWebpackConfig()

export function createWebpackConfig(options?: WebpackConfigOptions) {
    const workDir = options?.workDir || process.cwd()
    const mode = options?.mode || process.env.NODE_ENV
    const isDebugMode = options?.debug === true
    const isProductionMode = mode === 'production'
    const isDevelopmentMode = ! isProductionMode
    const libDir = options?.libDir ?? 'lib'
    const srcDir = options?.srcDir ?? 'src'
    const srcPrefix = options?.srcPrefix ?? '~'
    const entry = options?.entry ?? Path.join(srcDir, 'main')
    const entryHtml = options?.entryHtml ?? Path.join(srcDir, 'index.html')
    const basePath = options?.basePath || DefaultBasePath
    const bundleName = options?.bundleName || DefaultBundleName
    const runtime = options?.runtime || 'single' // Workers require 'multiple' runtime.
    const define = options?.define ?? {}
    const babelOptions = options?.babelOptions ?? createBabelConfig({workDir})
    const postcssOptions = options?.postcssOptions ?? createPostcssConfig({workDir})
    const preact = options?.preact ?? false
    const serverAddress = options?.serverAddress || DefaultServerAddress
    const serverPort = options?.serverPort || DefaultServerPort
    const styles = options?.styles ?? 'bundle'
    const stylesOptions = options?.stylesOptions ?? {}

    return {
        entry: {
            main: Path.resolve(workDir, entry),
        },

        output: {
            publicPath: basePath,
            path: Path.resolve(workDir, 'build'),
            filename: Path.join(bundleName, 'entry-[name].js'),
            chunkFilename: Path.join(bundleName, 'bundle-[id].js'),
            assetModuleFilename: Path.join(bundleName, 'asset-[name]_[id][ext]'),
            clean: true,
        },

        mode: isProductionMode
            ? 'production'
            : 'development'
        ,

        resolve: {
            modules: [
                Path.resolve(workDir, srcDir),
                Path.resolve(workDir, libDir),
                'node_modules',
            ],
            alias: {
                [srcPrefix]: Path.resolve(workDir, srcDir),

                // 'react/jsx-runtime': 'react/jsx-runtime.js', // React 17.

                ...preact && {
                    // 'react/jsx-runtime.js': 'preact/jsx-runtime', // React 17.
                    'react/jsx-runtime': 'preact/jsx-runtime',
                    'react-dom': 'preact/compat',
                    'react': 'preact/compat',
                },
            },
            extensionAlias: {
                '.js': ['.js', '.ts', '.tsx'],
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: true, // False breaks with PNPM.
        },

        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    loader: require.resolve('babel-loader'),
                    include: [
                        Path.resolve(workDir, srcDir),
                        Path.resolve(workDir, libDir, '@eviljs'),
                        /[\\/]node_modules[\\/]@eviljs[\\/]/,
                    ],
                    options: babelOptions,
                },
                {
                    test: /\.css$/,
                    use: [
                        styles === 'extract'
                            ? {
                                loader: WebpackPluginMiniCssExtract.loader,
                                options: {
                                    ...stylesOptions,
                                },
                            }
                            : {
                                loader: require.resolve('style-loader'),
                                options: {
                                    injectType: 'styleTag',
                                    insert: 'head',
                                    attributes: {
                                        'data-loader': 'style-loader',
                                    },
                                    esModule: true,
                                    ...stylesOptions,
                                },
                            }
                        ,
                        {
                            loader: require.resolve('css-loader'),
                            options: {
                                sourceMap: false,
                                importLoaders: 1,
                            },
                        },
                        {
                            loader: require.resolve('postcss-loader'),
                            options: {
                                sourceMap: false,
                                postcssOptions: postcssOptions,
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|jpe?g|webp|gif|svg|woff2?|ttf|eot|otf)$/i,
                    type: 'asset/resource',
                },
            ],
        },

        plugins: [
            new WebpackPluginCaseSensitivePaths({
                // debug: false,
            }),
            new WebpackPluginCopy({
                patterns: [
                    {
                        from: Path.resolve(workDir, srcDir, 'assets'),
                        globOptions: {ignore: ['**/.DS_Store']},
                    },
                ],
            }),
            new WebpackPluginDefine({
                // 'process.env': {
                //     NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                // },
                __BASE_PATH__: JSON.stringify(basePath),
                __BUNDLE_NAME__: JSON.stringify(bundleName),
                __MODE__: JSON.stringify(mode),
                ...define,
            }),
            new WebpackPluginMiniCssExtract({
                filename: Path.join(bundleName, 'entry-[name].css'),
                chunkFilename: Path.join(bundleName, 'chunk-[id].css'),
            }),
            new WebpackPluginHtml({
                template: Path.resolve(workDir, entryHtml),
                chunks : ['main'],
                hash: true,
            }),
            new WebpackPluginForkTsChecker({
                // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin
                async: isDevelopmentMode,
                devServer: true,
                typescript: {
                    mode: 'write-tsbuildinfo',
                    context: workDir,
                    // typescriptPath: ,
                    configOverwrite: {
                        compilerOptions: {
                            checkJs: false,
                            declarationMap: false,
                            incremental: true,
                            inlineSourceMap: false,
                            noEmit: true,
                            skipLibCheck: true,
                            sourceMap: false,
                        },
                    },
                    diagnosticOptions: {
                        syntactic: true,
                        semantic: true,
                        declaration: false,
                        global: false,
                    },
                },
                issue: {
                    include: [
                        {file: '**/*.{ts,tsx}'},
                    ],
                    exclude: [
                        {file: '**/node_modules/**/*'},
                    ],
                },
            }),
            // isDevelopmentMode && new WebpackPluginReactRefresh({
            //     overlay: true,
            // }),
            isProductionMode && new WebpackPluginDuplicates({
                emitErrors: false,
                verbose: false,
            }),
            isProductionMode && new WebpackPluginBundleAnalyzer({
                analyzerMode: 'static',
                generateStatsFile: true,
                reportFilename: 'meta/report.html',
                statsFilename: 'meta/stats.json',
                openAnalyzer: false,
            }),
            isProductionMode && new WebpackPluginBundleStats({
                outDir: 'meta',
            }),
        ].filter(Boolean),

        ...isProductionMode && {
            optimization: {
                runtimeChunk: runtime,
                splitChunks: {
                    chunks: 'all',
                },
                minimizer: [
                    '...',
                    new WebpackPluginCssMinimizer({
                        test: /\.css$/i,
                        minify: WebpackPluginCssMinimizer.parcelCssMinify,
                    }),
                ],
            },
        },
        performance: {
            hints: isProductionMode
                ? 'warning'
                : false
            ,
        },

        devtool: isProductionMode
            ? 'source-map'
            : 'eval-source-map'
        ,
        devServer: {
            host: serverAddress,
            port: serverPort,
            // devMiddleware: {
            //     writeToDisk: true, // Breaks HMR.
            // },
            // static: {
            //     directory: Path.resolve(workDir, 'build'),
            // },
            client: {
                logging: isDebugMode
                    ? 'verbose'
                    : 'warn' // 'info'
                ,
                progress: isDebugMode
                    ? true
                    : false
                ,
                overlay: {
                    errors: true,
                    warnings: true,
                },
            },
            historyApiFallback: true,
            hot: true,
        },
        snapshot: {
            managedPaths: [], // Forces processing changes inside node_modules directory.
        },

        stats:
            isDebugMode
                ? 'verbose'
            : isProductionMode
                ? 'normal'
            : 'minimal'
        ,
        infrastructureLogging: {
            level: isDebugMode
                ? 'verbose'
                : 'info'
            ,
        },
    }
}

export function isBabelLoaderRule(rule: {loader?: string}) {
    return true
        && ('loader' in rule)
        && rule.loader.includes('babel-loader')
}

// Types ///////////////////////////////////////////////////////////////////////

export interface WebpackConfigOptions {
    babelOptions?: undefined | {}
    basePath?: undefined | string
    bundleName?: undefined | string
    debug?: undefined | boolean
    define?: undefined | Record<string, any>
    entry?: undefined | string
    entryHtml?: undefined | string
    libDir?: undefined | string
    srcDir?: undefined | string
    srcPrefix?: undefined | string
    mode?: undefined | string
    postcssOptions?: undefined | {}
    preact?: undefined | boolean
    runtime?: undefined | boolean
    serverAddress?: undefined | string
    serverPort?: undefined | number
    styles?: undefined | 'bundle' | 'extract'
    stylesOptions?: undefined | {}
    workDir?: undefined | string
}
