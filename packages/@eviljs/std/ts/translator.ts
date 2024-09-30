import {escapeRegexp} from './regexp.js'
import {isFunction, isString} from './type-is.js'

export const TranslatorSymbolDefault = '@'

export function createTranslator<L extends string, K extends TranslatorMessageKey>(spec: TranslatorDefinition<L, K>): Translator<L, K> {
    const {locale, localeFallback, messages, symbol} = spec

    return {
        __cache__: {},
        locale,
        localeFallback,
        messages,
        symbol: symbol ?? TranslatorSymbolDefault,
        // `messages` should have a structure like:
        // {
        //     en: {
        //         0: 'Hello!,
        //         'msg:1': 'Hello World!,
        //         'sum': (args) => `${args[0]} item of ${args[1]}`,
        //         'count': (args) => '@{args.current} item of @{args.total}',
        //     },
        //     it: {},
        //     ...
        // }
    }
}

/*
* Converts a string in its translated counterpart.
*
* EXAMPLE
*
* translate(translator, 'Hello world')
* translate(translator, '@{0} items of @{1}', [4, 8])
* translate(translator, '@{count} items of @{total}', {count: 4, total: 8})
*/
export function translate<K extends TranslatorMessageKey = TranslatorMessageKey>(
    translator: Translator<string, K>,
    key: K,
    values?: undefined | TranslatorMessageArgs,
    options?: undefined | unknown,
): string | K {
    const {locale, localeFallback, messages} = translator

    const msg: TranslatorMessageKey | TranslatorMessageComputable = (
        messages[locale]?.[key]
        ?? messages[localeFallback]?.[key]
        ?? key
    )

    if (isString(msg)) {
        // We need to interpolate the values inside the string.
        return format(translator, msg, values)
    }
    if (isFunction(msg)) {
        // The message function handles the interpolation on its own.
        return msg(values, options) ?? key
    }
    return msg as K
}

/*
* Translates a string using template syntax.
*
* EXAMPLE
*
* const tt = t.bind(translator)
* tt`Hello World!'
*/
export function t(
    translator: Translator,
    strings: TemplateStringsArray,
    ...substitutions: Array<TranslatorMessageArgValue>
): string {
    const template = String.raw({raw: strings}, ...substitutions)

    return translate(translator, template)
}

/*
* Interpolates values inside a string.
*
* EXAMPLE
*
* format(translator, '@{0} items of @{1}', [4, 8])
* format(translator, '@{count} items of @{total}', {count: 4, total: 8})
*/
export function format(
    translator: Translator,
    key: string,
    args?: undefined | TranslatorMessageArgs,
): string {
    if (! args) {
        // There are no arguments to interpolate. Optimization.
        return key
    }

    let keyFormatted: string = key

    for (const it in args) {
        // When values is an array, token is the index.
        // When values is an object, token is the property.
        const argKey = it as number | string
        const argValue = args[argKey as any]
        const argKeyRegexp = buildTranslatorRegexp(argKey, translator.symbol, translator.__cache__)
        keyFormatted = keyFormatted.replaceAll(argKeyRegexp, String(argValue))
    }

    return keyFormatted
}

export function buildTranslatorRegexp(token: TranslatorMessageArgKey, symbol: string, cache: Record<string, RegExp>): RegExp {
    const tokenCached = cache[token]
        ?? new RegExp(`[${symbol}]{\\s*${escapeRegexp(String(token))}\\s*}`, 'g')

    cache[token] ??= tokenCached

    return tokenCached
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Translator<L extends string = string, K extends TranslatorMessageKey = TranslatorMessageKey> {
    __cache__: Record<string, RegExp>
    locale: L
    localeFallback: L
    messages: TranslatorMessages<L, K>
    symbol: string
}

export interface TranslatorDefinition<L extends string, K extends TranslatorMessageKey, L1 extends L = L, L2 extends L = L> {
    locale: L1
    localeFallback: L2
    messages: TranslatorMessages<L, K>
    symbol?: undefined | string
}

export type TranslatorGeneric = Translator<string, TranslatorMessageKey>

export type TranslatorMessages<
    L extends string = string,
    K extends TranslatorMessageKey = TranslatorMessageKey,
> =
    Partial<Record<
        L, // Locale.
        undefined | Partial<Record<
            K, // Message Key.
            undefined | string | TranslatorMessageComputable
        >>
    >>

export interface TranslatorMessageComputable {
    (...args: Array<any>): string
}

export type TranslatorMessageKey = string | number
export type TranslatorMessageArgKey = string | number
export type TranslatorMessageArgValue = string | number

export type TranslatorMessageArgs =
    | Array<TranslatorMessageArgValue>
    | Record<TranslatorMessageArgKey, TranslatorMessageArgValue>

export type TranslatorLocaleOf<D extends TranslatorDefinition<string, string>> =
    D extends TranslatorDefinition<infer L, string>
        ? L
        : string

export type TranslatorMessageKeyOf<D extends TranslatorDefinition<string, string>> =
    D extends TranslatorDefinition<string, infer K>
        ? K
        : string
