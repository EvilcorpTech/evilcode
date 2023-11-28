import {escapeRegexp} from './regexp.js'
import {isArray, isFunction, isObject} from './type.js'

export const I18nSymbolDefault = '@'

export function createI18n
    <L extends string, L1 extends L, L2 extends L, K extends string>
    (spec: I18nSpec<L, L1, L2, K>)
{
    const {locale, localeFallback, messages, symbol} = spec

    const self: I18n<L, K> = {
        locale,
        localeFallback,
        messages,
        // `messages` must have a structure like this:
        // {
        //     en: {
        //         'total': '@{ 0 } item of @{ 1 }',
        //         'count': '@{ current } item of @{ total }',
        //         'sum'(values) {
        //             return `${values[0]} item of ${values[1]}`
        //         },
        //     },
        //     it: {...},
        //     ...
        // }
        symbol: symbol ?? I18nSymbolDefault,
        __regexpCache__: {},
        translate(...args) {
            return translate(self, ...args)
        },
        t(...args) {
            return t(self, ...args)
        },
        format(...args) {
            return format(self, ...args)
        },
    }

    return self
}

/*
* Converts a string in its translated counterpart.
*
* EXAMPLE
*
* translate(i18n, 'Hello world')
* translate(i18n, '@{ 0 } items of @{ 1 }', [4, 8])
* translate(i18n, '@{ count } items of @{ total }', {count: 4, total: 8})
*/
export function translate
    <L extends string = string, K extends string = string>
    (
        i18n: I18n<L, K>,
        id: K,
        values?: undefined | I18nMessageValues,
        options?: undefined | unknown,
    )
{
    const {locale, localeFallback, messages} = i18n

    if (! id) {
        return id
    }

    const msg = undefined
        ?? messages[locale]?.[id]
        ?? messages[localeFallback]?.[id]
        ?? id

    const text = isFunction(msg)
        // The message function handles the interpolation on its own.
        ? msg(values, options)
        // The message should be a string. We need to interpolate the values.
        : i18n.format(msg as K, values)

    return text
}

export function t
    <L extends string = string, K extends string = string>
    (
        i18n: I18n<L, K>,
        id: TemplateStringsArray,
        ...substitutions: Array<unknown>
    )
{
    const template = String.raw(id, ...substitutions)

    return i18n.translate(template as K)
}

/*
* Interpolates values inside a string.
*
* EXAMPLE
*
* format(i18n, '@{ 0 } items of @{ 1 }', [4, 8])
* format(i18n, '@{ count } items of @{ total }', {count: 4, total: 8})
*/
export function format
    <L extends string = string, K extends string = string>
    (
        i18n: I18n<L, K>,
        template: K,
        values?: undefined | I18nMessageValues,
    )
{
    if (! values) {
        // There are no arguments to interpolate. Optimization.
        return template
    }

    const dict =
        isArray(values)
            // It is an Array. We must convert it to an Object.
            ? values.reduce((dict, it, idx) => {
                dict[idx] = it

                return dict
            }, {} as Record<string | number, string | number>)
        : isObject(values)
            // Nothing to do.
            ? values
        : undefined

    if (! dict) {
        console.error(
            '@eviljs/std/i18n.format(i18n, template, ~~values~~):\n'
            + `values must be Array | Object, given "${values}".`
        )
        return template
    }

    let string: string = template

    for (const token in dict) {
        const value = dict[token]
        const tokenRegexp = i18nRegexpFromToken(token, i18n.symbol, i18n.__regexpCache__)
        string = string.replaceAll(tokenRegexp, String(value))
    }

    return string
}

export function i18nRegexpFromToken(token: string, symbol: string, cache: Record<string, RegExp>): RegExp {
    if (! cache[token]) {
        cache[token] = new RegExp(`[${symbol}]{\\s*${escapeRegexp(token)}\\s*}`, 'g')
    }

    return cache[token]!
}

export function defineI18n<L extends string, L1 extends L, L2 extends L, K extends string>(
    spec: I18nSpec<L, L1, L2, K>,
): I18nSpec<L, L1, L2, K> {
    return spec
}

export function defineMessages<L extends string, K extends string>(
    messages: I18nMessages<L, K>,
): I18nMessages<L, K> {
    return messages
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18n<L extends string = string, K extends string = string> {
    locale: L
    localeFallback: L
    messages: I18nMessages<L, K>
    symbol: string
    __regexpCache__: Record<string, RegExp>
    translate(id: K, values?: undefined | I18nMessageValues, options?: undefined | unknown): string
    t(id: TemplateStringsArray, ...substitutions: Array<any>): string
    format(template: K, values?: undefined | I18nMessageValues): string
}

export interface I18nSpec<L extends string, L1 extends L, L2 extends L, K extends string> {
    locale: L1
    localeFallback: L2
    messages: I18nMessages<L, K>
    symbol?: undefined | string
}

export type I18nMessages<
    L extends string = string,
    K extends string = string,
> = Record<L, undefined | Record<K, undefined | string | I18nMessageComputable>>

export interface I18nMessageComputable {
    (...args: Array<any>): string
}

export type I18nMessageValues =
    | Array<string | number>
    | Record<string | number, string | number>

// interface I18nTemplateKey<K extends string> extends ReadonlyArray<K> {
//     readonly raw: readonly K[];
// }

export type I18nLocaleOf<M extends I18nSpec<string, string, string, string>> =
    M extends I18nSpec<infer L, any, any, string>
        ? L
        : string

export type I18nKeyOf<M extends I18nSpec<string, string, string, string>> =
    M extends I18nSpec<string, any, any, infer K>
        ? K
        : string
