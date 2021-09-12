function createPostcssConfig(projectDir: string, options?: PostcssConfigOptions) {
    const {mode} = options ?? {}
    // const isProductionMode = (mode ?? process.env.NODE_ENV) === 'production'

    return {
        plugins: [
            require('postcss-preset-env')({
                stage: 3,
                features: {
                    'postcss-focus-within': false,
                },
            }),
        ],
    }
}

module.exports.createPostcssConfig = createPostcssConfig

// Types ///////////////////////////////////////////////////////////////////////

export interface PostcssConfigOptions {
    mode?: string
}
