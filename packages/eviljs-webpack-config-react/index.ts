const {BundleStatsWebpackPlugin: BundleStatsPlugin} = require('bundle-stats-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const {DuplicatesPlugin} = require('inspectpack/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Path = require('path')
const {DefinePlugin} = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const DefaultBasePath = ''
const DefaultBundleName = ''

function createWebpackConfig(projectDir: string, options?: WebpackConfigOptions) {
    const {
        basePath,
        bundleName,
        define,
        mode,
        serverAddress,
        serverPort,
        withPreact,
        withWorkers,
    } = options ?? {}

    const isProductionMode = (mode ?? process.env.NODE_ENV) === 'production'

    return {
        target: isProductionMode
            ? 'browserslist'
            : 'web'
        ,

        entry: {
            main: Path.resolve(projectDir, 'src/main.ts'),
        },

        output: {
            publicPath: basePath ?? DefaultBasePath,
            path: Path.resolve(projectDir, 'build'),
            filename: Path.join(bundleName ?? DefaultBundleName, 'entry-[name].js'),
            chunkFilename: Path.join(bundleName ?? DefaultBundleName, 'chunk-[id].js'),
            assetModuleFilename: Path.join(bundleName ?? DefaultBundleName, 'asset-[id]-[name][ext]'),
            clean: true,
        },

        mode: isProductionMode
            ? 'production'
            : 'development'
        ,

        resolve: {
            modules: [
                Path.resolve(projectDir, 'src'),
                Path.resolve(projectDir, '.node_modules'),
                'node_modules',
            ],
            alias: {
                'react/jsx-runtime': 'react/jsx-runtime.js',

                ...withPreact && {
                    'react': 'preact/compat',
                    'react-dom': 'preact/compat',
                    'react/jsx-runtime': 'preact/jsx-runtime',
                },
            },
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
            symlinks: false,
        },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: require.resolve('babel-loader'),
                },
                {
                    test: /\.jsx?$/,
                    loader: require.resolve('babel-loader'),
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
                            options: {sourceMap: false},
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
                __BASE_PATH__: JSON.stringify(basePath ?? DefaultBasePath),
                __BUNDLE_NAME__: JSON.stringify(bundleName ?? DefaultBundleName),
                __ENV__: JSON.stringify(process.env.NODE_ENV),
                ...define,
            }),
            new MiniCssExtractPlugin({
                filename: Path.join(bundleName ?? DefaultBundleName, 'entry-[name].css'),
                chunkFilename: Path.join(bundleName ?? DefaultBundleName, 'chunk-[id].css'),
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
                runtimeChunk: withWorkers
                    ? 'multiple' // Workers require their own runtime.
                    : 'single'
                ,
                splitChunks: {
                    chunks: 'all',
                },
                minimizer: [
                    '...',
                    new CssMinimizerPlugin({
                        test: /\.css$/i,
                        minify: CssMinimizerPlugin.cssoMinify,
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
            host: serverAddress ?? '127.0.0.1',
            port: serverPort ?? 8000,
            devMiddleware: {
                writeToDisk: true,  // Used for testing the Server Side Rendering while development.
            },
            static: {
                directory: Path.resolve(projectDir, 'build'),
            },
            client: {
                logging: 'warn',
            },
            historyApiFallback: true,
            hot: true,
        },
        snapshot: {
            managedPaths: [], // Processes changes inside the node_modules directory.
        },

        stats: 'normal',
    }
}

function asBoolean<T>(value: undefined | boolean | number | string, defaultValue: T) {
    switch (value) {
        case true: case 1: case '1': case 'yes': case 'on': case 'true':
            return true
        break
        case false: case 0: case '0': case 'no': case 'off': case 'false':
            return false
        break
    }
    return defaultValue
}

module.exports.DefaultBasePath = DefaultBasePath
module.exports.DefaultBundleName = DefaultBundleName
module.exports.asBoolean = asBoolean
module.exports.createWebpackConfig = createWebpackConfig

// Types ///////////////////////////////////////////////////////////////////////

export interface WebpackConfigOptions {
    basePath?: string
    bundleName?: string
    define?: Record<string, any>
    mode?: string
    serverAddress?: string
    serverPort?: number
    withPreact?: boolean
    withWorkers?: boolean
}
