import {mapSome} from '@eviljs/std/fn.js'
import {omitObjectProp, pickObjectProp} from '@eviljs/std/object.js'
import type {RouteArgs, RoutePatterns} from './route.js'
import type {RouterRouteParams} from './router.js'
import type {UrlParamsDictValue} from './url-params.js'

export * from './route.js'

export function defineRoutePath<A extends RouteArgs = []>(
    options: RoutePathCodecOptions<A>,
): RoutePathCodec<A> {
    return {
        patterns: options.patterns,
        encode: options.encode,
    }
}

export function defineRouteParamCodec<const N extends string, EI, EO extends UrlParamsDictValue, O>(
    options: RouteParamCodecOptions<N, EI, EO, O>,
): RouteParamCodec<N, EI, EO, O> {
    const name = options.name

    return {
        name: name,
        encode(value) {
            return options.encode(value)
        },
        encodeAsParams(value) {
            return {
                [name]: mapSome(value, options.encode),
            } as {[key in N]: undefined | null | EO}
        },
        decode(valueEncoded) {
            return options.decode(valueEncoded)
        },
        decodeFromParams(params) {
            if (! params) {
                return
            }
            if (! (name in params)) {
                return
            }
            return options.decode(params[name])
        },
        select(params) {
            if (! params) {
                return
            }
            return params[name]
        },
        pick(params) {
            if (! params) {
                return
            }
            return pickObjectProp(params, name)
        },
        omit(params) {
            if (! params) {
                return
            }
            return omitObjectProp(params, name)
        },
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RoutePathCodecOptions<A extends RouteArgs = []> extends RoutePathCodec<A> {
}

export interface RoutePathCodec<A extends RouteArgs> {
    patterns: RoutePatterns
    encode(...args: A): string
}

export interface RouteParamCodecOptions<N extends string, EI, EO extends UrlParamsDictValue, O> {
    name: N
    encode(value: EI): EO
    decode(valueEncoded: undefined | string): O
}

export interface RouteParamCodec<N extends string, EI, EO extends UrlParamsDictValue, DO> {
    name: N
    encode(value: EI): EO
    encodeAsParams(value: undefined | null | EI): {[key in N]: undefined | null | EO}
    decode(valueEncoded: undefined | string): undefined | DO
    decodeFromParams(params: undefined | RouterRouteParams): undefined | DO
    select(params: undefined | RouterRouteParams): undefined | string
    pick(params: undefined | RouterRouteParams): undefined | RouterRouteParams
    omit(params: undefined | RouterRouteParams): undefined | RouterRouteParams
}
