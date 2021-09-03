import HtmlWebpackPlugin, {HtmlTagObject} from 'html-webpack-plugin'
import {Compilation, Compiler} from 'webpack'

type HtmlWebpackPluginClass = typeof HtmlWebpackPlugin

export class HtmlStyleInlinePlugin {
    readonly HtmlWebpackPlugin: HtmlWebpackPluginClass
    readonly options?: undefined | HtmlStyleInlinePluginOptions

	constructor(HtmlWebpackPlugin: HtmlWebpackPluginClass, options?: undefined | HtmlStyleInlinePluginOptions) {
        this.HtmlWebpackPlugin = HtmlWebpackPlugin
		this.options = options
	}

	apply(compiler: Compiler) {
        const {options} = this

		compiler.hooks.compilation.tap('HtmlStyleInlinePlugin', (compilation) => {
			function mapTag(tag: HtmlTagObject) {
				return createTagInline(compiler, compilation, tag, options)
			}

			const hooks = this.HtmlWebpackPlugin.getHooks(compilation)

            hooks.alterAssetTags.tap('HtmlStyleInlinePlugin', (assets) => {
                assets.assetTags.styles = assets.assetTags.styles.map(mapTag)
                return assets
			})

            const shouldDelete = options?.delete ?? true

            if (! shouldDelete) {
                return
            }

            const tests = options?.tests ?? []

			hooks.afterEmit.tap('HtmlStyleInlinePlugin', (emitted) => {
				const filenames = Object.keys(compilation.assets)

                for (const filename of filenames) {
                    const shouldBeDeleted = tests.some(it => filename.match(it))

					if (shouldBeDeleted) {
						delete compilation.assets[filename]
					}
				}

                return emitted
			})
		})
	}
}

function createTagInline(
    compiler: Compiler,
    compilation: Compilation,
    tag: HtmlTagObject,
    options?: undefined | HtmlStyleInlinePluginOptions,
): HtmlTagObject
{
	if (tag.tagName !== 'link') {
		return tag
	}
    if (! tag.attributes) {
		return tag
	}
    if (tag.attributes.rel !== 'stylesheet') {
		return tag
	}
    if (! tag.attributes.href) {
		return tag
	}

    const publicPathString = compiler.options.output.publicPath as string
    const publicPath = compiler.options.output.publicPath
        ? (publicPathString + '/').replaceAll('//', '/')
        : '/'

    const filename = (tag.attributes.href as string)
        .replace(publicPath, '')
        .split('?')[0] ?? ''
    const tests = options?.tests ?? []
    const fileDoesMatch = tests.some(it => filename.match(it))

    if (! fileDoesMatch) {
		return tag
	}

	const asset = compilation.assets[filename]

	if (! asset) {
		return tag
	}

	return {
        tagName: 'style',
        attributes: {},
        innerHTML: asset.source() as string,
        voidTag: false,
        meta: {plugin: 'HtmlStyleInlinePlugin'},
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface HtmlStyleInlinePluginOptions {
    delete?: undefined | boolean
    tests?: undefined | Array<string | RegExp>
}
