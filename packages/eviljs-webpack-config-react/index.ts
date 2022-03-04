import BundleStats from 'bundle-stats-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin'
import HtmlPlugin from 'html-webpack-plugin'
import {DuplicatesPlugin} from 'inspectpack/plugin/index.js'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import {createRequire} from 'module'
import Path from 'path'
import Webpack from 'webpack'
import {BundleAnalyzerPlugin} from 'webpack-bundle-analyzer'
import {createBabelConfig} from './babel.config.js'
import {createPostcssConfig} from './postcss.config.js'

const {BundleStatsWebpackPlugin: BundleStatsPlugin} = BundleStats
const {DefinePlugin} = Webpack
const require = createRequire(import.meta.url)

export {asBooleanLike} from '@eviljs/std/type.js'

export const DefaultBasePath = '/'
export const DefaultBundleName = ''
export const DefaultServerAddress =  '0.0.0.0'
export const DefaultServerPort = 8000

export const WebpackPlugins = {
    BundleAnalyzerPlugin,
    BundleStatsPlugin,
    CopyPlugin,
    CssMinimizerPlugin,
    DefinePlugin,
    DuplicatesPlugin,
    HtmlPlugin,
    MiniCssExtractPlugin,
    Webpack,
}

export default createWebpackConfig()

export function createWebpackConfig(options?: WebpackConfigOptions) {
    const workDir = options?.workDir || process.cwd()
    const mode = options?.mode || process.env.NODE_ENV
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
                'react/jsx-runtime': 'react/jsx-runtime.js',

                ...preact && {
                    'react/jsx-runtime.js': 'preact/jsx-runtime',
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
                    test: /\.tsx?$/,
                    loader: require.resolve('babel-loader'),
                    options: babelConfig,
                },
                {
                    test: /\.jsx?$/,
                    loader: require.resolve('babel-loader'),
                    options: babelConfig,
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
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
            new CopyPlugin({
                patterns: [
                    {from: 'src/assets', globOptions: {ignore: ['**/.DS_Store']}},
                ],
            }),
            new DefinePlugin({
                // 'process.env': {
                //     NODE_ENV: JSON.stringify(process.env.NODE_ENV),
                // },
                __BASE_PATH__: JSON.stringify(basePath),
                __BUNDLE_NAME__: JSON.stringify(bundleName),
                __MODE__: JSON.stringify(mode),
                ...define,
            }),
            new MiniCssExtractPlugin({
                filename: Path.join(bundleName, 'entry-[name].css'),
                chunkFilename: Path.join(bundleName, 'chunk-[id].css'),
            }),
            new HtmlPlugin({
                template: 'src/main.html',
                chunks : ['main'],
                hash: true,
            }),
            isProductionMode && new DuplicatesPlugin({
                emitErrors: false,
                verbose: false,
            }),
            isProductionMode && new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                generateStatsFile: true,
                reportFilename: 'meta/report.html',
                statsFilename: 'meta/stats.json',
                openAnalyzer: false,
            }),
            isProductionMode && new BundleStatsPlugin({
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
                    new CssMinimizerPlugin({
                        test: /\.css$/i,
                        minify: CssMinimizerPlugin.parcelCssMinify,
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
                logging: 'warn', // 'verbose' | 'info' | 'warn'
                progress: false,
                overlay: {
                    errors: true,
                    warnings: true,
                },
            },
            historyApiFallback: true,
            hot: true,
        },
        snapshot: {
            managedPaths: [], // Processes changes inside the node_modules directory.
        },

        stats: isProductionMode
            ? 'normal'
            : 'minimal' // 'verbose'
        ,
        infrastructureLogging: {
            level: 'info', // 'verbose'
        },
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface WebpackConfigOptions {
    babelConfig?: undefined | {}
    basePath?: undefined | string
    bundleName?: undefined | string
    define?: undefined | Record<string, any>
    mode?: undefined | string
    postcssConfig?: undefined | {}
    preact?: undefined | boolean
    runtime?: undefined | boolean
    serverAddress?: undefined | string
    serverPort?: undefined | number
    workDir?: undefined | string
}
