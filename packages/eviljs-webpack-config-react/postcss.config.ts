// @ts-ignore
import PostCssPresetEnv from 'postcss-preset-env'

export default createPostcssConfig()

export function createPostcssConfig(options?: PostcssConfigOptions) {
    // const mode = options?.mode ?? process.env.NODE_ENV
    // const workDir = options?.workDir ?? process.cwd()
    // const isProductionMode = mode === 'production'

    return {
        plugins: [
            PostCssPresetEnv({
                stage: 3,
                features: {
                    'postcss-focus-within': false,
                },
            }),
        ],
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PostcssConfigOptions {
    mode?: undefined | string
    workDir?: undefined | string
}
