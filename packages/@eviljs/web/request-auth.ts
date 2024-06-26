import type {Io} from '@eviljs/std/fn-type.js'
import type {StringAutocompleted} from '@eviljs/std/type.js'
import {useRequestHeaders} from './request-init.js'

/**
* @throws
**/
export function usingRequestAuthorization(type: RequestAuthorizationType, value: string): Io<Request, Request> {
    return (request: Request) => useRequestAuthorization(request, type, value)
}
/**
* @throws
**/
export function useRequestAuthorization(request: Request, type: RequestAuthorizationType, value: string): Request {
    return useRequestHeaders(request, asRequestAuthorizationHeaders(type, value))
}

export function asRequestAuthorizationHeaders(type: RequestAuthorizationType, value: string) {
    return {
        Authorization: `${type} ${value}`,
    } satisfies HeadersInit
}

// Types ///////////////////////////////////////////////////////////////////////

export type RequestAuthorizationType = 'Basic' | 'Bearer' | StringAutocompleted
