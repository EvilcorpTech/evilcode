import {piping, type Io} from '@eviljs/std/pipe.js'
import {throwInvalidArgument} from '@eviljs/std/throw.js'
import {isArray, isNone, isObject, type ValueOf} from '@eviljs/std/type.js'
import {FormDataType, FormUrlType, JsonType, TextType} from './mimetype.js'
import {isUrlAbsolute, joinUrlPath} from './url.js'

export const RequestMethod = {
    Delete: 'delete' as const,
    Get: 'get' as const,
    Patch: 'patch' as const,
    Post: 'post' as const,
    Put: 'put' as const,
}

export const ContentType = {
    FormData: FormDataType,
    FormUrl: FormUrlType,
    Json: JsonType,
    Text: TextType,
}

export function creatingRequest(method: RequestMethod | (string & {}), pathOrUrl: string, options?: undefined | RequestOptions) {
    return piping(createRequest(method, pathOrUrl, options))
}

export function createRequest(method: RequestMethod | (string & {}), pathOrUrl: string, options?: undefined | RequestOptions): Request {
    const {baseUrl, ...requestOptions} = options ?? {}
    const url = joinRequestBasePath(baseUrl, pathOrUrl)
    const request = new Request(url, {...requestOptions, method})

    return request
}

// Request Options /////////////////////////////////////////////////////////////

/**
* @throws TypeError
**/
export function usingRequestOptions(options: RequestInit): Io<Request, Request> {
    return pipingRequest(request => useRequestOptions(request, options))
}

/**
* @throws TypeError
**/
export function useRequestOptions(request: Request, options: RequestInit): Request {
    return mergeRequest(request, options)
}

// Request Utilities ///////////////////////////////////////////////////////////

export function pipingRequest<R>(next: (request: Request) => R): Io<Request, R> {
    return next
}

/**
* @throws TypeError
**/
export function mergeRequest(request: Request, options: RequestInit): Request {
    const {headers, ...otherOptions} = options

    return cloneRequest(request, {
        ...otherOptions,
        ...headers
            ? {headers: mergeRequestHeaders(request.headers, headers)} satisfies RequestInit
            : undefined
        ,
    })
}

/**
* @throws TypeError
**/
export function cloneRequest(request: Request, options: RequestInit): Request {
    return new Request(request, options)
}

export function asRequestPath(pathOrUrl: string, baseUrl?: undefined | string): string {
    return joinRequestBasePath(baseUrl, pathOrUrl)
}

export function joinRequestBasePath(baseUrl: undefined | string, path: string): string {
    if (! baseUrl) {
        return path
    }
    if (isUrlAbsolute(path)) {
        return path
    }
    return joinUrlPath(baseUrl, path)
}

/**
* @throws InvalidArgument
**/
export function mergeRequestHeaders(...headersList: Array<HeadersInit>) {
    const headersMap: Record<string, string> = {}

    for (const headers of headersList) {
        if (headers instanceof Headers) {
            for (const it of headers.entries()) {
                const [key, value] = it
                headersMap[key] = value
            }
        }
        else if (isArray(headers)) {
            for (const it of headers) {
                const [key, value] = it
                headersMap[key] = value
            }
        }
        else if (isObject(headers)) {
            Object.assign(headersMap, headers)
        }
        else if (isNone(headers)) {
        }
        else {
            return throwInvalidArgument(
                '@eviljs/web/request.mergeRequestHeaders(...list: Array<headers>):\n'
                + `headers must be undefined | null | Object | Array | Headers, given "${headers}".`
            )
        }
    }

    return headersMap satisfies HeadersInit
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RequestOptions extends RequestInit {
    baseUrl?: undefined | string
}

export type RequestMethod =
    | (Lowercase<ValueOf<typeof RequestMethod>> & string)
    | (Uppercase<ValueOf<typeof RequestMethod>> & string)
