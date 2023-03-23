import PostcssPluginImport from 'postcss-import'
import PostcssPluginPresetEnv from 'postcss-preset-env'

export default function createPostcssConfig(ctx) {
    // const isProductionMode = ctx.env === 'production'
    // const isDevelopmentMode = ! isProductionMode

    return {
        plugins: [
            PostcssPluginImport(), // https://github.com/postcss/postcss-import
            PostcssPluginPresetEnv({
                stage: false,
                autoprefixer: true,
                features: {
                    'custom-media-queries': true, /* https://github.com/postcss/postcss-custom-media */
                    'logical-properties-and-values': true, /* https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-logical */
                    'media-query-ranges': true, /* https://github.com/postcss/postcss-media-minmax */
                    'nesting-rules': true, /* https://github.com/csstools/postcss-nesting */
                },
            }),
        ],
    }
}
