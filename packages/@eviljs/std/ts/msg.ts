import {escapeRegexp} from './regexp.js'
import {isFunction, isString} from './type-is.js'

export const MsgSymbolDefault = '@'

export function createMsg<L extends string, K extends MsgMessageKey>(spec: MsgDefinition<L, K>): Msg<L, K> {
    const {locale, localeFallback, messages, symbol} = spec

    return {
        __cache__: {},
        locale,
        localeFallback,
        messages,
        symbol: symbol ?? MsgSymbolDefault,
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
* translate(msg, 'Hello world')
* translate(msg, '@{0} items of @{1}', [4, 8])
* translate(msg, '@{count} items of @{total}', {count: 4, total: 8})
*/
export function translate<K extends MsgMessageKey = MsgMessageKey>(
    msg: Msg<string, K>,
    key: K,
    values?: undefined | MsgMessageArgs,
    options?: undefined | unknown,
): string | K {
    const {locale, localeFallback, messages} = msg

    const message: MsgMessageKey | MsgMessageComputable = (
        messages[locale]?.[key]
        ?? messages[localeFallback]?.[key]
        ?? key
    )

    if (isString(message)) {
        // We need to interpolate the values inside the string.
        return format(msg, message, values)
    }
    if (isFunction(message)) {
        // The message function handles the interpolation on its own.
        return message(values, options) ?? key
    }
    return message as K
}

/*
* Translates a string using template syntax.
*
* EXAMPLE
*
* const tt = t.bind(msg)
* tt`Hello World!'
*/
export function t(
    msg: Msg,
    strings: TemplateStringsArray,
    ...substitutions: Array<MsgMessageArgValue>
): string {
    const template = String.raw({raw: strings}, ...substitutions)

    return translate(msg, template)
}

/*
* Interpolates values inside a string.
*
* EXAMPLE
*
* format(msg, '@{0} items of @{1}', [4, 8])
* format(msg, '@{count} items of @{total}', {count: 4, total: 8})
*/
export function format(
    msg: Msg,
    key: string,
    args?: undefined | MsgMessageArgs,
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
        const argKeyRegexp = compileMsgRegexp(argKey, msg.symbol, msg.__cache__)
        keyFormatted = keyFormatted.replaceAll(argKeyRegexp, String(argValue))
    }

    return keyFormatted
}

export function compileMsgRegexp(token: MsgMessageArgKey, symbol: string, cache: Record<string, RegExp>): RegExp {
    const tokenCached = cache[token]
        ?? new RegExp(`[${symbol}]{\\s*${escapeRegexp(String(token))}\\s*}`, 'g')

    cache[token] ??= tokenCached

    return tokenCached
}

// Types ///////////////////////////////////////////////////////////////////////

export interface Msg<L extends string = string, K extends MsgMessageKey = MsgMessageKey> {
    __cache__: Record<string, RegExp>
    locale: L
    localeFallback: L
    messages: MsgMessages<L, K>
    symbol: string
}

export interface MsgDefinition<L extends string, K extends MsgMessageKey, L1 extends L = L, L2 extends L = L> {
    locale: L1
    localeFallback: L2
    messages: MsgMessages<L, K>
    symbol?: undefined | string
}

export type MsgGeneric = Msg<string, MsgMessageKey>

export type MsgMessages<
    L extends string = string,
    K extends MsgMessageKey = MsgMessageKey,
> =
    Partial<Record<
        L, // Locale.
        undefined | Partial<Record<
            K, // Message Key.
            undefined | string | MsgMessageComputable
        >>
    >>

export interface MsgMessageComputable {
    (...args: Array<any>): string
}

export type MsgMessageKey = string | number
export type MsgMessageArgKey = string | number
export type MsgMessageArgValue = string | number

export type MsgMessageArgs =
    | Array<MsgMessageArgValue>
    | Record<MsgMessageArgKey, MsgMessageArgValue>

export type MsgLocaleOf<D extends MsgDefinition<string, string>> =
    D extends MsgDefinition<infer L, string>
        ? L
        : string

export type MsgMessageKeyOf<D extends MsgDefinition<string, string>> =
    D extends MsgDefinition<string, infer K>
        ? K
        : string
