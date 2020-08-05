import {isArray, isNumber, isObject, isString, kindOf} from './type'
import {throwInvalidArgument} from './error'

export const QueryRulesHeader = 'X-Query'

/*
* Flatten a (recursive) rules structure to a flat list of rules.
*
* EXAMPLE
* const root = 'account'
* flattenRules(root, {user: ['name', 'email']})
* // ['account.user.name', 'account.user.email']
*/
export function flattenRules(parent: string | number | null | undefined, rules: QueryRules | null | undefined) {
    if (! rules) {
        return parent
            ? [String(parent)]
            : []
    }

    if (isString(rules) || isNumber(rules)) {
        return parent
            ? [`${parent}.${rules}`]
            : [String(rules)]
    }

    if (isObject(rules)) {
        const flatRules: Array<string> = []
        for (const child in rules) {
            const otherParent = flattenRules(parent, child)[0]
            const otherFlatQuery = flattenRules(otherParent, rules[child])
            flatRules.push(...otherFlatQuery)
        }
        return flatRules
    }

    if (isArray(rules)) {
        const flatRules: Array<string> = []
        for (const kid of rules) {
            const otherFlatQuery = flattenRules(parent, kid)
            flatRules.push(...otherFlatQuery)
        }
        return flatRules
    }

    return throwInvalidArgument(
        '@eviljs/std-lib/query.flattenRules(parent, ~~rules~~):\n'
        + `rules must be a String | Number | object | array, given "${rules}".`
    )
}

export function encodeParams(params?: QueryParams, options?: EncodeParamsOptions): string {
    if (! params) {
        return ''
    }
    if (isString(params)) {
        // A plain string is an escape hatch and must be considered already encoded.
        // We must not encodeURIComponent() it.
        return params
    }
    if (isObject(params)) {
        return encodeParamsObject(params, options)
    }
    if (isArray(params)) {
        return encodeParamsArray(params, options)
    }

    return throwInvalidArgument(
        '@eviljs/std-lib/query.encodeParams(~~params~~):\n'
        + 'params is of an invalid type.\n'
        + `Must be a <string | object | array>, given "${params}".`
    )
}

export function encodeParamsObject(params: QueryParamsDict, options?: EncodeParamsOptions) {
    const encodeName = options?.encodeName ?? defaultEncodeParamName
    const encodeValue = options?.encodeValue ?? defaultEncodeParamValue
    const joinParts = options?.joinParts ?? defaultJoinParamsParts

    const paramsParts = Object.keys(params).map(name => {
        const value = params[name]
        const encodedName = encodeName(name)
        const type = kindOf(value, 'undefined', 'null')

        switch (type) {
            case 'undefined':
                return ''
            break

            case 'null':
                return encodedName
            break

            default:
                return `${encodedName}=${encodeValue(value)}`
            break
        }
    })
    const encodedParams = joinParts(paramsParts)

    return encodedParams
}

export function encodeParamsArray(params: QueryParamsList, options?: EncodeParamsOptions) {
    const encodeName = options?.encodeName ?? defaultEncodeParamName
    const joinParts = options?.joinParts ?? defaultJoinParamsParts

    const paramsParts = params.map(name => {
        const type = kindOf(name, 'undefined', 'null', 'array', 'object')

        switch (type) {
            case 'undefined':
            case 'null':
                return ''
            break

            case 'array':
            case 'object':
                return encodeParams(name as QueryParamsList | QueryParamsDict, options)
            break

            default:
                return encodeName(name)
            break
        }
    })
    const encodedParams = joinParts(paramsParts)

    return encodedParams
}

export function defaultEncodeParamName(name: unknown) {
    const type = kindOf(name, 'string', 'number')

    switch (type) {
        case 'string':
            return encodeURIComponent(name as string)
        break

        case 'number':
            return String(name)
        break

        default:
            return throwInvalidArgument(
                '@eviljs/std-lib/query.defaultEncodeParamName(~~name~~):\n'
                + `name is of an invalid type.\n`
                + `Must be <number | string>, given "${name}".`
            )
        break
    }
}

export function defaultEncodeParamValue(value: unknown) {
    const type = kindOf(value, 'string', 'number', 'boolean', 'array', 'object')

    switch (type) {
        case 'string':
            return encodeURIComponent(value as string)
        break

        case 'number':
        case 'boolean':
            return String(value)
        break

        case 'array':
        case 'object':
            return encodeURIComponent(JSON.stringify(value))
        break

        default:
            return throwInvalidArgument(
                '@eviljs/std-lib/query.defaultEncodeParamValue(~~value~~):\n'
                + `value is of an invalid type.\n`
                + `Must be <string | number | boolean | array | object>, given "${value}".`
            )
        break
    }
}

export function defaultJoinParamsParts(parts: Array<string>) {
    // Without the empty strings.
    return parts.filter(Boolean).join('&')
}

// Types ///////////////////////////////////////////////////////////////////////

export interface QueryParamsDict extends Record<string | number, QueryRules> {
}
export interface QueryParamsList extends Array<number | string | QueryParams> {
}

export type QueryParams =
    | string
    | QueryParamsDict
    | QueryParamsList

export type QueryRules =
    | undefined
    | null
    | boolean
    | number
    | string
    | QueryParams

export interface EncodeParamsOptions {
    encodeName?(name: unknown): string
    encodeValue?(value: unknown): string
    joinParts?(parts: Array<string>): string
}
