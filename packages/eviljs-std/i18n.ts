import {escapeRegexp} from './regexp.js'
import {throwInvalidArgument} from './throw.js'
import {isArray, isFunction, isObject} from './type.js'

export const DefaultSymbol = '@'
export const SpacesRegexp = /\s+/g

export function createI18n
    <L extends string, L1 extends L, L2 extends L, K extends string>
    (spec: I18nSpec<L, L1, L2, K>)
{
    const {locale, fallbackLocale, messages, symbol} = spec

    const self: I18n<L, K> = {
        locale,
        fallbackLocale,
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
        symbol: symbol ?? DefaultSymbol,
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
    (i18n: I18n<L, K>, id: K, values?: MsgValues, options?: unknown)
{
    const {locale, fallbackLocale, messages} = i18n

    if (! id) {
        return id
    }

    const msg = (() => {
        const localeMsg: undefined | string | MsgComputer = messages[locale]?.[id]
        const fallbackMsg: undefined | string | MsgComputer = messages[fallbackLocale]?.[id]

        if (localeMsg) {
            return localeMsg
        }
        if (fallbackMsg) {
            return fallbackMsg
        }
        return id
    })()

    const text = isFunction(msg)
        // The message function handles the interpolation on its own.
        ? (() => {
            try {
                return msg(values, options)
            }
            catch (error) {
                return id
            }
        })()
        // The message should be a string. We need to interpolate the values.
        : i18n.format(msg as K, values)

    const tidyText = text.trim().replace(SpacesRegexp, ' ')

    return tidyText
}

export function t
    <L extends string = string, K extends string = string>
    (i18n: I18n<L, K>, id: TemplateStringsArray, ...substitutions: Array<any>)
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
    (i18n: I18n<L, K>, template: K, values?: MsgValues)
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
        : throwInvalidArgument(
            '@eviljs/std/i18n.format(i18n, template, ~~values~~):\n'
            + `values must be Array | Object, given "${values}".`
        )

    let string: string = template

    for (const token in dict) {
        const value = dict[token]
        const tokenRegexp = regexpFromToken(token, i18n.symbol, i18n.__regexpCache__)
        string = string.replace(tokenRegexp, String(value))
    }

    return string
}

export function regexpFromToken(token: string, symbol: string, cache: Record<string, RegExp>) {
    if (! cache[token]) {
        cache[token] = new RegExp(`[${symbol}]{\\s*${escapeRegexp(token)}\\s*}`, 'g')
    }

    return cache[token]!
}

export function defineMessages
    <M extends I18nMessages>
    (messages: M): M
{
    return messages
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18n<L extends string = string, K extends string = string> {
    locale: L
    fallbackLocale: L
    messages: I18nMessages<L, K>
    symbol: string
    __regexpCache__: Record<string, RegExp>
    translate(id: K, values?: MsgValues, options?: unknown): string
    t(id: TemplateStringsArray, ...substitutions: Array<any>): string
    format(template: K, values?: MsgValues): string
}

export interface I18nSpec<L extends string, L1 extends L, L2 extends L, K extends string> {
    locale: L1
    fallbackLocale: L2
    messages: I18nMessages<L, K>
    symbol?: string
}

export type I18nMessages<L extends string = string, K extends string = string, C = MsgComputer> = {
    [key in L]: Partial<{
        [key in K]: string | C
    }>
}

export interface MsgComputer<V extends MsgValues = any, O = unknown> {
    (values?: V, options?: O): string
}

export type MsgValues =
    | Array<string | number>
    | Record<string | number, string | number>

// interface I18nTemplateKey<K extends string> extends ReadonlyArray<K> {
//     readonly raw: readonly K[];
// }

export type I18nLocaleOf<M extends I18nSpec<string, string, string, string>> = M extends I18nSpec<infer L, any, any, string>
    ? L
    : string

export type I18nKeyOf<M extends I18nSpec<string, string, string, string>> = M extends I18nSpec<string, any, any, infer K>
    ? K
    : string
