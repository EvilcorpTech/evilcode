 // @ts-ignore
import BabelPluginProposalDecorators from '@babel/plugin-proposal-decorators' // @ts-ignore
import BabelPluginProposalNullishCoalescingOperator from '@babel/plugin-proposal-nullish-coalescing-operator' // @ts-ignore
import BabelPluginProposalNumericSeparator from '@babel/plugin-proposal-numeric-separator' // @ts-ignore
import BabelPluginProposalOptionalChaining from '@babel/plugin-proposal-optional-chaining' // @ts-ignore
import BabelPluginSyntaxDynamicImport from '@babel/plugin-syntax-dynamic-import' // @ts-ignore
import BabelPluginTransformRuntime from '@babel/plugin-transform-runtime' // @ts-ignore
import BabelPresetReact from '@babel/preset-react' // @ts-ignore
import BabelPresetTypescript from '@babel/preset-typescript' // @ts-ignore
import BabelReactRefresh from 'react-refresh/babel'

export const BabelPlugins = {
    BabelPluginProposalDecorators,
    BabelPluginProposalNullishCoalescingOperator,
    BabelPluginProposalNumericSeparator,
    BabelPluginProposalOptionalChaining,
    BabelPluginSyntaxDynamicImport,
    BabelPluginTransformRuntime,
    BabelPresetReact,
    BabelPresetTypescript,
    BabelReactRefresh,
}

export default createBabelConfig()

export function createBabelConfig(options?: BabelConfigOptions) {
    const mode = options?.mode ?? process.env.NODE_ENV
    // const workDir = options?.workDir ?? process.cwd()
    const isProductionMode = mode === 'production'
    const isDevelopmentMode = ! isProductionMode

    return {
        presets: [
            [BabelPresetReact, {
                'runtime': 'automatic', // React 17.
                'importSource': 'react', // React 17.
                'useSpread': true, // Uses the native spread operator.
            }],
            [BabelPresetTypescript, {
                isTSX: true,
                allExtensions: true,
            }],
        ],
        plugins: [
            isDevelopmentMode && BabelReactRefresh,

            BabelPluginTransformRuntime,

            // Language Features ///////////////////////////////////////////////////
            BabelPluginSyntaxDynamicImport, // import() (STANDARD)
            [BabelPluginProposalDecorators, {version: '2021-12'}],
            BabelPluginProposalNullishCoalescingOperator, // a?.b ?? c (STANDARD)
            BabelPluginProposalNumericSeparator, // 1_000_000 (STANDARD)
            BabelPluginProposalOptionalChaining, // a?.b?.c?.()?.[1] (STANDARD)
        ].filter(Boolean),
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface BabelConfigOptions {
    mode?: undefined | string
    workDir?: undefined | string
}
