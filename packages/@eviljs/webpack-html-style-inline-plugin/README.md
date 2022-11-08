# README

A **Webpack 5** plugin for inlining critical CSS resources inside the HTML file.

Compatible with **html-webpack-plugin 5**.

## Setup

```
npm install @eviljs/webpack-html-style-inline-plugin

# Required deps.
npm install html-webpack-plugin mini-css-extract-plugin

# Optional deps.
npm install clean-webpack-plugin copy-webpack-plugin
npm install css-loader postcss-loader
```

## Webpack Configuration

```js
const {HtmlStyleInlinePlugin} = require('@eviljs/webpack-html-style-inline-plugin')
const {CleanWebpackPlugin: CleanPlugin} = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const {NODE_ENV} = process.env
const isProductionMode = NODE_ENV === 'production'

module.exports = {
    entry: {
        main: Path.resolve(__dirname, 'src/main.js'),
    },

    output: {
        filename: 'entry-[name].js',
    },

    module: {
        rules: [
            // ... your rules.
            {
                test: /\.css$/,
                include: [
                    Path.resolve(__dirname, 'src'),
                ],
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {},
                    },
                    {
                        loader: 'css-loader',
                        options: {importLoaders: 1},
                    },
                    {
                        loader: 'postcss-loader',
                        options: {},
                    },
                ],
            },
        ],
    },

    plugins: [
        new CleanPlugin(),
        new CopyPlugin({
            patterns: [
                {from: 'public', globOptions: {ignore: ['**/.DS_Store']}},
            ],
        }),
        new MiniCssExtractPlugin({
            filename: 'entry-[name].css',
            chunkFilename: 'chunk-[id].css',
        }),
        new HtmlPlugin({
            template: 'src/index.html',
            base: '/',
            hash: true,
        }),
        new HtmlStyleInlinePlugin(HtmlPlugin, {
            tests: ['entry-font.css'],
        }),
    ],

    ...isProductionMode && {
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    fontStyle: {
                        chunks: 'all',
                        test: Path.resolve(__dirname, 'src/theme/font.css'),
                        name: 'font',
                        enforce: true,
                    },
                },
            },
        },
    },
}
```
