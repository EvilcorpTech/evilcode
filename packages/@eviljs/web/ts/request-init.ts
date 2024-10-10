import {mapSome} from '@eviljs/std/fn-monad'
import type {Io} from '@eviljs/std/fn-type'
import {cloneRequest} from './request-clone.js'
import {mergeRequest, mergeRequestHeaders} from './request-merge.js'
import type {RequestMethodEnum} from './request-method.js'

export function asFormData(data: Record<string, string | Blob | File>): FormData {
    const formData = new FormData()

    for (const key in data) {
        const value = data[key]
        mapSome(value, value => formData.append(key, value))
    }

    return formData
}

// Request Method //////////////////////////////////////////////////////////////

/**
* @throws TypeError
**/
export function usingRequestMethod(method: undefined | RequestMethodEnum): Io<Request, Request> {
    return (request: Request) => useRequestMethod(request, method)
}

/**
* @throws TypeError
**/
export function useRequestMethod(request: Request, method: undefined | RequestMethodEnum): Request {
    return mergeRequest(request, {method})
}

// Request Headers /////////////////////////////////////////////////////////////

/**
* @throws InvalidArgument
**/
export function usingRequestHeaders(...headersList: Array<HeadersInit>): Io<Request, Request> {
    return (request: Request) => useRequestHeaders(request, ...headersList)
}

/**
* @throws InvalidArgument
**/
export function useRequestHeaders(request: Request, ...headersList: Array<HeadersInit>): Request {
    return cloneRequest(request, {
        headers: mergeRequestHeaders(request.headers, ...headersList),
    })
}

// Request Body ////////////////////////////////////////////////////////////////

/**
* @throws TypeError
**/
export function usingRequestBody(body: undefined | BodyInit): Io<Request, Request> {
    return (request: Request) => useRequestBody(request, body)
}

/**
* @throws TypeError
**/
export function useRequestBody(request: Request, body: undefined | BodyInit): Request {
    return cloneRequest(request, {body})
}

// Request Cache ///////////////////////////////////////////////////////////////

/**
* @throws
**/
export function usingRequestCache(cache: undefined | RequestCache): Io<Request, Request> {
    return (request: Request) => useRequestCache(request, cache)
}

/**
* @throws
**/
export function useRequestCache(request: Request, cache: undefined | RequestCache): Request {
    return cloneRequest(request, {cache})
}

// Request Signal //////////////////////////////////////////////////////////////

/**
* @throws
**/
export function usingRequestSignal(signal: undefined | AbortSignal): Io<Request, Request> {
    return (request: Request) => useRequestSignal(request, signal)
}

/**
* @throws
**/
export function useRequestSignal(request: Request, signal: undefined | AbortSignal): Request {
    return cloneRequest(request, {signal})
}

// Request Priority ////////////////////////////////////////////////////////////

/**
* @throws
**/
export function usingRequestPriority(priority: undefined | RequestPriority): Io<Request, Request> {
    return (request: Request) => useRequestPriority(request, priority)
}

/**
* @throws
**/
export function useRequestPriority(request: Request, priority: undefined | RequestPriority): Request {
    return cloneRequest(request, {priority})
}
