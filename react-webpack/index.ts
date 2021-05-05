const {BundleStatsWebpackPlugin: BundleStatsPlugin} = require('bundle-stats-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const {DuplicatesPlugin} = require('inspectpack/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Path = require('path')
const {DefinePlugin} = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

// npm install \
// @babel/core \
// @babel/plugin-proposal-nullish-coalescing-operator \
// @babel/plugin-proposal-numeric-separator \
// @babel/plugin-proposal-optional-chaining \
// @babel/plugin-syntax-dynamic-import \
// @babel/preset-react \
// @babel/preset-typescript \
// @babel/runtime \
// @types/copy-webpack-plugin \
// @types/css-minimizer-webpack-plugin \
// @types/mini-css-extract-plugin \
// @types/webpack-bundle-analyzer \
// babel-loader \
// bundle-stats-webpack-plugin \
// copy-webpack-plugin \
// css-loader \
// css-minimizer-webpack-plugin \
// csso \
// file-loader \
// html-webpack-plugin \
// inspectpack \
// mini-css-extract-plugin \
// postcss \
// postcss-import \
// postcss-loader \
// postcss-preset-env \
// style-loader \
// terser-webpack-plugin \
// typescript \
// webpack \
// webpack-bundle-analyzer

const DefaultBasePath = ''
const DefaultBundleName = ''
const IsProductionMode = process.env.NODE_ENV === 'production'

function createWebpackConfig(projectDir: string, options: ConfigOptions) {return {
    target: IsProductionMode
        ? 'browserslist'
        : 'web'
    ,

    entry: {
        main: Path.resolve(projectDir, 'src/main.ts'),
    },

    output: {
        publicPath: options?.basePath ?? DefaultBasePath,
        path: Path.resolve(projectDir, 'build'),
        filename: Path.join(options?.bundleName ?? DefaultBundleName, 'entry-[name].js'),
        chunkFilename: Path.join(options?.bundleName ?? DefaultBundleName, 'chunk-[id].js'),
        assetModuleFilename: Path.join(options?.bundleName ?? DefaultBundleName, 'asset-[id]-[name][ext]'),
        clean: true,
    },

    mode: IsProductionMode
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

            ...options?.withPreact && {
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
                loader: 'babel-loader',
            },
            {
                test: /\.jsx?$/,
                loader: 'babel-loader',
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {},
                    },
                    {
                        loader: 'css-loader',
                        options: {sourceMap: false, importLoaders: 1},
                    },
                    {
                        loader: 'postcss-loader',
                        options: {sourceMap: false},
                    },
                ],
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff2?|ttf|eot|otf)$/i,
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
            __BASE_PATH__: JSON.stringify(options?.basePath ?? DefaultBasePath),
            __BUNDLE_NAME__: JSON.stringify(options?.bundleName ?? DefaultBundleName),
            __ENV__: JSON.stringify(process.env.NODE_ENV),
            ...options?.define,
        }),
        new MiniCssExtractPlugin({
            filename: Path.join(options?.bundleName ?? DefaultBundleName, 'entry-[name].css'),
            chunkFilename: Path.join(options?.bundleName ?? DefaultBundleName, 'chunk-[id].css'),
        }),
        new HtmlPlugin({
            template: 'src/main.html',
            chunks : ['main'],
            base: options?.basePath,
            hash: true,
        }),
        IsProductionMode && new DuplicatesPlugin({
            emitErrors: false,
            verbose: false,
        }),
        IsProductionMode && new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            generateStatsFile: true,
            reportFilename: 'meta/report.html',
            statsFilename: 'meta/stats.json',
            openAnalyzer: false,
        }),
        IsProductionMode && new BundleStatsPlugin({
            outDir: 'meta',
        }),
    ].filter(Boolean),

    ...IsProductionMode && {
        optimization: {
            runtimeChunk: options?.withWorkers
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
        hints: IsProductionMode
            ? 'warning'
            : false
        ,
    },

    devtool: IsProductionMode
        ? 'source-map'
        : 'eval-source-map'
    ,
    devServer: {
        contentBase: Path.resolve(projectDir, 'build'),
        host: options?.serverAddress ?? '127.0.0.1',
        port: options?.serverPort ?? 8000,
        historyApiFallback: true,
        writeToDisk: true, // Used for testing the Server Side Rendering while developing.
        hot: true,
        clientLogLevel: 'warning',
    },
    snapshot: {
        managedPaths: [], // Processes changes inside the node_modules directory.
    },

    stats: 'normal',
}}

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

interface ConfigOptions {
    basePath?: string
    bundleName?: string
    define?: Record<string, any>
    serverAddress?: string
    serverPort?: number
    withPreact?: boolean
    withWorkers?: boolean
}
