function createBabelConfig(projectDir: string, options?: BabelConfigOptions) {
    const {mode} = options ?? {}
    // const isProductionMode = (mode ?? process.env.NODE_ENV) === 'production'

    return {
        presets: [
            [require.resolve('@babel/preset-react'), {
                'runtime': 'automatic', // React 17.
                'importSource': 'react', // React 17.
                'useSpread': true, // Uses the native spread operator.
            }],
            [require.resolve('@babel/preset-typescript'), {
                isTSX: true,
                allExtensions: true,
            }],
        ],
        plugins: [
            // Language Features ///////////////////////////////////////////////////
            require.resolve('@babel/plugin-syntax-dynamic-import'),
            require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'), // STANDARD: a?.b ?? c
            require.resolve('@babel/plugin-proposal-numeric-separator'), // STAGE 4: 1_000_000
            require.resolve('@babel/plugin-proposal-optional-chaining'), // STANDARD: a?.b?.c?.()?.[1]
        ],
    }
}

module.exports.createBabelConfig = createBabelConfig

// Types ///////////////////////////////////////////////////////////////////////

export interface BabelConfigOptions {
    mode?: string
}
