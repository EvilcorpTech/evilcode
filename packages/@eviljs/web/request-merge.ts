import type {Io} from '@eviljs/std/fn.js'
import {throwInvalidArgument} from '@eviljs/std/throw.js'
import {isArray, isNone, isObject, type ObjectPartial} from '@eviljs/std/type.js'
import {cloneRequest} from './request-clone.js'
import {isUrlAbsolute, joinUrlPaths} from './url.js'

/**
* @throws TypeError
**/
export function usingRequestOptions(options: ObjectPartial<RequestInit>): Io<Request, Request> {
    return (request: Request) => useRequestOptions(request, options)
}

/**
* @throws TypeError
**/
export function useRequestOptions(request: Request, options: ObjectPartial<RequestInit>): Request {
    return mergeRequest(request, options)
}

/**
* @throws TypeError
**/
export function mergeRequest(request: Request, options: ObjectPartial<RequestInit>): Request {
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
                '@eviljs/web/request-merge.mergeRequestHeaders(...list: Array<headers>):\n'
                + `headers must be undefined | null | Object | Array | Headers, given "${headers}".`
            )
        }
    }

    return headersMap satisfies HeadersInit
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
    return joinUrlPaths(baseUrl, path)
}
