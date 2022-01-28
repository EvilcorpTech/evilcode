// @ts-ignore
import PostcssPluginInset from 'postcss-inset'
import PostcssPluginPresetEnv from 'postcss-preset-env'

export const PostcssPlugins = {
    PostcssPluginInset,
    PostcssPluginPresetEnv,
}

export default createPostcssConfig()

export function createPostcssConfig(options?: PostcssConfigOptions) {
    const pluginPresetEnvOptions = options?.pluginPresetEnvOptions
    // const mode = options?.mode ?? process.env.NODE_ENV
    // const workDir = options?.workDir ?? process.cwd()
    // const isProductionMode = mode === 'production'

    return {
        plugins: [
            PostcssPluginInset(),
            PostcssPluginPresetEnv({
                // @ts-ignore
                stage: false,
                autoprefixer: true,
                ...pluginPresetEnvOptions,
                features: {
                        // https://github.com/postcss/postcss-custom-media
                    'custom-media-queries': true,

                        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-double-position-gradients
                        // Since Safari 12.1.
                    'double-position-gradients': true,

                        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-logical
                        // Since Safari 14.8 and Edge 87.
                    'logical-properties-and-values': true,

                        // https://github.com/postcss/postcss-media-minmax
                    'media-query-ranges': true,

                        // https://github.com/csstools/postcss-nesting
                    'nesting-rules': true,

                        // https://github.com/postcss/postcss-selector-not
                        // Not by QQ, Baidu and KaiOS.
                    'not-pseudo-class': true,

                        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-overflow-shorthand
                        // Since Safari 13.4 and Edge 79.
                    'overflow-property': true,

                        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-pseudo-class-any-link
                        // Since Edge 79.
                    // 'any-link-pseudo-class': true,

                        // https://github.com/shrpne/postcss-page-break
                    // 'break-properties': true,

                        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-color-functional-notation
                        // Since Safari 12.1 and Edge 79.
                    // 'color-functional-notation': true,

                        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-focus-visible
                        // No by Safary.
                        // Requires polyfill https://github.com/WICG/focus-visible
                    // 'focus-visible-pseudo-class': false,

                        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-focus-within
                        // Since Edge 79.
                        // Requires polyfill https://github.com/jsxtools/focus-within
                    // 'focus-within-pseudo-class': false,

                        // https://github.com/postcss/postcss-font-variant
                        // Since Edge 79.
                    // 'font-variant-property': true,

                        // https://github.com/MattDiMu/postcss-replace-overflow-wrap
                    // 'overflow-wrap-property': true,

                        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-place
                        // Since Edge 79.
                    // 'place-properties': true,
                    ...pluginPresetEnvOptions?.features,
                },
            }),
        ],
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface PostcssConfigOptions {
    mode?: undefined | string
    workDir?: undefined | string
    pluginPresetEnvOptions?: undefined | PostcssPluginPresetEnv.pluginOptions
}
