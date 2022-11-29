import {throwInvalidArgument} from '@eviljs/std/throw.js'
import type {Nil} from '@eviljs/std/type.js'
import {isArray, isObject, isString, kindOf} from '@eviljs/std/type.js'
import {Fetch, FetchRequestOptions, formatResponse, HttpMethod, mergeFetchOptions} from './fetch.js'

export {throwInvalidResponse} from './throw.js'

export const QueryRulesHeader = 'X-Query'

export function createQuery(fetch: Fetch) {
    const self: Query = {
        baseUrl: fetch.baseUrl,

        /**
        * @throws
        */
        request(...args) {
            return query(fetch, ...args)
        },
        /**
        * @throws
        */
        get(...args) {
            return self.request(HttpMethod.Get, ...args)
        },
        /**
        * @throws
        */
        post(...args) {
            return self.request(HttpMethod.Post, ...args)
        },
        /**
        * @throws
        */
        put(...args) {
            return self.request(HttpMethod.Put, ...args)
        },
        /**
        * @throws
        */
        patch(...args) {
            return self.request(HttpMethod.Patch, ...args)
        },
        /**
        * @throws
        */
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

export async function query(fetch: Fetch, method: QueryRequestMethod, path: string, options?: undefined | QueryRequestOptions) {
    const requestArgs = [path, options] as const
    const requestArgsWithParams = setupQueryParams(...requestArgs)

    const response = await fetch.request(method, ...requestArgsWithParams)
    const content = await formatResponse(response)

    if (! response.ok) {
        throw [response.status, content] as QueryError
    }

    return content
}

export function setupQueryParams(path: string, options?: undefined | QueryRequestOptions) {
    const paramsString = encodeQueryParams(options?.params)

    if (! paramsString) {
        return [path, options] as const
    }

    const sep = path.includes('?')
        ? '&'
        : '?'
    const pathWithParams = path + sep + paramsString

    return [pathWithParams, options] as const
}

export function encodeQueryParams(params: Nil | QueryParams, options?: undefined | QueryEncodeParamsOptions): string {
    if (! params) {
        return ''
    }
    if (isString(params)) {
        // A plain string is an escape hatch and must be considered already encoded.
        // We must not encodeURIComponent() it.
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
        + `Must be a <string | object | array>, given "${params}".`
    )
}

export function encodeQueryParamsObject(params: QueryParamsDict, options?: undefined | QueryEncodeParamsOptions) {
    const encodeName = options?.encodeName ?? encodeQueryParamName
    const encodeValue = options?.encodeValue ?? encodeQueryParamValue
    const joinParam = options?.joinParam ?? joinQueryParam
    const joinParts = options?.joinParts ?? joinQueryParamsParts

    const paramsParts = Object.keys(params).map(name => {
        const value = params[name]
        const encodedName = encodeName(name)
        const type = kindOf(value, 'undefined', 'null')

        switch (type) {
            case 'undefined':
                return ''
            case 'null':
                return encodedName
            default:
                return joinParam(encodedName, encodeValue(value))
        }
    })
    const encodedParams = joinParts(paramsParts)

    return encodedParams
}

export function encodeQueryParamsArray(params: QueryParamsList, options?: undefined | QueryEncodeParamsOptions) {
    const encodeName = options?.encodeName ?? encodeQueryParamName
    const joinParts = options?.joinParts ?? joinQueryParamsParts

    const paramsParts = params.map(name => {
        const type = kindOf(name, 'undefined', 'null', 'array', 'object')

        switch (type) {
            case 'undefined':
            case 'null':
                return ''
            case 'array':
            case 'object':
                return encodeQueryParams(name as QueryParamsList | QueryParamsDict, options)
            default:
                return encodeName(name)
        }
    })
    const encodedParams = joinParts(paramsParts)

    return encodedParams
}

export function encodeQueryParamName(name: unknown) {
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

export function encodeQueryParamValue(value: unknown) {
    const type = kindOf(value, 'string', 'number', 'boolean', 'array', 'object')

    switch (type) {
        case 'string':
            return encodeURIComponent(value as string)
        case 'number':
        case 'boolean':
            return String(value)
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

export function withQueryOptions(rules: QueryRules): QueryRequestOptions {
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
// export function flattenQueryRules(
//     rules: QueryRules,
//     parent?: undefined | number | string,
// ): Record<string,
//     | Nil
//     | boolean
//     | number
//     | string
//     | Array<
//         | Nil
//         | boolean
//         | number
//         | string,
//     >
// > {
//     if (isNil(rules)) {
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

export interface Query extends Fetch {
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

export interface QueryParamsDict extends
    Record<string | number,
        | Nil
        | boolean
        | number
        | string
        | QueryParamsDict
        | QueryParamsList
    >
{}

export interface QueryParamsList extends
    Array<
        | Nil
        | boolean
        | number
        | string
        | QueryParamsDict
        | QueryParamsList
    >
{}

export type QueryRules = QueryParams

export interface QueryEncodeParamsOptions {
    encodeName?: undefined | ((name: unknown) => string)
    encodeValue?: undefined | ((value: unknown) => string)
    joinParam?: undefined | ((name: string, value: string) => string)
    joinParts?: undefined | ((parts: Array<string>) => string)
}
