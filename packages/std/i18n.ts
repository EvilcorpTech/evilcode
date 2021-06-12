import {throwInvalidArgument} from './error.js'
import {escapeRegExp} from './regexp.js'
import {isArray, isFunction, isObject} from './type.js'

export const DefaultSymbol = '@'
export const SpacesRegexp = /\s+/g

export function createI18n(spec: I18nSpec) {
    const {locale, fallbackLocale, messages, symbol} = spec

    const self: I18n = {
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
* translate(i18n, 'Hello world')
* translate(i18n, '@{ 0 } items of @{ 1 }', [4, 8])
* translate(i18n, '@{ count } items of @{ total }', {count: 4, total: 8})
*/
export function translate(i18n: I18n, id: string, values?: MsgValues, options?: unknown) {
    const {locale, fallbackLocale, messages} = i18n

    if (! id) {
        return id
    }

    let msg = messages[locale]?.[id]

    if (! msg && fallbackLocale) {
        msg = messages[fallbackLocale]?.[id]
    }

    if (! msg) {
        msg = id
    }

    const text = isFunction(msg)
        // The message function handles the interpolation on its own.
        ? msg(values, options)
        // The message should be a string. We need to interpolate the values.
        : i18n.format(msg, values)

    const tidyText = text.trim().replace(SpacesRegexp, ' ')

    return tidyText
}

export function t(i18n: I18n, id: TemplateStringsArray, ...substitutions: Array<any>) {
    const template = String.raw(id, ...substitutions)

    return i18n.translate(template)
}

/*
* Interpolates values inside a string.
*
* EXAMPLE
* format(i18n, '@{ 0 } items of @{ 1 }', [4, 8])
* format(i18n, '@{ count } items of @{ total }', {count: 4, total: 8})
*/
export function format(i18n: I18n, template: string, values?: MsgValues) {
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

    let string = template

    for (const token in dict) {
        const value = dict[token]
        const tokenRe = tokenAsRegexp(token, i18n.symbol, i18n.__regexpCache__)
        string = string.replace(tokenRe, String(value))
    }

    return string
}

export function tokenAsRegexp(token: string, symbol: string, cache: Record<string, RegExp>) {
    if (! cache[token]) {
        cache[token] = new RegExp(`[${symbol}]{\\s*${escapeRegExp(token)}\\s*}`, 'g')
    }

    return cache[token]!
}

export function defineMessages<V extends [] | {}>
    (messages: {
        [key: string]: {
            [key: string]: string | ((values?: V, options?: unknown) => string)
        }
    })
{
    return messages as I18nMessages
}

// Types ///////////////////////////////////////////////////////////////////////

export interface I18n {
    locale: string
    fallbackLocale: string
    messages: I18nMessages
    symbol: string
    __regexpCache__: Record<string, RegExp>
    translate(id: string, values?: MsgValues, options?: unknown): string
    t(id: TemplateStringsArray, ...substitutions: Array<any>): string
    format(template: string, values?: MsgValues): string
}

export interface I18nSpec {
    locale: string
    fallbackLocale: string
    messages: I18nMessages
    symbol?: string
}

export interface I18nMessages {
    [key: string]: {
        [key: string]: string | MsgComputer
    }
}

export interface MsgComputer {
    (values?: MsgValues, options?: unknown): string
}

export type MsgValues =
    | Array<string | number>
    | Record<string | number, string | number>
