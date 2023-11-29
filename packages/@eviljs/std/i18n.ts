import {escapeRegexp} from './regexp.js'
import {isFunction, isString} from './type.js'

export const I18nSymbolDefault = '@'

export function createI18n<L extends string, K extends I18nMessageKey>(spec: I18nDefinition<L, K>) {
    const {locale, localeFallback, messages, symbol} = spec

    const self: I18n<L, K> = {
        __cache__: {},
        locale,
        localeFallback,
        messages,
        symbol: symbol ?? I18nSymbolDefault,
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

    return self
}

/*
* Converts a string in its translated counterpart.
*
* EXAMPLE
*
* translate(i18n, 'Hello world')
* translate(i18n, '@{0} items of @{1}', [4, 8])
* translate(i18n, '@{count} items of @{total}', {count: 4, total: 8})
*/
export function translate<K extends I18nMessageKey = I18nMessageKey>(
    i18n: I18n<string, K>,
    key: K,
    values?: undefined | I18nMessageArgs,
    options?: undefined | unknown,
): string | K {
    const {locale, localeFallback, messages} = i18n

    const msg = undefined
        ?? messages[locale]?.[key]
        ?? messages[localeFallback]?.[key]
        ?? key

    if (isString(msg)) {
        // We need to interpolate the values inside the string.
        return format(i18n, msg, values)
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
* const tt = t.bind(i18n)
* tt`Hello World!'
*/
export function t(
    i18n: I18n,
    strings: TemplateStringsArray,
    ...substitutions: Array<I18nMessageArgValue>
): string {
    const template = String.raw({raw: strings}, ...substitutions)

    return translate(i18n, template)
}

/*
* Interpolates values inside a string.
*
* EXAMPLE
*
* format(i18n, '@{0} items of @{1}', [4, 8])
* format(i18n, '@{count} items of @{total}', {count: 4, total: 8})
*/
export function format(
    i18n: I18n,
    key: string,
    args?: undefined | I18nMessageArgs,
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
        const argKeyRegexp = i18nRegexpFromToken(argKey, i18n.symbol, i18n.__cache__)
        keyFormatted = keyFormatted.replaceAll(argKeyRegexp, String(argValue))
    }

    return keyFormatted
}

export function i18nRegexpFromToken(token: I18nMessageArgKey, symbol: string, cache: Record<string, RegExp>): RegExp {
    const tokenCached = cache[token]

    if (tokenCached) {
        return tokenCached
    }

    const tokenEscaped = isString(token)
        ? escapeRegexp(token)
        : token
    const tokenRegexp = new RegExp(`[${symbol}]{\\s*${tokenEscaped}\\s*}`, 'g')

    cache[token] = tokenRegexp

    return tokenRegexp
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18n<L extends string = string, K extends I18nMessageKey = I18nMessageKey> {
    __cache__: Record<string, RegExp>
    locale: L
    localeFallback: L
    messages: I18nMessages<L, K>
    symbol: string
}

export interface I18nDefinition<L extends string, K extends I18nMessageKey, L1 extends L = L, L2 extends L = L> {
    locale: L1
    localeFallback: L2
    messages: I18nMessages<L, K>
    symbol?: undefined | string
}

export type I18nMessages<
    L extends string = string,
    K extends I18nMessageKey = I18nMessageKey,
> =
    Partial<Record<
        L, // Locale.
        undefined | Partial<Record<
            K, // Message Key.
            undefined | string | I18nMessageComputable
        >>
    >>

export interface I18nMessageComputable {
    (...args: Array<any>): string
}

export type I18nMessageKey = string | number
export type I18nMessageArgKey = string | number
export type I18nMessageArgValue = string | number

export type I18nMessageArgs =
    | Array<I18nMessageArgValue>
    | Record<I18nMessageArgKey, I18nMessageArgValue>

export type I18nLocaleOf<D extends I18nDefinition<string, string>> =
    D extends I18nDefinition<infer L, string>
        ? L
        : string

export type I18nKeyOf<D extends I18nDefinition<string, string>> =
    D extends I18nDefinition<string, infer K>
        ? K
        : string
