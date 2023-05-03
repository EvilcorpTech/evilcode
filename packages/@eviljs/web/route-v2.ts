import type {FnArgs} from '@eviljs/std/fn.js'
import {mapObjectValue} from '@eviljs/std/object.js'
import {asArray, type ElementOf} from '@eviljs/std/type.js'
import type {QueryParamsDictKey} from './query.js'
import type {RouterRouteChangeParamsDict, RouterRouteParams} from './router.js'

export const RoutePathPlaceholder = '{arg}'

export function defineRoutePath<A extends RoutePatternArgs = [], L extends string = string>(defineSpec: (context: RoutePathSpecContext) => RoutePathSpec<A, L>): RoutePath<A, L> {
    const spec = defineSpec({
        arg: RoutePathPlaceholder,
        encode: encodeRoutePathArgs,
    })

    return {
        paths: mapObjectValue(spec.paths, asArray),
        encode: spec.encode ?? encodeRoutePathArgs,
    }
}

export function createDefineRoutePathStrict<L extends string>() {
    function defineRoutePathStrict<A extends RoutePatternArgs = []>(spec: (context: RoutePathSpecContext) => RoutePathSpec<A, L>): RoutePath<A, L> {
        return defineRoutePath(spec)
    }

    return defineRoutePathStrict
}

export function defineRouteParam<
    const N extends QueryParamsDictKey,
    A extends FnArgs,
    O,
>(spec: RouteParamSpec<N, A, O>): RouteParam<N, A, O> {
    return {
        name: spec.name,
        encode: spec.encode.bind(spec.name),
        decode: spec.decode.bind(spec.name),
        omit: spec.omit ?? ((params) => {
            const {[spec.name]: omittedParam, ...otherParams} = params ?? {}
            return otherParams
        }),
    }
}

function encodeRoutePathArgs(route: string, ...args: RoutePatternArgs) {
    return replaceRoutePatternPlaceholders(route, RoutePathPlaceholder, args)
}

export function replaceRoutePatternPlaceholders(template: string, placeholder: string, args: RoutePatternArgs) {
    let output = template

    for (const arg of args) {
        output = output.replace(placeholder, String(arg))
    }

    return output
}

export function replaceAllRoutePatternPlaceholders(template: string, placeholder: string, replacement: ElementOf<RoutePatternArgs>) {
    return template.replaceAll(placeholder, String(replacement))
}

// Types ///////////////////////////////////////////////////////////////////////

export type RoutePatternArgs = Array<number | string>

export interface RoutePathSpec<A extends RoutePatternArgs = [], L extends string = string> {
    paths: Record<L, string | [string, ...Array<string>]>
    encode?: undefined | ((pattern: string, ...args: A) => string)
}

export interface RoutePathSpecContext {
    arg: string
    encode(route: string, ...args: RoutePatternArgs): string
}

export interface RoutePath<A extends RoutePatternArgs, L extends string = string> {
    paths: Record<L, Array<string>>
    encode(pattern: string, ...args: A): string
}

export interface RouteParamSpec<N extends QueryParamsDictKey, A extends FnArgs, O> {
    name: N
    encode(this: N, ...args: A): RouterRouteChangeParamsDict
    decode(this: N, params: RouterRouteParams): O
    omit?: undefined | ((params: RouterRouteParams) => RouterRouteParams)
}

export interface RouteParam<N extends QueryParamsDictKey, A extends FnArgs, O> {
    name: N
    encode(...args: A): RouterRouteChangeParamsDict
    decode(params: RouterRouteParams): O
    omit(params: RouterRouteParams): RouterRouteParams
}
