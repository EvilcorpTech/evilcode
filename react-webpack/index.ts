const {BundleStatsWebpackPlugin: BundleStatsPlugin} = require('bundle-stats-webpack-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const {DuplicatesPlugin} = require('inspectpack/plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const Path = require('path')
const {DefinePlugin} = require('webpack')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const {
    DEV_ADDR,
    DEV_PORT,
    API_URL,
    BASE_PATH,
    NODE_ENV,
    ROUTER_TYPE,
    WITH_PREACT,
} = process.env
const IsProductionMode = NODE_ENV === 'production'
const WithPreact = asBoolean(WITH_PREACT, false)

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
// clean-webpack-plugin \
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

module.exports = (projectDir: string) => ({
    target: IsProductionMode ? 'browserslist' : 'web',

    entry: {
        main: Path.resolve(projectDir, 'src/main.ts'),
    },

    output: {
        publicPath: BASE_PATH || '/',
        path: Path.resolve(projectDir, 'build'),
        filename: 'bundle/entry-[name].js',
        chunkFilename: 'bundle/chunk-[id].js',
        assetModuleFilename: 'bundle/asset-[id]-[name][ext]',
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

            ...WithPreact && {
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
        new CleanPlugin(),
        new CopyPlugin({
            patterns: [
                {from: 'src/assets', globOptions: {ignore: ['**/.DS_Store']}},
            ],
        }),
        new DefinePlugin({
            'process.env': {
                API_URL: JSON.stringify(API_URL),
                BASE_PATH: JSON.stringify(BASE_PATH),
                NODE_ENV: JSON.stringify(NODE_ENV),
                ROUTER_TYPE: JSON.stringify(ROUTER_TYPE),
                WITH_PREACT: JSON.stringify(WITH_PREACT),
            },
        }),
        new MiniCssExtractPlugin({
            filename: 'bundle/entry-[name].css',
            chunkFilename: 'bundle/chunk-[id].css',
        }),
        new HtmlPlugin({
            template: 'src/main.html',
            base: BASE_PATH,
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
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
            },
            minimizer: [
                '...',
                new CssMinimizerPlugin({
                    test: /\.css$/i,
                    // @ts-ignore
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
        host: DEV_ADDR ?? '127.0.0.1',
        port: DEV_PORT ?? 8000,
        historyApiFallback: ROUTER_TYPE === 'path',
        writeToDisk: true, // Used by Koa Static for the Server Side Rendering.
        hot: true,
        clientLogLevel: 'warning',
    },
    snapshot: {
        managedPaths: [], // Processes changes inside the node_modules directory.
    },

    stats: 'normal',
})

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
