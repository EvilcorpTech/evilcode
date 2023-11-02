import {throwInvalidArgument} from '@eviljs/std/throw.js'
import {isArray, isObject, isSome, isString, kindOf} from '@eviljs/std/type.js'
import type {Fetch, FetchAttributes, FetchRequestOptions} from './fetch.js'
import {HttpMethod, mergeFetchOptions, unpackResponse} from './fetch.js'

export {throwInvalidResponse} from './throw.js'

export const QueryRulesHeader = 'X-Query'

export function createQuery(fetch: Fetch): Query {
    const self: Query = {
        baseUrl: fetch.baseUrl,

        request(...args) {
            return query(fetch, ...args)
        },
        get(...args) {
            return self.request(HttpMethod.Get, ...args)
        },

        post(...args) {
            return self.request(HttpMethod.Post, ...args)
        },

        put(...args) {
            return self.request(HttpMethod.Put, ...args)
        },

        patch(...args) {
            return self.request(HttpMethod.Patch, ...args)
        },

        delete(...args) {
            return self.request(HttpMethod.Delete, ...args)
        },
    }

    Object.defineProperty(self, 'baseUrl', {
        get() {
            return fetch.baseUrl
        },
        set(value: string) {
            return fetch.baseUrl = value
        },
    })

    return self
}

/**
* @throws InvalidArgument | QueryError
**/
export async function query<T = unknown>(
    fetch: Fetch,
    method: QueryRequestMethod,
    path: string,
    queryOptions?: undefined | QueryRequestOptions,
): Promise<T> {
    const [requestPath, requestOptions] = setupQuery(path, queryOptions)

    const response = await fetch.request(method, requestPath, requestOptions)
    const content = await unpackResponse(response)

    if (! response.ok) {
        throw [response.status, content] as QueryError
    }

    return content as T
}

/**
* @throws InvalidArgument
**/
export function setupQuery(path: string, options?: undefined | QueryRequestOptions): [string, FetchRequestOptions] {
    const {params, ...otherOptions} = options ?? {}
    const paramsString = encodeQueryParams(params)

    if (! paramsString) {
        return [path, otherOptions]
    }

    const sep = path.includes('?')
        ? '&'
        : '?'
    const pathWithParams = path + sep + paramsString

    return [pathWithParams, otherOptions]
}

/**
* @throws InvalidArgument
**/
export function encodeQueryParams(params: undefined | QueryParams, options?: undefined | QueryEncodeParamsOptions): string {
    if (! params) {
        return ''
    }
    if (isString(params)) {
        // A plain string is an escape hatch and must be considered already encoded.
        // We must not use encodeURIComponent() on it.
        return params
    }
    if (isObject(params)) {
        return encodeQueryParamsObject(params, options)
    }
    if (isArray(params)) {
        return encodeQueryParamsArray(params, options)
    }

    return throwInvalidArgument(
        '@eviljs/web/query.encodeQueryParams(~~params~~):\n'
        + 'params is of an invalid type.\n'
        + `Must be a <undefined | string | object | array>, given "${params}".`
    )
}

/**
* @throws InvalidArgument
**/
export function encodeQueryParamsObject(params: QueryParamsDict, options?: undefined | QueryEncodeParamsOptions) {
    const encodeKey = options?.encodeKey ?? encodeQueryParamKey
    const encodeValue = options?.encodeValue ?? encodeQueryParamValue
    const joinParam = options?.joinParam ?? joinQueryParam
    const joinParts = options?.joinParts ?? joinQueryParamsParts

    const paramsParts = Object.entries(params).map(([key, value]) => {
        const valueType = kindOf(value, 'undefined', 'null')

        switch (valueType) {
            case 'undefined':
                // A key with an undefined value is removed.
                return
            case 'null':
                // A key with a null value is encoded without a value.
                return encodeKey(key)
            default:
                return joinParam(encodeKey(key), encodeValue(value))
        }
    }).filter(isSome)

    const encodedParams = joinParts(paramsParts)

    return encodedParams
}

/**
* @throws InvalidArgument
**/
export function encodeQueryParamsArray(params: QueryParamsList, options?: undefined | QueryEncodeParamsOptions) {
    const encodeKey = options?.encodeKey ?? encodeQueryParamKey
    const joinParts = options?.joinParts ?? joinQueryParamsParts

    const paramsParts = params.map(param => {
        const paramType = kindOf(param, 'undefined', 'null', 'boolean', 'array', 'object')

        switch (paramType) {
            case 'undefined':
            case 'null':
            case 'boolean':
                return
            case 'array':
            case 'object':
                return encodeQueryParams(param as QueryParamsList | QueryParamsDict, options)
            default:
                return encodeKey(param)
        }
    }).filter(isSome)

    const encodedParams = joinParts(paramsParts)

    return encodedParams
}

/**
* @throws InvalidArgument
**/
export function encodeQueryParamKey(name: unknown): string {
    const type = kindOf(name, 'string', 'number')

    switch (type) {
        case 'string':
            return encodeURIComponent(name as string)
        case 'number':
            return String(name)
        default:
            return throwInvalidArgument(
                '@eviljs/web/query.defaultEncodeParamName(~~name~~):\n'
                + `name is of an invalid type.\n`
                + `Must be <number | string>, given "${name}".`
            )
    }
}

