import type {Fn, Io} from '@eviljs/std/fn.js'
import {throwInvalidArgument} from '@eviljs/std/throw.js'
import {isArray, isObject, isSome, isString, kindOf} from '@eviljs/std/type.js'

export function joinUrlWithParams(url: string, params: UrlParams, options?: undefined | UrlParamsEncodeOptions): string {
    const paramsUrl = encodeUrlParams(params, options)
    const urlWithParams = joinUrlWithParamsString(url, paramsUrl)
    return urlWithParams
}

export function joinUrlWithParamsString(url: string, params: undefined | string): string {
    if (! params) {
        return url
    }

    const separator = url.includes('?')
        ? '&'
        : '?'

    return url + separator + params
}

export function joinUrlParams(...paramsList: Array<string>): string {
    return joinUrlParamsList(paramsList)
}

export function joinUrlParamsList(paramsList: Array<string>): string {
    // Without the empty strings.
    return paramsList.filter(Boolean).join('&')
}

/**
* @throws InvalidArgument
**/
export function encodeUrlParams(params: undefined | UrlParams, options?: undefined | UrlParamsEncodeOptions): string {
    if (! params) {
        return ''
    }
    if (isString(params)) {
        // A plain string is an escape hatch and must be considered already encoded.
        // We must not use encodeURIComponent() on it.
        return params
    }
    if (isObject(params)) {
        return encodeUrlParamsObject(params, options)
    }
    if (isArray(params)) {
        return encodeUrlParamsArray(params, options)
    }

    return throwInvalidArgument(
        '@eviljs/web/url-params.encodeUrlParams(~~params~~):\n'
        + 'params is of an invalid type.\n'
        + `Must be a <undefined | null | string | object | array>, given "${params}".`
    )
}

/**
* @throws InvalidArgument
**/
export function encodeUrlParamsObject(params: UrlParamsDict, options?: undefined | UrlParamsEncodeOptions): string {
    const encodeKey = options?.encodeKey ?? encodeUrlParamKey
    const encodeValue = options?.encodeValue ?? encodeUrlParamValue
    const joinParam = options?.joinParam ?? joinUrlParam
    const joinParts = options?.joinParts ?? joinUrlParamsList

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
export function encodeUrlParamsArray(params: UrlParamsList, options?: undefined | UrlParamsEncodeOptions): string {
    const encodeKey = options?.encodeKey ?? encodeUrlParamKey
    const joinParts = options?.joinParts ?? joinUrlParamsList

    const paramsParts = params.map(param => {
        const paramType = kindOf(param, 'undefined', 'null', 'boolean', 'array', 'object')

        switch (paramType) {
            case 'undefined':
            case 'null':
            case 'boolean':
                return
            case 'array':
            case 'object':
                return encodeUrlParams(param as UrlParamsList | UrlParamsDict, options)
            default: // string or number.
                return encodeKey(param)
        }
    }).filter(isSome)

    const encodedParams = joinParts(paramsParts)

    return encodedParams
}

/**
* @throws InvalidArgument
**/
export function encodeUrlParamKey(name: unknown): string {
    const type = kindOf(name, 'string', 'number')

    switch (type) {
        case 'string':
            return encodeURIComponent(name as string)
        case 'number':
            return String(name)
        default:
            return throwInvalidArgument(
                '@eviljs/web/url-params.defaultEncodeParamName(~~name~~):\n'
                + `name is of an invalid type.\n`
                + `Must be <number | string>, given "${name}".`
            )
    }
}

/**
* @throws InvalidArgument
**/
export function encodeUrlParamValue(value: unknown): string {
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
        default: // undefined.
            return throwInvalidArgument(
                '@eviljs/web/url-params.defaultEncodeParamValue(~~value~~):\n'
                + `value is of an invalid type.\n`
                + `Must be <null | boolean | number | string | array | object>, given "${value}".`
            )
    }
}

export function joinUrlParam(name: string, value: string): string {
    return `${name}=${value}`
}

// Types ///////////////////////////////////////////////////////////////////////

export type UrlParams =
    | undefined // Accepted but ignored.
    | null // Accepted but ignored.
    | string
    | UrlParamsList
    | UrlParamsDict

export type UrlParamsList = Array<UrlParamsListValue>
export type UrlParamsDict = {[key: UrlParamsDictKey]: UrlParamsDictValue}

export type UrlParamsListValue =
    | undefined // Accepted but ignored.
    | null // Accepted but ignored.
    | boolean // Accepted but ignored.
    | number
    | string
    | UrlParamsDict
    | UrlParamsList

export type UrlParamsDictKey = number | string
export type UrlParamsDictValue =
    | undefined
    | null
    | boolean
    | number
    | string
    | UrlParamsDict
    | UrlParamsList

export interface UrlParamsEncodeOptions {
    encodeKey?: undefined | Io<unknown, string>
    encodeValue?: undefined | Io<unknown, string>
    joinParam?: undefined | Fn<[name: string, value: string], string>
    joinParts?: undefined | Io<Array<string>, string>
}
