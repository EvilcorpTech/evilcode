import type {Io} from '@eviljs/std/fn.js'
import {cloneRequest, mergeRequest, mergeRequestHeaders, pipingRequest, type RequestMethod} from './request.js'

// Request Method //////////////////////////////////////////////////////////////

/**
* @throws TypeError
**/
export function usingRequestMethod(method: RequestMethod | (string & {})): Io<Request, Request> {
    return pipingRequest(request => useRequestMethod(request, method))
}

/**
* @throws TypeError
**/
export function useRequestMethod(request: Request, method: RequestMethod | (string & {})): Request {
    return mergeRequest(request, {method})
}

// Request Headers /////////////////////////////////////////////////////////////

/**
* @throws InvalidArgument
**/
export function usingRequestHeaders(...headersList: Array<HeadersInit>): Io<Request, Request> {
    return pipingRequest(request => useRequestHeaders(request, ...headersList))
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
export function usingRequestBody(body: NonNullable<RequestInit['body']>): Io<Request, Request> {
    return pipingRequest(request => useRequestBody(request, body))
}

/**
* @throws TypeError
**/
export function useRequestBody(request: Request, body: NonNullable<RequestInit['body']>): Request {
    return cloneRequest(request, {body})
}

// Request Cache ///////////////////////////////////////////////////////////////

/**
* @throws
**/
export function usingRequestCache(cache: NonNullable<RequestInit['cache']>): Io<Request, Request> {
    return pipingRequest(request => useRequestCache(request, cache))
}

/**
* @throws
**/
export function useRequestCache(request: Request, cache: NonNullable<RequestInit['cache']>): Request {
    return cloneRequest(request, {cache})
}

// Request Signal //////////////////////////////////////////////////////////////

/**
* @throws
**/
export function usingRequestSignal(signal: NonNullable<RequestInit['signal']>): Io<Request, Request> {
    return pipingRequest(request => useRequestSignal(request, signal))
}

/**
* @throws
**/
export function useRequestSignal(request: Request, signal: NonNullable<RequestInit['signal']>): Request {
    return cloneRequest(request, {signal})
}

// Request Priority ////////////////////////////////////////////////////////////

/**
* @throws
**/
export function usingRequestPriority(priority: NonNullable<RequestInit['priority']>): Io<Request, Request> {
    return pipingRequest(request => useRequestPriority(request, priority))
}

/**
* @throws
**/
export function useRequestPriority(request: Request, priority: NonNullable<RequestInit['priority']>): Request {
    return cloneRequest(request, {priority})
}

// Types ///////////////////////////////////////////////////////////////////////

// FIXME: remove this when TypeScript lib.dom supports it.
declare global {
    interface RequestInit {
        priority?: undefined | 'auto' | 'low' | 'high'
    }
}
