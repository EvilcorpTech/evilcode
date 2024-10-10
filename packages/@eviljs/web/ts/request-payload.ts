import type {Io} from '@eviljs/std/fn-type'
import {isDefined, isString} from '@eviljs/std/type-is'
import {useRequestBody} from './request-init.js'
import {useRequestJson} from './request-json.js'

/**
* @throws
**/
export function usingRequestPayload(body: undefined | BodyInit | unknown): Io<Request, Request> {
    return (request: Request) => useRequestPayload(request, body)
}

/**
* @throws
**/
export function useRequestPayload(request: Request, body: undefined | BodyInit | unknown): Request {
    if (! isDefined(body)) {
        return request
    }
    if (isString(body)) {
        // Serialization is already handled.
        return useRequestBody(request, body)
    }
    if (body instanceof ArrayBuffer) {
        return useRequestBody(request, body)
    }
    if (body instanceof Blob) {
        return useRequestBody(request, body)
    }
    if (body instanceof FormData) {
        return useRequestBody(request, body)
    }
    if (body instanceof ReadableStream) {
        return useRequestBody(request, body)
    }
    if (body instanceof URLSearchParams) {
        return useRequestBody(request, body)
    }
    // At this point body should be JSON serializable.
    return useRequestJson(request, body)
}
