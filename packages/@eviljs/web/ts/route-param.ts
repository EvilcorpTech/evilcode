import {mapSome} from '@eviljs/std/fn-monad'
import {mapObjectValue, omitObjectProp, pickObjectProp} from '@eviljs/std/object'
import type {RouterRouteParams} from './router.js'
import type {UrlParamsDictValue} from './url-params.js'

export function defineRouteParam<const N extends string, EI, DO extends undefined | EI>(
    name: N,
    encode: (value: EI) => UrlParamsDictValue,
    decode: (valueEncoded: undefined | string) => DO,
): RouteParamDefinition<N, EI, DO> {
    const self: RouteParamDefinition<N, EI, DO> = {
        name: name,
        encode(value) {
            return encode(value)
        },
        decode(valueEncoded) {
            return decode(valueEncoded)
        },
        select(params) {
            return params?.[name]
        },
        selectDecode(params) {
            return mapSome(self.select(params), decode)
        },
        pack(value) {
            return {
                [name]: mapSome(value, self.encode),
            } as {[key in N]: UrlParamsDictValue}
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

    return self
}

export function defineRouteParams<P extends Record<string, RouteParamOptions<string, any, any>>>(specs: P): RouteParamsDefinition<P> {
    return mapObjectValue(specs, spec =>
        defineRouteParam(spec.name, spec.encode, spec.decode)
    ) as RouteParamsDefinition<P>
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RouteParamDefinition<N extends string, EI, DO extends undefined | EI> {
    name: N
    encode(value: EI): UrlParamsDictValue
    decode(valueEncoded: undefined | string): DO
    select(params: undefined | RouterRouteParams): undefined | string
    selectDecode(params: undefined | RouterRouteParams): undefined | DO
    pack(value: undefined | null | EI): {[key in N]: UrlParamsDictValue}
    pick(params: undefined | RouterRouteParams): undefined | RouterRouteParams
    omit(params: undefined | RouterRouteParams): undefined | RouterRouteParams
}

export type RouteParamsDefinition<P extends Record<string, RouteParamOptions<string, any, any>>> = {
    [key in keyof P]: RouteParamDefinition<P[key]['name'], Parameters<P[key]['encode']>[0], ReturnType<P[key]['decode']>>
}

export interface RouteParamOptions<N extends string, EI, DO extends undefined | EI> {
    name: N
    encode(value: EI): UrlParamsDictValue
    decode(valueEncoded: undefined | string): DO
}
