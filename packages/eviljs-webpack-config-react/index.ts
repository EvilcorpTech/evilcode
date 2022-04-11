import {BundleStatsWebpackPlugin as WebpackPluginBundleStats} from 'bundle-stats-webpack-plugin'
import WebpackPluginCaseSensitivePaths from 'case-sensitive-paths-webpack-plugin'
import WebpackPluginCopy from 'copy-webpack-plugin'
import WebpackPluginCssMinimizer from 'css-minimizer-webpack-plugin'
import WebpackPluginHtml from 'html-webpack-plugin'
import {DuplicatesPlugin as WebpackPluginDuplicates} from 'inspectpack/plugin/index.js'
import WebpackPluginMiniCssExtract from 'mini-css-extract-plugin'
import {createRequire} from 'module'
import Path from 'path' // @ts-ignore
import WebpackPluginTypeScriptCheck from 'react-dev-utils/ForkTsCheckerWarningWebpackPlugin.js'
// import WebpackPluginInterpolateHtml from 'react-dev-utils/InterpolateHtmlPlugin.js'
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
    WebpackPluginHtml,
    // WebpackPluginInterpolateHtml,
    WebpackPluginMiniCssExtract,
    // WebpackPluginReactRefresh,
    WebpackPluginTypeScriptCheck,
}

export default createWebpackConfig()

export function createWebpackConfig(options?: WebpackConfigOptions) {
    const workDir = options?.workDir || process.cwd()
    const mode = options?.mode || process.env.NODE_ENV
    const isDebugMode = options?.debug === true
    const isProductionMode = mode === 'production'
    const isDevelopmentMode = ! isProductionMode
    const basePath = options?.basePath || DefaultBasePath
    const bundleName = options?.bundleName || DefaultBundleName
    const runtime = options?.runtime || 'single' // Workers require 'multiple' runtime.
    const define = options?.define ?? {}
    const babelConfig = options?.babelConfig ?? createBabelConfig({workDir})
    const postcssConfig = options?.postcssConfig ?? createPostcssConfig({workDir})
    const preact = options?.preact ?? false
    const serverAddress = options?.serverAddress || DefaultServerAddress
    const serverPort = options?.serverPort || DefaultServerPort

    return {
        entry: {
            main: Path.resolve(workDir, 'src/main'),
        },

        output: {
            publicPath: basePath,
            path: Path.resolve(workDir, 'build'),
            filename: Path.join(bundleName, 'entry-[name].js'),
            chunkFilename: Path.join(bundleName, 'chunk-[id].js'),
            assetModuleFilename: Path.join(bundleName, 'asset-[id]-[name][ext]'),
            clean: true,
        },

        mode: isProductionMode
            ? 'production'
            : 'development'
        ,

        resolve: {
            modules: [
                Path.resolve(workDir, 'src'),
                'node_modules',
            ],
            alias: {
                // 'react/jsx-runtime': 'react/jsx-runtime.js', // React 17.

                ...preact && {
                    // 'react/jsx-runtime.js': 'preact/jsx-runtime', // React 17.
                    'react/jsx-runtime': 'preact/jsx-runtime',
                    'react-dom': 'preact/compat',
                    'react': 'preact/compat',
                },
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: true, // False breaks pnpm.
        },

        module: {
            rules: [
                {
                    test: /\.[jt]sx?$/,
                    loader: require.resolve('babel-loader'),
                    exclude: [
                        /[\\/]node_modules[\\/]preact/,
                        /[\\/]node_modules[\\/]react/,
                    ],
                    options: babelConfig,
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: WebpackPluginMiniCssExtract.loader,
                            options: {},
                        },
                        {
                            loader: require.resolve('css-loader'),
                            options: {sourceMap: false, importLoaders: 1},
                        },
                        {
                            loader: require.resolve('postcss-loader'),
                            options: {
                                sourceMap: false,
                                postcssOptions: postcssConfig,
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
                    {from: 'src/assets', globOptions: {ignore: ['**/.DS_Store']}},
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
            // new WebpackPluginInterpolateHtml(WebpackPluginHtml, {
            //     __BASE_PATH__: JSON.stringify(basePath),
            //     __BUNDLE_NAME__: JSON.stringify(bundleName),
            //     __MODE__: JSON.stringify(mode),
            //     ...define,
            // }),
            new WebpackPluginMiniCssExtract({
                filename: Path.join(bundleName, 'entry-[name].css'),
                chunkFilename: Path.join(bundleName, 'chunk-[id].css'),
            }),
            new WebpackPluginHtml({
                template: 'src/main.html',
                chunks : ['main'],
                hash: true,
            }),
            new WebpackPluginTypeScriptCheck({
                // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin
                async: isDevelopmentMode,
                typescript: {
                    // typescriptPath: ,
                    configOverwrite: {
                        compilerOptions: {
                            declarationMap: false,
                            incremental: true,
                            inlineSourceMap: false,
                            noEmit: true,
                            skipLibCheck: true,
                            sourceMap: false,
                        },
                    },
                //     context: paths.appPath,
                //     diagnosticOptions: {
                //         syntactic: true,
                //     },
                //     mode: 'write-references',
                //     profile: true,
                },
                issue: {
                    include: [
                        {file: 'src/**/*.{ts,tsx}'},
                    ],
                    // exclude: [
                    //     {file: '**/node_modules/**/*'},
                    // ],
                },
                // logger: {
                //     infrastructure: 'silent',
                // },
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

// Types ///////////////////////////////////////////////////////////////////////

export interface WebpackConfigOptions {
    babelConfig?: undefined | {}
    basePath?: undefined | string
    bundleName?: undefined | string
    debug?: undefined | boolean
    define?: undefined | Record<string, any>
    mode?: undefined | string
    postcssConfig?: undefined | {}
    preact?: undefined | boolean
    runtime?: undefined | boolean
    serverAddress?: undefined | string
    serverPort?: undefined | number
    workDir?: undefined | string
}
