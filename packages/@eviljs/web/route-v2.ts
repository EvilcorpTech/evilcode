import type {FnArgs} from '@eviljs/std/fn.js'
import type {RoutePatterns, RouteArgs} from './route.js'
import type {RouterRouteChangeParamsDict, RouterRouteParams} from './router.js'

export * from './route.js'

export function defineRoutePath<A extends RouteArgs = []>(
    options: RoutePathCodecOptions<A>,
): RoutePathCodec<A> {
    return {
        patterns: options.patterns,
        encode: options.encode,
    }
}

export function defineRouteParam<
    const N extends string,
    EA extends FnArgs,
    DA extends FnArgs,
    O,
>(options: RouteParamCodecOptions<N, EA, DA, O>): RouteParamCodec<N, EA, DA, O> {
    return {
        name: options.name,
        encode: options.encode.bind(options.name),
        decode: options.decode.bind(options.name),
        pick: options.pick ?? ((params) => {
            return params?.[options.name]
        }),
        omit: options.omit ?? ((params) => {
            const {[options.name]: omittedParam, ...otherParams} = params ?? {}
            return otherParams
        }),
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RoutePathCodecOptions<A extends RouteArgs = []> extends RoutePathCodec<A> {
}

export interface RoutePathCodec<A extends RouteArgs> {
    patterns: RoutePatterns
    encode(...args: A): string
}

export interface RouteParamCodecOptions<
    N extends string,
    EA extends FnArgs,
    DA extends FnArgs,
    O
> {
    name: N
    encode(this: N, ...args: EA): RouterRouteChangeParamsDict
    decode(this: N, params: RouterRouteParams, ...args: DA): O
    pick?: undefined | ((params: RouterRouteParams) => undefined | string)
    omit?: undefined | ((params: RouterRouteParams) => RouterRouteParams)
}

export interface RouteParamCodec<
    N extends string,
    EA extends FnArgs,
    DA extends FnArgs,
    O
> {
    name: N
    encode(...args: EA): RouterRouteChangeParamsDict
    decode(params: RouterRouteParams, ...args: DA): O
    pick(params: RouterRouteParams): undefined | string
    omit(params: RouterRouteParams): RouterRouteParams
}
