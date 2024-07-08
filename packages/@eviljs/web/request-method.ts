import {piping, type PipeContinuation} from '@eviljs/std/fn-pipe.js'
import type {ObjectPartial, StringAutocompleted, ValueOf} from '@eviljs/std/type.js'
import {joinRequestBasePath} from './request-merge.js'

export const RequestMethod = {
    Delete: 'DELETE' as const,
    Get: 'GET' as const,
    Patch: 'PATCH' as const, // Patch must be uppercase, otherwise fetch() fails.
    Post: 'POST' as const,
    Put: 'PUT' as const,
}

export function creatingRequest(
    method: RequestMethodEnum,
    pathOrUrl: string,
    options?: undefined | RequestOptions,
): PipeContinuation<Request> {
    return piping(createRequest(method, pathOrUrl, options))
}
export function createRequest(
    method: RequestMethodEnum,
    pathOrUrl: string,
    options?: undefined | RequestOptions,
): Request {
    const {baseUrl, ...requestOptions} = options ?? {}
    const url = joinRequestBasePath(baseUrl, pathOrUrl)
    const request = new Request(url, {...requestOptions as RequestInit, method})

    return request
}

export function creatingRequestDelete(pathOrUrl: string, options?: undefined | RequestOptions): PipeContinuation<Request> {
    return piping(createRequestDelete(pathOrUrl, options))
}
export function createRequestDelete(pathOrUrl: string, options?: undefined | RequestOptions): Request {
    return createRequest(RequestMethod.Delete, pathOrUrl, options)
}

export function creatingRequestGet(pathOrUrl: string, options?: undefined | RequestOptions): PipeContinuation<Request> {
    return piping(createRequestGet(pathOrUrl, options))
}
export function createRequestGet(pathOrUrl: string, options?: undefined | RequestOptions): Request {
    return createRequest(RequestMethod.Get, pathOrUrl, options)
}

export function creatingRequestPatch(pathOrUrl: string, options?: undefined | RequestOptions): PipeContinuation<Request> {
    return piping(createRequestPatch(pathOrUrl, options))
}
export function createRequestPatch(pathOrUrl: string, options?: undefined | RequestOptions): Request {
    return createRequest(RequestMethod.Patch, pathOrUrl, options)
}

export function creatingRequestPost(pathOrUrl: string, options?: undefined | RequestOptions): PipeContinuation<Request> {
    return piping(createRequestPost(pathOrUrl, options))
}
export function createRequestPost(pathOrUrl: string, options?: undefined | RequestOptions): Request {
    return createRequest(RequestMethod.Post, pathOrUrl, options)
}

export function creatingRequestPut(pathOrUrl: string, options?: undefined | RequestOptions): PipeContinuation<Request> {
    return piping(createRequestPut(pathOrUrl, options))
}
export function createRequestPut(pathOrUrl: string, options?: undefined | RequestOptions): Request {
    return createRequest(RequestMethod.Put, pathOrUrl, options)
}

// Types ///////////////////////////////////////////////////////////////////////

export interface RequestOptions extends ObjectPartial<RequestInit> {
    baseUrl?: undefined | string
}

export type RequestMethodEnum = (ValueOf<typeof RequestMethod>) | StringAutocompleted
