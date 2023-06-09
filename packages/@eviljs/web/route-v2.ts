import type {FnArgs} from '@eviljs/std/fn.js'
import {asArray} from '@eviljs/std/type.js'
import type {QueryParamsDictKey} from './query.js'
import type {RoutePatternArgs} from './route.js'
import type {RouterRouteChangeParamsDict, RouterRouteParams} from './router.js'

export * from './route.js'

export function defineRoutePath<A extends RoutePatternArgs = []>(
    options: RoutePathOptions<A>,
): RoutePathDefinition<A> {
    return {
        match: asArray(options.match),
        encode: options.encode,
    }
}

export function defineRouteParam<
    const N extends QueryParamsDictKey,
    A extends FnArgs,
    O,
>(options: RouteParamOptions<N, A, O>): RouteParamDefinition<N, A, O> {
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

export interface RoutePathOptions<A extends RoutePatternArgs = []> extends Omit<RoutePathDefinition<A>, 'match'> {
    match: string | [string, ...Array<string>]
}

export interface RoutePathDefinition<A extends RoutePatternArgs> {
    match: Array<string>
    encode(...args: A): string
}

export interface RouteParamOptions<N extends QueryParamsDictKey, A extends FnArgs, O> {
    name: N
    encode(this: N, ...args: A): RouterRouteChangeParamsDict
    decode(this: N, params: RouterRouteParams): O
    omit?: undefined | ((params: RouterRouteParams) => RouterRouteParams)
}

export interface RouteParamDefinition<N extends QueryParamsDictKey, A extends FnArgs, O> {
    name: N
    encode(...args: A): RouterRouteChangeParamsDict
    decode(params: RouterRouteParams): O
    omit(params: RouterRouteParams): RouterRouteParams
}