/**
* @throws InvalidArgument
**/
export function encodeQueryParamValue(value: unknown): string {
    const type = kindOf(value, 'null', 'boolean', 'number', 'string', 'array', 'object')

    switch (type) {
        case 'null':
            return ''
        case 'boolean':
        case 'number':
            return String(value)
        case 'string':
            return encodeURIComponent(value as string)
        case 'array':
        case 'object':
            return encodeURIComponent(JSON.stringify(value))
        default:
            return throwInvalidArgument(
                '@eviljs/web/query.defaultEncodeParamValue(~~value~~):\n'
                + `value is of an invalid type.\n`
                + `Must be <string | number | boolean | array | object>, given "${value}".`
            )
    }
}

export function joinQueryParam(name: string, value: string) {
    return `${name}=${value}`
}

export function joinQueryParamsParts(parts: Array<string>) {
    // Without the empty strings.
    return parts.filter(Boolean).join('&')
}

/**
* @throws InvalidArgument
**/
export function mergeQueryOptions(...optionsList: Array<QueryRequestOptions>): QueryRequestOptions {
    const fetchOptionsList = optionsList.map(({params, ...fetchOptions}) => fetchOptions)
    const mergedOptions = mergeFetchOptions(...fetchOptionsList)
    let mergedOptionsParams: Array<QueryParams> = []

    for (const options of optionsList) {
        for (const key in options) {
            const optionName = key as keyof QueryRequestOptions

            switch (optionName) {
                case 'params':
                    if (options.params) {
                        mergedOptionsParams = [...mergedOptionsParams, options.params]
                    }
                break
            }
        }
    }

    return {...mergedOptions, params: mergedOptionsParams}
}

export function withQueryParams(...params: Array<QueryParams>): QueryRequestOptions {
    return {params}
}

export function withQueryRules(rules: QueryRules): QueryRequestOptions {
    return {
        headers: {
            [QueryRulesHeader]: JSON.stringify(rules),
        },
    }
}

// FIXME
/*
* Flatten a (recursive) rules structure to a flat list of rules.
*
* EXAMPLE
*
* flattenQueryRules({
*     user: [
*         'name',
*         'email',
*         {
*             skills: ['mind', 'body'],
*         },
*         friends: [0, -1],
*     ],
* })
* // {
* //     'user.name': undefined,
* //     'user.email': undefined,
* //     'user.skills': ['mind', 'body'],
* //     'user.friends': [0, -1],
* // }
*/
/**
* @throws InvalidArgument
**/
// export function flattenQueryRules(
//     rules: QueryRules,
//     parent?: undefined | number | string,
// ): Record<string,
//     | None
//     | boolean
//     | number
//     | string
//     | Array<
//         | None
//         | boolean
//         | number
//         | string,
//     >
// > {
//     if (isNone(rules)) {
//         return parent
//             ? [String(parent)]
//             : []
//     }
//
//     if (isString(rules) || isNumber(rules)) {
//         return parent
//             ? [`${parent}.${rules}`]
//             : [String(rules)]
//     }
//
//     if (isObject(rules)) {
//         const flatRules: Array<string> = []
//         for (const child in rules) {
//             const otherParent = flattenQueryRules(child, parent)[0]
//             const otherFlatQuery = flattenQueryRules(rules[child], otherParent)
//             flatRules.push(...otherFlatQuery)
//         }
//         return flatRules
//     }
//
//     if (isArray(rules)) {
//         const flatRules: Array<string> = []
//         for (const kid of rules) {
//             const otherFlatQuery = flattenQueryRules(kid, parent)
//             flatRules.push(...otherFlatQuery)
//         }
//         return flatRules
//     }
//
//     return throwInvalidArgument(
//         '@eviljs/web/query.flattenQueryRules(~~rules~~, parent):\n'
//         + `rules must be a String | Number | object | array, given "${rules}".`
//     )
// }

// Types ///////////////////////////////////////////////////////////////////////

export interface Query extends FetchAttributes {
    request<T = unknown>(method: HttpMethod, path: string, options?: undefined | QueryRequestOptions): Promise<T>
    get<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
    post<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
    put<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
    patch<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
    delete<T = unknown>(path: string, options?: undefined | QueryRequestOptions): Promise<T>
}

export interface QueryRequestOptions extends FetchRequestOptions {
    params?: undefined | QueryParams
}

export type QueryRequestMethod = HttpMethod

export type QueryError<E = unknown> = [number, E]

export type QueryParams =
    | string
    | QueryParamsDict
    | QueryParamsList

export interface QueryParamsDict extends Record<QueryParamsDictKey, QueryParamsDictValue> {}

export type QueryParamsDictKey = number | string
export type QueryParamsDictValue =
    | undefined
    | null
    | boolean
    | number
    | string
    | QueryParamsDict
    | QueryParamsList

export interface QueryParamsList extends Array<QueryParamsDictValue> {}

export type QueryRules = QueryParams

export interface QueryEncodeParamsOptions {
    encodeKey?: undefined | ((name: unknown) => string)
    encodeValue?: undefined | ((value: unknown) => string)
    joinParam?: undefined | ((name: string, value: string) => string)
    joinParts?: undefined | ((parts: Array<string>) => string)
}
