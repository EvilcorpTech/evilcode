import type {FnArgs} from '@eviljs/std/fn.js'
import type {RoutePathTest, RoutePatternArgs} from './route.js'
import type {RouterRouteChangeParamsDict, RouterRouteParams} from './router.js'

export * from './route.js'

export function defineRoutePath<A extends RoutePatternArgs = []>(
    options: RoutePathCodecOptions<A>,
): RoutePathCodec<A> {
    return {
        match: options.match,
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
        omit: options.omit ?? ((params) => {
            const {[options.name]: omittedParam, ...otherParams} = params ?? {}
            return otherParams
        }),
    }
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RoutePathCodecOptions<A extends RoutePatternArgs = []> extends RoutePathCodec<A> {
}

export interface RoutePathCodec<A extends RoutePatternArgs> {
    match: RoutePathTest
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
    omit(params: RouterRouteParams): RouterRouteParams
}
