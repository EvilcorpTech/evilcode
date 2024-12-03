import {compute} from '@eviljs/std/fn-compute'
import type {FnArgs, Io} from '@eviljs/std/fn-type'
import {defineRouteParams, type RouteParamOptions, type RouteParamsDefinition} from './route.js'

export function defineRoutePath<const R extends string, A extends FnArgs>(
    route: R,
    patternComputed: RegExp | Array<RegExp> | Io<R, RegExp | Array<RegExp>>,
    encode: (route: R, ...args: A) => string,
): RoutePathDefinition<R, A>
export function defineRoutePath<const R extends string, A extends FnArgs, P extends Record<string, RouteParamOptions>>(
    route: R,
    patternComputed: RegExp | Array<RegExp> | Io<R, RegExp | Array<RegExp>>,
    encode: (route: R, ...args: A) => string,
    params: P,
): RoutePathDefinition<R, A, RouteParamsDefinition<P>>
export function defineRoutePath<const R extends string, A extends FnArgs, P extends Record<string, RouteParamOptions>>(
    route: R,
    patternComputed: RegExp | Array<RegExp> | Io<R, RegExp | Array<RegExp>>,
    encode: (route: R, ...args: A) => string,
    params?: P,
): RoutePathDefinition<R, A, undefined | RouteParamsDefinition<P>> {
    function encodeRoutePathArgs(...args: A): string {
        return encode(route, ...args)
    }

    encodeRoutePathArgs.link  = encodeRoutePathArgs
    encodeRoutePathArgs.path = route
    encodeRoutePathArgs.pattern = compute(patternComputed, route)
    encodeRoutePathArgs.params = params ? defineRouteParams(params) : undefined

    return encodeRoutePathArgs
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RoutePathDefinition<R extends string, A extends FnArgs, P = undefined> {
    (...args: A): string
    link(...args: A): string
    path: R
    pattern: RegExp | Array<RegExp>
    params: P
}
