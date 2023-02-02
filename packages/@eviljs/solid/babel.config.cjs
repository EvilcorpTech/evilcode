const env = process.env.BABEL_ENV || process.env.NODE_ENV || process.env.ENV

module.exports = {
    presets: [
        ['babel-preset-solid', {}],

        ['@babel/preset-typescript', {
            isTSX: true,
            allExtensions: true,
        }],
    ],
}
