import type {Io} from '@eviljs/std/fn.js'
import {JsonType} from './mimetype.js'
import {mergeRequest, mergeRequestHeaders} from './request-merge.js'

export {decodeResponseJson} from './response.js'

/**
* @throws TypeError | InvalidArgument
**/
export function usingRequestJson(body: unknown, headers?: undefined | HeadersInit): Io<Request, Request> {
    return (request: Request) => useRequestJson(request, body, headers)
}

/**
* @throws TypeError | InvalidArgument
**/
export function useRequestJson(request: Request, body: unknown, otherHeaders?: undefined | HeadersInit): Request {
    return mergeRequest(request, asRequestOptionsJson(body, otherHeaders))
}

export function asRequestOptionsJson(body: unknown, otherHeaders?: undefined | HeadersInit): RequestInit {
    const jsonHeaders: HeadersInit = {
        'Content-Type': JsonType,
    }

    return {
        headers: otherHeaders
            ? mergeRequestHeaders(jsonHeaders, otherHeaders)
            : jsonHeaders
        ,
        ...body
            ? {body: JSON.stringify(body)}
            : undefined
        ,
    }
}
